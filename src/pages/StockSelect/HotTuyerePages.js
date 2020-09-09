/**
 * Created by cuiwenjuan on 2019/8/13.
 */
import React, { Component } from 'react';
import {
    Image,
    PixelRatio,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    DeviceEventEmitter,
    ActivityIndicator,
    AppState
} from 'react-native';
import { StickyForm } from "react-native-largelist-v3";
import LinearGradient from 'react-native-linear-gradient';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import ExpandableText from '../../components/ExpandableText';
import { mNormalFooter } from "../../components/mNormalFooter";
import StockFormatText from '../../components/StockFormatText';
import ShareSetting from '../../modules/ShareSetting';
import { commonUtil } from '../../utils/CommonUtils';
import QuotationListener from '../../utils/QuotationListener';
import * as ScreenUtil from '../../utils/ScreenUtil';
import Yd_cloud from '../../wilddog/Yd_cloud';
import AsyncStorage from '@react-native-community/async-storage';

let refPath = Yd_cloud().ref(MainPathYG);
let widthCell = 100;
let SECTION_HEIGHT = ScreenUtil.scaleSizeW(60);
import TopButton from "../../components/TopButton";
//1.1.5版本修改的一些部分源达云节点，不知道什么时候统一改回来
let refHXG2 = Yd_cloud().ref(MainPathYG2);
import NetInfo from "@react-native-community/netinfo";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { connection } from "../Quote/YDYunConnection";
import { mRiskTipsFooter } from "../../components/mRiskTipsFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
let stockupDate = refHXG2.ref('CeLueZhongXin/UpdateFlag');
import { searchStockIndex } from '../../utils/CommonUtils'


// function b_search(array, low, high, val) {
//     if (low > high) return -1;
//     let mid = low + ((high - low) >> 1);
//     let midValObj = array[mid]["label_"];
//     let midValCode = parseInt(midValObj.substring(2));
//     let valCode = parseInt(val.substring(2));
//     if (midValCode == valCode) {
//         return mid;
//     } else if (midValCode < valCode) {
//         return b_search(array, mid + 1, high, val);
//     } else {
//         return b_search(array, low, mid - 1, val);
//     }
// }

export default class HotTuyerePage extends Component {
    // 股票名称（股票代码）、涨跌幅、现价、所属板块、换手率、市盈率
    constructor(props) {
        super(props);
        this.state = {
            strategy: '',
            growSchool: [],
            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            sortDown: true,
            titles: [
                { conName: "涨跌幅", conCode: 1 },
                { conName: "现价", conCode: -1 },
                { conName: "换手率", conCode: -1 },
                { conName: "市盈率", conCode: -1 },
                { conName: "市净率", conCode: -1 },
            ],
            allLoaded: true,
            setData: [{ tabName: "放量上攻", tabIndex: 0 }],

            refreshDate: "",//最新刷新时间
            selected: false,//是否选中资金top筛选
            showRefresh: false,//是否显示股池已经更新的button
            stockListNumber: 0,//当前筛选条件下股池的数量
        };
        this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
        // this.tabIndex = this.props.tabIndex;
        //页面相关的Url,之前是三个策略公用一些页面，所以现在保持原来的数据结构,但是只有一个对象
        let pathMessage = {
            'CeLueJieShao': 'CeLueJieShao/17',
            'ChengZhangXueTang': 'ChengZhangXueTang/热点策略',
            'path': '/celuexuangu/getredianfengkou1'
        };
        this.refPathCeLue = refHXG2.ref(pathMessage.CeLueJieShao);
        this.refPathXueTang = refPath.ref(pathMessage.ChengZhangXueTang);
        this.postPath = pathMessage.path;

        this.historyTypeS = '/celuexuanguRes20/reDianFengKouOneRes20';

        this.hearderHeight = 0;//给表格原生传入的header高度，防止滑动问题
        this.firstEnter = 0;//是否第一次加载
        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(100);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        this.mScollY = 0;//记录一个值储存滑动的偏移量

        this.scrollBegin = false; //专用ios
        this.touchTemp = 0;//记录时间戳的中间值
        this.isStartAddListener = 0; //列表是否开始执行监听行情的函数了//三个状态 0，1，2 ，0初试状态，1，滑动开始状态，2已经开始注册监听状态

        this.startIndex = 0;//当前页面需要从哪条数据开始监听的Index
        this.addNumbers = 16;//监听页面的股票指数，固定的

        this.pageNumber = 1;
        this.pageSize = 500;

        this.pageFocus = true;//当前页面是否获取焦点，主要是解决跳出页面以后，还继续设置监听的问题

        //将大列表的排序List和股池的股票列表储存起来
        this.bigList = [];//大列表;
        this.stockPool = [];//股池股票

        this.listDesc = false;//判断当前列表是否升降序，主要是给页面排序使用

        this.netInfoStatus = "";//设置默认的网络监听状态，现在网络变化时,会很快回调很级次没有用的监听,目前本地延迟处理，所以一个变量记录一下
    }

