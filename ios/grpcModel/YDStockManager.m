//
//  YDStockManager.m
//  investapp
//
//  Created by lishuai on 2019/4/9.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YDStockManager.h"
#import <RxLibrary/GRXBufferedPipe.h>
#import "GRPCCall+Tests.h"
#import "NSString+Extend.h"
#import "NSObject+Extend.h"
#import "YDConfiguration.h"
#include <grpc/grpc.h>

@interface YDStock ()
@property (nonatomic, strong, readwrite) NSMutableArray<CallbackForSingleArg> *callbacks;
@end

@implementation YDStock

- (instancetype)initWithCode:(NSString *)code callback:(CallbackForSingleArg)callback {
  self = [super init];
  if (self) {
    _code = code;
    _callback = [callback copy];
    [self yd_addCallback:callback];
  }
  return self;
}

- (NSMutableArray<CallbackForSingleArg> *)callbacks {
  if (!_callbacks) {
    _callbacks = [NSMutableArray new];
  }
  return _callbacks;
}

- (void)yd_addCallback:(CallbackForSingleArg)callback {
  if (![self.callbacks containsObject:callback]) {
    [self.callbacks addObject:[callback copy]];
  }
}
- (void)yd_removeCallback:(CallbackForSingleArg)callback {
  if ([self.callbacks containsObject:callback]) {
    [self.callbacks removeObject:callback];
  }
}
@end

@interface YDStockManager () {
  NSString *_token;
}
@property (nonatomic, strong) GRXBufferedPipe *fullQuoteWrite;
@property (nonatomic, strong) GRXBufferedPipe *miniQuoteWrite;
@property (nonatomic, strong) GRPCProtoCall *fullCall;
@property (nonatomic, strong) GRPCProtoCall *miniCall;
@property (nonatomic, strong, readwrite) FundGlueService *client;
@property (nonatomic, strong) NSMutableArray<YDStock *> *stocks;
@end

@implementation YDStockManager

+ (instancetype)shareMgr {
  static YDStockManager *instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[self alloc] init];
    [instance grpcConfig];
  });
  return instance;
}

- (dispatch_queue_t)getMgrQueue {
  static dispatch_queue_t mgr_queue;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    mgr_queue = dispatch_queue_create("com.yuanda.data-service.queue", DISPATCH_QUEUE_SERIAL);
  });
  return mgr_queue;
}

- (NSMutableArray<YDStock *> *)stocks {
  if (!_stocks) {
    _stocks = [NSMutableArray new];
  }
  return _stocks;
}

- (void)grpcConfig {
  if (!_client) {
    NSString *host = [YDConfiguration.defaultConfig yd_quoteServerHostName];
    NSString *address = [YDConfiguration.defaultConfig yd_currentQuoteServerAddress];
    GRPCMutableCallOptions *options = [[GRPCMutableCallOptions alloc] init];
    options.timeout = 5;
    options.additionalChannelArgs = @{@GRPC_ARG_KEEPALIVE_TIME_MS: @(1000*90),
                                      @GRPC_ARG_KEEPALIVE_TIMEOUT_MS: @(1000*90),
                                      @GRPC_ARG_HTTP2_MAX_PINGS_WITHOUT_DATA: @(0),
                                      @GRPC_ARG_HTTP2_MIN_SENT_PING_INTERVAL_WITHOUT_DATA_MS: @(1000 * 60 * 2)};
    _client = [[FundGlueService alloc] initWithHost:address callOptions:options];
    [GRPCCall useTestName:host forHost:address];
  }
}

- (BOOL)yd_containsStock:(NSString *)code {
  NSArray *stocks_copy = self.stocks.copy;
  for (YDStock *stock in stocks_copy) {
    if ([stock.code isEqualToString:code]) {
      return YES;
    }
  }
  return NO;
}

- (YDStock *)yd_stockWithCode:(NSString *)code {
  NSArray *stocks_copy = self.stocks.copy;
  for (YDStock *stock in stocks_copy) {
    if ([code isEqualToString:stock.code]) {
      return stock;
    }
  }
  return nil;
}

