/**
 * Created by jzg on 2017/8/21.
 * 产品介绍
 */

'use strict';

import React, { Component } from "react";
import { View, Platform } from "react-native";
import PageHeader from "../../components/PageHeader";
import BaseComponentPage from '../../pages/BaseComponentPage';
import { WebView } from 'react-native-webview';

export default class BannerDetails extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <BaseComponentPage style={{
                flex: 1,
                backgroundColor: '#fff',
                alignItems: 'stretch',
            }}>
                <PageHeader title={'活动介绍'}
                    onBack={() => this._pagePop()} />
                <WebView source={{ uri: this.props.navigation.state.params.url }}
                    useWebKit={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    decelerationRate="normal"
                    startInLoadingState={true} />
                {Platform.OS == 'android'
                    ?
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                        <PageHeader title={'活动介绍'}
                            onBack={() => this._pagePop()} />
                    </View>
                    :
                    null
                }

            </BaseComponentPage>
        );
    }

    _pagePop() {
        // let navigator = this.props.navigator || this.context.navigator;
        // navigator.pop();
        Navigation.pop(this.props.navigation)
    }
}
