/*
 * @Author: lishuai
 * @Date: 2019-08-09 11:53:06
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-05-22 11:06:58
 */

import React, { Component } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import ContentListView, { VIEW_POINT_FILTER_CONDITION_3, VIEW_POINT_FILTER_CONDITION_4 } from '../../pages/Listen/ContentListView';
import UserInfoUtil from '../../utils/UserInfoUtil';
import {sensorsDataClickActionName, sensorsDataClickObject} from "../SensorsDataTool";

/// 风口决策、主力决策观点直播组件
export default class DecisionOpinionLivingComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selected_day: ''
        };
    }

    _moreBtnOnClick() {

        sensorsDataClickObject.adModule.entrance = this.props.entrance
        sensorsDataClickObject.adModule.module_name = '观点直播'
        sensorsDataClickObject.adModule.module_type = '观点';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)


        const permission = UserInfoUtil.getUserPermissions();
        let x = permission == 4 ? VIEW_POINT_FILTER_CONDITION_3 : VIEW_POINT_FILTER_CONDITION_4;
        Navigation.pushForParams(this.props.navigation, 'OpinionLivingPage', { filterCondition: x });
    }
    render() {
        const day = this.state.selected_day;
        const date = day.length >= 8 ? day.slice(0, 4) + '-' + day.slice(4, 6) + '-' + day.slice(6, 8) : '';
        const permission = UserInfoUtil.getUserPermissions();
        const x = permission == 4 ? VIEW_POINT_FILTER_CONDITION_3 : VIEW_POINT_FILTER_CONDITION_4;
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require('../../images/MainDecesion/main_decision_opinion_living_small_icon.png')} />
                        <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '900' }}>观点直播</Text>
                        <Text style={{ fontSize: 12, color: '#999999', marginLeft: 6, marginBottom: -7 }}>{date}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._moreBtnOnClick()}>
                        <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 1, backgroundColor: '#0000001A' }}></View>
                <ContentListView
                    navigation={this.props.navigation}
                    filterCondition={x}
                    limit={1}
                    showBtn={1}
                    calendarDataCallback={(selected_day) => {
                        this.setState({ selected_day: selected_day });
                    }} />
            </View>
        );
    }
}