//生成随机token
- (NSString *)randomStringWithLength:(NSInteger)len {
  NSString *letters = @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  NSMutableString *randomString = [NSMutableString stringWithCapacity: len];
  
  for (NSInteger i = 0; i < len; i++) {
    [randomString appendFormat:@"%C", [letters characterAtIndex:arc4random_uniform((uint32_t)[letters length])]];
  }
  return randomString;
}

- (NSString *)getToken {
  return _token;
}

- (void)setToken:(NSString *)token {
  if (!_token.isNotBlank) {
    _token = token;
  }
}

- (void)cancelMiniQuote {
  [_miniQuoteWrite finishWithError:nil];
  _miniQuoteWrite = nil;
}

- (void)cancelFullQuote {
  [_fullQuoteWrite finishWithError:nil];
  _fullQuoteWrite = nil;
}

#pragma mark - Full报价
- (void)yd_registerStocks:(NSArray<NSString *> *)codes callback:(void (^)(id x))callback {
  
  dispatch_async([self getMgrQueue], ^{
    NSMutableArray *codes_copy = codes.mutableCopy;
    for (NSString *code in codes) {
      if (![self yd_containsStock:code]) {
        YDStock *stock = [[YDStock alloc] initWithCode:code callback:^(NSDictionary * _Nonnull x) {
          callback(x);
        }];
        [self.stocks addObject:stock];
      } else {
        //      YDStock *stock = [self yd_stockWithCode:code];
        //      [stock yd_addCallback:^(id  _Nonnull x) {
        //        callback(x);
        //      }];
        [codes_copy removeObject:code];
      }
    }
    if (codes_copy.count) {
      [self yd_fetchFullQuoteWithSubscribes:codes_copy unsubscribes:@[]];
    }
  });
}

- (void)yd_unregisterStocks:(NSArray<NSString *> *)codes callback:(void (^)(id _Nonnull))callback {
  dispatch_async([self getMgrQueue], ^{
    NSMutableArray *unRegCodes = @[].mutableCopy;
    for (NSString *code in codes) {
      if ([self yd_containsStock:code]) {
        YDStock *stock = [self yd_stockWithCode:code];
        
        [self.stocks removeObject:stock];
        [unRegCodes addObject:code];
        //      if ([stock.callbacks containsObject:callback]) {
        //        [stock yd_removeCallback:callback];
        //      }
        
        //      if (stock.callbacks.count == 0) {
        //        [self.stocks removeObject:stock];
        //        [unRegCodes addObject:code];
        //      }
      }
    }
    if (unRegCodes.count) {
      [self yd_fetchFullQuoteWithSubscribes:@[] unsubscribes:unRegCodes.copy];
    }
  });
}

- (void)yd_fetchFullQuoteWithSubscribes:(NSArray *)subscribes unsubscribes:(NSArray *)unsubscribes {
  
  QuoteRequest * request = [QuoteRequest message];
  request.subcribesArray = subscribes.mutableCopy;
  request.unsubcribesArray = unsubscribes.mutableCopy;
  if (!_fullQuoteWrite) {
    _fullQuoteWrite = [[GRXBufferedPipe alloc] init];
    _fullCall = [_client RPCToFetchFullQuoteWithRequestsWriter:_fullQuoteWrite eventHandler:^(BOOL done, GluedQuote * _Nullable response, NSError * _Nullable error) {
      static NSInteger count = 0;
      if (done) {
        [self.fullQuoteWrite finishWithError:error];
        self.fullQuoteWrite = nil;
      } else {
        count = 0;
      }
      if (response) {
        NSDictionary *dict = [response convertToDictionary];
        NSString *code = dict[@"quote"][@"label"];
        YDStock *stock = [self yd_stockWithCode:code];
        for (CallbackForSingleArg block in stock.callbacks) {
          block(dict);
        }
      } else if (error) {
        for (NSString *code in subscribes) {
          YDStock *stock = [self yd_stockWithCode:code];
          for (CallbackForSingleArg block in stock.callbacks) {
            block(error);
          }
        }
      }
    }];
    
    NSString *tokenString = [self getToken];
    _fullCall.requestHeaders[@"token"] = tokenString;
    [_fullCall start];
    while (1) {
      if (_fullQuoteWrite.state == GRXWriterStateStarted) {
        [_fullQuoteWrite writeValue:request];
        break;
      }
      sleep(1);
    }
  } else {
    [_fullQuoteWrite writeValue:request];
  }
}

