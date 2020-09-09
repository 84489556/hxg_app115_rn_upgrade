//
//  RCTHuodePlaybackView.m
//  RCTHuodePlayer
//
//  Created by dxd on 2020/1/22.
//  Copyright © 2020 dxd. All rights reserved.
//

#import "RCTHuodePlaybackView.h"
//#import <CCSDK/RequestData.h>
#import <CCSDK/RequestDataPlayBack.h>
#import "CCPlayBackView.h"//视频
#import "CCProxy.h"
//#import "CCPlayerView.h"


@interface RCTHuodePlaybackView ()<RequestDataPlayBackDelegate,CCPlayBackViewDelegate>

@property (nonatomic,strong)CCPlayBackView             * playerView;//视频视图
//@property (nonatomic,strong)RequestData              * requestData;//sdk
@property (nonatomic,strong)RequestDataPlayBack         * requestDataPlayBack;//sdk

@property (nonatomic,assign)NSInteger                firRoadNum;//房间线路
@property (nonatomic,strong)NSMutableArray           * secRoadKeyArray;//清晰度数组
@property (nonatomic,assign)BOOL                     firstUnStart;//第一次进入未开始直播
@property (nonatomic,assign)BOOL                      isSeeking;//是否在拖动时间

@end

@implementation RCTHuodePlaybackView

- (void)setDataSource:(NSDictionary *)dataSource {
    _dataSource = dataSource;

}
- (NSDictionary*)getDataSource{

    return _dataSource;
}

- (instancetype)init {
    self = [super init];
    if (self) {
//        [self setupUI];//创建UI
    }
    return self;
}

//移除通知
- (void)dealloc {
//    NSLog(@"%s", __func__);
    /*      自动登录情况下，会存在移除控制器但是SDK没有销毁的情况 */
    if (_requestDataPlayBack) {
        [_requestDataPlayBack requestCancel];
        _requestDataPlayBack = nil;
    }
    [_playerView stopTimer];
    self.playerView = nil;
    [self removeObserver];
//    [self.interactionView removeData];
}

/**
 创建UI
 */
- (void)setupUI {
    //视频视图
    [self addSubview:self.playerView];
}

#pragma mark - PlayerView
- (void)play {
    self.isSeeking = NO;
    [self setupUI];
    [self addObserver];//添加通知
    [self integrationSDK];//集成SDK
    [self.requestDataPlayBack startPlayer];
    [_playerView startTimer];
}

- (void)stop {
    WS(weakSelf)
    if (weakSelf.requestDataPlayBack) {
        [weakSelf.requestDataPlayBack requestCancel];
        weakSelf.requestDataPlayBack = nil;
    }
    if (_playerView) {
        [_playerView stopTimer];
        [_playerView removeFromSuperview];
        _playerView = nil;
    }
    [self removeObserver];
}
- (void)pause {
    [self.requestDataPlayBack pausePlayer];
}
- (void)resume {
    self.isSeeking = NO;
    [self.requestDataPlayBack startPlayer];
}
- (void)landspace {
//    [_playerView turnPortrait];
    CGRect react = CGRectMake(0, 0, SCREEN_WIDTH, SCREENH_HEIGHT);
    [self resetPlayer:react];
}

- (void)portiort {
//    [_playerView  turnRight];
    CGRect react = CGRectMake(0, 0, SCREEN_WIDTH, 211);
    [self resetPlayer:react];
}
- (void)resetPlayer:(CGRect)react {
    _playerView.frame = react;
    [_requestDataPlayBack changePlayerParent:self.playerView];
    [_requestDataPlayBack changePlayerFrame:react];
}

#pragma mark - 懒加载
//playView
-(CCPlayBackView *)playerView{
    if (!_playerView) {
        //视频视图
        _playerView = [[CCPlayBackView alloc] initWithFrame:CGRectMake(0, 0, SCREEN_WIDTH, 211) docViewType:NO];//CCGetRealFromPt(462)
        _playerView.delegate = self;//CCPlayBackViewDelegate
//        WS(weakSelf)
//        //切换线路
//        _playerView.selectedRod = ^(NSInteger selectedRod) {
//            [weakSelf selectedRodWidthIndex:selectedRod];
//        };
//        //切换清晰度
//        _playerView.selectedIndex = ^(NSInteger selectedRod,NSInteger selectedIndex) {
//            [weakSelf selectedRodWidthIndex:selectedRod secIndex:selectedIndex];
//        };
//        //发送聊天
//        _playerView.sendChatMessage = ^(NSString * sendChatMessage) {
//            [weakSelf sendChatMessageWithStr:sendChatMessage];
//        };
        
    }
    return _playerView;
}

