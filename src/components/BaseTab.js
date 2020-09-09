/**
 * Home页的标签的基类
 */
import React, { Component } from "react";
import { View, Image, TouchableHighlight } from "react-native";

import PageHeader from "../components/PageHeader";
import * as baseStyle from "../components/baseStyle";
import SearchPage from "../pages/Quote/SearchPage";

export default class BaseTab extends Component {
  static defaultProps = {
    searchHidden: false,
    statusBarExist: false
  };

  /**
   * 统一的头部标题栏，左侧自定义，右侧统一为交易和搜索按钮
   */
  renderHeader() {
    return (
      <PageHeader
        statusBarExist={this.props.statusBarExist}
        title={this.renderHeaderLeftBar() || this.title}
        rightComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "flex-end",
              marginRight: 15
            }}
          >
            {!this.props.searchHidden && (
              <TouchableHighlight
                onPress={() => {
                  this.props.navigator.push({ component: <SearchPage /> });
                }}
              >
                <Image
                  //   source={require("../../images/icons/search_select_no.png")}
                  style={{}}
                />
              </TouchableHighlight>
            )}
          </View>
        }
      />
    );
  }

  renderHeaderLeftBar() {}

  renderFooter() {}

  renderContent() {}

  render() {
    return (
      <View style={{ flexDirection: "column", alignItems: "stretch", flex: 1 }}>
        <View>{this.renderHeader()}</View>
        <View style={{ flex: 1 }}>{this.renderContent()}</View>
        <View>{this.renderFooter()}</View>
      </View>
    );
  }
}
