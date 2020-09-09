/*
 * @Author: lishuai 
 * @Date: 2019-09-29 10:15:10 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-08-28 15:11:07
 * 资金流向成分股列表页面
 */
import React from 'react';
import { AppState, Image, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { StickyForm } from 'react-native-largelist-v3';
import * as baseStyle from '../../components/baseStyle';
import { mNormalFooter } from "../../components/mNormalFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../BaseComponentPage';
import { getSectorType } from "../Quote/DownLoadStockCode";
import { connection } from "../Quote/YDYunConnection";
import FundsFlowStatisticGraph from './FundsFlowStatisticGraph';
import { FundsFlowStatisticItemComponent } from './FundsFlowStatisticPage';

const PageCount = 20;
const FIXED_COLUMN_WIDTH = 120;
const COLUMN_WIDTH = 95;

export default class ConstituentForFundsFlowPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.isDidMount = false;
        this.loadMore = false;
        this.subscribedStocks = []; // 当前已注册的股票
        this.titles = ['涨跌幅', '现价', '当日主力净额', '3日主力净额', '5日主力净额', '10日主力净额'];
        this.code = this.props.navigation.state.params.code; // 板块id 用于获取真实的板块id和成分股个数
        this.blockName = this.props.navigation.state.params.name; // 板块名称
        this.stockTotalCount = 0; // 获取某板块下的股票总个数
        this._blockId = '';
        this.reqCount = PageCount;
        this.showCountOfScreen = this.reqCount;
        this.titleId = 1000; // 排序抬头,抬头对应的ID请查看proto文件定义。当日主力资金净流入: 1000,3日主力资金净流入: 1001,5日主力资金净流入: 1002,10日主力资金净流入: 1003
        this.desc = true; // 排序方式 升序 降序
        this.start = 0; // 从当前位置开始请求板块排序数据
        this.mScrolly = 0;
        this.scrollBegin = false;
        this.graphIsShow = false;
        this.state = {
            tradingStatus: 0, // 竞价交易状态，清盘状态(status=1)时饼图符号不可点击
            data: [{ items: [] }],
            neededRenderGraph: false, // 是否需要渲染资金流线统计饼图
            allLoaded: false
        }
    }

    componentDidMount() {
        this.isDidMount = true;
        this._addNavigationChangeListener();

    }
    _setInterval() {
        this.interval = setInterval(() => {
            this.setState({});
        }, 2000);
    }
    //监听导航变化
    _addNavigationChangeListener() {
        // console.log('资金流向板块成分股列表 监听导航变化');
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            AppState.addEventListener('change', this._handleAppStateChange);
            this._getSectorType();
            // console.log('资金流向板块成分股列表 willFocus');
            // this._setInterval();
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            AppState.removeEventListener('change', this._handleAppStateChange);
            // console.log('资金流向板块成分股列表 willBlur');
            this.blockSortRequest && this.blockSortRequest.cancel();
            this.nativeFetchFullQuote([], this.subscribedStocks);
            this.subscribedStocks = [];
        });
    }
    componentWillUnmount() {
        this.isDidMount = false;
        // console.log('资金流向板块成分股列表 Unmount');
        // this.interval && clearInterval(this.interval);
        this.blockSortRequest && this.blockSortRequest.cancel();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
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

            let objs = this.state.data[0].items ? this.state.data[0].items : [];

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
                this.setState({ data: [{ items: objs }] });
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
    // 获取板块信息
    _getSectorType() {
        getSectorType(this.code, (sectorCode, totalStockNum) => {
            if (sectorCode !== undefined) {
                this._blockId = sectorCode;
                this.stockTotalCount = totalStockNum;
                this._loadData();
            }
        });
    }
    _loadData() {
        this.blockSortRequest && this.blockSortRequest.cancel();
        let requestCount = Math.min(this.stockTotalCount, this.reqCount);
        let params = {
            blockid: this._blockId,
            fundFlowTitle: this.titleId,
            desc: this.desc,
            start: this.start,
            count: requestCount,
            subscribe: true
        };
        this.blockSortRequest = connection.request('FetchBlockSortNative', params, ev => {
            var data = ev;
            if (Platform.OS === 'android') {
                data = data.map(obj => {
                    return { Obj: obj.label_, value: obj.value_ };
                });
            }
            var tempObjs = this.state.data[0].items ? this.state.data[0].items : [];
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
            this.setState({ data: [{ items: tempObjs }], allLoaded: tempObjs.length >= this.stockTotalCount }, () => {
                this._list && this._list.endRefresh();
                this._list && this._list.endLoading();
                this.fetchFullQuote(data);
            });
        });
    }
    _loadMoreData() {
        this.loadMore = true;
        this.reqCount = this.showCountOfScreen + PageCount;
        this._loadData();
        setTimeout(() => {
            this.loadMore = false;
        }, 1500);
    }
    _sortBtnOnClick(title) {
        if (title == '当日主力净额') {
            if (this.titleId !== 1000) {
                this.titleId = 1000;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        } else if (title == '3日主力净额') {
            if (this.titleId !== 1001) {
                this.titleId = 1001;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        } else if (title == '5日主力净额') {
            if (this.titleId !== 1002) {
                this.titleId = 1002;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        } else if (title == '10日主力净额') {
            if (this.titleId !== 1003) {
                this.titleId = 1003;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        }
    }
    _clearDataAndReload() {
        this.start = 0;
        this.reqCount = PageCount;
        this.nativeFetchFullQuote([], this.subscribedStocks);
        this.subscribedStocks = [];
        this.setState({ data: [{ items: [] }] });
        this._loadData();
    }
    _stockOnClick(item, index) {
        let array = this.state.data[0].items;
        let stocks = [];
        for (let i = 0; i < array.length; i++) {
            stocks.push(Object.assign({}, array[i]));
        }
        Navigation.pushForParams(this.props.navigation, 'DetailPage', {
            ...item,
            array: stocks,
            index: index,
            isPush: true
        });
    }
    mScrollEnd() {
        let statusBarHeight = 0;
        if (Platform.OS == 'ios') {
            statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
        } else {
            statusBarHeight = StatusBar.currentHeight;
        }
        let numberStart = Math.floor(this.mScrolly / 60);
        let itemNumber = Math.floor((baseStyle.height - statusBarHeight - 44) / 60);
        this.showCountOfScreen = itemNumber + 1;
        if (this.loadMore || numberStart < 0) return;
        if (this.start != numberStart) {
            this.start = numberStart;
            this.reqCount = this.showCountOfScreen;
            this._loadData();
        }
    }
    _renderSection = (section) => {
        let fixedCloumnTitle = '股票名称';
        return (
            <View style={{ height: 30, flexDirection: 'row', backgroundColor: '#F2FAFF' }} key={section}>
                <View style={{ width: FIXED_COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2FAFF' }}>
                    <Text style={{ fontSize: 12, color: '#00000099' }}>{fixedCloumnTitle}</Text>
                </View>
                {
                    this.titles.map((title, index) => {
                        let imgSrc = require('../../images/hits/defaultt.png');
                        if (this.titleId == 1000 && index == 2) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        } else if (this.titleId == 1001 && index == 3) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        } else if (this.titleId == 1002 && index == 4) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        } else if (this.titleId == 1003 && index == 5) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        }
                        return (
                            < TouchableOpacity key={index} style={{ flexDirection: 'row', width: COLUMN_WIDTH, marginLeft: 5, marginRight: 5, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick(title)}>
                                <Text style={{ fontSize: 12, color: '#00000099' }}>{title}</Text>
                                {index > 1 && <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc} />}
                            </TouchableOpacity>
                        )
                    })
                }
            </View >
        );
    };
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
    _renderItem = (path) => {

        const item = this.state.data[path.section].items[path.row];
        let isShowGraphIcon = item.Obj;

        return (
            <View style={{ flex: 1, height: 60, backgroundColor: '#fff', flexDirection: 'row', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}>
                <View style={{ width: FIXED_COLUMN_WIDTH, alignItems: 'center', marginTop: 10, marginBottom: 10, paddingRight: 5, paddingLeft: 10, backgroundColor: '#fff' }}>
                    <View style={{ width: FIXED_COLUMN_WIDTH - 15, height: 40, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, paddingRight: 10, backgroundColor: '#3399FF0d' }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => this._stockOnClick(item, path.row)}>
                            <Text style={{ fontSize: 15 }}>{item.ZhongWenJianCheng ? item.ZhongWenJianCheng : '--'}</Text>
                            <Text style={{ fontSize: 12, color: '#666666' }}>{item.Obj ? item.Obj : '--'}</Text>
                        </TouchableOpacity>
                        {isShowGraphIcon && <TouchableOpacity style={{ marginLeft: 10, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => {
                            if (this.graphIsShow) return;
                            this.setState({ neededRenderGraph: true }, () => {
                                // this.interval && clearInterval(this.interval);
                                this.refs.graph && this.refs.graph.show(item)
                                // this.graphIsShow = true;
                            });
                        }}>
                            <Image style={{ width: 20, height: 20 }} source={require('../../images/MainDecesion/main_decision_fund_icon.png')}></Image>
                        </TouchableOpacity>}
                    </View>
                </View>
                <FundsFlowStatisticItemComponent
                    data={{ ...item }}
                    itemOnClick={(item) => this._stockOnClick(item, path.row)}
                    style={{ flex: 1, height: 60, flexDirection: 'row', backgroundColor: '#fff', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}
                />
            </View>
        )
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
        console.log('render');
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={this.blockName + '成分股'} />
                <StickyForm
                    style={{ flex: 1, backgroundColor: baseStyle.LINE_BG_F1 }}
                    hotBlock={{ lock: "left" }}
                    ref={list => this._list = list}
                    contentStyle={{ width: FIXED_COLUMN_WIDTH + (COLUMN_WIDTH + 10) * this.titles.length + 10 }}
                    data={this.state.data}
                    scrollEnabled={true}
                    heightForSection={() => 30}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => 60}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    headerStickyEnabled={true}
                    loadingFooter={mNormalFooter}
                    refreshHeader={mNormalHeader}
                    allLoaded={this.state.allLoaded}
                    onRefresh={() => {
                        this._clearDataAndReload();
                    }}
                    onLoading={() => { this._loadMoreData() }}
                    onMomentumScrollEnd={() => {
                        this.mScrollEnd();
                    }}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                        this.mScrolly = y;
                    }}
                    onTouchEnd={() => {
                        if (Platform.OS !== 'ios') {
                            return;
                        }
                        setTimeout(() => {
                            if (this.scrollBegin === false) {
                                this.mScrollEnd();
                            } else {
                                this.scrollBegin = false
                            }
                        }, 100);
                    }}
                    onMomentumScrollBegin={() => {
                        this.scrollBegin = true;
                    }}
                />
                {this.state.neededRenderGraph && this.graphIsShow === false ? <FundsFlowStatisticGraph ref={'graph'} hiddenCallback={this._graphDismissCallback} onDidMount={this.graphDidMount} /> : null}
            </BaseComponentPage>
        );
    }
}
