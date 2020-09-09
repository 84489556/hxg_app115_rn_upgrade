//
//  RCTHuodePlaybackManager.m
//  RCTHuodePlayer
//
//  Created by dxd on 2020/1/22.
//  Copyright © 2020 dxd. All rights reserved.
//

#import "RCTHuodePlaybackManager.h"
#import "RCTHuodePlaybackView.h"
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

@implementation RCTHuodePlaybackManager

RCT_EXPORT_VIEW_PROPERTY(dataSource, NSDictionary);
RCT_EXPORT_MODULE(RCTHuodePlayback)

- (UIView *)view
{
    RCTHuodePlaybackView * view = [[RCTHuodePlaybackView alloc] init];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onInit:) name:@"initEvent" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onPosition:) name:@"onPosition" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onStop) name:@"onStop" object:nil];
    return view;

}
RCT_EXPORT_METHOD(play:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        [view play];
    }];
}
RCT_EXPORT_METHOD(stop:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        [view stop];
    }];
}
RCT_EXPORT_METHOD(pause:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        [view pause];
    }];
}
RCT_EXPORT_METHOD(resume:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        [view resume];
    }];
}
RCT_EXPORT_METHOD(releaseView:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
//        view.player.mVideoView = nil;
//        [view.player stop];
        [view removeFromSuperview];
        [[NSNotificationCenter defaultCenter] removeObserver:self];
    }];
}
//RCT_EXPORT_METHOD(releaseViewWithTag:(NSNumber * __nonnull)tag)
//{
//    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
//        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
//        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
//            return;
////        [view.LiveControlView resetWMPlayer];
////        [view.LiveControlView stopPlay];
//        [view removeFromSuperview];
//
//    }];
//}
RCT_EXPORT_METHOD(landspace:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        [view landspace];
    }];
}
RCT_EXPORT_METHOD(portiort:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        [view portiort];
    }];
}
RCT_EXPORT_METHOD(reloadView:(NSNumber * __nonnull)tag rect:(NSDictionary *)dic)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        CGRect react = CGRectMake(0, 0, ((NSNumber *)dic[@"width"]).floatValue, ((NSNumber *)dic[@"height"]).floatValue);
        [view resetPlayer:react];
//        [view drawRect:CGRectMake(0, 0, ((NSNumber *)dic[@"width"]).floatValue, ((NSNumber *)dic[@"height"]).floatValue)];
    }];
}
RCT_EXPORT_METHOD(changePlaybackId:(NSString *)vodId Data:(NSDictionary *)dic WithTag:(NSNumber * __nonnull)tag type:(BOOL)isChangeView)
{
    
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        if (isChangeView) {
//            [view stop];
        }
        [view stop];
        NSMutableDictionary * dataSourceDic = [[NSMutableDictionary alloc]initWithDictionary:view.dataSource];
        dataSourceDic[@"recordID"] = vodId;
        view.dataSource = dataSourceDic;
        [view play];
    }];
}
RCT_EXPORT_METHOD(noWifiVideoView:(NSNumber * __nonnull)tag WithDic:(NSDictionary *)dic)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
//        [view noWifi:dic];
    }];
}
RCT_EXPORT_METHOD(seekTo:(double)second WithTag:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodePlaybackView *view=(RCTHuodePlaybackView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodePlaybackView class]])
            return;
        
        [view seekTo:second];
        
    }];
}
- (void)onPosition:(NSNotification*)notification{
    int position = [(NSNumber*)[notification userInfo][@"position"] intValue];
    [self.bridge.eventDispatcher sendAppEventWithName:@"positionEvent" body:@{@"position":@(position)}];
}

- (void)onInit:(NSNotification*)notification{
    int duration = [(NSNumber*)[notification userInfo][@"duration"] intValue];
    [self.bridge.eventDispatcher sendAppEventWithName:@"initEvent" body:@{@"duration":@(duration)}];
}

- (void) onStop{
    [self.bridge.eventDispatcher sendAppEventWithName:@"onStopEvent" body:@{@"name":@"onstop"}];
}

@end
