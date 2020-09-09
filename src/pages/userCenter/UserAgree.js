import React, { Component } from 'react';
import {
    Text,
    Button,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    DeviceEventEmitter,
    Platform,
    StatusBar
} from 'react-native';
import RNExitApp from 'react-native-exit-app';

import PageHeader from '../../components/NavigationTitleView'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
import * as baseStyle from '../../components/baseStyle';
import falvshengming from '../../images/jsonMessage/falvshengming.json';
import BaseComponent from '../BaseComponentPage'
import TranslucentModal from 'react-native-translucent-modal';
import { resetTo, pushForParams } from "../../components/NavigationInterface"
import AsyncStorage from '@react-native-community/async-storage';

export default class UserAgree extends BaseComponent {

    constructor(props) {
        super(props);
        // this.state = {
        //     showDialogProtocal: true,
        // };
    }

    disagree() {
        RNExitApp.exitApp();
    }

    agree() {
        AsyncStorage.setItem('isUserAgree', '1.0');//1.0版本协议
        // resetTo(this.props.navigation,'AppMain')
        AsyncStorage.multiGet(['isFirstV', 'isUserAgree'], (error, result) => {
            let key1 = result[0][0];
            let value1 = result[0][1];
            let key2 = result[1][0];
            let value2 = result[1][1];

            if (value1 !== this.isUsed) {
                Navigation.resetTo(this.props.navigation, 'GuidePage')
            } else {
                Navigation.resetTo(this.props.navigation, 'AppMain')
            }
        });
    }
    agreementPage(protocal) {
        //this.setState({showDialogProtocal: false,});
        if (protocal == "yinsi") {
            Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: '隐私政策协议', callBack: () => { this.agreeCallback() } })
        } else {
            Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: '服务协议', callBack: () => { this.agreeCallback() } })
        }
    }

    agreeCallback() {
        // this.setState({showDialogProtocal: true,});
        StatusBar.setBarStyle("light-content", false);
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor("transparent")
        }
        Navigation.pop(this.props.navigation);
    }
    render() {
        return <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#ffffff', marginLeft: 38, marginRight: 38, padding: 15, alignItems: 'center', borderRadius: 10 }}>
                <Text style={{ color: '#262628', fontSize: 18 }}>用户隐私政策协议</Text>
                <Text style={{ color: '#666666', fontSize: 14, marginTop: 15, lineHeight: 18 * 1.4, textAlign: 'left' }}>
                    尊敬的用户，感谢您使用慧选股{'\n'}
                        为了更好的保护您的隐私和信息安全，请您仔细阅读
                        <Text style={{ color: baseStyle.BLUE_0099FF }} onPress={() => this.agreementPage("yinsi")}>《隐私政策协议》</Text>和
                        <Text style={{ color: baseStyle.BLUE_0099FF }} onPress={() => this.agreementPage("fuwu")}>《服务协议》</Text>
                        。{'\n'}
                        我们会根据服务功能需要收集您的信息，并严格遵守隐私政策协议妥善保管您的资料信息。{'\n'}
                        您可以在产品“我的页面”管理您的个人信息{'\n'}
                        请您在使用产品前务必仔细阅读，您同意并接受全部协议内容后可以开始使用产品
                        </Text>
                <View style={{ marginTop: 15, width: baseStyle.width - 38 * 2, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: baseStyle.width - 38 * 2, marginTop: 15 }}>
                    <TouchableOpacity activeOpacity={0.5} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} onPress={() => this.disagree()}>
                        <Text style={{ color: '#006ACC', fontSize: 17 }}>不同意</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.5} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} onPress={() => this.agree()}>
                        <Text style={{ color: '#FF0000', fontSize: 17 }} >同意</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    }
}