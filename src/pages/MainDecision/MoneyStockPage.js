/**
 * Created by cuiwenjuan on 2019/8/21.
 * 修改于20191127 现在接口就使用一个
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    ImageBackground,
    AppState
} from 'react-native';

import { commonUtil, toast,searchStockIndex } from '../../utils/CommonUtils'
import * as  baseStyle from '../../components/baseStyle'
import { StickyForm } from "react-native-largelist-v3";
import RequestInterface from '../../actions/RequestInterface'
import BaseComponentPage from '../../pages/BaseComponentPage'
import StockFormatText from '../../components/StockFormatText'
import { mNormalFooter } from "../../components/mNormalFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
import LinearGradient from 'react-native-linear-gradient';
import * as ScreenUtil from '../../utils/ScreenUtil';
import QuotationListener from '../../utils/QuotationListener';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"
import RefreshButton from '../../components/RefreshButton'
import Yd_cloud from '../../wilddog/Yd_cloud';
import NoDataPage from '../NoDataPage'
import { historyType } from '../TuyereDecision/HistoryRecordPage';
import {sensorsDataClickActionName, sensorsDataClickObject} from '../../components/SensorsDataTool';
import {connection} from "../Quote/YDYunConnection";
import NetInfo from "@react-native-community/netinfo";
import {stat} from "react-native-fs";


// let longHuPath = '/celuexuangu/getlonghuzijin';
// let gaoGuanPath = '/celuexuangu/getgaoguanzijin';
// let zhuLiPath = '/celuexuangu/getzhulizijin';

let refPath = Yd_cloud().ref(MainPathYG2);

const stockType = {
    longHu: '龙虎资金',
    gaoGuan: '高管资金',
    zhuLi: '主力资金',
}

let widthCell = commonUtil.width / 2;
let itemHeight = ScreenUtil.scaleSizeW(230);
let numberListener = 10;
let SECTION_HEIGHT = ScreenUtil.scaleSizeW(80);

let longHuTitle = {
    titles: [{title:"席位资金",isSort:0}],
    history:{historyTitle:stockType.longHu,historyTypeS:historyType.longHuZiJin},
    selectedIndex:0
};
let GaoGuanTitle = {
    titles: [{title:"高管资金",isSort:0}],
    history:{historyTitle:stockType.gaoGuan,historyTypeS:historyType.gaoGuanZiJin},
    selectedIndex:1
};
let ZhuLiTitle = {
    titles: [{title:"主力资金",isSort:0}],
    history:{historyTitle:stockType.zhuLi,historyTypeS:historyType.zhuLiZiJin},
    selectedIndex:2
};

let getTitle = (title) => {
    if (!title) { title = stockType.longHu; }
    if (title === stockType.longHu) {
        return longHuTitle;

    } else if (title === stockType.gaoGuan) {
        return GaoGuanTitle;

    } else if (title === stockType.zhuLi) {
        return ZhuLiTitle;
    } else {
        return {};
    }
}


export default class MoneyStockPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.title = this.props.navigation.state.params && this.props.navigation.state.params.title;
        this.selectedIndex = getTitle(this.title).selectedIndex;
        this.historyTypeS = getTitle(this.title).history.historyTypeS;
        //特殊指标
        this.specialTag = this.props.navigation.state.params && this.props.navigation.state.params.specialTag;
        this.setLHString = this.props.navigation.state.params && this.props.navigation.state.params.setLHString && this.props.navigation.state.params.setLHString.qttj;
        this.setGGString = this.props.navigation.state.params && this.props.navigation.state.params.setLHString && this.props.navigation.state.params.setGGString.qttj;
        this.setZLString = this.props.navigation.state.params && this.props.navigation.state.params.setLHString && this.props.navigation.state.params.setZLString.qttj;

        this.state = {
            stockArray:[],
            sortButtonIndex:0,
            sortDown: true,
            titles: getTitle(this.title).titles,
            allLoaded: true,
            longhuCount: 0,//龙虎资金的条数
            gaoGuanCount: 0,//高管资金的条数
            zhuLiCount: 0,//高管资金的条数
            historyTitle:getTitle(this.title).history.historyTitle,
            stockCount:0,
            desc:true,
            titleid:199,
        };

        this.postPath = '/celuexuangu/fundSummary';//页面的BaseUrl
        this.longHuPath = '/celuexuangu/getlonghuzijin';
        this.gaoGuanPath = '/celuexuangu/getgaoguanzijin';
        this.zhuLiPath = '/celuexuangu/getzhulizijin';
        this.refupDataTimeLH = refPath.ref('CeLueZhongXin/ZiJinLongHuUpdateFlag');
        this.refupDataTimeGG = refPath.ref('CeLueZhongXin/ZiJinGaoGuanUpdateFlag');
        this.refupDataTimeZL = refPath.ref('CeLueZhongXin/ZiJinZhuLiUpdateFlag');
        this.refupDataTime = refPath.ref('CeLueZhongXin/ZiJinQiangChouUpdateFlag');
        this.addQuotationList = [];
        this.mScrolly = 0;
        this.scrollBegin = false;
        this.itemIndex = 0;//滑动下标
        this.Page = 1;
        this.PageSize = 500;//接口一次加载
        this.touchTime = 0;
        this.focus = true;
        this.listenersSize = 10;//行情实时监听个数
        this.localPageSize = 20;//本地分页
        this.headerHeight = 0;
        this.touchTimeLenght = 1500;

        this.marketStock = [];//大行情数据

    }

    componentDidMount() {
        this._loadData();
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                this.willFocus();
                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zijinqiangrugegu);
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this.willBlur();
            }
        );

    }


    componentWillUnmount() {
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }


    //显示当前页面
    willFocus() {
        this.focus = true;
        this._console('HotTuyerePage 显示当前页面')
        this.setListener();
        this._upDataTime();
        this._getMarketStock();

        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);

    }

    //不在当前页面
    willBlur() {
        this.focus = false;
        this._console('HotTuyerePage 不显示当前页面')
        this._refOff();
        this._cancelRequest();

        AppState.removeEventListener('change', this._handleAppStateChange);
        this.netInfoSubscriber && this.netInfoSubscriber();
    }

    handleConnectivityChange = (status) => {
        this._console('网络状态'+JSON.stringify(status)+AppState.currentState)

        //网络状态，第一次进来，  进入后台网络切换，
        if(AppState.currentState === 'active'){
            if(status.isConnected){
                //先移除
                this._cancelRequest();
                this._refOff();

                //在重新请求
                this._getMarketStock();
                this._upDataTime();
            }
        }

    }

    _handleAppStateChange = (nextAppState) => {
        this._console('前后台'+JSON.stringify(nextAppState))

        if (nextAppState === 'active') {
            //获取数据
            this._getMarketStock();
            this._upDataTime();

        }
        else if (nextAppState === 'background') {
            this._console('后台'+JSON.stringify(nextAppState))
            this._cancelRequest();
            this._refOff();
        }



    }

    //监听五分钟更新一次
    _upDataTime() {
        //五分钟更新一次，统一使用抢筹股票的
        this.refupDataTime.on("value", (response) => {
            this._console(' = 股票池有更新');
            this._loadData();
        })
    }


    _refOff() {
        this.refupDataTime.off('value');
    }

    /**
     * 获取行情数据
     * @private
     */
    _getMarketStock(){
        this._console('行情数据 _getMarketStock '+this.state.titleid+','+this.state.desc);
        this.blockSortRequest = connection.request('FetchBlockSortNative', {
            blockid: 'yd_1_sec_8',
            titleid: this.state.titleid,
            desc: this.state.desc,
            start: 0,
            count: 5000,
            subscribe: true
        },(data) => {
            this._console('行情数据 == '+ JSON.stringify(data));
            this.marketStock = data;
            this._getCurrentSortStocks();
        });
    }


    /**
     * 移除行情数据监听
     * @private
     */
    _cancelRequest(){
        this.blockSortRequest && this.blockSortRequest.cancel();
    }

