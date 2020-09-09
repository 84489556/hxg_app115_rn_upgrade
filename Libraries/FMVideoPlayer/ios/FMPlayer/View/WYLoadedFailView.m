//
//  LoadedFailView.m
//  RCTGenseePlayer
//
//  Created by mac on 2017/9/14.
//  Copyright © 2017年 yuanda. All rights reserved.
//

#import "WYLoadedFailView.h"
#import "Masonry.h"
#import "UIColor+UIColor_Hex.h"
#define WMPlayerSrcName(file) [@"WMPlayer.bundle" stringByAppendingPathComponent:file]
#define WMPlayerFrameworkSrcName(file) [@"Frameworks/WMPlayer.framework/WMPlayer.bundle" stringByAppendingPathComponent:file]

#define WMPlayerImage(file)      [UIImage imageNamed:WMPlayerSrcName(file)] ? :[UIImage imageNamed:WMPlayerFrameworkSrcName(file)]
@implementation WYLoadedFailView

-(instancetype)init{
    self = [super init];
    if (self) {
        self.backgroundColor=[UIColor colorWithHexString:@"#262628"];
        [self initLoadingView];
    }
    return self;
}
-(void)initLoadingView{
    
    _imageView=[[UIImageView alloc] init];
    _imageView.backgroundColor = [UIColor clearColor];//背景颜色
    
    [_imageView setImage:WMPlayerImage(@"loadfail")];
    
    [self addSubview:_imageView];
    _loadingLabel=[[UILabel alloc] init];
    _loadingLabel.text=@"亲亲，咱们要失联了...！";
    _loadingLabel.textAlignment = NSTextAlignmentCenter;
    _loadingLabel.font=[UIFont systemFontOfSize:10];
    _loadingLabel.textColor=[UIColor colorWithHexString:@"#ffffff" alpha:1];
    [self addSubview:_loadingLabel];
    
    [_imageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(self);
        make.centerY.equalTo(self).offset(-16);
        make.height.mas_equalTo(125);
        make.width.mas_equalTo(123);
    }];
    [_loadingLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(self);
        make.top.mas_equalTo(_imageView).offset(138);
        make.height.mas_equalTo(12);
        make.width.mas_equalTo(self);
    }];
    
}
@end
