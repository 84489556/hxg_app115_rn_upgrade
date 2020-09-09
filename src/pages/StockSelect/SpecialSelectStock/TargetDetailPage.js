/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/6 17
 * description:
 */
import React from 'react';
import {
    ActivityIndicator,
    Image,
    PixelRatio,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    NativeEventEmitter,
    NativeModules, AppState
} from 'react-native';
import { StickyForm } from "react-native-largelist-v3";
import LinearGradient from 'react-native-linear-gradient';
import RequestInterface from "../../../actions/RequestInterface";
import ExpandableText from "../../../components/ExpandableText";
import { mRiskTipsFooter } from "../../../components/mRiskTipsFooter";
import StockFormatText from '../../../components/StockFormatText';
import ShareSetting from "../../../modules/ShareSetting";
import BaseComponentPage from "../../../pages/BaseComponentPage";
import QuotationListener from "../../../utils/QuotationListener";
import * as ScreenUtil from '../../../utils/ScreenUtil';
import Yd_cloud from "../../../wilddog/Yd_cloud";
import HitsApi from "../../Hits/Api/HitsApi";
import TargetHistoryPage from "./TargetHistoryPage";
import * as BuriedpointUtils from "../../../utils/BuriedpointUtils"
import * as baseStyle from "../../../components/baseStyle";
import {mNormalHeader} from "../../../components/mNormalHeader";
import TopButton from "../../../components/TopButton";
import {connection} from "../../Quote/YDYunConnection";
//const EventEmitter = new NativeEventEmitter(NativeModules.YDYunChannelModule);
import NetInfo from "@react-native-community/netinfo";
let refHXG = Yd_cloud().ref(MainPathYG);
let stockupDate =  refHXG.ref('DingJu/TeSeZhiBiaoXuanGuUpdateTime');
import {searchStockIndex,getFooterRiskTipView} from '../../../utils/CommonUtils'

export default class TargetDetailPage extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {
            //isFold:true, //文字是否是展开折叠状态，默认是true
            keyWord: this.props.navigation.state.params.keyWord ? this.props.navigation.state.params.keyWord : "",//上个页面传递的页面关键词
            from: this.props.navigation.state.params.from ? this.props.navigation.state.params.from : 0,//从哪个Item来，显示对应的渐变色
            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            titles: [
                { conName: "涨跌幅", conCode: 1 },
                { conName: "现价", conCode: -1 },
                { conName: "成交量", conCode: -1 },
                { conName: "量比", conCode: -1 },
                { conName: "换手率", conCode: -1 },
                { conName: "总市值", conCode: -1 }
            ],
          //  allDatas:[],//所有数据，因为现在产品需求，需要加载完500条数据以后，实现本地加载更多，为了解决服务器后台列表排序更新时，前端不受影响
            detailDescribe: this.props.navigation.state.params.intro ? this.props.navigation.state.params.intro : "",//详情描述,
            allLoaded: true,//是否还有加载更多数据，此列表只加载20条,//合规版本改为有分页加载了
            growthSchool: [],//成长学堂的数据
            rangeSc: [{ tabName: "沪深A股", tabIndex: 0 }],//选股范围数据 {tabName: "上证A股", tabIndex: 1}
            haveSt: "否",//是否包含ST股,默认否
            refreshDate: "",//最新刷新时间

