//
//  RCTMIPushModule.h
//  RCTMIPushModule
//
//  Created by zhangzy on 2016/10/24.
//  Copyright © 2016年 zzy. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "MiPushSDK.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>
@interface RCTMIPushModule : NSObject <RCTBridgeModule, MiPushSDKDelegate, UNUserNotificationCenterDelegate>


+ (void)didRegisterUserNotificationSettings:(NSDictionary *)notificationSettings;

+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;

+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)err;

+ (void)didReceiveRemoteNotification:(NSDictionary *)notification;

+ (void)didReceiveLocalNotification:(UILocalNotification *)notification;

+ (void)didFinishLaunchingWithOptions:(NSDictionary *)launchOptions;


@end
