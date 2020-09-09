/**
 * splash页面
 */
import React, { Component } from 'react';
import {
    View,
    InteractionManager
} from 'react-native';

import AppMain from "./AppMain";//去除会导致报错
import UserInfoUtil from '../utils/UserInfoUtil'
import AsyncStorage from '@react-native-community/async-storage';

export default class Splash extends Component<Props> {

    constructor(props) {
        super(props)
        this.isUsed = UserInfoUtil.getVersion(); // 是否使用过标识
        this.state = {
            imgPath: '',
            isFirst: false
        }

    }

    componentWillMount() {

        try {
            AsyncStorage.setItem('TOUGU', '盘前解读');
            AsyncStorage.setItem('HANGQING', '自选');
            AsyncStorage.setItem('QUANZI', '圈子热门');
        } catch (error) {

        }

    }


    componentDidMount() {

        UserInfoUtil.versionMessage("0");
        UserInfoUtil.checkMessage();
        UserInfoUtil.getYingXiaoHuoDong();

        this.timer = setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
                AsyncStorage.multiGet(['isFirstV', 'isUserAgree'], (error, result) => {
                    let key1 = result[0][0];
                    let value1 = result[0][1];
                    let key2 = result[1][0];
                    let value2 = result[1][1];

                    if (value2 != "1.0") {
                        Navigation.resetTo(this.props.navigation, 'UserAgree')
                    } else if (value1 !== this.isUsed) {
                        Navigation.resetTo(this.props.navigation, 'GuidePage')
                    } else {
                        Navigation.resetTo(this.props.navigation, 'AppMain')
                    }
                });
            });
        }, 0);

    }

    componentWillUnmount() {

        this.timer && clearTimeout(this.timer);
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {/*<AppMain navigation = {this.props.navigation}/>*/}
            </View>
        )
    }

}
