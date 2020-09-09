//
//  RCTHuodeLiveManager.m
//  RCTHuodePlayer
//
//  Created by dxd on 2020/1/10.
//  Copyright © 2020 dxd. All rights reserved.
//

#import "RCTHuodeLiveManager.h"
#import "RCTHuodeLiveView.h"

@implementation RCTHuodeLiveManager

RCT_EXPORT_VIEW_PROPERTY(dataSource, NSDictionary);
RCT_EXPORT_MODULE(RCTHuodeLive)

- (UIView *)view
{
    RCTHuodeLiveView * view = [[RCTHuodeLiveView alloc] init];
    return view;
}

RCT_EXPORT_METHOD(stop:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        [view stop];
    }];
}
RCT_EXPORT_METHOD(play:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        [view play];
    }];
}
RCT_EXPORT_METHOD(pause:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        [view pause];
    }];
}
RCT_EXPORT_METHOD(resume:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        [view resume];
    }];
}
RCT_EXPORT_METHOD(landspace:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        [view landspace];
    }];
}
RCT_EXPORT_METHOD(portiort:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        [view portiort];
    }];
}
RCT_EXPORT_METHOD(releaseViewWithTag:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        [view stop];
        [view removeFromSuperview];
    }];
}
RCT_EXPORT_METHOD(reloadView:(NSNumber * __nonnull)tag rect:(NSDictionary *)dic)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        CGRect react = CGRectMake(0, 0, ((NSNumber *)dic[@"width"]).floatValue, ((NSNumber *)dic[@"height"]).floatValue);
        [view resetPlayer:react];
    }];
}
RCT_EXPORT_METHOD(changePlaybackId:(NSString *)vodId Data:(NSDictionary *)dic WithTag:(NSNumber * __nonnull)tag type:(BOOL)isChangeView)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RCTHuodeLiveView *view=(RCTHuodeLiveView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[RCTHuodeLiveView class]])
            return;
        if (isChangeView) {
            [view stop];
        }
        NSMutableDictionary * dataSourceDic = [[NSMutableDictionary alloc]initWithDictionary:view.dataSource];
        dataSourceDic[@"recordID"] = vodId;
        view.dataSource = dataSourceDic;
        [view play];
    }];
}
@end
