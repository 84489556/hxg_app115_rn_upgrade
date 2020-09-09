import React, { Component } from "react";
import {
    DeviceEventEmitter,
    Dimensions,
    Image,
    PixelRatio,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    BackHandler,
    ImageBackground, AppState

} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-community/async-storage";
//import  NetInfo from  '@react-native-community/netinfo';
import Toast from "react-native-easy-toast";
import Orientation from "react-native-orientation";
import WebView from 'react-native-webview'

import BasePage from "../BasePage.js";
import Button from "../../components/Button.js";
import * as baseStyle from "../../components/baseStyle.js";
import { DZHYunBuySellComponent } from "../../components/BuySellComponent.js";
import { TickComponent } from "../../components/TickComponent.js";
import { YDAnnouncementList, YDNewsList } from "../../components/NewsList.js";
import TabBarOriginal from "../../components/TabBarOriginal.js";
import TabBar, { StaticTabBarItem, TabBarItem } from "../../components/TabBar.js";
import DZHMinChart from "./MinChart.js";
import DZHKlineChart from "./KlineChart";
import DateFormatText from "../../components/DateFormatText.js";
import NavigationTitleView from '../../components/NavigationTitleView';
import { connection } from "./YDYunConnection";
import ExpandedView, { TouchFlag } from "../../components/ExpandedView"
import ShareSetting from "../../modules/ShareSetting.js";
import StockPriceView from "../../components/StockPriceView.js";
import StockInfoView from "../../components/StockInfoView";
import UserInfoUtil from "../../utils/UserInfoUtil";
import { Utils, isLandscape, isBQuote } from "../../utils/CommonUtils";
import ModalDropdown from '../../components/ModalDropdown.js';
import { getStockCodeType } from "./DownLoadStockCode";
import * as cyURL from '../../actions/CYCommonUrl';
import RequestInterface from "../../actions/RequestInterface";
import ConstituentListForFundFlow from "./ConstituentListForFundFlow";
import ConstituentList from "./ConstituentList_android";
import UpDownButton from "../../components/UpDownButton";
import BaseComponentPage from '../../pages/BaseComponentPage';
import { has } from '../../utils/IndexCourseHelper';
import { PopupPromptView } from '../../pages/Course/IndexStudyCoursePage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { jumpPage } from "../../utils/CommonUtils";

var ScreenHeight = Dimensions.get('window').height;
const _secondButtonsThreshold = 4;//表示分时，日K,周K，月K，4个部分，下拉分时是单独的
const graphHeight = 460;//日K，周K，月K,1分，5分，15分，30分，60分的K线图加上主副图的高度，分时K线图的高度为300
// const _func = "var lastHeight = 0; setInterval(function() {if (document.documentElement.scrollHeight !== lastHeight) {lastHeight = document.title = document.documentElement.scrollHeight; window.location.hash = lastHeight;}}, 1000);"
let strName = "";// 标题使用的股票名称，例如 浙江东日

// 注入脚本, 否则postmessage不生效
// 应该是和F10,收益统计的H5页面交互所注入的JS代码
var injectedJavaScript5 = `
    (${String(function () {
    var originalPostMessage = window.postMessage;
    var patchedPostMessage = function (message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer);
    };
    patchedPostMessage.toString = function () {
        return String(Object.hasOwnProperty).replace(
            'hasOwnProperty',
            'postMessage'
        );
    };
    window.postMessage = patchedPostMessage;
})})();
`;
//import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import RCTDeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';

let tabStyle = StyleSheet.create({

    container: { margin: 0 },
    tabBar: { marginBottom: 4, height: 40, },
    tabBarItem: { borderBottomWidth: 0 },
    tabBarItemLabel: { fontSize: 15, color: baseStyle.BLACK_100 },
    tabBarItemSelected: {
        backgroundColor: baseStyle.WHITE,
        borderBottomWidth: 2,
        borderBottomColor: baseStyle.TABBAR_BORDER_COLOR
    },
    tabBarItemLabelSelected: { color: baseStyle.TABBAR_BORDER_COLOR },
    smallBottom: {
        backgroundColor: baseStyle.TABBAR_BORDER_COLOR,
        height: 2,
        width: 33,
        bottom: 0,
        position: 'absolute'
    }
});

//集成BasePage有什么用处？？？只是因为需要重写两个方法吗？
export class DetailPage extends BasePage {

