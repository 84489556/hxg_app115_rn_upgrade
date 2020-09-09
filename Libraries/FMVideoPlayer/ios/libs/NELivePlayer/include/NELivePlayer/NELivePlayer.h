/*
 * NELivePlayer.h
 * NELivePlayer
 *
 * Create by biwei on 15-9-21
 * Copyright (c) 2015年 Netease. All rights reserved
 *
 * This file is part of LivePlayer.
 *
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

/*! \file */

/**
 *    @brief    log级别
 */
typedef NS_ENUM(NSInteger, NELPLogLevel)
{
    NELP_LOG_DEFAULT = 1, //!< log输出模式：输出详细
    NELP_LOG_VERBOSE = 2, //!< log输出模式：输出详细
    NELP_LOG_DEBUG   = 3, //!< log输出模式：输出调试信息
    NELP_LOG_INFO    = 4, //!< log输出模式：输出标准信息
    NELP_LOG_WARN    = 5, //!< log输出模式：输出警告
    NELP_LOG_ERROR   = 6, //!< log输出模式：输出错误
    NELP_LOG_FATAL   = 7, //!< log输出模式：一些错误信息，如头文件找不到，非法参数使用
    NELP_LOG_SILENT  = 8, //!< log输出模式：不输出
};

/**
 *    @brief    错误码
 */
typedef NS_ENUM(NSInteger, NELPPLayerErrorCode) {
    
    NELP_INIT_URL_FORMAT_ERROR = 1000, //!< 初始化的URL格式错误
    NELP_INIT_URL_ISPUSH_ERROR = 1001, //!< 初始化的URL是推流地址
    NELP_INIT_URL_PARSE_ERROR = 1002,  //!< 初始化的URL解析错误（idx文件）
    
    NELP_PLAY_HTTP_CONNECT_ERROR = -1001, //!< 播放过程中，HTTP连接失败
    NELP_PLAY_RTMP_CONNECT_ERROR = -1002, //!< 播放过程中，RTMP连接失败
    NELP_PLAY_STREAM_PARSE_ERROR = -1003, //!< 播放过程中，解析失败
    NELP_PLAY_BUFFING_ERROR    = -1004,   //!< 播放过程中，缓冲失败
    NELP_PLAY_AUDIO_OPEN_ERROR = -2001,   //!< 播放过程中，音频相关操作初始化失败
    NELP_PLAY_VIDEO_OPEN_ERROR = -2002,   //!< 播放过程中，视频相关操作初始化失败
    NELP_PLAY_STREM_IS_ERROR   = -3001,   //!< 播放过程中，没有音视频流
    NELP_PLAY_AUDIO_DECODE_ERROR = -4001, //!< 播放过程中，音频解码失败
    NELP_PLAY_VIDEO_DECODE_ERROR = -4002, //!< 播放过程中，视频解码失败
    NELP_PLAY_AUDIO_RENDER_ERROR = -5001, //!< 播放过程中，音频播放失败
    NELP_PLAY_VIDEO_RENDER_ERROR = -5002, //!< 播放过程中，视频播放失败
    NELP_PLAY_UNKNOWN_ERROR      = -10000,//!< 播放过程中，未知错误
};

/*! \file */

/**
 * @brief 视频流类型
 */
typedef enum NELPBufferStrategy{
    NELPTopSpeed,    //!< 极速模式，适用于视频直播，延时最小，网络抖动时容易发生卡顿
    NELPLowDelay,    //!< 网络直播低延时，适用于视频直播，延时低，网络抖动时偶尔有卡顿
    NELPFluent,      //!< 网络直播流畅，适用于视频直播，流畅性好，延时比低延时模式稍大
    NELPAntiJitter,  //!< 网络点播抗抖动，适用于视频点播和本地视频，抗抖动性强
    NELPDelayPullUp  //!< 网络直播, 延时追赶策略

}NELPBufferStrategy;

/**
 * @brief 显示模式
 */