/**
 集成sdk
 */
- (void)integrationSDK {
    if (_requestDataPlayBack) {
        [_requestDataPlayBack requestCancel];
        _requestDataPlayBack = nil;
    }
    PlayParameter *parameter = [[PlayParameter alloc] init];
    parameter.userId = self.dataSource[@"userID"];//GetFromUserDefaults(WATCH_USERID);
    parameter.roomId = self.dataSource[@"roomID"];//GetFromUserDefaults(WATCH_ROOMID);
    parameter.liveId = self.dataSource[@"liveID"];
    parameter.recordId = self.dataSource[@"recordID"];//@"ECF4B661CFA4A7ED";
    parameter.viewerName = self.dataSource[@"nickname"];//GetFromUserDefaults(WATCH_USERNAME);//用户名
    parameter.token = @"";//GetFromUserDefaults(WATCH_PASSWORD);//密码
    parameter.docParent = self.playerView;
    parameter.docFrame = CGRectZero;
    parameter.playerParent = self.playerView;//视频视图
    parameter.playerFrame = CGRectMake(0,0,self.playerView.frame.size.width, self.playerView.frame.size.height);//视频位置,ps:起始位置为视频视图坐标
    parameter.security = YES;//是否开启https,建议开启
    parameter.scalingMode = 1;//屏幕适配方式
    parameter.pauseInBackGround = NO;//后台是否暂停
    parameter.viewerCustomua = @"viewercustomua";//自定义参数,没有的话这么写就可以
    self.requestDataPlayBack = [[RequestDataPlayBack alloc] initWithParameter:parameter];
    self.requestDataPlayBack.delegate = self;
}
#pragma mark - 添加通知
//通知监听
-(void)addObserver {
//    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appWillEnterBackgroundNotification) name:UIApplicationDidEnterBackgroundNotification object:nil];
//    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(appWillEnterForegroundNotification) name:UIApplicationWillEnterForegroundNotification object:nil];
//    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(moviePlayBackStateDidChange:) name:IJKMPMoviePlayerPlaybackStateDidChangeNotification object:nil];
//    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(movieLoadStateDidChange:) name:IJKMPMoviePlayerLoadStateDidChangeNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(moviePlayerPlaybackDidFinish:) name:IJKMPMoviePlayerPlaybackDidFinishNotification object:nil];
//    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidBecomeActiveNotification) name:UIApplicationDidBecomeActiveNotification object:nil];
}

//移除通知
-(void) removeObserver {
//    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidEnterBackgroundNotification object:nil];
//    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
//    [[NSNotificationCenter defaultCenter]removeObserver:self name:IJKMPMoviePlayerPlaybackStateDidChangeNotification object:nil];
//    [[NSNotificationCenter defaultCenter]removeObserver:self name:IJKMPMoviePlayerLoadStateDidChangeNotification object:nil];
    [[NSNotificationCenter defaultCenter]removeObserver:self name:IJKMPMoviePlayerPlaybackDidFinishNotification object:nil];
//    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidBecomeActiveNotification object:nil];
}

#pragma mark - 私有方法
/**
 发送聊天

 @param str 聊天内容
 */
//- (void)sendChatMessageWithStr:(NSString *)str {
//    [_requestData chatMessage:str];
//}
/**
 切换线路

 @param rodIndex 线路
 */
//- (void)selectedRodWidthIndex:(NSInteger)rodIndex {
//    if(rodIndex > self.firRoadNum) {
//        [_requestData switchToPlayUrlWithFirIndex:0 key:@""];
//    } else {
//        [_requestData switchToPlayUrlWithFirIndex:rodIndex - 1 key:[self.secRoadKeyArray firstObject]];
//    }
//}
/**
 切换清晰度

 @param rodIndex 线路
 @param secIndex 清晰度
 */
