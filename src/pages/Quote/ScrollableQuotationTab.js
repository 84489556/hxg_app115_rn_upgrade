"use strict";

import React, { Component } from "react";
import {
  Text,
  ScrollView,
  View,
  Image,
  DeviceEventEmitter,
  Platform,
  TouchableOpacity,
  InteractionManager, StatusBar
} from "react-native";
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../components/SensorsDataTool";
import AsyncStorage from '@react-native-community/async-storage';
import Toast from "react-native-easy-toast";
import ScrollableTabView from "react-native-scrollable-tab-view";
import * as baseStyle from "../../components/baseStyle.js";
import { HuShenPage } from "./HuShenPage.js";
import PersonalStocksTab from "./PersonalStocksTabs";
import YDSegmentedTab from '../../components/YDSegmentedTab';
import ShareSetting from "../../modules/ShareSetting";
import { connection } from "./YDYunConnection";
import { pushForParams } from "../../modules/NavigationInterface";
import Button from '../../components/Button.js';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import NetInfo from "@react-native-community/netinfo";

export class ScrollableQuotationTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTo: -1,
      tabLock: true,
      editTitle: "编辑"
    };
    global.currRoute_3 = "HS";
  }

  componentDidMount() {
    this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
    setTimeout(() => {
      this.tab.goToPage(1);
    }, 0);
  }

  componentWillUnmount() {
    this.netInfoSubscriber && this.netInfoSubscriber();
    this.pageToListener && this.pageToListener.remove();
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

  getNoContentHeight() {
    let h = 200;

    if (ShareSetting.getDeviceWidthPX() == 1440) {
      h = 540;
    } else if (ShareSetting.getDeviceWidthPX() == 1080) {
      h = 490;
    } else if (ShareSetting.getDeviceWidthPX() == 720) {
      h = 490;
    }
    return h;
  }

  _onPressSearchBtn() {
    InteractionManager.runAfterInteractions(() => {
      pushForParams(this.props.navigation, "SearchPage", { entrance: '看势首页' });
    });
    sensorsDataClickObject.searchClick.entrance = '看势首页'
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick)
  }

  _onPressEditBtn(data) {
    const { personalStockData } = this.props.statePersonalStocks;
    // console.log('自选股_onPressEditBtn_personalStockData'+JSON.stringify(personalStockData));
    if (personalStockData.length > 0) {
      data = personalStockData.slice(0);
    }
    // console.log('自选股_onPressEditBtn'+JSON.stringify(data));
    if (this.state.editTitle === "编辑") {
      pushForParams(this.props.navigation, "EditPersonalStockPage", {
        data: data,
        toastFunc: this.toastCallback.bind(this)
      });
    } else {
      this.setState({ editTitle: "编辑" });
      //通知取消编辑
      DeviceEventEmitter.emit("cancelEditStock");
    }
  }

  toastCallback(str) {
    this.refs.toast && this.refs.toast.show(str);
  }

  /**
   * tab改变时的回调
   * */
  tabChangge(selectIndex) {
    this.tab.goToPage(selectIndex)
    switch (selectIndex) {
      case 0:
        BuriedpointUtils.setItemByPosition(["kanshi", "zixuangu"]);
        this.sensorsAppear("自选股")
        break;
      case 1:
        BuriedpointUtils.setItemByPosition(["kanshi", "hushen"]);
        this.sensorsAppear("沪深")
        break;
    }
  }

  sensorsAppear(label) {
    sensorsDataClickObject.adLabel.first_label = label;
    sensorsDataClickObject.adLabel.label_level = 1;
    sensorsDataClickObject.adLabel.label_name = label;
    sensorsDataClickObject.adLabel.page_source = '看势';
    sensorsDataClickObject.adLabel.is_pay = '免费';
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel);


    sensorsDataClickObject.adModule.module_type = '看势';
    sensorsDataClickObject.adModule.module_name = label;
    sensorsDataClickObject.adModule.entrance = '';
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
  }

  render() {
    let quoteNoContentHeight = this.getNoContentHeight();
    let PersonalStocksListStyle = { height: quoteNoContentHeight };
    const { personalStockData } = this.props.statePersonalStocks;
    let data;
    if (personalStockData.length > 0) {
      PersonalStocksListStyle = {};
      data = personalStockData.slice(0);
    }

    let topbarHeight = Platform.OS == "ios" ? 20 : IsNotch ? 44 : 27

    return (
      <View style={{ flex: 1 }}>
        {Platform.OS === 'ios' ?
          <View style={{ height: baseStyle.isIPhoneX ? 44 : 20, width: baseStyle.width }} /> :
          <View style={{ height: StatusBar.currentHeight, width: baseStyle.width }} />}

        <ScrollableTabView
          locked={this.state.tabLock}
          scrollWithoutAnimation={true}
          initialPage={1}
          // tabBarUnderlineHeight={0}
          // tabBarBackgroundColor={baseStyle.WHITE}
          // tabBarActiveBackgroundColor={baseStyle.WHITE}
          // tabBarActiveTextColor={baseStyle.BLUE_HIGH_LIGHT}
          // tabBarActiveBorderRadius={3}
          // tabBarInactiveTextColor={baseStyle.BLACK}
          ref={tab => (this.tab = tab)}
          onChangeTab={obj => {
            let position = obj.i;
            if (obj.i == this.state.pageTo) return;

            if (position == 0) {
              let value = "自选";
              global.currRoute_3 = "ZX";
              DeviceEventEmitter.emit("ZS_ISREGISTER", false);
              DeviceEventEmitter.emit("ZX_ISREGISTER", true);
              // DeviceEventEmitter.emit("pageName", value);
              AsyncStorage.setItem("HANGQING", value);
              this.setState({ pageTo: 0 });

            } else if (position == 1) {
              let value = "沪深";
              global.currRoute_3 = "HS";
              DeviceEventEmitter.emit("ZS_ISREGISTER", true);
              DeviceEventEmitter.emit("ZX_ISREGISTER", false);
              // DeviceEventEmitter.emit("pageName", value);
              AsyncStorage.setItem("HANGQING", value);
              this.setState({ pageTo: 1 });
            }


          }}
          renderTabBar={() =>

            <YDSegmentedTab
              style={{
                textAlign: "center",
                alignItems: "center",
                justifyContent: "center"
              }}
              onChangeTabs={(index) => { this.tabChangge(index) }}
              tabNames={["自选股", "沪深"]}
            />

          }
        >
          <View style={{ flex: 1 }} tabLabel="自选">
            <View style={[PersonalStocksListStyle, { flex: 1 }]}>
              <PersonalStocksTab
                navigation={this.props.navigation}
                editButton={isEdit => {
                  this.setState({ editTitle: isEdit ? "编辑" : "取消" });
                }}
              />
            </View>
          </View>
          <ScrollView tabLabel="沪深">
            <View>
              <HuShenPage
                navigation={this.props.navigation}
                onSuccessScroll={lock => {
                  this.setTabLock(lock);
                }}
              />
            </View>
          </ScrollView>
        </ScrollableTabView>

        {/*自选股编辑页*/}
        {this.state.pageTo === 0 && personalStockData.length > 0 ? (
          <View
            style={{
              backgroundColor: "white",
              position: "absolute",
              left: 15,
              height: 44,
              top: IsNotch ? ShareSetting.getStatusBarHeightDP() : ShareSetting.getStatusBarHeightDP(),
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Button onPress={this._onPressEditBtn.bind(this, data)}>
              <Text
                style={{
                  height: Platform.OS == "ios" ? 25 : 30,
                  marginTop: 15,
                  marginBottom: 15,
                  fontSize: 15,
                  color: '#00000066'
                }}
              >
                {this.state.editTitle}
              </Text>
            </Button>
          </View>
        ) : null}

        <View
          style={{
            position: "absolute",
            right: 15,
            height: 18, width: 18,
            top: ShareSetting.getStatusBarHeightDP() + 18,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <TouchableOpacity
            hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
            onPress={() => this._onPressSearchBtn()}>
            <Image source={require('../../images/icons/cy_search_gray.png')} />
          </TouchableOpacity>
        </View>

        <Toast position={"center"} ref="toast" />

      </View>
    );
  }

  // 设置ScrollableTabView滑动
  setTabLock(lock) {
    this.setState({ tabLock: lock });
  }
}


import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import UserInfoUtil from "../../utils/UserInfoUtil";


export default connect(
  state => ({
    statePersonalStocks: state.PersonalStocksTabReducer
  }),
  dispatch => ({})
)(ScrollableQuotationTab);
