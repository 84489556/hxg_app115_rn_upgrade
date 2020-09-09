/*
 * @Author: lishuai
 * @Date: 2019-08-09 13:16:51
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-05-22 11:37:26
 * 多空决策、风口决策、主力决策 精品讲堂 组件
 */
import React, { Component } from 'react';
import { Image, ImageBackground, Platform, Text, TouchableOpacity, View } from 'react-native';
import { time } from '../../actions/UserInfoAction';
import * as baseStyle from '../../components/baseStyle';
import { toast } from '../../utils/CommonUtils';
import UserInfoUtil from '../../utils/UserInfoUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import {sensorsDataClickActionName, sensorsDataClickObject} from "../SensorsDataTool";

export default class DecisionLiveVideoComponent extends Component {
    constructor(props) {
        super(props);
        this.permission = this.props.permission;
        this.shiZhanRef = YdCloud().ref(MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiShiZhanJiePanKe/');
        this.state = {
            zhuanShuKeData: { status: 0 }, // 专属课数据, 初始化状态为未开始
            shiZhanKeData: { status: 0 }, // 实战解盘课数据, 初始化状态为未开始
        }
    }
    componentDidMount() {
        this._loadData();
        sensorsDataClickObject.videoPlay.entrance = this.props.entrance || ''
    }
    componentWillUnmount() {
        this.zhuanShuKeRef && this.zhuanShuKeRef.off('value');
        this.shiZhanRef && this.shiZhanRef.off('value');
    }
    _loadData() {
        if (this.props.permission == 5) {
            let serverTimestamp = 0;
            time((time) => {
                serverTimestamp = time;
                let date = new Date();
                date.setTime(serverTimestamp * 1000);
                // 获取周期
                const dayOfWeek = date.getDay();
                // 周一、周三获取风口决策，周二、周四获取主力决策
                if (dayOfWeek == 1 || dayOfWeek == 3) {
                    this.permission = 4;
                }
                this.fetchData();
            });
        } else {
            this.fetchData();
        }
    }
    fetchData() {
        this.fetchZhuanShuKeData();
        this.fetchShiZhanKeData();
        this.zhuanShuKeRef && this.zhuanShuKeRef.on('value', snap => {
            if (snap.code == 0) {
                this.fetchZhuanShuKeData();
            }
        });
        this.shiZhanRef && this.shiZhanRef.on('value', snap => {
            if (snap.code == 0) {
                this.fetchShiZhanKeData();
            }
        });
    }
    fetchZhuanShuKeData() {
        // this.zhuanShuKeRef = YdCloud().ref(MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/JueCeZhuanShuKe/' + this.permission);
        this.zhuanShuKeRef = YdCloud().ref(MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiJueCeZhuanShuKe/' + this.permission);
        this.zhuanShuKeRef && this.zhuanShuKeRef.orderByKey().limitToLast(1).get(snap => {
            if (snap.code == 0) {
                const values = Object.values(snap.nodeContent);
                values[0].key = Object.keys(snap.nodeContent)[0];
                this.setState({ zhuanShuKeData: values[0] });
            } else {
                // toast(snap.msg);
            }
        });
    }
    fetchShiZhanKeData() {
        this.shiZhanRef && this.shiZhanRef.orderByKey().limitToLast(1).get(snap => {
            if (snap.code == 0) {
                const values = Object.values(snap.nodeContent);
                values[0].key = Object.keys(snap.nodeContent)[0];
                this.setState({ shiZhanKeData: values[0] });
            } else {
                // toast(snap.msg);
            }
        });
    }

    render() {
        let type = '';
        if (this.permission == 3) {
            type = '多空决策专属课';//多空决策专属课只有3星用户能看到，唯一入口观点-专家分析-多空决策专属课
        } else if (this.permission == 4) {
            type = '风口决策专属课';
        } else if (this.permission == 5) {
            type = '主力决策专属课';
        }
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require('../../images/MainDecesion/main_decision_opinion_living_small_icon.png')} />
                    <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '900' }}>精品讲堂</Text>
                </View>
                <View style={{ height: 1, backgroundColor: '#0000001A' }}></View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingLeft: 8, paddingRight: 8, paddingTop: 15, paddingBottom: 10 }}>
                    {<LiveVideoComponent navigation={this.props.navigation} type={type} data={this.state.zhuanShuKeData} permission={this.props.permission} />}
                    {<LiveVideoComponent navigation={this.props.navigation} type={'实战解盘课'} data={this.state.shiZhanKeData} permission={this.props.permission} />}
                </View>
            </View>
        )
    }
}

export class LiveVideoComponent extends Component {

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
    _itemOnClick(type) {

        sensorsDataClickObject.adModule.module_type = '观点';
        sensorsDataClickObject.adModule.module_name =type;
        sensorsDataClickObject.videoPlay.class_type = type
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule,'',false)

