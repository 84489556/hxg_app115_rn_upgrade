import React, { Component } from "react";
import { DeviceEventEmitter, Platform, ScrollView, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import * as baseStyle from "../../components/baseStyle.js";
import StockFormatText from "../../components/StockFormatText";
import YDSwiper from '../../components/YDSwiper';
import ShareSetting from "../../modules/ShareSetting.js";
import { DISTANCE } from "../../utils/fontRate";
import QuotationListener from "../../utils/QuotationListener";
import BlockBar from "./BlockChart";
import SortStockList from './SortStockList';

let stocksArray = ['SH000001', 'SZ399001', 'SZ399006', 'SZ399005', 'SH000300', ''];
// let reqStocksArray = ['SH000001', 'SZ399001', 'SZ399006', 'SZ399005', 'SH000300'];
// let stocksArray_grpc = 'SH000001,SZ399001,SZ399006,SZ399005,SH000300';



export class HuShenPage extends Component {

    constructor(props) {
        super(props);

        this.objData = [];
        this.zs5_request = undefined;
        this.state = {
            isRenderBlockList: true,
            _quoteData: [
                { Obj: 'SH000001', ZhongWenJianCheng: '上证指数', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SZ399001', ZhongWenJianCheng: '深证成指', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SZ399006', ZhongWenJianCheng: '创业板指', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                // { Obj: 'SH000016', ZhongWenJianCheng: '上证50', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SZ399005', ZhongWenJianCheng: '中小板指', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SH000300', ZhongWenJianCheng: '沪深300', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
            ],
        };
        this.indexCodes = []; // 首页指数代码
        this.state._quoteData.forEach(obj => {
            this.indexCodes.push(obj.Obj);
        });

    }

    componentWillMount() {
        this._addListeners();
        
    }

    componentDidMount() {
        this.ZS_ISREGISTER = DeviceEventEmitter.addListener('ZS_ISREGISTER', (isRegister, name) => {
            // console.log('自选股 =hushen=ZS_ISREGISTER='+isRegister,'currRoute='+currRoute,'currRoute_3='+currRoute_3)
          
            if (name) {
                if (isRegister) {
                    setTimeout(() => {
                        if (currRoute == "AppMain" && currRoute_3 == "HS") {
                            // this.requestZSData();
                            this._loadQuoteData();
                        }
                    }, 1000)
                } else {
                    // this.zs5_request && connection.unregister(this.zs5_request.qid, stocksArray_grpc);
                    // this.zs5_request && _unsubscribeQuoteData();
                    this.isRequestZSData&&this._unsubscribeQuoteData();
                }
            } else {
                if (isRegister) {
                    if (currRoute_3 == 'HS'){
                        // this.requestZSData();
                        this._loadQuoteData();
                    }
                } else {
                    // this.zs5_request && connection.unregister(this.zs5_request.qid, stocksArray_grpc);
                    // this.zs5_request && _unsubscribeQuoteData();
                    this.isRequestZSData&&this._unsubscribeQuoteData();
                }
            }
        });

        this.isRequestZSData = DeviceEventEmitter.addListener('isRequestZSData', () => {
            this.setState({ isRenderBlockList: false }, () => {
                this.setState({ isRenderBlockList: true })
            })
            // this.zs5_request && connection.unregister(this.zs5_request.qid, stocksArray_grpc);
            // this.zs5_request && _unsubscribeQuoteData();
            this._unsubscribeQuoteData();
            setTimeout(() => {
                // this.requestZSData();
                this._loadQuoteData();

            }, 1000)
        });

    }

    componentWillUnmount() {
        //  console.log('自选股 =hushen=componentWillUnmount=');

        this.ZS_ISREGISTER && this.ZS_ISREGISTER.remove();
        this.isRequestZSData && this.isRequestZSData.remove();

        // this.appMainTabChange && this.appMainTabChange.remove();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    _addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            // console.log('自选股 =hushen=willFocus=')
            if (currRoute_3 == 'HS')
            this._loadQuoteData();

        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            // console.log('自选股 =hushen=willBlur=')
            if (currRoute_3 == 'HS')
            this._unsubscribeQuoteData();
        });
        
            
       
        // this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
        //     if (obj != 0) {
        //         console.log('自选股 =hushen', '_unsubscribeQuoteData');

        //         this._unsubscribeQuoteData();
        //     } else {
        //         console.log('自选股 =hushen', '_loadQuoteData');
        //         this._loadQuoteData();
        //     }
        // });
    }
    // 取消订阅报价数据
    _unsubscribeQuoteData() {
        // console.log('自选股 ==_unsubscribeQuoteData='+this.indexCodes);

        QuotationListener.offListeners(this.indexCodes);
    }

    _loadQuoteData() {
        // console.log('自选股 ==_addListenersQuoteData='+this.indexCodes);
        QuotationListener.getStockListInfo(this.indexCodes, (stocks) => {
            for (let i = 0; i < this.state._quoteData.length; i++) {
                for (let j = 0; j < stocks.length; j++) {
                    if (this.state._quoteData[i].Obj == stocks[j].c) {
                        this.state._quoteData[i].ZuiXinJia = parseFloat(stocks[j].k).toFixed(2);
                        this.state._quoteData[i].ZhangDie = parseFloat(stocks[j].x).toFixed(2);
                        this.state._quoteData[i].ZhangFu = parseFloat(stocks[j].y).toFixed(2);
                    }
                }
            }
            // this.setState(this.zs_Data);
            this.setState({ _quoteData: this.state._quoteData });
        });
        QuotationListener.addListeners(this.indexCodes, (stock) => {
            for (let i = 0; i < this.state._quoteData.length; i++) {
                if (this.state._quoteData[i].Obj == stock.c) {

                    this.state._quoteData[i].ZuiXinJia = parseFloat(stock.k).toFixed(2);
                    //console.log("设置值后", this.state._quoteData[i].ZuiXinJia)
                    this.state._quoteData[i].ZhangDie = parseFloat(stock.x).toFixed(2);
                    this.state._quoteData[i].ZhangFu = parseFloat(stock.y).toFixed(2);
                }
            }
            this.setState({ _quoteData: this.state._quoteData });
            // this.setState({});

        });
    }


    // 详情页跳转
    _onItemPress(datas, indexCode) {
        let index = stocksArray.indexOf(indexCode);
        // let stocks = Object.values(this.zs_Data);

       // let stocks = Object.values(this.state._quoteData);

        //console.log("跳转股票",index)

        let data = {};
        data.Obj = this.state._quoteData[index].Obj;
        data.ZhongWenJianCheng = this.state._quoteData[index].ZhongWenJianCheng;
        data.obj = this.state._quoteData[index].Obj;
        let codeArray = [];
        if ( this.state._quoteData.length > 0) {
            for (let i = 0; i <  this.state._quoteData.length; i++) {
                let itemObj = {};
                itemObj.Obj = this.state._quoteData[i].Obj;
                itemObj.ZhongWenJianCheng = this.state._quoteData[i].ZhongWenJianCheng;
                itemObj.obj = this.state._quoteData[i].Obj;
                codeArray.push(itemObj)
            }
        }
        // Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
        //     ...data,
        //     array: codeArray,
        //     index: path.row,
        //     isNull: "",
        // })
        //console.log("跳转股票",codeArray)
         Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: codeArray,
            index: index,
            isPush: true,
        })
    }

    _moreIndex() {

        Navigation.navigateForParams(this.props.navigation, 'HuShenZhiShu')
    }

    // 指数barItem
    _renderSwiperIndex(indexCode, index) {
        let data = this.state._quoteData[index] || {}, up = data.ZhangFu || 0;
        // let data = this.state[indexCode] || {}, up = data.ZhangFu || 0;

        let color = up > 0 ? baseStyle.UP_COLOR : (up < 0 ? baseStyle.DOWN_COLOR : baseStyle.DEFAULT_TEXT_COLOR);
        let priceStyle = {
            fontWeight: 'bold',
            paddingVertical: 5,
            textAlign: 'center',
            includeFontPadding: false,
            textAlignVertical: 'center',
            color,
            fontSize: 20
        };
        let riseContainerStyle = {
            flexDirection: 'row',
            justifyContent: (Platform.OS === 'ios') ? 'center' : 'space-around',
            paddingHorizontal: (Platform.OS === 'ios') ? 0 : 10,
            includeFontPadding: false,
            textAlignVertical: 'center',
        };
        let riseStyle = {
            textAlign: 'center',
            color: baseStyle.BLACK_70,
            fontSize: 12,
            marginHorizontal: (Platform.OS === 'ios') ? 5 : 5,
            includeFontPadding: false,
            textAlignVertical: 'center',
        };
        let can = true;
        return (
            <TouchableHighlight key={indexCode}
                style={{
                    flex: 1,
                    width: ShareSetting.getDeviceWidthDP() / 3,
                    backgroundColor: baseStyle.LINE_BG_F6,
                    padding: DISTANCE(10)
                }}
                underlayColor={baseStyle.HIGH_LIGHT_COLOR}

                onPress={() => {
                    if (can) {
                        indexCode ? this._onItemPress(data, indexCode) : this._moreIndex()
                        can = false;
                    }
                    setTimeout(() => {
                        can = true;
                    }, 1000)

                }
                }>

                {indexCode ?
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 0,
                        borderRadius: 2,
                        height: DISTANCE(160),
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{ backgroundColor: baseStyle.WHITE }}>
                            <StockFormatText style={{
                                textAlign: 'center',
                                color: baseStyle.BLACK_100,
                                fontSize: 16,
                            }}>{data.ZhongWenJianCheng}</StockFormatText>
                        </View>
                        <StockFormatText style={priceStyle}>{data.ZuiXinJia}</StockFormatText>
                        <View style={riseContainerStyle}>
                            <StockFormatText sign={true} style={riseStyle}>{data.ZhangDie}</StockFormatText>
                            <StockFormatText unit='%' sign={true}
                                style={riseStyle}>{data.ZhangFu / 100}</StockFormatText>
                        </View>
                    </View>
                    :
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 0,
                        borderRadius: 2,
                        height: DISTANCE(160),
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            textAlign: 'center',
                            color: baseStyle.BLACK_100,
                            fontSize: 16,
                        }}>更多指数</Text>
                    </View>
                }

            </TouchableHighlight>
        );
    }

    // 返回 scrollView(指数bar + 行业bar + 概念bar + 涨幅榜 + 跌幅榜)
    render() {
        let stockView1 =
            <View style={styles.indexBar} key = {1} > 
                {stocksArray.map(
                    (indexCode, index) => (
                        index <= 2 ? this._renderSwiperIndex(indexCode, index) : null
                    ))
                }
            </View>
        let stockView2 =
            <View style={styles.indexBar} key = {2}>
                {stocksArray.map(
                    (indexCode, index) => (
                        index > 2 ? this._renderSwiperIndex(indexCode, index) : null
                    ))
                }
            </View>
        let gydViews = [stockView1, stockView2]


        return (
            <ScrollView>

                <YDSwiper pageControlStyle={'CircleDot'} pageControlBgColor={baseStyle.LINE_BG_F6}>
                    {gydViews}
                </YDSwiper>

                {this.state.isRenderBlockList
                    ?
                    <BlockBar style={styles.indexBlock}
                        title={'行业板块'}
                        gql={'block=股票\\\\大智慧自定义\\\\行业板块'}
                        mainkey={'industry'}
                        params={{ desc: true }}
                        navigation={this.props.navigation} />
                    :
                    <View />
                }

                {this.state.isRenderBlockList
                    ?
                    <BlockBar style={styles.indexBlock}
                        title={'概念板块'}
                        gql={'block=股票\\\\大智慧自定义\\\\热门概念'}
                        mainkey={'concept'}
                        params={{ desc: true }}
                        navigation={this.props.navigation} />
                    :
                    <View />
                }

                {this.state.isRenderBlockList
                    ?
                    <SortStockList title={ShareSetting.getZhangFuBangTitle()}
                        params={{}}
                        navigation={this.props.navigation} />
                    :
                    <View />
                }

                {this.state.isRenderBlockList
                    ?
                    <SortStockList title={ShareSetting.getDieFuBangTitle()}
                        params={{ desc: false }}
                        navigation={this.props.navigation} />
                    :
                    <View />
                }

            </ScrollView>
        )
    }
}

let styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 49,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.LINE_BG_F1
    },
    indexBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    indexBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});

