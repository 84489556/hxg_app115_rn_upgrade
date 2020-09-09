//
//  YDYunChannelModule.m
//  investapp
//
//  Created by 崔文娟 on 2019/1/17.
//  Copyright © 2019年 Facebook. All rights reserved.
//

#import "YDYunChannelModule.h"
#import <glue_service/GlueService.pbrpc.h>
#import "GRPCCall+Tests.h"
#import <RxLibrary/GRXBufferedPipe.h>
#import "YDStockManager.h"
#import "NSString+Extend.h"
#import "NSObject+Extend.h"

static NSString * const kFetchDataErrorEvent = @"fetchDataErrorEvent"; /// 请求发生了error
static NSString * const kSingleStreamDataEventName = @"ydChannelMessage"; ///<发送单向流数据事件名称
static NSString * const kTwo_wayStreamDataEventName = @"ydChannelMessage4Quote"; ///<发送双向流数据事件名称
static NSString * const kBlockSortDataEventName = @"ydChannelBlockSortMessage"; ///<发送板块排序数据事件名称
static NSString * const kBlockSortQuoteDataEventName = @"ydChannelBlockSortQuoteMessage"; ///<发送板块排序报价数据事件名称

@interface YDYunChannelModule ()

@property (nonatomic, copy) NSString *ydToken;
@property (nonatomic, strong) FundGlueService *client;
@property (nonatomic, strong) NSDictionary * responseDes;
@property (nonatomic, strong) NSMutableDictionary * pidDictionary;

@end

@implementation YDYunChannelModule

RCT_EXPORT_MODULE(YDYunChannelModule);

