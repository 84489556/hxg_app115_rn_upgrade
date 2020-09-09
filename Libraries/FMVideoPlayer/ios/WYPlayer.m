//
//  WYPlayer.m
//  FMPlayer
//
//  Created by mac on 2018/2/27.
//  Copyright © 2018年 yuanda. All rights reserved.
//

#import "WYPlayer.h"
#import "Masonry.h"
#import "UIColor+UIColor_Hex.h"
#import "UIImageView+WebCache.h"


#define Window [UIApplication sharedApplication].keyWindow
#define iOS8 [UIDevice currentDevice].systemVersion.floatValue >= 8.0

#define WMPlayerSrcName(file) [@"WMPlayer.bundle" stringByAppendingPathComponent:file]
#define WMPlayerFrameworkSrcName(file) [@"Frameworks/WMPlayer.framework/WMPlayer.bundle" stringByAppendingPathComponent:file]

#define WMPlayerImage(file)      [UIImage imageNamed:WMPlayerSrcName(file)] ? :[UIImage imageNamed:WMPlayerFrameworkSrcName(file)]



#define kHalfWidth self.frame.size.width * 0.5
#define kHalfHeight self.frame.size.height * 0.5
//整个屏幕代表的时间
#define TotalScreenTime 90
#define LeastDistance 15


@interface WYPlayer () <UIGestureRecognizerDelegate>{
    //用来判断手势是否移动过
    BOOL _hasMoved;
    //记录触摸开始时的视频播放的时间
    float _touchBeginValue;
    //记录触摸开始亮度
    float _touchBeginLightValue;
    //记录触摸开始的音量
    float _touchBeginVoiceValue;
    
    //总时间
    CGFloat totalTime;
    
    ;

    
}

/** 是否初始化了播放器 */
@property (nonatomic, assign) BOOL  isInitPlayer;

///记录touch开始的点
@property (nonatomic,assign)CGPoint touchBeginPoint;

///手势控制的类型
///判断当前手势是在控制进度?声音?亮度?
@property (nonatomic, assign) WMControlType controlType;


@property (nonatomic, strong)NSDateFormatter *dateFormatter;
//监听播放起状态的监听者
@property (nonatomic ,strong) id playbackTimeObserver;

//视频进度条的单击事件
@property (nonatomic, strong) UITapGestureRecognizer *tap;
@property (nonatomic, assign) BOOL isDragingSlider;//是否点击了按钮的响应事件
/**
 *  显示播放时间的UILabel
 */
@property (nonatomic,strong) UILabel        *leftTimeLabel;
@property (nonatomic,strong) UILabel        *rightTimeLabel;

///进度滑块
@property (nonatomic,strong) UISlider       *progressSlider;
///声音滑块
@property (nonatomic,strong) UISlider       *volumeSlider;
//显示缓冲进度
@property (nonatomic,strong) UIProgressView *loadingProgress;

@end


@implementation WYPlayer{
    UITapGestureRecognizer* singleTap;
}
/**
 *  storyboard、xib的初始化方法
 */
- (void)awakeFromNib
{
    [self initPlayer];
    [super awakeFromNib];
    
}
/**
 *  initWithFrame的初始化方法
 */
-(instancetype)initWithFrame:(CGRect)frame{
    self = [super initWithFrame:frame];
    if (self) {
        [self initPlayer];
        
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidBecomeActive:) name:@"applicationDidBecomeActive" object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidEnterBackground:) name:@"applicationDidEnterBackground" object:nil];
        ///seek完成时的消息通知，仅适用于点播，直播不支持
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(NELivePlayerMoviePlayerSeekCompletedNotification:) name:NELivePlayerMoviePlayerSeekCompletedNotification object:_player];
        
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(NELivePlayerMoviePlayerSeekCompletedErrorKey:) name:NELivePlayerMoviePlayerSeekCompletedNotification object:_player];
        ///调用prepareToPlay后，播放器初始化视频文件完成后的消息通知
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(NELivePlayerDidPreparedToPlay:)
                                                     name:NELivePlayerDidPreparedToPlayNotification
                                                   object:_player];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(NELivePlayerPlaybackStateChangedNotification:) name:NELivePlayerPlaybackStateChangedNotification object:_player];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(NeLivePlayerloadStateChanged:)
                                                     name:NELivePlayerLoadStateChangedNotification
                                                   object:_player];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(NELivePlayerPlayBackFinished:)
                                                     name:NELivePlayerPlaybackFinishedNotification
                                                   object:_player];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(NELivePlayerFirstVideoDisplayed:)
                                                     name:NELivePlayerFirstVideoDisplayedNotification
                                                   object:_player];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(NELivePlayerFirstAudioDisplayed:)
                                                     name:NELivePlayerFirstAudioDisplayedNotification
                                                   object:_player];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(NELivePlayerReleaseSuccess:)
                                                     name:NELivePlayerReleaseSueecssNotification
                                                   object:_player];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(NELivePlayerVideoParseError:)
                                                     name:NELivePlayerVideoParseErrorNotification
                                                   object:_player];
        
    }
    return self;
}

/**
 *  初始化WMPlayer的控件，添加手势，添加通知，添加kvo等
 */
