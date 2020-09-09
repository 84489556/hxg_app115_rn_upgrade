/*
 * @Author: lishuai 
 * @Date: 2019-09-09 14:35:34 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-05-22 11:38:14
 * 多空决策、风口决策、主力决策、实战解盘视频往期列表
 */
import React from 'react';
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { LargeList } from 'react-native-largelist-v3';
import ScrollableTabView from "react-native-scrollable-tab-view";
import * as baseStyle from '../../components/baseStyle';
import NavigationTitleView from '../../components/NavigationTitleView';
import YDSegmentedTab from '../../components/YDSegmentedTab';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import YdCloud from '../../wilddog/Yd_cloud';
//只是Android 使用
import FastImage from 'react-native-fast-image'
import { sensorsDataClickObject } from '../../components/SensorsDataTool';
import {mRiskTipsFooter} from "../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../components/RiskTipsFooterView";

export default class HistoryListPage extends BaseComponentPage {

    renderNavigationBarBackView() {
        let statusBarHeight = 0;
        if (Platform.OS == 'ios') {
            statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
        } else {
            statusBarHeight = StatusBar.currentHeight;
        }
        return (
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: statusBarHeight,
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: "center",
                }}
                activeOpacity={1}
                onPress={() => this.props.navigation.goBack()}
            >
                <Image
                    source={require('../../images/login/login_back.png')}
                    style={{
                        width: 12,
                        height: 44,
                        marginLeft: 10,
                        resizeMode: 'contain'
                    }}
                />
            </TouchableOpacity>
        )
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            let type = this.props.navigation.state.params.type;
            if (type == '主力决策专属课') {
                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.jueceshizhanjiepanwangqi);
            } else {
                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.shizhanjiepanwangqi);
            }

        });
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    render() {
        let type = this.props.navigation.state.params.type;
        if (type == '主力决策专属课') {
            return (
                <BaseComponentPage style={{ flex: 1 }}>
                    <ScrollableTabView
                        ref={ref => (this.myScrollTab = ref)}
                        style={{ backgroundColor: '#fff' }}
                        initialPage={this.props.navigation.state.params.selectedType == '主力决策专属课' ? 0 : 1}
                        renderTabBar={() =>
                            <YDSegmentedTab
                                style={{ alignItems: 'center', justifyContent: 'center' }}
                                tabNames={['主力决策往期', '风口决策往期']}
                            />
                        }>
                        <HistoryListContentPage tabLabel={'主力决策往期'} navigation={this.props.navigation} type={'主力决策专属课'} />
                        <HistoryListContentPage tabLabel={'风口决策往期'} navigation={this.props.navigation} type={'风口决策专属课'} />
                    </ScrollableTabView>
                    {this.renderNavigationBarBackView()}
                </BaseComponentPage >
            );
        } else {
            return (
                <BaseComponentPage style={{ flex: 1 }}>
                    <NavigationTitleView navigation={this.props.navigation} titleText={'往期回顾'} />
                    <HistoryListContentPage navigation={this.props.navigation} type={type} />
                </BaseComponentPage>
            );
        }
    }
}

