//
//  WYPlayerView.m
//  FMPlayer
//
//  Created by mac on 2018/2/27.
//  Copyright © 2018年 yuanda. All rights reserved.
//

#import "WYPlayerView.h"
#import "Masonry.h"
#import "UIImageView+WebCache.h"
//@class RCTWYPlayerViewManager;
@interface WYPlayerView()<WYPlayerViewDelegate>
@end
@implementation WYPlayerView


- (instancetype) init {
    self = [super init];
    if( self ){
        
        self.autoresizesSubviews = YES;
        self.player=[[WYPlayer alloc] initWithFrame:CGRectMake(0,0,[UIScreen mainScreen].bounds.size.width,210)];
        //初始化播放器
        self.player.delegate=self;
        [self.player initPlayerWithRect:CGRectMake(0,0,[UIScreen mainScreen].bounds.size.width,210)];
        self.player.userInteractionEnabled=YES;
        self.userInteractionEnabled=YES;
        [self addSubview:_player];
    }
    
    return self;
}
-(void)stopBtnClicked
{
    [self.player pause];
}
-(void)setUrlStr:(NSString *)url
{
   
    if(url)
    {
         _urlStr=url;
        [self.player setUrl:url];
    }
//     [self.player.backView sd_setImageWithURL:[NSURL URLWithString:@"http://pic13.997788.com/pic_search/00/34/85/31/se34853121.jpg"]];
}
-(void)setDataSource:(NSDictionary *)dic
{
    dataSource=dic;
    self.player.dataSource=dic;
     [self.player.backView sd_setImageWithURL:[NSURL URLWithString:dic[@"img"]]];
//    [self.player.backView setImage:sd_setImageWithURL:[NSURL URLWithString:_dataSource[@"image"]];
}
-(void)updateVideoView
{
    [self.player updateVideoView];
}
-(void)playBtnClicked
{
    [self.player play];
    
}
- (void)dealloc
{
    [self.player resetPlayer];
    
}
-(void)switchURL:(NSString *)url
{
    [self.player setUrl:url];
    self.player.isPlaying=YES;
}
-(void)noWifi:(NSDictionary *)dic
{
    [self.player showNoWifiView:dic[@"status"]];

    if([dic[@"status"] isEqualToString:@"cell"])
    {
        [self.player.noWifiView.imageView setTitle:@"约63M流量" forState:UIControlStateNormal];
        [self.player.noWifiView.imageView setImage:[UIImage imageNamed:[@"WMPlayer.bundle" stringByAppendingPathComponent:@"icon-play"]] forState:UIControlStateNormal];
        [self.player.noWifiView.imageView setTitleEdgeInsets:UIEdgeInsetsMake(0,-5, 0,-12)];
        [self.player.noWifiView.imageView setImageEdgeInsets:UIEdgeInsetsMake(0,-5,0,0)];
        self.player.noWifiView.imageView.layer.borderColor=[[UIColor colorWithWhite:1 alpha:1] CGColor];
        self.player.noWifiView.imageView.layer.borderWidth=1.0;
        self.player.noWifiView.imageView.layer.cornerRadius=17;
        [self.player.noWifiView.imageView mas_updateConstraints: ^(MASConstraintMaker *make) {
            make.width.mas_equalTo(115);
        }];
        [self.player pause];
    }
    else if([dic[@"status"] isEqualToString:@"none"])
    {
        [self.player pause];
        self.player.state=PlayerStateFailed;
    }
    else
    {
        if(self.player.state==PlayerStateFailed)
        {
            if([self.player.player isPreparedToPlay])
                [self.player play];
            else
                [self.player setUrl:_urlStr];
        }
    }
    
}
///把播放器wmPlayer对象放到view上，同时更新约束
-(void)toView{
    
    NSNumber *resetOrientationTarget = [NSNumber numberWithInt:UIInterfaceOrientationPortrait];
    [[UIDevice currentDevice] setValue:resetOrientationTarget forKey:@"orientation"];
    
    [self.player removeFromSuperview];
    
    [UIView animateWithDuration:0.7f animations:^{
        self.player.frame =CGRectMake(0,0,[UIScreen mainScreen].bounds.size.width,self.frame.size.height);
        
        self.player.player.view.frame=CGRectMake(0,0,[UIScreen mainScreen].bounds.size.width,self.frame.size.height);
        [self.player.contentView mas_remakeConstraints:^(MASConstraintMaker *make) {
            
            make.edges.equalTo(self.player).with.offset(0);
            make.width.mas_equalTo([UIScreen mainScreen].bounds.size.width);
            make.height.mas_equalTo(self.player.frame.size.height);
            
        }];
//        [self.player.loadingView mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.center.equalTo(self.player.contentView);
//            make.height.mas_equalTo(110);
//            make.width.mas_equalTo(150);
//
//        }];
        [self.player.bottomView mas_remakeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(self.player).with.offset(0);
            make.right.equalTo(self.player).with.offset(0);
            make.height.mas_equalTo(40);
            make.bottom.equalTo(self.player).with.offset(0);
        }];
        [self.player.topView mas_remakeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(self.player).with.offset(0);
            make.right.equalTo(self.player).with.offset(0);
            make.height.mas_equalTo(40);
            make.top.equalTo(self.player).with.offset(0);
        }];
//        [self.player.titleLabel mas_remakeConstraints:^(MASConstraintMaker *make) {
//            make.left.equalTo(self.player.topView).with.offset(15);
//            make.right.equalTo(self.player.topView).with.offset(-15);
//            make.centerY.equalTo(self.player.topView);
//
//        }];
//        [self.player.noWifiView mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.center.equalTo(self.player.contentView);
//            make.height.mas_equalTo(158);
//            make.width.mas_equalTo(150);
//
//        }];
//        [self.player.loadFailedView mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.center.equalTo(self.player.contentView);
//            make.height.mas_equalTo(158);
//            make.width.mas_equalTo(150);
//
//        }];
    }completion:^(BOOL finished) {
        self.player.isFullscreen = NO;
        self.player.fullScreenBtn.selected = NO;
    }];
    
    [self addSubview:self.player];
}

