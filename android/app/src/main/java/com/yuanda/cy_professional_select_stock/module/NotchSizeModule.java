package com.yuanda.cy_professional_select_stock.module;

import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class NotchSizeModule  extends ReactContextBaseJavaModule {
    ReactContext context;
    public NotchSizeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    public String getName() {
        return "GETNOTCHSIZE";
    }

    @ReactMethod
    public void getNotchSize(Callback callback) {
        callback.invoke(hasNotchAndSize(context));
    }
    @ReactMethod
    public void getBrand(Callback callback) {
        String brand = "NONE";
        if("HUAWEI".equals(android.os.Build.BRAND)){
            brand = "HUAWEI";
        }else if("1".equals(getSystemProperties("ro.miui.notch"))){
            brand = "XIAOMI";
        }
        else if("OPPO".equals(android.os.Build.BRAND)){
            brand = "OPPO";
        }
        else if("VIVO".equals(android.os.Build.BRAND)){
            brand = "VIVO";
        }
        callback.invoke(brand);

    }

    public  int hasNotchAndSize(Context context) {
        if("HUAWEI".equals(android.os.Build.BRAND)){
            //判断华为手机是否有刘海屏
            if(hasNotchAtHuawei(context)){
                return px2dp(context,(getNotchSizeAtHuawei(context))[1]);
            }
        }
        else if("1".equals(getSystemProperties("ro.miui.notch"))){
            return px2dp(context,(getStatusBarHeightForXM(context)));
        }
        else if("OPPO".equals(android.os.Build.BRAND)){
            //判断oppo手机是否是刘海屏, OPPO 手机的刘海高度和状态栏的高度是一致,获取状态栏的高度
            if(hasNotchAtOPPO(context)){
                return px2dp(context,(getStatusBarHeightForXM(context)));
            }
        }
        else if("VIVO".equals(android.os.Build.BRAND)){
            //判断vivo手机是否是刘海屏, 没有提供刘海高度的获取方式，我们只能通过获取状态栏高度来当做刘海的高度
            if(hasNotchAtVIVO(context)){
                return px2dp(context,(getStatusBarHeightForXM(context)));
            }
        }
        //其他手机或者没有刘海直接返回0
        return 0;

    }

    /**
     * convert px to its equivalent dp
     *
     * 将px转换为与之相等的dp
     */
    public static int px2dp(Context context, float pxValue) {
        final float scale =  context.getResources().getDisplayMetrics().density;
        return (int) (pxValue / scale + 0.5f);
    }


    public static boolean hasNotchAtHuawei(Context context) {
        boolean ret = false;
        try {
            ClassLoader classLoader = context.getClassLoader();
            Class HwNotchSizeUtil = classLoader.loadClass("com.huawei.android.util.HwNotchSizeUtil");
            Method get = HwNotchSizeUtil.getMethod("hasNotchInScreen");
            ret = (boolean) get.invoke(HwNotchSizeUtil);
        } catch (ClassNotFoundException e) {
            Log.e("Notch", "hasNotchAtHuawei ClassNotFoundException");
        } catch (NoSuchMethodException e) {
            Log.e("Notch", "hasNotchAtHuawei NoSuchMethodException");
        } catch (Exception e) {
            Log.e("Notch", "hasNotchAtHuawei Exception");
        } finally {
            return ret;
        }
    }


    //获取刘海尺寸：width、height
    //int[0]值为刘海宽度 int[1]值为刘海高度
    public static int[] getNotchSizeAtHuawei(Context context) {
        int[] ret = new int[]{0, 0};
        try {
            ClassLoader cl = context.getClassLoader();
            Class HwNotchSizeUtil = cl.loadClass("com.huawei.android.util.HwNotchSizeUtil");
            Method get = HwNotchSizeUtil.getMethod("getNotchSize");
            ret = (int[]) get.invoke(HwNotchSizeUtil);
        } catch (ClassNotFoundException e) {
            Log.e("Notch", "getNotchSizeAtHuawei ClassNotFoundException");
        } catch (NoSuchMethodException e) {
            Log.e("Notch", "getNotchSizeAtHuawei NoSuchMethodException");
        } catch (Exception e) {
            Log.e("Notch", "getNotchSizeAtHuawei Exception");
        } finally {
            return ret;
        }
    }

    public static boolean hasNotchAtOPPO(Context context) {
        return context.getPackageManager().hasSystemFeature("com.oppo.feature.screen.heteromorphism");
    }

    //判断是否vivo刘海屏
    public static boolean hasNotchAtVIVO(Context context) {
        boolean hasNotch = false;
        try {
            ClassLoader cl = context.getClassLoader();
            Class ftFeature = cl.loadClass("android.util.FtFeature");
            Method[] methods = ftFeature.getDeclaredMethods();
            if (methods != null) {
                for (int i = 0; i < methods.length; i++) {
                    Method method = methods[i];
                    if(method != null) {
                        if (method.getName().equalsIgnoreCase("isFeatureSupport")) {
                            hasNotch = (boolean) method.invoke(ftFeature, 0x00000020);
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            hasNotch = false;
        }
        return hasNotch;

    }

    private String getSystemProperties(String key){

        String values = "";
        Class<?> cls = null;

        try {
            cls = Class.forName("android.os.SystemProperties");
            Method mMethod = cls.getMethod("get", String.class);
            Object object = cls.newInstance();
            values = (String) mMethod.invoke(object, key);
        } catch (ClassNotFoundException e) {
        // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
        // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (InstantiationException e) {
        // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IllegalAccessException e) {
        // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IllegalArgumentException e) {
        // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (InvocationTargetException e) {
        // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return values;
    }

    //获取小米状态栏的高度
    public static int getStatusBarHeightForXM(Context context) {
        int statusBarHeight = 0;
        int resourceId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            statusBarHeight = context.getResources().getDimensionPixelSize(resourceId);
        }
        return statusBarHeight;
    }
}
