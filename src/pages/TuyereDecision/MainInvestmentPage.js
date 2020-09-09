/**
 * Created by cuiwenjuan on 2019/8/16.
 */
import React, { Component } from 'react';
import { Image, PixelRatio, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, AppState } from 'react-native';
import { StickyForm } from "react-native-largelist-v3";
import LinearGradient from 'react-native-linear-gradient';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import ExpandableText from '../../components/ExpandableText';
import { mNormalFooter } from "../../components/mNormalFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
import StockFormatText from '../../components/StockFormatText';
import ShareSetting from '../../modules/ShareSetting';
import { commonUtil, toast ,searchStockIndex} from '../../utils/CommonUtils';
import QuotationListener from '../../utils/QuotationListener';
import * as ScreenUtil from '../../utils/ScreenUtil';
import Yd_cloud from '../../wilddog/Yd_cloud';
import NoDataPage from '../NoDataPage';
import { historyType } from './HistoryRecordPage';
import TopButton from '../../components/TopButton'
import RefreshButton from '../../components/RefreshButton'
import UserInfoUtil from "../../utils/UserInfoUtil";
import {connection} from "../Quote/YDYunConnection";
import NetInfo from "@react-native-community/netinfo";



let refPath = Yd_cloud().ref(MainPathYG);
//部分源达云节点修改为MainPathYG2
let refPath2 = Yd_cloud().ref(MainPathYG2);
let refUpDataTime = refPath.ref('CeLueZhongXin/ZhuTiCeLue/xuangufanwei');

// let mainReport = 'ZhuTiTouZi/ZhuTiBanKuai';

let widthCell = 100;
let SECTION_HEIGHT = ScreenUtil.scaleSizeW(60);


export default class MainInvestmentPage extends Component {
    // 股票名称（股票代码）、涨跌幅、现价、所属板块、换手率、市盈率

    constructor(props) {
        super(props);
        this.state = {
            strategy: '',
            growSchool: [],
            stockArray: [],
            setData: [{ tabName: "放量上攻", tabIndex: 0 }],
            //specialSc:[{tabName: "放量上攻", tabIndex: 0}],//特色指标数据
            report: [],//当前页面显示的最多2条的主题报告
            allReport: [],//跳转更多的所有主题的主题报告
            desc: true,
            titleid:199,
            selectSortIndex:0,
            titles: [
                {title:"涨跌幅",isSort:-1,titleid:199},
                {title:"现价",isSort:-1,titleid:33},
                {title:"换手率",isSort:-1,titleid:256},
                {title:"市盈率",isSort:-1,titleid:258},
                {title:"所属主题",isSort:-1},
            ],
            allLoaded: true,
            haveReportMore: false,//是否显示报告更多按钮
            themeArray: [],
            selectIndex: 0,//默认选中第一个主题，
            refreshDate: "",//列表请求时间
            listCanScroll: true,//列表是否能滑动
        };

        // this.tabIndex = this.props.tabIndex;

        //标准版
        let pathMessage = { 'CeLueJieShao': 'CeLueJieShao/18', 'ChengZhangXueTang': 'ChengZhangXueTang/主题策略', 'path': '/celuexuangu/ztclxg', 'selectRange': 'ZhuTiTouZi/ZhuTiTouZiNew' };
        //新规1版
        // let pathMessage = { 'CeLueJieShao': 'CeLueJieShao/18', 'ChengZhangXueTang': 'ChengZhangXueTang/主题策略', 'path': '/celuexuangu/ztclxg', 'selectRange': 'ZhuTiTouZi/XuanGuFanWei' };


        this.refPathCeLue = refPath2.ref(pathMessage.CeLueJieShao);
        this.refPathXueTang = refPath.ref(pathMessage.ChengZhangXueTang);
        this.postPath = pathMessage.path;
        // this.refMainReport = refPath.ref(mainReport);
        this.refSelectRange = refPath2.ref(pathMessage.selectRange);

        this.historyTypeS = historyType.mainOne;
        //this.sortButtonIndex = 3;
        this.czxtPath = pathMessage.ChengZhangXueTang;

        this.addQuotationList = [];
        this.hearderHeight = 0;//给表格原生传入的header高度，防止滑动问题

        this.requestHeightLow = 0; //给原生表格传入的header的高度,这个是hearder中屏蔽上下滑动的事件的高度，现在是屏蔽选股范围的横向滑动的ScrollView的滑动事件(下边界)
        this.requestHeightUp = 0; //给原生表格传入的header的高度,这个是hearder中屏蔽上下滑动的事件的高度，现在是屏蔽选股范围的横向滑动的ScrollView的滑动事件(上边界)
        this.mScrollX = 0;
        this.mScrollY = 0;//y方向偏移量
        this.scrollBegin = false;//是否有惯性滚动
        this.touchTime = 0;//手指触发屏幕时间戳
        this.touchTimeLenght = 1500;//滑动结束和监听数据的时间间隔
        this.focus = true;
        this.selected = true;
        this.PageSize = 300;
        this.Page = 1;
        this.listenersSize = 16;//监听数据个数

    }

    componentWillMount() {
        this.loadDataHeader();
        this._loadData();
    }

    componentWillUnmount() {

    }

