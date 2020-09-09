//
//  YDYunChannelModule.h
//  investapp
//
//  Created by 崔文娟 on 2019/1/17.
//  Copyright © 2019年 Facebook. All rights reserved.
//
/**
 1.grpc官方文档中文 http://doc.oschina.net/grpc?t=60140
 官方文档https://grpc.io/docs/tutorials/basic/objective-c.html
 2.需要安装cocopod https://www.jianshu.com/p/f43b5964f582
 3.cocopod 安装成功后进入当前ios项目根目录执行pod install
 */

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <React/RCTEventEmitter.h>

@interface YDYunChannelModule : RCTEventEmitter <RCTBridgeModule>

@end
