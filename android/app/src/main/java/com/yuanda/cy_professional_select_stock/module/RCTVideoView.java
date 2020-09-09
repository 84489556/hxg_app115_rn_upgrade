package com.yuanda.cy_professional_select_stock.module;

import android.media.MediaPlayer;
import android.os.Handler;
import android.widget.VideoView;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * Created by yzj on 2017/2/14.
 *
 */
public class RCTVideoView extends VideoView implements LifecycleEventListener,
        MediaPlayer.OnPreparedListener,
        MediaPlayer.OnCompletionListener,
        MediaPlayer.OnErrorListener,
        MediaPlayer.OnInfoListener,
        MediaPlayer.OnBufferingUpdateListener,
        Runnable {

    private Handler mHandler;

    public RCTVideoView(ThemedReactContext reactContext) {
        super(reactContext);
        reactContext.addLifecycleEventListener(this);
        setOnPreparedListener(this);
        setOnCompletionListener(this);
        setOnErrorListener(this);
        mHandler = new Handler();
    }

    @Override
    public void onHostResume() {
//        FLog.e(VideoViewManager.class,"onHostResume");
    }

    @Override
    public void onHostPause() {
//        FLog.e(VideoViewManager.class,"onHostPause");
    }

    @Override
    public void onHostDestroy() {
        FLog.e(VideoViewManager.class,"onHostDestroy");
        mHandler.removeCallbacks(this);
    }

    @Override
    public void onPrepared(MediaPlayer mp) {//视频加载成功准备播放
        int duration = mp.getDuration();
        FLog.e(VideoViewManager.class,"onPrepared duration = "+duration);
        mp.setOnInfoListener(this);
        mp.setOnBufferingUpdateListener(this);
        WritableMap event = Arguments.createMap();
        event.putInt("duration",duration);//key用于js中的nativeEvent
        dispatchEvent(VideoEvent.EVENT_PREPARE.toString(),event);
        mHandler.post(this);
    }

    @Override
    public void onCompletion(MediaPlayer mp) {//视频播放结束
        FLog.e(VideoViewManager.class,"onCompletion");
        dispatchEvent(VideoEvent.EVENT_COMPLETION.toString(),null);
        mHandler.removeCallbacks(this);
        int progress = getDuration();
        WritableMap event = Arguments.createMap();
        event.putInt("progress",progress);
        dispatchEvent(VideoEvent.EVENT_PROGRESS.toString(),event);
    }

    @Override
    public boolean onError(MediaPlayer mp, int what, int extra) {//视频播放出错
        FLog.e(VideoViewManager.class,"onError what = "+ what+" extra = "+extra);
        mHandler.removeCallbacks(this);
        WritableMap event = Arguments.createMap();
        event.putInt("what",what);
        event.putInt("extra",what);
        dispatchEvent(VideoEvent.EVENT_ERROR.toString(),event);
        return true;
    }

    @Override
    public boolean onInfo(MediaPlayer mp, int what, int extra) {
        FLog.e(VideoViewManager.class,"onInfo");
        switch (what) {
            /**
             * 开始缓冲
             */
            case MediaPlayer.MEDIA_INFO_BUFFERING_START:
                FLog.e(VideoViewManager.class,"开始缓冲");
                break;
            /**
             * 结束缓冲
             */
            case MediaPlayer.MEDIA_INFO_BUFFERING_END:
                FLog.e(VideoViewManager.class,"结束缓冲");
                break;
            /**
             * 开始渲染视频第一帧画面
             */
            case MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START:
                FLog.e(VideoViewManager.class,"开始渲染视频第一帧画面");
                break;
            default:
                break;
        }
        return false;
    }

    @Override
    public void onBufferingUpdate(MediaPlayer mp, int percent) {//视频缓冲进度
        FLog.e(VideoViewManager.class,"onBufferingUpdate percent = "+percent);
        int buffer = (int) Math.round((double) (mp.getDuration() * percent) / 100.0);
        WritableMap event = Arguments.createMap();
        event.putInt("buffer",buffer);
        dispatchEvent(VideoEvent.EVENT_UPDATE.toString(),event);
    }

    @Override
    public void run() {
        if(isPlaying()) {
            int progress = getCurrentPosition();
            WritableMap event = Arguments.createMap();
            event.putInt("progress", progress);
            dispatchEvent(VideoEvent.EVENT_PROGRESS.toString(), event);
        }
        mHandler.postDelayed(this,1000);
    }

    private void dispatchEvent(String eventName, WritableMap eventData){
        ReactContext reactContext = (ReactContext) getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),//native和js两个视图会依据getId()而关联在一起
                eventName,//事件名称
                eventData
        );
    }
}