-(void)initPlayer{
    //    self.backgroundColor = [UIColor blackColor];
    //player内部的一个view，用来管理子视图
    
    self.contentView = [[UIView alloc]init];
    self.contentView.backgroundColor = [UIColor blackColor];
    [self addSubview:self.contentView];
    //autoLayout contentView
    [self.contentView mas_makeConstraints:^(MASConstraintMaker *make) {

        make.edges.equalTo(self);
        
    }];
    
    
    //设置默认值
    self.seekTime = 0.00;
    self.enableVolumeGesture = YES;
    
    
    self.ScreenView=[[UIView alloc] init];
    self.ScreenView.backgroundColor=[UIColor clearColor];
    self.ScreenView.userInteractionEnabled=YES;
    
    self.backView=[[UIImageView alloc] init];
    self.backView.backgroundColor=[UIColor clearColor];
    self.backView.alpha=0.5;
    self.backView.userInteractionEnabled=YES;
    
    self.PlayBtn = [UIButton buttonWithType:UIButtonTypeCustom];
//    self.PlayBtn.showsTouchWhenHighlighted = YES;
    [self.PlayBtn addTarget:self action:@selector(Play:) forControlEvents:UIControlEventTouchUpInside];
    
    [self.PlayBtn setImage:WMPlayerImage(@"liveplay") forState:UIControlStateNormal];
    [self.PlayBtn setImage:WMPlayerImage(@"livestop") forState:UIControlStateSelected];
    [self.ScreenView addSubview:self.backView];
    [self.ScreenView addSubview:self.PlayBtn];
    [self.contentView addSubview:self.ScreenView];
    //autoLayout _playOrPauseBtn
    [self.ScreenView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.edges.equalTo(self.contentView);
        
    }];
    [self.backView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.edges.equalTo(self.ScreenView);
        
    }];
    [self.PlayBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        make.center.equalTo(self.ScreenView);
        make.height.mas_equalTo(100);
        make.width.mas_equalTo(100);
        
    }];
    
   
    //小菊花ing
    
    self.loadingView = [[WYLoadingView alloc] init];
    self.loadingView.frame=CGRectMake(0,0,100,95);
    [self.contentView addSubview:self.loadingView];
    [self.loadingView mas_makeConstraints:^(MASConstraintMaker *make) {
       
        make.center.equalTo(self.contentView);
        
    }];
    //没网页面
    self.noWifiView=[[WYLoadedNoWifiView alloc] init];
    [self.contentView addSubview:self.noWifiView];
    [self.noWifiView.imageView addTarget:self action:@selector(play) forControlEvents:UIControlEventTouchUpInside];
    [self.noWifiView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.center.equalTo(self.contentView);
        make.height.mas_equalTo(self.contentView);
        make.width.mas_equalTo(self.contentView);
        
    }];
    //加载失败页面
    self.loadFailedView=[[WYLoadedFailView alloc] init];
    [self.contentView addSubview:self.loadFailedView];
    [self.loadFailedView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.center.equalTo(self.contentView);
        make.height.mas_equalTo(self.contentView);
        make.width.mas_equalTo(self.contentView);
        
    }];
    [self.loadFailedView setHidden:YES];
    [self.noWifiView setHidden:YES];
    //    [self.loadingView startAnimating];
    
    
    //topView
    self.topView = [[UIImageView alloc]init];
    self.topView.image = WMPlayerImage(@"top_shadow");
    self.topView.userInteractionEnabled = YES;