typedef enum NELPMovieScalingMode {
    NELPMovieScalingModeNone,       //!< 无缩放
    NELPMovieScalingModeAspectFit,  //!< 等比例缩放，某一边会有黑边填充
    NELPMovieScalingModeAspectFill, //!< 等比例缩放，某一边可能会被裁减
    NELPMovieScalingModeFill        //!< 全屏显示，画面宽高比可能与视频原始宽高比不一致
}NELPMovieScalingMode;

/**
 * @brief 播放状态
 */
typedef enum NELPMoviePlaybackState {
    NELPMoviePlaybackStateStopped, //!< 停止状态
    NELPMoviePlaybackStatePlaying, //!< 播放状态
    NELPMoviePlaybackStatePaused,  //!< 暂停状态，可调play继续播放
    NELPMoviePlaybackStateSeeking  //!< Seek状态
}NELPMoviePlaybackState;

/**
 * @brief 加载状态
 */
typedef enum NELPMovieLoadState {
    NELPMovieLoadStatePlayable       = 1 << 0, //!< 在该状态下，播放器初始化完成，可以播放，若shouldAutoplay 设置成YES，播放器初始化完成后会自动播放；
    NELPMovieLoadStatePlaythroughOK  = 1 << 1, //!< 在该状态下，在网络不好的情况下缓冲完成，可以播放
    NELPMovieLoadStateStalled        = 1 << 2, //!< 在播放过程中网络不好需要缓冲数据的时候播放会自动暂停
}NELPMovieLoadState;

/**
 * @brief 播放结束的原因
 */
typedef enum NELPMovieFinishReason {
    NELPMovieFinishReasonPlaybackEnded, //!< 正常播放结束
    NELPMovieFinishReasonPlaybackError, //!< 播放发生错误导致结束
    NELPMovieFinishReasonUserExited,    //!< 人为退出(暂未使用，保留值)
}NELPMovieFinishReason;

/**
 * @brief 视频信息
 */
typedef struct NELPVideoInfo {
    const char *codec_type;  //!< 视频编码器类型 如: h264
    NSInteger   width;       //!< 视频宽度
    NSInteger   height;      //!< 视频高度
    CGFloat     fps;         //!< 视频的帧率
    NSInteger   bitrate;     //!< 码率 (单位: kb/s)
}NELPVideoInfo;

/**
 * @brief 音频信息
 */
typedef struct NELPAudioInfo {
    const char *codec_type;   //!< 音频编码器类型 如: aac
    NSInteger  sample_rate;   //!< 音频的采样率
    NSInteger  bitrate;       //!< 码率 (单位: kb/s)
    NSInteger  numOfChannels; //!< 音频的通道数
}NELPAudioInfo;

/**
 * @brief 回调的视频数据格式
 */
typedef enum NELPVideoFormat {
    NELP_YUV420
} NELPVideoFormat;

/**
 * @brief 回调的视频数据结构
 */
typedef struct NELPVideoRawData {
    int            width;    //!< 视频宽度
    int            height;   //!< 视频高度
    unsigned char *UsrData;  //!< 视频数据
} NELPVideoRawData;

/**
 * @brief 回调的音频数据结构
 */
typedef struct NELPAudioRawData {
    int            channels;   //!< 通道数
    int            samplerate; //!< 采样率
    int            data_size;  //!< 数据长度
    unsigned char *usrData;    //!< 音频数据
} NELPAudioRawData;

/**
 * @brief 密钥校验结果
 */
typedef enum NELPKeyCheckResult {
    NELP_NO_ENCRYPTION                  = 0, //!< 没有加密
    NELP_ENCRYPTION_CHECK_OK            = 1, //!< 密钥正确
    NELP_ENCRYPTION_UNSUPPORT_PROTOCAL  = 2, //!< 协议不支持
    NELP_ENCRYPTION_KEY_CHECK_ERROR     = 3, //!< 密钥错误
    NELP_ENCRYPTION_INPUT_INVALIED      = 4, //!< 输入错误
    NELP_ENCRYPTION_GET_KEY_TIMEOUT     = 5, //!< 获取密钥超时
    NELP_ENCRYPTION_UNKNOWN_ERROR       = 6, //!< 未知错误
} NELPKeyCheckResult;

