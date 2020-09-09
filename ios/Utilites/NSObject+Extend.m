//
//  NSObject+Extend.m
//  investapp
//
//  Created by lishuai on 2019/5/17.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "NSObject+Extend.h"
#import <CoreGraphics/CGBase.h>
#import <objc/runtime.h>

@implementation NSObject (Extend)

- (NSDictionary *)convertToDictionary {
  NSMutableDictionary *dic = [NSMutableDictionary dictionary];
  unsigned int propsCount;
  objc_property_t *props = class_copyPropertyList([self class], &propsCount);//获得属性列表
  for (int i = 0; i < propsCount; i++) {
    objc_property_t prop = props[i];
    
    NSString *propName = [NSString stringWithUTF8String:property_getName(prop)];//获得属性的名称
    id value = [self valueForKey:propName];//kvc读值
    
    if (value == nil) {
      value = [NSNull null];
    } else {
      value = [self getObjectInternal:value andKey:propName];//自定义处理数组，字典，其他类
    }
    [dic setObject:value forKey:propName];
  }
  free(props);
  return dic;
  
}

- (id)getObjectInternal:(id)obj andKey:(id)key {
  
  if ([obj isKindOfClass:[NSString class]] || [obj isKindOfClass:[NSNull class]]) {
    return obj;
  }
  
  if ([obj isKindOfClass:[NSNumber class]]) {
    //换手率 出现无穷大inf和nan 进行处理
    NSNumber * num = obj;
    CGFloat  numF =  [num floatValue];
    //都赋值为0.0
    if(isnan(numF)){
      obj = [NSNumber numberWithFloat:0.0];
    }
    if(isinf(numF)){
      obj = [NSNumber numberWithFloat:0.0];
    }
    return obj;
  }
  if ([obj isKindOfClass:[NSArray class]]) {
    NSArray *objarr = obj;
    NSMutableArray *arr = [NSMutableArray arrayWithCapacity:objarr.count];
    for (int i = 0; i < objarr.count; i++) {
      [arr setObject:[self getObjectInternal:[objarr objectAtIndex:i] andKey:@"array"] atIndexedSubscript:i];
    }
    return arr;
  }
  
  if ([obj isKindOfClass:[NSDictionary class]]) {
    NSDictionary *objdic = obj;
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:[objdic count]];
    for (NSString *key in objdic.allKeys) {
      [dic setObject:[self getObjectInternal:[objdic objectForKey:key] andKey:key] forKey:key];
    }
    return dic;
  }
  return [obj convertToDictionary];
}

@end
