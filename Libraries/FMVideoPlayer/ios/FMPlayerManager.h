//
//  FMPlayerManager.h
//  VoiceOnlineDemo
//
//  Created by 河北源达 on 17/8/18.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>

#import "NELivePlayer.h"
#import "NELivePlayerController.h"
@interface FMPlayerManager : NSObject<RCTBridgeModule>

@property(nonatomic,strong)id<NELivePlayer> player;
@property(nonatomic,strong)NSString *lastUrlString;
@property(nonatomic,strong)NSString *decodeType;
@property(nonatomic,strong)NSString *mediaType;


+(instancetype) instance;
-(id)getPlayer;

@end
