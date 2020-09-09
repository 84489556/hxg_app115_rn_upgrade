//
//  YDHistoryCandleStick.m
//  investapp
//
//  Created by 崔文娟 on 2019/3/18.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YDHistoryCandleStick.h"
#import "NSObject+Extend.h"
#import "YDConfiguration.h"

typedef void(^CallBackBlock)(NSData *data);

@implementation YDHistoryCandleStick

RCT_EXPORT_MODULE(YDHistoryCandleStick);

- (NSArray<NSString *> *)supportedEvents {
  return @[@"YDHistoryCandleStick"];
}

RCT_EXPORT_METHOD(getHistoryCanleStick:(NSString *)timeStamp andCode:(NSString *)code andSplit:(NSString *)split andPeriod:(NSString *)period andFetchMore:(NSString *)fetchMoreCout){
  
  if ([fetchMoreCout integerValue] == 0) {
    self.dataNameIndex = -1;
    self.indexFileArray = nil;
  }
  
  [self getIndexData:timeStamp andCode:code andSplit:split andPeriod:period];
}

- (void)getIndexData:(NSString *)timeStamp andCode:(NSString *)code andSplit:(NSString *)split andPeriod:(NSString *)period {
  self.arrayCount = 0;
  self.candleStick = nil;
  
  [self getUserdefaultData:code andSplit:split andPeriod:period];
  NSString *yearS = [self time_dateToString:timeStamp andPeriod:period];
  
  if (self.dataNameIndex >= 0) {

    NSString *fileName = [self getDataFileName];
    if (fileName) {
      [self candleStick:fileName andCode:code andSplit:split andPeriod:period andStamp:nil];
    }
  } else {
    
    NSString * periodString = [self getTempPeriod:timeStamp andCode:code andSplit:split andPeriod:period andIndex:true];
    
    //  NSString * urlString = [NSString stringWithFormat:@"https://usergate.ydtg.com.cn/candleStick_0/_DayK/SH000001/candlestick_SH000001_5_0_index.data"];
    
    [self getData:periodString andBlock:^(NSData *data) {
      NSError *error;
      GPBCodedInputStream *inputStream = [[GPBCodedInputStream alloc] initWithData:data];
      MultiIndex *stick = [[MultiIndex alloc]initWithCodedInputStream:inputStream extensionRegistry:nil error:&error];
      
      if (error) {
        NSLog(@"解析错误");
        return;
      }
      NSArray *array1 = stick.dataArray;
      self.indexFileArray = array1;
      NSString *lastYear = nil;
      if ([array1 count] == 1) {
        self.dataNameIndex = 0;
      }
      for (int i = 0; i < [array1 count]; i++) {
        Index *indexObj = (Index *)array1[i];
        if ([indexObj.label isEqualToString:yearS]) {
          lastYear = indexObj.label;
          self.dataNameIndex = i;
          break;
        }
      }
      
      [self candleStick:lastYear andCode:code andSplit:split andPeriod:period andStamp:timeStamp];
    }];
  }
}

//获取k先文件名
- (NSString *)getDataFileName {
  NSString *fileName = nil;
  if (self.dataNameIndex <= [self.indexFileArray count] && self.dataNameIndex > 0) {
   Index *indexObj = (Index *)self.indexFileArray[self.dataNameIndex - 1];
    self.dataNameIndex = self.dataNameIndex - 1;
    fileName = indexObj.label;
  }
  return fileName;
}

