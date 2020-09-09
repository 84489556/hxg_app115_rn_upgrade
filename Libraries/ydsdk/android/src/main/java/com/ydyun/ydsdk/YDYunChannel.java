package com.ydyun.ydsdk;


import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import io.grpc.ConnectivityState;


@ReactModule(name = "YDYunChannelModule")
public class YDYunChannel extends ReactContextBaseJavaModule {

    private ReactApplicationContext _reactContext;

//    private YdYunClient _client = null;

//    private String _token = "11223344332211";
//    private String _token = new Random().nextInt(10000000)+"";
    private String _token = "";

    public YDYunChannel(ReactApplicationContext reactContext) {
        super(reactContext);

        _reactContext = reactContext;

    }

    private void initGrpcClient() {
        try {

//                _client = new YdYunClient(_reactContext, is,"192.168.1.21", 5051, true);
//                _client = new YdYunClient(_reactContext, is,"192.168.11.102", 5051, true);
//                _client = new YdYunClient(_reactContext, is,"192.168.1.55", 5051, true);
//                _client = new YdYunClient(_reactContext, null,"192.168.1.21", 5051, false);//改为根证书后替换
//                _client = new YdYunClient(_reactContext, null,"192.168.1.55", 5051, false);
//            YdYunClient.getInstance().init(_reactContext, null,"192.168.1.253", 5055, false,this._token);

//            YdYunClient.getInstance().init(_reactContext, null,"192.168.1.55", 5055, false,this._token);
//            YdYunClient.getInstance().init(_reactContext, null,"usergate.ydtg.com.cn", 5051, false,this._token);
           YdYunClient.getInstance().init(_reactContext, null,"usergateapp.ydtg.com.cn", 5055, false,this._token);
            // YdYunClient.getInstance().init(_reactContext, null,"39.97.181.225", 5055, false,this._token);
//            YdYunClient.getInstance().init(_reactContext, null,"192.168.1.199", 5055, false,this._token);
//            YdYunClient.getInstance().init(_reactContext, null,"192.168.1.180", 5055, false,this._token);



        }
        catch (Exception e) {
            Log.e("channel Exception","error="+e.getMessage());
        }

    }

    private YdYunClient getClient() {
        return YdYunClient.getInstance();
    }
    public void checkChannel(){
        if(null==this.getClient().getChannel()){
            this.initGrpcClient();
        }
    }
    @Override
    public String getName() {
        return "YDYunChannelModule";
    }

    @ReactMethod
    public void cancel(int qid) {
        checkChannel();
        this.getClient().cancel(qid);
    }

    @ReactMethod
    public void cancelConstituentStock(int qid, String blockid) {
        checkChannel();
        this.getClient().cancelConstituentStock(qid, blockid);
    }

    @ReactMethod
    public void shutdown() {
        try {
            checkChannel();
            this.getClient().shutdown();
        }
        catch(Exception e) {
            e.printStackTrace();
        }

    }

    @ReactMethod
    public void setTokenString(String tokenString,Callback callback) {
        if(tokenString == null||tokenString.equals("")){
            callback.invoke(false);
            return;
        }
        try {

            if(this._token.length() == 0){
                this._token = tokenString;
                this.initGrpcClient();
            }

            callback.invoke(true);
        }
        catch(Exception e) {
//            Log.w("stock-http","e.getMessage="+e.getMessage());
            callback.invoke(false);
            e.printStackTrace();
        }

    }

    @ReactMethod
    public void closeQuote() {
        checkChannel();
        this.getClient().closeQuote();
    }

    @ReactMethod
    public void closeFullQuote() {
        checkChannel();
        this.getClient().closeFullQuote();
    }

    @ReactMethod
    public void getResult(String message, final Callback callback) {
        String str = message + " success";
        callback.invoke(str);
    }

    @ReactMethod
    public void getChannelState(final Callback callback) {
        checkChannel();
        if(null!=this.getClient()) {
            ConnectivityState s = this.getClient().getChannelState();
            if(s!=null) {
                callback.invoke(s.ordinal());
            }
        }

    }

