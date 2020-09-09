//
//  CallPhoneModule.m
//  investapp
//
//  Created by 崔文娟 on 2017/11/8.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "CallPhoneModule.h"
#import "NSString+Extend.h"

@implementation CallPhoneModule

RCT_EXPORT_MODULE(CallPhoneModuleIos);

RCT_EXPORT_METHOD(callPhone: (NSString *)phone){
  if (!phone.isNotBlank) return;
  NSString *str = [[NSString alloc] initWithFormat:@"tel://%@", phone];
  NSURL *url = [NSURL URLWithString:str];
  if ([UIApplication.sharedApplication canOpenURL:url]) {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:str]];
  }
}

RCT_EXPORT_METHOD(checkVersionUpdata) {
  //更换id即可
  NSString *str = @"https://ydhxg-prod-web2.yd.com.cn/app-download";//@"itms-apps://itunes.apple.com/cn/app/id1493165872?mt=8";
  NSURL *url = [NSURL URLWithString:str];
  if ([UIApplication.sharedApplication canOpenURL:url]) {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:str]];
  }
}

RCT_EXPORT_METHOD(closeApp){
  exit(0);
}

@end
