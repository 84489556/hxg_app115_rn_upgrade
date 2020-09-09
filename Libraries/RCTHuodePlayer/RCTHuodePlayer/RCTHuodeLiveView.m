//
//  RCTHuodeLiveView.m
//  RCTHuodePlayer
//
//  Created by dxd on 2020/1/14.
//  Copyright © 2020 dxd. All rights reserved.
//

#import "RCTHuodeLiveView.h"
#import <CCSDK/RequestData.h>//SDK
#import "CCPlayerView.h"//视频
#import "CCProxy.h"

#import "CCPlayerView.h"

@interface RCTHuodeLiveView ()<RequestDataDelegate>

@property (nonatomic,strong)CCPlayerView             * playerView;//视频视图
@property (nonatomic,strong)RequestData              * requestData;//sdk
@property (nonatomic,assign)NSInteger                firRoadNum;//房间线路
@property (nonatomic,strong)NSMutableArray           * secRoadKeyArray;//清晰度数组
@property (nonatomic,assign)BOOL                     firstUnStart;//第一次进入未开始直播

@end

@implementation RCTHuodeLiveView

- (void)setDataSource:(NSDictionary *)dataSource {
    _dataSource = dataSource;
}

- (instancetype)init {
    self = [super init];
    if (self) {
    }
    return self;
}

- (void)dealloc {
    [self exitPlayLive];
    self.playerView = nil;
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
    [self setupUI];//创建UI
    [self integrationSDK];//集成SDK
//     [self onLiveStatusChangeStart];
//    [self.requestData startPlayer];
//    [_requestData switchToPlayUrlWithFirIndex:0 key:@""];
}

- (void)stop {
    [self exitPlayLive];
}
- (void)pause {
    [self.requestData pausePlayer];
//    if (_requestData.ijkPlayer.playbackState == IJKMPMoviePlaybackStatePaused) {
//        [_requestData.ijkPlayer play];
//    }
}
- (void)resume {
    [self.requestData startPlayer];
//    [self integrationSDK];//集成SDK
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
    [_requestData changePlayerParent:self.playerView];
    [_requestData changePlayerFrame:react];
}


#pragma mark - 懒加载
//playView
-(CCPlayerView *)playerView{
    if (!_playerView) {
        //视频视图
        _playerView = [[CCPlayerView alloc] initWithFrame:CGRectMake(0, 0, SCREEN_WIDTH, 211) docViewType:NO];//CCGetRealFromPt(462)
//        _playerView.delegate = self;
        WS(weakSelf)
        //切换线路
        _playerView.selectedRod = ^(NSInteger selectedRod) {
            [weakSelf selectedRodWidthIndex:selectedRod];
        };
        //切换清晰度
        _playerView.selectedIndex = ^(NSInteger selectedRod,NSInteger selectedIndex) {
            [weakSelf selectedRodWidthIndex:selectedRod secIndex:selectedIndex];
        };
    }
    return _playerView;
}

/**
 集成sdk
 */
- (void)integrationSDK {
    if (_requestData) {
        [_requestData requestCancel];
        _requestData = nil;
    }
    PlayParameter *parameter = [[PlayParameter alloc] init];
    parameter.userId = self.dataSource[@"userID"]; //GetFromUserDefaults(WATCH_USERID);
    parameter.roomId = self.dataSource[@"roomID"]; //GetFromUserDefaults(WATCH_ROOMID);
    parameter.viewerName = self.dataSource[@"nickname"]; //GetFromUserDefaults(WATCH_USERNAME);//用户名
    parameter.token = @""; //GetFromUserDefaults(WATCH_PASSWORD);//密码
    parameter.docParent = self.playerView;
    parameter.docFrame = CGRectZero;
    parameter.playerParent = self.playerView;//视频视图
    parameter.playerFrame = CGRectMake(0,0,self.playerView.frame.size.width, self.playerView.frame.size.height);//视频位置,ps:起始位置为视频视图坐标
    parameter.security = YES;//是否开启https,建议开启
    parameter.scalingMode = 1;//屏幕适配方式
    parameter.pauseInBackGround = YES;//后台是否暂停
    parameter.viewerCustomua = @"viewercustomua";//自定义参数,没有的话这么写就可以
//    RequestData *requestData2 = [[RequestData alloc] initLoginWithParameter:parameter];
//    requestData2.delegate = self;
    _requestData = [[RequestData alloc] initWithParameter:parameter];// initLoginWithParameter
    _requestData.delegate = self;
}

