package com.yuanda.cy_professional_select_stock.module;

/**
 * Created by Administrator on 2017/8/10.
 */


import androidx.annotation.Nullable;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.netease.neliveplayer.NELivePlayer;
import com.netease.neliveplayerdemo.media.NEVideoView;

import java.util.Map;

public class NEVideoViewManager extends ViewGroupManager<NEVideoView> {
    private static final int COMMAND_START_ID = 0;
    private static final String COMMAND_START_NAME = "start";
    private static final int COMMAND_PAUSE_ID = 1;
    private static final String COMMAND_PAUSE_NAME = "pause";
    private static final int COMMAND_RELEASE_ID = 2;
    private static final String COMMAND_RELEASE_NAME = "release";
    private static final int COMMAND_SWITCHURL_ID = 3;
    private static final String COMMAND_SWITCHURL_NAME = "switchUrl";
    private static final int COMMAND_GETPOSITION_ID = 4;
    private static final String COMMAND_GETPOSITION_NAME = "getPositionForRN";
    private static final int COMMAND_SEEKTO_ID = 5;
    private static final String COMMAND_SEEKTO_NAME = "seekTo";
    private NEVideoView mVideoView;
    private String playUrl;
    ReactContext context;

    @Override
    public String getName() {
        return "VideoViewPlayer";
    }

    @Override
    protected NEVideoView createViewInstance(ThemedReactContext reactContext) {
        context = reactContext;
        if(mVideoView != null){
            mVideoView.removeAllViews();
            mVideoView = null;
            mVideoView = new NEVideoView(reactContext);
        }else{
            mVideoView = new NEVideoView(reactContext);
        }

//        Log.d("播放器----初始化完成",mVideoView.toString());
//            NEMediaController mMediaController = new NEMediaController(reactContext);
//            mVideoView.setMediaController(mMediaController);
        //是否硬件解码
        mVideoView.setHardwareDecoder(false);
        //设置是否后台播放
        mVideoView.setEnableBackgroundPlay(false);
        mVideoView.requestFocus();

        return mVideoView;

    }


    /***************************供JavaScript中设置VideoView中的属性*************************************************/
    @ReactProp(name = "VideoPath")
    public void setVideoPath(NEVideoView videoView,String url){
        if(!url.isEmpty()){
//            Log.d("videoPath",""+url);
            playUrl = url.toString();
//            Log.d("播放器----设置播放地址",playUrl);
            mVideoView.getNavigationBarHeight();
            videoView.setVideoPath(playUrl);
        }

    }
    @ReactProp(name = "MediaType")
    public void setMediaType(NEVideoView videoView,String mediaType){
        videoView.setMediaType(mediaType);
        if ((mediaType).toString().equals("livestream")){
            videoView.setBufferStrategy(NELivePlayer.NELPLOWDELAY);//直播低延时
        }else{
            videoView.setBufferStrategy(NELivePlayer.NELPANTIJITTER); //点播抗抖动
        }
    }


    /***************************供JavaScript中调用native中的VideoView的方法******************************************/
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                COMMAND_START_NAME,COMMAND_START_ID,COMMAND_PAUSE_NAME,COMMAND_PAUSE_ID,
                COMMAND_RELEASE_NAME,COMMAND_RELEASE_ID,COMMAND_SWITCHURL_NAME,COMMAND_SWITCHURL_ID,
                COMMAND_GETPOSITION_NAME,COMMAND_GETPOSITION_ID,COMMAND_SEEKTO_NAME,COMMAND_SEEKTO_ID
        );
    }
    @Override
    public void receiveCommand(NEVideoView videoView, int commandId, @Nullable ReadableArray args) {
        FLog.e(NEVideoViewManager.class,"receiveCommand id = "+commandId);
        switch (commandId){
            case COMMAND_START_ID:
                if(mVideoView != null)
                mVideoView.start();
//                Log.d("播放器----播放",playUrl);
                break;
            case COMMAND_PAUSE_ID:
                if(mVideoView != null)
                mVideoView.pause();
                break;
            case COMMAND_RELEASE_ID:
                if(mVideoView != null)
                mVideoView.release();
                mVideoView=null;
                break;
            case COMMAND_SWITCHURL_ID:
                String url = null;
                if(args != null) {
                    url = args.getString(0);//获取第一个位置的数据

                }if (!url.isEmpty()){
                mVideoView.switchContentUrl(url);
            }

                break;
            case COMMAND_GETPOSITION_ID:
                if(mVideoView != null){
                    mVideoView.getCurrentPositionForRN();

                }
                break;
            case COMMAND_SEEKTO_ID:
                if(mVideoView != null){
//                    long position = Long.parseLong(args.getString(0));
                    long position = (long) (args.getInt(0));
                    if(mVideoView != null){
                        mVideoView.seekTo(position);
                    }


                }
                break;
            default:
                break;
        }
    }


    /***************************native层向JavaScript层发送事件所实现的函数******************************************/
    //第一个参数：native发送的事件名称 第二个参数中的第一个参数固定格式，第二个参数供js层调用

    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();

            builder.put( "sendStreamState", MapBuilder.of("registrationName", "getStreamState"));
            builder.put("sendCurrentPosition", MapBuilder.of("registrationName", "getCurrentPosition"));
            builder.put( "sendOverLiveEvent", MapBuilder.of("registrationName", "getOverLiveEvent"));
            builder.put( "sendPlayState", MapBuilder.of("registrationName", "getPlayState"));
            builder.put( "sendPauseState", MapBuilder.of("registrationName", "getPauseState"));
            builder.put( "sendVodOverState", MapBuilder.of("registrationName", "getVodOverState"));
            builder.put( "sendVodCurrPosition", MapBuilder.of("registrationName", "getVodCurrPosition"));
            builder.put( "buffering_start", MapBuilder.of("registrationName", "getBufferStartState"));
            builder.put( "buffering_end", MapBuilder.of("registrationName", "getBufferEndState"));
            builder.put( "sendReleaseEvent", MapBuilder.of("registrationName", "getReleaseEvent"));
            builder.put( "sendNavigatorHeight", MapBuilder.of("registrationName", "getNavigatorHeight"));

        return builder.build();
    }


}
