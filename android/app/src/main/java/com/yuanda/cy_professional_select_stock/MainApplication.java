package com.yuanda.cy_professional_select_stock;

import android.content.Context;

import androidx.multidex.MultiDexApplication;

import com.bokecc.livemodule.LiveSDKHelper;
import com.burnweb.rnwebview.RNWebViewPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.dzhyun.dzhchart.ChartPackage;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.github.yamill.orientation.OrientationPackage;
import com.reactnativecommunity.androidprogressbar.RNCProgressBarPackage;
import com.reactnativecommunity.progressview.RNCProgressViewPackage;
import com.tencent.smtt.sdk.QbSdk;
import com.umeng.analytics.AnalyticsConfig;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.socialize.Config;
import com.umeng.socialize.PlatformConfig;
import com.umeng.socialize.UMShareAPI;
import com.ydyun.ydsdk.YDPackage;
import com.ydyun.ydsdk.download_history_data.KLineDataProcessPackage;
import com.yuanda.cy_professional_select_stock.android_upgrade.UpgradePackage;
import com.yuanda.cy_professional_select_stock.module.CallPhoneReactPackage;
import com.yuanda.cy_professional_select_stock.module.GetNaviHeightPackage;
import com.yuanda.cy_professional_select_stock.module.HuoDeLiveVideoPackage;
import com.yuanda.cy_professional_select_stock.module.HuoDeReplayVideoPackage;
import com.yuanda.cy_professional_select_stock.module.HuoDeVodVideoPackage;
import com.yuanda.cy_professional_select_stock.module.NEVideoViewPackage;
import com.yuanda.cy_professional_select_stock.module.NotchSizePackage;
import com.yuanda.cy_professional_select_stock.module.RegisterMiPushPackage;
import com.yuanda.cy_professional_select_stock.module.ScreenLightPackage;
import com.yuanda.cy_professional_select_stock.module.SensorsManager;
import com.yuanda.cy_professional_select_stock.module.SharePackage;
import com.yuanda.cy_professional_select_stock.module.SplashScreenNotificationPackage;

import org.wonday.pdf.RCTPdfView;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import cn.reactnative.customkeyboard.RNCustomKeyboardPackage;

//import com.yuanda.cy_professional_select_stock.module.MyMainReactPackage;

public class MainApplication extends MultiDexApplication implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            @SuppressWarnings("UnnecessaryLocalVariable")
            List<ReactPackage> packages = new PackageList(this).getPackages();
            // Packages that cannot be autolinked yet can be added manually here, for example:
//            packages.add(new MainReactPackage());
//            packages.add(new RNSensorsAnalyticsPackage());
//            packages.add(new TranslucentModalPackage());
//            packages.add(new PickerViewPackage());
//            packages.add(new SpringScrollViewPackage());
//            packages.add(new RNDeviceInfo());
//            packages.add(new RNGestureHandlerPackage());
            packages.add(new SplashScreenNotificationPackage());
            packages.add(new NEVideoViewPackage());
//            packages.add(new VideoViewPackage());
            packages.add(new OrientationPackage());
            packages.add(new ScreenLightPackage());
            packages.add(new NotchSizePackage());
            packages.add(new GetNaviHeightPackage());
           // packages.add(new PDFViewPackager());
            packages.add(new RCTPdfView());
//            packages.add(new RNFetchBlobPackage());
//            packages.add(new LinearGradientPackage());
       //     packages.add(new PDFView());

//            packages.add(new RNFSPackage());
            packages.add(new KLineDataProcessPackage());
            packages.add(new ChartPackage());
            packages.add(new UmengAnalyticsPackage());
            packages.add(new RNCustomKeyboardPackage());
            packages.add(new CallPhoneReactPackage());
            packages.add(new SharePackage());
//            packages.add(new UpgradePackage());
            packages.add(new RegisterMiPushPackage());
            packages.add(new RNWebViewPackage());
            packages.add(new YDPackage());
//            packages.add(new SQLitePluginPackage());
            packages.add(new HuoDeLiveVideoPackage());
            packages.add(new HuoDeReplayVideoPackage());
            packages.add(new HuoDeVodVideoPackage());
            packages.add(new FastImageViewPackage());

            //react native pdf 库伴生引入的两个组件
            packages.add(new RNCProgressBarPackage());
            packages.add(new RNCProgressViewPackage());

//            packages.add(new YDPackage());
            packages.add(new UpgradePackage());
//            packages.add(new FastImageViewPackage());
//            packages.add(new RNSensorsAnalyticsPackage());
            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }


    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        //initializeFlipper(this); // Remove this line if you don't want Flipper enabled
//        DWLiveEngine.init(this);
        LiveSDKHelper.initSDK(this);

        Config.shareType = "react native";
        UMShareAPI.get(this);
        PlatformConfig.setQQZone("1108126508", "bdtiB3UuTibxvVdC");

        //PlatformConfig.setWeixin("wx01eed647cfb54caa", "c9c5e46facb03105985e1dc0c8c92be2");
        PlatformConfig.setWeixin("wx72526fb70395d242", "413dc348ce88c84324ffbe4ee3c0ef8a");

        PlatformConfig.setSinaWeibo("3270306123", "5f21be57ff55aad052efd124d54d730d", "http://sns.whalecloud.com");

        //  UMConfigure.init(this, UMConfigure.DEVICE_TYPE_PHONE,"");
        // 必须在调用任何统计SDK接口之前调用初始化函数
        /**
         * 设置组件化的Log开关
         * 参数: boolean 默认为false，如需查看LOG设置为true
         */
        UMConfigure.setLogEnabled(true);
        UMConfigure.init(this, "5d67821c4ca357cd6f000c5e", "hxg", UMConfigure.DEVICE_TYPE_PHONE, null);


        //TBS  增加这句话
//        QbSdk.initX5Environment(this,null);//初始化x5内核
//        QbSdk.setDownloadWithoutWifi(true);//让应用在没有WiFi的情况下，也能加载x5内核
//        ExceptionHandler.getInstance().initConfig(this);
        QbSdk.PreInitCallback cb = new QbSdk.PreInitCallback() {

            @Override
            public void onViewInitFinished(boolean arg0) {
                // TODO Auto-generated method stub
                //x5內核初始化完成的回调，为true表示x5内核加载成功，否则表示x5内核加载失败，会自动切换到系统内核。
//                Log.d("app", " onViewInitFinished is " + arg0);
            }

            @Override
            public void onCoreInitFinished() {
                // TODO Auto-generated method stub
            }
        };
        //x5内核初始化接口
        QbSdk.initX5Environment(getApplicationContext(), cb);
        SensorsManager.getInstance().init(this, true);
        //至于为什么用getChannel（） 因为debug渠道是测试环境
//        SensorsManager.getInstance().init(this, AnalyticsConfig.getChannel(this).equals("debug"));

    }

    /**
     * Loads Flipper in React Native templates.
     *
     * @param context
     */
    private static void initializeFlipper(Context context) {
        if (BuildConfig.DEBUG) {
            try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
                Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
                aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }

    }
}
