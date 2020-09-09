/**
 * 沪深指数列表
 */
'use strict';

import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Platform } from "react-native";


import StockList from "./StockList.js";
import * as baseStyle from "../../components/baseStyle.js";
import { connection } from "./YDYunConnection";
import StockFormatText from "../../components/StockFormatText";
import RATE from "../../utils/fontRate";
import PageHeader from '../../components/PageHeader';
import BasePage from "../../pages/BasePage";
import blockPath from '../../images/jsonMessage/blockPath.json'
import UpDownButton from '../../components/UpDownButton'
import SafeAreaView from '../../components/SafeAreaView'


export default class HuShenZhiShu extends BasePage {

    constructor(props) {
        super(props);

        // 初始空数据
        this.state = {
            title: '沪深指数',
            zhangF: 0,//0 ：降序，由大到小  1：升序，有小到大  2：默认排序
            xianJ: 2
        };

    }

    changeListZF() {
        if (this.state.zhangF === 2) {
            this.setState({
                xianJ: 2,
                zhangF: 0,
            })
        } else {
            this.setState({
                zhangF: this.state.zhangF === 0 ? 1 : 0,
            })
        }


    }

    changeListXJ() {
        if (this.state.xianJ === 2) {
            this.setState({
                zhangF: 2,
                xianJ: 0,
            })
        } else {
            this.setState({
                xianJ: this.state.xianJ === 0 ? 1 : 0,
            })
        }
    }

    _popToSearchPage() {
        Navigation.pushForParams(this.props.navigation, 'SearchPage', null);
    }

