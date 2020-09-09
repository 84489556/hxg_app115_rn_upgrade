'use strict'

import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

import * as baseStyle from './baseStyle.js';
import BaseComponent from './BaseComponent.js';

export default class Loading extends BaseComponent {

  static defaultProps = {
    loadingText: '加载中...'
  };

  styleSheet = StyleSheet.create({
    loading: {
      flex: 1,
      height: 30,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 20
    },
    loadingIcon: {
      width: 24,
      height: 24,
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 10,
      marginRight: 10
    },
    loadingText: {
      fontSize: 14,
      color: baseStyle.DEFAULT_TEXT_COLOR
    }
  });

  render() {
    return (
      <View style={[this.getStyles('loading'),this.props.style,{flexDirection:"column", alignItems: 'center', justifyContent: 'center',paddingBottom:200}]}>
          <Image source= {require('../images/icons/loading.gif')} style = {{width:20,height:20}}/>
        <Text style={[this.getStyles('loadingText'),{marginTop:5}]}>{this.props.children || this.props.loadingText}</Text>
      </View>
    );
  }
}

export class ActivityIndicator extends React.Component {  
  static imgSource = require('../images/icons/loading.gif');
  render(){  
      if (!this.props.isShow) {  
          return null;
      }  

      return (  
          <View style = {[styles.container, this.props.containerStyle]}>  
              <Image source= {ActivityIndicator.imgSource} style = {[styles.loading, this.props.imageStyle]}/>  
          </View>  
      )  
  };  
}  

const styles = StyleSheet.create({  
  container:{  
    backgroundColor: 'transparent',  
    position: 'absolute',  
    top: 0,  
    left: 0,  
    height: '100%',  
    width: '100%',  
    alignItems: 'center',  
    justifyContent: 'center',

  },  
  loading:{  
  },  
})  
