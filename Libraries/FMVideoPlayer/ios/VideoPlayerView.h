//
//  WYPlayerView.h
//  FMPlayer
//
//  Created by mac on 2018/2/27.
//  Copyright © 2018年 yuanda. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "NELivePlayer.h"
#import "NELivePlayerController.h"
@interface VideoPlayerView : UIView
{
    NSString* _urlStr;
    NSDictionary *dataSource;
}
@property(nonatomic,strong)id<NELivePlayer> player;
@end