/**
 * @brief 切片清晰度
 */
typedef enum NELPMultiMediaType {
    NELP_MEDIA_INVALID = -1, // 无效的
    NELP_MEDIA_SD      = 0,  // 低清
    NELP_MEDIA_MD      = 1,  // 标清
    NELP_MEDIA_HD      = 2,  // 高清
    NELP_MEDIA_SHD     = 3,  // 超清
} NELPMultiMediaType;

/**
 * @brief 切换切片结果
 */
typedef enum NELPSwitchStreamState {
    NELP_SWITCH_SUCCESS   = 0, // 切换成功
    NELP_SWITCH_NO_STREAM = 1, // 没有对应的流
    NELP_SWITCH_FAILED    = 2, // 切换失败
} NELPSwitchStreamState;

/**
 * @brief 选择流的状态
 */
typedef struct NELPSwitchStreamResult {
    NELPSwitchStreamState state;
}NELPSwitchStreamResult;

@protocol NELivePlayer;

#pragma mark NELivePlayer

/**
 *	@brief	播放器核心方法类
 */
@protocol NELivePlayer <NSObject>

/**
 *    @brief    设置播放的url, 此接口需要在调用init或initWithNeedConfigAudioSession之后使用，调用详情请参考initWithNeedConfigAudioSession，
 *              设置之后一定要调用prepareToPlay才能收到准备播放信息
 *
 *    @param     url 目标地址
 *
 *    @return    设置的错误信息
 */
- (NSError *)setPlayUrl:(NSURL *)url;

/**
 * @brief  设置缓冲策略，在播放器初始化后，prepareToPlay之前调用
 *
 * @discussion 缓冲策略有直播低延时模式、直播流畅模式以及点播抗抖动模式，如果是直播，建议采用低延时模式或流畅模式，如果是点播或本地视频，建议采用抗抖动模式
 *
 * @return 无
 */
- (void)setBufferStrategy:(NELPBufferStrategy)bufferStrategy;

/**
 *	@brief	设置数据源，初始化视频文件为播放做准备，在播放前调用
 *
 *  @discussion 当prepareToPlay完成时,若shouldAutoplay 为YES，则会自动调用play进行播放，若shouldAutoplay为 NO，则需手动调用play进行播放
 *
 *	@return	无
 */
- (void)prepareToPlay;

/**
 *	@brief	开始播放
 *
 *  @discussion
 *  如果当前正在播放，则调用该方法将无效果\\\n
 *  此时播放器状态为: NELPMoviePlaybackStatePlaying
 *
 *	@return	无
 */
- (void)play;

/**
 *	@brief	暂停播放
 *
 *  @discussion
 *  调用play方法继续播放。如果当前播放已经暂停，则调用该方法将无效果。\\\n
 *  此时播放器状态为: NELPMoviePlaybackStatePaused
 *
 *  @warning 该接口只针对点播地址有效。
 *
 *	@return	无
 */
- (void)pause;

/**
 * @brief 是否正在播放
 * @return YES:正在播放，NO:不在播放
 */
- (BOOL)isPlaying;

/**
 *	@brief	停止播放，并释放播放器相关资源
 *
 *  @discussion
 *  在播放器退出时，需要调用该方法用于释放资源。\\\n
 *  若在播放过程中需要切换URL，首先需要调用该方法停止播放，然后调用removeFromSuperview 将view移除，并将player置为nil，再初始化，prepareToPlay，最后调用play方法。
 *
 *	@return	无
 */
- (void)shutdown;

