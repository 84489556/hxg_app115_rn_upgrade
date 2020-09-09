/*
 * gRPC客户端
 */

package com.ydyun.ydsdk;



import android.text.TextUtils;
import android.util.Log;

import com.alibaba.fastjson.JSONObject;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;

import java.io.InputStream;
import java.io.InterruptedIOException;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManagerFactory;

import io.grpc.ConnectivityState;
import io.grpc.Context;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.okhttp.OkHttpChannelBuilder;
import io.grpc.stub.StreamObserver;
import yuanda.DataDefine;
import yuanda.DataDefine.FullSortResponse;
import yuanda.DataDefine.MiniQuote;
import yuanda.DataDefine.MultiMiniQuote;
import yuanda.DataDefine.PriceVolume;
import yuanda.DataDefine.Ticks;
import yuanda.FundGlueServiceGrpc;
import yuanda.GlueDataDefine.GluedK;
import yuanda.GlueDataDefine.GluedMinChart;
import yuanda.GlueDataDefine.GluedQuote;
import yuanda.GlueDataDefine.GluedSortRequest;
import yuanda.QuoteServiceOuterClass.CandleStickRequest;
import yuanda.QuoteServiceOuterClass.HisMinRequest;
import yuanda.QuoteServiceOuterClass.MinRequest;
import yuanda.QuoteServiceOuterClass.PriVolRequest;
import yuanda.QuoteServiceOuterClass.QuoteRequest;
import yuanda.QuoteServiceOuterClass.TickRequest;

import static io.grpc.ConnectivityState.READY;
import static java.util.concurrent.TimeUnit.HOURS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static yuanda.TitleDefine.TitleId.forNumber;

//import yuanda.GlueDataDefine.CandleStickRequest;
//import yuanda.GlueDataDefine.FullSortRequest;
//import yuanda.GlueDataDefine.HisMinRequest;
//import yuanda.GlueDataDefine.MinRequest;
//import yuanda.GlueDataDefine.PriVolRequest;
//import yuanda.GlueDataDefine.QuoteRequest;
//import yuanda.GlueDataDefine.TickRequest;
//import yuanda.QuoteServiceGrpc;
//import yuanda.QuoteServiceOuterClass.SortRequest;

public class YdYunClient {

//    private Object _obj = new Object();
    private final ArrayList<Integer> _ConstituentWaitCancel = new ArrayList<Integer>();



    private ReactApplicationContext context;
    public ReactApplicationContext getContext() {
        return context;
    }

//    private Context.CancellableContext mQuoteContext = null;
    private Context mQuoteContext = null;
//    private Context.CancellableContext mFullQuoteContext = null;
    private Context mFullQuoteContext = null;
    private HashMap<Integer, Context.CancellableContext> reqContexts = new HashMap<Integer, Context.CancellableContext>();
    private ManagedChannel channel = null;
    public ManagedChannel getChannel() {
        return channel;
    }
    private FundGlueServiceGrpc.FundGlueServiceStub fundStub;
    private SSLContext sslContext = null;

//    private io.grpc.stub.StreamObserver<QuoteRequest> mQuoteStreamObserver = null;
    private io.grpc.stub.StreamObserver<QuoteRequest> mQuoteStreamObserverTest = null;

    private io.grpc.stub.StreamObserver<QuoteRequest> mFullQuoteStreamObserver = null;

    public StreamObserver<QuoteRequest> getmFullQuoteStreamObserver() {
        return mFullQuoteStreamObserver;
    }

//    private final static String DOMAIN_NAME = "server.dev.yuanda.com";
    private final static String DOMAIN_NAME = "quoteserver.ydtg.com.cn";//改为根证书后替换
    private QuoteRequest request;
    private List<String> codesArray=new ArrayList();
    private String thisToken = "";

