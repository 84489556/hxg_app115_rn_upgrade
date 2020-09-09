//
//  RCTMIPushModule.m
//  RCTMIPushModule
//
//  Created by zhangzy on 2016/10/24.
//  Copyright © 2016年 zzy. All rights reserved.
//

#import "RCTMIPushModule.h"
#import <React/RCTEventDispatcher.h>
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <AdSupport/ASIdentifierManager.h>

NSString *const MiPush_didFinishLaunchingWithOptions = @"MiPush_didFinishLaunchingWithOptions";
NSString *const MiPush_didRegisterUserNotificationSettings = @"MiPush_didRegisterUserNotificationSettings";
NSString *const MiPush_didFailToRegisterForRemoteNotificationsWithError = @"MiPush_didFailToRegisterForRemoteNotificationsWithError";
NSString *const MiPush_didRegisterForRemoteNotificationsWithDeviceToken = @"MiPush_didRegisterForRemoteNotificationsWithDeviceToken";
NSString *const MiPush_didReceiveRemoteNotification = @"MiPush_didReceiveRemoteNotification";
NSString *const MiPush_didReceiveRemoteNotification_ActiveState=@"MiPush_didReceiveRemoteNotification_ActiveState";
NSString *const MiPush_didReceiveLocalNotification = @"MiPush_didReceiveLocalNotification";
NSString *const MiPush_requestSuccWithSelector = @"MiPush_requestSuccWithSelector";
NSString *const MiPush_requestErrWithSelector = @"MiPush_requestErrWithSelector";

@implementation RCTMIPushModule

//tokenid获取失败
+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)err
{
//    NSLog(@"tokenID获取失败：%s", __PRETTY_FUNCTION__);
    
    [[NSNotificationCenter defaultCenter] postNotificationName:MiPush_didFailToRegisterForRemoteNotificationsWithError
                                                        object:self
                                                      userInfo:[err localizedDescription]];
}
//
+ (void)didRegisterUserNotificationSettings:(NSDictionary *)notificationSettings
{
    if ([UIApplication instancesRespondToSelector:@selector(registerForRemoteNotifications)]) {
        [[UIApplication sharedApplication] registerForRemoteNotifications];
    }
    
    [[NSNotificationCenter defaultCenter] postNotificationName:MiPush_didRegisterUserNotificationSettings
                                                        object:self
                                                      userInfo:notificationSettings];
}
// 推送消息时，获取设备的tokenid
+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [MiPushSDK bindDeviceToken:deviceToken];
    
    NSMutableString *hexString = [NSMutableString string];
    NSUInteger deviceTokenLength = deviceToken.length;
    const unsigned char *bytes = deviceToken.bytes;
    for (NSUInteger i = 0; i < deviceTokenLength; i++) {
        [hexString appendFormat:@"%02x", bytes[i]];
    }
//    NSLog(@"获取设备ID：%s，%@,%@,deviceToken = %@", __PRETTY_FUNCTION__,hexString,[MiPushSDK getRegId],deviceToken);

    NSDictionary *info = [[NSDictionary alloc] initWithObjectsAndKeys:hexString, @"device_token", nil];
    [[NSNotificationCenter defaultCenter] postNotificationName:MiPush_didRegisterForRemoteNotificationsWithDeviceToken
                                                        object:self
                                                      userInfo:info];
}
// 接收到推送消息处理
+ (void)didReceiveRemoteNotification:(NSDictionary *)notification
{
//    NSLog(@"%s", __PRETTY_FUNCTION__);
    NSString *messageId = [notification objectForKey:@"_id_"];
    if (messageId != nil) {
        [MiPushSDK openAppNotify:messageId];
    }
    // 针对长连接做了消息排重合并，只在下面处理即可
//    [MiPushSDK handleReceiveRemoteNotification: notification];
    
    [[NSNotificationCenter defaultCenter] postNotificationName:MiPush_didReceiveRemoteNotification
                                                        object:self
                                                      userInfo:notification];
}
// 获取本地推送消息
+ (void)didReceiveLocalNotification:(UILocalNotification *)notification
{
//    NSLog(@"%s", __PRETTY_FUNCTION__);
    NSMutableDictionary *details = [NSMutableDictionary new];
    if (notification.alertBody) {
        details[@"alertBody"] = notification.alertBody;
    }
    if (notification.userInfo) {
        details[@"userInfo"] = RCTJSONClean(notification.userInfo);
    }
    
    [[NSNotificationCenter defaultCenter] postNotificationName:MiPush_didReceiveLocalNotification
                                                        object:self
                                                      userInfo:details];
}

+ (void)didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
//    NSLog(@"设备初始化：%s sdk: %@", __PRETTY_FUNCTION__, MiPushSDK.getSDKVersion);
    NSMutableDictionary *initialProperties = [[NSMutableDictionary alloc] init];
    NSDictionary *remoteNotification = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];
        
