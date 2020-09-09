/**
 * Created by cuiwenjuan on 2018/8/17.
 */
/**
 * 横屏页面标题
 */

import React from "react";
import {Image, Platform, StyleSheet, Text, View,TouchableOpacity,Dimensions} from "react-native";
import * as baseStyle from "./baseStyle.js";
import BaseComponent from "./BaseComponent.js";


export default class PageHeaderLandscape extends BaseComponent {


    _renderLandscapeTitle() {
        if (React.isValidElement(this.props.title)) {
            return this.props.title;
        } else if (typeof this.props.title === 'function') {
            return this.props.title();
        } else if (typeof this.props.title === 'string') {
            return (
                <Text style={[
                    {
                        textAlign:'center',
                        fontSize:17,
                        color:baseStyle.BLACK_333333},
                    {
                        fontWeight:'900'
                    }]} numberOfLines={1}>
                    {this.props.title}
                </Text>
            );
        }
    }


    render() {
        // 防止两个statusBar占位
        let landscapeView = () => (
            <View style={[
                {
                    flexDirection:'row',
                    alignItems:'center',
                    height: Platform.OS == 'ios' ? 44 : 48 ,
                    borderBottomColor: baseStyle.LIGHTEN_GRAY,
                    borderBottomWidth: 1,
                },
                this.props.style,
            ]}>
                <TouchableOpacity
                    style={{paddingLeft:15,width:35}}
                    onPress={this.props.onBack}
                >
                    <Image source={require('../images/hq_kSet_back.png')}
                           style={{width: 9, height: 16}}/>
                </TouchableOpacity>

                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    {this._renderLandscapeTitle()}
                </View>

                <View style={{width:35,height:1}}/>
            </View>
        )
        return (
            <View>
                {
                    landscapeView()
                }
            </View>
        );
    }
}