    //显示当前页面
    willFocus() {
        this._console('MainInvestmentPage 显示当前页面'+this.tabIndex)
        this.focus = true;
        this._getQuotationList();
        this._upDataTime();
        this._getMarketStock();

        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    //不在当前页面
    willBlur() {
        this._console('MainInvestmentPage 不显示当前页面'+this.tabIndex)
        this.focus = false;
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
                this._refOff();
                this._cancelRequest();

                //在重新请求
                this._upDataTime();
                this._getMarketStock();
            }
        }

    }

    _handleAppStateChange = (nextAppState) =>{
        this._console('前后台'+JSON.stringify(nextAppState))

        if (nextAppState === 'active') {
            //获取数据
            this._upDataTime();
            this._getMarketStock();

        }
        else if (nextAppState === 'background') {
            this._console('后台'+JSON.stringify(nextAppState))
            this._refOff();
            this._cancelRequest();
        }
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
            // this._console('行情数据 == '+ JSON.stringify(data));
            this._console('行情数据 == 回调' + data.length);
            this.marketStock = data;
            this._getCurrentSortStocks();//获取当前屏幕中股票行情数据
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
            },() =>{  this._getQuotationList();})
        }
    }


    _refOff() {
        refUpDataTime.off('value');
    }

    //监听五分钟更新一次
    _upDataTime() {
        // this._console(' _upDataTime= 数据更新了');
        refUpDataTime.on("value", (response) => {
            this._console(' = 数据更新了'+response);
            this._loadData();
        })
    }

    //实时数据监听
    _addListeners() {
        if (this.addQuotationList.length > 0) {
            this.getStockListInfo(() => {
                //现在只获取不监听

                // QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                //     // console.log("监听行情回来的数据",stockObj);
                //     //设置行情数据
                //     this.setQuotation(stockObj);
                // })
            });
        }
    }
    /**
     * 每次设置监听前，先去拿对应监听列表的数据，
     * 然后再设置监听，这里是拿数据,这是拿行情数据
     * */
    getStockListInfo(callBack) {
        // this._console('获取监听数据'+JSON.stringify(this.addQuotationList))
        if (this.addQuotationList.length > 0) {
            QuotationListener.getStockListInfo(this.addQuotationList, (stockObj) => {
                //设置数据刷新
                if (stockObj.length > 0) {
                    for (let i = 0; i < this.state.stockArray[0].items.length; i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            if (this.state.stockArray[0].items[i].marketCode == stockObj[j].c) {
                                this.state.stockArray[0].items[i].presentPrice = Number(stockObj[j].k);
                                this.state.stockArray[0].items[i].upDown = Number(stockObj[j].y);
                                this.state.stockArray[0].items[i].turnoverRate = Number(stockObj[j].ak);
                                this.state.stockArray[0].items[i].peRatio = Number(stockObj[j].al);
                            }
                        }
                    }
                    // this._console('获取监听数据'+JSON.stringify(this.addQuotationList)+','+JSON.stringify(this.state.stockArray))
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
        //如果有数据,先去解注册
        if (this.addQuotationList.length > 0) {
            QuotationListener.offListeners(this.addQuotationList, () => { });
            this.addQuotationList = [];
        }
    }


    /**
     * 设置行情数据
     * // case '涨跌幅':  item.upDown
     // case '现价': item.presentPrice
     // case '所属板块': item.indexName
     // case '换手率': item.turnoverRate
     // case '市盈率': item.peRatio;
     // 股票代码： marketCode
     * */
    setQuotation(stockObj) {
        if (this.state.stockArray.length > 0 && this.state.stockArray[0].items.length > 0) {
            let stocks = this.state.stockArray[0].items;
            let stockA = this.state.stockArray[0];
            let newStocks = [];
            stocks.map((info, index) => {
                if (info.marketCode === stockObj.c) {
                    info.presentPrice = Number(stockObj.k);
                    info.upDown = Number(stockObj.y);
                    info.turnoverRate = Number(stockObj.ak);
                    info.peRatio = Number(stockObj.al);
                }
                newStocks.push(info);
            });
            stockA.items = newStocks;
            //页面刷新
            this.setState({
                stockArray: [stockA]
            })
        }
    }
    /**
     * 请求主题投资策略原理描述和成长学堂，因为不经常刷新，所以提出来
     * */
    loadDataHeader() {
        // console.log('主题投资  策略原理： = ',this.state)
        this.refPathCeLue.get((snapshot) => {
            // console.log('主题投资  策略原理： = ',JSON.stringify(snapshot.nodeContent),this.state );
            if (snapshot.nodeContent) {
                this.setState({ strategy: snapshot.nodeContent })
            }
        });

        this.refPathXueTang.orderByKey().limitToLast(2).get((snapshot) => {
            // console.log('主题投资  成长学堂： = ',snapshot.nodeContent);
            if (snapshot.nodeContent) {
                let values = Object.values(snapshot.nodeContent);
                values.reverse();
                if (values && values.length > 0) {
                    // let newItem = [];
                    // for (let i = 0; i < (values.length >= 2 ? 2 : values.length); i++) {
                    //     newItem.push(values[i]);
                    // }
                    this.setState({ growSchool: values })
                }
            }
        });
    }
    /**
     * 加载叠加条件和主题范围
     * */
    _loadData(callBack) {

        this.getThemeList(() => {
            //每次刷新了主题以后都刷新刷新列表
            this._getStockMessage(callBack);
        });

    }
    /**
     * 获取主题的List单独提取出来，方便多次调用
     * */
    getThemeList(callBack) {
        //
        this.refSelectRange.orderByKey().get((snapshot) => {
            if (snapshot.nodeContent) {
                let keys = Object.keys(snapshot.nodeContent);
                let values = Object.values(snapshot.nodeContent);
                // console.log("keys====",keys)
                // console.log("value====",values)
                if (keys.length > 0) {
                    //这里是设置主题范围对应的主题报告
                    //赋值一下theme_name
                    for (let y = 0; y < values.length; y++) {
                        values[y].theme_name = keys[y]
                    }

                    //先本地排序一下，level的值越大。5日主力资金越高
                    let newValues = values.sort(this.sortNumBigtoSmalls);
                    let reportArray = [];
                    //取了三条,但是只用2条，如果values.length>2 则会显示更多按钮，如果只有2条或者一条则不显示更多按钮
                    for (let i = 0; i < (newValues.length > 2 ? 2 : newValues.length); i++) {
                        reportArray.push({ _key: values[i].create_time, data: newValues[i] });
                    }
                    let allreports = [];
                    for (let i = 0; i < newValues.length; i++) {
                        allreports.push({ _key: newValues[i].create_time, data: newValues[i] });
                    }

                    //标准版
                    let keysNew = [];
                    for (let x = 0;x<newValues.length;x++){
                        keysNew.push(newValues[x].theme_name)
                    }

                    //新规1版
                    // let keysNew = [];
                    // let keysLength = newValues.length > 5 ? 5 : newValues.length;
                    // for (let x = 0; x < keysLength; x++) {
                    //     keysNew.push(newValues[x].theme_name)
                    // }

                    //这里是设置主题范围
                    this.setState({
                        themeArray: keysNew,
                        report: reportArray,
                        allReport: allreports,
                        haveReportMore: newValues.length > 2 ? true : false,
                    }, () => {
                        if (callBack) { callBack(); }
                    })
                } else {
                    if (callBack) { callBack(); }
                }
            } else {
                if (callBack) { callBack(); }
            }
        })
    }
    sortNumBigtoSmalls(a, b) {
        return b.level - a.level;
    }

    //测试数据
    testData(newMessage) {

        for (let i = 0; i < 500; i++) {
            let item = {};
            item.id = i;
            item.secCode = '000725';
            item.secName = i;
            item.marketCode = 'SZ000725';
            newMessage.push(item);
        }

        return newMessage;
    }

    //获取软件版本号
    _getVersion = () => {
        let version = UserInfoUtil.getVersion();
        version = 'V'+version;
        return version;
    }

    _getStockMessage(callBack) {

        let path = this.postPath;

        //标准版
        let param = { "tszb": "",simpleData: this._getVersion()};
       //新规1版
       //  let param = { "tszb": "",version:this._getVersion(),simpleData: this._getVersion()};


        //添加叠加条件
        if (this.state.setData && this.state.setData.length > 0) {
            let sspecial = "";
            for (let i = 0; i < this.state.setData.length; i++) {
                sspecial += this.state.setData[i].tabName + ","
            }
            sspecial = sspecial.substring(0, sspecial.length - 1);
            param.tszb = sspecial;
        }
        //添加主题
        if (this.state.themeArray.length > 0 && this.state.themeArray.length - 1 >= this.state.selectIndex) {
            param.ztmc = this.state.themeArray[this.state.selectIndex];
            // param.ztmc = "未知主题";
        }

        //新规1版  只有新规1才使用下面参数

        // //所有股票 和 资金TOP 参数区分
        // if (this.selected) {
        //     param.page = 1;
        //     param.pageSize = 8;
        //     param.sort = 'top8';
        //
        // } else {
        //     param.page = this.Page;
        //     param.pageSize = this.PageSize;
        //     param.sort = 'zdf';
        //     param.sortOrder = 'desc';
        // }


        //设置最新刷新时间
        let currentDateS = ShareSetting.getDate(Date.parse(new Date()), 'yyyy-MM-dd HH:mm');
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, path, param, (response) => {
            this._console(" == 请求成功",response);
            this._list.endRefresh();
            let message = {};
            let newMessage = response.list;
            let isAllLoaded = true;

            message.items = newMessage;
            message.count = response.count;

            // this._console("请求成功",setArray);
            this.setState({
                stockArray: [message],
                //setData:setArray,
                allLoaded: isAllLoaded,
                refreshDate: currentDateS,
            }, () => {
                if (Platform.OS === 'android') {
                    //Android让ScrollView主动刷新到保存的位置
                    setTimeout(() => {
                        this.myScrollView && this.myScrollView.scrollTo({ x: this.mScrollX, y: 0, animated: false })
                    }, 100)
                }
            });
            callBack && callBack();
            this._getQuotationList();
        }, (error) => {
            //console.log("回调的错误",error);
            if (error == '主题策略已更新') {
                toast('当前主题已取消');
                this.setState({
                    themeArray: [],
                    selectIndex: 0,
                    refreshDate: currentDateS,
                }, () => {
                    this.getThemeList(() => {
                        //每次刷新了主题以后都刷新刷新列表
                        this._getStockMessage(callBack);
                    })
                })

            } else if (error == '数据加载中') {
                callBack && callBack();
                this.setState({
                    allLoaded: true,
                    stockArray: [],
                    refreshDate: currentDateS,
                })

            } else if (error == '查询无数据') {
                callBack && callBack();
                this.setState({
                    allLoaded: true,
                    stockArray: [],
                    refreshDate: currentDateS,
                })

            } else {
                callBack && callBack();
                this.setState({
                    allLoaded: true,
                    stockArray: [],
                    refreshDate: currentDateS,
                })
            }

        });
    }

    /**
     *计算当前屏幕中显示的第一条数据index，获取需要监听的股票数组
     */
    _currentDateIndex() {
        let index = Math.floor((this.mScrollY - this.hearderHeight) / 50);
        index = index < 0 ? 0 : index;

        this._console('监听行情股票数组' + this.mScrollY + ',' + index)
        return index;
    }

    //监听行情数据 股票数据
    _getQuotationList() {
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

        this._console('监听数组' + index + ',' + JSON.stringify(this.addQuotationList) + JSON.stringify(this.state.stockArray))
    }

    _scrollDragEnd() {

        if (!this.hasTimeOut) {
            this.hasTimeOut = true;
            setTimeout(() => {
                this.hasTimeOut = false;
                if (new Date().getTime() - this.touchTime > this.touchTimeLenght) {
                    this._console('_scrollDragEnd  监听数据');
                    if (this.focus)
                        this._getQuotationList();
                } else {
                    this._scrollDragEnd();
                }
            }, this.touchTimeLenght);
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <StickyForm
                    style={{ backgroundColor: "#f6f6f6", flex: 1 }}
                    contentStyle={{ alignItems: "flex-start", width: 600 + 15 }}
                    data={this.state.stockArray}
                    ref={ref => (this._list = ref)}
                    scrollEnabled={Platform.OS === 'ios' ? true : this.state.listCanScroll}
                    heightForSection={() => SECTION_HEIGHT}
                    renderHeader={this._renderHeader}
                    renderFooter={this._renderMyFooters}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => 50}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    // bounces={false}
                    headerStickyEnabled={false}
                    renderEmpty={this._emptyData}
                    onRefresh={() => {
                        //刷新时,回复选择的主题范围为第一个
                        this.mScrollX = 0;
                        {/*this.state.selectIndex = 0;*/ }
                        this.loadDataHeader();
                        this._loadData(() => {
                            this._list.endRefresh();
                        });
                    }}
                    allLoaded={this.state.allLoaded}
                    loadingFooter={mNormalFooter}
                    refreshHeader={mNormalHeader}
                    onLoading={() => {}}
                    hearderHeight={this.hearderHeight}
                    requestHeightUp={this.requestHeightUp}//上边界
                    requestHeightLow={this.requestHeightLow}//下边界
                    /*
                     * lock (left 锁定左边距，使左边距没有 bounces 效果)
                     * x X坐标，y Y坐标，w 宽，h 高 (取消矩形外手势操作))
                     * 目前只实现了 lock:left,hot:y 效果
                     */
                    hotBlock={{ lock: "left", hotBlock: { x: 0, y: this.hearderHeight, width: 0, height: 0 } }}

                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                        this.mScrollY = y;
                    }}

                    onMomentumScrollBegin={() => {//惯性滑动开始
                        this.scrollBegin = true;
                        {/*this._console('滑动 ==== onMomentumScrollBegin');*/ }
                    }}
                    onMomentumScrollEnd={() => { //惯性滑动结束
                        this.touchTime = new Date().getTime();
                        //监听数据
                        this._scrollDragEnd();
                        {/*this._console('滑动 ==== onMomentumScrollEnd,一帧结束滚动');*/ }
                    }}
                    onScrollBeginDrag={() => {//手指拖动开始
                        this.touchTime = new Date().getTime();

                        {/*this._console('滑动 ==== onScrollBeginDrag',this.mScrollY);*/ }
                    }}
                    onScrollEndDrag={() => {//手指拖动结束
                        this.touchTime = new Date().getTime();
                        if (Platform.OS !== 'ios') {
                            return;
                        }
                        //ios专用
                        setTimeout(() => {
                            if (!this.scrollBegin) {
                                //滚动结束：
                                this._scrollDragEnd();
                            } else {
                                this.scrollBegin = false;
                            }
                        }, 500);
                        {/*this._console('滑动 ==== onScrollEndDrag 滑动结束拖拽时触发onScrollEndDrag',this.mScollY);*/ }
                    }}
                    onTouchBegin={() => {//手指触摸屏幕
                        this.touchTime = new Date().getTime();
                        {/*this._console('滑动 ==== onTouchBegin 按下屏幕触发');*/ }
                    }}
                    onTouchEnd={() => {//手指离开屏幕
                        this.touchTime = new Date().getTime();
                        {/*this._console('滑动 ==== onTouchEnd');*/ }
                    }}
                />

            </View>
        );
    }

    _lineView() {
        return (
            <View style={{ width: commonUtil.width, height: ScreenUtil.scaleSizeW(20) }} />
        )
    }

    _strategyView() {
        return (
            <View>
                {/*{this._lineView()}*/}
                <View style={{ paddingHorizontal: ScreenUtil.scaleSizeW(30), paddingTop: ScreenUtil.scaleSizeW(30), paddingBottom: ScreenUtil.scaleSizeW(20) }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: "center", marginBottom: ScreenUtil.scaleSizeW(5), marginTop: ScreenUtil.scaleSizeW(8) }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: '#fff' }}>{'策略原理'}</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={styles.hotSetButton}
                            onPress={() => this._historyPress()}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.ORANGE_FF9933 }}>{'历史表现'}</Text>
                        </TouchableOpacity>

                    </View>

                    <ExpandableText style={{
                        width: ScreenUtil.screenW - 30, color: 'white', paddingBottom: ScreenUtil.scaleSizeW(25), paddingTop: ScreenUtil.scaleSizeW(0),
                        fontSize: ScreenUtil.setSpText(28), lineHeight: ScreenUtil.scaleSizeW(40)
                    }}
                                    expandButtonLocation="center"
                                    expandTextStyle={{ color: 'rgba(255,255,255,0.6)' }}>
                        {this.state.strategy}
                    </ExpandableText>
                </View>
            </View>
        )
    }
    _growSchoolView() {
        if (this.state.growSchool.length <= 0) {
            return null;
        }
        return (
            <View>
                {/*{this._lineView()}*/}
                <View style={{
                    backgroundColor: baseStyle.BLACK_20,
                    marginHorizontal: ScreenUtil.scaleSizeW(10),
                    borderRadius: ScreenUtil.scaleSizeW(10),
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: "center",
                        paddingHorizontal: ScreenUtil.scaleSizeW(20),
                        height: ScreenUtil.scaleSizeW(80),
                        borderBottomWidth: 0.5,
                        borderBottomColor: baseStyle.BLACK_30
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ flex: 1, fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10) }}>{'成长学堂'}</Text>
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center' }} onPress={() => {
                            Navigation.navigateForParams(this.props.navigation, 'StrategyCoursePage');
                        }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(30), marginRight: ScreenUtil.scaleSizeW(10), color: "rgba(255,255,255,0.4)" }}>{'更多'}</Text>
                            <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(26) }} source={require('../../images/hits/hq_kSet_back.png')} />
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.growSchool.map((info, index) => (
                            <TouchableOpacity onPress={() => {
                                let path = MainPathYG + 'ChengZhangXueTang/主题策略/' + info.createTime;
                                let optionParams = { path: path, star: info.star, taoxiName: info.setsystem };
                                Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                                    key: info.createTime,
                                    type: 'Strategy',
                                    ...optionParams
                                });

                            }} key={index} style={{ height: ScreenUtil.scaleSizeW(86) }}>
                                <View style={{
                                    flex: 1,
                                    marginRight: ScreenUtil.scaleSizeW(20),
                                    marginLeft: ScreenUtil.scaleSizeW(38),
                                    borderTopWidth: index > 0 ? 0.5 : 0,
                                    borderTopColor: baseStyle.BLACK_30,
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(28), color: 'rgba(255,255,255,0.8)' }}>{info.title}</Text>
                                    <Image source={require('../../images/hits/videos_img.png')} />
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </View>
        )
    }
    _hotSetView() {
        return (
            <View style={{ marginTop: ScreenUtil.scaleSizeW(20) }}>
                {/*{this._lineView()}*/}
                <View style={{
                    backgroundColor: baseStyle.BLACK_20,
                    marginHorizontal: ScreenUtil.scaleSizeW(10),
                    borderRadius: ScreenUtil.scaleSizeW(10),
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: ScreenUtil.scaleSizeW(20),
                        height: ScreenUtil.scaleSizeW(88),
                        borderBottomWidth: this.state.setData.length > 0 ? 0.5 : 0,
                        borderBottomColor: baseStyle.BLACK_30
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10) }}>{'叠加条件'}</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={styles.hotSetButton}
                            onPress={() => this._hotSetPress()}>
                            <Image source={require('../../images/hits/fold_img.png')} />
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: baseStyle.ORANGE_FF9933, marginLeft: ScreenUtil.scaleSizeW(20) }}>{'叠加条件'}</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.setData.length > 0 &&
                        <View style={styles.fLlayoutHaveContent}>
                            {this.getScreenTag()}
                        </View>
                    }
                </View>
            </View>
        )

    }
    /**
     * 选股范围View
     *  themeArray:["这是测试主题","测试主题2","测试主题3","这是测试主题4","测试主题5","测试主题6"],
     selectIndex:0,//默认选中第一个主题
     * */

    //PanResponder
    _selectRange() {
        if (this.state.themeArray.length <= 0) { return; }
        return (
            <View style={{ marginTop: ScreenUtil.scaleSizeW(20), alignSelf: "stretch" }}>
                {/*{this._lineView()}*/}
                <View style={{
                    backgroundColor: baseStyle.BLACK_20,
                    marginHorizontal: ScreenUtil.scaleSizeW(10),
                    //marginLeft: 5,
                    borderRadius: ScreenUtil.scaleSizeW(10),
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: ScreenUtil.scaleSizeW(20),
                        height: ScreenUtil.scaleSizeW(88),
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), marginTop: ScreenUtil.scaleSizeW(2), backgroundColor: "#fff" }} />
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10) }}>{'选股范围'}</Text>
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            colors={['#FF3333', '#FF66CC']}
                            style={{
                                height: ScreenUtil.scaleSizeW(30), marginLeft: ScreenUtil.scaleSizeW(10), width: ScreenUtil.scaleSizeW(88),
                                borderRadius: ScreenUtil.scaleSizeW(15), justifyContent: "center", alignItems: "center", marginTop: Platform.OS === 'android' ? ScreenUtil.scaleSizeW(2) : 0
                            }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(22), color: "#fff", marginBottom: Platform.OS === 'android' ? ScreenUtil.scaleSizeW(2) : 0 }}>单选</Text>

                        </LinearGradient>

                        <View style={{ flex: 1 }} />
                    </View>
                    {/*占位视图*/}
                    <View style={{ height: ScreenUtil.scaleSizeW(86) }} />
                </View>

                <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(86), position: 'absolute', left: 0, bottom: 0, paddingBottom: ScreenUtil.scaleSizeW(24) }}>

                    <ScrollView horizontal={true}
                        //{...this._panResponder.panHandlers}
                                showsHorizontalScrollIndicator={false}
                                onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { this.mScrollX = x; }}
                                ref={ref => (this.myScrollView = ref)}
                                contentOffset={{ x: this.mScrollX, y: 0 }}
                                scrollEventThrottle={16}
                                contentContainerStyle={{ paddingLeft: ScreenUtil.scaleSizeW(30) }}
                                style={{ width: ScreenUtil.screenW, flex: 1 }}>

                        {
                            this.state.themeArray.map((tab, index) => (
                                this.state.selectIndex === index ?
                                    <TouchableOpacity key = {index} onPress={() => {
                                        this.pressRange(index)
                                    }} style={{
                                        height: ScreenUtil.scaleSizeW(60), paddingHorizontal: ScreenUtil.scaleSizeW(14), borderRadius: ScreenUtil.scaleSizeW(4),
                                        backgroundColor: "#feece8", justifyContent: "center", alignItems: "center", marginRight: ScreenUtil.scaleSizeW(10),
                                        borderWidth: 1, borderColor: "#F92400"
                                    }}>
                                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "#F92400" }}>{tab}</Text>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity key = {index} onPress={() => {
                                        this.pressRange(index)
                                    }} style={{
                                        height: ScreenUtil.scaleSizeW(60), paddingHorizontal: ScreenUtil.scaleSizeW(14), borderRadius: ScreenUtil.scaleSizeW(4),
                                        backgroundColor: "#d9dbe1", justifyContent: "center", alignItems: "center", marginRight: ScreenUtil.scaleSizeW(10)
                                    }}>
                                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "#666666" }}>{tab}</Text>
                                    </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </View>
            </View>
        )

    }


    /**
     *选择不同的选股范围
     * */
    pressRange(selectIndexs) {
        if (selectIndexs !== this.state.selectIndex) {
            this.setState({
                selectIndex: selectIndexs,
            }, () => {
                //选择完以后，直接调用筛选股票的接口
                this._getStockMessage();
            })
        }
    }
    /**
     * 返回筛选条件的View
     * */
    getScreenTag() {
        let screenView = [];
        if (this.state.setData && this.state.setData.length > 0) {
            for (let i = 0; i < this.state.setData.length; i++) {
                //右上角标签样式
                let tagbg;
                let tagText;
                switch (this.state.setData[i].tabName) {
                    case "放量上攻":
                        tagbg = "#FF3333";
                        tagText = "上涨状态";
                        break;
                    case "趋势共振":
                        tagbg = "#FF3333";
                        tagText = "上涨状态";
                        break;
                    case "震荡突破":
                        tagbg = "#9933FF";
                        tagText = "震荡状态";
                        break;
                    case "探底回升":
                        tagbg = "#9933FF";
                        tagText = "震荡状态";
                        break;
                    case "趋势反转":
                        tagbg = "#3399FF";
                        tagText = "下跌状态";
                        break;
                    case "背离反弹":
                        tagbg = "#3399FF";
                        tagText = "下跌状态";
                        break;
                    default:
                        tagbg = "#ffffff";
                        tagText = "";
                        break
                }
                screenView.push(
                    <View style={styles.selectView} key = {i}>
                        <Text style={styles.selectText}>{this.state.setData[i].tabName}</Text>
                        <View style={[styles.newTag, { backgroundColor: tagbg }]}>
                            <Text style={{ color: "#fff", fontSize: ScreenUtil.setSpText(20) }}>{tagText}</Text>
                        </View>
                    </View>
                )
            }
        }


        return screenView.length > 0 ? screenView : null;
    }

    _mainReportView() {

        if (this.state.report.length <= 0) {
            return null;
        }
        return (
            <View>
                {this._lineView()}
                <View
                    style={{ backgroundColor: baseStyle.BLACK_20, marginHorizontal: ScreenUtil.scaleSizeW(10), borderRadius: ScreenUtil.scaleSizeW(10), }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: "center",
                        // paddingHorizontal:10,
                        height: ScreenUtil.scaleSizeW(78),
                        borderBottomWidth: 0.5, borderColor: baseStyle.BLACK_30,
                    }}>
                        <View style={{ marginLeft: ScreenUtil.scaleSizeW(20), width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ flex: 1, fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10) }}>{'主题解读'}</Text>
                        {
                            this.state.haveReportMore === true ?
                                <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center', marginRight: ScreenUtil.scaleSizeW(20) }} onPress={() => this._mainReportMorePress()}>
                                    <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "rgba(255,255,255,0.4)", marginRight: ScreenUtil.scaleSizeW(10) }}>{'更多'}</Text>
                                    <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(26) }} source={require('../../images/hits/hq_kSet_back.png')} />
                                </TouchableOpacity>
                                : null
                        }

                    </View>
                    {
                        this.state.report.map(((title, index) =>
                                <TouchableOpacity key = {index} onPress={() => {
                                    this._mainReportPress(title._key)
                                }} style={index === 0 ? styles.reportDiver : styles.reportNoDiver}>
                                    <Text style={{ fontSize: ScreenUtil.setSpText(28), color: 'rgba(255,255,255,0.8)' }}>{title.data.theme_name + ""}</Text>
                                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(255,255,255,0.4)" }}>{ShareSetting.getDate(title.data.create_time, 'noBlank')}</Text>
                                </TouchableOpacity>
                        ))
                    }

                </View>
            </View>
        )
    }
    //<Image style={{marginLeft:15,width:commonUtil.width - 40, height:154, backgroundColor:baseStyle.BLACK_000000_10}} source={{uri:imageUrl}}/>


    _topPress(selected) {
        this.selected = selected;

        this._getStockMessage();
    }

    //选股个数
    _stockNumberView() {
        let stockCount = 0;
        if (this.state.stockArray.length > 0) {
            let stockData = this.state.stockArray[0];
            stockCount = stockData.count;
        }
        return (
            <View onLayout={(event) => {
                //this.hr = event.nativeEvent.layout.height * (PixelRatio.get());
                //这里传入入选股票视图的高度，总共屏蔽的是 ScreenUtil.scaleSizeW(132)的高度
                //这里是ScreenUtil.scaleSizeW(88) 所以乘以1.5
                this.requestHeightUp = event.nativeEvent.layout.height * (PixelRatio.get()) * (9 / 4);
                this.requestHeightLow = event.nativeEvent.layout.height * (PixelRatio.get()) * 1.5;

            }}>
                {this._lineView()}
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    // justifyContent: 'space-between',
                    // alignItems: 'center',
                    // flexDirection: 'row',
                    height: ScreenUtil.scaleSizeW(88),
                    paddingLeft: 15,
                    paddingRight: 15,
                    backgroundColor: '#fff',
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                }}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_100 }}>{'入选股票（' + stockCount + '只）'}</Text>
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_99 ,marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>{this.state.refreshDate + '更新'}</Text>

                    {/* 新规1版 */}
                    {/*<View>*/}
                    {/*    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_100 }}>{'入选股票（' + stockCount + '只）'}</Text>*/}
                    {/*    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_99, marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(3) : 0 }}>{this.state.refreshDate + '更新'}</Text>*/}
                    {/*</View>*/}
                    {/*<TopButton selected={this.selected} onPress={(selected) => { this._topPress(selected) }} />*/}

                </View>
            </View>
        )
    }
    _historyPress() {
        Navigation.navigateForParams(this.props.navigation, 'HistoryRecordPage', { type: this.historyTypeS });
    }

    _mainReportMorePress() {
        Navigation.navigateForParams(this.props.navigation, 'MainReportPage', { allReport: this.state.allReport });
    }

    _mainReportPress(info) {
        Navigation.navigateForParams(this.props.navigation, 'MainReportDetailPage', { key: info })
    }

    _hotSetPress() {

        Navigation.navigateForParams(this.props.navigation, 'ScreenConditions', {
            title: '主题策略叠加条件', setData: this.state.setData, selectCall: (specialArray) => {
                this.setState({
                    setData: specialArray
                }, () => {
                    //回调后直接去请求列表,如果请求时主题过期，则刷新主题再次请求
                    this._getStockMessage();
                });
            }
        });


    }

    _emptyData = () => {
        //let stocks = this.state.stockArray;
        // if (this.state.stockArray.length > 0) {
        //     return null;
        // }
        if (this.state.stockArray && this.state.stockArray[0] && this.state.stockArray[0].items && this.state.stockArray[0].items.length > 0) {
            return null;
        }
        return (
            <View style={{ flexDirection: "row", height: SECTION_HEIGHT + 400 }}>
                <View>
                    <View style={{ width: commonUtil.width, height: 300 }}>
                        <NoDataPage
                            content={'暂无股票入选'}
                            source={require('../../images/TuyereDecision/no_stock_data.png')}
                            isNoShow={true} />
                        {/*这个View是一个遮盖的View,只是用来挡住上拉加载那个文字的，因为现在这个StickyForm的renderFooter方法是不能正确回调的*/}
                        <View style={{
                            height: 60, position: "absolute", flexDirection: "row", backgroundColor: "#f6f6f6",
                            top: 400, left: 0, width: ScreenUtil.screenW
                        }}>
                        </View>
                    </View>
                </View>
            </View>
        )
    }


    _renderHeader = () => {
        // console.log('热点风口 _renderHeader',this.state);
        return (
            <View style={{ alignSelf: "stretch" }}>
                <View style={{ width: commonUtil.width, flexDirection: "column", backgroundColor: "white", }}
                      onLayout={(event) => {
                          if (event.nativeEvent.layout.height !== this.hearderHeight) {
                              if (Platform.OS === 'ios') {
                                  this.hearderHeight = event.nativeEvent.layout.height;
                              } else {
                                  this.hearderHeight = event.nativeEvent.layout.height * (PixelRatio.get());
                                  //console.log("这是多少距离",this.hearderHeight)
                              }
                              this.setState({})
                          }
                      }}
                >
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={['#646F85', '#202B6F']}
                        style={{ borderRadius: 10 }}>
                        {this._strategyView()}
                        {this._growSchoolView()}
                        {this._mainReportView()}
                        {this._hotSetView()}
                        {this._selectRange()}
                        {this._stockNumberView()}
                    </LinearGradient>
                </View>
            </View>
        );
    };


    //排序press
    _sortPress(info,index){
        if(!info.isSort)
            return;

        if(this.state.selectSortIndex === index){
            this.setState({
                desc:!this.state.desc
            },() => {
                this._getQuotationList();
            })
        }else {
            //先移除监听
            this._cancelRequest();

            this.setState({
                desc:true,
                selectSortIndex:index,
                titleid:info.titleid,
            },() => {
                this._getMarketStock()
            })
        }

    }

    _sectionTitle() {
        return (
            <View style={styles.text}>
                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#666666" }}>股票名称</Text>
            </View>
        )
    }

    _sectionScrollTitle(info, index) {
        let source = this.state.selectSortIndex === index ? this.state.desc ?
            require('../../images/hits/positive.png'):
            require('../../images/hits/negative.png'):
            require('../../images/hits/defaultt.png');
        let isSort = info.isSort;

        return (
            <View  style = {{justifyContent: "center",}} key={index}>
                <TouchableOpacity activeOpacity={0.6} onPress={() => this._sortPress(info,index)} style={[styles.headerText]}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#666666" }}>
                        {info.title}
                    </Text>
                    {
                        isSort > 0 && <Image source={source}/>
                    }
                </TouchableOpacity>
            </View>
        )
    }

    _renderSection = (section) => {
        return (
            <View style={{ flex: 1, flexDirection: "row", paddingRight: 15, backgroundColor: "#F1F8FD", }}>
                {this._sectionTitle()}
                {this.state.titles.map((info, index) =>
                    this._sectionScrollTitle(info, index)
                )}
            </View>
        );
    };

    _itemView(info, index, item) {

        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (item.upDown > 0) clr = baseStyle.UP_COLOR;
        else if (item.upDown < 0) clr = baseStyle.DOWN_COLOR;

        let stockMessage = '';
        let textView = (stockMessage) => (
            <StockFormatText style={{
                fontSize: ScreenUtil.setSpText(32), paddingLeft: ScreenUtil.scaleSizeW(30), color: baseStyle.BLACK_333333
            }}>{stockMessage}</StockFormatText>
        )

        switch (info.title) {
            case '涨跌幅':
                stockMessage = item.upDown;
                textView = (
                    <StockFormatText style={{ fontSize: ScreenUtil.setSpText(32), color: clr, paddingLeft: ScreenUtil.scaleSizeW(30) }} unit="%" sign={true}>{stockMessage / 100}</StockFormatText>
                );
                break;
            case '现价':
                stockMessage = item.presentPrice;
                textView = (
                    <StockFormatText titlename={"ZuiXinJia"} style={{
                        fontSize: ScreenUtil.setSpText(32),
                        color: clr,
                        paddingLeft: ScreenUtil.scaleSizeW(30)
                    }}>{stockMessage}</StockFormatText>
                );
                break;
            case '所属板块':
                stockMessage = item.indexName;
                // textView = textView(stockMessage);
                textView = (
                    <Text style={{
                        fontSize: ScreenUtil.setSpText(28),
                        paddingLeft: ScreenUtil.scaleSizeW(30)
                    }}>{stockMessage}</Text>);
                break;
            case '换手率':
                stockMessage = item.turnoverRate;
                textView = textView(stockMessage);

                break;
            case '市盈率':
                stockMessage = item.peRatio;
                textView = textView(stockMessage);

                break;

            case '所属主题':
                //添加主题
                if (this.state.themeArray.length > 0 && this.state.themeArray.length - 1 >= this.state.selectIndex) {
                    stockMessage = this.state.themeArray[this.state.selectIndex];
                } else {
                    stockMessage = "";
                }
                textView = (
                    <Text style={{
                        // maxLength: 6,
                        fontSize: ScreenUtil.setSpText(28),
                        color: baseStyle.BLACK_333333,
                        paddingLeft: ScreenUtil.scaleSizeW(30)
                    }} numberOfLines={1}>{stockMessage}</Text>);
                break;
            default:
                break;

        }

        return (
            <View style={{
                justifyContent: "center",
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderColor: "#EEE",
                backgroundColor: "#fff",
                width: widthCell,
            }} key={index}>
                {textView}
            </View>
        )
    }

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
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this._pushDetailPage(item, path.row)} style={styles.row}>
                <View style={styles.titleText}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(30), color: baseStyle.BLACK_333333 }}>
                        {item.secName}
                    </Text>
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_666666, marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(2) : 0 }}>
                        {item.marketCode}
                    </Text>
                </View>
                {this.state.titles.map((info, index) => this._itemView(info, index, item))}
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
        // console.log('主题策略 = ' + info)
    }
}