        let permission = UserInfoUtil.getUserPermissions();
        if (permission == 0) {
            sensorsDataClickObject.loginButtonClick.entrance = type
            Navigation.pushForParams(this.props.navigation, "LoginPage", {
                callBack: () => {
                    permission = UserInfoUtil.getUserPermissions();
                    if (permission >= 3) {
                        if (this.props.data.status == 0) {
                            toast('未开始');
                        } else if (this.props.data.status == 2) {
                            toast('解盘文件上传中');
                        } else {
                            Navigation.navigateForParams(this.props.navigation, 'JiePanVideoDetailPage', { type: this.props.type, key: this.props.data.key });
                        }
                    } else if (permission == 1) {
                        Navigation.navigateForParams(this.props.navigation, 'MarketingDetailPage', {
                            permissions: 3,
                            type: 'FuFeiYingXiaoYe',
                            callBack: () => { }
                        });
                    }
                }
            });
        } else if (permission == 1) {
            Navigation.navigateForParams(this.props.navigation, 'MarketingDetailPage', {
                permissions: 3,
                type: 'FuFeiYingXiaoYe',
                callBack: () => { }
            });
        } else {
            if (this.props.data.status == 0) {
                toast('未开始');
            } else if (this.props.data.status == 2) {
                toast('解盘文件上传中');
            } else {
                Navigation.navigateForParams(this.props.navigation, 'JiePanVideoDetailPage', { type: this.props.type, key: this.props.data.key });
            }
        }
    }
    historyListOnClick() {
        let permission = UserInfoUtil.getUserPermissions();
        if (permission == 0) {
            Navigation.pushForParams(this.props.navigation, "LoginPage", {
                callBack: () => {
                    permission = UserInfoUtil.getUserPermissions();
                    if (permission >= 3) {
                        Navigation.navigateForParams(this.props.navigation, 'JiePanHistoryListPage', { type: this.props.type })
                    } else if (permission == 1) {
                        Navigation.navigateForParams(this.props.navigation, 'MarketingDetailPage', {
                            permissions: 3,
                            type: 'FuFeiYingXiaoYe',
                            callBack: () => { }
                        });
                    }
                }
            });
        } else if (permission == 1) {
            Navigation.navigateForParams(this.props.navigation, 'MarketingDetailPage', {
                permissions: 3,
                type: 'FuFeiYingXiaoYe',
                callBack: () => { }
            });
        } else {
            if (this.props.type == '实战解盘课') {
                this.sensorsAppear('往期回顾','实战解盘往期回顾');
                Navigation.navigateForParams(this.props.navigation, 'JiePanHistoryListPage', { type: this.props.type })
                sensorsDataClickObject.videoPlay.class_type = this.props.type
                return;
            }
            let type = '', selectedType = '';
            if (this.props.permission == 3) {
                type = '多空决策专属课';
            } else if (this.props.permission == 4) {
                type = '风口决策专属课';
            } else if (this.props.permission == 5) {
                type = '主力决策专属课';
                selectedType = this.props.type == '风口决策专属课' ? '风口决策专属课' : '主力决策专属课';
            }
            this.sensorsAppear('往期回顾', type)
            Navigation.navigateForParams(this.props.navigation, 'JiePanHistoryListPage', { type: type, selectedType: selectedType })
            sensorsDataClickObject.videoPlay.class_type = type
        }
    }

    sensorsAppear(source,name) {
        sensorsDataClickObject.addOnClick.page_source = source;
        sensorsDataClickObject.addOnClick.content_name = name;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick);

    }


    render() {
        let itemWidth = (baseStyle.width - 15 * 2 - 8) / 2;
        let bgImgSrc;
        if (this.props.type == '多空决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/duo_kong_decision_exclusive_bg.png');
        } else if (this.props.type == '风口决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/feng_kou_decision_exclusive_bg.png');
        } else if (this.props.type == '主力决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/main_decision_exclusive_bg.png');
        } else if (this.props.type == '实战解盘课') {
            bgImgSrc = require('../../images/MainDecesion/practical_solution_bg.png');
        }
        let liveStateImg, livestateText;
        if (this.props.data.status == 0) {
            liveStateImg = require('../../images/icons/decision_live_state_not_start_icon.png');
            livestateText = '未开始';
        } else if (this.props.data.status == 1) {
            liveStateImg = require('../../images/icons/decision_live_state_living_icon.png');
            livestateText = '解盘中';
        } else if (this.props.data.status == 2) {
            liveStateImg = require('../../images/icons/decision_live_state_uploading_icon.png');
            livestateText = '解盘文件上传中';
        } else if (this.props.data.status == 3) {
            liveStateImg = require('../../images/icons/decision_live_state_playback_icon.png');
            livestateText = this._millisecondToDate(this.props.data.times);
        } else {
            liveStateImg = require('../../images/icons/decision_live_state_not_start_icon.png');
            livestateText = '未开始';
        }
        return (
            <View>
                <TouchableOpacity style={{ width: itemWidth, borderRadius: 5, overflow: 'hidden' }} activeOpacity={1} onPress={() => this._itemOnClick(this.props.type)}>
                    <ImageBackground style={{ height: itemWidth * 0.374, width: itemWidth, borderTopLeftRadius: 5, borderTopRightRadius: 5, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-end' }}
                        resizeMode={'stretch'}
                        source={bgImgSrc}>
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 5, paddingTop: 3, paddingBottom: 3 }}>
                            <Image style={{ width: 14, height: 14 }} source={liveStateImg}></Image>
                            <Text style={{ fontSize: 12, color: '#ffffff', marginLeft: 5 }}>{livestateText}</Text>
                        </View>
                    </ImageBackground>
                    <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftColor: '#0000001a', borderRightColor: '#0000001a', borderLeftWidth: 1, borderRightWidth: 1, padding: 10 }}>
                        <Text style={{ color: '#00000066', fontSize: 12 }}>{this.props.data.updateTime ? this.props.data.updateTime.substring(0, 10) : '--'}</Text>
                        <Text style={{ color: '#000000cc', fontSize: 12, marginTop: Platform.OS == 'ios' ? 5 : 0 }}>{this.props.type}</Text>
                    </View>
                    <TouchableOpacity style={{ height: 36, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#0000001a', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} activeOpacity={1} onPress={() => this.historyListOnClick()}>
                        <Image style={{ width: 15, height: 15 }} source={require('../../images/MainDecesion/main_decision_video_history_icon.png')}></Image>
                        <Text style={{ fontSize: 12, color: '#0099FF', marginLeft: 5 }} >往期回顾</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
        );
    }
}
