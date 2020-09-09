package com.ydyun.ydsdk;

import com.facebook.react.LazyReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.ModuleSpec;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import javax.inject.Provider;


public class YDPackage extends LazyReactPackage {

    @Override
    public List<ModuleSpec> getNativeModules(final ReactApplicationContext reactContext) {
        return Arrays.asList(
//                new ModuleSpec(YDYunChannel.class, new Provider<NativeModule>() {
//                    @Override
//                    public NativeModule get() {
//                        return new YDYunChannel(reactContext);
//                    }
//                })
//                new ModuleSpec(YDYunChannelTest.class, new Provider<NativeModule>() {
//                    @Override
//                    public NativeModule get() {
//                        return new YDYunChannelTest(reactContext);
//                    }
//                })
//                ModuleSpec.nativeModuleSpec(YDYunChannel.class, new Provider<YDYunChannel>() {
//                    @Override
//                    public YDYunChannel get() {
//                        return new YDYunChannel(reactContext);
//                    }
//                })

                ModuleSpec.nativeModuleSpec(YDYunChannel.class, new Provider<NativeModule>() {
                    @Override
                    public NativeModule get() {
                        return new YDYunChannel(reactContext);
                    }
                })

        );
    }

    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return LazyReactPackage.getReactModuleInfoProviderViaReflection(this);
    }

//    @Override
//    public List<Class<? extends JavaScriptModule>> createJSModules() {
//        return Collections.emptyList();
//    }

}