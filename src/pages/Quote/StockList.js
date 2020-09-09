/**
 * 股票列表
 * Created by jiagang on 15/11/2.
 */
"use strict";

import React from "react";

import { View,FlatList } from "react-native";
import BaseComponentPage from "../BaseComponentPage";
import baseStyle from "../../components/baseStyle";

import StockListItem from "./StockListItem";

export default class StockList extends BaseComponentPage {
  constructor(props) {
    super(props);

    // 初始状态
    this.state = {
    dataSource: props.data
    };
  }

  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  _renderRow = ({rowData, sectionID, rowID}) =>  {
    rowData.rowID = rowID;
    return (
      <StockListItem
        key={rowData.Obj}
        {...rowData}
        onPress={this.props.onItemPress}
        onLongPress={this.props.onItemLongPress}
      />
    );
  }

  componentWillReceiveProps(nextProp) {
    nextProp.data &&
      this.setState({
        dataSource: nextProp.data
      });

    if (nextProp.desc === 0) {
      nextProp.data &&
        nextProp.data.sort(function (a, b) {
          return a.ZhangFu - b.ZhangFu;
        });
      this.setState({
        dataSource: nextProp.data
      });
    } else if (nextProp.desc === 1) {
      nextProp.data &&
        nextProp.data.sort(function (a, b) {
          return b.ZhangFu - a.ZhangFu;
        });
      this.setState({
        dataSource: nextProp.data
      });
    } else if (nextProp.desc === 2) {
      nextProp.data &&
      this.setState({
        dataSource: nextProp.data
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.dataSource !== nextState.dataSource;
  }

  render() {
    return (
      <FlatList
        {...this.props}
        ListHeaderComponent={this.props.renderHeader}
        data={this.state.dataSource}
        renderItem={({item, index, separators}) => this.props.renderRow(item, separators, index) || this._renderRow(item, separators, index)}
        removeClippedSubviews={false}
        onScroll={this.props.onScroll}
        onTouchStart={this.props.onTouchStart}
      />
    );
  }
}
