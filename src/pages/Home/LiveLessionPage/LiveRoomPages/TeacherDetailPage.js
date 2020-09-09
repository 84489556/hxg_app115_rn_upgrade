/**
 * Created by gg on 2017/8/21.
 * 产品介绍
 */


'use strict';

import PropTypes from "prop-types";
import React, { Component } from "react";
import { BackHandler, Dimensions, Image, Platform, ScrollView, View } from 'react-native';
import PageHeader from "../../../../components/PageHeader";
import SafeAreaView from '../../../../components/SafeAreaView';
import { pop } from "../../../../modules/NavigationInterface";

export const deviceWidth = Dimensions.get('window').width;      //设备的宽度
export const deviceHeight = Dimensions.get('window').height;      //设备的宽度

export default class ProductIntro extends Component {

    static defaultProps = {
        headShow: true,// 是否显示PageHeader
    };

    constructor(props) {
        super(props);
        this.state = {
            imageurl: props.navigation.state.params.path,
            height: deviceHeight,
        }
    }
    componentWillMount() {
        this._getImageSize();
        if (Platform.OS == 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBack)
        }
    }
    componentDidMount() {

    }
    componentWillUnmount() {
        if (Platform.OS == 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBack)
        }
    }
    _getImageSize() {
        if (this.state.imageurl) {
            Image.getSize(this.state.imageurl, (w, h) => {
                // this.setState({height:w/deviceWidth*h});
            });
        }
    }
    render() {
        return (
            <SafeAreaView>
                <View style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    alignItems: 'stretch',
                }}>
                    <View style={{ height: IsNotch ? 0 : 0, width: deviceWidth, backgroundColor: '#F92400' }} />
                    <PageHeader title="老师介绍详情" onBack={this._pagePop.bind(this)} />
                    <ScrollView style={{ flex: 1, }}>
                        <Image style={{ width: deviceWidth, height: this.state.height, resizeMode: 'stretch' }} source={{ uri: this.state.imageurl }} />
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }

    _pagePop() {
        // let navigator = this.props.navigator || this.context.navigator;
        // navigator.pop();
        this.props.navigation.state.params.playVideo();
        pop(this.props.navigation);
    }
    handleBack = () => {
        this.props.navigation.state.params.playVideo();
    }
}

ProductIntro.contextTypes = {
    navigator: PropTypes.object,
};