            selected:false,//是否选中资金top筛选
           // showRefresh:false,//是否显示股池已经更新的button
            stockListNumber:0,//当前筛选条件下股池的数量
        };
        this.handleConnectivityChange = this.handleConnectivityChange.bind(this);

        //全局页面背景色
        switch (this.state.from) {
            case 0:
            case 1:
                this.allBgColor = ["#FF6699", "#FF3333"];
                break;
            case 2:
            case 3:
                this.allBgColor = ["#CC66FF", "#B726FF"];
                break;
            case 4:
            case 5:
                this.allBgColor = ["#6699FF", "#266EFF"];
                break;
            default:
                this.allBgColor = ["#6699FF", "#266EFF"];
                break;
        }
        this.firstEnter = 0;//之前是只有一个接口，现在有2部分接口，所以改成 0，1，2三个状态，每回来一个接口，加1,只是用来判断第一次进入的默认页面
        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(100);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        //this.FOOTTER_HEIGHT = 50;
        this.hearderHeight = 0;//给表格原生传入的header高度，防止滑动问题

        this.mScollY = 0;//记录一个值储存滑动的偏移量

        this.scrollBegin = false; //专用ios
        this.touchTemp = 0;//记录时间戳的中间值
        this.isStartAddListener = 0; //列表是否开始执行监听行情的函数了//三个状态 0，1，2 ，0初试状态，1，滑动开始状态，2已经开始注册监听状态

        this.startIndex = 0;//当前页面需要从哪条数据开始监听的Index
        this.addNumbers = 16;//监听页面的股票指数，固定的

        this.pageNumber = 1;
        this.pageSize = 500;

        this.pageFocus = false;//当前页面是否获取焦点，主要是解决跳出页面以后，还继续设置监听的问题

        //将大列表的排序List和股池的股票列表储存起来
        this.bigList = [];//大列表;
        this.stockPool = [];//股池股票

        this.listDesc = false;//判断当前列表是否升降序，主要是给页面排序使用

        this.netInfoStatus = "";//设置默认的网络监听状态，现在网络变化时,会很快回调很级次没有用的监听,目前本地延迟处理，所以一个变量记录一下

    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {}

    /**
     * 页面加载完成
     * */
    componentDidMount() {
        this.getSchoolDatas();
        this.getStockPollDatas();
        //this.getBigSortList();
        this.addListeners();

        // setInterval(()=>{
        //     //执行股池刷新
        //     console.log("执行股池刷新")
        //     this.getStockPollDatas();
        // },10*1000)
    }
    /**
     * 取大列表排序数据
     * */
    getListDatas(){

        this.blockSortRequest && this.blockSortRequest.cancel();

        let params = {
            blockid:"yd_1_sec_8",
            start: 0,
            desc:true,
            count: 5000,
            subscribe: true
        };
        //只能有一种排序  this.state.titles[index].conCode = 1;
        let selectSortIndex = 0;
        for (let i = 0;i<  this.state.titles.length;i++){
            if(this.state.titles[i].conCode > 0 ){//只要不是0,-1,则必然是这个排序条件
                selectSortIndex = i;
                //增加一个排序正序倒序的参数
                if(this.state.titles[i].conCode === 1){
                    //params.desc = true;
                    this.listDesc = true;//降序
                }else if(this.state.titles[i].conCode === 2){
                   // params.desc = false;
                    this.listDesc = false;//升序
                }
                break;
            }
        }
        //这里的数量需要和总的排序个数对应
        // { conName: "涨跌幅", conCode: 0 },
        // { conName: "现价", conCode: 1 },
        // { conName: "成交量", conCode: -1 },
        // { conName: "量比", conCode: -1 },
        // { conName: "换手率", conCode: -1 },
        // { conName: "总市值", conCode: -1 }

        switch (selectSortIndex){
            case 0:
                params.titleid = 199;
                break;
            case 1:
                params.titleid = 33;
                break;
            case 2:
                params.titleid = 42;
                break;
            case 3:
                params.titleid = 205;
                break;
            case 4:
                params.titleid = 256;
                break;
            case 5:
                params.titleid = 261;
                break;
        }

        this.blockSortRequest = connection.request('FetchBlockSortNative', params, (evDatas) => {
            //console.log('ydChannelMessaget回调=========================================',evDatas);
            this.firstEnter += 1;
           // this.bigList = JSON.parse(evDatas.data).slice();
            this.bigList = evDatas.slice();
            //大列表需要一个有序数组，按照股票名称排序
            if(Platform.OS==='android'){
                this.bigList.sort(function (a, b) {
                    let code1 = parseInt(a.label_.substring(2));
                    let code2 = parseInt(b.label_.substring(2));
                    return code1 - code2; // 倒序
                });
            }else {
                this.bigList.sort(function (a, b) {
                    let code1 = parseInt(a.Obj.substring(2));
                    let code2 = parseInt(b.Obj.substring(2));
                    return code1 - code2; // 倒序
                });
            }
            this.getMergeList();
        });
    };

    /**
     * 取股池所有股票的代码
     *   /**
     * 获取页面所需的数据
     * 选股范围叠加条件对应
     * 沪深A股---》A股板块
     上证A股----》沪A股
     深证A股----》深A股
     中小板------》深证中小板
     创业板------》深证创业板
     科创板------》科创板
     'yd_1_sec_8'	'A股板块'
     'SHind365'	'沪A股',
     'SZI00051'	'深A股',
     SZI00052'	'深证中小板'
     'SZI00131' '深证创业板'
     'yd_1_sec_101'	'科创板',
     * */
    getStockPollDatas(callback){
        let params = {};
        //params.jzcl = this.state.keyWord;//目前这个块数据有点问题
        params.indicatorNames = this.state.keyWord;
        if (this.state.rangeSc && this.state.rangeSc.length > 0) {
            let srangeSc = "";
            for (let i = 0; i < this.state.rangeSc.length; i++) {
                if (this.state.rangeSc[i].tabName != "") {
                    switch (this.state.rangeSc[i].tabName) {
                        case "沪深A股":
                            srangeSc += "yd_1_sec_8,";
                            break;
                        case "上证A股":
                            srangeSc += "SHind365,";
                            break;
                        case "深证A股":
                            srangeSc += "SZI00051,";
                            break;
                        case "中小板":
                            srangeSc += "SZI00052,";
                            break;
                        case "创业板":
                            srangeSc += "SZI00131,";
                            break;
                        case "科创板":
                            srangeSc += "yd_1_sec_101,";
                            break;
                    }
                }
            }
            srangeSc = srangeSc.substring(0, srangeSc.length - 1);
            params.secCodeRanges = srangeSc;
        }
        //此处需要添加含有ST股的参数
        if (this.state.haveSt === "是") {
            params.rmSt = false;
        } else {
            //true为移出ST股票
            params.rmSt = true;
        }
        params.pageNo = this.pageNumber;
        //排序字段
        // if(this.state.selected===false){
        //     params.queryType = 2;
        //     //一次请求500条
        //     params.pageSize = 10;//现在默认请求10条
        //     //params.pageSize = 5000;
        // }else {
        //     params.queryType = 1;
        //     params.pageSize = 10;
        // }

        params.queryType = 1;
        params.pageSize = 10;

        params.returnType = 1;

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.SPECIAL_DETAILS_LIST, params,
            (response) => {
                //清空股池缓存,如果请求前清除数据，可能造成stockPool为空,然后行情大列表推送过来，排序刷新页面时，空视图闪动
                this.stockPool = [];

              //  console.log("请求股池成功",response)
                this.firstEnter += 1;
                this.state.refreshDate = response.updateTime;
                response = response.list;
                if (response && response.length > 0) {
                    for (let i = 0; i < response.length; i++) {
                        let newItem = {};
                        newItem.secName = response[i].secName;
                        newItem.marketCode = response[i].marketCode;
                        this.stockPool.push(newItem)
                    }
                    this.getMergeList();
                    if(callback){
                        callback();
                    }
                }else {
                    this.getMergeList();
                    if(callback){
                        callback();
                    }
                }
            },
            (error) => {
                this.firstEnter += 1;
                //设置最新刷新时间
                let currentDateS = ShareSetting.getDate(Date.parse(new Date()), 'yyyy-MM-dd HH:mm');
                //请求错误时,返回值为空
                this.state.data[0].items = [];
                this.setState({
                    data: this.state.data,
                    allLoaded: true,
                    refreshDate: currentDateS,
                    stockListNumber:0,
                },()=>{
                    if(callback){
                        callback();
                    }
                });
            })
    }

    //大列表数据监听
    // getBigSortList(){
    //     this.blockSortListener = EventEmitter.addListener('ydChannelMessage', evDatas => {
    //         //console.log('ydChannelMessaget回222调',evDatas.qid);
    //        // console.log('ydChannelMessaget回222调',new Date().valueOf());
    //
    //     })
    // };
    /**
     * 获取大列表和股池排序后的股票列表
     *  this.bigList = [];//大列表股票
     *  this.stockPool = [];//股池股票
     * */
    getMergeList(){
        if(this.bigList.length === 0 || this.stockPool.length === 0){
            //表示数据是从有到无的，可能是增加筛选条件来着
            if(this.firstEnter >= 2){
                this.state.data[0].items = [];
                this.setState({
                    data: this.state.data,
                    allLoaded:  true ,
                    refreshDate:this.state.refreshDate,
                    stockListNumber:this.state.data[0].items.length,
                })
            }
            return ;
        }

        //都有数据以后,才表示第一次加载完成
        //this.firstEnter = false;
        //在小数组去查大数组的
        for (let i = 0;i<this.stockPool.length;i++){
            let itemSecIndex = searchStockIndex(this.bigList,0,this.bigList.length-1,this.stockPool[i].marketCode);
            if(itemSecIndex !== -1){
                //这里需要根据大列表的value字段进行小列表的排序，先记录
                if(Platform.OS === 'android'){
                    this.stockPool[i].sortContent = this.bigList[itemSecIndex]['value_']
                }else {
                    this.stockPool[i].sortContent = this.bigList[itemSecIndex]['value']
                }
            }
        }
        //大列表需要一个有序数组，按照股票名称排序,暂时这么写，后面改改
        if(this.listDesc === true){
            this.stockPool.sort(function (a, b) {
                return b.sortContent - a.sortContent; // 降序
            });
        }else {
            this.stockPool.sort(function (a, b) {
                return a.sortContent - b.sortContent; // 升序
            });
        }
        //这里新的排序来的时候，赋值的时候,不要全部赋值为 '--' 这样全屏会闪白，所以多一步操作，从列表中的数据,
        //直接双重for循环屏幕上的股票
        //要是位置没变的股票，就先取缓存，要是位置改变的，就复制成'--'
        let newArray = [];
        for (let i = 0; i <  this.stockPool.length; i++) {
            let newItem = {};
            //储存第一列需要的数据
            let titles = {};
            //获取title数据
            titles.secName = this.stockPool[i].secName;
            titles.secCode = this.stockPool[i].marketCode;
            newItem.title = titles;


            //数据项，一定要按照数据添加
            let dataItem = [];
            for (let j = this.startIndex ; j < (this.startIndex+this.addNumbers); j++) {
                //每次都从当前屏幕上startIndex开始取，如果数组越界this.state.data[0].items[i]为空，跳出循环
                if (this.state.data[0].items[j] && this.state.data[0].items[j].title.secCode && this.state.data[0].items[j].title.secCode != '--'
                &&  this.state.data[0].items[j].title.secCode == this.stockPool[i].marketCode) {
                    dataItem =  this.state.data[0].items[j].data;
                }
            }
            if(dataItem && dataItem.length === 0){
                dataItem.push('--');//涨跌幅
                dataItem.push('--');//现价
                dataItem.push('--');//成交量
                dataItem.push('--');//量比
                dataItem.push('--');//换手率
                dataItem.push('--');//总市值
            }
            newItem.data = dataItem;
            newArray.push(newItem);
        }
        //设置数据前清空数据
        this.state.data[0].items = [];
        this.state.data[0].items = newArray;
        this.getFirstStock()

    }

    /**
     * 第一次进入时获取股票的行情数据
     * 第一次进入和回到页面时需要请求
     * 现在本方法不只是针对于第一次进入页面请求，
     * 现在在每次监听股票行情时，必须先去取一次当前屏幕上的股票，取最新的股票行情数据
     *   this.startIndex = 0;//当前页面需要从哪条数据开始监听的Index
     this.addNumbers = 16;//监听页面的股票指数，固定的
     * */
    getFirstStock(callBack) {
        let stockList = [];
        if (this.state.data[0].items.length > 0) {
            for (let i = this.startIndex ; i < (this.startIndex+this.addNumbers); i++) {
                //每次都从当前屏幕上startIndex开始取，如果数组越界this.state.data[0].items[i]为空，跳出循环
                if (this.state.data[0].items[i] && this.state.data[0].items[i].title.secCode && this.state.data[0].items[i].title.secCode != '--') {
                    stockList.push(this.state.data[0].items[i].title.secCode)
                }
            }
            QuotationListener.getStockListInfo(stockList, (stockObj) => {
                // console.log("每次获取到的数据获取到第一次的基础数据",stockObj)
                //设置数据刷新
                if (stockObj.length > 0) {
                    for (let i = this.startIndex; i < (this.startIndex+this.addNumbers); i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            //这一层判断用来过滤数组越界为空的情况
                            if(this.state.data[0].items[i]){
                                if (this.state.data[0].items[i].title.secCode == stockObj[j].c) {
                                    this.state.data[0].items[i].data[0] = Number(stockObj[j].y) / 100;
                                    this.state.data[0].items[i].data[1] = Number(stockObj[j].k);
                                    this.state.data[0].items[i].data[2] = Number(stockObj[j].f) / 100;//股换算为手
                                    this.state.data[0].items[i].data[3] = Number(stockObj[j].af);
                                    this.state.data[0].items[i].data[4] = Number(stockObj[j].ak);
                                    this.state.data[0].items[i].data[5] = Number(stockObj[j].ao);
                                }
                            }
                        }
                    }
                    this.setState({
                        data: this.state.data,
                        allLoaded:  true ,
                        refreshDate:this.state.refreshDate,
                        stockListNumber:this.state.data[0].items.length,
                    }, () => {
                        if (callBack) {
                            callBack();
                        }
                    })
                } else {
                    if (callBack) {
                        callBack();
                    }
                }
            });
        } else {
            if (callBack) {
                callBack();
            }
        }
    }

    addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                this.pageFocus = true;
                this.stockChanggeListtener();
                this.getListDatas();//获取焦点时去监听大列表排序,避免重复监听
                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.tesezhibiaoxuanguxiangqing);
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this.pageFocus = false;
                this.clearRequest();
            }
        );

        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    //监听独有的列表刷新节点，判断列表排序是否有更新，节点更新表示排序有更新,手动刷新股池,提取出来
    stockChanggeListtener(){
        stockupDate.on('value',(response) => {
            //console.log("股池刷新监听",response)
            if (response.code == 0) {
                this.getStockPollDatas();
            }
        });
    }

    //监听网络状态的改变
    handleConnectivityChange(status) {
        //这个监听
        //console.log("网络变化监听",status)
        if(this.firstEnter === 0){
            //排除第一次进入时，网络监听变化得到的重复请求
            return;
        }
        if(status && status.type && status.type!==""){
            this.netInfoStatus = status.type;
        }

        if(this.netInfoTimer === undefined){

            this.netInfoTimer = setTimeout(()=>{
                if ( this.netInfoStatus  == 'none') {
                    this.clearRequest();
                    //this.blockSortListener && this.blockSortListener.remove();
                } else if ( this.netInfoStatus = 'cellular' ||  this.netInfoStatus == 'wifi') {
                    this.stockChanggeListtener();
                    this.getListDatas();//获取焦点时去监听大列表排序,避免重复监听
                }
                this.netInfoTimer && clearTimeout(this.netInfoTimer);
                this.netInfoTimer = undefined;
            },1500)
        }
    }

    //应用前后台监听方法
    _handleAppStateChange = (nextAppState) => {
        if( this.pageFocus === false){
            return;
        }
        if (nextAppState === 'active') {
            if (Platform.OS === 'ios') {
               // this._checkVersionUpdata();
            }
            this.stockChanggeListtener();
            this.getListDatas();//获取焦点时去监听大列表排序,避免重复监听
        }
        else if (nextAppState === 'background') {
            //进入后台时，储存一个上次退出时间
            if (Platform.OS === 'android') {
                this.clearRequest();
            }
        } else if (nextAppState === 'inactive') {
            //进入后台时，储存一个上次退出时间，ios有过渡时间的方法，在这个方法做操作
            if (Platform.OS === 'ios') {

            }
        }
    };
    /**
     * 取消监听方法
     * */
    clearRequest(){
        //取消注册
        stockupDate && stockupDate.off('value', (response) => {});
        this.blockSortRequest && this.blockSortRequest.cancel();
        connection.resetInit();
    }

    /**
     * 设置行情数据
     *
     * */
    setQuotation(stockObj) {
        if (this.state.data[0].items.length > 0) {
            for (let i = this.startIndex; i <  (this.startIndex+this.addNumbers); i++) {
                //这一层判断用来过滤数组越界为空的情况
                if(this.state.data[0].items[i]){
                    if (this.state.data[0].items[i].title.secCode == stockObj.c) {
                        this.state.data[0].items[i].data[0] = Number(stockObj.y) / 100;
                        this.state.data[0].items[i].data[1] = Number(stockObj.k);
                        this.state.data[0].items[i].data[2] = Number(stockObj.f) / 100;//股换算为手
                        this.state.data[0].items[i].data[3] = Number(stockObj.af);
                        this.state.data[0].items[i].data[4] = Number(stockObj.ak);
                        this.state.data[0].items[i].data[5] = Number(stockObj.ao);
                    }
                }
            }
            //页面刷新
            this.setState({
                data: this.state.data
            })
        }
    }

    /**
     * 获取成长学堂的数据
     * */
    getSchoolDatas() {
        let growthSchool = refHXG.ref('ZhiBiaoXueTang/' + this.state.keyWord);
        growthSchool.orderByKey().limitToLast(2).get((response) => {
            if (response.code == 0) {
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);
                for (let i = 0; i < key.length; i++) {
                    let newItem = {};
                    newItem.nodeName = "ZhiBiaoXueTang";//根节点名称
                    newItem.taoxiName = this.state.keyWord;//套系名称
                    newItem.key = key[i];
                    newItem.content = item[i];
                    item[i] = newItem;
                }
                item.reverse();
                this.setState({
                    growthSchool: item
                })
            }
        })
    }
    _clickBack() {
        if (this.props.navigation) this.props.navigation.goBack();
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{
                    width: ScreenUtil.screenW,
                    height: ScreenUtil.statusH + (Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90)),
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={this.allBgColor}
                        style={styles.conNoDivider}>
                        <View style={{ flexDirection: "row", width: ScreenUtil.screenW, height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90) }}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this._clickBack()} style={styles.backView}>
                                <Image source={require('../../../images/login/login_back.png')} style={styles.backIcon} />
                            </TouchableOpacity>
                            <View style={styles.navTitleBack}>
                                <Text style={styles.navTitle} numberOfLines={1}>{this.state.keyWord + "详情"}</Text>
                            </View>

                            <TouchableOpacity activeOpacity={0.6} onPress={() => {
                                // this._list.scrollTo({ x: 0, y: (this.hearderHeight/PixelRatio.get())}, true).then(()=>{
                                //     console.log("回到顶部的回调")
                                // })
                                Navigation.navigateForParams(this.props.navigation, "TargetHistoryPage", { wordKeys: this.state.keyWord})
                            }} style={{
                                position: "absolute", bottom: Platform.OS === "ios" ? (44 - ScreenUtil.scaleSizeW(40)) / 2 : ScreenUtil.scaleSizeW(25), right: ScreenUtil.scaleSizeW(30), width: ScreenUtil.scaleSizeW(130), height: ScreenUtil.scaleSizeW(40),
                                borderWidth: 1, borderColor: "#FF9933", borderRadius: ScreenUtil.scaleSizeW(5), justifyContent: "center", alignItems: "center"
                            }}>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#FF9933" }} numberOfLines={1}>历史表现</Text>
                            </TouchableOpacity>
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
                                <Image source={require('../../../images/login/login_back.png')} style={styles.backIcon} />
                            </TouchableOpacity>
                            <View style={styles.navTitleBack}>
                                <Text style={styles.navTitle}
                                    ref={ref => this.navBarText = ref}
                                    numberOfLines={1}>{this.state.keyWord + "详情"}</Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => {
                                Navigation.navigateForParams(this.props.navigation, "TargetHistoryPage", { wordKeys: this.state.keyWord})
                            }} style={{
                                position: "absolute", bottom: Platform.OS === "ios" ? (44 - ScreenUtil.scaleSizeW(40)) / 2 : ScreenUtil.scaleSizeW(25), right: ScreenUtil.scaleSizeW(30), width: ScreenUtil.scaleSizeW(130), height: ScreenUtil.scaleSizeW(40),
                                borderWidth: 1, borderColor: "#FF9933", borderRadius: ScreenUtil.scaleSizeW(5), justifyContent: "center", alignItems: "center"
                            }}>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#FF9933" }} numberOfLines={1}>历史表现</Text>
                            </TouchableOpacity>

                        </View>
                    </LinearGradient>
                </View>

                <StickyForm
                   // bounces={this.state.data[0].items.length > 0 ? true : false}
                    bounces={true}
                    style={{ backgroundColor: "#f6f6f6", flex: 1 }}
                    contentStyle={{ alignItems: "flex-start", width: "165%" }}
                    data={this.state.data}
                    scrollEnabled={true}
                    ref={ref => (this._list = ref)}
                    hearderHeight={this.hearderHeight}
                    heightForSection={() => this.HEADER_HEGHT}
                    renderHeader={this._renderunLockHeader}
                    renderFooter={this._renderMyFooters}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => this.ITEM_HEGHT}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    onRefresh={() => {
                        this.getSchoolDatas();
                        this.getStockPollDatas(()=>{
                            this._list && this._list.endRefresh();
                        });
                    }}
                    onLoading={() => {
                       // this.getLoadingDatas();
                    }}
                    renderEmpty={this.renderEmptys}
                    allLoaded={this.state.allLoaded}
                    directionalLockEnabled={true}
                    headerStickyEnabled={false}
                    refreshHeader={mNormalHeader}
                    loadingFooter={mRiskTipsFooter}
                    onMomentumScrollEnd={()=>{
                        //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                        this.isAddNowListener();
                    }}
                    onMomentumScrollBegin={() =>{
                        //ios专用
                        this.scrollBegin = true;

                    }}
                    onTouchBegin={()=>{

                    }}
                    onTouchEnd = {() => {
                        this.touchTemp = new Date().getTime();
                        if(Platform.OS !== 'ios'){
                            return;
                        }
                        //ios专用
                        setTimeout(() => {
                            if(!this.scrollBegin){
                                //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                                this.isAddNowListener();
                            }else {
                                this.scrollBegin = false;
                            }
                        }, 500);
                    }}

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

                        if(x <= 0 ){
                            this.leftArrow && this.leftArrow.setNativeProps({
                                style: { opacity: 1 }
                            });
                        }else {
                            this.leftArrow &&  this.leftArrow.setNativeProps({
                                style: { opacity: 0 }
                            });
                        }

                        if(this.isStartAddListener===0){
                            this.isStartAddListener = 1;
                        }

                    }}
                />

            </View>
        )
    }

    /**
     * 去监听当前股票的方法
     * 如果在1.5秒内，没有再次点击屏幕，再开始注册监听，要是有，就重置记录时间
     * */
    isAddNowListener(){
        if(this.isStartAddListener === 1 ){
            this.isStartAddListener = 2;
            setTimeout(()=>{
                if(new Date().getTime() - this.touchTemp>=1500){
                    if( this.pageFocus === false){
                        return
                    }
                    if(this.mScollY <= (Platform.OS==='ios' ? this.hearderHeight:(this.hearderHeight)/PixelRatio.get())){
                        this.startIndex = 0;
                        this.getFirstStock(() => {});
                    }else {
                        let index =  Math.floor((this.mScollY - (Platform.OS==='ios' ? this.hearderHeight:(this.hearderHeight)/PixelRatio.get()))/this.ITEM_HEGHT);
                        this.startIndex = index;
                        this.getFirstStock(() => {});
                    }
                    this.isStartAddListener = 0;
                    return;
                }else {
                    this.isStartAddListener = 1;
                    this.isAddNowListener();
                    return;
                }
            },1500);
        }
    }
    /**
     * 加载可滑动列表的头布局
     * */
    _renderunLockHeader = () => {
        return (
            <View style={{ alignSelf: "stretch" }}>
                <View style={{ width: ScreenUtil.screenW }}
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
                        colors={this.allBgColor}
                        style={{ width: ScreenUtil.screenW, paddingBottom: ScreenUtil.scaleSizeW(88) }}>
                        <ExpandableText
                            style={{
                                width: ScreenUtil.screenW, color: 'white',
                                paddingHorizontal: ScreenUtil.scaleSizeW(30), paddingVertical: ScreenUtil.scaleSizeW(15),
                                fontSize: ScreenUtil.setSpText(28),lineHeight: ScreenUtil.scaleSizeW(40)
                            }}
                            numberOfLines={2}
                            expandText={'展开'}
                            expandTextStyle={{ color: 'rgba(255,255,255,0.6)' }}
                            expandButtonLocation={'center'}
                        >
                            {this.state.detailDescribe}
                        </ExpandableText>
                        {this.getGrowthSchool()}
                        <View style={this.getHaveScreenTag() === false ? styles.foldTitleNoC : styles.foldTitle}>
                            <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "white" }} />
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white", marginLeft: ScreenUtil.scaleSizeW(10) }}>叠加条件</Text>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={() => {
                                Navigation.navigateForParams(this.props.navigation, "ScreenCondition", {
                                    rangeSc: this.state.rangeSc,
                                    haveStSc: this.state.haveSt,
                                    keyWord: this.state.keyWord,
                                    selectCall: (rang, special, value, haveSt) => { this.selectScreen(rang, special, value, haveSt) }
                                })
                            }} activeOpacity={0.7} style={styles.historyTag}>
                                <Image style={{ width: ScreenUtil.scaleSizeW(38), height: ScreenUtil.scaleSizeW(30), resizeMode: "contain" }}
                                    source={require('../../../images/hits/fold_img.png')} />
                                <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#FF9933", marginLeft: ScreenUtil.scaleSizeW(16) }}>叠加条件</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={(this.state.rangeSc.length > 0 || this.state.haveSt == "是" || this.state.haveSt == "否") ? styles.fLlayoutHaveContent : styles.fLlayout}>
                            {this.getAllScreenTag()}
                        </View>

                        <View style={styles.oneHang}>
                             <View style={{alignItems:"center",justifyContent:"center"}}>
                                 <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#000" }}>{"入选股票(" + this.state.stockListNumber + "只)"}</Text>
                                 <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)" }}>{this.state.refreshDate === "" ? this.state.refreshDate : this.state.refreshDate + "更新"}</Text>
                             </View>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        );
    };
    // <View>
    // <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#000" }}>{"入选股票(" + this.state.stockListNumber + "只)"}</Text>
    // <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)" }}>{this.state.refreshDate === "" ? this.state.refreshDate : this.state.refreshDate + "更新"}</Text>
    // </View>
    // <View style={{flex:1}}/>
    // <TopButton selected={this.state.selected} onPress = {(selected) => {this.getTopTenDatas(selected)}}/>
    /**
     * top10筛选
     * */
    getTopTenDatas(selected){
        this.pageNumber = 1;
        this.setState({
            selected:selected,
        },()=>{
            this.getStockPollDatas();
        })
    }

    /**
     * 回调了筛选条件以后
     * */
    selectScreen(rang, special, value, haveSt) {
        this.pageNumber =1;
        this.setState({
            rangeSc: rang,
            haveSt: haveSt
        }, () => {
            this.getStockPollDatas();
        })
    }
    /**
     * 获取是否有标签数据
     *
     * */
    getHaveScreenTag() {
        let screenView = false;
        if (this.state.rangeSc && this.state.rangeSc.length > 0) {
            screenView = true;
        }
        if (this.state.haveSt) {
            screenView = true;
        }
        return screenView
    }

    /**
     * 获取所有标签视图
     *{tabName: "上证A股", tabIndex: 1}
     * */
    getAllScreenTag() {
        let screenView = [];
        if (this.state.rangeSc && this.state.rangeSc.length > 0) {
            for (let i = 0; i < this.state.rangeSc.length; i++) {
                screenView.push(
                    <View style={styles.selectView}>
                        <Text style={styles.selectText}>{this.state.rangeSc[i].tabName}</Text>
                    </View>
                )
            }
        }
        if (this.state.haveSt && this.state.haveSt == "是") {
            screenView.push(
                <View style={styles.selectView}>
                    <Text style={styles.selectText}>包含ST股</Text>
                </View>
            )
        }
        if (this.state.haveSt && this.state.haveSt == "否") {
            screenView.push(
                <View style={styles.selectView}>
                    <Text style={styles.selectText}>不包含ST股</Text>
                </View>
            )
        }
        return screenView.length > 0 ? screenView : null;
    }

    /**
     * 获取成长学堂最新的数据
     * <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(250),justifyContent:"center",alignItems:"center"}}/>
     * */
    getGrowthSchool() {
        let Views = [];
        if (this.state.growthSchool != null && this.state.growthSchool.length > 0) {
            Views.push(<View style={styles.schoolTitle}>
                <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "white" }} />
                <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white", marginLeft: ScreenUtil.scaleSizeW(10) }}>成长学堂</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => { Navigation.navigateForParams(this.props.navigation, "IndexStudyCoursePage", {}) }} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "rgba(255,255,255,0.6)", marginRight: ScreenUtil.scaleSizeW(10) }}>更多</Text>
                    <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(26), resizeMode: "contain" }} source={require('../../../images/hits/hq_kSet_back.png')} />
                </TouchableOpacity>
            </View>);//添加分割线
            for (let i = 0; i < this.state.growthSchool.length; i++) {

                Views.push(
                    <TouchableOpacity activeOpacity={0.7} onPress={() => {
                        let path = MainPathYG + 'ZhiBiaoXueTang/' + this.state.keyWord + '/' + this.state.growthSchool[i].key;
                        let optionParams = { path: path, star: this.state.growthSchool[i].content.star, taoxiName: this.state.growthSchool[i].content.setsystem };
                        Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                            key: this.state.growthSchool[i].key,
                            type: 'IndexStudy',
                            ...optionParams
                        });
                    }} style={(i === this.state.growthSchool.length - 1)? styles.schoolItemLast:styles.schoolItem}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)" }}>{this.state.growthSchool[i].content.title + ""}</Text>
                        <View style={{ flex: 1 }} />
                        <Image style={{ width: ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(30), resizeMode: "contain" }}
                               source={require('../../../images/hits/videos_img.png')} />
                    </TouchableOpacity>
                )
            }
        } else {
            Views = null;
        }
        return Views;

    }
    /**
     * 绘制空视图
     * <ActivityIndicator color={"gray"}/>
     * */
    renderEmptys = () => {
        //let rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180)-4);
        if (this.firstEnter < 2) {
            return (
                <View style={{ height: this.HEADER_HEGHT + 200, flex: 1 }}>
                    <View style={{ width: ScreenUtil.screenW, height: 200, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={"gray"} />

                        {/*这个View是一个遮盖的View,只是用来挡住上拉加载那个文字的，因为现在这个StickyForm的renderFooter方法是不能正确回调的*/}
                        <View style={{
                            height: 60, position: "absolute", flexDirection: "row", backgroundColor: "#f6f6f6",
                            top: 200 - this.HEADER_HEGHT, left: 0, width: ScreenUtil.screenW
                        }}/>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{ height: this.HEADER_HEGHT + 400, flexDirection: "row" }}>
                    <View>
                        <View style={{ width: ScreenUtil.screenW, height: 400, backgroundColor: "#f6f6f6", alignItems: "center", justifyContent: "center" }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                                source={require('../../../images/TuyereDecision/no_stock_data.png')} />
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",
                                marginTop: ScreenUtil.scaleSizeW(100)
                            }}>暂无股票入选</Text>
                        </View>
                        {/*这个View是一个遮盖的View,只是用来挡住上拉加载那个文字的，因为现在这个StickyForm的renderFooter方法是不能正确回调的*/}
                        <View style={{
                            height: 60, position: "absolute", flexDirection: "row", backgroundColor: "#f6f6f6",
                            top: 450, left: 0, width: ScreenUtil.screenW
                        }}/>
                    </View>
                </View>
            );
        }
    };

    /**
     * SectionTitle
     *f2faff
     * backgroundColor: "#f2faff"
     * backgroundColor: "#f2faff"
     *                         style={{width:5,height:10,position: "absolute", top:14,right:-rights}}/>

     *
     * */
    _renderSection = (section: number) => {
        let rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180)-4);
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row",backgroundColor:"#f2faff" }}>
                <View style={[styles.fixTitleOne, {}]} >
                    <Image source={require('../../../images/hits/section_bg.png')} style={{flex:1, width: ScreenUtil.scaleSizeW(180),height: this.HEADER_HEGHT,position: "absolute", top:0,left:0,resizeMode:"stretch"}}/>
                    <Text style={styles.hinnerText}>股票名称</Text>

                    <Image
                        ref={ref => this.leftArrow = ref}
                        source={require('../../../images/hits/left_arrow.png')}
                        style={{width:5,height:10,position: "absolute", top:14,right:-rights}}/>
                </View>

                {this.state.titles.map((title, index) =>
                    <TouchableOpacity activeOpacity={1} onPress={() => { this.sortViewPress(index, title.conCode) }} style={index === 2 ? styles.headerFixText : styles.headerText} key={index}>
                        <Text style={styles.hinnerText}>
                            {title.conName}
                        </Text>
                        {this.getSortView(title.conCode)}
                    </TouchableOpacity>
                )}

            </View>
        );
    };

    /**
     * 获取标题
     * 后面排序的View
     * -1没有排序，0默认状态，1为降序，2为升序
     * */
    getSortView(conCode) {
        let sortView;
        switch (conCode) {
            case -1:
                sortView = null;
                break;
            case 0:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/defaultt.png')} />;
                break;
            case 1:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/positive.png')} />;
                break;
            case 2:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/negative.png')} />;
                break;
            default:
                sortView = null;
                break;
        }
        return sortView;
    }
    /**
     * 顶部view的点击事件
     * */
    sortViewPress(index, conCode) {
        //console.log("点击=="+index+"conCode="+conCode)
        if (this.state.titles[index].conCode !== -1) {
            let isNewSort =true;//判断是否是点击新的排序,点击当前的排序，不需要重新请求grpc
            if (conCode === 0) {
                this.state.titles[index].conCode = 1;
                isNewSort = true;
            } else if (conCode === 1) {
                this.state.titles[index].conCode = 2;
                isNewSort = false;
            } else if (conCode === 2) {
                this.state.titles[index].conCode = 1;
                isNewSort = false;
            }
            //把点击的其他标题重置,如果有排序则重置，没有排序则跳过
            for (let i = 0;i< this.state.titles.length;i++){
                if(i!==index && this.state.titles[i].conCode!==-1 ){
                    this.state.titles[i].conCode = 0;
                }
            }
            this.setState({
                titles: this.state.titles,
            }, () => {
                if(isNewSort===true){
                    this.getListDatas();
                }else {
                    this.listDesc = (this.state.titles[index].conCode === 1 ? true :false);
                    this.getMergeList();
                }

            });
        }
    }

    /**
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        //console.log("items",item)
        if(item===undefined ){
            return <View><View></View></View>;
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                let data = {};
                data.Obj = item.title.secCode;
                data.ZhongWenJianCheng = item.title.secName;
                data.obj = item.title.secCode;
                let codeArray = [];
                if (this.state.data[0].items.length > 0) {
                    for (let i = 0; i < this.state.data[0].items.length; i++) {
                        let itemObj = {};
                        itemObj.Obj = this.state.data[0].items[i].title.secCode;
                        itemObj.ZhongWenJianCheng = this.state.data[0].items[i].title.secName;
                        itemObj.obj = this.state.data[0].items[i].title.secCode;
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
                <View style={[styles.fixTitleOne, {}]}>
                    <Image source={require('../../../images/hits/item_head_bg.png')} style={{ flex:1, width: ScreenUtil.scaleSizeW(180),height:this.ITEM_HEGHT-1,position: "absolute", top:0,left:0,resizeMode:"stretch"}}/>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#242424" }}>{item.title && item.title.secName}</Text>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#909090" }}>{item.title && item.title.secCode}</Text>
                </View>
                {item.data.map((title, index) => this.getItemViewType(title, index))}
            </TouchableOpacity>
        );
    };

    /**
     * 获取不同样式的View
     * index===2 ?styles.headerFixText:styles.headerText
     * //backgroundColor: "#fff",
     * backgroundColor: "#fff"
     *
     * */
    getItemViewType(title, index) {
        let Views;
        //注意每个表格的设置不一样
        switch (index) {
            case 0:
                let monColor;
                if (title > 0) {
                    monColor = "#fa5033"
                } else if (title === 0) {
                    monColor = "rgba(0,0,0,0.4)"
                } else {
                    monColor = "#5cac33"
                }
                Views = <View style={styles.text} key={index}>
                    <StockFormatText precision={2} unit={"%"} useDefault={true} style={[styles.contentText, { color: monColor }]}>{title}</StockFormatText>
                </View>;
                break;
            case 2:
                Views = <View style={styles.textfix} key={index}>
                    <StockFormatText precision={2} unit={"手/万手/亿手"} useDefault={true} style={styles.contentText}>{title}</StockFormatText>
                </View>;
                break;
            case 5:
                Views = <View style={styles.text} key={index}>
                    <StockFormatText precision={2} unit={"元/万/亿"} useDefault={true} style={styles.contentText}>{title}</StockFormatText>
                </View>;
                break;
            default:
                Views = <View style={styles.text} key={index}>
                    <StockFormatText precision={2} useDefault={true} style={styles.contentText}>{title}</StockFormatText>
                </View>;
                break;
        }
        return Views;
    };


    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        // if(this.state.data && this.state.data[0].items.length === 0 ){
        //     return <View><View></View></View>;
        // }else {
        //
        // }
        return(
            <View>
                <View style={{ width: ScreenUtil.screenW,paddingVertical:ScreenUtil.scaleSizeW(30),paddingHorizontal:ScreenUtil.scaleSizeW(20), backgroundColor: "#f1f1f1", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{fontSize: ScreenUtil.setSpText(28), color:"rgba(0,0,0,0.2)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0,textAlign:"center"}}
                    >温馨提示：信息内容仅供参考,不构成操作决策依据，股市有风险，投资需谨慎。</Text>
                </View>
            </View>
        )
    }
    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this.firstEnter = 0;
        this.blockSortRequest && this.blockSortRequest.cancel();
        //this.blockSortListener && this.blockSortListener.remove();
        stockupDate && stockupDate.off('value', (response) => {});
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.netInfoSubscriber();
        this.willFocusSubscription &&  this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: baseStyle.isIPhoneX ? 34 : 0
    },
    selectView: {
        height: ScreenUtil.scaleSizeW(60),
        paddingHorizontal: ScreenUtil.scaleSizeW(14),
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
    fLlayout: {
        marginHorizontal: ScreenUtil.scaleSizeW(10),
        marginBottom: ScreenUtil.scaleSizeW(16),
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        borderBottomLeftRadius: ScreenUtil.scaleSizeW(10),
        borderBottomRightRadius: ScreenUtil.scaleSizeW(10),
        paddingHorizontal: ScreenUtil.scaleSizeW(10),
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0.2)"
    },
    fLlayoutHaveContent: {
        marginHorizontal: ScreenUtil.scaleSizeW(10),
        marginBottom: ScreenUtil.scaleSizeW(16),
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        borderBottomLeftRadius: ScreenUtil.scaleSizeW(10),
        borderBottomRightRadius: ScreenUtil.scaleSizeW(10),
        paddingHorizontal: ScreenUtil.scaleSizeW(10),
        paddingVertical: ScreenUtil.scaleSizeW(10),
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0.2)"
    },
    //表格需要的样式
    text: {
        flex: 1,
        justifyContent: "center",
        //alignItems: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
    },
    textfix: {
        width: ScreenUtil.scaleSizeW(250),
        justifyContent: "center",
        //alignItems: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
    },
    hinnerText: {
        fontSize: ScreenUtil.setSpText(24),
        color: "#999999"
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        backgroundColor: "#f2faff",
        flexDirection: "row"
    },
    headerFixText: {
        width: ScreenUtil.scaleSizeW(250),
        paddingLeft: ScreenUtil.scaleSizeW(20),
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row"
    },
    row: {
        flex: 1,
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor: "#fff"
    },
    contentText: {
        fontSize: ScreenUtil.setSpText(28),
        color: "#000"
    },
    fixTitleOne: {
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        width: ScreenUtil.scaleSizeW(180),
    },
    conNoDivider: {
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
    schoolTitle: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(77),
        flexDirection: "row",
        marginHorizontal: ScreenUtil.scaleSizeW(10),
        justifyContent: "center",
        alignItems: "center",
        marginTop: ScreenUtil.scaleSizeW(20),
        backgroundColor: "rgba(0,0,0,0.2)",
        paddingHorizontal: ScreenUtil.scaleSizeW(20),
        borderTopLeftRadius: ScreenUtil.scaleSizeW(10),
        borderTopRightRadius: ScreenUtil.scaleSizeW(10),
        borderBottomWidth: 0.5, borderColor: "rgba(0,0,0,0.3)"
    },
    schoolItem: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(85),
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor: "rgba(0,0,0,0.2)",
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        alignItems: "center",
        paddingRight: ScreenUtil.scaleSizeW(20),
        paddingLeft: ScreenUtil.scaleSizeW(42),
        marginHorizontal: ScreenUtil.scaleSizeW(10)
    },
    schoolItemLast: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(85),
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        paddingRight: ScreenUtil.scaleSizeW(20),
        paddingLeft: ScreenUtil.scaleSizeW(42),
        marginHorizontal: ScreenUtil.scaleSizeW(10),
        borderBottomRightRadius: ScreenUtil.scaleSizeW(10),
        borderBottomLeftRadius: ScreenUtil.scaleSizeW(10),
    },
    foldTitleNoC: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(88),
        flexDirection: "row",
        marginHorizontal: ScreenUtil.scaleSizeW(10),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
        marginTop: ScreenUtil.scaleSizeW(16),
        borderRadius: ScreenUtil.scaleSizeW(10),
        paddingLeft: ScreenUtil.scaleSizeW(20),
        paddingRight: ScreenUtil.scaleSizeW(25)
    },
    foldTitle: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(88),
        flexDirection: "row",
        marginHorizontal: ScreenUtil.scaleSizeW(10),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
        marginTop: ScreenUtil.scaleSizeW(16),
        borderTopLeftRadius: ScreenUtil.scaleSizeW(10),
        borderTopRightRadius: ScreenUtil.scaleSizeW(10),
        borderBottomWidth: 0.5,
        borderColor: "rgba(0,0,0,0.3)",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        paddingRight: ScreenUtil.scaleSizeW(25)
    },
    oneHang: {
        position: 'absolute',
        left: 0,
        bottom: Platform.OS === 'android' ? -1 : 0,
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(88),
        borderTopRightRadius: ScreenUtil.scaleSizeW(10),
        borderTopLeftRadius: ScreenUtil.scaleSizeW(10),
        backgroundColor: "white",
        justifyContent: "center",
        paddingHorizontal:ScreenUtil.scaleSizeW(20),
        alignItems: "center",
        flexDirection:"row",
    },
    historyTag: {
        width: ScreenUtil.scaleSizeW(185),
        height: ScreenUtil.scaleSizeW(48),
        marginLeft: ScreenUtil.scaleSizeW(30),
        borderWidth: ScreenUtil.scaleSizeW(1),
        borderColor: "#FF9933",
        borderRadius: ScreenUtil.scaleSizeW(5),
        paddingLeft: ScreenUtil.scaleSizeW(20),
        paddingRight: ScreenUtil.scaleSizeW(8),
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
});
