/*
 * @Author: lishuai
 * @Date: 2019-08-12 09:50:40
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-11-21 13:35:20
 * 龙虎榜页面
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from "react-native-scrollable-tab-view";
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as ScreenUtil from '../../utils/ScreenUtil';
import LatestLongHuBangPage from './LatestLongHuBangPage';
import LongHuPasswordPage from './LongHuPasswordPage';
import MechanismWeightWarehousePage from './MechanismWeightWarehousePage';
import YouZiTuPuPage from './YouZiTuPuPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import {sensorsDataClickObject} from "../../components/SensorsDataTool";
import {sensorsDataClickActionName} from "../../components/SensorsDataTool";
export default class LongHuBangPage extends BaseComponentPage {

    constructor(props) {
        super(props);

        this.state = {
        };
        this.initialPage = this.props.navigation.state.params.selectedIndex;
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            // this.tabChangge(this.initialPage);
        });
    }
    componentWillUnmount(){
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    render() {
        let initialPage = this.props.navigation.state.params.selectedIndex;
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'龙虎榜'} noDivider={true} />
                <ScrollableTabView
                    style={{ backgroundColor: 'white', flex: 1 }}
                    initialPage={initialPage}
                    locked={false}
                    tabBarUnderlineStyle={{ height: 0 }}
                    tabBarActiveTextColor={'#F92400'}
                    onChangeTab={(index)=>{this.tabChangge(index.i)}}
                    tabBarInactiveTextColor={'#999999'}
                    renderTabBar={() =>
                        <DefaultTabBar tabStyle={styles.tabStyles} style={{ height: ScreenUtil.scaleSizeW(60), borderBottomColor: '#f6f6f6' }} />
                    }>
                    <LatestLongHuBangPage tabLabel='最新龙虎榜' navigation={this.props.navigation} />
                    <LongHuPasswordPage tabLabel='龙虎密码' navigation={this.props.navigation} />
                    <YouZiTuPuPage tabLabel='游资图谱' navigation={this.props.navigation} />
                    <MechanismWeightWarehousePage tabLabel='机构重仓' navigation={this.props.navigation} />
                </ScrollableTabView>
            </BaseComponentPage>
        )
    }
    tabChangge(selectIndex){
        this.initialPage = selectIndex;
        //增加页面埋点统计的记录
        switch (selectIndex) {
            case 0:
                this.sensorsAppear('最新龙虎榜')
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zuixinlonghubang);
                break;
            case 1:
                this.sensorsAppear('龙虎密码')
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.longhumima);
                break;
            case 2:
                this.sensorsAppear('游资图谱')
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.youzitupu);
                break;
            case 3:
                this.sensorsAppear('机构重仓')
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.jigouzhongcang);
                break;
        }

    }
    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = '龙虎榜';
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.second_label = label;

        sensorsDataClickObject.adLabel.page_source = '龙虎榜';
        sensorsDataClickObject.adLabel.module_source='打榜';

        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.is_pay = '主力决策';

        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }


}

const styles = StyleSheet.create({
    tabStyles: {
        height: ScreenUtil.scaleSizeW(60),
        paddingBottom: ScreenUtil.scaleSizeW(8)
    }
});
