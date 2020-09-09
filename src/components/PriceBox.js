 'use strict'

import React from 'react';
import {View,StyleSheet,Platform,Text,} from 'react-native';

export default class PriceBox extends React.Component {

  constructor(props) {
    super(props);
  };

  render() {
    let kline = this.props.data;
    let date = null;
    let volumn = null;
    let amount = null;
    if( kline ){
      date = new Date(kline.ShiJian*1000);

      if ( kline.ChengJiaoLiang > 1000*1000*1000 ){
          volumn = (kline.ChengJiaoLiang/(1000*1000*1000)).toFixed(4) + 'G';
      }else if(kline.ChengJiaoLiang > 1000*1000){
          volumn = (kline.ChengJiaoLiang/(1000*1000)).toFixed(2) + 'M';
      }else if( kline.ChengJiaoLiang > 1000 ){
          volumn = (kline.ChengJiaoLiang/1000).toFixed(2) + 'K';
      }else{
          volumn = kline.ChengJiaoLiang;
      }                     

      if ( kline.ChengJiaoE > 1000*1000*1000 ){
          amount = (kline.ChengJiaoE/(1000*1000*1000)).toFixed(4) + 'G';
      }else if(kline.ChengJiaoE > 1000*1000){
          amount = (kline.ChengJiaoE/(1000*1000)).toFixed(2) + 'M';
      }else if( kline.ChengJiaoE > 1000 ){
          amount = (kline.ChengJiaoE/1000).toFixed(2) + 'K';
      }else{
          amount = kline.ChengJiaoE;
      }                
    };

    return  kline ? (
      <View style={[this.props.style, styles.root] }>
            <View style={styles.container}>
              <Text style={styles.title}>{'时:'}</Text>
              <Text style={styles.data}>{date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()}</Text>
            </View>      
            <View style={styles.container}>
              <Text style={styles.title}>{'开:'}</Text>
              <Text style={styles.data}>{kline.KaiPanJia.toFixed(2)}</Text>
            </View>
            <View style={styles.container}>
              <Text style={styles.title}>{'高:'}</Text>
              <Text style={styles.data}>{kline.ZuiGaoJia.toFixed(2)}</Text>
            </View>
            <View style={styles.container}>
              <Text style={styles.title}>{'低:'}</Text>
              <Text style={styles.data}>{kline.ZuiDiJia.toFixed(2)}</Text>
            </View>
            <View style={styles.container}>
              <Text style={styles.title}>{'收:'}</Text>
              <Text style={styles.data}>{kline.ShouPanJia.toFixed(2)}</Text>
            </View>    
            <View style={styles.container}>
              <Text style={styles.title}>{'量:'}</Text>
              <Text style={styles.data}>{volumn}</Text>
            </View>
            <View style={styles.container}>
              <Text style={styles.title}>{'额:'}</Text>
              <Text style={styles.data}>{amount}</Text>
            </View>                    
      </View>
    ) 
    :
    (
      <View style={this.props.style} />
    );
  };

};

export class VerticalLine extends React.Component {
  render() {
    return  (
      <View style={this.props.style} />
    );
  };
};

var styles = StyleSheet.create({
  root : {
    flex: 1,
    flexDirection : 'column',
  },
  container: {
    flex: 1,
    flexDirection : 'row',
  },
  title: {
    flex: 0
  },
  data: {
     flex: 1,
     textAlign: 'right',
	},
});

export class HorizontalLine extends React.Component {
  render() {
    return  (
      <View style={this.props.style} />
    );
  };
};

var styles = StyleSheet.create({
  root : {
    flex: 1,
    flexDirection : 'column',
  },
  container: {
    flex: 1,
    flexDirection : 'row',
  },
  title: {
    flex: 0
  },
  data: {
     flex: 1,
     textAlign: 'right',
	},
});