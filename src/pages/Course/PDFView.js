/**
 * 投顾/直播课页面/教程
 * 
 */
'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
// import PDFPage from './PDFViewManager.js'
// import PDF from 'react-native-pdf';
var Dimensions = require('Dimensions');
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;


export default class PDFView extends Component {

    constructor(props) {
        super(props)

        this.state = {
            pdfUrl: undefined,
            currentPage: 0,
            allPage: 0,
        }

    }
    componentWillMount() {
        this.setState({ pdfUrl: this.props.pdfUrl })
    }
    componentWillReceiveProps(nextProps, netxContext) {
        if (this.state.pdfUrl != nextProps.pdfUrl) {
            // alert(nextProps.pdfUrl)
            this.setState({ pdfUrl: nextProps.pdfUrl })
        }

    }
    render() {

        return(
            <View style = {{flex:1,width:width}} tabLabel = '课件'>
                {!this.props.isPage&&this._tabBar()}
                    {/* <PDF
                    style = {{flex:1,width:width}}
                    source = {{uri:this.state.pdfUrl}}
                    fitPolicy={0}
                    onLoadComplete={(numberOfPages,filePath)=>{
                        console.log(`number of pages: ${numberOfPages}`);
                        this.props.isPage?this.props.navigation.setParams({allPage:numberOfPages,currentPage:1}):this.setState(
                            {
                                allPage:numberOfPages,
                                currentPage:1,
                            }
                        );
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                        console.log(`current page: ${page}`);
                        this.props.isPage?this.props.navigation.setParams({allPage:numberOfPages,currentPage:page}):
                            this.setState({
                                allPage:numberOfPages,
                                currentPage:page,
                            });
                    }}
                    onError={(error)=>{
                        console.log(error);
                    }}
                /> */}
            </View>
          )
    }

    _tabBar() {
        return (
            <View style={{
                height: 45,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderBottomColor: '#rgba(0,0,0,0.1)',
                borderBottomWidth: 1
            }}>
                <TouchableOpacity onPress={this.props.onBack}>
                    <View style={{ width: 16, height: 16, marginLeft: 15, alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={{ width: 16, height: 16 }}
                            source={require('../../images/livelession/icon-pdf-close.png')} />
                    </View>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 17, color: '#000000', alignItems: 'center', }}>
                        课件PPT
                        </Text>
                </View>
                <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                    <Text style={{ fontSize: 12, color: '#555555', alignItems: 'center' }}>
                        {this.state.currentPage} of {this.state.allPage}
                    </Text>
                </View>

            </View>

        );
    }

}