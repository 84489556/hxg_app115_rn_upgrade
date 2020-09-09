//
//  LoadedNoWifiView.m
//  RCTGenseePlayer
//
//  Created by mac on 2017/9/14.
//  Copyright © 2017年 yuanda. All rights reserved.
//

#import "WYLoadedNoWifiView.h"
#import "Masonry.h"
#import "UIColor+UIColor_Hex.h"
#define WMPlayerSrcName(file) [@"WMPlayer.bundle" stringByAppendingPathComponent:file]
#define WMPlayerFrameworkSrcName(file) [@"Frameworks/WMPlayer.framework/WMPlayer.bundle" stringByAppendingPathComponent:file]

#define WMPlayerImage(file)      [UIImage imageNamed:WMPlayerSrcName(file)] ? :[UIImage imageNamed:WMPlayerFrameworkSrcName(file)]

@implementation WYLoadedNoWifiView

-(instancetype)init{
    self = [super init];
    if (self) {
        self.backgroundColor=[UIColor colorWithRed:0/255 green:0/255 blue:0/255 alpha:0.4];
        [self initLoadingView];
    }
    return self;
}
-(void)initLoadingView{
    
    _titleLabel = [[UILabel alloc] init];
    _titleLabel.text = @"正在使用非WIFI网络，播放将产生流量费用";
    _titleLabel.font = [UIFont fontWithName:@"PingFang-SC-Medium" size:12];
    _titleLabel.textColor = [UIColor colorWithHexString:@"#ffffff" alpha:1];
    [self addSubview:_titleLabel];
    [_titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        
        make.centerX.mas_equalTo(self);
        make.top.mas_equalTo(71);
        make.height.mas_equalTo(20);
    }];
    
    _imageView=[[UIButton alloc] init];
    _imageView.backgroundColor = [UIColor clearColor];//背景颜色
    [_imageView setImage:WMPlayerImage(@"liveplay") forState:UIControlStateNormal];
    _imageView.titleLabel.font=[UIFont systemFontOfSize:12];
    [self addSubview:_imageView];
    
    [_imageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(self);
        make.top.equalTo(_titleLabel).offset(32);
        make.width.mas_equalTo(85);
        make.height.mas_equalTo(34);
    }];
    _loadingLabel=[[UILabel alloc] initWithFrame:CGRectMake(0,154,150,20)];
    _loadingLabel.text=@"预计20分钟";
    _loadingLabel.textAlignment = NSTextAlignmentCenter;
    _loadingLabel.font=[UIFont systemFontOfSize:10];
    _loadingLabel.textColor=[UIColor colorWithHexString:@"#ffffff" alpha:1];
    [self addSubview:_loadingLabel];
    
    [_loadingLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(self);
        make.height.mas_equalTo(20);
        make.top.mas_equalTo(self.imageView).offset(44);
    }];
}
    
@end
