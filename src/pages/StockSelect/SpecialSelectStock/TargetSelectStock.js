/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description: 特色指标选股中指标选股tab
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
    Animated,
    Easing,
    PixelRatio
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { LargeList } from "react-native-largelist-v3";
import * as ScreenUtil from '../../../utils/ScreenUtil';
import TargetDetailPage from "./TargetDetailPage";
import { mNormalHeader } from "../../../components/mNormalHeader";
import { mNormalFooter } from "../../../components/mNormalFooter";
import Yd_cloud from "../../../wilddog/Yd_cloud";
let refHXG = Yd_cloud().ref(MainPathYG);
let getIndex = refHXG.ref('DingJu/TeSeZhiBiaoXuanGu');
let getNewIntro = refHXG.ref('TeSeZhiBiaoJieShao');
import LinearGradient from 'react-native-linear-gradient';

import QuotationListener from '../../../utils/QuotationListener';
import StockFormatText from '../../../components/StockFormatText';
//只是Android 使用
import FastImage from 'react-native-fast-image'
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../../components/SensorsDataTool";

export default class TargetSelectStock extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],//List数据,
            allLoaded: true,
            animatedValue: new Animated.Value(0),
        };

        this._renderIndexPath = this._renderIndexPath.bind(this);
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(260);//Item高度
        this.addQuotationList = [];//记录当前需要监听的数组
        this.scrollBegin = false; //专用ios

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
        this.getTargetDatas(() => {
            this.getFirstStock(() => {
                this.setListener()
            });
        });
        //设置定时器监听
        this._createTimer();
        this._addListeners();
    }
    /**
     * 第一次进入时获取股票的行情数据
     * 第一次进入和回到页面时需要请求
     * */
    getFirstStock(callBack) {
        let stockList = [];
        if (this.state.data[0].items.length > 0) {
            for (let i = 0; i < this.state.data[0].items.length; i++) {
                if (this.state.data[0].items[i].data[1] && this.state.data[0].items[i].data[1] != '--') {
                    stockList.push(this.state.data[0].items[i].data[1])
                }
            }
            QuotationListener.getStockListInfo(stockList, (stockObj) => {
                //设置数据刷新
                if (stockObj.length > 0) {
                    for (let i = 0; i < this.state.data[0].items.length; i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            if (this.state.data[0].items[i].data[1] == stockObj[j].c) {
                                this.state.data[0].items[i].data[2] = Number(stockObj[j].k);
                                this.state.data[0].items[i].data[3] = Number(stockObj[j].y) / 100;
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
    /**
     * 设置行情数据
     *
     * */
    setQuotation(stockObj) {
        if (this.state.data[0].items.length > 0) {
            for (let i = 0; i < this.state.data[0].items.length; i++) {
                if (this.state.data[0].items[i].data[1] == stockObj.c) {
                    this.state.data[0].items[i].data[2] = Number(stockObj.k);
                    this.state.data[0].items[i].data[3] = Number(stockObj.y) / 100;
                    //this.state.data[0].items[i].data[3] = stockObj.y;
                }
            }
            //页面刷新
            this.setState({
                data: this.state.data
            })
        }
    }

    _addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                //console.log("回到当前页面")
                //判断页面是否是展示在屏幕上的
                AsyncStorage.getItem('main_index', (error, resultMain) => {
                    if (error) {
                    } else {
                        AsyncStorage.getItem('xg_child_index', (error, result) => {
                            if (error) {
                            } else {
                                let mainObj = JSON.parse(resultMain);
                                let childObj = JSON.parse(result);
                                if (mainObj && childObj) {

                                    if (mainObj.mainPosition == 4 && childObj.indexPosition == 0) {
                                        this.getTargetDatas(() => {
                                            this.getFirstStock(() => {
                                                if (this.addQuotationList && this.addQuotationList.length > 0) {
                                                    //如果有数据,先去解注册
                                                    QuotationListener.offListeners(this.addQuotationList, () => { });
                                                    this.addQuotationList = [];
                                                }
                                                this.setListener()
                                            });
                                        });
                                        //页面中可能有定时器了,所以先删除再创建
                                        this._removeTimer();
                                        this._createTimer();
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
                // alert('willBlur');
                this._removeTimer();
                if (this.addQuotationList && this.addQuotationList.length > 0) {
                    //如果有数据,先去解注册
                    QuotationListener.offListeners(this.addQuotationList, () => { });
                    this.addQuotationList = [];
                }
            }
        );
        /**
         * 注册选股页面tab切换通知，不在当前页面取消监听
         * obj 里面参数0，1，2 当前tab为 0
         * */
        this.xgTabChange = DeviceEventEmitter.addListener('XG_TAB_CHANGE', (obj) => {
            if (obj != 0) {
                if (this.addQuotationList && this.addQuotationList.length > 0) {
                    //如果有数据,先去解注册
                    QuotationListener.offListeners(this.addQuotationList, () => { });
                    this.addQuotationList = [];
                }
            } else if (obj == 0) {
                this.getFirstStock(() => {
                    if (this.addQuotationList && this.addQuotationList.length > 0) {
                        //如果有数据,先去解注册
                        QuotationListener.offListeners(this.addQuotationList, () => { });
                        this.addQuotationList = [];
                    }
                    this.setListener();
                });
            }
        });
        /**
         * 注册APPMAINtab切换通知，
         * obj 里面参数0，1，2 ,3当前tab为 4选股
         * */
        this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
            if (obj != 4) {
                if (this.addQuotationList && this.addQuotationList.length > 0) {
                    //如果有数据,先去解注册
                    QuotationListener.offListeners(this.addQuotationList, () => { });
                    this.addQuotationList = [];
                }
            }
        });


    }
    _createTimer() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                //当前页面每5分钟强制刷新一次;
                if (this.addQuotationList && this.addQuotationList.length > 0) {
                    //如果有数据,先去解注册
                    QuotationListener.offListeners(this.addQuotationList, () => { });
                    this.addQuotationList = [];
                }
                this.getTargetDatas(() => {
                    this.getFirstStock(() => {
                        this.setListener();
                    });
                });
            }, 1000 * 5 * 60);
        }
    }
    _removeTimer() {
        this.timer && clearInterval(this.timer);
        this.timer = undefined;
    }

    /**
     * 获取不同类型指标的参数
     * 这里参数只传一个参数，目前暂时不确定
     * 获取节点选股指标数据
     * */
    getTargetDatas(callBack) {
        this.state.data[0].items = [];

        getIndex.get((response) => {
            if (response.code == 0) {
                this.state.data[0].items = [];
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);
                for (let i = 0; i < key.length; i++) {
                    item[i]['key'] = key[i];
                }
                if (item && item.length > 0) {
                    for (let i = 0; i < item.length; i++) {
                        let name = item[i].indicatorName;
                        if (name === "放量上攻" || name === "趋势共振" || name === "震荡突破" || name === "探底回升"
                            || name === "趋势反转" || name === "背离反弹") {

                            //按照固定顺序显示
                            let sortIndex;
                            switch (name) {
                                case "放量上攻":
                                    sortIndex = 0;
                                    break;
                                case "趋势共振":
                                    sortIndex = 1;
                                    break;
                                case "震荡突破":
                                    sortIndex = 2;
                                    break;
                                case "探底回升":
                                    sortIndex = 3;
                                    break;
                                case "趋势反转":
                                    sortIndex = 4;
                                    break;
                                case "背离反弹":
                                    sortIndex = 5;
                                    break;
                                default:
                                    sortIndex = 0;
                                    break;
                            }

                            let newItem = {};
                            //储存第一列需要的数据
                            let titles = {};
                            //设置排序索引
                            titles.sortIndex = sortIndex;
                            //获取title数据
                            titles.name = name;
                            titles.intro = item[i].indicatorReason ? item[i].indicatorReason : "暂时没有介绍";
                            titles.number = item[i].count > 10 ? 10 : item[i].count;
                            newItem.title = titles;

                            //数据项，一定要按照数据添加
                            let dataItem = [];
                            if (item[i] && item[i].maxNetAmount) {
                                dataItem.push(item[i].maxNetAmount.secName ? item[i].maxNetAmount.secName : '--');
                                dataItem.push(item[i].maxNetAmount.marketCode ? item[i].maxNetAmount.marketCode : '--');
                                dataItem.push(item[i].maxNetAmount.presentPrice ? item[i].maxNetAmount.presentPrice : '--');
                                dataItem.push(item[i].maxNetAmount.upDown ? item[i].maxNetAmount.upDown / 100 : '--');
                            } else {
                                dataItem.push('--');
                                dataItem.push('--');
                                dataItem.push('--');
                                dataItem.push('--');
                            }
                            newItem.data = dataItem;
                            this.state.data[0].items.push(newItem);

                        }
                    }
                    this.state.data[0].items = this.state.data[0].items.sort(this.sortNumSmalltoBig);

                    //需要去取介绍
                    getNewIntro.get((response) => {
                        if (response.code == 0 && response.nodeContent) {
                            for (let k = 0; k < this.state.data[0].items.length; k++) {
                                if (response.nodeContent["" + this.state.data[0].items[k].title.name]) {
                                    this.state.data[0].items[k].title.intro = response.nodeContent["" + this.state.data[0].items[k].title.name]
                                }
                            }
                            this.setState({
                                data: this.state.data,
                                allLoaded: true,
                            }, () => {
                                if (callBack) {
                                    callBack();
                                }
                            });
                        } else {
                            this.setState({
                                data: this.state.data,
                                allLoaded: true,
                            }, () => {
                                if (callBack) {
                                    callBack();
                                }
                            });

                        }
                    });

                } else {
                    this.setState({
                        data: this.state.data,
                        allLoaded: true,
                    }, () => {
                        if (callBack) {
                            callBack();
                        }
                    });
                }

            } else {
                if (callBack) {
                    callBack();
                }
            }
        })

    }
    /**
     * 从小到大排序
    * 固定顺序
    * */
    sortNumSmalltoBig(a, b) {
        return a.title.sortIndex - b.title.sortIndex;
    }
    render() {
        // const scalX = this.state.animatedValue.interpolate({
        //     inputRange: [0, 1],
        //     outputRange: [0, 80]
        // });
        return (
            <View style={{ flex: 1 }}>
                <LargeList
                    ref={ref => (this._list = ref)}
                    style={styles.container}
                    data={this.state.data}
                    heightForSection={() => 0.001}
                    renderSection={this._renderSection}
                    heightForIndexPath={(item) => {
                        if (item.row % 2 === 0) {
                            //每个组的Item 开头
                            return ScreenUtil.scaleSizeW(340)
                        } else {
                            return ScreenUtil.scaleSizeW(260)
                        }
                    }}
                    renderIndexPath={this._renderIndexPath}
                    refreshHeader={mNormalHeader}
                    onRefresh={() => {
                        this.getTargetDatas(() => {
                            this._list.endRefresh();
                        })
                    }}
                    allLoaded={this.state.allLoaded}
                    loadingFooter={mNormalFooter}
                    onLoading={() => { }}
                    onMomentumScrollEnd={() => { }}
                    onMomentumScrollBegin={() => { }}
                    onTouchBegin={() => { }}
                    onTouchEnd={() => { }}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { }}
                />


            </View>
        )
    }
    /**
     * 设置滑动的监听，提取出来
     * 便于切换取消注册监听
     * */
    setListener() {
        //第一次请求后直接监听,当前列表最多20条直接全部监听
        if (this.state.data[0].items.length > 0) {
            for (let i = 0; i < this.state.data[0].items.length; i++) {
                if (this.state.data[0].items[i].data[1] && this.state.data[0].items[i].data[1] != '--') {
                    this.addQuotationList.push(this.state.data[0].items[i].data[1])
                }
            }
        }
        if (this.addQuotationList.length > 0) {
            QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                //设置行情数据
                this.setQuotation(stockObj);
            })
        }
    }

    _renderSection() {
        return <View />
    }


    sensorsAppear(name) {
        //选股-特色指标选股
        sensorsDataClickObject.addOnClick.page_source = '特色指标选股';
        sensorsDataClickObject.addOnClick.content_name = name;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick);
        sensorsDataClickObject.choiceCondition.page_source = name;
        sensorsDataClickObject.adAchievements.page_source = name;
        sensorsDataClickObject.adAchievements.module_source = '特色指标选股';
        sensorsDataClickObject.choiceCondition.module_source = '特色指标选股';

        sensorsDataClickObject.adModule.module_type = '选股'
        sensorsDataClickObject.adModule.module_name = name;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule);
    }
    _renderIndexPath = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        let bgImg;
        switch (item.title.name) {
            case "放量上攻":
                bgImg = require('../../../images/hits/syzc.png');
                break;
            case "趋势共振":
                bgImg = require('../../../images/hits/cszj.png');
                break;
            case "震荡突破":
                bgImg = require('../../../images/hits/xsdf.png');
                break;
            case "探底回升":
                bgImg = require('../../../images/hits/zmkh.png');
                break;
            case "趋势反转":
                bgImg = require('../../../images/hits/yfct.png');
                break;
            case "背离反弹":
                bgImg = require('../../../images/hits/xrds.png');
                break;
            default:
                bgImg = require('../../../images/hits/syzc.png');
                break;
        }
        //每个Item背景色
        let backgrounds;
        //中文描述
        let content;
        switch (path.row) {
            case 0:
            case 1:
                backgrounds = ["#FF6699", "#FF3333"];
                content = "上涨状态";
                break;
            case 2:
            case 3:
                backgrounds = ["#CC66FF", "#B726FF"];
                content = "震荡状态";
                break;
            case 4:
            case 5:
                backgrounds = ["#6699FF", "#266EFF"];
                content = "下跌状态";
                break;
            default:
                backgrounds = ["#6699FF", "#266EFF"];
                content = "";
                break;
        }

        //判断现价涨跌幅的文字颜色
        let textColors = "";
        if (item.data[3] && item.data[3] != "--") {
            if (item.data[3] > 0) {
                textColors = "#F92400"
            } else if (item.data[3] == 0) {
                textColors = "rgba(0,0,0,0.4)"
            } else {
                textColors = "#5cac33"
            }
        } else {
            textColors = "rgba(0,0,0,0.4)"
        }

        return (
            path.row % 2 === 0 ?
                <View>
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(80), paddingLeft: ScreenUtil.scaleSizeW(20), justifyContent: "center" }}>
                        <View style={{
                            width: ScreenUtil.scaleSizeW(162), height: ScreenUtil.scaleSizeW(50), justifyContent: "center",
                            alignItems: "center", borderRadius: ScreenUtil.scaleSizeW(25), backgroundColor: "rgba(0,0,0,0.1)"
                        }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(28), color: "rgba(0,0,0,0.6)" }}>{content}</Text>
                        </View>
                    </View>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => {

                        this.sensorsAppear(item.title.name);
                        Navigation.navigateForParams(this.props.navigation, "TargetDetailPage", { keyWord: item.title.name, intro: item.title.intro, from: path.row })
                        //Navigation.navigateForParams(this.props.navigation,"DTTargetDetailPage",{keyWord:item.title.name,intro:item.title.intro,from:'多头启动'})

                    }}>

                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            colors={backgrounds}
                            style={{
                                width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(245), borderRadius: ScreenUtil.scaleSizeW(12),
                                marginHorizontal: ScreenUtil.scaleSizeW(20)
                            }}>

                            {Platform.OS === 'ios' ?
                                <Image style={{ position: 'absolute', width: ScreenUtil.scaleSizeW(310), height: ScreenUtil.scaleSizeW(116), right: 0, top: 0, resizeMode: "stretch" }} source={bgImg} />
                                :
                                <FastImage
                                    style={{ position: 'absolute', width: ScreenUtil.scaleSizeW(310), height: ScreenUtil.scaleSizeW(116), right: 0, top: 0 }}
                                    source={bgImg}

                                />
                            }

                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(20) : ScreenUtil.scaleSizeW(16) }}>
                                <View style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(28), backgroundColor: "white", borderTopRightRadius: ScreenUtil.scaleSizeW(6), borderBottomRightRadius: ScreenUtil.scaleSizeW(6) }} />
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white", marginLeft: ScreenUtil.scaleSizeW(10) }}>{item.title.name}</Text>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(255,255,255,0.6)", marginLeft: ScreenUtil.scaleSizeW(10) }}>{"(入选" + item.title.number + "只)"}</Text>
                                <View style={{ flex: 1 }} />
                            </View>
                            <View style={{ height: ScreenUtil.scaleSizeW(40), marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(10) : ScreenUtil.scaleSizeW(6), marginBottom: ScreenUtil.scaleSizeW(12), marginHorizontal: ScreenUtil.scaleSizeW(26) }}>
                                <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)", }}
                                    numberOfLines={1} ellipsizeMode={'tail'}
                                >{item.title.intro}</Text>
                            </View>

                            <View style={{ flex: 1, flexDirection: "row", backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                <View style={{ width: ScreenUtil.scaleSizeW(180), justifyContent: "center", marginLeft: ScreenUtil.scaleSizeW(50) }}>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#333333" }}>{item.data[0]}</Text>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#666666", marginTop: ScreenUtil.scaleSizeW(5) }}>{item.data[1]}</Text>
                                </View>

                                <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(30) }}>
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                        <StockFormatText precision={2} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: textColors }}>{item.data[2]}</StockFormatText>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>现价</Text>
                                    </View>
                                </View>

                                <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(50) }}>
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>

                                        <StockFormatText precision={2} unit={"%"} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: textColors }}>{item.data[3]}</StockFormatText>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>涨幅</Text>
                                    </View>
                                </View>

                            </View>
                        </LinearGradient>
                        <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(15), backgroundColor: "#f6f6f6" }} />

                    </TouchableOpacity>
                </View>

                :
                <TouchableOpacity activeOpacity={0.9} onPress={() => {

                    this.sensorsAppear(item.title.name);

                    Navigation.navigateForParams(this.props.navigation, "TargetDetailPage", { keyWord: item.title.name, intro: item.title.intro, from: path.row })
                }}>

                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={backgrounds}
                        style={{
                            width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(245), borderRadius: ScreenUtil.scaleSizeW(12),
                            marginHorizontal: ScreenUtil.scaleSizeW(20)
                        }}>
                        <Image style={{ position: 'absolute', width: ScreenUtil.scaleSizeW(310), height: ScreenUtil.scaleSizeW(116), right: 0, top: 0, resizeMode: "stretch" }} source={bgImg} />

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(20) : ScreenUtil.scaleSizeW(16) }}>
                            <View style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(28), backgroundColor: "white", borderTopRightRadius: ScreenUtil.scaleSizeW(6), borderBottomRightRadius: ScreenUtil.scaleSizeW(6) }} />
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white", marginLeft: ScreenUtil.scaleSizeW(10) }}>{item.title.name}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(255,255,255,0.6)", marginLeft: ScreenUtil.scaleSizeW(10) }}>{"(入选" + item.title.number + "只)"}</Text>
                            <View style={{ flex: 1 }} />
                        </View>
                        <View style={{ height: ScreenUtil.scaleSizeW(40), marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(10) : ScreenUtil.scaleSizeW(6), marginBottom: ScreenUtil.scaleSizeW(12), marginHorizontal: ScreenUtil.scaleSizeW(26) }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)", }}
                                numberOfLines={1} ellipsizeMode={'tail'}
                            >{item.title.intro}</Text>
                        </View>

                        <View style={{ flex: 1, flexDirection: "row", backgroundColor: 'rgba(255,255,255,0.8)' }}>
                            <View style={{ width: ScreenUtil.scaleSizeW(180), justifyContent: "center", marginLeft: ScreenUtil.scaleSizeW(50) }}>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#333333" }}>{item.data[0]}</Text>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#666666", marginTop: ScreenUtil.scaleSizeW(5) }}>{item.data[1]}</Text>
                            </View>

                            <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(30) }}>
                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <StockFormatText precision={2} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: textColors }}>{item.data[2]}</StockFormatText>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>现价</Text>
                                </View>
                            </View>

                            <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(50) }}>
                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>

                                    <StockFormatText precision={2} unit={"%"} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: textColors }}>{item.data[3]}</StockFormatText>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>涨幅</Text>
                                </View>
                            </View>

                        </View>
                    </LinearGradient>
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(15), backgroundColor: "#f6f6f6" }} />

                </TouchableOpacity>

        )
    };
    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this._removeTimer();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
        this.xgTabChange && this.xgTabChange.remove();
        this.appMainTabChange && this.appMainTabChange.remove();
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f6f6f6"
    }
});
