/**
 * 板块成分股列表
 */
'use strict';

import React, { Component } from 'react';
import { AppState, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as baseStyle from '../../components/baseStyle';
import PullListView, { RefreshState } from '../../components/PullListView';
import StockFormatText from '../../components/StockFormatText';
import RATE from '../../utils/fontRate';
import { getSectorType } from "./DownLoadStockCode";
import { connection } from "./YDYunConnection";
import NetInfo from "@react-native-community/netinfo";

export default class ConstituentList extends Component {
    static defaultProps = {
        code: null,
        mainkey: '',
        title: ''
    };

    constructor(props) {
        super(props);

        this.state = {
            zhangF: 0, //0 ：降序，由大到小  1：升序，有小到大  2：默认排序
            xianJ: 2,
            SectorType: '',
            SectorTotal: 0,
        };
        this.mainkey = props.mainkey;
    }

    componentDidMount() {
        this._getSectorType(this.props.code);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.code !== nextProps.code) {
            this._getSectorType(nextProps.code);
        }
    }

    _getSectorType(code) {
        getSectorType(code, (sectorCode, totalStockNum) => {
            if (sectorCode !== undefined) {
                this.setState({ SectorType: sectorCode, SectorTotal: totalStockNum });
            }
        });
    }

    render() {
        let b = true;
        let file = 'ZhangFu';
        if (this.props.zhangF === 2) {
            file = 'ZuiXinJia';
            b = this.props.xianJ === 0 ? true : false;
        } else {
            b = this.props.zhangF === 0 ? true : false;
        }
        if (!this.state.SectorType.length) {
            return null;
        }
        return (
            <View style={{ flex: 1 }}>
                <Constituent
                    ref={constituent => (this.constituent = constituent)}
                    renderHeaderComponent={this.props.renderHeaderComponent}
                    con_scrollEnabled={this.props.con_scrollEnabled}
                    navigation={this.props.navigation}
                    code={this.state.SectorType}
                    total={this.state.SectorTotal}
                    params={{ field: file, desc: b }}
                />
            </View>
        );
    }
}

var PageCount = 20;

class Constituent extends Component {
    constructor(props) {
        super(props);
        this.isDidMount = false;
        this.subscribedStocks = []; // 当前已注册的股票
        this.state = {
            allData: [],
            refreshState: RefreshState.Idle,
            code: props.code,
        };
        this.field = props.params.field; // 排序抬头 涨跌幅 现价
        this.desc = props.params.desc; // 排序方式 升序 降序
        this.curTopRowIndex = 0; // 当前屏幕显示顶部行索引
        this.curBottomRowIndex = -1; // 当前屏幕显示底部行索引
        this.isDeceleration = false; // 滑动结束后是否有减速过程
        this.viewableRows = []; // 当前显示的行索引
        this.scrollEndDragEvent = null;
        this.scrollViewStartOffsetY = 0; //用于记录手指开始滑动时ScrollView组件的Y轴偏移量，通过这个变量可以判断滚动方向
        this.regStartFlag = 0; // 当前注册股票的开始标记索引
        this.regEndFlag = 0; // 当前注册股票的结束标记索引
        this.start = 0; // 从当前位置开始请求板块排序数据
        this.reqCount = PageCount;
    }

    componentDidMount() {
        this.isDidMount = true;
        this._query(this.state.code);
        this._addListener();
        this._addNavigationChangeListener();
    }

    componentWillUnmount() {
        this.isDidMount = false;
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }

    componentWillReceiveProps(nextProps) {
        // 股票代码、排序抬头、排序方式(升降序)变化都需要重新请求数据
        if (nextProps.code !== this.state.code ||
            nextProps.params.field !== this.field ||
            nextProps.params.desc !== this.desc) {
            this.field = nextProps.params.field;
            this.desc = nextProps.params.desc;
            this.cancel();
            this.setState({
                code: nextProps.code, allData: []
            }, () => {
                this.start = 0;
                this.reqCount = PageCount;
                this._query(nextProps.code);
            });
        }
    }