#pragma mark - 私有方法
/**
 切换线路

 @param rodIndex 线路
 */
- (void)selectedRodWidthIndex:(NSInteger)rodIndex {
    if(rodIndex > self.firRoadNum) {
        [_requestData switchToPlayUrlWithFirIndex:0 key:@""];
    } else {
        [_requestData switchToPlayUrlWithFirIndex:rodIndex - 1 key:[self.secRoadKeyArray firstObject]];
    }
}
/**
 切换清晰度

 @param rodIndex 线路
 @param secIndex 清晰度
 */
- (void)selectedRodWidthIndex:(NSInteger)rodIndex secIndex:(NSInteger)secIndex {
    [_requestData switchToPlayUrlWithFirIndex:rodIndex - 1 key:[_secRoadKeyArray objectAtIndex:secIndex]];
}
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
-(void)exitPlayLive{
    if (self.requestData) {
        [self.requestData requestCancel];
        self.requestData = nil;
    }
    if (_playerView) {
        [_playerView removeFromSuperview];
    }
}

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
    // 添加提示窗,提示message
//    [self addBanAlertView:message];
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
    _playerView.templateType = 1;
}
#pragma mark- 获取直播开始时间和直播时长
/**
 *  @brief  获取直播开始时间和直播时长
 *  liveDuration 直播持续时间，单位（s），直播未开始返回-1"
 *  liveStartTime 新增开始直播时间（格式：yyyy-MM-dd HH:mm:ss），如果直播未开始，则返回空字符串
 */
- (void)startTimeAndDurationLiveBroadcast:(NSDictionary *)dataDic {
//    SaveToUserDefaults(LIVE_STARTTIME, dataDic[@"liveStartTime"]);
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
- (void)firRoad:(NSInteger)firRoadNum secRoadKeyArray:(NSArray *)secRoadKeyArray {
    _secRoadKeyArray = [secRoadKeyArray mutableCopy];
    _firRoadNum = firRoadNum;
    [self.playerView SelectLinesWithFirRoad:_firRoadNum secRoadKeyArray:_secRoadKeyArray];

}
#pragma mark- 直播未开始和开始
/**
 *    @brief  收到播放直播状态 0直播 1未直播
 */
- (void)getPlayStatue:(NSInteger)status {
    [_playerView getPlayStatue:status];
    if (status == 0 && self.firstUnStart) {
//        NSDate *date = [NSDate date];// 获得时间对象
//        NSDateFormatter *forMatter = [[NSDateFormatter alloc] init];
//        [forMatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
//        NSString *dateStr = [forMatter stringFromDate:date];
//        SaveToUserDefaults(LIVE_STARTTIME, dateStr);
        
    }
//    if (status == 0) {
//        [_requestData getPracticeInformation:@""];
//        [_requestData hdInquirePunchInformation];
//    }
}
/**
 *    @brief  主讲开始推流
 */
- (void)onLiveStatusChangeStart {
    [_playerView onLiveStatusChangeStart];
//    dispatch_async(dispatch_get_main_queue(), ^{
//        [self.playerView addSmallView];
//    });
}
/**
 *    @brief  停止直播，endNormal表示是否停止推流
 */
- (void)onLiveStatusChangeEnd:(BOOL)endNormal {
//    if (self.punchView) {
//        [self removePunchView];
//    }
    [_playerView onLiveStatusChangeEnd:endNormal];
}

-(void)videoStateChangeWithString:(NSString *)result {
    NSLog(@"状态是%@",result);
}
#pragma mark- 加载视频失败
/**
 *  @brief  加载视频失败
 */
- (void)play_loadVideoFail {
    [_playerView play_loadVideoFail];
}

#pragma mark - login
-(void)loginSucceedPlay {
    NSLog(@"login success");
}
-(void)loginFailed:(NSError *)error reason:(NSString *)reason {
    NSString *message = nil;
    if (reason == nil) {
        message = [error localizedDescription];
    } else {
        message = reason;
    }
}

@end