    constructor(props) {
        super(props);

        this.state = {
            ZhongWenJianCheng: '',//股票名称
            objs: [],
            //以上新加属性

            obj: null,
            type: null,
            time: null,
            // isPersonalStock: null,
            scalesPageToFit: true,
            f10Url: '',//F10模块Url
            earningsUrl: '',//收益统计Url
            isDisplayBuySellComponent: true,
            f10Height: ScreenHeight,
            incomeHeight: ScreenHeight,
            priceboxData: null,
            previousPriceboxData: null,
            curGraphIndex: 0, //分时，日K，周K等图标选择的Index
            wudangIndex: 0,
            shijian: '--',
            shijia: '--',
            junjia: '--',
            yichong: '--',//一冲显示参数
            erchong: '--',//二冲显示参数
            zhangfu: '--',
            chengjiaoliang: '成交量:--',//分时图成交量显示
            zhangfuColor: '',
            junjiaColor: '#fe9350',
            kline_time: '--',
            maData: [],
            colorData: [],
            fuTu1Data: [],
            fuTu1ColorData: [],
            fuTu2Data: [],
            fuTu2ColorData: [],
            fuTu1Name: '操盘提醒',
            fuTu2Name: '底部出击',
            zhuTuName: '蓝粉彩带',
            hasList: false,
            touchWeb: false,
            mainData: '蓝粉彩带',
            firstData: '操盘提醒',
            secondData: '底部出击',
            enableScrollViewScroll: true,//用于控制股票行情页面内外层滚动冲突
            isShowChaJiaTime: false,
            // scrollTouch: 'auto',//scroll是否禁止滑动  为解决滑动十字光标时 移动scroll
            SectorType: '',
            SectorTotal: 0,
            curMinMainFormulaIdx: 0,
            curMinFutuFormulaIdx: 0,
            minFutuFloatButtonBottom: 0,
            zhangF: 0, //0 ：降序，由大到小  1：升序，有小到大  2：默认排序
            xianJ: 2,
            hadNetQuery: false,//网络连接后已经重新请求过行情
            isUseGesture:'0'
        }
        this.isDidMount = false;//杨总让加的一个参数，避免页面退出以后，还要渲染页面
        this.timer = null;
        this.timerConnect = null;
        //这是从原生传过来的数据
        this.getDataListener = DeviceEventEmitter.addListener('getDataListener', (data) => {
            //取股票的一些数据，{shijian: "15:00", shijia: 25.39, junjia: 25.2988269120184, zuoshou: 17.6299991607666}
            //这里的逻辑有问题，不需要刷新这么多次
            this.setState({ shijian: data.shijian }, () => {
                if (data.shijia == -1) {
                    this.setState({ shijia: '--', zhangfu: '--' })
                } else {
                    if (data.shijia - data.zuoshou > 0) {
                        this.setState({ zhangfuColor: '#fc525a' })
                    }
                    else if (data.shijia - data.zuoshou == 0) {
                        this.setState({ zhangfuColor: '#828282' })
                    }
                    else {
                        this.setState({ zhangfuColor: '#0ec98e' })
                    }
                    let zhangfu = "--"
                    if (data.zuoshou == 0) {
                        this.setState({ shijia: data.shijia.toFixed(2), zhangfu: zhangfu })
                    }
                    else {
                        zhangfu = ((data.shijia - data.zuoshou) * 100) / data.zuoshou
                        this.setState({ shijia: data.shijia.toFixed(2), zhangfu: zhangfu.toFixed(2) + '%' })
                    }

                }
                if (data.junjia == -1) {
                    this.setState({ junjia: '--' })
                } else {
                    this.setState({ junjia: data.junjia.toFixed(2) })
                }

                // DeviceEventEmitter.emit('getMinDataForLandscapeListener', {
                //     shijian: this.state.shijian,
                //     shijia: this.state.shijia,
                //     junjia: this.state.junjia,
                //     zhangfu: this.state.zhangfu,
                //     yichong: this.state.yichong,
                //     erchong: this.state.erchong,
                //     zhangfuColor: this.state.zhangfuColor,
                //     junjiaColor: this.state.junjiaColor,
                //
                // });
            })

        });

        //日K-1分，2分等K线图的数据回调 ，name主图指标（蓝粉彩带-中期彩带）
        this.getDataForKChartListener = DeviceEventEmitter.addListener('getDataForKChartListener', (data, colorData, name) => {
            let filterData = [];
            let filterColorData = [];
            //mainData 和zhuTuName应该是一个意思，页面中只是使用到了zhuTuName,maData应该是选择主图指标后的一些数据
            this.setState({ mainData: name, zhuTuName: name })

            if (data.length == 0) {
                this.setState({ maData: filterData, colorData: filterColorData }, () => {
                    return;
                })
            }
            for (let i = 0; i < data.length; i++) {
                //现在有这个指标吗？？？
                if (name == '趋势彩虹') {
                    if (data[i].indexOf('短线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (data[i].indexOf('长线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 2 && filterColorData.length == 2) {
                        this.setState({ maData: filterData, colorData: filterColorData }, () => {
                            return;
                        })
                    }
                } else if (name == '短线趋势彩虹') {//现在有这个指标吗？？？
                    if (data[i].indexOf('短线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (data[i].indexOf('长线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 2 && filterColorData.length == 2) {
                        this.setState({ maData: filterData, colorData: filterColorData }, () => {
                            return;
                        })
                    }
                }
                else {
                    this.setState({ maData: data, colorData: colorData, zhuTuName: name, mainData: name })
                }
            }

        });
        this.getTimeListener = DeviceEventEmitter.addListener('getTimeListener', (timeData, isShowChaJia) => {
            //获取的是k线图的时间,timeData: 2020/07/03  ,isShowChaJia: true或者false,手指滑动,表示查价true
            this.setState({ kline_time: timeData, isShowChaJiaTime: isShowChaJia });
        });
        this.getfuTu1DataForKChartListener = DeviceEventEmitter.addListener('getfuTu1DataForKChartListener', (name, data, colorData) => {
            //这是副图1的文字描述数据,name,操盘提醒， data=["波段进场:50", "反弹进场:50", "超跌进场:50", "中:50", "上:95", "下:1"] ,
            // colorData=["333333", "ffaa1e", "e156e3", "008000", "666666", "0064ff"]
            let filterData = [];
            let filterColorData = [];
            this.setState({ firstData: name, fuTu1Name: name, fuTu1Data: filterData })
            this.sensorsAddIndex("副图指标", name, 'K线页副图1点击')
            //循环数组所有的字符串
            if(data==null){
                return;
            }
            for (let i = 0; i < data.length; i++) {
                //现在还有趋势彩虹这个指标吗
                if (name == '趋势彩虹') {
                    if (data[i].indexOf('短线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (data[i].indexOf('长线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData }, () => {
                            return;
                        })
                    }
                } else if (name == '短线趋势彩虹') {//现在还有趋势彩虹这个指标吗
                    if (data[i].indexOf('短线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (data[i].indexOf('长线趋势') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData }, () => {
                            return;
                        })
                    }
                } else if (name == '量能黄金') {
                    if (data[i].indexOf('VOL') >= 0) {//如果第0个是以VOL开头的，则添加所有数据
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    //如果数据为空，则刷新页面
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData }, () => {
                            return;
                        })
                    }
                } else if (name == '周期拐点') {//["长周期:217.69"]
                    if (data[i].indexOf('短周期') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (data[i].indexOf('长周期') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 2 && filterColorData.length == 2) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '波动极限') { //["中轨:59.22", "上轨:66.32", "下轨:52.11", "上上轨:69.87", "下下轨:48.56"],
                    let bdjx = data[i].slice(0, 2);
                    if (bdjx == '上轨') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (bdjx == '上上') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (bdjx == '下轨') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (bdjx == '下下') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 4 && filterColorData.length == 4) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '强弱转换') {//这个指标是否有？
                    if (data[i].indexOf('能量柱值') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '底部出击') {//["底部出击:138.77"]
                    if (data[i].indexOf('底部出击') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '主力动态') {//[]
                    if (data[i].indexOf('无控盘') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }

                    this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                        return;
                    })
                    // if (data[i].indexOf('开始控盘') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // } else if (data[i].indexOf('无庄控盘') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // } else if (data[i].indexOf('有庄控盘') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // } else if (data[i].indexOf('主力出货') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // }
                    // if (filterData.length == 4 && filterColorData.length == 4) {
                    //     this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                    //         return;
                    //     })
                    // }
                }
                else if (name == '操盘提醒') {//["波段进场:50", "反弹进场:50", "超跌进场:50", "中:50", "上:95", "下:1"]
                    filterData = filterData.concat(data).slice(0, 2)
                    filterColorData = filterColorData.concat(colorData).slice(0, 2)
                    this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                        return;
                    })
                }
                else {
                    filterData = filterData.concat(data)
                    filterColorData = filterColorData.concat(colorData)
                    if (filterData.length == data.length && filterColorData.length == colorData.length) {
                        this.setState({ fuTu1Data: filterData, fuTu1ColorData: filterColorData, fuTu1Name: name }, () => {
                            return;
                        })
                    }

                }
            }
        });
        //副图2指标
        this.getfuTu2DataForKChartListener = DeviceEventEmitter.addListener('getfuTu2DataForKChartListener', (name, data, colorData) => {
            let filterData = [];
            let filterColorData = [];

            this.setState({ secondData: name, fuTu2Name: name, fuTu2Data: filterData })
            this.sensorsAddIndex("副图指标", name, 'K线页副图2点击')
            if(data==null){
                return;
            }
            for (let i = 0; i < data.length; i++) {
                if (name == '量能黄金') {
                    if (data[i].indexOf('VOL') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '周期拐点') {
                    if (data[i].indexOf('短周期') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (data[i].indexOf('长周期') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 2 && filterColorData.length == 2) {
                        this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '波动极限') {
                    let bdjx = data[i].slice(0, 2)
                    if (bdjx == '上轨') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (bdjx == '上上') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (bdjx == '下轨') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    } else if (bdjx == '下下') {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 4 && filterColorData.length == 4) {
                        this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '强弱转换') {
                    if (data[i].indexOf('能量柱值') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '底部出击') {
                    if (data[i].indexOf('底部出击') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    if (filterData.length == 1 && filterColorData.length == 1) {
                        this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                            return;
                        })
                    }
                } else if (name == '主力动态') {
                    if (data[i].indexOf('无控盘') >= 0) {
                        filterData.push(data[i]);
                        filterColorData.push(colorData[i])
                    }
                    // if (data[i].indexOf('开始控盘') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // } else if (data[i].indexOf('无庄控盘') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // } else if (data[i].indexOf('有庄控盘') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // } else if (data[i].indexOf('主力出货') >= 0) {
                    //     filterData.push(data[i]);
                    //     filterColorData.push(colorData[i])
                    // }
                    // if (filterData.length == 4 && filterColorData.length == 4) {
                        this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                            return;
                        })
                    // }
                }
                else if (name == '操盘提醒') {
                    filterData = filterData.concat(data).slice(0, 2)
                    filterColorData = filterColorData.concat(colorData).slice(0, 2)
                    this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                        return;
                    })
                }
                else {
                    filterData = filterData.concat(data)
                    filterColorData = filterColorData.concat(colorData)
                    if (filterData.length == data.length && filterColorData.length == colorData.length) {
                        this.setState({ fuTu2Data: filterData, fuTu2ColorData: filterColorData, fuTu2Name: name }, () => {
                            return;
                        })
                    }

                }
            }
        });
        this.toPortrait = DeviceEventEmitter.addListener('toPortrait', () => {
            Orientation.lockToPortrait()
        });

        //Orientation.unlockAllOrientations();
        // 用来记录循环切换股票的变量，这个表示当前股票是传入股票列表的位置
        this.loopStock = 0;
        this._onDropDownMenu = this._onDropDownMenu.bind(this);
        this.renderRow4ModalDropdown = this.renderRow4ModalDropdown.bind(this);
        this.substringObj = this.substringObj.bind(this);
        // this.substringZWJC = this.substringZWJC.bind(this);
        // this.heightDropdown = 152;
        this.heightDropdown = 182;
        this.widthDropdown = 40;
        this.lineHeightDropdown = 25;
        this.lineHeightSpaceDropdown = 0;
        // this.underlineHeightDropdown = 1;
        this.optionDropdown = ['1分', '5分', '15分', '30分', '60分'];
        //Orientation.lockToPortrait();
        this.changeFlag = true;//是否可以切换股票代码，点击顶部title触发
        this.maybeLock = true;
        this.FutuFormulaPickerPaddingTop = 5;
        //底部tab初始索引
        this.tabIndex = 0;//用户进入页面初始化的时候加载
    }
    updateState(data) {              //这个data是个参数
        this.setState({ ZhongWenJianCheng: data.ZhongWenJianCheng });
    }
    pageWillActive() {
        super.pageWillActive();
        // 切换前加载动态行情数据
        //不太清除这个属性有什么用，每次走这个方法都是true,所以相关的判断有什么作用？
        this.preLoad = true;

        if (this.props.navigation.state.params.tabIndex) {
            this.tabIndex = this.props.navigation.state.params.tabIndex
        }


        //这个地方传参是有一些问题的？从代码来看，只需要传入小写的obj即可 。   ？？？？
        //obj = SZ300845 是一个股票代码
        let obj = this.props.navigation.state.params.Obj;
        if (this.props.navigation.state.params.obj) {
            obj = this.props.navigation.state.params.obj
        }
        //新加股票切换列表数组
        //objs 是一个数组里面的对象是{Obj: "SH688600" ,ZhangFu: "137.41935483870964",ZhongWenJianCheng: "N皖仪" ,ZuiXinJia: "36.8"}
        let objs = this.props.navigation.state.params.array
            ? this.props.navigation.state.params.array
            : [];
        //name 表示的是股票的名称 例如:浙江东日
        let name = this.props.navigation.state.params.ZhongWenJianCheng;
        //获取当前的显示股票在列表中的位置，并判断是否超过101支，this.props.navigation.state.params.index表示传入的位置
        this.loopStock = parseInt(this.props.navigation.state.params.index);

        //创建了三个数组
        let formatArray = [];
        let temp1 = [];
        let temp2 = [];
        let temp3 = [];

        if (objs.length > 100) {
            //够101只股票
            //如果位置大于50
            if (this.loopStock > 50) {
                if (objs.length - this.loopStock < 50) {
                    temp1 = objs.slice(this.loopStock, objs.length);
                    temp2 = objs.slice(this.loopStock - 50, this.loopStock);
                    temp3 = objs.slice(0, (50 - (objs.length - this.loopStock)));
                    temp1 = temp1.concat(temp3);
                    formatArray = temp2.concat(temp1);
                } else {
                    temp1 = objs.slice(this.loopStock, this.loopStock + 50);
                    temp2 = objs.slice(this.loopStock - 50, this.loopStock);
                    formatArray = temp2.concat(temp1);
                }
            } else {
                temp1 = objs.slice(this.loopStock, this.loopStock + 50);
                temp2 = objs.slice(0, this.loopStock);
                temp3 = objs.slice(objs.length - (50 - this.loopStock), objs.length);
                temp3 = temp3.concat(temp2)
                formatArray = temp3.concat(temp1);
            }
            this.loopStock = 50;
        } else {
            //不够100只股票
            formatArray = objs;
        }
        this.setState({
            obj: obj,//当前股票代码
            f10Url: this.makeF10Url(obj),
            earningsUrl: this.makeEarningUrl(obj),//收益统计Url
            //将传过来的数组进行处理放入要切换的数组中
            objs: formatArray,//所有股票列表的数组
            ZhongWenJianCheng: name //中文名称
        });
        //根据股票和下载的文件去对比股票是属于板块还是个股，板块较少，个股较多，0是板块，1是个股
        getStockCodeType(this.props.navigation.state.params.Obj, (value) => {
            if (value === 0) {
                this.setState({
                    type: 0,
                });
            } else {
                this.setState({
                    type: 1,
                });
            }
        });
    }

    pageDidActive() {
        super.pageDidActive();

        //股票代码
        let obj = this.props.navigation.state.params.Obj;

        // 记录股票查看历史,发送给Redux进行长久记录储存，只是记录是从搜索页面跳转过来的
        const { addHistoryStock } = this.props.actions;
        if (this.props.navigation.state.params.fromPage && this.props.navigation.state.params.fromPage == 'searchPage') {
            addHistoryStock({
                Obj: obj,
                obj: obj,
                ZhongWenJianCheng: this.props.navigation.state.params.ZhongWenJianCheng
            })
        }
        // 切换后加载分时图和新闻数据,这个变量和preLoad有什么作用有待查看
        this.postLoad = true;
        this.forceUpdate();

        if (this.state.curGraphIndex > 0) {
            //判断选择K线图的下标不是0，并且，K线图的实例存在
            if (this.refs.KLineInDetailPage && this.getKLineInDetailPageRef()) {
                //关于K线的一些参数设置(20200703后续核实)？？？
                this.getKLineInDetailPageRef()._onChangeEmpower(ShareSetting.getCurrentEmpowerName());
                //初始化时设置日k的视图的
                this.getKLineInDetailPageRef()._onPickFormula(ShareSetting.getCurrentMainFormulaName());
                this.getKLineInDetailPageRef()._onPickFormula(ShareSetting.getCurrentAssistFormulaName());
            }
        }

    }

    componentDidMount() {
        super.componentDidMount();
        this.isDidMount = true;
        //分时，分时冲关的 一冲，二冲的显示价格
        this.getFuTu1DataForMin = DeviceEventEmitter.addListener('sendShuangChongForMin', (data) => {
            // if (!data.yichong) {
            //console.warn('yichong=' + data.yichong);
            if (data.yichong == -1) {
                this.setState({ yichong: '0.00' })
            } else {
                this.setState({ yichong: '1.00' })
            }
            // }
            // if (!data.erchong) {
            if (data.erchong == -1) {
                this.setState({ erchong: '0.00' })
            } else {
                this.setState({ erchong: '1.00' })
            }
            // }
        });
        //分时图的成交量
        this.getChengjiaoliangForMin = DeviceEventEmitter.addListener('sendChengjiaoliangForMin', (data) => {
            this.setState({ chengjiaoliang: data.chengjiaoliang })

        });


        Orientation.addOrientationListener(this._orientationDidChange.bind(this));
        //这个广播现在应该是没有用到，很多地方都在发送，需要删除
        // DeviceEventEmitter.emit('pageName', '行情新闻');

        //k线设置页面设置前后复权通知
        this.listenerKLine = DeviceEventEmitter.addListener('KLineSetPage', (info) => {
            this.refs.KLineInDetailPage && this.getKLineInDetailPageRef()._onChangeEmpower(info);
        });
        //搜索页面回来的逻辑，刷新页面股票行情数据，现在是有问题的，grpc容易被踢掉
        this.listenerSearchPage = DeviceEventEmitter.addListener('searchPage', (info) => {
            // this._cancle();
            const { addHistoryStock } = this.props.actions
            console.log('stock-http' + '--------searchPage--------');
            let data = info;
            addHistoryStock({
                Obj: data.Obj,
                obj: data.Obj,
                ZhongWenJianCheng: data.ZhongWenJianCheng

            })
            if (data) {
                this.setState({
                    obj: data.Obj,
                    objs: data.array,
                    ZhongWenJianCheng:
                        data.ZhongWenJianCheng,
                    isShowChaJiaTime: false,//查价false
                    f10Url: this.makeF10Url(data.Obj),
                    earningsUrl: this.makeEarningUrl(data.Obj)
                });
            }


        })
        //提交热门股票的信息
        Utils.postToHotStock(RequestInterface.HXG_BASE_URL + '/hotStockCodes/hotStock', this.props.navigation.state.params.Obj, this.props.navigation.state.params.ZhongWenJianCheng)

        if (Platform.OS === 'android') {
            //拦截手机自带返回键
            //这个方法有问题，移出监听顺序和时机
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }

        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.geguxiangqing);
        }
        );
        AppState.addEventListener('change', this._handleAppStateChange);

        //原生传来的网络链接状态
        this.netChange = RCTDeviceEventEmitter.addListener('netChange', ev => {
            if (ev.state) {
                console.log('stock-http---netChange-----');
                this._cancle();
                this.timerConnect = setTimeout(() => {
                    this._query();
                }, 2000);
            }
        });
        //原生grpc传来的错误链接，RN需要进行重连操作
        this.quoteErrMesListener = RCTDeviceEventEmitter.addListener('quoteErrorMessage', ev => {

            //this.dataComing(ev)

            console.log('stock-http---quoteErrorMessage-----' + this.errorMessage);
            if (AppState.currentState === 'active') {
                // if(this.errorMessage === false){
                // this.errorMessage = true;
                // this.errorConnectNumber ++ ;

                //这里收到错误的消息，然后先接触监听数据，再连接监听
                this._cancle();
                connection.resetInit();
                //延迟1秒，让解除监听尽可能解除完成,如果连接次数大于5次了，就不连接了;
                this.timerConnect = setTimeout(() => {
                    this._query();
                }, 3000);
            }
        })
         AsyncStorage.getItem('ISUSEGESTRUE', (errs, result) => {
           if (!errs) {
              this.setState({isUseGesture:result});
            }
        })
    }
    //应用前后台监听方法
    _handleAppStateChange = (nextAppState) => {
        // console.log('stock-http---_handleAppStateChange-----'+nextAppState );
        if (nextAppState === 'active') {
            this._reConnect();
            
        } else if (nextAppState === 'background') {
            //进入后台时，储存一个上次退出时间
            this._cancle();
        } else if (nextAppState === 'inactive') {
            //进入后台时，储存一个上次退出时间，ios有过渡时间的方法，在这个方法做操作
        }
    };

    _query() {
        this.sis && this.sis._requery();
        this.spv && this.spv._requery();
        if (this.state.curGraphIndex == 0) {
            this.refs.MinInDetailPage && this.getMinInDetailPageRef().query();
        }
        if (ShareSetting.getWuDangIndex() == 0) {
            this.buysell && this.buysell._requery();
        } else {
            this.tick && this.tick._requery();
        }
        this.headTitle && this.headTitle._requery();
    }

    _cancle() {
        this.sis && this.sis.cancel();
        this.spv && this.spv.cancel();
        if (this.state.curGraphIndex == 0) {
            this.refs.MinInDetailPage && this.getMinInDetailPageRef().cancel();
        }
        this.buysell && this.buysell.cancel();
        this.tick && this.tick.cancel();
        this.headTitle && this.headTitle.cancel();

    }

    _reConnect(){
        NetInfo.fetch().then((status) => {
            //console.log("网络库回调",status)
            if (status.type != 'none' && status.type != 'NONE') {
                // console.log('stock-http---status.type!=null' );

                if (status.isConnected) {
                    // console.log('stock-http---status.type isConnected');
                    this._query();
                } else {
                    this.timerConnect = setTimeout(() => {
                        this._reConnect();
                    }, 3000);
                }
            } else {
                console.log('stock-http---status.type=null');
                this.timerConnect = setTimeout(() => {
                    this._reConnect();
                }, 3000);
            }
        });
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this.isDidMount = false;

        //jrpc 三个板块监听取消
        this._cancle();
        this.timer && clearInterval(this.timer);
        this.timerConnect && clearInterval(this.timerConnect);

        // Orientation.removeOrientationListener(this._orientationDidChange);
        Orientation.removeOrientationListener(this._orientationDidChange.bind(this));
        // DeviceEventEmitter.emit('pageName','沪深');
        this.getDataForKChartListener && this.getDataForKChartListener.remove();
        this.getDataListener && this.getDataListener.remove();
        this.getFuTu1DataForMin && this.getFuTu1DataForMin.remove();
        this.getChengjiaoliangForMin && this.getChengjiaoliangForMin.remove();
        this.getTimeListener && this.getTimeListener.remove();
        this.getfuTu1DataForKChartListener && this.getfuTu1DataForKChartListener.remove();
        this.getfuTu2DataForKChartListener && this.getfuTu2DataForKChartListener.remove();
        this.listenerKLine && this.listenerKLine.remove();
        this.listenerSearchPage && this.listenerSearchPage.remove();
        this.toPortrait && this.toPortrait.remove();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        //离开页面事重置默认缩放比例
        // this.getKLineInDetailPageRef()._onChangeDefaultIndex(5);
        this.refs
            && this.refs.KLineInDetailPage
            && this.refs.KLineInDetailPage.refs
            && this.refs.KLineInDetailPage.refs.wrappedInstance
            && this.refs.KLineInDetailPage.refs.wrappedInstance.getWrappedInstance()
            && this.refs.KLineInDetailPage.refs.wrappedInstance.getWrappedInstance()._onChangeDefaultIndex(5);


        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        // NetInfo.removeEventListener("change", this._handleConnectivityChange());
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.quoteErrMesListener && this.quoteErrMesListener.remove();
        this.netChange && this.netChange.remove();
    }
    /**
     * 是否需要刷新页面的方法
     * */
    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.obj !== this.state.obj) {
            getStockCodeType(nextState.obj, (value) => {
                if (value === 0) {
                    this.setState({
                        type: 0,
                    });
                } else {
                    this.setState({
                        type: 1,
                    });
                }
            });
        }
        return true;
    }

    onBackAndroid = () => {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        this._onBack();
        return true;
    };

    _onBack() {
        if (this.props.navigation.state.params.back) {
            this.props.navigation.state.params.back(this.props.navigation)
            return;
        }
        Navigation.pop(this.props.navigation);
        //一些数据的重置
        ShareSetting.reset();
        Orientation.lockToPortrait();
        //发送到搜索页面，但是没有处理true的逻辑
        DeviceEventEmitter.emit('getFocus', true);
    }

    returnFromLand = (landObj) => {
        if (this.refs.KLineInDetailPage && this.getKLineInDetailPageRef()) {
            this.getKLineInDetailPageRef()._onChangeEmpower(ShareSetting.getCurrentEmpowerName());
        }
        this.setState({
            // Obj: landObj.obj,
            obj: landObj.obj,
            objs: landObj.objs,
            ZhongWenJianCheng: landObj.ZhongWenJianCheng,
            f10Url: this.makeF10Url(landObj.obj),
            earningsUrl: this.makeEarningUrl(landObj.Obj)
        });
    }

    /**
     * 横竖屏切换的监听
     * */
    _orientationDidChange(orientation) {
        //现在已经固定了竖屏
        //现在这个get,routeName一直是为空的，所以里面的代码不会执行，
        AsyncStorage.getItem('routeName').then((value) => {
            if (orientation == 'LANDSCAPE') {
                if (this.state.curGraphIndex == 0)
                    this.refs.MinInDetailPage && this.getMinInDetailPageRef().cancel();
                else
                    this.refs.KLineInDetailPage && this.getKLineInDetailPageRef().cancel();
            }
            else if (orientation === 'PORTRAIT') {
                if (this.state.curGraphIndex == 0)
                    this.refs.MinInDetailPage && this.getMinInDetailPageRef().query();
                else
                    this.refs.KLineInDetailPage && this.getKLineInDetailPageRef().query();
                this.setState({
                    curGraphIndex: ShareSetting.getCurGraphIndex(),
                    isDisplayBuySellComponent: ShareSetting.isDisplayBuySellComponent()
                });
                this.refs.dropDown && this.getDropdownRef().select(ShareSetting.getCurGraphIndex() - _secondButtonsThreshold);
            }
        });

    }

    _setImageName = (main, fuTu) => {
        this.setState({ mainData: main, firstData: fuTu, zhuTuName: main, fuTu1Name: fuTu })
        DeviceEventEmitter.emit('updataListener', main, fuTu, this.state.secondData);
    }

    substringObj() {
        let objstr = this.state.obj ? this.state.obj : this.props.navigation.state.params.obj;
        return objstr.substring(2, objstr.length);
    }
    _renderTitle() {
        let permission = UserInfoUtil.getUserPermissions();

        //????中文简称： this.state.ZhongWenJianCheng 上证指数 ，strs = ["上证指数"],不知道为什么转成数组？？？
        let strs = this.state.ZhongWenJianCheng && this.state.ZhongWenJianCheng.split("(");
        // let strName = "";
        if (strs) {
            strName = strs[0];
        }
        if (!strName) {
            strName = this.headTitle.state.ZhongWenJianCheng;
        }
        let strTitleObj = this.state.obj && (this.state.obj).substring(2, 8);//002907股票代码
        let strTitleParams = this.props.navigation.state.params.obj && (this.props.navigation.state.params.obj).substring(2, 8);//SZ000651完整的股票代码//这个有时候为undefined
        return (
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {this.state.objs.length > 1 ? ( //如果有多只股票，才显示向前和向后的箭头按钮
                        <TouchableOpacity
                            style={{ marginRight: 10, height: 40, width: 40, alignItems: 'flex-end', justifyContent: 'center' }}
                            onPress={() => {

                                this.refs.KLineInDetailPage && this.getKLineInDetailPageRef().resetCheckPriceState();//重置K线图的方法
                                if (this.changeFlag) {
                                    this.changeFlag = false;
                                    this._cancle();
                                    if (parseInt(this.loopStock) === 0) {
                                        this.loopStock = this.state.objs.length - 1;
                                        let data = this.state.objs[this.loopStock];

                                        if (data) {
                                            //直接设置修改当前页面数据,这里可能会出一些注册解注册的问题
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng:
                                                    data.ZhongWenJianCheng,
                                                isShowChaJiaTime: false,
                                                f10Url: this.makeF10Url(data.Obj),//修改f10
                                                earningsUrl: this.makeEarningUrl(data.Obj)//修改收益统计
                                            }, () => {
                                                //1秒后将this.changeFlag 设置为false
                                                this.timer = setTimeout(() => {
                                                    this.changeFlag = true;
                                                    clearTimeout(this.timer);
                                                    this.timer = undefined;
                                                }, 1000);

                                            });
                                        } else {
                                            //1秒后将this.changeFlag 设置为false
                                            this.timer = setTimeout(() => {
                                                this.changeFlag = true;
                                                clearTimeout(this.timer);
                                                this.timer = undefined;
                                            }, 1000);
                                        }
                                    } else {
                                        //如果记录的股票位置是不是第0个，loopStock自减
                                        //这一块代码可以和上面合并一下，只是增加一下loopStock位置的判断逻辑，下面的代码一样
                                        this.loopStock--;
                                        let data = this.state.objs[this.loopStock];
                                        if (data) {
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng:
                                                    data.ZhongWenJianCheng,
                                                isShowChaJiaTime: false,
                                                f10Url: this.makeF10Url(data.Obj),
                                                earningsUrl: this.makeEarningUrl(data.Obj)
                                            }, () => {
                                                this.timer = setTimeout(() => {
                                                    this.changeFlag = true;
                                                    clearTimeout(this.timer);
                                                    this.timer = undefined;
                                                }, 1000);
                                            });
                                        } else {
                                            this.timer = setTimeout(() => {
                                                this.changeFlag = true;
                                                clearTimeout(this.timer);
                                                this.timer = undefined;
                                            }, 1000);
                                        }
                                    }

                                }

                            }}
                        >
                            <Image
                                source={require('../../images/icons/pre_btn.png')}
                            />
                        </TouchableOpacity>
                    ) : null}
                    <View
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View style={{
                            flex: 1, flexDirection: 'row',
                            justifyContent: 'center', alignItems: 'center'
                        }}>
                            <Text style={{ color: baseStyle.BLACK, fontSize: 16 }}>{strName}</Text>
                            <Text style={{ marginLeft: 10, color: baseStyle.BLACK, fontSize: 16 }}>{this.state.obj ? strTitleObj : strTitleParams}</Text>
                        </View>
                        {this.state.isShowChaJiaTime
                            //isShowChaJiaTime 等于 true时,表示查价，顶部title显示kline_time 2020/05/03格式
                            ?
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 12, color: '#999999' }}>{this.state.kline_time}</Text>
                            </View>
                            :
                            this.props.ShiJian === 0 ? (
                                <View />
                            )
                                : (
                                    <View style={{
                                        flex: 1, flexDirection: 'row',
                                        justifyContent: 'center', alignItems: 'flex-start'
                                    }}>
                                        <HeadTitleTime navigation={this.props.navigation}
                                            ref={ref => (this.headTitle = ref)}
                                            time={this.props.ShiJian}//传入的时间
                                            timeColor={'#999999'}
                                            updateParentState={this.updateState.bind(this)}
                                            params={this.postLoad && (this.state.obj ? { obj: this.state.obj } : { obj: this.props.navigation.state.params.obj })} />
                                    </View>
                                )}
                    </View>
                    {this.state.objs.length > 1 ? (
                        <TouchableOpacity
                            style={{ marginLeft: 10, height: 40, width: 40, alignItems: 'flex-start', justifyContent: 'center' }}
                            onPress={() => {

                                this.refs.KLineInDetailPage && this.getKLineInDetailPageRef().resetCheckPriceState()
                                if (this.changeFlag) {
                                    this.changeFlag = false;
                                    this._cancle();
                                    if (
                                        parseInt(this.loopStock) ===
                                        this.state.objs.length - 1
                                    ) {//如果记录的股票位置是最后一个，//点击的时候则修改股票位置为股票列表为第一位
                                        this.loopStock = 0;
                                        let data = this.state.objs[this.loopStock];////则提取当前数据为objs中的第一个股票信息
                                        if (data) {
                                            //直接设置修改当前页面数据,这里可能会出一些注册解注册的问题
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng:
                                                    data.ZhongWenJianCheng,
                                                showPriceBox: false,
                                                f10Url: this.makeF10Url(data.Obj),
                                                earningsUrl: this.makeEarningUrl(data.Obj)
                                            }, () => {
                                                //1秒后将this.changeFlag 设置为false
                                                this.timer = setTimeout(() => {
                                                    this.changeFlag = true;
                                                    clearTimeout(this.timer);
                                                    this.timer = undefined;
                                                }, 1000);
                                            });
                                        } else {
                                            //1秒后将this.changeFlag 设置为false
                                            this.timer = setTimeout(() => {
                                                this.changeFlag = true;
                                                clearTimeout(this.timer);
                                                this.timer = undefined;
                                            }, 1000);
                                        }
                                    } else {
                                        //如果记录的股票位置是不是最后一个，loopStock自增
                                        //这一块代码可以和上面合并一下，只是增加一下loopStock位置的判断逻辑，下面的代码一样（上一只股票和下一只股票的逻辑都可以合并成一个方法）
                                        this.loopStock++;
                                        let data = this.state.objs[this.loopStock];
                                        if (data) {
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng:
                                                    data.ZhongWenJianCheng,
                                                showPriceBox: false,
                                                f10Url: this.makeF10Url(data.Obj),
                                                earningsUrl: this.makeEarningUrl(data.Obj)
                                            }, () => {
                                                this.timer = setTimeout(() => {
                                                    this.changeFlag = true;
                                                    clearTimeout(this.timer);
                                                    this.timer = undefined;

                                                }, 1000);
                                            });
                                        } else {
                                            this.timer = setTimeout(() => {
                                                this.changeFlag = true;
                                                clearTimeout(this.timer);
                                                this.timer = undefined;

                                            }, 1000);
                                        }

                                    }

                                }

                            }}
                        >
                            <Image
                                source={require('../../images/icons/next_btn.png')}
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    }

    openNewsPage(title, news) {
        let data = { title: news.xwbt, source: news.xwly, date: news.xwrq, url: cyURL.urlDetailNews + '?url=' + news.url };
        Navigation.navigateForParams(this.props.navigation, 'NewsDetailPage', { news: data, title })
    }


    openAnnouncementPage(title, news) {

        let data = { title: news.ggbt, source: news.ggly, date: news.ggrq, url: cyURL.urlNews + news.fjdz.substring(0, 1) == '/' ? news.fjdz.substring(1) : news.fjdz };

        // 判断是android版时直接下载pdf后打开
        if (Platform.OS === 'android' && data.url.substr(-4).toLowerCase() === '.pdf') {
            Navigation.navigateForParams(this.props.navigation, 'PDFPage', { news: data, title: data.title })
        } else {
            Navigation.navigateForParams(this.props.navigation, 'NewsDetailPage', { news: data, title })
        }
        // Platform.OS === 'android' && news.Context.substr(-4).toLowerCase() === '.pdf' ? this.props.navigator.push({
        //     component: 'PDFPage',
        //     news,
        //     title: news.title
        // }) : this.props.navigator.push({component: 'NewsDetailPage', news, title})
    }

    _isPersonalStock() {
        // let isPersonS = UserInfoUtil.isPersonStock(this.props.navigation.state.params.Obj);
        let isPersonS = UserInfoUtil.isPersonStock(this.state.obj);
        return isPersonS;
        // const {PersonalStockList} = this.props.statePersonalStockList
        // let foundStock = PersonalStockList.indexOf(this.props.Obj)
        // if (foundStock > -1) {
        //   return true
        // }
        //
        // return false
    }

    _addPersonalStock() {
        // const {addPersonalStock} = this.props.actions
        // addPersonalStock({Obj: this.state.obj})
        if (this.state.obj && this.state.obj !== undefined) {
            UserInfoUtil.addPersonStock(this.state.obj, () => {
                sensorsDataClickObject.addStock.stock_code = this.state.obj;
                sensorsDataClickObject.addStock.stock_name = this.state.ZhongWenJianCheng;
                sensorsDataClickObject.addStock.page_source = '个股详情';//第一版先这么写，产品想绘制用户打开个股详情的路径
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addStock);
                this.refs.toast && this.refs.toast.show('已添加')
            }, (error) => {
                this.refs.toast && this.refs.toast.show(error)
            });
        }
    }

    _removePersonalStock() {
        // const {removePersonalStock} = this.props.actions
        // removePersonalStock({Obj: this.state.obj})
        if (this.state.obj && this.state.obj !== undefined) {
            UserInfoUtil.deletePersonStock(this.state.obj, () => {
                this.refs.toast && this.refs.toast.show('已删除')
            }, () => {
                this.refs.toast && this.refs.toast.show('移除失败')
            })
        }
    }

    /**
     * 获取当前页面F10的Url
     * */
    makeF10Url(obj) {
        if (obj === undefined) return;
        var market = obj.substr(0, 2);
        var code = obj.substr(2, 6);
        //console.warn('market===='+market,'code ==='+code);
        var url = `https://emh5.eastmoney.com/html/?color=w&fc=${code}${
            market == 'SH' ? '01' : market == 'SZ' ? '02' : '00'
            }`;
        return url;
    }

    makeEarningUrl(obj) {
        if (obj === undefined) return;
        var url = cyURL.ydhxgProdUrl + 'sytj?code=' + obj
        return url;
    }


    _displayBuySellComponent() {
        let b = !this.state.isDisplayBuySellComponent;
        this.setState({ isDisplayBuySellComponent: b });
        ShareSetting.setDisplayStateBuySellComponent(b)
    }

    _onChangeTab(index, childElement) {

        if (index !== undefined) {
            this.setState({ wudangIndex: index })
            ShareSetting.setWuDangIndex(index)
        }
    }

    _dataCallback(priceData, previousPriceData) {
        this.setState({ priceboxData: priceData, previousPriceboxData: previousPriceData });
    }

    // 用于接收子页面回传数据
    returnData = array => {
        // ShareSetting.isSpecialFormula(this.state.zhuTuName)
        let main = '';
        let first = '';
        let second = '';
        array.map((data, i) => {
            if (i === 0) {
                main = data;
            }
            if (i === 1) {
                first = data;
            }
            if (i === 2) {
                second = data;
                this.setState({ mainData: main, firstData: first, secondData: second })
                this.setState({ zhuTuName: main, fuTu1Name: first, fuTu2Name: second })
                DeviceEventEmitter.emit('updataListener', main, first, second);
                this.sensorsFiltrateAdCIndex(main, first, second)
            }


        });
    };




    sensorsFiltrateAdCIndex(main, first, second) {


        sensorsDataClickObject.adCIndex.main_name = main;
        sensorsDataClickObject.adCIndex.main_type = '主图指标';

        sensorsDataClickObject.adCIndex.futu1_name = first;
        sensorsDataClickObject.adCIndex.futu1_type = '副图1';

        sensorsDataClickObject.adCIndex.futu2_name = second;
        sensorsDataClickObject.adCIndex.futu2_type = '副图2';
        sensorsDataClickObject.adCIndex.combine_results = main + '+' + first + '+' + second;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adCIndex);

    }



    // 弹出指标选择页面
    choseNormPage = () => {
        this.props.navigation.navigate('ChoseChartNorm', {
            choseData: {
                main: { str: this.state.zhuTuName },
                vice: { str: this.state.firstData },
                vice1: { str: this.state.secondData }
            },
            returnData: this.returnData.bind(this)
        });
    };

    getButtonsFlex() {
        let fl = 1;

        if (ShareSetting.getDeviceWidthPX() > 1080) {
            fl = 0.5;
        }
    }

    _onDropDownMenu(idx, lableText) {//下拉选择的图表，4，5，6，7，8个图表
        sensorsDataClickObject.adKClick.stock_code = this.state.obj;
        sensorsDataClickObject.adKClick.function_zone = '分时K线区';
        sensorsDataClickObject.adKClick.content_name = lableText;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)

        this.setState({ curGraphIndex: Number(idx) + _secondButtonsThreshold });
        ShareSetting.setCurGraphIndex(Number(idx) + _secondButtonsThreshold);

    }

    _onMinMainDropDownMenu(idx, lableText) {//设置分时图的指标
        this.setState({ curMinMainFormulaIdx: idx });
        this.sensorsAddIndex("主图指标", lableText, 'K线分时')
    }

    _onMinFutuDropDownMenu(idx, lableText) {
        this.setState({ curMinFutuFormulaIdx: idx });
        this.sensorsAddIndex("副图指标", lableText, 'K线分时')
    }


    sensorsAddIndex(type, name, entrance) {
        sensorsDataClickObject.addIndex.index_name = name;
        sensorsDataClickObject.addIndex.index_type = type;
        sensorsDataClickObject.addIndex.entrance = entrance;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addIndex);

    }


    //新增下拉控件方法
    renderRow4ModalDropdown(rowData, rowID, highlighted, width) {
        let last = parseInt(rowID) === this.optionDropdown.length - 1;
        return (
            <View style={{ width: width, backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
                <View style={{ justifyContent: "center", alignItems: "center", height: this.lineHeightDropdown }}>
                    <Text style={{ color: highlighted ? baseStyle.WHITE : baseStyle.WHITE, fontSize: 12 }}>{rowData}</Text>
                </View>
                {last ? null : <View style={{ height: this.underlineHeightDropdown, backgroundColor: "#999999" }} />}
            </View>
        );
    }
    getPeriodText() {
        let text = '1day';
        if (this.state.curGraphIndex === 1) text = '1day';
        if (this.state.curGraphIndex === 2) text = 'week';
        if (this.state.curGraphIndex === 3) text = 'month';
        if (this.state.curGraphIndex === 4) text = '1min';
        if (this.state.curGraphIndex === 5) text = '5min';
        if (this.state.curGraphIndex === 6) text = '15min';
        if (this.state.curGraphIndex === 7) text = '30min';
        if (this.state.curGraphIndex === 8) text = '60min';

        return text;
    }

    onMinDataReady(data) {
        const { setMinChartData } = this.props.actions
        setMinChartData(this.state.obj, data)
    }

    getKLineInDetailPageRef() {
        return this.refs && this.refs.KLineInDetailPage && this.refs.KLineInDetailPage.getWrappedInstance()
    }

    getMinInDetailPageRef() {
        return this.refs && this.refs.MinInDetailPage && this.refs.MinInDetailPage.getWrappedInstance()
    }

    getDropdownRef() {
        return this.refs && this.refs.dropDown && this.refs.dropDown.getWrappedInstance()
    }

    selectMinMainDropDown(index) {
        this.refs && this.refs.dropDownMinMain && this.refs.dropDownMinMain.getWrappedInstance().select(index);

    }

    _popToSearchPage() {
        // Navigation.pushForParams(this.props.navigation, 'SearchPage', { 'fromPage': 'DetailPage' });
        jumpPage(this.props.navigation, 'SearchPage', { 'fromPage': 'DetailPage', entrance: '股票详情' });
        sensorsDataClickObject.searchClick.entrance = 'K线图'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick)
    }
    _scrollToEnd(e) {
        let offsetY = e.nativeEvent.contentOffset.y; //滑动距离
        let contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
        let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
        if (offsetY + oriageScrollHeight + 1 >= contentSizeHeight) {
            DeviceEventEmitter.emit('scroll2End');
        }
    }
    _onScrollEndDrag(e) {
        let offsetY = e.nativeEvent.contentOffset.y; //滑动距离
        let contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
        let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
        if (offsetY + oriageScrollHeight + 1 >= contentSizeHeight) {
            DeviceEventEmitter.emit('scroll2End');
        }
    }
    //涨跌榜 排序按钮
    changeListZF() {
        if (this.state.zhangF === 2) {
            this.setState({ xianJ: 2, zhangF: 0 });
        } else {
            this.setState({ zhangF: this.state.zhangF === 1 ? 0 : 1 });
        }
    }
    //最新价排序按钮
    changeListXJ() {
        if (this.state.xianJ === 2) {
            this.setState({ zhangF: 2, xianJ: 0 });
        } else {
            this.setState({ xianJ: this.state.xianJ === 1 ? 0 : 1 });
        }
    }
    //分时 日k 周k 月k 分类
    renderKLineDropDown() {
        let tabs = [
            ShareSetting.getGraphPeriodNameByIndex(0),
            ShareSetting.getGraphPeriodNameByIndex(1),
            ShareSetting.getGraphPeriodNameByIndex(2),
            ShareSetting.getGraphPeriodNameByIndex(3)];
        return (
            <SegmentedView tabs={tabs} selectedIndex={this.state.curGraphIndex} tabOnChange={index => {
                if (index < _secondButtonsThreshold) {
                    this.refs.dropDown && this.getDropdownRef().select(-1);
                }
                if (index == 0) {
                    this.state.isShowChaJiaTime = false;
                }
                this.setState({ curGraphIndex: index });
                ShareSetting.setCurGraphIndex(index);
                this._dataCallback(null, null);//点击tab切换时,取消查价的十字光标和查价
                this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();

                this.sensorsAppear(index)

            }} />
        );
    }


    sensorsAppear(index) {
        switch (index) {
            case 0:
                sensorsDataClickObject.adKClick.content_name = '分时';
                break;
            case 1:
                sensorsDataClickObject.adKClick.content_name = '日K';
                break;
            case 2:
                sensorsDataClickObject.adKClick.content_name = '周K';
                break;

        }
        sensorsDataClickObject.adKClick.stock_code = this.state.obj;
        sensorsDataClickObject.adKClick.function_zone = '分时K线区';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)
    }


    renderHeader() {
        let permission = UserInfoUtil.getUserPermissions();//用户权限
        let dropDownTextclr = '#000000';
        let selectedDropDown = false; //是否显示分时下面的那根横线
        let PageHeaderHeight = ShareSetting.getPageHeaderHeight(ShareSetting.getStatusBarHeightDP()) / PixelRatio.get();
        let dropDownBKColor = baseStyle.WHITE;
        if (this.state.curGraphIndex > 3) {
            selectedDropDown = true;
            dropDownTextclr = '#F92400';//带dropDown下拉框的文字样式。选中后是红色，未选中是黑色
        }
        let heightPeriodTab = 35;

        let personalButton;
        let screenWidth = Dimensions.get('window').width;
        let screeHeight = Dimensions.get('window').height;
        if (screenWidth > screeHeight) {
            screenWidth = screeHeight;
        }
        let tabBarSingleWidth = screenWidth / 6;//将分时的标题栏平均分为6部分
        let tabBarSingleWidthFormulaPicker = screenWidth / 6 + 10;//分时下边可下拉指标的宽度，例如：分时走势
        let mainoptions = ShareSetting.getMinMainFormula();//'分时走势', '分时冲关'
        let futuoptions = ShareSetting.getMinFutuFormula();//'成交量', '资金流入'

        // 自选股按钮,判断是否是自选股
        personalButton = this._isPersonalStock() ? (
            <Button onPress={() => this._removePersonalStock()}>
                <Image source={require('../../images/icons/detail2_personal_remove.png')} />
            </Button>
        ) : (
                <Button onPress={() => this._addPersonalStock()}>
                    <Image source={require('../../images/icons/detail2_personal_add.png')} />
                </Button>
            );

        return (

            <View style={{ flex: 1 }}>
                <ScrollView
                    // scrollEnabled={true}
                    scrollEnabled={this.state.enableScrollViewScroll}//ScrollView是否可以滚动
                    canCancelContentTouches={this.state.enableScrollViewScroll}
                    showsVerticalScrollIndicator={false}
                    //stickyHeaderIndices={[4]}
                    style={{ backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR, flex: 1 }}
                    scrollEventThrottle={16}
                    // overScrollMode = {this.state.scrollTouch}
                    onMomentumScrollEnd={(e) => this._scrollToEnd(e)}
                    onScrollEndDrag={(e) => this._onScrollEndDrag(e)}
                    onScroll={(event) => {
                        let offsetY = event.nativeEvent.contentOffset.y;//滑动的偏移量
                        let contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
                        let oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
                        let offsetYMax = contentSizeHeight - oriageScrollHeight;

                        if (offsetY + 1 > offsetYMax && this.maybeLock && this.state.type === 0) {//this.maybeLock好像没有什么用
                            //判断滑动到底部
                            this.setState({
                                enableScrollViewScroll: false
                            });
                        }
                        //K线相关触摸事件
                        if (this.refs != undefined && this.refs.KLineInDetailPage != undefined) {
                            this.refs.KLineInDetailPage && this.getKLineInDetailPageRef()._onGestureEnd4DetailPageInDZHKlineChart()
                        }
                    }}>
                    {/** 个股价,大数字行情显示和自选股按钮视图 */}
                    <View style={{
                        backgroundColor: '#fff',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingLeft: 15,
                        paddingTop: 15,
                        paddingRight: 12,
                        paddingBottom: 15,
                    }}>
                        <View style={{ flex: 1, }}>
                            <StockPriceView
                                navigation={this.props.navigation}
                                onData={(data) => {
                                    //里面回调出来的方法，现在Android外层应该没有使用到的地方
                                    if (this.state.type !== data.LeiXing) {
                                        // this.setState({type: data.LeiXing})
                                    }
                                }}
                                ref={(ref) => this.spv = ref}
                                params={this.preLoad && this.state.obj && { obj: this.state.obj }}
                                dynaData={this.state}
                                priceboxData={this.state.priceboxData}
                                previousPriceboxData={this.state.previousPriceboxData}
                                isHorz={0} />
                        </View>
                        <View style={{
                            position: 'absolute',
                            right: 12,
                        }}>
                            {personalButton}
                        </View>
                    </View>

                    {/** 最新价 */}
                    <StockInfoView
                        navigation={this.props.navigation}
                        type={this.state.type}
                        onData={data => {
                            if (this.state.type !== data.LeiXing) {
                                // this.setState({ type: data.LeiXing });
                            }
                        }}
                        ref={ref => (this.sis = ref)}
                        params={
                            this.preLoad &&
                            this.state.obj && { obj: this.state.obj }
                        }
                        dynaData={this.state}
                        priceboxData={this.state.priceboxData}
                        previousPriceboxData={this.state.previousPriceboxData}
                        isHorz={0}
                    />

                    <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6, }} />

                    <View style={{ flexDirection: 'column' }}>

                        <View style={{ flexDirection: 'row', height: 45 }}>
                            <View style={{ width: tabBarSingleWidth * _secondButtonsThreshold }}>
                                {this.renderKLineDropDown()}
                            </View>

                            <View style={{ alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 5, width: tabBarSingleWidth }}>
                                <ModalDropdown ref='dropDown' forwardRef
                                    defaultValue={'1分'}
                                    defaultIndex={this.state.curGraphIndex - _secondButtonsThreshold}
                                    onSelect={(idx, value) => this._onDropDownMenu(idx, value)}

                                    style={{
                                        width: tabBarSingleWidth,
                                        justifyContent: "center",
                                    }}
                                    textStyle={{
                                        textAlign: "center",
                                        fontSize: 15,
                                        color: dropDownTextclr
                                    }}
                                    buttonStyle={{
                                        height: 40,
                                        fontSize: 16,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    dropdownStyle={{
                                        height: this.heightDropdown,
                                        width: this.widthDropdown,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginTop: 19,
                                        marginRight: 10
                                    }}
                                    options={this.optionDropdown}
                                    renderRow={(rowData, rowID, highlighted) => this.renderRow4ModalDropdown(rowData, rowID, highlighted, this.widthDropdown, parseInt(rowID) === this.optionDropdown.length - 1)}

                                    itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
                                    itemActiveOpacity={0.5}
                                />
                                {selectedDropDown && <View style={{ width: 30, height: 2, borderRadius: 2.5, marginTop: 0, marginLeft: 10, backgroundColor: '#F92400' }} />}

                            </View>

                            {/* 设置按钮， 需要设置YdScrollableTabBar的width -50*/}
                            <TouchableOpacity
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 40,
                                    width: 40,
                                    marginLeft: 10,
                                }}
                                hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
                                onPress={() => {
                                    {/*alert('设置页面')*/ }
                                    Navigation.navigateForParams(this.props.navigation, 'KLineSetPage', { code: this.state.obj, curGraphIndex: this.state.curGraphIndex })
                                    sensorsDataClickObject.adKClick.stock_code = this.state.obj;
                                    sensorsDataClickObject.adKClick.function_zone = '分时K线区';
                                    sensorsDataClickObject.adKClick.content_name = '设置';
                                    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)

                                }}>
                                <Image source={require('../../images/icons/hq_kSet_set.png')} />

                            </TouchableOpacity>

                        </View>

                        <View style={{ height: 1, backgroundColor: baseStyle.NO_CONTENT_BACKGROUND_COLOR }}></View>
                        {
                            this.state.curGraphIndex <= 0 ?
                                <View onPress={{}} style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, paddingBottom: 6 }}>
                                    {permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
                                        //如果权限大于=4星，并且是属于个股股票,并且不是B股,显示分时走势和分时冲关
                                        <View style={{
                                            paddingLeft: 0,
                                            marginLeft: 5,
                                            width: tabBarSingleWidthFormulaPicker,
                                            borderWidth: 1,
                                            borderColor: '#0000001a',
                                            justifyContent: 'center'
                                        }}>

                                            <ModalDropdown
                                                ref='dropDownMinMain' forwardRef
                                                defaultValue={ShareSetting.getMinMainFormulaNameByIndex(0)}
                                                defaultIndex={0}
                                                onSelect={(idx, value) => this._onMinMainDropDownMenu(idx, value)}
                                                style={{
                                                    // width: 63,
                                                    justifyContent: "center"
                                                }}
                                                textStyle={{
                                                    textAlign: "center",
                                                    fontSize: 12,
                                                    color: '#000000'
                                                }}
                                                buttonStyle={{
                                                    height: 20,
                                                    justifyContent: "center",
                                                    alignItems: "center"
                                                }}
                                                dropdownStyle={{
                                                    height: 80,
                                                    width: 70,
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    marginTop: 8,
                                                    marginRight: 0
                                                }}
                                                options={mainoptions}
                                                renderRow={(rowData, rowID, highlighted) =>
                                                    this.renderRow4ModalDropdown(rowData, rowID, highlighted, 70)
                                                }
                                                itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
                                                itemActiveOpacity={0.5}
                                            />
                                        </View>
                                        : null
                                    }
                                    {this.state.curMinMainFormulaIdx == 1 && permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
                                        //如果选择分时冲关,权限大于4，个股，不是B股,显示一冲
                                        <Text style={{ fontSize: 10, marginLeft: 15, color: this.state.zhangfuColor }}>
                                            {'一冲：' + this.state.yichong}
                                        </Text>
                                        :
                                        <Text style={{ fontSize: 10, marginLeft: 15, color: '#828282' }}>
                                            {'时间：' + this.state.shijian}
                                        </Text>
                                    }
                                    {this.state.curMinMainFormulaIdx == 1 && permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
                                        ////如果选择分时冲关,权限大于4，个股，不是B股,显示双冲
                                        <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.zhangfuColor }}>
                                            {'双冲：' + this.state.erchong}
                                        </Text>
                                        :
                                        <Text style={{ fontSize: 10, marginLeft: 10, color: '#828282' }}>
                                            {'现价：' + this._keepTwoDecimal(this.state.shijia)}
                                        </Text>
                                    }
                                    {/* <Text style={{ fontSize: 10, marginLeft: 10, color: '#828282' }}>
                                    {this.state.curMinMainFormulaIdx == 1?'二冲：' + this.state.erchong:'现价：' + this._keepTwoDecimal(this.state.shijia)}
                                    </Text> */}
                                    {
                                        this.state.curMinMainFormulaIdx == 1 && permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ? this.state.type === 1 ?
                                            //这个判断好像有点问题:this.state.type === 1重复了？？？
                                            <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.junjiaColor }}>{'现价：' + this._keepTwoDecimal(this.state.shijia)}</Text>
                                            : null
                                            :
                                            this.state.type === 1 ?
                                                <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.junjiaColor }}>{'均价：' + this._keepTwoDecimal(this.state.junjia)}</Text>
                                                : null

                                    }
                                    {this.state.curMinMainFormulaIdx == 1 && permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ? <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.junjiaColor }}>{'均价：' + this._keepTwoDecimal(this.state.junjia)}</Text>
                                        : <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.zhangfuColor }}>{'涨幅：' + this.state.zhangfu}</Text>
                                    }

                                    <View style={{
                                        position: 'absolute',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        width: tabBarSingleWidthFormulaPicker,
                                        right: 0,
                                        // bottom: this.state.minFutuFloatButtonBottom
                                    }}>
                                        {has(ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx)) && this.state.curMinMainFormulaIdx == 1 //分时冲关
                                            ?
                                            <TouchableOpacity onPress={() => {
                                                Navigation.navigateForParams(this.props.navigation, 'TargetStudyPage', {
                                                    name: ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx),
                                                    fromPage: 'DetailPage',
                                                    toPortrait: this._backToPortrait.bind(this),
                                                })
                                            }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    // height:30,
                                                    width: 75,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#ffffff'
                                                }}>
                                                    <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                    <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                </View>
                                            </TouchableOpacity>
                                            :
                                            null
                                        }
                                    </View>

                                </View>
                                :
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10, paddingLeft: 15, height: 30 }}>
                                    {/*当curGraphIndex > 0 时，下面的视图，这时点击指标是去选择指标
                                    并且判断是否显示响应的数据和学指标
                                    */}
                                    <TouchableOpacity onPress={() => { this.choseNormPage() }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            height: 20,
                                            borderWidth: 1,
                                            borderColor: 'rgba(153,153,153,0.3)',
                                            borderRadius: 2,
                                            alignItems: 'center',
                                            paddingRight: 6,
                                            paddingLeft: 6

                                        }}>
                                            <Text style={{ color: '#333333', marginLeft: 6, fontSize: 12 }}>{this.state.zhuTuName}</Text>
                                            <Image style={{ width: 9, height: 5, marginLeft: 6 }} source={require('../../images/icons/zhibiao_jiantou.png')} />
                                        </View>
                                    </TouchableOpacity>
                                    {
                                        this.state.maData.length > 0 ? (
                                            <View style={{ flexDirection: 'row', flex: 1 }}>

                                                {this.state.maData.map(
                                                    (data, index) => (
                                                        <Text style={{ fontSize: 10, marginLeft: 10, color: '#' + this.state.colorData[index] }}>
                                                            {index > 2 ? null : data}
                                                        </Text>
                                                    ))}

                                            </View>
                                        ) : (
                                                <View style={{ flexDirection: 'row', flex: 1 }} />
                                            )
                                    }


                                    {has(this.state.zhuTuName) ?
                                        <Image style={{ width: 3, height: 20 }} source={require('../../images/icons/line_icon.png')} />
                                        :
                                        null
                                    }
                                    {has(this.state.zhuTuName) ?
                                        <TouchableOpacity onPress={() => {
                                            {/*if(this.state.zhuTuName == '趋势彩虹'*/ }
                                            {/*&& this.state.fuTu1Name == '量能黄金'*/ }
                                            {/*&&this.state.fuTu2Name == '周期拐点'){*/ }
                                            {/*Navigation.navigateForParams(this.props.navigation,'TargetStudyPage',{name:'趋势三部曲',fromPage:'DetailPage'})*/ }
                                            {/*}else{*/ }
                                            {/**/ }
                                            {/*}*/ }
                                            Navigation.navigateForParams(this.props.navigation, 'TargetStudyPage', {
                                                name: this.state.zhuTuName,
                                                fromPage: 'DetailPage',
                                                toPortrait: this._backToPortrait.bind(this),
                                            })
                                        }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                height: 30,
                                                width: 75,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                            </View>
                                        </TouchableOpacity>
                                        :
                                        null
                                    }
                                </View>

                        }

                        <View style={{ height: 1, backgroundColor: baseStyle.NO_CONTENT_BACKGROUND_COLOR }}></View>

                        {
                            this.state.curGraphIndex > 0 ? (
                                //curGraphIndex大于0时的K线图2，3，4，5，6，7，8
                                <View>
                                    <View style={{
                                        height: graphHeight,
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        marginLeft: 15,
                                        marginRight: 15,
                                        // marginLeft: !this.state.curGraphIndex && this.state.curGraphIndex > 0 ? ShareSetting.getKlineLeftRightMargin() : 0,
                                        // marginRight: !this.state.curGraphIndex && this.state.curGraphIndex > 0 ? ShareSetting.getKlineLeftRightMargin() : 0
                                    }}>
                                        <DZHKlineChart ref='KLineInDetailPage' forwardRef
                                            isLandscape={'false'}
                                            callbackScrollTouch={item => {
                                                this.callbackScrollTouch(item);//判定外层视图是否能滚动
                                            }}
                                            tabName={ShareSetting.getGraphPeriodNameByIndex(this.state.curGraphIndex)}//选择的K线图
                                            callback={this._dataCallback.bind(this)}//K线图中传出的触摸的十字价格数据
                                            params={this.state.obj && {
                                                obj: this.state.obj,//股票代码
                                                period: this.getPeriodText(),//获取分时图的对应转换
                                                type: this.state.type//股票类型
                                            }}
                                            name={this.props.navigation.state.params.ZhongWenJianCheng}//中文简称
                                            navigation={this.props.navigation} />

                                        {this._expandedView()}
                                        {this._firstFuTu_TuLiQu()}
                                        {this._secondFuTu_TuLiQu()}
                                        {/* {!this.prompt && <PopupPromptView ref={ref => this.prompt = ref} />} */}
                                        {<PopupPromptView ref={ref => this.prompt = ref} />}

                                        {/*{this.changeToLandscapeButton()}*/}



                                    </View>
                                    <View style={{ marginTop: 5, height: 1, backgroundColor: '#F5F5F5' }} />
                                    {this._formulaTerm()}

                                </View>

                            )
                                : (
                                    <View style={{ flex: 1, height: 300, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <View style={{ flex: 3 }} onLayout={this._onLayout.bind(this)}>

                                            <DZHMinChart ref='MinInDetailPage' forwardRef
                                                mainName={ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx)}
                                                viceName={ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx)}
                                                isDaPan={this.state.type}
                                                navigation={this.props.navigation}
                                                callback={this._displayBuySellComponent.bind(this)}
                                                onData={(data) => {
                                                    this.onMinDataReady(data)
                                                }}
                                                callbackScrollTouch={item => {
                                                    this.callbackScrollTouch(item);
                                                }}
                                                params={this.postLoad && this.state.obj && {
                                                    obj: this.state.obj,
                                                    ZhongWenJianCheng: this.state.ZhongWenJianCheng
                                                }} />

                                            {this.changeToLandscapeButton('chart')}

                                            <View style={{ flexDirection: 'row', bottom: this.state.minFutuFloatButtonBottom }}>

                                                {permission >= 5 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?

                                                    <View style={{
                                                        paddingLeft: 0,
                                                        marginLeft: 5,
                                                        width: tabBarSingleWidthFormulaPicker,
                                                        // bottom: this.state.minFutuFloatButtonBottom,
                                                        borderWidth: 1,
                                                        borderColor: '#0000001a',
                                                        justifyContent: 'center',
                                                        flexDirection: 'row', alignItems: 'center',

                                                    }}>
                                                        <ModalDropdown
                                                            ref='dropDownMinFutu' forwardRef
                                                            defaultValue={ShareSetting.getMinFutuFormulaNameByIndex(0)}
                                                            defaultIndex={0}
                                                            onSelect={(idx, value) => this._onMinFutuDropDownMenu(idx, value)}
                                                            style={{
                                                                // width: 70,
                                                                justifyContent: "center"
                                                            }}
                                                            textStyle={{
                                                                textAlign: "center",
                                                                fontSize: 12,
                                                                color: '#000000'
                                                            }}
                                                            buttonStyle={{
                                                                height: 20,
                                                                justifyContent: "center",
                                                                alignItems: "center"
                                                            }}
                                                            dropdownStyle={{
                                                                height: 80,
                                                                width: 70,
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                marginLeft: -10,
                                                                marginTop: 8,
                                                                marginRight: 0
                                                            }}
                                                            options={futuoptions}
                                                            renderRow={(rowData, rowID, highlighted) =>
                                                                this.renderRow4ModalDropdown(rowData, rowID, highlighted, 70)
                                                            }
                                                            itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
                                                            itemActiveOpacity={0.5}
                                                        />
                                                    </View>
                                                    : null//<View style={{ height: 30 }} />
                                                }
                                                {this.state.curMinFutuFormulaIdx == 0 ? //成交量
                                                    <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 15, color: '#828282' }}>
                                                        {this.state.chengjiaoliang}
                                                    </Text> : null
                                                }
                                            </View>
                                            <View style={{
                                                position: 'absolute',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                width: tabBarSingleWidthFormulaPicker,
                                                right: 0,
                                                bottom: this.state.minFutuFloatButtonBottom + 3

                                            }}>

                                                {has(ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx)) && this.state.curMinFutuFormulaIdx == 1 //资金流入
                                                    ?
                                                    <TouchableOpacity onPress={() => {
                                                        Navigation.navigateForParams(this.props.navigation, 'TargetStudyPage', {
                                                            name: ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx),
                                                            fromPage: 'DetailPage',
                                                            toPortrait: this._backToPortrait.bind(this),
                                                        })
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            // height:30,
                                                            width: 75,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: '#ffffff',
                                                        }}>
                                                            <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                            <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    :
                                                    <View style={{ height: 30 }} />
                                                }
                                            </View>

                                        </View>
                                        {this.state.type === 1 && ShareSetting.isDisplayBuySellComponent() === true && (
                                            <View onStartShouldSetResponderCapture={() => {
                                                if (ShareSetting.getWuDangIndex() === 1) {
                                                    this.setState({ enableScrollViewScroll: false });
                                                }
                                            }}
                                                style={{
                                                    flex: 1.2,
                                                    borderLeftWidth: 1,
                                                    borderLeftColor: baseStyle.LINE_BG_F1,
                                                    width: 125,
                                                    height: 298.5,
                                                }}>
                                                <TabBar style={{
                                                    flex: 1,
                                                    tabBar: { backgroundColor: baseStyle.WHITE, height: 25 },
                                                    tabBarItem: {},
                                                    tabBarItemLabel: { color: baseStyle.WU_DANG_BLACK, fontSize: 10 },
                                                    // tabBarItemSelected: {
                                                    //     borderBottomColor: baseStyle.TABBAR_BORDER_COLOR
                                                    // },
                                                    tabBarItemSelected: {
                                                        width: 10,
                                                        borderRadius: 1,
                                                        backgroundColor: baseStyle.WHITE,
                                                        borderBottomWidth: 2,
                                                        borderBottomColor: baseStyle.TABBAR_BORDER_COLOR
                                                    },
                                                    tabBarItemLabelSelected: { color: baseStyle.TABBAR_BORDER_COLOR },

                                                }}
                                                    where={'BuySellAndTick'}
                                                    lastIndex={ShareSetting.getWuDangIndex()}
                                                    onChangeTab={this._onChangeTab.bind(this)}
                                                    ref={(ref) => ref && !this.state.tabBar && (this.setState({ tabBar: ref }))}>
                                                    <TabBarItem title="五档">
                                                        <DZHYunBuySellComponent ref={ref => (this.buysell = ref)}
                                                            navigation={this.props.navigation}
                                                            params={this.postLoad && this.state.obj && { obj: this.state.obj }}></DZHYunBuySellComponent>
                                                    </TabBarItem>
                                                    <TabBarItem title="明细">
                                                        <TickComponent ref={ref => (this.tick = ref)}
                                                            navigation={this.props.navigation}
                                                            params={this.postLoad && this.state.obj && { obj: this.state.obj }}></TickComponent>
                                                    </TabBarItem>
                                                </TabBar>
                                                <View
                                                    style={{
                                                        backgroundColor: baseStyle.DEFAULT_BORDER_COLOR,
                                                        height: 1,
                                                        marginRight: 15
                                                    }}
                                                />
                                            </View>
                                        )}
                                        {   
                                            // console.log("isUseGesture="+this.state.isUseGesture),
                                           !this.state.isUseGesture&&(
                                                <View style={{flex:1, position:'absolute',alignItems:'center',justifyContent: 'center'}}>
                                                <TouchableOpacity onPress={() => {
                                                    AsyncStorage.setItem('ISUSEGESTRUE', '1', (errs) => {
                                                        // console.log("isUseGesture=errs="+errs.toString);
                                                        if (!errs ) {
                                                            console.log("isUseGesture=----------");
                                                            this.setState({isUseGesture:'1'})
                                                        }    
                                                    });
                                    
                                                }}>
                                            <Image style={{ width:screenWidth }}
                                            source={require('../../images/Marketing/gesture_guid.png')} />
                                            </TouchableOpacity>
                                            </View>
                                           )
                                          
                                        }
                                        
                                    </View>
                                )
                        }

                    </View>


                    {this.state.type === 1 && (
                        <View style={{ flex: 1 }} >
                            <View style={{ marginTop: 5, height: 10, backgroundColor: baseStyle.LINE_BG_F6, }} />
                            <TabBarOriginal style={tabStyle} smallBottom={true} lastIndex={this.tabIndex}>
                                <StaticTabBarItem title="新闻" style={{ height: 200, flex: 1 }}>
                                    <YDNewsList params={this.postLoad && this.state.obj && { obj: this.state.obj }}
                                        onPressItem={this.openNewsPage.bind(this, '新闻')} />
                                </StaticTabBarItem>

                                <StaticTabBarItem title="公告" style={{ height: 200, flex: 1 }}>
                                    <YDAnnouncementList params={this.state.obj && { obj: this.state.obj }}
                                        onPressItem={this.openAnnouncementPage.bind(this, '公告')} />
                                </StaticTabBarItem>

                                <StaticTabBarItem title="F10" style={{ height: 200, flex: 1 }}>
                                    <View style={{ flex: 1, overflow: 'hidden' }} onStartShouldSetResponderCapture={() => {
                                        this.setState({
                                            touchWeb: true
                                        })
                                    }}>
                                        <WebView
                                            ref={'webview'}
                                            style={{ flex: 1, height: this.state.f10Height }}
                                            onLoadEnd={this.webViewLoaded}
                                            onMessage={e => {
                                                this.handleMessage(e);
                                            }}
                                            javaScriptEnabled={true}
                                            automaticallyAdjustContentInsets={true}
                                            source={{ uri: this.state.f10Url }}
                                            scalesPageToFit={this.state.scalesPageToFit}
                                            injectedJavaScript={injectedJavaScript5}
                                            // onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                                            scrollEnabled={false}
                                        />

                                    </View>
                                </StaticTabBarItem>
                                <StaticTabBarItem title="收益统计" style={{ height: 200, flex: 1 }}>
                                    <View style={{ flex: 1, overflow: 'hidden' }} onStartShouldSetResponderCapture={() => {
                                        this.setState({
                                            touchWeb: true
                                        })
                                    }}>
                                        <WebView
                                            ref={'webview1'}
                                            style={{ flex: 1, height: this.state.incomeHeight }}
                                            onLoadEnd={this.webViewLoaded1}
                                            onMessage={e => {
                                                this.handleMessage1(e);
                                            }}
                                            javaScriptEnabled={true}
                                            automaticallyAdjustContentInsets={true}
                                            source={{ uri: this.state.earningsUrl }}
                                            scalesPageToFit={this.state.scalesPageToFit}
                                            injectedJavaScript={injectedJavaScript5}
                                            // onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                                            scrollEnabled={false}
                                        />
                                    </View>
                                </StaticTabBarItem>
                            </TabBarOriginal>
                        </View>
                    )}
                    {!this.props.navigation.state.params.isFromFundFlow && this.state.type === 0 && (
                        <View style={{ flex: 1 }}>
                            <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6, marginTop: 6 }} />
                            <View style={{ height: 40, borderBottomWidth: 1, borderBottomColor: baseStyle.LINE_BG_F1, justifyContent: "center", alignItems: "center" }} >
                                <Text style={{ fontSize: 15 }}>成分股</Text>
                            </View>
                            <View
                                style={{
                                    backgroundColor: baseStyle.WHITE,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-around",
                                    height: 25,
                                    marginLeft: 12,
                                    marginRight: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
                                }}
                            >
                                <Text style={{ flex: 1, color: baseStyle.BLACK_70, fontSize: 12, textAlign: "left" }}>名称</Text>
                                <UpDownButton
                                    onPress={() => this.changeListXJ()}
                                    desc={this.state.xianJ}
                                    title={"现价"}
                                    containerStyle={{ flex: 0.5, alignItems: "flex-end" }}
                                />
                                <UpDownButton
                                    onPress={() => this.changeListZF()}
                                    desc={this.state.zhangF}
                                    title={"涨跌幅"}
                                    containerStyle={{ flex: 1, alignItems: "flex-end" }}
                                />
                            </View>
                        </View>
                    )}


                </ScrollView>
                <Toast position={'center'} ref="toast" />
            </View>

        );
    }
    /**
     * 成分股的列表
     * ConstituentListForFundFlow  资金流向成分股
     * ConstituentList 普通股票成分股
     * */
    renderBlock() {
        if (this.props.navigation.state.params.isFromFundFlow) {//this.props.navigation.state.params.isFromFundFlow= true//股票详情页面下面不是成分股列表，是资金流向列表
            //资金流向页面
            return (
                <View style={{ flex: 1 }}>
                    <ConstituentListForFundFlow
                        code={this.state.obj}
                        name={this.state.ZhongWenJianCheng}
                        navigation={this.props.navigation}
                        renderHeaderComponent={
                            this.renderHeader()
                        }
                    />
                </View>
            )
        } else {
            //成分股列表
            return (
                <View style={{ flex: 1 }}>
                    <ConstituentList
                        ref="ConstituentList"
                        code={this.state.obj}
                        mainkey={"chengfengu"}
                        navigation={this.props.navigation}
                        renderHeaderComponent={this.renderHeader()}
                        con_scrollEnabled={this.state.enableScrollViewScroll}
                        // con_scrollEnabled={this.state.scrollTouch=="auto"? true:false}
                        zhangF={this.state.zhangF}
                        xianJ={this.state.xianJ}
                    />
                </View>
            );
        }
    }

    render() {
        if (!this.state.obj) {
            return null
        }

        return (
            <BaseComponentPage style={{ flex: 1, backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR }}>

                <NavigationTitleView navigation={this.props.navigation}
                    onBack={(() => {
                        this._onBack()
                    })}
                    titleView={
                        <View style={{ height: 44, justifyContent: 'center', alignItems: 'center' }}>
                            {this.state.type != null && this._renderTitle()}
                        </View>
                    }
                    rightTopView={
                        <TouchableOpacity style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._popToSearchPage()}>
                            <Image source={require("../../images/icons/cy_search_gray.png")} />
                        </TouchableOpacity>
                    } />

                {this.state.type === 0 && this.renderBlock()}
                {this.state.type === 1 && this.renderHeader()}
                {/* {this.renderHeader()} */}
            </BaseComponentPage>
        )

    }

    _keepTwoDecimal(num) {
        let zero = '0.00';
        let result = parseFloat(num);
        if (isNaN(result)) {
            return zero;
        }
        result = Math.round(num * 100) / 100;
        if (result === 0) {
            return zero;
        }
        else {
            return result;
        }

    }
    webViewLoaded = () => {
        // 显示弹框列表时把对应的类名传递
        let jsstr = `
            var box = document.getElementsByClassName('msgbox msgbox-tonghanglist');
            var body = document.getElementsByClassName('theme-w fixed-body');
            window.ReactNativeWebView.postMessage(JSON.stringify({page: document.URL, dom: box, body: body, height: document.body.clientHeight}));
        `;
        this.timer = setInterval(() => {
            this.refs['webview'] && this.refs['webview'].injectJavaScript(jsstr);
        }, 1000);
    };
    webViewLoaded1 = () => {
        // 显示弹框列表时把对应的类名传递
        let jsstr = `
            var box = document.getElementsByClassName('msgbox msgbox-tonghanglist');
            var body = document.getElementsByClassName('theme-w fixed-body');
            window.ReactNativeWebView.postMessage(JSON.stringify({page: document.URL, dom: box, body: body, height: document.body.clientHeight}));
        `;
        this.timer = setInterval(() => {
            this.refs['webview1'] && this.refs['webview1'].injectJavaScript(jsstr);
        }, 1000);
    };

    handleMessage = e => {
        let data;
        try {
            data = JSON.parse(e.nativeEvent.data);
        } catch (e) {
            return;
        }
        let hasList = false;
        let hasFixBody = false;
        if (data.height) {
            let h = data.height;
            if (data.page) {
                if (
                    data.page.indexOf('/fhrz') !== -1 ||
                    data.page.indexOf('/gsds') !== -1
                ) {
                    h = data.height + 20;
                }
            }
            this.setState({
                f10Height: h
            }, () => {
                this.timer && clearInterval(this.timer);
            });
        }
        // 判断是否存在列表
        if (data.dom) {
            let doms = data.dom;
            for (const obj in doms) {
                if (obj) {
                    hasList = true;
                }
            }
        }
        // 判断是否存在弹框的适配类
        if (data.body) {
            let bodys = data.body;
            for (const obj in bodys) {
                if (obj) {
                    hasFixBody = true;
                }
            }
            if (hasFixBody) {
                if (data.height > ScreenHeight) {
                    this.setState({
                        f10Height: ScreenHeight
                    });
                }
            }
        }
        // 如果有弹出列表，有适配的类，而且手指在webview区域，则禁止滑动
        if (hasFixBody && hasList && this.state.touchWeb) {
            this.setState({
                hasList: true
            })
        } else {
            this.setState({
                hasList: false
            })
        }
    };

    handleMessage1 = e => {
        let data;
        try {
            data = JSON.parse(e.nativeEvent.data);
        } catch (e) {
            return;
        }
        let hasList = false;
        let hasFixBody = false;
        if (data.height) {
            let h = data.height;
            if (data.page) {
                if (
                    data.page.indexOf('/fhrz') !== -1 ||
                    data.page.indexOf('/gsds') !== -1
                ) {
                    h = data.height + 20;
                }
            }
            this.setState({
                incomeHeight: h
            }, () => {
                this.timer && clearInterval(this.timer);
            });
        }
        // 判断是否存在列表
        if (data.dom) {
            let doms = data.dom;
            for (const obj in doms) {
                if (obj) {
                    hasList = true;
                }
            }
        }
        // 判断是否存在弹框的适配类
        if (data.body) {
            let bodys = data.body;
            for (const obj in bodys) {
                if (obj) {
                    hasFixBody = true;
                }
            }
            if (hasFixBody) {
                if (data.height > ScreenHeight) {
                    this.setState({
                        incomeHeight: ScreenHeight
                    });
                }
            }
        }
        // 如果有弹出列表，有适配的类，而且手指在webview区域，则禁止滑动
        if (hasFixBody && hasList && this.state.touchWeb) {
            this.setState({
                hasList: true
            })
        } else {
            this.setState({
                hasList: false
            })
        }
    };

    _onLayout(event) {
        this.layout = event.nativeEvent.layout;
        this.setState({ minFutuFloatButtonBottom: this.layout.height / 3 - this.FutuFormulaPickerPaddingTop });
    };

    //监控 外层scroll是否禁止滑动
    callbackScrollTouch = item => {
        if (this.state.enableScrollViewScroll === false && item === false) return;
        this.setState({
            // scrollTouch: item ? 'auto' : 'never',
            enableScrollViewScroll: item,
        })
    };

    changeToLandscapeButton(indexS) {
        let distanceTop = indexS === 'chart' ? 300 / 2 + 5 : 460 / 2 - 65;
        // let distanceRight = indexS === 'chart' ? 0 : 0;
        let distanceRight = indexS === 'chart' ? 0 : 15;

        return (
            <TouchableOpacity
                onPress={event => {
                    isLandscape(true)
                    this._mineChangeToLandscape();
                }}
                style={{
                    // backgroundColor:'#cd92ff',
                    position: 'absolute',
                    top: distanceTop,
                    right: distanceRight,
                }}
            >
                <Image
                    style={{ flexDirection: 'column', alignItems: 'center', }}
                    source={require('../../images/icons/land_icon.png')} />

            </TouchableOpacity>
        )
    }


    _backToPortrait() {
        Orientation.getOrientation((err, orientation) => {
            //
            // if(orientation==='LANDSCAPE')  {
            //     Orientation.lockToLandscape();
            //     Orientation.lockToPortrait();
            // }else {
            //     Orientation.lockToPortrait();
            // }
            Orientation.lockToPortrait();
        });
        Orientation.lockToPortrait();

    }
    _mineChangeToLandscape() {
        //横屏显示
        isLandscape(true);
        Orientation.lockToLandscape();
        this.refs.dropDown && this.getDropdownRef().hide();
        Navigation.navigateForParams(this.props.navigation, 'LandscapePage', {
            //能够切换数组
            Objs: this.state.objs,
            index: this.loopStock,
            formulas: [
                ShareSetting.getCurrentMainFormulaName(),
                ShareSetting.getCurrentAssistFormulaName()
            ],
            returnFromLand: this.returnFromLand,
            transition: 'LandscapePage',
            Obj: this.state.obj,
            // Obj: this.state.Obj,
            ZhongWenJianCheng: this.state.ZhongWenJianCheng,
            shijian: this.state.shijian,
            shijia: this.state.shijia,
            junjia: this.state.junjia,
            zhangfu: this.state.zhangfu,
            yichong: this.state.yichong,
            erchong: this.state.erchong,
            junjiaColor: this.state.junjiaColor,
            zhangfuColor: this.state.zhangfuColor,
            maData: this.state.maData,
            colorData: this.state.colorData,
            fuTu1Data: this.state.fuTu1Data,
            fuTu1ColorData: this.state.fuTu1ColorData,
            fuTuName: this.state.fuTu1Name,
            zhuTuName: this.state.mainData,
            setImageName: this._setImageName.bind(this),
            toPortrait: this._backToPortrait.bind(this),
        });
        DeviceEventEmitter.emit('toLand');
    }

    onNavigationStateChange(navState) {
        let jsstr = `
            window.postMessage(JSON.stringify({page: document.URL,height: document.body.clientHeight}));
        `;
        this.timer = setInterval(() => {
            this.refs['webview'] && this.refs['webview'].injectJavaScript(jsstr);
        }, 1000);
    }

    //临时替换，待大智慧放开权限时，换回
    onNavigationStateChange1(navState) {
        if (navState.url.indexOf("i.bankuang.com") > 0) {
            if (this._opend_i_bankuang_com) {
                return
            }
            this._opend_i_bankuang_com = true
            this.setState({
                f10Height: ScreenHeight
            });
        }
        else {
            this.setState({
                f10Height: parseInt(navState.title) || ScreenHeight
            });
        }

    }

    _firstFuTu_TuLiQu() {
        return (
            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: (graphHeight * 3 / 4) - 137,
                height: 30,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: '#E5E5E5',
                borderBottomWidth: 1,
                borderTopColor: '#E5E5E5',
                borderTopWidth: 1,
                // backgroundColor: '#fff'

            }}>
                {
                    this._showBQuoteUnableAlert(this.state.fuTu1Name)
                }
                <TouchableOpacity onPress={() => { this.choseNormPage() }}>
                    <View style={{
                        flexDirection: 'row',
                        height: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(153,153,153,0.3)',
                        borderRadius: 2,
                        alignItems: 'center',
                        paddingRight: 6,
                        paddingLeft: 6,
                        backgroundColor: '#fff'

                    }}>
                        <Text style={{ color: '#333333', marginLeft: 6, fontSize: 12 }}>{this.state.fuTu1Name}</Text>
                        <Image style={{ width: 9, height: 5, marginLeft: 6 }} source={require('../../images/icons/zhibiao_jiantou.png')} />
                    </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    {this.state.fuTu1Data.map(
                        (data, index) => (
                            <Text style={{ fontSize: 10, marginLeft: 10, color: '#' + this.state.fuTu1ColorData[index] }}>
                                {index > (this.state.fuTu1Name == '波动极限' ? 1 : 2) ? null : data}
                            </Text>
                        ))}

                </View>
                {has(this.state.fuTu1Name) ?
                    <Image style={{ width: 3, height: 20 }} source={require('../../images/icons/line_icon.png')} />
                    :
                    null
                }
                {has(this.state.fuTu1Name) ?
                    <TouchableOpacity onPress={() => {
                        {/*if(this.state.zhuTuName == '趋势彩虹'*/ }
                        {/*&& this.state.fuTu1Name == '量能黄金'*/ }
                        {/*&&this.state.fuTu2Name == '周期拐点'){*/ }
                        {/*Navigation.navigateForParams(this.props.navigation,'TargetStudyPage',{name:'趋势三部曲',fromPage:'DetailPage'})*/ }
                        {/*}else{*/ }
                        {/**/ }
                        {/*}*/ }
                        Navigation.navigateForParams(this.props.navigation, 'TargetStudyPage', {
                            name: this.state.fuTu1Name,
                            fromPage: 'DetailPage',
                            toPortrait: this._backToPortrait.bind(this),
                        })
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            height: 27,
                            width: 75,
                            marginTop: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#ffffff'

                        }}>
                            <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                            <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                        </View>
                    </TouchableOpacity>
                    :
                    null
                }
            </View>
        );
    }
    _formulaTerm() {
        let fontColorOne = '#333333', fontColorTwo = '#333333', fontColorThree = '#333333';
        let imgOne = require('../../images/icons/formulaTermGray.png')
        let imgTwo = require('../../images/icons/formulaTermGray.png')
        let imgThree = require('../../images/icons/formulaTermGray.png')

        if (this.state.zhuTuName === ShareSetting.getZSLTermItem(0)
            && this.state.fuTu1Name === ShareSetting.getZSLTermItem(1)
            && this.state.fuTu2Name === ShareSetting.getZSLTermItem(2)) {
            fontColorOne = '#F92400';
            imgOne = require('../../images/icons/formulaTermWhite.png')
        }

        if (this.state.zhuTuName === ShareSetting.getJZZFTermItem(0)
            && this.state.fuTu1Name === ShareSetting.getJZZFTermItem(1)) {
            fontColorTwo = '#F92400';
            imgTwo = require('../../images/icons/formulaTermWhite.png')
        }

        if (this.state.zhuTuName === ShareSetting.getLFMDTermItem(0)
            && this.state.fuTu1Name === ShareSetting.getLFMDTermItem(1)
            && this.state.fuTu2Name === ShareSetting.getLFMDTermItem(2)) {
            fontColorThree = '#F92400';
            imgThree = require('../../images/icons/formulaTermWhite.png')
        }

        let permiss = UserInfoUtil.getUserPermissions()

        return (
            <View style={{ height: 50, marginTop: 0, flexDirection: 'row', backgroundColor: 'rgba(99,cc,ff,0.1)' }}>

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        let main = ShareSetting.getZSLTermItem(0)
                        let first = ShareSetting.getZSLTermItem(1)
                        let second = ShareSetting.getZSLTermItem(2)
                        this.setState({ mainData: main, firstData: first, secondData: second })
                        this.setState({ zhuTuName: main, fuTu1Name: first, fuTu2Name: second })
                        DeviceEventEmitter.emit('updataListener', main, first, second);
                        this.sensorsAddIndex('组合指标', '主升浪', '')
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            width: (baseStyle.width - 30) / 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 15,
                        }}>

                            {/* <ImageBackground style={{ alignItems: 'center', justifyContent: 'center', height: 15, width: 58 }}
                                source={imgOne}>
                                <Text style={{ color: fontColorOne, marginLeft:6, fontSize: 12 }}>主升浪</Text> */}

                            <ImageBackground style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, width: (baseStyle.width - 40) / 2 }}
                                source={imgOne}>
                                <Text style={{ color: fontColorOne, marginLeft: 6, marginTop: 2, fontSize: 12, height: 25 }}>主升浪</Text>
                                {has('主升浪') && this.state.zhuTuName === ShareSetting.getZSLTermItem(0)
                                    && this.state.fuTu1Name === ShareSetting.getZSLTermItem(1)
                                    && this.state.fuTu2Name === ShareSetting.getZSLTermItem(2) ?
                                    <TouchableOpacity onPress={() => {

                                        Navigation.navigateForParams(this.props.navigation, 'TargetStudyPage', {
                                            name: '主升浪',
                                            fromPage: 'DetailPage',
                                            toPortrait: this._backToPortrait.bind(this),
                                        })
                                    }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            height: 20,
                                            marginLeft: 10,
                                            paddingLeft: 5,
                                            paddingRight: 5,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                            marginTop: -7

                                        }}>
                                            <Image style={{ width: 14, height: 14 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                            <Text style={{ flexDirection: 'row', color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                        </View>
                                    </TouchableOpacity>
                                    : null
                                }
                            </ImageBackground>

                        </View>

                    </TouchableOpacity>
                </View>
                {/* {
                    permiss < 4 ? null :

                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => {
                                let main = ShareSetting.getJZZFTermItem(0)
                                let first = ShareSetting.getJZZFTermItem(1)
                                this.setState({ mainData: main, firstData: first })
                                this.setState({ zhuTuName: main, fuTu1Name: first })
                                DeviceEventEmitter.emit('updataListener', main, first);
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    width: (baseStyle.width - 30) / 3,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ImageBackground style={{ alignItems: 'center', justifyContent: 'center', height: 29, width: (baseStyle.width - 40) / 3 }}
                                        source={imgTwo}>
                                        <Text style={{ color: fontColorTwo, marginLeft: 6, fontSize: 12, height: 25 }}>九转战法</Text>
                                    </ImageBackground>
                                </View>

                            </TouchableOpacity>
                        </View>
                } */}
                {
                    // permiss < 3 ? null :


                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => {
                            if (permiss == 0) {
                                sensorsDataClickObject.loginButtonClick.entrance = '行情详情'
                                Navigation.navigateForParams(this.props.navigation, 'LoginPage', {})
                                return;
                            }

                            if (permiss < 3 && ShareSetting.isAssist3Formula('蓝粉买点')) {
                                this.prompt && this.prompt.show();
                                return;
                            }
                            let main = ShareSetting.getLFMDTermItem(0)
                            let first = ShareSetting.getLFMDTermItem(1)
                            let second = ShareSetting.getLFMDTermItem(2)
                            this.setState({ mainData: main, firstData: first, secondData: second })
                            this.setState({ zhuTuName: main, fuTu1Name: first, fuTu2Name: second })
                            DeviceEventEmitter.emit('updataListener', main, first, second);
                            this.sensorsAddIndex('组合指标', '蓝粉买点', '')

                        }}>
                            <View style={{
                                flexDirection: 'row',
                                width: (baseStyle.width - 30) / 2,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ImageBackground style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, width: (baseStyle.width - 40) / 2 }}
                                    source={imgThree}>
                                    <Text style={{ color: fontColorThree, marginLeft: 6, marginTop: 2, fontSize: 12, height: 25 }}>蓝粉买点</Text>

                                    {has('蓝粉买点') && this.state.zhuTuName === ShareSetting.getLFMDTermItem(0)
                                        && this.state.fuTu1Name === ShareSetting.getLFMDTermItem(1) && this.state.fuTu2Name === ShareSetting.getLFMDTermItem(2) ?
                                        <TouchableOpacity onPress={() => {

                                            Navigation.navigateForParams(this.props.navigation, 'TargetStudyPage', {
                                                name: '蓝粉买点',
                                                fromPage: 'DetailPage',
                                                toPortrait: this._backToPortrait.bind(this),
                                            })
                                        }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                height: 20,
                                                marginLeft: 10,
                                                paddingLeft: 5,
                                                paddingRight: 5,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 10,
                                                backgroundColor: 'rgba(0,0,0,0.05)',
                                                marginTop: -7
                                            }}>

                                                <Image style={{ width: 14, height: 14 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                            </View>
                                        </TouchableOpacity>
                                        : null
                                    }
                                </ImageBackground>
                            </View>

                        </TouchableOpacity>
                    </View>
                }
            </View>
        )
    }
    _secondFuTu_TuLiQu() {
        return (
            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: (graphHeight * 3 / 4) - 10,
                height: 30,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: '#E5E5E5',
                borderBottomWidth: 1,
                borderTopColor: '#E5E5E5',
                borderTopWidth: 1,
                // backgroundColor: '#fff'
            }}>
                {
                    this._showBQuoteUnableAlert(this.state.fuTu2Name)
                }

                <TouchableOpacity onPress={() => { this.choseNormPage() }}>
                    <View style={{
                        flexDirection: 'row',
                        height: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(153,153,153,0.3)',
                        borderRadius: 2,
                        alignItems: 'center',
                        paddingRight: 6,
                        paddingLeft: 6,
                        backgroundColor: '#fff'

                    }}>
                        <Text style={{ color: '#333333', marginLeft: 6, fontSize: 12 }}>{this.state.fuTu2Name}</Text>
                        <Image style={{ width: 9, height: 5, marginLeft: 6 }} source={require('../../images/icons/zhibiao_jiantou.png')} />
                    </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    {this.state.fuTu2Data.map(
                        (data, index) => (
                            <Text style={{ fontSize: 10, marginLeft: 10, color: '#' + this.state.fuTu2ColorData[index] }}>
                                {index > (this.state.fuTu2Name == '波动极限' ? 1 : 2) ? null : data}
                            </Text>
                        ))}

                </View>
                {has(this.state.fuTu2Name) ?
                    <Image style={{ width: 3, height: 20 }} source={require('../../images/icons/line_icon.png')} />
                    :
                    null
                }
                {has(this.state.fuTu2Name) ?
                    <TouchableOpacity onPress={() => {
                        {/*if(this.state.zhuTuName == '趋势彩虹'*/ }
                        {/*&& this.state.fuTu1Name == '量能黄金'*/ }
                        {/*&&this.state.fuTu2Name == '周期拐点'){*/ }
                        {/*Navigation.navigateForParams(this.props.navigation,'TargetStudyPage',{name:'趋势三部曲',fromPage:'DetailPage'})*/ }
                        {/*}else{*/ }
                        {/**/ }
                        {/*}*/ }
                        Navigation.navigateForParams(this.props.navigation, 'TargetStudyPage', {
                            name: this.state.fuTu2Name,
                            fromPage: 'DetailPage',
                            toPortrait: this._backToPortrait.bind(this),
                        })
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            height: 27,
                            width: 75,
                            marginTop: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#ffffff'

                        }}>
                            <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                            <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                        </View>
                    </TouchableOpacity>
                    :
                    null
                }
            </View>
        );
    }

    _showBQuoteUnableAlert(zhibaoName) {
        if (!this.state.obj) {
            return;
        }
        return (
            isBQuote(this.state.obj.substr(2, 6)) && ShareSetting.isBUnable(zhibaoName) ?
                <View style={{
                    top: 50,
                    left: (baseStyle.width - 155) / 2,
                    position: 'absolute',
                    flexDirection: 'row',
                    height: 30,
                    paddingLeft: 8,
                    paddingRight: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 15,
                    backgroundColor: 'rgba(51,153,255,0.1)',
                }}>
                    <Text style={{ alignItems: 'center', justifyContent: 'center', color: '#003366', fontSize: 12 }}>本指标不适用于当前品种</Text>

                </View>
                : null
        );
    }

    //按钮组件放大缩小平移全屏
    _expandedView() {
        return (
            <ExpandedView
                // styles={{position:'absolute',top: 450 / 2 - 70,left:-5}}
                styles={{ position: 'absolute', top: (graphHeight * 3 / 4) - 210, left: 1 }}
                // styles={{position:'absolute',top:460 / 2 - 80,left:1}}
                bigPress={() => this.controlKlineChart(0)}
                smallPress={() => this.controlKlineChart(1)}
                oldPress={() => this.controlKlineChart(2)}
                latePress={() => this.controlKlineChart(3)}
                landPress={() => this._mineChangeToLandscape()}
            />
        );
    }

    //放大缩小平移全屏 发送给原生中控件调用
    controlKlineChart = (flag) => {
        switch (flag) {
            case TouchFlag.bigger:
                DeviceEventEmitter.emit('bigger');
                break;
            case TouchFlag.smaller:
                DeviceEventEmitter.emit('smaller');
                break;
            case TouchFlag.older:
                DeviceEventEmitter.emit('older');
                break;
            case TouchFlag.later:
                DeviceEventEmitter.emit('later');
                break;
        }
    }


}

