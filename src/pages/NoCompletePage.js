/**
 * Created by jzg on 2017/9/12.
 * 加载中提示页
 */

'use strict';

import React, {Component} from "react";
import {Image, Text, View} from "react-native";
import * as baseStyle from "../components/baseStyle";
import RATE from "../utils/fontRate";

export default class NoCompletePage extends Component {

    static defaultProps = {
        content: '正在加载，请稍后...',
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={[{
                flex: 1,
                backgroundColor: '#f6f6f6',
                alignItems: 'center',
            },this.props.style]}>
                <View style={{height: 235, alignItems: 'center', justifyContent: 'flex-end'}}>
                    <Image source={require('../images/gif/loading_post_list.gif')}/>
                </View>
                <View style={{marginTop: 20}}>
                    <Text style={{
                        fontSize: RATE(28),
                        color: baseStyle.BLACK_70,
                    }}>{this.props.content}</Text>
                </View>
            </View>
        );
    }
}
