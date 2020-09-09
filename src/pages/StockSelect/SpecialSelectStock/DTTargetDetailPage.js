/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/6 17
 * description:
 */
import React from 'react';
import {
    ActivityIndicator, Animated,
    Easing,
    Image,
    PixelRatio,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { StickyForm } from "react-native-largelist-v3";
import LinearGradient from 'react-native-linear-gradient';
import RequestInterface from "../../../actions/RequestInterface";
import ExpandableText from "../../../components/ExpandableText";
//import { mNormalFooter } from "../../../components/mNormalFooter";
import { mRiskTipsFooter } from "../../../components/mRiskTipsFooter";
import StockFormatText from '../../../components/StockFormatText';
//import * as baseStyle from "../../../components/baseStyle";
import ShareSetting from "../../../modules/ShareSetting";
import BaseComponentPage from "../../../pages/BaseComponentPage";
import QuotationListener from "../../../utils/QuotationListener";
import * as ScreenUtil from '../../../utils/ScreenUtil';
import Yd_cloud from "../../../wilddog/Yd_cloud";
import HitsApi from "../../Hits/Api/HitsApi";
import TargetHistoryPage from "./TargetHistoryPage";

let refHXG = Yd_cloud().ref(MainPathYG);
import * as BuriedpointUtils from "../../../utils/BuriedpointUtils"
import * as baseStyle from "../../../components/baseStyle";
import {mNormalHeader} from "../../../components/mNormalHeader";
import TopButton from "../../../components/TopButton";
import RefreshButton from "../../../components/RefreshButton";
import {toast} from "../../../utils/CommonUtils";
//import {commonUtil} from "../../../utils/CommonUtils";
//import RATE from "../../../utils/fontRate";


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
                { conName: "涨跌幅", conCode: -1 },
                { conName: "现价", conCode: -1 },
                { conName: "成交量", conCode: -1 },
                { conName: "量比", conCode: -1 },
                { conName: "换手率", conCode: -1 },
                { conName: "总市值", conCode: -1 }
            ],
            allDatas:[],//所有数据，因为现在产品需求，需要加载完500条数据以后，实现本地加载更多，为了解决服务器后台列表排序更新时，前端不受影响
            detailDescribe: this.props.navigation.state.params.intro ? this.props.navigation.state.params.intro : "",//详情描述,
            // detailDescribe:"价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性," +
            // "价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性," +
            // "价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性," +
            // "价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性",//详情描述,
            allLoaded: false,//是否还有加载更多数据，此列表只加载20条,//合规版本改为有分页加载了

            growthSchool: [],//成长学堂的数据

            rangeSc: [{ tabName: "沪深A股", tabIndex: 0 }],//选股范围数据 {tabName: "上证A股", tabIndex: 1}
            //specialSc:[],//叠加指标数据
            // valueSc:[],//叠加战法

            haveSt: "否",//是否包含ST股,默认否
            refreshDate: "",//最新刷新时间

            selected:false,//是否选中资金top筛选
            showRefresh:false,//是否显示股池已经更新的button
            stockListNumber:0,//当前筛选条件下股池的数量

            animatedValue: new Animated.Value(0),//左右滑动初试值

        };

        //全局页面背景色
        switch (this.state.from) {
            case "多头启动":
            case "放量上攻":
            case "趋势共振":
                this.allBgColor = ["#FF6699", "#FF3333"];
                break;
            case "震荡突破":
            case "探底回升":
                this.allBgColor = ["#CC66FF", "#B726FF"];
                break;
            case "趋势反转":
            case "背离反弹":
                this.allBgColor = ["#6699FF", "#266EFF"];
                break;
            default:
                this.allBgColor = ["#6699FF", "#266EFF"];
                break;
        }
        this.firstEnter = true;
        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(100);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        //this.FOOTTER_HEIGHT = 50;
        //this.addMoreDatas = this.addMoreDatas.bind(this);//

        this.addQuotationList = [];//记录当前需要监听的数组
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

        this.isOpen = true;//右下角图标默认的展开状态

        //测试动画从左到右
        this.animatedLtoR = Animated.timing(
            this.state.animatedValue,
            {
                toValue: 1,
                duration: 400,
                easing: Easing.in,
                useNativeDriver: true, // <-- 加上这一行
            }
        );
        //测试动画从左到右
        this.animatedRtoL = Animated.timing(
            this.state.animatedValue,
            {
                toValue: 0,
                duration: 400,
                easing: Easing.in,
                useNativeDriver: true, // <-- 加上这一行
            }
        );
    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {
        this.getSchoolDatas();
        this.getDetailsDatas(() => {
            this.getFirstStock(() => {
                //去注册监听，暂时注释
                this.setListenter();
            });
        });



        this.addListeners();
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
                 //console.log("每次获取到的数据获取到第一次的基础数据",stockObj)
                // console.log(stockObj);
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
                        data: this.state.data
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
                this.getFirstStock(() => {
                    if (this.addQuotationList && this.addQuotationList.length > 0) {
                        //如果有数据,先去解注册
                        QuotationListener.offListeners(this.addQuotationList, () => { });
                        this.addQuotationList = [];
                    }
                    //去注册监听，暂时注释
                    this.setListenter();
                });
                // alert('willFocus');
                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.tesezhibiaoxuanguxiangqing);
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this.pageFocus = false;
                if (this.addQuotationList && this.addQuotationList.length > 0) {
                    //如果有数据,先去解注册
                    QuotationListener.offListeners(this.addQuotationList, () => { });
                    this.addQuotationList = [];
                }
            }
        );
        //监听独有的列表刷新节点，判断列表排序是否有更新，节点更新表示排序有更新
        refHXG.ref('DingJu/TeSeZhiBiaoXuanGuUpdateTime').on('value',(response) => {
             // console.log("排序节点刷新问题");
             // console.log(response);
            if (response.code == 0) {
                this.setState({showRefresh:true})
            }
        })

    }

    /**
     * 设置行情监听
     * */
    setListenter() {
        //情况行情监听的股票数组
        this.addQuotationList = [];
        //第一次请求后直接监听,当前列表最多20条直接全部监听
        if (this.state.data[0].items.length > 0) {
            for (let i = this.startIndex; i < (this.startIndex+this.addNumbers); i++) {
                if (this.state.data[0].items[i] && this.state.data[0].items[i].title.secCode && this.state.data[0].items[i].title.secCode != '--') {
                    this.addQuotationList.push(this.state.data[0].items[i].title.secCode)
                }
            }
        }
        if (this.addQuotationList.length > 0) {
            //console.log("监听的数组",this.addQuotationList)
            QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                //console.log("股票行情",stockObj)
                //设置行情数据
                this.setQuotation(stockObj);
            })
        }
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
    getDetailsDatas(callback) {
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
        //如果pageNumber 是25的整数倍，表示是上拉加载调用的这个方法，并且没有最新数据更新，所以之前的数据不清空
        if(this.pageNumber % 25 !== 0){
            this.state.data[0].items = [];
            this.state.allDatas = [];
            //页码
            params.pageNo = this.pageNumber;
        }else {
            //页码
            params.pageNo = this.pageNumber/25;
        }

        //排序字段
        if(this.state.selected===false){
            params.queryType = 2;
            //一次请求500条
            params.pageSize = 500;
        }else {
            params.queryType = 1;
            params.pageSize = 10;
        }

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.SPECIAL_DETAILS_LIST, params,
            (response) => {
                //console.log("请求成功",response)
                //只要请求成功 firstEnter设置为false,防止第一次进入，空布局闪动问题
                this.firstEnter = false;
                //设置最新刷新时间
                let currentDateS = ShareSetting.getDate(Date.parse(new Date()), 'yyyy-MM-dd HH:mm');
                //如果是500数据的整数，结束刷新
                if(this.pageNumber % 25 === 0){
                    this._list && this._list.endLoading();
                }
                let thisNumbers = response.total && response.total!= null ? response.total: 0;
                response = response.list;
                //response = [];
                if (response && response.length > 0) {

                    for (let i = 0; i < response.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        let titles = {};
                        //获取title数据
                        titles.secName = response[i].secName;
                        titles.secCode = response[i].marketCode;
                        newItem.title = titles;

                        //数据项，一定要按照数据添加
                        let dataItem = [];
                        dataItem.push(response[i].upDown != null ? response[i].upDown / 100 : '--');//涨跌幅
                        dataItem.push(response[i].presentPrice != null ? response[i].presentPrice : '--');//现价
                        dataItem.push(response[i].volume != null ? response[i].volume / 100 : '--');//成交量
                        dataItem.push(response[i].volumeRatio != null ? response[i].volumeRatio : '--');//量比
                        dataItem.push(response[i].turnoverRate != null ? response[i].turnoverRate : '--');//换手率
                        dataItem.push(response[i].totalMarketValue != 0 ? response[i].totalMarketValue : '--');//总市值

                        //现在都给默认数据
                        // dataItem.push('--');//涨跌幅
                        // dataItem.push('--');//现价
                        // dataItem.push('--');//成交量
                        // dataItem.push('--');//量比
                        // dataItem.push('--');//换手率
                        // dataItem.push('--');//总市值

                        newItem.data = dataItem;
                        //this.state.data[0].items.push(newItem);

                        this.state.allDatas.push(newItem)

                    }
                    //假数据

                    // for(let i = 0 ;i<100;i++){
                    //     let newItem = {};
                    //     //储存第一列需要的数据
                    //     let titles = {};
                    //     //获取title数据
                    //     titles.secName = "股票名称";
                    //     titles.secCode = this.state.allDatas.length;
                    //     newItem.title = titles;
                    //
                    //     //数据项，一定要按照数据添加
                    //     let dataItem = [];
                    //     dataItem.push('--');//涨跌幅
                    //     dataItem.push('--');//现价
                    //     dataItem.push('--');//成交量
                    //     dataItem.push('--');//量比
                    //     dataItem.push('--');//换手率
                    //     dataItem.push('--');//总市值
                    //
                    //     //现在都给默认数据
                    //     // dataItem.push('--');//涨跌幅
                    //     // dataItem.push('--');//现价
                    //     // dataItem.push('--');//成交量
                    //     // dataItem.push('--');//量比
                    //     // dataItem.push('--');//换手率
                    //     // dataItem.push('--');//总市值
                    //
                    //     newItem.data = dataItem;
                    //     //this.state.data[0].items.push(newItem);
                    //
                    //     this.state.allDatas.push(newItem)
                    // }

                    //下面是设置每页的数据
                    //20 = pageNumber*pageSize
                    //分情况，要是是500条数据的上拉加载的时候
                    let myAlloaded = false;
                    if(this.pageNumber % 25 === 0){
                        if(this.state.allDatas.length - (this.pageNumber * 20) < 20){
                            myAlloaded = true
                        }
                        for (let i= 0;i < (this.state.allDatas.length - (this.pageNumber * 20)  < 20 ? this.state.allDatas.length - (this.pageNumber * 20) :20) ;i++){
                            this.state.data[0].items.push(this.state.allDatas[i]);
                        }
                        this.pageNumber ++ ;
                    }else {
                        if(this.state.allDatas.length < 20){
                            myAlloaded = true
                        }
                        for (let i= 0;i < (this.state.allDatas.length < 20 ? this.state.allDatas.length:20) ;i++){
                            this.state.data[0].items.push(this.state.allDatas[i]);
                        }
                    }
                    this.setState({
                        data: this.state.data,
                      //  allLoaded: response.length < 20 ? true : false,
                        showRefresh:this.state.showRefresh,
                        allLoaded: myAlloaded,
                        refreshDate: currentDateS,
                        stockListNumber:thisNumbers,
                    }, () => {
                        if (callback) {
                            callback()
                        }
                    });
                } else {
                    this.setState({
                        data: this.state.data,
                        showRefresh:this.state.showRefresh,
                        allLoaded: true,
                        refreshDate: currentDateS,
                        stockListNumber:thisNumbers,
                    }, () => {
                        if (callback) {
                            callback()
                        }
                    });
                }
            },
            (error) => {
                this.firstEnter = false;
                //设置最新刷新时间
                let currentDateS = ShareSetting.getDate(Date.parse(new Date()), 'yyyy-MM-dd HH:mm');
                this.setState({
                    data: this.state.data,
                    showRefresh:this.state.showRefresh,
                    allLoaded: true,
                    refreshDate: currentDateS,
                    stockListNumber:0,
                }, () => {
                    if (callback) {
                        callback()
                    }
                });
            })
    }

    //测试加载更多的假数据
    getLoadingDatas(){
        //如果加载的时候,此时是第25页，500条数据，50页，1000条数据，75页，1500条数据，100页，2000条数据，125页2500条数据等等
        //这些页数上拉的时候，需要先判断股票列表是否有更新，有更新的话，就直接回到顶部更新最新数据，不用加载更多，要是列表没有更新，就加载下一页
        if(this.pageNumber %25 === 0){
            //数据没有更新
            if(this.state.showRefresh === false){

                this.getDetailsDatas()
            }else {
                //数据有更新
                this._list && this._list.endLoading();
                this.pageNumber = 1;
                this.startIndex = 0;
                //先改变showRefresh的值，在请求到最新数据后，顺便刷新界面，少刷新一次
                this.state.showRefresh = false;
                this._list && this._list.scrollTo({x:0,y:0}).then(()=>{
                    //console.log("回到顶部回调")
                    //回到顶部然后执行刷新数据的操作
                    //this.getSchoolDatas();
                    this.getDetailsDatas(() => {
                        this.getFirstStock(() => {
                            //去注册监听，暂时注释
                            this.setListenter();
                        });
                    });
                });
            }
        }else {
            this.getLoadingDatasMore();
        }
    }
    /**
     * 将本地加载的方法提取出来
     * */
    getLoadingDatasMore(){
        let myAlloaded = false;
        if(this.state.allDatas.length - (this.pageNumber*20) >= 20){
            myAlloaded = false;
        }else {
            myAlloaded = true;
        }

        for (let i = 0 ; i < ((this.state.allDatas.length - (this.pageNumber*20) >= 20) ? 20:this.state.allDatas.length - (this.pageNumber*20)); i++) {
            this.state.data[0].items.push(this.state.allDatas[i+this.pageNumber*20]);
        }
        this.setState({
            data: this.state.data,
            allLoaded: myAlloaded ,
            //refreshDate: currentDateS
        }, () => {
            // if (callback) {
            //     callback()
            // }
            this.pageNumber++;
            this._list.endLoading();
        });
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
        const scalX = this.state.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100]
        });
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

                {/*这里为什么要分开写，是因为数组数据为0的时候，渲染了renderFooter的时候renderHeader的布局就不显示了，这算是一个bug,
                所以被逼无奈,当数据等于0时，StickyForm不能有renderFooter的方法，所以分开写两个一样的视图，只有是否有renderFooter方法的区别*/}
                {(this.state.data[0].items && this.state.data[0].items.length >0) ?

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
                            this.pageNumber = 1;
                            this.startIndex = 0;
                            this.getSchoolDatas();
                            this.getDetailsDatas(() => {
                                this.getFirstStock(() => {
                                    //去注册监听，暂时注释
                                    this.setListenter();
                                    this._list && this._list.endRefresh();
                                });
                            });
                        }}
                        onLoading={() => { this.getLoadingDatas(); }}
                        renderEmpty={this.renderEmptys}
                        allLoaded={this.state.allLoaded}
                        directionalLockEnabled={true}
                        headerStickyEnabled={false}
                        refreshHeader={mNormalHeader}
                        loadingFooter={mRiskTipsFooter}
                        //loadingFooter={mNormalFooter}
                        onMomentumScrollEnd={()=>{
                            //是否需要弹出活动图标,要是2秒内再监听
                            this.isAddNowListener();
                            //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                            this.isNowShowView();
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
                                    //是否需要弹出活动图标,要是2秒内再监听
                                    this.isAddNowListener();
                                    //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                                    this.isNowShowView();
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
                                //console.log("解除监听")
                                this.cancleAddListener();
                            }

                            if(y>=10){
                                if(this.isOpen){
                                    this.isOpen = false;
                                    this.retract();
                                }
                            }

                        }}
                    />
                    :
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
                        renderSection={this._renderSection}
                        heightForIndexPath={() => this.ITEM_HEGHT}
                        renderIndexPath={this._renderItem}
                        showsHorizontalScrollIndicator={false}
                        onRefresh={() => {
                            this.pageNumber = 1;
                            this.startIndex = 0;
                            this.getSchoolDatas();
                            this.getDetailsDatas(() => {
                                this.getFirstStock(() => {
                                    //去注册监听，暂时注释
                                    this.setListenter();
                                    this._list && this._list.endRefresh();
                                });
                            });
                        }}
                        onLoading={() => { this.getLoadingDatas(); }}
                        renderEmpty={this.renderEmptys}
                        allLoaded={this.state.allLoaded}
                        directionalLockEnabled={true}
                        headerStickyEnabled={false}
                        refreshHeader={mNormalHeader}
                        loadingFooter={mRiskTipsFooter}
                        //loadingFooter={mNormalFooter}
                        onMomentumScrollEnd={()=>{
                            //是否需要弹出活动图标,要是2秒内再监听
                            this.isAddNowListener();
                            //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                            this.isNowShowView();
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
                                    //是否需要弹出活动图标,要是2秒内再监听
                                    this.isAddNowListener();
                                    //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                                    this.isNowShowView();
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
                                this.leftArrow &&  this.leftArrow.setNativeProps({
                                    style: { opacity: 1 }
                                });
                            }else {
                                this.leftArrow &&  this.leftArrow.setNativeProps({
                                    style: { opacity: 0 }
                                });
                            }

                            if(this.isStartAddListener===0){
                                this.isStartAddListener = 1;
                                //console.log("解除监听")
                                this.cancleAddListener();
                            }

                            if(y>=10){
                                if(this.isOpen){
                                    this.isOpen = false;
                                    this.retract();
                                }
                            }

                        }}
                    />

                }

                {
                    this.state.showRefresh ===false ? null :
                        <RefreshButton style={{top:(ScreenUtil.statusH + (Platform.OS === "ios" ? 52 : ScreenUtil.scaleSizeW(106))) ,left:0}}  onPress = {() => {this.pressRefresh()}}/>
                }

                {ScreenUtil.duoTouQiDongStatus == 2 ?
                    <View style={{position:'absolute',
                        width:ScreenUtil.scaleSizeW(608),
                        //marginLeft:ScreenUtil.screenW-90,
                        bottom:20,
                        right:-ScreenUtil.scaleSizeW(294),
                        flexDirection:"row"
                    }}>
                        <Animated.View
                            style={[{
                                width:ScreenUtil.scaleSizeW(314),
                                height:ScreenUtil.scaleSizeW(138),
                                //marginLeft:scalX,
                                //position:'absolute',
                            },
                                {
                                    transform: [
                                        { translateX: scalX },
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity onPress={()=>{this.gotoActivity()}} style={{width:ScreenUtil.scaleSizeW(314),height:ScreenUtil.scaleSizeW(138),justifyContent:"center",alignItems:"center"}}>
                                <Image style={{width:ScreenUtil.scaleSizeW(314),height:ScreenUtil.scaleSizeW(138),resizeMode:"stretch"}}
                                       source={require('../../../images/hits/activityLogo.png')}/>
                            </TouchableOpacity>
                        </Animated.View>

                    </View>
                    :
                    null
                }

            </View>
        )
    }

    /**
     * 跳转去活动页面
     * */
    gotoActivity(){
        //插入一条页面埋点统计记录
        //BuriedpointUtils.setTuoKeClickItemByName(BuriedpointUtils.PageMatchID.fenxiangxuanfudianji);
        if(ScreenUtil.duoTouQiDongStatus == 1){
            toast('活动未开始')
        }else if(ScreenUtil.duoTouQiDongStatus == 3){
            toast('活动已结束')
            //然后刷新页面，隐藏活动入口
            this.setState({})
        }else {
            //跳转去活动页面
            Navigation.pushForParams(this.props.navigation, 'DuoTouQiDongPage');
        }
    }

    /**
     * 右下角展开动画
     * */
    openView(){
        this.animatedLtoR.stop();

        this.animatedRtoL.start(()=>{
            this.isOpen = true;
        });
    }
    /**
     * 右下角收起动画
     * */
    retract(){
        this.animatedRtoL.stop();
        this.animatedLtoR.start();
    }
    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        if(this.state.allLoaded === false){
            return <View><View></View></View>;
        }else {
            return(
                <View>
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(274), backgroundColor: "#f3f0f3", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>风险提示：</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>本产品基于公司的数据和算法生成，作为辅助投资决策工具，</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>不构成投资建议，盈亏自负。</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>产品信息仅供参考，投资有风险，入市需谨慎。</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>联系我们：0311-66856698</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>投诉电话：0311-87100515</Text>
                    </View>
                </View>
            )
        }
    }

    /**
     * 解除监听
     * */
    cancleAddListener(){
        if (this.addQuotationList && this.addQuotationList.length > 0) {
            //如果有数据,先去解注册
            QuotationListener.offListeners(this.addQuotationList, () => { });
            this.addQuotationList = [];
        }
    }
    /**
     * 点击刷新股池的方法
     * */
    pressRefresh(){
        this.pageNumber = 1;
        this.startIndex = 0;
        //需要先直接刷新按钮的显示隐藏，避免网络请求的时候还在重复点击
        this.setState({
            showRefresh:false
        },()=>{
            this.cancleAddListener();
            if(this.state.data[0].items.length > 0){
                this._list && this._list.scrollTo({x:0,y:0}).then(()=>{
                    //console.log("回到顶部回调")
                    //回到顶部然后执行刷新数据的操作
                    //this.getSchoolDatas();
                    this.getDetailsDatas(() => {
                        this.getFirstStock(() => {
                            //去注册监听，暂时注释
                            this.setListenter();
                            this._list && this._list.endRefresh();
                        });
                    });
                });
            }else {
                this.getDetailsDatas(() => {
                    if(this.state.data[0].items.length > 0){
                        this._list && this._list.scrollTo({x:0,y:0}).then(()=>{
                            this.getFirstStock(() => {
                                //去注册监听，暂时注释
                                this.setListenter();
                            });
                        });
                    }
                });
            }
        });
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
                        //console.log("注册监听起始Index数据",0)
                        this.getFirstStock(() => {
                            //去注册监听，暂时注释
                            this.setListenter();
                        });
                    }else {
                        let index =  Math.floor((this.mScollY - (Platform.OS==='ios' ? this.hearderHeight:(this.hearderHeight)/PixelRatio.get()))/this.ITEM_HEGHT);
                        this.startIndex = index;
                        //console.log("2注册监听起始Index数据",index)
                        this.getFirstStock(() => {
                            //去注册监听，暂时注释
                            this.setListenter();
                        });
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
     * 判断是否需要弹出弹窗
     * */
    isNowShowView(){
        if( this.isOpen ===false){
            setTimeout(()=>{
                if(new Date().getTime() - this.touchTemp>=1500){
                    this.openView();
                    return;
                }else {
                    this.isNowShowView();
                    return;
                }
            },1500);
        }
    }

    /**
     * 加载更多数据
     * 这里没有更多数据，最多20条
     * */
    // addMoreDatas() {
    //     this._list.endLoading();
    //     this.setState({
    //         allLoaded: true
    //     });
    // }

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
                                    // specialSc:this.state.specialSc,
                                    // valueSc:this.state.valueSc,
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
                            <View>
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#000" }}>{"入选股票(" + this.state.stockListNumber + "只)"}</Text>
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)" }}>{this.state.refreshDate === "" ? this.state.refreshDate : this.state.refreshDate + "更新"}</Text>
                            </View>
                            <View style={{flex:1}}/>

                            <TopButton selected={this.state.selected} onPress = {(selected) => {this.getTopTenDatas(selected)}}/>

                        </View>
                    </LinearGradient>
                </View>
            </View>
        );
    };
    getTopTenDatas(selected){
        this.pageNumber = 1;
        this.setState({
            selected:selected,
            showRefresh:false,
        },()=>{
            if (this.addQuotationList && this.addQuotationList.length > 0) {
                //如果有数据,先去解注册
                QuotationListener.offListeners(this.addQuotationList, () => {});
                this.addQuotationList = [];
            }
            //去请求新的数据
            this.getDetailsDatas(() => {
                this.getFirstStock(() => {
                    //去注册监听，暂时注释
                    this.setListenter();
                });
            });

        })
    }

    // <TopButton onPress = {(selected) => {}}/>
    //this._topPress(selected)
    // <View style={styles.intervalLine}/>
    /**
     * 回调了筛选条件以后
     * */
    selectScreen(rang, special, value, haveSt) {

        this.pageNumber =1;
        this.setState({
            rangeSc: rang,
            // specialSc:special,
            //  valueSc:value,
            haveSt: haveSt
        }, () => {
            if (this.addQuotationList && this.addQuotationList.length > 0) {
                //如果有数据,先去解注册
                QuotationListener.offListeners(this.addQuotationList, () => { });
                this.addQuotationList = [];
            }
            this.getDetailsDatas(() => {
                this.getFirstStock(() => {
                    //去注册监听，暂时注释
                    this.setListenter();
                });
            });
            //console.log("现在的HaveST=",this.state.haveSt)
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
        // if(this.state.specialSc && this.state.specialSc.length>0){
        //     screenView = true;
        // }
        // if(this.state.valueSc && this.state.valueSc.length>0){
        //     screenView = true;
        // }
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
                // console.log(this.state.rangeSc[i].tabName)
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

        // if(this.state.specialSc && this.state.specialSc.length>0){
        //     for (let i = 0;i<this.state.specialSc.length;i++ ){
        //         screenView.push(
        //             <View style={styles.selectView}>
        //                 <Text style={styles.selectText}>{this.state.specialSc[i].tabName}</Text>
        //             </View>
        //         )
        //     }
        // }
        // if(this.state.valueSc && this.state.valueSc.length>0){
        //     for (let i = 0;i<this.state.valueSc.length;i++ ){
        //         screenView.push(
        //             <View style={styles.selectView}>
        //                 <Text style={styles.selectText}>{this.state.valueSc[i].tabName}</Text>
        //             </View>
        //         )
        //     }
        // }


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
                if (i === this.state.growthSchool.length - 1) {
                    Views.push(
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            let path = MainPathYG + 'ZhiBiaoXueTang/' + this.state.keyWord + '/' + this.state.growthSchool[i].key;
                            let optionParams = { path: path, star: this.state.growthSchool[i].content.star, taoxiName: this.state.growthSchool[i].content.setsystem };
                            Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                                key: this.state.growthSchool[i].key,
                                type: 'IndexStudy',
                                ...optionParams
                            });
                        }} style={styles.schoolItemLast}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)" }}>{this.state.growthSchool[i].content.title + ""}</Text>
                            <View style={{ flex: 1 }} />
                            <Image style={{ width: ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(30), resizeMode: "contain" }}
                                source={require('../../../images/hits/videos_img.png')} />
                        </TouchableOpacity>
                    )
                } else {
                    Views.push(
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            let path = MainPathYG + 'ZhiBiaoXueTang/' + this.state.keyWord + '/' + this.state.growthSchool[i].key;
                            let optionParams = { path: path, star: this.state.growthSchool[i].content.star, taoxiName: this.state.growthSchool[i].content.setsystem };
                            Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                                key: this.state.growthSchool[i].key,
                                type: 'IndexStudy',
                                ...optionParams
                            });
                        }} style={styles.schoolItem}>
                            <View style={styles.schoolItemInner}>
                                <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)" }}>{this.state.growthSchool[i].content.title + ""}</Text>
                                <View style={{ flex: 1 }} />
                                <Image style={{ width: ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(30), resizeMode: "contain" }}
                                    source={require('../../../images/hits/videos_img.png')} />
                            </View>

                        </TouchableOpacity>
                    )
                }
            }
        } else {
            Views = null;
        }
        return Views;

    }
    /**
     * 绘制空视图
     * <ActivityIndicator color={"gray"}/>
     * backgroundColor: "#f2faff"
     * */
    renderEmptys = () => {
        let rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180)-4);
        if (this.firstEnter === true) {
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
                        <View style={[styles.fixTitleOne, { height: this.HEADER_HEGHT }]}>
                            <Image source={require('../../../images/hits/section_bg.png')} style={{flex:1, width: ScreenUtil.scaleSizeW(180),height: this.HEADER_HEGHT,position: "absolute", top:0,left:0,resizeMode:"stretch"}}/>
                            <Text style={styles.hinnerText}>股票名称</Text>
                            <Image
                                ref={ref => this.leftArrow = ref}
                                source={require('../../../images/hits/left_arrow.png')}
                                style={{width:5,height:10,position: "absolute", top:14,right:-rights}}/>
                        </View>
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
                    <View style={{
                        height: this.HEADER_HEGHT, position: "absolute", flexDirection: "row",
                        top: 0, left: ScreenUtil.scaleSizeW(180), width: ScreenUtil.screenW * 1.65 - ScreenUtil.scaleSizeW(180)
                    }}>
                        {this.state.titles.map((title, index) =>
                            <TouchableOpacity activeOpacity={1} onPress={() => { this.sortViewPress(index, title.conCode) }} style={index === 2 ? styles.headerFixText : styles.headerText} key={index}>
                                <Text style={styles.hinnerText}>
                                    {title.conName}
                                </Text>
                                {this.getSortView(title.conCode)}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        }
    };

    /**
     * SectionTitle
     *
     * */
    _renderSection = (section: number) => {
        let rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180)-4);
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row",backgroundColor:"#f2faff"}}>
                <View style={[styles.fixTitleOne, {}]}>
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
        if (this.state.titles[index].conCode !== -1) {
            if (conCode === 0) {
                this.state.titles[index].conCode = 1;
            } else if (conCode === 1) {
                this.state.titles[index].conCode = 2;
            } else if (conCode === 2) {
                this.state.titles[index].conCode = 1;
            }
            this.setState({
                titles: this.state.titles,
            }, () => {
                //重置存储值

            });
        }
    }

    /**
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        //console.log(item)
        if(item===undefined){
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
                <View style={[styles.fixTitleOne, { }]}>
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
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this.cancleAddListener();

    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: baseStyle.isIPhoneX ? 34 : 0
    },
    intervalLine: {
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(20),
        backgroundColor: "#f1f1f1"
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
    chart: {
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(320),
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
    titleText: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
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
        width: ScreenUtil.scaleSizeW(180)
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
        alignItems: "center",
        paddingRight: ScreenUtil.scaleSizeW(20),
        paddingLeft: ScreenUtil.scaleSizeW(42),
        marginHorizontal: ScreenUtil.scaleSizeW(10)
    },
    schoolItemInner: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(57),
        height: ScreenUtil.scaleSizeW(85),
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingRight: ScreenUtil.scaleSizeW(10),
        paddingLeft: ScreenUtil.scaleSizeW(10),
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.3)',
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
    }
});
