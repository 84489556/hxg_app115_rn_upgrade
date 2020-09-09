'use strict';

import React,{
    Component
} from 'react';

import {
    StyleSheet,
    View,
    Text,
    BackHandler,
} from 'react-native';


import PDFView from '../../node_modules_modify/react-native-pdf-view';
import RNFS from 'react-native-fs';
import BasePage from './BasePage.js';

let _pdfDownloadURL = 'http://image.tianjimedia.com/imagelist/2009/190/caq4z56jadof.pdf';

export default class PDFPage extends BasePage {
    constructor(props) {
        super(props);
        this.state={
            isPdfDownload: false
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
        RNFS.downloadFile({
            fromUrl: _pdfDownloadURL,
            toFile: this.pdfPath,
        }).promise.then(res => {
            this.setState({isPdfDownload: true});
        }).catch(err => {
            //console.log(err);
        });
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
        return (
            <PDFView ref={(pdf)=>{this.pdfView = pdf;}}
                     key="sop"
                     path={this.pdfPath}
                     onLoadComplete = {(pageCount)=>{
                         //console.log(`total page count: ${pageCount}`);

                     }}
                     style={styles.pdf}/>
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