//    [MiPushSDK registerMiPush:self];

    if (remoteNotification) {
        NSString *messageId = [remoteNotification objectForKey:@"_id_"];
        if (messageId != nil) {
            [MiPushSDK openAppNotify:messageId];
        }
        
        [initialProperties setObject:remoteNotification forKey:@"remoteNotification"];
        [[NSNotificationCenter defaultCenter] postNotificationName:MiPush_didFinishLaunchingWithOptions
                                                            object:self
                                                          userInfo:initialProperties];
    }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {

  NSDictionary * userInfo = notification.request.content.userInfo;
//  NSLog(@"info === %@",userInfo);
  if ([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
      [MiPushSDK handleReceiveRemoteNotification:userInfo];
  }
  completionHandler(UNNotificationPresentationOptionSound);
}

// 点击通知进入应用
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
    NSDictionary * userInfo = response.notification.request.content.userInfo;
    if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
//        [MiPushSDK handleReceiveRemoteNotification:userInfo];
        [RCTMIPushModule didReceiveRemoteNotification:userInfo];
    }
    completionHandler();
}

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;
@synthesize methodQueue = _methodQueue;

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}
- (void)setBridge:(RCTBridge *)bridge
{
    _bridge = bridge;
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleFailToRegisterForRemoteNotificationsWithError:)
                                                 name:MiPush_didFailToRegisterForRemoteNotificationsWithError
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRegisterForRemoteNotificationsWithDeviceToken:)
                                                 name:MiPush_didRegisterForRemoteNotificationsWithDeviceToken
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleReceiveRemoteNotification:)
                                                 name:MiPush_didReceiveRemoteNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleReceiveLocalNotification:)
                                                 name:MiPush_didReceiveLocalNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRegisterUserNotificationSettings:)
                                                 name:MiPush_didRegisterUserNotificationSettings
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleFinishLaunchingWithOptions:)
                                                 name:MiPush_didFinishLaunchingWithOptions
                                               object:nil];
}

- (void)handleRegisterUserNotificationSettings:(NSNotification *)notification
{
//    NSLog(@"%s,notification=%@", __PRETTY_FUNCTION__, notification);
    
    [self sendMiPushEvent:@{
                            @"type": MiPush_didRegisterUserNotificationSettings,
                            @"data": notification.userInfo
                            }];
}
- (void)handleReceiveRemoteNotification:(NSNotification *)notification
{
//    NSLog(@"notification=%@", notification.userInfo);
    
    NSString *type=MiPush_didReceiveRemoteNotification;
    if([UIApplication sharedApplication].applicationState==UIApplicationStateActive)
        type=MiPush_didReceiveRemoteNotification_ActiveState;
//    NSDictionary *dict = @{@"payload": @"{\"pubTime\":\"1577264565023\",\"id\":\"1577264565023\",\"title\":\"研发测试06\",\"type\":\"公告\",\"key\":\"1577264565023公告\",\"content\":\"研发测试06\"}"};
    if([[notification.userInfo allKeys] containsObject:@"payload"])
//    if([[dict allKeys] containsObject:@"payload"])
    {
        [self sendMiPushEvent:@{
                            @"type": type,
                            @"data": [NSString stringWithFormat:@"%@",notification.userInfo[@"payload"]],
                            }];
//        [self sendMiPushEvent:@{
//        @"type": type,
//        @"data": [NSString stringWithFormat:@"%@",dict[@"payload"]],
//        }];
    }
}
- (void)handleFinishLaunchingWithOptions:(NSNotification *)notification
{
//    NSLog(@"notification=%@", notification.userInfo);
    NSString *type=MiPush_didReceiveRemoteNotification;
    if([UIApplication sharedApplication].applicationState==UIApplicationStateActive)
        type=MiPush_didReceiveRemoteNotification_ActiveState;
    if([[notification.userInfo allKeys] containsObject:@"payload"])
    {
        [self sendMiPushEvent:@{
                                @"type":type,
                                @"data": [NSString stringWithFormat:@"%@",notification.userInfo[@"payload"]],
                                }];
    }
}
- (void)handleReceiveLocalNotification:(NSNotification *)notification
{
    [self sendMiPushEvent:@{
                            @"type": MiPush_didReceiveLocalNotification,
                            @"data": notification.userInfo
                            }];
}

- (void)handleRegisterForRemoteNotificationsWithDeviceToken:(NSNotification *)notification
{
//    NSLog(@"%s,notification=%@", __PRETTY_FUNCTION__, notification);
    
    [self sendMiPushEvent:@{
                            @"type": MiPush_didRegisterForRemoteNotificationsWithDeviceToken,
                            @"data": notification.userInfo
                            }];
}

- (void)miPushRequestSuccWithSelector:(NSString *)selector data:(NSDictionary *)data
{
    // 请求成功
//    NSLog(@"%s selector=%@,data=%@", __PRETTY_FUNCTION__, selector, data);
    
    [self sendMiPushEvent:@{
                            @"type": MiPush_requestSuccWithSelector,
                            @"data": data,
                            @"command":selector
                            }];
}