//
    [self.contentView addSubview:self.topView];
    //autoLayout topView
    [self.topView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.contentView).with.offset(0);
        make.right.equalTo(self.contentView).with.offset(0);
        make.height.mas_equalTo(40);
        make.top.equalTo(self.contentView).with.offset(0);
    }];
    
    //bottomView
    self.bottomView = [[UIImageView alloc]init];
    self.bottomView.image = WMPlayerImage(@"bottom_shadow");
    self.bottomView.userInteractionEnabled = YES;
    
    [self.contentView addSubview:self.bottomView];
    self.contentView.userInteractionEnabled=YES;
    //autoLayout bottomView
    [self.bottomView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.contentView).with.offset(0);
        make.right.equalTo(self.contentView).with.offset(0);
        make.height.mas_equalTo(40);
        make.bottom.equalTo(self.contentView).with.offset(0);
        
    }];
    
    [self setAutoresizesSubviews:NO];
    //_playOrPauseBtn
    self.playOrPauseBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    self.playOrPauseBtn.showsTouchWhenHighlighted = YES;
    [self.playOrPauseBtn addTarget:self action:@selector(PlayOrPause:) forControlEvents:UIControlEventTouchUpInside];
    
    [self.playOrPauseBtn setImage:WMPlayerImage(@"pause") forState:UIControlStateNormal];
    [self.playOrPauseBtn setImage:WMPlayerImage(@"play") forState:UIControlStateSelected];
    
    [self.bottomView addSubview:self.playOrPauseBtn];
    //autoLayout _playOrPauseBtn
    [self.playOrPauseBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.bottomView).with.offset(15);
        make.height.mas_equalTo(20);
        make.centerY.equalTo(self.bottomView);
        make.width.mas_equalTo(20);
        
    }];
    self.playOrPauseBtn.selected = NO;//默认状态，即默认是不自动播放
    
    
    MPVolumeView *volumeView = [[MPVolumeView alloc]init];
    for (UIControl *view in volumeView.subviews) {
        if ([view.superclass isSubclassOfClass:[UISlider class]]) {
            self.volumeSlider = (UISlider *)view;
        }
    }
    
    
    
    //leftTimeLabel显示左边的时间进度
    self.leftTimeLabel = [[UILabel alloc]init];
    self.leftTimeLabel.textAlignment = NSTextAlignmentLeft;
    self.leftTimeLabel.textColor = [UIColor whiteColor];
    self.leftTimeLabel.backgroundColor = [UIColor clearColor];
    self.leftTimeLabel.font = [UIFont systemFontOfSize:12];
    [self.bottomView addSubview:self.leftTimeLabel];
    //autoLayout timeLabel
    [self.leftTimeLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.bottomView).with.offset(47);
        make.height.mas_equalTo(20);
        make.center.equalTo(self.bottomView);
    }];
    self.leftTimeLabel.text = [self convertTime:0.0];//设置默认值
    
    //slider
    self.progressSlider = [[UISlider alloc]init];
    self.progressSlider.minimumValue = 0.0;
    [self.progressSlider setThumbImage:WMPlayerImage(@"dot")  forState:UIControlStateNormal];
    self.progressSlider.minimumTrackTintColor = [UIColor colorWithHexString:@"#D80C18"];
    self.progressSlider.maximumTrackTintColor = [UIColor colorWithHexString:@"#C7C7C7" alpha:0.5];
    
    self.progressSlider.value = 0.0;//指定初始值
    //进度条的拖拽事件
    [self.progressSlider addTarget:self action:@selector(stratDragSlide:)  forControlEvents:UIControlEventValueChanged];
    //进度条的点击事件
    [self.progressSlider addTarget:self action:@selector(updateProgress:) forControlEvents:UIControlEventTouchUpInside];
    
    //给进度条添加单击手势
    self.tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(actionTapGesture:)];
    self.tap.delegate = self;
    
    [self.progressSlider addGestureRecognizer:self.tap];
    [self.bottomView addSubview:self.progressSlider];
    self.progressSlider.backgroundColor = [UIColor clearColor];
    
    //autoLayout slider
    [self.progressSlider mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.bottomView).with.offset(90);
        make.right.equalTo(self.bottomView).with.offset(-90);
        make.center.equalTo(self.bottomView);
    }];
    
    //rightTimeLabel显示右边的总时间
    self.rightTimeLabel = [[UILabel alloc]init];
    self.rightTimeLabel.textAlignment = NSTextAlignmentRight;
    self.rightTimeLabel.textColor = [UIColor whiteColor];
    self.rightTimeLabel.backgroundColor = [UIColor clearColor];
    self.rightTimeLabel.font = [UIFont systemFontOfSize:12];
    [self.bottomView addSubview:self.rightTimeLabel];
    //autoLayout timeLabel
    [self.rightTimeLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.progressSlider.mas_right).with.offset(10);
        make.height.mas_equalTo(20);
        make.center.equalTo(self.bottomView);
        
    }];
    self.rightTimeLabel.text = [self convertTime:0.0];//设置默认值
    
    //_fullScreenBtn
    self.fullScreenBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    self.fullScreenBtn.showsTouchWhenHighlighted = YES;
    [self.fullScreenBtn addTarget:self action:@selector(fullScreenAction:) forControlEvents:UIControlEventTouchUpInside];
    [self.fullScreenBtn setImage:WMPlayerImage(@"fullscreen") forState:UIControlStateNormal];
    [self.fullScreenBtn setImage:WMPlayerImage(@"nonfullscreen") forState:UIControlStateSelected];
    [self.bottomView addSubview:self.fullScreenBtn];
    //autoLayout fullScreenBtn
    [self.fullScreenBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.rightTimeLabel.mas_right).with.offset(12);
        make.right.equalTo(self.bottomView).with.offset(-15);
        make.height.mas_equalTo(20);
        make.width.mas_equalTo(20);
        make.centerY.equalTo(self.bottomView);
        
    }];
    
    
    //_closeBtn
    _closeBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    [_closeBtn setImage:WMPlayerImage(@"play_back.png") forState:UIControlStateNormal];
    [_closeBtn setImage:WMPlayerImage(@"play_back.png") forState:UIControlStateSelected];
