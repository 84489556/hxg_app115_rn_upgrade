//
//  LoadingView.h
//  RCTGenseePlayer
//
//  Created by mac on 2017/9/12.
//  Copyright © 2017年 yuanda. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface WYLoadingView : UIView
@property(nonatomic,strong) UIImageView *imageView;
@property(nonatomic,strong) UILabel *loadingLabel;

-(void)startAnimating;

-(void)stopAnimating;

@end