-(void)toFullScreenWithInterfaceOrientation:(UIInterfaceOrientation )interfaceOrientation{
    
    NSNumber *resetOrientationTarget = [NSNumber numberWithInt:interfaceOrientation];
    [[UIDevice currentDevice] setValue:resetOrientationTarget forKey:@"orientation"];
    [UIView animateWithDuration:0.7f animations:^{
        self.player.frame = CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height);
        
        [self.player.contentView mas_remakeConstraints:^(MASConstraintMaker *make) {
            make.width.mas_equalTo(self.player.frame.size.width);
            make.height.mas_equalTo(self.player.frame.size.height);
            make.center.equalTo(self.player);
        }];
        [self.player.bottomView mas_remakeConstraints:^(MASConstraintMaker *make) {
            make.height.mas_equalTo(40);
            make.width.mas_equalTo([UIScreen mainScreen].bounds.size.width);
            make.bottom.equalTo(self.player.contentView).with.offset(0);
        }];
        
        [self.player.topView mas_remakeConstraints:^(MASConstraintMaker *make) {
            make.height.mas_equalTo(40);
            make.left.equalTo(self.player).with.offset(0);
            make.width.mas_equalTo([UIScreen mainScreen].bounds.size.width);
        }];
        self.player.player.view.frame=CGRectMake(0,0,[UIScreen mainScreen].bounds.size.width,self.frame.size.height);

//        [self.player.loadingView mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.center.equalTo(self.player.contentView);
//            make.height.mas_equalTo(110);
//            make.width.mas_equalTo(150);
//
//        }];
//        [self.player.closeBtn mas_remakeConstraints:^(MASConstraintMaker *make) {
//            make.left.equalTo(self.player.topView).with.offset(15);
//            make.height.mas_equalTo(33);
//            make.width.mas_equalTo(16);
//            make.centerY.equalTo(self.player.topView);
//
//        }];
        
//        [self.player.titleLabel mas_remakeConstraints:^(MASConstraintMaker *make) {
//            make.left.equalTo(self.player.closeBtn.mas_right).with.offset(5);
//            make.right.equalTo(self.player.topView).with.offset(-15);
//            make.centerY.equalTo(self.player.topView);
//
//
//        }];
//        [self.player.noWifiView mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.center.equalTo(self.player.contentView);
//            make.height.mas_equalTo(158);
//            make.width.mas_equalTo(150);
//
//        }];
//        [self.player.loadFailedView mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.center.equalTo(self.player.contentView);
//            make.height.mas_equalTo(158);
//            make.width.mas_equalTo(150);
//
//        }];
        
    }completion:^(BOOL finished) {
        self.player.fullScreenBtn.selected = YES;
        self.player.isFullscreen = YES;
    }];
    [self addSubview:self.player];
    [[UIApplication sharedApplication].keyWindow  addSubview:self.player];
}