//    _closeBtn.showsTouchWhenHighlighted = YES;
    _closeBtnStyle=CloseBtnStyleClose;
    [_closeBtn addTarget:self action:@selector(colseTheVideo:) forControlEvents:UIControlEventTouchUpInside];
    [self.topView addSubview:_closeBtn];
    
    
    
    
    //autoLayout _closeBtn
    
    [self.closeBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.topView).with.offset(15);
        make.height.mas_equalTo(33);
        make.width.mas_equalTo(16);
        make.centerY.equalTo(self.topView);

    }];
    
    //titleLabel
    self.titleLabel = [[UILabel alloc]init];
    //    self.titleLabel.text=[NSString stringWithFormat:@"晚间档（29） 乐强老师 07-17"];
    self.titleLabel.textAlignment = NSTextAlignmentLeft;
    self.titleLabel.textColor = [UIColor colorWithHexString:@"#ffffff"];
    self.titleLabel.backgroundColor = [UIColor clearColor];
    self.titleLabel.numberOfLines = 1;
    self.titleLabel.font = [UIFont systemFontOfSize:12.0];
    [self.topView addSubview:self.titleLabel];
    //autoLayout titleLabel
    
    [self.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.topView).with.offset(15);
        make.right.equalTo(self.topView).with.offset(-15);
        make.centerY.equalTo(self.topView);
        
    }];
    
    // 单击的 Recognizer
    singleTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleSingleTap:)];
    singleTap.numberOfTapsRequired = 1; // 单击
    singleTap.numberOfTouchesRequired = 1;
    [self.contentView addGestureRecognizer:singleTap];
    
    // 双击的 Recognizer
    UITapGestureRecognizer* doubleTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleDoubleTap:)];
    doubleTap.numberOfTouchesRequired = 1; //手指数
    doubleTap.numberOfTapsRequired = 2; // 双击
    // 解决点击当前view时候响应其他控件事件
    [singleTap setDelaysTouchesBegan:YES];
    [doubleTap setDelaysTouchesBegan:YES];
    [singleTap requireGestureRecognizerToFail:doubleTap];//如果双击成立，则取消单击手势（双击的时候不回走单击事件）
    [self.contentView addGestureRecognizer:doubleTap];
    
    
   
    
    
}
//视频文件处于上传中状态...
-(void)updateVideoView
{
    self.noWifiView.hidden=YES;
    self.loadFailedView.hidden=YES;
    self.loadingView.loadingLabel.text=@"直播视频上传中...";
    self.ScreenView.hidden=YES;
    [self.loadingView startAnimating];
    [self.topView setHidden:YES];
    [self.bottomView setHidden:YES];
    
}
-(void)initView:(BOOL)isChange
{
    self.noWifiView.hidden=YES;
    self.loadFailedView.hidden=YES;
    self.loadingView.loadingLabel.text=@"正在加载，请稍后...";
    self.titleLabel.text=[NSString stringWithFormat:@"%@（%@） %@ %@", _dataSource[@"column"],_dataSource[@"biaoTi"],_dataSource[@"laoShi"],((NSString *)_dataSource[@"time"]).length>10?[_dataSource[@"time"]  substringWithRange:NSMakeRange(5,5)]:nil];
    self.bottomView.hidden=NO;
    self.topView.hidden=NO;
    [self.backView sd_setImageWithURL:[NSURL URLWithString:_dataSource[@"image"]]];
    if(isChange)
    {
        _hasPlayClicked=NO;
    }
    else
    {
        _hasPlayClicked=YES;
        self.playOrPauseBtn.selected = NO;
        self.leftTimeLabel.text=@"00:00";
        self.progressSlider.value=0.0;
        
    }
    
}
-(void)setUrl:(NSString *)url
{
    _url=url;
    if([self.player isPreparedToPlay])
    {
        [self.player switchContentUrl:[NSURL URLWithString:url]];
    }
    else
    {
        self.player=[[NELivePlayerController alloc] initWithContentURL:[NSURL URLWithString:url] error:nil];
        [self.contentView insertSubview:self.player.view atIndex:0];
        
        [self.player.view mas_makeConstraints:^(MASConstraintMaker *make) {
            make.center.equalTo(self.contentView);
            make.width.equalTo(self.contentView);
            make.height.equalTo(self.contentView);
        }];
        [self.player setBufferStrategy:NELPAntiJitter]; //点播抗抖动
        
        //        [self.player setScalingMode:NELPMovieScalingModeAspectFit]; //设置画面显示模式，默认原始大小
        [self.player setShouldAutoplay:NO]; //设置prepareToPlay完成后是否自动播放
        [self.player setHardwareDecoder:NO]; //设置解码模式，是否开启硬件解码
        [self.player setPauseInBackground:NO]; //设置切入后台时的状态，暂停还是继续播放
//        if (self.isInitPlayer) {
//            self.state = PlayerStateBuffering;
//        }else{
//            self.state = PlayerStateStopped;
//        }
        
    }
    [self.player prepareToPlay];
    
}
-(void)initPlayerWithRect:(CGRect)rect
{
    
//    self.isInitPlayer=YES;
 
   
    
    
}

-(void)stopPlay
{
    self.noWifiView.hidden=YES;
    self.loadFailedView.hidden=YES;
    [self.loadingView stopAnimating];
}
#pragma mark
#pragma mark appwillResignActive
- (void)appwillResignActive:(NSNotification *)note
{
//    NSLog(@"appwillResignActive");
}
- (void)appBecomeActive:(NSNotification *)note
{
//    NSLog(@"appBecomeActive");
}
//视频进度条的点击事件
- (void)actionTapGesture:(UITapGestureRecognizer *)sender {
    CGPoint touchLocation = [sender locationInView:self.progressSlider];
    CGFloat value = totalTime * (touchLocation.x/self.progressSlider.frame.size.width);
    [self.progressSlider setValue:value animated:YES];
    [self.player setCurrentPlaybackTime:value];


}


#pragma mark
#pragma mark - layoutSubviews
-(void)layoutSubviews{
    [super layoutSubviews];
}
#pragma mark
#pragma mark - 全屏按钮点击func
-(void)fullScreenAction:(UIButton *)sender{
    sender.selected = !sender.selected;
    if (self.delegate&&[self.delegate respondsToSelector:@selector(wyplayer:clickedFullScreenButton:)]) {
        [self.delegate wyplayer:self clickedFullScreenButton:sender];
    }
    else
    {
        NSNumber *resetOrientationTarget = [NSNumber numberWithInt:UIInterfaceOrientationPortrait];
        [[UIDevice currentDevice] setValue:resetOrientationTarget forKey:@"orientation"];
        [self removeFromSuperview];
    }
}
#pragma mark
#pragma mark - 关闭按钮点击func
-(void)colseTheVideo:(UIButton *)sender{
    if (self.delegate&&[self.delegate respondsToSelector:@selector(wyplayer:clickedCloseButton:)]) {
        [self.delegate wyplayer:self clickedCloseButton:sender];
    }
    else
    {
        NSNumber *resetOrientationTarget = [NSNumber numberWithInt:UIInterfaceOrientationPortrait];
        [[UIDevice currentDevice] setValue:resetOrientationTarget forKey:@"orientation"];
        [self removeFromSuperview];
    }
}


