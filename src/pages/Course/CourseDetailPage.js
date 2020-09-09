/*
 * @Author: lishuai 
 * @Date: 2019-08-14 11:27:32 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-07-31 17:43:44
 * 视频播放详情页
 */
'use strict';
import React from "react";
import { AppState, BackHandler, DeviceEventEmitter, FlatList, Image, ImageBackground, Platform, ScrollView, StatusBar, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Orientation from "react-native-orientation";
import * as baseStyle from '../../components/baseStyle';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { toast } from '../../utils/CommonUtils';
import UserInfoUtil, * as Type from "../../utils/UserInfoUtil";
import YdCloud from '../../wilddog/Yd_cloud';
import WYVideoPlayer from "./WYVideoPlayer";
import NetInfo from "@react-native-community/netinfo";
import { sensorsDataClickObject, sensorsDataClickActionName } from "../../components/SensorsDataTool";
import ShareSetting from "../../modules/ShareSetting";

const HISTORY_LIST_COUNT = 20; // 往期列表请求条数

//只是Android 使用
import FastImage from 'react-native-fast-image'
import * as ScreenUtil from "../../utils/ScreenUtil";
//import  NavigationTitleView from "../../components/NavigationTitleView";

export default class CourseDetailPage extends BaseComponentPage {

    constructor(props) {
        super(props)
        this.type = this.props.navigation.state.params.type; // 课程类型, 大咖来了: BigCafe, 小白课堂: LittleWhite, 指标学习: IndexStudy, 策略学堂: Strategy
        this.taoxiName = this.props.navigation.state.params.taoxiName; // 指标学习或策略学堂的套系名称
        this.courseStar = this.props.navigation.state.params.star; // 指标学习或策略学堂课程所属的权限星级
        this.nodeName = this.props.navigation.state.params.nodeName; // 指标学习或策略学堂课程所在的节点名称
        this.kindId = this.props.navigation.state.params.kindId; // 小白课堂中的有分类的课程所在的分类id
        this.popView = false;
        // this.islisten = true;
        this.state = {
            key: this.props.navigation.state.params.key, // 课程所在的源达云节点的key
            isPlay: false,
            isFull: false,
            hiehgt: 211,
            width: baseStyle.width,
            playdata: {},
            allData: [],
            index: 0,
            nonet: false,
            isLiked: false,
            feedback: 0, // 1: 完全看懂了 2: 基本看懂了 3: 没看懂
            likedNumber: 0,
            likeClicked: false,
            itemClicked: false,

            bigZan: false,//点赞+1效果专用
        }
        this._videoView = this._videoView.bind(this)

        this._getPositionForRN = this._getPositionForRN.bind(this)
        this.orientationDidChange = this._orientationDidChange.bind(this)
        this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
        this.fullVideoPlayer = this._fullVideoPlayer.bind(this)

        this._onRelease = this._onRelease.bind(this)
        this.backView = this.backView.bind(this);
        this._handleAppStateChange = this._handleAppStateChange.bind(this)
        this.playVideo = this.playVideo.bind(this);
        this.isDidMount = false;
    }

    componentDidMount() {
        this.isDidMount = true;

        this.pasueListener = DeviceEventEmitter.addListener('pasueListener', () => {
            this.video && this.video.pause()
        })
        if (Platform.OS === 'android') {
            //拦截手机自带返回键
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
        // Orientation.unlockAllOrientations();
        // Orientation.addOrientationListener(this.orientationDidChange);
        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);

        NetInfo.fetch().done((status) => {
            this.handleConnectivityChange(status);
            if (status == 'none' || status == 'NONE') {
                this.setState({ nonet: true });
            }
        })
        this.requestNewData();
        this.requestAllData();

        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.chengzhangxuetangbofangxiangqing);
        });
        sensorsDataClickObject.videoPlay.video_type = '录播视频'
    }

    componentWillReceiveProps(nextProps, netxContext) {
        if (this.state.key !== nextProps.navigation.state.params.key) {
            if (this.taoxiName !== nextProps.navigation.state.params.taoxiName) {
                this.taoxiName = nextProps.navigation.state.params.taoxiName;
            }
            if (this.nodeName !== nextProps.navigation.state.params.nodeName) {
                this.nodeName = nextProps.navigation.state.params.nodeName;
            }
            if (this.kindId !== nextProps.navigation.state.params.kindId) {
                this.kindId = nextProps.navigation.state.params.kindId;
            }
            if (this.courseStar !== nextProps.navigation.state.params.star) {
                this.courseStar = nextProps.navigation.state.params.star;
            }
            this.setState({ key: nextProps.navigation.state.params.key }, () => {
                this.requestNewData(() => {
                    this.video.state.paused && this.video.methods.togglePlayPause();
                    this.video && this.video.switchUrl(this.state.playdata.play_address);
                });
                this.requestAllData();
            });
        }
    }

    componentWillUnmount() {
        this.netInfoSubscriber && this.netInfoSubscriber();
        this.isDidMount = false;
        this.pasueListener && this.pasueListener.remove()
        this.video && this.video.player.ref.release();
        this.video && this.video.releaseTimer();
        this.fullImageView && this.fullImageView.close();
        this.popView = true;
        this.willFocusSubscription && this.willFocusSubscription.remove();
        AppState.removeEventListener('change', this._handleAppStateChange);
        if (Platform.OS == 'android')
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);

    }
    //监听后台状体的具体实现函数
    _handleAppStateChange = (appState) => {
        if (appState == 'background') {
            //视频播放过程中执行暂停操作
            if (this.video && !this.video.state.paused) {
                this.video.methods.togglePlayPause();
            }
        }
    }
    //物理返回按钮
    onBackAndroid = () => {
        if (!this.state.isFull) {
            if (this.props.navigation && this.video) {
                this.fullImageView && this.fullImageView.close();
                this.video.releaseTimer();
                this.video.player.ref.release();
                this.popView = true;
                Orientation.lockToPortrait();
                BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                setTimeout(() => {
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

    playVideo() {
        this.video && this.video.start();
    }

    backView() {
        if (!this.state.isFull) {
            if (this.props.navigation && this.video) {
                this.fullImageView && this.fullImageView.close();
                //this.backFromPHCLWangQiListListener && this.backFromPHCLWangQiListListener.remove()
                this.video.releaseTimer();
                this.video.player.ref.release();
                Orientation.lockToPortrait();
                //点击返回按钮，记录下用户操作
                this.popView = true;
                BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                setTimeout(() => {
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
    }
    // 获取视频播放数据
    requestNewData(callback) {
        let path = this._getHistoryListDataPath() + this.state.key;
        YdCloud().ref(path).get((snap) => {
            if (snap.code == 0 && this.isDidMount == true) {
                let value = snap.nodeContent;
                let likedDatas = UserInfoUtil.getZanMessage(this._getModelType('like'));
                let isLiked = likedDatas.indexOf(value.id.toString());
                let feedbackData = UserInfoUtil.getUnderstand(this._getModelType('feedback'), value.id.toString());
                this.setState({
                    playdata: value,
                    isLiked: isLiked < 0 ? false : true,
                    likedNumber: value.like ? value.like : 0,
                    feedback: Object.keys(feedbackData).length && feedbackData.mark, // 判断是否为空对象
                }, () => {
                    if (this.state.feedback == 1) {
                        sensorsDataClickObject.videoPlay.video_evaluation = '完全看懂了'
                    } else if (this.state.feedback == 2) {
                        sensorsDataClickObject.videoPlay.video_evaluation = '基本看懂了'
                    } else if (this.state.feedback == 3) {
                        sensorsDataClickObject.videoPlay.video_evaluation = '没看懂'
                    }

                    if (callback) { callback(); }
                });
            }
        });
    }
    // 通过课程类型返回源达云节点路径,用来获取往期视频数据
    _getHistoryListDataPath() {
        if (this.type === 'BigCafe') {
            return MainPathYG + 'DaKaLaiLe/';
        } else if (this.type === 'LittleWhite') {
            return MainPathYG + 'XiaoBaiKeTang/' + this.kindId + '/';
        } else if (this.type === 'IndexStudy') {
            let courseStar = this.courseStar.toString() ? this.courseStar + '/' : '';
            let taoxiName = this.taoxiName ? this.taoxiName + '/' : '';
            return MainPathYG + 'ZhiBiaoKeTang/' + courseStar + taoxiName;
        } else if (this.type === 'Strategy') {
            let courseStar = this.courseStar.toString() ? this.courseStar + '/' : '';
            let taoxiName = this.taoxiName ? this.taoxiName + '/' : '';
            return MainPathYG + 'ChengZhangKeTang/' + courseStar + taoxiName;
        }
    }
    // 获取当前课程类型的往期数据, 默认获取20条
    requestAllData() {
        let path = this._getHistoryListDataPath();
        YdCloud().ref(path).orderByKey().endAt(this.state.key.toString()).limitToLast(HISTORY_LIST_COUNT).get((snap) => {
            if (snap.code == 0 && this.isDidMount == true) {
                let values = Object.values(snap.nodeContent);
                values.reverse();
                if (values.length < HISTORY_LIST_COUNT) {
                    // 往后取的数据量，+1是因为有一条重复数据需要过滤
                    const count = HISTORY_LIST_COUNT - values.length + 1;
                    YdCloud().ref(path).orderByKey().startAt(this.state.key.toString()).limitToFirst(count).get((snap) => {
                        if (snap.code == 0 && this.isDidMount == true) {
                            let _values = Object.values(snap.nodeContent);
                            _values.splice(0, 1);// 去除重复数据
                            _values.reverse();
                            const allData = _values.concat(values);
                            let index = this._getCurrentPlayVideoIndex(allData);
                            this.setState({ allData: allData, index: index }, () => {
                                this._listScrollTo();
                            });
                        }
                    });
                } else {
                    let index = this._getCurrentPlayVideoIndex(values);
                    this.setState({ allData: values, index: index }, () => {
                        this._listScrollTo();
                    });
                }
            }
        })
    }

    _getCurrentPlayVideoIndex(videos) {
        let index = 0;
        for (let i = 0; i < videos.length; i++) {
            const element = videos[i];
            if (this.type == 'LittleWhite' || this.type == 'BigCafe') {
                if (element.id == this.state.key) {
                    index = i;
                    break;
                }
            } else if (this.type == 'IndexStudy' || this.type == 'Strategy') {
                if (element.createTime == this.state.key) {
                    index = i;
                    break;
                }
            }
        }
        return index;
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
                        Orientation.lockToPortrait();
                    } else {
                        Orientation.lockToLandscape();
                    }
                }
            });
        }
        else {
            if (!isFull) {
                this.setState({ isFull: false }, () => {
                    Orientation.lockToPortrait();
                })
            }
            else {
                this.setState({ isFull: true }, () => {
                    Orientation.lockToLandscapeLeft();
                })
            }
        }
    }

    _orientationDidChange = (tation) => {
        this.video && this.video.showControlAnimation();
        // if (!this.islisten)
        //     return;
        if (tation === 'LANDSCAPE') {
            this.setState({ isFull: true }, () => {
                StatusBar.setHidden(true);
                this.fullImageView && this.fullImageView.close();
                // Orientation.unlockAllOrientations();
                Orientation.lockToLandscape();
            })
        } else if (tation === 'PORTRAIT') {
            this.setState({ isFull: false }, () => {
                StatusBar.setHidden(false);
                // Orientation.unlockAllOrientations();
                Orientation.lockToPortrait();
            })
        }
    }
    _getPositionForRN() {
        if (this.video != undefined) this.video.getPositionForRN();
    }
    //监听网络状态的改变
    handleConnectivityChange(status) {
        this.video && this.video.methods && this.video.methods.netState && this.video.methods.netState(status);
    }

    render() {
        let statusBarHeight = 0;
        if (Platform.OS == 'ios') {
            statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
        } else {
            statusBarHeight = StatusBar.currentHeight;
        }
        return (
            <View style={{ flex: 1, backgroundColor: this.state.isFull ? '#000' : '#F6F6F6' }}>
                {this.state.isFull ? null :
                    <View style={{ height: statusBarHeight, backgroundColor: '#000' }} >
                        <StatusBar barStyle='light-content' backgroundColor='#000000' />
                    </View>}

                {this._videoView()}
                {this.state.isFull ?
                    null :
                    <ScrollView style={{ flex: 1 }}>
                        {this._renderContentView()}
                        {this._renderWatchFeedbackView()}
                        {this._wangqiTitleUI()}
                        {this._list()}
                        {this._showNoNet()}
                    </ScrollView>}
            </View>
        );
    }

    //无网状态界面
    _showNoNet() {
        if (this.state.nonet) {
            return (
                <TouchableWithoutFeedback onPress={() => {
                    NetInfo.fetch().done((status) => {
                        if (status == 'none' || status == 'NONE') {
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
    _videoView() {
        return (
            <WYVideoPlayer
                ref={(video) => { this.video = video }}
                VideoPath={this.state.playdata.play_address}
                navigation={this.props.navigation}
                onFullBtnPress={this.fullVideoPlayer}
                onRelease={this._onRelease}
                firstPlay={false}
                width={this.state.isFull ? (Platform.OS === 'ios' && baseStyle.isIPhoneX) ? baseStyle.height - 88 : baseStyle.height : baseStyle.width}
                height={this.state.isFull ? (Platform.OS === 'ios' && baseStyle.isIPhoneX) ? baseStyle.width - 21 : baseStyle.width : 211}
                imageUrl={this.state.playdata.cover}
                duration={this.state.playdata.video_length}
                isShowFullscreenbtn={true}
                onBack={this.backView}
            />
        )
    }

    //当前播放内容的简介
    _renderContentView() {
        if (!this.state.playdata) return;
        let c_time = this.state.playdata.create_time;
        let time = c_time ? (c_time).substring(0, 10) : '--';
        const showTime = this.type === 'BigCafe' || this.type === 'LittleWhite';
        let title = showTime ? this.state.playdata.period + '期: ' + this.state.playdata.title : this.state.playdata.title;
        let likeText = this.state.likedNumber > 0 ? this.state.likedNumber : '点赞';
        let likeImageSrc = this.state.isLiked ? require('../../images/livelession/icon-zaning.png') : require('../../images/livelession/icon-zan.png');
        let likeColor = this.state.isLiked ? '#D80C18' : '#00000066';
        return (
            <View style={{ backgroundColor: '#ffffff', paddingTop: 15, paddingBottom: 10, borderBottomColor: baseStyle.LINE_BG_F1, borderBottomWidth: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 0.8, borderRightColor: '#0000001a', borderRightWidth: 1 }}>
                        <Text style={{ fontSize: 15, color: '#555555', marginLeft: 16, fontWeight: '900' }} numberOfLines={1}>{title}</Text>
                        {showTime && <Text style={{ marginLeft: 16, marginTop: 10, color: '#999999', fontSize: 12 }}>{time}</Text>}
                    </View>
                    <TouchableOpacity style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._likeBtnOnClick()}>
                        <Image style={{ width: 18, height: 18 }} source={likeImageSrc}></Image>
                        <Text style={{ marginTop: 5, color: likeColor, fontSize: 12 }}>{likeText}</Text>
                        {
                            this.state.bigZan &&
                            <Text style={{
                                position: 'absolute',
                                right: 10,
                                top: -5,
                                backgroundColor: 'transparent',
                                color: baseStyle.BLUE_HIGH_LIGHT,
                                height: 20
                            }}>+1</Text>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    // 观看效果反馈组件
    _renderWatchFeedbackView() {
        let data = [
            { title: '完全看懂了', selectedImgSrc: require('../../images/livelession/Growth/course_fully_understand_red_icon.png'), unselectedImgSrc: require('../../images/livelession/Growth/course_fully_understand_gray_icon.png') },
            { title: '基本看懂了', selectedImgSrc: require('../../images/livelession/Growth/course_basic_understand_red_icon.png'), unselectedImgSrc: require('../../images/livelession/Growth/course_basic_understand_gray_icon.png') },
            { title: '没看懂', selectedImgSrc: require('../../images/livelession/Growth/course_not_understand_red_icon.png'), unselectedImgSrc: require('../../images/livelession/Growth/course_not_understand_gray_icon.png') }
        ];
        return (
            <View style={{ paddingTop: 15, paddingBottom: 15, alignItems: 'center', backgroundColor: '#ffffff' }}>
                <Text style={{ fontSize: 12, color: '#00000099' }}>请您对观看效果进行反馈</Text>
                {
                    this.state.feedback == 0 ?
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
                            {data.map((value, index) => {
                                let showSeparator = index % 2 < 2 ? true : false;
                                let isSelected = index + 1 == this.state.feedback;
                                let textColor = isSelected ? '#D80C18' : '#00000066';
                                let imageSrc = isSelected ? value.selectedImgSrc : value.unselectedImgSrc;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRightColor: '#0000001a', borderRightWidth: showSeparator ? 1 : 0 }}
                                        activeOpacity={1}
                                        onPress={() => this._feedbackBtnOnClick(value.title)}>
                                        <Image style={{ width: 20, height: 20 }} source={imageSrc}></Image>
                                        <Text style={{ fontSize: 12, color: textColor, marginLeft: 5 }}>{value.title}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View> :
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                            <Image style={{ width: 20, height: 20 }} source={data[this.state.feedback - 1].selectedImgSrc}></Image>
                            <Text style={{ fontSize: 12, color: '#d80c18', marginLeft: 5 }}>{data[this.state.feedback - 1].title}</Text>
                        </View>
                }
            </View>
        );
    }

    //往期视频入口ui
    _wangqiTitleUI() {
        return (
            <View style={{
                width: baseStyle.width,
                height: 40,
                marginTop: 8,
                backgroundColor: '#ffffff',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Text style={{ fontSize: 15, color: '#333333', marginLeft: 16, fontWeight: '900' }}>往期视频({this.state.allData.length})</Text>
                <TouchableOpacity onPress={() => this._moreButtonOnClick()}>
                    <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, color: '#999999', marginRight: 6 }}>更多</Text>
                        <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    //往期视频列表
    _list() {
        return (
            <FlatList
                style={{ flex: 1, backgroundColor: '#ffffff', paddingBottom: 15 }}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                ref={(flatList) => this._flatList = flatList}
                renderItem={this._renderItem}
                refreshing={false}
                horizontal={true}
                getItemLayout={(data, index) => (
                    { length: 124, offset: (124 + 5) * index, index }
                )}
                showsHorizontalScrollIndicator={false}
                data={this.state.allData}
            />
        );
    }
    //往期视频列表item布局
    _renderItem = (item) => {
        let data = item.item;
        let time, cover;
        let isCurrentPlay = false;
        if (this.type == 'LittleWhite' || this.type == 'BigCafe') {
            time = data.create_time ? data.create_time.substring(0, 10) : '';
            isCurrentPlay = data.id == this.state.key;
            cover = data.cover;
        } else if (this.type == 'IndexStudy' || this.type == 'Strategy') {
            isCurrentPlay = data.createTime == this.state.key;
            let date = new Date(data.createTime);
            let year = date.getFullYear();
            let month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
            let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            time = year + '-' + month + '-' + day;
            cover = data.cover_url;
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this._onPressItem(data, item.index)}>
                <View style={{ backgroundColor: '#ffffff', width: 124, marginLeft: 5 }}>
                    <View style={{ width: 125, height: 70, backgroundColor: '#000000' }}>
                        <ImageBackground style={{ width: 125, height: 70, alignItems: 'flex-end', justifyContent: 'space-between' }}
                            source={require('../../images/icons/placeholder_bg_image.png')}>
                            {Platform.OS === 'ios' ?
                                <Image
                                    style={{ width: 125, height: 70, position: "absolute", resizeMode: 'stretch' }}
                                    source={{ uri: cover }}
                                />
                                :
                                <FastImage
                                    style={{ width: 125, height: 70, position: "absolute" }}
                                    source={{ uri: cover }}
                                    resizeMode={FastImage.resizeMode.stretch}
                                />
                            }
                            {(data && data.set) ? <View
                                style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000066', borderRadius: 5, padding: 3, marginRight: 5, marginTop: 5 }}>
                                <Text style={{ fontSize: 12, color: '#ffffff', alignItems: 'center' }} numberOfLine={1}>{data.set}</Text>
                            </View> : <View />}
                            <View style={{ width: 70, height: 18, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', }}>
                                <Text style={{ color: '#ffffff', fontSize: 10 }}>{time}</Text>
                            </View>
                        </ImageBackground>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ marginLeft: 5, marginRight: 5, fontSize: 14, color: isCurrentPlay ? '#D80C18' : '#555555' }} numberOfLines={2}>
                            {this.props.isLongHu ? null : (this.props.isReDian) ? null : data.period ? data.period + "期: " : null}{data.title}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    //点击往期视频列表条目
    _onPressItem(item, index) {
        if (item.id === undefined) return;
        let key = 0;
        if (this.type == 'LittleWhite' || this.type == 'BigCafe') {
            key = item.id;
        } else if (this.type == 'IndexStudy' || this.type == 'Strategy') {
            key = item.createTime;
        }
        if (key == this.state.key) {
            toast('正在播放该视频，请选择其他视频');
        } else {            
            let likedDatas = UserInfoUtil.getZanMessage(this._getModelType('like'));
            let isLiked = likedDatas.indexOf(item.id.toString());
            let feedbackData = UserInfoUtil.getUnderstand(this._getModelType('feedback'), item.id.toString());
            if (item.play_address) {
                this.setState({
                    playdata: item,
                    key: key,
                    isLiked: isLiked < 0 ? false : true,
                    likedNumber: item.like ? item.like : 0,
                    index: index,
                    itemClicked: true,
                    feedback: Object.keys(feedbackData).length && feedbackData.mark, // 判断是否为空对象
                }, () => {
                    this._listScrollTo();
                    this.video.state.paused && this.video.methods.togglePlayPause();
                    this.video && this.video.switchUrl(item.play_address);
                    setTimeout(() => {
                        this.setState({ itemClicked: false });
                    }, 500);
                    if (this.type == 'LittleWhite' || this.type == 'BigCafe') {
                        sensorsDataClickObject.videoPlay.publish_time = item.create_time.substring(0,10)
                        sensorsDataClickObject.videoPlay.class_series = item.set || ''
                    } else if (this.type == 'IndexStudy' || this.type == 'Strategy') {
                        sensorsDataClickObject.videoPlay.class_series = item.setsystem || ''
                        sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(item.createTime), 'yyyy-MM-dd')
                    }
                    sensorsDataClickObject.videoPlay.entrance = '课程播放页'
                    sensorsDataClickObject.videoPlay.class_name = item.title
                })
            } else {
                toast('视频播放地址错误');
            }
        }
    }
    _feedbackBtnOnClick(title) {
        let mark = 1;
        sensorsDataClickObject.videoPlay.video_evaluation = '完全看懂了'
        if (title === '基本看懂了') {
            mark = 2;
            sensorsDataClickObject.videoPlay.video_evaluation = '基本看懂了'
        } else if (title === '没看懂') {
            mark = 3;
            sensorsDataClickObject.videoPlay.video_evaluation = '没看懂'
        }
        let type = this._getModelType('feedback');
        this.setState({ feedback: mark });
        // 指标、策略课堂需要多传套系名称和课程所在的源达云节点的key
        if (this.type == 'IndexStudy' || this.type === 'Strategy') {
            UserInfoUtil.understand(this.state.playdata.id, type, mark, null, () => {
                this.setState({ feedback: 0 });
            }, this.state.playdata.setsystem, this.state.key);
        } else {
            UserInfoUtil.understand(this.state.playdata.id, type, mark, null, () => {
                this.setState({ feedback: 0 });
            });
        }
    }
    //Android播放器release回调
    _onRelease() {

    }

    //往期更多按钮
    _moreButtonOnClick() {
        this.video && this.video.pause();

        if (this.type === 'BigCafe') {
            Navigation.pushForParams(this.props.navigation, 'BigCafeCoursePage');
        } else if (this.type === 'LittleWhite') {
            Navigation.pushForParams(this.props.navigation, 'LittleWhiteCoursePage', { selectedIndex: 0 });
        } else if (this.type === 'IndexStudy') {
            Navigation.pushForParams(this.props.navigation, 'IndexStudyCoursePage');
        } else if (this.type === 'Strategy') {
            Navigation.pushForParams(this.props.navigation, 'StrategyCoursePage');
        }

        if (this.state.itemClicked) return;
        this.setState({ itemClicked: true }, () => {
            setTimeout(() => {
                this.setState({ itemClicked: false });
            }, 500);
        })
        Orientation.lockToPortrait();
        // this.islisten = false;
    }

    _getModelType(flag = '') {
        let lanMutype;
        if (this.type === 'BigCafe') {
            lanMutype = Type.MODEL_daKaLaiLa;
        }
        else if (this.type === 'LittleWhite') {
            lanMutype = Type.MODEL_xiaoBaiKeTang;
        }
        else if (this.type === 'IndexStudy') {
            lanMutype = flag == 'like' ? Type.MODEL_ZAN_ZhiBiaoKeTang : Type.MODEL_Unders_ZhiBiaoKeTang;
        }
        else if (this.type === 'Strategy') {
            lanMutype = flag == 'like' ? Type.MODEL_ZAN_CeLueXueTang : Type.MODEL_Unders_CeLueXueTang;
        }
        return lanMutype;
    }

    //赞按钮
    _likeBtnOnClick() {

        if (this.state.itemClicked) return;
        let op = this.state.isLiked ? -1 : 1;
        let type = this._getModelType('like');

        this.setState({ likeClicked: true });
        let number = (op == 1) ? this.state.likedNumber + 1 : this.state.likedNumber - 1;
        if (op == 1) {
            sensorsDataClickObject.agreePoint.content_show_type = '视频'
            sensorsDataClickObject.agreePoint.agree_content = this.state.playdata.period ? this.state.playdata.period + '期' + this.state.playdata.title : this.state.playdata.title
            let timeStr = ''
            if (this.state.playdata.create_time) {
                timeStr = this.state.playdata.create_time.substring(0,10)                
            } else {
                timeStr = ShareSetting.getDate(parseInt(this.state.playdata.createTime),'yyyy-MM-dd')
            }
            sensorsDataClickObject.agreePoint.publish_time = timeStr
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.agreePoint)

        }
        this.setState({
            isLiked: !this.state.isLiked,
            likedNumber: number,
            likeClicked: false,
            bigZan: (op == -1) ? false : true,
        }, () => {
            if (this.state.bigZan) {
                setTimeout(() => {
                    this.setState({
                        bigZan: false
                    })
                }, 500)
            }
        });
        // 指标、策略课堂需要多传套系名称和课程所在的源达云节点的key
        if (this.type == 'IndexStudy' || this.type === 'Strategy') {
            UserInfoUtil.ydgpZanNew(this.state.playdata.id, type, op, '', '', null, () => {
                this.setState({
                    isLiked: !this.state.isLiked,
                    likedNumber: (op == 1) ? this.state.likedNumber - 1 : this.state.likedNumber + 1,
                    likeClicked: false,
                    bigZan: false,
                });
            }, this.state.playdata.setsystem, this.state.key);
        } else {
            UserInfoUtil.ydgpZanNew(this.state.playdata.id, type, op, '', '', null, () => {
                this.setState({
                    isLiked: !this.state.isLiked,
                    likedNumber: (op == 1) ? this.state.likedNumber - 1 : this.state.likedNumber + 1,
                    likeClicked: false,
                    bigZan: false,
                }, () => {

                });
            });
        }

    }

    //往期视频列表滑动
    _listScrollTo() {

        let viewPosition;
        if (this.state.index < 1) {
            viewPosition = 0;
        } else if (this.state.index < this.state.allData.length - 1) {
            viewPosition = 0.5;
        } else {
            viewPosition = 1;
        }
        setTimeout(() => {
            (!this.popView && this._flatList) && this._flatList.scrollToIndex({
                index: this.state.index,
                viewPosition: viewPosition
            });
        }, 500);
    }
}
