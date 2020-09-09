package com.netease.neliveplayerdemo.activity;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ImageButton;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.netease.neliveplayer.NELivePlayer;
import com.netease.neliveplayerdemo.R;
import com.netease.neliveplayerdemo.media.NEMediaController;
import com.netease.neliveplayerdemo.media.NEMediaController.OnHiddenListener;
import com.netease.neliveplayerdemo.media.NEMediaController.OnShownListener;
import com.netease.neliveplayerdemo.media.NEVideoView;

import java.util.List;

public class NEVideoPlayerActivity extends Activity {
	public final static String TAG = NEVideoPlayerActivity.class.getSimpleName();
	public NEVideoView mVideoView;  //用于画面显示
	private View mBuffer; //用于指示缓冲状态
	private NEMediaController mMediaController; //用于控制播放

	public static final int NELP_LOG_UNKNOWN = 0; //!< log输出模式：输出详细
	public static final int NELP_LOG_DEFAULT = 1; //!< log输出模式：输出详细
	public static final int NELP_LOG_VERBOSE = 2; //!< log输出模式：输出详细
	public static final int NELP_LOG_DEBUG   = 3; //!< log输出模式：输出调试信息
	public static final int NELP_LOG_INFO    = 4; //!< log输出模式：输出标准信息
	public static final int NELP_LOG_WARN    = 5; //!< log输出模式：输出警告
	public static final int NELP_LOG_ERROR   = 6; //!< log输出模式：输出错误
	public static final int NELP_LOG_FATAL   = 7; //!< log输出模式：一些错误信息，如头文件找不到，非法参数使用
	public static final int NELP_LOG_SILENT  = 8; //!< log输出模式：不输出

	private int mLogLevel = NELP_LOG_VERBOSE;

	private String mVideoPath; //文件路径
	private String mDecodeType;//解码类型，硬解或软解
	private String mMediaType; //媒体类型
	private boolean mHardware = true;
	private ImageButton mPlayBack;
	private TextView mFileName; //文件名称
	private String mTitle;
	private Uri mUri;
	private boolean mEnableBackgroundPlay = true;
	private boolean mBackPressed;

	private RelativeLayout mPlayToolbar;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		Log.i(TAG, "on create");
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_player);

		//接收MainActivity传过来的参数
		mMediaType   = getIntent().getStringExtra("media_type");
		mDecodeType = getIntent().getStringExtra("decode_type");
		mVideoPath  = getIntent().getStringExtra("videoPath");

		Log.i(TAG, "playType = " + mMediaType);
		Log.i(TAG, "decodeType = " + mDecodeType);
		Log.i(TAG, "videoPath = " + mVideoPath);

		if (mMediaType.equals("localaudio")) { //本地音频文件采用软件解码
			mDecodeType = "software";
		}

		Intent intent = getIntent();
		String intentAction = intent.getAction();
		if (!TextUtils.isEmpty(intentAction) && intentAction.equals(Intent.ACTION_VIEW)) {
			mVideoPath = intent.getDataString();
			Log.i(TAG, "videoPath = "+ mVideoPath);
		}

		if (mDecodeType.equals("hardware")) {
			mHardware = true;
		}
		else if (mDecodeType.equals("software")) {
			mHardware = false;
		}

		mPlayBack = (ImageButton)findViewById(R.id.player_exit);//退出播放
		mPlayBack.getBackground().setAlpha(0);
		mFileName = (TextView)findViewById(R.id.file_name);

		mUri = Uri.parse(mVideoPath);
		if (mUri != null) { //获取文件名，不包括地址
			List<String> paths = mUri.getPathSegments();
			String name = paths == null || paths.isEmpty() ? "null" : paths.get(paths.size() - 1);
			setFileName(name);
		}

		mPlayToolbar = (RelativeLayout)findViewById(R.id.play_toolbar);
		mPlayToolbar.setVisibility(View.INVISIBLE);

		mBuffer = findViewById(R.id.buffering_prompt);
		mMediaController = new NEMediaController(this);

		mVideoView = (NEVideoView) findViewById(R.id.video_view);

		if (mMediaType.equals("livestream")) {
			mVideoView.setBufferStrategy(NELivePlayer.NELPLOWDELAY); //直播低延时
		}
		else {
			mVideoView.setBufferStrategy(NELivePlayer.NELPANTIJITTER); //点播抗抖动
		}
		mVideoView.setMediaController(mMediaController);
		mVideoView.setBufferingIndicator(mBuffer);
		mVideoView.setMediaType(mMediaType);
		mVideoView.setHardwareDecoder(mHardware);
		mVideoView.setEnableBackgroundPlay(mEnableBackgroundPlay);
		mVideoView.setVideoPath(mVideoPath);
		mVideoView.setLogLevel(mLogLevel); //设置log级别
		mVideoView.requestFocus();
		mVideoView.start();

		mPlayBack.setOnClickListener(mOnClickEvent); //监听退出播放的事件响应
		mMediaController.setOnShownListener(mOnShowListener); //监听mediacontroller是否显示
		mMediaController.setOnHiddenListener(mOnHiddenListener); //监听mediacontroller是否隐藏
	}

	OnClickListener mOnClickEvent = new OnClickListener() {
		@Override
		public void onClick(View v) {
			if (v.getId() == R.id.player_exit) {
				Log.i(TAG, "player_exit");
				mBackPressed = true;
				finish();
			}
		}
	};

	OnShownListener mOnShowListener = new OnShownListener() {

		@Override
		public void onShown() {
			mPlayToolbar.setVisibility(View.VISIBLE);
			mPlayToolbar.requestLayout();
			mVideoView.invalidate();
			mPlayToolbar.postInvalidate();
		}
	};

	OnHiddenListener mOnHiddenListener = new OnHiddenListener() {

		@Override
		public void onHidden() {
			mPlayToolbar.setVisibility(View.INVISIBLE);
		}
	};

	public void setFileName(String name) { //设置文件名并显示出来
		mTitle = name;
		if (mFileName != null) {
			mFileName.setText(mTitle);
			mFileName.setGravity(Gravity.CENTER);
		}
	}

	@Override
	public void onBackPressed() {
		Log.i(TAG, "onBackPressed");
		mBackPressed = true;
		finish();

		super.onBackPressed();
	}

	@Override
	protected void onStop() {
		Log.i(TAG, "NEVideoPlayerActivity onStop");
		super.onStop();

		if (!mBackPressed) {
			if (!mVideoView.isBackgroundPlayEnabled()) {
				mVideoView.stopBackgroundPlay();
			} else {
				mVideoView.enterBackground();
			}
		}
	}

	@Override
	protected void onPause() {
		Log.i(TAG, "NEVideoPlayerActivity onPause");

		super.onPause();
	}

	@Override
	public void onDestroy() {
		Log.i(TAG, "NEVideoPlayerActivity onDestroy");
		NEMediaController.mWindow.dismiss();
		mVideoView.release();
		super.onDestroy();
	}

	@Override
	protected void onStart() {
		Log.i(TAG, "NEVideoPlayerActivity onStart");
		super.onStart();
	}

	@Override
	protected void onResume() {
		Log.i(TAG, "NEVideoPlayerActivity onResume");
		if (mHardware) {
			mVideoView.setVideoPath(mVideoPath);
		}
		else if (!mEnableBackgroundPlay && !mVideoView.isPaused()) {
			mVideoView.start(); //锁屏打开后恢复播放
		}

		super.onResume();
	}

	@Override
	protected void onRestart() {
		Log.i(TAG, "NEVideoPlayerActivity onRestart");
		super.onRestart();
	}
}