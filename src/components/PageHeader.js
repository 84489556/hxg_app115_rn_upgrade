/**
 * 页面标题
 * Created by jiagang on 15/11/5.
 */
"use strict";

import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from "react-native";
import * as baseStyle from "./baseStyle.js";
import BaseComponent from "./BaseComponent.js";
import TabBar, { StaticTabBarItem } from "./TabBar.js";
import ShareSetting from "../modules/ShareSetting";
import * as ScreenUtil from "../utils/ScreenUtil";

export default class PageHeader extends BaseComponent {
  static defaultProps = {
    statusBarExist: false
  };

  styleSheet = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
        // backgroundColor:'#cd92ff'
        // fontSize: 16
    },
    title: {
      textAlign: "center",
      // color: baseStyle.HEADER_FONT_COLOR,
      fontSize: 17
    },
    rightComponent: {
      flexDirection: "row",
      // alignItems: 'center',
      fontSize: 16,
      // backgroundColor:'#cd92ff',
      marginRight: 15
    }
  });
  _renderBackButton() {
    return (
      typeof this.props.onBack === "function" && (
        <View style={[this.getStyles("backButton")]}>
          <TouchableOpacity
            hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
            onPress={this.props.onBack}
          >
            <Image
              source={require("../images/login/login_back.png")}
              style={{  width: 12, height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),resizeMode: 'contain', marginLeft: 15 }}
            />
          </TouchableOpacity>
        </View>
      )
    );
  }

  _renderTitle() {
    if (React.isValidElement(this.props.title)) {
      return this.props.title;
    } else if (typeof this.props.title === "function") {
      return this.props.title();
    } else if (typeof this.props.title === "string") {
      return (
        <Text
          style={[this.getStyles("title"), {  color: 'black', fontSize: ScreenUtil.setSpText(34), alignSelf: 'center', fontWeight:'bold', }]}
          numberOfLines={1}
        >
          {this.props.title}
        </Text>
      );
    }
  }

  _renderRightComponent() {
    return (
      <View style={this.getStyles("rightComponent")}>
        {this.props.rightComponent}
      </View>
    );
  }

  render() {
    // 防止两个statusBar占位
    let statusBarHeightDP = this.props.statusBarExist
      ? 0
      : ShareSetting.getStatusBarHeightDP();

    let verticalView = () => (
      <View
        style={[
          {
            backgroundColor: baseStyle.WHITE,
            height:
              Platform.OS == "ios"
                ? 44 + statusBarHeightDP
                : 48 + statusBarHeightDP,
            borderBottomColor: baseStyle.LINE_BG_F6,
            borderBottomWidth: 0,
            paddingTop:
              Platform.OS == "ios" ? statusBarHeightDP : statusBarHeightDP // statusBar填充
          },
          this.props.style
        ]}
      >
        <View
          style={[
            this.getStyles("container"),
            {
              borderBottomWidth: 1,
              borderBottomColor: "#rgba(0,0,0,0.1)"
            }
          ]}
        >
          <View
            style={{ flex: 3, justifyContent: "center", alignItems: "stretch" }}
          >
            {this._renderBackButton()}
          </View>
          <View
            style={{ flex: 9, justifyContent: "center", alignItems: "center" }}
          >
            {this._renderTitle()}
          </View>
          <View
            style={{ flex: 3, justifyContent: "center", alignItems: "stretch" }}
          >
            {this._renderRightComponent()}
          </View>
        </View>
      </View>
    );

    return <View>{verticalView()}</View>;
  }

  static statusBarView() {
    return <View />;
  }
}

export class HeaderTabBar extends BaseComponent {
  render() {
    return (
      <View
        style={[
          { alignItems: "center", justifyContent: "center" },
          this.props.style
        ]}
      >
        <TabBar
          cutLine={true}
          style={{
            tabBar: [
              {
                backgroundColor: baseStyle.BLUE_HIGH_LIGHT,
                borderWidth: 1,
                borderColor: baseStyle.WHITE,
                borderRadius: 4,
                marginVertical: 2,
                width: 140
              },
              this.props.tabBarStyle
            ],
            tabBarItem: { borderWidth: 0, borderColor: baseStyle.BLACK },
            tabBarItemLabel: { color: baseStyle.WHITE, fontSize: 16 },
            tabBarItemSelected: {
              backgroundColor: baseStyle.WHITE,
              borderRadius: 3
            },
            tabBarItemLabelSelected: { color: baseStyle.BLUE_HIGH_LIGHT }
          }}
          onChangeTab={(index, childElement) => {
            this.props.onChangeTab && this.props.onChangeTab(index);
            let refTabBar = this.props.refTabBar;
            if (typeof refTabBar === "function") {
              refTabBar = refTabBar();
            }
            refTabBar && refTabBar.selectTab(index, childElement);
          }}
        >
          {this.props.tabItems.map((itemTitle, index) => (
            <StaticTabBarItem key={index} title={itemTitle} />
          ))}
        </TabBar>
      </View>
    );
  }
}
