package com.ydyun.ydsdk;


import android.util.Log;

import com.alibaba.fastjson.JSONObject;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.concurrent.CountDownLatch;

import io.grpc.stub.StreamObserver;

public class YDStreamObserver<V> implements StreamObserver<V> {

    private CountDownLatch finishLatch = new CountDownLatch(1);
    private int mQid;
    private ReactApplicationContext mContext;

    YDStreamObserver(ReactApplicationContext c, int qid) {
        mQid = qid;
        mContext = c;
    }

    private int getQid() {
        return mQid;
    }

    protected void sendEvent(String eventName, WritableMap params) {
//        Log.e("TAG", "sendEvent: Times============================" );
        mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    protected void parseLabel(V value) {

        String result = JSONObject.toJSONString(value);

        WritableMap params = Arguments.createMap();
        params.putInt("qid", getQid());
        params.putString("data", result);
        Log.i("sendEvent","ydChannelMessage result=="+result);
        sendEvent("ydChannelMessage", params);
    }

    @Override
    public void onNext(V value) {
        Log.i("sendEvent","ydChannelMessage result=="+value);
        parseLabel(value);
    }

    @Override
    public void onError(Throwable t) {
        Log.e("stock-http","YDStreamObserver error=错误信息"+t.getMessage());
        finishLatch.countDown();

        //当错误信息是以 UNKNOWN 和 UNAVAILABLE 开始时,表示连接断开，发送广播RN重连
        if(t.getMessage().startsWith("UNKNOWN:")) {
//            YdYunClient.getInstance().closeChannel();
            YdYunClient.getInstance().resetConnect();
//            WritableMap params = Arguments.createMap();
//            params.putString("errorData", ""+t.getMessage());
//            sendEvent("quoteErrorMessage", params);


        }else if(t.getMessage().startsWith("UNAVAILABLE:")){
            YdYunClient.getInstance().resetConnect();
            if(t.getMessage().startsWith("UNAVAILABLE: End of stream or IOException")||t.getMessage().startsWith("UNAVAILABLE: Unable to resolve host")){
                YdYunClient.getInstance().closeChannel();
            }

            WritableMap params = Arguments.createMap();
            params.putString("errorData", ""+t.getMessage());
            sendEvent("quoteErrorMessage", params);
        }else if(t.getMessage().startsWith("CANCELLED")){
//            YdYunClient.getInstance().resetConnect();
//
//            WritableMap params = Arguments.createMap();
//            params.putString("errorData", ""+t.getMessage());
//            sendEvent("quoteErrorMessage", params);
        }
    }

    @Override
    public void onCompleted() {
        finishLatch.countDown();
    }
}
