/**
 * Created by cuiwenjuan on 2019/8/20.
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Platform,
    Dimensions,
    StyleSheet, PixelRatio, NativeEventEmitter, NativeModules, AppState
} from 'react-native';

import { commonUtil, toast ,searchStockIndex} from '../../utils/CommonUtils'
import * as  baseStyle from '../../components/baseStyle'
import { StickyForm } from "react-native-largelist-v3";
import ExpandableText from '../../components/ExpandableText'
import RequestInterface from '../../actions/RequestInterface'
import StockFormatText from '../../components/StockFormatText'
import NoDataPage from '../NoDataPage'
import { mNormalFooter } from "../../components/mNormalFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
import ShareSetting from "../../modules/ShareSetting";
import BaseComponentPage from '../../pages/BaseComponentPage';
import QuotationListener from '../../utils/QuotationListener';
import * as ScreenUtil from '../../utils/ScreenUtil';
import LinearGradient from 'react-native-linear-gradient';
import Yd_cloud from '../../wilddog/Yd_cloud';
import { historyType } from '../TuyereDecision/HistoryRecordPage';
import TopButton from '../../components/TopButton'
import RefreshButton from '../../components/RefreshButton'
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"
import { sensorsDataClickObject,sensorsDataClickActionName } from '../../components/SensorsDataTool';
import {connection} from "../Quote/YDYunConnection";
import NetInfo from "@react-native-community/netinfo";

let refPath = Yd_cloud().ref(MainPathYG);
//部分源达云节点修改为MainPathYG2
let refPath2 = Yd_cloud().ref(MainPathYG2);
const stockType = { longHu: '龙虎资金', gaoGuan: '高管资金', zhuLi: '主力资金', };
let stockTypeArray = [stockType.longHu, stockType.gaoGuan, stockType.zhuLi];

let widthCell = ScreenUtil.scaleSizeW(200);
let SECTION_HEIGHT = ScreenUtil.scaleSizeW(60);

const YDYunChannelModule = NativeModules.YDYunChannelModule;
const loadingManagerEmitter = new NativeEventEmitter(YDYunChannelModule);

export default class MoneyRevelationPage extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {

            strategy: '',
            growSchool: [],
            stockArray: [],
            titles: [
                {title:"涨跌幅",isSort:-1,titleid:199},
                {title:"现价",isSort:-1,titleid:33},
                {title:"龙虎资金",isSort:-1},
                {title:"高管资金",isSort:-1},
                {title:"主力资金",isSort:-1},
            ],
            allLoaded: true,
            selectSpIndex: -1,//用户选择的特色指标Index,默认-1,都不选择
            refreshDate: "",//最新刷新时间

            longhuCount: 0,//龙虎资金的条数
            gaoGuanCount: 0,//高管资金的条数
            zhuLiCount: 0,//高管资金的条数
            fiveIsUpdate: false,
            selectSortIndex: 1,
            desc:true,
            titleid:199,
        };

        this.allStockArray = [];
        this.loadStockArray = [];

        this.czxtPath = 'ChengZhangXueTang/资金揭秘';
        this.refPathCeLue = refPath2.ref('CeLueJieShao/10');
        this.refPathXueTang = refPath.ref(this.czxtPath);
        this.refupDataTime = refPath.ref('CeLueZhongXin/ZiJinQiangChouUpdateFlag');
        this.selectedIndex = 0;

        this.setLHString = {};
        this.setGGString = {};
        this.setZLString = {};
        this.addQuotationList = [];
        this.hearderHeight = 0;//给表格原生传入的header高度，防止滑动问题
        this.seecialTags = ["放量上攻", "趋势共振", "震荡突破", "探底回升", "趋势反转", "背离反弹"];//特色指标叠加条件
        this.historyTypeS = historyType.zijinHistory;

        this.postPath = '/celuexuangu/fundSummary';//页面的BaseUrl
        this.longHuPath = '/celuexuangu/getlonghuzijin';
        this.gaoGuanPath = '/celuexuangu/getgaoguanzijin';
        this.zhuLiPath = '/celuexuangu/getzhulizijin';

        this.Page = 1;//此处的页码从0开始传入-1表示不请求这个tab的数据(和后台约定好的)
        this.PageSize = 500;//直接传入300,一次性请求所有数据(因为有排序和分页，并且列表实时变动，现在接口返回很快的情况下，直接全部取下来)
        this.localPageSize = 20;//本地分页
        this.touchTime = 0//记录点击时间
        this.touchTimeLenght = 1500;//滑动结束和监听数据的时间间隔
        this.scrollBegin = false;//ios 拖拽结束是否还有滑动
        this.listenersSize = 16;//监听数据个数
        this.hasTimeOut = false;
        this.focus = true;
        this.mScollY = 0;//y方向偏移量
        this.selected = true;

        this.marketStock = [];//大行情数据
    }

    componentDidMount() {
        this._loadData();
        this._loadStockData();

        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus', () => {
                this.willFocus();

                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zijinjiemixiangqing);
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur', () => {
                this.willBlur();
            }
        );

    }


    componentWillUnmount() {
        this._offFiveUpdata();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }


    //显示当前页面
    willFocus() {
        this._console('HotTuyerePage 显示当前页面', this.tabIndex)
        this.focus = true;
        this._getQuotationList();
        this._upDataTime();
        this._getMarketStock()

        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    //不在当前页面
    willBlur() {
        this._console('HotTuyerePage 不显示当前页面', this.tabIndex)
        this.focus = false;
        this._offFiveUpdata();
        this._cancelRequest();

        AppState.removeEventListener('change', this._handleAppStateChange);
        this.netInfoSubscriber && this.netInfoSubscriber();
    }

    /**
     * {"type":"wifi",
     * "isConnected":true,
     * "details":{"ipAddress":"192.168.1.17","bssid":null,"ssid":null,"isConnectionExpensive":false,"subnet":"255.255.255.0"},
     * "isInternetReachable":false}
     * @param status
     */
    handleConnectivityChange = (status) => {
        this._console('网络状态'+JSON.stringify(status)+AppState.currentState)

        //网络状态，第一次进来，  进入后台网络切换，
        if(AppState.currentState === 'active'){
            if(status.isConnected){
                //先移除
                this._cancelRequest();
                this._offFiveUpdata();

                //在重新请求
                this._getMarketStock();
                this._upDataTime();
            }
        }

    }

    _handleAppStateChange = (nextAppState) =>{
        this._console('前后台'+JSON.stringify(nextAppState))

        if (nextAppState === 'active') {
            //获取数据
            this._getMarketStock();//监听板块行情变化
            this._upDataTime();//监听源达云股池变化

        }
        else if (nextAppState === 'background') {
            this._console('后台'+JSON.stringify(nextAppState))
            this._cancelRequest();
            this._offFiveUpdata();
        }
    }


    //监听五分钟更新一次
    _upDataTime() {
        this.refupDataTime.on("value", (response) => {
            // this._console(' = 数据更新了');
            this._loadStockData();

        })
    }
    _offFiveUpdata() {
        this.refupDataTime && this.refupDataTime.off('value');
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

        this._console('行情数据 ==  排序前 '+ JSON.stringify(stocks) +JSON.stringify(this.state.stockArray));

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

        this._console('行情数据 ==  排序后 '+ JSON.stringify(stocks));

        //4.设置排序后的股池
        if(stocks && stocks.length){
            let message = {};
            message.items = stocks;
            message.count = stocks.length;

            this.setState({
                stockArray: [message],
            },() =>{ this._getQuotationList();})
        }
    }

    //实时数据监听
    _addListeners() {
        //console.log('监听数据===  _addListeners',this.itemIndex,this.addQuotationList);
        if (this.addQuotationList.length > 0) {
            this.getStockListInfo(() => {
                // QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                //     // console.log("监听行情回来的数据",stockObj);
                //     // console.log(stockObj)
                //     //设置行情数据
                //     this.setQuotation(stockObj);
                //
                // });
            });

        }
    };

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
                                this.state.stockArray[0].items[i].upDown = Number(stockObj[j].y);
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
            this.state.stockArray[0].items.map((info, index) => {
                if (info.marketCode === stockObj.c) {

                    info.presentPrice = Number(stockObj.k);
                    info.upDown = Number(stockObj.y);
                }
            });
            //页面刷新
            this.setState({
                stockArray: this.state.stockArray
            })
        }
    }

    /**
     *计算当前屏幕中显示的第一条数据index，获取需要监听的股票数组
     */
    _currentDateIndex() {
        let index = Math.floor((this.mScollY - this.hearderHeight) / 50);
        index = index < 0 ? 0 : index;
        // console.log('资金揭秘 ==  获取当前屏幕的第一条数据', index);
        return index; current
    }


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

    }

    //滑动结束监听数据
    _scrollDragEnd() {
        // this._console('_scrollDragEnd 一点五秒前' + this.mScollY + ',' + this.hearderHeight);

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



    _loadData() {
        // console.log('主题投资  策略原理： = ',this.state)
        // let pg = this;
        this.refPathCeLue.get((snapshot) => {
            // console.log('主题投资  策略原理： = ',JSON.stringify(snapshot.nodeContent),this.state );
            if (snapshot.nodeContent) {
                this.setState({ strategy: snapshot.nodeContent })
            }
        });

        this.refPathXueTang.orderByKey().limitToLast(2).get((snapshot) => {
            // console.log('主题投资  成长学堂： = ',JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                let values = Object.values(snapshot.nodeContent);
                //console.log('主题投资  成长学堂： = ',values);
                values.reverse();
                this.setState({ growSchool: values })
            }
        });

    }

    _loadStockData(callBack) {
        //接口数据
        this._getStockMessageNew(callBack);
        //资金抢入个股数
        this._getStockMessageCount(stockType.longHu);
        this._getStockMessageCount(stockType.gaoGuan);
        this._getStockMessageCount(stockType.zhuLi);
    }

    //获取股票总个数
    _getStockMessageCount(stockT) {
        let path = '';
        let param = {};
        param.onlyCount = '1';
        //特色指标
        if (this.state.selectSpIndex !== -1) {
            param.tszb = this.seecialTags[this.state.selectSpIndex];
        }
        switch (stockT) {
            case stockType.longHu:
                path = this.longHuPath;
                if(this.setLHString.qttj)
                    param.qttj = this.setLHString.qttj;
                break;
            case stockType.gaoGuan:
                path = this.gaoGuanPath;
                if(this.setGGString.qttj)
                    param.qttj = this.setGGString.qttj;
                break;
            case stockType.zhuLi:
                path = this.zhuLiPath;
                if(this.setZLString.qttj)
                    param.qttj = this.setZLString.qttj;
                break;
            default:
                break;
        }

        this._console('获取个数 = ' + stockT + ',' + JSON.stringify(param) + ',' + path);

        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, path, param, (response) => {
            if (response) {
                this._console('获取个数 = response' + JSON.stringify(response));
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
        });
    }


    /**
     * 新的获取股池的接口
     * */
    _getStockMessageNew(callBack) {
        //清空数据,每次点击tab切换时，请求最新的数据
        // this.state.stockArray = [];
        let param = {};//这个是请求列表的参数
        //筛选条件
        if (this.setLHString && this.setLHString.qttj) {
            param.lhqttj = this.setLHString.qttj;
        }
        if (this.setGGString && this.setGGString.qttj) {
            param.ggqttj = this.setGGString.qttj;
        }
        if (this.setZLString && this.setZLString.qttj) {
            param.zhlqttj = this.setZLString.qttj;
        }
        //特色指标
        if (this.state.selectSpIndex !== -1) {
            param.tszb = this.seecialTags[this.state.selectSpIndex];
        }

        if (this.selected) {
            param.page = 1;
            param.pageSize = 10;
            param.sort = 'hugeNet1Day';
            param.sortOrder = 'desc';
            param.top = 1;
        } else {
            param.page = this.Page;
            param.pageSize = this.PageSize;
            param.sort = 'upDown';
            param.sortOrder = 'desc';
        }

        this._console('接口参数 = ' + JSON.stringify(param));

        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, this.postPath, param, (response) => {

            this._console('选股结果 = ' + JSON.stringify(response));

            //设置最新刷新时间
            let currentDateS = ShareSetting.getDate(Date.parse(new Date()), 'yyyy-MM-dd HH:mm');
            if (response && response.list.length > 0) {
                let message = {};
                let newMessage = response.list;
                let isAllLoaded = true;

                message.items = newMessage;
                message.count = response.count;

                this.setState({
                    allLoaded: isAllLoaded,
                    stockArray: [message],
                    refreshDate: currentDateS,//最新刷新时间

                }, () => {
                    //刷新后监听
                    // this._getQuotationList();
                    this._getCurrentSortStocks();
                })
            } else {
                this.setState({
                    stockArray: [],
                    allLoaded: true,
                    refreshDate: currentDateS,//最新刷新时间
                })

            }
            callBack && callBack();
        }, (error) => {
            //("请求的error", error);
            //设置最新刷新时间
            let currentDateS = ShareSetting.getDate(Date.parse(new Date()), 'yyyy-MM-dd HH:mm');
            // this._list.endRefresh();
            // this._list.endLoading();

            this.setState({
                allLoaded: true,
                stockArray: this.state.stockArray,
                refreshDate: currentDateS,//最新刷新时间
            })
            callBack && callBack();
        });
    }

    _clickBack() {
        if (this.props.navigation) this.props.navigation.goBack();
    }


    render() {

        // this._console('资金揭秘 render ');
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
                                <Text style={styles.navTitle} numberOfLines={1}>{'资金揭秘'}</Text>
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
                                    numberOfLines={1}>{'资金揭秘'}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>


                <StickyForm
                    style={{ backgroundColor: "#f6f6f6" }}
                    contentStyle={{ alignItems: "flex-start", width: widthCell * 6 + 35 }}
                    data={this.state.stockArray}
                    ref={ref => (this._list = ref)}
                    heightForSection={() => SECTION_HEIGHT}
                    renderHeader={this._renderHeader}
                    renderFooter={this._renderMyFooters}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => 50}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    directionalLockEnabled={true}
                    headerStickyEnabled={false}
                    renderEmpty={this._emptyData}
                    onRefresh={() => {
                        this._loadStockData(() => {
                            this._list.endRefresh();
                        });
                    }}
                    allLoaded={this.state.allLoaded}
                    loadingFooter={mNormalFooter}
                    refreshHeader={mNormalHeader}
                    onLoading={() => {
                        // this._getStockMessage(
                        //     () => {
                        //         this._list.endLoading();
                        //     }
                        // )
                    }}
                    hearderHeight={this.hearderHeight}
                    /*
                             * lock (left 锁定左边距，使左边距没有 bounces 效果)
                             * x X坐标，y Y坐标，w 宽，h 高 (取消矩形外手势操作))
                             * 目前只实现了 lock:left,hot:y 效果
                             */
                    hotBlock={{ lock: "left", hotBlock: { x: 0, y: this.hearderHeight, width: 0, height: 0 } }}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                        this.mScollY = y;
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

                        {/*this._console('滑动 ==== onScrollBeginDrag',this.mScollY);*/ }
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

    _lineView() { return (<View style={{ width: commonUtil.width, height: ScreenUtil.scaleSizeW(20) }} />) }


    _strategyView() {
        return (
            <View>
                <View style={{ padding: ScreenUtil.scaleSizeW(30) }}>
                    <View style={{ marginBottom: ScreenUtil.scaleSizeW(10), width: ScreenUtil.screenW - 30, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: '#fff' }}>{'资金揭秘'}</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity activeOpacity={0.6} onPress={() => {
                            // alert("点击了历史战绩")
                            sensorsDataClickObject.adAchievements.module_source = '资金揭秘';
                            sensorsDataClickObject.adAchievements.page_source = '资金揭秘';
                            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adAchievements,'',false)
                            Navigation.navigateForParams(this.props.navigation, 'HistoryRecordPage', { type: this.historyTypeS });
                        }} style={{ width: ScreenUtil.scaleSizeW(130), height: ScreenUtil.scaleSizeW(40), borderWidth: 1, borderColor: "#FF9933", borderRadius: ScreenUtil.scaleSizeW(5), justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#FF9933" }} numberOfLines={1}>历史表现</Text>
                        </TouchableOpacity>
                    </View>
                    <ExpandableText style={{
                        width: ScreenUtil.screenW - 30, color: 'white', paddingVertical: ScreenUtil.scaleSizeW(15),
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
                        height: ScreenUtil.scaleSizeW(78),
                        borderBottomWidth: 0.5,
                        // backgroundColor:"#00ff00",
                        borderBottomColor: baseStyle.BLACK_30
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ flex: 1, fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10) }}>{'成长学堂'}</Text>
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center' }} onPress={() => {
                            Navigation.navigateForParams(this.props.navigation, 'StrategyCoursePage');

                        }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(30), marginRight: ScreenUtil.scaleSizeW(10), color: baseStyle.BLACK_999999 }}>{'更多'}</Text>
                            <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(26) }} source={require('../../images/hits/hq_kSet_back.png')} />
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.growSchool.map((info, index) => (
                            <TouchableOpacity
                                key = {index}
                                onPress={() => {
                                let path = MainPathYG + 'ChengZhangXueTang/资金揭秘/' + info.createTime;
                                let optionParams = { path: path, star: info.star, taoxiName: info.setsystem };

                                sensorsDataClickObject.videoPlay.entrance = '资金揭秘'
                                sensorsDataClickObject.videoPlay.class_type = '策略学堂'
                                sensorsDataClickObject.videoPlay.class_series = info.setsystem
                                sensorsDataClickObject.videoPlay.class_name = info.title
                                sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(info.createTime),'yyyy-MM-dd')

                                Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                                    key: info.createTime,
                                    type: 'Strategy',
                                    ...optionParams
                                });
                            }} style={{ height: ScreenUtil.scaleSizeW(86), justifyContent: 'center' }}>

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
                                    <Text style={{ fontSize: ScreenUtil.setSpText(28), color: 'rgba(255,255,255,0.8)' }}>{info.title}</Text>
                                    <Image source={require('../../images/hits/videos_img.png')} />
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                </View>
                {this._lineView()}
            </View>
        )
    }
    /**
     * 获取特色指标视图
     * */
    _specialTagView() {
        return (
            <View>
                {/*{this._lineView()}*/}
                <View style={{
                    backgroundColor: baseStyle.BLACK_20,
                    marginHorizontal: ScreenUtil.scaleSizeW(10),
                    borderRadius: ScreenUtil.scaleSizeW(10),
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        // justifyContent: "center",
                        paddingHorizontal: ScreenUtil.scaleSizeW(20),
                        width: ScreenUtil.screenW - 10,
                        height: ScreenUtil.scaleSizeW(77),
                        borderBottomWidth: 0.5,
                        borderBottomColor: baseStyle.BLACK_30
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10), marginRight: ScreenUtil.scaleSizeW(10) }}>{'特色指标'}</Text>
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            colors={['#FF3333', '#FF66CC']}
                            style={{
                                height: ScreenUtil.scaleSizeW(30),
                                width: ScreenUtil.scaleSizeW(88),
                                borderRadius: ScreenUtil.scaleSizeW(15),
                                alignItems: 'center',
                                justifyContent: "center"
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: ScreenUtil.setSpText(22) }}>单选</Text>
                        </LinearGradient>
                    </View>

                    <View style={{
                        flexWrap: 'wrap',
                        flexDirection: 'row',
                        width: ScreenUtil.screenW - 10,
                        paddingLeft: ScreenUtil.scaleSizeW(15),
                        paddingTop: ScreenUtil.scaleSizeW(6),
                        paddingBottom: ScreenUtil.scaleSizeW(10)
                    }}>
                        {
                            this._getSpecialView()
                        }
                    </View>
                </View>
                {this._lineView()}
            </View>
        );
    }
    //selectSpIndex
    /**
     * 获取特色指标标签UI
     * */
    _getSpecialView() {
        let TagView = [];
        for (let i = 0; i < this.seecialTags.length; i++) {
            //判断是否是选中的标签
            let isCheck = false;
            let bgColor = "#999999";
            let tagbg = "#dfd8dd";
            let textShow = "";
            if (this.state.selectSpIndex === i) {
                isCheck = true;
                tagbg = "#feece8";
                switch (i) {
                    case 0:
                    case 1:
                        bgColor = "#FF3333";
                        break;
                    case 2:
                    case 3:
                        bgColor = "#9933FF";
                        break;
                    case 4:
                    case 5:
                        bgColor = "#3399FF";
                        break;
                    default:
                        bgColor = "#999999";
                        break;
                }
            }
            //标签文字显示
            switch (i) {
                case 0:
                case 1:
                    textShow = "上涨状态";
                    break;
                case 2:
                case 3:
                    textShow = "震荡状态";
                    break;
                case 4:
                case 5:
                    textShow = "下跌状态";
                    break;
                default:
                    textShow = "";
                    break;
            }
            TagView.push(
                <View style={{
                    width: (ScreenUtil.screenW - 10 - ScreenUtil.scaleSizeW(30)) / 3, height: ScreenUtil.scaleSizeW(82),
                    justifyContent: "center", alignItems: "center"
                }}
                      key = {i}
                >
                    <View style={{ height: ScreenUtil.scaleSizeW(20) }} />
                    <TouchableOpacity activeOpacity={0.6}
                        onPress={() => { this.changeSpecial(this.seecialTags[i], i) }}
                        style={[isCheck ? styles.sepcialTag : styles.sepcialNoDiverTag, { backgroundColor: tagbg, marginHorizontal: ScreenUtil.scaleSizeW(5) }]}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: isCheck ? "#F92400" : "#666666" }}>{this.seecialTags[i]}</Text>

                        {isCheck ?
                            <Image style={{ width: ScreenUtil.scaleSizeW(24), height: ScreenUtil.scaleSizeW(24), position: 'absolute', right: 0, bottom: 0 }}
                                source={require('../../images/hits/tag_close.png')}
                            />
                            :
                            null}
                        <View style={[styles.newsTag, { backgroundColor: bgColor }]}>
                            <Text style={{ color: "#fff", fontSize: ScreenUtil.setSpText(20) }}>{textShow}</Text>
                        </View>

                    </TouchableOpacity>
                </View>

            )
        }

        return TagView;
    }
    /**
     * 切换特色指标
     * */
    changeSpecial(tabText, index) {
        let changgeIndex = -1;
        if (this.state.selectSpIndex === index) {
            changgeIndex = -1;
        } else {
            changgeIndex = index;
        }

        this.setState({
            selectSpIndex: changgeIndex
        }, () => {
            this._loadStockData();
        })
    }
    _stockTypeView(info, index) {
        let count = 0;
        let setCount = false;
        let colors = ['#6699ff', '#2870FF'];
        switch (info) {
            case stockType.longHu:
                colors = ['#6699FF', '#2870FF'];
                count = this.state.longhuCount;
                if (this.setLHString && this.setLHString.qttj) {
                    setCount = true;

                }
                break;
            case stockType.gaoGuan:
                colors = ['#FF6333', '#FF2B03'];
                count = this.state.gaoGuanCount;
                if (this.setGGString && this.setGGString.qttj) {
                    setCount = true;

                }
                break;
            case stockType.zhuLi:
                colors = ['#CC63FF', '#B82BFF'];
                count = this.state.zhuLiCount;
                if (this.setZLString && this.setZLString.qttj) {
                    setCount = true;

                }
                break;
            default:
                break;
        }

        let textColor = '#fff';
        let viewBgClr = null;
        let text = '叠加条件';

        if (setCount) {
            textColor = baseStyle.BLACK_000000_40
            viewBgClr = '#fff';
            text = '已叠加';
        }

        return (

            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={colors}
                style={{
                    height: ScreenUtil.scaleSizeW(200),
                    flex: 1,
                    margin: ScreenUtil.scaleSizeW(6),
                    borderRadius: ScreenUtil.scaleSizeW(10),
                    alignItems: 'center',
                    justifyContent: "center"
                }}
                key = {index}
            >
                <TouchableOpacity onPress={() => this._gotoItem(info)} style={{
                    flex: 1, height: ScreenUtil.scaleSizeW(192),
                    alignItems: 'center',
                    justifyContent: "center"
                }}>

                    <Text style={{ fontSize: ScreenUtil.setSpText(28), color: '#fff' }}>{info}</Text>
                    <Text style={{ marginTop: Platform.OS === 'android' ? ScreenUtil.scaleSizeW(5) : ScreenUtil.scaleSizeW(10), fontSize: ScreenUtil.scaleSizeW(24), color: 'rgba(255,255,255,0.6)' }}>
                        {'入选' + count + '只'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => this._setPress(info)}
                        style={{
                            marginTop: Platform.OS === 'android' ? ScreenUtil.scaleSizeW(12) : ScreenUtil.scaleSizeW(14),
                            height: ScreenUtil.scaleSizeW(48),
                            borderRadius: ScreenUtil.scaleSizeW(6),
                            backgroundColor: viewBgClr,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#fff',
                            paddingHorizontal: ScreenUtil.scaleSizeW(18)
                        }}>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: textColor }}>{text}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

            </LinearGradient>

        )
    }
    _moneyStockView() {
        return (
            <View>

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
                        height: ScreenUtil.scaleSizeW(77),
                        paddingTop: ScreenUtil.scaleSizeW(8)
                        //backgroundColor:"#00ff00"
                        // borderBottomWidth:1,
                        // borderBottomColor:baseStyle.BLACK_30
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ flex: 1, fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10) }}>{'资金抢入个股'}</Text>
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center' }} onPress={() => { this._moneyStockPress() }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(30), marginRight: ScreenUtil.scaleSizeW(10), color: baseStyle.BLACK_999999 }}>{'更多'}</Text>
                            <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(26) }} source={require('../../images/hits/hq_kSet_back.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginHorizontal: ScreenUtil.scaleSizeW(20), marginBottom: ScreenUtil.scaleSizeW(20), paddingHorizontal: ScreenUtil.scaleSizeW(10) }}>
                        {stockTypeArray.map((info, index) => this._stockTypeView(info, index))}
                    </View>

                </View>

            </View>
        )

    }

    _topPress(selected) {
        this.selected = selected;

        this._getStockMessageNew();
        // .log('top点击事件：' + selected);

    }
    _twoThreeStockView() {
        let twoStocks = (this.state.stockArray && this.state.stockArray[0]) ? this.state.stockArray[0].count : 0;
        return (
            <View style={{
                backgroundColor: '#fff',
                height: ScreenUtil.scaleSizeW(88),
                justifyContent: 'center',
                alignItems: 'center',
                borderTopRightRadius: ScreenUtil.scaleSizeW(20),
                borderTopLeftRadius: ScreenUtil.scaleSizeW(20),
                // flexDirection: 'row',
                paddingLeft: ScreenUtil.scaleSizeW(22),
                paddingRight: ScreenUtil.scaleSizeW(22)
            }}>

                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: baseStyle.BLACK }}>{'抢筹股票池(' + twoStocks + '只)'}</Text>
                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.4)" }}>{this.state.refreshDate === "" ? this.state.refreshDate : this.state.refreshDate + "更新"}</Text>
                {/*<View>*/}
                    {/*<Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: baseStyle.BLACK }}>{'抢筹股票池(' + twoStocks + '只)'}</Text>*/}
                    {/*<Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.4)" }}>{this.state.refreshDate === "" ? this.state.refreshDate : this.state.refreshDate + "更新"}</Text>*/}
                {/*</View>*/}
                {/*<TopButton selected={this.selected} onPress={(selected) => { this._topPress(selected) }} />*/}

            </View>
        )
    }
    /**
     * 跳转到详情页面
     * */
    _gotoItem(info) {
        this.sensorsAppear(info)
        //有特色指标的话，也需要带入列表
        if (this.state.selectSpIndex !== -1) {
            // param.tszb = this.seecialTags[this.state.selectSpIndex];
            Navigation.navigateForParams(this.props.navigation, 'MoneyStockPage',
                { title: info, setLHString: this.setLHString, setGGString: this.setGGString, setZLString: this.setZLString, specialTag: this.seecialTags[this.state.selectSpIndex] });
        } else {
            Navigation.navigateForParams(this.props.navigation, 'MoneyStockPage',
                { title: info, setLHString: this.setLHString, setGGString: this.setGGString, setZLString: this.setZLString });
        }

    }

    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.module_source = '选股';
        sensorsDataClickObject.adLabel.page_source = '资金揭秘';
        sensorsDataClickObject.adLabel.first_label = '资金揭秘';
        sensorsDataClickObject.adLabel.second_label = label;
        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.is_pay = '主力决策';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }



    _setPress(info) {
        let setData = [];
        if (info === stockType.longHu) {
            if (this.setLHString && this.setLHString.qttj) {
                setData = this.setLHString.qttj.split(",")
            }
        } else if (info === '高管资金') {
            if (this.setGGString && this.setGGString.qttj) {
                setData = this.setGGString.qttj.split(",")
            }
        } else if (info === '主力资金') {
            if (this.setZLString && this.setZLString.qttj) {
                setData = this.setZLString.qttj.split(",")
            }
        }

        sensorsDataClickObject.choiceCondition.page_source = info;
        sensorsDataClickObject.choiceCondition.module_source='资金揭秘';

        Navigation.navigateForParams(this.props.navigation, 'MoneyRevelationSetPage', {
            title: info, setData: setData, callBack: (selectedString) => {
                if (info === stockType.longHu) {
                    this.setLHString = selectedString;
                } else if (info === '高管资金') {
                    this.setGGString = selectedString;
                } else if (info === '主力资金') {
                    this.setZLString = selectedString;
                }
                this._console('叠加条件 = ' + JSON.stringify(selectedString))
                this._getStockMessageCount(info);
                this._getStockMessageNew();

            }
        });

    }

    _moneyStockPress() {
        this.sensorsAppear('资金抢入个股更多')
        Navigation.navigateForParams(this.props.navigation, 'MoneyStockPage',
            { title: "龙虎资金", setLHString: this.setLHString, setGGString: this.setGGString, setZLString: this.setZLString, specialTag: this.seecialTags[this.state.selectSpIndex] });

    }
    _emptyData = () => {
        let stocks = this.state.stockArray;

        if (stocks.length > 0) {
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
                    </View>

                </View>
            </View>
        )
    }

    _renderHeader = () => {
        // console.log('热点风口 _renderHeader',this.state);
        //width: commonUtil.width, backgroundColor: "white",
        return (
            <View style={{ alignSelf: "stretch" }}>
                <View style={{ width: commonUtil.width, flexDirection: "column", backgroundColor: "white", }}
                    onLayout={(event) => {
                        if (event.nativeEvent.layout.height !== this.hearderHeight) {
                            if (Platform.OS === 'ios') {
                                this.hearderHeight = event.nativeEvent.layout.height;
                            } else {
                                this.hearderHeight = event.nativeEvent.layout.height * (PixelRatio.get());
                            }
                            this.setState({})
                        }
                    }}
                >
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={['#97657E', '#2F2352']}>
                        {this._strategyView()}
                        {this._growSchoolView()}
                        {this._specialTagView()}
                        {this._moneyStockView()}
                        {this._lineView()}
                        {this._twoThreeStockView()}
                    </LinearGradient>
                </View>
            </View>
        );
    };

    _sortClick(info,index){
        //判断可以点击的按钮下标
        if(!info.isSort)
            return;

        if(this.state.selectSortIndex === index){
            this.setState({
                desc:!this.state.desc
            },() => {
                this._getCurrentSortStocks();
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
            <View style = {{justifyContent: "center",}} key={index}>
                <TouchableOpacity activeOpacity={0.6} onPress={() => this._sortClick(info,index)} style={[index >= 2 ? styles.headerTextCenter : styles.headerText, { width: index === 2 ? widthCell + 20 : widthCell, }]}>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#666666" }}>
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
            <View style={{ alignItems: 'center', justifyContent: "center" }}>
                {
                    stockMessage ? <View style={{ borderRadius: ScreenUtil.scaleSizeW(13), width: ScreenUtil.scaleSizeW(26), height: ScreenUtil.scaleSizeW(26), borderColor: baseStyle.BLUE_3399FF, borderWidth: ScreenUtil.scaleSizeW(6) }} /> : <View />

                }
            </View>
        )

        switch (info.title) {
            case '涨跌幅':
                stockMessage = item.upDown;
                textView = (
                    <StockFormatText style={{ fontSize: ScreenUtil.setSpText(32), color: clr, paddingLeft: ScreenUtil.scaleSizeW(30) }} unit="%" sign={true}>{stockMessage / 100}</StockFormatText>
                )
                break;
            case '现价':
                stockMessage = item.presentPrice;
                textView = (
                    <StockFormatText titlename={"ZuiXinJia"} style={{
                        fontSize: ScreenUtil.setSpText(32),
                        color: clr,
                        paddingLeft: ScreenUtil.scaleSizeW(40)
                    }}>{stockMessage}</StockFormatText>
                )
                break;
            case '龙虎资金':
                stockMessage = item.longhu;
                textView = textView(stockMessage);
                break;
            case '高管资金':
                stockMessage = item.gaoguan;
                textView = textView(stockMessage);
                break;
            case '主力资金':
                stockMessage = item.zhuli;
                textView = textView(stockMessage);
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
                width: index === 2 ? widthCell + 20 : widthCell,
            }} key={index}>
                {textView}
            </View>
        )
    }
    _renderItem = (path) => {
        const item = this.state.stockArray[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                // toast('股票详情页')
                //console.log(this.state.stockArray)
                let data = {};
                data.Obj = item.marketCode;
                data.ZhongWenJianCheng = item.secName;
                data.obj = item.marketCode;
                let codeArray = [];
                if (this.state.stockArray[0].items.length > 0) {
                    for (let i = 0; i < this.state.stockArray[0].items.length; i++) {
                        let itemObj = {};
                        itemObj.Obj = this.state.stockArray[0].items[i].marketCode;
                        itemObj.ZhongWenJianCheng = this.state.stockArray[0].items[i].secName;
                        itemObj.obj = this.state.stockArray[0].items[i].marketCode;
                        codeArray.push(itemObj)
                    }
                }
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: codeArray,
                    index: path.row,
                    isNull: "",
                })
            }} style={styles.row}>
                <View style={styles.titleText}>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: baseStyle.BLACK_333333 }}>
                        {item.secName}
                    </Text>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: baseStyle.BLACK_666666, marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(4) : 0 }}>
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
        // console.log('资金揭秘 = ' + info)
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
        justifyContent: "center",
        // alignItems: "center",
        backgroundColor: "#F1F8FD",
        borderRightWidth: 0.5,
        borderColor: "#f6f6f6",
        paddingLeft: ScreenUtil.scaleSizeW(30),
        width: widthCell,
        height: SECTION_HEIGHT,
    },
    row: {
        flex: 1,
        flexDirection: "row",
        paddingRight: 15,
        backgroundColor: '#fff'
    },
    headerText: {
        width: widthCell,
        alignItems: "center",
        backgroundColor: "#F1F8FD",
        paddingLeft: ScreenUtil.scaleSizeW(30),
        flexDirection: 'row'
    },
    headerTextCenter: {
        width: widthCell,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F8FD",
        flexDirection: 'row'
    },
    titleText: {
        width: widthCell,
        justifyContent: "center",
        // alignItems: "center",
        paddingLeft: ScreenUtil.scaleSizeW(30),
        backgroundColor: "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#EEE"
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
    sepcialTag: {
        width: (ScreenUtil.screenW - 10 - ScreenUtil.scaleSizeW(31)) / 3 - ScreenUtil.scaleSizeW(10),
        height: ScreenUtil.scaleSizeW(60),
        borderRadius: ScreenUtil.scaleSizeW(4),
        borderWidth: 0.5,
        borderColor: "#F92400",
        justifyContent: "center",
        alignItems: "center",

    },
    sepcialNoDiverTag: {
        width: (ScreenUtil.screenW - 10 - ScreenUtil.scaleSizeW(31)) / 3 - ScreenUtil.scaleSizeW(10),
        height: ScreenUtil.scaleSizeW(60),
        borderRadius: ScreenUtil.scaleSizeW(4),
        justifyContent: "center",
        alignItems: "center"
    },
    newsTag: {
        height: ScreenUtil.scaleSizeW(26),
        paddingHorizontal: ScreenUtil.scaleSizeW(2),
        position: 'absolute',
        right: ScreenUtil.scaleSizeW(10),
        borderRadius: ScreenUtil.scaleSizeW(3),
        top: -ScreenUtil.scaleSizeW(16),
        justifyContent: "center",
        alignItems: "center"
    }
});
