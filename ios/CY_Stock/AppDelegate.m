/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <UMShare/UMShare.h>
#import <UMCommonLog/UMCommonLogHeaders.h>
#import <UMCommon/UMConfigure.h>
#import "RCTMIPushModule.h"
#import "Orientation.h"
#import <SensorsAnalyticsSDK/SensorsAnalyticsSDK.h>

NSString * const kUmengAppkey = @"5d64fdfb3fc1959c04000c1d";
NSString * const kWechatAppkey = @"wx72526fb70395d242";
NSString * const kWechatAppSecret = @"413dc348ce88c84324ffbe4ee3c0ef8a";
NSString * const kSinaAppkey = @"3270306123";
NSString * const kSinaAppSecret = @"5f21be57ff55aad052efd124d54d730d";
NSString * const kQQAppkey = @"1108126508";
NSString * const kQQAppSecret = @"bdtiB3UuTibxvVdC";
NSString * const kRedirectURL = @"https://www.yd.com.cn/";

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  
  [RCTMIPushModule didFinishLaunchingWithOptions:launchOptions];
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"CY_Stock" initialProperties:nil];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  UIStoryboard *storyBoard = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle:nil];
  UIViewController *vc = [storyBoard instantiateInitialViewController];
  rootView.loadingView = vc.view;

  // 初始化神策分析
  [self configSensorsAnalyticsWithLaunchOptions:launchOptions];
  // U-Share 平台设置
  [self configUSharePlatforms];
  [self confitUShareSettings];
  return YES;
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [RCTMIPushModule didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification {
  [RCTMIPushModule didReceiveRemoteNotification:notification];
}

//点击通知进入应用
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [RCTMIPushModule didReceiveRemoteNotification:notification];
  completionHandler(UIBackgroundFetchResultNewData);
}

// iOS10新加入的回调方法
// 应用在前台收到通知
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  completionHandler(UNNotificationPresentationOptionAlert);
}

- (void)application:(UIApplication *) application didRegisterUserNotificationSettings:(nonnull UIUserNotificationSettings *)notificationSettings {
  if (notificationSettings) {
    NSMutableDictionary *setting = [[NSMutableDictionary alloc] init];
    NSString *typeStr = [NSString stringWithFormat:@"%lu",(unsigned long)notificationSettings.types];
    [setting setObject:typeStr forKey:@"type"];
    [RCTMIPushModule didRegisterUserNotificationSettings:setting];
  }
}

- (void)application:(UIApplication *)app didFailToRegisterForRemoteNotificationsWithError:(NSError *)err {
  // 注册APNS失败
  //  [RCTMIPushModule didFailToRegisterForRemoteNotificationsWithError:err];
}

- (void)applicationWillResignActive:(UIApplication *)application {
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;//清空角标
}

// 初始化神策分析
-(void)configSensorsAnalyticsWithLaunchOptions:(NSDictionary *)launchOptions{
  // 初始化配置
    //慧选股测试：
    //sa1ed6e4d7
    //https://yuandaxinxi.datasink.sensorsdata.cn/sa?project=huixuangu_default&token=f770359d41723c39
    //慧选股正式：
    //sa079d614e
    //https://yuandaxinxi.datasink.sensorsdata.cn/sa?project=huixuangu_production&token=f770359d41723c39
    BOOL isProduction = NO;
    NSString *sensorsdataServerURL = @"";
    if (isProduction) {
      sensorsdataServerURL = @"https://yuandaxinxi.datasink.sensorsdata.cn/sa?project=huixuangu_production&token=f770359d41723c39";
    } else {
      sensorsdataServerURL = @"https://yuandaxinxi.datasink.sensorsdata.cn/sa?project=huixuangu_default&token=f770359d41723c39";
    }
    SAConfigOptions *options = [[SAConfigOptions alloc] initWithServerURL:sensorsdataServerURL launchOptions:launchOptions];
    // 开启全埋点，可根据需求进行组合
    options.autoTrackEventType = SensorsAnalyticsEventTypeAppStart |
                   SensorsAnalyticsEventTypeAppEnd |
                   SensorsAnalyticsEventTypeAppClick |
                   SensorsAnalyticsEventTypeAppViewScreen;
    options.enableVisualizedAutoTrack = YES;
    options.enableTrackAppCrash = YES;
  #ifdef DEBUG
    // SDK 开启 Log
    options.enableLog = NO;
    options.enableHeatMap = YES;
  #endif
    // 初始化 SDK
    [SensorsAnalyticsSDK startWithConfigOptions:options];
  
}

- (void)confitUShareSettings {
  #if DEBUG
      [UMConfigure setLogEnabled:YES];
  #endif
  [UMConfigure initWithAppkey:kUmengAppkey channel:nil];
  [UMCommonLogManager setUpUMCommonLogManager];
  [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
}

- (void)configUSharePlatforms {
  // 设置微信的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession appKey:kWechatAppkey appSecret:kWechatAppSecret redirectURL:kRedirectURL];
  // 设置分享到QQ互联的appID U-Share SDK为了兼容大部分平台命名，统一用appKey和appSecret进行参数设置，而QQ平台仅需将appID作为U-Share的appKey参数传进即可。
  // 设置QQ平台的appID
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ appKey:kQQAppkey appSecret:kQQAppSecret redirectURL:kRedirectURL];
  // 设置新浪的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:kSinaAppkey appSecret:kSinaAppSecret redirectURL:kRedirectURL];
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  
  BOOL result = [[UMSocialManager defaultManager] handleOpenURL:url];
  if (!result) {
    // 其他如支付等SDK的回调
    // 神策
    if ([[SensorsAnalyticsSDK sharedInstance] handleSchemeUrl:url]) {
      return YES;
    }
  }
  return result;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#if RCT_DEV
- (BOOL)bridge:(RCTBridge *)bridge didNotFindModule:(NSString *)moduleName {
  return YES;
}
#endif

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return Orientation.getOrientation;
}

@end