#pragma mark - Mini报价
- (void)yd_registerStocksForMini:(NSArray<NSString *> *)codes callback:(CallbackForSingleArg)callback {
  dispatch_async([self getMgrQueue], ^{
    NSMutableArray *codes_copy = codes.mutableCopy;
    for (NSString *code in codes) {
      if (![self yd_containsStock:code]) {
        YDStock *stock = [[YDStock alloc] initWithCode:code callback:^(NSDictionary * _Nonnull x) {
          callback(x);
        }];
        [self.stocks addObject:stock];
      } else {
        //      YDStock *stock = [self yd_stockWithCode:code];
        //      [stock yd_addCallback:^(id  _Nonnull x) {
        //        callback(x);
        //      }];
        [codes_copy removeObject:code];
      }
    }
    if (codes_copy.count) {
      
      [self yd_fetchMiniQuoteWithSubscribes:codes_copy unsubscribes:@[]];
    }
  });
}

- (void)yd_unregisterStocksForMini:(NSArray<NSString *> *)codes callback:(CallbackForSingleArg)callback {
  dispatch_async([self getMgrQueue], ^{
    NSMutableArray *unRegCodes = @[].mutableCopy;
    for (NSString *code in codes) {
      if ([self yd_containsStock:code]) {
        YDStock *stock = [self yd_stockWithCode:code];
        
        [self.stocks removeObject:stock];
        [unRegCodes addObject:code];
        //      if ([stock.callbacks containsObject:callback]) {
        //        [stock yd_removeCallback:callback];
        //      }
        
        //      if (stock.callbacks.count == 0) {
        //        [self.stocks removeObject:stock];
        //        [unRegCodes addObject:code];
        //      }
      }
    }
    if (unRegCodes.count) {
      [self yd_fetchMiniQuoteWithSubscribes:@[] unsubscribes:unRegCodes.copy];
    }
  });
}

- (void)yd_fetchMiniQuoteWithSubscribes:(NSArray *)subscribes unsubscribes:(NSArray *)unsubscribes {
  
  QuoteRequest * request = [QuoteRequest message];
  request.subcribesArray = subscribes.mutableCopy;
  request.unsubcribesArray = unsubscribes.mutableCopy;
  
  if (!_miniQuoteWrite) {
    _miniQuoteWrite = [[GRXBufferedPipe alloc] init];
    
    _miniCall = [_client RPCToFetchQuoteWithRequestsWriter:_miniQuoteWrite eventHandler:^(BOOL done, MiniQuote * _Nullable response, NSError * _Nullable error) {
      static NSInteger count = 0;
      if (done) {
        [self.miniQuoteWrite finishWithError:error];
        self.miniQuoteWrite = nil;
      } else {
        count = 0;
      }
      if (response) {
        NSDictionary *dict = [response convertToDictionary];
        NSString *code = dict[@"label"];
        YDStock *stock = [self yd_stockWithCode:code];
        for (CallbackForSingleArg block in stock.callbacks) {
          block(dict);
        }
      } else if (error) {
        for (NSString *code in subscribes) {
          YDStock *stock = [self yd_stockWithCode:code];
          for (CallbackForSingleArg block in stock.callbacks) {
            block(error);
          }
        }
      }
    }];
    _miniCall.requestHeaders[@"token"] = [self getToken];
    [_miniCall start];
    while (1) {
      if (_miniQuoteWrite.state == GRXWriterStateStarted) {
        [_miniQuoteWrite writeValue:request];
        break;
      }
      sleep(1);
    }
  } else {
    [_miniQuoteWrite writeValue:request];
  }
}

@end
