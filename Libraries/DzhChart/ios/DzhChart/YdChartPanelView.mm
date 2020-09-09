//
//  YdChartPanelView.m
//  DzhChart
//
//  Created by dxd on 2020/5/7.
//  Copyright © 2020 dzh. All rights reserved.
//

#import "YdChartPanelView.h"
#import "UIDefine.h"
#import "YdChartUtil.h"
#import "YdChartView.h"
#import "YdKLineView.h"

@implementation YdChartPanelView

@synthesize delegate = _myDelegate;//重载父类delegate属性


/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

- (id)init {
    self = [super init];
    if (self) {
        [super setDelegate:self];
        //缩放
        UIPinchGestureRecognizer *pinch = [[UIPinchGestureRecognizer alloc] initWithTarget:self action:@selector(pinchAction:)];
        pinch.delegate = self;
        [self addGestureRecognizer:pinch];
        
        //长按
        UILongPressGestureRecognizer *longPressGesture = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(longPressGestureRecognizer:)];
        [self addGestureRecognizer:longPressGesture];
        //点按
        UITapGestureRecognizer * tapGesture = [[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(tapGestureRecognizer:)];
        [self addGestureRecognizer:tapGesture];
        
        self.chartView = [[YdChartView alloc]init];
        [self addSubview:self.chartView];
        self.showsVerticalScrollIndicator = NO;
        self.showsHorizontalScrollIndicator = NO;

        self.isFirstShow = YES;
    }
    return self;
}

- (void)layoutSubviews {
//    self.chartView.frame = CGRectMake(0, 0, self.contentSize.width, self.contentSize.height);//缩放易产生长影
    [self.chartView setNeedsDisplay];
}

#pragma mark - ScrollView
- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    int kBeginNum = scrollView.contentOffset.x / self.chartView.kLineWidth;
    
    self.isFirstShow = NO;
    self.chartView.startPos = kBeginNum;
//    dispatch_async(dispatch_get_main_queue(), ^{
//        [self.chartView setNeedsDisplay];
//    });
    [self hiddenCrossLine];
}

// 捏合手势监听方法
- (void)pinchAction:(UIPinchGestureRecognizer *)recognizer {
    NSInteger showCountTemp = self.chartView.showCount - 5 * recognizer.velocity; //缩放速度
    NSInteger  showCountTemp2 = showCountTemp<SHOW_KLINE_MIN_COUNT?SHOW_KLINE_MIN_COUNT:(showCountTemp>SHOW_KLINE_MAX_COUNT?SHOW_KLINE_MAX_COUNT:showCountTemp);
    
    //YdChartView 改变frame，contentSize 改变
    self.chartView.showCount = showCountTemp2;
    float containerWidth= self.chartView.kLineWidth * (self.parentView.drawdata.count+.5), containerHeight=self.contentSize.height; //.5 半根K线
    self.contentSize = CGSizeMake(containerWidth, containerHeight);
//    self.chartView.frame = CGRectMake(0, 0, self.contentSize.width, self.contentSize.height);
//    self.contentOffset = CGPointMake(containerWidth-self.bounds.size.width, 0);
    
}

- (void)zoomIn {
    NSInteger showCountTemp = self.chartView.showCount - 5; //缩放速度
    NSInteger  showCountTemp2 = showCountTemp<SHOW_KLINE_MIN_COUNT?SHOW_KLINE_MIN_COUNT:(showCountTemp>SHOW_KLINE_MAX_COUNT?SHOW_KLINE_MAX_COUNT:showCountTemp);
    
    //YdChartView 改变frame，contentSize 改变
    self.chartView.showCount = showCountTemp2;
    float containerWidth= self.chartView.kLineWidth * (self.parentView.drawdata.count+.5), containerHeight=self.contentSize.height; //.5 半根K线
    self.contentSize = CGSizeMake(containerWidth, containerHeight);
//    self.chartView.frame = CGRectMake(0, 0, self.contentSize.width, self.contentSize.height);
}

