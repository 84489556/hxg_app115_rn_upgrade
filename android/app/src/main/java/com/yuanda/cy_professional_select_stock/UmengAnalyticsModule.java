package com.yuanda.cy_professional_select_stock;


import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.umeng.analytics.AnalyticsConfig;
import com.umeng.analytics.MobclickAgent;
import com.yuanda.cy_professional_select_stock.utils.OSUtils;

/**
 * Created by user on 16/6/15.
 */
public class UmengAnalyticsModule extends ReactContextBaseJavaModule {

    public UmengAnalyticsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    @Override
    public String getName() {
        return "UmengAnalytics";
    }

    /***
     * 设置umeng的Key和渠道号
     * @param key     umeng的key
     * @param channelId  渠道号
     */
    @ReactMethod
    public void setAppkeyAndChannelId(String key,String channelId) {
        //Activity a = getCurrentActivity();
        MobclickAgent.openActivityDurationTrack(false);
        MobclickAgent.startWithConfigure(
                new MobclickAgent.UMAnalyticsConfig(getCurrentActivity(), key, channelId, MobclickAgent.EScenarioType.E_UM_NORMAL));

    }
    @ReactMethod
    public void getChannelId(Promise promise){
        //获取渠道号
        String channelID = AnalyticsConfig.getChannel(getReactApplicationContext());
        promise.resolve(channelID);
    }
    /**
     * 自己增加的
     * 获取华为、小米和魅族的系统和系统版本 类似MIUI8.0
     * */
    @ReactMethod
    public void getOS(Promise promise){
        //获取渠道号
        String romTypeAndSys = OSUtils.getRomType()+""+OSUtils.getSystemProperty();
        promise.resolve(romTypeAndSys);
    }

    @ReactMethod
    public void beginLogPageView(String pageName) {

        MobclickAgent.onPageStart(pageName);
//        Log.d("beginLogPageView",""+ pageName);
    }
    @ReactMethod
    public void endLogPageView(String pageName) {

        MobclickAgent.onPageEnd(pageName);
//        Log.d("endLogPageView",""+ pageName);
    }
    @ReactMethod
    public void event(String event) {
        MobclickAgent.onEvent(getCurrentActivity(),event);
    }
    @ReactMethod
    public void setEncryptEnabled(Boolean value) {
        MobclickAgent.enableEncrypt(value);
    }
    @ReactMethod
    public void setDebugMode(Boolean value) {
        MobclickAgent.setDebugMode(value);
    }

}