//点击关闭按钮代理方法
-(void)wyplayer:(WYPlayer *)vodPlayer clickedCloseButton:(UIButton *)closeBtn{
    if(self.player.closeBtnStyle ==CloseBtnStyleClose)
    {
//        NSLog(@"页面返回...");
        [[NSNotificationCenter defaultCenter] postNotificationName:@"returnBtnClicked" object:dataSource];
    }
    else
    {
        [self toView];
        self.player.isFullscreen = NO;
        self.player.closeBtnStyle=CloseBtnStyleClose;
    }
    
}
//点击全屏按钮代理方法
-(void)wyplayer:(WYPlayer *)vodPlayer clickedFullScreenButton:(UIButton *)fullScreenBtn
{
    [self.player removeFromSuperview];
    
    if(fullScreenBtn.isSelected){
        if([UIApplication sharedApplication].statusBarOrientation ==UIInterfaceOrientationPortrait)
        {
            self.player.isFullscreen=YES;
            self.player.closeBtnStyle=CloseBtnStylePop;
            [self toFullScreenWithInterfaceOrientation:UIInterfaceOrientationLandscapeRight];
        }
        else
        {
            self.player.isFullscreen=YES;
            self.player.closeBtnStyle=CloseBtnStylePop;
            [self toFullScreenWithInterfaceOrientation: [UIApplication sharedApplication].statusBarOrientation];
        }
        
    }
    else
    {
        [self toView];
        self.player.isFullscreen=NO;
        self.player.closeBtnStyle=CloseBtnStyleClose;
    }
}
/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/
@end

#import <React/RCTUIManager.h>
@interface RCTWYPlayerViewManager : RCTViewManager

@end


@implementation RCTWYPlayerViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
    WYPlayerView *view=[[WYPlayerView alloc] init];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(returnBtnClicked:) name:@"returnBtnClicked" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(playingVideo:) name:@"playingVideo" object:nil];
    return view;
}
-(void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}
-(void)returnBtnClicked:(NSNotification *)notification
{
    NSDictionary *dic=[notification object];
     [self.bridge.eventDispatcher  sendDeviceEventWithName:@"returnBridgeEvent" body:dic];
}
-(void)playingVideo:(NSNotification *)notification
{
    NSDictionary *dic=[notification object];
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"playingvideoBridgeEvent" body:dic];
}
RCT_EXPORT_METHOD(releaseView)
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];

}
RCT_EXPORT_METHOD(getPlayerStatus:(NSNumber * __nonnull)tag  callback:(RCTResponseSenderBlock)callback)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;
        
        callback(@[@(view.player.state)]);
    }];
    
}
RCT_EXPORT_METHOD(noWifiVideoView:(NSNumber * __nonnull)tag WithDic:(NSDictionary *)dic)
{
        [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
            WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
            if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;
            [view noWifi:dic];
        }];
}
RCT_EXPORT_METHOD(landspace:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;
        if(view.player.fullScreenBtn.selected)
            return;
        view.player.fullScreenBtn.selected=YES;
        [view wyplayer:view.player clickedFullScreenButton:view.player.fullScreenBtn];
        
        
    }];
}
RCT_EXPORT_METHOD(portiort:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;
        if(!view.player.fullScreenBtn.selected)
            return;
        [view wyplayer:view.player clickedCloseButton:view.player.closeBtn];
        
        
    }];
}
RCT_EXPORT_METHOD(changeUrlStr:(NSString *)url DataSource:(NSDictionary *)dic WithTag:(NSNumber * __nonnull)tag)
{
    
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;

        [view switchURL:url];
        
    }];
    
}
RCT_EXPORT_METHOD(playVideoView:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;
        [view playBtnClicked];
    }];
}
RCT_EXPORT_METHOD(stopVideoView:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;
        [view stopBtnClicked];
    }];
}

RCT_EXPORT_METHOD(updateVideoView:(NSDictionary *)dic WithTag:(NSNumber * __nonnull)tag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;

        [view updateVideoView];
        
        
    }];
}
RCT_EXPORT_METHOD(getPlayerState:(NSNumber * __nonnull)tag getStatus:(RCTResponseSenderBlock)callback)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        WYPlayerView *view=(WYPlayerView *)viewRegistry[tag];
        if(!view||![view isKindOfClass:[WYPlayerView class]])
            return;
//        NSLog(@"%@",@{@"state":@(view.player.isPlaying)});
        callback(@[@{@"state":@(view.player.isPlaying)}]);
        
    }];
}
RCT_EXPORT_VIEW_PROPERTY(urlStr,NSString);
RCT_EXPORT_VIEW_PROPERTY(dataSource,NSDictionary);
@end