//- (void)selectedRodWidthIndex:(NSInteger)rodIndex secIndex:(NSInteger)secIndex {
//    [_requestData switchToPlayUrlWithFirIndex:rodIndex - 1 key:[_secRoadKeyArray objectAtIndex:secIndex]];
//}
/**
 旋转方向

 @return 是否允许转屏
 */
//- (BOOL)shouldAutorotate {
//    if (self.isScreenLandScape == YES) {
//        return YES;
//    }
//    return NO;
//}
//- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation {
//    return UIInterfaceOrientationPortrait;
//}
//
//- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
//    return UIInterfaceOrientationMaskAllButUpsideDown;
//}
///**
// 强制转屏
//
// @param orientation 旋转方向
// */
//- (void)interfaceOrientation:(UIInterfaceOrientation)orientation{
//    if ([[UIDevice currentDevice] respondsToSelector:@selector(setOrientation:)]) {
//        SEL selector  = NSSelectorFromString(@"setOrientation:");
//        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:[UIDevice instanceMethodSignatureForSelector:selector]];
//        [invocation setSelector:selector];
//        [invocation setTarget:[UIDevice currentDevice]];
//        int val = (int)orientation;
//        // 从2开始是因为0 1 两个参数已经被selector和target占用
//        [invocation setArgument:&val atIndex:2];
//        [invocation invoke];
//    }
//}
/**
 退出直播
 */
//-(void)exitPlayLive{
//    [self.requestData requestCancel];
//    self.requestData = nil;
////    [self.playerView removeFromSuperview];
//}

#pragma mark- SDK 必须实现的代理方法

/**
 *    @brief    请求成功
 */
-(void)requestSucceed {
//    CCProxy *weakObject = [CCProxy proxyWithWeakObject:self];
//    _userCountTimer = [NSTimer scheduledTimerWithTimeInterval:15.0f target:weakObject selector:@selector(timerfunc) userInfo:nil repeats:YES];
   
}
/**
 *    @brief    登录请求失败
 */
-(void)requestFailed:(NSError *)error reason:(NSString *)reason {
    NSString *message = nil;
    if (reason == nil) {
        message = [error localizedDescription];
        
    } else {
        message = reason;
    }
    
    UILabel * tipLabel = [[UILabel alloc]initWithFrame:CGRectMake(0, 0, 300, 50)];
    tipLabel.center = self.center;
    tipLabel.textAlignment = NSTextAlignmentCenter;
    tipLabel.numberOfLines = 2;
    tipLabel.textColor = [UIColor whiteColor];
    tipLabel.font = [UIFont systemFontOfSize:12];
    tipLabel.text = message;
    [self addSubview:tipLabel];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [tipLabel removeFromSuperview];
    });
}

#pragma mark- 房间信息
/**
 *    @brief  获取房间信息，主要是要获取直播间模版来类型，根据直播间模版类型来确定界面布局
 *    房间简介：dic[@"desc"];
 *    房间名称：dic[@"name"];
 *    房间模版类型：[dic[@"templateType"] integerValue];
 *    模版类型为1: 聊天互动： 无 直播文档： 无 直播问答： 无
 *    模版类型为2: 聊天互动： 有 直播文档： 无 直播问答： 有
 *    模版类型为3: 聊天互动： 有 直播文档： 无 直播问答： 无
 *    模版类型为4: 聊天互动： 有 直播文档： 有 直播问答： 无
 *    模版类型为5: 聊天互动： 有 直播文档： 有 直播问答： 有
 *    模版类型为6: 聊天互动： 无 直播文档： 无 直播问答： 有
 */
-(void)roomInfo:(NSDictionary *)dic {
//    _playerView.templateType = 1;
}
#pragma mark- 获取直播开始时间和直播时长
/**
 *  @brief  获取直播开始时间和直播时长
 *  liveDuration 直播持续时间，单位（s），直播未开始返回-1"
 *  liveStartTime 新增开始直播时间（格式：yyyy-MM-dd HH:mm:ss），如果直播未开始，则返回空字符串
 */
- (void)startTimeAndDurationLiveBroadcast:(NSDictionary *)dataDic {
    SaveToUserDefaults(LIVE_STARTTIME, dataDic[@"liveStartTime"]);
    //当第一次进入时为未开始状态,设置此属性,在直播开始时给startTime赋值
    if ([dataDic[@"liveStartTime"] isEqualToString:@""] && !self.firstUnStart) {
        self.firstUnStart = YES;
    }
}

