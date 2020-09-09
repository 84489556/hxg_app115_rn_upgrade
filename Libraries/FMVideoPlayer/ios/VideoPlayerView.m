//
//  WYPlayerView.m
//  FMPlayer
//
//  Created by mac on 2018/2/27.
//  Copyright © 2018年 yuanda. All rights reserved.
//
#import "VideoPlayerView.h"
@interface VideoPlayerView()
@property(nonatomic,strong)UIView *videoView;
@property(nonatomic)BOOL isPlaying;
@end
@implementation VideoPlayerView


- (instancetype) init {
    self = [super init];
    if( self ){
        _isPlaying=FALSE;
    }
    return self;
}
-(void)drawRect:(CGRect)rect
{
    [self setFrame:rect];
    [self.player.view setFrame:rect];
    
}
-(void)setDataSource:(NSDictionary *)dic
{
    dataSource=dic;
//    [self.player setPlayUrl:[NSURL URLWithString:dic[@"url"]]];
    if(!self.player&&dic[@"url"])
    {
    self.player=[[NELivePlayerController alloc] init];
    [self.player setPlayUrl:[NSURL URLWithString:dic[@"url"]]];
    if ([dic[@"mediaType"] isEqualToString:@"livestream"] ) {
        [self.player setBufferStrategy:NELPFluent]; //直播流畅模式
    }
    else {
        [self.player setBufferStrategy:NELPAntiJitter]; //点播抗抖动
    }
    [self.player setBufferStrategy:NELPAntiJitter]; //点播抗抖动
    [self.player setScalingMode:NELPMovieScalingModeFill];
    [self.player setShouldAutoplay:YES]; //设置prepareToPlay完成后是否自动播放
    [self.player setHardwareDecoder:NO]; //设置解码模式，是否开启硬件解码
    [self.player setPauseInBackground:NO]; //设置切入后台时的状态，暂停还是继续播放
    [self.player prepareToPlay];
    [self addSubview:self.player.view];
    [self.player.view setFrame:self.frame];
    }

}




-(void)dealloc
{
    [self.player shutdown]; //退出播放并释放相关资源
    [self.player.view removeFromSuperview];
    self.player = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}
-(void)switchURL:(NSString *)url
{
    if(self.player)
    {
        [self.player switchContentUrl:[NSURL URLWithString:url]];
        _isPlaying=TRUE;
    }
}
-(void)seekToTime:(double)seconds
{
    //    NSLog(@"执行了几次切换进度方法");
    if(!self.player)
        return;
    if([self.player isPreparedToPlay]){
        
        [self.player setCurrentPlaybackTime:seconds];
    }
}
@end

#import <React/RCTUIManager.h>
@interface RCTVideoPlayerViewManager : RCTViewManager

@end


@implementation RCTVideoPlayerViewManager

RCT_EXPORT_MODULE(VideoPlayerView)

- (VideoPlayerView *)view
{
    VideoPlayerView *view=[[VideoPlayerView alloc] init];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(NELivePlayerMoviePlayerSeekCompletedNotification:) name:NELivePlayerMoviePlayerSeekCompletedNotification object:view.player];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(NELivePlayerMoviePlayerSeekCompletedErrorKey:) name:NELivePlayerMoviePlayerSeekCompletedNotification object:view.player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerDidPreparedToPlay:)
                                                 name:NELivePlayerDidPreparedToPlayNotification
                                               object:view.player];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(NELivePlayerPlaybackStateChangedNotification:) name:NELivePlayerPlaybackStateChangedNotification object:view.player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NeLivePlayerloadStateChanged:)
                                                 name:NELivePlayerLoadStateChangedNotification
                                               object:view.player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerPlayBackFinished:)
                                                 name:NELivePlayerPlaybackFinishedNotification
                                               object:view.player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerFirstVideoDisplayed:)
                                                 name:NELivePlayerFirstVideoDisplayedNotification
                                               object:view.player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerFirstAudioDisplayed:)
                                                 name:NELivePlayerFirstAudioDisplayedNotification
                                               object:view.player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerReleaseSuccess:)
                                                 name:NELivePlayerReleaseSueecssNotification
                                               object:view.player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerVideoParseError:)
                                                 name:NELivePlayerVideoParseErrorNotification
                                               object:view.player];
    return view;
}

-(void)NELivePlayerPlaybackStateChangedNotification:(NSNotification *)notification
{
    id<NELivePlayer> player=notification.object;
    NSString *status=@"STOPPED";
    NSNumber *duration=[NSNumber numberWithFloat:player.duration];
    NSNumber *currentTime=[NSNumber numberWithFloat:player.currentPlaybackTime];
    if (!player) {
        status = @"ERROR";
    } else if ([player playbackState] == NELPMoviePlaybackStatePlaying) {
        status = @"PLAYING";
    } else if ([player playbackState] == NELPMoviePlaybackStatePaused) {
        status = @"PAUSED";
    } else if ([player playbackState] == NELPMoviePlaybackStateSeeking) {
        status = @"BUFFERING";
    } else if ([player playbackState] == NELPMoviePlaybackStateStopped) {
        status =@"STOPPED";
    }
//    NSLog(@"播放器状态:%@",status);
        [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent" body:@{@"status":status,@"currentTime":currentTime,@"duration":duration}];
}
- (void)NELivePlayerDidPreparedToPlay:(NSNotification*)notification
{
    id<NELivePlayer> player=notification.object;
    NSNumber *duration=[NSNumber numberWithFloat:player.duration];
    NSNumber *currentTime=[NSNumber numberWithFloat:player.currentPlaybackTime];
    
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"onPrepared" body:@{@"status":@"PLAYING",@"currentTime":currentTime,@"duration":duration}];

    
}