- (void)candleStick:(NSString *)timeString andCode:(NSString *)code andSplit:(NSString *)split andPeriod:(NSString *)period andStamp:(NSString *)stampString {
  
  if (!timeString) return;
  
  NSString *periodString = [self getTempPeriod:timeString andCode:code andSplit:split andPeriod:period andIndex:NO];
  
//  NSString * urlString = [NSString stringWithFormat:@"https://usergate.ydtg.com.cn/candleStick_0/_DayK/SH000001/candlestick_SH000001_5_0_2019.data"];
  
  [self getData:periodString andBlock:^(NSData *data) {
    Byte newByteHeader[4];
    [data getBytes:newByteHeader range:NSMakeRange(0, 4)];
    int headerLenth = (int) ((newByteHeader[0] & 0xff) |
                             ((newByteHeader[1] << 8) & 0xff00) |
                             ((newByteHeader[2] << 16) & 0xff0000) |
                             ((newByteHeader[3] << 24) & 0xff000000));
    
    Byte newByteBody[4];
    [data getBytes:newByteBody range:NSMakeRange(4, 4)];
    int bodayLenthBody = (int) ((newByteBody[0] & 0xff) |
                                ((newByteBody[1] << 8) & 0xff00) |
                                ((newByteBody[2] << 16) & 0xff0000) |
                                ((newByteBody[3] << 24) & 0xff000000));
    
    NSData * dataBody = [data subdataWithRange:NSMakeRange(8+headerLenth, bodayLenthBody)];
    
    NSError *error;
    GPBCodedInputStream *inputStream = [[GPBCodedInputStream alloc] initWithData:dataBody];
    CandleStick *stick = [[CandleStick alloc]initWithCodedInputStream:inputStream extensionRegistry:nil error:&error];
    
    if (error) return;
    
    NSInteger currentArrayCount = stick.entitiesArray_Count;
    
    if (stampString) {
      NSMutableArray *stikcArray = stick.entitiesArray;
      NSMutableArray *newStickA = [[NSMutableArray alloc] init];
      for (CandleStickEntity * obj in stikcArray) {
        if (obj.time < [stampString intValue]) {
          [newStickA addObject:obj];
        }
      }
      stick.entitiesArray = newStickA;
      currentArrayCount = [newStickA count];
    }
    
    self.arrayCount = self.arrayCount + currentArrayCount;
    if (self.candleStick) {
      NSMutableArray * array = stick.entitiesArray;
      [array addObjectsFromArray:self.candleStick.entitiesArray];
      self.candleStick.entitiesArray = array;
    } else {
      self.candleStick = stick;
    }
    if (![self.candleStick.entitiesArray count]) return;
    
    if (self.arrayCount < 460) {
      NSString *fileName = [self getDataFileName];
      if (fileName) {
        [self candleStick:fileName andCode:code andSplit:split andPeriod:period andStamp:nil];
      } else {
        [self sendEventWithTwoWayResponse:stick];
      }
    } else {
      [self sendEventWithTwoWayResponse:stick];
    }
  }];
}

- (void)getData:(NSString *)urlString andBlock:(CallBackBlock)block {
  
  NSURL *url = [NSURL URLWithString:urlString];
  NSURLRequest *request = [NSURLRequest requestWithURL:url];
  NSURLSession *session = [NSURLSession sharedSession];
  NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    
    if (error == nil) {
      block(data);
    }
  }];
  [dataTask resume];
}

- (NSString *)getTempPeriod:(NSString *)timeStamp andCode:(NSString *)code andSplit:(NSString *)split andPeriod:(NSString *)period andIndex:(BOOL)isIndex {
  
//  NSString * urlString1 = [NSString stringWithFormat:@"https://usergate.ydtg.com.cn/candleStick_0/_DayK/SH000001/candlestick_SH000001_5_0_2019.data"];
  NSString *url = [YDConfiguration.defaultConfig yd_quoteHistoryKlineStickUrl];
  NSString *urlString = [NSString stringWithFormat:@"%@candleStick_%@/", url, split];
  NSString *fileName = [NSString stringWithFormat:@"/candlestick_%@_%@_%@", code, period, split];
  NSString *suffix = [NSString stringWithFormat:@"_%@.data", timeStamp];
  
  NSString *tempPeriod = [NSString stringWithFormat:@"_DayK/%@", code];
  switch ([period intValue]) {
    case 0:
      tempPeriod = [NSString stringWithFormat:@"_1MinK/%@", code];
      break;
    case 1:
      tempPeriod = [NSString stringWithFormat:@"_5MinK/%@", code];
      break;
    case 2:
      tempPeriod = [NSString stringWithFormat:@"_15MinK/%@", code];
      break;
    case 3:
      tempPeriod = [NSString stringWithFormat:@"_30MinK/%@", code];
      break;
    case 4:
      tempPeriod = [NSString stringWithFormat:@"_60MinK/%@", code];
      break;
    case 5:
      tempPeriod = [NSString stringWithFormat:@"_DayK/%@", code];
      break;
    case 6:
      tempPeriod = @"_WeekK";
      suffix = @".data";
      break;
    case 7:
      tempPeriod = @"_MonthK";
      suffix = @".data";
      break;
    default:
      tempPeriod = [NSString stringWithFormat:@"_DayK/%@",code];
      break;
  }
  
  if (isIndex) {
    suffix = @"_index.data";
  }
  urlString = [NSString stringWithFormat:@"%@%@%@%@",urlString,tempPeriod,fileName,suffix];
  return urlString;
}

