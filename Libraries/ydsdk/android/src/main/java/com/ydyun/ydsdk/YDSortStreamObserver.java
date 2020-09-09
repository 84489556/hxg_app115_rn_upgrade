package com.ydyun.ydsdk;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;
import java.util.concurrent.CountDownLatch;

import io.grpc.stub.StreamObserver;
import yuanda.DataDefine;

/**
 * 在YDStreamObserver基础上复制而来的一个观察者，只是用于YdYunClient中FetchBlockSort方法中的观察者回调
 * 因为这个FetchBlockSort回调的排序中因为格式不同，导致了Json解析时有很多不需要的字段，所以在这个类中解析了以后再传到RN中使用
 * YDStreamObserver 与 此类不一样的地方就是parseLabel发送到RN中的数据格式不同
 * */
public class YDSortStreamObserver<V> implements StreamObserver<V> {

    private CountDownLatch finishLatch = new CountDownLatch(1);
    private int mQid;
    private ReactApplicationContext mContext;
    private Gson gson ;

    YDSortStreamObserver(ReactApplicationContext c, int qid) {
        mQid = qid;
        mContext = c;
        gson = new GsonBuilder().serializeNulls()
                .addSerializationExclusionStrategy(new ExclusionStrategy() {
                    @Override
                    public boolean shouldSkipField(FieldAttributes f) {
                        if (!f.getName().equals("label_") &&  !f.getName().equals("value_")) {
                            return true;
                        }else {
                            return false;
                        }
                    }
                    @Override
                    public boolean shouldSkipClass(Class<?> clazz) {
                        return false;
                    }
                })
                .create();
    }

    private int getQid() {
        return mQid;
    }

    protected void sendEvent(String eventName, WritableMap params) {
        mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    protected void parseLabel(V value) {
        DataDefine.FullSortResponse fullSortResponse = (DataDefine.FullSortResponse) value;
        List<DataDefine.SortEntity> dataList = fullSortResponse.getDataList();
        String jsonFormat = gson.toJson(dataList);
        WritableMap params = Arguments.createMap();
        params.putInt("qid", getQid());
        params.putString("data", jsonFormat);
        sendEvent("ydChannelMessage", params);
    }

    @Override
    public void onNext(V value) {
        parseLabel(value);
    }

    @Override
    public void onError(Throwable t) {
        finishLatch.countDown();
        //当错误信息是以 UNKNOWN 和 UNAVAILABLE 开始时,表示连接断开，发送广播RN重连
        if(t.getMessage().startsWith("UNKNOWN:")) {
            YdYunClient.getInstance().resetConnect();
        }else if(t.getMessage().startsWith("UNAVAILABLE:")){
            YdYunClient.getInstance().resetConnect();
            if(t.getMessage().startsWith("UNAVAILABLE: End of stream or IOException")||t.getMessage().startsWith("UNAVAILABLE: Unable to resolve host")){
                YdYunClient.getInstance().closeChannel();
            }
            WritableMap params = Arguments.createMap();
            params.putString("errorData", ""+t.getMessage());
            sendEvent("quoteErrorMessage", params);
        }else if(t.getMessage().startsWith("CANCELLED")){

        }
    }

    @Override
    public void onCompleted() {
        finishLatch.countDown();
    }
}