export class HistoryListContentPage extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {
            data: [{ items: [] }],
            allLoaded: true,
        }
    }
    componentDidMount() {
        this._loadData();
    }
    _loadData() {
        YdCloud().ref(this._getYdCloudPath()).orderByKey().limitToLast(20).get(snap => {
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

                this.setState({ data: [{ items: filteredData }] });
            } else {
                // toast(snap.msg);
            }
        });
    }
    _getYdCloudPath() {
        if (this.props.type == '多空决策专属课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiJueCeZhuanShuKe/3';
        } else if (this.props.type == '风口决策专属课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiJueCeZhuanShuKe/4';
        } else if (this.props.type == '主力决策专属课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiJueCeZhuanShuKe/5';
        } else if (this.props.type == '实战解盘课') {
            return MainPathYG + 'ZhuanJiaFenXi/ZhiBoKeTangVideo/MaiShiShiZhanJiePanKe/';
        }
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
    //<Image style={{ width: baseStyle.width, height: baseStyle.width * 0.376 }} source={bgImgSrc}></Image>
    _renderItem = (path) => {
        const data = this.state.data[path.section].items[path.row];
        let bgImgSrc, title;
        if (this.props.type == '多空决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/duo_kong_decision_exclusive_bg.png');
            title = data.updateTime.substring(0, 10) + ' ' + '多空决策专属课';
        } else if (this.props.type == '风口决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/feng_kou_decision_exclusive_bg.png');
            title = data.updateTime.substring(0, 10) + ' ' + '风口决策专属课';
        } else if (this.props.type == '主力决策专属课') {
            bgImgSrc = require('../../images/MainDecesion/main_decision_exclusive_bg.png');
            title = data.updateTime.substring(0, 10) + ' ' + '主力决策专属课';
        } else if (this.props.type == '实战解盘课') {
            bgImgSrc = require('../../images/MainDecesion/practical_solution_bg.png');
            title = data.updateTime.substring(0, 10) + ' ' + '实战解盘课';
        }
        return (
            <View>
                <View style={{ backgroundColor: baseStyle.LINE_BG_F1, height: 8 }}></View>
                <TouchableOpacity activeOpacity={1} onPress={() => {
                    sensorsDataClickObject.videoPlay.class_name = title
                    sensorsDataClickObject.videoPlay.class_type = this.props.type
                    sensorsDataClickObject.videoPlay.publish_time = data && data.updateTime && data.updateTime.substring(0, 10)
                    Navigation.navigateForParams(this.props.navigation, 'JiePanVideoDetailPage', { type: this.props.type, key: data.key });
                }}>

                    {Platform.OS === 'ios' ?
                        <Image
                            style={{ width: baseStyle.width, height: baseStyle.width * 0.376}}
                            source={bgImgSrc}
                        />
                        :
                        <FastImage
                            style={{ width: baseStyle.width, height: baseStyle.width * 0.376}}
                            source={bgImgSrc}
                            //resizeMode={FastImage.resizeMode.stretch}
                        />
                    }
                    <View style={{ backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10 }}>
                        <Text style={{ fontSize: 15, color: '#333' }} numberOfLines={1}>{data.pubTime && data.pubTime.substring(0, 10)} {title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={{ width: 14, height: 14 }} source={require('../../images/icons/decision_live_state_playback_gray_icon.png')}></Image>
                            <Text style={{ marginLeft: 5, fontSize: 12, color: '#00000066' }}>{this._millisecondToDate(data.times)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    render() {
        if (!this.state.data[0].items.length) {
            return (
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Image style={{ marginTop: 66 }} source={require('../../images/livelession/view_point_empty_logo.png')}></Image>
                    <Text style={{ fontSize: 15, color: '#00000066', marginTop: 10 }}>暂无数据</Text>
                    <View style={{flex:1}}/>
                    <RiskTipsFooterView type={0}/>
                </View>
            )
        }
        return (
            <LargeList
                ref='list'
                style={{ backgroundColor: baseStyle.LINE_BG_F1, flex: 1 }}
                data={this.state.data}
                loadingFooter={mRiskTipsFooter}
                onLoading={() => { }}
                allLoaded={this.state.allLoaded}
                heightForIndexPath={() => baseStyle.width * 0.376 + 45}
                renderIndexPath={this._renderItem}
                renderFooter={this._renderMyFooters}
                headerStickyEnabled={true}
            />
        );
    }

    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        // if((this.state.data && this.state.data[0].items.length === 0 )|| this.state.allLoaded === false){
        //     return <View><View></View></View>;
        // }else {
        //
        // }
        return(
            <View>
                <RiskTipsFooterView type={0}/>
            </View>
        )
    }
}