/*
* 行业研究
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


export default class IndustryResearch extends YDNewsBasePage {

  static defaultProps = {
    serviceUrl: '/ydhxg/zixun/hangyeyanjiu'
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
   //console.log("行业研究））））",list);
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      let item = {
        abs: element.abs,
        date: element.date,
        id: element.id,
        industryName: element.industryName,
        researcherName: element.researcherName,
        source: element.source,
        title: element.title
      }
      items.push(item);
  }
    return items;
  }

  renderRow(rowData) {
    let item = rowData.item
    return (
        <TouchableHighlight
            onPress={this.onPressItem.bind(this, item)}
            underlayColor={baseStyle.HIGH_LIGHT_COLOR}>
            <View style={{flex:1, flexDirection:'row'}}>
              <View style={{flex:1, marginLeft:10, marginTop:10, marginBottom:8, justifyContent:'center', alignItems:'center'}}>
                  <ImageBackground style={{height:55, width:72, justifyContent:'center', alignItems:'center'}} source={require('../../images/icons/gradualChangeRectangle.png')}>
                    <View style={{ width:50, justifyContent:'center', alignItems:'center'}}>
                      
                        <Text style={styles.listItemName}>{item.industryName}</Text>
                      
                    </View>
                  </ImageBackground>
              </View>
              <View style={[styles.listItem, {flex:4}]}>
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                  <View style={styles.listItemFooter}>
                    <Text style={styles.listItemSource}>{item.source}</Text>
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