+ (instancetype)allocWithZone:(struct _NSZone *)zone {
  static YDYunChannelModule *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

- (FundGlueService *)client {
  return YDStockManager.shareMgr.client;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[kSingleStreamDataEventName, kTwo_wayStreamDataEventName, kBlockSortDataEventName, kBlockSortQuoteDataEventName,kFetchDataErrorEvent];
}

#pragma mark - RCT_EXPORT_METHOD
// FetchPriVol 获取某个股票的加量统计结果 return stream
RCT_EXPORT_METHOD(FetchPriVolNative:(NSString *)str) {
  [self fetchPriVol:str];
}

// FetchCandleStick 获取指定股票的K线数据 return stream
RCT_EXPORT_METHOD(FetchCandleStickNative:(NSString *)str) {
  //  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchCandleStick:str];
}

// FetchBlockSort 按照指定的抬头获取某个板块的排序数据并订阅快照数据 return stream
RCT_EXPORT_METHOD(FetchBlockSortNative:(NSString *)str) {
  //  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchBlockSort:str];
}

// FetchTicks 指定日期的分笔数据 return stream
RCT_EXPORT_METHOD(FetchTicksNative:(NSString *)str) {
  //  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchTicks:str];
}

// FetchMinData 获取分时数据 return stream
RCT_EXPORT_METHOD(FetchMinDataNative:(NSString *)str) {
  //  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchMinData:str];
}

// FetchHistoryMinData 指定日期分时
RCT_EXPORT_METHOD(FetchHistoryMinDataNative:(NSString *)str) {
  //  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchHistoryMinData:str];
}

// FetchStaticQuote 获取指定的股票的快照数据。
RCT_EXPORT_METHOD(FetchStaticQuoteNative:(NSString *)str) {
  //  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchStaticQuote:str];
}

// FetchQuote 获取指定的股票的快照数据  stream，return stream
RCT_EXPORT_METHOD(FetchQuoteNative:(NSString *)str) {
//  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchQuote:str];
}

// FetchFullQuote 与接口FetchQuote作用相同  stream，return stream
RCT_EXPORT_METHOD(FetchFullQuoteNative:(NSString *)str) {
//  printf("%s str: %s\n", __func__, str.UTF8String);
  [self fetchFullQuote:str];
}

// 取消指定的请求
RCT_EXPORT_METHOD(cancel:(int)qid) {
//    printf("%s qid: %d\n", __func__, qid);
  NSString *qidS = [NSString stringWithFormat:@"%d", qid];
  [self deleteValueDictionary:qidS];
}

// 取消FetchQuote的请求
RCT_EXPORT_METHOD(cancelQuote) {
  //  printf("%s\n", __func__);
  [YDStockManager.shareMgr cancelMiniQuote];
}

// 取消FetchFullQuote的请求
RCT_EXPORT_METHOD(cancelFullQuote) {
  //  printf("%s\n", __func__);
  [YDStockManager.shareMgr cancelFullQuote];
}

// shutdown 取消所有
RCT_EXPORT_METHOD(shutdown) {
  //  printf("%s\n", __func__);
  [YDStockManager.shareMgr cancelMiniQuote];
  [YDStockManager.shareMgr cancelFullQuote];
  [self ydShutDown];
}

// getChannelState 获取状态
RCT_EXPORT_METHOD(getChannelState:(RCTResponseSenderBlock)callback) {
  callback([[NSArray alloc] initWithObjects:@1, nil]);
}

// setTokenString设置token
RCT_EXPORT_METHOD(setTokenString:(NSString *)str andCallBack:(RCTResponseSenderBlock)callback) {
  BOOL tokenTrue = [self setToken:str];
  NSNumber *tokenss = [NSNumber numberWithBool:tokenTrue];
  [YDStockManager.shareMgr setToken:str];
  callback([[NSArray alloc] initWithObjects:tokenss, nil]);
}

#pragma mark - Fetch Implementation Methods
// FetchFullQuote 与接口FetchQuote作用相同  stream，return stream
- (void)fetchFullQuote:(NSString *)str {
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *subscribesString = params[@"subcribes"];
  NSString *unsubscribesString = params[@"unsubcribes"];
  if (subscribesString.isNotBlank) {
    NSArray *subscribesArray = [subscribesString componentsSeparatedByString:@","];
    [YDStockManager.shareMgr yd_registerStocks:subscribesArray callback:^(id  _Nonnull x) {
      if ([x isKindOfClass:[NSError class]]) {
        [self sendEventwithNameYD:kFetchDataErrorEvent body:@{}];
      }
      [self sendEventwithNameYD:kTwo_wayStreamDataEventName body:@{@"data":x,@"interfaceName":strD[@"interfaceName"]}];
    }];
  }
  if (unsubscribesString.isNotBlank) {
    NSArray *unsubscribesArray = [unsubscribesString componentsSeparatedByString:@","];
    [YDStockManager.shareMgr yd_unregisterStocks:unsubscribesArray callback:^(id  _Nonnull x) {
      
    }];
  }
}

// FetchQuote 获取指定的股票的快照数据  stream，return stream
- (void)fetchQuote:(NSString *)str {
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *subscribesString = params[@"subcribes"];
  NSString *unsubscribesString = params[@"unsubcribes"];
  
  if (subscribesString.isNotBlank) {
    NSArray *subscribesArray = [subscribesString componentsSeparatedByString:@","];
    [YDStockManager.shareMgr yd_registerStocksForMini:subscribesArray callback:^(id  _Nonnull x) {
      if ([x isKindOfClass:[NSError class]]) {
        [self sendEventwithNameYD:kFetchDataErrorEvent body:@{}];
      }
      [self sendEventwithNameYD:kTwo_wayStreamDataEventName body:@{@"data":x,@"interfaceName":strD[@"interfaceName"]}];
    }];
  }
  if (unsubscribesString.isNotBlank) {
    NSArray *unsubscribesArray = [unsubscribesString componentsSeparatedByString:@","];
    [YDStockManager.shareMgr yd_unregisterStocksForMini:unsubscribesArray callback:^(NSDictionary * _Nonnull x) {
      
    }];
  }
}

// FetchStaticQuote 获取指定的股票的快照数据。
- (void)fetchStaticQuote:(NSString *)str {
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *subcribesString = params[@"subcribes"];
  NSString *unsubcribesString = params[@"unsubcribes"];
  
  QuoteRequest * request = [QuoteRequest message];
  request.subcribesArray = [self stringToArray:subcribesString];
  request.unsubcribesArray = [self stringToArray:unsubcribesString];
  
  GRPCProtoCall *call = [self.client RPCToFetchStaticQuoteWithRequest:request handler:^(MultiMiniQuote * _Nullable response, NSError * _Nullable error) {
    [self getEventHandler:response andNSError:error andDone:nil andParam:str];
  }];
  
  NSString * tokenString =[self getToken];
  call.requestHeaders[@"token"] = tokenString;
  
  [call start];
  call = nil;
  tokenString = nil;
}

// FetchHistoryMinData 指定日期分时
- (void)fetchHistoryMinData:(NSString *)str {
  NSDictionary * strD = [self dictionaryWithJsonString:str];
  NSDictionary * params = strD[@"params"];
  
  HisMinRequest * request = [HisMinRequest message];
  request.label = params[@"label"];
  request.date = [params[@"date"] intValue];
  
  GRPCProtoCall *call = [self.client RPCToFetchHistoryMinDataWithRequest:request handler:^(GluedMinChart * _Nullable response, NSError * _Nullable error) {
    [self getEventHandler:response andNSError:error andDone:nil andParam:str];
  }];
  
  NSString * tokenString =[self getToken];
  call.requestHeaders[@"token"] = tokenString;
  
  [call start];
  call = nil;
}

// FetchMinData 获取分时数据 return stream
- (void)fetchMinData:(NSString *)str {
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *qid = [NSString stringWithFormat:@"%@", strD[@"qid"]];
  
  MinRequest *request = [MinRequest message];
  request.label = params[@"label"];
  request.days = [params[@"days"] intValue];
  request.subscribe = [params[@"subscribe"] boolValue];
  
  GRPCProtoCall *call = [self.client RPCToFetchMinDataWithRequest:request eventHandler:^(BOOL done, GluedMinChart * _Nullable response, NSError * _Nullable error) {
      if (error && [error isKindOfClass:[NSError class]]) {
//        [self sendEventwithNameYD:kFetchDataErrorEvent body:@{}];
      }
      [self getEventHandler:response andNSError:error andDone:done andParam:str];
    
  }];
  
  NSString *tokenString =[self getToken];
  call.requestHeaders[@"token"] = tokenString;
  
  [call start];
  [self setValueDictionary:qid andOjb:call];
}

// FetchTicks 指定日期的分笔数据 return stream
- (void)fetchTicks:(NSString *)str {
  
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *qid = [NSString stringWithFormat:@"%@", strD[@"qid"]];
  
  TickRequest *request = [TickRequest message];
  request.label = params[@"label"];
  request.date = [params[@"date"] intValue];
  request.start = [params[@"start"] intValue];
  request.count = [params[@"time"] intValue];
  request.start = [params[@"count"] intValue];
  request.subscribe = [params[@"subscribe"] boolValue];
  
  GRPCProtoCall *call = [self.client RPCToFetchTicksWithRequest:request eventHandler:^(BOOL done, Ticks * _Nullable response, NSError * _Nullable error) {
    [self getEventHandler:response andNSError:error andDone:done andParam:str];
  }];
  
  NSString *tokenString = [self getToken];
  call.requestHeaders[@"token"] = tokenString;
  [call start];
  [self setValueDictionary:qid andOjb:call];
}

// FetchBlockSort 按照指定的抬头获取某个板块的排序数 return stream
// 获取板块排序数据并注册报价
- (void)fetchBlockSort:(NSString *)str {
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *qid = [NSString stringWithFormat:@"%@", strD[@"qid"]];
  
  GluedSortRequest *request = GluedSortRequest.message;
  request.blockId = params[@"blockid"];
  if ([params objectForKey:@"titleid"]) {
    request.titleId = [params[@"titleid"] intValue];
  }
  if ([params objectForKey:@"fundFlowTitle"]) {
    request.fundFlowTitle = [params[@"fundFlowTitle"] intValue];
  }
  request.desc = [params[@"desc"] boolValue];
  request.start = [params[@"start"] intValue];
  request.count = [params[@"count"] intValue];
  request.subscribe = [params[@"subscribe"] boolValue];
  GRPCProtoCall *call = [self.client RPCToFetchBlockSortWithRequest:request eventHandler:^(BOOL done, FullSortResponse * _Nullable response, NSError * _Nullable error) {
    
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
      if (response) {
        NSMutableArray *values = @[].mutableCopy;
        NSMutableArray *subscribes = @[].mutableCopy;
        
        for (SortEntity *entity in response.dataArray) {
          if (entity.label.isNotBlank) {
            [subscribes addObject:entity.label];
            [values addObject:@{@"Obj": entity.label, @"value": @(entity.value)}];
          }
        }
        // 发送板块排序列表数据
        [self sendEventwithNameYD:kBlockSortDataEventName body:@{@"data":values, @"qid":qid, @"interfaceName":@"FetchBlockSortNative"}];
      } else if (error) {
        
      }
      if (done) {
      
      }
    });
  }];
  
  NSString * tokenString = [self getToken];
  call.requestHeaders[@"token"] = tokenString;
  [call start];
  [self setValueDictionary:qid andOjb:call];
}

