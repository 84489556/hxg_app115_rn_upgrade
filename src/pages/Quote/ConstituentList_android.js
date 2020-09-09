/**
 * 板块成分股列表
 */
'use strict';

import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, NativeModules, NativeEventEmitter } from 'react-native';
import * as baseStyle from '../../components/baseStyle';
import StockFormatText from '../../components/StockFormatText';
import RATE from '../../utils/fontRate';
import PullListView, { RefreshState } from '../../components/PullListView';
import { connection } from "./YDYunConnection";
import { getSectorType } from "./DownLoadStockCode";
import {jumpPage} from "../../utils/CommonUtils";
const YDYunChannelModule = NativeModules.YDYunChannelModule;
const loadingManagerEmitter = new NativeEventEmitter(YDYunChannelModule);


export default class ConstituentList extends Component {
    static defaultProps = {
        code: null,
        mainkey: '',
        title: ''
    };

    constructor(props) {
        super(props);

        this.state = {
            allData: [],
            moreDataText: '加载更多',
            zhangF: 0, //0 ：降序，由大到小  1：升序，有小到大  2：默认排序 //涨跌幅排序
            xianJ: 2, //现价的排序
            code: this.props.code,//股票代码
            SectorType: '',//板块类型
            SectorTotal: 0,//当前板块的成分股的总只数
        };
        this.mainkey = this.props.mainkey;
    }

