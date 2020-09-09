/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description: 机构调研第二层tab顶部切换中间件
 */
import React, {Component} from 'react';
import * as ScreenUtil from '../../utils/ScreenUtil';

import NewResearch from './Research/NewResearch';
import Consistently from './Research/Consistently';
import FocusIndustry from './Research/FocusIndustry';
import FocusStocks from './Research/FocusStocks';
import {StyleSheet} from "react-native";

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
        this.sensorsAppear('最新调研');
    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {


    }

    render() {
        return (
            <ScrollableTabView
                tabLabel='特色指标选股'
                style={{backgroundColor: 'white' ,flex:1}}
                initialPage={0}
                locked={true}
                tabBarUnderlineStyle={{height:0}}
                tabBarActiveTextColor={"#F92400"}
                tabBarInactiveTextColor={'#999999'}
                onChangeTab={(index)=>{this.tabChangge(index.i);}}
                renderTabBar={() =>
                    <DefaultTabBar tabStyle={styles.tabStyles} style={{height:ScreenUtil.scaleSizeW(60),borderBottomColor:"#f6f6f6"}}/>

                }>
                <NewResearch tabLabel='最新调研'  navigation={this.props.navigation}/>
                <Consistently tabLabel='一致看多' navigation={this.props.navigation}/>
                <FocusIndustry tabLabel='关注行业' navigation={this.props.navigation}/>
                <FocusStocks tabLabel='关注个股' navigation={this.props.navigation}/>

            </ScrollableTabView>
        )
    }
    /**
     * tab改变时的回调
     * */
    tabChangge(selectIndex){
        //增加页面埋点统计的记录
        switch (selectIndex) {
            case 0:
                this.sensorsAppear('最新调研');
                BuriedpointUtils.setItemByPosition(["dabang","jigoudiaoyan","zuixindiaoyan"]);
                break;
            case 1:
                this.sensorsAppear('一致多看');
                BuriedpointUtils.setItemByPosition(["dabang","jigoudiaoyan","yizhikanduo"]);
                break;
            case 2:
                this.sensorsAppear('关注行业');
                BuriedpointUtils.setItemByPosition(["dabang","jigoudiaoyan","guanzhuhangye"]);
                break;
            case 3:
                this.sensorsAppear('关注个股');
                BuriedpointUtils.setItemByPosition(["dabang","jigoudiaoyan","guanzhugegu"]);
                break;
        }
    }


    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.second_label = label;
        sensorsDataClickObject.adLabel.first_label = '机构调研';
        sensorsDataClickObject.adLabel.module_source = '机构调研';
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
