//
//  WYPlayerView.h
//  FMPlayer
//
//  Created by mac on 2018/2/27.
//  Copyright © 2018年 yuanda. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "WYPlayer.h"
@interface WYPlayerView : UIView
{
    NSString* _urlStr;
    NSDictionary *dataSource;
}
@property (strong,nonatomic)WYPlayer *player;

@end