/**
 * 顶部导航栏的时间显示组件
 * */
class HeadTitleTime extends Component {

    static defaultProps = {
        serviceUrl: '/stkdata'
    };

    defaultParams = {
        sub: 1,
        field: ['ShiJian', 'ShiFouTingPai']
    };

    constructor(props) {
        super(props);

        this.state = {
            time: props.time,
            ZhongWenJianCheng: props.ZhongWenJianCheng
        }
        this.isDidMount = false;
        this.hadRequest = false;//是否已经请求过行情,防止接收父类属性方法和得到焦点重复请求行情
        this.updateName = false;

    }

    componentWillUnmount() {
        this.isDidMount = false;
        this.updateName = false;
        this.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }
    componentWillMount() {

    }
    componentDidMount() {
        this.isDidMount = true;
        this._query(this.props);
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {

            this.isDidMount = true;
            if (this.hadRequest == false) {
                this._query && this._query(this.props);
            }
            this.hadRequest = false;
        }
        );

        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            payload => {
                // console.log('stock-http---willBlurSubscription-----' );
                this.hadRequest = false;

                this.cancel();
            }
        );

    }

    componentWillReceiveProps(nextProps) {
        // 判断是否需要重新订阅数据
        if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
            this.hadRequest = true;
            this._query(nextProps);
        }
    }

    adapt(returnData) {
        let data = this._detailData(returnData);
        return data && data[0];
    }
    /**
     * 处理数据
     * @param data
     * @returns {*}
     * @private
     */
    _detailData(data) {
        let adaptData = [];
        let stockMessage = {};
        if (data) {
            stockMessage.ShiJian = data.time;
            stockMessage.ShiFouTingPai = data.status;
            stockMessage.ZhongWenJianCheng = data.name;
            adaptData.push(stockMessage);
        }
        return adaptData;
    }

    cancel() {

        if (this._request && this._request.qid && this.props.params.obj) {
            //console.log('this._request.qid', 'this._request.qid=' + this._request.qid)
            connection.unregister(this._request.qid, this.props.params.obj);
        }
        // this._request && this._request.cancel();
        // this._request = null;
    }


    _requery() {
        this._query(this.props);
    }
    _query(props) {
        // this.cancel();
        if (props.params && props.params.obj) {
            // props.params.unregister=props.params.register;
            this.titleObj = props.params.obj;
            this._request = connection.register('FetchFullQuoteNative', props.params.obj,
                (returndata) => {
                    if (!(returndata instanceof Error)) {
                        if (returndata.quote == undefined) {
                            return;
                        }
                        if (returndata.quote.label === this.titleObj) {
                            Promise.resolve(this.adapt(returndata.quote)).then((data) => {
                                if (this.isDidMount == true) {

                                    if (this.updateName == false && data.ZhongWenJianCheng) {
                                        this.props.updateParentState(data);
                                        this.updateName = true;
                                    }
                                    if (data !== false) {
                                        this.setState({ data });
                                    }
                                    // 触发事件
                                    let onData = this.props.onData;
                                    (typeof onData === 'function') && onData(data);
                                }
                            });
                        }
                    }
                });
        }

    }

    render() {

        let d = this.state.data;

        if (d) {

            // if (d.ShiFouTingPai === 8 || d.ShiFouTingPai === 9) return (
            if (d.ShiFouTingPai == 'PAUSE') return (
                <View><Text style={{ marginLeft: 10, fontSize: 12, color: this.props.timeColor || baseStyle.WHITE }}>停牌</Text></View>);

            else if (d.ShiJian === 0) return (
                <View><Text style={{ marginLeft: 10, fontSize: 12, color: this.props.timeColor || baseStyle.WHITE }}>--</Text></View>
            )
            else return (<View><DateFormatText style={{ marginLeft: 10, fontSize: 12, color: this.props.timeColor || baseStyle.WHITE }}
                format="YYYY-MM-DD HH:mm:ss">{d.ShiJian}</DateFormatText></View>);
        }

        else {
            return (<View><DateFormatText style={{ marginLeft: 10, fontSize: 12, color: this.props.timeColor || baseStyle.WHITE }}
                format="YYYY-MM-DD HH:mm:ss">{this.state.time}</DateFormatText></View>);
        }

    }

}