    public void init(ReactApplicationContext context, InputStream is, String host, int port, boolean isCrt, String token) {
        thisToken = token;
        this.context = context;
        if(codesArray!=null){
            codesArray.clear();
        }else{
            codesArray = new ArrayList();
        }
        try {
            if (isCrt) {

                this.channel = OkHttpChannelBuilder.forAddress(host, port)
                        .overrideAuthority(DOMAIN_NAME)
//                        .sslSocketFactory(this.getSSLSocket(is))
                        .sslSocketFactory(new YDSSLSocketFactory(is))
                        .intercept(new ClientInterruptImpl(token))
                        .enableRetry()
                        .maxRetryAttempts(5)

                        .keepAliveWithoutCalls(true)
                        .idleTimeout(24, HOURS)
                        .build();

            }
            else {

                this.channel = ManagedChannelBuilder.forAddress(host, port)
                        .overrideAuthority(DOMAIN_NAME)
                        .intercept(new ClientInterruptImpl(token))
//                        .enableRetry()
//                        .maxRetryAttempts(5)
                        .keepAliveTime(90, SECONDS)
                        .keepAliveTimeout(90, SECONDS)
                        .keepAliveWithoutCalls(true)
                        .build();

            }

            final long beginTime = System.currentTimeMillis();//开始时间
            final long overTime = 5 * 1000;//超时时间

            while (true) {
                ConnectivityState state = this.channel.getState(true);
                if (state == READY) {
                    break;
                }
                long nowTime = System.currentTimeMillis();
                if((nowTime - beginTime) > overTime) break;

            }

        fundStub = yuanda.FundGlueServiceGrpc.newStub(channel);

        } catch (InterruptedIOException e){
            resetConnect();
        }
        catch (Exception e) {
            resetConnect();
//            throw new RuntimeException(e);
            Log.d("channel Exception","error="+e.getMessage());
//            System.out.printf("Exception:%s", e.getMessage());
        }

    }

    public ConnectivityState getChannelState() {
        if(null!=this.channel) {
            ConnectivityState state = this.channel.getState(true);
            if(state != READY){
                channel.shutdown();
                channel = null;
                this.init(context, null,"usergateapp.ydtg.com.cn", 5055, false,thisToken);
                ConnectivityState state2 = this.channel.getState(true);
                return state2;
            }else {
                return state;
            }
        }else{
            return null;
        }
    }


