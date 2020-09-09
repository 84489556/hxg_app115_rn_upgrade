package com.yuanda.cy_professional_select_stock.module;


import android.content.Context;
import android.graphics.SurfaceTexture;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.media.MediaPlayer;
import android.os.Handler;
import android.util.Log;
import android.view.Gravity;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import com.bokecc.livemodule.utils.DensityUtil;
import com.bokecc.sdk.mobile.exception.HuodeException;
import com.bokecc.sdk.mobile.play.DWMediaPlayer;
import com.bokecc.sdk.mobile.play.OnDreamWinErrorListener;
import com.bokecc.sdk.mobile.play.PlayInfo;
import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import javax.annotation.Nullable;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;


/**
 * Created by yzj on 2017/2/14.
 */
public class HuoDeVodVideoManager extends SimpleViewManager<TextureView> implements View.OnClickListener, TextureView.SurfaceTextureListener,
        DWMediaPlayer.OnPreparedListener, DWMediaPlayer.OnInfoListener, DWMediaPlayer.OnBufferingUpdateListener,
        DWMediaPlayer.OnCompletionListener, DWMediaPlayer.OnErrorListener, OnDreamWinErrorListener, SensorEventListener {
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

    String USERID = "06D46941C9080EA7";
    String API_KEY = "IcS4isPPB6zt0WPNR3CsAb3p3SnSQP7M";
    private Context context;
    private DWMediaPlayer player;
    private Surface playSurface;
    private PlayInfo playInfo;
    private VideoTask videoTask;
    private Timer timer;

    //当前播放位置、视频总时长
    private int currentPosition = 0, videoDuration = 0,lastPlayPosition = 0;
    private int videoHeight, videoWidth;
    private int gifVideoWidth, gifVideoHeight;


    protected Handler myHandler;
    private TextureView mGSVideoView;
    private String mVodId = "";//BCBC182BFB65FF419C33DC5901307461
    private SeekBar mSeekBarPlayViedo;
    private TextView mNowTimeTextview;
    private TextView mAllTimeTextView;
    private ImageButton mPauseScreenplay;
    private int VIEDOPAUSEPALY = 0;
    private int lastPostion = 0;
    private boolean isTouch = false;
    private static final String DURATION = "DURATION";
    private TextureView video;
    private boolean isPlay = false;

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {

    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }

    @Override
    public void onBufferingUpdate(MediaPlayer mediaPlayer, int i) {

    }

    @Override
    public void onCompletion(MediaPlayer mediaPlayer) {

        dispatchEvent("seedCompletion",null);
    }

    @Override
    public boolean onError(MediaPlayer mediaPlayer, int i, int i1) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {

//                if (!isBackupPlay && !isLocalPlay && isFirstBuffer) {
//                    startBackupPlay();
//                    return;
//                }
//
//                netWorkStatus = MultiUtils.getNetWorkStatus(activity);
//                if (netWorkStatus == 0) {
//                    isNoNetPause = true;
//                }
//                tv_error_info.setText("播放出现异常（" + what + "）");
//                showPlayErrorView();
//                hideOtherOperations();
//                tv_operation.setText("重试");
//                tv_operation.setOnClickListener(new View.OnClickListener() {
//                    @Override
//                    public void onClick(View v) {
//                        if (netWorkStatus == 0) {
//                            MultiUtils.showToast(activity, "请检查你的网络连接");
//                            return;
//                        }
//                        hidePlayErrorView();
//                        playVideoOrAudio(isAudioMode, false);
//                    }
//                });

            }
        });
        return true;
    }

    @Override
    public boolean onInfo(MediaPlayer mediaPlayer, int i, int i1) {
        FLog.e(VideoViewManager.class, "receiveCommand onInfo ----- " );

//        switch (what) {
//            case DWMediaPlayer.MEDIA_INFO_BUFFERING_START:
//                netWorkStatus = MultiUtils.getNetWorkStatus(activity);
//                if (netWorkStatus == 0 && !isLocalPlay) {
//                    isNoNetPause = true;
//                    showPlayErrorView();
//                    hideOtherOperations();
//                    tv_error_info.setText("请检查你的网络连接");
//                    tv_operation.setText("重试");
//                    tv_operation.setOnClickListener(new View.OnClickListener() {
//                        @Override
//                        public void onClick(View v) {
//                            hidePlayErrorView();
//                            playVideoOrAudio(isAudioMode, false);
//                        }
//                    });
//                } else {
//                    ll_load_video.setVisibility(View.VISIBLE);
//                }
//                break;
//            case DWMediaPlayer.MEDIA_INFO_BUFFERING_END:
//                if (!isLocalPlay) {
//                    isNoNetPause = false;
//                }
//                ll_load_video.setVisibility(View.GONE);
//                break;
//        }
        return false;
    }

    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        FLog.e(VideoViewManager.class, "receiveCommand onPrepared ----- " );