#pragma mark - 服务器端给自己设置的信息
/**
 *    @brief    服务器端给自己设置的信息(The new method)
 *    viewerId 服务器端给自己设置的UserId
 *    groupId 分组id
 *    name 用户名
 */
-(void)setMyViewerInfo:(NSDictionary *) infoDic{
}

#pragma mark- 视频线路和清晰度
/*
 *  @brief 切换源，firRoadNum表示一共有几个源，secRoadKeyArray表示每
 *  个源的描述数组
 */
//- (void)firRoad:(NSInteger)firRoadNum secRoadKeyArray:(NSArray *)secRoadKeyArray {
//    _secRoadKeyArray = [secRoadKeyArray mutableCopy];
//    _firRoadNum = firRoadNum;
//    [self.playerView SelectLinesWithFirRoad:_firRoadNum secRoadKeyArray:_secRoadKeyArray];
//
//}
#pragma mark- 直播未开始和开始
/**
 *    @brief  收到播放直播状态 0直播 1未直播
 */
//- (void)getPlayStatue:(NSInteger)status {
//    [_playerView getPlayStatue:status];
//    if (status == 0 && self.firstUnStart) {
//        NSDate *date = [NSDate date];// 获得时间对象
//        NSDateFormatter *forMatter = [[NSDateFormatter alloc] init];
//        [forMatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
//        NSString *dateStr = [forMatter stringFromDate:date];
//        SaveToUserDefaults(LIVE_STARTTIME, dateStr);
//
//    }
//}
/**
 *    @brief  主讲开始推流
 */
//- (void)onLiveStatusChangeStart {
////    [_playerView onLiveStatusChangeStart];
////    dispatch_async(dispatch_get_main_queue(), ^{
////        [self.playerView addSmallView];
////    });
//}
/**
 *    @brief  停止直播，endNormal表示是否停止推流
 */
//- (void)onLiveStatusChangeEnd:(BOOL)endNormal {
////    if (self.punchView) {
////        [self removePunchView];
////    }
////    [_playerView onLiveStatusChangeEnd:endNormal];
//}
#pragma mark- 加载视频失败
/**
 *  @brief  加载视频失败
 */
- (void)playback_loadVideoFail {
//    [_playerView play_loadVideoFail];
}

#pragma mark - login
-(void)loginSucceedPlay {
}
-(void)loginFailed:(NSError *)error reason:(NSString *)reason {
    NSString *message = nil;
    if (reason == nil) {
        message = [error localizedDescription];
    } else {
        message = reason;
    }
}

//监听播放状态
-(void)movieLoadStateDidChange:(NSNotification*)notification
{
//    NSLog(@"当前状态是%lu",(unsigned long)_requestDataPlayBack.ijkPlayer.loadState);
//    if (_requestDataPlayBack.ijkPlayer.loadState == 4) {
//        [self.playerView showLoadingView];
//    } else if (_requestDataPlayBack.ijkPlayer.loadState == 3) {
//        [self.playerView removeLoadingView];
//    }
    NSLog(@"当前状态啊啊啊啊啊%ld",(long)_requestDataPlayBack.ijkPlayer.playbackState);

    switch (_requestDataPlayBack.ijkPlayer.loadState)
    {
            
        case IJKMPMovieLoadStateStalled:
//            NSLog(@"当前状态是a%lu",(unsigned long)_requestDataPlayBack.ijkPlayer.loadState);
//            NSLog(@"数据缓冲已经停止状态");
            break;
        case IJKMPMovieLoadStatePlayable:
//            NSLog(@"当前状态是b%lu",(unsigned long)_requestDataPlayBack.ijkPlayer.loadState);
//            NSLog(@"数据缓冲到足够开始播放状态");
            break;
        case IJKMPMovieLoadStatePlaythroughOK:
//            NSLog(@"当前状态是c%lu",(unsigned long)_requestDataPlayBack.ijkPlayer.loadState);
//            NSLog(@"缓冲完成状态");
            break;
            //IJKMPMovieLoadStateUnknown
        case IJKMPMovieLoadStateUnknown:
//            NSLog(@"当前状态是d%lu",(unsigned long)_requestDataPlayBack.ijkPlayer.loadState);
//            NSLog(@"数据缓冲变成了未知状态");
            break;
        default:
            break;
    }
//    IJKMPMovieLoadState loadState = _requestDataPlayBack.ijkPlayer.loadState;
//
//        if ((loadState & IJKMPMovieLoadStatePlaythroughOK) != 0) {  // 缓冲缓冲结束
//            NSLog(@"对啊缓冲结束");
//        } else if ((loadState & IJKMPMovieLoadStateStalled) != 0) {    // 开始缓冲
//            NSLog(@"对啊开始缓冲");
//        }
}

