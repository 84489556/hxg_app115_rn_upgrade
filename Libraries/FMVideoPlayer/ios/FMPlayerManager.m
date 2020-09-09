//
//  FMPlayerManager.m
//  VoiceOnlineDemo
//
//  Created by 河北源达 on 17/8/18.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "FMPlayerManager.h"
#import <UIKit/UIKit.h>

#import "NELivePlayer.h"
#import "NELivePlayerController.h"

static FMPlayerManager *_inst = nil;

@interface FMPlayerManager()

@end
@implementation FMPlayerManager

+ (instancetype)instance {
    static dispatch_once_t once;
    dispatch_once(&once, ^{
        _inst = [[self alloc] init];
    });
    return _inst;
}

- (instancetype)init {
    if (self = [super init]) {
        self.player=[[NELivePlayerController alloc] init];
    }
    return self;
}
+ (BOOL)requiresMainQueueSetup {
    return YES;
}
- (void)dealloc {
    [self releasePlayer];
}

- (void)releasePlayer {
    [self.player shutdown]; //退出播放并释放相关资源
    if (NSThread.isMainThread) {
        [self.player.view removeFromSuperview];
    } else {
        dispatch_sync(dispatch_get_main_queue(), ^{
            [_player.view removeFromSuperview];
        });
    }
    self.player = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)initPlayer {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerMoviePlayerSeekCompletedNotification:) name:NELivePlayerMoviePlayerSeekCompletedNotification
                                               object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerMoviePlayerSeekCompletedErrorKey:) name:NELivePlayerMoviePlayerSeekCompletedNotification
                                               object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerDidPreparedToPlay:)
                                                 name:NELivePlayerDidPreparedToPlayNotification
                                               object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerPlaybackStateChangedNotification:) name:NELivePlayerPlaybackStateChangedNotification
                                               object:_player];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NeLivePlayerloadStateChanged:)
                                                 name:NELivePlayerLoadStateChangedNotification
                                               object:_player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerPlayBackFinished:)
                                                 name:NELivePlayerPlaybackFinishedNotification
                                               object:_player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerFirstVideoDisplayed:)
                                                 name:NELivePlayerFirstVideoDisplayedNotification
                                               object:_player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerFirstAudioDisplayed:)
                                                 name:NELivePlayerFirstAudioDisplayedNotification
                                               object:_player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerReleaseSuccess:)
                                                 name:NELivePlayerReleaseSueecssNotification
                                               object:_player];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(NELivePlayerVideoParseError:)
                                                 name:NELivePlayerVideoParseErrorNotification
                                               object:_player];
    
    if ([self.mediaType isEqualToString:@"livestream"]) {
        [self.player setBufferStrategy:NELPFluent]; //直播流畅模式
    }
    else {
        [self.player setBufferStrategy:NELPAntiJitter]; //点播抗抖动
    }
    [self.player setScalingMode:NELPMovieScalingModeFill]; //设置画面显示模式，默认原始大小
    [self.player setShouldAutoplay:YES]; //设置prepareToPlay完成后是否自动播放
    [self.player setHardwareDecoder:NO]; //设置解码模式，是否开启硬件解码
    [self.player setPauseInBackground:NO]; //设置切入后台时的状态，暂停还是继续播放
    
    [self.player prepareToPlay];
}

- (void)setLastUrlString:(NSString *)lastUrlString {
    
    _lastUrlString = lastUrlString;
    
    [NELivePlayerController setLogLevel:NELP_LOG_WARN];
    if ([self.player isPreparedToPlay]) {
        [self.player switchContentUrl:[NSURL URLWithString:_lastUrlString]];
    } else {
        self.player = [[NELivePlayerController alloc] init];
        [self.player setPlayUrl:[NSURL URLWithString:_lastUrlString]];
    }
}

- (void)setMediaType:(NSString *)mediaType {
    _mediaType = mediaType;
}

- (void)setDecodeType:(NSString *)decodeType {
    _decodeType = decodeType;
}

- (id)getPlayer {
    return self.player;
}

#pragma mark - RCT
@synthesize bridge=_bridge;

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(play:(NSString *)streamUrl options:(NSDictionary *)options) {
    [self setLastUrlString:streamUrl];
    [self setMediaType:options[@"mediaType"]];
    [self setDecodeType:options[@"decodeType"]];
    [self initPlayer];
}

RCT_EXPORT_METHOD(seekToTime:(double)seconds) {
    
    if (!self.player) return;
    if ([self.player isPreparedToPlay]) {
//        NSLog(@"执行了几次切换进度方法 %g", seconds);
        [self.player setCurrentPlaybackTime:seconds];
    }
}

RCT_EXPORT_METHOD(pause) {
    if (!self.player) return;
    [self.player pause];
}