/**
 *	@brief	设置播放器切入后台后的播放状态
 *
 *  @discussion
 *  若设置后台暂停，则在切入后台后播放器处于暂停状态，回到前台需要手动播放\\\n
 *  若设置后台继续播放，则在切入后台后音频继续播放，回到前台后音视频正常播放\\\n
 *
 *  注意：仅播放点播流时支持后台暂停；对于直播流，若在切入后台时不需要继续播放，则需要在切入后台的过程中将播放器关闭并释放相关资源，切回前台再重新开始播放。
 *
 *	@param 	pause 	YES：后台暂停 NO：继续播放
 *
 *	@return	无
 */
- (void)setPauseInBackground:(BOOL)pause;

/**
 *	@brief	设置显示模式.
 *
 *  @param  aScalingMode 显示模式.
 *
 *  @discussion 共有以下4种显示模式，详见 NELPMovieScalingMode \\\n
 *  NELPMovieScalingModeNone,       //!< 无缩放  \\\n
 *  NELPMovieScalingModeAspectFit,  //!< 等比例缩放，某一边会有黑边填充  \\\n
 *  NELPMovieScalingModeAspectFill, //!< 等比例缩放，某一边可能会被裁减  \\\n
 *  NELPMovieScalingModeFill        //!< 全屏显示，画面宽高比可能与视频原始宽高比不一致
 *
 *	@return	无.
 */
- (void)setScalingMode: (NELPMovieScalingMode) aScalingMode;

/**
 *	@brief	静音功能
 *
 *	@param 	isMute 	YES：开启静音 NO：关闭静音
 *
 *	@return	无
 */
- (void)setMute: (BOOL)isMute;

/**
 *	@brief	设置是否开启硬件解码，仅IOS 8.0以上支持，默认不开启
 *
 *  @param 	isOpen 	YES：硬件解码 NO：软件解码
 *
 *	@return	无
 */
- (void)setHardwareDecoder :(BOOL)isOpen;

/**
 *	@brief	截图
 *
 *  @discussion
 *  调用prepareToPlay方法，播放器发出NELivePlayerDidPreparedToPlayNotification通知后，才能调用该方法。
 *
 *	@return	截图结果，以UIImage格式保存
 */
- (UIImage *)getSnapshot;

/**
 *	@brief	获取视频信息
 *
 *	@param 	videoInfo 	保存视频信息
 *
 *  @discussion
 *  调用prepareToPlay方法，播放器发出NELivePlayerDidPreparedToPlayNotification通知后，调用该方法才能获取到有效的视频信息。
 *  注意：其中帧率和码率都是从视频头中读取，若头中没有该信息，则返回0.
 *
 *	@return	无
 */
- (void)getVideoInfo :(NELPVideoInfo *)videoInfo;

/**
 *	@brief	获取音频信息
 *
 *	@param 	audioInfo 	保存音频信息
 *
 *  @discussion
 *  调用prepareToPlay方法，播放器发出NELivePlayerDidPreparedToPlayNotification通知后，调用该方法才能获取到有效的音频信息。
 *
 *	@return	无
 */
- (void)getAudioInfo :(NELPAudioInfo *)audioInfo;

/**
 * @brief	设置播放速度，仅适用于点播
 *
 * @param	speed 	播放速度(范围 0.5 ~ 2.0)
 *
 * @return	无
 */
@property (nonatomic) float playbackSpeed;

/**
 * @brief 设置播放音量
 *
 * @param volume  音量大小(范围 0.0 ~ 1.0，0.0为最小，1.0为最大)
 *
 * @return	无
 */
- (void)setVolume:(float)volume;

/**
 * @brief 设置拉流超时时间，在prepareToPlay之前调用
 *
 * @param timeout 超时时间 (单位: 毫秒 ms 范围:0 ~ 30000ms)
 *
 * @return 无
 */
- (void)setPlaybackTimeout:(long)timeout;

