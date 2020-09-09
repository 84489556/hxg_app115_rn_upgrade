/**
 *
 *视频解盘(视频直播间)
 *
 * */
import moment from "moment";
import RCTDeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';
import React, { Component } from "react";
import { Animated, BackHandler, DeviceEventEmitter, Image, ImageBackground, Platform, ScrollView, StatusBar, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, AppState, View } from "react-native";
import Toast from 'react-native-easy-toast';
import MarqueeLabel from 'react-native-lahk-marquee-label';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import Slider from "react-native-slider";
import Orientation from '../../../../node_modules_modify/react-native-orientation';
import * as baseStyle from '../../../components/baseStyle';
import PageHeader from '../../../components/PageHeader';
import ShareView, { ShareType } from '../../../components/ShareView';
import * as BuriedpointUtils from "../../../utils/BuriedpointUtils";
import { checkPhone, getHmsORms, get2HmsORms, dateFormats } from "../../../utils/CommonUtils";
import RATE from '../../../utils/fontRate.js';
import UserInfoUtil from "../../../utils/UserInfoUtil";
import Yd_cloud from "../../../wilddog/Yd_cloud";
//ios播放器
import GSLivePlayer_ios from "./IntradayPoint/liveView/NativeLiveView.js";
import GSVodPlayer_ios from "./IntradayPoint/liveView/NativeVodView.js";
import AboutTeacher from './LiveRoomPages/AboutTeacher';
import CommentList from './LiveRoomPages/CommentList';
import LessionPlan from './LiveRoomPages/LessionPlan';
import VodList from './LiveRoomPages/VodList';
//Android播放器
import GSLivePlayer_android from "./LiveVideoView";
import GSVodPlayer_android from "./ReplayVideoView";
import NetInfo from "@react-native-community/netinfo";
import { sensorsDataClickObject, sensorsDataClickActionName } from "../../../components/SensorsDataTool";
import ShareSetting from "../../../modules/ShareSetting";
// import ShareSetting from "../../../modules/ShareSetting";

let { NativeModules } = require('react-native');

const ZHENGUPIAO_MESSAGE1 = '短期走势';
const ZHENGUPIAO_MESSAGE2 = '该不该持有';
const ZHENGUPIAO_MESSAGE3 = '应如何操作';
var clickedTime = 0;
var liveStatus = true;

export default class LiveRoom extends Component {
    static navigationOptions = ({ navigation }) => ({
        gesturesEnabled: navigation.state.params.gesturesEnabled,
    });

    constructor(props) {
        super(props)
        this.plan_Ref = Yd_cloud().ref(ZBJ_ydyun + 'classes')
        this.notice_Ref = Yd_cloud().ref(ZBJ_ydyun + 'notice')
        this.count = 0;
        this.inital_height = 0
        this._subs = null
        this.from = null
        this.isLive = true
        this.currentVideoUploadPlayInfo = false; // 当前播放的视频是否已经提交埋点
        //定义一个用于判断是否可以竖屏的变量
        this.state = {
            listData: [],
            isShowVideoView: true,
            dianBoDiZhi: '',
            zhiBoDiZhi: ZBJ_roomid,
            isWenHangQing: false,
            isZhenGuPiao: false,
            isBiaoQing: false,
            isClicked: true,
            isClickedForWHQ: true,
            isClickedForZGP: true,
            isShowZGPMainUI: true,
            isShowDQZS: false,
            isShowIsHave: false,
            isShowHowDoing: false,
            dqzs_value: '',
            rhcz_value: '',
            isShowImage: true,
            isFullScreen: false,
            height: 211,
            width: baseStyle.width,
            fullScreenHeight: baseStyle.height,
            laoshi: this.props.navigation.state.params.laoshi,
            start: this.props.navigation.state.params.start,
            title: this.props.navigation.state.params.title,
            end: this.props.navigation.state.params.end,
            header: this.props.navigation.state.params.header,
            status: this.props.navigation.state.params.status,
            isliving: this.props.navigation.state.params.isliving,
            descp: this.props.navigation.state.params.descp,
            currentTime: '00:00',
            currPosition: 0,
            allTime: 0,
            playOrPause: false,
            isPlay: true,
            notice: '',
            isLandscape: false,
            isShowControllerUI: true,
            isOnPressIn: false,
            currentId: -1,
            isLive: false,
            isShowVideoUI: true,
            trans: new Animated.ValueXY(),
            mHeight: 0,
            navigatorHeight: 0,
            isShowJianJie: false,
            notchSize: 0,
            isMeiRi: false,
            isHeXin: true,
            tipLeft: 38,
            gd_Array: [],
            kj_Array: [],
            whq_Array: [],
            isNet: false,
            isMobile: false,
            isWiFi: true,
        }
        this._videoView = this._videoView.bind(this)
        this._VideoView = this._VideoView.bind(this)
        this._StatusBar = this._StatusBar.bind(this)
        this._backBar = this._backBar.bind(this)
        this._currPlayingIntroduce = this._currPlayingIntroduce.bind(this)
        this._aboutPlayingVideo = this._aboutPlayingVideo.bind(this)
        this._loadData = this._loadData.bind(this)
        this._wenHangQingUI = this._wenHangQingUI.bind(this)
        this._zhenGuPiaoUI = this._zhenGuPiaoUI.bind(this)
        this._biaoQingUI = this._biaoQingUI.bind(this)
        this._zhenGuPiaoChildUI = this._zhenGuPiaoChildUI.bind(this)
        this._onChangeTextForDQZS = this._onChangeTextForDQZS.bind(this)
        this._onChangeTextForHowDoing = this._onChangeTextForHowDoing.bind(this)
        this._showImage = this._showImage.bind(this)
        this._livePlayerController = this._livePlayerController.bind(this)
        this._handleAppStateChange = this._handleAppStateChange.bind(this)
        this._controllUI = this._controllUI.bind(this)
        this._noticeUI = this._noticeUI.bind(this)
        this._fetch = this._fetch.bind(this)
        this._WHQHeight = 27 + 27 + 15

        this._registerEvents();
        this.isDidMount = false;
    }

    _unregisterEvents() {
        this._subs.forEach(e => e.remove());
        this._subs = [];
    }

    _registerEvents(id) {

        this._subs = [
            RCTDeviceEventEmitter.addListener('LiveVideoComplete', ev => {
                this.onComplete(ev)
            })
        ];

    }

    onComplete() {
        if (this.from === 'ExpertsAnalysis') {

        }
        else {
            setTimeout(() => {
                this.onBackAndroid();
            }, 2 * 1000)
        }
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            //拦截手机自带返回键
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
            NativeModules.ScreenLightManager.screen_ON();
            NativeModules.GETNOTCHSIZE.getNotchSize((size) => {
                this.setState({ notchSize: size })
            });
            NativeModules.getnaviheight.getNaviHeight((naviHeight) => {
                this.setState({ navigatorHeight: naviHeight })
            });
        } else {
            this.setState({ navigatorHeight: baseStyle.isIPhoneX ? 57 : 0 })
        }
        
        Orientation.lockToPortrait();
        this.registerListener();
        this.netListener();
        AppState.addEventListener('change', this._handleAppStateChange);

