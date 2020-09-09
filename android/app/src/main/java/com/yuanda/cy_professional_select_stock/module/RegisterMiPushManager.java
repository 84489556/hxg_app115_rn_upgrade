package com.yuanda.cy_professional_select_stock.module;

import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.xiaomi.mipush.sdk.MiPushClient;

/**
 * Created by pp. on 2018/12/03.
 */

public class RegisterMiPushManager extends ReactContextBaseJavaModule {
    Context mContext;
    //小米推送账号信息
//    private static final String APP_ID = "2882303761518043524";
//    private static final String APP_KEY = "5861804365524";
    private static final String APP_ID = "2882303761518294731";
    private static final String APP_KEY = "5991829434731";
    public RegisterMiPushManager(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;

    }

    @Override
    public String getName() {
        return "RegisterMiPush";
    }

    //初始化小米推送
    @ReactMethod
    public void register(){
        MiPushClient.registerPush(mContext, APP_ID, APP_KEY);
    }
    //取消初始化小米推送
    @ReactMethod
    public void unRegister(){
        MiPushClient.unregisterPush(mContext);
    }
    //设置用户账号
    @ReactMethod
    public void setAccount(String account){
        MiPushClient.setUserAccount(mContext, account, null);
    }
    //取消用户账号的设置
    @ReactMethod
    public void unAccount(String account){
        MiPushClient.unsetUserAccount(mContext, account, null);
    }
    //设置标签
    @ReactMethod
    public void setSubscribe(String topic){
        MiPushClient.subscribe(mContext, topic, null);
    }
    //取消标签的设置
    @ReactMethod
    public void unSubscribe(String topic){
        MiPushClient.unsubscribe(mContext, topic, null);
    }
    //设置别名
    @ReactMethod
    public void setAlias(String alias){
        MiPushClient.setAlias(mContext, alias, null);
    }
    //取消别名的设置
    @ReactMethod
    public void unAlias(String alias){
        MiPushClient.unsetAlias(mContext, alias, null);
    }
    //获取注册id
    @ReactMethod
    public void getRegId(Promise promise){
        String regID = MiPushClient.getRegId(mContext);
        Log.i("xiaomipush","regID====="+regID);
        promise.resolve(regID);
    }
}
