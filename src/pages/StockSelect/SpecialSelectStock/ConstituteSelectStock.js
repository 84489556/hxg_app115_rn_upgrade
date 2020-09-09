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
    ImageBackground,
    StatusBar,
    InteractionManager, StyleSheet, DeviceEventEmitter
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { LargeList } from "react-native-largelist-v3";
import * as ScreenUtil from '../../../utils/ScreenUtil';
import TargetDetailPage from "./TargetDetailPage";
import { mNormalHeader } from "../../../components/mNormalHeader";
import { mNormalFooter } from "../../../components/mNormalFooter";
import Yd_cloud from "../../../wilddog/Yd_cloud";
import HitsApi from "../../Hits/Api/HitsApi";
import RequestInterface from "../../../actions/RequestInterface";

let refHXG = Yd_cloud().ref(MainPathYG);
let getIndex = refHXG.ref('DingJu/TeSeZhiBiaoXuanGu');
import LinearGradient from 'react-native-linear-gradient';
import QuotationListener from "../../../utils/QuotationListener";
import StockFormatText from '../../../components/StockFormatText';

export default class ConstituteSelectStock extends Component<Props> {

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

        }

        this._renderIndexPath = this._renderIndexPath.bind(this)

        this.mScrolly = 0;//列表的滑动偏移量
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(265);//Item高度

        // this.requestNumber = 0;//用于第一次进入,记录第一次getTargetDatas和QuotationListeners两个接口的回调问题，只有当两个接口都回调以后才能监听数据的变化
        this.addQuotationList = [];//记录当前需要监听的数组

        this.scrollBegin = false; //惯性滑动减速停止
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
            //第一次加载数据完成后，监听数据变化
            this.getFirstStock(() => {
                this.addFirstQ();
            });
        });
        //设置定时器监听
        this._createTimer();
        this._addListeners();
        //this.QuotationListeners();
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
                //console.log("获取到第一次的基础数据")
                //console.log(stockObj);
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
     * 第一次进入页面监听可见的行情数据
     * */
    addFirstQ() {
        if (this.addQuotationList && this.addQuotationList.length > 0) {
            this.addQuotationList = [];
        }
        if (this.state.data[0].items.length > 0) {
            //获取当前屏幕最多显示的数量，当前为5条
            let itemNumber = Math.floor((ScreenUtil.screenH - ScreenUtil.statusH - 44 - ScreenUtil.scaleSizeW(60) - 44) / this.ITEM_HEGHT);
            let times = 0
            if (this.state.data[0].items.length > itemNumber + 1) {
                times = itemNumber + 1;
            } else {
                times = this.state.data[0].items.length
            }
            for (let i = 0; i < times; i++) {
                if (this.state.data[0].items[i].data[1] && this.state.data[0].items[i].data[1] != '--') {
                    this.addQuotationList.push(this.state.data[0].items[i].data[1])
                }
            }
            if (this.addQuotationList.length > 0) {
                QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                    //设置行情数据
                    this.setQuotation(stockObj);
                })
            }
        } else {
            return;
        }
    }
    _addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                // alert('willFocus');
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

                                        this.getFirstStock(() => {
                                            if (this.addQuotationList && this.addQuotationList.length > 0) {
                                                //如果有数据,先去解注册
                                                QuotationListener.offListeners(this.addQuotationList, () => { });
                                                this.addQuotationList = [];
                                            }
                                            this.setListener();
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
                if (this.addQuotationList && this.addQuotationList.length > 0) {
                    //如果有数据,先去解注册
                    QuotationListener.offListeners(this.addQuotationList, () => { });
                    this.addQuotationList = [];
                }
                //当前页面每5分钟强制刷新一次;
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
                //console.log(item);
                if (item && item.length > 0) {
                    for (let i = 0; i < item.length; i++) {
                        let name = item[i].indicatorName;
                        if (name === "一箭三雕" || name === "一飞冲天" || name === "步步为赢") {

                            //按照固定顺序显示
                            let sortIndex;
                            switch (name) {
                                case "一箭三雕":
                                    sortIndex = 2;
                                    break;
                                case "一飞冲天":
                                    sortIndex = 0;
                                    break;
                                case "步步为赢":
                                    sortIndex = 1;
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
                            titles.number = item[i].count >= 20 ? 20 : item[i].count;
                            newItem.title = titles;

                            //数据项，一定要按照数据添加
                            let dataItem = [];
                            if (item[i] && item[i].maxUpDown) {
                                dataItem.push(item[i].maxUpDown.secName ? item[i].maxUpDown.secName : '--');
                                dataItem.push(item[i].maxUpDown.marketCode ? item[i].maxUpDown.marketCode : '--');
                                dataItem.push(item[i].maxUpDown.presentPrice ? item[i].maxUpDown.presentPrice : '--');
                                dataItem.push(item[i].maxUpDown.upDown ? item[i].maxUpDown.upDown / 100 : '--');
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
                    //console.log(this.state.data);
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
        return (
            <LargeList
                ref={ref => (this._list = ref)}
                style={styles.container}
                data={this.state.data}
                heightForSection={() => 0.001}
                renderSection={this._renderSection}
                heightForIndexPath={(item) => {
                    if (item.row === this.state.data[0].items.length - 1) {
                        return ScreenUtil.scaleSizeW(280)
                    } else {
                        return ScreenUtil.scaleSizeW(265)
                    }
                }
                }
                renderIndexPath={this._renderIndexPath}
                refreshHeader={mNormalHeader}
                onRefresh={() => {
                    this.getTargetDatas(() => {
                        this._list.endRefresh();
                    });
                    //setTimeout(() => , 1000);
                }}
                allLoaded={this.state.allLoaded}
                loadingFooter={mNormalFooter}
                onLoading={() => { }}
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
                    if (Platform.OS !== 'ios') {
                        return;
                    }
                    this.scrollBegin = true;
                }}
                onMomentumScrollEnd={() => {
                    this.mScrollEnd();
                }}
                onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                    this.mScrolly = y;
                }}
            />
        )
    }

    /**
     * 滑动惯性停止后调用的方法
     *itemNumber的算法，分子为计算当前屏幕列表显示的高度，简单的加减法
     * */
    mScrollEnd() {

        if (this.state.data[0].items.length > 0) {

            if (this.addQuotationList && this.addQuotationList.length > 0) {
                //如果有数据,先去解注册
                QuotationListener.offListeners(this.addQuotationList, () => { });
                this.addQuotationList = [];
            }
            this.setListener();
        } else {
            return;
        }
    }
    /**
     * 设置滑动的监听，提取出来
     * 便于切换取消注册监听
     * */
    setListener() {
        let numberStart = Math.floor((this.mScrolly) / this.ITEM_HEGHT);
        let itemNumber = Math.floor((ScreenUtil.screenH - ScreenUtil.statusH - 44 - ScreenUtil.scaleSizeW(60) - 44) / this.ITEM_HEGHT);
        if (numberStart >= 0) {
            //结束位置的position的索引
            let offPosition = 0;
            if (numberStart + itemNumber + 1 > this.state.data[0].items.length - 1) {
                // offPosition = numberStart + ( itemNumber+1 -( numberStart + itemNumber+1 - (this.state.data[0].items.length-1)));
                if (this.state.data[0].items.length < itemNumber + 1) {
                    offPosition = this.state.data[0].items.length;
                } else {
                    offPosition = this.state.data[0].items.length - 1;
                }
            } else {
                offPosition = numberStart + itemNumber + 1;
            }
            for (let i = numberStart; i < offPosition; i++) {
                if (this.state.data[0].items[i].data[1] && this.state.data[0].items[i].data[1] != '--') {
                    this.addQuotationList.push(this.state.data[0].items[i].data[1])
                }
            }
            if (this.addQuotationList.length > 0) {
                QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                    // console.log("监听行情回来的数据");
                    // console.log(stockObj)
                    //设置行情数据
                    this.setQuotation(stockObj);
                })
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
                }
            }
            //页面刷新
            this.setState({
                data: this.state.data
            })
        }
    }

    _renderSection() {
        return <View />
    }

    _renderIndexPath = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        //一箭三雕" || name === "空中加油" || name === "齐头并进
        let bgImg;
        //(name === "一箭三雕" || name === "一飞冲天" || name === "步步为赢")
        switch (item.title.name) {
            case "一箭三雕":
                bgImg = require('../../../images/hits/yjsd.png');
                break;
            case "一飞冲天":
                bgImg = require('../../../images/hits/yfct.png');
                break;
            case "步步为赢":
                bgImg = require('../../../images/hits/qtbj.png');
                break;
            default:
                bgImg = require('../../../images/hits/syzc.png');
                break;
        }

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => { Navigation.pushForParams(this.props.navigation, "TargetDetailPage", { keyWord: item.title.name, intro: item.title.intro, from: 'constitute' }) }}>
                <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(15), backgroundColor: "#f6f6f6" }} />
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={['#CC66FF', '#B726FF']}
                    style={{
                        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(250), borderRadius: ScreenUtil.scaleSizeW(12),
                        marginHorizontal: ScreenUtil.scaleSizeW(20)
                    }}>
                    <Image style={{ position: 'absolute', width: ScreenUtil.scaleSizeW(310), height: ScreenUtil.scaleSizeW(124), right: 0, top: 0, resizeMode: "stretch" }} source={bgImg} />

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(20) : ScreenUtil.scaleSizeW(16) }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(28), backgroundColor: "white", borderTopRightRadius: ScreenUtil.scaleSizeW(6), borderBottomRightRadius: ScreenUtil.scaleSizeW(6) }} />
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white", marginLeft: ScreenUtil.scaleSizeW(10) }}>{item.title.name}</Text>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(255,255,255,0.6)", marginLeft: ScreenUtil.scaleSizeW(10) }}>{"(入选" + item.title.number + "只)"}</Text>
                        <View style={{ flex: 1 }} />
                    </View>
                    <View style={{ height: ScreenUtil.scaleSizeW(40), marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(10) : ScreenUtil.scaleSizeW(6), marginBottom: ScreenUtil.scaleSizeW(12), marginHorizontal: ScreenUtil.scaleSizeW(26) }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)" }} numberOfLines={1} ellipsizeMode={'tail'}
                        >{item.title.intro}</Text>
                    </View>

                    <View style={{ flex: 1, flexDirection: "row", backgroundColor: 'rgba(255,255,255,0.8)' }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(180), justifyContent: "center", marginLeft: ScreenUtil.scaleSizeW(50) }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#333333" }}>{item.data[0]}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#666666", marginTop: ScreenUtil.scaleSizeW(5) }}>{item.data[1]}</Text>
                        </View>

                        <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(30) }}>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                <StockFormatText precision={2} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "#F92400" }}>{item.data[2]}</StockFormatText>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>现价</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(50) }}>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                <StockFormatText precision={2} unit={"%"} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "#F92400" }}>{item.data[3]}</StockFormatText>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>涨幅</Text>
                            </View>
                        </View>

                    </View>
                </LinearGradient>
                {path.row === this.state.data[0].items.length - 1 ?
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(15), backgroundColor: "#f6f6f6" }} />
                    :
                    null
                }
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
