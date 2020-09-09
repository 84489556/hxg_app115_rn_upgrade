//
//  YDStockManager.h
//  investapp
//
//  Created by lishuai on 2019/4/9.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <glue_service/GlueService.pbrpc.h>

NS_ASSUME_NONNULL_BEGIN

typedef void(^CallbackForSingleArg)(id x);

@interface YDStock : NSObject
@property (nonatomic, copy) NSString *code;
@property (nonatomic, strong) id data;
@property (nonatomic, strong) CallbackForSingleArg callback;
@property (nonatomic, strong, readonly) NSMutableArray<CallbackForSingleArg> *callbacks;
- (void)yd_addCallback:(CallbackForSingleArg)callback;
- (void)yd_removeCallback:(CallbackForSingleArg)callback;

@end

@interface YDStockManager : NSObject

@property (nonatomic, strong, readonly) FundGlueService *client;

+ (instancetype)shareMgr;

- (void)setToken:(NSString *)token;

// 取消Mini报价双向流
- (void)cancelMiniQuote;
// 取消Full报价双向流
- (void)cancelFullQuote;

#pragma mark - Full报价
/**
 注册全报价数据。内部真实的注册接口只会调用一次
 TODO...同一个股票或指数多次调用此接口的时候只会给该股票或指数添加一个回调

 @param codes 要注册的股票或指数代码集合
 @param callback 回调，从服务器获取到数据后会调用此回调
 */
- (void)yd_registerStocks:(NSArray<NSString *> *)codes callback:(CallbackForSingleArg)callback;

/**
 注销全报价数据。由于注册接口的回调机制未实现，所以注销接口的内部实现是先判断该个股或指数是否已注册，若注册则把该股票或指数注销掉
 TODO...注销的时候应该是先从该股票或指数的回调集合中移除此回调，再判断该股票或指数的回调集合是否为空，为空则执行注销操作；否则本次注销仅仅是从回调集合中移除了一个回调

 @param codes 要注销的股票或指数代码集合
 @param callback 暂时未用到
 */
- (void)yd_unregisterStocks:(NSArray<NSString *> *)codes callback:(CallbackForSingleArg)callback;

#pragma mark - Mimi报价
/**
 功能与注册全报价一样，只是返回的数据是MiniQuote
 */
- (void)yd_registerStocksForMini:(NSArray<NSString *> *)codes callback:(CallbackForSingleArg)callback;

/**
 功能与注销全报价一样
 */
- (void)yd_unregisterStocksForMini:(NSArray<NSString *> *)codes callback:(CallbackForSingleArg)callback;

@end

NS_ASSUME_NONNULL_END
