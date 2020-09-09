"use strict";

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
} from "react-native";

import ScrollableTabView ,{ScrollableTabBar} from "react-native-scrollable-tab-view";
import * as ScreenUtil from '../../utils/ScreenUtil';
import FinancialReport from "./FinancialReport"
import SelfSelected from "./SelfSelected"
import NewsFlash from "./NewsFlash"
import CompanyNews from "./CompanyNews"
import CompanyResearch from "./CompanyResearch"
import IndustryResearch from "./IndustryResearch"
import * as baseStyle from '../../components/baseStyle.js';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";


export default class YDNews extends Component {

  constructor(props) {
    super(props);
    this.sensorsAppear('财经报道');
    this.state = {
    };

  }

  render() {
    return (
        <ScrollableTabView
            style={{backgroundColor: 'white' ,flex:1}}
            initialPage={0}
            locked={true}
            tabBarUnderlineStyle={{backgroundColor:"#F92400",height:0}}
            tabBarActiveTextColor={"#F92400"}
            tabBarInactiveTextColor={'#999999'}
            onChangeTab={(index)=>{this.tabChangge(index.i)}}
            renderTabBar={() =>
                <ScrollableTabBar tabStyle={styles.tabStyles} style={{height:ScreenUtil.scaleSizeW(60),borderBottomColor:"#f6f6f6"}}/>
            }>
            <FinancialReport tabLabel='财经报道'  navigation={this.props.navigation}/>
            <SelfSelected tabLabel='自选股' navigation={this.props.navigation}/>
            {/*<NewsFlash tabLabel='快讯' navigation={this.props.navigation}/>*/}
            <CompanyNews tabLabel='公司新闻' navigation={this.props.navigation}/>
            <CompanyResearch tabLabel='公司研究' navigation={this.props.navigation}/>
            <IndustryResearch tabLabel='行业研究' navigation={this.props.navigation}/>

        </ScrollableTabView>
    )
  }
    tabChangge(selectIndex){
          //  BuriedpointUtils.setItemByPosition(["guandian","zixun","kuaixun"]);20200709快讯页签删除
        //增加页面埋点统计的记录
        switch (selectIndex) {
            case 0:
                this.sensorsAppear('财经报道');
                BuriedpointUtils.setItemByPosition(["guandian","zixun","caijingbaodao"]);
                break;
            case 1:
                this.sensorsAppear('自选股');
                BuriedpointUtils.setItemByPosition(["guandian","zixun","zixuangu"]);
                break;
            case 2:
                BuriedpointUtils.setItemByPosition(["guandian","zixun","gongsixinwen"]);
                this.sensorsAppear('公司新闻');
                break;
            case 3:
                BuriedpointUtils.setItemByPosition(["guandian","zixun","gongsiyanjiu"]);
                this.sensorsAppear('公司研究');
                break;
            case 4:
                this.sensorsAppear('行业研究');
                BuriedpointUtils.setItemByPosition(["guandian","zixun","hangyeyanjiu"]);
                break;
        }

    }
  sensorsAppear(label) {
    sensorsDataClickObject.adLabel.first_label = '资讯';
    sensorsDataClickObject.adLabel.second_label = label;
    sensorsDataClickObject.adLabel.label_level = 2;
    sensorsDataClickObject.adLabel.label_name = label;
    sensorsDataClickObject.adLabel.page_source = '观点';
    sensorsDataClickObject.adLabel.module_source = '观点';
    sensorsDataClickObject.adLabel.is_pay = '免费';
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
  }

}

const styles = StyleSheet.create({
  container: {
      flex:1
  },
  tabStyles:{
      height: ScreenUtil.scaleSizeW(60),
      paddingBottom:ScreenUtil.scaleSizeW(8)
  },
});
