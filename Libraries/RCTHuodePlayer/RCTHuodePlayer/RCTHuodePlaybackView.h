//
//  RCTHuodePlaybackView.h
//  RCTHuodePlayer
//
//  Created by dxd on 2020/1/22.
//  Copyright © 2020 dxd. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTHuodePlaybackView : UIView

@property(nonatomic)NSDictionary *dataSource;

- (void)play;
- (void)stop;
- (void)pause;
- (void)resume;
- (void)landspace;
- (void)portiort;
- (int)seekTo:(int)position;
- (void)resetPlayer:(CGRect)react;

@end

NS_ASSUME_NONNULL_END
