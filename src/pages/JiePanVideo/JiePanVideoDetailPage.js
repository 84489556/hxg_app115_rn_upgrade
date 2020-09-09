/*
 * @Author: lishuai
 * @Date: 2019-09-18 13:38:36
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-08-07 16:08:19
 * 精品讲堂(直播课堂)详情页
 * 精品讲堂(直播课堂)直播状态码对应关系: 0: 直播未开始, 1: 直播中, 2: 直播文件上传中, 3: 回看
 */

'use strict';
import React from "react";
import {
    AppState,
    BackHandler,
    DeviceEventEmitter,
    FlatList,
    Image,
    KeyboardAvoidingView,
    PixelRatio,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Orientation from '../../../node_modules_modify/react-native-orientation';
import * as baseStyle from '../../components/baseStyle';
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { getHmsORms } from "../../utils/CommonUtils";
import { toast } from '../../utils/CommonUtils';
import YdCloud from '../../wilddog/Yd_cloud';
import AskQuestionView from './AskQuestionView';
import LivePlayer from './GenseeLivePlayer';
import VodPlayer from './GenseeVodPlayer';
import dismissKeyboard from '../../../node_modules/react-native/Libraries/Utilities/dismissKeyboard';
//只是Android 使用
import FastImage from 'react-native-fast-image'
import NetInfo from "@react-native-community/netinfo";
import { sensorsDataClickObject } from "../../components/SensorsDataTool";

export default class JiePanVideoDetailPage extends BaseComponentPage {

    constructor(props) {
        super(props)
        this.islisten = true;
        this.state = {
            isFull: false,
            key: this.props.navigation.state.params.key,
            playdata: {}, // 当前播放的数据
            allData: [], // 往期视频列表数据
            nonet: false,
        }
        this.renderVideoView = this.renderVideoView.bind(this)
        this._getPositionForRN = this._getPositionForRN.bind(this)
        this.orientationDidChange = this._orientationDidChange.bind(this)
        this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
        this.fullVideoPlayer = this._fullVideoPlayer.bind(this)
        this.onProgress = this._onProgress.bind(this)
        this.backView = this.backView.bind(this);
        this._handleAppStateChange = this._handleAppStateChange.bind(this)
        this.isDidMount = false;

        this.flatListHeight = 0;
    }

    componentDidMount() {
        this.isDidMount = true;
        this.pasueListener = DeviceEventEmitter.addListener('pasueListener', () => {
            this.video && this.video.pause()
        })
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
        Orientation.lockToPortrait();
        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);
        NetInfo.fetch().done((status) => {
            this.handleConnectivityChange(status);
            if (status.type == 'none' ) {
                this.setState({ nonet: true });
            }
        })
        this.requestNewData();
        this.requestAllData();
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            const type = this.props.navigation.state.params.type;
            sensorsDataClickObject.videoPlay.class_type = type
            if (type == '多空决策专属课' || type == '风口决策专属课' || type == '主力决策专属课') {
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.jueceshizhanjiepanxiangqing);
            } else {
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.shizhanjiepanxiangqing);
            }
        });
        sensorsDataClickObject.videoPlay.video_type = '回放视频'
    }

    componentWillReceiveProps(nextProps, netxContext) {
        if (this.state.key !== nextProps) {

        }
    }

    componentWillUnmount() {
        this.netInfoSubscriber && this.netInfoSubscriber();
        this.isDidMount = false;
        const path = this._getYdCloudPath() + this.props.navigation.state.params.key;
        YdCloud().ref(path).off('value');
        this.pasueListener && this.pasueListener.remove()
        this.hisListTimer && clearTimeout(this.hisListTimer);
        this.popTimer && clearTimeout(this.popTimer);
        this.finishTimer && clearTimeout(this.finishTimer);
        this.backTimer && clearTimeout(this.backTimer);
        this.backTimer2 && clearTimeout(this.backTimer2);
        this.popView = true;
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.willFocusSubscription && this.willFocusSubscription.remove();
        if (Platform.OS == 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
        Orientation.removeOrientationListener(this._orientationDidChange);
    }
    //监听后台状体的具体实现函数
    _handleAppStateChange = (appState) => {
        if (appState == 'background') {
            //视频播放过程中执行暂停操作
            if (this.video && !this.video.state.paused) {
                this.video.methods.togglePlayPause();
            }
        } else if (appState == 'active') {
            if (this.video && this.video.state.paused) {
                this.video.methods.togglePlayPause();
            }
        }
    }
    //物理返回按钮
    onBackAndroid = () => {
        if (!this.state.isFull) {
            if (this.props.navigation && this.video) {
                this.fullImageView && this.fullImageView.close();
                this.popView = true;
                Orientation.lockToPortrait();
                BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                this.backTimer2 = setTimeout(() => {
                    Navigation.pop(this.props.navigation);
                }, 300)
            }
            else {
                console.warn('Warning: _onBack requires navigator property to function. Either modify the onBack prop or pass a navigator prop');
            }
        }
        else {
            this.video._toggleFullscreen();
        }
        return true;
    }

    backView() {
        if (!this.state.isFull) {
            if (this.props.navigation && this.video) {
                this.fullImageView && this.fullImageView.close();
                Orientation.lockToPortrait();
                //点击返回按钮，记录下用户操作
                this.popView = true;
                BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                this.backTimer = setTimeout(() => {
                    Navigation.pop(this.props.navigation);
                }, 300)
            } else {
                console.warn('Warning: _onBack requires navigator property to function. Either modify the onBack prop or pass a navigator prop');
            }
        } else {
            this.video._toggleFullscreen();
        }
    }
    _getYdCloudPath() {
        const type = this.props.navigation.state.params.type;
        if (type == '多空决策专属课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiJueCeZhuanShuKe/3/';
        } else if (type == '风口决策专属课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiJueCeZhuanShuKe/4/';
        } else if (type == '主力决策专属课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiJueCeZhuanShuKe/5/';
        } else if (type == '实战解盘课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiShiZhanJiePanKe/';
        } else {
            return '';
        }
    }
    _getBarTitle() {
        const type = this.props.navigation.state.params.type;
        if (type == '多空决策专属课') {
            return '多空决策视频详情';
        } else if (type == '风口决策专属课') {
            return '风口决策视频详情';
        } else if (type == '主力决策专属课') {
            return '主力决策视频详情';
        } else if (type == '实战解盘课') {
            return '实战解盘视频详情';
        } else {
            return '精品讲堂详情';
        }
    }
    // 获取视频播放数据
    requestNewData() {
        const path = this._getYdCloudPath() + this.props.navigation.state.params.key;
        YdCloud().ref(path).get(snap => {
            if (this.isDidMount == true) {
                if (snap.code == 0) {
                    const item = snap.nodeContent;
                    item.key = this.props.navigation.state.params.key;
                    sensorsDataClickObject.videoPlay.publish_time = item.updateTime.substring(0,10) || ''
                    this.setState({ playdata: item }, () => {
                        if (item.status == 3) {
                            this.video && this.video.switchUrl(item.playId);
                        }
                    });
                } else {
                    toast('获取播放视频数据错误');
                }
            }
        });
        YdCloud().ref(path).on('value', snap => {
            if (this.isDidMount == true) {
                if (snap.code == 0) {
                    const value = snap.nodeContent;
                    if (value.status != 1) {
                        toast('解盘已结束');
                        this.popTimer = setTimeout(() => {
                            Orientation.lockToPortrait();
                            Navigation.pop(this.props.navigation);
                        }, 2000);
                    }
                }
            }
        });
    }

    // 获取往期数据
    requestAllData() {
        const path = this._getYdCloudPath();
        YdCloud().ref(path).orderByKey().limitToLast(20).get(snap => {
            if (this.isDidMount == true) {
                if (snap.code == 0) {
                    let values = Object.values(snap.nodeContent);
                    let keys = Object.keys(snap.nodeContent);
                    for (let i = 0; i < keys.length; i++) {
                        const element = keys[i];
                        values[i].key = element;
                    }
                    values.reverse();
                    // 过滤掉直播状态不为回看的数据
                    let filteredData = [];
                    values.forEach(element => {
                        if (element.status == 3) {
                            filteredData.push(element);
                        }
                    });
                    // console.log('receiveCommand', '往期数据：' + JSON.stringify(filteredData));
                    this.setState({ allData: filteredData });
                } else {
                    toast('往期视频数据加载失败');
                }
            }
        });
    }
    _fullVideoPlayer(isFull) {
        DeviceEventEmitter.emit('isFull', isFull);
        if (Platform.OS == 'android') {
            Orientation.getSettingOrientationStatus((error, status) => {
                Orientation.removeOrientationListener(this._orientationDidChange);
                if (status == 0) {
                    Orientation.removeOrientationListener(this._orientationDidChange);
                    this.video && this.video.showControlAnimation();
                    if (isFull) {
                        Orientation.lockToLandscape();
                        this.setState({ isFull: true }, () => {
                            StatusBar.setHidden(true);
                            this.fullImageView && this.fullImageView.close();
                        })
                    } else {
                        Orientation.lockToPortrait();
                        this.setState({ isFull: false }, () => {
                            StatusBar.setHidden(false);
                        })
                    }
                } else {
                    Orientation.addOrientationListener(this._orientationDidChange);
                    if (!isFull) {
                        this.setState({ isFull: true }, () => {
                            Orientation.lockToPortrait();
                        });
                    } else {
                        this.setState({ isFull: false }, () => {
                            Orientation.lockToLandscape();
                        });
                    }
                }
            });
        }
        else {
            if (!isFull) {
                this.setState({ isFull: false }, () => {
                    StatusBar.setHidden(false);
                    Orientation.lockToPortrait();
                })
            } else {
                dismissKeyboard();
                this.setState({ isFull: true }, () => {
                    StatusBar.setHidden(true);
                    this.fullImageView && this.fullImageView.close();
                    Orientation.lockToLandscapeLeft();
                })
            }
        }
    }
    _onProgress(time) {
        let state = this.state;
        state.audioCurrentTime = time;
        this.setState(state);
    }
    _orientationDidChange = (tation) => {
        this.video && this.video.showControlAnimation();
        if (!this.islisten)
            return;
        if (tation === 'LANDSCAPE') {
            this.setState({ isFull: true }, () => {
                StatusBar.setHidden(true);
                this.fullImageView && this.fullImageView.close();
                Orientation.lockToLandscapeLeft();
            })
            if (Platform.OS === 'android') {
                DeviceEventEmitter.emit('androidOrientation', "LANDSCAPE");
            }
        } else if (tation === 'PORTRAIT') {
            this.setState({ isFull: false }, () => {
                StatusBar.setHidden(false);
                Orientation.lockToPortrait();
            })
            if (Platform.OS === 'android') {
                DeviceEventEmitter.emit('androidOrientation', "PORTRAIT");
            }
        }
    }
    _getPositionForRN() {
        if (this.video != undefined) this.video.getPositionForRN();
    }
    //监听网络状态的改变
    handleConnectivityChange(status) {
        this.video && this.video.methods && this.video.methods.netState && this.video.methods.netState(status);
    }

    _prefixInteger(num, length = 2) {
        return (num / Math.pow(10, length)).toFixed(length).substr(2);
    }
    _millisecondToDate(msd) {
        if (!msd) return '00:00';
        var time = Math.round(parseFloat(msd) / 1000);
        if (null != time && "" != time) {
            if (time > 60 && time < 60 * 60) {
                time = this._prefixInteger(parseInt(time / 60.0)) + ":" + this._prefixInteger(parseInt((parseFloat(time / 60.0) - parseInt(time / 60.0)) * 60));
            } else if (time >= 60 * 60 && time < 60 * 60 * 24) {
                time = this._prefixInteger(parseInt(time / 3600.0)) + ":" +
                    this._prefixInteger(parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) + ":" +
                    this._prefixInteger(parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
                        parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60));
            } else {
                time = "00:" + this._prefixInteger(parseInt(time));
            }
        } else {
            time = "00:00";
        }
        return time;
    }
    //点击往期视频列表条目
    _onPressItem(item) {
        if (item.key == this.state.playdata.key) {
            toast('正在播放该视频，请选择其他视频');
        } else {
            sensorsDataClickObject.videoPlay.entrance = '课程播放页'
            sensorsDataClickObject.videoPlay.class_name = this.state.playdata.desTitle
            sensorsDataClickObject.videoPlay.publish_time = this.state.playdata && this.state.playdata.updateTime && this.state.playdata.updateTime.substring(0, 10)
            if (item.playId) {
                this.setState({
                    playdata: item,
                    itemClicked: true
                }, () => {
                    if (item.status == 3) {
                        this.video.state.paused && this.video.methods.togglePlayPause();
                        this.video && this.video.switchUrl(item.playId);
                        sensorsDataClickObject.videoPlay.entrance = '课程播放页'
                        sensorsDataClickObject.videoPlay.class_name = item.desTitle
                        sensorsDataClickObject.videoPlay.publish_time = item && item.updateTime && item.updateTime.substring(0, 10)
                    }
                    this.hisListTimer = setTimeout(() => {
                        this.setState({ itemClicked: false });
                    }, 500);
                });
            } else {
                toast('视频播放地址错误');
            }
        }
    }
    //无网状态界面
    _showNoNet() {
        if (this.state.nonet) {
            return (
                <TouchableWithoutFeedback onPress={() => {
                    NetInfo.fetch().done((status) => {
                        if (status.type == 'none' ) {
                            this.setState({ nonet: true });
                        } else {
                            this.setState({ nonet: false });
                        }
                    })
                }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F6F6', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 10 }}>网络异常</Text>
                        <Text style={{ fontSize: 14, textAlign: 'center' }}>点击屏幕重新加载</Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        }
    }
    //播放器UI
    renderVideoView() {
        const width = this.state.isFull ? (Platform.OS === 'ios' && baseStyle.isIPhoneX) ? baseStyle.height - 88 : baseStyle.height : baseStyle.width;
        const height = this.state.isFull ? (Platform.OS === 'ios' && baseStyle.isIPhoneX) ? baseStyle.width - 21 : baseStyle.width : 211;
        if (this.state.playdata && this.state.playdata.status == 1) {
            return (
                <LivePlayer
                    style={{ overflow: 'hidden' }}
                    ref={(video) => {
                        this.video = video
                    }}
                    vodId={this.state.playdata.classNo}
                    userId={this.state.playdata.userId}
                    width={width}
                    height={height}
                    imageUrl={this.state.playdata.cover}
                    onFullBtnPress={this.fullVideoPlayer}
                    isShowFullscreenbtn={true}
                    disableBack={!this.state.isFull}
                    onBack={this.backView}
                    videoFinish={() => {
                        this.finishTimer = setTimeout(() => {
                            this.backView();
                        }, 2000);
                    }}
                />
            )
        } else {
            console.log("实战解盘点播",this.state.playdata)
            return (
                <VodPlayer
                    style={{ overflow: 'hidden' }}
                    ref={(video) => {
                        this.video = video
                    }}
                    vodId={this.state.playdata.classNo}
                    userId={this.state.playdata.userId}
                    videoPath={this.state.playdata && this.state.playdata.playId}
                    width={width}
                    height={height}
                    imageUrl={this.state.playdata && this.state.playdata.cover}
                    onFullBtnPress={this.fullVideoPlayer}
                    isShowFullscreenbtn={true}
                    disableBack={!this.state.isFull}
                    onBack={this.backView}
                />
            )
        }
    }
    //当前播放内容的简介
    _renderContentView() {
        if (!this.state.playdata) return;
        const time = this.state.playdata.updateTime && this.state.playdata.updateTime.length > 10 ? this.state.playdata.updateTime.substring(0, 10) : '--';
        return (
            <View style={{ backgroundColor: '#fff', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, paddingRight: 15 }}>
                <Text style={{ fontSize: 15, color: '#333' }} numberOfLines={1}>{time} {this.props.navigation.state.params.type}</Text>
            </View>
        );
    }
    //问答区UI
    renderAskQuestionView() {
        const type = this.props.navigation.state.params.type;
        return (
            <View style={{ flex: 1, borderTopColor: baseStyle.LINE_BG_F1, borderTopWidth: 10 }}>
                <Text style={{ fontSize: 15, color: '#333', fontWeight: 'bold', marginTop: 15, marginBottom: 10, marginLeft: 15, }}>
                    {'问答区'}
                </Text>
                <AskQuestionView type={type} />
            </View>
        );
    }
    //往期视频列表FlatList套个View是为了解决Android 在横竖屏切换时flatList高度切换的问题
    renderHistoryList() {
        return (
            <View
                style={this.flatListHeight===0 || Platform.OS==='ios' ?{flex:1,width:baseStyle.width}:{height:this.flatListHeight,width:baseStyle.width}}
                onLayout={(event) => {
                    if (event.nativeEvent.layout.height !== this.flatListHeight) {
                        this.flatListHeight = event.nativeEvent.layout.height;
                    }
                }}
            >
            <FlatList
                style={{ flex: 1, backgroundColor: baseStyle.LINE_BG_F1, paddingBottom: 15 }}
                ref={(flatList) => this._flatList = flatList}
                renderItem={this.renderItem}
                ListHeaderComponent={() => {
                    return (
                        <View style={{
                            width: baseStyle.width,
                            backgroundColor: '#fff',
                            borderTopColor: baseStyle.LINE_BG_F1,
                            borderTopWidth: 10,
                            paddingLeft: 15,
                            paddingTop: 15,
                        }}>
                            <Text style={{ fontSize: 15, color: '#333', fontWeight: 'bold' }}>往期视频</Text>
                        </View>
                    )
                }}
                ItemSeparatorComponent={() => { return <View style={{ marginLeft: 15, marginRight: 15, height: 1, backgroundColor: '#E5E5E5' }} /> }}
                getItemLayout={(data, index) => (
                    { length: 90, offset: 90 * index, index }
                )}
                ListFooterComponent={() => {
                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                            <Text style={{ marginTop: 10, marginBottom: 10, color: '#999999', fontSize: 14 }}>没有更多了</Text>
                        </View>
                    )
                }}
                showsHorizontalScrollIndicator={false}
                data={this.state.allData}
            />
            </View>
        );
    }
    // <Image style={{ width: imgWidth, height: imgHeight, resizeMode: 'stretch' }} source={bgImgSrc} />
    //往期视频列表item布局
    renderItem = (item) => {
        const data = item.item;
        const time = data.updateTime && data.updateTime.length > 10 ? data.updateTime.substring(0, 10) : '--';
        const title = this.props.navigation.state.params.type;
        data.desTitle = title
        const imgWidth = 123, imgHeight = 70;
        let isCurrentPlay = data.key == this.state.playdata.key;
        let bgImgSrc;
        const type = this.props.navigation.state.params.type;
        if (type == '多空决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/duo_kong_decision_exclusive_bg_small.png');
        } else if (type == '风口决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/feng_kou_decision_exclusive_bg_small.png');
        } else if (type == '主力决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/main_decision_exclusive_bg_small.png');
        } else if (type == '实战解盘课') {
            bgImgSrc = require('../../images/MainDecesion/practical_solution_bg_small.png');
        }
        return (
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#fff', flexDirection: 'row', paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10 }}
                activeOpacity={1}
                onPress={() => this._onPressItem(data)}
            >
                {Platform.OS === 'ios' ?
                    <Image
                        style={{ width: imgWidth, height: imgHeight, resizeMode: 'stretch' }}
                        source={bgImgSrc}
                    />
                    :
                    <FastImage
                        style={{ width: imgWidth, height: imgHeight }}
                        source={bgImgSrc}
                        resizeMode={FastImage.resizeMode.stretch}
                    />
                }
                <View style={{ flex: 1, paddingLeft: 10, paddingTop: 5, justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: isCurrentPlay ? '#F92400' : '#555' }} numberOfLines={1}>{time} {title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Image style={{ width: 14, height: 14 }} source={require('../../images/icons/decision_live_state_playback_gray_icon.png')}></Image>
                        <Text style={{ marginLeft: 5, fontSize: 12, color: '#00000066' }}>{getHmsORms(data.times)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    render() {
        return (
            <BaseComponentPage style={{ flex: 1, backgroundColor: this.state.isFull ? '#000' : '#fff' }} topNeed={!this.state.isFull}>
                {!this.state.isFull && <NavigationTitleView navigation={this.props.navigation} titleText={this._getBarTitle()} />}
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    {this.renderVideoView()}
                    {!this.state.isFull && this._renderContentView()}
                    {this.state.playdata.status != 1 ? this.renderHistoryList() :this.renderAskQuestionView()}
                </KeyboardAvoidingView>
            </BaseComponentPage>
        );
    }
}