- (NSString *)time_dateToString:(NSString *)stamp andPeriod:(NSString *)period {

  NSDate *date = [NSDate dateWithTimeIntervalSince1970: [stamp integerValue]];
  
  NSDateFormatter *dateFormat=[[NSDateFormatter alloc]init];
  [dateFormat setDateFormat:@"yyyy-MM-dd"];
  
  NSString *string=[dateFormat stringFromDate:date];
  NSArray *array = [string componentsSeparatedByString:@"-"];

  NSString *timeString = @"";
  
  int periodInt = [period intValue];
  if (periodInt == 0) {
    timeString = [NSString stringWithFormat:@"%@%@%@",array[0],array[1],array[2]];
  } else if (periodInt == 1 || periodInt == 2) {
    timeString = [NSString stringWithFormat:@"%@%@",array[0],array[1]];
  } else if (periodInt == 3 || periodInt == 4) {
    NSString * quarter = [self getQuarter:array[1]];
    timeString = [NSString stringWithFormat:@"%@%@",array[0],quarter];
  } else if (periodInt == 5) {
    timeString = [NSString stringWithFormat:@"%@",array[0]];
  }
  return timeString;
}

- (NSString *)getQuarter:(NSString *)month {
  int monthInt = [month intValue];
  NSString * quarter = @"A";
  if (monthInt >= 1 && monthInt <= 3) {
   quarter = @"A";
  } else if (monthInt >= 4 && monthInt <= 6) {
     quarter = @"B";
  } else if (monthInt >= 7 && monthInt <= 9) {
     quarter = @"C";
  } else if (monthInt >= 10 && monthInt <= 12) {
     quarter = @"D";
  }
  return quarter;
}

- (void)getUserdefaultData:(NSString *)code andSplit:(NSString *)split andPeriod:(NSString *)period {
  if (self.indexFileArray) {
    NSDictionary *dict = [[NSUserDefaults standardUserDefaults] objectForKey:@"YDHistoryCodeSplitPeriod"];
    if (dict) {
      NSString *splitDict = [dict objectForKey:@"split"];
      NSString *codeDict = [dict objectForKey:@"code"];
      NSString *periodDict = [dict objectForKey:@"period"];
      if ([splitDict isEqualToString:split] && [codeDict isEqualToString:code] && [periodDict isEqualToString:period]) {
        
      } else {
        self.dataNameIndex = -1;
      }
    } else {
      self.dataNameIndex = -1;
    }
  } else {
    self.dataNameIndex = -1;
  }
  
  NSDictionary * splits = @{
                            @"split":split,
                            @"code":code,
                            @"period":period,
                            };
  [[NSUserDefaults standardUserDefaults] setObject:splits forKey:@"YDHistoryCodeSplitPeriod"];
}

- (void)sendEventWithTwoWayResponse:(NSObject *)response {
  NSDictionary *des = [response convertToDictionary];
  [self sendEventWithName:@"YDHistoryCandleStick" body:@{@"data":des}];
}

@end
