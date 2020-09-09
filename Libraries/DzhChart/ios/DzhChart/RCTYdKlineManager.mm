#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import "YdKLineView.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTUIManager.h>

//@interface YdKlineManager: RCTEventEmitter
//
//@end

@interface RCTYdKlineManager : RCTViewManager
@property (nonatomic,retain) YdKLineView *kLiveView;
@end

@implementation RCTYdKlineManager
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

- (UIView *)view {
    return [[YdKLineView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(chartData, NSString);
RCT_EXPORT_VIEW_PROPERTY(mainName, NSString);
RCT_EXPORT_VIEW_PROPERTY(viceName, NSString);
//RCT_EXPORT_VIEW_PROPERTY(showCount, NSInteger);
//RCT_EXPORT_VIEW_PROPERTY(startPos, NSInteger);
//RCT_EXPORT_VIEW_PROPERTY(legendPos, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(chartLoc, NSString);
RCT_EXPORT_VIEW_PROPERTY(isLand, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(onSplitDataBlock, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(getMainFormulaData:(nonnull NSNumber*)reactTag: (NSInteger)pos : (NSArray*)formulas: (RCTResponseSenderBlock)callback) {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        UIView *view = [self.bridge.uiManager viewForReactTag:reactTag];
        if ([view isKindOfClass:[YdKLineView class]]) {
            [(YdKLineView*)view setMainName:formulas[0]];
            [(YdKLineView*)view setViceName:formulas[1]];
            [(YdKLineView*)view setChartLoc:formulas[2]];
            NSDictionary *data = [(YdKLineView*)view getMainFormulaData:pos];
            callback(@[data]);
        }
        else {
            callback(@[]);
        }
    });
}

RCT_EXPORT_METHOD(zoomIn:(nonnull NSNumber*)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIView *view = [self.bridge.uiManager viewForReactTag:reactTag];
        [(YdKLineView*)view zoomIn];
    });
}
RCT_EXPORT_METHOD(zoomOut:(nonnull NSNumber*)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIView *view = [self.bridge.uiManager viewForReactTag:reactTag];
        [(YdKLineView*)view zoomOut];
    });
}
RCT_EXPORT_METHOD(moveLeft:(nonnull NSNumber*)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIView *view = [self.bridge.uiManager viewForReactTag:reactTag];
        [(YdKLineView*)view moveLeft];
    });
}
RCT_EXPORT_METHOD(moveRight:(nonnull NSNumber*)reactTag) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIView *view = [self.bridge.uiManager viewForReactTag:reactTag];
        [(YdKLineView*)view moveRight];
    });
}

@end
