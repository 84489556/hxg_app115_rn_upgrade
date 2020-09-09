package com.yuanda.cy_professional_select_stock.module;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by cuiwenjuan on 2017/11/10.
 */

public class CallPhoneModule extends ReactContextBaseJavaModule {

    public ReactApplicationContext reactContext;
    public CallPhoneModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @ReactMethod
    public void callPhone(String phoneString) {
        Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + phoneString));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        this.reactContext.startActivity(intent);
    }
    @ReactMethod
    public void goToSetting() {
        Intent intent =  new Intent(Settings.ACTION_AIRPLANE_MODE_SETTINGS);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        this.reactContext.startActivity(intent);
    }

    @Override
    public String getName() {
        return "CallPhoneModule";
    }
}
