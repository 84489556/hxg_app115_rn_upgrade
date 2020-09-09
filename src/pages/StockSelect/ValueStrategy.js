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
import * as ScreenUtil from '../../utils/ScreenUtil';
import TargetDetailPage from "./SpecialSelectStock/TargetDetailPage";
import { mNormalHeader } from "../../components/mNormalHeader";
import { mNormalFooter } from "../../components/mNormalFooter";
import Yd_cloud from "../../wilddog/Yd_cloud";
import HitsApi from "../Hits/Api/HitsApi";
import RequestInterface from "../../actions/RequestInterface";

let refHXG = Yd_cloud().ref(MainPathYG);
//部分源达云节点修改为MainPathYG2
let refHXG2 = Yd_cloud().ref(MainPathYG2);
let list = refHXG2.ref('CeLueZhongXin/JiaZhiCeLue/NewOne');
let valueIntro = refHXG2.ref('CeLueJieShao');
import LinearGradient from 'react-native-linear-gradient';
import QuotationListener from "../../utils/QuotationListener";
import StockFormatText from '../../components/StockFormatText';
export default class ValueStrategy extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {

            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],//List数据,
            allLoaded: false,

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
        this.getTargetDatasNew(() => {
            this.getFirstStock(() => {
                this.addFirstQ();
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
            let itemNumber = Math.floor((ScreenUtil.screenH - ScreenUtil.statusH - 44 - 44) / this.ITEM_HEGHT);
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
                    //console.log("监听行情回调");
                    //console.log(stockObj);
                    //设置行情数据
                    this.setQuotation(stockObj);
                })
            }
        } else {
            return;
        }
    }

    /**
     * 设置行情数据
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

    _addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
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
                                    if (mainObj.mainPosition == 4 && childObj.indexPosition == 1) {
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
            if (obj != 1) {
                if (this.addQuotationList && this.addQuotationList.length > 0) {
                    //如果有数据,先去解注册
                    QuotationListener.offListeners(this.addQuotationList, () => { });
                    this.addQuotationList = [];
                }
            } else if (obj == 1) {
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
                this.getTargetDatasNew(() => {
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
     * 源达云节点获取价值策略选股
     *
     * */
    getTargetDatasNew(callBack) {
        this.state.data[0].items = [];
        list.get((response) => {
            if (response.code == 0) {
                //关闭刷新
                this._list.endRefresh();
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);

                for (let i = 0; i < key.length; i++) {
                    item[i]['key'] = key[i];
                }
                //item.reverse();
                //console.log(item);
                if (item.length > 0) {
                    for (let j = 0; j < item.length; j++) {
                        let name = item[j].key;
                        //按照固定顺序显示
                        let sortIndex;
                        switch (name) {
                            case "高成长":
                                sortIndex = 0;
                                break;
                            case "低估值":
                                sortIndex = 1;
                                break;
                            case "高分红":
                                sortIndex = 2;
                                break;
                            case "高盈利":
                                sortIndex = 3;
                                break;
                            case "现金牛":
                                sortIndex = 4;
                                break;
                            case "股东增持":
                                sortIndex = 5;
                                break;
                            case "高运营":
                                sortIndex = 5;
                                break;
                            case "白马绩优":
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
                        titles.name = item[j].key;
                        titles.intro = item[j].jieshao ? item[j].jieshao : "暂时没有填写介绍";
                        titles.number = item[j].count > 20 ? 20 : item[j].count;
                        newItem.title = titles;

                        //数据项，一定要按照数据添加
                        let dataItem = [];
                        dataItem.push(item[j].secName ? item[j].secName : '--');
                        dataItem.push(item[j].marketCode ? item[j].marketCode : '--');
                        dataItem.push(item[j].presentPrice ? item[j].presentPrice : '--');
                        dataItem.push(item[j].upDown ? item[j].upDown / 100 : '--');

                        newItem.data = dataItem;
                        this.state.data[0].items.push(newItem);
                    }
                    //console.log(this.state.data);
                    this.state.data[0].items = this.state.data[0].items.sort(this.sortNumSmalltoBig);

                    //处理了所有数据以后，再请求节点的最新介绍,现在两个节点不是在一起的
                    valueIntro.get((valueIntros) => {
                        //console.log('获取的所有介绍',valueIntros)
                        if (valueIntros.code == 0 && valueIntros.nodeContent) {

                            for (let j = 0; j < this.state.data[0].items.length; j++) {
                                switch (this.state.data[0].items[j].title.name) {
                                    case "高成长":
                                        if (valueIntros.nodeContent["2"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["2"];
                                        }
                                        break;
                                    case "低估值":
                                        if (valueIntros.nodeContent["3"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["3"];
                                        }
                                        break;
                                    case "高分红":
                                        if (valueIntros.nodeContent["4"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["4"];
                                        }
                                        break;
                                    case "高盈利":
                                        if (valueIntros.nodeContent["5"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["5"];
                                        }
                                        break;
                                    case "现金牛":
                                        if (valueIntros.nodeContent["6"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["6"];
                                        }
                                        break;
                                    case "股东增持":
                                        if (valueIntros.nodeContent["7"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["7"];
                                        }
                                        break;
                                    case "高运营":
                                        if (valueIntros.nodeContent["8"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["8"];
                                        }
                                        break;
                                    case "白马绩优":
                                        if (valueIntros.nodeContent["9"]) {
                                            this.state.data[0].items[j].title.intro = valueIntros.nodeContent["9"];
                                        }
                                        break;
                                    default:

                                        break;
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
                        allLoaded: false,
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
                ChineseWithLastDateFooter
                onRefresh={() => {
                    this.getTargetDatasNew(() => {
                        this._list.endRefresh();
                        this.getFirstStock(() => {
                            if (this.addQuotationList && this.addQuotationList.length > 0) {
                                //如果有数据,先去解注册
                                QuotationListener.offListeners(this.addQuotationList, () => { });
                                this.addQuotationList = [];
                            }
                            this.addFirstQ();
                        });
                    })
                }}
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
                allLoaded={this.state.allLoaded}
                loadingFooter={mNormalFooter}
                onLoading={() => { }}
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
        let itemNumber = Math.floor((ScreenUtil.screenH - ScreenUtil.statusH - 44 - 44) / this.ITEM_HEGHT);
        //console.log("itemNumber====",itemNumber)
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
            //console.log("监听列表",this.addQuotationList);
            if (this.addQuotationList.length > 0) {
                QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                    //console.log("监听行情回来的数据");
                    // console.log(stockObj)
                    //设置行情数据
                    this.setQuotation(stockObj);
                })
            }
        }
    }

    _renderSection() {
        return <View />
    }
    _renderIndexPath = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => { Navigation.pushForParams(this.props.navigation, "ValueDetailPage", { keyWord: item.title.name, intro: item.title.intro }) }}>
                <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(15), backgroundColor: "#f6f6f6" }} />
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={['#646f85', '#233367']}
                    style={{
                        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(250), borderRadius: ScreenUtil.scaleSizeW(12),
                        marginHorizontal: ScreenUtil.scaleSizeW(20),
                    }}>
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
    }


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
        flex: 1

    }
});
