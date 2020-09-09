//
//  YDConfiguration.h
//  investapp
//
//  Created by lishuai on 2019/7/15.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface YDConfiguration : NSObject

+ (instancetype)defaultConfig;

- (NSString *)yd_currentQuoteServerAddress;

- (void)yd_setQuoteServerAddress:(NSString *)address;

- (NSString *)yd_quoteServerHostName;

- (NSString *)yd_quoteHistoryKlineStickUrl;

@end

NS_ASSUME_NONNULL_END
