import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import * as ScreenUtil from "../utils/ScreenUtil";
import AsyncStorage from '@react-native-community/async-storage';

export default class HistoryView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
  }

  componentWillReceiveProps() {
  }

  /**
   * 页面加载完成
   * */
  componentDidMount() {
    this.getHistory(this.props.historykey);
  }

  render() {
    if (this.props.type === 'grid') {
      return (
        this.renderHistoryGridView()
      )
    } else {
      return this.renderHistoryListView();
    }
  }

  renderHistoryTitle = () => {
    return (
      <View>
        <Text style={{
          fontSize: ScreenUtil.setSpText(30),
          marginTop: ScreenUtil.scaleSizeW(30),
          marginLeft: ScreenUtil.scaleSizeW(30)
        }}>
          {this.state.items.length > 0 ? '最近搜索：' : ''}
        </Text>

        <Text style={{
          marginTop: ScreenUtil.scaleSizeW(24),
          backgroundColor: 'rgba(0,0,0,0.1)',
          height: 1,
          width: '100%'
        }}
        />

      </View>
    )
  };
  renderHistoryGridView = () => {
    let viewItems = [];
    for (let i = 0; i < this.state.items.length; i++) {
      let item = this.state.items[i];
      viewItems.push(
        <TouchableOpacity onPress={() => {
          this.props.itemOnClick && this.props.itemOnClick(item);
        }} style={{
          justifyContent: "center",
          alignItems: "center",
          width: '30%',
          marginTop: ScreenUtil.scaleSizeW(10),
          marginLeft: ScreenUtil.scaleSizeW(10),
          paddingTop: ScreenUtil.scaleSizeW(22),
          paddingBottom: ScreenUtil.scaleSizeW(24),
          fontSize: ScreenUtil.setSpText(28),
          borderRadius: ScreenUtil.scaleSizeW(20),
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
          backgroundColor: 'rgba(0,0,0,0.05)',
        }}>
          <Text style={{
            textAlign: 'center',
            color: "#000000",
            opacity: 1
          }}>{item.secName}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View>
        {this.renderHistoryTitle()}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginLeft: ScreenUtil.scaleSizeW(20),
          marginTop: ScreenUtil.scaleSizeW(10),
        }}>
          {viewItems}
        </View>
      </View>)
  };



  renderHistoryListView = () => {
    let viewItems = [];
    for (let i = 0; i < this.state.items.length; i++) {
      let item = this.state.items[i];
      if (!item.secName) {
        continue
      }
      viewItems.push(
        <TouchableOpacity onPress={() => {
          this.props.itemOnClick && this.props.itemOnClick(item);
        }} style={{
          width: '93.2%',
          paddingLeft: ScreenUtil.scaleSizeW(30),
          height: ScreenUtil.scaleSizeW(86),
          marginTop: ScreenUtil.scaleSizeW(10),
          marginLeft: '3.4%',
          paddingTop: ScreenUtil.scaleSizeW(22),
          paddingBottom: ScreenUtil.scaleSizeW(24),
          fontSize: ScreenUtil.setSpText(28),
          borderRadius: ScreenUtil.scaleSizeW(20),
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
          backgroundColor: 'rgba(0,0,0,0.05)',
        }}>
          <Text style={{
            color: "#000000",
            opacity: 1
          }}>{item.secName}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View>
        {viewItems.length > 0 ? this.renderHistoryTitle() : null}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: ScreenUtil.scaleSizeW(10),
        }}>
          {viewItems}
        </View>
      </View>)
  };



  getHistory(historykey) {
    AsyncStorage.getItem(historykey)
      .then((value) => {
        let data = [];
        if (value) {
          data = JSON.parse(value);
          this.setState({
            items: data,
          });
        }
      })
  }
}
