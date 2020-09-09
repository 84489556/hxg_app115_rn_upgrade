/*
 * @Author: lishuai
 * @Date: 2019-07-15 09:52:38
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-08-28 10:54:39
 * 内容来源提示组件
 */

import React, { Component } from "react";
import { Text, View } from "react-native";

export default class ContentSourceComponent extends Component {
    render() {
        let data = this.props.data;
        if (!Array.isArray(this.props.data)) {
            data = [this.props.data];
        }
        if (!data.length) {
            return null;
        }
        return (
            <View style={{ backgroundColor: '#f1f1f1', alignContent: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 10 }}>
                <Text style={{ color: '#00000033', textAlign: 'center', fontSize: 14, lineHeight: 20 }}>该内容源于：</Text>
                {data.map(e => {
                    return (
                        <Text key={e} style={{ color: '#00000033', textAlign: 'center', fontSize: 14, lineHeight: 20 }}>{e}</Text>
                    )
                })}
            </View>
        );
    }
}