#pragma mark
#pragma mark - PlayOrPause
-(void)Play:(UIButton *)sender
{
    if (self.state ==PlayerStateStopped||self.state==PlayerStateFailed) {
        [self play];
    } else if(self.state ==PlayerStateFinished||self.state ==PlayerStatePause){
        [self play];
    }else if(self.state == PlayerStatePlaying)
    {
        [self pause];
    }
}
- (void)PlayOrPause:(UIButton *)sender{
    if (self.state ==PlayerStateStopped||self.state==PlayerStatePause) {
        [self play];
    } else if(self.state ==PlayerStatePlaying){
        [self pause];
    }else if(self.state ==PlayerStateFinished){
        
        [self play];
    }
    
}
///播放
-(void)play{
    if([self.player isPreparedToPlay])
    {
        if(!self.isInitPlayer)
        {
               [[NSNotificationCenter defaultCenter] postNotificationName:@"playingVideo" object:self.dataSource];
            self.isInitPlayer=YES;
        }
        [self.player play];
        self.state = PlayerStatePlaying;
        [self initDurationTimer];
        [self hiddenControlView];
    }
}
///暂停
-(void)pause{
    
    if (self.state==PlayerStatePlaying) {
        self.state = PlayerStateStopped;
    }
    [self.player pause];
    [self removeDurationTimer];
    [self hiddenControlView];

}

#pragma mark
#pragma mark - 单击手势方法
- (void)handleSingleTap:(UITapGestureRecognizer *)sender{
    [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(autoDismissBottomView:) object:nil];
    if (self.delegate&&[self.delegate respondsToSelector:@selector(wyplayer:singleTaped:)]) {
        [self.delegate wyplayer:self singleTaped:sender];
    }
    
    
    
    [self.autoDismissTimer invalidate];
    self.autoDismissTimer = nil;
    self.autoDismissTimer = [NSTimer timerWithTimeInterval:10.0 target:self selector:@selector(autoDismissBottomView:) userInfo:nil repeats:YES];
    [[NSRunLoop currentRunLoop] addTimer:self.autoDismissTimer forMode:NSDefaultRunLoopMode];
    [UIView animateWithDuration:0.5 animations:^{
        if (self.bottomView.alpha == 0.0) {
            [self showControlView];
        }else{
            [self hiddenControlView];
        }
    } completion:^(BOOL finish){
        
    }];
}
#pragma mark
#pragma mark - 双击手势方法
- (void)handleDoubleTap:(UITapGestureRecognizer *)doubleTap{
    if (self.delegate&&[self.delegate respondsToSelector:@selector(wyplayer:doubleTaped:)]) {
        [self.delegate wyplayer:self doubleTaped:doubleTap];
    }
    [self PlayOrPause:self.playOrPauseBtn];
    
    [self showControlView];
}

-(void)closeBtnStyle:(CloseBtnStyle)closeBtnStyle{
    _closeBtnStyle = closeBtnStyle;
//    if (closeBtnStyle==CloseBtnStylePop) {
//        [_closeBtn setHidden:NO];
//        [_closeBtn setImage:WMPlayerImage(@"play_back.png") forState:UIControlStateNormal];
//        [_closeBtn setImage:WMPlayerImage(@"play_back.png") forState:UIControlStateSelected];
    
//    }else{
//        [_closeBtn setHidden:YES];
//    }
}
/**
 *  设置播放的状态
 *  @param state PlayerState
 */
- (void)setState:(PlayerState)state
{
    _state = state;
    // 控制菊花显示、隐藏
    if (state == PlayerStateBuffering) {
        [self.loadingView startAnimating];
        self.noWifiView.hidden=YES;
        self.loadFailedView.hidden=YES;
        self.playOrPauseBtn.selected = NO;
        self.ScreenView.hidden=YES;
        self.PlayBtn.selected=YES;
        
    }else if(state == PlayerStatePlaying){
        //here
        [self.loadingView stopAnimating];//
        self.noWifiView.hidden=YES;
        self.loadFailedView.hidden=YES;
        self.ScreenView.hidden=NO;
        [self.bottomView setHidden:NO];
        [self.topView setHidden:NO];
        [self.PlayBtn setHidden:NO];
        self.playOrPauseBtn.selected = NO;
        self.ScreenView.hidden=NO;
        self.PlayBtn.selected=YES;
        [self initDurationTimer];
        
    } else if(state == PlayerStateFinished || state == PlayerStateStopped){
        [self.loadingView stopAnimating];//
        self.playOrPauseBtn.selected = YES;
        self.ScreenView.hidden=NO;
        self.PlayBtn.selected=NO;
        [self syncScrubber];
        [self removeDurationTimer];
    }
    else if(state == PlayerStateFailed)
    {
        [self.loadingView stopAnimating];//
        self.playOrPauseBtn.selected = YES;
        self.ScreenView.hidden=YES;
        self.PlayBtn.selected=NO;
        self.loadFailedView.hidden=NO;
        [self.bottomView setHidden:YES];
        [self removeDurationTimer];
        [self hiddenControlView];
    }
    else{
        //here
        [self.loadingView stopAnimating];//
        self.playOrPauseBtn.selected = YES;
        self.ScreenView.hidden=NO;
        self.PlayBtn.selected=NO;
        [self removeDurationTimer];
    }
}

/**
 *  通过颜色来生成一个纯色图片
 */
- (UIImage *)buttonImageFromColor:(UIColor *)color{
    
    CGRect rect = self.bounds;
    UIGraphicsBeginImageContext(rect.size);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [color CGColor]);
    CGContextFillRect(context, rect);
    UIImage *img = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext(); return img;
}