// FetchCandleStick 获取指定股票的K线数据 return stream
- (void)fetchCandleStick:(NSString *)str {
  CandleStickRequest *stick = [CandleStickRequest message];
  
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *qid = [NSString stringWithFormat:@"%@", strD[@"qid"]];
  
  stick.label = params[@"label"];
  stick.period = [params[@"period"] intValue];
  stick.split = [params[@"split"] intValue];
  stick.start = [params[@"start"] intValue];
  stick.count = [params[@"count"] intValue];
  stick.time = [params[@"time"] intValue];
  stick.subscribe = [params[@"subscribe"] boolValue];
  
  GRPCProtoCall *call = [self.client RPCToFetchCandleStickWithRequest:stick eventHandler:^(BOOL done, GluedK * _Nullable response, NSError * _Nullable error) {
    [self getEventHandler:response andNSError:error andDone:done andParam:str];
  }];
  
  NSString * tokenString =[self getToken];
  call.requestHeaders[@"token"] = tokenString;
  
  [call start];
  [self setValueDictionary:qid andOjb:call];
}

// FetchPriVol 获取某个股票的加量统计结果 return stream (有点滴注释)
- (void)fetchPriVol:(NSString *)str {
  
  //数据解析
  NSDictionary *strD = [self dictionaryWithJsonString:str];
  NSDictionary *params = strD[@"params"];
  NSString *qid = [NSString stringWithFormat:@"%@", strD[@"qid"]];
  
  //对象赋值
  PriVolRequest *request = [PriVolRequest message];
  request.label = params[@"label"];
  request.date = [params[@"date"] intValue];
  request.subscribe = [params[@"subscribe"] boolValue];
  
  //生成请求对象
  GRPCProtoCall *call= [self.client RPCToFetchPriVolWithRequest:request eventHandler:^(BOOL done, PriceVolume * _Nullable response, NSError * _Nullable error) {
    [self getEventHandler:response andNSError:error andDone:done andParam:str];
  }];
  
  NSString *tokenString = [self getToken];
  //设置token
  call.requestHeaders[@"token"] = tokenString;
  
  //开始执行
  [call start];
  
  //通过qid记录每个请求流，用来停止
  [self setValueDictionary:qid andOjb:call];
  
  //  [call finishWithError:nil];
}

