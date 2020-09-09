package com.ydyun.ydsdk;



import android.util.Log;

import com.alibaba.fastjson.JSONObject;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

import java.text.SimpleDateFormat;
import java.util.Date;

import cn.com.yd.cygp4.grpc.DataDefineFundFlow.BaseFundFlow;
import yuanda.DataDefine.FullQuote;
import yuanda.GlueDataDefine.GluedQuote;

public class FullQuoteStreamObserver<V> extends YDStreamObserver<V> {


    FullQuoteStreamObserver(ReactApplicationContext c) {
        super(c,-1);
    }

    @Override
    protected void parseLabel(V value) {

        sendEvent2RN(value);

        setFullQuoteData(value);
    }

    @Override
    public void onNext(V value) {
//        Log.i("stock-http","--快照数据更新--"+value);
        final  V v = value;
        SingleQuoteManager.getInstance().getExecutorService().execute(new Runnable() {
            @Override
            public void run() {
                parseLabel(v);
            }
        });
    }

    private void setFullQuote(FullQuote fq) {

        String code = fq.getLabel();
        String name = fq.getName();

        if (name == null || name.isEmpty() || code == null || code.isEmpty())
            return;

        double dPrice = fq.getPrice();
        double dIncrease = fq.getIncrease();
        double dIncreaseRatio = fq.getIncreaseRatio();
        SingleQuoteManager.getInstance().setQuotePrice(
                code,
                name,
                dPrice,
                dIncrease,
                dIncreaseRatio);

    }

    private void setFundFlow(String code, String name, BaseFundFlow bff) {

        double littleIn = bff.getLittleIn();
        double littleOut = bff.getLittleOut();
        double mediumIn = bff.getMediumIn();
        double mediumOut = bff.getMediumOut();
        double largeIn = bff.getLargeIn();
        double largeOut = bff.getLargeOut();
        double superIn = bff.getSuperIn();
        double superOut = bff.getSuperOut();
        double hugeIn = bff.getHugeIn();
        double hugeOut = bff.getHugeOut();
        double hugeNet1Day = bff.getHugeNet1Day();
        double hugeNet3Day = bff.getHugeNet3Day();
        double hugeNet5Day = bff.getHugeNet5Day();
        double hugeNet10Day = bff.getHugeNet10Day();

                SingleQuoteManager.getInstance().setFunflowPrice(
                code,name,
                littleIn,littleOut,
                mediumIn,mediumOut,
                largeIn,largeOut,
                superIn,superOut,
                hugeIn,hugeOut,
                hugeNet1Day,hugeNet3Day,
                hugeNet5Day,hugeNet10Day);
    }

    private void setFullQuoteData(V value) {

//        GluedQuote gq = (GluedQuote) value;
//
//        FullQuote fq = gq.getQuote();
//        setFullQuote(fq);
//
//        String code = fq.getLabel();
////        Log.i("stock-setFullQuoteData-","code:"+code+"   "+value.toString());
//        String generalRegCodes = SingleQuoteManager.getInstance().getGeneralRegister();
//        if (generalRegCodes.contains(code)) {
//            sendEvent2RN(value);
//        }//逻辑有疑问的地方
//
//        BaseFundFlow bff = gq.getFundFlow();
//        setFundFlow(code, fq.getName(), bff);

            GluedQuote gq = (GluedQuote) value;
            FullQuote fq = gq.getQuote();
            String code = fq.getLabel();
//            if(fq!=null){
//                SimpleDateFormat format = new SimpleDateFormat("HH:mm");
//                Log.i("stock-http","-----------price--------"+fq.getPrice()+"       time:"+format.format(new Date(fq.getTime()*1000)));
//            }
            SingleQuoteManager.getInstance().setFullQuote(gq);
            String generalRegCodes = SingleQuoteManager.getInstance().getGeneralRegister();
            if (generalRegCodes.contains(code)) {
                sendEvent2RN(value);
            }
    }

    private void sendEvent2RN(V value) {
        String result = JSONObject.toJSONString(value);
        WritableMap params = Arguments.createMap();
        params.putString("interfaceName", "FetchFullQuoteNative");
        params.putString("data", result);
        super.sendEvent("ydChannelMessage4Quote", params);

    }

}
