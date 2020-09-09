/**
 * Created by cuiwenjuan on 2019/8/13.
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    ScrollView,
    Dimensions,
    NativeModules,
    ImageBackground,
    StyleSheet, PixelRatio
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { commonUtil, toast } from '../../utils/CommonUtils'
import * as  baseStyle from '../../components/baseStyle'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
import { StickyForm } from "react-native-largelist-v3";
import ExpandableText from '../../components/ExpandableText'
import RequestInterface from '../../actions/RequestInterface'
import Yd_cloud from '../../wilddog/Yd_cloud'
import { historyType } from './HistoryRecordPage'
import StockFormatText from '../../components/StockFormatText'
import NoDataPage from '../NoDataPage'
import LinearGradient from 'react-native-linear-gradient';
import { mNormalFooter } from "../../components/mNormalFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
import ShareSetting from '../../modules/ShareSetting'
import QuotationListener from '../../utils/QuotationListener';

var { height, width } = Dimensions.get('window');

let refPath = Yd_cloud().ref(MainPathYG);
//部分源达云节点修改为MainPathYG2
let refPath2 = Yd_cloud().ref(MainPathYG2);
let pathArray = [
    { 'CeLueJieShao': 'CeLueJieShao/11', 'ChengZhangXueTang': 'ChengZhangXueTang/热点风口之一飞冲天', 'path': '/celuexuangu/getredianfengkou1' },
    { 'CeLueJieShao': 'CeLueJieShao/12', 'ChengZhangXueTang': 'ChengZhangXueTang/热点风口之步步为赢', 'path': '/celuexuangu/getredianfengkou2' },
    { 'CeLueJieShao': 'CeLueJieShao/13', 'ChengZhangXueTang': 'ChengZhangXueTang/热点风口之一箭三雕', 'path': '/celuexuangu/getredianfengkou3' },
];

let historyT = [historyType.hotOne, historyType.hotTwo, historyType.hotStock];


let widthCell = 100;
let SECTION_HEIGHT = ScreenUtil.scaleSizeW(60);
import * as ScreenUtil from '../../utils/ScreenUtil';

export default class HotTuyerePage extends Component {
    // 股票名称（股票代码）、涨跌幅、现价、所属板块、换手率、市盈率

    constructor(props) {
        super(props);
        this.state = {
            strategy: '',
            growSchool: [],
            stockArray: [],
            setData: [],
            sortDown: true,
            titles: [
                "涨跌幅",
                "现价",
                "所属板块",
                "换手率",
                "市盈率"
            ],
            allLoaded: true,
        };
        this.tabIndex = this.props.tabIndex;
        let pathMessage = pathArray[this.tabIndex];
        this.refPathCeLue = refPath2.ref(pathMessage.CeLueJieShao);
        this.refPathXueTang = refPath.ref(pathMessage.ChengZhangXueTang);
        this.postPath = pathMessage.path;

        this.historyTypeS = historyT[this.tabIndex];
        this.sortButtonIndex = 3;
        this.setParamString = '';
        this.czxtPath = pathMessage.ChengZhangXueTang;

        this.addQuotationList = [];
        this.hearderHeight = 0;//给表格原生传入的header高度，防止滑动问题
    }

    componentWillMount() {
        this._loadData();
        // this._getStockMessage()
        // this._createTimer();
    }

    componentWillUnmount() {
        this._removeTimer();
    }

    //显示当前页面
    willFocus() {
        // console.log('HotTuyerePage 显示当前页面',this.tabIndex)
        this._getStockMessage()
        this._createTimer();
        this._createTimerTen();

    }
    //不在当前页面
    willBlur() {
        // console.log('HotTuyerePage 不显示当前页面',this.tabIndex)
        this._removeTimer();
        this._offListeners();
    }


    //十秒排序
    _createTimerTen() {
        if (!this.timerTen) {
            this.timerTen = setInterval(() => {
                this.setState({ stockArray: this._getOrderMessage(this.state.stockArray) });
            }, 1000 * 10);
        }
    }

    _createTimer() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                this._getStockMessage();
                //console.log('HotTuyerePage 定时器 五分钟一次',this.tabIndex);
            }, 1000 * 5 * 60);
        }
    }

    _removeTimer() {
        this.timer && clearInterval(this.timer);
        this.timer = undefined;

        this.timerTen && clearInterval(this.timerTen);
        this.timerTen = undefined;
    }

    _loadData() {
        // console.log('热点风口  策略原理： = ',this.state)

        let pg = this;
        this.refPathCeLue.get((snapshot) => {
            //console.log('热点风口  策略原理： = ',JSON.stringify(snapshot),this.state );
            if (snapshot.nodeContent) {
                pg.setState({ strategy: snapshot.nodeContent })
            }
        });

        this.refPathXueTang.get(function (snapshot) {
            // console.log('热点风口  成长学堂： = ',JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                let values = Object.values(snapshot.nodeContent);
                // values.push(values[0]);
                values.reverse();
                if (values && values.length > 0) {
                    let newItem = [];
                    for (let i = 0; i < (values.length >= 2 ? 2 : values.length); i++) {
                        newItem.push(values[i]);
                    }
                    pg.setState({ growSchool: newItem })
                }
            }
        });

    }

    //实时数据监听
    _addListeners() {
        // alert('监听数据 = ',JSON.stringify(this.addQuotationList))

        if (this.addQuotationList.length > 0) {
            this.getStockListInfo(() => {
                QuotationListener.addListeners(this.addQuotationList, (stockObj) => {
                    // console.log("监听行情回来的数据");
                    // console.log(stockObj)
                    //设置行情数据
                    this.setQuotation(stockObj);
                })
            });
        }
    }

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
                                this.state.stockArray[0].items[i].turnoverRate = Number(stockObj[j].ak);
                                this.state.stockArray[0].items[i].peRatio = Number(stockObj[j].al);
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


    _getStockMessage() {
        this._offListeners();

        let setArray = [];

        let path = this.postPath;
        let param = { "bkmc": "" };
        if (this.setParamString) {
            param.bkmc = this.setParamString;
            setArray = this.setParamString.split(",");
        }
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, path, param, (response) => {

            this._list.endRefresh();
            let stockArray = [];
            let message = {};
            message.count = response.count;
            message.items = response.list;
            stockArray.push(message);

            this.setState({
                stockArray: this._getOrderMessage(stockArray),
                setData: setArray,
                allLoaded: true,

            })

            //注册
            this._addListeners();
        }, () => {
            this._list.endRefresh();
            this.setState({
                allLoaded: false,
            })
        });
    }

    render() {
        return (
            <StickyForm
                style={{ backgroundColor: "#f6f6f6" }}
                contentStyle={{ alignItems: "flex-start", width: 600 + 15 }}
                data={this.state.stockArray}
                ref={ref => (this._list = ref)}
                heightForSection={() => SECTION_HEIGHT}
                renderHeader={this._renderHeader}
                renderSection={this._renderSection}
                heightForIndexPath={() => 50}
                renderIndexPath={this._renderItem}
                showsHorizontalScrollIndicator={false}
                // bounces={false}
                headerStickyEnabled={false}
                renderEmpty={this._emptyData}
                onRefresh={() => { this._getStockMessage() }}
                allLoaded={this.state.allLoaded}
                loadingFooter={mNormalFooter}
                refreshHeader={mNormalHeader}
                onLoading={() => { }}
                hearderHeight={this.hearderHeight}
                /*
                         * lock (left 锁定左边距，使左边距没有 bounces 效果)
                         * x X坐标，y Y坐标，w 宽，h 高 (取消矩形外手势操作))
                         * 目前只实现了 lock:left,hot:y 效果
                         */
                hotBlock={{ lock: "left", hotBlock: { x: 0, y: this.hearderHeight, width: 0, height: 0 } }}
            />
        );
    }

    //数据返回后进行排序
    _getOrderMessage(stocks) {

        let stockMessage = stocks;

        if (stockMessage.length <= 0) {
            return [];
        }

        let messages = stockMessage[0].items;
        let newArray = [];

        for (var j = 0, length = messages.length; j < length; j++) {
            var temp1 = Object.assign({}, messages[j]);
            newArray.push(temp1);
        }

        if (this.state.sortDown) {
            newArray.sort((a, b) => {
                return b.turnoverRate - a.turnoverRate;
            });
        } else {
            newArray.sort((a, b) => {
                return a.turnoverRate - b.turnoverRate;
            });
        }

        if (newArray.length <= 0) {
            return [];
        }

        //数据监听处理
        let listenertArray = [];
        newArray.map((info, index) => {
            let code = info.marketCode;
            listenertArray.push(code)
        })
        this.addQuotationList = listenertArray;

        stockMessage[0].items = newArray;
        return stockMessage;

    }

    //分割线
    _lineView() {
        return (
            <View style={{ width: commonUtil.width, height: 8 }} />
        )
    }
    //策略原理
    _strategyView() {
        return (
            <View>
                {/*{this._lineView()}*/}
                <View style={{ padding: 15 }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: "center", marginBottom: ScreenUtil.scaleSizeW(10), marginTop: ScreenUtil.scaleSizeW(8) }}>
                        <Text style={{ fontSize: 15, color: '#fff' }}>{'策略原理'}</Text>

                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={styles.hotSetButton}
                            onPress={() => this._historyPress()}>
                            <Text style={{ fontSize: 12, color: baseStyle.ORANGE_FF9933 }}>{'历史表现'}</Text>
                        </TouchableOpacity>

                    </View>

                    <ExpandableText style={{
                        width: ScreenUtil.screenW - 30, color: 'white', paddingVertical: ScreenUtil.scaleSizeW(15),
                        fontSize: ScreenUtil.setSpText(28)
                    }}
                        expandButtonLocation="center"
                        expandTextStyle={{ color: 'rgba(255,255,255,0.6)' }}>
                        {this.state.strategy}
                    </ExpandableText>
                </View>
            </View>
        )
    }
    //成长学堂
    _growSchoolView() {
        if (this.state.growSchool.length <= 0) {
            return null;
        }
        return (
            <View>
                {/*{this._lineView()}*/}
                <View style={{
                    backgroundColor: baseStyle.BLACK_20,
                    marginRight: 5,
                    marginLeft: 5,
                    borderRadius: 5,
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: "center",
                        // padding:10,
                        // paddingTop:15,
                        paddingHorizontal: 10,
                        height: ScreenUtil.scaleSizeW(77),
                        borderBottomWidth: 1,
                        borderBottomColor: baseStyle.BLACK_30
                    }}>
                        <View style={{ width: 3, height: 14, backgroundColor: "#fff" }} />
                        <Text style={{ flex: 1, fontSize: 15, color: "#fff" }}>{' 成长学堂'}</Text>
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center' }} onPress={() => {

                            Navigation.pushForParams(this.props.navigation, 'StrategyCoursePage');
                        }}>
                            <Text style={{ fontSize: 15, color: baseStyle.BLACK_999999 }}>{'更多 '}</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/hits/hq_kSet_back.png')} />
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.growSchool.map((info, index) => (
                            <TouchableOpacity onPress={() => {

                                let paths = this.czxtPath.split("/");
                                let optionParams = { nodeName: paths[0], taoxiName: paths[1] };
                                Navigation.pushForParams(this.props.navigation, 'CourseDetailPage', {
                                    key: info.createTime,
                                    type: 'Strategy',
                                    ...optionParams
                                });

                            }} key={index} style={{ height: 44 }}>
                                <View style={{
                                    flex: 1,
                                    marginRight: 10,
                                    marginLeft: 20,
                                    borderTopWidth: index > 0 ? 1 : 0,
                                    borderTopColor: baseStyle.BLACK_30,
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}>
                                    <Text style={{ fontSize: 14, color: '#fff' }}>{info.title}</Text>
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
    //热点设置
    _hotSetView() {
        return (
            <View>
                <View style={{
                    backgroundColor: baseStyle.BLACK_20,
                    marginRight: 5,
                    marginLeft: 5,
                    borderRadius: 5,
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        // padding:10,
                        // paddingTop:15,
                        paddingHorizontal: 10,
                        height: ScreenUtil.scaleSizeW(88),
                        borderBottomWidth: this.state.setData.length > 0 ? 1 : 0,
                        borderBottomColor: baseStyle.BLACK_30
                    }}>
                        <View style={{ width: 3, height: 14, backgroundColor: "#fff" }} />
                        <Text style={{ fontSize: 15, color: '#fff' }}>{' 热点设置'}</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={styles.hotSetButton}
                            onPress={() => this._hotSetPress()}>
                            <Image source={require('../../images/hits/fold_img.png')} />
                            <Text style={{ fontSize: 12, color: baseStyle.ORANGE_FF9933, marginLeft: 10 }}>{'热点设置'}</Text>
                        </TouchableOpacity>
                    </View>

                    {
                        this.state.setData.length > 0 &&
                        <View style={{ flexDirection: "row", flexWrap: 'wrap', marginLeft: 12, marginRight: 12, marginBottom: 12 }}>
                            {this.state.setData.map((info, index) => (
                                <View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 30,
                                    backgroundColor: '#FFCC00',
                                    marginRight: 10,
                                    borderRadius: 5,
                                    marginTop: 10,
                                }}>
                                    <Text style={{ fontSize: 14, marginLeft: 7, marginRight: 7 }}>{info}</Text>
                                </View>
                            ))
                            }
                        </View>
                    }
                </View>

            </View>
        )

    }
    //选股个数
    _stockNumberView() {
        let stockCount = 0;
        let curretTime = undefined;

        if (this.state.stockArray.length > 0) {
            let stockData = this.state.stockArray[0]
            stockCount = stockData.count;
            if (stockData.items && stockData.items.length > 0) {
                curretTime = stockData.items[0].currentDates;
            }
        }

        let currentDate = Date.parse(new Date());
        let currentDateS = ShareSetting.getDate(currentDate, 'yyyy-MM-dd HH:mm');
        curretTime = curretTime ? ShareSetting.getDate(curretTime, 'yyyy-MM-dd HH:mm') : currentDateS;


        return (
            <View>
                {this._lineView()}
                <View style={{
                    // flexDirection:'row',
                    justifyContent: 'center',
                    height: 44,
                    alignItems: 'center',
                    paddingLeft: 15,
                    paddingRight: 15,
                    backgroundColor: '#fff',
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                }}>
                    <Text style={{ fontSize: 12, color: baseStyle.BLACK_100 }}>{'入选股票（' + stockCount + '只）'}</Text>
                    <Text style={{ fontSize: 12, color: baseStyle.BLACK_99 }}>{curretTime + '更新'}</Text>

                </View>
            </View>
        )
    }

    //历史战绩press
    _historyPress() {
        // toast('历史战绩');
        Navigation.pushForParams(this.props.navigation, 'HistoryRecordPage', { type: this.historyTypeS });
    }
    //热点设置press
    _hotSetPress() {
        Navigation.pushForParams(this.props.navigation, 'HotSetPage', {
            title: '热点设置', setData: this.state.setData, callBack: (selectedString) => {
                this.setParamString = selectedString;
                this._getStockMessage();
            }
        });
    }


    _emptyData = () => {
        let stocks = this.state.stockArray;

        if (stocks.length > 0) {
            return null;
        }
        return (
            <View style={{ flexDirection: "row", height: SECTION_HEIGHT + 400 }}>
                <View>
                    {this._sectionTitle()}

                    <View style={{ width: commonUtil.width, height: 300 }}>
                        <NoDataPage
                            content={'暂无股票入选'}
                            source={require('../../images/TuyereDecision/no_stock_data.png')}
                            isNoShow={true} />
                    </View>

                </View>

                <View style={{
                    height: SECTION_HEIGHT, position: "absolute", flexDirection: "row",
                    top: 0, left: widthCell, width: widthCell * 5, right: 0, backgroundColor: '#F1F8FD'
                }}>
                    {this.state.titles.map((title, index) =>
                        this._sectionScrollTitle(title, index)
                    )}
                </View>
            </View>
        )
    }

    _renderHeader = () => {
        return (
            <View style={{ width: commonUtil.width, backgroundColor: "white", }}>
                <View style={{ flexDirection: "column", backgroundColor: "white", }}
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
                        colors={['#857A9B', '#524383']}
                        style={{ borderRadius: 10 }}>
                        {this._strategyView()}
                        {this._growSchoolView()}
                        {this._hotSetView()}
                        {this._stockNumberView()}
                        {/*{this._emptyData()}*/}
                    </LinearGradient>
                    {/*{this._lineView()}*/}
                    {/*<Text onPress={() => {this._getMessage()}}>{'调用接口'}</Text>*/}
                    {/*<Text onPress={() => {this._getMessageGet()}}>{'get请求'}</Text>*/}

                </View>
            </View>
        );
    };

    //排序press
    _sortPress(index) {
        if (index !== 3) { return; }

        this.setState({
            sortDown: !this.state.sortDown,
        }, () => { this.setState({ stockArray: this._getOrderMessage(this.state.stockArray) }) })
    }


    _sectionTitle() {
        return (
            <View style={styles.text}>
                <Text>股票名称</Text>
            </View>
        )
    }

    _sectionScrollTitle(title, index) {
        let sortImage = this.state.sortDown ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        let defaultSortImage = require('../../images/hits/defaultt.png')
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this._sortPress(index)} style={styles.headerText} key={index}>
                <Text>
                    {title}
                </Text>
                {
                    index === 3 && <Image style={{ marginLeft: 5 }} source={
                        index === this.sortButtonIndex ? sortImage : defaultSortImage
                    } />
                }
            </TouchableOpacity>
        )
    }

    _renderSection = (section: number) => {
        return (
            <View style={{ flex: 1, flexDirection: "row", paddingRight: 15, backgroundColor: "#F1F8FD", }}>
                {this._sectionTitle()}
                {this.state.titles.map((title, index) =>
                    this._sectionScrollTitle(title, index)
                )}

                {/*<View style={{width:30,height:30,left:commonUtil.width - 30,top:0, position: 'absolute', backgroundColor:'#ff1e6a'}}/>*/}
            </View>
        );
    };


    _itemView(title, index, item) {

        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (item.upDown > 0) clr = baseStyle.UP_COLOR;
        else if (item.upDown < 0) clr = baseStyle.DOWN_COLOR;

        let stockMessage = '';
        let textView = (stockMessage) => (
            <StockFormatText style={{ textAlign: 'right', fontSize: 16, }}>{stockMessage}</StockFormatText>
        )

        switch (title) {
            case '涨跌幅':
                stockMessage = item.upDown;
                textView = (
                    <StockFormatText style={{ textAlign: 'right', fontSize: 16, color: clr, }} unit="%" sign={true}>{stockMessage / 100}</StockFormatText>
                )
                break;
            case '现价':
                stockMessage = item.presentPrice;
                textView = (
                    <StockFormatText titlename={"ZuiXinJia"} style={{
                        textAlign: 'right',
                        // marginRight: commonUtil.rare(20),
                        fontSize: 16,
                        // fontWeight: 'bold',
                        color: clr,
                    }}>{stockMessage}</StockFormatText>
                )
                break;
            case '所属板块':
                stockMessage = item.indexName;
                textView = textView(stockMessage);
                break;
            case '换手率':
                stockMessage = item.turnoverRate;
                textView = textView(stockMessage);

                break;
            case '市盈率':
                stockMessage = item.peRatio;
                textView = textView(stockMessage);

                break;
            default:
                break;

        }

        return (
            <View style={{
                flex: 1,
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

    _renderItem = (path: IndexPath) => {
        const item = this.state.stockArray[path.section].items[path.row];

        return (
            <TouchableOpacity onPress={() => this._pushDetailPage(item, path.row)} style={styles.row}>
                <View style={styles.titleText}>
                    <Text style={{ fontSize: 15, color: baseStyle.BLACK_333333 }}>
                        {item.secName}
                    </Text>
                    <Text style={{ fontSize: 12, color: baseStyle.BLACK_666666 }}>
                        {item.marketCode}
                    </Text>
                </View>
                {this.state.titles.map((title, index) => this._itemView(title, index, item))}
            </TouchableOpacity>
        );
    };

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
        flexDirection: 'row',
    },
    text: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F8FD",
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
        paddingRight: 15,
        backgroundColor: '#fff'
    },
    headerText: {
        justifyContent: "flex-end",
        alignItems: "center",
        flexDirection: 'row',
        width: widthCell,
    },
    titleText: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#EEE",
        width: widthCell,
    }
});

const data = [
    {
        count: "",
        items: [
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
            { id: 314578, secCode: "600886", secName: "国投电力", indexName: "上证180成份股", marketCode: "SH600886", upDown: 0, presentPrice: 0, turnoverRate: 0, peRatio: 0, currentDates: null },
        ]
    },
];