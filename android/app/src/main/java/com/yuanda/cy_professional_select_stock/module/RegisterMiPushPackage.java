package com.yuanda.cy_professional_select_stock.module;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by pp. on 2018/12/03.
 */

public class RegisterMiPushPackage implements ReactPackage {
    public static ReactApplicationContext sReactContext;
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        sReactContext = reactContext;
        List<NativeModule> modules=new ArrayList<>();
        //将我们创建的类添加进原生模块列表中
        modules.add(new RegisterMiPushManager(reactContext));
        return modules;
    }

//    @Override
//    public List<Class<? extends JavaScriptModule>> createJSModules() {
//        return Collections.emptyList();
//    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