/**
 * @brief 解密模块初始化，并校验密钥是否正确
 *
 * @param transferToken 获取密钥的令牌
 * @param accid 视频云用户创建的其子用户id
 * @param appKey 开发者平台分配的AppKey
 * @param token 视频云用户子用户的token
 * @param complete 异步返回密钥检测结果
 *
 * @discussion 该接口不可与setDecryptionKey同时使用
 *
 * @return ret 返回密钥检测的状态
 */
- (void)setDecryptionTransferToken:(NSString *)transferToken
                             accid:(NSString *)accid
                            appKey:(NSString *)appKey
                             token:(NSString *)token
                          complete:(void(^)(NELPKeyCheckResult ret))complete;

/**
 * @brief 设置flv加密视频解密所需的密钥,在已知密钥的情况下可以调用该接口进行解密
 *
 * @param key 密钥
 * @param complete 异步返回密钥检测结果
 *
 * @discussion 该接口不可与initDecryption接口同时使用, 在prepareToPlay前调用
 * @return  ret 返回密钥检测的状态。不需要调用par
 */
- (void)setDecryptionKey:(NSString *)key
                complete:(void(^)(NELPKeyCheckResult ret))complete;

/**
 * @brief 播放过程中切换播放地址
 *
 * @param aUrl 待切换的播放地址
 *
 * @return >= 0 切换成功， < 0 切换失败
 */
- (int)switchContentUrl:(NSURL *)aUrl;

/**
 * @brief 加密视频的切换
 *
 * @param aUrl 待切换的播放地址
 * @param transferToken 获取密钥的令牌
 * @param accid 视频云用户创建的其子用户id
 * @param appKey 开发者平台分配的AppKey
 * @param token 视频云用户子用户的token
 * @param complete 异步返回密钥检测结果
 *
 * @discussion 切换成功后直接播放，不需要调用prepareToPlay。
 *
 * @return ret 返回密钥检测的状态
 */
- (void)switchDecryptionUrl:(NSURL *)aUrl
              transferToken:(NSString *)transferToken
                      accid:(NSString *)accid
                     appKey:(NSString *)appKey
                      token:(NSString *)token
                   complete:(void(^)(NELPKeyCheckResult ret))complete;

/**
 * @brief 已知密钥的情况下可以调用该接口进行切换
 *
 * @param key 密钥
 * @param complete 异步返回密钥检测结果
 *
 * @discussion 切换成功后直接播放，不需要调用prepareToPlay。
 * @return     ret 返回密钥检测的状态。
 */
- (void)switchDecryptionKeyUrl:(NSURL *)aUrl
                           key:(NSString *)key
                      complete:(void(^)(NELPKeyCheckResult ret))complete;

/**
 * @brief 视频数据的回调
 *
 * @param 回调的视频信息
 */
typedef void(^NELPVideoRawDataCB)(NELPVideoRawData *frame);

/**
 * @brief 注册获取视频帧数据的回调(只支持软件解码)，用户需要实现回调函数cb来接收视频帧
 *
 * @param mFormat         回调的视频数据格式
 * @param videoRawDataCB  获取视频数据的回调函数
 *
 * @return < 0 获取失败
 */
- (int)registerGetVideoRawDataCB:(NELPVideoFormat)neVFormat and:(NELPVideoRawDataCB)videoRawDataCB;

/**
 * @brief 音频数据的回调
 *
 * @param 回调的音频信息
 */
typedef void(^NELPAudioRawDataCB)(NELPAudioRawData *frame);

/**
 * @brief 注册获取音频帧数据的回调，用户需要实现回调函数cb来接收音频帧
 *
 * @param audioRawDataCB  获取音频数据的回调函数
 *
 * @return < 0 获取失败
 */
- (int)registerGetAudioRawDataCB:(NELPAudioRawDataCB)audioRawDataCB;

/**
 * @brief 清晰度切换的结果回调
 *
 * @param result 回调的切换结果
 */
typedef void (^NELPSwitchStreamResultCB)(NELPSwitchStreamResult result);