    render() {
        let b = false;
        let file = 'ZhangFu'
        if (this.state.zhangF === 2) {
            file = 'ZuiXinJia'
            b = this.state.xianJ;
        } else {
            b = this.state.zhangF;
        }


        const titleStyle = {
            backgroundColor: baseStyle.WHITE,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: 35,
            marginLeft: 12,
            marginRight: 12,
            borderBottomWidth: 1,
            borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
        };

        return (
            <SafeAreaView style={{
                flex: 1, flexDirection: 'column',
            }}>
                <PageHeader onBack={() => {
                    Navigation.pop(this.props.navigation)
                }} title={'沪深指数'}
                    rightComponent={
                        <View
                            style={{
                                flex: 1,
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                marginRight: 0
                            }}
                        >
                            <TouchableOpacity
                                hitSlop={{
                                    top: 20,
                                    left: 20,
                                    bottom: 20,
                                    right: 20
                                }}
                                onPress={() => this._popToSearchPage()}
                            >
                                <Image
                                    source={require('../../images/icons/cy_search_gray.png')}
                                />
                            </TouchableOpacity>
                        </View>
                    }
                />
                <View style={titleStyle}>
                    <Text style={{
                        flex: 1,
                        color: baseStyle.BLACK_70,
                        fontSize: RATE(24),
                        textAlign: 'left',
                    }}>名称</Text>

                    <UpDownButton onPress={this.changeListXJ.bind(this)}
                        desc={this.state.xianJ}
                        title={'现价'}
                        containerStyle={{
                            flex: 0.5,
                            alignItems: 'flex-end',
                        }} />

                    <UpDownButton onPress={this.changeListZF.bind(this)}
                        desc={this.state.zhangF}
                        title={'涨跌幅'}
                        containerStyle={{
                            flex: 1,
                            alignItems: 'flex-end',
                        }} />
                </View>
                <ScrollView>
                    <View style={{ backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR }}>
                        <HuShenZhiShuList title={this.state.title} isAll={true} params={{ field: file, desc: b }}
                            navigation={this.props.navigation} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}


class HuShenZhiShuList extends Component {

    constructor(props) {
        super(props);

        let gupiaos = blockPath.objs
        // this.objs_grpc = "SH000688,SH000001,SH000002,SH000003,SH000008,SH000009,SH000010,SH000011,SH000012,SH000016,SH000017,SH000300,SZ399001,SZ399002,SZ399003,SZ399004,SZ399005,SZ399006,SZ399100,SZ399101,SZ399106,SZ399107,SZ399108,SZ399333,SZ399606";
        this.objs_grpc = "SH000001,SH000002,SH000003,SH000008,SH000009,SH000010,SH000011,SH000012,SH000016,SH000017,SH000300,SZ399001,SZ399002,SZ399003,SZ399004,SZ399005,SZ399006,SZ399100,SZ399101,SZ399106,SZ399107,SZ399108,SZ399333,SZ399606";

        this.allZS_list = [];

        // 初始空数据
        this.state = {
            data: gupiaos
        };

        this.pageNumber = 20;
        this._isEnd = false;

    }

    //重写父类方法，不调super
    componentDidMount() {
        this.requestZSData();
    }
    componentWillUnMount() {
        this.zs_Request && this.zs_Request.cancel();
    }
    //处理数据，转成之前的数据格式
    requestZSData() {
        this.zs_Request && this.zs_Request.cancel();
        this.zs_Request = connection.request('FetchStaticQuoteNative', {
            subcribes: this.objs_grpc,
            unsubcribes: '',
        }, (returndata) => {
            let dataList = (Platform.OS === 'ios' ? returndata.entitiesArray : returndata.entitiesList);
            for (let i = 0; i < dataList.length; i++) {
                let itemData = {
                    Obj: '',
                    ZhangFu: 0,
                    ZhongWenJianCheng: '',
                    ZuiXinJia: 0,
                    ZhenFu: 0,
                    HuanShou: 0
                };
                itemData.Obj = dataList[i].label;
                itemData.ZhangFu = dataList[i].increaseRatio;
                itemData.ZhongWenJianCheng = dataList[i].name;
                itemData.ZuiXinJia = dataList[i].price;
                itemData.ZhenFu = dataList[i].amplitude;
                itemData.HuanShou = dataList[i].exchangeRatio;
                this.allZS_list.push(itemData);
                if (this.allZS_list.length == (blockPath.objs).length) {
                    this.setState({ data: this.allZS_list })
                }
                itemData = null;
            }
        })
    }
    getNewArray(array) {

        let { field, desc } = this.props.params;
        let messages = array;
        let newArray = [];

        for (var j = 0, length = messages.length; j < length; j++) {
            var temp1 = Object.assign({}, messages[j]);
            newArray.push(temp1);
        }

        if (field === 'ZhangFu') {
            if (desc) {
                //现价由小到大
                newArray.sort((a, b) => {
                    return a.ZhangFu - b.ZhangFu;
                });
            } else {
                //涨幅由大到小
                newArray.sort((a, b) => {
                    return b.ZhangFu - a.ZhangFu;
                })
            }
        } else {

            if (desc) {
                //现价由小到大
                newArray.sort((a, b) => {
                    return a.ZuiXinJia - b.ZuiXinJia;
                });

            } else {
                //现价由大到小
                newArray.sort((a, b) => {
                    return b.ZuiXinJia - a.ZuiXinJia;
                });
            }
        }

        return newArray;
    }

    _renderRow(rowData, rowID) {
        if (!rowData.Obj) return <View />;
        //console.log('全部排序 数据 ===  _renderRow = ' + JSON.stringify(rowData));
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (rowData.ZhangFu > 0) clr = baseStyle.UP_COLOR;
        else if (rowData.ZhangFu < 0) clr = baseStyle.DOWN_COLOR;
        return (
            <TouchableOpacity onPress={this._onItemPress.bind(this, rowData, rowID)}>
                <View style={styles.container}>
                    <View key="ZhongWenJianCheng" style={{
                        flex: 1, flexDirection: 'column', justifyContent: 'center',
                    }}>
                        <StockFormatText style={{
                            color: baseStyle.BLACK_100,
                            fontSize: RATE(30),
                            marginBottom: 4,
                            textAlign: 'left',
                        }}>{rowData.ZhongWenJianCheng}</StockFormatText>
                        <StockFormatText style={{
                            color: baseStyle.BLACK_70,
                            fontSize: RATE(24),
                            textAlign: 'left',
                        }}>{rowData.Obj}</StockFormatText>
                    </View>

                    <View key="ZuiXinJia" style={{ flex: 0.5 }}>
                        <StockFormatText titlename={"ZuiXinJia"} style={{
                            textAlign: 'right',
                            fontSize: RATE(30),
                            color: clr,
                            fontFamily: 'Helvetica Neue'
                        }}>{rowData.ZuiXinJia}</StockFormatText>
                    </View>

                    <View key="ZhangFu" style={{ flex: 1, }}>
                        <StockFormatText style={{ textAlign: 'right', fontSize: RATE(30), color: clr, fontFamily: 'Helvetica Neue' }} unit="%"
                            sign={true}>{rowData.ZhangFu / 100}</StockFormatText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    _onItemPress(data, rowID) {
        let index = parseInt(rowID);
        let array = this.state.data ? this.getNewArray(this.state.data) : [];
       
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: array,
            index: index
        })
    }

    render() {
        let data = this.getNewArray(this.state.data);
        return (
            <View>
                {
                    data && data.length > 0 &&
                    <StockList data={data} renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, rowID)} />
                }
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 49,
        marginLeft: 12,
        marginRight: 12,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
    },
});