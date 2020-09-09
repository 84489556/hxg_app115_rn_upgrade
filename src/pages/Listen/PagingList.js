/**
 * 可分页请求的列表
 */

"use strict";

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
  AppState,
  NetInfo,
  Platform,
  Dimensions
} from "react-native";

import * as baseStyle from "../../components/baseStyle";
import StockFormatText from "../../components/StockFormatText";
import ShareSetting from "../../modules/ShareSetting";
import RATE from "../../utils/fontRate";
import PullListView, { RefreshState } from "../../components/PullListView";



export default class PagingList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      refreshState: RefreshState.Idle
    };
  
  }

  keyExtractor = (item: any, index: number) => {
    return index.toString();
  };
    // _loadMoreData=()=>{
    //
    // }
  render() {
    let refreshState = this.state.refreshState
    if (this.props.data && this.props.data.length <= 0) {
        refreshState = RefreshState.FooterRefreshing
    }
    if (this.props.data && this.props.data.length >= this.props.total) {
         refreshState = RefreshState.NoMoreData
    }

    return (
      <View>
        <PullListView
          data={this.props.data}
          keyExtractor={this.keyExtractor}
          renderItem={this.props.renderRow}
          refreshState={refreshState}
         // onFooterRefresh={this._loadMoreData}
          footerNoMoreDataText='没有更多内容了'
          showsVerticalScrollIndicator = {false}
        />
      </View>

    );
  }
}

