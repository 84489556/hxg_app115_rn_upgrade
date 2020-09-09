//
//  YDHistoryCandleStick.h
//  investapp
//
//  Created by 崔文娟 on 2019/3/18.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <React/RCTEventEmitter.h>
#import <historydata_define/HistorydataDefine.pbobjc.h>
#import <data_define/DataDefine.pbobjc.h>

@interface YDHistoryCandleStick : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic, assign) int dataNameIndex;//index文件 对应label内容下标
@property (nonatomic, copy) NSArray *indexFileArray;//index文件内容
@property (nonatomic, assign) NSInteger arrayCount;//当前获取的k线数组数量
@property (nonatomic, strong) CandleStick *candleStick;//当前获取的k线对象

@end