/**
 *	@brief	用于点播切换分辨率
 *
 *  @discussion 只针对于点播，直播调用该接口无效
 */
- (void)switchMultiMedia:(NELPMultiMediaType)mediaType
                complete:(void(^)(NELPSwitchStreamResult ret))completionBlock;

/**
 *	@brief	用于显示的view (只读)
 *
 *  @discussion 该view中不包含播放控制组件，只用于显示视频图像
 */
@property(nonatomic, readonly)  UIView *view;

/**
 *	@brief	设置当前播放时间点(用于seek操作)以及获取当前播放的时间点
 *
 *	@param 	currentPlaybackTime 	当前要播放的时间点(单位：秒)
 *
 *  @discussion
 *  需要在播放器发送NELivePlayerDidPreparedToPlayNotification通知后，才能调用该set方法设置到某一时间点播放，\\\n
 *  此时isPreparedToPlay的值为 YES
 *
 *	@return	get操作返回的是当前播放的时间点
 *
 *  @see isPreparedToPlay
 */
@property(nonatomic)  NSTimeInterval currentPlaybackTime;


/**
 真实时间戳回调（冲顶大会版本专用）

 @param realTime 真实时间戳
 */
typedef void (^NELPCurrentTimestampCallCB)(NSTimeInterval realTime);

/**
 同步时间戳监听（冲顶大会版本专用）
 @param interval 查询间隔，单位毫秒
 @param callback 查询结果
 */
@property (nonatomic, readonly) NSTimeInterval currentPlaybackRealTime;

/**
 真实时间戳监听（冲顶大会版本专用）
 @param interval 查询间隔，单位毫秒
 @param callback 查询结果
 */
- (void)setRealTimeListenerWithIntervalMS:(NSTimeInterval)intervalMS
                                 callback:(NELPCurrentTimestampCallCB)callback;


/**
 同步时间戳监听（冲顶大会版本专用）
 @param interval 查询间隔，单位毫秒
 @param callback 查询结果
 */
@property (nonatomic, readonly) NSTimeInterval currentSyncTimestamp;

/**
 透传时间戳监听（冲顶大会版本专用）（仅限软解码有效）
 @param interval 查询间隔，单位毫秒
 @param callback 查询结果
 */
- (void)setSyncTimestampListenerWithIntervalMS:(NSTimeInterval)intervalMS
                                      callback:(NELPCurrentTimestampCallCB)callback;

/**
 *	@brief	获取多媒体文件总时长(单位: 秒) (只读)
 *
 *  @discussion
 *  调用prepareToPlay方法后，不能立即获得duration值。只有在播放器发送NELivePlayerDidPreparedToPlayNotification通知后，获取的duration值才有效，\\\n
 *  这也意味着isPreparedToPlay值为YES时，duration值才有效。\\\n
 *
 *  如果播放的是直播视频，则duration值为0。
 *
 *	@return	多媒体文件总时长(单位: 秒)
 *
 *  @see isPreparedToPlay
 */
@property(nonatomic, readonly)  NSTimeInterval duration;

/**
 *	@brief	获取当前可播放的视频时长(单位：秒) (只读)
 *
 *  @discussion 当播放网络视频时，该值表示已经缓冲的视频的最大时长，若此时网络端开，则只能播放到该时刻为止。
 *
 *	@return	当前缓冲时长(单位：秒)
 */
@property(nonatomic, readonly)  NSTimeInterval playableDuration;

/**
 * @brief 当前视频文件是否完成初始化（只读）
 *
 * @discussion
 *
 * 调用prepareToPlay方法后，如果播放器完成视频文件的初始化，会发送NELivePlayerDidPreparedToPlayNotification通知，并将isPreparedToPlay置为YES。
 *
 * @see prepareToPlay
 */
@property(nonatomic, readonly)  BOOL isPreparedToPlay;