///显示操作栏view
-(void)showControlView{
    [UIView animateWithDuration:0.5 animations:^{
        self.bottomView.alpha = 1.0;
        self.topView.alpha = 1.0;
        self.PlayBtn.alpha=1.0;

//        self.ScreenView.alpha=1.0;
        if (self.delegate&&[self.delegate respondsToSelector:@selector(wyplayer:isHiddenTopAndBottomView:)]) {
            [self.delegate wyplayer:self isHiddenTopAndBottomView:NO];
        }
    } completion:^(BOOL finish){
        
    }];
}
///隐藏操作栏view
-(void)hiddenControlView{
    [UIView animateWithDuration:0.3 animations:^{
        self.bottomView.alpha = 0.0;
        self.topView.alpha = 0.0;
        self.PlayBtn.alpha=0.0;
       
    } completion:^(BOOL finish){
        
    }];
}
#pragma mark
#pragma mark--开始拖曳sidle
- (void)stratDragSlide:(UISlider *)slider{
    self.isDragingSlider = YES;
    
}
#pragma mark
#pragma mark - 播放进度
- (void)updateProgress:(UISlider *)slider{
    self.isDragingSlider = NO;
    
    float duration=totalTime*(slider.value/slider.maximumValue);
    [self seekToTimeToPlay:duration];
    
}

#pragma mark
#pragma mark autoDismissBottomView
-(void)autoDismissBottomView:(NSTimer *)timer{
    if (self.state==PlayerStatePlaying) {
        if (self.bottomView.alpha==1.0) {
            [self hiddenControlView];//隐藏操作栏
        }
        
    }
}
/**
 *  跳到time处播放
 *  seekTime这个时刻，这个时间点
 */
- (void)seekToTimeToPlay:(double)time{
    if(time<=self.progressSlider.maximumValue)
    {
        self.state=PlayerStateBuffering;
        [self.player setCurrentPlaybackTime:time];
        _leftTimeLabel.text=[self convertTime:time];
    }
    
    
    
}
- (NSString *)convertTime:(int)second{
    
    int hours = second  / 60 / 60;
    int minutes = (second  / 60) % 60;
    int seconds = second % 60;
    
    return hours<=0?[NSString stringWithFormat:@"%02d:%02d", minutes, seconds]:[NSString stringWithFormat:@"%02d:%02d:%02d", hours, minutes, seconds];
    
}
-(int)convertString:(NSString *)str
{
    NSArray *arr=[str componentsSeparatedByString:@":"];
    int second=(([(NSString *)arr[1] intValue])+([(NSString *)arr[0] intValue])*60)*1000;
    return second;
}
/**
 *  计算缓冲进度
 *
 *  @return 缓冲进度
 */

- (NSDateFormatter *)dateFormatter {
    if (!_dateFormatter) {
        _dateFormatter = [[NSDateFormatter alloc] init];
        _dateFormatter.timeZone = [NSTimeZone timeZoneWithName:@"GMT"];
    }
    return _dateFormatter;
}

#pragma mark
#pragma mark - touches
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event{
    //这个是用来判断, 如果有多个手指点击则不做出响应
    UITouch * touch = (UITouch *)touches.anyObject;
    if (touches.count > 1 || [touch tapCount] > 1 || event.allTouches.count > 1) {
        return;
    }
    //    这个是用来判断, 手指点击的是不是本视图, 如果不是则不做出响应
    if (![[(UITouch *)touches.anyObject view] isEqual:self.contentView] &&  ![[(UITouch *)touches.anyObject view] isEqual:self]) {
        return;
    }
    [super touchesBegan:touches withEvent:event];
    
    //触摸开始, 初始化一些值
    _hasMoved = NO;
    _touchBeginValue = self.progressSlider.value;
    //位置
    _touchBeginPoint = [touches.anyObject locationInView:self];
    //亮度
    _touchBeginLightValue = [UIScreen mainScreen].brightness;
    //声音
    _touchBeginVoiceValue = _volumeSlider.value;
}

- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event{
    UITouch * touch = (UITouch *)touches.anyObject;
    if (touches.count > 1 || [touch tapCount] > 1  || event.allTouches.count > 1) {
        return;
    }
    if (![[(UITouch *)touches.anyObject view] isEqual:self.contentView] && ![[(UITouch *)touches.anyObject view] isEqual:self]) {
        return;
    }
    [super touchesMoved:touches withEvent:event];
    
    
    //如果移动的距离过于小, 就判断为没有移动
    CGPoint tempPoint = [touches.anyObject locationInView:self];
    if (fabs(tempPoint.x - _touchBeginPoint.x) < LeastDistance && fabs(tempPoint.y - _touchBeginPoint.y) < LeastDistance) {
        return;
    }
    _hasMoved = YES;
    //如果还没有判断出使什么控制手势, 就进行判断
    //滑动角度的tan值
    float tan = fabs(tempPoint.y - _touchBeginPoint.y)/fabs(tempPoint.x - _touchBeginPoint.x);
    if (tan < 1/sqrt(3)) {    //当滑动角度小于30度的时候, 进度手势
        _controlType = progressControl;
        //            _controlJudge = YES;
    }else if(tan > sqrt(3)){  //当滑动角度大于60度的时候, 声音和亮度
        //判断是在屏幕的左半边还是右半边滑动, 左侧控制为亮度, 右侧控制音量
        if (_touchBeginPoint.x < self.bounds.size.width/2) {
            _controlType = lightControl;
        }else{
            _controlType = voiceControl;
        }
        //            _controlJudge = YES;
    }else{     //如果是其他角度则不是任何控制
        _controlType = noneControl;
        return;
    }
    
    
    if (_controlType == progressControl) {     //如果是进度手势
//        float value = [self moveProgressControllWithTempPoint:tempPoint];
//        [self timeValueChangingWithValue:value];
    }else if(_controlType == voiceControl){    //如果是音量手势
        if (self.isFullscreen) {//全屏的时候才开启音量的手势调节
            
            if (self.enableVolumeGesture) {
                //根据触摸开始时的音量和触摸开始时的点去计算出现在滑动到的音量
                float voiceValue = _touchBeginVoiceValue - ((tempPoint.y - _touchBeginPoint.y)/self.bounds.size.height);
                //判断控制一下, 不能超出 0~1
                if (voiceValue < 0) {
                    _volumeSlider.value = 0;
                }else if(voiceValue > 1){
                    _volumeSlider.value = 1;
                }else{
                    _volumeSlider.value = voiceValue;
                }
            }
        }else{
            return;
        }
    }else if(_controlType == lightControl){   //如果是亮度手势
        //显示音量控制的view
        
        if (self.isFullscreen) {
            //根据触摸开始时的亮度, 和触摸开始时的点来计算出现在的亮度
            float tempLightValue = _touchBeginLightValue - ((tempPoint.y - _touchBeginPoint.y)/self.bounds.size.height);
            if (tempLightValue < 0) {
                tempLightValue = 0;
            }else if(tempLightValue > 1){
                tempLightValue = 1;
            }
            //        控制亮度的方法
            [UIScreen mainScreen].brightness = tempLightValue;
            //        实时改变现实亮度进度的view
//            NSLog(@"亮度调节 = %f",tempLightValue);
        }else{
            
        }
    }
}
-(void)touchesCancelled:(NSSet *)touches withEvent:(UIEvent *)event
{
    [super touchesCancelled:touches withEvent:event];
    //判断是否移动过,
    if (_hasMoved) {
        if (_controlType == progressControl) { //进度控制就跳到响应的进度
            CGPoint tempPoint = [touches.anyObject locationInView:self];
            
            float value = [self moveProgressControllWithTempPoint:tempPoint];
            
            [self seekToTimeToPlay:value];
            
            
        }else if (_controlType == lightControl){//如果是亮度控制, 控制完亮度还要隐藏显示亮度的view
            //            [self hideTheLightViewWithHidden:YES];
        }
    }else{
        //        if (self.topView.hidden) {
        //            [self controlViewOutHidden];
        //        }else{
        //            [self controlViewHidden];
        //        }
    }
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event{
//    NSLog(@"touchesEnded");
    //    [self hideTheLightViewWithHidden:YES];
    [super touchesEnded:touches withEvent:event];
    //判断是否移动过,
    if (_hasMoved) {
        if (_controlType == progressControl) { //进度控制就跳到响应的进度
            CGPoint tempPoint = [touches.anyObject locationInView:self];
            //            if ([self.delegate respondsToSelector:@selector(seekToTheTimeValue:)]) {
            float value = [self moveProgressControllWithTempPoint:tempPoint];
            //                [self.delegate seekToTheTimeValue:value];
            [self seekToTimeToPlay:value];
            //            }
        }else if (_controlType == lightControl){//如果是亮度控制, 控制完亮度还要隐藏显示亮度的view
            //            [self hideTheLightViewWithHidden:YES];
        }
    }else{
        if(!self.loadFailedView.hidden)
        {
            [self showNoWifiView:@"wifi"];
            if([self.player isPreparedToPlay])
                [self play];
            else
            {
                [self setUrl:_url];
            }
        }
//                if (self.topView.hidden) {
//                    [self controlViewOutHidden];
//                }else{
//                    [self controlViewHidden];
//                }
    }
    
    
}
#pragma mark - 用来控制移动过程中计算手指划过的时间
-(float)moveProgressControllWithTempPoint:(CGPoint)tempPoint{
    //90代表整个屏幕代表的时间
    float tempValue = _touchBeginValue + totalTime * ((tempPoint.x - _touchBeginPoint.x)/([UIScreen mainScreen].bounds.size.width));
    if (tempValue >totalTime) {
        tempValue =totalTime;
    }else if (tempValue < 0){
        tempValue = 0.0f;
    }
    return tempValue;
}
#pragma  maik - 定时器
-(void)initDurationTimer{
    self.autoDismissTimer = [NSTimer timerWithTimeInterval:1.0 target:self selector:@selector(syncScrubber) userInfo:nil repeats:YES];
    [[NSRunLoop currentRunLoop] addTimer:self.autoDismissTimer forMode:NSDefaultRunLoopMode];
}

-(void)removeDurationTimer
{
    [self.durationTimer invalidate];
    self.durationTimer = nil;
}
- (void)syncScrubber{
    __weak typeof(self) weakSelf = self;
    double duration = weakSelf.player.duration;
    totalTime=duration;
    weakSelf.progressSlider.maximumValue=duration;
    if (isfinite(duration)){
        float minValue = [weakSelf.progressSlider minimumValue];
        float maxValue = [weakSelf.progressSlider maximumValue];
        double time =[weakSelf.player currentPlaybackTime];

        if(self.state==PlayerStateFinished||self.state==PlayerStateStopped)
        {
            weakSelf.leftTimeLabel.text=@"00:00";
            weakSelf.progressSlider.value=0;
        }
        
        else
        {
            weakSelf.leftTimeLabel.text = [NSString stringWithFormat:@"%@",[weakSelf convertTime:time]];
            weakSelf.rightTimeLabel.text=[NSString stringWithFormat:@"%@",[weakSelf convertTime:duration]];
            if(time!=0)
            {
                weakSelf.backView.alpha=0.0;
            }
            if (self.isDragingSlider==YES) {//拖拽slider中，不更新slider的值
                
            }else if(self.isDragingSlider==NO){
                [weakSelf.progressSlider setValue:(maxValue - minValue) * time / duration + minValue];
            }
        }

    }
}
//重置播放器
-(void )resetPlayer{
    self.seekTime = 0;
    // 关闭定时器
    [self.autoDismissTimer invalidate];
    self.autoDismissTimer = nil;
    // 暂停
    // 移除原来的layer
    [self.player.view removeFromSuperview];
    
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self.player shutdown];
    
//    [self.playerLayer removeFromSuperlayer];
    self.player = nil;
}
-(void)dealloc{
    
//    NSLog(@"WMPlayer dealloc");
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self.player shutdown];
    self.player = nil;
    self.playOrPauseBtn = nil;
    self.autoDismissTimer = nil;
    
}

