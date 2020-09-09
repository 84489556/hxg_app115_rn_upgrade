//  sharemodule.m
//  Created by Songlcy on 2017/12/01.

#import "sharemodule.h"

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <UMShare/UMShare.h>
//#import <UMSocialCore/UMSocialManager.h>

@implementation sharemodule
RCT_EXPORT_MODULE(sharemodule)

- (UMSocialPlatformType)configPlatform: (NSInteger) platformType {
  
  UMSocialPlatformType type = UMSocialPlatformType_Sina;
  switch (platformType) {
    case 0:
      type = UMSocialPlatformType_QQ;
      break;
    case 1:
      type = UMSocialPlatformType_Sina;
      break;
    case 2:
      type = UMSocialPlatformType_WechatSession;
      break;
    case 3:
      type = UMSocialPlatformType_WechatTimeLine;
      break;
    case 4:
      type = UMSocialPlatformType_Qzone;
      break;
    case 5:
      type = UMSocialPlatformType_Facebook;
      break;
    default:
      break;
  }
  return type;
}

/**
 type:text ,image ,link
 text:文字描述，图片和图文类型中的文字
 shareImage：分享的图片的连接
 thumbImage：缩略图名称 （这里也可以该为连接）
 webpageUrl：连接的url
 title：连接标题
 descr：连接描述
 */
