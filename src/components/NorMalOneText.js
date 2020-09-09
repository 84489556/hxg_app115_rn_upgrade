/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description: 普通组件，只显示一行文字
 * textContent:需要展示的文字
 */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';

import * as ScreenUtil from "../utils/ScreenUtil";

export default class NorMalOneText extends Component<Props> {

    constructor(props) {
        super(props);
    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {


    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.onetext}>{this.props.textContent}</Text>
                <View style={{flex:1}}/>
            </View>
        )
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        width:ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(60),
        backgroundColor:"white",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center"
    },
    onetext:{
        fontSize:12,
        color:"#9d9d9d",
        marginLeft:ScreenUtil.scaleSizeW(30)},
}
);
