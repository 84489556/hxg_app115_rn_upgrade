//
//  NSString+Extend.m
//  investapp
//
//  Created by lishuai on 2019/4/29.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "NSString+Extend.h"

@implementation NSString (Extend)
- (BOOL)isNotBlank {
  NSCharacterSet *blank = [NSCharacterSet whitespaceAndNewlineCharacterSet];
  for (NSInteger i = 0; i < self.length; ++i) {
    unichar c = [self characterAtIndex:i];
    if (![blank characterIsMember:c]) {
      return YES;
    }
  }
  return NO;
}
@end
