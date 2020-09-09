package com.yuanda.cy_professional_select_stock.module;

import android.content.Context;
import android.graphics.Color;
import android.text.TextUtils;
import android.view.Gravity;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.bokecc.livemodule.replay.DWReplayCoreHandler;
import com.bokecc.livemodule.replay.DWReplayRoomListener;
import com.bokecc.livemodule.replay.video.ReplayVideoView;
import com.bokecc.sdk.mobile.live.Exception.DWLiveException;
import com.bokecc.sdk.mobile.live.pojo.TemplateInfo;
import com.bokecc.sdk.mobile.live.replay.DWLiveReplay;
import com.bokecc.sdk.mobile.live.replay.DWLiveReplayLoginListener;
import com.bokecc.sdk.mobile.live.replay.pojo.ReplayLoginInfo;
import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
//import com.yuanda.cystock.data.ObjectBox;
//import com.yuanda.cystock.data.VideoPosition;
//import com.yuanda.cystock.data.VideoPositionDBHelper;

import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import javax.annotation.Nullable;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;


/**
 * Created by wsf 2020-1-8
 *
 */
public class HuoDeReplayVideoManager extends SimpleViewManager<ReplayVideoView> implements DWReplayRoomListener {

    private static final int COMMAND_INIT_ID = 1;
    private static final String COMMAND_INIT_NAME = "init";
    private static final int COMMAND_START_ID = 2;
    private static final String COMMAND_START_NAME = "start";
    private static final int COMMAND_LEAVE_ID = 3;
    private static final String COMMAND_LEAVE_NAME = "leave";
    private static final int COMMAND_SWITCH_ID = 4;
    private static final String COMMAND_SWITCH_NAME = "switch";
    private static final int COMMAND_PAUSE_ID = 5;
    private static final String COMMAND_PAUSE_NAME = "pause";
    private static final int COMMAND_RESUME_ID = 6;
    private static final String COMMAND_RESUME_NAME = "resume";
    private static final int COMMAND_SEEK_ID = 7;
    private static final String COMMAND_SEEK_NAME = "seekTo";
    private static final int COMMAND_CONTINUE_ID = 8;
    private static final String COMMAND_CONTINUE_NAME = "continueTo";
    private Context context;

    private VideoTask videoTask;
    private Timer timer;
    ReplayVideoView replayVideoView;
    ReplayLoginInfo loginInfo;

//    VideoPositionDBHelper videoPositionDBHelper;
//    private VideoPosition lastVideoPosition;
    //当前播放位置、视频总时长
    private int currentPosition = 0, videoDuration = 0,lastPlayPosition = 0;
    String vodId;
    private boolean seekWait=false;
    @Override
    public String getName() {
        return "NativeHuoDeReplayVideo";
    }

    public HuoDeReplayVideoManager(ReactApplicationContext reactContext){
        this.context = reactContext;
    }


    @Override
    protected ReplayVideoView createViewInstance(ThemedReactContext reactContext) {
        if(replayVideoView != null){
            replayVideoView = null;
        }
        replayVideoView = new ReplayVideoView(reactContext);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
                Gravity.CENTER);

