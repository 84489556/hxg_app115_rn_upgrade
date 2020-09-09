/*
 * @Author: lishuai
 * @Date: 2019-08-13 11:32:44
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-08-28 15:12:07
 * 资金流向统计列表
 */
import React, { Component } from 'react';
import { AppState, Image, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { StickyForm } from 'react-native-largelist-v3';
import * as baseStyle from '../../components/baseStyle';
import { mNormalHeader } from "../../components/mNormalHeader";
import NavigationTitleView from '../../components/NavigationTitleView';
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { getSectorType } from "../Quote/DownLoadStockCode";
import { connection } from "../Quote/YDYunConnection";
import FundsFlowStatisticGraph from './FundsFlowStatisticGraph';
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../components/SensorsDataTool";
import { mRiskTipsFooter } from "../../components/mRiskTipsFooter";
import * as ScreenUtil from "../../utils/ScreenUtil";

const FIXED_COLUMN_WIDTH = 120;
const COLUMN_WIDTH = 95;
const PageCount = 20;
const BlockIdData = new Map();
BlockIdData.set('全部A股', 'yd_1_sec_8');
BlockIdData.set('上证A股', 'SH000002');
BlockIdData.set('深证A股', 'SZ399107');
BlockIdData.set('创业板', 'SZ399102');
BlockIdData.set('中小板', 'SZ399101');
BlockIdData.set('科创板', 'yd_1_sec_101');
BlockIdData.set('行业', 'yd_1_sec_5');
BlockIdData.set('概念', 'yd_1_sec_3');
BlockIdData.set('地域', 'yd_1_sec_4');

function getBlockIdWithName(name) {
    if (!name || !name.length) return null;
    return BlockIdData.get(name);
}

export default class FundsFlowStatisticPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.initTabBarData();
        this.isDidMount = false;
        this.loadMore = false;
        this.subscribedStocks = []; // 当前已注册的股票
        this.titles = ['涨跌幅', '现价', '当日主力净额', '3日主力净额', '5日主力净额', '10日主力净额'];
        this.name = '全部A股';
        this.blockId = 'yd_1_sec_8';
        this.reqCount = PageCount;
        this.showCountOfScreen = this.reqCount;
        this.mScrolly = 0;
        this.scrollBegin = false;
        this.stockTotalCount = 0; // 获取某板块下的股票总个数
        this.titleId = 1000; // 排序抬头,抬头对应的ID请查看proto文件定义。当日主力资金净流入: 1000,3日主力资金净流入: 1001,5日主力资金净流入: 1002,10日主力资金净流入: 1003
        this.desc = true; // 排序方式 升序 降序
        this.start = 0; // 从当前位置开始请求板块排序数据
        this.state = {
            data: [{ items: [] }],
            tradingStatus: 0, // 竞价交易状态，清盘状态(status=1)时饼图符号不可点击
            neededRenderGraph: false, // 是否需要渲染资金流向统计饼图
            allLoaded: false
        }
        this.graphIsShow = false;
        this.lastNavTime = "";
        this.neenFresh = true;
    }
    // 初始化顶部tabbar的数据
    initTabBarData() {
        let map = new Map();
        map.set('全部A股', ['全部A股', '上证A股', '深证A股', '创业板', '中小板', '科创板']);
        map.set('行业', []);
        map.set('概念', []);
        map.set('地域', []);
        this.tabBarData = map;
    }

    componentDidMount() {
        this.isDidMount = true;
        this._addNavigationChangeListener();
        // this._setInterval();
    }

    componentWillUnmount() {
        this.isDidMount = false;
        // this.interval &&clearInterval(this.interval);
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
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            AppState.addEventListener('change', this._handleAppStateChange);
            this._getSectorType();
            // this._setInterval();
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zijinliuxiangtongjixiangqing);

        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            AppState.removeEventListener('change', this._handleAppStateChange);
            this.blockSortRequest && this.blockSortRequest.cancel();
            this.nativeFetchFullQuote([], this.subscribedStocks);
            this.subscribedStocks = [];
            // this.interval && clearInterval(this.interval);
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

        this.sensorsAppear(this.name)

        let blockId = getBlockIdWithName(this.name);
        getSectorType(blockId, (sectorCode, totalStockNum) => {
            if (sectorCode !== undefined) {
                this.blockId = sectorCode;
                this.stockTotalCount = totalStockNum;
                this._loadData();
            }
        });
    }

    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = '资金流量统计'
        sensorsDataClickObject.adLabel.second_label = label;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.module_source = '打榜'
        sensorsDataClickObject.adLabel.page_source = '资金流量统计';
        sensorsDataClickObject.adLabel.is_pay = '主力决策';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }

    _loadData() {
        this.blockSortRequest && this.blockSortRequest.cancel();
        let requestCount = Math.min(this.stockTotalCount, this.reqCount);
        let params = {
            blockid: this.blockId,
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
            if (Platform.OS == "android") {
                if (this.neenFresh) {
                    this.setState({ data: [{ items: tempObjs }], allLoaded: tempObjs.length >= this.stockTotalCount }, () => {
                        this._list && this._list.endRefresh();
                        this._list && this._list.endLoading();
                        this.fetchFullQuote(data);
                    });
                } else {
                    if (this.lastNavTime + 10000 >= Date.now()) {
                        return;
                    }
                    this.setState({ data: [{ items: tempObjs }], allLoaded: tempObjs.length >= this.stockTotalCount }, () => {
                        this._list && this._list.endRefresh();
                        this._list && this._list.endLoading();
                        this.fetchFullQuote(data);
                    });
                }
            } else {
                this.setState({ data: [{ items: tempObjs }], allLoaded: tempObjs.length >= this.stockTotalCount }, () => {
                    this._list && this._list.endRefresh();
                    this._list && this._list.endLoading();
                    this.fetchFullQuote(data);
                });
            }
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
        this._getSectorType();
    }
    _tabOnChange(value) {
        this.name = value;
        this._clearDataAndReload();
        this.neenFresh = true;
    }
    _stockOnClick(item, index) {
        let isBlock = this.name == '行业' || this.name == '概念' || this.name == '地域';
        let array = this.state.data[0].items;
        let stocks = [];
        for (let i = 0; i < array.length; i++) {
            stocks.push(Object.assign({}, array[i]));
        }
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...item,
            array: stocks,
            index: index,
            isFromFundFlow: isBlock,
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
        let rowHeight = (this.name == '行业' || this.name == '概念' || this.name == '地域') ? 75 : 60;
        let numberStart = Math.floor(this.mScrolly / rowHeight);
        let itemNumber = Math.floor((baseStyle.height - statusBarHeight - 44 - 35) / rowHeight);
        this.showCountOfScreen = itemNumber;
        if (this.loadMore || numberStart < 0) return;

        if (this.start != numberStart) {
            this.start = numberStart;
            this.reqCount = this.showCountOfScreen;
            this._loadData();
        }
    }
    _renderSection = (section) => {
        let fixedCloumnTitle = (this.name == '行业' || this.name == '概念' || this.name == '地域') ? '板块名称' : '股票名称';
        return (
            <View style={{ height: 30, flexDirection: 'row', backgroundColor: '#F2FAFF' }} key={section}>
                <View style={{ width: FIXED_COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', paddingLeft: 5, backgroundColor: '#F2FAFF' }}>
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
                            < TouchableOpacity key={index} style={{ flexDirection: 'row', width: COLUMN_WIDTH, marginLeft: 5, marginRight: index == this.titles.length - 1 ? 15 : 5, justifyContent: 'center', alignItems: 'center', borderRadius: 1 }} activeOpacity={1} onPress={() => this._sortBtnOnClick(title)}>
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
        let isShowGraphIcon = !(this.name == '行业' || this.name == '概念' || this.name == '地域') && item.Obj;
        return (
            <View style={{ flex: 1, height: isShowGraphIcon ? 60 : 75, backgroundColor: '#fff', flexDirection: 'row', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}>
                <View style={{ width: FIXED_COLUMN_WIDTH, alignItems: 'center', marginTop: 10, marginBottom: 10, paddingRight: 5, paddingLeft: 10, backgroundColor: '#fff' }}>
                    <View style={{ width: FIXED_COLUMN_WIDTH - 15, height: isShowGraphIcon ? 40 : 55, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, paddingRight: 10, backgroundColor: '#3399FF0d' }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => this._stockOnClick(item, path.row)}>
                            <Text style={{ fontSize: 15 }}>{item.ZhongWenJianCheng ? item.ZhongWenJianCheng : '--'}</Text>
                            {/* <Text style={{ fontSize: 15 }}>{path.row}</Text> */}
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
                    style={{ flex: 1, height: isShowGraphIcon ? 60 : 75, flexDirection: 'row', backgroundColor: '#fff', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}
                />
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
        let statusBarHeight = 0;
        if (Platform.OS == 'ios') {
            statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
        } else {
            statusBarHeight = StatusBar.currentHeight;
        }
        const isShowGraphIcon = !(this.name == '行业' || this.name == '概念' || this.name == '地域');
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'资金流向统计'} />
                <StickyForm
                    style={{ backgroundColor: baseStyle.LINE_BG_F6, marginTop: 35 }}
                    hotBlock={{ lock: "left" }}
                    ref={list => this._list = list}
                    contentStyle={{ width: FIXED_COLUMN_WIDTH + (COLUMN_WIDTH + 10) * this.titles.length + 10 }}
                    data={this.state.data}
                    scrollEnabled={true}
                    heightForSection={() => 30}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => isShowGraphIcon ? 60 : 75}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    headerStickyEnabled={true}
                    loadingFooter={mRiskTipsFooter}
                    refreshHeader={mNormalHeader}
                    renderFooter={this._renderMyFooters}
                    allLoaded={this.state.allLoaded}
                    onRefresh={() => {
                        this.neenFresh = true;
                        this._clearDataAndReload();
                    }}
                    onLoading={() => {
                        this.neenFresh = true;
                        this._loadMoreData()
                    }}
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
                <TopTabBarComponent style={{ position: 'absolute', top: statusBarHeight + 44, width: baseStyle.width }} tabs={this.tabBarData} tabOnChange={(value) => this._tabOnChange(value)} />
                {this.state.neededRenderGraph && this.graphIsShow === false ? <FundsFlowStatisticGraph ref={'graph'} hiddenCallback={this._graphDismissCallback} onDidMount={this.graphDidMount} /> : null}
            </BaseComponentPage>
        );
    }
    /**
     * 脚布局
     * */
    _renderMyFooters = () => {
        if ((this.state.data && this.state.data[0].items.length === 0) || this.state.allLoaded === false) {
            return <View><View></View></View>;
        } else {
            return (
                <View>
                    <View style={{ width: ScreenUtil.screenW, paddingVertical: ScreenUtil.scaleSizeW(30), paddingHorizontal: ScreenUtil.scaleSizeW(20), backgroundColor: "#f1f1f1", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(0,0,0,0.2)", paddingVertical: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(3) : 0, textAlign: "center" }}
                        >温馨提示：信息内容仅供参考,不构成操作决策依据，股市有风险，投资需谨慎。</Text>
                    </View>
                </View>
            )
        }
    }
}

export class TopTabBarComponent extends BaseComponentPage {
    constructor(props) {
        super(props);
        let keysIterator = this.props.tabs && this.props.tabs.keys();
        let keys = [];
        for (const k of keysIterator) {
            keys.push(k);
        }
        // 此处保留一份初始化的tabs数据，因为tabbar会根据当前选中的子tab中的选项而变化
        this.originalKeys = keys;
        this.state = {
            selectedIndex: 0, // 当前选中的tab索引
            subtabSelectedIndex: 0, // 当前选中的tab的子tab的索引
            showSubTabs: false, // 是否显示子tab
        };
    }
    // tabbar点击事件
    _tabOnChange(index, value) {
        let values = this.props.tabs.get(this.originalKeys[index]);
        let hasSubtabs = values.length > 1;
        if (hasSubtabs) {
            if (this.state.selectedIndex !== index) {
                this.setState({ selectedIndex: index }, () => {
                    this.props.tabOnChange && this.props.tabOnChange(value);
                });
            } else {
                this.setState({ showSubTabs: !this.state.showSubTabs });
            }
        } else {
            if (this.state.selectedIndex !== index) {
                this.setState({ selectedIndex: index, showSubTabs: false }, () => {
                    this.props.tabOnChange && this.props.tabOnChange(value);
                });
            }
        }
    }
    // 子tabbar点击事件
    subTabItemOnChange(index, value) {
        if (this.state.subtabSelectedIndex !== index) {
            this.setState({ subtabSelectedIndex: index, showSubTabs: false }, () => {
                this.props.tabOnChange && this.props.tabOnChange(value);
            });
        }
    }
    render() {
        if (!this.props.tabs || !this.props.tabs.size) return null;
        let keysIterator = this.props.tabs && this.props.tabs.keys();
        let keys = [];
        for (const k of keysIterator) {
            let values = this.props.tabs.get(k);
            if (values.length > 1) {
                keys.push(values[this.state.subtabSelectedIndex]);
            } else {
                keys.push(k);
            }
        }
        let subTabs = this.props.tabs.get(this.originalKeys[this.state.selectedIndex]);
        let subTabItemWidth = (baseStyle.width - 90) / 3;
        return (
            <View style={this.props.style}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#ffffff', borderBottomColor: '#0000001a', borderBottomWidth: this.state.showSubTabs ? 1 : 0 }}>
                    {keys.map((value, index) => {
                        let isSelected = this.state.selectedIndex == index ? true : false;
                        let textColor = isSelected ? '#F92400' : '#999999';
                        let fontSize = isSelected ? 16 : 15;
                        let values = this.props.tabs.get(this.originalKeys[index]);
                        let hasSubtabs = values.length > 1;
                        return (
                            <TouchableOpacity key={index} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 35 }} activeOpacity={1} onPress={() => this._tabOnChange(index, value)}>
                                <Text style={{ fontSize: fontSize, color: textColor }}>{value}</Text>
                                {hasSubtabs ? <Image style={{ width: 8, height: 5, marginLeft: 3, tintColor: textColor }} source={require('../../images/icons/fund_flow_list_red_arrow_icon.png')} /> : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {
                    this.state.showSubTabs &&
                    <TouchableOpacity style={{ height: baseStyle.height, backgroundColor: 'rgba(0,0,0,0.6)' }} activeOpacity={1} onPress={() => this.setState({ showSubTabs: false })}>
                        <View style={{ backgroundColor: '#fff', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                            {subTabs.map((value, index) => {
                                let isSelected = this.state.subtabSelectedIndex == index;
                                let textColor = isSelected ? '#ffffff' : '#00000066';
                                let bgColor = isSelected ? '#3399FF' : '#ffffff';
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={{ height: 25, marginTop: 10, borderColor: '#00000066', borderWidth: isSelected ? 0 : 1, borderRadius: 25 / 2, justifyContent: 'center', alignItems: 'center', backgroundColor: bgColor }}
                                        activeOpacity={1}
                                        onPress={() => this.subTabItemOnChange(index, value)}>
                                        <Text style={{ width: subTabItemWidth, textAlign: 'center', fontSize: 12, color: textColor }}>{value}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                        <TouchableOpacity style={{ height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }} activeOpacity={1} onPress={() => this.setState({ showSubTabs: false })}>
                            <Image source={require('../../images/icons/fund_flow_list_tab_bar_fold_icon.png')}></Image>
                        </TouchableOpacity>
                    </TouchableOpacity>
                }
            </View>
        );
    }
}

export class FundsFlowStatisticItemComponent extends Component {

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
    shouldComponentUpdate(nextProps) {
        if (this.props.data.ZhangFu !== nextProps.data.ZhangFu ||
            this.props.data.ZuiXinJia !== nextProps.data.ZuiXinJia ||
            this.props.data.hugeNet1Day !== nextProps.data.hugeNet1Day ||
            this.props.data.hugeNet3Day !== nextProps.data.hugeNet3Day ||
            this.props.data.hugeNet5Day !== nextProps.data.hugeNet5Day ||
            this.props.data.hugeNet10Day !== nextProps.data.hugeNet10Day) {
            return true;
        }
        return false;
    }
    render() {
        let item = this.props.data;
        if (!item) return null;
        let priceClr = this._getStockTextColor(item.ZhangFu);
        let hugeNet1DayTextColor = this._getStockTextColor(item.hugeNet1Day);
        let hugeNet3DayTextColor = this._getStockTextColor(item.hugeNet3Day);
        let hugeNet5DayTextColor = this._getStockTextColor(item.hugeNet5Day);
        let hugeNet10DayTextColor = this._getStockTextColor(item.hugeNet10Day);
        return (
            <TouchableOpacity
                key={item.Obj}
                activeOpacity={1}
                // style={{ width: 800, height: 60, flexDirection: 'row', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}
                style={this.props.style}
                onPress={() => this.props.itemOnClick && this.props.itemOnClick(item)}
            >
                <View style={{ width: COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, borderRadius: 5, marginTop: 10, marginBottom: 10, backgroundColor: this._getStockBgColor(item.ZhangFu) }} >
                    <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: priceClr }} unit={'%'} sign={true}>{item.ZhangFu && item.ZhangFu / 100}</StockFormatText>
                </View>
                <View style={{ width: COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, borderRadius: 5, marginTop: 10, marginBottom: 10, backgroundColor: '#3399FF0d' }} >
                    <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: priceClr }}>{item.ZuiXinJia && item.ZuiXinJia}</StockFormatText>
                </View>
                <View style={{ width: COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, borderRadius: 5, marginTop: 10, marginBottom: 10, backgroundColor: this._getStockBgColor(item.hugeNet1Day) }} >
                    <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet1DayTextColor }} unit={'万/亿'}>{item.hugeNet1Day && parseFloat(item.hugeNet1Day)}</StockFormatText>
                </View>
                <View style={{ width: COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, borderRadius: 5, marginTop: 10, marginBottom: 10, backgroundColor: this._getStockBgColor(item.hugeNet3Day) }} >
                    <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet3DayTextColor }} unit={'万/亿'}>{item.hugeNet3Day && parseFloat(item.hugeNet3Day)}</StockFormatText>
                </View>
                <View style={{ width: COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, borderRadius: 5, marginTop: 10, marginBottom: 10, backgroundColor: this._getStockBgColor(item.hugeNet5Day) }} >
                    <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet5DayTextColor }} unit={'万/亿'}>{item.hugeNet5Day && parseFloat(item.hugeNet5Day)}</StockFormatText>
                </View>
                <View style={{ width: COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 15, borderRadius: 5, marginTop: 10, marginBottom: 10, backgroundColor: this._getStockBgColor(item.hugeNet10Day) }} >
                    <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: hugeNet10DayTextColor }} unit={'万/亿'}>{item.hugeNet10Day && parseFloat(item.hugeNet10Day)}</StockFormatText>
                </View>
            </TouchableOpacity >
        );
    }
}