RCT_EXPORT_METHOD(resume) {
    if (!self.player) return;
    [self.player play];
}
//RCT_EXPORT_METHOD(stop)
//{
//  if(!self.player){
//    return;
//  }else{
//    [self.player stop];
//  }
//}
RCT_EXPORT_METHOD(shutdown) {
    [self.player shutdown];
    self.player = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

RCT_EXPORT_METHOD(getStatus:(RCTResponseSenderBlock)callback) {
    NSString *status = @"STOPPED";
    NSNumber *duration = [NSNumber numberWithDouble:self.player.duration];
    NSNumber *currentTime = [NSNumber numberWithDouble:self.player.currentPlaybackTime];
    
    if (!self.player) {
        status = @"ERROR";
    } else if ([self.player playbackState] == NELPMoviePlaybackStatePlaying) {
        status = @"PLAYING";
    } else if ([self.player playbackState] == NELPMoviePlaybackStatePaused) {
        status = @"PAUSED";
    } else if ([self.player playbackState] == NELPMoviePlaybackStateSeeking) {
        status = @"BUFFERING";
    } else if ([self.player playbackState] == NELPMoviePlaybackStateStopped) {
        status =@"STOPPED";
    }
    callback(@[[NSNull null],@{@"status":status,@"currentTime":currentTime,@"duration":duration,@"url":[NSString stringWithFormat:@"%@",self.lastUrlString]}]);
}

#pragma mark - NELivePlayerNotification
- (void)NELivePlayerPlaybackStateChangedNotification:(NSNotification *)notification {
    NSString *status = @"STOPPED";
    NSNumber *duration = [NSNumber numberWithFloat:self.player.duration];
    NSNumber *currentTime = [NSNumber numberWithFloat:self.player.currentPlaybackTime];
    if (!self.player) {
        status = @"ERROR";
    } else if ([self.player playbackState] == NELPMoviePlaybackStatePlaying) {
        status = @"PLAYING";
    } else if ([self.player playbackState] == NELPMoviePlaybackStatePaused) {
        status = @"PAUSED";
    } else if ([self.player playbackState] == NELPMoviePlaybackStateSeeking) {
        status = @"BUFFERING";
    } else if ([self.player playbackState] == NELPMoviePlaybackStateStopped) {
        status =@"STOPPED";
    }
    
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent" body:@{@"status":status,@"currentTime":currentTime,@"duration":duration,@"url":self.lastUrlString}];
}

- (void)NELivePlayerDidPreparedToPlay:(NSNotification*)notification {
    
    NSNumber *duration = [NSNumber numberWithFloat:self.player.duration];
    NSNumber *currentTime = [NSNumber numberWithFloat:self.player.currentPlaybackTime];
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"AudioBridgeEvent" body:@{@"status":@"PLAYING",@"currentTime":currentTime,@"duration":duration,@"url":self.lastUrlString}];
    
    [self.player play];
}

- (void)NeLivePlayerloadStateChanged:(NSNotification*)notification {
    NELPMovieLoadState nelpLoadState =_player.loadState;
    
    if (nelpLoadState == NELPMovieLoadStatePlaythroughOK) {
        
    } else if (nelpLoadState == NELPMovieLoadStateStalled) {
        
    }
}

- (void)NELivePlayerPlayBackFinished:(NSNotification*)notification {
    
    switch ([[[notification userInfo] valueForKey:NELivePlayerPlaybackDidFinishReasonUserInfoKey] intValue]) {
        case NELPMovieFinishReasonPlaybackEnded:
            [self.bridge.eventDispatcher sendAppEventWithName:@"AudioBridgeEvent" body:@{@"status":@"FINISHED",@"url":self.lastUrlString}];
            break;
            
        case NELPMovieFinishReasonPlaybackError:
            [self.bridge.eventDispatcher sendAppEventWithName:@"AudioBridgeEvent" body:@{@"status":@"ERROR",@"url":self.lastUrlString}];
            break;
            
        case NELPMovieFinishReasonUserExited:
            break;
            
        default:
            break;
    }
}

- (void)NELivePlayerFirstVideoDisplayed:(NSNotification*)notification {
//    NSLog(@"first video frame rendered!");
}

- (void)NELivePlayerFirstAudioDisplayed:(NSNotification*)notification {
//    NSLog(@"first audio frame rendered!");
}

- (void)NELivePlayerMoviePlayerSeekCompletedNotification:(NSNotification *)notification {
//    NSLog(@"进度加载完成");
}

- (void)NELivePlayerMoviePlayerSeekCompletedErrorKey:(NSNotification *)notification {
//    NSLog(@"%s %@", __func__, notification);
}

- (void)NELivePlayerVideoParseError:(NSNotification*)notification {
//    NSLog(@"video parse error!");
}

- (void)NELivePlayerReleaseSuccess:(NSNotification*)notification {
//    NSLog(@"resource release success!!!");
    [[NSNotificationCenter defaultCenter] removeObserver:self name:NELivePlayerReleaseSueecssNotification object:_player];
}

@end
