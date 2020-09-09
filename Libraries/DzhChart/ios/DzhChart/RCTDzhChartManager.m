#import <React/RCTViewManager.h>
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import "RKLineView.h"
#import <React/RCTBridgeModule.h>

@interface RCTYdMinlineManager : RCTViewManager

@end

@implementation RCTYdMinlineManager

RCT_EXPORT_MODULE()

- (UIView *)view {
    return [[RKLineView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(chartData, NSString);
RCT_EXPORT_VIEW_PROPERTY(legendPos, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(mainName, NSString);
RCT_EXPORT_VIEW_PROPERTY(viceName, NSString);
RCT_EXPORT_VIEW_PROPERTY(circulateEquityA, NSInteger);

@end
