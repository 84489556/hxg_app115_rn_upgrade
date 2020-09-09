/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description: 打榜高管交易榜第二层tab顶部切换中间件(删除)
 * description: 打榜高管交易榜1.02版本修改成为一个单独的页面了，现在页面直接修改
 *              跳转请调用( Navigation.pushForParams(this.props.navigation, 'HitsTopNavigator', {gotoPage:0});)
 *              gotoPage 为跳转Page的Index
 *
 */
import React, {Component} from 'react';
import * as ScreenUtil from '../../utils/ScreenUtil';

import NewDealPage from './ExecutiveTrading/NewDealpage';
import FocusBuy from './ExecutiveTrading/FocusBuy';
import ContinueBuy from './ExecutiveTrading/ContinueBuy';
import MarketCensus from './ExecutiveTrading/MarketCensus';
import IndustryCensus from './ExecutiveTrading/IndustryCensus';
import {Platform, StyleSheet} from "react-native";

import ScrollableTabView ,{ScrollableTabBar} from "react-native-scrollable-tab-view";
import BaseComponentPage from "../BaseComponentPage";
import NavigationTitleView from "../../components/NavigationTitleView";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";

export default class HitsTopNavigator extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {};
        this.pageIndex = this.props.navigation.state.params.gotoPage ? this.props.navigation.state.params.gotoPage: 0;
    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            this.tabChangge(this.pageIndex);
        });
    }
    /**
     * 页面将要加载
     * */

    componentWillUnmount(){
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    render() {
        return (
            <BaseComponentPage style={styles.container}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"高管交易榜"} noDivider={true}/>
            <ScrollableTabView
                tabLabel='特色指标选股'
                //ref={ref => (this.hitsTopNavigator = ref)}
                style={{backgroundColor: 'white' ,flex:1}}
                initialPage={this.pageIndex}
                locked={true}
                tabBarUnderlineStyle={{height:0}}
                tabBarActiveTextColor={"#F92400"}
                onChangeTab={(index)=>{this.tabChangge(index.i)}}
                tabBarInactiveTextColor={'#999999'}
                renderTabBar={() =>
                    <ScrollableTabBar  tabStyle={styles.tabStyles} style={{height:ScreenUtil.scaleSizeW(60),borderBottomColor:"#f6f6f6"}}/>
                }>
                <NewDealPage tabLabel='最新交易'  navigation={this.props.navigation}/>
                <FocusBuy tabLabel='集中买入' navigation={this.props.navigation}/>
                <ContinueBuy tabLabel='持续买入' navigation={this.props.navigation}/>
                <MarketCensus tabLabel='市场统计' navigation={this.props.navigation}/>
                <IndustryCensus tabLabel='行业统计' navigation={this.props.navigation}/>

            </ScrollableTabView>
            </BaseComponentPage>
        )
    }
    tabChangge(selectIndex){
        this.pageIndex = selectIndex;
        //增加页面埋点统计的记录
        switch (selectIndex) {
            case 0:
                this.sensorsAppear('最新交易');
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zuixinjiaoyi);
                break;
            case 1:
                this.sensorsAppear('集中买入');
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.jizhongmairu);
                break;
            case 2:
                this.sensorsAppear('持续买入');
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.chixumairu);
                break;
            case 3:
                this.sensorsAppear('市场统计');
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.shichangtongji);
                break;
            case 4:
                this.sensorsAppear('行业统计');
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.hangyetongji);
                break;
        }

    }


    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = '高管交易榜'
        sensorsDataClickObject.adLabel.second_label = label;
        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.module_source = '打榜'
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.page_source = '高管交易榜';
        sensorsDataClickObject.adLabel.is_pay = '主力决策';
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