    componentWillMount() {
        this._loadData();
        this.getStockPollDatas();
        this.addListeners();
    }

    componentWillUnmount() {


        this.firstEnter = 0;
        this.blockSortRequest && this.blockSortRequest.cancel();
        //this.blockSortListener && this.blockSortListener.remove();
        stockupDate && stockupDate.off('value', (response) => { });
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.netInfoSubscriber();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }

    addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                this.pageFocus = true;
                this.stockChanggeListtener();
                this.getListDatas();//获取焦点时去监听大列表排序,避免重复监听
                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.rediancelue);
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
    stockChanggeListtener() {
        stockupDate.on('value', (response) => {
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
        if (this.firstEnter === 0) {
            //排除第一次进入时，网络监听变化得到的重复请求
            return;
        }
        if (status && status.type && status.type !== "") {
            this.netInfoStatus = status.type;
        }

        if (this.netInfoTimer === undefined) {
            this.netInfoTimer = setTimeout(() => {
                if (this.netInfoStatus == 'none') {
                    this.clearRequest();
                    //this.blockSortListener && this.blockSortListener.remove();
                } else if (this.netInfoStatus = 'cellular' || this.netInfoStatus == 'wifi') {
                    this.stockChanggeListtener();
                    this.getListDatas();//获取焦点时去监听大列表排序,避免重复监听
                }
                this.netInfoTimer && clearTimeout(this.netInfoTimer);
                this.netInfoTimer = undefined;
            }, 1500)
        }
    }

    //应用前后台监听方法
    _handleAppStateChange = (nextAppState) => {
        if (this.pageFocus === false) {
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
    clearRequest() {
        //取消注册
        stockupDate && stockupDate.off('value', (response) => { });
        this.blockSortRequest && this.blockSortRequest.cancel();
        connection.resetInit();
    }

    /**
     * 取大列表排序数据
     * */
    getListDatas() {

        this.blockSortRequest && this.blockSortRequest.cancel();

        let params = {
            blockid: "yd_1_sec_8",
            start: 0,
            desc: true,
            count: 5000,
            subscribe: true
        };
        //只能有一种排序  this.state.titles[index].conCode = 1;
        let selectSortIndex = 0;
        for (let i = 0; i < this.state.titles.length; i++) {
            if (this.state.titles[i].conCode > 0) {//只要不是0,-1,则必然是这个排序条件
                selectSortIndex = i;
                //增加一个排序正序倒序的参数
                if (this.state.titles[i].conCode === 1) {
                    //params.desc = true;
                    this.listDesc = true;//降序
                } else if (this.state.titles[i].conCode === 2) {
                    // params.desc = false;
                    this.listDesc = false;//升序
                }
                break;
            }
        }
        //这里的数量需要和总的排序个数对应
        // { conName: "涨跌幅", conCode: 0 },
        // { conName: "现价", conCode: 1 },
        // { conName: "换手率", conCode: 0 },
        // { conName: "市盈率", conCode: 0 },
        // { conName: "市净率", conCode: 0 },

        switch (selectSortIndex) {
            case 0:
                params.titleid = 199;
                break;
            case 1:
                params.titleid = 33;
                break;
            case 2:
                params.titleid = 256;
                break;
            case 3:
                params.titleid = 258;
                break;
            case 4:
                params.titleid = 259;
                break;
        }

        this.blockSortRequest = connection.request('FetchBlockSortNative', params, (evDatas) => {
            //console.log('ydChannelMessaget回调=========================================',evDatas);
            this.firstEnter += 1;
            // this.bigList = JSON.parse(evDatas.data).slice();
            this.bigList = evDatas.slice();
            //大列表需要一个有序数组，按照股票名称排序
            if (Platform.OS === 'android') {
                this.bigList.sort(function (a, b) {
                    let code1 = parseInt(a.label_.substring(2));
                    let code2 = parseInt(b.label_.substring(2));
                    return code1 - code2; // 倒序
                });
            } else {
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
    getStockPollDatas(callback) {
        let param = { "tszb": "" };

        if (this.state.setData && this.state.setData.length > 0) {
            let sspecial = "";
            for (let i = 0; i < this.state.setData.length; i++) {
                sspecial += this.state.setData[i].tabName + ","
            }
            sspecial = sspecial.substring(0, sspecial.length - 1);
            param.tszb = sspecial;
        }
        param.page = this.pageNumber;
        //排序字段
        // if (this.state.selected === false) {
        //     param.sort = "upDown";
        //     //一次请求500条
        //     // param.pageSize = 5000;
        //     param.pageSize = 8;
        //     param.top = "";//后台需要的字段
        // } else {
        //     param.sort = "daDanFounds";
        //     param.pageSize = 8;
        //     param.top = 1;
        // }
        param.page = 1;
        param.pageSize = 8;
        param.sort = 'daDanFounds';
        param.top = 1;

        param.sortOrder = 'desc';
        param.onlyApp = 1;

        //console.log("上传参数",param)
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, this.postPath, param,
            (response) => {
                //清空股池缓存,如果请求前清除数据，可能造成stockPool为空,然后行情大列表推送过来，排序刷新页面时，空视图闪动
                this.stockPool = [];
                //console.log("请求股池成功",response)
                this.firstEnter += 1;
                this.state.refreshDate = ShareSetting.getDate(Date.parse(new Date()), 'yyyy-MM-dd HH:mm');
                response = response.list;
                if (response && response.length > 0) {
                    for (let i = 0; i < response.length; i++) {
                        let newItem = {};
                        newItem.secName = response[i].secName;
                        newItem.marketCode = response[i].marketCode;
                        this.stockPool.push(newItem)
                    }
                    this.getMergeList();
                    if (callback) {
                        callback();
                    }
                } else {
                    this.getMergeList();
                    if (callback) {
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
                    stockListNumber: 0,
                }, () => {
                    if (callback) {
                        callback();
                    }
                });
            })
    }

    /**
     * 获取大列表和股池排序后的股票列表
     *  this.bigList = [];//大列表股票
     *  this.stockPool = [];//股池股票
     * */
    getMergeList() {
        if (this.bigList.length === 0 || this.stockPool.length === 0) {
            //表示数据是从有到无的，可能是增加筛选条件来着
            if (this.firstEnter >= 2) {
                this.state.data[0].items = [];
                this.setState({
                    data: this.state.data,
                    allLoaded: true,
                    refreshDate: this.state.refreshDate,
                    stockListNumber: this.state.data[0].items.length,
                })
            }
            return;
        }
        //都有数据以后,才表示第一次加载完成
        //this.firstEnter = false;
        //在小数组去查大数组的
        for (let i = 0; i < this.stockPool.length; i++) {
            let itemSecIndex = searchStockIndex(this.bigList, 0, this.bigList.length - 1, this.stockPool[i].marketCode);
            if (itemSecIndex !== -1) {
                //这里需要根据大列表的value字段进行小列表的排序，先记录
                if (Platform.OS === 'android') {
                    this.stockPool[i].sortContent = this.bigList[itemSecIndex]['value_']
                } else {
                    this.stockPool[i].sortContent = this.bigList[itemSecIndex]['value']
                }
            }
        }
        //大列表需要一个有序数组，按照股票名称排序,暂时这么写，后面改改
        if (this.listDesc === true) {
            this.stockPool.sort(function (a, b) {
                return b.sortContent - a.sortContent; // 降序
            });
        } else {
            this.stockPool.sort(function (a, b) {
                return a.sortContent - b.sortContent; // 升序
            });
        }
        //这里新的排序来的时候，赋值的时候,不要全部赋值为 '--' 这样全屏会闪白，所以多一步操作，从列表中的数据,
        //直接双重for循环屏幕上的股票
        //要是位置没变的股票，就先取缓存，要是位置改变的，就复制成'--'
        let newArray = [];
        for (let i = 0; i < this.stockPool.length; i++) {
            let newItem = {};
            //储存第一列需要的数据
            let titles = {};
            //获取title数据
            titles.secName = this.stockPool[i].secName;
            titles.secCode = this.stockPool[i].marketCode;
            newItem.title = titles;


            //数据项，一定要按照数据添加
            let dataItem = [];
            for (let j = this.startIndex; j < (this.startIndex + this.addNumbers); j++) {
                //每次都从当前屏幕上startIndex开始取，如果数组越界this.state.data[0].items[i]为空，跳出循环
                if (this.state.data[0].items[j] && this.state.data[0].items[j].title.secCode && this.state.data[0].items[j].title.secCode != '--'
                    && this.state.data[0].items[j].title.secCode == this.stockPool[i].marketCode) {
                    dataItem = this.state.data[0].items[j].data;
                }
            }
            if (dataItem && dataItem.length === 0) {
                dataItem.push('--');
                dataItem.push('--');
                dataItem.push('--');
                dataItem.push('--');
                dataItem.push('--');
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
            for (let i = this.startIndex; i < (this.startIndex + this.addNumbers); i++) {
                //每次都从当前屏幕上startIndex开始取，如果数组越界this.state.data[0].items[i]为空，跳出循环
                if (this.state.data[0].items[i] && this.state.data[0].items[i].title.secCode && this.state.data[0].items[i].title.secCode != '--') {
                    stockList.push(this.state.data[0].items[i].title.secCode)
                }
            }
            QuotationListener.getStockListInfo(stockList, (stockObj) => {
                // console.log("每次获取到的数据获取到第一次的基础数据",stockObj)
                //设置数据刷新
                if (stockObj.length > 0) {
                    for (let i = this.startIndex; i < (this.startIndex + this.addNumbers); i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            //这一层判断用来过滤数组越界为空的情况
                            if (this.state.data[0].items[i]) {
                                if (this.state.data[0].items[i].title.secCode == stockObj[j].c) {
                                    this.state.data[0].items[i].data[0] = Number(stockObj[j].y) / 100;
                                    this.state.data[0].items[i].data[1] = Number(stockObj[j].k);
                                    this.state.data[0].items[i].data[2] = Number(stockObj[j].ak);
                                    this.state.data[0].items[i].data[3] = Number(stockObj[j].al);
                                    this.state.data[0].items[i].data[4] = Number(stockObj[j].am);
                                }
                            }
                        }
                    }
                    this.setState({
                        data: this.state.data,
                        allLoaded: true,
                        refreshDate: this.state.refreshDate,
                        stockListNumber: this.state.data[0].items.length,
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

    _loadData() {
        // console.log('热点风口  策略原理： = ',this.state)
        //1研报策略,2高成长,3低估值,4高分红,5高盈利,6高送转,7股东增持,8业绩预增,9白马绩优,10资金揭秘,17热点策略，18主题策略
        //这是获取介绍的节点对应情况
        let pg = this;
        this.refPathCeLue.get((snapshot) => {
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

    render() {
        return (
            <View style={{ flex: 1 }}>

                <View style={{
                    width: ScreenUtil.screenW,
                    height: ScreenUtil.statusH + (Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90)),
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>

                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={['#857A9B', '#524383']}
                        style={styles.conNoDivider}>
                        <View style={{ flexDirection: "row", width: ScreenUtil.screenW, height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90) }}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => this._clickBack()} style={styles.backView}>
                                <Image source={require('../../images/login/login_back.png')} style={styles.backIcon} />
                            </TouchableOpacity>
                            <View style={styles.navTitleBack}>
                                <Text style={styles.navTitle} numberOfLines={1}>{"热点策略"}</Text>
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
                                    numberOfLines={1}>{"热点策略"}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <StickyForm
                    bounces={true}
                    style={{ backgroundColor: "#f6f6f6" }}
                    contentStyle={{ alignItems: "flex-start", width: 600 + 15 }}
                    data={this.state.data}
                    ref={ref => (this._list = ref)}
                    heightForSection={() => SECTION_HEIGHT}
                    renderHeader={this._renderHeader}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => this.ITEM_HEGHT}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    // bounces={false}
                    headerStickyEnabled={false}
                    renderFooter={this._renderMyFooters}
                    renderEmpty={this.renderEmptys}
                    onRefresh={() => {
                        this._loadData();
                        this.getStockPollDatas(() => {
                            this._list && this._list.endRefresh();
                        });
                    }}
                    allLoaded={this.state.allLoaded}
                    loadingFooter={mRiskTipsFooter}
                    refreshHeader={mNormalHeader}
                    onLoading={() => { }}
                    hearderHeight={this.hearderHeight}

                    onMomentumScrollEnd={() => {
                        //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                        this.isAddNowListener();
                    }}
                    onMomentumScrollBegin={() => {
                        //ios专用
                        this.scrollBegin = true;

                    }}
                    onTouchBegin={() => {


                    }}
                    onTouchEnd={() => {
                        this.touchTemp = new Date().getTime();
                        if (Platform.OS !== 'ios') {
                            return;
                        }
                        //ios专用
                        setTimeout(() => {
                            if (!this.scrollBegin) {
                                //是否需要弹出活动图标,要是2秒内并未滑动屏幕再弹出弹窗
                                this.isAddNowListener();
                            } else {
                                this.scrollBegin = false;
                            }
                        }, 500);
                    }}
                    /*
                             * lock (left 锁定左边距，使左边距没有 bounces 效果)
                             * x X坐标，y Y坐标，w 宽，h 高 (取消矩形外手势操作))
                             * 目前只实现了 lock:left,hot:y 效果
                             */
                    hotBlock={{ lock: "left", hotBlock: { x: 0, y: this.hearderHeight, width: 0, height: 0 } }}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                        //console.log("回调",x)
                        this.mScollY = y;

                        if (x <= 0) {
                            this.leftArrow && this.leftArrow.setNativeProps({
                                style: { opacity: 1 }
                            });
                        } else {
                            this.leftArrow && this.leftArrow.setNativeProps({
                                style: { opacity: 0 }
                            });
                        }

                        if (this.isStartAddListener === 0) {
                            this.isStartAddListener = 1;
                        }

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

                />
            </View>
        );
    }
    _clickBack() {
        if (this.props.navigation) this.props.navigation.goBack();
    }


    /**
     * 去监听当前股票的方法
     * 如果在1.5秒内，没有再次点击屏幕，再开始注册监听，要是有，就重置记录时间
     * */
    isAddNowListener() {
        if (this.isStartAddListener === 1) {
            this.isStartAddListener = 2;
            setTimeout(() => {
                if (new Date().getTime() - this.touchTemp >= 1500) {
                    if (this.pageFocus === false) {
                        return
                    }
                    if (this.mScollY <= (Platform.OS === 'ios' ? this.hearderHeight : (this.hearderHeight) / PixelRatio.get())) {
                        this.startIndex = 0;
                        this.getFirstStock(() => { });
                    } else {
                        this.startIndex = Math.floor((this.mScollY - (Platform.OS === 'ios' ? this.hearderHeight : (this.hearderHeight) / PixelRatio.get())) / this.ITEM_HEGHT);
                        this.getFirstStock(() => { });
                    }
                    this.isStartAddListener = 0;
                    return;
                } else {
                    this.isStartAddListener = 1;
                    this.isAddNowListener();
                    return;
                }
            }, 1500);
        }
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
                <View style={{ paddingHorizontal: ScreenUtil.scaleSizeW(30), paddingTop: ScreenUtil.scaleSizeW(30), paddingBottom: ScreenUtil.scaleSizeW(20) }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: "center", marginBottom: ScreenUtil.scaleSizeW(10), marginTop: ScreenUtil.scaleSizeW(8) }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: '#fff' }}>{'策略原理'}</Text>

                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={styles.hotSetButton}
                            onPress={() => this._historyPress()}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: baseStyle.ORANGE_FF9933 }}>{'历史表现'}</Text>
                        </TouchableOpacity>

                    </View>

                    <ExpandableText style={{
                        width: ScreenUtil.screenW - 30, color: 'white', paddingBottom: ScreenUtil.scaleSizeW(25), paddingTop: ScreenUtil.scaleSizeW(0),
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
                    marginHorizontal: ScreenUtil.scaleSizeW(10),
                    borderRadius: ScreenUtil.scaleSizeW(10),
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: "center",
                        // padding:10,
                        // paddingTop:15,
                        paddingHorizontal: ScreenUtil.scaleSizeW(20),
                        height: ScreenUtil.scaleSizeW(77),
                        borderBottomWidth: 0.5,
                        borderBottomColor: baseStyle.BLACK_20
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ flex: 1, fontSize: ScreenUtil.setSpText(30), color: "#fff", marginLeft: ScreenUtil.scaleSizeW(10) }}>{'成长学堂'}</Text>
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center' }} onPress={() => {

                            Navigation.navigateForParams(this.props.navigation, 'StrategyCoursePage', {});
                        }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: 'rgba(255,255,255,0.4)' }}>{'更多 '}</Text>
                            <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(26) }} source={require('../../images/hits/hq_kSet_back.png')} />
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.growSchool.map((info, index) => (
                            <TouchableOpacity onPress={() => {
                                let path = MainPathYG + 'ChengZhangXueTang/热点策略/' + info.createTime;
                                let optionParams = { path: path, star: info.star, taoxiName: info.setsystem };
                                Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                                    key: info.createTime,
                                    type: 'Strategy',
                                    ...optionParams
                                });

                            }} key={index} style={{ height: ScreenUtil.scaleSizeW(86) }}>
                                <View style={{
                                    flex: 1,
                                    marginRight: ScreenUtil.scaleSizeW(20),
                                    marginLeft: ScreenUtil.scaleSizeW(37),
                                    borderTopWidth: index > 0 ? 0.5 : 0,
                                    borderTopColor: baseStyle.BLACK_20,
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
    //热点设置
    _hotSetView() {
        return (
            <View >
                {/*{this._lineView()}*/}
                <View style={{
                    backgroundColor: baseStyle.BLACK_20,
                    marginHorizontal: ScreenUtil.scaleSizeW(10),
                    borderRadius: ScreenUtil.scaleSizeW(10),
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: ScreenUtil.scaleSizeW(20),
                        height: ScreenUtil.scaleSizeW(88),
                        borderBottomWidth: this.state.setData.length > 0 ? 0.5 : 0,
                        borderBottomColor: baseStyle.BLACK_20
                    }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "#fff" }} />
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: '#fff', marginLeft: ScreenUtil.scaleSizeW(10) }}>{'叠加条件'}</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={[styles.hotSetButton, { paddingRight: ScreenUtil.scaleSizeW(8), height: ScreenUtil.scaleSizeW(48) }]}
                            onPress={() => this._hotSetPress()}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(38), height: ScreenUtil.scaleSizeW(30), resizeMode: "contain" }} source={require('../../images/hits/fold_img.png')} />
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.ORANGE_FF9933, marginLeft: ScreenUtil.scaleSizeW(20) }}>{'叠加条件'}</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.setData.length > 0 &&
                        <View style={styles.fLlayoutHaveContent}>
                            {this.getScreenTag()}
                        </View>
                    }
                </View>
            </View>
        )
    }
    /**
     * 返回筛选条件的View
     * */
    getScreenTag() {
        let screenView = [];
        if (this.state.setData && this.state.setData.length > 0) {
            for (let i = 0; i < this.state.setData.length; i++) {
                //右上角标签样式
                let tagbg;
                let tagText;
                switch (this.state.setData[i].tabName) {
                    case "放量上攻":
                        tagbg = "#FF3333";
                        tagText = "上涨状态";
                        break;
                    case "趋势共振":
                        tagbg = "#FF3333";
                        tagText = "上涨状态";
                        break;
                    case "震荡突破":
                        tagbg = "#9933FF";
                        tagText = "震荡状态";
                        break;
                    case "探底回升":
                        tagbg = "#9933FF";
                        tagText = "震荡状态";
                        break;
                    case "趋势反转":
                        tagbg = "#3399FF";
                        tagText = "下跌状态";
                        break;
                    case "背离反弹":
                        tagbg = "#3399FF";
                        tagText = "下跌状态";
                        break;
                    default:
                        tagbg = "#ffffff";
                        tagText = "";
                        break
                }
                screenView.push(
                    <View style={styles.selectView}>
                        <Text style={styles.selectText}>{this.state.setData[i].tabName}</Text>
                        <View style={[styles.newTag, { backgroundColor: tagbg }]}>
                            <Text style={{ color: "#fff", fontSize: ScreenUtil.setSpText(20) }}>{tagText}</Text>
                        </View>
                    </View>
                )
            }
        }


        return screenView.length > 0 ? screenView : null;
    }
    //选股个数
    _stockNumberView() {
        return (
            <View>
                {this._lineView()}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    height: 44,
                    alignItems: 'center',
                    paddingHorizontal: ScreenUtil.scaleSizeW(30),
                    backgroundColor: '#fff',
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                }}>
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_100 }}>{'入选股票（' + this.state.stockListNumber + '只）'}</Text>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: 'rgba(0,0,0,0.4)' }}>{this.state.refreshDate + '更新'}</Text>
                    </View>

                </View>

            </View>
        )
    }

    // <View>
    //                     <Text style={{ fontSize: ScreenUtil.setSpText(24), color: baseStyle.BLACK_100 }}>{'入选股票（' + this.state.stockListNumber + '只）'}</Text>
    //                     <Text style={{ fontSize: ScreenUtil.setSpText(24), color: 'rgba(0,0,0,0.4)' }}>{this.state.refreshDate + '更新'}</Text>
    //                     </View>
    //                     <View style={{flex:1}}/>
    //
    //                     <TopButton selected={this.state.selected} onPress = {(selected) => {this.getTopTenDatas(selected)}}/>
    getTopTenDatas(selected) {

        this.pageNumber = 1;
        this.setState({
            selected: selected,
        }, () => {
            this.getStockPollDatas();
        })
    }

    //历史战绩press
    _historyPress() {
        Navigation.navigateForParams(this.props.navigation, 'HistoryRecordPage', { type: this.historyTypeS });
    }
    //热点设置press
    _hotSetPress() {
        Navigation.navigateForParams(this.props.navigation, 'ScreenConditions', {
            title: '热点策略叠加条件', setData: this.state.setData, selectCall: (specialArray) => {
                this.pageNumber = 1;
                this.setState({
                    setData: specialArray
                }, () => {
                    this.getStockPollDatas();
                });
            }
        });
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
                        }} />
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{ height: this.HEADER_HEGHT + 400, flexDirection: "row" }}>
                    <View>
                        <View style={{ width: ScreenUtil.screenW, height: 400, backgroundColor: "#f6f6f6", alignItems: "center", justifyContent: "center" }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                                source={require('../../images/TuyereDecision/no_stock_data.png')} />
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",
                                marginTop: ScreenUtil.scaleSizeW(100)
                            }}>暂无股票入选</Text>
                        </View>
                        {/*这个View是一个遮盖的View,只是用来挡住上拉加载那个文字的，因为现在这个StickyForm的renderFooter方法是不能正确回调的*/}
                        <View style={{
                            height: 60, position: "absolute", flexDirection: "row", backgroundColor: "#f6f6f6",
                            top: 450, left: 0, width: ScreenUtil.screenW
                        }} />
                    </View>
                </View>
            );
        }
    };
    _renderHeader = () => {
        return (
            <View style={{ alignSelf: "stretch" }}>
                <View style={{ width: commonUtil.width, flexDirection: "column", backgroundColor: "white" }}
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
                    //style={{ }}
                    >
                        {this._strategyView()}
                        {this._growSchoolView()}
                        {this._hotSetView()}
                        {this._stockNumberView()}
                    </LinearGradient>
                </View>
            </View>
        );
    };

    _renderSection = (section: number) => {
        let rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180) - 4);
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row", backgroundColor: "#f2faff" }}>
                <View style={[styles.fixTitleOne, {}]} >
                    <Image source={require('../../images/hits/section_bg.png')} style={{ flex: 1, width: ScreenUtil.scaleSizeW(180), height: this.HEADER_HEGHT, position: "absolute", top: 0, left: 0, resizeMode: "stretch" }} />
                    <Text style={styles.hinnerText}>股票名称</Text>

                    <Image
                        ref={ref => this.leftArrow = ref}
                        source={require('../../images/hits/left_arrow.png')}
                        style={{ width: 5, height: 10, position: "absolute", top: 14, right: -rights }} />
                </View>

                {this.state.titles.map((title, index) =>
                    <TouchableOpacity activeOpacity={1} onPress={() => { this.sortViewPress(index, title.conCode) }} style={styles.headerText} key={index}>
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
        //console.log("点击=="+index+"conCode="+conCode)
        if (this.state.titles[index].conCode !== -1) {
            let isNewSort = true;//判断是否是点击新的排序,点击当前的排序，不需要重新请求grpc
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
            for (let i = 0; i < this.state.titles.length; i++) {
                if (i !== index && this.state.titles[i].conCode !== -1) {
                    this.state.titles[i].conCode = 0;
                }
            }
            this.setState({
                titles: this.state.titles,
            }, () => {
                if (isNewSort === true) {
                    this.getListDatas();
                } else {
                    this.listDesc = (this.state.titles[index].conCode === 1 ? true : false);
                    this.getMergeList();
                }

            });
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
                sortView = <Image style={styles.sortView} source={require('../../images/hits/defaultt.png')} />;
                break;
            case 1:
                sortView = <Image style={styles.sortView} source={require('../../images/hits/positive.png')} />;
                break;
            case 2:
                sortView = <Image style={styles.sortView} source={require('../../images/hits/negative.png')} />;
                break;
            default:
                sortView = null;
                break;
        }
        return sortView;
    }
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        //console.log("items",item)
        if (item === undefined) {
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
                    <Image source={require('../../images/hits/item_head_bg.png')} style={{ flex: 1, width: ScreenUtil.scaleSizeW(180), height: this.ITEM_HEGHT - 1, position: "absolute", top: 0, left: 0, resizeMode: "stretch" }} />
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
            case 1:
                let monColor2;
                if (title > 0) {
                    monColor2 = "#fa5033"
                } else if (title === 0) {
                    monColor2 = "rgba(0,0,0,0.4)"
                } else {
                    monColor2 = "#5cac33"
                }
                Views = <View style={styles.text} key={index}>
                    <StockFormatText precision={2} useDefault={true} style={[styles.contentText, { color: monColor2 }]}>{title}</StockFormatText>
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
    _renderMyFooters = () => {
        // if(this.state.data && this.state.data[0].items.length === 0 ){
        //     return <View><View></View></View>;
        // }else {
        //
        // }
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

const styles = StyleSheet.create({
    hotSetButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: baseStyle.ORANGE_FF9933,
        borderWidth: 1,
        borderRadius: ScreenUtil.scaleSizeW(8),
        height: ScreenUtil.scaleSizeW(40),
        paddingLeft: ScreenUtil.scaleSizeW(18),
        paddingRight: ScreenUtil.scaleSizeW(18),
        flexDirection: 'row',
    },
    fLlayoutHaveContent: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        borderBottomLeftRadius: ScreenUtil.scaleSizeW(10),
        borderBottomRightRadius: ScreenUtil.scaleSizeW(10),
        paddingHorizontal: ScreenUtil.scaleSizeW(10),
        paddingVertical: ScreenUtil.scaleSizeW(10),
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
    },
    newTag: {
        height: ScreenUtil.scaleSizeW(24),
        paddingHorizontal: ScreenUtil.scaleSizeW(2),
        position: 'absolute',
        right: ScreenUtil.scaleSizeW(10),
        borderRadius: ScreenUtil.scaleSizeW(5),
        top: -ScreenUtil.scaleSizeW(16),
        justifyContent: "center",
        alignItems: "center"
    },
    selectView: {
        height: ScreenUtil.scaleSizeW(60),
        paddingHorizontal: ScreenUtil.scaleSizeW(22),
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
    fixTitleOne: {
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        width: ScreenUtil.scaleSizeW(180),
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
    row: {
        flex: 1,
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor: "#fff"
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
        paddingLeft: ScreenUtil.scaleSizeW(20),
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
});