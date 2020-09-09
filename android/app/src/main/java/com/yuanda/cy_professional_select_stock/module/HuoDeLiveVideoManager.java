package com.yuanda.cy_professional_select_stock.module;

import android.content.Context;
import android.graphics.Color;
import android.util.Log;
import android.view.Gravity;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.bokecc.livemodule.live.video.LiveVideoView;
import com.bokecc.sdk.mobile.live.DWLive;
import com.bokecc.sdk.mobile.live.DWLiveLoginListener;
import com.bokecc.sdk.mobile.live.Exception.DWLiveException;
import com.bokecc.sdk.mobile.live.pojo.LoginInfo;
import com.bokecc.sdk.mobile.live.pojo.PublishInfo;
import com.bokecc.sdk.mobile.live.pojo.RoomInfo;
import com.bokecc.sdk.mobile.live.pojo.TemplateInfo;
import com.bokecc.sdk.mobile.live.pojo.Viewer;
import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

import javax.annotation.Nullable;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;


/**
 * Created by wsf 2020-1-8
 *
 */
public class HuoDeLiveVideoManager extends SimpleViewManager<LiveVideoView> {

    private static final int COMMAND_SWITCH_ID = 1;
    private static final String COMMAND_SWITCH_NAME = "switch";
    private static final int COMMAND_START_ID = 2;
    private static final String COMMAND_START_NAME = "start";
    private static final int COMMAND_LEAVE_ID = 3;
    private static final String COMMAND_LEAVE_NAME = "leave";
    private static final int COMMAND_STOP_ID = 4;
    private static final String COMMAND_STOP_NAME = "stop";
    private Context context;


    // 直播视频View
    LiveVideoView mLiveVideoView;
    LoginInfo loginInfo;
    @Override
    public String getName() {
        return "NativeHuoDeLiveVideo";
    }

    public HuoDeLiveVideoManager(ReactApplicationContext reactContext){
        this.context = reactContext;
    }


    @Override
    protected LiveVideoView createViewInstance(ThemedReactContext reactContext) {
        if(mLiveVideoView != null){
            mLiveVideoView = null;
        }
        mLiveVideoView = new LiveVideoView(reactContext);
//        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
//                FrameLayout.LayoutParams.MATCH_PARENT,
//                FrameLayout.LayoutParams.MATCH_PARENT,
//                Gravity.CENTER);

        mLiveVideoView.setBackgroundColor(Color.GRAY);
//        mLiveVideoView.setLayoutParams(lp);

        context = reactContext;
        return mLiveVideoView;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                COMMAND_SWITCH_NAME,COMMAND_SWITCH_ID,
                COMMAND_START_NAME,COMMAND_START_ID,
                COMMAND_STOP_NAME,COMMAND_STOP_ID,
                COMMAND_LEAVE_NAME,COMMAND_LEAVE_ID
        );
    }

    @Override
    public void receiveCommand(LiveVideoView root, int commandId, @Nullable ReadableArray args) {
        FLog.e(VideoViewManager.class,"receiveCommand id = "+commandId);
        try {
            switch (commandId){
                case COMMAND_SWITCH_ID:
                    switchUrl();
                    break;
                case COMMAND_START_ID://开始
//                    start();
                    switchUrl();
//                    doLiveLogin();
                    break;
                case COMMAND_STOP_ID:
                    stop();
                    break;
                case COMMAND_LEAVE_ID:
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
        if(mLiveVideoView!=null)
        mLiveVideoView.start();
   }
   public void stop(){
       if(mLiveVideoView!=null)
           mLiveVideoView.stop();
    }
    public void release(){
        stop();
        if(mLiveVideoView!=null)
            mLiveVideoView.destroy();
        mLiveVideoView=null;
        FLog.e(VideoViewManager.class,"release");
    }


    /**
     * 执行直播登录操作
     */
    public  void doLiveLogin() {
        FLog.e(VideoViewManager.class,"doLiveLogin");

        // 创建登录信息


//        if (!"".equals(mGroupId.trim())) {
//            loginInfo.setGroupId(mGroupId);
//        }
        // 设置登录参数
        DWLive.getInstance().setDWLiveLoginParams(new DWLiveLoginListener() {
            @Override
            public void onLogin(TemplateInfo templateInfo, Viewer viewer, final RoomInfo roomInfo, PublishInfo publishInfo) {
                FLog.e(VideoViewManager.class,"start");
                start();
            }

            @Override
            public void onException(final DWLiveException e) {
                toastMsg( "" + e.getLocalizedMessage());
            }
        }, loginInfo);
        // 执行登录操作
        DWLive.getInstance().startLogin();
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




    @ReactProp(name = "source")
    public void setSource(LiveVideoView videoView, @Nullable ReadableMap params){

        if(params != null){
            setParam(params);
        }
    }
    public void setParam(ReadableMap params) {

        String roomId = "";
        String ccId = "";
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
        if (params.hasKey("nickName")) {
            nickName = params.getString("nickName");
        }
        if (params.hasKey("pwd")) {
            pwd = params.getString("pwd");
        }
        loginInfo = new LoginInfo();
        loginInfo.setRoomId(roomId);
        loginInfo.setUserId(ccId);
        loginInfo.setViewerName(nickName);
        loginInfo.setViewerToken(pwd);
    }


}
