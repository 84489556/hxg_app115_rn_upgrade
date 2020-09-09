/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description: 特色指标选股第二层tab顶部切换中间件，（暂时没有用到）
 */
import React, {Component} from 'react';

import * as ScreenUtil from '../../utils/ScreenUtil';

import TargetSelectStock from './SpecialSelectStock/TargetSelectStock';
import ConstituteSelectStock from './SpecialSelectStock/ConstituteSelectStock';
import {StyleSheet} from "react-native";
import ScrollableTabView ,{ScrollableTabBar,DefaultTabBar} from "react-native-scrollable-tab-view";
import UserInfoUtil from "../../utils/UserInfoUtil";


export default class SpecialNavigator extends Component<Props> {

    constructor(props) {
        super(props);

        this.state = {

        }
    }
    /**
     * 页面将要加载
     * */
    componentWillMount(){

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
                renderTabBar={() =>
                    <DefaultTabBar  tabStyle={{ height: ScreenUtil.scaleSizeW(60),fontSize:ScreenUtil.scaleSizeW(10),paddingBottom:ScreenUtil.scaleSizeW(8),fontWeight:50 }} style={{height:ScreenUtil.scaleSizeW(60),borderBottomColor:"#f6f6f6"}}/>
                }>
                <TargetSelectStock tabLabel='指标选股'  navigation={this.props.navigation}/>
                <ConstituteSelectStock tabLabel='组合战法' navigation={this.props.navigation}/>

            </ScrollableTabView>
        )
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
    }
});


