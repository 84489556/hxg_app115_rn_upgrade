//
//  NativeToRNEventEmitter.m
//  CY_Stock
//
//  Created by lishuai on 2019/12/20.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "NativeToRNEventEmitter.h"

@implementation NativeToRNEventEmitter

+ (instancetype)shareInstance {
    static NativeToRNEventEmitter *instance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[NativeToRNEventEmitter alloc] init];
    });
    return instance;
}

RCT_EXPORT_MODULE();

//init方法中使用NSNotificationCenter监听iOS端要发送事件的操作
- (instancetype)init {
    if (self = [super init]) {
        [self registerNotifications];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

//在NSNotification对应的通知方法中将事件发送给RN
- (void)registerNotifications {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendCustomEvent:)
                                                 name:@"MinMainResult"
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendKLineEvent:)
                                                 name:@"KLineCrossNotification"
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendMinLineEvent:)
                                                 name:@"MinCrossNotification"
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendNextFormulaEvent:)
                                                 name:@"nextFormulaNotification"
                                               object:nil];
}

- (void)sendCustomEvent:(NSNotification *)notification {
    //    NSString *eventName = notification.userInfo[@"name"];
  [self sendEventWithName:@"MinMainResult" body:notification.object];
}

- (void)sendKLineEvent:(NSNotification *)notification {
  [self sendEventWithName:@"KLineCrossNotification" body:notification.object];
}

- (void)sendMinLineEvent:(NSNotification *)notification {
  [self sendEventWithName:@"MinCrossNotification" body:notification.object];
}

- (void)sendNextFormulaEvent:(NSNotification *)notification {
  [self sendEventWithName:@"nextFormulaNotification" body:notification.object];
}

#pragma RCTEventEmitter
//重写supportedEvents方法，在这个方法中声明支持的事件名称
- (NSArray<NSString *> *)supportedEvents {
    return @[@"MinMainResult",@"KLineCrossNotification",@"MinCrossNotification",@"nextFormulaNotification"];
}

@end