- (void)zoomOut {
    NSInteger showCountTemp = self.chartView.showCount + 5; //缩放速度
    NSInteger  showCountTemp2 = showCountTemp<SHOW_KLINE_MIN_COUNT?SHOW_KLINE_MIN_COUNT:(showCountTemp>SHOW_KLINE_MAX_COUNT?SHOW_KLINE_MAX_COUNT:showCountTemp);
    
    //YdChartView 改变frame，contentSize 改变
    self.chartView.showCount = showCountTemp2;
    float containerWidth= self.chartView.kLineWidth * (self.parentView.drawdata.count+.5), containerHeight=self.contentSize.height; //.5 半根K线
    self.contentSize = CGSizeMake(containerWidth, containerHeight);
//    self.chartView.frame = CGRectMake(0, 0, self.contentSize.width, self.contentSize.height);
    
}

- (void)moveLeft {
    if (self.contentOffset.x<=0) {
        return;
    } else {
        self.contentOffset = CGPointMake(self.contentOffset.x-self.chartView.kLineWidth, 0);
    }
}

- (void)moveRight {
    /*
     * 滑到最右侧时，滑动偏移量 + ScrollView宽度 < content.size宽度
     * self.contentOffset.x+self.bounds.size.width+self.contentInset.left+self.contentInset.right<self.contentSize.width
     * 内边距是0，判断右移还有没有一根K线的宽度
     */
    if (self.contentSize.width - self.contentOffset.x - self.bounds.size.width < self.chartView.kLineWidth) {
        return;
    } else {
        self.contentOffset = CGPointMake(self.contentOffset.x+self.chartView.kLineWidth, 0);
    }
}

