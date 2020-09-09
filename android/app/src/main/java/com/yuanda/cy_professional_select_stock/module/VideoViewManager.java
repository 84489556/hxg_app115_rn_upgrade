package com.yuanda.cy_professional_select_stock.module;


import android.net.Uri;
import android.os.Build;
import android.widget.VideoView;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by yzj on 2017/2/14.
 *
 */
public class VideoViewManager extends SimpleViewManager<VideoView> {
    private static final int COMMAND_PAUSE_ID = 1;
    private static final String COMMAND_PAUSE_NAME = "pause";
    private static final int COMMAND_START_ID = 2;
    private static final String COMMAND_START_NAME = "start";
    private static final int COMMAND_SEEK_TO_ID = 3;
    private static final String COMMAND_SEEK_TO_NAME = "seekTo";


    @Override
    public String getName() {
        return "NativeVideoView";
    }

    @Override
    protected VideoView createViewInstance(ThemedReactContext reactContext) {
        RCTVideoView video = new RCTVideoView(reactContext);
        return video;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                COMMAND_PAUSE_NAME,COMMAND_PAUSE_ID,
                COMMAND_START_NAME,COMMAND_START_ID,
                COMMAND_SEEK_TO_NAME, COMMAND_SEEK_TO_ID
        );
    }

    @Override
    public void receiveCommand(VideoView root, int commandId, @Nullable ReadableArray args) {
        FLog.e(VideoViewManager.class,"receiveCommand id = "+commandId);
        switch (commandId){
            case COMMAND_PAUSE_ID://暂停
                root.pause();
                break;
            case COMMAND_START_ID://开始
                root.start();
                break;
            case COMMAND_SEEK_TO_ID://快进
                if(args != null) {
                    int msec = args.getInt(0);
                    root.seekTo(msec);
                }
                break;
            default:
                break;
        }
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
        for (VideoEvent event:VideoEvent.values()){
            builder.put(event.toString(), MapBuilder.of("registrationName", event.toString()));
        }
        return builder.build();
    }

    @Override
    public void onDropViewInstance(VideoView view) {//销毁对象时释放一些资源
        super.onDropViewInstance(view);
        ((ThemedReactContext) view.getContext()).removeLifecycleEventListener((RCTVideoView) view);
         view.stopPlayback();
    }


    @ReactProp(name = "source")
    public void setSource(RCTVideoView videoView,@Nullable ReadableMap source){
        if(source != null){
            if (source.hasKey("url")) {
                String url = source.getString("url");
                FLog.e(VideoViewManager.class,"url = "+url);
                HashMap<String, String> headerMap = new HashMap<>();
                if (source.hasKey("headers")) {
                    ReadableMap headers = source.getMap("headers");
                    ReadableMapKeySetIterator iter = headers.keySetIterator();
                    while (iter.hasNextKey()) {
                        String key = iter.nextKey();
                        String value = headers.getString(key);
                        FLog.e(VideoViewManager.class,key+" = "+value);
                        headerMap.put(key,value);
                    }
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    videoView.setVideoURI(Uri.parse(url),headerMap);
                }else{
                    try {
                        Method setVideoURIMethod = videoView.getClass().getMethod("setVideoURI", Uri.class, Map.class);
                        setVideoURIMethod.invoke(videoView, Uri.parse(url), headerMap);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                videoView.start();
            }
        }
    }

}