// 字典管理所有请求 关闭请求方法
- (void)setValueDictionary:(NSString *)qid andOjb:(GRPCProtoCall *)call {
  if (!_pidDictionary) {
    _pidDictionary = [[NSMutableDictionary alloc] initWithCapacity:0];
  }
  [_pidDictionary setValue:call forKey:qid];
}

- (void)deleteValueDictionary:(NSString *)qid {
  if (_pidDictionary && _pidDictionary.count > 0) {
    GRPCProtoCall *call = [_pidDictionary objectForKey:qid];
    
    [call finishWithError:nil];
    [_pidDictionary removeObjectForKey:qid];
    call = nil;
  }
}

//停止和qid相关的所有
- (void)stopAllCall {
  if (_pidDictionary && _pidDictionary.count > 0) {
    GRPCProtoCall * call;
    NSArray *keys = [_pidDictionary allKeys];
    for (int i = 0; i < keys.count; i ++) {
      NSString *qid = keys[i];
      call = [_pidDictionary objectForKey:qid];
      [call finishWithError:nil];
      [_pidDictionary removeObjectForKey:qid];
    }
    call = nil;
  }
}

//关闭所有单向流和双向流
- (void)ydShutDown {
  if (self.ydToken) {
    self.ydToken = nil;
  }
  
  if (self.client) {
    self.client = nil;
  }
  [self stopAllCall];
}