    public void FetchConstituentStock(String req, Callback rnCallback) {
        //Log.e("20200629", "FetchConstituentStock: " );
        JSONObject reqJson = JSONObject.parseObject(req);
        final int qid = reqJson.getIntValue("qid");
        Log.d("ConstituentXXX fetch:",String.valueOf(qid));
        Log.d("FetchConstituentStock:",String.valueOf(qid));

        final String sReq = req;
        final Callback cbCallback = rnCallback;
        final ReactApplicationContext ctx = this.context;



        SingleQuoteManager.getInstance().getExecutorService().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    //解析参数
            JSONObject reqJson = JSONObject.parseObject(sReq);
            final int qid = reqJson.getIntValue("qid");
                    JSONObject pJson = reqJson.getJSONObject("params");
                    String blockid = pJson.getString("blockid");
                    int titleid = pJson.getIntValue("titleid");
                    int fundFlowTitleid = pJson.getIntValue("fundFlowTitle");
                    boolean desc =  pJson.getBoolean("desc");
                    int start = pJson.getIntValue("start");
                    int count = pJson.getIntValue("count");
                    boolean subscribe =  pJson.getBoolean("subscribe");

//                    Log.d("xxxxxxxx cancel1:",String.valueOf(qid));

                    BlockManager.getInstance().setContext(ctx);
                    BlockManager.getInstance().setCallback(blockid,cbCallback);
                    BlockManager.getInstance().setStartIndex(start);

//                    Log.d("xxxxxxxx start:",String.valueOf(start));

                    //创建请求
                    final GluedSortRequest request;

                    if(titleid>0){
                        request = GluedSortRequest.newBuilder()
                                .setBlockId(blockid)
                                .setTitleId(forNumber(titleid))
                                .setDesc(desc)
                                .setStart(start)
                                .setCount(count)
                                .setSubscribe(subscribe)
                                .build();
                    }else{
                        request = GluedSortRequest.newBuilder()
                                .setBlockId(blockid)
                                .setFundFlowTitleValue(fundFlowTitleid)
                                .setDesc(desc)
                                .setStart(start)
                                .setCount(count)
                                .setSubscribe(subscribe)
                                .build();
                    }

                    //Log.e("TAG", "资金流向统计每次创建对象前" );
                    //建一个应答者，接受返回数据
                    final ConstituentStreamObserver<FullSortResponse> responseObserver = new ConstituentStreamObserver<FullSortResponse>(ctx,qid);


                    //发送请求
                    Runnable listenRunnable = new Runnable() {
                        @Override
                        public void run() {
                            fundStub.fetchBlockSort(request,responseObserver);
                        }
                    };


                    Context.CancellableContext mListenContext = null;

                    if (mListenContext != null && !mListenContext.isCancelled()) {
//            Log.d(TAG, "listen: already listening");
                        return;
                    }

                    mListenContext = Context.current().withCancellation();
                    mListenContext.run(listenRunnable);

                    int index = _ConstituentWaitCancel.indexOf(qid);
                    if ( index != -1) {
                        mListenContext.cancel(null);
                        _ConstituentWaitCancel.remove(index);
                        Log.d("ConstituentXXX cancel:",String.valueOf(qid));
                    }
                    else {
                        reqContexts.put(new Integer(qid),mListenContext);
                    }
//                    synchronized (_obj) {
//                        reqContexts.put(new Integer(qid),mListenContext);

//                    }


                }
                catch (Exception e){
                    resetConnect();
                    Log.d("channel Exception","error="+e.getMessage());
                }
            }
        });


    }

    public void FetchQuoteTest(String subcribes, String unsubcribes) {
        Log.d("stock-http","--FetchQuoteTest--");
        if (subcribes.isEmpty() && unsubcribes.isEmpty())
            return;

        Map<String, String[]> res = ArrayUtils.CompareStringArray(unsubcribes, subcribes);

        String [] deleteArr = res.get("deleteArr");
        String [] addArr = res.get("addArr");
        final String unSub = ArrayUtils.toCodesStr(deleteArr);
        deleteCodes(deleteArr);

        String[] codesStr = new String[codesArray.size()];
        for (int i = 0; i <codesArray.size(); i++) {
            codesStr[i]=codesArray.get(i);
        }
        Map<String, String[]> res2 = ArrayUtils.CompareStringArray(codesStr, addArr);
        String [] newAddArr =res2.get("addArr");
        addCodes(newAddArr);
        final String sub = ArrayUtils.toCodesStr(newAddArr);

//        Log.w("stock-http","registerRequest----"+subcribes);
//        Log.w("stock-http","unregisterRequest----"+unsubcribes);
        if(TextUtils.isEmpty(sub)&&TextUtils.isEmpty(unSub)){
            return;
        }
        final ReactApplicationContext ctx = this.context;
        //import yuanda.DataDefine.MiniQuote;
        //import yuanda.DataDefine.MultiMiniQuote;

        SingleQuoteManager.getInstance().getExecutorService().execute(new Runnable() {
            @Override
            public void run() {
                try {

                    //创建请求
                    QuoteRequest.Builder qrBuilder = QuoteRequest.newBuilder();

                    if (!sub.isEmpty())  {
                        Iterator<String> iter = getCodeList(sub).iterator();
                        while(iter.hasNext()){
                            qrBuilder.addSubcribes(iter.next());
                        }
                    }

                    if (!unSub.isEmpty()) {
                        Iterator<String> iter = getCodeList(unSub).iterator();
                        while(iter.hasNext()){
                            qrBuilder.addUnsubcribes(iter.next());
                        }
                    }


                    QuoteRequest request = qrBuilder.build();


//                    Log.d("xxxxxxxx Quote Reg",sub);
//                    Log.d("xxxxxxxx Quote UnReg",unSub);
//
//                    Log.d("Fetch Quote Reg:",sub);
//                    Log.d("Fetch Quote UnReg:",unSub);


                    if (mQuoteStreamObserverTest == null) {

                        //建一个应答者，接受返回数据
                        final YDStreamObserver<MiniQuote> responseObserver = new QuoteStreamObserver<MiniQuote>(ctx);


                        //发送请求
                        Runnable listenRunnable = new Runnable() {
                            @Override
                            public void run() {
                                mQuoteStreamObserverTest = fundStub.fetchQuote(responseObserver);
                            }
                        };

                        if (mQuoteContext != null && !mQuoteContext.isCancelled()) {
//                          Log.d(TAG, "listen: already listening");
                        }
                        else {
//                          mQuoteContext = Context.current().withCancellation();
                            mQuoteContext = Context.current();
                            mQuoteContext.run(listenRunnable);

                        }

                    }

                    mQuoteStreamObserverTest.onNext(request);


                }
                catch (Exception e){
                    resetConnect();
                    Log.d("channel Exception","error="+e.getMessage());
                }

            }
        });


    }

    private void addCodes(String[] addArr) {
        if(null !=addArr && addArr.length>0) {
            for (int i = 0; i <addArr.length; i++) {
                  codesArray.add(addArr[i]);
            }
        }
    }

    private void deleteCodes(String[] deleteArr) {
        if(null !=deleteArr && deleteArr.length>0) {
            for (int i = 0; i <deleteArr.length; i++) {
                for (int j = 0; j <codesArray.size(); j++) {
                    if(deleteArr[i].equals(codesArray.get(j))) {
                        codesArray.remove(j);
                        break;
                    }
                }
            }
        }
    }

    public void FetchQuote(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            JSONObject paramsJson = reqJson.getJSONObject("params");
            String register = paramsJson.getString("subcribes");
            String unregister = paramsJson.getString("unsubcribes");
            this.FetchQuoteTest(register, unregister);
            SingleQuoteManager.getInstance().setGeneralRegister(register);

        }
        catch (Exception ex){
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void FetchFullQuoteTest(String subcribes, String unsubcribes) {

        if (subcribes.isEmpty() && unsubcribes.isEmpty())
            return;
//        Log.w("stock-http","registerRequest----"+subcribes);
//        Log.w("stock-http","unregisterRequest----"+unsubcribes);
        Map<String, String[]> res = ArrayUtils.CompareStringArray(unsubcribes, subcribes);

        String [] deleteArr = res.get("deleteArr");
        String [] addArr = res.get("addArr");

        final String unSub = ArrayUtils.toCodesStr(deleteArr);
        deleteCodes(deleteArr);

        String[] codesStr = new String[codesArray.size()];
        for (int i = 0; i <codesArray.size(); i++) {
            codesStr[i]=codesArray.get(i);
        }
        Map<String, String[]> res2 = ArrayUtils.CompareStringArray(codesStr, addArr);
        String [] newAddArr =res2.get("addArr");
        addCodes(newAddArr);
        final String sub = ArrayUtils.toCodesStr(newAddArr);

        Log.w("stock-http","addArr----" + sub);
        Log.w("stock-http","deleteArr----"+ unSub);

        if(TextUtils.isEmpty(sub)&&TextUtils.isEmpty(unSub)){
            return;
        }

        final ReactApplicationContext ctx = this.context;

        Log.e("TAG", "FetchFullQuoteTest: -=======" );
        SingleQuoteManager.getInstance().getExecutorService().execute(new Runnable() {
            @Override
            public void run() {
                try {

                    //创建请求
                    QuoteRequest.Builder qrBuilder = QuoteRequest.newBuilder();

                    if (!sub.isEmpty())  {
                        Iterator<String> iter = getCodeList(sub).iterator();
                        while(iter.hasNext()){
                            qrBuilder.addSubcribes(iter.next());
                        }
                    }

                    if (!unSub.isEmpty()) {
                        Iterator<String> iter = getCodeList(unSub).iterator();
                        while(iter.hasNext()){
                            qrBuilder.addUnsubcribes(iter.next());
                        }
                    }


                    QuoteRequest request = qrBuilder.build();


//                    Log.d("xxxxxxxx FQuote Reg",sub);
//                    Log.d("xxxxxxxx FQuote UnReg",unSub);
//
//                    Log.d("Fetch FQuote Reg:",sub);
//                    Log.d("Fetch FQuote UnReg:",unSub);


                    if (mFullQuoteStreamObserver == null) {
                        //建一个应答者，接受返回数据
                        Log.e("TAG", "run:行情数据创建应答者 " );
                        final YDStreamObserver<GluedQuote> responseObserver = new FullQuoteStreamObserver<GluedQuote>(ctx);


                        //发送请求
                        Runnable listenRunnable = new Runnable() {
                            @Override
                            public void run() {
                                mFullQuoteStreamObserver = fundStub.fetchFullQuote(responseObserver);
                            }
                        };

                        if (mFullQuoteContext != null && !mFullQuoteContext.isCancelled()) {
//                          Log.d(TAG, "listen: already listening");
                        }
                        else {
                            mFullQuoteContext = Context.current();
                            mFullQuoteContext.run(listenRunnable);

                        }

                    }
                    mFullQuoteStreamObserver.onNext(request);


                }
                catch (Exception ex){
                    resetConnect();
                    Log.w("Exception stock-http","e.getMessage="+ex.getMessage());
                }
            }
        });

    }

    public void FetchFullQuote(String req) {
//        Log.d("stock-http","--FetchFullQuote--");
//        Log.d("stock-http:","getChannel="+getChannel());
//        Log.d("stock-http:","getChannel="+getChannel().getState(true));
        try {
            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            JSONObject paramsJson = reqJson.getJSONObject("params");
            String register = paramsJson.getString("subcribes");
            String unregister = paramsJson.getString("unsubcribes");
//           if(!TextUtils.isEmpty(register)){
//               resetConnect();
//           }
            this.FetchFullQuoteTest(register, unregister);

        }
        catch (Exception ex){
            Log.w("stock-http","e.getMessage="+ex.getMessage());
//            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void FetchStaticQuote(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            final int qid = reqJson.getIntValue("qid");
            JSONObject pJson = reqJson.getJSONObject("params");
            String register = pJson.getString("subcribes");
            String unregister = pJson.getString("unsubcribes");
            String[] registerArr = register.split(",",-1);
            QuoteRequest.Builder  builder = QuoteRequest.newBuilder();

//            Log.d("FetchStaticQuote:",String.valueOf(qid));

            for (int i = 0;i<registerArr.length;i++){
                builder.addSubcribes(registerArr[i]);
                if(i == registerArr.length-1){
                    builder.addUnsubcribes(unregister);
                    //创建请求
                    request = builder.build();
                }
            }



            //建一个应答者，接受返回数据
            final YDStreamObserver<MultiMiniQuote> responseObserver = new YDStreamObserver<MultiMiniQuote>(this.context, qid);

            //发送请求
            if(request != null && responseObserver != null)fundStub.fetchStaticQuote(request,responseObserver);


        }
        catch (Exception ex){
            resetConnect();
            ex.printStackTrace();
        }

    }

    public void FetchCandleStick(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            final int qid = reqJson.getIntValue("qid");
            JSONObject pJson = reqJson.getJSONObject("params");
            String label = pJson.getString("label");
            int iPeriod = pJson.getIntValue("period");
            DataDefine.PeriodT period = DataDefine.PeriodT.values()[iPeriod];
            int iSplit =  pJson.getIntValue("split");
            DataDefine.SplitT split = DataDefine.SplitT.values()[iSplit];
            long start = pJson.getLong("start");
            int time =  pJson.getIntValue("time");
            long count = pJson.getLong("count");
            boolean subscribe =  pJson.getBoolean("subscribe");

//            Log.d("FetchCandleStick:",String.valueOf(qid)+label);

            //创建请求
            final CandleStickRequest request = CandleStickRequest.newBuilder()
                    .setLabel(label)
                    .setPeriod(period)
                    .setSplit(split)
                    .setStart(start)
                    .setTime(time)
                    .setCount(count)
                    .setSubscribe(subscribe)
                    .build();


            //建一个应答者，接受返回数据
            final YDStreamObserver<GluedK> responseObserver = new YDStreamObserver<GluedK>(this.context, qid);

            Runnable listenRunnable = new Runnable() {
                @Override
                public void run() {
                    fundStub.fetchCandleStick(request,responseObserver);
                }
            };

            Context.CancellableContext mListenContext = null;

            if (mListenContext != null && !mListenContext.isCancelled()) {
//            Log.d(TAG, "listen: already listening");
                return;
            }

            mListenContext = Context.current().withCancellation();
            mListenContext.run(listenRunnable);

            reqContexts.put(new Integer(qid),mListenContext);

        }
        catch (Exception ex){
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void FetchMinData(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            final int qid = reqJson.getIntValue("qid");
            JSONObject pJson = reqJson.getJSONObject("params");
            String label = pJson.getString("label");
            int days = pJson.getIntValue("days");
            boolean subscribe =  pJson.getBoolean("subscribe");

//            Log.d("FetchMinData:",String.valueOf(qid)+label);

            //创建请求
            final MinRequest request = MinRequest.newBuilder()
                    .setLabel(label)
                    .setDays(days)
                    .setSubscribe(subscribe)
                    .build();


            //建一个应答者，接受返回数据
            final YDStreamObserver<GluedMinChart> responseObserver = new YDStreamObserver<GluedMinChart>(this.context, qid);


            //发送请求
            Runnable listenRunnable = new Runnable() {
                @Override
                public void run() {
                    fundStub.fetchMinData(request,responseObserver);
                }
            };


            Context.CancellableContext mListenContext = null;

            if (mListenContext != null && !mListenContext.isCancelled()) {
//            Log.d(TAG, "listen: already listening");
                return;
            }

            mListenContext = Context.current().withCancellation();
            mListenContext.run(listenRunnable);

            reqContexts.put(new Integer(qid),mListenContext);


        }
        catch (Exception ex){
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void FetchHistoryMinData(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            final int qid = reqJson.getIntValue("qid");
            JSONObject pJson = reqJson.getJSONObject("params");
            String label = pJson.getString("label");
            int date = pJson.getIntValue("date");

//            Log.d("FetchHistoryMinData:",String.valueOf(qid)+label);

            //创建请求
            HisMinRequest request = HisMinRequest.newBuilder()
                    .setLabel(label)
                    .setDate(date)
                    .build();


            //建一个应答者，接受返回数据
            final YDStreamObserver<GluedMinChart> responseObserver = new YDStreamObserver<GluedMinChart>(this.context, qid);

            //发送请求
            fundStub.fetchHistoryMinData(request,responseObserver);


        }
        catch (Exception ex){
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void FetchTicks(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            final int qid = reqJson.getIntValue("qid");
            JSONObject pJson = reqJson.getJSONObject("params");
            String label = pJson.getString("label");
            int date = pJson.getIntValue("date");
            long start = pJson.getIntValue("start");
            int time = pJson.getIntValue("time");
            long count = pJson.getLong("count");
            boolean subscribe =  pJson.getBoolean("subscribe");

//            Log.d("FetchTicks:",String.valueOf(qid)+label);

            //创建请求
            final TickRequest request = TickRequest.newBuilder()
                    .setLabel(label)
                    .setDate(date)
                    .setStart(start)
                    .setTime(time)
                    .setCount(count)
                    .setSubscribe(subscribe)
                    .build();


            //建一个应答者，接受返回数据
            final YDStreamObserver<Ticks> responseObserver = new YDStreamObserver<Ticks>(this.context, qid);


            //发送请求
            Runnable listenRunnable = new Runnable() {
                @Override
                public void run() {
                    fundStub.fetchTicks(request,responseObserver);
                }
            };


            Context.CancellableContext mListenContext = null;

            if (mListenContext != null && !mListenContext.isCancelled()) {
//            Log.d(TAG, "listen: already listening");
                return;
            }

            mListenContext = Context.current().withCancellation();
            mListenContext.run(listenRunnable);

            reqContexts.put(new Integer(qid),mListenContext);


        }
        catch (Exception ex){
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void FetchBlockSort(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            final int qid = reqJson.getIntValue("qid");
            JSONObject pJson = reqJson.getJSONObject("params");
            String blockid = pJson.getString("blockid");
            int titleid = pJson.getIntValue("titleid");
            boolean desc =  pJson.getBoolean("desc");
            int start = pJson.getIntValue("start");
            int count = pJson.getIntValue("count");
            boolean subscribe =  pJson.getBoolean("subscribe");
            int fundFlowTitleid = pJson.getIntValue("fundFlowTitle");

//            Log.d("FetchBlockSort:",String.valueOf(qid)+blockid);

            //创建请求
            final GluedSortRequest request;
//                    .setBlockId(blockid)
//                    .setTitleId(forNumber(titleid))
//                    .setDesc(desc)
//                    .setStart(start)
//                    .setCount(count)
//                    .setSubscribe(subscribe)
//                    .build();

            if(titleid>0){
                request = GluedSortRequest.newBuilder()
                        .setBlockId(blockid)
                        .setTitleId(forNumber(titleid))
                        .setDesc(desc)
                        .setStart(start)
                        .setCount(count)
                        .setSubscribe(subscribe)
                        .build();
            }else{
                request = GluedSortRequest.newBuilder()
                        .setBlockId(blockid)
                        .setFundFlowTitleValue(fundFlowTitleid)
                        .setDesc(desc)
                        .setStart(start)
                        .setCount(count)
                        .setSubscribe(subscribe)
                        .build();
            }


            //建一个应答者，接受返回数据
            final YDSortStreamObserver<FullSortResponse> responseObserver = new YDSortStreamObserver<FullSortResponse>(this.context, qid);


            //发送请求
            Runnable listenRunnable = new Runnable() {
                @Override
                public void run() {
                    fundStub.fetchBlockSort(request,responseObserver);
                }
            };


            Context.CancellableContext mListenContext = null;

            if (mListenContext != null && !mListenContext.isCancelled()) {
//            Log.d(TAG, "listen: already listening");
                return;
            }

            mListenContext = Context.current().withCancellation();
            mListenContext.run(listenRunnable);

            reqContexts.put(new Integer(qid),mListenContext);

        }
        catch (Exception ex){
            resetConnect();
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void FetchPriVol(String req) {

        try {

            //解析参数
            JSONObject reqJson = JSONObject.parseObject(req);
            final int qid = reqJson.getIntValue("qid");
            JSONObject pJson = reqJson.getJSONObject("params");
            String label = pJson.getString("label");
            int date = pJson.getIntValue("date");
            boolean subscribe =  pJson.getBoolean("subscribe");

//            Log.d("FetchPriVol:",String.valueOf(qid)+label);

            //创建请求
            final PriVolRequest request = PriVolRequest.newBuilder()
                    .setLabel(label)
                    .setDate(date)
                    .setSubscribe(subscribe)
                    .build();


            //建一个应答者，接受返回数据
            final YDStreamObserver<PriceVolume> responseObserver = new YDStreamObserver<PriceVolume>(this.context, qid);


            //发送请求
            Runnable listenRunnable = new Runnable() {
                @Override
                public void run() {
                    fundStub.fetchPriVol(request,responseObserver);
                }
            };


            Context.CancellableContext mListenContext = null;

            if (mListenContext != null && !mListenContext.isCancelled()) {
//            Log.d(TAG, "listen: already listening");
                return;
            }

            mListenContext = Context.current().withCancellation();
            mListenContext.run(listenRunnable);

            reqContexts.put(new Integer(qid),mListenContext);

        }
        catch (Exception ex){
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }

    }

    public void cancel(int qid) {
        Context.CancellableContext context = reqContexts.get(qid);

        if (context != null) {
            context.cancel(null);
            context = null;
            Log.d("Fetch cancel:",String.valueOf(qid));
        }
    }

    public void cancelConstituentStock(int qid, String blockid) {

//        synchronized (_obj) {
            Context.CancellableContext context = reqContexts.get(qid);
//            Log.d("ConstituentXXX cancel0:",String.valueOf(qid));

            if (context != null) {
                context.cancel(null);
                context = null;

                Log.d("ConstituentXXX cancel:",String.valueOf(qid));
                Log.d("Fetch cancel:",String.valueOf(qid));

//            closeSingleQuote();
            }
            else {
                _ConstituentWaitCancel.add(qid);
//                Log.d("ConstituentXXX cancelw:",String.valueOf(qid));
            }

            BlockManager.getInstance().setSortedCodes(blockid, "");
//        }

    }

    public void closeQuote() {
//        if (mQuoteContext != null) {
//            mQuoteContext.cancel(null);
//            mQuoteContext = null;
//        }
    }

    public void closeFullQuote() {
//        if (mFullQuoteContext != null) {
//            mFullQuoteContext.cancel(null);
//            mFullQuoteContext = null;
//        }
    }

    public void closeSingleQuote() {
        if (mQuoteStreamObserverTest != null) {
//            mQuoteStreamObserverTest.onCompleted();
//            mQuoteStreamObserverTest = null;
        }
//        if (mQuoteContext != null) {
//            mQuoteContext.cancel(null);
//            mQuoteContext = null;
//        }
    }

    public void shutdown() throws InterruptedException {
//        resetConnect();
        channel.shutdown().awaitTermination(5, SECONDS);
    }

    private SSLSocketFactory getSSLSocket(InputStream is) throws Exception {

        CertificateFactory cerFactory = CertificateFactory.getInstance("X.509");
        Certificate cer = cerFactory.generateCertificate(is);

        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, null);
        keyStore.setCertificateEntry("ydyun", cer);

        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(keyStore);

        sslContext = SSLContext.getInstance("TLSv1.2");
        sslContext.init(null, tmf.getTrustManagers(), null);

        return sslContext.getSocketFactory();

    }

    private List<String> getCodeList(String codes) {

        String[] codeArray = codes.split(",");
        List<String> codelist = Arrays.asList(codeArray);

        return codelist;
    }

    //单体定义
    private YdYunClient() {}

    private static YdYunClient single=null;

    public static YdYunClient getInstance() {
        if (single == null) {
            single = new YdYunClient();
        }
        return single;
    }

    public void closeChannel(){
        if(channel!=null){
            channel.shutdownNow();
        }
        channel=null;
        if(null!=fundStub){
            fundStub=null;
        }
    }
    public void resetConnect(){
        Log.d("stock-http","resetConnect");
//        if(channel!=null){
//            channel.shutdownNow();
//        }
//        channel=null;
        if(null!=mFullQuoteStreamObserver)
        mFullQuoteStreamObserver=null;
        if(null!=mQuoteStreamObserverTest)
        mQuoteStreamObserverTest=null;
        if(null!=mFullQuoteContext)
        mFullQuoteContext=null;
        if(null!=mQuoteContext)
        mQuoteContext=null;
//        if(codesArray!=null){
//            codesArray.clear();
//        }

    }
}