- (void)moviePlayerPlaybackDidFinish:(NSNotification*)notification {
//    NSLog(@"播放完成");
    self.isSeeking = YES;
    [[NSNotificationCenter defaultCenter] postNotificationName:@"onStop" object:nil userInfo:nil];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"onPosition" object:nil userInfo:@{@"position":[NSNumber numberWithInt:0]}];
}
//回放速率改变
//- (void)moviePlayBackStateDidChange:(NSNotification*)notification
//{
////    NSLog(@"当前状态%ld",(long)_requestDataPlayBack.ijkPlayer.playbackState);
//
//    switch (_requestDataPlayBack.ijkPlayer.playbackState)
//    {
//        case IJKMPMoviePlaybackStateStopped: {
//            break;
//        }
//        case IJKMPMoviePlaybackStatePlaying:
//        case IJKMPMoviePlaybackStatePaused: {
//
//            if(self.playerView.pauseButton.selected == YES && [_requestDataPlayBack isPlaying]) {
//                [_requestDataPlayBack pausePlayer];
//            }
//            if(self.playerView.loadingView && ![self.playerView.timer isValid]) {
////            if(![self.playerView.timer isValid]) {
//
////                NSLog(@"__test 重新开始播放视频, slider.value = %f", _playerView.slider.value);
////#ifdef LockView
//                if (_pauseInBackGround == NO) {//后台支持播放
//                    [self setLockView];//设置锁屏界面
//                }
////#endif
//                [self.playerView removeLoadingView];//移除加载视图
//
//
//                /* 当视频被打断时，重新开启视频需要校对时间 */
//                if (_playerView.slider.value != 0) {
//                    _requestDataPlayBack.currentPlaybackTime = _playerView.slider.value;
//                    //开启playerView的定时器,在timerfunc中去校对SDK中播放器相关数据
//                    [self.playerView startTimer];
//                    return;
//                }
//
//
//                /*   从0秒开始加载文档  */
//                [_requestDataPlayBack continueFromTheTime:0];
//                /*   Ps:从100秒开始加载视频  */
////                [_requestDataPlayBack continueFromTheTime:100];
////                _requestDataPlayBack.currentPlaybackTime = 100;
//                /*
//                 //重新播放
//                 [self.requestDataPlayBack replayPlayer];
//                 self.requestDataPlayBack.currentPlaybackTime = 0;
//                 self.playerView.sliderValue = 0;
//                 */
//                //开启playerView的定时器,在timerfunc中去校对SDK中播放器相关数据
//                [self.playerView startTimer];
//            }
//            break;
//        }
//        case IJKMPMoviePlaybackStateInterrupted: {
////            NSLog(@"播放中断");
//            break;
//        }
//        case IJKMPMoviePlaybackStateSeekingForward:
//        case IJKMPMoviePlaybackStateSeekingBackward: {
//            break;
//        }
//        default: {
//            break;
//        }
//    }
//}

- (void)timerfunc {
    if (self.isSeeking) {
        return;
    }
    //获取当前播放时间和视频总时长
    NSTimeInterval position = (int)floor(self.requestDataPlayBack.currentPlaybackTime)*1000;
    NSTimeInterval duration = (int)floor(self.requestDataPlayBack.playerDuration)*1000;
    if (position<=duration) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"onPosition" object:nil userInfo:@{@"position":[NSNumber numberWithInt:position]}];
        [[NSNotificationCenter defaultCenter] postNotificationName:@"initEvent" object:nil userInfo:@{@"duration":[NSNumber numberWithInt:duration]}];
    }
}

- (int)seekTo:(int)position {
    self.isSeeking = YES;
    _requestDataPlayBack.currentPlaybackTime=position/1000;
    self.isSeeking = NO;
    return position;
}

@end
