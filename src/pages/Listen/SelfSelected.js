/*
* 资讯--自选股
*/

"use strict";

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
} from "react-native";

import ScrollableTabView, {DefaultTabBar} from "react-native-scrollable-tab-view";
import YDSegmentedTab from '../../components/YDSegmentedTab';
import YDNewsBasePage from "./YDNewsBasePage"
import SelfSelectedNews from "./SelfSelectedNews"
import SelfSelectedAnnouncement from "./SelfSelectedAnnouncement"
import SelfSelectedResearchReport from "./SelfSelectedResearchReport"
import NewsWithoutData from './NewsWithoutPersonalStock'
import HomeTabBar from '../Quote/HomeTabBar'


class SelfSelected extends Component {
  constructor(props) {
    super(props);
    this.sensorsAppear('新闻')
    this.state = {

    };

  }

  getCodes() {
    // const { personalStockData } = this.props.statePersonalStocks;
    const { personStocks } = this.props.statePersonalStockList;
    let codes = [];

    for (let j = 0; j < personStocks.length; j++) {

      codes[j] = this.trimSHSZ(personStocks[j])

    }

    return codes.toString();
  }

  trimSHSZ(code) {
    var str = code.replace('SH', '');
    return str.replace('SZ', '')
  }

  render() {

    let strCodes = this.getCodes()

    if (strCodes.length<=0) {
      return <NewsWithoutData noticeText="很抱歉，目前没有添加自选股"/>
    }

    return (
      <View style={styles.container}>

        <ScrollableTabView
            style={{ backgroundColor: 'white' }}
            initialPage={0}


            onChangeTab={obj => {
              //业务逻辑 obj.i 标识第几个tab，从0开始
              if (obj.i === 0) {
                this.sensorsAppear('新闻')
              } else if (obj.i === 1) {
                this.sensorsAppear('公告')
              } else if (obj.i === 2) {
                this.sensorsAppear('研报')

              }
            }}



            locked={true}
            // renderTabBar={() =>
            //     <YDSegmentedTab
            //         style={styles.scrollViewtab}
            //         tabNames={['新闻', '公告', '研报']}
            //     />
            // }>
            renderTabBar={() => <HomeTabBar
              style={styles.scrollViewtab}
              tabStyle={{ width: 68, height: 28 }}
              tabNames={['新闻', '公告', '研报']}
          />}>
            <SelfSelectedNews tabLabel='新闻' navigation={this.props.navigation} stocks={strCodes} />
            <SelfSelectedAnnouncement tabLabel='公告' navigation={this.props.navigation} stocks={strCodes} />
            <SelfSelectedResearchReport tabLabel='研报' navigation={this.props.navigation} stocks={strCodes} />
        </ScrollableTabView>

      </View>
    )
  }


  sensorsAppear(label) {
    sensorsDataClickObject.adLabel.first_label = '资讯';
    sensorsDataClickObject.adLabel.second_label = '自选股';
    sensorsDataClickObject.adLabel.third_label = label;
    sensorsDataClickObject.adLabel.label_level = 3;
    sensorsDataClickObject.adLabel.label_name = label;
    sensorsDataClickObject.adLabel.module_source = '观点';
    sensorsDataClickObject.adLabel.page_source = '观点';
    sensorsDataClickObject.adLabel.is_pay = '免费';
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
  }


}

const styles = StyleSheet.create({
  container: {
      flex:1
  },
  scrollViewtab:{
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center'
  }
});

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AllActions from '../../actions/AllActions';
import { personStock } from "../../actions/UserInfoAction";
import { setPersonalStocks } from "../../actions/AllActions";
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";

export default connect((state) => ({
    statePersonalStocks: state.PersonalStocksTabReducer,
    statePersonalStockList: state.UserInfoReducer
}),
    (dispatch) => ({
        actions: bindActionCreators(AllActions, dispatch)
    })
)(SelfSelected)
