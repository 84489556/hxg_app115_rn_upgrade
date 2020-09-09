//
//  YDConfiguration.m
//  investapp
//
//  Created by lishuai on 2019/7/15.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YDConfiguration.h"
#import "NSString+Extend.h"

//static NSString * const kHostAddress = @"192.168.1.21:5057";
//static NSString * const kHostAddress = @"192.168.1.55:5051";
//static NSString * const kHostAddress = @"192.168.1.130:5051";

// 历史k线数据下载地址
NSString * const kHistoryKlineUrl = @"https://usergate51.ydtg.com.cn/";
NSString * const kHostAddress = @"usergateapp.ydtg.com.cn:5055";//39.106.170.167
NSString * const kGrpcHostName = @"quoteserver.ydtg.com.cn";

@interface YDConfiguration ()
@property (nonatomic, copy) NSString *quoteServerAddress;
@end

@implementation YDConfiguration

+ (instancetype)defaultConfig {
  static YDConfiguration *_config;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    _config = [[self alloc] init];
  });
  return _config;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    [self commonInit];
  }
  return self;
}

- (void)commonInit {
  _quoteServerAddress = kHostAddress;
}

- (NSString *)yd_currentQuoteServerAddress {
  return _quoteServerAddress.isNotBlank ? _quoteServerAddress : @"";
}

- (void)yd_setQuoteServerAddress:(NSString *)address {
  if (!address.isNotBlank) return;
  _quoteServerAddress = address.copy;
}

- (NSString *)yd_quoteServerHostName {
  return kGrpcHostName;
}

- (NSString *)yd_quoteHistoryKlineStickUrl {
  return kHistoryKlineUrl;
}
@end
