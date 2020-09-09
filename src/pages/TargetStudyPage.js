/**
 * 投顾/直播课/晚间档/全屏
 */
'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Image,
    ImageBackground,
    Platform,
    DeviceEventEmitter,
    BackHandler,
    Animated,
    FlatList,
    TouchableNativeFeedback,
    AppState,
    NativeModules
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";

import Orientation from 'react-native-orientation';
import YdCloud from "../wilddog/Yd_cloud";
import VideoView from './Home/LiveLessionPage/VideoView.js';
import VideoPlayerView from '../../Libraries/FMVideoPlayer/NativeVideoView';
import Slider from "react-native-slider";
import * as baseStyle from '../components/baseStyle';
import * as IndexCourseHelper from '../utils/IndexCourseHelper';
import * as ScreenUtil from '../utils/ScreenUtil';

var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;
import moment from 'moment';
import { sensorsDataClickObject, sensorsDataClickActionName } from '../components/SensorsDataTool';
import ShareSetting from '../modules/ShareSetting';

export default class TargetStudyPage extends Component {
    constructor(props, context) {
        super(props, context);
        this.xzb_ref = YdCloud().ref(MainPathYG + '/ZhiBiao_LB/app');
        this.addressData = [];
        this.name = [];
        this.data = [];
        this.currentVideoUploadPlayInfo = false; // 当前播放的视频是否已经提交埋点
        this.state = {
            videoPath: '',
            trans: new Animated.ValueXY(),
            listData: [],
            width: width,
            height: height,
            allTime: 0,
            currPosition: 0,
            currentTime: '00:00',
            isShowController: true,
            playOrPause: true,
            title: '',
            isShowBuffering: true,
            currentIndex: 0,
            isPlay: true,
            mobile: false,
            noNet: false,
            isWiFi: true,
            isPlaying: false,
            navigatorHeight: 0

        };
        this._aboutVideoList = this._aboutVideoList.bind(this)
        this._renderItem = this._renderItem.bind(this)
        this._loadData = this._loadData.bind(this)
        this._renderVideoView = this._renderVideoView.bind(this)
        this._controllerUI = this._controllerUI.bind(this)
        this._playOrPause = this._playOrPause.bind(this)
        this._isShowControllerUI = this._isShowControllerUI.bind(this)
        this._backBar = this._backBar.bind(this)
        this._buffering = this._buffering.bind(this)
        this._getNetInfoState = this._getNetInfoState.bind(this)
        this._mobile = this._mobile.bind(this)
        this._noNet = this._noNet.bind(this)
        this._clickedView = this._clickedView.bind(this)
        this._onClickMobileButton = this._onClickMobileButton.bind(this)
        this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
        this._handleAppStateChange = this._handleAppStateChange.bind(this)
    }

