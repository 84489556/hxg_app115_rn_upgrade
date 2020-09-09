//
//  NativeToRNEventEmitter.h
//  CY_Stock
//
//  Created by lishuai on 2019/12/20.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

@interface NativeToRNEventEmitter : RCTEventEmitter <RCTBridgeModule>

+ (instancetype)shareInstance;

@end

NS_ASSUME_NONNULL_END