-(UMSocialMessageObject *)setParam:(NSDictionary *)param{
  
  //创建分享消息对象
  UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
  if([param[@"type"] isEqualToString: @"text"]){
    if (param[@"text"]) {
      messageObject.text = param[@"text"];
    }
  }
  
  if([param[@"type"] isEqualToString: @"image"]){
    UMShareImageObject *shareObject = [[UMShareImageObject alloc] init];
    
    //    //只有新浪微博支持
    if (param[@"text"]) {
      messageObject.text = param[@"text"];
    }
    
    if(param[@"shareImage"]) {
      //图片只能是https的  网络图片
      [shareObject setShareImage:param[@"shareImage"]];
      //加载本地图片
      //      shareObject.shareImage = [UIImage imageNamed:param[@"thumbImage"]];
    }
    //    if(param[@"thumbImage"]){
    //      shareObject.thumbImage = [UIImage imageNamed:param[@"thumbImage"]];
    //    }
    messageObject.shareObject = shareObject;
  }
  
  if([param[@"type"] isEqualToString: @"link"]){
    UMShareWebpageObject *shareObject = [[UMShareWebpageObject alloc]init];
    
    if(param[@"webpageUrl"]) {
      shareObject.webpageUrl = param[@"webpageUrl"];
    }
    if(param[@"thumbImage"]){
      shareObject.thumbImage = [UIImage imageNamed:param[@"thumbImage"]];
    }
    if(param[@"title"]){
      shareObject.title =param[@"title"];
    }
    if(param[@"descr"]){
      shareObject.descr = param[@"descr"];
    }
    messageObject.shareObject = shareObject;
  }
  
  return messageObject;
}
// 分享
RCT_EXPORT_METHOD(share:(NSDictionary *)param
                  NSInteger:(NSInteger)platformType
                  callback:(RCTResponseSenderBlock)callback)
{
  if (param[@"type"] == nil) {
    callback(@[@{@"code": @(1), @"description": @"parame error"}]);
    return;
  }
  //创建分享消息对象
  UMSocialMessageObject *messageObject = [self setParam:param];

  dispatch_async(dispatch_get_main_queue(), ^{
    //调用分享接口
    [[UMSocialManager defaultManager] shareToPlatform: [self configPlatform: platformType]  messageObject:messageObject currentViewController:nil completion:^(id data, NSError *error) {
      NSString *message = @"分享成功";
      if (error) {
        UMSocialLogInfo(@"************Share fail with error %@*********%@",error,param);
        if(error.code == 2009){
          message = @"取消分享";
        }else{
          message = @"分享失败";
        }
      }else{
        if ([data isKindOfClass:[UMSocialShareResponse class]]) {
          UMSocialShareResponse *resp = data;
          //分享结果消息
          UMSocialLogInfo(@"response message is %@",resp.message);
          //第三方原始返回的数据
          UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
          //          code = @"200";
          //          message = resp.originalResponse;
        }else{
          UMSocialLogInfo(@"response data is %@",data);
        }

      }
      callback( [[NSArray alloc] initWithObjects:message, nil]);
    }];

  });
}
//
///**
// * 图片分享
// */
//RCT_EXPORT_METHOD(shareImage:(NSString*)imagePath platformType:(NSInteger)platformType callback:(RCTResponseSenderBlock)callback){
//
//  //创建分享消息对象
//  UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
//  //创建图片内容对象
//  UMShareImageObject *shareObject = [[UMShareImageObject alloc] init];
//  //如果有缩略图，则设置缩略图本地
//  UIImage * image = [UIImage imageWithContentsOfFile:imagePath];
//  shareObject.thumbImage = image;
//  [shareObject setShareImage:image];
//  //分享消息对象设置分享内容对象
//  messageObject.shareObject = shareObject;
//
//  dispatch_async(dispatch_get_main_queue(), ^{
//
//    //调用分享接口
//    [[UMSocialManager defaultManager] shareToPlatform:[self configPlatform: platformType] messageObject:messageObject currentViewController:nil completion:^(id data, NSError *error) {
//      NSString *message = @"分享成功";
//      if (error) {
//        UMSocialLogInfo(@"************Share fail with error %@*********",error);
//        message = @"分享失败";
//      }else{
//        if ([data isKindOfClass:[UMSocialShareResponse class]]) {
//          UMSocialShareResponse *resp = data;
//          //分享结果消息
//          UMSocialLogInfo(@"response message is %@",resp.message);
//          //第三方原始返回的数据
//          UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
//
//        }else{
//          UMSocialLogInfo(@"response data is %@",data);
//        }
//      }
//      callback( [[NSArray alloc] initWithObjects:message, nil]);
//    }];
//
//  });
//}
//
// 图文分享
RCT_EXPORT_METHOD(shareLink:(NSString*)title descr:(NSString*)descr
                  webpageUrl:(NSString*)webpageUrl
                  thumbURL:(NSString*)thumbURLl
                  NSInteger:(NSInteger)platformType
                  callback:(RCTResponseSenderBlock)callback
                  )
{
  //创建分享消息对象
  UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
  //创建网页内容对象
  NSString* thumbURL =  thumbURLl;
  UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:title descr:descr thumImage:[UIImage imageNamed:@"shareIcon"]];
  //设置网页地址
  if(!thumbURL){
    shareObject.thumbImage = [UIImage imageNamed:@"shareIcon"];
  }
  shareObject.webpageUrl = webpageUrl;
  //分享消息对象设置分享内容对象
  messageObject.shareObject = shareObject;

  dispatch_async(dispatch_get_main_queue(), ^{
    //调用分享接口
    [[UMSocialManager defaultManager] shareToPlatform: [self configPlatform: platformType]  messageObject:messageObject currentViewController:nil completion:^(id data, NSError *error) {
      NSString *message = @"分享成功";
      if (error) {
        UMSocialLogInfo(@"************Share fail with error %@*********",error);
        if(error.code == 2009){
          message = @"取消分享";
        }else{
          message = @"分享失败";
        }
      }else{
        if ([data isKindOfClass:[UMSocialShareResponse class]]) {
          UMSocialShareResponse *resp = data;
          //分享结果消息
          UMSocialLogInfo(@"response message is %@",resp.message);
          //第三方原始返回的数据
          UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
          //          code = @"200";
          //          message = resp.originalResponse;
        }else{
          UMSocialLogInfo(@"response data is %@",data);
        }

      }
      callback( [[NSArray alloc] initWithObjects:message, nil]);
    }];

  });
  
