/**
 * 听声主栏目
 **/

"use strict";

import React, { Component } from "react";
import { DeviceEventEmitter, Platform, StatusBar, StyleSheet, View } from "react-native";
import ScrollableTabView from "react-native-scrollable-tab-view";
import { connect } from "react-redux";
import * as baseStyle from "../../components/baseStyle";
import YDSegmentedTab from '../../components/YDSegmentedTab';
import UserInfoUtil from '../../utils/UserInfoUtil';
import HotFocusPage from '../TuyereDecision/HotFocusPage';
import { connection } from "../Quote/YDYunConnection";
import ExpertsAnalysis from "./ExpertsAnalysis";
import YDNews from "./YDNews";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import NetInfo from "@react-native-community/netinfo";
import { sensorsDataClickObject, sensorsDataClickActionName } from "../../components/SensorsDataTool";

class TingSheng extends Component {
  constructor(props) {
    super(props);
    this.tabIndex = 0;
    this.state = {
      pageTo: -1,
    };
  }

  componentDidMount() {
    this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
    this.logoutSuccessEmitter = DeviceEventEmitter.addListener('LOGOUT_SUCCESS', () => {
      // 退出登录后如果当前选中的是热点聚焦，则设置为默认的专家分析tab
      if (this.tabIndex == 1) {
        this.tabIndex = 0;
        this.myScrollTab.goToPage(0);
      }
    });
    this.subTabChangeListener = DeviceEventEmitter.addListener('ViewPointSubTabBarChanged', (obj) => {
      if (obj) {
        if (Platform.OS === 'ios') {
          //ios需要渲染完成后再跳转
          setTimeout(() => {
            this.myScrollTab.goToPage(obj);
          }, 100)
        } else {
          this.myScrollTab.goToPage(obj);
        }
      }
    });
  }

  componentWillUnmount() {
      this.netInfoSubscriber && this.netInfoSubscriber();
    this.pageToListener && this.pageToListener.remove();
    this.logoutSuccessEmitter && this.logoutSuccessEmitter.remove();
    this.subTabChangeListener && this.subTabChangeListener.remove();
  }

  //监听网络状态的改变
  handleConnectivityChange = status => {
    if (Platform.OS == "android") {
      if (status.type == "none") {
      } else if (status.type == "cellular") {
        connection.refresh();
        DeviceEventEmitter.emit("isRequestZSData");
        DeviceEventEmitter.emit("isRequestBlockData");
      } else if (status.type == "unknown") {
      } else if (status.type == "wifi") {
        connection.refresh();
        DeviceEventEmitter.emit("isRequestZSData");
        DeviceEventEmitter.emit("isRequestBlockData");
      } else {
      }
    } else {
      if (status.type == "none") {
      } else if (status.type == "cellular") {
        DeviceEventEmitter.emit("isRequestZSData");
        DeviceEventEmitter.emit("isRequestBlockData");
      } else if (status.type == "unknown") {
      } else if (status.type == "wifi") {
        DeviceEventEmitter.emit("isRequestZSData");
        DeviceEventEmitter.emit("isRequestBlockData");
      } else {
      }
    }
  };
  render() {
    let statusBarHeight = 0;
    if (Platform.OS == 'ios') {
      statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
    } else {
      statusBarHeight = StatusBar.currentHeight;
    }
    return (
      <View style={styles.container}>
        <View style={{ height: statusBarHeight, width: baseStyle.width }} />
        <ScrollableTabView
          ref={ref => (this.myScrollTab = ref)}
          style={{ backgroundColor: 'white' }}
          initialPage={this.tabIndex}
          locked={true}
          renderTabBar={() =>
            <YDSegmentedTab
              style={styles.scrollViewtab}
              tabNames={['专家分析', '热点聚焦', '资讯']}
              onChangeTabs={(index) => { this.tabChange(index) }}
            />
          }>
          <ExpertsAnalysis tabLabel='专家分析' navigation={this.props.navigation} isPushGD={this.props.isPushGD} />
          <HotFocusPage tabLabel='热点聚焦' navigation={this.props.navigation} />
          <YDNews tabLabel='资讯' navigation={this.props.navigation} />
        </ScrollableTabView>
      </View>
    );
  }
  tabChange(selectIndex) {
    this.tabIndex = selectIndex;
    if (selectIndex == 1) {
      let permissions = UserInfoUtil.getUserPermissions();
      if (permissions == 0) {
        sensorsDataClickObject.loginButtonClick.entrance = '热点聚焦'
        Navigation.pushForParams(this.props.navigation, "LoginPage", { callBack: () => { this.loginCallback(selectIndex) } })
      } else {
        this.myScrollTab.goToPage(selectIndex);
      }
    } else {
      this.myScrollTab.goToPage(selectIndex);
    }





    //增加页面埋点统计的记录
    switch (selectIndex) {
      case 0:
        this.sensorsAppear('专家分析')
        BuriedpointUtils.setItemByPosition(["guandian", "zhuanjiafenxi"]);
        break;
      case 1:
        this.sensorsAppear('热点聚焦')
        BuriedpointUtils.setItemByPosition(["guandian", "redianjujiao"]);
        break;
      case 2:
        this.sensorsAppear('资讯')
        BuriedpointUtils.setItemByPosition(["guandian", "zixun"]);
        break;
    }
  }


  sensorsAppear(label) {
    sensorsDataClickObject.adLabel.first_label = '观点';
    sensorsDataClickObject.adLabel.label_level = 1;
    sensorsDataClickObject.adLabel.label_name = label;
    sensorsDataClickObject.adLabel.page_source = '观点';
    sensorsDataClickObject.adLabel.module_source = '观点';
    if (label  === '热点聚焦'){
      sensorsDataClickObject.adLabel.is_pay = '多空决策';
    }

    if (label  === '专家分析'){
      sensorsDataClickObject.adLabel.is_pay = '';
    }
    else {
      sensorsDataClickObject.adLabel.is_pay = '免费';
    }

    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    sensorsDataClickObject.adModule.entrance = '观点';
    sensorsDataClickObject.adModule.module_name = label;
    sensorsDataClickObject.adModule.module_type = '观点'
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule, '', false)
  }



  //登录回调
  loginCallback(selectIndex) {
    let permissions = UserInfoUtil.getUserPermissions();
    if (permissions >= 1) {
      this.myScrollTab.goToPage(selectIndex)
    }
  }
  // 设置ScrollableTabView滑动
  setTabLock(lock) {
    this.setState({ tabLock: lock });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollViewtab: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // borderBottomColor: '#F1F1F1',
    // borderBottomWidth: 1
  }
});

export default connect(
  state => ({
    statePersonalStocks: state.PersonalStocksTabReducer
  }),
  dispatch => ({})
)(TingSheng);

