/*
* 自选股--新闻
*/

"use strict";

import React, {Component} from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image
} from "react-native";

import * as baseStyle from '../../components/baseStyle.js';


export default class NewsWithoutData extends Component {

  constructor(props) {
    super(props)

    this.noticeText = props.noticeText
  }

  render() {
    return (
      <View style={{ alignItems: 'center', marginTop:110}}>
          <TouchableWithoutFeedback
              style={{ marginTop: 130 }}
              activeOpacity={0.8}>
              <Image
                  style={{ width: 125, height: 125, flexDirection: 'column', alignItems: 'center', }}
                  source={require('../../images/icons/NewsWithoutPersonalStock.png')} />

          </TouchableWithoutFeedback>

          <Text style={{
              fontSize: 14,
              marginTop: 30,
              color: baseStyle.BLACK_99,
              textAlign: 'center',
          }}>{this.noticeText}</Text>
      </View>
    )
  }

}

