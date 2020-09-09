/**
 * 六块板块展现
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform,
} from 'react-native';

import StockFormatText from '../../components/StockFormatText';
import * as baseStyle from "../../components/baseStyle.js";
import RATE from '../../utils/fontRate';
import Yd_sync from '../../wilddog/Yd_cloud';

export default class BlockChart extends Component {
    static defaultProps = {
        serviceUrl: "/stkdata",
    };

    defaultParams = {
        field: 'ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,LingZhangGu',
        orderby: 'ZhangFu',
        start: 0,
        count: 6,
        desc: true,
        mode: 2,
        sub: 1,
        position: 1,
    };

    constructor(props) {
        super(props);
        // 初始空数据
        this.state = {
            desc: true,
            FundFlowData: [],
            arrowPress: false,
        };
        this.mainkey = this.props.mainkey;
        this.title = this.props.title;
        this.defaultParams.gql = this.props.gql;
        this.block_concept_ref = Yd_sync("block_gn").ref("/quote_offer_price/concept_sector_top_6");
        this.block_industry_ref = Yd_sync("block_hy").ref("/quote_offer_price/industry_sector_top_6");
    }

    componentWillUnMount() {
        this.block_concept_ref && this.block_concept_ref.off("value", () => {
        })
        this.block_industry_ref && this.block_industry_ref.off("value", () => {
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState;
    }

    componentDidMount() {
        if (this.props.title == "行业板块") {
            this.block_industry_ref.on('value', (snapshot) => {
                if (snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            })
            this.block_industry_ref.get((snapshot) => {
                if (snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            });
        } else {
            this.block_concept_ref.on('value', (snapshot) => {
                if (snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            })
            this.block_concept_ref.get((snapshot) => {
                if (snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            });
        }
    }

    processStringData(strData, successCallBack) {
        let block_Data = {};
        let parseJsonObj = {};
        let dataList = [];
        let str1 = strData.replace(/\</g, "{")
        let str2 = str1.replace(/\>/g, "}")
        let str3 = str2.replace(/\$/g, ":")
        let arr = str3.split("&");
        arr.map((data, index) => {
            parseJsonObj = JSON.parse(data)
            block_Data = {
                Obj: parseJsonObj.A,
                ZhongWenJianCheng: parseJsonObj.B,
                ZuiXinJia: parseFloat(parseJsonObj.C),
                ZhangDie: parseFloat(parseJsonObj.D),
                ZhangFu: parseFloat(parseJsonObj.E),
                LingZhangGu: {
                    Obj: parseJsonObj.F,
                    ZhongWenJianCheng: parseJsonObj.G,
                    ZhangFu: parseFloat(parseJsonObj.H),
                    ShiJian: parseFloat(parseJsonObj.J),
                    ZuiXinJia: parseFloat(parseJsonObj.I)
                },
            }
            dataList.push(block_Data)
            if (index == arr.length - 1) {
                successCallBack(dataList)
                block_Data = null;
                parseJsonObj = null;
                dataList = null;
                str1 = null;
                str2 = null;
                str3 = null;
                arr = null;
            }
        })

    }

    renderCell(strData) {
        this.processStringData(strData, (list) => {
            this.setState({ FundFlowData: [] }, () => {
                this.setState({ FundFlowData: list })
            })
        })
    }


    render() {
        let data = this.state.FundFlowData;
        if (data === undefined || data.length === 0) {
            data = [{}, {}, {}, {}, {}, {}];
        }
        return (
            <View style={{ flexDirection: 'column' }}>
                <View style={{ height: 9, backgroundColor: baseStyle.LINE_BG_F6 }} />
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'space-between',
                    height: 35,
                    paddingHorizontal: 15,
                    backgroundColor: '#fff',
                    borderBottomWidth: 0.5,
                    borderBottomColor: baseStyle.LINE_BG_F1
                }}>
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{
                            color: baseStyle.BLACK_70,
                            fontSize: RATE(30),
                        }}>{this.title}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                            }}
                            activeOpacity={1}
                            onPressIn={() => this.setState({ arrowPress: true })}
                            onPressOut={() => this.setState({ arrowPress: false })}
                            onPress={this._intoAllList.bind(this)}>
                            <Image source={this.state.arrowPress
                                ? require('../../images/icons/arrow_right_bc_press_yes.png')
                                : require('../../images/icons/arrow_right_bc_press_no.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 0.5, backgroundColor: baseStyle.LINE_BG_F6 }} />
                <View style={styles.indexBar}>
                    {data.slice(0, 3).map((itemData, index) => this._renderIndex(itemData, index))}
                </View>
                <View style={styles.indexBar}>
                    {data.slice(3, 6).map((itemData, index) => this._renderIndex(itemData, index))}
                </View>
            </View>
        );
    }

    _renderIndex(itemData, index) {
        return (
            <BlockStockTop itemData={itemData}
                key = {index}
                itemIndex={index}
                onPress={() => {
                    this._onItemPress(itemData, index)
                }}
                navigation={this.props.navigation} />
        );
    }

    _onItemPress(itemData, index) {

        let array = this.state.FundFlowData ? this.state.FundFlowData : [];
       
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...itemData,
            array: array,
            index: index,
            isPush: true
        })
    }

    // 行业/概念板块跳转
    _intoAllList(data) {
        if (this.title === '行业板块') {
            Navigation.navigateForParams(this.props.navigation, 'AllBlockPage', { mainkey: 'allIndustry' })
        } else if (this.title === '概念板块') {
            Navigation.navigateForParams(this.props.navigation, 'AllBlockPage', { mainkey: 'allConcept' })
        }
    }

}

/** 具体板块下的领头股 ，可以通过field 添加 LingZhangGu 获取领涨股信息，不用再_query获取*/
class BlockStockTop extends Component {