//解析数据
    _getCurrentSortStocks(){
        //资金抢入个股 默认资金排序：
        this.setListener();
        return;

        //////////////////////////////////////////////////////
        //后续安行情排序
        if(this.marketStock.length <= 0)
            return;

        //1.行情数据根据股票代码排序
        let marketStock = this.marketStock;

        marketStock.sort((info,next) => {
            let codeFirst = '';
            let codeNext = '';
            if(Platform.OS === 'ios'){
                codeFirst = info.Obj;
                codeNext = next.Obj;
            }else {
                codeFirst = info.label_;
                codeNext = next.label_;
            }

            let firstC = parseInt(codeFirst.substring(2));
            let nextC = parseInt(codeNext.substring(2));
            return firstC - nextC;
        })

        // this._console('行情数据 == '+ JSON.stringify(marketStock));
        let stocks = [];

        //2.排序后，根据二分法选出股池股票
        this.state.stockArray[0] &&  this.state.stockArray[0].items && this.state.stockArray[0].items.map((info) => {
            let index =  searchStockIndex(marketStock,0,marketStock.length - 1,info.marketCode);
            if(index !== -1){
                let stock = marketStock[index];
                if(Platform.OS === 'ios'){
                    info.sortValue = stock.value;
                }else {
                    info.sortValue = stock.value_;
                }
                stocks.push(info);
            }
        })

        // this._console('行情数据 ==  排序前 '+ JSON.stringify(stocks) +JSON.stringify(this.state.stockArray));

        //3.选出的股池股票根据行情value排序
        stocks.sort((info,next) => {
            let codeFirst = info.sortValue;
            let codeNext = next.sortValue;

            if(this.state.desc){
                return codeNext - codeFirst;
            }else {
                return codeFirst - codeNext;
            }
        })


        // this._console('行情数据 ==  排序后 '+ JSON.stringify(stocks));

        //4.设置排序后的股池
        if(stocks && stocks.length){
            let message = {};
            message.items = stocks;
            message.count = stocks.length;

            this.setState({
                stockArray: [message],
            },() =>{ this.setListener();})
        }
    }


    _loadData(callBack) {

        if (this.selectedIndex === 0) {
            this._getStockMessage(stockType.longHu, callBack);
            this._getStockMessageCount(stockType.gaoGuan);
            this._getStockMessageCount(stockType.zhuLi);
        } else if (this.selectedIndex === 1) {
            this._getStockMessage(stockType.gaoGuan, callBack);
            this._getStockMessageCount(stockType.longHu);
            this._getStockMessageCount(stockType.zhuLi);
        } else if (this.selectedIndex === 2) {
            this._getStockMessage(stockType.zhuLi, callBack);
            this._getStockMessageCount(stockType.longHu);
            this._getStockMessageCount(stockType.gaoGuan);
        } else {
            callBack && callBack();
        }
    }

    //实时数据监听
    _addListeners() {
        this._console('监听数据===  _addListeners' + this.addQuotationList);
        if (this.addQuotationList.length > 0) {
            this.getStockListInfo(() => {

                // QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                //     // console.log(stockObj)
                //     //设置行情数据
                //     this.setQuotation(stockObj);
                // });
            });
        }
    }
    /**
     * 每次设置监听前，先去拿对应监听列表的数据，
     * 然后再设置监听，这里是拿数据,这是拿行情数据
     * */
    getStockListInfo(callBack) {
        if (this.addQuotationList.length > 0) {
            QuotationListener.getStockListInfo(this.addQuotationList, (stockObj) => {
                //设置数据刷新
                if (stockObj.length > 0) {
                    for (let i = 0; i < this.state.stockArray[0].items.length; i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            if (this.state.stockArray[0].items[i].marketCode == stockObj[j].c) {
                                this.state.stockArray[0].items[i].presentPrice = Number(stockObj[j].k);
                                this.state.stockArray[0].items[i].upDown = Number(stockObj[j].y).toFixed(2);
                            }
                        }
                    }
                    this.setState({
                        stockArray: this.state.stockArray
                    }, () => {
                        if (callBack) { callBack() }
                    })
                } else {
                    if (callBack) { callBack() }
                }
            });
        } else {
            if (callBack) { callBack() }
        }
    }


    //实时数据移除
    _offListeners() {
        // console.log('监听数据===  _offListeners',this.itemIndex,this.addQuotationList);
        //如果有数据,先去解注册
        if (this.addQuotationList.length > 0) {
            QuotationListener.offListeners(this.addQuotationList, () => { });

            this.addQuotationList = [];
        }
    }


    /**
     * 设置行情数据
     *
     * */
    setQuotation(stockObj) {
        if (this.state.stockArray.length > 0 && this.state.stockArray[0].items.length > 0) {
            // let stocks = this.state.stockArray[0].items;
            // let stockA = this.state.stockArray[0];
            // let newStocks = [];
            this.state.stockArray[0].items.map((info, index) => {
                if (info.marketCode === stockObj.c) {
                    info.presentPrice = Number(stockObj.k);
                    info.upDown = Number(stockObj.y).toFixed(2);
                }
                // newStocks.push(info);
            });
            //stockA.items = newStocks;
            //页面刷新
            this.setState({
                stockArray: this.state.stockArray
            })
        }
    }

    //获取股票总个数
    _getStockMessageCount(stockT) {
        let path = '';
        let param = {};
        param.onlyCount = '1';
        if (this.specialTag && this.specialTag !== "") {
            param.tszb = this.specialTag;
        }
        switch (stockT) {
            case stockType.longHu:
                path = this.longHuPath;
                param.qttj = this.setLHString;

                break;
            case stockType.gaoGuan:
                path = this.gaoGuanPath;
                param.qttj = this.setGGString;

                break;
            case stockType.zhuLi:
                path = this.zhuLiPath;
                param.qttj = this.setZLString;
                break;
            default:
                break;
        }

        this._console('获取个数 = ' + stockT + ',' + JSON.stringify(param) + ',' + path + this.specialTag);
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, path, param, (response) => {
            if (response) {
                switch (stockT) {
                    case stockType.longHu:
                        this.setState({
                            longhuCount: response.count,
                        })
                        break;
                    case stockType.gaoGuan:
                        this.setState({
                            gaoGuanCount: response.count,
                        })

                        break;
                    case stockType.zhuLi:
                        this.setState({
                            zhuLiCount: response.count,
                        })

                        break;
                    default:
                        break;
                }
            }
        }, () => {
        });
    }

    _getStockMessage(stockT, callBack) {
        //清空数据,每次点击tab切换时，请求最新的数据
        // this.state.stockArray = [];

        let path = '';
        let param = {};//这个是请求列表的参数
        if (this.specialTag && this.specialTag !== "") {
            param.tszb = this.specialTag;
        }
        param.page = this.Page;
        param.pageSize = this.PageSize;
        param.sortOrder = 'desc';

        switch (stockT) {
            case stockType.longHu:
                path = this.longHuPath;
                //上个页面传递的筛选条件
                if(this.setLHString)
                    param.qttj = this.setLHString;
                param.sort = 'seatFouds';//排序条件


                break;
            case stockType.gaoGuan:
                path = this.gaoGuanPath;
                //上个页面传递的筛选条件
                if(this.setLHString)
                    param.qttj = this.setGGString;
                param.sort = 'executiveFunds';//排序条件

                break;
            case stockType.zhuLi:
                path = this.zhuLiPath;
                //上个页面传递的筛选条件
                if(this.setLHString)
                    param.qttj = this.setZLString;
                param.sort = 'daDanFouds';//排序条件

                break;
            default:
                break;
        }

        this._console('param = ' + JSON.stringify(param) + this.specialTag);
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, path, param, (response) => {
            this._console('成功 response = '+JSON.stringify(response));
            if (response.list.length > 0) {

                let message = {};
                let newMessage = response.list;
                let count = response.count;

                message.items = newMessage;

                let lhCount = this.state.longhuCount;
                let ggCount = this.state.gaoGuanCount;
                let zlCount = this.state.zhuLiCount;

                switch (stockT) {
                    case stockType.longHu:
                        if (this.selectedIndex === 0) {
                            lhCount = count;
                        }
                        break;
                    case stockType.gaoGuan:
                        if (this.selectedIndex === 1) {
                            ggCount = count;
                        }
                        break;
                    case stockType.zhuLi:
                        if (this.selectedIndex === 2) {
                            zlCount = count;
                        }
                        break;
                    default:
                        break;
                }

                this.setState({
                    allLoaded: true,
                    stockArray: [message],
                    longhuCount: lhCount,
                    gaoGuanCount: ggCount,
                    zhuLiCount: zlCount,
                    stockCount:count,
                })

                //刷新后监听
                // this.setListener();
                this._getCurrentSortStocks();
                callBack && callBack(true);
            } else {
                this.setState({
                    allLoaded:true,
                    stockArray:[],
                    stockCount:0,
                })
                callBack && callBack()
            }

        }, () => {
            // this._console('失败 = '+JSON.stringify(response));
            this.setState({
                allLoaded: true,
            })
            callBack && callBack();
        });
    }

    _clickBack() {
        if (this.props.navigation) this.props.navigation.goBack();
    }

    //滑动结束
    mScrollEnd() {
        // this.setListener();
        if (!this.hasTimeOut) {
            this.hasTimeOut = true;
            setTimeout(() => {
                this.hasTimeOut = false;
                if (new Date().getTime() - this.touchTime > this.touchTimeLenght) {
                    this._console('_scrollDragEnd  监听数据');
                    if (this.focus)
                        this.setListener();
                } else {
                    this.mScrollEnd();
                }
            }, this.touchTimeLenght);
        }


    }

    //手指移动结束
    onTouchEnd() {
        if (Platform.OS !== 'ios') {
            return;
        }

        setTimeout(() => {
            if (!this.scrollBegin) {
                // this.setListener();
                this.mScrollEnd();

            } else {
                this.scrollBegin = false;
            }
        }, 500);
    }

    onMomentumScrollBegin() {
        this.scrollBegin = true;
    }

    /**
     *计算当前屏幕中显示的第一条数据index，获取需要监听的股票数组
     */
    _currentDateIndex() {
        let index = Math.floor((this.mScrolly - this.headerHeight) / itemHeight);
        index = index < 0 ? 0 : index;

        this._console('监听行情股票数组' + this.mScrolly + ',' + index)
        return index;
    }

    //最大屏幕显示显示10条数据
    setListener() {

        let index = this._currentDateIndex();

        if (this.state.stockArray.length > 0 && this.state.stockArray[0].items.length > 0) {
            let arrayLength = this.state.stockArray[0].items.length;
            arrayLength = (index + 1 + this.listenersSize) > arrayLength ? arrayLength : index + 1 + this.listenersSize
            this.addQuotationList = [];
            for (let i = index; i < arrayLength; i++) {
                this.addQuotationList.push(this.state.stockArray[0].items[i].marketCode)
            }
            this._addListeners();
        }
    }


    render() {
        return (
            <View style={{ flex: 1, paddingBottom: baseStyle.isIPhoneX ? 34 : 0 }}>
                <View style={{
                    width: ScreenUtil.screenW,
                    height: ScreenUtil.statusH + (Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90)),
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>

                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={['#97657E', '#2F2352']}
                        style={styles.conNoDivider}>
                        <View style={{ flexDirection: "row", width: ScreenUtil.screenW, height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90) }}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this._clickBack()} style={styles.backView}>
                                <Image source={require('../../images/login/login_back.png')} style={styles.backIcon} />
                            </TouchableOpacity>
                            <View style={styles.navTitleBack}>
                                <Text style={styles.navTitle} numberOfLines={1}>{'资金抢入个股'}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={['#fff', '#fff']}
                        ref={ref => this.navBar = ref}
                        style={[styles.conNoDivider, { opacity: 0 }]}>
                        <View style={{ flexDirection: "row", width: ScreenUtil.screenW, height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90) }}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this._clickBack()} style={styles.backView}>
                                <Image source={require('../../images/login/login_back.png')} style={styles.backIcon} />
                            </TouchableOpacity>
                            <View style={styles.navTitleBack}>
                                <Text style={styles.navTitle}
                                    ref={ref => this.navBarText = ref}
                                    numberOfLines={1}>{'资金抢入个股'}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <StickyForm
                    style={{ backgroundColor: "#f6f6f6" }}
                    contentStyle={{ alignItems: "flex-start", width: commonUtil.width }}
                    data={this.state.stockArray}
                    ref={ref => (this._list = ref)}
                    heightForSection={() => SECTION_HEIGHT}
                    renderHeader={this._renderHeader}
                    renderFooter={this._renderMyFooters}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => itemHeight}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    // bounces={false}
                    headerStickyEnabled={false}
                    onRefresh={() => {
                        {/*this._getStockMessage();*/ }
                        this._loadData(() => {
                            this._list.endRefresh();
                        });
                    }}
                    allLoaded={this.state.allLoaded}
                    loadingFooter={mNormalFooter}
                    refreshHeader={mNormalHeader}
                    renderEmpty = {this._emptyData}
                    onLoading={() => {
                    }}

                    onScrollBeginDrag={() => {//手指拖动开始
                        this.touchTime = new Date().getTime();

                        {/*this._console('滑动 ==== onScrollBeginDrag',this.mScrollY);*/ }
                    }}
                    onScrollEndDrag={() => {//手指拖动结束
                        this.touchTime = new Date().getTime();
                        this.onTouchEnd();
                        {/*this._console('滑动 ==== onScrollEndDrag 滑动结束拖拽时触发onScrollEndDrag',this.mScollY);*/ }
                    }}

                    onMomentumScrollEnd={() => {
                        this.touchTime = new Date().getTime();
                        this.mScrollEnd();
                    }}
                    onMomentumScrollBegin={() => {
                        this.onMomentumScrollBegin();
                    }}
                    onTouchBegin={() => {
                        this.touchTime = new Date().getTime();
                    }}
                    onTouchEnd={() => {
                        this.touchTime = new Date().getTime();
                    }}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                        this.mScrolly = y;
                        this._console('scroll = y = ' + this.mScrolly + ',' + y)
                        let heights = Platform.OS === 'ios' ? ScreenUtil.statusH + 44 : ScreenUtil.statusH + ScreenUtil.scaleSizeW(90)
                        if (y < heights) {
                            let opacityPercent = y / heights;
                            this.navBar.setNativeProps({
                                style: { opacity: opacityPercent }
                            });
                            this.navBarText.setNativeProps({
                                style: { color: "white" }
                            })

                        } else {
                            this.navBar.setNativeProps({
                                style: { opacity: 1 }
                            });
                            this.navBarText.setNativeProps({
                                style: { color: "#000" }
                            })
                        }

                    }}
                />

            </View>
        );
    }

    //数据返回后进行排序
    _getOrderMessage(stocks) {
        this.addQuotationList = this._getListeners(stocks);
        this._addListeners();

    }

    //获取监听数组
    _getListeners(stocks) {
        //下标不存在 或者为0
        let index = 0;
        if (this.itemIndex <= 0) {//从头开始
            index = 0;
        } else if (stocks[0].items && stocks[0].items.length <= numberListener) { //股票不够 numberListener个
            index = 0
        } else if (stocks[0].items && stocks[0].items.length - this.itemIndex <= numberListener) {//股票从下标itemIndex位置 不够numberListener个
            index = stocks[0].items.length - numberListener;
        } else {//从下标位置开始
            index = this.itemIndex;
        }

        //数据监听处理
        let listenertArray = [];
        for (index; index < stocks[0].items.length; index++) {
            let info = stocks[0].items[index];
            if (listenertArray.length < numberListener) {
                if (info) {
                    let code = info.marketCode;
                    listenertArray.push(code)
                }
            } else {
                break;
            }
        }
        return listenertArray;
    }


    _onPress(tagName, tagIndex) {
        //切换，选中小标，历史数据，title改变

        let titleObj = getTitle(tagName);

        this.selectedIndex = tagIndex;
        this.historyTypeS = titleObj.history.historyTypeS;
        this.setState({
            titles: titleObj.titles,//title也需要切换
            sortDown:true,//点击的时候请求接口,页面还原为倒序
            historyTitle:titleObj.history.historyTitle,
            stockArray:[]
        },()=>{
            // this._getStockMessage(tagName);
            this._loadData();
        })
    }

    _emptyData = () => {

        // if (stocks.length > 0) {
        //     return null;
        // }
        return (
            <View style={{ flexDirection: "row", height: SECTION_HEIGHT + 400 }}>
                <View>
                    <View style={{ width: commonUtil.width, backgroundColor:'#fff'}}>
                        <NoDataPage
                            content={'暂无股票入选'}
                            source={require('../../images/TuyereDecision/no_stock_data.png')}
                            isNoShow={true} />
                    </View>

                </View>
            </View>
        )
    }

    _stockTypeView(info,index){

        let count = 0;
        let colors = ['#2870FF', '#6699ff'];
        switch (info) {
            case stockType.longHu:
                colors = ['#2870FF', '#6699FF'];
                count = this.state.longhuCount;
                break;
            case stockType.gaoGuan:
                colors = ['#FF2B03', '#FF6333'];
                count = this.state.gaoGuanCount;
                break;
            case stockType.zhuLi:
                colors = ['#B82BFF', '#CC63FF'];
                count = this.state.zhuLiCount;
                break;
            default:
                break;
        }

        return (

            <View
                key = {index}
                style={{ flex: 1, height: ScreenUtil.scaleSizeW(200), marginHorizontal: 10, marginTop: 10, paddingBottom: ScreenUtil.scaleSizeW(30) }}>
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={colors}
                    style={{ flex: 1, height: 80, borderRadius: 10 }}>
                    <TouchableOpacity
                        onPress={() => this._onPress(info, index)}
                        style={{ flex: 1, height: 75, justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: '#fff' }}>{info}</Text>
                        <Text style={{ marginTop: Platform.OS === 'android' ? ScreenUtil.scaleSizeW(12) : ScreenUtil.scaleSizeW(14), fontSize: ScreenUtil.setSpText(24), color: '#fff' }}>
                            {'入选' + count + '只'}
                        </Text>

                    </TouchableOpacity>

                </LinearGradient>

                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: ScreenUtil.scaleSizeW(20) }}>
                    {this.selectedIndex === index && <View style={{ height: 3, width: 20, borderRadius: 2, backgroundColor: '#fff' }} />}
                </View>

            </View>
        )
    }

    _onLayout(event) {
        let layout = event.nativeEvent.layout;
        this.headerHeight = layout.height;
    }

    _historyPage(){
        sensorsDataClickObject.adAchievements.module_source = '资金揭秘';
        sensorsDataClickObject.adAchievements.page_source =  this.state.historyTitle;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adAchievements);
        Navigation.navigateForParams(this.props.navigation, 'HistoryRecordPage', { type: this.historyTypeS,title:this.state.historyTitle+'历史表现'});
    }

    _historyView() {
        return (
            <View style={{
                backgroundColor:'#fff',
                height:ScreenUtil.scaleSizeW(88),
                justifyContent:'space-between',
                alignItems:'center',
                borderTopRightRadius:ScreenUtil.scaleSizeW(20),
                borderTopLeftRadius:ScreenUtil.scaleSizeW(20),
                flexDirection:'row',
                paddingLeft:ScreenUtil.scaleSizeW(22),
                paddingRight:ScreenUtil.scaleSizeW(22)
            }}>
                <View>
                    <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:baseStyle.BLACK}}>{'入选'+this.state.stockCount+'只'}</Text>
                </View>

                <TouchableOpacity activeOpacity = {1} onPress={() => this._historyPage()}>
                    <ImageBackground
                        style={{
                            width:ScreenUtil.scaleSizeW(310),
                            height:ScreenUtil.scaleSizeW(60),
                            flexDirection:'row',
                            justifyContent:'center',
                            alignItems:'center',
                        }}
                        source={require('../../images/MainDecesion/main_history_bg.png')}>
                        <Image source={require('../../images/MainDecesion/main_history.png')}/>
                        <Text style={{
                            fontSize:ScreenUtil.scaleSizeW(24),
                            color:'#0099FF',
                            marginLeft:5,
                        }}>
                            {this.state.historyTitle+'历史表现'}</Text>
                    </ImageBackground>
                </TouchableOpacity>

            </View>
        )
    }

    _renderHeader = () => {
        let buttonTitle = ['龙虎资金', '高管资金', '主力资金'];

        return (
            <View
                style={{ width: commonUtil.width, backgroundColor: "white", }}>
                <View
                    onLayout={(event) => this._onLayout(event)}>
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={['#97657E', '#2F2352']}>
                        <View style={{ flexDirection: 'row' }}>
                            {
                                buttonTitle.map((info, index) =>
                                    this._stockTypeView(info, index)
                                )
                            }
                            {/*{this.state.stockArray.length>0 ?*/}
                                {/*<View style={{position: 'absolute',*/}
                                    {/*left:0,*/}
                                    {/*bottom:-1,width:ScreenUtil.screenW,height:5,backgroundColor:"#F1F8FD",borderTopLeftRadius:5,borderTopRightRadius:5}}/>*/}
                            {/*:*/}
                                {/*null*/}
                            {/*}*/}


                        </View>
                        {this._historyView()}
                    </LinearGradient>
                </View>
            </View>
        );
    };

    _sortPress(index) {
        if (index !== 0 && this.selectedIndex === 2) { return; }
        this.setState({
            sortDown: !this.state.sortDown,
        }, () => {
            switch (this.selectedIndex) {
                case 0:
                    this._getStockMessage(stockType.longHu);
                    break;
                case 1:
                    this._getStockMessage(stockType.gaoGuan);
                    break;
            }
        })
        // this.setState({
        //     sortDown:!this.state.sortDown,
        // },() =>{this.setState({stockArray:this._getOrderMessage(this.state.stockArray)})})
    }


    _sectionTitle() {
        return (
            <View style={[styles.text]}>
                <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666"}}>股票名称</Text>
            </View>
        )
    }

    _sectionScrollTitle(info, index) {
        let sortImage = this.state.sortDown ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        let defaultSortImage = require('../../images/hits/defaultt.png');
        return (
            <View style={[styles.headerText, { borderTopRightRadius: ScreenUtil.scaleSizeW(10) }]} key={index}>
                <TouchableOpacity activeOpacity={1}
                                  // onPress={() => this._sortPress(index)}
                                  style={styles.headerText} key={index}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#666666" }}>
                        {info.title}
                    </Text>
                    {/*{*/}
                    {/*index === 0 && this.selectedIndex < 2 &&  <Image style={{marginLeft:5}} source={*/}
                    {/*index === this.state.sortButtonIndex ? sortImage : defaultSortImage}/>*/}
                    {/*}*/}
                </TouchableOpacity>
            </View>
        )
    }

    _renderSection = (section) => {

        return (
            <View style={{ flex: 1, flexDirection: "row", paddingRight: 15, backgroundColor: "#F1F8FD" }}>
                {this._sectionTitle()}
                {this.state.titles.map((info, index) =>
                    this._sectionScrollTitle(info, index)
                )}
            </View>
        );
    };

    _pushDetailPage(item, index) {

        let data = {};
        data.Obj = item.marketCode;
        data.ZhongWenJianCheng = item.secName;
        data.obj = item.marketCode;

        let codeArray = [];
        if (this.state.stockArray.length > 0 && this.state.stockArray[0].items.length) {
            let stocks = this.state.stockArray[0].items;
            stocks.map((info, index) => {
                let itemObj = {};
                itemObj.Obj = info.marketCode;
                itemObj.ZhongWenJianCheng = info.secName;
                itemObj.obj = info.marketCode;
                codeArray.push(itemObj)
            })
        }

        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: codeArray,
            index: index,
            isNull: "",
        })
    }


    _renderItem = (path) => {
        const item = this.state.stockArray[path.section].items[path.row];

        // console.log('资金揭秘 == '+JSON.stringify(item));

        let codeName = item.secName;
        let codeMark = item.marketCode;
        let upDown = item.upDown;
        //console.log("涨跌幅",upDown)
        let xianJia = item.presentPrice;
        let seatFouds = item.seatFouds;
        //console.log("金额",seatFouds)
        if (this.selectedIndex === 0) {
            seatFouds = item.seatFouds;
        } else if (this.selectedIndex === 1) {
            seatFouds = item.executiveFunds;
        } else if (this.selectedIndex === 2) {
            // seatFouds = item.dadan_fouds;
            seatFouds = item.daDanFouds;
        }



        let bgUPClr = 'rgba(255,51,0,0.05)';
        let bgDowClr = 'rgba(51,153,0,0.05)';
        let moneyColor = '#333333';
        let bgClr = bgUPClr;
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (upDown > 0) {
            clr = baseStyle.UP_COLOR;
            bgClr = bgUPClr;
            moneyColor = '#660000';
        }
        else if (upDown < 0) {
            clr = baseStyle.DOWN_COLOR;
            bgClr = bgDowClr;
            moneyColor = '#006600';
        }
        return (
            <TouchableOpacity onPress={() => this._pushDetailPage(item, path.row)} style={styles.row}>
                <View style={styles.titleText}>
                    <View style={{ flexDirection: "row", flex: 1, alignItems: 'center' }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(30), color: baseStyle.BLACK_333333 }}>
                                {codeName}
                            </Text>
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_666666, marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(2) : 0 }}>
                                {codeMark}
                            </Text>
                        </View>
                        <View style={{ flex: 1, }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', height: ScreenUtil.scaleSizeW(60), backgroundColor: bgClr, borderRadius: 5, }}>
                                <StockFormatText precision={2} style={{ textAlign: 'center', fontSize: ScreenUtil.scaleSizeW(40), color: moneyColor, fontWeight: 'bold' }} unit="元/万/亿">{seatFouds}</StockFormatText>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", height: ScreenUtil.scaleSizeW(90), marginBottom: ScreenUtil.scaleSizeW(30), backgroundColor: '#F1F8FD', borderRadius: 5, }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <StockFormatText style={{ textAlign: 'center', fontSize: ScreenUtil.setSpText(32), color: clr, fontWeight: 'bold', }} unit="%" sign={true}>{upDown / 100}</StockFormatText>
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_666666 }}>{'涨跌幅'}</Text>
                        </View>
                        <View style={{ width: 0.5, backgroundColor: baseStyle.BLACK_000000_10 }} />

                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <StockFormatText titlename={"ZuiXinJia"} style={{
                                textAlign: 'center',
                                fontSize: ScreenUtil.setSpText(32),
                                color: clr,
                                fontWeight: 'bold'
                            }}>{xianJia}</StockFormatText>
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_666666 }}>{'现价'}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        return(
            <View>
                <View style={{ width: ScreenUtil.screenW, paddingVertical:ScreenUtil.scaleSizeW(40),paddingHorizontal:ScreenUtil.scaleSizeW(20), backgroundColor: "#f3f0f3", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0,textAlign:"center"}}
                    >温馨提示：信息内容仅供参考,不构成操作决策依据，股市有风险，投资需谨慎</Text>

                </View>
            </View>
        )
    }


    _console(info) {
        // console.log(' 资金抢入个股 = ' + info)
    }
}

const styles = StyleSheet.create({
    hotSetButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: baseStyle.ORANGE_FF9933,
        borderWidth: 1,
        borderRadius: 5,
        height: 24,
        marginLeft: 15,
        paddingLeft: 10,
        paddingRight: 10,
    },
    text: {
        // flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F8FD",
        width:widthCell,
        borderRadius:10,
        height: SECTION_HEIGHT
    },
    row: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: '#fff'
    },
    headerText: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F8FD",
        flexDirection: 'row',
        width: widthCell,
    },
    titleText: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#EEE",
        width: widthCell * 2,
        paddingLeft: 14,
        paddingRight: 14,
    },
    navTitleBack: {
        width: ScreenUtil.screenW - 80,
        height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),
        marginHorizontal: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        color: 'white',
        fontSize: ScreenUtil.setSpText(34),
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    conNoDivider: {
        //backgroundColor: "white",
        paddingTop: ScreenUtil.statusH,
        width: ScreenUtil.screenW,
        position: 'absolute',
        left: 0,
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backView: {
        position: 'absolute',
        top: 0,
        width: 40,//这个宽度随意就行
        height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: "center"
    },
    backIcon: {
        width: 12,
        height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),
        marginLeft: 10,
        resizeMode: 'contain'
    },
});