//  //创建分享消息对象
//  UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
//
//  messageObject.text = @"text";
//
//
//  UMShareImageObject *shareObject = [[UMShareImageObject alloc] init];
//  [shareObject setShareImage:[UIImage imageNamed:@"shareIcon"]];
//
//  messageObject.shareObject = shareObject;
//
//  dispatch_async(dispatch_get_main_queue(), ^{
//    //调用分享接口
//    [[UMSocialManager defaultManager] shareToPlatform: [self configPlatform: platformType]  messageObject:messageObject currentViewController:nil completion:^(id data, NSError *error) {
//      NSString *message = @"分享成功";
//      if (error) {
//        UMSocialLogInfo(@"************Share fail with error %@********",error);
//        if(error.code == 2009){
//          message = @"取消分享";
//        }else{
//          message = @"分享失败";
//        }
//      }else{
//        if ([data isKindOfClass:[UMSocialShareResponse class]]) {
//          UMSocialShareResponse *resp = data;
//          //分享结果消息
//          UMSocialLogInfo(@"response message is %@",resp.message);
//          //第三方原始返回的数据
//          UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
//          //          code = @"200";
//          //          message = resp.originalResponse;
//        }else{
//          UMSocialLogInfo(@"response data is %@",data);
//        }
//
//      }
//      callback( [[NSArray alloc] initWithObjects:message, nil]);
//    }];
//
//  });
}

// 官方不推荐使用该方式
//RCT_EXPORT_METHOD(authLogin:(NSInteger)platformType callback:(RCTResponseSenderBlock)callback){
//  [[UMSocialManager defaultManager] authWithPlatform: [self configPlatform:platformType] currentViewController:nil completion:^(id result, NSError *error) {
//
//    NSDictionary *userdata = nil;
//    NSNumber *code = @0;
//
//    if(error){
//      code = @1;
//      userdata = @{
//                   @"code": code
//                   };
//    } else {
//      UMSocialAuthResponse *authresponse = result;
//
//      userdata = @{
//                   @"code": code,
//                   @"uid": authresponse.uid,
//                   @"accessToken": authresponse.accessToken
//                   };
//    }
//    callback( [[NSArray alloc] initWithObjects: userdata, nil]);
//  }];
//}

//获取能够分享的平台
RCT_EXPORT_METHOD(platformTypeArray:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    BOOL isWeiBo = [[UMSocialManager defaultManager] isInstall: UMSocialPlatformType_Sina];
    BOOL isWeiXin =[[UMSocialManager defaultManager] isInstall: UMSocialPlatformType_WechatSession];
    BOOL isQQ =[[UMSocialManager defaultManager] isInstall: UMSocialPlatformType_QQ];
    
    NSDictionary* userdata = @{
                               @"isWeiXin": @(isWeiXin),
                               @"isQQ": @(isQQ),
                               @"isWeiBo": @(isWeiBo),
                               };
    callback([[NSArray alloc] initWithObjects:userdata, nil]);
  });
}

// 授权第三方登录
RCT_EXPORT_METHOD(authLogin: (NSInteger) platformType callback: (RCTResponseSenderBlock) callback) {
  
  [[UMSocialManager defaultManager] getUserInfoWithPlatform: [self configPlatform: platformType]  currentViewController:nil completion:^(id result, NSError *error) {

      NSNumber *code = @0;
      NSDictionary *userdata = nil;
      if(error) {
        code = @1;
        userdata = @{
                     @"code": code
                   };
      } else {
        UMSocialUserInfoResponse *userinfo = result;
        userdata = @{
          @"code": code,
          @"userInfo": userinfo.originalResponse
        };
//        userdata = @{
//                       @"code": code,
//                       @"userId": userinfo.uid,
//                       @"accessToken": userinfo.accessToken,
//                       @"userName": userinfo.name,
//                       @"userAvatar": userinfo.iconurl,
//                       @"userGender": userinfo.gender,
//                       @"unionGender":userinfo.unionGender,
//                       @"originalResponse":userinfo.originalResponse
//                     };
        
        
//        @"wx_unionid": userinfo.uid,//唯一标识
//        @"wx_avatar": userinfo.iconurl,//头像
        //@"wx_nickname": userinfo.name,//昵称
        //@"wx_sex": userinfo.gender,//性别
        //@"wx_address": userinfo.gender,//地域
        
//        NSLog(@"111111 == %@，userinfo === %@",userinfo.originalResponse,userinfo);
       
      }
     callback( [[NSArray alloc] initWithObjects: userdata, nil]);
  }];
  
}

@end

