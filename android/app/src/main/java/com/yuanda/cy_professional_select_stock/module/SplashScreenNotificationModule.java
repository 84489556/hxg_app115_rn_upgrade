package com.yuanda.cy_professional_select_stock.module;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SplashScreenNotificationModule extends ReactContextBaseJavaModule {

    public SplashScreenNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "YD_SplashScreenModule";
    }

    @ReactMethod
    public void hidden() {
        getCurrentActivity().sendBroadcast(new Intent("com.yuanda.hidden"));
    }
}
