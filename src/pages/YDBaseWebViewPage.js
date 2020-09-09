/*
 * @Author: lishuai 
 * @Date: 2020-03-30 17:03:48 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-08-05 15:54:37
 * 通用webview
 */

import React from 'react';
import {
    ScrollView,
    Platform,
    View
} from 'react-native';
import PageHeader from '../components/NavigationTitleView';
import BaseComponent from './BaseComponentPage';
import * as ScreenUtil from "../utils/ScreenUtil";
import { WebView } from 'react-native-webview';

export default class YDBaseWebViewPage extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
        }
    }
    componentDidMount() {

    }
    componentWillUnmount() {

    }
    render() {
        let url = this.props.navigation.state.params.url || 'https://www.yd.com.cn/';
        url = url.replace(/(^\s*)|(\s*$)/g, ""); // 去除前后空格
        return (
            <BaseComponent style={{ flex: 1 }}>
                <PageHeader onBack={() => this.onBack()} navigation={this.props.navigation} titleText={this.state.title} />
                {
                    Platform.OS == 'ios' ?
                        <WebView style={{ flex: 1 }} source={{ uri: url }}
                            useWebKit={true}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            decelerationRate="normal"
                            onNavigationStateChange={navState => {
                                this.setState({ title: navState.title });
                            }}
                            startInLoadingState={true} />
                        :
                        <View style={{ width: ScreenUtil.screenW, flex: 1, overflow: 'hidden' }}>
                            <WebView style={{ flex: 1 }} source={{ uri: url }}
                                javaScriptEnabled={true}
                                decelerationRate="normal"
                                onNavigationStateChange={navState => {
                                    //安卓10上面标题回调的时候会先回调网页地址，这里做个过滤
                                    this.setState({ title: (navState.title && navState.title.length > 10) ? "" : navState.title });
                                }}
                                startInLoadingState={true} />
                        </View>
                }
            </BaseComponent>
        )
    }
}