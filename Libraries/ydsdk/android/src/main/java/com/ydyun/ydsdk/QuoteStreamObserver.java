package com.ydyun.ydsdk;



import com.alibaba.fastjson.JSONObject;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

import yuanda.DataDefine;

public class QuoteStreamObserver<V> extends YDStreamObserver<V> {


    QuoteStreamObserver(ReactApplicationContext c) {
        super(c,-1);
    }

    @Override
    protected void parseLabel(V value) {


        String generalRegCodes = SingleQuoteManager.getInstance().getGeneralRegister();

        DataDefine.MiniQuote mq = (DataDefine.MiniQuote) value;
        String sLabel = mq.getLabel();

        if (generalRegCodes.contains(sLabel)) {

            sendEvent2RN(value);

        }//有逻辑疑问的地方
        else {

            String name = mq.getName();
            if (name == null ||name.isEmpty())
                return;

            double dPrice = mq.getPrice();
            double dIncrease = mq.getIncrease();
            double dIncreaseRatio = mq.getIncreaseRatio();
            SingleQuoteManager.getInstance().setQuotePrice(sLabel,name,dPrice,dIncrease,dIncreaseRatio);

        }


    }

    @Override
    public void onNext(V value) {

        final  V v = value;
        SingleQuoteManager.getInstance().getExecutorService().execute(new Runnable() {
            @Override
            public void run() {
                parseLabel(v);
            }
        });


    }
    private void sendEvent2RN(V value) {

        String result = JSONObject.toJSONString(value);

        WritableMap params = Arguments.createMap();
        params.putString("interfaceName", "FetchQuoteNative");
        params.putString("data", result);
        super.sendEvent("ydChannelMessage4Quote", params);

    }

}