/**
 *	@brief	获取当前播放状态 (只读)
 *
 *  @discussion 共有以下4种状态，详见 NELPMoviePlaybackState。
 *
 *  NELPMoviePlaybackStateStopped, // 停止状态 \\\n
 *  NELPMoviePlaybackStatePlaying, // 播放状态 \\\n
 *  NELPMoviePlaybackStatePaused,  // 暂停状态，可调play继续播放 \\\n
 *  NELPMoviePlaybackStateSeeking  // Seek状态 \\\n
 *
 *  播放状态的变换如下：\\\n
 *
 *  播放器调用initWithContentURL方法后处于NELPMoviePlaybackStatePaused状态，\\\n
 *  调用prepareToPlay方法，如果完成对视频文件的初始化则进入NELPMoviePlaybackStatePlaying状态；\\\n
 *  当调用setCurrentPlaybackTime方法时转成NELPMoviePlaybackStateSeeking状态，\\\n
 *  调用pause方法转NELPMoviePlaybackStatePaused状态，调用stop方法转到NELPMoviePlaybackStateStopped状态。
 *
 *	@return	当前播放状态
 */
@property(nonatomic, readonly)  NELPMoviePlaybackState playbackState;

/**
 *	@brief	获取当前加载状态 (只读)
 *
 *  @discussion 共有以下3种加载状态，详见 NELPMovieLoadState
 *
 *  NELPMovieLoadStatePlayable       = 1 << 0, // 在该状态下，播放器初始化完成，可以播放，若shouldAutoplay 设置成YES，播放器初始化完成后会自动播放 \\\n
 *  NELPMovieLoadStatePlaythroughOK  = 1 << 1, // 在该状态下，在网络不好的情况下缓冲完成，可以播放 \\\n
 *  NELPMovieLoadStateStalled        = 1 << 2, // 在播放过程中网络不好需要缓冲数据的时候播放会自动暂停 \\n
 *
 *  加载状态的变换如下：\\\n
 *  调用prepareToPlay方法，当视频文件初始化完成后，播放器会收到NELivePlayerLoadStateChangedNotification通知，此时的加载状态为 NELPMovieLoadStatePlayable \\\n
 *  当播放器需要缓冲的时候，缓冲开始时，播放会暂停，此时播放器会收到NELivePlayerLoadStateChangedNotification通知，此时的加载状态为 NEPMovieLoadStateStalled \\\n
 *  当缓冲结束时，播放会继续，此时播放器会收到NELivePlayerLoadStateChangedNotification通知，此时的加载状态为 NELPMovieLoadStatePlaythroughOK
 *
 *	@return	当前加载状态
 */
@property(nonatomic, readonly)  NELPMovieLoadState loadState;

/**
 *	@brief	设置播放器初始化视频文件完成后是否自动播放，默认自动播放
 *
 *  @param 	shouldAutoplay 	YES：自动播放 NO：手动播放
 *
 *  @discussion 当设置为YES后，则在调用prepareToPlay初始化视频文件完成后会自动调用play方法进行播放
 *
 *	@return	无
 */
@property(nonatomic) BOOL shouldAutoplay;

/**
 *  @brief    设置播放idx多分辨率文件时，遇到卡顿是否自动切换低分辨率
 *
 *  @param     shouldAutoplay     YES：自动切换 NO：不自动切换
 *
 *  @discussion 方法仅对idx多分辨率文件有效
 *
 *  @return    无
 */
@property(nonatomic, assign) BOOL autoSwitchDefinition;

#pragma mark - Notifications

#ifdef __cplusplus
#define NELP_EXTERN extern "C" __attribute__((visibility ("default")))
#else
#define NELP_EXTERN extern __attribute__((visibility ("default")))
#endif

///调用prepareToPlay后，播放器初始化视频文件完成后的消息通知
NELP_EXTERN NSString *const NELivePlayerDidPreparedToPlayNotification;

///播放器加载状态发生改变时的消息通知
NELP_EXTERN NSString *const NELivePlayerLoadStateChangedNotification;

