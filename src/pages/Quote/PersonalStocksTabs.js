import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    DeviceEventEmitter,
    Platform,
    AppState
} from 'react-native';
import StockList from './StockList.js';
import * as baseStyle from '../../components/baseStyle.js';
import ShareSetting from '../../modules/ShareSetting.js'
import {commonUtil, personStocksChange, searchStockIndex, toast} from '../../utils/CommonUtils'
import RATE from '../../utils/fontRate'
import YDPopoverView from './YDPopoverView'
import UserInfoUtil from '../../utils/UserInfoUtil'
import StockFormatText from "../../components/StockFormatText.js";
import Yd_cloud from '../../wilddog/Yd_cloud'
import { parseStock } from './ParseStockData';
import QuotationListener from '../../utils/QuotationListener';
import NetInfo from "@react-native-community/netinfo";
import LinearGradient from 'react-native-linear-gradient';

let _lastPersonalStocksTabCodes = new Map();
let scrollOffet = 0;
let longPreItemData = undefined;
let longPreItemIndex = undefined;

let itemHeight = 44;

export class PersonalStocksTab extends Component {

    constructor(props) {
        super(props);
        // 避免在使用时重复定义
        this._query = this._query.bind(this);

        this.mainkey = 'zx';
        this.state = ({
            modalVisible: false,
            likeStocks: [{}, {}, {}],
            titles: [
                { title: "名称", isSort: -1 },
                { title: "现价", isSort: 1 },
                { title: "涨跌幅", isSort: 1 }],
            desc: true,
            selectSortIndex: -1,//默认不选，按自选股添加顺序
        })
        this.staticQuoteRequest = null;
        this.hotrequest = null;
        this.start = 0;
        this.pageNumber = 15;
        this.isUpdate = true;

        this.touchTimeLenght = 0;
        this.hasTimeOut = false;
        this.touchTime = 0;
        this.scrollBegin = false;
        this.focus = true;//是否显示当前页面
        this.mScrolly = 0;//滚动距离
        this.addQuotationList = [];//当前页面显示的股票代码
        this.isFocus = false;


    }

    cancelSort() {
        this.setState({
            selectSortIndex: -1,
        }, () => {
            //按默认排序
            this._queryCurrentStocks(this._setData());
        })
    };

    calltimer() {
        //网络和前后台设置
        // this._addEventListener();
        //游客添加自选股同步到登录用户
        this._uploadTourStock();

        // console.log("自选股 == calltimer");
        let personStocks = this.props.personStocks;
        if (personStocks.length > 0) {
            this.cancelStocks();
            this._onUpdate(personStocks)
        }
        else {
            this.cancelStocks();
            this._userLike();
        }
    }