        replayVideoView.setBackgroundColor(Color.GRAY);
        replayVideoView.setLayoutParams(lp);
//        videoPositionDBHelper = new VideoPositionDBHelper(ObjectBox.get());
        initRoomListener();
        context = reactContext;
        return replayVideoView;
    }
    private void initRoomListener() {
        DWReplayCoreHandler dwReplayCoreHandler = DWReplayCoreHandler.getInstance();
        if (dwReplayCoreHandler == null) {
            return;
        }
        dwReplayCoreHandler.setReplayRoomListener(this);
    }
    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {

        Map map=new HashMap();
        map.put(COMMAND_INIT_NAME, COMMAND_INIT_ID);
        map.put(COMMAND_START_NAME, COMMAND_START_ID);
        map.put(COMMAND_LEAVE_NAME, COMMAND_LEAVE_ID);
        map.put(COMMAND_SWITCH_NAME, COMMAND_SWITCH_ID);
        map.put(COMMAND_PAUSE_NAME, COMMAND_PAUSE_ID);
        map.put(COMMAND_RESUME_NAME, COMMAND_RESUME_ID);
        map.put(COMMAND_SEEK_NAME, COMMAND_SEEK_ID);
        map.put(COMMAND_CONTINUE_NAME, COMMAND_CONTINUE_ID);
        return map;
//        return MapBuilder.of(
//                COMMAND_INIT_NAME, COMMAND_INIT_ID,
//                COMMAND_START_NAME, COMMAND_START_ID,
//                COMMAND_LEAVE_NAME, COMMAND_LEAVE_ID,
//                COMMAND_SWITCH_NAME, COMMAND_SWITCH_ID,
//                COMMAND_PAUSE_NAME, COMMAND_PAUSE_ID,
//                COMMAND_RESUME_NAME, COMMAND_RESUME_ID,
//                COMMAND_SEEK_NAME, COMMAND_SEEK_ID,
////                COMMAND_CONTINUE_NAME, COMMAND_CONTINUE_ID
//
//        );
    }

    @Override
    public void receiveCommand(ReplayVideoView root, int commandId, @Nullable ReadableArray args) {
        FLog.e(VideoViewManager.class,"receiveCommand id = "+commandId);
        try {
            switch (commandId){
                case COMMAND_INIT_ID:
                    switchUrl();
                    break;
                case COMMAND_START_ID://开始播放
//                if (player != null&&!player.isPlaying())
                    start();
                    break;
                case COMMAND_PAUSE_ID:
                     stop();
                    break;
                case COMMAND_RESUME_ID:
                    start();
                    break;
                case COMMAND_SEEK_ID:
                    if (args != null) {
                        int msec = args.getInt(0);
                        FLog.e(VideoViewManager.class, "receiveCommand COMMAND_SEEK_ID = " + msec);
                        if (replayVideoView != null&&null!= replayVideoView.getPlayer()) {
                            replayVideoView.getPlayer().seekTo(msec);
                            seekWait=true;
                        }
                    }
                    break;
                case COMMAND_CONTINUE_ID:
                    getLastVideoPosition();
                    switchUrl();
                    break;
                case COMMAND_SWITCH_ID://开始
                    lastPlayPosition=0;
                    switchUrl();
                    break;
                case COMMAND_LEAVE_ID:
                    lastPlayPosition=0;
                    cancelVideoTimer();
                    release();
                    break;
                default:
                    break;
            }
        }catch (Exception e){
            Toast.makeText(context,"初始化失败,请重试...", Toast.LENGTH_LONG).show();
        }

    }

    public void switchUrl(){
        doLiveLogin();
    }

   public void start(){
        if(replayVideoView !=null)
        replayVideoView.start();
   }
   public void stop(){
       if(replayVideoView !=null)
           replayVideoView.pause();
    }
    public void release(){
        DWLiveReplay.getInstance().stop();
        if(replayVideoView !=null)
            replayVideoView.destroy();
        replayVideoView=null;
        FLog.e(VideoViewManager.class,"release");
    }


    /**
     * 执行直播登录操作
     */
    public void doLiveLogin() {
        FLog.e(VideoViewManager.class,"doLiveLogin");

        // 创建登录信息


//        if (!"".equals(mGroupId.trim())) {
//            loginInfo.setGroupId(mGroupId);
//        }
        if(loginInfo==null|| TextUtils.isEmpty(loginInfo.getRoomId())){
            return;
        }
        // 设置登录参数
        DWLiveReplay.getInstance().setLoginParams(new DWLiveReplayLoginListener() {

            @Override
            public void onException(final DWLiveException e) {
                toastMsg( "" + e.getLocalizedMessage());
                FLog.e(VideoViewManager.class, "receiveCommand 登录失败：" + e.getLocalizedMessage());

            }

            @Override
            public void onLogin(TemplateInfo templateInfo) {
                FLog.e(VideoViewManager.class,"receiveCommand start");
                start();
            }
        }, loginInfo);
        DWLiveReplay.getInstance().stop();
        // 执行登录操作
        DWLiveReplay.getInstance().startLogin();
    }




    private void toastMsg(final String msg) {
        if (msg != null) {
            runOnUiThread(new Runnable() {

                @Override
                public void run() {
                    Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
    @ReactMethod
    public void getLastVideoPosition(String mVodId,Callback callback){
//        if(videoPositionDBHelper==null){
//            videoPositionDBHelper= new VideoPositionDBHelper(ObjectBox.get());
//        }
//        VideoPosition videoPosition= videoPositionDBHelper.getVideoPosition(mVodId);
//        if(videoPosition!=null){
//            callback.invoke(videoPosition.getPosition());
//        }else{
//            callback.invoke(0);
//        }

    }
    //获取本地数据库记录的播放位置
    private void getLastVideoPosition() {
//        lastVideoPosition = videoPositionDBHelper.getVideoPosition(vodId);
//        if (lastVideoPosition == null) {
//            lastPlayPosition = 0;
//            if (TextUtils.isEmpty(vodId)) {
//                return;
//            }
//            lastVideoPosition = new VideoPosition(vodId, 0);
//
//        } else {
//            lastPlayPosition = lastVideoPosition.getPosition();
//        }
    }
    //更新本地数据库记录的播放位置
    private void updateLastPlayPosition() {
//        if (!TextUtils.isEmpty(vodId) && lastVideoPosition != null ) {
//            lastVideoPosition.setPosition((int) currentPosition);
//            videoPositionDBHelper.updateVideoPosition(lastVideoPosition);
//        }
    }
    @Override
    public void videoPrepared() {
//        FLog.e(VideoViewManager.class,"----videoPrepared----");
//        VideoPosition lastVideoPosition= videoPositionDBHelper.getVideoPosition(vodId);
//        if(lastVideoPosition!=null){
//            lastPlayPosition=lastVideoPosition.getPosition();
//        }
        if (lastPlayPosition > 0) {
            //从上次播放的位置开始播放
            replayVideoView.getPlayer().seekTo(lastPlayPosition);
            replayVideoView.getPlayer().start();
            WritableMap event = Arguments.createMap();
            event.putInt("progress", lastPlayPosition);
            dispatchEvent("seedProgress", event);
////            mNowTimeTextview.setText(getTime(currentPosition/1000));
        }
        else {
            replayVideoView.getPlayer().start();
        }
//        runOnUiThread(new Runnable() {
//            @Override
//            public void run() {
                try{
                    //设置视频总时长
//                    FLog.e(VideoViewManager.class,"----videoPrepared--alltime--"+replayVideoView.getPlayer().getDuration());

                    videoDuration = (int)Math.floor(replayVideoView.getPlayer().getDuration());
                    WritableMap event = Arguments.createMap();
                    event.putInt("duration", videoDuration);
                    dispatchEvent("seedPrepared", event);
                    //        mAllTimeTextView.setText(getTime(videoDuration/1000));
                    startVideoTimer();
                }catch (Exception e){

                }
//            }
//        });
    }

    @Override
    public void startRending() {

    }

    @Override
    public void bufferStart() {

    }

    @Override
    public void bufferEnd() {
        seekWait=false;
    }

    @Override
    public void updateBufferPercent(int percent) {
    }

    @Override
    public void showVideoDuration(long playerDuration) {


    }

    @Override
    public void onPlayComplete() {
        WritableMap event = Arguments.createMap();
//        event.putInt("progress", videoDuration);
        event.putInt("progress", 0);
        dispatchEvent("seedProgress", event);
        dispatchEvent("seedCompletion",null);

    }

    @Override
    public void onPlayError(int code) {

    }


    // 播放进度计时器
    class VideoTask extends TimerTask {
        @Override
        public void run() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        if (context!=null&&!context.isRestricted()){
                            if(replayVideoView==null||replayVideoView.getPlayer()==null||!replayVideoView.getPlayer().isPlaying()){
                                return;
                            }

                            currentPosition = (int) replayVideoView.getPlayer().getCurrentPosition();
                            if(seekWait){
                                return;
                            }

                            //                            currentPosition=(int)Math.round( replayVideoView.getPlayer().getCurrentPosition() / 1000)* 1000;
//                            FLog.e(VideoViewManager.class,"----videoPrepared--curtime--"+replayVideoView.getPlayer().getCurrentPosition());
//                            FLog.e(VideoViewManager.class,"----videoPrepared--currentPosition--"+currentPosition);
//                        mNowTimeTextview.setText(getTime(currentPosition/1000));

                            if(currentPosition<=videoDuration) {
                                WritableMap event = Arguments.createMap();
                                event.putInt("progress", currentPosition);
                                dispatchEvent("seedProgress", event);
                                updateLastPlayPosition();
                            }

                        }
                    }catch (Exception e){
                        e.printStackTrace();
                    }

                }
            });
        }
    }
    //开启更新播放进度任务
    private void startVideoTimer() {
        cancelVideoTimer();
        timer = new Timer();
        videoTask = new VideoTask();
        timer.schedule(videoTask, 0, 1000);
    }


    //取消更新播放进度任务
    private void cancelVideoTimer() {
        if (timer != null) {
            timer.cancel();
        }
        if (videoTask != null) {
            videoTask.cancel();
        }
    }
    private void dispatchEvent(String eventName, WritableMap eventData) {
        ReactContext reactContext = (ReactContext) context;
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                replayVideoView.getId(),//native和js两个视图会依据getId()而关联在一起
                eventName,//事件名称
                eventData
        );
    }
    @ReactProp(name = "source")
    public void setSource(ReplayVideoView videoView, @Nullable ReadableMap params){

        if(params != null){
            setParam(params);
        }
    }
    public void setParam(ReadableMap params) {

        String roomId = "";
        String ccId = "";
        String replayId="";
        String nickName = "";
        String pwd = "";

//        String roomId = "AAEBE1923AED255A9C33DC5901307461";
//        String ccId = "06D46941C9080EA7";
//        String nickName = "tt";
//        String pwd = "345602";

        if (params.hasKey("roomId")) {
            roomId = params.getString("roomId");
        }
        if (params.hasKey("ccId")) {
            ccId = params.getString("ccId");
        }
        if (params.hasKey("replayId")) {
            replayId = params.getString("replayId");
        }

        if (params.hasKey("nickName")) {
            nickName = params.getString("nickName");
        }
        if (params.hasKey("pwd")) {
            pwd = params.getString("pwd");
        }
        loginInfo = new ReplayLoginInfo();
        loginInfo.setRecordId(replayId);
        loginInfo.setRoomId(roomId);
        loginInfo.setUserId(ccId);
        loginInfo.setViewerName(nickName);
        loginInfo.setViewerToken(pwd);
//        FLog.e(VideoViewManager.class, "receiveCommand login userId="+ccId+"       recordId= " + replayId);
//        FLog.e(VideoViewManager.class, "receiveCommand login roomId="+roomId);

//        FLog.e(VideoViewManager.class,"doLiveLogin=="+replayId);
    }
    @Override
    public Map getExportedCustomDirectEventTypeConstants() {


        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();

        builder.put("seedCachState", MapBuilder.of("registrationName", "onCaching"));
        builder.put("seedPlayState", MapBuilder.of("registrationName", "getPlayStateForJava"));
        builder.put("seedPrepared", MapBuilder.of("registrationName", "onPrepared"));
        builder.put("seedProgress", MapBuilder.of("registrationName", "onProgress"));
        builder.put("seedPlayTime", MapBuilder.of("registrationName", "getPlayTime"));
        builder.put("seedBufferUpdate", MapBuilder.of("registrationName", "onBufferUpdate"));
        builder.put("seedPauseState", MapBuilder.of("registrationName", "getPauseStateForJava"));
        builder.put("seedError", MapBuilder.of("registrationName", "onError"));
        builder.put("seedCompletion", MapBuilder.of("registrationName", "onCompletion"));
        builder.put("seedSeek", MapBuilder.of("registrationName", "onSeek"));
        return builder.build();
    }

}
