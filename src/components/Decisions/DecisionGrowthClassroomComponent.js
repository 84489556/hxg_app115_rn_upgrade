/*
 * @Author: lishuai 
 * @Date: 2019-08-09 13:25:09 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-05-22 11:06:17
 */

import React, { Component } from 'react';
import {Image, ImageBackground, Platform, Text, TouchableOpacity, View} from 'react-native';
import YdCloud from '../../wilddog/Yd_cloud';
import { sensorsDataClickObject } from '../SensorsDataTool';
import ShareSetting from '../../modules/ShareSetting';

//只是Android 使用
import FastImage from 'react-native-fast-image'
/// 主力决策、风口决策成长课堂组件
export default class DecisionGrowthClassroomComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            indexStudyData: null,
            strategyCourseData: null
        }
    }
    componentDidMount() {
        this._loadCourseData();
        sensorsDataClickObject.videoPlay.entrance = this.props.entrance
    }
    _loadCourseData() {
        YdCloud().ref(MainPathYG + 'ZhiBiaoKeTangAll/' + this.props.permission).orderByKey().limitToLast(1).get(snap => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                this.setState({ indexStudyData: values[0] });
            }
        });
        YdCloud().ref(MainPathYG + 'ChengZhangKeTangAll/' + this.props.permission).orderByKey().limitToLast(1).get(snap => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                this.setState({ strategyCourseData: values[0] });
            }
        });
    }
    moreBtnOnClick(type) {
        sensorsDataClickObject.videoPlay.class_type = type
        if (type == '指标学习') {
            sensorsDataClickObject.videoPlay.entrance = '指标学习列表'            
            Navigation.pushForParams(this.props.navigation, 'IndexStudyCoursePage');
        } else if (type == '策略课堂') {
            sensorsDataClickObject.videoPlay.entrance = '策略课堂列表'            
            Navigation.pushForParams(this.props.navigation, 'StrategyCoursePage');
        }
    }
    itemOnClick(item, type) {        
        sensorsDataClickObject.videoPlay.class_type = type
        sensorsDataClickObject.videoPlay.class_series = item.setsystem
        sensorsDataClickObject.videoPlay.class_name = item.title
        sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(item.createTime),'yyyy-MM-dd')        
        sensorsDataClickObject.videoPlay.class_name = item.title
        if (type == '指标学习') {
            let path = MainPathYG + 'ZhiBiaoKeTangAll/' + item.star + '/' + item.createTime;
            optionParams = { path: path, star: item.star, taoxiName: item.setsystem };                                    
            Navigation.pushForParams(this.props.navigation, 'CourseDetailPage', {
                key: item.createTime,
                type: 'IndexStudy',
                ...optionParams
            });            
        } else if (type == '策略课堂') {
            let path = MainPathYG + 'ChengZhangKeTangAll/' + item.star + '/' + item.createTime;
            optionParams = { path: path, star: item.star, taoxiName: item.setsystem };            
            Navigation.pushForParams(this.props.navigation, 'CourseDetailPage', {
                key: item.createTime,
                type: 'Strategy',
                ...optionParams
            });
        }
    }
    _renderItem(item) {
        const emptyTitle = this.props.permission == 5 ? '暂无最新主力决策课程' : '暂无最新风口决策课程';
        return (
            <View style={{ flex: 1, paddingTop: 10, paddingBottom: 10, paddingLeft: 15, paddingRight: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Image style={{ width: 96, height: 27 }} source={item.iconSrc} />
                    <TouchableOpacity onPress={() => this.moreBtnOnClick(item.type)} activeOpacity={1}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
                {
                    item.data ?
                        <TouchableOpacity style={{ paddingTop: 5 }} onPress={() => this.itemOnClick(item.data, item.type)} activeOpacity={1}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ fontSize: 15, color: '#000000CC' }}>{item.data && item.data.title}</Text>
                                    <Text style={{ paddingTop: 10, fontSize: 12, color: '#ff660099' }}>{item.data && item.data.like + '人已观看'}</Text>
                                </View>
                                <ImageBackground style={{ width: 80, height: 45, borderRadius: 10, overflow: 'hidden' }} source={require('../../images/icons/placeholder_bg_image.png')}>

                                    {Platform.OS === 'ios' ?
                                        <Image style={{ width: 80, height: 45 }} source={{ uri: item.data && item.data.cover_url }}></Image>
                                        :
                                        <FastImage
                                            style={{ width: 80, height: 45 }}
                                            source={{ uri: item.data && item.data.cover_url }}
                                        />
                                    }
                                </ImageBackground>
                            </View>
                        </TouchableOpacity>
                        :
                        <View style={{ height: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                            <View style={{ backgroundColor: '#3399FF1A', paddingLeft: 15, paddingRight: 15, height: 34, borderRadius: 34 / 2, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10, color: '#003366' }}>{emptyTitle}</Text>
                            </View>
                        </View>
                }
            </View>
        )
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Image style={{ width: 18, height: 18, marginLeft: 15 }} resizeMode={'cover'} source={require('../../images/MainDecesion/main_decision_growth_classroom_small_icon.png')} />
                    <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '900' }}>成长学堂</Text>
                </View>
                <View style={{ height: 1, backgroundColor: '#0000001A' }}></View>
                {this._renderItem({ type: '指标学习', iconSrc: require('../../images/icons/index_class_icon.png'), data: this.state.indexStudyData })}
                <View style={{ height: 1, backgroundColor: '#0000001A', marginLeft: 15, marginRight: 15 }}></View>
                {this._renderItem({ type: '策略课堂', iconSrc: require('../../images/icons/strategy_class_icon.png'), data: this.state.strategyCourseData })}
            </View>
        )
    }
}