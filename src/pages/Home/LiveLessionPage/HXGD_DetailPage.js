/**
 *
 *核心观点详情：包括每日课件和观点
 * @author:pp.
 * 2018/12/6
 * */
import React, { Component } from "react";
import {
    View,
    Platform,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    BackHandler
} from "react-native";
import PDFPage from "./PDFViewManager.js";
import * as baseStyle from '../../../components/baseStyle';
import PageHeader from '../../../components/PageHeader.js';
import { WebView } from 'react-native-webview';

export default class CommentList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isKJ: props.navigation.state.params.data && this.props.navigation.state.params.isKJ,
            pdfUrl: this.props.navigation.state.params.data && this.props.navigation.state.params.data.coursewareUrl,
            title: props.navigation.state.params.data && this.props.navigation.state.params.title,
            data: props.navigation.state.params.data && this.props.navigation.state.params.data,
        }
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }


    componentDidMount() {
        this.loadData()
    }


    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    loadData() {

    }
    onBackAndroid = () => {
        this.props.navigation.state.params.play()
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        Navigation.pop(this.props.navigation)
        return true;
    }
    contentUI() {
        if (this.state.isKJ) {
            if (Platform.OS == 'ios') {
                return (
                    <WebView
                        ref={'webview'}
                        useWebKit={true}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        automaticallyAdjustContentInsets={true}
                        source={{ uri: this.state.pdfUrl }}
                        scrollEnabled={false}
                    />
                );
            } else {
                return (
                    <PDFPage
                        style={{ flex: 1, width: baseStyle.width }}
                        url={this.state.pdfUrl}
                    />
                );
            }
        } else {
            return (
                <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                    <View style={{
                        height: 92,
                        width: baseStyle.width,
                        backgroundColor: '#F1F1F1',
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                    }}>

                        <View style={{
                            height: 75,
                            width: 213,
                            backgroundColor: '#FFFFFF',
                            borderTopRightRadius: 20,
                            borderTopLeftRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: '#00000', fontSize: 17, fontWeight: '900' }}>
                                {this.state.data.title.trim() + "核心观点"}
                            </Text>
                            <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: 12, marginTop: 10 }}>
                                {this.state.data.create_time}
                            </Text>
                        </View>
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0)' }}>
                            <Image style={{}}
                                source={require('../../../images/livelession/LiveRoom/bg_zbj_detail.png')} />
                        </View>
                    </View>
                    <Text style={{
                        color: 'rgba(0,0,0,0.8)',
                        fontSize: 13,
                        marginRight: 15,
                        marginLeft: 15,
                        marginTop: 15
                    }}>
                        {this.state.data.hxgd}
                    </Text>
                </ScrollView>
            );
        }
    }

    _headerUI() {
        return (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <PageHeader onBack={() => {
                    this.props.navigation.state.params.play()
                    Navigation.pop(this.props.navigation)
                }} title={this.state.title} />
            </View>
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <PageHeader onBack={() => {
                    this.props.navigation.state.params.play()
                    Navigation.pop(this.props.navigation)
                }} title={this.state.title} />
                {this.contentUI()}
                {this._headerUI()}
            </View>
        );
    }

}