//
//  NativeConfigModule.m
//  investapp
//
//  Created by lishuai on 2019/7/15.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "NativeConfigModule.h"
#import "YDConfiguration.h"

@implementation NativeConfigModule

RCT_EXPORT_MODULE();

#pragma mark - RCT_EXPORT_METHOD
// 获取当前使用的行情服务器地址
RCT_EXPORT_METHOD(YD_GetCurrentQuoteServerAddress:(RCTResponseSenderBlock)callback) {
  NSString *address = [YDConfiguration.defaultConfig yd_currentQuoteServerAddress];
  callback(@[[NSNull null], address]);
}

// 修改行情服务器地址
RCT_EXPORT_METHOD(YD_SetCurrentQuoteServerAddress:(nonnull NSString *)address) {
  [YDConfiguration.defaultConfig yd_setQuoteServerAddress:address];
}

@end