    componentDidMount() {

        this.currentVideoUploadPlayInfo = false
        sensorsDataClickObject.videoPlay.video_type = '录播视频'
        if (Platform.OS === 'android') {
            //拦截手机自带返回键
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
            NativeModules.getnaviheight.getNaviHeight((naviHeight) => {
                this.setState({ navigatorHeight: naviHeight })
            });

        }
        // Orientation.lockToPortrait();
        if (Platform.OS === 'ios') {
            Orientation.lockToLandscapeLeft();
        } else {
            Orientation.lockToLandscape();
        }
        this._loadData();

         this._getNetInfoState();
        //注册监听网络状态改变
        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);


    }

    //监听后台状体的具体实现函数
    _handleAppStateChange(appState) {
        if (appState == 'background') {
            this.setState({ playOrPause: true }, () => {
                this.player.pause()
            })
        }

    }

    componentWillUnMount() {
        this.netInfoSubscriber && this.netInfoSubscriber();
        this.timer && clearInterval(this.timer);
        this.getTimeTimer && clearTimeout(this.getTimeTimer)
        this.getPositionTimer && clearTimeout(this.getPositionTimer)
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.upLoadSensorsDataAction(false)
    }

    _getNetInfoState() {
        this.setState({ isPlaying: false })
        if (Platform.OS == 'ios') {
            NetInfo.fetch().done((status) => {
                if (status.type == 'none') {
                    //没网
                    this.setState({ isShowBuffering: false, noNet: true, isWiFi: false })
                } else if (status.type == 'cellular') {
                    //运营商流量
                    this.setState({ isShowBuffering: false, isPlay: false, mobile: true, isWiFi: false }, () => {
                        this.player && this.player.pause()
                    })
                } else if (status.type == 'wifi') {
                    //wifi
                    this.setState({ isWiFi: true }, () => {
                        if (this.state.videoPath == '') {
                            this.getTimeTimer = setTimeout(
                                () => {
                                    if (this.state.videoPath != '') {
                                        this.getTimeTimer && clearTimeout(this.getTimeTimer)
                                        this.setState({ isPlay: false, isShowBuffering: false }, () => {
                                            this._playOrPause();
                                            this.getPositionTimer && clearTimeout(this.getPositionTimer)
                                            this.getPositionTimer = setInterval(
                                                () => {
                                                    this.player.getPosition()
                                                },
                                                1000,
                                            );
                                        })
                                    }
                                },
                                500
                            );
                        } else {
                            this.setState({ isPlay: false, isShowBuffering: false }, () => {
                                this._playOrPause()
                                this.getPositionTimer && clearTimeout(this.getPositionTimer)
                                this.getPositionTimer = setInterval(
                                    () => {
                                        this.player && this.player.getPosition()
                                    },
                                    1000,
                                );
                            })
                        }
                    })
                } else if (status == 'unknown') {
                    this.setState({ isShowBuffering: false, noNet: true, isWiFi: false })
                }
            });
        } else {
            NetInfo.fetch().done((status) => {
                if (status.type == 'none') {
                    this.setState({ isShowBuffering: false, noNet: true, isWiFi: false })

                } else if (status.type == 'cellular') {
                    this.setState({ isShowBuffering: false, isPlay: false, mobile: true, isWiFi: false })

                } else if (status.type == 'wifi') {
                    this.setState({ isWiFi: true })
                } else {
                }
            });
        }
    }

    _loadData() {
        //name
        //console.log('前一个页面',this.props.navigation.state.params.name);
        if (this.props.navigation.state.params && this.props.navigation.state.params.name) {
            let values = IndexCourseHelper.get(this.props.navigation.state.params.name);
            values.reverse();
            if (values && values.length > 0) {
                this.data = values;
                this.setState({ listData: values }, () => {
                    for (let i = 0; i < this.state.listData.length; i++) {
                        this.name[i] = this.state.listData[i].title;
                        this.addressData[i] = this.state.listData[i].play_address;
                        // if (i === 0) {
                        //
                        // }
                    }
                    sensorsDataClickObject.videoPlay.entrance = 'K线详情页'
                    sensorsDataClickObject.videoPlay.class_type = '指标学习'
                    sensorsDataClickObject.videoPlay.class_series = this.state.listData[0].setsystem
                    sensorsDataClickObject.videoPlay.class_name = this.state.listData[0].title
                    sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(this.state.listData[0].createTime), 'yyyy-MM-dd')
                    this.setState({
                        videoPath: this.state.listData[0].play_address,
                        title: this.state.listData[0].title,
                        currentIndex: 0
                    })

                })
            }
        }

        // this.xzb_ref && this.xzb_ref.orderByKey().get((snap) => {
        //     if (snap.code == 0) {
        //         const keys = Object.keys(snap.nodeContent)
        //         let values = Object.values(snap.nodeContent)
        //         this.data = values
        //         this.setState({ listData: values }, () => {
        //             for (let i = 0; i < this.state.listData.length; i++) {
        //                 this.name[i] = this.state.listData[i].title
        //                 this.addressData[i] = this.state.listData[i].playaddress
        //                 if (this.state.listData[i].title == '趋势三部曲'
        //                     && this.props.navigation.state.params.name == '趋势三部曲') {
        //                     this.setState({
        //                         videoPath: this.state.listData[i].playaddress,
        //                         title: '趋势三部曲', currentIndex: i
        //                     })
        //
        //                 } else if (this.state.listData[i].title == '趋势彩虹（上）'
        //                     && this.props.navigation.state.params.name == '趋势彩虹') {
        //                     this.setState({
        //                         videoPath: this.state.listData[i].playaddress,
        //                         title: '趋势彩虹（上）',
        //                         currentIndex: i
        //                     })
        //                 } else if (this.state.listData[i].title == '趋势彩虹（二）') {
        //
        //                 } else if (this.state.listData[i].title == '短期趋势'
        //                     && this.props.navigation.state.params.name == '短线趋势彩虹') {
        //                     this.setState({
        //                         videoPath: this.state.listData[i].playaddress,
        //                         title: '短期趋势',
        //                         currentIndex: i
        //                     })
        //                 } else {
        //                     if (this.props.navigation.state.params.name == this.state.listData[i].title) {
        //                         this.setState({
        //                             videoPath: this.state.listData[i].playaddress,
        //                             title: this.state.listData[i].title, currentIndex: i
        //                         })
        //                     }
        //                 }
        //             }
        //         })
        //     }
        // })
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <StatusBar
                    animated={true}
                    // hidden={!this.state.isShowController}
                    hidden={true}
                    translucent={true}
                    barStyle={'light-content'} // enum('default', 'light-content', 'dark-content')
                >
                </StatusBar>
                <View style={{ flex: 1, marginLeft: baseStyle.isIPhoneX ? 44 : 0, backgroundColor: '#000' }}>
                    {this._renderVideoView()}
                    {this._noNet()}
                    {this._clickedView()}
                    {this._backBar()}
                    {this._controllerUI()}
                    {this._buffering()}
                    {this._mobile()}
                </View>

                <Animated.View style={{
                    width: 245,
                    position: 'absolute',
                    top: 0,
                    left: height + 245,
                    backgroundColor: '#000000',
                    bottom: 0,
                    height: width,
                    transform: [
                        { translateY: this.state.trans.y },
                        { translateX: this.state.trans.x },
                    ],
                    //alignItems: 'center',
                    justifyContent: "center",
                    paddingTop: ScreenUtil.scaleSizeW(28)
                }}>
                    <View style={{ marginLeft: ScreenUtil.scaleSizeW(40), marginBottom: ScreenUtil.scaleSizeW(28) }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: '#FFFFFF' }}>指标视频</Text>
                    </View>
                    {this._aboutVideoList()}
                </Animated.View>
            </View>
        );
    }

    //相关视频
    _aboutVideo() {
        this.setState({ isShowController: false }, () => {
            Animated.spring(this.state.trans, {
                toValue: { x: baseStyle.isIPhoneX ? -534 : -490, y: 0 },
                friction: 10
            }).start();
        })
    }

    _clickedView() {
        return (
            Platform.OS == 'android' ? <TouchableNativeFeedback onPress={() => this._isShowControllerUI()}>
                <View style={{
                    width: this.state.height,
                    height: this.state.width,
                    backgroundColor: 'argb(0,0,0,0)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }} />
            </TouchableNativeFeedback>
                :
                null
        );
    }

    _aboutVideoList() {
        return (
            <View style={{ flex: 1, width: 245 }}>
                <FlatList
                    ref={(flatList) => this._flatList = flatList}
                    renderItem={this._renderItem}
                    refreshing={false}
                    onEndReachedThreshold={0}
                    extraData={this.state}
                    // getItemLayout={(data,index)=>(
                    //     {length: 100, offset: (100+2) * index, index}
                    // )}
                    data={this.state.listData}>
                </FlatList>
            </View>
        );
    }

    /// 上传埋点 切换视频或者视频播放结束时
    upLoadSensorsDataAction = (clearParams) => {
        if (this.currentVideoUploadPlayInfo == false && this.state.allTime > 0) {// 防止在播放完成视频上传了之后点击返回时重复提交
            sensorsDataClickObject.videoPlay.play_duration = this.state.currPosition == 0 ? this.state.allTime / 1000 : this.state.currPosition / 1000
            sensorsDataClickObject.videoPlay.video_time = this.state.allTime / 1000
            sensorsDataClickObject.videoPlay.is_finish = true
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.videoPlay, undefined, clearParams)
            sensorsDataClickObject.videoPlay.video_evaluation = ''
        }
        this.currentVideoUploadPlayInfo = true
    }

    _renderItem(item) {
        let data = item.item;
        let borderColor = '#F8F8F8';
        let textColor = '#FFFFFF';
        if (this.state.title == data.title) {
            borderColor = '#F92400';
            textColor = '#F92400'
        }
        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {
                    this.setState({ title: data.title, currentIndex: item.index }, () => {                        
                        this._isShowControllerUI();
                        if (Platform.OS == 'android') this.setState({ isShowBuffering: true })
                        this.currentVideoUploadPlayInfo = false
                        this.upLoadSensorsDataAction(false)
                        this.currentVideoUploadPlayInfo = false
                        this.player.switchUrl(data.play_address)
                        this.setState({ listData: [] }, () => {
                            this.setState({ listData: this.data, currentPosition: 0, playOrPause: false })
                        })
                        sensorsDataClickObject.videoPlay.class_series = data.setsystem
                        sensorsDataClickObject.videoPlay.class_name = data.title
                        sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(data.createTime), 'yyyy-MM-dd')
                    })                    
                }}>
                    <View style={{
                        borderColor: borderColor,
                        borderRadius: 3,
                        borderWidth: 0.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: ScreenUtil.scaleSizeW(60),
                        width: 245 - ScreenUtil.scaleSizeW(80),
                        marginBottom: ScreenUtil.scaleSizeW(40),
                    }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: textColor }}
                            numberOfLines={1}
                            maxLength={11}
                        >{data.title}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    //data.title

    _renderVideoView() {
        if (Platform.OS == 'android') {
            return (<VideoView style={{ width: this.state.height + this.state.navigatorHeight, height: this.state.width }}
                ref={videoPlayer => this.player = videoPlayer}
                VideoPath={this.state.videoPath}
                getStreamState={(event) => {
                    if (this.state.isPlay) this.player.start();
                    this.setState({ allTime: event.nativeEvent.allTime, })
                }}
                getNavigatorHeight={(event) => {
                    {/*this.setState({navigatorHeight:event.nativeEvent.navigatorHeight})*/
                    }
                }}
                getOverLiveEvent={() => {

                }}

                getPlayState={() => {
                    this.setState({ playOrPause: false, isShowBuffering: false })
                    this.timer = setInterval(
                        () => {
                            this.state.playOrPause ? null : this.player.getPositionForRN()
                        },
                        1000,
                    );
                }}
                getPauseState={() => {
                    this.setState({ playOrPause: true })
                    this.timer && clearInterval(this.timer);
                }}
                getBufferStartState={() => {
                    this.setState({ isShowBuffering: true })
                }}
                getBufferEndState={() => {
                    this.setState({ isShowBuffering: false })
                }}
                getReleaseEvent={() => {

                }}
                getVodOverState={() => {
                    this.timer && clearInterval(this.timer);
                    this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                        if (this.state.currentIndex <= this.addressData.length - 1
                            && this.addressData[this.state.currentIndex]
                            && this.name[this.state.currentIndex]) {
                            this.setState({
                                title: this.name[this.state.currentIndex],
                                currentTime: "00:00"
                            })
                            this.setState({ listData: [] }, () => {
                                this.setState({
                                    listData: this.data,
                                    currentPosition: 0,
                                    playOrPause: false
                                })
                            })
                            this.player.switchUrl(this.addressData[this.state.currentIndex])
                            let itemData = this.data[this.state.currentIndex]
                            sensorsDataClickObject.videoPlay.class_series = itemData.setsystem
                            sensorsDataClickObject.videoPlay.class_name = itemData.title
                            sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(itemData.createTime), 'yyyy-MM-dd')
                        } else {
                            this.setState({ playOrPause: true }, () => {
                                this.player.pause()
                            })
                        }
                        this.currentVideoUploadPlayInfo = false
                        this.upLoadSensorsDataAction(false)
                    })
                }}
                getCurrentPosition={(event) => {
                    this.setState({
                        currPosition: event.nativeEvent.currentPosition,
                        currentTime: moment(event.nativeEvent.currentPosition).format("mm:ss"),
                    })
                }}
            />)
        }
        else {
            return (
                <View style={{
                    width: baseStyle.isIPhoneX ? this.state.height - 88 : this.state.height,
                    height: baseStyle.isIPhoneX ? this.state.width - 21 : this.state.width
                }}>
                    <VideoPlayerView style={{ flex: 1 }}
                        videoPath={this.state.videoPath}
                        ref={videoPlayer => this.player = videoPlayer}
                        getCurrentPosition={(event) => {
                            this.setState({
                                currPosition: event,
                                currentTime: moment(event).format("mm:ss"),
                            })
                        }}
                        getDuration={(duration) => {
                            this.setState({ allTime: duration })
                        }}
                        getBufferStartState={() => {
                            this.setState({ isShowBuffering: true })
                        }}
                        getBufferEndState={() => {
                            this.setState({ isShowBuffering: false })
                        }}
                        getVideoFinishState={() => {
                            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                                if (this.state.currentIndex <= this.addressData.length - 1
                                    && this.addressData[this.state.currentIndex]
                                    && this.name[this.state.currentIndex]) {

                                    this.setState({
                                        title: this.name[this.state.currentIndex],
                                        currentTime: "00:00"
                                    })
                                    this.setState({ listData: [] }, () => {
                                        this.setState({
                                            listData: this.data,
                                            currentPosition: 0,
                                            playOrPause: false
                                        })
                                    })
                                    this.player.switchUrl(this.addressData[this.state.currentIndex])
                                    this.player.switchUrl(this.addressData[this.state.currentIndex])
                                    let itemData = this.data[this.state.currentIndex]
                                    sensorsDataClickObject.videoPlay.class_series = itemData.setsystem
                                    sensorsDataClickObject.videoPlay.class_name = itemData.title
                                    sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(itemData.createTime), 'yyyy-MM-dd')
                                } else {
                                    this.setState({ playOrPause: true }, () => {
                                        this.player.pause()
                                    })
                                }
                                this.currentVideoUploadPlayInfo = false
                                this.upLoadSensorsDataAction(false)
                            })
                        }}
                        getErrorState={() => {

                        }}
                    />
                    <TouchableOpacity style={{
                        width: this.state.height,
                        height: this.state.width,
                        backgroundColor: 'argb(0,0,0,0)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }} onPress={() => this._isShowControllerUI()}>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    _controllerUI() {
        if (this.state.isShowController) {
            if (Platform.OS == 'ios') {
                return (
                    <TouchableOpacity onPress={() => this._isShowControllerUI()}>
                        {this._controllUI()}
                    </TouchableOpacity>
                );
            } else {
                return (
                    <TouchableNativeFeedback onPress={() => this._isShowControllerUI()}>
                        {this._controllUI()}
                    </TouchableNativeFeedback>
                );
            }
        }
    }

    _controllUI() {
        return (
            <View style={{ position: 'absolute', right: 0, bottom: 0, left: 0 }}>
                <ImageBackground style={{
                    width: baseStyle.isIPhoneX ? this.state.height - 88 : this.state.height,
                    height: this.state.width / 3
                }}
                    source={require('../images/livelession/MorningUnderstand/zzx_jianbianzhezhao.png')}>
                    <View style={{ flexDirection: 'row', marginTop: 90, alignItems: 'center', }}>
                        <TouchableOpacity onPress={() => this._playOrPause()}>
                            <Image style={{ width: 20, height: 20, marginLeft: 15 }}
                                source={this.state.playOrPause
                                    ?
                                    require('../images/livelession/play.png')
                                    :
                                    require('../images/livelession/pause.png')}
                            />
                        </TouchableOpacity>
                        <Text style={{
                            marginLeft: 10,
                            color: '#FFFFFF',
                            fontSize: 9,
                            backgroundColor: 'rgba(0,0,0,0)'
                        }}>{this.state.currentTime}</Text>
                        <View style={{ marginLeft: 6, flex: 1, width: this.state.height }}>
                            <Slider
                                style={{ height: 20, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                value={this.state.currPosition}
                                maximumValue={this.state.allTime}
                                minimumTrackTintColor={'#D80C18'}
                                maximumTrackTintColor={'#C7C7C7'}
                                thumbTintColor={'#D80C18'}
                                trackStyle={{ height: 2 }}
                                thumbStyle={{ width: 12, height: 12 }}
                                onValueChange={value => {
                                    this.player.seekTo(parseInt(value))
                                }}
                            />
                        </View>
                        <Text style={{
                            marginLeft: 6,
                            color: '#FFFFFF',
                            fontSize: 9,
                            backgroundColor: 'rgba(0,0,0,0)'
                        }}>{moment(this.state.allTime).format("mm:ss")}</Text>
                        <TouchableOpacity onPress={() => this._aboutVideo()}>
                            <View>
                                <Text style={{
                                    color: '#FFFFFF',
                                    fontSize: 14,
                                    marginLeft: 14,
                                    marginRight: 14,
                                    backgroundColor: 'rgba(0,0,0,0)'
                                }}>
                                    相关视频
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    _playOrPause() {
        if (this.state.videoPath == '') return;
        this.setState({ playOrPause: !this.state.playOrPause }, () => {
            if (this.state.playOrPause) {
                this.player.pause()
            } else {
                this.player.start()
            }
        })
    }

    _isShowControllerUI() {
        Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 }, friction: 10 }).start();
        this.setState({ isShowController: !this.state.isShowController })
    }

    _backBar() {
        if (this.state.isShowController) {
            if (Platform.OS == 'ios') {
                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                        {/*<TouchableOpacity onPress={() => this._isShowControllerUI()}>*/}
                        {this._backBarUI()}
                        {/*</TouchableOpacity>*/}
                    </View>
                );
            } else {
                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                        {/*<TouchableNativeFeedback onPress={() => this._isShowControllerUI()}>*/}
                        {this._backBarUI()}
                        {/*</TouchableNativeFeedback>*/}
                    </View>
                );
            }


        }
    }

    _backBarUI() {
        return (

            <ImageBackground style={{
                flexDirection: 'row', alignItems: 'center',
                width: Platform.OS === 'ios' ? baseStyle.isIPhoneX ? this.state.height - 88 : this.state.height : this.state.height + this.state.navigatorHeight,
                paddingTop: ScreenUtil.scaleSizeW(10)
            }}
                source={require('../images/livelession/PanHouCeLue/video_tuceng_up.png')}>
                <TouchableOpacity onPress={() => {
                    this.upLoadSensorsDataAction(false)
                    this._isShowControllerUI()
                    this.setState({ playOrPause: true }, () => {
                        this.player && this.player.pause()
                        this.player && this.player.release()
                        if (Platform.OS == 'ios') {
                            this.getTimeTimer && clearTimeout(this.getTimeTimer)
                            this.getPositionTimer && clearTimeout(this.getPositionTimer)
                        } else {
                            this.timer && clearInterval(this.timer);
                        }
                        if (this.props.navigation.state.params.fromPage == 'DetailPage') {
                            if (Platform.OS === 'ios') {
                                Orientation.getOrientation((err, orientation) => {
                                    //console.log(orientation);
                                    if (orientation !== 'LANDSCAPE') {
                                        Orientation.lockToLandscapeLeft();
                                        Orientation.lockToPortrait();
                                    } else {
                                        Orientation.lockToPortrait();
                                    }
                                })
                            } else {
                                Orientation.lockToPortrait();
                            }
                        }
                        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                        if (Platform.OS == 'ios') {
                            this.props.navigation.state.params.refreshOrientionListener()
                        }
                        Navigation.pop(this.props.navigation)
                    })
                }}>
                    <Image style={{ height: 32, width: 32, marginLeft: 15 }}
                        source={require('../images/livelession/PanHouCeLue/back_white.png')} />
                </TouchableOpacity>
                <Text
                    style={{ fontSize: 14, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0)' }}>{this.props.navigation.state.params.name ? this.props.navigation.state.params.name : this.state.title}</Text>
            </ImageBackground>
        );
    }
    //this.state.title

    _buffering() {
        if (this.state.isShowBuffering) {
            return (
                <View style={{
                    position: 'absolute',
                    top: 40,
                    left: 0,
                    right: 0,
                    bottom: 40,
                    backgroundColor: 'rgba(0,0,0,0)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Image style={{ width: 22, height: 22 }}
                        source={require('../images/livelession/MorningUnderstand/buffering.gif')} />
                    <TouchableOpacity
                        style={{
                            width: this.state.height,
                            height: this.state.width,
                            backgroundColor: 'argb(0,0,0,0)',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                        onPress={() => this._isShowControllerUI()}>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    //直播流量时
    _mobile() {
        if (this.state.mobile) {//该值为true时用的运营商流量
            return (
                <View style={{
                    position: 'absolute',
                    right: 0,
                    left: 0,
                    top: 40,
                    width: this.state.height,
                    height: this.state.width - 40,
                    backgroundColor: 'rgba(0,0,0,0)',
                    justifyContent: 'center',
                    alignItems: 'center',

                }}>
                    <Text style={{ fontSize: 12, color: '#FFFFFF', backgroundColor: '#000000' }}>
                        正在使用非WIFI网络，播放将产生流量费用
                    </Text>
                    <TouchableOpacity style={{ marginTop: 12, width: 85, height: 34 }}
                        onPress={() => {
                            this._onClickMobileButton()
                        }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                            <Image style={{ width: 22, height: 22 }}
                                source={require('../images/livelession/play.png')} />
                            <Text style={{ fontSize: 12, color: '#FFFFFF', backgroundColor: '#000000', marginLeft: 5 }}>
                                播放
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );

        }
    }

    _noNet() {
        if (this.state.noNet) {
            return (
                <View style={{
                    position: 'absolute',
                    right: 0,
                    left: 0,
                    top: 0,
                    width: this.state.height,
                    height: this.state.width,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{ fontSize: 12, color: '#FFFFFF' }}>
                        当前网络不可用，请检查网络..
                    </Text>
                </View>
            );
        }
    }

    //监听网络状态的改变
    handleConnectivityChange = (status) => {
        this.setState({ isPlaying: true })
        if (Platform.OS == 'android') {
            if (status.type == 'none') {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: true, mobile: false, isWiFi: false })

            } else if (status.type == 'cellular') {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: false, mobile: true, isWiFi: false })

            } else if (status.type == 'unknown') {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: true, mobile: false, isWiFi: false })

            } else if (status.type == 'wifi') {
                this.setState({ noNet: false, mobile: false, isWiFi: true })
            } else {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: true, mobile: false, isWiFi: false })

            }
        } else {
            if (status.type == 'none') {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: true, mobile: false, isWiFi: false })

            } else if (status.type == 'cellular') {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: false, mobile: true, isWiFi: false })
            } else if (status.type == 'unknown') {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: true, mobile: false, isWiFi: false })
            } else if (status.type == 'wifi') {
                this.setState({ noNet: false, mobile: false, isWiFi: true })
            } else {
                this.setState({ playOrPause: true }, () => {
                    this.player.pause()
                })
                this.setState({ noNet: true, mobile: false, isWiFi: false })
            }
        }

    }

    _onClickMobileButton() {
        this.setState({ mobile: false })
        if (this.state.isPlaying) {
            this._playOrPause()
        } else {
            if (Platform.OS == 'ios') {
                if (this.state.videoPath == '') {
                    this.getTimeTimer = setTimeout(
                        () => {
                            if (this.state.videoPath != '') {
                                this.setState({ isPlay: false, isShowBuffering: false }, () => {
                                    this._playOrPause()
                                    this.getPositionTimer && clearTimeout(this.getPositionTimer)
                                    this.getPositionTimer = setInterval(
                                        () => {
                                            this.player.getPosition()
                                        },
                                        1000,
                                    );
                                    this.getTimeTimer && clearTimeout(this.getTimeTimer)
                                })
                            }
                        },
                        2000
                    );
                } else {
                    this.setState({ isPlay: false, isShowBuffering: false }, () => {
                        this._playOrPause();
                        this.getPositionTimer && clearTimeout(this.getPositionTimer)
                        this.getPositionTimer = setInterval(
                            () => {
                                this.player.getPosition()
                            },
                            1000,
                        );
                    })
                }
            } else {
                if (this.state.videoPath == '') {
                    this.getTimeTimer = setTimeout(
                        () => {
                            if (this.state.videoPath != '') {
                                this.setState({ isPlay: false, isShowBuffering: false }, () => {
                                    this._playOrPause()
                                    this.getTimeTimer && clearTimeout(this.getTimeTimer)
                                })
                            }
                        },
                        2000
                    );
                } else {
                    this.setState({ isPlay: false, isShowBuffering: false }, () => {
                        this._playOrPause()
                    })
                }
            }
        }

    }

    onBackAndroid = () => {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        this.setState({ playOrPause: true }, () => {
            this.player && this.player.pause()
            this.player && this.player.release()
            if (Platform.OS == 'ios') {
                this.getTimeTimer && clearTimeout(this.getTimeTimer)
                this.getPositionTimer && clearTimeout(this.getPositionTimer)
            } else {
                this.timer && clearInterval(this.timer);
            }
            if (this.props.navigation.state.params.fromPage == 'DetailPage') {
                this.props.navigation.state.params.toPortrait && this.props.navigation.state.params.toPortrait();
                Orientation.lockToPortrait();
                DeviceEventEmitter.emit('toPortrait');
            }
            // Navigation.pop(this.props.navigation)

            this.timerBack = setTimeout(
                () => {
                    Navigation.pop(this.props.navigation);
                    this.timerBack && clearTimeout(this.timerBack);
                },
                500
            );
        })
        return true;
    };
}