const styles = StyleSheet.create({
    hotSetButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: baseStyle.ORANGE_FF9933,
        borderWidth: 1,
        borderRadius: ScreenUtil.scaleSizeW(6),
        height: ScreenUtil.scaleSizeW(48),
        paddingLeft: ScreenUtil.scaleSizeW(19),
        paddingRight: ScreenUtil.scaleSizeW(8),
        flexDirection: 'row',
    },
    text: {
        justifyContent: "center",
        // alignItems: "center",
        // justifyContent:"center",
        backgroundColor: "#F1F8FD",
        paddingLeft: ScreenUtil.scaleSizeW(30),
        borderRightWidth: 0.5,
        borderColor: "#f6f6f6",
        width: widthCell,
        height: SECTION_HEIGHT,
        // borderWidth: StyleSheet.hairlineWidth,
        // borderColor: "#EEE"
    },
    row: {
        flex: 1,
        flexDirection: "row",
        // paddingRight:15,
        backgroundColor: '#fff'
    },
    headerText: {
        width: widthCell,
        flexDirection: 'row',
        paddingLeft: ScreenUtil.scaleSizeW(30)
    },
    titleText: {
        justifyContent: "center",
        // alignItems: "center",
        paddingLeft: ScreenUtil.scaleSizeW(30),
        backgroundColor: "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#EEE",
        width: widthCell,
    },
    reportNoDiver: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: ScreenUtil.scaleSizeW(38),
        marginRight: ScreenUtil.scaleSizeW(20),
        paddingVertical: ScreenUtil.scaleSizeW(20)
    },
    reportDiver: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: ScreenUtil.scaleSizeW(38),
        marginRight: ScreenUtil.scaleSizeW(20),
        paddingVertical: ScreenUtil.scaleSizeW(20),
        borderBottomWidth: 0.5,
        borderColor: baseStyle.BLACK_30
    },
    newTag: {
        height: ScreenUtil.scaleSizeW(24),
        paddingHorizontal: ScreenUtil.scaleSizeW(2),
        position: 'absolute',
        right: ScreenUtil.scaleSizeW(10),
        borderRadius: ScreenUtil.scaleSizeW(5),
        top: -ScreenUtil.scaleSizeW(16),
        justifyContent: "center",
        alignItems: "center"
    },
    selectView: {
        height: ScreenUtil.scaleSizeW(60),
        paddingHorizontal: ScreenUtil.scaleSizeW(22),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFCC00",
        marginLeft: ScreenUtil.scaleSizeW(10),
        marginVertical: ScreenUtil.scaleSizeW(10),
        borderRadius: ScreenUtil.scaleSizeW(10)
    },
    selectText: {
        fontSize: ScreenUtil.setSpText(30),
        color: "#663300",
    },
    fLlayoutHaveContent: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        borderBottomLeftRadius: ScreenUtil.scaleSizeW(10),
        borderBottomRightRadius: ScreenUtil.scaleSizeW(10),
        paddingHorizontal: ScreenUtil.scaleSizeW(10),
        paddingVertical: ScreenUtil.scaleSizeW(10),
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
    },
});