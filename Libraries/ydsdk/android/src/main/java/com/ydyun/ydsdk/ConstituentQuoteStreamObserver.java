package com.ydyun.ydsdk;


import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.ReactApplicationContext;

import yuanda.DataDefine;


public class ConstituentQuoteStreamObserver<V> extends YDStreamObserver<V> {

    ConstituentQuoteStreamObserver(ReactApplicationContext c) {
        super(c,-1);

    }

    @Override
    protected void parseLabel(V value) {

//        try {

            DataDefine.MiniQuote mq = (DataDefine.MiniQuote)value;

            String name = mq.getName();
            if (name == null ||name.isEmpty())
                return;
            String sLabel = mq.getLabel();
            double dPrice = mq.getPrice();
            double dIncrease = mq.getIncrease();
            double dIncreaseRatio = mq.getIncreaseRatio();
            SingleQuoteManager.getInstance().setQuotePrice(sLabel,name,dPrice,dIncrease,dIncreaseRatio);


//            SingleQuoteManager.getInstance().setQuotePrice(mq.getLabel(),mq.getName(),mq.getPrice(),mq.getIncrease(),mq.getIncreaseRatio());

//            org.json.JSONObject data = new org.json.JSONObject(source);
//            String code = data.getString("label");
//            String name = data.getString("name");
//            double price = data.getDouble("price");
//            double increase = data.getDouble("increase");
//            double increaseRatio = data.getDouble("increaseRatio");

//            SingleQuoteManager.getInstance().setQuotePrice(code,name,price,increase,increaseRatio);

            String str = mq.getLabel();str = str.concat(",");
            str = str.concat(mq.getName());str = str.concat(",");
            str = str.concat(String.valueOf(mq.getPrice()));str = str.concat(",");
            str = str.concat(String.valueOf(mq.getIncrease()));str = str.concat(",");
            str = str.concat(String.valueOf(mq.getIncreaseRatio()));
            Log.d("xxxxxxxx",str);


//        }catch (Exception ex){
//            ex.printStackTrace();
//
//
//        }
    }
}
