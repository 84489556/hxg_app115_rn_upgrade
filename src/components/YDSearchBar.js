/*
 * @Author: lishuai 
 * @Date: 2019-08-12 11:46:21 
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-08-12 13:53:11
 * 搜索栏
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableHighlight,
    Image,
} from 'react-native';

export default class YDSearchBar extends Component {

    render() {
        let placeholderText = this.props.placeholderText || '请输入搜索关键字';
        let width = 190;

        return (
            <TouchableHighlight
                style={{ width: width, borderColor: '#0000001A', borderRadius: 3, borderWidth: 1, paddingLeft: 15, paddingRight: 15, justifyContent: 'flex-start', alignItems: 'flex-start' }}
                underlayColor={'transparent'}
                onPress={() => this.props.onClick && this.props.onClick()}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Image style={{ width: 12, height: 12, resizeMode: "contain" }} source={require('../images/hits/search.png')} />
                    <Text style={{ color: '#00000033', fontSize: 12, marginLeft: 10, marginTop: 5, marginBottom: 5 }}>{placeholderText}</Text>
                </View>
            </TouchableHighlight>
        )
    }
}