        if (this.props.navigation.state.params.from) {
            this.from = this.props.navigation.state.params.from
        }
    }


    registerListener() {
        this.isFull = DeviceEventEmitter.addListener('isFull', (isFull) => {
            if (Platform.OS === 'ios') {
                if (isFull) {
                    this.props.navigation.setParams({
                        gesturesEnabled: false,
                    });
                } else {
                    this.props.navigation.setParams({
                        gesturesEnabled: true,
                    });
                }
            }

        });

        this.pasueListener = DeviceEventEmitter.addListener('pasueListener', () => {
            if (!this.state.isShowVideoView) {
                if (Platform.OS == 'ios') {
                    this._vodView && this._vodView.pause()
                } else {
                    this.video && this.video.pause()
                }
            }
        })
    }

    //监听后台状体的具体实现函数
    _handleAppStateChange(appState) {
        if (appState == 'background') {
            this.setState({ playOrPause: true }, () => {
                if (this.state.isShowVideoView) {
                    if (Platform.OS == 'ios') {
                        this._liveView && this._liveView.pause();
                    } else {
                        this.livevideo && this.livevideo.pause();
                    }
                } else {
                    if (Platform.OS == 'ios') {
                        this._vodView && this._vodView.pause();
                    } else {
                        this.video && this.video.pause();
                    }
                }
            })
        } else if (appState == 'active') {
            this.setState({ playOrPause: false }, () => {
                if (this.state.isShowVideoView) {
                    if (Platform.OS == 'ios') {
                        this._liveView && this._liveView.play();
                    } else {
                        this.livevideo && this.livevideo.start();
                    }
                } else {
                    if (Platform.OS == 'ios') {
                        this._vodView && this._vodView.resume();
                    } else {
                        this.video && this.video.resume();
                    }
                }
            })
        }

    }
    netListener() {
        //注册监听网络状态改变
        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        if (Platform.OS == 'android') {
            this._getNetInfoState(() => {
                //没网
                this.setState({ isNet: true, isMobile: false, isWiFi: false }, () => {
                    // if (this.state.isShowVideoView) {
                    //     this.livevideo && this.livevideo.pause()
                    // } else {
                    //     this.video && this.video.pause()
                    // }
                })
            }, () => {
                //运营商流量
                this.setState({ isMobile: true, isWiFi: false, isNet: false }, () => {
                    this._loadData()
                })
            }, () => {
                //wifi

                this.setState({ isWiFi: true, isNet: false, isMobile: false }, () => {
                    this._loadData()
                })
            })
        } else {
            NetInfo.fetch().done((status) => {
                if (status.type == 'none') {
                    //没网
                    this.setState({ isNet: true, isMobile: false, isWiFi: false })
                } else if (status.type == 'cellular') {
                    //运营商流量
                    this.setState({ isMobile: true, isNet: false, isWiFi: false }, () => {
                        this._loadData()
                    })
                } else if (status.type == 'wifi') {
                    //wifi
                    this.setState({ isMobile: false, isNet: false, isWiFi: true }, () => {
                        this._loadData()
                    })
                    // this._loadData()
                } else if (status.type == 'unknown') {
                    this.setState({ isNet: true })
                }
            });

        }
    }

    componentDidMount() {
        this.isDidMount = true;
        this.currentVideoUploadPlayInfo = false
        setTimeout(() => {
            this.tab.goToPage(this.state.status == '未开始' ? 1 : this.state.status == '回看' ? 2 : 0)
        }, 500);
        //后台接口this.state.isliving值改为解盘中后修改去掉||this.state.isliving == '直播中'

        //console.log('VideoViewManager  isliving='+this.state.isliving);
        if (this.state.isShowVideoView && (this.state.isliving == '解盘中' || this.state.isliving == '直播中') && this.state.isPlay) {

            this.setState({ isPlay: false, isShowImage: false, isLive: true }, () => {
                if (Platform.OS == 'ios') {
                    this._liveView && this._liveView.play()
                } else {
                    this.livevideo && this.livevideo.start()
                }
            })
        }
        let hexinguandianUrl = ZBJDomainName + "/api/gethxgd"
        let meirikejianUrl = ZBJDomainName + "/api/getkj"
        this._fetch_HXGD(hexinguandianUrl, true)
        this._fetch_HXGD(meirikejianUrl, false);
        let wenhangqingUrl = ZBJDomainName + "/api/questions?rid=" + ZBJ_rid
        this._fetch_WHQ(wenhangqingUrl, true)
        if (Platform.OS === 'ios') {
            this.props.navigation.setParams({
                gesturesEnabled: true,
            });
        };
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.shipinzhibojian);
        });
    }

    /**判断当前网络状态**/
    _getNetInfoState(noNetCallBackFunction, mobileNetCallBackFunction, wifiCallBackFunction) {
        NetInfo.fetch().done((status) => {
            //console.log("请求网络",status)
            if (status.type == 'none') {
                noNetCallBackFunction && noNetCallBackFunction()

            } else if (status.type == 'cellular') {
                mobileNetCallBackFunction && mobileNetCallBackFunction()

            } else if (status.type == 'wifi') {
                wifiCallBackFunction && wifiCallBackFunction()
            } else {
                this.setState({ isNet: true })
            }
        });
    }

    //监听网络状态的改变
    handleConnectivityChange = (status) => {
        if (Platform.OS == 'android') {
            if (status.type == 'none') {
                this.setState({ isMobile: false, isWiFi: false, isNet: true }, () => {
                    if (this.state.isShowVideoView) {
                        this.livevideo && this.livevideo.pause()
                    } else {
                        this.video && this.video.pause()
                    }
                })
            } else if (status.type == 'cellular') {
                this.setState({ isMobile: true, isWiFi: false, isNet: false }, () => {
                    if (!this.state.isShowVideoView) {
                        this.setState({ playOrPause: true }, () => {
                            this.video.pause()
                        })
                    }
                })
            } else if (status.type == 'unknown') {
                this.setState({ isMobile: false, isWiFi: false, isNet: true, }, () => {
                    if (this.state.isShowVideoView) {
                        this.livevideo && this.livevideo.pause()
                    } else {
                        this.setState({ playOrPause: true }, () => {
                            this.video && this.video.pause()
                        })
                    }
                })
            } else if (status.type == 'wifi') {
                this.setState({ isMobile: false, isWiFi: true, isNet: false }, () => {
                    if (this.state.isShowVideoView) {
                        this.livevideo && this.livevideo.start()
                    } else {
                        this.video && this.video.resume()
                    }
                })
            } else {
            }
        } else {
            if (!this.state.isShowVideoView) {
                this._vodView && this._vodView.netState({ status: status })
            } else {
                if (status.type == 'none') {
                    this.setState({ isMobile: false, isWiFi: false, isNet: true })
                } else if (status.type == 'cellular') {
                    this.setState({ isMobile: true, isWiFi: false, isNet: false })
                } else if (status.type == 'unknown') {
                    this.setState({ isMobile: false, isWiFi: false, isNet: true })
                } else if (status.type == 'wifi') {
                    this.setState({ isMobile: false, isWiFi: true, isNet: false }, () => {
                        this._liveView && this._liveView.play()
                    })
                } else {
                    this.setState({ isMobile: false, isWiFi: true, isNet: false })
                }
            }
        }

    }

    getWHQContent(index) {
        if (index >= this.state.whq_Array.length)
            return ""

        return this.state.whq_Array[index].question

    }

    _fetch_WHQ(url, isWHQ) {
        fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((responseJson) => {
                if (this.isDidMount == true) {
                    if (isWHQ) {
                        // console.log('wenhangqing='+JSON.stringify(responseJson));
                        this.setState({ whq_Array: responseJson })
                        if (responseJson) {
                            this._WHQHeight += responseJson.length * (15 + 39)
                        }
                    } else {
                        this.setState({ zgp_Array: responseJson })
                    }
                }
            })
            .catch((error) => {
                //console.log(error.message);
            });
    }

    _fetch_HXGD(url, isHX) {
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                if (this.isDidMount == true) {
                    if (isHX) {
                        this.setState({ gd_Array: responseJson })
                    } else {
                        this.setState({ kj_Array: responseJson })
                    }
                }
            })
            .catch((error) => {

            });
    }

    componentWillUnmount() {
        this.netInfoSubscriber && this.netInfoSubscriber();
        this.isDidMount = false;
        this.pasueListener && this.pasueListener.remove()
        if (Platform.OS == 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
            if (this.state.isShowVideoView) {
                this.livevideo && this.livevideo.leave()
            } else {
                this.video && this.video.leave()
            }
            NativeModules.ScreenLightManager.screen_OFF();
            Orientation.lockToPortrait();
        }
        this.naviEvent && this.naviEvent.remove();
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.timer && clearInterval(this.timer);
        this.timer1 && clearTimeout(this.timer1)
        this.timer2 && clearTimeout(this.timer2)
        this.timer3 && clearTimeout(this.timer3)
        this.timer4 && clearTimeout(this.timer4)
        this.timer5 && clearTimeout(this.timer5)
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.isFull && this.isFull.remove();
        this._unregisterEvents()

    }

    _loadData() {
        this.plan_Ref.orderByKey().get((snap) => {
            if (this.isDidMount == true)
                this.detailPlan(snap)
        })
        this.plan_Ref.on('value', (snap) => {
            this.plan_Ref.orderByKey().get((snap) => {
                if (this.isDidMount == true)
                    this.detailPlan(snap)
            })
        })

        this.notice_Ref.orderByKey().get((snap) => {
            if (this.isDidMount == true)
                this.detailNotice(snap)
        })
        this.notice_Ref.on('value', (snap) => {
            this.notice_Ref.orderByKey().get((snap) => {
                if (this.isDidMount == true)
                    this.detailNotice(snap)
            })
        })
    }


    //供外界调用，释放所有播放器
    releaseAllPlay() {
        if (Platform.OS == 'ios') {
            this._liveView && this._liveView.stop()
            this._vodView && this._vodView.pause()
        } else {
            this.video && this.video.leave()
            this.livevideo && this.livevideo.leave()
            this.setState({ isShowVideoUI: false })
            NativeModules.ScreenLightManager.screen_OFF();
        }
        Orientation.lockToPortrait();
    }

    //从新回到直播间页面是ios的调用
    playForIOS(isPlayLive) {
        if (this.state.isShowVideoView) {
            if (isPlayLive) {
                this.setState({ isShowImage: false, isLive: true }, () => {
                    this._liveView && this._liveView.play()
                })
            }
        } else {
            if (this._vodView)
                this._vodView && this._vodView.play()
        }
    }


    //无网提示
    _showNoNet() {
        if (this.state.isNet) {
            return (
                <View style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#262628',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View>
                        <Image source={require('../../../images/livelession/noNet.png')} />
                        <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 15 }}>亲亲，咱们要失联了...</Text>
                    </View>
                </View>
            )

        } else {
            return null;
        }
    }

    //运营商流量状态
    _noWiFi() {
        if (this.state.isMobile) {
            Orientation.lockToPortrait();
            if (this.state.status != '回看') {
                return (
                    <View style={{
                        position: 'absolute',
                        right: 0,
                        left: 0,
                        top: 0,
                        width: baseStyle.width,
                        height: baseStyle.height + 50,
                        backgroundColor: '#rgba(0,0,0,0.4)',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <View style={{
                            width: 300,
                            height: 130,
                            backgroundColor: '#FFFFFF',
                            alignItems: 'center',
                            borderRadius: 8
                        }}>
                            <Text style={{ fontSize: 15, color: '#666666', marginTop: 15 }}>
                                流量提醒
                            </Text>
                            <Text style={{ fontSize: 18, color: '#262628', marginTop: 10 }}>
                                当前无WIFI，是否允许流量观看？
                            </Text>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                marginTop: 15,
                                borderTopColor: "#F1F1F1",
                                borderTopWidth: 1
                            }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRightColor: '#F1F1F1',
                                        borderRightWidth: 1
                                    }}
                                    activeOpacity={1}
                                    onPress={() => {
                                        Orientation.lockToPortrait();
                                        Navigation.pop(this.props.navigation)

                                    }}>
                                    <View style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ fontSize: 17, color: '#006ACC' }}>
                                            取消
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    activeOpacity={1} onPress={() => {
                                        this.setState({ isMobile: false }, () => {
                                            Orientation.unlockAllOrientations();
                                        })
                                    }}>
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 17, color: '#FF0000' }}>
                                            允许
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: this.state.width,
                        height: this.state.height,
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.6)'
                    }}>
                        <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 65 }}>正在使用非WIFI网络，播放即将产生流量费用</Text>
                    </View>
                );
            }
        } else {
            return null;
        }
    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }} onLayout={(event) => {
                    let { x, y, width, height } = event.nativeEvent.layout;
                    if (this.count == 0) {
                        this.count++;
                        this.inital_height = height
                    } else {
                        if (height > width) {
                            if (!this.state.isShowJianJie) {
                                if (Platform.OS == 'android') {
                                    NativeModules.getnaviheight.getNaviHeight((naviHeight) => {
                                        this.setState({ navigatorHeight: naviHeight }, () => {
                                            if (naviHeight > 0) {
                                                Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 } }).start();
                                            }
                                        })
                                    });
                                } else {
                                    Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 } }).start();

                                }
                            }
                        }
                    }
                }}>
                    <Toast position={'center'} ref="toast" />
                    {this.state.isFullScreen ? null :
                        <View style={{ height: IsNotch ? 0 : 0, width: baseStyle.width, backgroundColor: '#F92400' }} />}
                    {/* {Platform.OS == 'ios' && baseStyle.isIPhoneX
                        ?
                        <View style={{
                            height: this.state.isFullScreen ? 0 : 34,
                            width: width,
                            backgroundColor: '#F92400'
                        }} />
                        :
                        null} */}
                    {this.state.isFullScreen ? null : this._StatusBar()}
                    {this.state.isFullScreen ? null : this._backBar()}

                    <View style={{ width: this.state.width, height: this.state.height }}>

                        {this.state.isShowVideoUI ? this._videoView() : null}
                        {!this.state.isFullScreen ? null : this._noticeUI()}
                        {!this.state.isShowVideoView ? this._controllUI() : null}
                        {this.state.isShowVideoView ? this._livePlayerController() : null}
                        {this._showImage()}
                        {this.state.status == '回看' && !this.state.isShowVideoView && Platform.OS == 'android' ? this._noWiFi() : null}
                        {(this.state.isShowControllerUI || this.state.isMobile) && !this.state.isShowVideoView //&& Platform.OS == 'android'
                            ?
                            this.middleBtn()
                            :
                            null
                        }
                        {this._showNoNet()}
                    </View>
                    {this.state.isFullScreen ? null : this._currPlayingIntroduce()}
                    {this.state.isFullScreen ? null : this._aboutPlayingVideo()}
                    {
                        this.state.isFullScreen
                            ?
                            null
                            :
                            Platform.OS == "android" &&
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                                {this._StatusBar()}
                                {this._backBar()}
                            </View>
                    }
                    {/* {this.state.isFullScreen ? null : this.hxgdBtn()} */}
                    {this._wenHangQingUI()}
                    {this._zhenGuPiaoUI()}
                    {this._biaoQingUI()}
                    <ShareView ref={(shareView) => this.shareView = shareView}
                        shareType={ShareType.xiaZai} />
                    {/* {this.state.isFullScreen ? null : this.heXinGuanDianUI()} */}
                </View>
                {this.state.status != '回看' ? this._noWiFi() : null}
            </View>
        )
    }

    hxgdBtn() {
        return (
            <View style={{ position: "absolute", bottom: 40, right: 9 }}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                        this.setState({ isShowJianJie: true }, () => {
                            if (Platform.OS == 'android') {
                                NativeModules.getnaviheight.getNaviHeight((naviHeight) => {
                                    this.setState({ navigatorHeight: naviHeight }, () => {
                                        let h = this.state.navigatorHeight == 0 ? this.state.navigatorHeight : 0
                                        Animated.spring(this.state.trans, {
                                            toValue: {
                                                x: 0,
                                                y: -(this.state.mHeight + 33 + h)
                                            }
                                        }).start();
                                    })
                                });
                            } else {
                                Animated.spring(this.state.trans, {
                                    toValue: {
                                        x: 0,
                                        y: -(this.state.mHeight + 33 + this.state.navigatorHeight)
                                    }
                                }).start();
                            }
                        })
                    }}>
                    <ImageBackground style={{ alignItems: 'center', height: 62, width: 62 }}
                        source={require('../../../images/livelession/LiveRoom/ic_liveroom_hxgd_outer.png')}>
                        <Image style={{ marginTop: 6 }}
                            source={require('../../../images/livelession/LiveRoom/ic_liveroom_hxgd_inner.png')} />
                        <Text style={{
                            color: "#FFFFFF",
                            fontSize: 9,
                            backgroundColor: 'rgba(0,0,0,0)',
                            marginTop: Platform.OS == 'ios' ? 3 : 0
                        }}>核心观点</Text>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        );
    }

    //状态栏ui
    _StatusBar() {
        return (
            <View>
                <StatusBar
                // barStyle='light-content'
                />
            </View>
        );
    }

    //返回栏ui
    _backBar() {
        return (
            <PageHeader title='视频解盘' onBack={() => {//视频直播间
                Orientation.lockToPortrait();
                Navigation.pop(this.props.navigation)
                this._liveView && this._liveView.stop()
                this.upLoadSensorsDataAction()
            }}
                rightComponent={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => {
                            this.shareView && this.shareView.show();
                            let shareClickObj = sensorsDataClickObject.shareClick
                            shareClickObj.content_show_type = '视频'
                            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.shareClick,undefined,false)

                        }}>
                            <View style={{ width: 17, height: 17, alignItems: 'flex-end' }}>
                                <Image style={{ resizeMode: 'stretch', width: 17, height: 17, }}
                                    source={require('../../../images/icon-share.png')} />
                            </View>
                        </TouchableOpacity>
                    </View>

                } />
        );
    }

    //关闭弹出来的列表
    close() {
        Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 } }).start()
    }

    //当前播放的视频介绍
    _currPlayingIntroduce() {
        let img = require('../../../images/livelession/LiveRoom/living_icon.png');
        if (this.state.status == '回看') {
            img = require('../../../images/livelession/LiveRoom/liveroom_huikan.png');
        } else if (this.state.status == '未开始') {
            img = require('../../../images/JiePan/livingroom_start.png');
        }

        return (

            <View style={{ width: baseStyle.width, height: 40, backgroundColor: '#F0F0F0', flexDirection: 'row' }}>
                <View style={{ flex: 2, flexDirection: 'row', paddingTop: 5 }}>
                    <Text style={{
                        fontSize: 14,
                        color: '#333333',
                        marginLeft: 15,
                        fontWeight: '900'
                    }}>{this.state.title || '慧选股视频解盘'}</Text>
                </View>
                {
                    (this.state.status && this.state.laoshi) ?
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            // alignItems: 'center',
                            justifyContent: 'flex-end',
                            marginRight: 15,
                            paddingTop: 8,
                        }}>

                            <Text style={{ fontSize: 10, color: '#555555', marginLeft: 10 }}>
                                {this.state.laoshi + '老师 ' + "   " + (this.state.status == '解盘中' ? "正在解盘   " : this.state.status) + '(' + this.state.start + '-' + this.state.end + ')'
                                }
                            </Text>
                            <Image style={{ height: 11, width: 11, marginLeft: 10 }} source={img} />

                        </View>
                        : null
                }
            </View>


        );
    }

    //当前播放相关，评论，专家简介，课程安排等
    _aboutPlayingVideo() {
        return (
            <View style={{ flex: 1, width: baseStyle.width, marginTop: -10, backgroundColor: '#FFFFFF' }} onLayout={this._onLayout}>
                <ScrollableTabView
                    tabBarUnderlineStyle={{
                        marginLeft: baseStyle.width / 8 - 15 / 2,
                        width: 15,
                        height: 3,
                        backgroundColor: '#F92400',
                        borderRadius: 2.5
                    }}
                    onChangeTab={obj => {
                        //业务逻辑 obj.i 标识第几个tab，从0开始
                        if (obj.i == 0) {
                            this.sensorsAppear('交流活动')
                        } else if (obj.i == 1) {
                            this.sensorsAppear('课程安排')
                        } else if (obj.i == 2) {
                            this.sensorsAppear('课程点播')
                        } else if (obj.i == 3) {
                            this.sensorsAppear('专家简介')
                        }
                    }}

                    ref={(tab) => this.tab = tab}
                    tabBarActiveTextColor={'#F92400'}
                    tabBarInactiveTextColor={'#666666'}
                    tabBarTextStyle={{ fontSize: 14 }}
                    renderTabBar={() => <DefaultTabBar
                        tabStyle={{
                            height: 40,
                            marginTop: 15,
                            borderBottomColor: '#E5E5E5',
                            borderBottomWidth: 0.1,
                        }} />}>
                    <View style={{ flex: 1 }} tabLabel="交流互动">
                        <CommentList
                            tabLabel="交流互动"
                            navigation={this.props.navigation}
                            onPressWHQ={() => { this.setState({ isWenHangQing: true, isZhenGuPiao: false, isBiaoQing: false }) }}
                            onPressZGP={() => {
                                this.setState({
                                    isZhenGuPiao: true,
                                    isShowZGPMainUI: true,
                                    isShowDQZS: false,
                                    isShowIsHave: false,
                                    isShowHowDoing: false,
                                    isWenHangQing: false, isBiaoQing: false
                                })
                            }}
                            onPressBQ={() => {
                                this.setState({
                                    isBiaoQing: !this.state.isBiaoQing,
                                    isWenHangQing: false,
                                    isZhenGuPiao: false
                                })
                            }}
                        />
                    </View>
                    <View style={{ flex: 1 }} tabLabel="课程安排">
                        <LessionPlan tabLabel="课程安排"
                            navigation={this.props.navigation}
                            onPressPlayVod={(data, status) => {
                                this._onPressPlayVod(data, status)
                            }}
                            listData={this.state.listData}
                            isLive={this.state.isLive}
                        />
                    </View>
                    <View style={{ flex: 1 }} tabLabel="课程点播">
                        <VodList tabLabel="课程点播" navigation={this.props.navigation}
                            onPressPlayVod={(data, status) => {
                                this._onPressPlayVod(data, status)
                            }}
                        />
                    </View>
                    {/* <View style={{ flex: 1 }} tabLabel="战绩统计">
                        <ZhanJiTongJi tabLabel="战绩统计" navigation={this.props.navigation} />
                    </View> */}
                    <View style={{ flex: 1 }} tabLabel="专家简介">
                        <AboutTeacher tabLabel="专家简介" navigation={this.props.navigation}
                            stopVideo={() => {
                                //视频暂停方法
                                if (Platform.OS == 'ios') {
                                    if (this.state.isShowVideoView) {
                                        liveStatus = true
                                        this._liveView && this._liveView.pause();
                                    } else {
                                        liveStatus = false
                                        this._vodView && this._vodView.pause();
                                    }
                                } else {
                                    if (this.state.isShowVideoView) {
                                        liveStatus = true
                                        this.livevideo && this.livevideo.pause();
                                        this.setState({ isShowVideoView: false });
                                    } else {
                                        liveStatus = false
                                        this.video && this.video.pause();
                                    }
                                    NativeModules.ScreenLightManager.screen_OFF();
                                }
                            }}
                            playVideo={() => {
                                //直播重新播放方法
                                if (Platform.OS == 'android') {
                                    {/*if (this.state.isShowVideoView) {*/
                                    }
                                    if (liveStatus) {
                                        //重新加载页面
                                        this.setState({ isShowVideoView: true }, () => {
                                            this.video && this.video.leave();
                                            this.livevideo && this.livevideo.start();
                                        });
                                    } else {
                                        this.video && this.video.resume();
                                    }
                                    NativeModules.ScreenLightManager.screen_ON();

                                    {/*}*/
                                    }
                                } else {
                                    // this.playForIOS(this.state.status=='解盘中'?true:false);
                                    // if (this.state.isShowVideoView) {
                                    if (liveStatus) {
                                        this.setState({ isShowImage: false, isLive: true }, () => {
                                            this._liveView && this._liveView.play();
                                        })
                                    } else {
                                        this._vodView && this._vodView.play();
                                    }
                                    // }
                                }
                                Orientation.unlockAllOrientations();
                            }

                            } />
                    </View>
                </ScrollableTabView>
            </View>
        );
    }


    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = '视频解盘';
        sensorsDataClickObject.adLabel.page_source = '视频解盘';
        sensorsDataClickObject.adLabel.is_pay = '免费';
        sensorsDataClickObject.adLabel.module_source = '观点';
        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.label_name = label;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }

    //获取视频播放器一下view的高度
    _onLayout = (event) => {
        //获取根View的宽高，以及左上角的坐标值
        let { x, y, width, height } = event.nativeEvent.layout;
        this.setState({ mHeight: height });

    }

    //点击课程安排条目回调
    _onPressPlayVod(data, status) {
        // console.log('onPressPlayVod---item'+JSON.stringify(data));
        this.setState({
            laoshi: status == '解盘中' ? data.nickname : data.teacher_name,
            descp: data.descp,
            status: status,
            title: data.title,
            start: status == '解盘中' ? data.start : moment(parseInt(data.recordStartTime) * 1000).format("HH:mm"),
            end: status == '解盘中' ? data.end : moment(parseInt(data.recordEndTime) * 1000).format("HH:mm"),
            isShowImage: false
        }, () => {
            if (status == '解盘中') {
                if (Platform.OS == 'android') {
                    this.video && this.video.leave();
                    // this.livevideo && this.livevideo.pause();
                } else {
                    this._vodView && this._vodView.stop();
                }
                this.setState({ isShowVideoView: true }, () => {
                    if (Platform.OS == 'android') {
                        // this.video && this.video.leave()
                        this.livevideo && this.livevideo.start();
                    } else {
                        // this._liveView&&this._liveView.release()
                        this._liveView && this._liveView.play();
                    }
                })
            } else {
                this.setState({ isLive: false })
                if (Platform.OS == 'android') {
                    // this.video && this.video.leave()
                    this.livevideo && this.livevideo.pause();
                } else {
                    this._liveView && this._liveView.pause();
                }
                if (data.url == undefined) return
                this.setState({ isShowVideoView: false, playOrPause: false, dianBoDiZhi: data.vid }, () => {

                    this.isLive = false
                    this.currentVideoUploadPlayInfo = false
                    this.upLoadSensorsDataAction()
                    this.currentVideoUploadPlayInfo = false
                    if (Platform.OS == 'android') {
                        this.video.switch(this.state.dianBoDiZhi);
                    } else {
                        this._vodView.switchUrl(this.state.dianBoDiZhi, {}, true);
                    }
                    sensorsDataClickObject.videoPlay.entrance = '视频解盘播放页'
                    sensorsDataClickObject.videoPlay.title = data.title
                    let timestr = ShareSetting.getDate(parseInt(data.update_time * 1000), 'yyyy-MM-dd')
                    sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(data.update_time * 1000), 'yyyy-MM-dd')
                    let dateStr = moment(new Date()).format('YYYY-MM-DD')
                    sensorsDataClickObject.shareClick.class_name = data.title
                    sensorsDataClickObject.shareClick.publish_time = dateStr
                    sensorsDataClickObject.shareMethod.class_name = data.title
                    sensorsDataClickObject.shareMethod.publish_time = dateStr

                })
            }
        })
    }
    /// 上传埋点 切换视频或者视频播放结束时
    upLoadSensorsDataAction = () => {
        if (this.currentVideoUploadPlayInfo == false && this.state.allTime > 0) {

            if (this.isLive) {
                sensorsDataClickObject.videoPlay.class_name = this.state.descp
                sensorsDataClickObject.videoPlay.publish_time = this.state.start
            }
            let currPosition = this.state.currPosition == 0 ? this.state.allTime : this.state.currPosition
            sensorsDataClickObject.videoPlay.video_type = this.isLive ? '直播视频' : '回放视频'
            sensorsDataClickObject.videoPlay.play_duration = this.isLive ? '直播' : currPosition/ 1000
            sensorsDataClickObject.videoPlay.video_time = this.isLive ? '直播' : this.state.allTime/ 1000
            sensorsDataClickObject.videoPlay.is_finish = true
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.videoPlay, undefined, false)
            sensorsDataClickObject.videoPlay.video_evaluation = ''
        }
        this.currentVideoUploadPlayInfo = true
    }

    //问行情详情页
    _wenHangQingUI() {

        if (this.state.isWenHangQing) {
            return (
                <View style={{
                    flex: 1,
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center'

                }}>
                    <View style={{
                        width: 270,
                        height: this._WHQHeight,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: '#FFFFFF',
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#333333', fontSize: 18, marginTop: 27 }}>问行情</Text>

                        {this.state.whq_Array && this.state.whq_Array.map((data, index, array) => {
                            // let top = index === 0 ? 25 : 15
                            // console.log('wenhangqing2='+JSON.stringify(responseJson));
                            return this._questionUI(data.question, 15, true, index + 1)
                        })}

                        {/* {this._questionUI(this.getWHQContent(0), 25, true, 1)}
                        {this._questionUI(this.getWHQContent(1), 15, true, 2)}
                        {this._questionUI(this.getWHQContent(2), 15, true, 3)}
                        {this._questionUI(this.getWHQContent(3), 15, true, 4)} */}
                    </View>
                    <View style={{ backgroundColor: '#FFFFFF', height: 53, width: 1 }} />
                    <TouchableOpacity onPress={() => {
                        this.setState({ isWenHangQing: false })
                    }}>
                        <Image style={{ height: 30, width: 30 }}
                            source={require('../../../images/livelession/LiveRoom/closeButton.png')} />
                    </TouchableOpacity>
                </View>


            );
        }
    }

    _questionUI(content, top, from, id) {
        let bgColor = '#FF917E';
        if (id == this.state.currentId) {
            if (this.state.isOnPressIn) {
                bgColor = '#F92400';
            } else {
                bgColor = '#FF917E';
            }
        }
        return (

            <TouchableOpacity key={id}
                onPressIn={() => this.setState({ isOnPressIn: true, currentId: id })}
                onPressOut={() => this.setState({ isOnPressIn: false, currentId: -1 })}
                onPress={() => {
                    if (from) {
                        if (this.state.isClicked) {
                            this.setState({ isWenHangQing: false, isClicked: false }, () => {
                                clickedTime = (new Date()).valueOf();
                                this.timer1 = setTimeout(
                                    () => {
                                        this.setState({ isClicked: true }, () => {
                                            this.timer1 && clearTimeout(this.timer1)
                                        })
                                    },
                                    30 * 1000
                                );
                                //发送问行情问题至服务器
                                this._fetch(content, 'hq')
                            })
                        } else {
                            let currTime = (new Date()).valueOf();
                            //弹出toast
                            this.refs.toast.show('公聊时间为30s,还有' + parseInt(30 - ((currTime - clickedTime) / 1000)) + 's')
                        }

                    } else {
                        if (id == 1) {
                            this.setState({
                                isShowZGPMainUI: false,
                                isShowDQZS: true,
                                isShowIsHave: false,
                                isShowHowDoing: false
                            })
                        } else if (id == 2) {
                            this.setState({
                                isShowZGPMainUI: false,
                                isShowDQZS: false,
                                isShowIsHave: true,
                                isShowHowDoing: false
                            })
                        } else {
                            this.setState({
                                isShowZGPMainUI: false,
                                isShowDQZS: false,
                                isShowIsHave: false,
                                isShowHowDoing: true
                            })
                        }
                    }

                }}>
                <View style={{
                    borderColor: bgColor,
                    borderRadius: 5,
                    backgroundColor: bgColor,
                    height: 39,
                    width: 225,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: top
                }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 15 }}>{content}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    //诊股票详情页
    _zhenGuPiaoUI() {
        if (this.state.isZhenGuPiao) {
            return (
                <View style={{
                    flex: 1,
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center'

                }}>
                    <View style={{
                        width: 270,
                        height: 300,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: '#FFFFFF',
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#333333', fontSize: 18, marginTop: 27 }}>诊股票</Text>
                        {this._zhenGuPiaoChildUI()}
                    </View>
                    <View style={{ backgroundColor: '#FFFFFF', height: 53, width: 1 }} />
                    <TouchableOpacity onPress={() => {
                        this.setState({ isZhenGuPiao: false })
                    }}>
                        <Image style={{ height: 30, width: 30 }}
                            source={require('../../../images/livelession/LiveRoom/closeButton.png')} />
                    </TouchableOpacity>
                </View>
            );
        }
    }

    _zhenGuPiaoChildUI() {
        if (this.state.isShowZGPMainUI) {
            return (
                <View style={{ flex: 1 }}>
                    {this._questionUI(ZHENGUPIAO_MESSAGE1, 47, false, 1)}
                    {this._questionUI(ZHENGUPIAO_MESSAGE2, 20, false, 2)}
                    {this._questionUI(ZHENGUPIAO_MESSAGE3, 20, false, 3)}
                </View>
            );
        } else if (this.state.isShowDQZS || this.state.isShowIsHave || this.state.isShowHowDoing) {
            let title = '短期走势'
            if (this.state.isShowIsHave) {
                title = '该不该持有';
            } else if (this.state.isShowDQZS) {
                title = '短期走势';
            } else {
                title = '如何操作';
            }
            return (
                <View style={{ flex: 1 }}>
                    <View style={{
                        borderColor: '#F92400',
                        borderRadius: 5,
                        backgroundColor: '#F92400',
                        height: 39,
                        width: 225,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 47
                    }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 15 }}>{title}</Text>
                    </View>
                    {this.state.isShowHowDoing
                        ?
                        <View style={{
                            borderColor: '#BFBFBF',
                            borderWidth: 1,
                            borderRadius: 5,
                            height: 39,
                            width: 225,
                            justifyContent: 'center',
                            marginTop: 15,
                            paddingLeft: 10
                        }}>
                            <TextInput
                                ref={(c) => this.input2 = c}
                                style={{ height: 40, fontSize: RATE(30) }}
                                value={this.state.rhcz_value}
                                onChangeText={this._onChangeTextForHowDoing}
                                placeholder={'请输入买入价格'}
                                autoFocus={true}
                                maxLength={10}
                                keyboardType='numeric'
                                underlineColorAndroid="transparent"
                            />
                        </View>
                        :
                        null
                    }
                    <View style={{
                        borderColor: '#BFBFBF',
                        borderWidth: 1,
                        borderRadius: 5,
                        height: 39,
                        width: 225,
                        justifyContent: 'center',
                        marginTop: this.state.isShowHowDoing ? 5 : 15,
                        paddingLeft: 10
                    }}>
                        <TextInput
                            ref={(c) => this.input1 = c}
                            style={{ height: 40, fontSize: RATE(30) }}
                            value={this.state.dqzs_value}
                            onChangeText={this._onChangeTextForDQZS}
                            placeholder={'请输入股票代码'}
                            autoFocus={true}
                            maxLength={6}
                            keyboardType='numeric'
                            underlineColorAndroid="transparent"
                        />
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        marginTop: 15,
                        flex: 1,
                        height: 39,
                        justifyContent: 'space-between'
                    }}>

                        <TouchableOpacity onPress={() => {
                            this.setState({ isShowDQZS: false, isShowIsHave: false, isShowHowDoing: false }, () => {
                                this.setState({ isShowZGPMainUI: true })
                            })
                        }}>
                            <View style={{
                                borderColor: '#B3B3B3',
                                backgroundColor: '#B3B3B3',
                                borderWidth: 1,
                                borderRadius: 5,
                                height: 39,
                                width: 100,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 15 }}>上一步</Text>
                            </View>
                        </TouchableOpacity>


                        <TouchableOpacity onPress={() => {
                            if (this.state.isClicked) {
                                this.setState({
                                    isClicked: false,
                                }, () => {
                                    clickedTime = (new Date()).valueOf();
                                    this.timer4 = setTimeout(
                                        () => {
                                            this.setState({ isClicked: true }, () => {
                                                this.timer4 && clearTimeout(this.timer4)
                                            })
                                        },
                                        30000
                                    );
                                    if (this.state.isShowHowDoing && this.state.rhcz_value.length <= 0) {
                                        this.refs.toast.show('买入价不能为空')
                                        return;
                                    }
                                    if (this.state.dqzs_value.length == 0) {
                                        this.refs.toast.show('股票代码不能为空')
                                        return;
                                    } else if (this.state.dqzs_value.length > 0 && this.state.dqzs_value.length < 6) {
                                        this.refs.toast.show('清输入正确的股票代码')
                                        return;
                                    }
                                    this.setState({ isZhenGuPiao: false }, () => {
                                        //调用接口并显示在公屏上
                                        if (title == '短期走势') {
                                            this._fetch(this.state.dqzs_value + "的" + title, 'zgp')

                                        } else if (title == '该不该持有') {
                                            this._fetch("买入" + this.state.dqzs_value + title, 'zgp')
                                        } else {
                                            this._fetch(this.state.rhcz_value + '元买入' + this.state.dqzs_value + "应" + title, 'zgp')
                                        }
                                    })
                                })
                            } else {
                                let currTime = (new Date()).valueOf();
                                //弹出toast
                                this.refs.toast.show('公聊时间为30s,还有' + parseInt(30 - ((currTime - clickedTime) / 1000)) + 's')
                            }
                        }}>
                            <View style={{
                                borderColor: '#FF917E',
                                backgroundColor: '#FF917E',
                                borderWidth: 1,
                                borderRadius: 5,
                                height: 39,
                                width: 100,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 15 }}>发送</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    //短期走势弹窗输入框回调
    _onChangeTextForDQZS(text) {
        if (text.length == 1) {
            let first = text.substring(0, 1)
            if (first == '0' || first == '3' || first == '6') {
                this.setState({ dqzs_value: text })
            } else {
                this.refs.toast.show('清输入正确的股票代码')
            }
            return;
        } else if (text.length == 2) {
            let second = text.substring(1, 2)
            if (second == '0') {
                this.setState({ dqzs_value: text })
            } else {
                this.refs.toast.show('清输入正确的股票代码')
            }
            return;
        }
        // else if(text.length == 3){
        //     let third = text.substring(2,3)
        //     if(third == '0'){
        //         this.setState({dqzs_value:text})
        //     }else{
        //         this.refs.toast.show('清输入正确的股票代码')
        //     }
        //     return;
        // }
        this.setState({ dqzs_value: text })
    }

    //如何操作弹窗买入价输入框回调
    _onChangeTextForHowDoing(text) {
        this.setState({ rhcz_value: text })
    }

    //表情页面
    _biaoQingUI() {
        if (this.state.isBiaoQing) {
            return (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: baseStyle.isIPhoneX ? 34 + 44 : 44,
                    backgroundColor: 'rgba(255,255,255,0)',
                }}>
                    <TouchableOpacity style={{ flex: 1, width: baseStyle.width, height: baseStyle.height - 130 }} onPress={() => {
                        this.setState({ isBiaoQing: false })
                    }}>
                        <View style={{ width: baseStyle.width, height: baseStyle.height - 130 }} />
                    </TouchableOpacity>
                    <View style={{
                        width: baseStyle.width,
                        height: 86,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                    }}>
                        <View style={{
                            flex: 1,
                            justifyContent: 'space-around',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('ding')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/dyg01.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('guzhang')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/gz01.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('jiayou')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/jy01.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('qiandao')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/qd01.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            flex: 1,
                            justifyContent: 'space-around',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('songhua')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/hua01.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('weiwu')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/ww01.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('weixiao')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/wx.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this._sendImage('zan')
                            }}>
                                <Image style={{ width: 45, height: 18 }}
                                    source={require('../../../images/livelession/LiveRoom/zanyige.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', paddingRight: 27 }}>
                        <Image source={require('../../../images/livelession/LiveRoom/jiantou.png')} />
                    </View>
                </View>
            );
        }
    }

    //发送表情
    _sendImage(imgName) {

        if (this.state.isClicked) {
            this.setState({ isBiaoQing: false, isClicked: false }, () => {
                //发送表情
                this._fetch(imgName, 'img');
                clickedTime = (new Date()).valueOf();
                this.timer5 = setTimeout(
                    () => {
                        this.setState({ isClicked: true }, () => {
                            this.timer5 && clearTimeout(this.timer5)
                        })
                    },
                    30000
                );
            })
        } else {
            let currTime = (new Date()).valueOf();
            //弹出toast
            this.refs.toast.show('公聊时间为30s,还有' + parseInt(30 - ((currTime - clickedTime) / 1000)) + 's')
        }

        // this.setState({isBiaoQing:false},()=>{
        //     //发送表情
        //     this._fetch(imgName,'img')
        // })
    }

    _fetch = (question, type) => {
        this.setState({ dqzs_value: '', rhcz_value: '' })
        // let nickName = UserInfoUtil.getNickName();
        let nickName = UserInfoUtil.getDeviceID();
        let permissions = UserInfoUtil.getUserPermissions();
        if (permissions == 0) {
            let qian = nickName.slice(0, 3);
            let hou = nickName.slice(nickName.length - 3);
            nickName = '游客' + qian + hou;
        } else {
            if (checkPhone(UserInfoUtil.getNickName())) {
                let qian = UserInfoUtil.getNickName().slice(0, 3);
                let hou = UserInfoUtil.getNickName().slice(UserInfoUtil.getNickName().length - 4);
                nickName = qian + "****" + hou;
            } else {
                nickName = UserInfoUtil.getNickName()
            }
        }
        let headerName = UserInfoUtil.getUserHeader();
        // if (this._checkPhone(nickName)) {
        //     let qian = nickName.slice(0,3);
        //     let hou = nickName.slice(7);
        //     nickName = qian + '****' + hou;
        // }
        let code = ""
        if (type === "zgp") {
            code = this.state.dqzs_value
        }
        let url = ZBJDomainName + "/api/ask";
        // console.log("发送表情",url);
        // console.log("发送表情参数",{
        //     type: type,
        //     question: question,
        //     username: nickName,
        //     nickname: nickName,
        //     rid: ZBJ_rid,
        //     head: headerName,
        //     code: code
        // });

        fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: type,
                question: question,
                username: nickName,
                nickname: nickName,
                rid: ZBJ_rid,
                head: headerName,
                code: code
            })
        }).then((response) => {
            return response.json();
        }).then((res) => {
            //  console.log("发送回调",res)
        }).catch(function (e) {
            // console.log("异常回调",e)
        });
    }
    /**
     * 验证 手机号
     */
    _checkPhone = (phone) => {

        let reg = /^1\d{10}$/;

        if (!phone) {
            return false;
        }

        if (phone === "") {
            return false;
        }

        if (!reg.test(phone)) {
            return false;
        }

        return true;
    };

    //播放器UI
    _videoView() {
        if (Platform.OS == 'ios') {
            if (this.state.isShowVideoView) {
                return (
                    <View style={{ width: this.state.width, height: this.state.height }}>
                        <GSLivePlayer_ios ref={(liveView) => this._liveView = liveView}
                            style={{ width: this.state.width, height: this.state.height }}
                            // vodId={this.state.zhiBoDiZhi}
                            // dataSource={{
                            //     'domain': "tzkt.gensee.com",
                            //     'webcaseId': this.state.zhiBoDiZhi,
                            //     'nickname': UserInfoUtil.getUserId() + '',
                            //     'password': ''
                            // }}
                            dataSource={{
                                "roomID": this.state.zhiBoDiZhi,
                                "userID": "AE903AFD89036D43",
                                "nickname": UserInfoUtil.getUserId() + '',
                                "password": ""
                            }}
                        />
                    </View>
                )
            } else {
                return (
                    <View style={{ width: this.state.width, height: this.state.height }}>
                        {/* <GSVodPlayer_ios ref={(vodView) => this._vodView = vodView} style={{ width: width, height: 211 }} */}
                        {/* vodId={this.state.dianBoDiZhi} /> */}
                        <GSVodPlayer_ios ref={(vodView) => this._vodView = vodView}
                            // style={{ width: this.state.width, height: this.state.height }}
                            style={{ width: 300, height: 200 }}
                            // vodId={this.state.zhiBoDiZhi}
                            // dataSource={{
                            //     'domain': "tzkt.gensee.com",
                            //     'webcaseId': this.state.zhiBoDiZhi,
                            //     'nickname': UserInfoUtil.getUserId() + '',
                            //     'password': ''
                            // }}
                            dataSource={{
                                "roomID": this.state.zhiBoDiZhi,
                                "userID": "AE903AFD89036D43",
                                "nickname": UserInfoUtil.getUserId() + '',
                                "password": "",
                                "liveID": "",
                                "recordID": this.state.dianBoDiZhi
                            }}
                            onPrepared={(duration) => {
                                this.setState({ allTime: duration })
                            }}
                            onProgress={(progress) => {
                                this.setState({
                                    // currentTime: moment(progress).format("mm:ss"),
                                    currentTime: get2HmsORms(progress, this.state.allTime),

                                    currPosition: progress
                                })
                            }}
                            onCompletion={() => {
                                sensorsDataClickObject.videoPlay.class_name = this.state.descp
                                sensorsDataClickObject.videoPlay.class_type = this.state.status
                                this.isLive = false
                                this.currentVideoUploadPlayInfo = false
                                this.upLoadSensorsDataAction()
                                this.setState({ playOrPause: true })
                            }}
                        />

                        <TouchableOpacity onPress={() => {
                            this.setState({ isShowControllerUI: !this.state.isShowControllerUI })
                        }}
                            style={{ position: 'absolute', right: 0, bottom: 0, left: 0, top: 0 }}
                        >
                            <View style={{
                                position: 'absolute',
                                right: 0,
                                bottom: 0,
                                left: 0,
                                top: 0,
                                backgroundColor: 'rgba(256,256,256,0)',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            }
        } else {
            return (
                <View style={{ width: this.state.width, height: this.state.height }}>
                    {this._VideoView()}
                </View>
            );
        }

    }

    _VideoView() {

        if (this.state.isShowVideoView) {
            //console.log('VideoViewManager', '直播室');
            return (

                <View style={{ width: this.state.width, height: this.state.height }}>

                    <GSLivePlayer_android
                        style={{ width: this.state.width, height: this.state.height }}
                        source={{
                            //  roomId: "A78698E54570DBD79C33DC5901307461",
                            roomId: this.state.zhiBoDiZhi,
                            ccId: 'AE903AFD89036D43',
                            nickName: UserInfoUtil.getUserId() + '',
                            pwd: ''
                        }}
                        ref={(video) => {
                            this.livevideo = video
                        }}
                    />
                    {this.state.isFullScreen
                        ?
                        <View style={{ height: this.state.height, width: 20, backgroundColor: '#000000' }} />
                        :
                        null}
                </View>
            )

        } else {

            return (
                <View style={{ width: this.state.width, height: this.state.height }}>
                    <GSVodPlayer_android
                        style={{ width: this.state.width, height: this.state.height }}
                        source={{
                            // roomId: "A78698E54570DBD79C33DC5901307461",
                            roomId: this.state.zhiBoDiZhi,
                            ccId: 'AE903AFD89036D43',
                            replayId: this.state.dianBoDiZhi,
                            nickName: UserInfoUtil.getUserId() + '',
                            pwd: '',
                        }}
                        onPrepared={(duration) => {
                            this.setState({ allTime: duration })
                        }}
                        onCompletion={() => {
                            this.setState({ playOrPause: true })
                            sensorsDataClickObject.videoPlay.class_name = this.state.descp
                            sensorsDataClickObject.videoPlay.class_type = this.state.status
                            this.isLive = false
                            this.currentVideoUploadPlayInfo = false
                            this.upLoadSensorsDataAction()
                        }}
                        onError={() => {

                        }}
                        onBufferUpdate={(buffer) => {
                        }}
                        getPlayTime={(event) => {
                        }}
                        onProgress={(progress) => {
                            this.setState({
                                // currentTime: moment(progress).format("mm:ss"),
                                currentTime: get2HmsORms(progress, this.state.allTime),
                                currPosition: progress
                            })
                        }}

                        onSeek={(position) => {
                        }}
                        getPlayStateForJava={() => {
                            this.setState({ playOrPause: false })
                        }}
                        getPauseStateForJava={() => {
                            this.setState({ playOrPause: true })
                        }}
                        onCaching={(event) => {

                        }}
                        ref={(video) => {
                            this.video = video
                        }}
                    />
                    {this.state.isFullScreen
                        ?
                        <View style={{ height: this.state.height, width: 20, backgroundColor: '#000000' }} />
                        :
                        null}
                    <TouchableNativeFeedback onPress={() => {
                        this.setState({ isShowControllerUI: !this.state.isShowControllerUI })
                    }}>
                        <View style={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            left: 0,
                            top: 0,
                            backgroundColor: 'rgba(256,256,256,0)',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        </View>
                    </TouchableNativeFeedback>
                </View>


            )
        }
    }

    _showImage() {
        if (this.state.isShowImage) {
            return (
                <View style={{
                    width: this.state.width,
                    height: this.state.height,
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                }}>
                    <Image style={{ width: this.state.width, height: this.state.height, }}
                        source={require('../../../images/JiePan/liveroom_beijing.png')} />
                </View>
            );
        }
    }

    _livePlayerController() {
        return (
            <ImageBackground style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: this.state.isLandscape ? baseStyle.height : baseStyle.width,
                height: 40
            }} source={require('../../../images/livelession/zhedangxia.png')}>
                <View style={{ position: 'absolute', bottom: 10, right: 14, }}>
                    <TouchableOpacity onPress={() => {
                        Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 } }).start();
                        Orientation.unlockAllOrientations();
                        this.setState({ isLandscape: !this.state.isLandscape }, () => {

                            if (this.state.isLandscape) {
                                this.setState({ height: baseStyle.width, width: baseStyle.height, isFullScreen: true }, () => {
                                    Orientation.lockToLandscapeLeft();
                                    StatusBar.setHidden(true);
                                    // this._liveView && this._liveView.reloadView({'width': height, 'height': width});
                                    this._liveView && this._liveView.landspace();
                                })
                            } else {
                                this.setState({ height: 211, width: baseStyle.width, isFullScreen: false }, () => {
                                    Orientation.lockToPortrait();
                                    StatusBar.setHidden(false);
                                    this._liveView && this._liveView.portiort();
                                })

                            }
                        })
                    }}>
                        <Image style={{ width: 20, height: 20 }}
                            source={this.state.isFullScreen
                                ?
                                require('../../../images/livelession/littlescrean.png')
                                :
                                require('../../../images/livelession/fullscrean.png')
                            } />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    _controllUI() {
        if (this.state.isShowControllerUI) {
            if (Platform.OS == 'android') {
                return (
                    <TouchableNativeFeedback onPress={() => {
                        this.setState({ isShowControllerUI: !this.state.isShowControllerUI })
                    }}>
                        {this._controllContentUI()}
                    </TouchableNativeFeedback>
                );
            } else {
                return (
                    <TouchableOpacity onPress={() => {
                        this.setState({ isShowControllerUI: !this.state.isShowControllerUI })
                    }}>
                        {this._controllContentUI()}
                    </TouchableOpacity>
                );
            }

        }
    }

    _controllContentUI() {
        return (
            <View style={{ position: 'absolute', right: 0, bottom: 0, left: 0 }}>
                <ImageBackground style={{ width: this.state.width, height: 121 }}
                    source={require('../../../images/livelession/MorningUnderstand/zzx_jianbianzhezhao.png')}>
                    <View style={{ flexDirection: 'row', marginTop: 90, alignItems: 'center', }}>
                        <TouchableOpacity onPress={() => {
                            this.setState({ playOrPause: !this.state.playOrPause, isMobile: false }, () => {
                                if (Platform.OS == 'android') {
                                    if (this.state.playOrPause) {
                                        this.video.pause()
                                    } else {
                                        this.video.resume()
                                    }
                                } else {
                                    if (this.state.playOrPause) {
                                        this._vodView.pause()
                                    } else {
                                        this._vodView.resume()
                                    }
                                }
                            })
                        }}>
                            <Image style={{ width: 20, height: 20, marginLeft: 15 }}
                                source={this.state.playOrPause
                                    ?
                                    require('../../../images/livelession/play.png')
                                    :
                                    require('../../../images/livelession/pause.png')}
                            />
                        </TouchableOpacity>
                        <Text style={{
                            marginLeft: 10,
                            color: '#FFFFFF',
                            fontSize: 9,
                            backgroundColor: 'rgba(0,0,0,0)'
                        }}>{this.state.currentTime}</Text>
                        <View style={{ marginLeft: 6, flex: 1, width: this.state.width }}>
                            <Slider
                                style={{ height: 20, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                value={this.state.currPosition}
                                maximumValue={this.state.allTime}
                                minimumTrackTintColor={'#0085ff'}
                                maximumTrackTintColor={'#C7C7C7'}
                                thumbImage={require('../../../images/livelession/LiveRoom/jindu.png')}
                                trackStyle={{ height: 2 }}
                                thumbStyle={{ width: 12, height: 12 }}
                                onSlidingComplete={value => {
                                    if (Platform.OS == 'android') {
                                        if (this.video != undefined) this.video.seekTo(parseInt(value))
                                    } else {
                                        if (this._vodView != undefined) this._vodView.seekTo(parseInt(value))
                                    }
                                }}
                            // onValueChange={value => {
                            //     if (Platform.OS == "android") {
                            //         if (this.video != undefined) this.video.seekTo(parseInt(value));
                            //     } else {
                            //         if (this._vodView != undefined) this._vodView.seekTo(parseInt(value));
                            //     }
                            // }}
                            />
                        </View>
                        <Text style={{ marginLeft: 6, color: '#FFFFFF', fontSize: 9, backgroundColor: 'rgba(0,0,0,0)' }}>{getHmsORms(this.state.allTime)}</Text>
                        <TouchableOpacity onPress={() => {
                            Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 } }).start();
                            Orientation.unlockAllOrientations();
                            this.setState({ isLandscape: !this.state.isLandscape }, () => {
                                if (this.state.isLandscape) {
                                    this.setState({ height: baseStyle.width, width: baseStyle.height, isFullScreen: true }, () => {
                                        Orientation.lockToLandscapeLeft();
                                        StatusBar.setHidden(true);
                                        this._vodView && this._vodView.landspace()
                                    })
                                } else {
                                    this.setState({ height: 211, width: baseStyle.width, isFullScreen: false }, () => {
                                        Orientation.lockToPortrait();
                                        StatusBar.setHidden(false);
                                        this._vodView && this._vodView.portiort()
                                    })

                                }
                            })

                        }}>
                            <View style={{ marginLeft: 14, marginRight: 14 }}>
                                <Image style={{ width: 20, height: 20 }}
                                    source={this.state.isFullScreen
                                        ?
                                        require('../../../images/livelession/littlescrean.png')
                                        :
                                        require('../../../images/livelession/fullscrean.png')
                                    } />
                            </View>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        );

    }

    _noticeUI() {
        if (!this.state.notice) return;
        if (this.state.isShowControllerUI) {
            return (
                <View style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    left: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    paddingTop: 5,
                    paddingBottom: 5
                }}>
                    {this.state.isLandscape
                        ?
                        <TouchableOpacity onPress={() => {
                            this.setState({ height: 211, width: baseStyle.width, isFullScreen: false }, () => {
                                Orientation.lockToPortrait();
                                StatusBar.setHidden(false);
                            })
                        }}>
                            <Image style={{ marginTop: 10, marginLeft: 15 }}
                                source={require('../../../images/livelession/back1.png')} />
                        </TouchableOpacity>
                        :

                        <MarqueeLabel
                            speed={100}
                            textStyle={{ fontSize: 13, color: 'white' }}
                            bgViewStyle={{ backgroundColor: 'rgba(255,255,255,0)', height: 25 }}
                        >
                            {"公告：" + this.state.notice}
                        </MarqueeLabel>


                    }

                </View>
            )
        }
    }

    onBackAndroid = () => {

        if (this.state.isFullScreen) {
            this.setState({ height: 211, width: baseStyle.width, isFullScreen: false }, () => {
                Orientation.lockToPortrait();
                StatusBar.setHidden(false);
            })

            return true;
        } else {
            NativeModules.ScreenLightManager.screen_OFF();
            if (Platform.OS == 'android') {
                if (this.state.isShowVideoView) {
                    this.livevideo.leave()
                } else {
                    this.video.leave()
                }

            }
            Orientation.lockToPortrait();
            Navigation.pop(this.props.navigation)
            return true;
        }

    };

    heXinGuanDianUI() {
        if (!this.state.gd_Array || !this.state.kj_Array) return;
        let hxgdData = this.state.isHeXin ? this.state.gd_Array : this.state.kj_Array;
        let items = hxgdData.map(
            (data, index) => (
                this.hxgd_item(data, index)
            ))
        return (
            <Animated.View style={{
                width: baseStyle.width,
                position: 'absolute',
                top: Platform.OS == 'ios' ? height : baseStyle.height + this.state.navigatorHeight,
                right: 0,
                left: 0,
                backgroundColor: '#F6F6F6',
                bottom: 0,
                height: this.state.mHeight + 33,
                transform: [
                    { translateY: this.state.trans.y },
                    { translateX: this.state.trans.x },
                ],
            }}>
                <View style={{
                    backgroundColor: '#FFFFFF',
                    height: 40,
                    width: baseStyle.width,
                    paddingLeft: 15,
                    paddingRight: 15,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center', borderBottomColor: "#E5E5E5", borderBottomWidth: 1
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            onPress={() => {
                                this.setState({ tipLeft: 38, isHeXin: true, isMeiRi: false }, () => {
                                })
                            }}
                            style={{ fontSize: 16, color: this.state.isHeXin ? "#F92400" : '#666666' }}>
                            核心观点
                        </Text>
                        <View style={{
                            height: 20,
                            width: 1,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            marginLeft: 15,
                            marginRight: 15
                        }} />
                        <Text
                            onPress={() => {
                                this.setState({ tipLeft: 130, isMeiRi: true, isHeXin: false }, () => {
                                })
                            }}
                            style={{ fontSize: 16, color: this.state.isMeiRi ? "#F92400" : '#666666' }}>
                            每日课件
                        </Text>

                    </View>
                    <TouchableOpacity onPress={() => {
                        this.setState({ isShowJianJie: false }, () => {
                            if (Platform.OS == 'android') {
                                NativeModules.getnaviheight.getNaviHeight((naviHeight) => {
                                    this.setState({ navigatorHeight: naviHeight }, () => {
                                        Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 } }).start();
                                    })
                                });
                            } else {
                                Animated.spring(this.state.trans, { toValue: { x: 0, y: 0 } }).start();
                            }
                        })
                    }}>
                        <Image style={{ height: 16, width: 16 }}
                            source={require('../../../images/livelession/LiveRoom/jianjie_close.png')} />
                    </TouchableOpacity>
                    <View style={{
                        backgroundColor: "#F92400",
                        position: 'absolute',
                        bottom: 0,
                        left: this.state.tipLeft,
                        height: 3,
                        width: 15,
                        borderRadius: 2
                    }} />
                </View>
                <ScrollView style={{ backgroundColor: '#FFFFFF' }}>
                    {items}
                </ScrollView>
            </Animated.View>
        );
    }

    hxgd_item(data, index) {
        let headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_hxgd_01.png');
        if (this.state.isHeXin) {
            if (index == 0) {

            } else if (index == 1) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_hxgd_02.png');
            } else if (index == 2) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_hxgd_03.png');
            } else if (index == 3) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_hxgd_04.png');
            } else if (index == 4) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_hxgd_05.png');
            }
        } else {
            headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_mrkj_01.png');
            if (index == 0) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_mrkj_01.png');
            } else if (index == 1) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_mrkj_02.png');
            } else if (index == 2) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_mrkj_03.png');
            } else if (index == 3) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_mrkj_04.png');
            } else if (index == 4) {
                headImg = require('../../../images/livelession/LiveRoom/ic_liveroom_mrkj_05.png');
            }
        }
        return (
            <TouchableOpacity key={index}
                activeOpacity={1}
                onPress={() => {
                    if (Platform.OS == 'ios') {
                        if (!this.state.isShowVideoView) {
                            this._vodView && this._vodView.pause()
                        }
                    } else {
                        if (!this.state.isShowVideoView) {
                            this.setState({ playOrPause: true }, () => {
                                this.video && this.video.pause()
                            })
                        }
                    }
                    if (this.state.isHeXin) {
                        Navigation.pushForParams(this.props.navigation, "HXGD_DetailPage", {
                            isKJ: false,
                            title: '核心观点详情',
                            data: data,
                            play: () => {
                                this._restart()
                            }
                        })
                    } else {
                        Navigation.pushForParams(this.props.navigation, "HXGD_DetailPage", {
                            isKJ: true,
                            title: '每日课件详情',
                            data: data,
                            play: () => {
                                this._restart()
                            }
                        })
                    }
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    height: 60,
                    alignItems: 'center',
                    borderBottomColor: 'rgba(0,0,0,0.1)',
                    borderBottomWidth: 1
                }}>
                    <Image style={{ marginLeft: 25 }} source={headImg} />
                    <View style={{ marginLeft: 15 }}>
                        <Text style={{
                            color: "#000000",
                            fontSize: 14
                        }}>{data && (data.title).trim() + (this.state.isHeXin ? "核心观点" : '课件')}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                color: "rgba(0,0,0,0.4)",
                                fontSize: 12, marginTop: Platform.OS == 'ios' ? 3 : 0
                            }}>{data && data.create_time.substring(0, 11)}</Text>
                            <Text style={{
                                color: "rgba(0,0,0,0.4)",
                                fontSize: 12,
                                marginLeft: 15, marginTop: Platform.OS == 'ios' ? 3 : 0
                            }}>{data && data.create_time.substring(11)}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Image style={{ height: 12, width: 7, marginRight: 24 }}
                            source={require('../../../images/livelession/LiveRoom/jianjie_back.png')} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    middleBtn() {
        return (<View style={{
            position: 'absolute',
            left: this.state.width / 2 - 42,
            top: this.state.height / 2 - 17,
        }}>
            <TouchableOpacity
                onPress={() => {
                    this.setState({ playOrPause: !this.state.playOrPause, isMobile: false }, () => {
                        if (this.state.playOrPause) {
                            (Platform.OS == "android") ? this.video.pause() : this._vodView.pause();
                        } else {
                            (Platform.OS == "android") ? this.video.resume() : this._vodView.resume();
                        }
                    })
                }}
            >
                <View style={{
                    height: 34,
                    width: 85,
                    borderRadius: 17,
                    borderWidth: 1,
                    borderColor: '#FFFFFF',
                    backgroundColor: 'rgba(0,0,0,0)',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Image style={{ width: 20, height: 20 }}
                        source={this.state.playOrPause
                            ?
                            require('../../../images/livelession/play.png')
                            :
                            require('../../../images/livelession/pause.png')} />
                    <Text style={{
                        fontSize: 12,
                        color: '#FFFFFF',
                        marginLeft: 14
                    }}>{this.state.playOrPause ? "播放" : "暂停"}</Text>
                </View>
            </TouchableOpacity>
        </View>);
    }

    _restart() {
        if (Platform.OS == 'ios') {
            if (!this.state.isShowVideoView) {
                this._vodView && this._vodView.resume()
            }
        } else {
            if (!this.state.isShowVideoView) {
                this.setState({ playOrPause: false }, () => {
                    this.video && this.video.resume()
                })
            }
        }
    }
}