//获取当前的旋转状态
+(CGAffineTransform)getCurrentDeviceOrientation{
    //状态条的方向已经设置过,所以这个就是你想要旋转的方向
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    //根据要进行旋转的方向来计算旋转的角度
    if (orientation ==UIInterfaceOrientationPortrait) {
        return CGAffineTransformIdentity;
    }else if (orientation ==UIInterfaceOrientationLandscapeLeft){
        return CGAffineTransformMakeRotation(-M_PI_2);
    }else if(orientation ==UIInterfaceOrientationLandscapeRight){
        return CGAffineTransformMakeRotation(M_PI_2);
    }
    return CGAffineTransformIdentity;
}


#pragma mark
#pragma mark 进入后台
- (void)applicationDidEnterBackground:(NSNotification*)note
{
//    NSLog(@"applicationDidEnterBackground");
    if(self.state==PlayerStatePlaying)
        [self pause];
    if (self.delegate&&[self.delegate respondsToSelector:@selector(wyplayer:clickedCloseButton:)]) {
        if(self.closeBtnStyle==CloseBtnStylePop)
        [self.delegate wyplayer:self clickedCloseButton:self.closeBtn];
    }

    
    
}
#pragma mark
#pragma mark 进入前台
- (void)applicationDidBecomeActive:(NSNotification*)note
{
    
//    if (self.delegate&&[self.delegate respondsToSelector:@selector(wyplayer:clickedCloseButton:)]) {
//        if(self.closeBtnStyle==CloseBtnStylePop)
//            [self.delegate wyplayer:self clickedCloseButton:self.closeBtn];
//    }
    
}
-(void)syncUIStatus
{
    
}
-(void)showNoWifiView:(NSString *)status
{
    if([status isEqualToString:@"cell"])
    {
    self.loadingView.hidden=YES;
    self.loadFailedView.hidden=YES;
    self.ScreenView.hidden=NO;
    self.noWifiView.hidden=NO;
    [self.bottomView setHidden:YES];
    [self.PlayBtn setHidden:YES];
    }
    else if([status isEqualToString:@"none"])
    {
        self.loadingView.hidden=YES;
        self.loadFailedView.hidden=NO;
        self.noWifiView.hidden=YES;
        self.ScreenView.hidden=YES;
        [self.bottomView setHidden:YES];
        [self.PlayBtn setHidden:YES];
    }
    else
    {
        self.loadingView.hidden=YES;
        self.loadFailedView.hidden=YES;
        self.noWifiView.hidden=YES;
        self.ScreenView.hidden=NO;
        [self.bottomView setHidden:NO];
        [self.PlayBtn setHidden:NO];
    }
        
}
//网易播放器各种通知
-(void)NELivePlayerPlaybackStateChangedNotification:(NSNotification *)notification
{
    if (!self.player) {
        self.state =PlayerStateStopped;
    } else if ([self.player playbackState] == NELPMoviePlaybackStatePlaying) {
        self.state = PlayerStatePlaying;
//        if(self.player.currentPlaybackTime==0)
//        {
//            [[NSNotificationCenter defaultCenter] postNotificationName:@"playingVideo" object:
//            _dataSource];
//        }
    } else if ([self.player playbackState] == NELPMoviePlaybackStatePaused) {
        self.state = PlayerStatePause;
    } else if ([self.player playbackState] == NELPMoviePlaybackStateSeeking) {
        self.state = PlayerStateBuffering;
    } else if ([self.player playbackState] == NELPMoviePlaybackStateStopped) {
        self.state =PlayerStateStopped;
    }
    
}
- (void)NELivePlayerDidPreparedToPlay:(NSNotification*)notification
{
//    NSLog(@"初始化完成，开始进行播放");
    [self syncScrubber];
    self.ScreenView.hidden=NO;
    if(self.isPlaying)
        [self play];
}

- (void)NeLivePlayerloadStateChanged:(NSNotification*)notification
{
    
}

- (void)NELivePlayerPlayBackFinished:(NSNotification*)notification
{
    int reason=((NSNumber *)([notification userInfo][@"NELivePlayerPlaybackDidFinishReasonUserInfoKey"])).intValue;
//    NSLog(@"视频播放结束原因：%d",reason);
    
    if(reason==0)
    {
        self.state=PlayerStateFinished;
    }
    else 
    {
        //加载失败
        self.state=PlayerStateFailed;
    }
}

- (void)NELivePlayerFirstVideoDisplayed:(NSNotification*)notification
{
//    NSLog(@"first video frame rendered!");
}

- (void)NELivePlayerFirstAudioDisplayed:(NSNotification*)notification
{
//    NSLog(@"first audio frame rendered!");
}
-(void)NELivePlayerMoviePlayerSeekCompletedNotification:(NSNotification *)notification
{
//    NSLog(@"进度加载完成");
    _hasPlayClicked=YES;
    self.state = PlayerStatePlaying;
    [self syncScrubber];
}
-(void)NELivePlayerMoviePlayerSeekCompletedErrorKey:(NSNotification *)notification
{
//    NSLog(@"%@",notification);
}
- (void)NELivePlayerVideoParseError:(NSNotification*)notification
{
//    NSLog(@"video parse error!");
}
- (void)NELivePlayerReleaseSuccess:(NSNotification*)notification
{
//    NSLog(@"resource release success!!!");
    [[NSNotificationCenter defaultCenter]removeObserver:self name:NELivePlayerReleaseSueecssNotification object:_player];
}

@end
