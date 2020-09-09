/*
* 快讯
*/

"use strict";

import React from "react";
import {
  View,
  Text,
  TouchableHighlight,
  ImageBackground
} from "react-native";

import YDNewsBasePage from "./YDNewsBasePage"
import PagingList from "./PagingList"
import DateFormatText from "../../components/DateFormatText"
import * as baseStyle from '../../components/baseStyle.js';
import {styles} from "./StyleSheet"


export default class NewsFlash extends YDNewsBasePage {

  static defaultProps = {
    serviceUrl: '/ydhxg/zixun/kuaixun'
  };

  defaultParams = { 
    'pageNum': 1, 
    'pageSize': 200
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [{
          items: []
      }]
    }

  }

  adapt(list) {
    let items = []

    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      let item = {
          id: element.id,
          secCode: element.secCode,
          secName: element.secName,
          newsId: element.newsId,
          title: element.title,
          sourceName: element.sourceName,
          content: element.content,
          date: element.date
      }
      items.push(item);
  }
    return items;
  }
// <Text style={styles.listItemSource}></Text>
  renderRow(rowData) {
    let item = rowData.item
    return (
      <TouchableHighlight
          onPress={this.onPressItem.bind(this, item)}
          underlayColor={baseStyle.HIGH_LIGHT_COLOR}>
          <View style={{flex:1, flexDirection:'row'}}>
            <View style={{flex:1, marginLeft:6, marginTop:12, marginBottom:8, alignItems:'center'}}>
                <ImageBackground style={{width:60, height:50, justifyContent:'center', alignItems:'center'}} source={require('../../images/icons/gradualChangeCircle.png')}>
                  <View style={{ justifyContent:'center', alignItems:'center', marginLeft:5, marginRight:5}}>
                      <Text style={styles.listItemName}>{item.sourceName}</Text>
                  </View>
                </ImageBackground>
            </View>
            <View style={[styles.listItem, {flex:4}]}>
                <View style={[styles.listItemTitleView, {}]}>
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                </View>
                <View style={styles.listItemFooter}>

                  <DateFormatText style={styles.listItemTime} format="YYYY-MM-DD">{item.date}</DateFormatText>
                </View>
            </View>
          </View>
      </TouchableHighlight>
    )

  }

  onPressItem(item) {
    let idPath = this.props.serviceUrl + "/" + item.id
    let data={
      idPath:idPath,
      title:item.title,
      sourceName:item.sourceName,
      date:item.date,
      jsonUrl:item.content
    };

    Navigation.pushForParams(this.props.navigation,'NewsDetailPage',{
      news:data, title:item.title, 
    })
  }

  render() {
    return (
      <PagingList
        data={this.state.data[0].items}
        renderRow={this.renderRow.bind(this)}
        total={this.state.total}
      />
    );
  }

}
