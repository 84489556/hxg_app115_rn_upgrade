/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description: 涨停炸板第二层tab顶部切换中间件
 */
import React, {Component} from 'react';
import * as ScreenUtil from '../../utils/ScreenUtil';

import MarketSentiment from './Dailylimit/MarketSentiment';
import SectorAnalysis from './Dailylimit/SectorAnalysis';

import {DeviceEventEmitter, StyleSheet} from "react-native";

import ScrollableTabView ,{DefaultTabBar} from "react-native-scrollable-tab-view";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";


export default class SpecialNavigator extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {

        }
    }
    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {


    }
    //backgroundColor:"#F92400",
    render() {
        return (
            <ScrollableTabView
                tabLabel='特色指标选股'
                style={{backgroundColor: 'white' ,flex:1}}
                initialPage={0}
                locked={true}
              //  ref={ref => (this.mScrollableTabView = ref)}
                tabBarUnderlineStyle={{height:0}}
                tabBarActiveTextColor={"#F92400"}
                tabBarInactiveTextColor={'#999999'}
                onChangeTab={(index)=>{this.tabChangge(index.i);}}
                renderTabBar={() =>
                    <DefaultTabBar tabStyle={styles.tabStyles} style={{height:ScreenUtil.scaleSizeW(60),borderBottomColor:"#f6f6f6"}}/>
                }>
                <MarketSentiment tabLabel='市场情绪'  navigation={this.props.navigation}/>
                <SectorAnalysis tabLabel='板块分析' navigation={this.props.navigation}/>

            </ScrollableTabView>
        )
    }
    /**
     * tab改变时的回调
     * */
    tabChangge(selectIndex){
        //this.mScrollableTabView.goToPage(selectIndex)
        //增加页面埋点统计的记录
        switch (selectIndex) {
            case 0:
                this.sensorsAppear('市场情绪');
                BuriedpointUtils.setItemByPosition(["dabang","zhangtingzhaban","shichangqingxu"]);
                break;
            case 1:
                this.sensorsAppear('板块分析');
                BuriedpointUtils.setItemByPosition(["dabang","zhangtingzhaban","bankuaifenxi"]);
                break;
        }
    }



    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.module_source = '打榜';
        sensorsDataClickObject.adLabel.first_label = '涨停炸板';
        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.page_source = '打榜';
        sensorsDataClickObject.adLabel.is_pay = '免费';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }
    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        flex:1
    },
    tabStyles:{
        height: ScreenUtil.scaleSizeW(60),
        paddingBottom:ScreenUtil.scaleSizeW(8)
    }
});
