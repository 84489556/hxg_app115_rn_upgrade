package com.yuanda.cy_professional_select_stock.module;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.os.Build;
import android.text.TextUtils;
import android.util.Log;


import com.sensorsdata.analytics.android.sdk.SAConfigOptions;
import com.sensorsdata.analytics.android.sdk.SensorsAnalyticsAutoTrackEventType;
import com.sensorsdata.analytics.android.sdk.SensorsDataAPI;
import com.umeng.analytics.AnalyticsConfig;
import com.yuanda.cy_professional_select_stock.BuildConfig;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class SensorsManager {

    private static SensorsManager instance = null;

    public static synchronized SensorsManager getInstance() {
        if (instance == null) {
            instance = new SensorsManager();
        }
        return instance;

    }

    public SensorsManager() {

    }


    public void init(Context context, boolean isEnableLog) {
        //设置 SAConfigOptions，传入数据接收地址 SA_SERVER_URL
        SAConfigOptions saConfigOptions = new SAConfigOptions(getSaServerUrl(context));

        //通过 SAConfigOptions 设置神策 SDK，每个条件都非必须，开发者可根据自己实际情况设置，更多设置可参考 SAConfigOptions 类中方法注释
        saConfigOptions.setAutoTrackEventType(
                SensorsAnalyticsAutoTrackEventType.APP_CLICK |      //开启全埋点点击事件
                SensorsAnalyticsAutoTrackEventType.APP_START |      //开启全埋点启动事件
                SensorsAnalyticsAutoTrackEventType.APP_END   |      //开启全埋点退出事件
                SensorsAnalyticsAutoTrackEventType.APP_VIEW_SCREEN) //开启全埋点浏览事件
                .enableLog(isEnableLog);                            //开启神策调试日志，默认关闭(调试时，可开启日志)。
        // 开启可视化全埋点
        saConfigOptions.enableVisualizedAutoTrack(true);
        // 开启 App 打通 H5
        saConfigOptions.enableJavaScriptBridge(true);
        //需要在主线程初始化神策 SDKF

        /**
         * 开启crash采集
         */
        saConfigOptions.enableTrackAppCrash();
        /**
         * 初始化SDK
         */
        SensorsDataAPI.startWithConfigOptions(context, saConfigOptions);
        /**
         * 开启自动追踪
         */
        setEnableAutoTrack();
        /**
         * 初始化SDK后，开启 RN 页面控件点击事件的自动采集
         */
        SensorsDataAPI.sharedInstance().enableReactNativeAutoTrack();



    }

    private  void setEnableAutoTrack(){
        try {
            // 打开自动采集, 并指定追踪哪些 AutoTrack 事件
            List<SensorsDataAPI.AutoTrackEventType> eventTypeList = new ArrayList<>();
            // $AppStart
            eventTypeList.add(SensorsDataAPI.AutoTrackEventType.APP_START);
            // $AppEnd
            eventTypeList.add(SensorsDataAPI.AutoTrackEventType.APP_END);
            // $AppViewScreen
            eventTypeList.add(SensorsDataAPI.AutoTrackEventType.APP_VIEW_SCREEN);
            // $AppClick
            eventTypeList.add(SensorsDataAPI.AutoTrackEventType.APP_CLICK);
            SensorsDataAPI.sharedInstance().enableAutoTrack(eventTypeList);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }





    /**
     * 当用户注册成功或登录成功时，需要调用 SDK 的 login() 方法：
     * 为了准确记录登录用户的行为信息，建议在以下时机各调用一次 login() 方法：
     * <p>
     * · 用户在注册成功时
     * · 用户登录成功时
     * · 已登录用户每次启动 App 时
     */
    public void login(String UID) {
        if (!TextUtils.isEmpty(UID)) {
            SensorsDataAPI.sharedInstance().login(UID);
        }
    }


    /**
     * 将应用名称作为事件公共属性，后续所有 track() 追踪的事件都会自动带上 "AppName" 属性
     * <p>
     * JSONObject properties = new JSONObject();
     * properties.put("AppName", getAppName(this));
     */
    public void registerSuperProperties(JSONObject properties) {
        if (null != properties) {
            SensorsDataAPI.sharedInstance().registerSuperProperties(properties);
        }

    }


    /**
     * 记录激活事件
     * 可以调用 trackInstallation() 方法记录激活事件，多次调用此方法只会在第一次调用时触发激活事件。
     * <p>
     * 触发激活事件时会尝试获取 IMEI 号。如果使用了神策的 App 内渠道推广功能，
     * 请先动态申请 android.permission.READ_PHONE_STATE 权限，
     * 再调用 trackInstallation() 方法。
     * <p>
     * public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
     * super.onRequestPermissionsResult(requestCode, permissions, grantResults);
     * if (requestCode == 100) {
     * // 申请权限结果回调时（无论申请权限成功失败），都需要触发激活事件。
     * trackInstallation();
     * }
     * }
     */

    public void trackInstallation(JSONObject properties) {
        if (null != properties) {
            SensorsDataAPI.sharedInstance().trackInstallation("AppInstall", properties);
        }
    }


    /**
     * SDK 初始化后，可以通过 track() 方法追踪用户行为事件，并为事件添加自定义属性：
     */
    public void sharedInstance(JSONObject properties) {
        if (null != properties) {
            SensorsDataAPI.sharedInstance().track("BuyProduct", properties);
        }
    }

    /**
     * try {
     * JSONObject properties = new JSONObject();
     * // 设定用户性别属性 "Sex" 为 "Male"
     * properties.put("Sex", "Male");
     * // 设定用户年龄属性 "Age" 为 18
     * properties.put("Age", 18);
     * <p>
     * // 设定用户属性
     * SensorsDataAPI.sharedInstance().profileSet(properties);
     * } catch (JSONException e) {
     * e.printStackTrace();
     * }
     */

    private void profileSet(JSONObject properties) {
        if (null != properties) {
            SensorsDataAPI.sharedInstance().profileSet(properties);
        }
    }


    private  String getSaServerUrl(Context context) {
        if ( AnalyticsConfig.getChannel(context).equals("debug")){
            return "https://yuandaxinxi.datasink.sensorsdata.cn/sa?project=huixuangu_default&token=f770359d41723c39";
        }else {
            return "https://yuandaxinxi.datasink.sensorsdata.cn/sa?project=huixuangu_production&token=f770359d41723c39";
        }

    }
}