import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as AllActions from "../../actions/AllActions";
import { sensorsDataClickObject, sensorsDataClickActionName } from "../../components/SensorsDataTool";

export default connect((state) => ({
    // statePersonalStockList: state.PersonalStockListReducer
    statePersonalStockList: state.UserInfoReducer
}),
    (dispatch) => ({
        actions: bindActionCreators(AllActions, dispatch)
    })
)(DetailPage)
export class SegmentedView extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: this.props.selectedIndex || 0
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedIndex != this.state.selectedIndex) {
            this.setState({ selectedIndex: nextProps.selectedIndex });
        }
    }
    _tabOnChange(index) {
        if (this.state.selectedIndex !== index) {
            this.setState({ selectedIndex: index }, () => {
                this.props.tabOnChange && this.props.tabOnChange(index);
            });
        }
    }

    render() {
        if (!this.props.tabs || !this.props.tabs.length) return null;
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                {this.props.tabs.map((value, index) => {
                    let isSelected = this.state.selectedIndex == index ? true : false;
                    let textColor = isSelected ? '#F92400' : '#000000';
                    let fontSize = isSelected ? 16 : 15;
                    return (
                        <TouchableOpacity key={index} style={{ flex: 1, alignItems: 'center' }} activeOpacity={1} onPress={() => this._tabOnChange(index)}>
                            <Text style={{ fontSize: fontSize, color: textColor, marginTop: 12 }}>{value}</Text>
                            {isSelected ? <View style={{ width: 30, height: 2, backgroundColor: '#F92400', borderRadius: 3 / 2, marginTop: 8 }}></View> : null}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
}
