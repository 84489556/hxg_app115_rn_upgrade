//
//  WYPlayer.h
//  FMPlayer
//
//  Created by mac on 2018/2/27.
//  Copyright © 2018年 yuanda. All rights reserved.
//


@class WMLightView;

#import "NELivePlayer.h"
#import "NELivePlayerController.h"
#import "WYLoadingView.h"
#import "WYLoadedNoWifiView.h"
#import "WYLoadedFailView.h"

@import MediaPlayer;
@import AVFoundation;
@import UIKit;
// 播放器的几种状态
typedef NS_ENUM(NSInteger, PlayerState) {
    PlayerStateFailed,        // 播放失败
    PlayerStateBuffering,     // 缓冲中
    PlayerStatePlaying,       // 播放中
    PlayerStateStopped,        //播放停止
    PlayerStateFinished,        //播放完成
    PlayerStatePause,       // 暂停播放
};
// 枚举值，包含播放器左上角的关闭按钮的类型
typedef NS_ENUM(NSInteger, CloseBtnStyle){
    CloseBtnStylePop, //pop箭头<-
    CloseBtnStyleClose  //关闭（X）
};

//手势操作的类型
typedef NS_ENUM(NSUInteger,WMControlType) {
    progressControl,//视频进度调节操作
    voiceControl,//声音调节操作
    lightControl,//屏幕亮度调节操作
    noneControl//无任何操作
} ;

@class WYPlayer;
@protocol WYPlayerViewDelegate <NSObject>
@optional
///播放器事件
//点击播放暂停按钮代理方法
-(void)wyplayer:(WYPlayer *)vodPlayer clickedPlayOrPauseButton:(UIButton *)playOrPauseBtn;
//点击关闭按钮代理方法
-(void)wyplayer:(WYPlayer *)vodPlayer clickedCloseButton:(UIButton *)closeBtn;
//点击全屏按钮代理方法
-(void)wyplayer:(WYPlayer *)vodPlayer clickedFullScreenButton:(UIButton *)fullScreenBtn;
//单击WYPlayer的代理方法
-(void)wyplayer:(WYPlayer *)vodPlayer singleTaped:(UITapGestureRecognizer *)singleTap;
//双击WYPlayer的代理方法
-(void)wyplayer:(WYPlayer *)player doubleTaped:(UITapGestureRecognizer *)doubleTap;
//WYPlayer的的操作栏隐藏和显示
-(void)wyplayer:(WYPlayer *)player isHiddenTopAndBottomView:(BOOL )isHidden;
///播放状态
//播放失败的代理方法
-(void)wyplayerFailedPlay:(WYPlayer *)player PlayerStatus:(PlayerState)state;
//准备播放的代理方法
-(void)wyplayerReadyToPlay:(WYPlayer *)player PlayerStatus:(PlayerState)state;
//播放完毕的代理方法
-(void)wmplayerFinishedPlay:(WYPlayer *)player;

@end

/**
 *  注意⚠：本人把属性都公开到.h文件里面了，为了适配广大开发者，不同的需求可以修改属性东西，也可以直接修改源代码。
 */
@interface WYPlayer : UIView
/**
 *  播放器player
 */
@property(nonatomic,strong)id<NELivePlayer> player;

@property (nonatomic,retain) NSString *url;

//@property (nonatomic)BOOL isLive;

@property (nonatomic)BOOL hasPlayClicked;

/** 播放器的代理 */
@property (nonatomic, weak)id <WYPlayerViewDelegate> delegate;
/**
 *  底部操作工具栏
 */
@property (nonatomic,retain ) UIImageView         *bottomView;
/**
 *  顶部操作工具栏
 */
@property (nonatomic,retain ) UIImageView         *topView;
/**
 *  是否使用手势控制音量
 */
@property (nonatomic,assign) BOOL  enableVolumeGesture;

/**
 *  显示播放视频的title
 */
@property (nonatomic,strong) UILabel        *titleLabel;
/**
 ＊  播放器状态
 */
@property (nonatomic, assign) PlayerState   state;
/**
 ＊  播放器左上角按钮的类型
 */
@property (nonatomic, assign) CloseBtnStyle   closeBtnStyle;
/**
 *  定时器
 */
@property (nonatomic, retain) NSTimer        *autoDismissTimer;
@property (nonatomic, retain) NSTimer        *durationTimer;
/**
 *  BOOL值判断当前的状态
 */
@property (nonatomic,assign ) BOOL            isFullscreen;
/**
 *  BOOL值判断是否直接进行播放
 */
@property (nonatomic,assign)BOOL isPlaying;
/**
 *  控制全屏的按钮
 */
@property (nonatomic,retain ) UIButton       *fullScreenBtn;
/**
 *  播放暂停按钮
 */
@property (nonatomic,retain ) UIButton       *playOrPauseBtn;
/**
 *  左上角关闭按钮
 */
@property (nonatomic,retain ) UIButton       *closeBtn;
/**
 *  显示加载失败的UILabel
 */

@property (nonatomic,strong) WYLoadedFailView  *loadFailedView;
@property (nonatomic,strong) WYLoadedNoWifiView * noWifiView;


/**
 *  Player内部一个UIView，所有的控件统一管理在此view中
 */
@property (nonatomic,strong) UIView        *contentView;

/**
 *  菊花（加载框）
 */
@property (nonatomic,strong) WYLoadingView *loadingView;

/**
 *  大的播放按钮（加载框）
 */
@property (nonatomic,strong) UIView *ScreenView;
@property (nonatomic,strong) UIImageView *backView;
@property (nonatomic,strong) UIButton *PlayBtn;


/**
 *  跳到time处播放
 *  seekTime这个时刻，这个时间点
 */
@property (nonatomic, assign) double  seekTime;

/** 播放前占位图片，不设置就显示默认占位图（需要在设置视频URL之前设置） */
@property (nonatomic, copy  ) UIImage              *placeholderImage ;
/** 播放的信息 */
@property (nonatomic,strong) NSDictionary *dataSource;

///---------------------------------------------------
//初始化播放器
-(void)initPlayerWithRect:(CGRect)rect;

-(void)initView:(BOOL) isChange;

-(void)updateVideoView;
    
-(void)showNoWifiView:(NSString *)status;


/**
 *  播放
 */
- (void)play;

/**
 * 暂停
 */
- (void)pause;

/**
 *  获取正在播放的时间点
 *
 *  @return double的一个时间点
 */
//- (double)currentTime;

/**
 * 重置播放器
 */
- (void )resetPlayer;


@end