//单向流回调方法
- (void)getEventHandler:(id)response andNSError:(NSError *)error andDone:(BOOL)done andParam:(NSString *)param {
  NSDictionary *strD = [self dictionaryWithJsonString:param];
  NSString *qid =[NSString stringWithFormat:@"%@",strD[@"qid"]];
  
  if (response) {
    [self sendEventWithResponse:response andQid:qid];
  } else if(error) {
    [self sendEventwithNameYD:kSingleStreamDataEventName body:@{@"data":error, @"qid":qid}];
  }
  if (done) {
    
  }
}

//双向流回调方法
- (void)getEventHandlerTwoWay:(id)response andNSError:(NSError *)error andDone:(BOOL)done andParam:(NSString *)param {
  NSDictionary * strD = [self dictionaryWithJsonString:param];
  NSString * interfaceName = strD[@"interfaceName"];
  
  if (response) {
    [self sendEventWithTwoWayResponse:response andInterfaceName:interfaceName];
  } else if(error) {
    
  }
  if (done) {
    
  }
}

#pragma mark - 向RN发消息
// 向RN发送通知 单向流
- (void)sendEventWithResponse:(NSObject *)response andQid:(NSString *)qid {
  NSDictionary *des = [response convertToDictionary];
  [self sendEventwithNameYD:kSingleStreamDataEventName body:@{@"data":des, @"qid":qid}];
}

// 向RN发送通知 双向流向流
- (void)sendEventWithTwoWayResponse:(NSObject *)response andInterfaceName:(NSString *)interface {
  NSDictionary *des = [response convertToDictionary];
  [self sendEventwithNameYD:kTwo_wayStreamDataEventName body:@{@"data":des,@"interfaceName":interface}];
}

- (void)sendEventwithNameYD:(NSString *)name body:(id)body {
  if (self.bridge) {
    [self sendEventWithName:name body:body];
  } else {
    [self ydShutDown];
  }
}

#pragma mark - Other
//生成随机token
- (NSString *)randomStringWithLength:(NSInteger)len {
  NSString *letters = @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  NSMutableString *randomString = [NSMutableString stringWithCapacity: len];
  
  for (NSInteger i = 0; i < len; i++) {
    NSUInteger random = (NSUInteger)arc4random_uniform((uint32_t)[letters length]);
    [randomString appendFormat: @"%C", [letters characterAtIndex:random]];
  }
  return randomString;
}

- (NSString *)getToken {
  if (!self.ydToken || [self.ydToken isEqualToString:@""]) {
    self.ydToken = [self randomStringWithLength:6];
  }
  return self.ydToken;
}

- (BOOL)setToken:(NSString *)tokenString {
  BOOL tokenS = YES;
  if ([tokenString isEqualToString:@""]) {
    self.ydToken = nil;
    tokenS = NO;
  } else {
    if (!(self.ydToken && self.ydToken.length > 6)) {
      self.ydToken = tokenString;
    }
    tokenS = true;
  }
  return tokenS;
}

//字符串转字典
- (NSDictionary *)dictionaryWithJsonString:(NSString *)jsonString {
  if (jsonString == nil) {
    return nil;
  }
  NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
  NSError *err;
  NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingMutableContainers error:&err];
  return dic;
}

//分割字符串为数据
- (NSMutableArray *)stringToArray:(NSString *)str{
  NSMutableArray *array = [[str componentsSeparatedByString:@","] mutableCopy];
  if ([array.lastObject isEqualToString:@""]) {
    [array removeLastObject];
  }
  return array;
}

@end
