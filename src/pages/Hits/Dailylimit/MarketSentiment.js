/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description:涨停炸板市场情绪tab
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    DeviceEventEmitter,
    PixelRatio,
    ActivityIndicator
} from 'react-native';
import * as ScreenUtil from "../../../utils/ScreenUtil";
//import FlowLayout from '../../../components/FlowLayout';

import ModalDropdown from '../../../components/ModalDropdown.js';
import Yd_cloud from "../../../wilddog/Yd_cloud";
import AsyncStorage from '@react-native-community/async-storage';

import Picker from 'react-native-picker';
import { StickyForm } from "react-native-largelist-v3";
import { mNormalHeader } from "../../../components/mNormalHeader";
import LinearGradient from 'react-native-linear-gradient';
import FlowLayoutDouble from "../../../components/FlowLayoutDouble";
import StockFormatText from '../../../components/StockFormatText';
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../../components/SensorsDataTool";
import Modal from 'react-native-translucent-modal';
import { mRiskTipsFooter } from "../../../components/mRiskTipsFooter";

let refHXG = Yd_cloud().ref(MainPathYG);

export default class MarketSentiment extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            flowDatas: ["涨停", "炸板"],
            selectIndustry: 0,//默认选择的位置为0,通过位置取name和code，

            todayNature: 0,//今日涨停家数,自然数
            todayOne: 0,//今日涨停家数,一字数
            todayBurst: 0,//今日涨停家数,炸版数
            yesterSuccess: "",//昨日打版成功率
            yesterrofitP: "",//昨日打版盈利率


            allDaySHow: [],//需要展示的所有的数据
            selectDatas: ["", "", ""],//选择的日期,格式:["2019","08","26"]
            selectYesTerData: ["", "", ""],//选择日期的昨天，昨日日期格式:["2019","08","23"]
            //selectYesTerData是昨日打版的数据的请求的日期，但是这个日期不是交易日前一天的意思,是昨天收盘时的数据在今天开盘这个时刻的数据，
            //意思就是今天不是交易日，昨日打版就是显示最近一个交易日的数据，今天是交易日，未开盘，节点tracing应该没有这个日期，所以取也是上个交易日的数据
            //今天是交易日,已经开盘，则直接取tracing今天的数据
            newData: ["", "", ""],//最新的交易日期["2019","08","23"]
            newAddData: ["", "", ""],//最新的交易日期["2019","08","23"],监听到的最新的交易日

            tabSelect: 0,//表格前面，涨停炸版tab选择

            todayIsSaleDay: false,//判断今天是否是交易日,默认不是交易日

            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            //title传入一个conCode ,-1表示不需要排序，0表示默认状态，1表示降序，2表示升序
            titles: [
                { conName: "现价", conCode: -1 },
                { conName: "涨跌幅", conCode: -1 },
                { conName: "涨停时间", conCode: 1 },
                { conName: "连板次数", conCode: -1 } //默认涨停
            ],
            titleUp: [
                { conName: "现价", conCode: -1 },
                { conName: "涨跌幅", conCode: -1 },
                { conName: "涨停时间", conCode: 1 },
                { conName: "连板次数", conCode: -1 }
            ], //涨停Title
            titleBrst: [
                { conName: "现价", conCode: -1 },
                { conName: "涨跌幅", conCode: -1 },
                { conName: "炸板时间", conCode: 1 },
                { conName: "连板次数", conCode: -1 }
            ], //炸版Title


            allLoaded: false,//判断是否还有更多数据，true有,false无
            isShow: false,//ios弹窗背景蒙层
        };
        this.renderRowInstryModalDropdown = this.renderRowInstryModalDropdown.bind(this);

        this.isPickerShows = false;//记录picker是否显示

        this.marketName = ["全部", "沪市", "深市", "中小板", "创业板", "科创板"]; //分类行业选择
        this.marketCode = ["all", "sh", "sz", "sme", "gem", "star"];//分类行业选择的code

        this.pageKey = "";//记录的key

        this.pageSize = 20;//默认每次请求60条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(100);
        this.HEADER_HEGHT = ScreenUtil.scaleSizeW(60);//LockView锁定的View的高度
        this.hearderHeight = 0;//给表格原生传入的header高度，防止滑动问题
        this.firstEnter = true;//是否第一次进入

    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {
        this.sensorsAppear('市场情绪', '', '市场情绪', 2);
        this.sensorsAppear('市场情绪', '涨停', '市场情绪', 3);

    }


    sensorsAppear(second_label, third_label, label_name, label_level) {

        sensorsDataClickObject.adLabel.first_label = '涨停炸板';
        sensorsDataClickObject.adLabel.second_label = second_label;
        sensorsDataClickObject.adLabel.third_label = third_label;

        sensorsDataClickObject.adLabel.label_level = label_level;
        sensorsDataClickObject.adLabel.label_name = label_name;

        sensorsDataClickObject.adLabel.module_source = '打榜';
        sensorsDataClickObject.adLabel.page_source = '涨停炸板';

        sensorsDataClickObject.adLabel.is_pay = '免费';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }

    /**
     * 页面加载完成* */
    componentDidMount() {
        //获取近20个交易日日期数据
        this.getCalander();
        //设置一个离开页面和进入页面的监听
        this._addListeners();
    }
    _addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                //判断页面是否是展示在屏幕上的
                AsyncStorage.getItem('main_index', (error, resultMain) => {
                    if (error) {
                    } else {
                        AsyncStorage.getItem('db_child_index', (error, result) => {
                            if (error) {
                            } else {
                                let mainObj = JSON.parse(resultMain);
                                let childObj = JSON.parse(result);
                                if (mainObj && childObj) {
                                    // mainPosition 首页tab  indexPosition 子tab
                                    if (mainObj.mainPosition == 3 && childObj.indexPosition == 0) {
                                        //监听炸版区域的数据
                                        this.refreshDatas();
                                        // this.addBusrt();
                                        // this.addListListener();
                                    }
                                }
                            }
                        })
                    }
                })
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this.offNode();
                this.offListNode();
            }
        );
        /**
         * 注册选股页面tab切换通知，不在当前页面取消监听
         * obj 里面参数0，1，2 当前tab为 0
         * */
        this.dbTabChange = DeviceEventEmitter.addListener('DB_TAB_CHANGE', (obj) => {
            if (obj != 0) {
                this.offNode();
                this.offListNode();
            } else if (obj == 0) {
                this.refreshDatas();
                //监听炸版区域的数据
                // this.addBusrt();
                // this.addListListener();
            }
        });

        /**
         * 注册APPMAINtab切换通知，
         * obj 里面参数0，1，2 ,3当前tab为 4选股
         * */
        this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
            if (obj != 3) {
                this.offNode();
                this.offListNode();
            } else {
                AsyncStorage.getItem('db_child_index', (error, result) => {
                    if (error) {

                    } else {
                        let childObj = JSON.parse(result);
                        if (childObj && childObj.indexPosition === 0) {
                            //如果切换页面回来，childtabIndex为涨停炸版，则刷新页面
                            this.refreshDatas();
                        }
                    }
                })

            }
        });
    }
    /**
     * 测试监听
     * */
    myAddListener() {
        // setTimeout(() => {
        // }, 3000);
        let number = 0;
        let todayUpNow = refHXG.ref('ztzb/line');
        //let todayUpNow= Yd_cloud().ref('cem');
        todayUpNow.once('value', (response) => {
            if (number === 0) {
                number++;
                //获取picker的显示状态
                // console.log(getPickerIshow());
                if (response.code == 0) {
                    let stringPath = response.nodePath.split("/");
                    //获得当前交易日的日期
                    let sItem = stringPath[stringPath.length - 2];
                    //let sItem = "20190829";
                    const newCopyDate = this.state.allDaySHow;
                    //newCopyDate ;
                    //加入日历选择器的数据中
                    if (newCopyDate && newCopyDate.length > 0) {
                        let haveEqualYear = false;
                        for (let i = 0; i < newCopyDate.length; i++) {
                            let key = Object.keys(newCopyDate[i]);
                            if ((sItem.substring(0, 4) + "年") === key[0]) {
                                haveEqualYear = true;
                                let haveEqualMonth = false;
                                for (let j = 0; j < newCopyDate[i][key[0]].length; j++) {
                                    let keys = Object.keys(newCopyDate[i][key[0]][j]);
                                    if ((sItem.substring(4, 6) + "月") === keys[0]) {
                                        haveEqualMonth = true;
                                        this.state.allDaySHow[i][key[0]][j][keys[0]].push((sItem.substring(6, 8) + "日"));
                                        break;
                                    }
                                }
                                //若果当前年份下没有匹配的月份,则新建一个月份
                                if (haveEqualMonth === false) {
                                    let newMonth = {};
                                    let newItem = [];
                                    newItem.push(sItem.substring(6, 8) + "日");
                                    newMonth[(sItem.substring(4, 6) + "月")] = newItem;
                                    this.state.allDaySHow[i][key[0]].push(newMonth)
                                }
                                break;
                            }
                        }
                        if (haveEqualYear === false) {
                            let newYear = {};
                            let newYearIn = [];
                            let newMonth = {};
                            let newItem = [];
                            newItem.push(sItem.substring(6, 8) + "日");
                            newMonth[(sItem.substring(4, 6) + "月")] = newItem;
                            newYearIn.push(newMonth);
                            newYear[(sItem.substring(0, 4) + "年")] = newYearIn;
                            this.state.allDaySHow.push(newYear)
                        }
                    }

                    // console.log("新日期");
                    // console.log(this.state.allDaySHow);

                    if (this.state.selectDatas[0] + "" + this.state.selectDatas[1] + this.state.selectDatas[2]
                        === this.state.newData[0] + "" + this.state.newData[1] + this.state.newData[2]) {
                        //如果当前选择的日期是最新的日期,则刷新页面
                        //最新日期改成节点获取的日期,昨天的日期变成保存的最新日期
                        //this.state.selectYesTerData= this.state.newData;
                        this.state.selectYesTerData = [sItem.substring(0, 4), sItem.substring(4, 6), sItem.substring(6, 8)];
                        this.setState({
                            allDaySHow: this.state.allDaySHow,
                            newAddData: [sItem.substring(0, 4), sItem.substring(4, 6), sItem.substring(6, 8)],
                            selectDatas: [sItem.substring(0, 4), sItem.substring(4, 6), sItem.substring(6, 8)],//选择的日期,格式:["2019","08","26"]
                            selectYesTerData: this.state.selectYesTerData,//选择日期的昨天，昨日日期格式:["2019","08","23"]
                            //todayIsSaleDay:true,//是交易日了
                        }, () => {
                            if (this.isPickerShows === true) {
                                this.selectCalander();
                            }
                            //开盘后，昨日打板区域的数据为今天的数据
                            this.getYesterDayData(sItem);
                            //监听炸版区域的数据
                            this.addBusrt();
                            this.addListListener();

                        })
                    } else {
                        //如果当前选择的日期是历史日期日期,不刷新页面,用于正在查看历史数据
                        //只刷新日历的数据
                        this.setState({
                            allDaySHow: this.state.allDaySHow,
                            newAddData: [sItem.substring(0, 4), sItem.substring(4, 6), sItem.substring(6, 8)],
                        }, () => {
                            if (this.isPickerShows === true) {
                                this.selectCalander();
                            }
                        })
                    }
                }
            }
        });
    }
    /**
     * 监听炸版区域的自然一字和炸版数量
     * */
    addBusrt() {
        if (this.state.newAddData[0] + "" === "") {
            return;
        }
        //监听现在涨停的家数
        let nowDate = this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2];
        //请求自然家数
        let datasNow = refHXG.ref('ztzb/line/' + nowDate + "/" + this.marketCode[this.state.selectIndustry]);
        datasNow.on('value', (response) => {
            //console.log("涨停炸版区域数据变化");
            //console.log(response);
            if (response.code == 0 && response.nodeContent) {
                let key = Object.keys(response.nodeContent);
                if (key[0] === "burst") {
                    let keyValue = Object.values(response.nodeContent[key[0]]);
                    this.setState({ todayBurst: keyValue[0] ? keyValue[0] : 0 })

                } else if (key[0] === "up") {
                    let keyValue = Object.values(response.nodeContent[key[0]]);
                    this.setState({ todayNature: keyValue[0] ? keyValue[0] : 0 })

                } else if (key[0] === "nonNaturalUp") {
                    let keyValue = Object.values(response.nodeContent[key[0]]);
                    this.setState({ todayOne: keyValue[0] ? keyValue[0] : 0 })

                }
            }
        });
    }

    addListListener() {
        //监听现在涨停的家数
        let nowDate = this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2];
        let datasListNow = refHXG.ref('ztzb/list/' + nowDate +
            (this.state.tabSelect === 0 ? "/up/" : "/burst/") + this.marketCode[this.state.selectIndustry]);
        datasListNow.on('value', (response) => {
            // console.log("列表数据变化")
            //console.log(response);
            if (response.code == 0 && response.nodeContent) {
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);
                for (let i = 0; i < key.length; i++) {
                    item[i]['key'] = key[i];
                }
                //深拷贝
                let newConsss = JSON.parse(JSON.stringify(this.state.data[0].items));
                //获取一个现在数据的长度，一会用于多余数据的截取
                let numbers = newConsss.length;
                for (let i = 0; i < item.length; i++) {
                    let haveItem = false;
                    for (let j = 0; j < newConsss.length; j++) {
                        if (item[i].stockCode == newConsss[j].title.stockCode) {
                            haveItem = true;
                            //相同股票赋值刷新
                            this.state.data[0].items[j].data[0] = item[i].price ? Number(item[i].price) : "--";
                            this.state.data[0].items[j].data[1] = item[i].incRatio ? Number(item[i].incRatio) / 100 : '--';
                            this.state.data[0].items[j].data[2] = item[i].limitUpTime ? item[i].limitUpTime.substring(0, 10) + "  " + item[i].limitUpTime.substring(11, 16) : '--';
                            this.state.data[0].items[j].data[3] = item[i].limitUpCombat ? item[i].limitUpCombat : '--';

                            this.state.data[0].items[j].sortContent = Date.parse(new Date(item[i].limitUpTime));
                        }
                    }
                    if (haveItem === false) {
                        let newItem = {};
                        //储存第一列需要的数据
                        let titles = {};
                        titles.stockName = item[i].stockName;
                        titles.stockCode = item[i].stockCode;
                        newItem.title = titles;

                        //数据项，一定要按照数据添加
                        let dataItem = [];
                        dataItem.push(item[i].price ? Number(item[i].price) : '--');
                        dataItem.push(item[i].incRatio ? Number(item[i].incRatio) / 100 : '--');
                        dataItem.push(item[i].limitUpTime ? item[i].limitUpTime.substring(0, 10) + " " + item[i].limitUpTime.substring(11, 16) : '--');
                        dataItem.push(item[i].limitUpCombat ? item[i].limitUpCombat : '--');
                        newItem.data = dataItem;

                        //增加一个字段用于排序
                        newItem.sortContent = item[i].limitUpTime ? Date.parse(new Date(item[i].limitUpTime)) : 0;

                        this.state.data[0].items.push(newItem);
                    }
                }
                let newSort;
                //涨停炸版排序默认是index为2
                if (this.state.titles[2].conCode === 1) {
                    newSort = this.state.data[0].items.sort(this.sortNumBigtoSmalls);
                } else if (this.state.titles[2].conCode === 2) {
                    newSort = this.state.data[0].items.sort(this.sortNumSmalltoBigs);
                }
                newSort = newSort.slice(0, numbers);

                this.state.data[0].items = newSort;

                this.setState({
                    data: this.state.data,
                })

            }
        });
    }
    /**
     * 从小到大排序
     * 涨停时间
     * */
    sortNumSmalltoBigs(a, b) {
        return a.sortContent - b.sortContent;
    }

    /**
     * 从大到小排序
     * 涨停时间
     * */
    sortNumBigtoSmalls(a, b) {
        return b.sortContent - a.sortContent;
    }
    /**
     * 获取最新交易日及前20个历史交易日的数据
     *
     * */
    getCalander() {
        let calander = refHXG.ref('openning_calendar_before');
        calander.orderByKey().limitToLast(20).firstLevel().get((response) => {
            if (response.code == 0) {
                //数据转换
                let historyDate = Object.keys(response.nodeContent);
                //交换顺序
                // historyDate.reverse();
                if (historyDate.length > 0) {
                    //如果日历的最后一个日期等于今天
                    if (historyDate[historyDate.length - 1] == this.gettoDayDate()) {
                        // console.log("是否开盘",this.getOpeningQuotation())
                        if (this.getOpeningQuotation() === true) {
                            //如果今天已经开盘
                            let AllDatas = [];//最外层的值
                            //获取所有的年份key的集合
                            let yearKey = {};
                            for (let i = 0; i < historyDate.length; i++) {
                                yearKey[historyDate[i].substring(0, 4)] = "";
                            }
                            let yearkeys = Object.keys(yearKey); //["2019"]
                            //获取对应年份的月份
                            for (let j = 0; j < yearkeys.length; j++) {
                                let yearItem = {};
                                yearItem[yearkeys[j] + "年"] = [];
                                for (let z = 0; z < historyDate.length; z++) {
                                    if (yearkeys[j] == historyDate[z].substring(0, 4)) {
                                        yearItem[yearkeys[j] + "年"].push(historyDate[z].substring(4, 6))
                                    }
                                }
                                //去重
                                let month = Array.from(new Set(yearItem[yearkeys[j] + "年"]));
                                yearItem[yearkeys[j] + "年"] = [];

                                for (let k = 0; k < month.length; k++) {
                                    let monthItem = {};
                                    let monthItemd = [];
                                    for (let y = 0; y < historyDate.length; y++) {
                                        if (yearkeys[j] + month[k] == historyDate[y].substring(0, 6)) {
                                            monthItemd.push(historyDate[y].substring(6, 8) + "日")
                                        }
                                    }
                                    monthItem[month[k] + "月"] = monthItemd;
                                    yearItem[yearkeys[j] + "年"].push(monthItem);
                                }
                                AllDatas.push(yearItem)
                            }
                            //算出默认值
                            this.setState({
                                allDaySHow: AllDatas,
                                //这里selectDatas是默认最后一天
                                selectDatas: [historyDate[historyDate.length - 1].substring(0, 4),
                                historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],
                                selectYesTerData: [historyDate[historyDate.length - 1].substring(0, 4),
                                historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],

                                // 第一次请求时储存一个最新的交易日期，判断注册监听和解注册节点的时候用
                                newData: [historyDate[historyDate.length - 1].substring(0, 4),
                                historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],
                                newAddData: [historyDate[historyDate.length - 1].substring(0, 4),
                                historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],

                                todayIsSaleDay: true,//今天是交易日
                            }, () => {
                                this.getPageDatas(historyDate[historyDate.length - 1]),
                                    //开盘后,昨日打版日期需要取到今天交易日的日期,需求问题
                                    this.getYesterDayData(historyDate[historyDate.length - 1]),
                                    this.getListData();
                                //是交易日,开盘了,就直接监听今天最新日期的数据
                                //监听炸版区域的数据
                                this.addBusrt();
                                this.addListListener();
                            }
                            )

                        } else {
                            //如果还没有开盘,暂时就去掉最后一个最新的日期,暂时上个交易日的数据
                            historyDate = historyDate.slice(0, historyDate.length - 1);

                            let AllDatas = [];//最外层的值
                            //获取所有的年份key的集合
                            let yearKey = {};
                            for (let i = 0; i < historyDate.length; i++) {
                                yearKey[historyDate[i].substring(0, 4)] = "";
                            }
                            let yearkeys = Object.keys(yearKey); //["2019"]
                            //获取对应年份的月份
                            for (let j = 0; j < yearkeys.length; j++) {
                                let yearItem = {};
                                yearItem[yearkeys[j] + "年"] = [];
                                for (let z = 0; z < historyDate.length; z++) {
                                    if (yearkeys[j] == historyDate[z].substring(0, 4)) {
                                        yearItem[yearkeys[j] + "年"].push(historyDate[z].substring(4, 6))
                                    }
                                }
                                //去重
                                let month = Array.from(new Set(yearItem[yearkeys[j] + "年"]));
                                yearItem[yearkeys[j] + "年"] = [];

                                for (let k = 0; k < month.length; k++) {
                                    let monthItem = {};
                                    let monthItemd = [];
                                    for (let y = 0; y < historyDate.length; y++) {
                                        if (yearkeys[j] + month[k] == historyDate[y].substring(0, 6)) {
                                            monthItemd.push(historyDate[y].substring(6, 8) + "日")
                                        }
                                    }
                                    monthItem[month[k] + "月"] = monthItemd;
                                    yearItem[yearkeys[j] + "年"].push(monthItem);
                                }
                                AllDatas.push(yearItem)
                            }
                            //算出默认值
                            this.setState({
                                allDaySHow: AllDatas,
                                //这里selectDatas是默认最后一天
                                selectDatas: [historyDate[historyDate.length - 1].substring(0, 4),
                                historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],
                                selectYesTerData: [historyDate[historyDate.length - 1].substring(0, 4),
                                historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],

                                // 第一次请求时储存一个最新的交易日期，判断注册监听和解注册节点的时候用
                                newData: [historyDate[historyDate.length - 1].substring(0, 4),
                                historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],

                                todayIsSaleDay: true,//今天不是交易日
                            }, () => {
                                this.getPageDatas(historyDate[historyDate.length - 1]),
                                    this.getYesterDayData(historyDate[historyDate.length - 1]),
                                    this.getListData();
                                //是交易日,但是没开盘,就直接监听日期变化推送的节点,进来了新的日期,就刷新日历和监听最新数据
                                this.myAddListener();
                            }
                            )


                        }
                    } else {
                        //如果日历的最后一个日期不等于今天
                        let AllDatas = [];//最外层的值
                        //获取所有的年份key的集合
                        let yearKey = {};
                        for (let i = 0; i < historyDate.length; i++) {
                            yearKey[historyDate[i].substring(0, 4)] = "";
                        }
                        let yearkeys = Object.keys(yearKey); //["2019"]
                        //获取对应年份的月份
                        for (let j = 0; j < yearkeys.length; j++) {
                            let yearItem = {};
                            yearItem[yearkeys[j] + "年"] = [];
                            for (let z = 0; z < historyDate.length; z++) {
                                if (yearkeys[j] == historyDate[z].substring(0, 4)) {
                                    yearItem[yearkeys[j] + "年"].push(historyDate[z].substring(4, 6))
                                }
                            }
                            //去重
                            let month = Array.from(new Set(yearItem[yearkeys[j] + "年"]));
                            yearItem[yearkeys[j] + "年"] = [];

                            for (let k = 0; k < month.length; k++) {
                                let monthItem = {};
                                let monthItemd = [];
                                for (let y = 0; y < historyDate.length; y++) {
                                    if (yearkeys[j] + month[k] == historyDate[y].substring(0, 6)) {
                                        monthItemd.push(historyDate[y].substring(6, 8) + "日")
                                    }
                                }
                                monthItem[month[k] + "月"] = monthItemd;
                                yearItem[yearkeys[j] + "年"].push(monthItem);
                            }
                            AllDatas.push(yearItem)
                        }
                        //算出默认值
                        this.setState({
                            allDaySHow: AllDatas,
                            //这里selectDatas是默认最后一天
                            selectDatas: [historyDate[historyDate.length - 1].substring(0, 4),
                            historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],
                            selectYesTerData: [historyDate[historyDate.length - 2].substring(0, 4),
                            historyDate[historyDate.length - 2].substring(4, 6), historyDate[historyDate.length - 2].substring(6, 8)],

                            //第一次请求时储存一个当前日历回来的最近的交易日期，判断注册监听和解注册节点的时候用,今天不是交易日的话,就不设置这个值
                            newData: [historyDate[historyDate.length - 1].substring(0, 4),
                            historyDate[historyDate.length - 1].substring(4, 6), historyDate[historyDate.length - 1].substring(6, 8)],

                            todayIsSaleDay: false,//今天不是交易日
                        }, () => {
                            this.getPageDatas(historyDate[historyDate.length - 1]),
                                this.getYesterDayData(historyDate[historyDate.length - 1]),
                                this.getListData();
                        }
                        )

                    }
                }

            }
        })
    }
    /**
     * 切换涨停炸板标签
     * */
    selectTabs(tagName, index) {

        if (this.state.tabSelect !== index) {
            //点击了不同的tab,先取消列表的监听

            this.offListNode();
            //重置排序项为降序
            this.state.titles[2].conCode = 1;
            this.firstEnter = true;
            this.setState({
                tabSelect: index,
                titles: this.state.titles
            }, () => {
                this.pageKey = "";
                //先获取列表数据
                this.getListData();
                //然后设置列表数据监听
                this.addListListener();
            });

        }
    }
    /**
     * 获取涨停炸板列表数据
     * */
    getListData() {
        let DataRquest = refHXG.ref('ztzb/list/' + (this.state.selectDatas[0] + this.state.selectDatas[1] + this.state.selectDatas[2]) +
            (this.state.tabSelect === 0 ? "/up/" : "/burst/") + this.marketCode[this.state.selectIndustry]);
        //console.log("列表请求",DataRquest)
        if (this.pageKey === "") {
            //因为这个地方，涨停炸版都是 index 为2,所以不用判断 是否是涨停还是炸版
            if (this.state.titles[2].conCode === 1) {
                //降序
                DataRquest.orderByKey().limitToLast(this.pageSize).get((response) => {
                    //console.log("列表请求回复",response)
                    this.firstEnter = false;
                    this._list.endLoading();
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    } else {
                        this.dealDatas({});
                    }
                });
            } else if (this.state.titles[2].conCode === 2) {
                //升序
                DataRquest.orderByKey().limitToFirst(this.pageSize).get((response) => {
                    this._list.endLoading();
                    this.firstEnter = false;
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    } else {
                        this.dealDatas({});
                    }
                });
            }

        } else {
            //因为这个地方，涨停炸版都是 index 为2,所以不用判断 是否是涨停还是炸版
            if (this.state.titles[2].conCode === 1) {
                //降序
                DataRquest.orderByKey().endAt(this.pageKey).limitToLast(this.pageSize + 1).get((response) => {
                    this._list.endLoading();
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    } else {
                        this.dealDatas({});
                    }
                });
            } else if (this.state.titles[2].conCode === 2) {
                //升序
                DataRquest.orderByKey().startAt(this.pageKey).limitToFirst(this.pageSize).get((response) => {
                    this._list.endLoading();
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    } else {
                        this.dealDatas({});
                    }
                });
            }
        }
    }
    /**
     * 处理请求的数据
     * */
    dealDatas(nodeContent) {
        //console.log("回调的列表数据",nodeContent);
        let item = Object.values(nodeContent);
        let key = Object.keys(nodeContent);
        if (key && key.length === 0) {
            this.state.data[0].items = [];
            this.setState({
                titles: this.state.tabSelect === 0 ? this.state.titleUp : this.state.titleBrst,
                data: this.state.data,
                allLoaded: true,
            });
            return;
        }
        for (let i = 0; i < key.length; i++) {
            item[i]['key'] = key[i];
        }
        //颠倒一下顺序
        if (this.state.titles[2].conCode === 1) {
            //删除第一个重复的元素
            if (this.pageKey !== "") {
                item.splice(item.length - 1, 1);
            }
            item.reverse();
        } else if (this.state.titles[2].conCode === 2) {
            //删除第一个重复的元素
            if (this.pageKey !== "") {
                item.splice(0, 1);
            }
        }
        if (item.length > 0) {
            if (this.pageKey === "") {
                this.state.data[0].items = [];
            }
            //储存Key
            this.pageKey = item[item.length - 1].key;

            for (let i = 0; i < item.length; i++) {
                let newItem = {};
                //储存第一列需要的数据
                let titles = {};
                titles.stockName = item[i].stockName;
                titles.stockCode = item[i].stockCode;
                newItem.title = titles;

                //数据项，一定要按照数据添加
                let dataItem = [];
                dataItem.push(item[i].price ? Number(item[i].price) : '--');
                dataItem.push(item[i].incRatio ? Number(item[i].incRatio) / 100 : '--');
                dataItem.push(item[i].limitUpTime ? item[i].limitUpTime.substring(0, 10) + "  " + item[i].limitUpTime.substring(11, 16) : '--');
                dataItem.push(item[i].limitUpCombat ? item[i].limitUpCombat : '--');
                newItem.data = dataItem;

                //增加一个字段用于排序
                newItem.sortContent = item[i].limitUpTime ? Date.parse(new Date(item[i].limitUpTime)) : 0;

                this.state.data[0].items.push(newItem);
            }
            //页数+1
            //this.pageNo+=1;
            //记录数据的条数
            //this.DATA_ITEM_LENGTH = this.state.data[0].items.length;
            //console.log("刷新数据前");
            this.setState({
                titles: this.state.tabSelect === 0 ? this.state.titleUp : this.state.titleBrst,
                data: this.state.data,
                allLoaded: item.length < this.pageSize ? true : false,
            });

        } else {
            this.setState({
                titles: this.state.tabSelect === 0 ? this.state.titleUp : this.state.titleBrst,
                data: this.state.data,
                allLoaded: true,
            });
        }
    }

    /**
     * 获取页面数据，
     * 获取今日涨停家数
     * nowDate最近交易日期"20190813"
     * */
    getPageDatas(nowDate) {
        //如果日期值为空,则返回不请求下面的所有数据
        if (this.state.selectDatas[0] == "") {
            return;
        }
        //现在涨停的家数
        //keyDate[0] 获取日期, this.marketCode[this.state.selectIndustry]获取当前选择市场
        //请求自然家数
        let todayUpNow = refHXG.ref('ztzb/line/' + nowDate + "/" + this.marketCode[this.state.selectIndustry] + "/up");
        todayUpNow.orderByKey().limitToLast(1).get((response) => {
            //console.log("自然家数",response)
            if (response.code == 0) {
                let keyValue = Object.values(response.nodeContent);
                this.setState({ todayNature: keyValue[0] ? keyValue[0] : 0 })
            } else {
                this.setState({ todayNature: 0 })
            }
        });
        //请求一字家数
        let todayOne = refHXG.ref('ztzb/line/' + nowDate + "/" + this.marketCode[this.state.selectIndustry] + "/nonNaturalUp");
        todayOne.orderByKey().limitToLast(1).get((response) => {
            //console.log("一字家数",response)
            if (response.code == 0) {
                let keyValue = Object.values(response.nodeContent);
                this.setState({ todayOne: keyValue[0] ? keyValue[0] : 0 })
            } else {
                this.setState({ todayOne: 0 })
            }
        });

        //炸版数
        let todayBurstNow = refHXG.ref('ztzb/line/' + nowDate + "/" + this.marketCode[this.state.selectIndustry] + "/burst");
        todayBurstNow.orderByKey().limitToLast(1).get((response) => {
            //console.log("扎板数量",response)
            if (response.code == 0) {
                let keyValue = Object.values(response.nodeContent);
                this.setState({ todayBurst: keyValue[0] ? keyValue[0] : 0 })
            } else {
                this.setState({ todayBurst: 0 })
            }
        });


    }
    /**
     * 关闭订阅的今天涨停家数
     * 因为只有最新的交易日，并且当前的一天,才可以关闭和监听节点
     * */
    offNode() {
        //如果今天的日期是最新的交易日
        //才需要解注册
        if (this.state.newAddData[0] + "" !== "") {
            let todayUpNow = refHXG.ref('ztzb/line/' + this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2] + "/" + this.marketCode[this.state.selectIndustry]);
            todayUpNow.off('value', (response) => {
                if (response.code == 0) {

                }
            });
        }
    }
    /**
     * 关闭列表的监听方法
     * */
    offListNode() {
        //才需要解注册
        if (this.state.newAddData[0] + "" !== "") {
            let nowDate = this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2]
            let datasListNow = refHXG.ref('ztzb/list/' + nowDate +
                (this.state.tabSelect === 0 ? "/up/" : "/burst/") + this.marketCode[this.state.selectIndustry]);
            datasListNow.off('value', (response) => {
                if (response.code == 0) {

                }
            });
        }
    }

    /**
     * 获取今天的日期
     * 返回为字符串
     * 20190828
     * */
    gettoDayDate() {
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString();
        let day = date.getDate().toString();
        return year + '' + (month.length > 1 ? month : "0" + month) + (day.length > 1 ? day : "0" + day);
    }

    /**
     * 判断今天是否开盘,大于9点半开盘，小于9点半没开盘
     * 返回为布尔值
     * false未开盘，true开盘
     * */
    getOpeningQuotation() {
        let date = new Date();
        let hours = date.getHours().toString();
        let mintutes = date.getMinutes().toString();
        if (parseInt(hours) > 9) {
            return true;
        } else if (parseInt(hours) == 9) {
            if (parseInt(mintutes) >= 30) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    /**
     * 获取昨日打版数据，获取
     * 成功率
     * 盈利率
     * */
    getYesterDayData(yesterDate) {
        //console.log("获取昨日打版",yesterDate);
        // console.log("获取昨日打版",'ztzb/tracing/'+yesterDate+"/"+this.marketCode[this.state.selectIndustry]);
        if (yesterDate) {
            //然后请求对应市场对应这天的打版数据
            let todayBurstNow = refHXG.ref('ztzb/tracing/' + yesterDate + "/" + this.marketCode[this.state.selectIndustry]);
            todayBurstNow.get((response) => {
                //console.log("获取昨日打版回复",response);
                if (response.code == 0 && response.nodeContent) {
                    this.setState({
                        yesterSuccess: response.nodeContent["up-counter"] ? parseFloat(response.nodeContent["up-counter"]) : '--',//昨日打版成功率
                        yesterrofitP: response.nodeContent["up-avg"] ? parseFloat(response.nodeContent["up-avg"]) / 100 : '--',//昨日打版盈利率
                    })
                } else {
                    this.setState({
                        yesterSuccess: '--',//昨日打版成功率
                        yesterrofitP: '--',//昨日打版盈利率
                    })
                }
            })
        }
    }


    //绘制行业选择
    renderRowInstryModalDropdown(rowData, rowID, highlighted) {
        let last = parseInt(rowID) === this.marketName.length - 1;
        return (
            <View style={{
                backgroundColor: highlighted
                    ? 'rgba(0, 0, 0, 0.6)'
                    : 'rgba(0, 0, 0, 0.6)',
                paddingLeft: 5,
                paddingRight: 5
            }}>
                <View style={{ height: this.lineHeightSpaceDropdown, }} />
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: this.lineHeightDropdown,
                    width: 80,
                    paddingVertical: ScreenUtil.scaleSizeW(12),
                    paddingHorizontal: ScreenUtil.scaleSizeW(8)
                }}>
                    <Text style={{
                        color: "#fff",
                        fontSize: ScreenUtil.setSpText(20)
                    }}>{rowData}</Text>
                </View>
                {last ? null : (
                    <View
                        style={{
                            //height: this.underlineHeightDropdown,
                            backgroundColor: '#999999'
                        }}
                    />
                )}
            </View>
        );
    }
    /**
     * 选择日期
     * */
    selectCalander() {
        this.isPickerShows = true;
        if (this.state.allDaySHow && this.state.allDaySHow.length === 0) {
            return;
        }
        this.setState({ isShow: true });
    }
    /**
     * ios使用的再弹窗出来以后再调用的Picker的方法，因为ios13.2系统有问题
     * */
    iosShowPicker() {
        this.isPickerShows = true;
        if (this.state.allDaySHow && this.state.allDaySHow.length === 0) {
            return;
        }
        let newCons = JSON.parse(JSON.stringify(this.state.allDaySHow));

        this.showPicker(newCons, [this.state.selectDatas[0] + "年", this.state.selectDatas[1] + "月", this.state.selectDatas[2] + "日"], (date) => {
            if (date && date.length > 0) {
                let callBackData = date[0].substring(0, date[0].length - 1) + date[1].substring(0, date[1].length - 1) + date[2].substring(0, date[2].length - 1);
                if (callBackData == this.state.selectDatas[0] + "" + this.state.selectDatas[1] + this.state.selectDatas[2]) {
                    //选择日期重复
                    return;
                }
                let calander = refHXG.ref('openning_calendar_before');
                calander.orderByKey().endAt(callBackData).limitToLast(2).firstLevel().get((response) => {
                    if (response.code == 0) {
                        this.firstEnter = true;
                        let keyValue = Object.keys(response.nodeContent);
                        //这里的keyValue 为两个值，一个为当前选择的日期，一个为当前交易日前一个交易日
                        //["20190808","20190809"]
                        if (keyValue[1] !== callBackData) {
                            //如果通过key去取的日期不是最后一个最新日期,说明当前的callBackData是最新交易日
                            this.setState({
                                selectDatas: [callBackData.substring(0, 4), callBackData.substring(4, 6), callBackData.substring(6, 8)],
                                selectYesTerData: [keyValue[1].substring(0, 4), keyValue[1].substring(4, 6), keyValue[1].substring(6, 8)],
                            }, () => {
                                this.getPageDatas(callBackData);
                                this.getYesterDayData(keyValue[1]);
                                this.pageKey = "";
                                this.getListData()
                                //有最新的交易日期
                                if (this.state.newAddData[0] + "" !== "") {
                                    if (callBackData !== this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2]) {
                                        //如果回调的日期不是最新的交易日日期,先关闭监听
                                        this.offNode();
                                        this.offListNode();
                                    } else if (callBackData == this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2]) {
                                        this.addBusrt();
                                        this.addListListener();
                                    }
                                }
                            })
                        } else if (keyValue[1] == callBackData) {
                            if (keyValue[1] !== (this.state.selectDatas[0] + this.state.selectDatas[1] + this.state.selectDatas[2])) {
                                this.setState({
                                    selectDatas: [keyValue[1].substring(0, 4), keyValue[1].substring(4, 6), keyValue[1].substring(6, 8)],
                                    //昨日打版数据是历史数据，直接从节点取对应日期的数据
                                    selectYesTerData: [keyValue[1].substring(0, 4), keyValue[1].substring(4, 6), keyValue[1].substring(6, 8)],
                                }, () => {
                                    this.getPageDatas(keyValue[1]);
                                    if (keyValue[1] !== this.state.newAddData[0] + this.state.newAddData[1] + this.state.newAddData[2]) {
                                        this.getYesterDayData(keyValue[1]);
                                    } else {
                                        //交易日并且开盘,
                                        // if(this.getOpeningQuotation() === true){
                                        //     this.getYesterDayData(keyValue[1]);
                                        // }else {
                                        //     this.getYesterDayData(keyValue[1]);
                                        // }
                                        this.getYesterDayData(keyValue[1]);
                                    }
                                    this.pageKey = "";
                                    this.getListData()
                                    //有最新的交易日期
                                    if (this.state.newAddData[0] + "" !== "") {
                                        if (callBackData !== this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2]) {
                                            //如果回调的日期不是最新的交易日日期,先关闭监听
                                            this.offNode();
                                            this.offListNode();
                                        } else if (callBackData == this.state.newAddData[0] + "" + this.state.newAddData[1] + this.state.newAddData[2]) {
                                            this.addBusrt();
                                            this.addListListener();
                                        }
                                    }
                                })
                            }
                        }

                    }
                })
            }
            this.isPickerShows = false;
            // if(Platform.OS==='ios'){
            //
            // }
            this.setState({ isShow: false });
        }, () => {
            this.isPickerShows = false;
            // if(Platform.OS==='ios'){
            //
            // }
            this.setState({ isShow: false });
        })
    }
    /**
     * 行业选择回调
     * idx 索引
     * value 回调的值
     * */
    _onDropDownInstry(idx, value) {
        if (value !== this.marketName[this.state.selectIndustry]) {
            //选择的市场有变化，关闭涨停家数的监听
            this.offNode();
            //选择的市场有变化，然后关闭列表的监听
            this.offListNode();
            this.firstEnter = true;
            this.setState({ selectIndustry: idx }, () => {
                this.getPageDatas(this.state.selectDatas[0] + this.state.selectDatas[1] + this.state.selectDatas[2]);
                this.getYesterDayData(this.state.selectYesTerData[0] + this.state.selectYesTerData[1] + this.state.selectYesTerData[2]);
                this.pageKey = "";
                this.getListData();
                //最后监听炸版区域的数据
                this.addBusrt();
                this.addListListener();

            })
            sensorsDataClickObject.addOnClick.page_source = '涨停炸板-市场情绪分类'
            sensorsDataClickObject.addOnClick.content_name = value
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)


        }
    }

    render() {
        return (<View style={{ flex: 1 }}>
            <StickyForm
                bounces={true}
                style={{ backgroundColor: "#f6f6f6", flex: 1 }}
                contentStyle={{ alignItems: "flex-start", width: "130%" }}
                data={this.state.data}
                scrollEnabled={true}
                ref={ref => (this._list = ref)}
                heightForSection={() => this.HEADER_HEGHT}
                showsVerticalScrollIndicator={false}
                renderHeader={this._renderunLockHeader}
                renderSection={this._renderSection}
                renderFooter={this._renderMyFooters}
                heightForIndexPath={() => this.ITEM_HEGHT}
                renderIndexPath={this._renderItem}
                onRefresh={() => {
                    //console.log("刷新")
                    this.refreshDatas();
                    setTimeout(() => this._list.endRefresh(), 2000);
                }}
                allLoaded={this.state.allLoaded}
                loadingFooter={mRiskTipsFooter}
                refreshHeader={mNormalHeader}
                renderEmpty={this.renderEmptys}
                showsHorizontalScrollIndicator={false}
                onLoading={() => { this.getListData(); }}
                headerStickyEnabled={false}
                directionalLockEnabled={true}
                onEndReached={(info) => {
                }}
                onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { }}
                /*
                 * lock (left 锁定左边距，使左边距没有 bounces 效果)
                 * x X坐标，y Y坐标，w 宽，h 高 (取消矩形外手势操作))
                 * 目前只实现了 lock:left,hot:y 效果
                 */
                hotBlock={{ lock: "left", hotBlock: { x: 0, y: this.hearderHeight, width: 0, height: 0 } }}
            />
            <Modal
                animationType={"none"}
                transparent={true}
                visible={this.state.isShow}
                onRequestClose={() => { }}
                onShow={() => {
                    //console.log("弹窗Show")
                    this.iosShowPicker();
                }}
                onDismiss={() => {
                    // console.log("弹窗Hide")
                    Picker.hide();
                }}
            >
                <TouchableOpacity activeOpacity={1} style={styles.bgFullScreen} onPress={() => this._hidePicker()}>
                </TouchableOpacity>
            </Modal>
        </View>)

    }
    /**
     * 绘制空视图
     *
     * */
    renderEmptys = () => {
        if (this.firstEnter === true) {
            return (
                <View style={{ height: this.HEADER_HEGHT + 300, flex: 1 }}>
                    <View style={{ width: ScreenUtil.screenW, height: 300, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={"gray"} />
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
                    </View>
                </View>
            );
        }
    };

    /**
     * 刷新页面
     * */
    refreshDatas() {
        //选择的市场有变化，关闭涨停家数的监听
        this.offNode();
        //选择的市场有变化，然后关闭列表的监听
        this.offListNode();

        this.getPageDatas(this.state.selectDatas[0] + this.state.selectDatas[1] + this.state.selectDatas[2]);
        this.getYesterDayData(this.state.selectYesTerData[0] + this.state.selectYesTerData[1] + this.state.selectYesTerData[2]);
        this.pageKey = "";
        this.getListData();
        //最后监听炸版区域的数据
        this.addBusrt();
        this.addListListener();
    }
    /**
    * 列表头布局
    *
    */
    _renderunLockHeader = () => {
        return (
            <View style={{ alignSelf: "stretch" }}>
                <View style={{ width: ScreenUtil.screenW, justifyContent: "center", alignItems: "center", }}
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
                    <View style={styles.intervalLine} />

                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(60), backgroundColor: "white", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 12, color: "#9d9d9d", marginLeft: ScreenUtil.scaleSizeW(30) }}>分类</Text>
                        <View style={{ backgroundColor: "white", justifyContent: "center", alignItems: "center", flexDirection: "row", marginLeft: ScreenUtil.scaleSizeW(20) }}>
                            <ModalDropdown ref='dropDownIndustry'
                                defaultValue={this.marketName[this.state.selectIndustry]}
                                defaultIndex={0}
                                onSelect={(idx, value) => this._onDropDownInstry(idx, value)}
                                style={{ width: 80 }}
                                textStyle={{ textAlign: 'center', fontSize: ScreenUtil.setSpText(24), color: "gray" }}
                                buttonStyle={{
                                    height: 20, borderRadius: 2, backgroundColor: "#fff",
                                    justifyContent: 'center', alignItems: 'center'
                                }}
                                dropdownStyle={{
                                    height: 175, width: this.widthDropdown, justifyContent: 'center',
                                    alignItems: 'center', marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(35) : ScreenUtil.scaleSizeW(20), marginRight: 5
                                }}
                                options={this.marketName}
                                renderRow={(rowData, rowID, highlighted) => this.renderRowInstryModalDropdown(rowData, rowID, highlighted)}
                                itemUnderlayColorDropdown={""}
                                itemActiveOpacity={0.5}
                            />
                        </View>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => this.selectCalander()}
                            style={{ height: ScreenUtil.scaleSizeW(60), flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}>
                            <Image style={{ width: 13, height: 13, resizeMode: "contain" }} source={require('../../../images/hits/calendar.png')} />

                            <Text style={{ fontSize: 12, color: "#9d9d9d", marginLeft: ScreenUtil.scaleSizeW(20) }}>
                                {this.state.selectDatas[0] + "-" + this.state.selectDatas[1] + "-" + this.state.selectDatas[2]}
                            </Text>
                            <Image style={{ width: 10, height: 10, resizeMode: "contain", marginLeft: ScreenUtil.scaleSizeW(10), marginRight: ScreenUtil.scaleSizeW(30) }} source={require('../../../images/hits/up.png')} />
                        </TouchableOpacity>

                    </View>
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(210), flexDirection: "row", backgroundColor: "#fff" }}>
                        <View style={{ width: ScreenUtil.screenW * 0.56, justifyContent: "center", alignItems: "center", paddingHorizontal: ScreenUtil.scaleSizeW(30) }}>
                            <LinearGradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                colors={['#FF3333', '#FF9999']}
                                style={styles.toDay}>
                                <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "white", }}>今日涨停家数</Text>
                            </LinearGradient>

                            <View style={{ flex: 1, flexDirection: "row" }}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(40), color: "#F92400" }}>{this.state.todayNature}</Text>
                                    <Text style={styles.todayText}>自然</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(40), color: "#F92400" }}>{this.state.todayOne}</Text>
                                    <Text style={styles.todayText}>一字</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(40), color: "#F92400" }}>{this.state.todayBurst}</Text>
                                    <Text style={styles.todayText}>炸板</Text>
                                </View>

                            </View>

                        </View>
                        <View style={{ width: ScreenUtil.scaleSizeW(1), height: ScreenUtil.scaleSizeW(210), backgroundColor: "#f1f1f1" }} />

                        <View style={{ width: ScreenUtil.screenW * 0.44, justifyContent: "center", alignItems: "center" }}>
                            <LinearGradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                colors={['#3399FF', '#66CCFF']}
                                style={styles.yesTerDay}>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white" }}>昨日打板</Text>
                            </LinearGradient>

                            <View style={{ flex: 1, flexDirection: "row" }}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <StockFormatText precision={0} unit={"%"} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(40), color: "#F92400" }}>{this.state.yesterSuccess}</StockFormatText>
                                    <Text style={styles.yesTerText}>成功率</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <StockFormatText precision={2} unit={"%"} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(40), color: "#F92400" }}>{this.state.yesterrofitP}</StockFormatText>
                                    <Text style={styles.yesTerText}>盈利率</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.intervalLine} />
                    <FlowLayoutDouble tagDatas={this.state.flowDatas} activeIndex={this.state.tabSelect} indexCallBack={(tagName, index) => { this.selectTabs(tagName, index) }} />

                </View>
            </View>
        );
    }
    /**
     * SectionTitle
     *
     * */
    _renderSection = (section: number) => {
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row" }}>
                <View style={[styles.fixTitleOne, { backgroundColor: "#f2faff" }]}>
                    <Text style={styles.hinnerText}>股票名称</Text>
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
            this._list && this._list.scrollTo({ x: 0, y: 0 }, true).then(() => {
                this.setState({
                    titles: this.state.titles,
                }, () => {
                    //重置存储值
                    this.pageKey = "";
                    this.getListData();
                });
            })

        }
    }
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
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                let data = {};
                data.Obj = item.title.stockCode;
                data.ZhongWenJianCheng = item.title.stockName;
                data.obj = item.title.stockCode;
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: [],
                    index: 0,
                })
            }} style={styles.row}>
                <View style={[styles.fixTitleOne, { backgroundColor: "#fff" }]}>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#242424" }}>{item.title.stockName}</Text>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#909090" }}>{item.title.stockCode}</Text>
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
                Views = <View style={styles.text} key={index}>
                    <StockFormatText precision={2} useDefault={true} style={styles.contentText}>{title}</StockFormatText>
                </View>;
                break;
            case 1:
                Views = <View style={styles.text} key={index}>
                    <StockFormatText precision={2} unit={"%"} useDefault={true} style={[styles.contentText, { color: "#fa5033" }]}>{title}</StockFormatText>
                </View>;
                break;
            case 2:
                Views = <View style={styles.textfix} key={index}>
                    <Text style={[styles.contentText]}>{title}</Text>
                </View>;
                break;
            case 3:

                let text;
                if (title == '首板' || title == '--') {
                    text = title;
                } else {
                    text = title + "连板"
                }
                Views = <View style={styles.text} key={index}><Text style={styles.contentText}>{text}</Text></View>;
                break;
            default:
                Views = <View style={styles.text} key={index}><Text style={styles.contentText}>{title}</Text></View>;
                break;
        }
        return Views;
    };

    /**
     * 展示picker
     * */
    showPicker(alldate, selecteddate, callback, cancelback) {
        Picker.init(
            {
                pickerCancelBtnText: '取消',
                pickerConfirmBtnText: '确定',
                pickerTitleText: '时间选择',
                pickerCancelBtnColor: [31, 143, 229, 1],
                pickerConfirmBtnColor: [31, 143, 229, 1],
                pickerToolBarBg: [254, 254, 254, 1],
                pickerBg: [255, 255, 255, 1],
                pickerFontSize: 20,
                pickerData: alldate,
                selectedValue: selecteddate,
                onPickerConfirm: data => {
                    // if(Platform.OS==='ios'){
                    //
                    // }
                    this.setState({ isShow: false });
                    callback(data)
                },
                onPickerCancel: () => {

                    cancelback();
                },
            });
        Picker.show();
    }

    /**
     * 脚布局
     * */
    _renderMyFooters = () => {
        if (this.state.allLoaded === false) {
            return <View><View></View></View>;
        } else if ((this.state.data && this.state.data[0].items.length === 0 && this.firstEnter !== true) || this.state.allLoaded === true) {
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

    /**
     * 关闭picker
     * */
    _hidePicker = () => {
        this.isPickerShows = false;
        this.setState({ isShow: false });
        Picker.hide();
    };
    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
        this.dbTabChange && this.dbTabChange.remove();
        this.appMainTabChange && this.appMainTabChange.remove();

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    intervalLine: {
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(20),
        backgroundColor: "#f1f1f1"
    },
    //表格需要的样式
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(30),
    },
    textfix: {
        width: ScreenUtil.scaleSizeW(310),
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(30),
        backgroundColor: "#fff",
    },
    hinnerText: {
        fontSize: ScreenUtil.setSpText(24),
        color: "#999999",
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
        backgroundColor: "#f2faff",
        flexDirection: "row",
        paddingLeft: ScreenUtil.scaleSizeW(30)
    },
    headerFixText: {
        width: ScreenUtil.scaleSizeW(310),
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
        paddingLeft: ScreenUtil.scaleSizeW(30)
    },
    row: {
        flex: 1,
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor: "#fff"
    },
    contentText: {
        fontSize: ScreenUtil.setSpText(28),
        color: "#000"
    },
    fixTitleOne: {
        width: ScreenUtil.scaleSizeW(180),
        justifyContent: "center",
        //alignItems: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20)
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
    toDay: {
        marginTop: ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(50),
        borderRadius: ScreenUtil.scaleSizeW(25),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ScreenUtil.scaleSizeW(8)
    },
    yesTerDay: {
        marginTop: ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(50),
        borderRadius: ScreenUtil.scaleSizeW(25),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ScreenUtil.scaleSizeW(40)
    },
    todayText: {
        fontSize: ScreenUtil.scaleSizeW(24),
        color: "#FF3333",
        marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(6) : ScreenUtil.scaleSizeW(2)
    },
    yesTerText: {
        fontSize: ScreenUtil.scaleSizeW(24),
        color: "#3399FF",
        marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(6) : ScreenUtil.scaleSizeW(2)
    }
    , bgFullScreen: {
        flex: 0,
        position: 'absolute',
        top: 0,
        width: ScreenUtil.screenW,
        height: ScreenUtil.screenH,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
});