//        if (mediaPlayer != null) {
//            mediaPlayer.start();
//        }
//        playInfo = player.getPlayInfo();
////        if (playInfo != null) {
////            playUrl = playInfo.getPlayUrl();
////            currentDefinition = playInfo.getDefaultDefinition();
////        }
////        isPrepared = true;
////        isFirstBuffer = false;
        if (lastPlayPosition > 0) {
//
//            //从上次播放的位置开始播放
            player.seekTo(lastPlayPosition);
            player.start();
            WritableMap event = Arguments.createMap();
            event.putInt("progress", lastPlayPosition);
            dispatchEvent("seedProgress", event);
////            mNowTimeTextview.setText(getTime(currentPosition/1000));
//
        } else {
            player.start();
        }

//        //设置视频总时长
        videoDuration = mediaPlayer.getDuration();
        WritableMap event = Arguments.createMap();
        event.putInt("duration", videoDuration);
        dispatchEvent("seedPrepared", event);
        //        mAllTimeTextView.setText(getTime(videoDuration/1000));
        startVideoTimer();
    }

    @Override
    public void onSurfaceTextureAvailable(SurfaceTexture surface, int i, int i1) {
        playSurface = new Surface(surface);
        player.setSurface(playSurface);

    }

    @Override
    public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int i, int i1) {

    }

    @Override
    public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
        return false;
    }

    @Override
    public void onSurfaceTextureUpdated(SurfaceTexture surfaceTexture) {
//        if (isGifStart) {
//            long currentTime = System.currentTimeMillis();
//            if (currentTime - lastTimeMillis > 100) {
//                Bitmap bitmap = tv_video.getBitmap(gifVideoWidth, gifVideoHeight);
//                gifMakerThread.addBitmap(bitmap);
//                lastTimeMillis = currentTime;
//            }
//        }
    }

    @Override
    public void onClick(View view) {

    }

    @Override
    public void onPlayError(HuodeException e) {
        FLog.e(VideoViewManager.class, "receiveCommand onPlayError ----- " );

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
//                switch (e.getIntErrorCode()) {
//                    case 103:
//                        tv_error_info.setText("音频无播放节点（" + e.getIntErrorCode() + "）");
//                        showPlayErrorView();
//                        hideOtherOperations();
//                        tv_operation.setText("切换到视频");
//                        tv_operation.setOnClickListener(new View.OnClickListener() {
//                            @Override
//                            public void onClick(View v) {
//                                isAudioMode = false;
//                                hidePlayErrorView();
//                                resetPlay();
//                            }
//                        });
//                        break;
//                    case 102:
//                        //切换到音频
//                        isAudioMode = true;
//                        playVideoOrAudio(isAudioMode, false);
//                        break;
//                    case 104:
//                        tv_error_info.setText("授权验证失败（" + e.getIntErrorCode() + "）");
//                        showPlayErrorView();
//                        hideOtherOperations();
//                        tv_operation.setVisibility(View.GONE);
//                        break;
//                }
            }
        });
    }

    //设置画面尺寸
    private void setSize(int position) {
//        currentVideoSizePos = position;
        if (videoHeight > 0) {
            ViewGroup.LayoutParams videoParams = mGSVideoView.getLayoutParams();
            int landVideoHeight = DensityUtil.getScreenHeight(context);
            int landVideoWidth = landVideoHeight * videoWidth / videoHeight;
            int screenHeight = DensityUtil.getScreenWidth(context);
            if (landVideoWidth > screenHeight) {
                landVideoWidth = screenHeight;
                landVideoHeight = landVideoWidth * videoHeight / videoWidth;
            }
            if (position == 0) {
                landVideoHeight = DensityUtil.getScreenHeight(context);
                landVideoWidth = DensityUtil.getScreenWidth(context);
            } else if (position == 1) {
                landVideoHeight = 1 * landVideoHeight;
                landVideoWidth = 1 * landVideoWidth;
            } else if (position == 2) {
                landVideoHeight = (int) (0.75 * landVideoHeight);
                landVideoWidth = (int) (0.75 * landVideoWidth);
            } else if (position == 3) {
                landVideoHeight = (int) (0.5 * landVideoHeight);
                landVideoWidth = (int) (0.5 * landVideoWidth);
            }
            videoParams.height = landVideoHeight;
            videoParams.width = landVideoWidth;
            mGSVideoView.setLayoutParams(videoParams);
        }
    }


    private void startPlay(String vodId) {
        if (player != null) {
            player.pause();
            player.stop();
            player.reset();
            player.setVideoPlayInfo(vodId, USERID, API_KEY, "", context);
            player.setSurface(playSurface);
//        HuodeApplication.getDRMServer().resetLocalPlay();
            player.setAudioPlay(false);
            player.prepareAsync();
        }
    }


    //暂停或开始播放
    private void playOrPauseVideo() {
        if (player.isPlaying()) {
            player.pause();
//            isPlayVideo = false;
//            mPauseScreenplay.setImageResource(R.mipmap.icon_play);
            //展示暂停广告

        } else {
            player.start();
//            isPlayVideo = true;
//            mPauseScreenplay.setImageResource(R.mipmap.icon_pause);

        }
    }


    //播放视频
    private void resumePlay() {
        if (!player.isPlaying()) {
            player.start();
//            mPauseScreenplay.setImageResource(R.mipmap.icon_pause);
        }
    }


    private enum VideoEvent {
        EVENT_PREPARE("onPrepared"),
        EVENT_PROGRESS("onProgress"),
        EVENT_UPDATE("onBufferUpdate"),
        EVENT_ERROR("onError"),
        EVENT_COMPLETION("onCompletion"),
        EVENT_SEEK("onSeek"),
        EVENT_CACHING("onCaching"),
        EVENT_ALLTIME("getPlayTime");

        private String mName;

        VideoEvent(String name) {
            this.mName = name;
        }

        @Override
        public String toString() {
            return mName;
        }
    }


    public HuoDeVodVideoManager(ReactApplicationContext reactContext) {
        this.context = reactContext;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                COMMAND_INIT_NAME, COMMAND_INIT_ID,
                COMMAND_START_NAME, COMMAND_START_ID,
                COMMAND_LEAVE_NAME, COMMAND_LEAVE_ID,
                COMMAND_SWITCH_NAME, COMMAND_SWITCH_ID,
                COMMAND_PAUSE_NAME, COMMAND_PAUSE_ID,
                COMMAND_RESUME_NAME, COMMAND_RESUME_ID,
                COMMAND_SEEK_NAME, COMMAND_SEEK_ID

        );
    }

    private void initPlayer() {
        player = new DWMediaPlayer();
        player.setOnPreparedListener(this);
        player.setOnInfoListener(this);
        player.setOnBufferingUpdateListener(this);
        player.setOnCompletionListener(this);
        player.setOnDreamWinErrorListener(this);
        player.setOnErrorListener(this);
//        开启防录屏，会使加密视频投屏功能不能正常使用
//        player.setAntiRecordScreen(this);
        //设置CustomId
        player.setCustomId("HIHA2019");
//        player.setDRMServerPort(HuodeApplication.getDrmServerPort());
        initPlayerUi();
    }

    private void initPlayerUi() {
        player.setOnSeekCompleteListener(new MediaPlayer.OnSeekCompleteListener() {
            @Override
            public void onSeekComplete(MediaPlayer mp) {
                FLog.e(VideoViewManager.class, "receiveCommand onSeekComplete ----- " );

//                player.start();
//                player.pauseWithoutAnalyse();

            }
        });
        //拖动视频
//        sb_progress.setOnSeekBarChangeListener(new HotspotSeekBar.OnSeekBarChangeListener() {
//
//            @Override
//            public void onStartTrackingTouch(HotspotSeekBar seekBar) {
//                returnListenTime = seekBar.getProgress();
//            }
//
//            @Override
//            public void onStopTrackingTouch(HotspotSeekBar seekBar, float trackStopPercent) {
//                int stopPostion = (int) (trackStopPercent * player.getDuration());
//                mediaPlayer.seekTo(stopPostion);
//            }
//        });
//        //点击打点位置，从这个位置开始播放
//        sb_progress.setOnIndicatorTouchListener(new HotspotSeekBar.OnIndicatorTouchListener() {
//            @Override
//            public void onIndicatorTouch(int currentPosition) {
//                mediaPlayer.seekTo(currentPosition * 1000);
//            }
//        });

//        Activity activity = ((ReactApplicationContext) context).getCurrentActivity();
//        LayoutInflater inflater = (LayoutInflater) activity.getSystemService(LAYOUT_INFLATER_SERVICE);
//        View v = inflater.inflate(R.layout.vod_layout_modify, null);
//
//        mGSVideoView = (GSVideoView) v.findViewById(R.id.vodvideoview);
//        mNowTimeTextview = (TextView) v.findViewById(R.id.palynowtime);
//        mAllTimeTextView = (TextView) v.findViewById(R.id.palyalltime);
//        mPauseScreenplay = (ImageButton) v.findViewById(R.id.pauseresumeplay);
//        mPauseScreenplay.setOnClickListener(new OnClickListener() {
//            @Override
//            public void onClick(View currentView) {
//
//                if (currentView.getId() == R.id.pauseresumeplay) {
//                    if (VIEDOPAUSEPALY == 0) {
//                        mVodPlayer.pause();
//                    } else if (VIEDOPAUSEPALY == 1) {
//                        mVodPlayer.resume();
//                    }
//                }
//            }
//        });
//        lastPostion = activity.getPreferences(MODE_PRIVATE).getInt("lastPos", 0);
//        mSeekBarPlayViedo = (SeekBar) v.findViewById(R.id.seekbarpalyviedo);
//        if (mSeekBarPlayViedo != null) {
//            mSeekBarPlayViedo.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
//                @Override
//                public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
//                }
//
//                @Override
//                public void onStartTrackingTouch(SeekBar seekBar) {
//                    isTouch = true;
//                }
//
//                @Override
//                public void onStopTrackingTouch(SeekBar seekBar) {
//                    if (null != player) {
//                        int pos = seekBar.getProgress();
//                        player.seekTo(pos);
//                    }
//
//                }
//            });
//
//
//        }

    }

    @Override
    public void receiveCommand(TextureView root, int commandId, @Nullable ReadableArray args) {
        FLog.e(VideoViewManager.class, "receiveCommand id = " + commandId);
        switch (commandId) {
            case COMMAND_INIT_ID:
                initPlayer();
                startPlay(mVodId);
                break;
            case COMMAND_START_ID://开始播放
                mGSVideoView = root;
//                if (player != null&&!player.isPlaying())
                    player.start();

                break;
            case COMMAND_PAUSE_ID:
                if (player != null)
                    player.pause();
                break;
            case COMMAND_RESUME_ID:
                if (player != null)
                    player.start();
                break;
            case COMMAND_SEEK_ID:
                if (args != null) {

                    int msec = args.getInt(0);
                    FLog.e(VideoViewManager.class, "receiveCommand COMMAND_SEEK_ID = " + msec);
                    if (player != null) {
                        player.seekTo(msec);

                    }
                }
                break;
            case COMMAND_SWITCH_ID:
                mGSVideoView = root;
                startPlay(mVodId);

                break;
            case COMMAND_LEAVE_ID:
                if (player != null) {
                    player.pause();
                    player.stop();
                    player.release();
                    cancelVideoTimer();
                }
                break;
            default:
                break;
        }
    }




    private void setParam(ReadableMap params) {


        String roomId = "";
        String ccId = "";


//        String roomId = "AAEBE1923AED255A9C33DC5901307461";
//        String ccId = "06D46941C9080EA7";

        if (params.hasKey("roomId")) {
            roomId = params.getString("roomId");
            mVodId=roomId;
        }
        if (params.hasKey("ccId")) {
            ccId = params.getString("ccId");
            USERID=ccId;
        }

    }




    private void dispatchEvent(String eventName, WritableMap eventData) {
        ReactContext reactContext = (ReactContext) context;
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                mGSVideoView.getId(),//native和js两个视图会依据getId()而关联在一起
                eventName,//事件名称
                eventData
        );
    }
    // 播放进度计时器
    class VideoTask extends TimerTask {
        @Override
        public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (context!=null&&!context.isRestricted()){
                            if(player==null||!player.isPlaying()){
                                return;
                            }
                            currentPosition = player.getCurrentPosition();
//                        mNowTimeTextview.setText(getTime(currentPosition/1000));
                            if(currentPosition<=videoDuration) {
                                WritableMap event = Arguments.createMap();
                                event.putInt("progress", currentPosition);
                                dispatchEvent("seedProgress", event);
                            }
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
//    private GSOLPlayer.OnOLPlayListener vodplaylistener = new GSOLPlayer.OnOLPlayListener() {
//
//
//        private long initTime;
//
//        @Override
//        public void onInit(int result, boolean haveVideo, int duration, List<DocInfo> docInfos) {
//            initTime = System.currentTimeMillis();
//
//
//            WritableMap event = Arguments.createMap();
//            event.putInt("duration", duration);//key用于js中的nativeEvent
////            dispatchEvent(VideoEvent.EVENT_PREPARE.toString(),event);
//            dispatchEvent("seedPrepared", event);
//
//        }
//
//        @Override
//        public void onPlayStop() {
//            //播放结束或者调用stop后调用该方法
////            dispatchEvent(VideoEvent.EVENT_COMPLETION.toString(),null);
//            dispatchEvent("seedCompletion", null);
//        }
//
//        @Override
//        public void onPosition(int position) {
//
//            if (System.currentTimeMillis() - initTime >= 1000) {
//                WritableMap event = Arguments.createMap();
//                event.putInt("progress", position);
////                dispatchEvent(VideoEvent.EVENT_PROGRESS.toString(), event);
//                dispatchEvent("seedProgress", event);
//                initTime = System.currentTimeMillis();
//            }
//
//
//        }
//
//        @Override
//        public void onVideoSize(int position, int videoWidth, int videoHeight) {
//
//            myHandler.sendMessage(myHandler.obtainMessage(MSG.MSG_ON_VIDEOSIZE, 0));
//        }
//
//
//        @Override
//        public void onSeek(int position) {
//
//            WritableMap event = Arguments.createMap();
//            event.putInt("position", position);
////            dispatchEvent(VideoEvent.EVENT_SEEK.toString(), event);
//            dispatchEvent("seedSeek", event);
//        }
//
//        @Override
//        public void onAudioLevel(int level) {
//            myHandler.sendMessage(myHandler.obtainMessage(MSG.MSG_ON_AUDIOLEVEL, level));
//        }
//
//        @Override
//        public void onError(int errCode) {
//            // dispatchEvent(VideoEvent.EVENT_ERROR.toString(), null);
//            dispatchEvent("seedError", null);
//        }
//
//        @Override
//        public void onPlayPause() {
//
//            myHandler.sendMessage(myHandler.obtainMessage(MSG.MSG_ON_PAUSE, 0));
//            ReactContext reactContext = (ReactContext) context;
//            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
//                    mGSVideoView.getId(),//native和js两个视图会依据getId()而关联在一起
//                    "seedPauseState",//事件名称
//                    null
//            );
//        }
//
//        @Override
//        public void onPlayResume() {
//
//            myHandler.sendMessage(myHandler.obtainMessage(MSG.MSG_ON_RESUME, 0));
//            ReactContext reactContext = (ReactContext) context;
//            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
//                    mGSVideoView.getId(),//native和js两个视图会依据getId()而关联在一起
//                    "seedPlayState",//事件名称
//                    null
//            );
//        }
//
//        @Override
//        public void onVideoStart() {
//            Log.d("播放了", "播放了");
//
//        }
//
//        @Override
//        public void onChat(List<ChatMsg> arg0) {
//
//        }
//
//        @Override
//        public void onDocInfo(List<DocInfo> arg0) {
//            // TODO Auto-generated method stub
//
//        }
//
//        @Override
//        public void onCaching(boolean isCatching) {
//            WritableMap event = Arguments.createMap();
//            event.putBoolean("isCatching", isCatching);
//            ReactContext reactContext = (ReactContext) context;
//            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
//                    mGSVideoView.getId(),//native和js两个视图会依据getId()而关联在一起
//                    "seedCachState",//事件名称
//                    event
//            );
//
//
//        }
//
//        @Override
//        public void onPageSize(int position, int w, int h) {
//
//
//        }
//    };

    private String getTime(int time) {
        return String.format("%02d", time / 3600) + ":"
                + String.format("%02d", time % 3600 / 60) + ":"
                + String.format("%02d", time % 3600 % 60);
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


    @Override
    public String getName() {
        return "NativeHuoDeVodVideo";
    }

    @Override
    protected TextureView createViewInstance(ThemedReactContext reactContext) {
        if (video != null) {
            video = null;
        }
        video = new TextureView(reactContext);
        context = reactContext;

//        initPlayer();
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
                Gravity.CENTER);
//        video.setBackgroundColor(Color.GRAY);
        video.setLayoutParams(lp);
        video.setSurfaceTextureListener(this);
//        video.setAlpha(1);
        return video;
    }

    @ReactProp(name = "source")
    public void setSource(TextureView videoView, @Nullable ReadableMap params) {

        if (params != null) {
            Log.d("params参数", "params" + params);
            setParam(params);
        }
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
