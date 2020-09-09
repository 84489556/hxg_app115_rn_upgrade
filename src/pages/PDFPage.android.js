'use strict';
import React, {Component} from 'react';

import {
    StyleSheet,
    View,
    Text,
    BackHandler,
} from 'react-native';

//import PDFView from '../../node_modules_modify/react-native-pdf-view';
import Pdf from '../../node_modules_modify/react-native-pdf';//Android使用react-native-pdf-view兼容性不太好，然后项目中刚好有老版本react-native-pdf，集成后，兼容性好一些，所以Android使用Pdf
import RNFS from 'react-native-fs';
import BasePage from './BasePage.js';

let _pdfDownloadURL = 'http://image.tianjimedia.com/imagelist/2009/190/caq4z56jadof.pdf';
import BaseComponent from "./BaseComponentPage";
import NavigationTitleView from '../components/NavigationTitleView';
export default class PDFPage extends BasePage {
    constructor(props) {
        super(props);
        this.state={
            isPdfDownload: true,
            titles : this.props.navigation.state.params.title ? this.props.navigation.state.params.title: ""
        };
        this.pdfView = null;
        this.onBackAndroid=this.onBackAndroid.bind(this);
        _pdfDownloadURL = this.props.navigation.state.params.news.url;
        this.pdfPath = RNFS.DocumentDirectoryPath + '/test.pdf'
    }
    componentWillMount()
    {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {
        super.componentDidMount();
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
    onBackAndroid()
    {
        Navigation.pop(this.props.navigation);
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        return true;

    }
    zoom(val = 2.1){
        this.pdfView && setTimeout(()=>{
            this.pdfView.setNativeProps({zoom: val});
        }, 3000);
    }

    render(){
        if (!this.state.isPdfDownload){
            return (
                <View style={styles.container}>
                    <Text>Downloading</Text>
                </View>
            );
        }
        console.log("路径",_pdfDownloadURL)
        return (
            <BaseComponent style={{flex:1}}>
                <NavigationTitleView navigation={this.props.navigation} titleText={this.state.titles}/>
                <View style={{flex:1,overflow:'hidden'}}>
            <Pdf
                // ref={(pdf)=>{this.pdfView = pdf;}}
                source={{
                    uri: _pdfDownloadURL, //pdf 路径
                    cache: true, // 是否需要缓存，默认 false
                    // expiration: 0, // 缓存文件过期秒数，默认 0 为未过期
                    // method: 'GET', //默认 'GET'，请求 url 的方式
                    // headers: {} // 当 uri 是网址时的请求标头
                }}
                onLoadComplete={(numberOfPages,filePath)=>{
                    // console.log(`number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page,numberOfPages)=>{
                    // console.log(`current page: ${page}`);
                }}
                onError={(error)=>{
                    // console.log(error);
                }}
                onPressLink={(uri)=>{
                    // console.log(`Link presse: ${uri}`)
                }}
                style={styles.pdf}/>
                </View>
            </BaseComponent>
        )

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    pdf: {
        flex:1
    }
});