///播放器播放完成或播放发生错误时的消息通知。
///携带UserInfo:{NELivePlayerPlaybackDidFinishReasonUserInfoKey : [NSNumber],
///             NELivePlayerPlaybackDidFinishErrorKey : [NSNumber]}
NELP_EXTERN NSString *const NELivePlayerPlaybackFinishedNotification;
NELP_EXTERN NSString *const NELivePlayerPlaybackDidFinishReasonUserInfoKey; ///播放器播放结束原因的key
NELP_EXTERN NSString *const NELivePlayerPlaybackDidFinishErrorKey;          ///播放成功时，此字段为nil。播放器播放结束具体错误码。具体至含义见NELPPLayerErrorCode

///播放器播放状态发生改变时的消息通知
NELP_EXTERN NSString *const NELivePlayerPlaybackStateChangedNotification;

///播放器解码器打开后的消息通知，指示硬件解码是否开启
NELP_EXTERN NSString *const NELivePlayerHardwareDecoderOpenNotification;

///播放器第一帧视频显示时的消息通知
NELP_EXTERN NSString *const NELivePlayerFirstVideoDisplayedNotification;

///播放器第一帧音频播放时的消息通知
NELP_EXTERN NSString *const NELivePlayerFirstAudioDisplayedNotification;

///播放器资源释放完成时的消息通知
NELP_EXTERN NSString *const NELivePlayerReleaseSueecssNotification;

///seek完成时的消息通知，仅适用于点播，直播不支持。
///携带UserInfo:{NELivePlayerMoviePlayerSeekCompletedTargetKey : [NSNumber],
///             NELivePlayerMoviePlayerSeekCompletedTargetKey : [NSNumber]}
NELP_EXTERN NSString *const NELivePlayerMoviePlayerSeekCompletedNotification;
NELP_EXTERN NSString *const NELivePlayerMoviePlayerSeekCompletedErrorKey;    ///seek失败时失败原因key
NELP_EXTERN NSString *const NELivePlayerMoviePlayerSeekCompletedTargetKey;   ///seek完成时的时间

///视频码流包解析异常时的消息通知
NELP_EXTERN NSString *const NELivePlayerVideoParseErrorNotification;

///不同清晰度视频流的条数通知。
///携带UserInfo:{NELivePlayerMulitDefinitionMediaInfoKey : [NELivePlayerMulitDefinitionModel]}
NELP_EXTERN NSString *const NELivePlayerMulitDefinitionMediaNotification;
NELP_EXTERN NSString *const NELivePlayerMulitDefinitionMediaInfoKey;

///即将自动切换至最低分辨率通知
///携带UserInfo:{NELivePlayerWillAutoSwitchDefinitionInfoKey : [NELivePlayerMulitDefinitionModel]}
NELP_EXTERN NSString *const NELivePlayerWillAutoSwitchDefinitionNotification;
NELP_EXTERN NSString *const NELivePlayerWillAutoSwitchDefinitionInfoKey; //分辨率信息的key

///播放过程中的Http状态码。
///携带UserInfo:{NELivePlayerHttpCodeResponseInfoKey : [NELivePlayerHttpCodeModel]}
NELP_EXTERN NSString *const NELivePlayerHttpCodeResponseNotification;
NELP_EXTERN NSString *const NELivePlayerHttpCodeResponseInfoKey; //Http状态模型获取的key

@end

#pragma mark - 分辨率通知信息
@interface NELivePlayerMulitDefinitionModel : NSObject
@property (nonatomic, strong) NSArray <NSNumber *> *resolutions; //支持的分辨率 @(NELPMultiMediaType)
@property (nonatomic, assign) NELPMultiMediaType isUsed; //正在播放的分辨率
@end

#pragma mark - HTTP通知信息
@interface NELivePlayerHttpCodeModel : NSObject
@property (nonatomic, assign) int code;
@property (nonatomic, copy) NSString *header;
@end