- (void)NeLivePlayerloadStateChanged:(NSNotification*)notification
{
    id<NELivePlayer> player=notification.object;

    NELPMovieLoadState nelpLoadState =player.loadState;
    
    if (nelpLoadState == NELPMovieLoadStatePlaythroughOK)
    {
    }
    else if (nelpLoadState == NELPMovieLoadStateStalled)
    {
    }
}

- (void)NELivePlayerPlayBackFinished:(NSNotification*)notification
{
    id<NELivePlayer> player=notification.object;

    switch ([[[notification userInfo] valueForKey:NELivePlayerPlaybackDidFinishReasonUserInfoKey] intValue])
    {
        case NELPMovieFinishReasonPlaybackEnded:
            [self.bridge.eventDispatcher sendAppEventWithName:@"AudioBridgeEvent" body:@{@"status":@"FINISHED"}];
            break;
            
        case NELPMovieFinishReasonPlaybackError:
            [self.bridge.eventDispatcher sendAppEventWithName:@"AudioBridgeEvent" body:@{@"status":@"ERROR"}];
            break;
            
        case NELPMovieFinishReasonUserExited:
            break;
            
        default:
            break;
    }
}

- (void)NELivePlayerFirstVideoDisplayed:(NSNotification*)notification
{
//    NSLog(@"first video frame rendered!");
    
}

- (void)NELivePlayerFirstAudioDisplayed:(NSNotification*)notification
{
//    NSLog(@"first audio frame rendered!");
}
-(void)NELivePlayerMoviePlayerSeekCompletedNotification:(NSNotification *)notification
{
//    NSLog(@"进度加载完成");
}
-(void)NELivePlayerMoviePlayerSeekCompletedErrorKey:(NSNotification *)notification
{
//    NSLog(@"%@",notification);
}
- (void)NELivePlayerVideoParseError:(NSNotification*)notification
{
//    NSLog(@"video parse error!");
}

- (void)NELivePlayerReleaseSuccess:(NSNotification*)notification
{
//    NSLog(@"resource release success!!!");
    [[NSNotificationCenter defaultCenter]removeObserver:self name:NELivePlayerReleaseSueecssNotification object:nil];
}

RCT_EXPORT_METHOD(shutdown)
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];

}
RCT_EXPORT_METHOD(getPlayerStatus:(NSNumber * __nonnull)tag  callback:(RCTResponseSenderBlock)callback)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        VideoPlayerView *view=(VideoPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[VideoPlayerView class]])
            return;
        NSString *status=@"STOPPED";
        NSNumber *duration=[NSNumber numberWithDouble:view.player.duration];
        NSNumber *currentTime=[NSNumber numberWithDouble:view.player.currentPlaybackTime];
        if (!view.player) {
            status = @"ERROR";
        } else if ([view.player playbackState] == NELPMoviePlaybackStatePlaying) {
            status = @"PLAYING";
        } else if ([view.player playbackState] == NELPMoviePlaybackStatePaused) {
            status = @"PAUSED";
        } else if ([view.player playbackState] == NELPMoviePlaybackStateSeeking) {
            status = @"BUFFERING";
        } else if ([view.player playbackState] == NELPMoviePlaybackStateStopped) {
            status =@"STOPPED";
        }
    callback(@[@{@"status":status,@"currentTime":currentTime,@"duration":duration}]);
    }];
    
}
RCT_EXPORT_METHOD(changeUrlStr:(NSString *)url DataSource:(NSDictionary *)dic WithTag:(NSNumber * __nonnull)tag)
{
    
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        VideoPlayerView *view=(VideoPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[VideoPlayerView class]])
            return;
        
        [view switchURL:url];
        
    }];
    
}
RCT_EXPORT_METHOD(seekTo:(double)second WithTag:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        VideoPlayerView *view=(VideoPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[VideoPlayerView class]])
            return;
        
        [view seekToTime:second];
        
    }];
}
RCT_EXPORT_METHOD(resume:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        VideoPlayerView *view=(VideoPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[VideoPlayerView class]])
            return;
        
        [view.player play];
        
    }];
}
RCT_EXPORT_METHOD(pause:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        VideoPlayerView *view=(VideoPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[VideoPlayerView class]])
            return;
        
        [view.player pause];
        
    }];
}
RCT_EXPORT_METHOD(play:(NSNumber * __nonnull)tag dic:(NSDictionary *)dic)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        VideoPlayerView *view=(VideoPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[VideoPlayerView class]])
            return;
        
        [view setDataSource:dic];
        
    }];
}
RCT_EXPORT_METHOD(reloadView:(NSNumber * __nonnull)tag rect:(NSDictionary *)dic)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        VideoPlayerView *view=(VideoPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[VideoPlayerView class]])
            return;
        [view drawRect:CGRectMake(0, 0, ((NSNumber *)dic[@"width"]).floatValue, ((NSNumber *)dic[@"height"]).floatValue)];
    }];
}
RCT_EXPORT_VIEW_PROPERTY(dataSource,NSDictionary);
@end