    render() {

        let data = this.props.itemData || {};
        let topData = data.LingZhangGu

        let up = data.ZhangFu || 0;
        let color = up > 0
            ? baseStyle.UP_COLOR
            : (up < 0 ? baseStyle.DOWN_COLOR : baseStyle.DEFAULT_TEXT_COLOR);
        let priceStyle = {
            fontWeight: 'bold',
            paddingTop: 5,
            paddingBottom: 0,
            textAlign: 'center',
            color,
            fontSize: RATE(40),
            includeFontPadding: false,
        };
        let riseContainerStyle = {
            flexDirection: 'row',
            justifyContent: (Platform.OS === 'ios') ? 'center' : 'space-around',
            paddingHorizontal: (Platform.OS === 'ios') ? 0 : 10,
            paddingTop: 5,
            paddingBottom: 0,
        };
        let riseStyle = {
            textAlign: 'center',
            color: baseStyle.BLACK_70,
            fontSize: RATE(24),
            marginHorizontal: (Platform.OS === 'ios') ? 5 : null,
            includeFontPadding: false,
        };
        let borderRight = false;
        let borderBottom = false;
        if (this.props.itemIndex == 0 || this.props.itemIndex == 1) {
            borderRight = true;
            borderBottom = true;
        } else if (this.props.itemIndex == 2) {
            borderRight = false;
            borderBottom = true;
        } else if (this.props.itemIndex == 3 || this.props.itemIndex == 4) {
            borderRight = true;
            borderBottom = false;
        }
        return (
            <TouchableHighlight key={data.Obj}
                style={{
                    flex: 1,
                    paddingTop: 15,
                    paddingBottom: 11,
                    backgroundColor: baseStyle.WHITE,
                    borderRightWidth: borderRight ? 1 : 0,
                    borderRightColor: baseStyle.LINE_BG_F1,
                    borderBottomWidth: borderBottom ? 1 : 0,
                    borderBottomColor: baseStyle.LINE_BG_F1,
                }}
                underlayColor={baseStyle.HIGH_LIGHT_COLOR}
                onPress={() => this._onItemPress(data)}>
                <View>
                    <View style={{
                        // backgroundColor: baseStyle.WHITE
                    }}>
                        <StockFormatText style={{
                            textAlign: 'center',
                            color: baseStyle.BLACK_100,
                            fontSize: RATE(32),
                        }}>
                            {data.ZhongWenJianCheng}
                        </StockFormatText>
                    </View>
                    <StockFormatText unit='%' sign={true} style={priceStyle}>
                        {data.ZhangFu / 100}
                    </StockFormatText>
                    <StockFormatText style={{
                        fontSize: RATE(24),
                        textAlign: 'center',
                        color: baseStyle.BLACK_100,
                        paddingTop: 5,
                        paddingBottom: 0,
                    }}>
                        {topData && topData.ZhongWenJianCheng}
                    </StockFormatText>
                    <View style={riseContainerStyle}>
                        <StockFormatText style={riseStyle}>
                            {topData && topData.ZuiXinJia}
                        </StockFormatText>
                        <StockFormatText unit='%' sign={true} style={riseStyle}>
                            {topData && ((topData.ZhangFu) / 100)}
                        </StockFormatText>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }

    // 板块详情页跳转
    _onItemPress(data) {
        //直接跳详情，不进入板块列表
        this.props.onPress();
    }

}


let styles = StyleSheet.create({
    indexBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});