    componentDidMount() {
        //编辑按钮 取消编辑
        this.cancelSortLi = DeviceEventEmitter.addListener('cancelEditStock', () => {
            this.cancelSort()
        });
        /**
         * appmain 和 看势中tab按钮切换
         * 非自选股页面 跳转
         * 自选股页面中 跳转
         */
        //注册监听，是否返回当前页面，是的话重新注册监听
        this.ZS_ISREGISTER = DeviceEventEmitter.addListener('ZX_ISREGISTER', (isRegister, name) => {
            // console.log('自选股 ==ZS_ISREGISTER='+isRegister,'currRoute='+currRoute,'currRoute_3='+currRoute_3,name)
            this.isFocus = isRegister;

            if( isRegister && currRoute_3 == "ZX"){
                this.calltimer();
                this._addEventListener();
            }else {
                //当前不显示
                this.cancelStocks();
                this._removeEvent();
            }
        });

        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            // console.log('自选股 =willFocus=',currRoute_3,AppState.currentState,currRoute,this.isFocus)
            if (currRoute_3 == 'ZX' && this.isFocus) {
                this.calltimer();
                this._addEventListener();
            }
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            // console.log('自选股 =willBlur=',currRoute_3,AppState.currentState,currRoute)
            if (currRoute_3 == 'ZX') {
                this.cancelStocks();
                this._removeEvent();
            }
        });

        this._addEventListener();
    }


    componentWillReceiveProps(nextProps) {
        // console.log("自选股 ==  componentWillReceiveProps",nextProps,this.props);
    }

    componentWillUnmount() {
        this.netInfoSubscriber && this.netInfoSubscriber();
        this.listener && this.listener.remove();
        this.cancelSortLi && this.cancelSortLi.remove();

        this.timer && clearInterval(this.timer);
        this.cancelStocks();
        this.ZS_ISREGISTER && this.ZS_ISREGISTER.remove();

        _lastPersonalStocksTabCodes.delete(this.mainkey);
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
        this._removeEvent();
    }

    _addEventListener() {
       if(!this.netInfoSubscriber) {
           // console.log('自选股操作 添加监听')
           this.netInfoSubscriber = NetInfo.addEventListener(this._handleConnectivityChange);
           AppState.addEventListener('change', this._handleAppStateChange);
           this.listener = DeviceEventEmitter.addListener(personStocksChange,this._personStockListener);
       }
    }

    _removeEvent() {
        // console.log('自选股操作 移除监听监听')
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.netInfoSubscriber && this.netInfoSubscriber();
        this.netInfoSubscriber = null;
        this.listener && this.listener.remove();
    }

    _personStockListener = () => {
        // console.log('自选股操作 监听')
        this.calltimer();
    }

    //程序前后台状态
    _handleAppStateChange = (appState) => {

        // console.log('自选股 == 前后台',appState);

        if (appState === 'active') {
            this.calltimer();
        }
        else if (appState === 'background') {
            this.cancelStocks();
        }
    }

    //网络状态
    _handleConnectivityChange = (status) => {
        // console.log('网络',status);
        //进入后台网络切换，
        if (AppState.currentState === 'active') {
            if (status.isConnected) {
                //先移
                this.cancelStocks();
                //在重新请求
                this.calltimer();
            }
        }
    }

    cancelStocks() {
        // console.log('自选股 == 取消监听');

        if (this.hotrequest && this.lastLikeStocks) {
            QuotationListener.offListeners(this.lastLikeStocks.split(','));
            this.hotrequest = null;
            clearInterval(this.hottimer);
            this.hottimer = null;
            this.lastLikeStocks = '';
        }

        this._offListeners();
        this.popoverView.hiddenAlert();
    }

    /**
     * 获取全部股票的数据
     * @param props
     * @returns {null}
     * @private
     */
    _query(props) {
        //有自选股变化的时候，先请求全部数据，为了显示中文简称

        if (props.params) {
           let stockInfoArray =  this._setLocalData(props.params.obj);

            // console.log('源达云获取所有股票数据 == _query',props.params);
            this.staticQuoteRequest = QuotationListener.getStockListInfo(props.params.obj,
                (data) => {
                    const { setPersonalStocks } = this.props.actions;
                    let result = [];
                    let datalist = data;//(Platform.OS == 'ios' ? data.entitiesArray : data.entitiesList);
                    // console.log('源达云获取所有股票数据'+JSON.stringify(data));
                    for (let i = 0; i < stockInfoArray.length; i++) {
                        let code = stockInfoArray[i].Obj
                        datalist.map((value, index) => {
                            let item = parseStock(value);
                            if (code == item.Obj) {
                                result.push(item);
                            }
                        });
                    }
                    // console.log('自选股排序前 === _query',result,props.params.obj)
                    this._setData(result);
                    //监听当前屏幕数据
                    this._queryCurrentStocks(result);
                });
            return this.staticQuoteRequest;
        }
    }

    //自选股改变的时候 先将本地数据补全
    _setLocalData(stockS){
        const { personalStockData } = this.props.statePersonalStocks;
        //筛选已经删除的
        let stockInfoArray = [];
        personalStockData.map((info) => {
            if(stockS.indexOf(info.Obj) >= 0){
                stockInfoArray.push(info);
            }
        })

        //筛选出添加的
        let addStocks = []
        stockS.map((info) => {
            let hasStock = false;
            personalStockData.map((stockInfo) => {
                if(info === stockInfo.Obj){
                    hasStock = true;
                }
            })
            if(!hasStock){
                addStocks.push({Obj:info});
            }
        })

        addStocks = addStocks.concat(stockInfoArray);
        this._setData(addStocks);
        //监听当前屏幕数据
        this._queryCurrentStocks(addStocks);

        return addStocks;
    }

    /**
     * 对当前屏幕数据 数据处理
     * @param result
     * @private
     */
    _setData(result){
        const { personalStockData } = this.props.statePersonalStocks;
        const { setPersonalStocks } = this.props.actions;
        let personStock = this.props.personStocks;
        let index = this._currentDateIndex();
        result = result ? result : personalStockData;
        // console.log('自选股 设置数据 result = ',result.length,'personalStockData = ',personalStockData.length)

        //先按照自选股的添加顺序
        let stockS = [];
        // 1. 没有排序,直接设置
        if(this.state.selectSortIndex === -1){
            personStock.map((code) => {
                let hasStock = false;
                result.map((info) => {
                    if (code === info.Obj) {
                        stockS.push(info);
                        hasStock = true;
                    }
                })
                if (!hasStock) {
                    stockS.push({ Obj: code });
                }
            })
            setPersonalStocks(stockS);
            return stockS;
        }

        //2. 有排序，对当前屏幕中显示股票排序
        let firstArray = [];
        let lastArray = [];
        let sortArray = [];
        result.map((info,i) => {
            if(i < index){
                firstArray.push(info)
            }else if(i > index + this.pageNumber){
                lastArray.push(info)
            }else {
                sortArray.push(info);
            }
        })
        // console.log('自选股 设置数据 有排序前 ',result.length,"sortArray = ",sortArray.length)
        // console.log('自选股 设置数据 有排序前 ',sortArray)
        sortArray = this._getSortStock(sortArray);
        // console.log('自选股排序后台 === ',firstArray,lastArray,sortArray)
        firstArray = firstArray.concat(sortArray,lastArray);
        // console.log('自选股排序后台 === ',result.length)
        setPersonalStocks(firstArray);

        return firstArray;
    }
    //本地排序
    _setLocalSortData() {
        const {personalStockData} = this.props.statePersonalStocks;
        const {setPersonalStocks} = this.props.actions;
        let stockArray = this._getSortStock(personalStockData);
        // console.log('全排序',stockArray,personalStockData);
        setPersonalStocks(stockArray.concat([]));
        return stockArray;
    }


    //股票排序
    _getSortStock(stocks){
        stocks = stocks ? stocks : []
        stocks.sort((a,b) =>{
            if(this.state.selectSortIndex === 1){
                if(this.state.desc){
                    return b.ZuiXinJia - a.ZuiXinJia;
                }else {
                    //现价由小到大
                    return a.ZuiXinJia - b.ZuiXinJia;
                }
            }else if(this.state.selectSortIndex === 2){
                if(this.state.desc){
                    return b.ZhangFu - a.ZhangFu;
                }else {

                    return a.ZhangFu - b.ZhangFu;
                }
            }
        })
        return stocks;
    }

    /**
     * 获取当前屏幕数据
     * @private
     */
    _queryCurrentStocks(stocks) {

        this._offListeners();
        //当前屏幕显示的第一个股票下标
        let index = this._currentDateIndex();
        let personStock = this.props.personStocks;
        const { personalStockData } = this.props.statePersonalStocks;
        stocks = stocks ? stocks : personalStockData;

        // console.log('监听点前页面',index);
        // console.log('监听数据 == ',personStock,personalStockData);
        if (stocks.length > 0) {
            let arrayLength = stocks.length;
            arrayLength = (index + 1 + this.pageNumber) > arrayLength ? arrayLength : index + 1 + this.pageNumber
            this.addQuotationList = [];
            for (let i = index; i < arrayLength; i++) {
                this.addQuotationList.push(stocks[i].Obj)
            }

            this._addListInfo();
        }
    }

    //监听数据
    _addListInfo(){
        const { personalStockData } = this.props.statePersonalStocks;
        // console.log('源达云监听数据 ',this.addQuotationList);
        if(this.addQuotationList && this.addQuotationList.length > 0){
            QuotationListener.addListeners(this.addQuotationList,(stockObj) =>{
                let stockArray = []
                if(personalStockData && personalStockData.length > 0){
                    personalStockData.map((info,index) =>{
                        if (info.Obj === stockObj.c) {
                            stockArray.push(parseStock(stockObj))
                        }else {
                            stockArray.push(info);
                        }
                    })
                }

                // console.log('源达云监听数据 监听数组长度',personalStockData.length,'stockArray = ',stockArray.length,stockObj);
                this._setData(stockArray);
            })
        }
    }
    //实时数据移除
    _offListeners() {
        // console.log('监听数据 == 移除 _offListeners');

        //如果有数据,先去解注册
        if (this.addQuotationList.length > 0) {
            QuotationListener.offListeners(this.addQuotationList, () => { });
            this.addQuotationList = [];
        }
    }

    /**
     * 猜你喜欢 数据获取
     * @private
     */
    _userLike() {
        this.getLikeData();
        //定时隔三分钟取一次数据
        this.hottimer = setInterval(() => {
            //获取猜你喜欢野狗数据，以及大智慧数据
            this.getLikeData();
        }, 1000 * 60 * 3)

    }
    //获取猜你喜欢数据
    getLikeData() {
        Yd_cloud().ref(MainPathYG + "HotStockList").orderByKey().limitToFirst(3).get((snap) => {
            // console.log('自选股 == ', snap);
            if (snap.success) {
                let values = Object.values(snap.nodeContent)
                let allData = [];
                for (let i = 0; i < values.length; i++) {
                    if (!values[i].code) continue;
                    if (values[i].code.indexOf('S') == 0 || values[i].code.indexOf('s') == 0 || values[i].code.indexOf('Y') == 0) {
                        allData.push(values[i].code)
                    }
                }
                this.hotStockAllData = '';
                this.hotStockAllData = allData;
                if (this.hotStockAllData.join(',') == this.lastLikeStocks)
                    return;

                if (this.hotrequest && this.lastLikeStocks) {
                    // connection.unregister(this.hotrequest.qid, this.lastLikeStocks);
                    QuotationListener.offListeners(this.lastLikeStocks);
                }
                this.hotrequest = null;

                //console.log('发送注册股票', this.hotStockAllData);
                //行情数据获取
                this.hotrequest = QuotationListener.getStockListInfo(this.hotStockAllData,//connection.register('FetchFullQuoteNative', this.hotStockAllData.join(','),
                    (returndata) => {
                        let item = [];
                        returndata.map((data, index) => {
                            item.push(parseStock(data));
                        });

                        this.setState(Object.assign({}, this.state, {
                            likeStocks: item
                        }));
                    });
                this.lastLikeStocks = this.hotStockAllData.join(',');
                //大智慧获取数
            } else {
            }
        })
    }

    /**
     * 同步游客数据到 登录用户
     * @private
     */
    _uploadTourStock() {
        const { removeAllTourStock } = this.props.actions;
        if (UserInfoUtil.getUserPermissions() >= 1) {
            UserInfoUtil.uploadTourStock();
            removeAllTourStock();
        }
    }

    _onUpdate(stocks) {
        //请求全部数据
        this._query(Object.assign({}, this.props, { params: { obj: stocks } }));
    }

    /**
     * 长按出现pop
     **/
    _onItemLongPress(data, rowID) {

        longPreItemData = data;
        longPreItemIndex = rowID;
        let rowId = rowID;
        let heightRows = 44 * (rowId);//item高度  * item个数
        let scrollH = heightRows + 35; //25 title高度
        let popTop = scrollH - scrollOffet; //scrollOffet scroll的偏移量

        this.popoverView.showAlert(popTop);
    }

    _onItemPress(data, rID, isLike) {
        // this.props.navigator.push({component: <DetailPage {...data} isPush = {true}/>})
        let array = [];
        let index = parseInt(rID);

        //是猜你喜欢, 否自选股列表
        if (isLike) {
            array = this.state.likeStocks[0].Obj && this.state.likeStocks[1].Obj && this.state.likeStocks[2].Obj >= 3 ? this.state.likeStocks.slice(0, 3) : null
        } else {
            array = this.props.statePersonalStocks && this.props.statePersonalStocks.personalStockData;
        }
        this.cancelStocks();
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            index: index,
            array: array,
            isPush: true
        });

        sensorsDataClickObject.stockPageview.stock_code = data.Obj
        sensorsDataClickObject.stockPageview.stock_name = data.ZhongWenJianCheng
        sensorsDataClickObject.stockPageview.type = '自选股'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.stockPageview)
    }

    _renderStockList(title, data, renderRow) {

        const titleStyle = {
            backgroundColor: baseStyle.WHITE,
            flexDirection: 'row',
            alignItems: 'center',
            height: 35,
            marginLeft: 12,
            marginRight: 12,
            borderBottomWidth: 1,
            borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
        };

        return data && data.length > 0 && (
            <View style={{ flex: 1, }}>
                <View style={titleStyle}>
                    {this.state.titles.map((info, index) => this._renderTitle(info, index))}
                </View>
                <StockList style={{ backgroundColor: baseStyle.LINE_BG_F6 }}

                    onItemPress={this._onItemPress}
                    data={data}
                    renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, rowID)}
                    onItemLongPress={this._onItemLongPress}
                    onScroll={(e) => {
                        let offsetY = e.nativeEvent.contentOffset.y
                        this.mScrolly = offsetY;
                        scrollOffet = offsetY;
                    }}
                    onTouchStart={() => this._onTouchStart()}

                    onScrollBeginDrag={() => {//手指拖动开始
                        // console.log('scroll滚动 onScrollBeginDrag,手指拖动开始');
                        this.touchTime = new Date().getTime();
                    }}
                    onScrollEndDrag={() => {//手指拖动结束
                        // console.log('scroll滚动 onScrollEndDrag,手指拖动结束');
                        this.touchTime = new Date().getTime();
                        this.onTouchEnd();
                    }}

                    onMomentumScrollEnd={() => {
                        // console.log('scroll滚动 onMomentumScrollEnd');
                        //滑动结束
                        this.touchTime = new Date().getTime();
                        this._mScrollEnd();

                    }}
                    onMomentumScrollBegin={() => {
                        // console.log('scroll滚动 onMomentumScrollBegin');
                        this.onMomentumScrollBegin();
                    }}
                    onTouchBegin={() => {
                        this.touchTime = new Date().getTime();
                        // console.log('scroll滚动 onTouchBegin');
                    }}
                    onTouchEnd={() => {
                        // console.log('scroll滚动 onTouchEnd');
                        this.touchTime = new Date().getTime();
                    }}
                />
            </View>
        );
    }


    //滑动结束
    _mScrollEnd() {
        if (!this.hasTimeOut) {
            this.hasTimeOut = true;
            setTimeout(() => {
                this.hasTimeOut = false;
                if (new Date().getTime() - this.touchTime > this.touchTimeLenght) {
                    // console.log('_scrollDragEnd  监听数据');
                    if (this.focus){
                        this._setData();//滚动结束监听数据不能实时返回，先设置下数据
                        this._queryCurrentStocks();
                    }

                } else {
                    this._mScrollEnd();
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
                this._mScrollEnd();
            } else {
                this.scrollBegin = false;
            }
        }, 100);
    }

    onMomentumScrollBegin() {
        this.scrollBegin = true;
    }

    /**
     *计算当前屏幕中显示的第一条数据index，获取需要监听的股票数组
     */
    _currentDateIndex() {
        let index = Math.floor((this.mScrolly) / itemHeight);
        index = index < 0 ? 0 : index;
        // console.log('监听行情股票数组' + this.mScrolly + ',' + index)
        return index;
    }

    /**
     * 排序
     * @param info
     * @param index
     * @private
     */
    _sortClick(info, index) {
        if (info.isSort < 0)
            return;

        //点击排序隐藏置顶删除pop
        this.popoverView.hiddenAlert();

        if (this.state.selectSortIndex === index) {
            if (!this.state.desc) {
                //无排序
                this.setState({ selectSortIndex: -1 },
                    () => {
                        //先根据自选股原来顺序排序，然后监听当前页面数据
                        this._queryCurrentStocks(this._setData());
                        //编辑按钮状态
                        this.props.editButton(true);
                    })
            } else {
                //升序
                this.setState({ desc: !this.state.desc }, () => {
                    // this._setData();
                    //先将本地数据全排序，然后监听当前页面数据
                    let sortData = this._setLocalSortData();
                    this._queryCurrentStocks(sortData);
                    this.props.editButton(false);
                })
            }
        } else {
            //降序
            this.setState({
                desc: true,
                selectSortIndex: index,
            }, () => {
                // this._setData();
                //先将本地数据全排序，然后监听当前页面数据
                let sortData = this._setLocalSortData();
                this._queryCurrentStocks(sortData);
                this.props.editButton(false);
            })
        }
    }

    _renderTitle(info, index) {
        let source = this.state.selectSortIndex === index ? this.state.desc ?
            require('../../images/hits/positive.png') :
            require('../../images/hits/negative.png') :
            require('../../images/hits/defaultt.png');
        let isSort = info.isSort;

        return (
            <View style={{ flex: 1, justifyContent: "center", flexDirection: 'row', }} key={index}>
                <TouchableOpacity activeOpacity={0.6} onPress={() => this._sortClick(info, index)}
                    style={{
                        flex: index === 1 ? 0.5 : 1,
                        flexDirection: 'row',
                        alignItems:"center",
                        justifyContent: index > 0 ? 'flex-end'  : 'flex-start',
                    }}>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#666666" }}>
                        {info.title}
                    </Text>
                    {
                        isSort > 0 && <Image  style={styles.sortView} source={source} />
                    }
                </TouchableOpacity>
            </View>
        )
    }

    _renderRow(rowData, rowID) {

        const { personalStockData } = this.props.statePersonalStocks;

        // alert(JSON.stringify(rowData))
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (rowData.ZhangFu > 0) clr = baseStyle.UP_COLOR;
        else if (rowData.ZhangFu < 0) clr = baseStyle.DOWN_COLOR;
        let isTS = ShareSetting.isDelistedStock(rowData.ZhongWenJianCheng)

        let rowView = (
            <TouchableOpacity
                onPress={() => this._onItemPress(rowData, rowID)}
                onLongPress={() => this._onItemLongPress(rowData, rowID)}//{this._onItemLongPress.bind(this, rowData)}
            >
                <View style={styles.container}>
                    <View key="ZhongWenJianCheng" style={{
                        flex: 1, flexDirection: 'column', justifyContent: 'center'
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, }}>
                            <StockFormatText style={{
                                color: baseStyle.BLACK_100,
                                fontSize: 15,
                                textAlign: 'left',
                            }}>{rowData.ZhongWenJianCheng && rowData.ZhongWenJianCheng.replace(/\(退市\)/g, "")}</StockFormatText>

                            {isTS ? <View style={{
                                backgroundColor: '#AAAAAA',
                                borderRadius: 4,
                                height: 16,
                                width: 21,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 3,
                            }}>
                                <Text style={{ color: '#fff', fontSize: 10 }}>{'退'}</Text>
                            </View> : null}
                        </View>
                        <StockFormatText style={{
                            color: baseStyle.BLACK_70,
                            fontSize: 12,
                            textAlign: 'left',
                        }}>{rowData.Obj}</StockFormatText>
                    </View>
                    <View key="ZuiXinJia" style={{ flex: 0.5 }}>
                        <StockFormatText titlename={"ZuiXinJia"} style={{
                            textAlign: 'right',
                            fontSize: 15,
                            color: clr,
                            fontFamily: 'Helvetica Neue'
                        }}>{rowData.ZuiXinJia}</StockFormatText>
                    </View>

                    <View key="ZhangFu" style={{ flex: 1 }}>
                        <StockFormatText style={{ textAlign: 'right', fontSize: 15, color: clr, fontFamily: 'Helvetica Neue'}} unit="%"
                            sign={true}>{rowData.ZhangFu / 100}</StockFormatText>
                    </View>
                </View>
            </TouchableOpacity>
        )

        let searchStockV = (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={this.searchStock.bind(this)}
                style={{ flex: 1, height: 49, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Image style={{ marginRight: commonUtil.rare(21) }}
                    source={require('../../images/icons/personal_add.png')} />
                <Text style={{ color: '#006ACC', fontSize: RATE(30) }}>添加股票</Text>

            </TouchableOpacity>
        )
        return (
            <View style={{ backgroundColor: '#FFF' }}>
                {rowView}
                {
                    rowID >= personalStockData.length - 1 ? searchStockV : null
                }
            </View>
        );
    }


    searchStock() {
        Navigation.pushForParams(this.props.navigation, 'SearchPage', { entrance: '自选股' })
    }

    //scroll点击事件，触发popover消失
    _onTouchStart(e) {
        this.popoverView.hiddenAlert();
    }

    //删除
    _deletePersonStock() {
        UserInfoUtil.deletePersonStock(longPreItemData.Obj, () => {
            // toast('删除成功');
        });
    }
    //置顶
    _topPersonStock() {
        if (this.state.selectSortIndex > 0) return;
        UserInfoUtil.topPersonStock(longPreItemData.Obj, () => {
            // toast('置顶成功');
        }, () => { })
    }

    //猜你喜欢View
    _likeView(info, index) {

        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (info.ZhangFu > 0) clr = baseStyle.UP_COLOR;
        else if (info.ZhangFu < 0) clr = baseStyle.DOWN_COLOR;

        return (
            <TouchableOpacity
                key={index}
                onPress={() => this._onItemPress(info, index, true)}
                style={{
                    backgroundColor: '#fff', flex: 1, height: commonUtil.rare(140),
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: commonUtil.rare(10)
                }}>
                <Text style={{
                    color: baseStyle.BLACK_333333,
                    fontSize: RATE(32)
                }}>
                    {info.ZhongWenJianCheng}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: commonUtil.rare(29) }}>
                    <StockFormatText titlename={"ZuiXinJia"} style={{
                        // textAlign: 'right',
                        marginRight: commonUtil.rare(20),
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: clr,
                    }}>{info.ZuiXinJia}</StockFormatText>
                    <StockFormatText style={{ fontWeight: 'bold', fontSize: 12, color: clr, }} unit="%"
                        sign={true}>{info.ZhangFu / 100}</StockFormatText>
                </View>
            </TouchableOpacity>
        )
    }

    //无自选股View
    _noStockView() {

        //猜你喜欢数据
        let likeS = this.state.likeStocks[0].Obj && this.state.likeStocks[1].Obj && this.state.likeStocks[2].Obj ? this.state.likeStocks.slice(0, 3) : null
        return (
            <View style={{
                flex: 1,
                backgroundColor: baseStyle.NO_CONTENT_BACKGROUND_COLOR
            }}>
                <View style={{ alignItems: 'center', }}>
                    <TouchableOpacity
                        style={{ marginTop: 130 }}
                        activeOpacity={0.8}
                        onPress={this.searchStock.bind(this)}>
                        <Image
                            style={{ width: 100, height: 100, flexDirection: 'column', alignItems: 'center', }}
                            source={require('../../images/icons/personal_select.png')} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 14,
                        marginTop: 30,
                        color: baseStyle.BLACK_99,
                        textAlign: 'center',
                    }}>{ShareSetting.getNoStockNotice()}</Text>
                </View>
                <View style={{ height: commonUtil.rare(180), marginTop: commonUtil.rare(83) }}>
                    <Text style={{
                        color: baseStyle.BLACK_333333,
                        fontSize: RATE(30),
                        fontWeight: 'bold',
                        marginLeft: commonUtil.rare(30)
                    }}>{(likeS && likeS.length > 0) ? '猜你会喜欢' : ''}</Text>
                    <View style={{ flexDirection: 'row', padding: commonUtil.rare(10) }}>
                        {likeS && likeS.map(
                            (info, index) => (
                                this._likeView(info, index)
                            ))
                        }
                    </View>
                </View>
            </View>
        )
    }

    loginOnClick() {
        Navigation.pushForParams(this.props.navigation, "LoginPage", {
            callBack: () => {

            }
        });
    }

    renderLoginEntry() {
        let permission = this.props.permission;
        if (permission != 0) {
            return null;
        }
        return (
            <TouchableOpacity style={{ height: 90, backgroundColor: '#f6f6f6' }} activeOpacity={1} onPress={() => this.loginOnClick()}>
                <LinearGradient
                    style={{ height: 55, marginTop: 19, borderRadius: 10, marginLeft: 7.5, marginRight: 7.5, overflow: Platform.OS === 'ios' ? 'hidden' : "visible", justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row' }}
                    colors={['#FF3434', '#FF00CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={{ marginLeft: 93.5, fontSize: 15, textAlign: 'center', color: '#fff' }}>登录即可同步自选股列表</Text>
                    <View style={{ width: 72.5, height: 30, borderColor: '#fff', borderWidth: 1, borderRadius: 5, marginRight: 11, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontSize: 15 }}>登录</Text>
                    </View>
                </LinearGradient>
                <Image style={{ position: 'absolute', marginLeft: 7.5, marginTop: 7 }} source={require('../../images/icons/self_stock_sync_icon.png')}></Image>
            </TouchableOpacity>
        );
    }

    render() {
        //自选股数据
        const { personalStockData } = this.props.statePersonalStocks;
        // let stockDatas = this.getNewArray(personalStockData);
        let stockDatas = personalStockData;
        let personStocks = this.props.personStocks;
        // console.log('自选股 render ==personalStockData='+JSON.stringify(personalStockData));
        // console.log('自选股 ==personStocks='+JSON.stringify(personStocks));
        return (
            <View style={{ flex: 1 }}>
                {(personStocks && personStocks.length > 0) ? (this._renderStockList('自选股', stockDatas)) : (this._noStockView())}
                {this.renderLoginEntry()}
                <YDPopoverView
                    ref={(ref) => this.popoverView = ref}
                    deleteStock={() => this._deletePersonStock()}
                    topStock={() => this._topPersonStock()}
                />
            </View>
        );
    };

}

var styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: itemHeight,
        marginLeft: 12,
        marginRight: 12,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
});


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AllActions from '../../actions/AllActions';
import { personStock } from "../../actions/UserInfoAction";
import { setPersonalStocks } from "../../actions/AllActions";
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool.js';
import * as ScreenUtil from "../../utils/ScreenUtil";
import { StickyForm } from "react-native-largelist-v3";
import { connection } from "./YDYunConnection";

export default connect((state) => ({
    permission: state.UserInfoReducer.permissions,
    statePersonalStocks: state.PersonalStocksTabReducer,
    personStocks: state.UserInfoReducer.personStocks//statePersonalStockList
}),
    (dispatch) => ({
        actions: bindActionCreators(AllActions, dispatch)
    })
)(PersonalStocksTab)