- (void)miPushRequestErrWithSelector:(NSString *)selector error:(int)error data:(NSDictionary *)data
{
//    NSLog(@"%s selector=%@,data=%@", __PRETTY_FUNCTION__, selector, data);
    if (!data) {
        data = @{};
    }
    
    [self sendMiPushEvent:@{
                            @"type": MiPush_requestErrWithSelector,
                            @"command": selector,
                            @"error": @(error),
                            @"data": data
                            }];
}

- (void)miPushReceiveNotification:( NSDictionary *)data
{
    
//    NSLog(@"%s,data=%@", __PRETTY_FUNCTION__, data);
    // 长连接收到的消息。消息格式跟APNs格式一样
//    [self sendMiPushEvent:@{
//                            @"type": MiPush_didReceiveRemoteNotification,
//                            @"data": data
//                            }];
}

- (void)sendMiPushEvent:(id)body
{
    NSDictionary *info = body;
    NSMutableDictionary *newInfo = [[NSMutableDictionary alloc] initWithDictionary:info];
    dispatch_async(_methodQueue, ^{
        [_bridge.eventDispatcher sendDeviceEventWithName:@"mipush" body:newInfo];
    });
}
//注册小米推送
RCT_EXPORT_METHOD(registerMiPush)
{
    [MiPushSDK registerMiPush:self];
}
//注册小米推送和长连接推送
RCT_EXPORT_METHOD(registerMiPushWithType:(int)type)
{
    [MiPushSDK registerMiPush:self type:(UIRemoteNotificationType)type];
}
//注册小米推送和长连接推送
RCT_EXPORT_METHOD(registerMiPushAndConnect:(BOOL)isConnect type:(int)type)
{
    [MiPushSDK registerMiPush:self type:(UIRemoteNotificationType)type connect:isConnect];
}
//注销小米推送
RCT_EXPORT_METHOD(unregisterMiPush)
{
    [MiPushSDK unregisterMiPush];
}
//小米推送绑定token
RCT_EXPORT_METHOD(bindDeviceToken:(NSString *)hexDeviceToken)
{
    NSMutableData * deviceToken = [[NSMutableData alloc] init];
    char bytes[3] = {'\0', '\0', '\0'};
    for (int i=0; i<[hexDeviceToken length] / 2; i++) {
        bytes[0] = [hexDeviceToken characterAtIndex:i*2];
        bytes[1] = [hexDeviceToken characterAtIndex:i*2+1];
        unsigned char c = strtol(bytes, NULL, 16);
        [deviceToken appendBytes:&c length:1];
    }
    
    [MiPushSDK bindDeviceToken:deviceToken];
}
//设置别名
RCT_EXPORT_METHOD(setAlias:(NSString *)alias)
{
    [MiPushSDK setAlias:alias];
}
//取消别名
RCT_EXPORT_METHOD(unsetAlias:(NSString *)alias)
{
    [MiPushSDK unsetAlias:alias];
}
//设置账号
RCT_EXPORT_METHOD(setAccount:(NSString *)account)
{
#if RCT_DEV
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        [MiPushSDK setAccount:account];
    });
#else
    [MiPushSDK setAccount:account];
#endif
}
//注销账号
RCT_EXPORT_METHOD(unsetAccount:(NSString *)account)
{
    [MiPushSDK unsetAccount:account];
}
//设置订阅
RCT_EXPORT_METHOD(subscribe:(NSString *)topic)
{
    [MiPushSDK subscribe:topic];
}
//取消订阅
RCT_EXPORT_METHOD(unsubscribe:(NSString *)topic)
{
    [MiPushSDK unsubscribe:topic];
}

RCT_EXPORT_METHOD(openAppNotify:(NSString *)messageId)
{
    [MiPushSDK openAppNotify:messageId];
}

RCT_EXPORT_METHOD(getAllAliasAsync)
{
    [MiPushSDK getAllAliasAsync];
}

RCT_EXPORT_METHOD(getAllAccountAsync)
{
    [MiPushSDK getAllAccountAsync];
}

RCT_EXPORT_METHOD(getAllTopicAsync)
{
    [MiPushSDK getAllTopicAsync];
}
//获取小米推送SDK版本号
RCT_EXPORT_METHOD(getSDKVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString * sdkVersion = [MiPushSDK getSDKVersion];
    
    resolve(sdkVersion);
}
//获取小米推送RegId
RCT_EXPORT_METHOD(getRegId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString * RegId = [MiPushSDK getRegId];
    
    resolve(RegId);
}
//获取推送状态
RCT_EXPORT_METHOD(isOpen:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    
    NSString *result = @"open";
    
    UIUserNotificationSettings * settings = [[UIApplication sharedApplication] currentUserNotificationSettings];
    if (settings.types == UIUserNotificationTypeNone) {
        result = @"close";
    }
    
    resolve(result);
}

@end