    _addNavigationChangeListener() {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            this._addListener();
            this._query(this.state.code);
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            AppState.removeEventListener('change', this._handleAppStateChange);
            this.netInfoSubscriber && this.netInfoSubscriber();
            this.cancel();
        });
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

    _addListener() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.netInfoSubscriber = NetInfo.addEventListener(this._handleConnectivityChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            NetInfo.fetch().then((state) => {
                if (state.type != 'none' || state.type != 'unknown') {
                    this._query(this.state.code);
                }
            });
        } else if (nextAppState === 'background') {
            this.cancel();
        }
    }
    _handleConnectivityChange = (state) => {
        if (state.type == 'none' || state.type == 'unknown') {
            this.cancel();
        } else {
            this._query(this.state.code);
        }
    }
    renderIfNeeded(obj, otherObj) {
        let fixedPrice = parseFloat(obj.price).toFixed(2);
        let fixedRatio = parseFloat(obj.increaseRatio).toFixed(2);
        if (fixedRatio !== otherObj.ZhangFu || fixedPrice !== otherObj.ZuiXinJia) {
            return true;
        }
        return false;
    }

    _query(code) {
        if (code === '') return;
        this.blockSortRequest && this.blockSortRequest.cancel();
        var title_id = 0;
        if (this.field === 'ZhangFu') {
            title_id = 199;
        } else if (this.field === 'ZuiXinJia') {
            title_id = 33;
        }
        // 如果获取的count超出validCount，grpc会返回错误"grpc: error while marshaling: proto: repeated field Data has nil element"
        let requestCount = Math.min(this.props.total, this.reqCount);
        let params = {
            blockid: code,
            titleid: title_id,
            desc: this.desc,
            start: this.start,
            count: requestCount,
            subscribe: true
        };
        this.blockSortRequest = connection.request('FetchBlockSortNative', params, (ev) => {
            this.regStartFlag = this.start;
            this.regEndFlag = this.start + this.reqCount;
            var data = ev.map(obj => {
                if (this.field === 'ZhangFu') {
                    return { Obj: obj.Obj, ZhangFu: parseFloat(obj.value).toFixed(2), ZhongWenJianCheng: '--', ZuiXinJia: '--' };
                } else if (this.field === 'ZuiXinJia') {
                    return { Obj: obj.Obj, ZuiXinJia: parseFloat(obj.value).toFixed(2), ZhongWenJianCheng: '--', ZhangFu: '--' };
                } else {
                    return { Obj: obj.Obj, ZuiXinJia: '--', ZhongWenJianCheng: '--', ZhangFu: '--' };
                }
            });
            var tempObjs = this.state.allData ? this.state.allData.slice() : [];
            if (tempObjs.length) {
                let newData = data.map(obj => {
                    let x = this.find(tempObjs, obj.Obj);
                    if (x) {
                        return { Obj: x.Obj, ZuiXinJia: x.ZuiXinJia, ZhongWenJianCheng: x.ZhongWenJianCheng, ZhangFu: x.ZhangFu };
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
            if (tempObjs.length == 0) {
                this.setState({ allData: tempObjs, refreshState: RefreshState.EmptyData });
            } else if (tempObjs.length >= this.props.total) {
                this.setState({ allData: tempObjs, refreshState: RefreshState.NoMoreData }, () => {
                    this.fetchFullQuote(data);
                });
            } else {
                this.setState({ allData: tempObjs, refreshState: RefreshState.Idle }, () => {
                    this.fetchFullQuote(data);
                });
            }
        });
    }

    cancel() {
        this.blockSortRequest && this.blockSortRequest.cancel();
        this.nativeFetchFullQuote([], this.subscribedStocks);
        this.subscribedStocks = [];
    }

    fetchFullQuote(data) {
        let sortData = data.map(obj => {
            return obj.Obj;
        });
        let showCountOfScreen = this.viewableRows.length == 0 ? PageCount : this.viewableRows.length + 2;
        let slicedSortData = sortData.length > showCountOfScreen ? sortData.slice(0, showCountOfScreen) : sortData.slice();
        let nextReg = [], nextUnReg = [];
        for (let i = 0; i < slicedSortData.length; i++) {
            if (this.subscribedStocks.indexOf(slicedSortData[i]) == -1) {
                nextReg.push(slicedSortData[i]);
            }
        }
        for (let i = 0; i < this.subscribedStocks.length; i++) {
            if (slicedSortData.indexOf(this.subscribedStocks[i]) == -1) {
                nextUnReg.push(this.subscribedStocks[i]);
            }
        }
        // 已注册股票和将要注册股票的交集
        let intersection = this.subscribedStocks.filter(function (v) {
            return slicedSortData.indexOf(v) > -1;
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
            let objs = this.state.allData ? this.state.allData.slice() : [];
            let x = data;
            if (x.hasQuote) {
                let quote = x.quote;
                let index = -1;
                for (let i = 0; i < objs.length; i++) {
                    if (objs[i].Obj === quote.label) {
                        index = i;
                        break;
                    }
                }
                if (index == -1) return;
                let needed = this.renderIfNeeded(quote, objs[index]);
                if (needed) {
                    let obj = objs[index];
                    obj.ZhangFu = parseFloat(quote.increaseRatio).toFixed(2);
                    obj.ZuiXinJia = parseFloat(quote.price).toFixed(2);
                    obj.ZhongWenJianCheng = quote.name;
                    objs[index] = obj;
                    this.setState({ allData: objs });
                }
            }
        }
    }

    _onItemPress = (data, rowID) => {
        let array = this.state.allData;
        let stocks = [];
        for (let i = 0; i < array.length; i++) {
            stocks.push(Object.assign({}, array[i]));
        }
        Navigation.pushForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: stocks,
            index: rowID
        });
    }

    keyExtractor = (item, index) => {
        return index.toString();
    }

    _handlerScrollEvent = (value) => {
        // 排序当前屏幕显示行数据
        this.viewableRows.sort((a, b) => a - b);
        this.curTopRowIndex = this.viewableRows[0] >= 1 ? this.viewableRows[0] - 1 : this.viewableRows[0];
        this.curBottomRowIndex = this.viewableRows[this.viewableRows.length - 1] + 1;
        const offsetY = value.contentOffset.y;
        if (!this.curTopRowIndex) return;
        // 上拉
        if (offsetY > this.scrollViewStartOffsetY) {
            this.start = this.curTopRowIndex;
            this.reqCount = this.viewableRows.length + 2;
            if (this.curBottomRowIndex >= this.state.allData.length) {
                this.reqCount = PageCount + this.viewableRows.length;
                this.setState({
                    refreshState: RefreshState.FooterRefreshing
                });
            }
            this._query(this.state.code);
        } else if (offsetY < this.scrollViewStartOffsetY) {
            if (this.curTopRowIndex < this.regStartFlag) {
                this.start = this.curTopRowIndex;
                this.reqCount = this.viewableRows.length + 2;
                this._query(this.state.code);
            }
        }
        this.viewableRows = [];
    }

    renderRow = rowData1 => {
        let rowData = rowData1.item;
        return (
            <ConstituentListItem data={{ ...rowData }} index={rowData1.index} itemOnClick={this._onItemPress} />
        );
    }

    render() {
        let data = this.state.allData;

        return (
            <View>
                <PullListView
                    bounces={true}
                    con_scrollEnabled={this.props.con_scrollEnabled}
                    renderHeaderComponent={this.props.renderHeaderComponent}
                    data={data}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderRow}
                    refreshState={this.state.refreshState}
                    cy_onScrollBeginDrag={(event) => {
                        //event.nativeEvent.contentOffset.y表示Y轴滚动的偏移量
                        const offsetY = event.nativeEvent.contentOffset.y;
                        //记录ScrollView开始滚动的Y轴偏移量
                        this.scrollViewStartOffsetY = offsetY;
                    }}
                    cy_onScrollEndDrag={(event) => {
                        // 由于event需要在setTimeout回调内使用，所以需要保存event
                        this.scrollEndDragEvent = event.nativeEvent;
                        setTimeout(() => {
                            if (!this.isDeceleration) {
                                this._handlerScrollEvent(this.scrollEndDragEvent);
                            }
                        }, 100);
                    }}
                    cy_onMomentumScrollBegin={() => {
                        this.isDeceleration = true;
                    }}
                    cy_onMomentumScrollEnd={(event) => {
                        this.isDeceleration = false;
                        this._handlerScrollEvent(event.nativeEvent);
                    }}
                    setChangeVisibleRowCallback={(info) => {
                        info.viewableItems.forEach(element => {
                            if (this.viewableRows.includes(element.index) == false) {
                                this.viewableRows.push(element.index);
                            }
                        });
                        info.changed.forEach(element => {
                            if (!element.isViewable) {
                                let index = this.viewableRows.indexOf(element.index);
                                this.viewableRows.splice(index, 1);
                            }
                        });
                    }}
                />
            </View>
        );
    }
}

export class ConstituentListItem extends Component {
    shouldComponentUpdate(nextProps) {
        if (this.props.data.ZhangFu !== nextProps.data.ZhangFu || this.props.data.ZuiXinJia !== nextProps.data.ZuiXinJia) {
            return true;
        }
        return false;
    }
    render() {
        let rowData = this.props.data;
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (rowData.ZhangFu > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (rowData.ZhangFu < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this.props.itemOnClick && this.props.itemOnClick(rowData, this.props.index)}>
                <View style={styles.container}>
                    <View key="ZhongWenJianCheng" style={{ flex: 1, justifyContent: 'center' }}>
                        <StockFormatText style={{ color: baseStyle.BLACK_100, fontSize: RATE(30), marginBottom: 4, textAlign: 'left' }}>{rowData.ZhongWenJianCheng}</StockFormatText>
                        <StockFormatText style={{ color: baseStyle.BLACK_70, fontSize: RATE(24), textAlign: 'left' }}>{rowData.Obj}</StockFormatText>
                    </View>
                    <View key="ZuiXinJia" style={{ flex: 0.5 }}>
                        <StockFormatText titlename={'ZuiXinJia'} style={{ textAlign: 'right', fontSize: RATE(30), color: clr, fontFamily: 'Helvetica Neue' }}>{rowData.ZuiXinJia}</StockFormatText>
                    </View>
                    <View key="ZhangFu" style={{ flex: 1 }}>
                        <StockFormatText style={{ textAlign: 'right', fontSize: RATE(30), color: clr, fontFamily: 'Helvetica Neue' }} unit="%" sign={true}>{rowData.ZhangFu / 100}</StockFormatText>
                    </View>
                </View>
            </TouchableOpacity>
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
    }
});
