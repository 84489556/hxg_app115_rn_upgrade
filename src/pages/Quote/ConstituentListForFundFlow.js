/*
 * @Author: lishuai 
 * @Date: 2019-09-26 16:11:57 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-08-28 14:47:53
 * 资金流向板块详情页下面的资金流向列表
 */

import React from 'react';
import { AppState, FlatList, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import * as baseStyle from '../../components/baseStyle';
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from '../BaseComponentPage';
import FundsFlowStatisticGraph from '../MainDecision/FundsFlowStatisticGraph';
import { getSectorType } from "./DownLoadStockCode";
import { connection } from "./YDYunConnection";

const pageCount = 5;

export default class ConstituentListForFundsFlowPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.code = this.props.code;
        this.name = this.props.name;
        this.isDidMount = false;
        this.subscribedStocks = []; // 当前已注册的股票
        this.blockId = '';
        this.stockTotalCount = 0;
        this.titleId = 1000; // 排序抬头,抬头对应的ID请查看proto文件定义。当日主力资金净流入: 1000,3日主力资金净流入: 1001,5日主力资金净流入: 1002,10日主力资金净流入: 1003
        this.desc = true; // 排序方式 升序 降序
        this.start = 0; // 从当前位置开始请求板块排序数据
        this.graphIsShow = false;
        this.state = {
            tradingStatus: 0, // 竞价交易状态，清盘状态(status=1)时饼图符号不可点击
            data: [{}, {}, {}, {}, {}],
            neededRenderGraph: false, // 是否需要渲染资金流线统计饼图
        }
    }
    componentDidMount() {
        this.isDidMount = true;
        this._addNavigationChangeListener();
        this._getSectorType();
        // this._setInterval();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.code !== this.code) {
            this.code = nextProps.code;
            this.nativeFetchFullQuote([], this.subscribedStocks);
            this.subscribedStocks = [];
            this._getSectorType();
        }
    }
    componentWillUnmount() {
        this.isDidMount = false;
        this.blockSortRequest && this.blockSortRequest.cancel();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    _setInterval() {
        this.interval = setInterval(() => {
            this.setState({});
        }, 2000);
    }
    //监听导航变化
    _addNavigationChangeListener() {
        // console.log('资金流向板块详情页 监听导航变化');
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            AppState.addEventListener('change', this._handleAppStateChange);
            this._getSectorType();
            // this._setInterval();
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            AppState.removeEventListener('change', this._handleAppStateChange);
            // this.interval && clearInterval(this.interval);
            this.blockSortRequest && this.blockSortRequest.cancel();
            this.nativeFetchFullQuote([], this.subscribedStocks);
            this.subscribedStocks = [];
        });
    }
    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            // NetInfo.fetch().then((connectionInfo) => {
            //   if (connectionInfo.type != 'none' && connectionInfo.type != 'NONE') {
            this._getSectorType();
            //   }
            // });
        } else if (nextAppState === 'background') {
            this.nativeFetchFullQuote([], this.subscribedStocks);
            this.subscribedStocks = [];
        }
    }
    find(array, code) {
        let ret = null;
        for (let i = 0; i < array.length; i++) {
            if (array[i].Obj == code) {
                ret = array[i];
                break;
            }
        }
        return ret;
    }
    fetchFullQuote(data) {
        let sortData = data.map(obj => {
            return obj.Obj;
        });
        let nextReg = [], nextUnReg = [];
        for (let i = 0; i < sortData.length; i++) {
            if (this.subscribedStocks.indexOf(sortData[i]) == -1) {
                nextReg.push(sortData[i]);
            }
        }
        for (let i = 0; i < this.subscribedStocks.length; i++) {
            if (sortData.indexOf(this.subscribedStocks[i]) == -1) {
                nextUnReg.push(this.subscribedStocks[i]);
            }
        }
        // 已注册股票和将要注册股票的交集
        let intersection = this.subscribedStocks.filter(function (v) {
            return sortData.indexOf(v) > -1;
        });

        let x = intersection.concat(nextReg);

        this.subscribedStocks = x;

        this.nativeFetchFullQuote(nextReg, nextUnReg);
    }
    nativeFetchFullQuote(subscribes, unsubscribes) {
        connection.yd_fetchFullQuote(subscribes, unsubscribes, this.receiveData);
    }

    receiveData = (data) => {
        if (!(data instanceof Error) && this.isDidMount == true) {
            let objs = this.state.data ? this.state.data : [];
            this.tradingStatus = data.quote.status;
            if (this.state.tradingStatus != data.quote.status) {
                this.setState({ tradingStatus: data.quote.status });
            }
            let index = -1;
            for (let i = 0; i < objs.length; i++) {
                if (objs[i].Obj === data.quote.label) {
                    index = i;
                    break;
                }
            }
            if (index == -1) return;
            let obj = objs[index];
            let needed = this.renderIfNeeded(data, obj);
            if (needed) {
                obj.ZhangFu = parseFloat(data.quote.increaseRatio).toFixed(2);
                obj.ZuiXinJia = parseFloat(data.quote.price).toFixed(2);
                obj.ZhongWenJianCheng = data.quote.name;
                obj.hugeNet1Day = data.fundFlow.hugeNet1Day;
                obj.hugeNet3Day = data.fundFlow.hugeNet3Day;
                obj.hugeNet5Day = data.fundFlow.hugeNet5Day;
                obj.hugeNet10Day = data.fundFlow.hugeNet10Day;
                obj.hugeIn = data.fundFlow.hugeIn;
                obj.hugeOut = data.fundFlow.hugeOut;
                obj.superIn = data.fundFlow.superIn;
                obj.superOut = data.fundFlow.superOut;
                obj.largeIn = data.fundFlow.largeIn;
                obj.largeOut = data.fundFlow.largeOut;
                obj.mediumIn = data.fundFlow.mediumIn;
                obj.mediumOut = data.fundFlow.mediumOut;
                obj.littleIn = data.fundFlow.littleIn;
                obj.littleOut = data.fundFlow.littleOut;
                this.setState({ data: objs });
            }
        }
    }
    renderIfNeeded(obj, otherObj) {
        let fixedPrice = parseFloat(obj.quote.price).toFixed(2);
        let fixedRatio = parseFloat(obj.quote.increaseRatio).toFixed(2);
        if (fixedRatio !== otherObj.ZhangFu ||
            fixedPrice !== otherObj.ZuiXinJia ||
            obj.fundFlow.hugeNet1Day !== otherObj.hugeNet1Day ||
            obj.fundFlow.hugeNet3Day !== otherObj.hugeNet3Day ||
            obj.fundFlow.hugeNet5Day !== otherObj.hugeNet5Day ||
            obj.fundFlow.hugeNet10Day !== otherObj.hugeNet10Day) {
            return true;
        }
        return false;
    }
    _getSectorType() {
        if (!this.code || !this.code.length) return;
        getSectorType(this.code, (sectorCode, totalStockNum) => {
            if (sectorCode !== undefined) {
                this.blockId = sectorCode;
                this.stockTotalCount = totalStockNum;
                this._loadData();
            }
        });
    }
    _loadData() {
        let requestCount = Math.min(this.state.stockTotalCount, pageCount);
        requestCount = 5;
        this.blockSortRequest && this.blockSortRequest.cancel();
        this.blockSortRequest = connection.request('FetchBlockSortNative', {
            blockid: this.blockId,
            fundFlowTitle: this.titleId,
            desc: this.desc,
            start: this.start,
            count: requestCount,
            subscribe: true
        }, ev => {
            var data = ev;
            if (Platform.OS === 'android') {
                data = data.map(obj => {
                    return { Obj: obj.label_, value: obj.value_ };
                });
            }
            var tempObjs = this.state.data ? this.state.data : [];
            if (tempObjs.length) {
                let newData = data.map(obj => {
                    let x = this.find(tempObjs, obj.Obj);
                    if (x) {
                        return {
                            Obj: x.Obj,
                            ZuiXinJia: x.ZuiXinJia,
                            ZhongWenJianCheng: x.ZhongWenJianCheng,
                            ZhangFu: x.ZhangFu,
                            hugeNet1Day: x.hugeNet1Day,
                            hugeNet3Day: x.hugeNet3Day,
                            hugeNet5Day: x.hugeNet5Day,
                            hugeNet10Day: x.hugeNet10Day,
                            hugeIn: x.hugeIn,
                            hugeOut: x.hugeOut,
                            superIn: x.superIn,
                            superOut: x.superOut,
                            largeIn: x.largeIn,
                            largeOut: x.largeOut,
                            mediumIn: x.mediumIn,
                            mediumOut: x.mediumOut,
                            littleIn: x.littleIn,
                            littleOut: x.littleOut,
                        };
                    } else {
                        return obj;
                    }
                })
                for (let i = 0, j = this.start; i < newData.length; i++, j++) {
                    tempObjs[j] = newData[i];
                }
            } else {
                tempObjs = data;
            }
            this.setState({ data: tempObjs }, () => {
                this.fetchFullQuote(data);
            });
        });
    }
    _moreBtnOnClick() {
        Navigation.pushForParams(this.props.navigation, 'ConstituentForFundsFlowPage', {
            code: this.code,
            name: this.name
        });
    }
    _sortBtnOnClick() {
        this.desc = !this.desc;
        this._clearDataAndReload();
    }
    _clearDataAndReload() {
        this.setState({ data: [{}, {}, {}, {}, {}] });
        this._loadData();
    }
    _stockOnClick(item, index) {
        let array = this.state.data[0].items ? this.state.data[0].items : [];
        Navigation.pushForParams(this.props.navigation, 'DetailPage', {
            ...item,
            array: array,
            index: index,
            isPush: true
        });
    }
    _getStockTextColor(x) {
        if (isNaN(x) || !isFinite(x)) {
            x = 0;
        }
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (x > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (x < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        return clr;
    }
    _getStockBgColor(x) {
        if (isNaN(x) || !isFinite(x)) {
            x = 0;
        }
        let clr = '#0000000d';
        if (x > 0) {
            clr = '#F924000d';
        } else if (x < 0) {
            clr = '#3399000d';
        }
        return clr;
    }
    _renderItem = (x) => {
        if (!x.item) return null;
        let item = x.item;
        let priceClr = this._getStockTextColor(item.ZhangFu);
        let hugeNet1DayTextColor = this._getStockTextColor(item.hugeNet1Day);
        let hugeNet3DayTextColor = this._getStockTextColor(item.hugeNet3Day);
        let hugeNet5DayTextColor = this._getStockTextColor(item.hugeNet5Day);
        let hugeNet10DayTextColor = this._getStockTextColor(item.hugeNet10Day);
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{ paddingTop: 15, paddingBottom: 15, backgroundColor: '#ffffff', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}
                onPress={() => this._stockOnClick(item, x.index)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingLeft: 10, paddingRight: 10, backgroundColor: '#ffffff' }}>
                    <View style={{ flex: 0.25, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, paddingRight: 10, backgroundColor: '#3399FF0d' }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => this._stockOnClick(item, x.index)}>
                            <Text style={{ fontSize: 15 }}>{item.ZhongWenJianCheng && item.ZhongWenJianCheng}</Text>
                            <Text style={{ fontSize: 12, color: '#666666' }}>{item.Obj && item.Obj}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 10, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} disabled={this.state.tradingStatus == 1} onPress={() => {
                            if (this.graphIsShow) return;
                            this.setState({ neededRenderGraph: true }, () => {
                                // this.interval && clearInterval(this.interval);
                                this.refs.graph && this.refs.graph.show(item)
                            });
                        }}>
                            <Image style={{ width: 20, height: 20 }} source={require('../../images/MainDecesion/main_decision_fund_icon.png')}></Image>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 0.25, justifyContent: 'center', alignItems: 'center', marginLeft: 1, marginRight: 1, borderRadius: 5, backgroundColor: this._getStockBgColor(item.ZhangFu) }} >
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: priceClr }} unit={'%'} sign={true}>{item.ZhangFu && item.ZhangFu / 100}</StockFormatText>
                    </View>
                    <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center', marginLeft: 1, marginRight: 1, borderRadius: 5, backgroundColor: '#3399FF0d' }} >
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: priceClr }}>{item.ZuiXinJia && item.ZuiXinJia}</StockFormatText>
                    </View>
                    <View style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center', marginLeft: 1, marginRight: 1, borderRadius: 5, backgroundColor: this._getStockBgColor(item.hugeNet1Day) }} >
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet1DayTextColor }} unit={'万/亿'}>{item.hugeNet1Day && parseFloat(item.hugeNet1Day)}</StockFormatText>
                    </View>
                </View>
                <View style={{ height: 55, flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: 2, paddingLeft: 10, paddingRight: 10, backgroundColor: '#ffffff' }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, borderRightWidth: 1, borderRightColor: '#0000001a', backgroundColor: this._getStockBgColor(item.hugeNet3Day) }} >
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet3DayTextColor }} unit={'万/亿'}>{item.hugeNet3Day && parseFloat(item.hugeNet3Day)}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000099', marginTop: Platform.OS == 'ios' ? 5 : 2 }}>3日主力净额</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this._getStockBgColor(item.hugeNet5Day) }} >
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet5DayTextColor }} unit={'万/亿'}>{item.hugeNet5Day && parseFloat(item.hugeNet5Day)}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000099', marginTop: Platform.OS == 'ios' ? 5 : 2 }}>5日主力净额</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 5, borderBottomRightRadius: 5, borderLeftWidth: 1, borderLeftColor: '#0000001a', backgroundColor: this._getStockBgColor(item.hugeNet10Day) }} >
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet10DayTextColor }} unit={'万/亿'}>{item.hugeNet10Day && parseFloat(item.hugeNet10Day)}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000099', marginTop: Platform.OS == 'ios' ? 5 : 2 }}>10日主力净额</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    _renderHeader() {
        let imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        return (
            <View>
                {this.props.renderHeaderComponent}
                <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15 }}>
                    <Text style={{ fontSize: 16, color: '#333333', fontWeight: 'bold' }}>成分股</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} activeOpacity={1} onPress={() => this._moreBtnOnClick()}>
                        <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                        <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2FAFF', paddingLeft: 10, paddingRight: 10 }}>
                    <Text style={{ flex: 0.3, fontSize: 12, color: '#00000099', textAlign: 'center' }}>股票名称</Text>
                    <Text style={{ flex: 0.2, fontSize: 12, color: '#00000099', textAlign: 'center' }}>涨跌幅</Text>
                    <Text style={{ flex: 0.2, fontSize: 12, color: '#00000099', textAlign: 'center' }}>现价</Text>
                    <TouchableOpacity style={{ flex: 0.3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                        <Text style={{ fontSize: 12, color: '#00000099' }}>当日主力净额</Text>
                        <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc} />
                    </TouchableOpacity>
                </View >
            </View>
        );
    }
    _graphDismissCallback = () => {
        this.graphIsShow = false;
        if (!this.state.neededRenderGraph) return;
        // this.interval && clearInterval(this.interval);
        // this._setInterval();
        this.setState({ neededRenderGraph: false })
    }
    graphDidMount = () => {
        this.graphIsShow = true;
    }
    render() {
        return (
            <>
                <FlatList style={{ flex: 1, backgroundColor: '#ffffff' }}
                    data={this.state.data}
                    renderItem={this._renderItem}
                    ListHeaderComponent={this._renderHeader()}
                />
                {this.state.neededRenderGraph && this.graphIsShow === false ? <FundsFlowStatisticGraph ref={'graph'} hiddenCallback={this._graphDismissCallback} onDidMount={this.graphDidMount} /> : null}
            </>
        )
    }
}
