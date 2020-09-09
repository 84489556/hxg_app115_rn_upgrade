//
//  LoadingView.m
//  RCTGenseePlayer
//
//  Created by mac on 2017/9/12.
//  Copyright © 2017年 yuanda. All rights reserved.
//


#import "WYLoadingView.h"
#import "Masonry.h"
#import "UIColor+UIColor_Hex.h"
#import "UIImage+GIF.h"
#define WMPlayerSrcName(file) [@"WMPlayer.bundle" stringByAppendingPathComponent:file]
#define WMPlayerFrameworkSrcName(file) [@"Frameworks/WMPlayer.framework/WMPlayer.bundle" stringByAppendingPathComponent:file]

#define WMPlayerImage(file)      [UIImage imageNamed:WMPlayerSrcName(file)] ? :[UIImage imageNamed:WMPlayerFrameworkSrcName(file)]
#import "UIImageView+WebCache.h"


@implementation WYLoadingView

-(instancetype)init{
    self = [super init];
    if (self) {
        [self setBackgroundColor:[UIColor colorWithHexString:@"#000000" alpha:0.0]];
        [self initLoadingView];
    }
    return self;
}
-(void)initLoadingView{
    
    _imageView=[[UIImageView alloc] init];
    _imageView.backgroundColor = [UIColor clearColor];//背景颜色
    
    //    [_imageView setImage:WMPlayerImage(@"buffering")];
    //    NSString *wyplayerbundle=[[NSBundle mainBundle] pathForResource:@"WMPlayer" ofType:@"bundle"];
    //    NSData *imageData=[NSData dataWithContentsOfFile:[[NSBundle bundleWithPath:wyplayerbundle] pathForResource:@"buffering" ofType:@"gif"]];
    UIImage *images=[UIImage sd_animatedGIFNamed:[@"WMPlayer.bundle" stringByAppendingPathComponent:@"buffering"]];
    _imageView.image=images;
    
    [self addSubview:_imageView];
    _loadingLabel=[[UILabel alloc] init];
    _loadingLabel.text=@"";
    _loadingLabel.textAlignment = NSTextAlignmentCenter;
    _loadingLabel.font=[UIFont systemFontOfSize:10];
    _loadingLabel.textColor=[UIColor colorWithHexString:@"#ffffff" alpha:1];
    [self addSubview:_loadingLabel];
    
    [_imageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(self);
        make.centerY.equalTo(self).offset(-18);
        make.height.mas_equalTo(23);
        make.width.mas_equalTo(22);
    }];
    [_loadingLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(self);
        make.top.mas_equalTo(_imageView).offset(32);
        make.height.mas_equalTo(12);
        make.width.mas_equalTo(self);
    }];
        
}
-(void)startAnimating
    {
        [self.imageView startAnimating];
        [self setHidden:NO];
        
    }
-(void)stopAnimating
    {
        [self.imageView stopAnimating];
        [self setHidden:YES];
    }

@end