    /// 获取成分股数据
    @ReactMethod
    public void FetchConstituentStockNative(String params, Callback rnCallback) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchConstituentStock(params, rnCallback);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 获取指定的股票的快照数据。
    ///
    /// 当客户端调用此接口时，服务器首先注销调QuoteRequest中Unsubcribes指定的股票，
    /// 不在推送相关的快照信息；同时，服务器会注册QuoteRequest中Subcribes指定股票，并
    /// 返回相关的快照数据。后续注册的股票快照数据有更新，也会推送给客户端。
    ///
    /// 一个客户端只需（也必须）调用一次FetchQuote，调用后，可以通过stream QuoteRequest
    /// 多次发送快照请求。当客户端把所有的股票都注销时，服务器会结束此次调用。
    ///
    /// 如果一个客户端多次调用此接口，服务器会忽略掉之前的注册的股票，不再推送它们的快照，
    /// 同时，也会结束之前的调用（关闭stream Quote）
    /// rpc FetchQuote(stream QuoteRequest) returns (stream MiniQuote) {}

    @ReactMethod
    public void FetchQuoteNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchQuote(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 与接口FetchQuote作用相同，区别是，返回的数据是FullQuote
    /// rpc FetchFullQuote(stream QuoteRequest) returns (stream FullQuote) {}

    @ReactMethod
    public void FetchFullQuoteNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchFullQuote(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 获取指定的股票的快照数据。
    ///
    /// 该接口只获取最新的快照数据，不支持订阅，服务器不推送后续的更新的数据。
    /// QuoteRequest的Unsubcribes字段将会被忽略。
    /// rpc FetchStaticQuote(QuoteRequest) returns (MultiMiniQuote) {}

    @ReactMethod
    public void FetchStaticQuoteNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchStaticQuote(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 获取指定股票的K线数据。
    ///
    /// 服务器根据Request的label、period、split确定一种K线。再根据statr、count确定获取
    /// 数据的位置和数量。subscribe为false时，服务器返回数据后，会关闭stream；否则，会持续
    /// 推送最新的K线数据。注意需要避免对同一个K线多次设置subscribe，多次带有subscribe等于
    /// true的调用，会关闭之前的stream CandleStick。
    /// rpc FetchCandleStick(CandleStickRequest) returns (stream CandleStick) {}

    @ReactMethod
    public void FetchCandleStickNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchCandleStick(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 获取实时分时数据。一次最多获取10日，当超过10日时，只返回最近的10日数据。
    /// 此接口适用于分时图和多日分时图调用。
    ///
    /// MinRequest.subscribe为true时，服务器会推送最新的分时数据。推送数据有
    /// 可能比拉取的数据先到，客户端需要注意按时间整理数据。
    ///
    /// 客户端不再需要推送数据时，须调用ClientContext.TryCancel方法取消推送。
    ///
    /// MinRequest.subscribe为false时，服务器返回数据后，会关闭stream MinChart
    /// rpc FetchMinData(MinRequest) returns(stream MinChart) {}

    @ReactMethod
    public void FetchMinDataNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchMinData(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 获取指定日期的分时数据。只拉取，不推送实时数据，即使是指定的日期是当前交易日。
    /// 此接口适用于从K线调取对于的历史分时。
    ///
    /// 注意：发送请求时，指定的时间点是当地时间零点对应的UTC。
    /// rpc FetchHistoryMinData(HisMinRequest) returns (MinChart) {}

    @ReactMethod
    public void FetchHistoryMinDataNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchHistoryMinData(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 获取指定日期的分笔数据。
    ///
    /// TickRequest.subscribe为true时，服务器会推送最新的分笔数据。客户端不再需
    /// 要推送数据时，须调用ClientContext.TryCancel方法取消推送。
    ///
    /// TickRequest.subscribe为false时，服务器返回数据后，会关闭stream Ticks。
    /// rpc FetchTicks(TickRequest) returns (stream Ticks) {}

    @ReactMethod
    public void FetchTicksNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchTicks(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 按照指定的抬头获取某个板块的排序数
    ///
    /// TickRequest.subscribe为true时，服务器会推送最新的分笔数据。客户端不再需
    /// 要推送数据时，须调用ClientContext.TryCancel方法取消推送。
    ///
    /// TickRequest.subscribe为false时，服务器返回数据后，会关闭stream Ticks。
    /// rpc FetchBlockSort(SortRequest) returns (stream FullSortResponse) {}

    @ReactMethod
    public void FetchBlockSortNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchBlockSort(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    /// 获取某个股票的加量统计结果
    /// rpc FetchPriVol(PriVolRequest) returns (stream PriceVolume){}

    @ReactMethod
    public void FetchPriVolNative(String params) throws Exception {
        try {
            checkChannel();
            this.getClient().FetchPriVol(params);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }


}


