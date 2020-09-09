package com.yuanda.cy_professional_select_stock.module;

import android.view.WindowManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by pp. on 2018/5/10.
 */

public class ScreenLightManager extends ReactContextBaseJavaModule {

    public ScreenLightManager(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ScreenLightManager";
    }

    @ReactMethod
    public void screen_ON(){
       getCurrentActivity().runOnUiThread(new Runnable() {
           @Override
           public void run() {
               getCurrentActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
           }
       });

    }
    @ReactMethod
    public void screen_OFF(){
        getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                getCurrentActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
        });


    }
}