//十字线
- (void) longPressGestureRecognizer:(UILongPressGestureRecognizer*)gesture {
    if (gesture.state == UIGestureRecognizerStateBegan || gesture.state==UIGestureRecognizerStateChanged) {
        
        CGFloat positionX = [gesture locationInView:self].x;
        CGFloat positionY = [gesture locationInView:self].y;
        
        if (!sniperVLayer) {
            sniperVLayer = [[CALayer alloc]init];
            sniperVLayer.backgroundColor = [UIColor lightGrayColor].CGColor;
            [self.layer addSublayer:sniperVLayer];
            
        }
        if (!sniperHLayer) {
            sniperHLayer = [[CALayer alloc]init];
            sniperHLayer.backgroundColor = [UIColor lightGrayColor].CGColor;
            [self.layer addSublayer:sniperHLayer];
        }
        if (positionY <= self.parentView.mainYAxis.minBound()
            || (positionY <= self.parentView.viceYAxis.minBound() && positionY >= self.parentView.viceYAxis.maxBound())
            || (positionY <= self.parentView.viceYAxis2.minBound() && positionY >= self.parentView.viceYAxis2.maxBound())
            ) {
            if (!tipHLayer) {
                // 十字浮层
                CATextLayer * tipHTextLayer = [CATextLayer layer];
                tipHTextLayer.fontSize = CROSS_TIP_FONT_SIZE;
                tipHTextLayer.alignmentMode = kCAAlignmentLeft;
                tipHTextLayer.contentsScale = [UIScreen mainScreen].scale; // Retina屏渲染
                
                tipHLayer = [[CALayer alloc]init];
                tipHLayer.backgroundColor = [UIColor lightGrayColor].CGColor;
                [tipHLayer addSublayer:tipHTextLayer];
                [self.layer addSublayer:tipHLayer];
            }
        } else {
            [tipHLayer removeFromSuperlayer];
            tipHLayer = nil;
        }
        
        
        
        [CATransaction begin];
        [CATransaction setAnimationDuration:.1];
        
        //十字线在K线中心
        CGFloat PointStartXOffset = self.contentOffset.x;//scroll偏移量
        CGFloat PointStartXOffsetK = fmod(PointStartXOffset, self.chartView.kLineWidth);//半根K线
        CGFloat PointStartXOffsetV = PointStartXOffset>=0 ? PointStartXOffset-PointStartXOffsetK : 0;//K线开始画的 最左边
        CGFloat positionXOffset = fmod(positionX-PointStartXOffsetV, self.chartView.kLineWidth);
        positionX = positionX-positionXOffset+self.chartView.kLineWidth/2;
        //十字线
        if (!self.parentView.isLand) {
            sniperVLayer.frame = CGRectMake(positionX, self.parentView.mainChartRect.origin.y, 1,self.bounds.size.height-self.parentView.mainChartRect.origin.y);
        } else {
            sniperVLayer.frame = CGRectMake(positionX, self.parentView.mainChartRect.origin.y, 1,self.parentView.viceChartRect.origin.y+self.parentView.viceChartRect.size.height/2-2);
        }
        sniperHLayer.frame = CGRectMake(0, positionY, PointStartXOffset+self.bounds.size.width, 1);
        
        //十字线浮层 价格
        float price = 0;
        NSString * floatPrice = 0;
        if (positionY <= self.parentView.mainYAxis.minBound()) {
            price = self.parentView.mainYAxis.restore(positionY);
            floatPrice = [NSString stringWithFormat:@"%.2f", price];
        } else if (positionY <= self.parentView.viceYAxis.minBound() && positionY >= self.parentView.viceYAxis.maxBound()) {
            price = self.parentView.viceYAxis.restore(positionY);
            floatPrice = formatNumber(price);
        } else if (positionY <= self.parentView.viceYAxis2.minBound() && positionY >= self.parentView.viceYAxis2.maxBound()) {
            price = self.parentView.viceYAxis2.restore(positionY);
            floatPrice = formatNumber(price);
        }
        CGFloat priceWidth = adjustWidth(floatPrice, [UIFont systemFontOfSize:CROSS_TIP_FONT_SIZE]);
        
        //十字线浮层
        tipHLayer.frame = CGRectMake(PointStartXOffset, positionY-(CROSS_TIP_FONT_SIZE+4)/2, priceWidth+3+3, CROSS_TIP_FONT_SIZE+4); // 3+3左右边距
        CATextLayer * tipHTextLayer = tipHLayer.sublayers.firstObject;
        tipHTextLayer.frame = CGRectMake(3, 0, priceWidth, CROSS_TIP_FONT_SIZE+4); //左边距:3
        tipHTextLayer.string = floatPrice;
        
        [CATransaction commit];
        
        //当前是第几根K线
        int curLineIndex = positionX / self.chartView.kLineWidth;
        curLineIndex = (curLineIndex>self.parentView.drawdata.count-1) ? (int)self.parentView.drawdata.count-1 : curLineIndex;
        if (lastLineIndex != curLineIndex) {
            [[NSNotificationCenter defaultCenter] postNotificationName:@"KLineCrossNotification" object:@{ @"curKlineIndex":[NSNumber numberWithInt:curLineIndex]} ];
        }
        lastLineIndex = curLineIndex;
    } else {
        [NSTimer scheduledTimerWithTimeInterval:2.0f target:self selector:@selector(hiddenCrossLine) userInfo:nil repeats:NO];
    }
}
//取消十字光标
- (void)tapGestureRecognizer:(UITapGestureRecognizer*)tap {
    CGFloat positionY = [tap locationInView:self].y;

    if (sniperVLayer) {
        [self hiddenCrossLine];
    } else if (positionY > self.parentView.viceYAxis.maxBound() && positionY < self.parentView.viceYAxis.minBound()) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"nextFormulaNotification" object:@{ @"formula":@"vice"}];
    } else if (positionY > self.parentView.viceYAxis2.maxBound() && positionY < self.parentView.viceYAxis2.minBound()) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"nextFormulaNotification" object:@{ @"formula":@"vice2"}];
    }
}

- (void)hiddenCrossLine {
    [sniperVLayer removeFromSuperlayer];
    [sniperHLayer removeFromSuperlayer];
    sniperVLayer = nil;
    sniperHLayer = nil;
    [tipHLayer removeFromSuperlayer];
    tipHLayer = nil;
    
    int curLineIndex = (int)self.parentView.drawdata.count-1;
    [[NSNotificationCenter defaultCenter] postNotificationName:@"KLineCrossNotification" object:@{ @"curKlineIndex":[NSNumber numberWithInt:curLineIndex]} ];
}

@end
