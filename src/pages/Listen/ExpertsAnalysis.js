/**
 * 专家分析
 **/

"use strict";

import React, { Component } from "react";
import { BackHandler, DeviceEventEmitter, Image, ImageBackground, Platform, Text, TouchableOpacity, View } from "react-native";
import Orientation from 'react-native-orientation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserInfoAction from '../../actions/UserInfoAction';
import * as baseStyle from '../../components/baseStyle';
import InterpretationVideoComponent from '../../components/Decisions/DecisionInterpretationVideoComponent';
import UserInfoUtil from '../../utils/UserInfoUtil';
import Yd_cloud from '../../wilddog/Yd_cloud';
import ContentListView, { VIEW_POINT_FILTER_CONDITION_1, VIEW_POINT_FILTER_CONDITION_2 } from './ContentListView';
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";
import moment from "moment";

const livingroom_start = require('../../images/JiePan/livingroom_start.png');
const livingroom_living = require('../../images/JiePan/livingroom_living.png');
const livingroom_end = require('../../images/JiePan/livingroom_end.png');

class ExpertsAnalysis extends Component {
    constructor(props) {
        super(props)
        this.zbj_Ref = Yd_cloud().ref(ZBJ_ydyun + 'classes');
        this.showLiveRoomInfoIndex = 0;
        this.state = {
            classesData: [],
            liveRoom_create_time: '',
            liveRoom_end: '',
            liveRoom_start: '',
            liveRoom_nickname: '',
            liveRoom_title: '',
            liveRoom_status: '',
            liveRoom_header: '',
            liveRoom_isliving: '',
            liveRoom_descp: '',
            isPushPZGD: false,
            isRefreshing: false,
        }
        this._loadData = this._loadData.bind(this)
        this._lineUI = this._lineUI.bind(this)
        this._liveRoomUI = this._liveRoomUI.bind(this)
        this._viewpointLiveUI = this._viewpointLiveUI.bind(this)
        this._processData = this._processData.bind(this)
        this._renderHeader = this._renderHeader.bind(this)
    }
    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
        this._loadData();
        Orientation.lockToPortrait();
        this.releaseListener = DeviceEventEmitter.addListener('releaseListener', (e) => {
            this.setState({ isPushPZGD: true });
        });
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        this.releaseListener && this.releaseListener.remove();
        this.zbj_Ref && this.zbj_Ref.off("value");
    }
    onBackAndroid = () => {
        Orientation.lockToPortrait();
        return false;
    }
    _loadData() {
        //直播间课程表
        this.zbj_Ref.orderByKey().get((snap) => {
            this.detailZBJ(snap);
        });
        this.zbj_Ref.on('value', (snap) => {
            this.zbj_Ref.orderByKey().get((snap) => {
                this.detailZBJ(snap);
            });
        });
    }
    //直播间的详情
    detailZBJ(snap) {
        if (snap.code == 0) {
            let values = Object.values(snap.nodeContent);
            if (values.length) {
                let status = '', living = '';
                this.setState({ classesData: values }, () => {
                    //处理数据
                    this._processData();
                    if (!this.state.classesData[this.showLiveRoomInfoIndex]) return;
                    //console.log('VideoViewManager  classesData='+ JSON.stringify(this.state.classesData[this.showLiveRoomInfoIndex])) ;

                    if (this.state.classesData[this.showLiveRoomInfoIndex].status && this.state.classesData[this.showLiveRoomInfoIndex].status == 1) {
                        status = '解盘中';
                    } else if (this.state.classesData[this.showLiveRoomInfoIndex].status && this.state.classesData[this.showLiveRoomInfoIndex].status == 2) {
                        status = '未开始';
                    } else if (this.state.classesData[this.showLiveRoomInfoIndex].status && this.state.classesData[this.showLiveRoomInfoIndex].status == 3) {
                        if(this.state.classesData[this.showLiveRoomInfoIndex].hasvod){
                            status = '回看';
                        }else{
                            status = '文件上传中';
                            //console.log('VideoViewManager  upload file');
                        }                
                    }
                    if (this.state.classesData[values.length - 1].status && this.state.classesData[values.length - 1].status == 3) {
                        // living = '回看';
                        if(this.state.classesData[values.length - 1].hasvod){
                            living = '回看';
                        }else{
                            living = '文件上传中';
                            //console.log('VideoViewManager  living upload file');
                        }
                    } else {
                        living = '解盘中';
                    }
                    this.setState({
                        liveRoom_create_time: this.state.classesData[this.showLiveRoomInfoIndex].create_time,
                        liveRoom_end: this.state.classesData[this.showLiveRoomInfoIndex].end,
                        liveRoom_start: this.state.classesData[this.showLiveRoomInfoIndex].start,
                        liveRoom_nickname: this.state.classesData[this.showLiveRoomInfoIndex].nickname,
                        liveRoom_title: this.state.classesData[this.showLiveRoomInfoIndex].title,
                        liveRoom_header: this.state.classesData[this.showLiveRoomInfoIndex].head,
                        liveRoom_status: status,
                        liveRoom_isliving: living,
                        liveRoom_descp: this.state.classesData[this.showLiveRoomInfoIndex].descp,
                    }, () => {

                    });
                });
            } else {
                this.setState({
                    classesData: [],
                    liveRoom_create_time: undefined,
                    liveRoom_end: undefined,
                    liveRoom_start: undefined,
                    liveRoom_nickname: undefined,
                    liveRoom_title: undefined,
                    liveRoom_header: undefined,
                    liveRoom_status: undefined,
                    liveRoom_isliving: undefined,
                    liveRoom_descp: undefined,
                });
            }
        } else {
            // 后台节点没有课程
            this.setState({
                classesData: [],
                liveRoom_create_time: undefined,
                liveRoom_end: undefined,
                liveRoom_start: undefined,
                liveRoom_nickname: undefined,
                liveRoom_title: undefined,
                liveRoom_header: undefined,
                liveRoom_status: undefined,
                liveRoom_isliving: undefined,
                liveRoom_descp: undefined,
            });
        }
    }
    _processData() {
        for (let i = 0; i < this.state.classesData.length; i++) {
            if (this.state.classesData[i].status == 1) {
                this.showLiveRoomInfoIndex = i;
                break;
            } else if (this.state.classesData[i].status == 2) {
                this.showLiveRoomInfoIndex = i;
                break;
            } else if (this.state.classesData[i].status == 3 && i == this.state.classesData.length - 1) {
                this.showLiveRoomInfoIndex = i;
                break;
            }
        }
    }
    //下拉刷新回调
    _onRefresh = () => {
        this.setState({ isRefreshing: true });
        setTimeout(() => {
            this.setState({ isRefreshing: false, });
        }, 3000);
    }
    //跳转指定页面
    _push(page, obj) {
        Navigation.navigateForParams(this.props.navigation, page, obj)
    }
    liveRoomOnClick() {
        let publishTime = ''
        publishTime = this.state.classesData && this.state.classesData && this.state.classesData.length>0 && this.state.classesData[0].update_time || ''
        this._push('LiveRoom', {
            publishTime: publishTime,
            title: this.state.liveRoom_title,
            status: this.state.liveRoom_status,
            laoshi: this.state.liveRoom_nickname,
            start: this.state.liveRoom_start,
            end: this.state.liveRoom_end,
            header: this.state.liveRoom_header,
            isliving: this.state.liveRoom_isliving,
            descp: this.state.liveRoom_descp,
            from: 'ExpertsAnalysis'
        });
        let dateStr = moment(new Date()).format('YYYY-MM-DD')
        sensorsDataClickObject.shareClick.publish_time = dateStr
        sensorsDataClickObject.shareClick.content_source = '视频解盘'
        sensorsDataClickObject.shareClick.content_name = this.state.liveRoom_title
        
        sensorsDataClickObject.shareMethod.content_name = this.state.liveRoom_title
        sensorsDataClickObject.shareMethod.publish_time = dateStr

        sensorsDataClickObject.videoPlay.entrance = '观点'
        sensorsDataClickObject.videoPlay.class_name = this.state.liveRoom_title
        sensorsDataClickObject.videoPlay.class_type = '视频解盘'
        sensorsDataClickObject.videoPlay.publish_time = publishTime.substring(0,10) || ''


        sensorsDataClickObject.adModule.entrance = '观点';
        sensorsDataClickObject.adModule.module_name = '视频解盘';
        sensorsDataClickObject.adModule.module_type = '观点';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)

    }
    _renderHeader() {
        return (
            <View srtle={{ flex: 1, backgroundColor: '#F5F5F5' }}>
                {this._lineUI()}
                <InterpretationVideoComponent navigation={this.props.navigation} permission={3} entrance = '专家分析' />
                {this._lineUI()}
                {this._liveRoomUI()}
                {this._lineUI()}
            </View>
        )
    }
    _lineUI() {
        return (
            <View style={{ height: 8, width: baseStyle.width, backgroundColor: '#F6F6F6' }}></View>
        );
    }
    _liveRoomUI() {
        const hasClasss = this.state.classesData.length;
        return (
            <View ref={(v) => { this.liveRoomUI = v }} style={{ backgroundColor: '#fff', paddingLeft: 15, paddingRight: 15 }}>
                <TouchableOpacity style={{ flexDirection: 'row', height: 40, justifyContent: 'space-between', alignItems: 'center' }} activeOpacity={1} onPress={() => this.liveRoomOnClick()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 18, height: 18 }} source={require('../../images/JiePan/ic_jp_new_liveroom.png')} />
                        <Text style={{ fontSize: 20, color: '#000', marginLeft: 5, fontWeight: '900' }}>视频解盘</Text>
                        {
                            hasClasss ? <Text style={{ fontSize: 12, color: '#00000066', marginLeft: 5, marginBottom: -7 }}>{this.state.liveRoom_start + ' - ' + this.state.liveRoom_end}</Text>
                                : null
                        }
                    </View>
                    {
                        hasClasss ? <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -7 }}>
                            <Image style={{ height: 11, width: 11 }} source={this.state.liveRoom_status == '解盘中' ? livingroom_living : this.state.liveRoom_status == '未开始' ? livingroom_start : livingroom_end} />
                            <Text style={{ fontSize: 12, color: '#000000cc', marginLeft: 5 }}>{this.state.liveRoom_status}</Text>
                        </View> : null
                    }
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingBottom: 10 }} activeOpacity={1} onPress={() => this.liveRoomOnClick()}>
                    <ImageBackground style={{ alignItems: 'center', justifyContent: 'center', width: baseStyle.width - 30, height: 65, borderRadius: 5, overflow: 'hidden' }} source={require('../../images/JiePan/livingroom_bg.png')}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0)' }} numberOfLines={1}>股市密码早知道，大神今日来支招</Text>
                        {
                            hasClasss ?
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0)', marginTop: Platform.OS == 'ios' ? 10 : 5 }} numberOfLines={2}>{this.state.liveRoom_title}{" - " + this.state.liveRoom_nickname + '老师'}</Text>
                                : <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0)', marginTop: Platform.OS == 'ios' ? 10 : 5 }} numberOfLines={1}>慧选股视频解盘</Text>
                        }
                    </ImageBackground>
                </TouchableOpacity>

            </View>
        );
    }
    _viewpointLiveUI() {
        const permission = UserInfoUtil.getUserPermissions();
        const x = permission < 4 ? VIEW_POINT_FILTER_CONDITION_1 : VIEW_POINT_FILTER_CONDITION_2;
        return (
            <ContentListView header={this._renderHeader()} navigation={this.props.navigation} filterCondition={x} showFooter={true} />
        )
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
                {this._viewpointLiveUI()}
            </View>
        );
    }
}

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    stateUserIMMessage: state.UserIMReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    }), null, { forwardRef: true }
)(ExpertsAnalysis)
