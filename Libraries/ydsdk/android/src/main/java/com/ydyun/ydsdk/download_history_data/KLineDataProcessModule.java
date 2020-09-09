package com.ydyun.ydsdk.download_history_data;


import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class KLineDataProcessModule extends ReactContextBaseJavaModule {


    public KLineDataProcessModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "REQUEST_HISTORY_DATA";
    }

    @ReactMethod
    public void requestHistoryData(String url,Promise promise) {
        new DownLoadHistoryData().downLoadFile(url, promise);
    }
}
