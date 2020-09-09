/**
 * Created by cuiwenjuan on 2019/8/20.
 */
import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Platform
} from 'react-native';

import PageHeader from '../../components/NavigationTitleView'
import BaseComponent from '../BaseComponentPage'
import { ydhxgProdUrl } from '../../actions/CYCommonUrl';
import { WebView } from 'react-native-webview';
import * as ScreenUtil from '../../utils/ScreenUtil';

export default class MainReportDetailPage extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
        }
        this.reportData = this.props.navigation.state.params && this.props.navigation.state.params.key && this.props.navigation.state.params.key;
        this.URL = ydhxgProdUrl + 'ztbg_detail?id=' + this.reportData;
    }

    componentWillMount() {
        super.componentWillMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    onBack() {
        Navigation.pop(this.props.navigation);
    }
    render() {
        let url = this.URL;
        return <BaseComponent >
            <PageHeader
                onBack={() => this.onBack()} titleText={'主题解读详情页'} />

            {
                Platform.OS == 'ios' ?
                    <WebView style={{ flex: 1, height: 2000 }} source={{ uri: url }}
                        useWebKit={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        decelerationRate="normal"
                        startInLoadingState={true} /> :
                    <View style={{ width: ScreenUtil.screenW, flex: 1, overflow: 'hidden' }}>
                        <WebView style={{ flex: 1 }} source={{ uri: url }}
                            javaScriptEnabled={true}
                            //domStorageEnabled={true}
                            decelerationRate="normal"
                            startInLoadingState={true} />
                    </View>
            }

        </BaseComponent>

    }
    // {/*<ScrollView style={{flex:1}}>*/}
    //                            {/**/}
    //                         {/*</ScrollView>*/}

}
