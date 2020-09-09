/**
 * Created by cuiwenjuan on 2017/8/21.
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    DeviceEventEmitter,
    Platform, BackHandler
} from 'react-native';

import PageHeader from '../../components/NavigationTitleView'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
import * as baseStyle from '../../components/baseStyle';
import falvshengming from '../../images/jsonMessage/falvshengming.json';
import BaseComponent from '../BaseComponentPage'

export default class PrivacyAgreement extends BaseComponent {

    componentDidMount() {
        super.componentDidMount();
        this.pageName = this.props.title;
        // DeviceEventEmitter.emit('pageName', this.pageName);
        BackHandler.addEventListener('hardwareBackPress', this.handleBack)
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        // DeviceEventEmitter.emit('pageName', '个人中心设置');
        BackHandler.removeEventListener('hardwareBackPress', this.handleBack)
    }
    handleBack = () => {
        this.props.navigation.state.params && this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack();
    };
    onBack() {
        Navigation.pop(this.props.navigation)
        this.props.navigation.state.params && this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack();
    }

    render() {
        let messages = falvshengming.faLvShengMing;
        if (this.props.navigation.state.params.title === '免责声明') {
            messages = falvshengming.mianZeShengMing;
        } else if (this.props.navigation.state.params.title === '用户许可协议') {
            messages = falvshengming.xuKeXieYi;
        } else if (this.props.navigation.state.params.title === '隐私政策协议') {
            messages = falvshengming.yinSiXieYi;
        } else if (this.props.navigation.state.params.title === '服务协议') {
            messages = falvshengming.fuWuXieYi;
        }
        return <BaseComponent style={{ flex: 1, backgroundColor: '#fff' }}>
            <PageHeader onBack={() => this.onBack()} navigation={this.props.navigation} titleText={this.props.navigation.state.params.title} />

            <ScrollView>
                {
                    messages.map((info, index) => (
                        <View key={index} style={{ margin: 15, marginBottom: 0 }}>
                            {info.title ? <Text
                                style={{
                                    fontSize: RATE(32),
                                    lineHeight: LINE_HEIGHT(32),
                                    color: baseStyle.BLACK_100,
                                    fontWeight: 'bold',
                                }}>
                                {info.title}</Text> : null}

                            <Text style={{
                                marginTop: 5,
                                fontSize: RATE(30),
                                lineHeight: LINE_HEIGHT(30),
                                color: baseStyle.BLACK_100
                            }}>{info.message}</Text>
                        </View>
                    ))
                }
            </ScrollView>

        </BaseComponent>
    }



    // render() {
    //     let messages = falvshengming.faLvShengMing;
    //     if(this.props.navigation.state.params.title === '免责声明'){
    //         messages = falvshengming.mianZeShengMing;
    //     }else if(this.props.navigation.state.params.title === '用户许可协议'){
    //         messages = falvshengming.xuKeXieYi;
    //     }
    //     // console.log('inputed text:' + JSON.stringify(messages));
    //     return <BaseComponent style={{flex: 1, backgroundColor: '#fff'}}>
    //         <PageHeader onBack={() => this.onBack()} title= {this.props.navigation.state.params.title}/>
    //
    //         <ScrollView>
    //             {
    //                 messages.map((info,index) => (
    //                     <View style={{margin:15,marginBottom:0}}>
    //                         {info.title ?  <Text
    //                             style={{
    //                                 fontSize: RATE(32),
    //                                 lineHeight: LINE_HEIGHT(32),
    //                                 color: baseStyle.BLACK_100,
    //                                 fontWeight: 'bold',
    //                             }}>
    //                             {info.title}</Text>:null}
    //
    //                         <Text style={{
    //                             marginTop:5,
    //                             fontSize: RATE(30),
    //                             lineHeight: LINE_HEIGHT(30),
    //                             color: baseStyle.BLACK_100
    //                         }}>{info.message}</Text>
    //                     </View>
    //                 ))
    //             }
    //         </ScrollView>
    //
    //     </BaseComponent>
    // }

}