    componentDidMount() {
        this._getSectorType(this.state.code);
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.code !== nextProps.code) {
            this.setState({ code: nextProps.code }, () => {
                this._getSectorType(nextProps.code);
            });
        }
    }

    _getSectorType(code) {
        getSectorType(code, (sectorCode, totalStockNum) => {
            //sectorCode YDI01499  totalStockNum股票只数
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

const pageCount = 30;//

class Constituent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allData: [],
            refreshState: RefreshState.Idle,
            code: this.props.code,//板块股票代码
        };
        this.field = this.props.params.field; // 排序抬头 涨跌幅 现价
        this.desc = this.props.params.desc; // 排序方式 升序 降序
        this.curTopRowIndex = 0; // 当前屏幕显示顶部行索引
        this.curBottomRowIndex = -1; // 当前屏幕显示底部行索引
        this.isDeceleration = false; // 滑动结束后是否有减速过程
        this.viewableRows = []; // 当前显示的行索引
        this.scrollEndDragEvent = null;
        this.scrollViewStartOffsetY = 0; //用于记录手指开始滑动时ScrollView组件的Y轴偏移量，通过这个变量可以判断滚动方向
        this.regStartFlag = 0; // 当前注册股票的开始标记索引
        this.regEndFlag = 0; // 当前注册股票的结束标记索引
        this.start = 0; // 从当前位置开始请求板块排序数据
        this.isDidMount=false;
        this.lastNavTime = "";
        this.neenFresh=false;
    }

    componentDidMount() {
        this.isDidMount=true;
        this._query(this.state.code);
        // this._setInterval();
        this._addListener();
        this._addNavigationChangeListener();
    }

    componentWillUnmount() {
        this.isDidMount=false;
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
            // 以下注释的代码是为了修复从有成分股的板块切换到无成分股的板块时，原成分股列表数据未清空的bug
            // let oldData = this.state.allData;
            // let onePageData = [];
            // for (let i = 0; i < oldData.length; i++) {
            // if (i == pageCount) break;
            // const element = oldData[i];
            // onePageData.push(element);
            // }
            this.setState({
                code: nextProps.code, allData: []//onePageData
            }, () => {
                // console.log('stock-http---componentWillReceivePropst-----');
                this.neenFresh=true;
                this.isDidMount=true;
                this.start = 0;
                this._query(nextProps.code);
            });
        }
    }
    _addNavigationChangeListener() {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            // this._setInterval();
            this._addListener();
            this._query(this.state.code);
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this.interval && clearInterval(this.interval);
            this.blockSortRequest && this.blockSortRequest.cancel();
            this.blockSortListener && this.blockSortListener.remove();
            this.blockSortQuoteListener && this.blockSortQuoteListener.remove();
        });
    }

    _addListener() {
        // 板块排序数据，应该是10秒左右一推
        this.blockSortListener = loadingManagerEmitter.addListener('ydChannelBlockSortMessage', ev => {
            if(this.isDidMount==true){
            this.regStartFlag = this.start;
            this.regEndFlag = this.start + pageCount;
            var data = JSON.parse(ev.data).map(obj => {
                if (this.field === 'ZhangFu') {
                    return { Obj: obj.Obj, ZhangFu: obj.value, ZhongWenJianCheng: '--', ZuiXinJia: '--' };
                } else if (this.field === 'ZuiXinJia') {
                    return { Obj: obj.Obj, ZuiXinJia: obj.value, ZhongWenJianCheng: '--', ZhangFu: '--' };
                } else {
                    return { Obj: obj.Obj, ZuiXinJia: '--', ZhongWenJianCheng: '--', ZhangFu: '--' };
                }
               
            });
            //data是Obj: "SZ000560"
            // ZhangDie: 0.34999999999999964
            // ZhangFu: "10.14"
            // ZhongWenJianCheng: "我爱我家"
            // ZuiXinJia: "3.80"
            // hugeIn: 68862340
            // hugeNet1Day: 16001135
            // hugeNet3Day: 21620549
            // hugeNet5Day: 21227515
            // hugeNet10Day: 21732577
            // hugeOut: 52861205
            // largeIn: 39603752
            // largeOut: 38842972
            // littleIn: 27436845
            // littleOut: 35974960
            // mediumIn: 36464836
            // mediumOut: 43927856
            // superIn: 29258588
            // superOut: 14018233  这些数据对象的数组形式
            var tempObjs = this.state.allData ? this.state.allData : [];
          
            if (this.state.allData.length) {
                for (let i = 0, j = this.start; i < data.length; i++ , j++) {
                    
                    if (tempObjs[j]) {
                        // if(tempObjs[j].Obj!=data[i].Obj){
                        //     tempObjs[j].ZhongWenJianCheng=data[i].ZhongWenJianCheng?data[i].ZhongWenJianCheng:'--';
                        // }
                        if(tempObjs[j].Obj)
                        tempObjs[j].Obj = data[i].Obj;
                        // tempObjs[j].obj = data[i].obj;

                        
                        // if (this.field === 'ZhangFu') {
                        //     tempObjs[j].ZhangFu = data[i].value;
                        // } else if (this.field === 'ZuiXinJia') {
                        //     tempObjs[j].ZuiXinJia = data[i].value;
                        // }

                       
                    } else {
                        tempObjs[j] = data[i];
                    }
                }
            } else {
                tempObjs = data;
            }

            if (tempObjs.length == 0) {
                this.setState({ allData: tempObjs, moreDataText: '没有相关数据', refreshState: RefreshState.EmptyData });
            } else if (tempObjs.length >= this.props.total) {
                this.setState({ allData: tempObjs, moreDataText: '没有更多数据', refreshState: RefreshState.NoMoreData });
            } else {
                this.viewableRows = [];
                console.log('stock-http---componentWillReceivePropst-----'+this.neenFresh);
                if(this.neenFresh){
                    this.setState({ allData: tempObjs, refreshState: RefreshState.Idle });
                }else{
                    if(this.state.refreshState==0){
                        if(this.lastNavTime+10000 >= Date.now()){
                            return;
                        }
                         // this.lastNavTime = Date.now();
                        this.setState({ allData: tempObjs, refreshState: RefreshState.Idle });
                    }
                }
               
            }
          }
        });
        // 板块排序的报价数据
        this.blockSortQuoteListener = loadingManagerEmitter.addListener('ydChannelBlockSortQuoteMessage', x => {
            if(this.isDidMount){
            let objs = this.state.allData ? this.state.allData : [];
            let obj = JSON.parse(x.data);
            //obj的数据
            // Obj: "SH603566"
            // ZhangDie: 0.3000000000000007
            // ZhangFu: "1.14"
            // ZhongWenJianCheng: "普莱柯"
            // ZuiXinJia: "26.60"
            // hugeIn: 31399453
            // hugeNet1Day: -1282204
            // hugeNet3Day: -10923603
            // hugeNet5Day: -38437826
            // hugeNet10Day: -97695243
            // hugeOut: 32681657
            // largeIn: 20635601
            // largeOut: 24280922
            // littleIn: 41234315
            // littleOut: 40377616
            // mediumIn: 29752147
            // mediumOut: 29326642
            // superIn: 10763852
            // superOut: 8400735
            obj.ZhangFu = parseFloat(obj.ZhangFu).toFixed(2);
            obj.ZuiXinJia = parseFloat(obj.ZuiXinJia).toFixed(2);
            let index = -1;
            for (let i = 0; i < objs.length; i++) {
                if (objs[i].Obj === obj.Obj) {
                    index = i;
                    break;
                }
            }
           
            if (index !== -1) {
                let needed = this.renderIfNeeded(obj, objs[index]);
                if (needed) {
                    // this.state.allData[index] = obj;
                    objs[index] = obj;
                    if(this.neenFresh){
                        this.setState({ allData: objs });
                    }else{
                        if(this.lastNavTime+2000 >= Date.now()){
                            return;
                        }
                        this.lastNavTime = Date.now();
                        this.setState({ allData: objs });
                    }
                    this.neenFresh=false;
                }
            }
        }
        });
    }
    renderIfNeeded(obj, otherObj) {//做一个筛选判断
        if (obj.ZhangFu !== otherObj.ZhangFu || obj.ZuiXinJia !== otherObj.ZuiXinJia) {
            return true;
        }
        return false;
    }
    _setInterval() {//2秒钟一次，循环刷新页面
        this.interval = setInterval(() => {
            this.setState({});
        }, 2000);
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
        let requestCount = Math.min(this.props.total, pageCount);//总只数大于30，注册30，小于30，注册total的只数
        this.blockSortRequest = connection.request('FetchConstituentStockNative', {//创建行情的排序，就同时再原生注册了当前排序的股票的行情监听
            blockid: code,
            titleid: title_id,
            desc: this.desc,
            start: this.start,
            count: requestCount,
            subscribe: true
        });
    }

    // _onItemPress(data, rowID) {
    //     let array = this.state.allData;
    //     // console.log('onScroll','array.ZhongWenJianCheng:'+data.ZhongWenJianCheng);
    //     jumpPage(this.props.navigation, 'DetailPage', {
    //         ...data,
    //         array: array,
    //         index: rowID
    //     });
        
     
    // }

    _onItemPress(data, rowID) {
        let array = this.state.allData;
        let stocks = [];
        for (let i = 0; i < array.length; i++) {
            stocks.push(Object.assign({}, array[i]));
        }
        jumpPage(this.props.navigation, 'DetailPage', {
            ...data,
            array: stocks,
            index: rowID
        });
    }


    keyExtractor = (item, index) => {
        return index;
    };

    _handlerScrollEvent = (value) => {
        // 排序当前屏幕显示行数据
        this.viewableRows.sort((a, b) => a - b);
        this.curTopRowIndex = this.viewableRows[0];
        this.curBottomRowIndex = this.viewableRows[this.viewableRows.length - 1];
        const offsetY = value.contentOffset.y;
        // 上拉
        if (offsetY+80 >=this.scrollViewStartOffsetY) {
            if (this.curBottomRowIndex + 1 >= this.regEndFlag) {
                this.start = this.curTopRowIndex;
                if (this.start + pageCount >= this.state.allData.length) {
                    this.setState({
                        refreshState: RefreshState.FooterRefreshing
                    });
                }
                this._query(this.state.code);
                // this.viewableRows = [];
            }
        } else if (offsetY < this.scrollViewStartOffsetY) {
            // console.log('onScroll','下拉');
            if (this.curTopRowIndex < this.regStartFlag) {
                this.start = Math.max(0, this.curBottomRowIndex - 20);
                this._query(this.state.code);
                // this.viewableRows = [];
            }
        }
       
    }

    _onMore= (value) =>{
        // console.log('_onMore','_onMore');
   
        this.start=this.state.allData.length;
        this._query(this.state.code);
    }
    renderRow = rowData1 => {
        let rowData = rowData1.item;
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (rowData.ZhangFu > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (rowData.ZhangFu < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={this._onItemPress.bind(this, rowData, rowData1.index)}>
                <View style={styles.container}>
                    <View key="ZhongWenJianCheng" style={{ flex: 1, justifyContent: 'center' }}>
                        <StockFormatText style={{ color: baseStyle.BLACK_100, fontSize: RATE(30), marginBottom: 4, textAlign: 'left' }}>{rowData.ZhongWenJianCheng}</StockFormatText>
                        <StockFormatText style={{ color: baseStyle.BLACK_70, fontSize: RATE(24), textAlign: 'left' }}>{rowData.Obj}</StockFormatText>
                    </View>
                    <View key="ZuiXinJia" style={{ flex: 0.5 }}>
                        <StockFormatText titlename={'ZuiXinJia'} style={{ textAlign: 'right', fontSize: RATE(30), color: clr }}>{rowData.ZuiXinJia}</StockFormatText>
                    </View>
                    <View key="ZhangFu" style={{ flex: 1 }}>
                        <StockFormatText style={{ textAlign: 'right', fontSize: RATE(30), color: clr }} unit="%" sign={true}>{rowData.ZhangFu / 100}</StockFormatText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        // let data = this.state.allData;
        return (
            <View>
                <PullListView
                    bounces={true}
                    con_scrollEnabled={this.props.con_scrollEnabled}
                    renderHeaderComponent={this.props.renderHeaderComponent}
                    data={this.state.allData}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderRow}
                    refreshState={this.state.refreshState}
                    // onEndReached={this._onMore}
                    cy_onScrollBeginDrag={(event) => {
                        //event.nativeEvent.contentOffset.y表示Y轴滚动的偏移量
                        const offsetY = event.nativeEvent.contentOffset.y;
                        //记录ScrollView开始滚动的Y轴偏移量
                        this.scrollViewStartOffsetY = offsetY;
                        // console.log('onScroll','cy_onScrollBeginDrag');
                    }}
                    cy_onScrollEndDrag={(event) => {
                        // 由于event需要在setTimeout回调内使用，所以需要保存event
                        // console.log('onScroll','cy_onScrollEndDrag');
                        
                        // this.scrollEndDragEvent = event.nativeEvent;
                        // setTimeout(() => {
                        //     if (!this.isDeceleration) {
                        //         this._handlerScrollEvent(this.scrollEndDragEvent);
                        //     }
                        // }, 200);
                    }}
                    cy_onMomentumScrollBegin={() => {
                        // console.log('onScroll','cy_onMomentumScrollBegin');
                        this.isDeceleration = true;
                    }}
                    cy_onMomentumScrollEnd={(event) => {
                        // console.log('onScroll','cy_onMomentumScrollEnd');
                        this.isDeceleration = false;
                        this._handlerScrollEvent(event.nativeEvent);
                    }}
                    setChangeVisibleRowCallback={(info) => {
                        info.viewableItems.forEach(element => {
                            // console.log('onScroll','element='+element.index);
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
                        // this.setState(this.viewableRows);
                    }}
                />
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
    }
});
