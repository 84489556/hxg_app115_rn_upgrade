/*
 * @Author: lishuai
 * @Date: 2019-08-07 11:49:10
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-08-28 14:07:36
 * 主力决策列表
 */
import React, { Component } from 'react';
import { AppState, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { StickyForm } from 'react-native-largelist-v3';
import LinearGradient from 'react-native-linear-gradient';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import GrowthClassroomComponent from '../../components/Decisions/DecisionGrowthClassroomComponent';
import InterpretationVideoComponent from '../../components/Decisions/DecisionInterpretationVideoComponent';
import OpinionLivingComponent from '../../components/Decisions/DecisionOpinionLivingComponent';
import NavigationTitleView from '../../components/NavigationTitleView';
import RiskTipsFooterView from '../../components/RiskTipsFooterView';
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from '../../pages/BaseComponentPage';
import { VIEW_POINT_FILTER_CONDITION_4 } from '../../pages/Listen/ContentListView';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import QuotationListener from "../../utils/QuotationListener";
import YdCloud from '../../wilddog/Yd_cloud';
import { getSectorType } from "../Quote/DownLoadStockCode";
import { connection } from "../Quote/YDYunConnection";
import FundsFlowStatisticGraph from './FundsFlowStatisticGraph';
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../components/SensorsDataTool";
import { FundsFlowStatisticItemComponent } from './FundsFlowStatisticPage';
import NetInfo from "@react-native-community/netinfo";
//只是Android 使用
import FastImage from 'react-native-fast-image'

const IMAGE_DIR = '../../images/MainDecesion/';
const ITEM_HEIGHT = 50;

export default class MainDecisionPage extends BaseComponentPage {
    _renderFuncEntryPanel() {
        return (
            <MainDecisionFuncEntryPanel itemOnClick={item => {
                if (item.targetPageName === 'LongHuBangPage') {
                    Navigation.pushForParams(this.props.navigation, 'LongHuBangPage', { selectedIndex: 0 });
                } else if (item.targetPageName === 'HitsTopNavigator') {
                    Navigation.pushForParams(this.props.navigation, item.targetPageName, { gotoPage: 0 });
                } else if (item.targetPageName === 'OpinionLivingPage') {
                    Navigation.pushForParams(this.props.navigation, item.targetPageName, { filterCondition: VIEW_POINT_FILTER_CONDITION_4 });
                } else {
                    Navigation.pushForParams(this.props.navigation, item.targetPageName);
                }
            }} />
        )
    }
    // 观点直播
    _renderOpinionLivingPanel() {
        return (
            <OpinionLivingComponent navigation={this.props.navigation} entrance={'主力决策'} />
        )
    }
    // 精品讲堂(直播课堂)
    _renderInterpretationVideoPanel() {
        return (
            <InterpretationVideoComponent navigation={this.props.navigation} permission={5} entrance='主力决策' />
        )
    }
    // 龙虎榜
    _renderLongHuBangPanel() {
        return (
            <MainDecisionLongHuBangPanel navigation={this.props.navigation} />
        )
    }
    // 高管交易榜
    _renderGaoGuanJiaoYiBangPanel() {
        return (
            <MainDecisionGaoGuanJiaoYiBangPanel navigation={this.props.navigation} />
        )
    }
    // 资金流向
    _renderFundFlowStatisticPanel() {
        return (
            <MainDecisionFundFlowStatisticPanel navigation={this.props.navigation} />
        )
    }
    // 资金揭秘
    _renderFundSecretPanel() {
        return (
            <MainDecisionFundSecretPanel navigation={this.props.navigation} />
        )
    }
    // 成长学堂
    _renderGrowthClassroomPanel() {
        return (
            <GrowthClassroomComponent navigation={this.props.navigation} permission={5} entrance='主力决策' />
        )
    }
    _renderRiskWarningPanel() {
        return (
            <RiskTipsFooterView type={0} />
        )
    }
    _lineUI(style) {
        return (
            <View style={[{ height: 8, width: baseStyle.width, backgroundColor: baseStyle.LINE_BG_F1 }, style]}></View>
        );
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zhulicelue);
        });
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'主力决策'} />
                <ScrollView style={{ backgroundColor: baseStyle.LINE_BG_F1 }}>
                    {this._renderFuncEntryPanel()}
                    {this._renderInterpretationVideoPanel()}
                    {this._lineUI()}
                    {this._renderOpinionLivingPanel()}
                    {this._lineUI()}
                    {this._renderLongHuBangPanel()}
                    {this._lineUI()}
                    {this._renderGaoGuanJiaoYiBangPanel()}
                    {this._lineUI()}
                    {this._renderFundFlowStatisticPanel()}
                    {this._lineUI()}
                    {this._renderFundSecretPanel()}
                    {this._lineUI()}
                    {this._renderGrowthClassroomPanel()}
                    {this._renderRiskWarningPanel()}
                </ScrollView>
            </BaseComponentPage>
        );
    }
}

/// 主力决策快捷功能入口组件
const PANEL_COLUMN = 3;
const PANEL_ITEM_WIDTH = baseStyle.width / PANEL_COLUMN;

export class MainDecisionFuncEntryPanel extends Component {
    constructor(props) {
        super(props);
        this.data = [
            { title: '观点直播', iconSrc: require(`${IMAGE_DIR}main_decision_opinion_living_icon.png`), targetPageName: 'OpinionLivingPage' },
            { title: '龙虎榜', iconSrc: require(`${IMAGE_DIR}main_decision_long_hu_bang_icon.png`), targetPageName: 'LongHuBangPage' },
            { title: '高管交易榜', iconSrc: require(`${IMAGE_DIR}main_decision_gao_guan_jiao_yi_bang_icon.png`), targetPageName: 'HitsTopNavigator' },
            { title: '资金流向统计', iconSrc: require(`${IMAGE_DIR}main_decision_zi_jin_liu_xiang_tong_ji_icon.png`), targetPageName: 'FundsFlowStatisticPage' },
            { title: '资金揭秘', iconSrc: require(`${IMAGE_DIR}main_decision_zi_jin_jie_mi_icon.png`), targetPageName: 'MoneyRevelationPage' },
            { title: '成长学堂', iconSrc: require(`${IMAGE_DIR}main_decision_growth_classroom_icon.png`), targetPageName: 'GrowthCoursePage' },
        ];
    }

    _onItemPress(item) {
        sensorsDataClickObject.adModule.entrance = '主力决策';
        sensorsDataClickObject.adModule.module_name = item.title;
        sensorsDataClickObject.adModule.module_type = '观点';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule, '', false)
        this.props.itemOnClick && this.props.itemOnClick(item);
    }

    _renderAllItem() {
        var views = [];
        for (let i = 0; i < this.data.length; i++) {
            let element = this.data[i];
            let marginTop = parseInt(i / PANEL_COLUMN) == 1 ? 20 : 0;
            let showSepratorLine = (i % PANEL_COLUMN) < PANEL_COLUMN - 1;
            views.push(
                <TouchableHighlight key={i} underlayColor={'transparent'} onPress={() => {
                    this._onItemPress(element);
                }}>
                    <View style={[styles.panelItemStyle, {
                        marginTop: marginTop, borderRightColor: '#0000001A', borderRightWidth: showSepratorLine ? 1 : 0
                    }]}>

                        {Platform.OS === 'ios' ?
                            <Image style={styles.panelItemImageStyle} source={element.iconSrc}></Image>
                            :
                            <FastImage
                                style={styles.panelItemImageStyle}
                                source={element.iconSrc}
                            />
                        }
                        <Text style={styles.panelItemTextStyle}>{element.title}</Text>
                    </View>
                </TouchableHighlight>
            )
        }
        return views;
    }
    render() {
        return (
            <View style={styles.panelContainerStyle}>
                {this._renderAllItem()}
            </View>
        );
    }
}

/// 主力决策龙虎榜组件
export class MainDecisionLongHuBangPanel extends Component {
    constructor(props) {
        super(props);
        this._titles = ['股票名称', '涨跌幅', '最新价', '上榜天数', '上榜天数(上涨)', '上榜天数(下跌)', '上涨三日成功率'];
        this.stocks = [];
        this.desc = true; // 是否为降序
        this.state = {
            _data: [{
                items: [
                    { secCode: '', secName: '', latestChgRatio: 0, latestClosePrice: 0, lianban2: 0, lianban3: 0, onlistTimes: 0 },
                    { secCode: '', secName: '', latestChgRatio: 0, latestClosePrice: 0, lianban2: 0, lianban3: 0, onlistTimes: 0 },
                    { secCode: '', secName: '', latestChgRatio: 0, latestClosePrice: 0, lianban2: 0, lianban3: 0, onlistTimes: 0 },
                    { secCode: '', secName: '', latestChgRatio: 0, latestClosePrice: 0, lianban2: 0, lianban3: 0, onlistTimes: 0 },
                    { secCode: '', secName: '', latestChgRatio: 0, latestClosePrice: 0, lianban2: 0, lianban3: 0, onlistTimes: 0 },
                ]
            }]
        }
    }
    componentDidMount() {
        this._addNavigationChangeListener();
    }
    componentWillUnmount() {
        // this._offQuote();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    _loadData() {
        let params = { 'pageNum': 1, 'pageSize': 5, 'sortField': 'onlistDays', 'desc': this.desc };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/longhumima', params, (x) => {
            if (!x) return;
            let data = x.list;
            let oldData = this.state._data[0].items;
            oldData = data;
            this.setState({ _data: [{ items: oldData }] }, () => {
                this.stocks = oldData.map(value => {
                    return value.market + value.secCode;
                });
                this.getStockListInfo(() => {
                    QuotationListener.addListeners(this.stocks, (stockObj) => {
                        this.setQuotation(stockObj);
                    });
                });
            });
        }, (error) => {
            // toast(error);
        });
    }
    getStockListInfo(callBack) {
        if (this.stocks.length > 0) {
            QuotationListener.getStockListInfo(this.stocks, (stockObj) => {
                if (stockObj.length > 0) {
                    for (let i = 0; i < this.state._data[0].items.length; i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            if (this.state._data[0].items[i].market + this.state._data[0].items[i].secCode == stockObj[j].c) {
                                this.state._data[0].items[i].latestClosePrice = Number(stockObj[j].k);
                                this.state._data[0].items[i].latestChgRatio = Number(stockObj[j].y);
                            }
                        }
                    }
                    this.setState({ _data: this.state._data }, () => {
                        if (callBack) { callBack() }
                    });
                } else {
                    if (callBack) { callBack() }
                }
            });
        } else {
            if (callBack) { callBack() }
        }
    }
    //监听导航变化
    _addNavigationChangeListener() {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            this._loadData();
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this._offQuote();
        });
    }
    // 取消监听行情变化
    _offQuote() {
        if (this.stocks.length > 0) {
            QuotationListener.offListeners(this.stocks, () => { });
            this.stocks = [];
        }
    }
    setQuotation(stockObj) {
        if (this.state._data[0].items.length > 0) {
            for (let i = 0; i < this.state._data[0].items.length; i++) {
                if (this.state._data[0].items[i].market + this.state._data[0].items[i].secCode == stockObj.c) {
                    this.state._data[0].items[i].latestClosePrice = Number(stockObj.k);
                    this.state._data[0].items[i].latestChgRatio = Number(stockObj.y);
                }
            }
            this.setState({ _data: this.state._data });
        }
    }
    _sortBtnOnClick() {
        this.desc = !this.desc;
        this.setState({ data: [{ items: [] }] });
        this._loadData();
    }
    _itemOnClick(item) {
        if (!item) return;
        let date = item.transDate && item.transDate.length >= 10 && item.transDate.substring(0, 10);
        if (!item.secCode || !date) return;
        Navigation.pushForParams(this.props.navigation, 'OnListDetailPage', { secCode: item.secCode, transDate: date });
    }
    _renderSection = () => {
        let imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        return (
            <View style={{ height: 30, flexDirection: 'row' }}>
                {this._titles.map((title, index) => {
                    if (title == '上榜天数') {
                        return (
                            <TouchableOpacity key={index} style={{ width: 100, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2FAFF' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                                <Text style={{ fontSize: 12, color: '#00000099', marginLeft: 15 }}>{title}</Text>
                                <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc}></Image>
                            </TouchableOpacity>
                        );
                    } else {
                        return (
                            <View style={{ width: title == '上涨三日成功率' ? 120 : 100, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#F2FAFF' }} key={index}>
                                <Text style={{ fontSize: 12, color: '#00000099', marginLeft: 15 }}>{title}</Text>
                            </View>
                        );
                    }
                })}
            </View>
        );
    }
    _renderItem = (path) => {
        let oldData = this.state._data[0].items;
        let item = oldData[path.row];
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (item.latestChgRatio > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (item.latestChgRatio < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        return (
            <TouchableOpacity
                key={path.row}
                style={{ flex: 1, flexDirection: 'row', borderBottomColor: '#F1F1F1', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}
                activeOpacity={1}
                onPress={() => this._itemOnClick(item)}>
                <View style={{ width: 100, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 15, marginLeft: 15 }}>{item.secName}</Text>
                    <Text style={{ fontSize: 12, marginLeft: 15, color: '#666666', marginTop: Platform.OS == 'ios' ? 3 : 0 }}>{item.secCode}</Text>
                </View>
                <View style={{ width: 100, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <StockFormatText style={{ fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: clr }} sign={true} unit='%'>{item.latestChgRatio / 100}</StockFormatText>
                </View>
                <View style={{ width: 100, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <StockFormatText style={{ fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: clr }}>{item.latestClosePrice}</StockFormatText>
                </View>
                <View style={{ width: 100, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: '#000000CC' }}>{item.onlistDays}</Text>
                </View>
                <View style={{ width: 100, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: '#000000CC' }}>{item.risingOnlistDays}</Text>
                </View>
                <View style={{ width: 100, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: '#000000CC' }}>{item.fallingOnlistDays}</Text>
                </View>
                <View style={{ width: 120, justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <StockFormatText style={{ fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: '#000000CC' }} unit='%'>{item.win3 / 100}</StockFormatText>
                </View>
            </TouchableOpacity>
        );
    };
    _renderList() {
        return (
            <StickyForm
                bounces={false}
                style={{ backgroundColor: 'white', height: 5 * ITEM_HEIGHT + 30 }}
                contentStyle={{ alignItems: 'flex-start', width: (this._titles.length - 1) * 100 + 120 }}
                hotBlock={{ lock: "left" }}
                data={this.state._data}
                scrollEnabled={true}
                heightForSection={() => 30}
                renderSection={this._renderSection}
                heightForIndexPath={() => ITEM_HEIGHT}
                renderIndexPath={this._renderItem}
                showsHorizontalScrollIndicator={false}
                headerStickyEnabled={false}
            />
        )
    }
    _moreBtnOnClick(type) {
        Navigation.pushForParams(this.props.navigation, 'LongHuBangPage', { selectedIndex: type });
    }
    render() {
        //console.log('render-MainDecisionLongHuBangPanel');
        let btnWidth = (baseStyle.width - 2 * 15 - 10) / 3;
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require(`${IMAGE_DIR}main_decision_long_hu_bang_small_icon.png`)} />
                        <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '900' }}>龙虎榜</Text>
                    </View>
                    <TouchableOpacity onPress={() => this._moreBtnOnClick(1)}>
                        <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
                <LinearGradient
                    style={{ flex: 1, height: 40, borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: Platform.OS === 'ios' ? 'hidden' : "visible", justifyContent: 'center', alignItems: 'center' }}
                    colors={['#3399ff', '#63bfff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>龙虎密码</Text>
                </LinearGradient>
                {this._renderList()}
                <View style={{ flexDirection: 'row', height: 60, backgroundColor: '#fff', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, justifyContent: 'space-evenly' }}>
                    {
                        [{ title: '最新龙虎榜', bgImgSrc: require(`${IMAGE_DIR}main_decision_zui_xin_long_hu_bang_bg.png`) },
                        { title: '游资图谱', bgImgSrc: require(`${IMAGE_DIR}main_decision_you_zi_tu_pu_bg.png`) },
                        { title: '机构重仓', bgImgSrc: require(`${IMAGE_DIR}main_decision_ji_gou_zhong_cang_bg.png`) }].map((value, index) => {
                            let type = index;
                            if (index > 0) {
                                type = index + 1;
                            }
                            return (
                                <TouchableOpacity key={index} style={{ width: btnWidth, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._moreBtnOnClick(type)} >
                                    <ImageBackground
                                        style={{ flex: 1, width: btnWidth, justifyContent: 'center' }}
                                        source={value.bgImgSrc}
                                        resizeMode='stretch'
                                        capInsets={{ top: 10, left: 10, bottom: 10, right: 10 }}>
                                        <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>{value.title}</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            </View >
        );
    }
}

/// 主力决策高管交易榜组件
export class MainDecisionGaoGuanJiaoYiBangPanel extends Component {
    constructor(props) {
        super(props);
        this._titles = ['股票名称', '变动人', '变动类型', '成交价格', '变动数量', '成交金额', '董监高姓名', '职务', '与变动人关系', '交易日期'];
        this.stocks = [];
        this.desc = true; // 是否为降序
        this.state = {
            _data: [{
                items: [
                    { secCode: '--', secName: '--', changer: '--', chgType: '--', transPrice: 0, chgSharesNum: 0, tradeAmt: 0, manageName: '--', duty: '--', relation: '--', chgDate: '--' },
                    { secCode: '--', secName: '--', changer: '--', chgType: '--', transPrice: 0, chgSharesNum: 0, tradeAmt: 0, manageName: '--', duty: '--', relation: '--', chgDate: '--' },
                    { secCode: '--', secName: '--', changer: '--', chgType: '--', transPrice: 0, chgSharesNum: 0, tradeAmt: 0, manageName: '--', duty: '--', relation: '--', chgDate: '--' },
                    { secCode: '--', secName: '--', changer: '--', chgType: '--', transPrice: 0, chgSharesNum: 0, tradeAmt: 0, manageName: '--', duty: '--', relation: '--', chgDate: '--' },
                    { secCode: '--', secName: '--', changer: '--', chgType: '--', transPrice: 0, chgSharesNum: 0, tradeAmt: 0, manageName: '--', duty: '--', relation: '--', chgDate: '--' },
                ]
            }]
        }
    }
    componentDidMount() {
        this._loadData();
    }
    _loadData() {
        let params = { 'pageNum': 1, 'pageSize': 5, 'desc': this.desc };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/GaoGuanJiaoYi/zuixinjiaoyi', params, (x) => {
            if (!x) return;
            let data = x.list;
            let oldData = this.state._data[0].items;
            oldData = data;
            this.setState({ _data: [{ items: oldData }] });
        }, (error) => {
            // toast(error);
        });
    }
    _sortBtnOnClick() {
        this.desc = !this.desc;
        this.setState({ data: [{ items: [] }] });
        this._loadData();
    }
    deduplication(array) {
        var hash = {};
        array = array.reduce(function (item, next) {
            hash[next.Obj] ? '' : hash[next.Obj] = true && item.push(next);
            return item;
        }, []);
        return array;
    }
    _itemOnClick(item) {
        let newItem = { Obj: item.market + item.secCode, ZhongWenJianCheng: item.secName };
        let array = this.state._data[0].items.map((value) => {
            return { Obj: value.market + value.secCode, ZhongWenJianCheng: value.secName }
        });
        // 股票代码可能会重复，此处做一步去重处理
        let deduplicatedArray = this.deduplication(array);
        let idx = 0;
        for (let i = 0; i < deduplicatedArray.length; i++) {
            if (deduplicatedArray[i].Obj == newItem.Obj) {
                idx = i;
                break;
            }
        }
        let stocks = [];
        for (let i = 0; i < deduplicatedArray.length; i++) {
            stocks.push(Object.assign({}, deduplicatedArray[i]));
        }
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...newItem,
            array: stocks,
            index: idx,
            isPush: true
        });
    }
    _renderSection = () => {
        let imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        return (
            <View style={{ height: 30, flexDirection: 'row' }}>
                {this._titles.map((title, index) => {
                    if (title == '交易日期') {
                        return (
                            <View key={index}>
                                <TouchableOpacity style={{ width: 100, height: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2FAFF' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                                    <Text style={{ fontSize: 12, color: '#00000099' }}>交易日期</Text>
                                    <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc}></Image>
                                </TouchableOpacity>
                            </View>
                        );
                    } else {
                        let itemWidth = 100;
                        if (title == '董监高姓名') {
                            itemWidth = 115;
                        } else if (title == '职务') {
                            itemWidth = 150;
                        }
                        return (
                            <View style={{ width: itemWidth, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2FAFF' }} key={index}>
                                <Text style={{ fontSize: 12, color: '#00000099' }}>{title}</Text>
                            </View>
                        );
                    }
                })}
            </View>
        );
    };
    _getStockTextColor(x) {
        if (isNaN(x) || !isFinite(x)) {
            x = 0;
        }
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (x > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (x < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        return clr;
    }
    _getStockBgColor(x) {
        if (isNaN(x) || !isFinite(x)) {
            x = 0;
        }
        let clr = '#0000000d';
        if (x > 0) {
            clr = '#F924000d';
        } else if (x < 0) {
            clr = '#3399000d';
        }
        return clr;
    }
    _renderItem = (path) => {
        let oldData = this.state._data[0].items;
        let item = oldData[path.row];
        let amtTextColor = this._getStockTextColor(item.tradeAmt);
        let amtBgColor = this._getStockBgColor(item.tradeAmt);
        return (
            <TouchableOpacity
                key={item.secCode}
                style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ffffff', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}
                activeOpacity={1}
                onPress={() => this._itemOnClick(item)}
            >
                <View style={{ width: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 15, color: "#000", fontWeight: 'bold' }} numberOfLines={1} >{item.secName}</Text>
                    <Text style={{ fontSize: 12, color: "#666", marginTop: Platform.OS == 'ios' ? 3 : 0 }}>{item.secCode}</Text>
                </View>
                <View style={{ width: 100, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, color: "rgba(0,0,0,0.8)", fontWeight: 'bold' }} numberOfLines={1} >{item.changer}</Text>
                </View>
                <View style={{ width: 100, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 40 / 2, backgroundColor: item.chgType === '买入' ? "#fa5033" : "#5cac33", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 14, color: "#fff" }} numberOfLines={1} >{item.chgType}</Text>
                    </View>
                </View>
                <View style={{ width: 100, paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ flex: 1, backgroundColor: '#3399FF0d', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <StockFormatText precision={2} unit={'万/亿'} style={{ fontSize: 16, color: "rgba(0,0,0,0.8)" }}>{item.transPrice}</StockFormatText>
                    </View>
                </View>
                <View style={{ width: 100, paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ flex: 1, backgroundColor: '#F924000d', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <StockFormatText precision={2} unit={'次/万/亿'} style={{ fontSize: 16, color: "rgba(0,0,0,0.8)" }}>{parseInt(item.chgSharesNum)}</StockFormatText>
                    </View>
                </View>
                <View style={{ width: 100, paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ height: 45, backgroundColor: amtBgColor, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{ fontSize: 16, color: amtTextColor }}>{item.tradeAmt}</StockFormatText>
                    </View>
                </View>
                <View style={{ width: 115, paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ height: 45, backgroundColor: '#9933FF0d', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#660066cc' }} numberOfLines={2} >{item.manageName}</Text>
                    </View>
                </View>
                <View style={{ width: 150, paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ height: 45, backgroundColor: '#9933FF0d', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#660066cc' }} numberOfLines={2} >{item.duty}</Text>
                    </View>
                </View>
                <View style={{ width: 100, paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ height: 45, backgroundColor: '#9933FF0d', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#660066cc' }} numberOfLines={1} >{item.relation}</Text>
                    </View>
                </View>
                <View style={{ width: 100, paddingTop: 10, paddingBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 60, borderRadius: 5, backgroundColor: "#f5faff", padding: 5, justifyContent: "center" }}>
                        <Text style={{ fontSize: 13, color: "#003366" }}>{item.chgDate && item.chgDate !== '--' ? item.chgDate.substring(0, 4) : "--"}</Text>
                        <Text style={{ fontSize: 15, color: "#6282a3" }}>{item.chgDate && item.chgDate !== '--' ? item.chgDate.substring(5, 10) : "--"}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    _renderList() {
        return (
            <StickyForm
                bounces={false}
                style={{ backgroundColor: 'white', height: 5 * 65 + 30 }}
                contentStyle={{ alignItems: 'center', width: (this._titles.length - 2) * 100 + 115 + 150 }}
                hotBlock={{ lock: "left" }}
                data={this.state._data}
                scrollEnabled={true}
                heightForSection={() => 30}
                renderSection={this._renderSection}
                heightForIndexPath={() => 65}
                renderIndexPath={this._renderItem}
                showsHorizontalScrollIndicator={false}
                headerStickyEnabled={false}
            />
        )
    }
    _moreBtnOnClick(type) {
        Navigation.pushForParams(this.props.navigation, 'HitsTopNavigator', { gotoPage: type });
    }
    render() {
        let btnWidth = (baseStyle.width - 2 * 15 - 15) / 4;
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require(`${IMAGE_DIR}main_decision_long_hu_bang_small_icon.png`)} />
                        <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '900' }}>高管交易榜</Text>
                    </View>
                    <TouchableOpacity onPress={() => this._moreBtnOnClick(0)}>
                        <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
                <LinearGradient
                    style={{ flex: 1, height: 40, borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: Platform.OS === 'ios' ? 'hidden' : "visible", justifyContent: 'center', alignItems: 'center' }}
                    colors={['#cc33ff', '#ff33ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>最新交易榜</Text>
                </LinearGradient>
                {this._renderList()}
                <View style={{ flexDirection: 'row', height: 60, backgroundColor: '#fff', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, justifyContent: 'space-evenly' }}>
                    {
                        [{ title: '集中买入', bgImgSrc: require(`${IMAGE_DIR}main_decision_ji_zhong_mai_ru_bg.png`) },
                        { title: '持续买入', bgImgSrc: require(`${IMAGE_DIR}main_decision_chi_xu_mai_ru_bg.png`) },
                        { title: '市场统计', bgImgSrc: require(`${IMAGE_DIR}main_decision_shi_chang_tong_ji_bg.png`) },
                        { title: '行业统计', bgImgSrc: require(`${IMAGE_DIR}main_decision_hang_ye_tong_ji_bg.png`) }].map((value, index) => {
                            return (
                                <TouchableOpacity key={index} style={{ width: btnWidth, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._moreBtnOnClick(index + 1)} >
                                    <ImageBackground
                                        style={{ flex: 1, width: btnWidth, justifyContent: 'center' }}
                                        source={value.bgImgSrc}
                                        resizeMode='stretch'
                                        capInsets={{ top: 10, left: 10, bottom: 10, right: 10 }}>
                                        <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>{value.title}</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            </View >
        );
    }
}

const FUND_FLOW_FIXED_COLUMN_WIDTH = 120;
const FUND_FLOW_COLUMN_WIDTH = 95;
/// 主力决策资金流向统计组件
export class MainDecisionFundFlowStatisticPanel extends Component {
    constructor(props) {
        super(props);
        this.isDidMount = false;
        this.subscribedStocks = []; // 当前已注册的股票
        this.titles = ['涨跌幅', '现价', '当日主力净额', '3日主力净额', '5日主力净额', '10日主力净额'];
        this.pageCount = 5;
        this.blockId = 'yd_1_sec_8';
        this.stockTotalCount = 0; // 获取某板块下的股票总个数
        this.titleId = 1000; // 排序抬头,抬头对应的ID请查看proto文件定义。当日主力资金净流入: 1000,3日主力资金净流入: 1001,5日主力资金净流入: 1002,10日主力资金净流入: 1003
        this.desc = true; // 排序方式 升序 降序
        this.start = 0; // 从当前位置开始请求板块排序数据
        this.graphIsShow = false;
        this.state = {
            tradingStatus: 0, // 竞价交易状态，清盘状态(status=1)时饼图符号不可点击
            neededRenderGraph: false, // 是否需要渲染资金流线统计饼图
            data: [{ items: [{}, {}, {}, {}, {}] }],
        }
    }
    componentDidMount() {
        this.isDidMount = true;
        this._addNavigationChangeListener();
    }
    componentWillUnmount() {
        this.isDidMount = false;
        this.blockSortRequest && this.blockSortRequest.cancel();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    //监听导航变化
    _addNavigationChangeListener() {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            AppState.addEventListener('change', this._handleAppStateChange);
            this.netInfoSubscriber = NetInfo.addEventListener(this._handleConnectivityChange);
            this._getSectorType();
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            AppState.removeEventListener('change', this._handleAppStateChange);
            this.netInfoSubscriber && this.netInfoSubscriber()
            this.blockSortRequest && this.blockSortRequest.cancel();
            this.nativeFetchFullQuote([], this.subscribedStocks);
            this.subscribedStocks = [];
        });
    }
    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            // NetInfo.fetch().then((connectionInfo) => {
            //   if (connectionInfo.type != 'none' && connectionInfo.type != 'NONE') {
            this._getSectorType();
            //   }
            // });
        } else if (nextAppState === 'background') {
            this.blockSortRequest && this.blockSortRequest.cancel();
            this.nativeFetchFullQuote([], this.subscribedStocks);
            this.subscribedStocks = [];
        }
    }
    _handleConnectivityChange = (status) => {

    }
    find(array, code) {
        let ret = null;
        for (let i = 0; i < array.length; i++) {
            if (array[i].Obj == code) {
                ret = array[i];
                break;
            }
        }
        return ret;
    }

    fetchFullQuote(data) {
        let sortData = data.map(obj => {
            return obj.Obj;
        });
        let nextReg = [], nextUnReg = [];
        for (let i = 0; i < sortData.length; i++) {
            if (this.subscribedStocks.indexOf(sortData[i]) == -1) {
                nextReg.push(sortData[i]);
            }
        }
        for (let i = 0; i < this.subscribedStocks.length; i++) {
            if (sortData.indexOf(this.subscribedStocks[i]) == -1) {
                nextUnReg.push(this.subscribedStocks[i]);
            }
        }
        // 已注册股票和将要注册股票的交集
        let intersection = this.subscribedStocks.filter(function (v) {
            return sortData.indexOf(v) > -1;
        });
        let x = intersection.concat(nextReg);
        this.subscribedStocks = x;
        this.nativeFetchFullQuote(nextReg, nextUnReg);
    }

    nativeFetchFullQuote(subscribes, unsubscribes) {
        connection.yd_fetchFullQuote(subscribes, unsubscribes, this.receiveData);
    }

    receiveData = (data) => {
        if (!(data instanceof Error) && this.isDidMount == true) {
            let objs = this.state.data[0].items ? this.state.data[0].items : [];
            this.tradingStatus = data.quote.status;
            if (this.state.tradingStatus != data.quote.status) {
                this.setState({ tradingStatus: data.quote.status });
            }
            let index = -1;
            for (let i = 0; i < objs.length; i++) {
                if (objs[i].Obj === data.quote.label) {
                    index = i;
                    break;
                }
            }
            if (index == -1) return;
            let obj = objs[index];
            let needed = this.renderIfNeeded(data, obj);
            if (needed) {
                obj.ZhangFu = parseFloat(data.quote.increaseRatio).toFixed(2);
                obj.ZuiXinJia = parseFloat(data.quote.price).toFixed(2);
                obj.ZhongWenJianCheng = data.quote.name;
                obj.hugeNet1Day = data.fundFlow.hugeNet1Day;
                obj.hugeNet3Day = data.fundFlow.hugeNet3Day;
                obj.hugeNet5Day = data.fundFlow.hugeNet5Day;
                obj.hugeNet10Day = data.fundFlow.hugeNet10Day;
                obj.hugeIn = data.fundFlow.hugeIn;
                obj.hugeOut = data.fundFlow.hugeOut;
                obj.superIn = data.fundFlow.superIn;
                obj.superOut = data.fundFlow.superOut;
                obj.largeIn = data.fundFlow.largeIn;
                obj.largeOut = data.fundFlow.largeOut;
                obj.mediumIn = data.fundFlow.mediumIn;
                obj.mediumOut = data.fundFlow.mediumOut;
                obj.littleIn = data.fundFlow.littleIn;
                obj.littleOut = data.fundFlow.littleOut;
                this.setState({ data: [{ items: objs }] });
            }
        }
    }
    renderIfNeeded(obj, otherObj) {
        let fixedPrice = parseFloat(obj.quote.price).toFixed(2);
        let fixedRatio = parseFloat(obj.quote.increaseRatio).toFixed(2);
        if (fixedRatio !== otherObj.ZhangFu ||
            fixedPrice !== otherObj.ZuiXinJia ||
            obj.fundFlow.hugeNet1Day !== otherObj.hugeNet1Day ||
            obj.fundFlow.hugeNet3Day !== otherObj.hugeNet3Day ||
            obj.fundFlow.hugeNet5Day !== otherObj.hugeNet5Day ||
            obj.fundFlow.hugeNet10Day !== otherObj.hugeNet10Day) {
            return true;
        }
        return false;
    }
    _getSectorType() {
        getSectorType(this.blockId, (sectorCode, totalStockNum) => {
            if (sectorCode !== undefined) {
                this.blockId = sectorCode;
                this.stockTotalCount = totalStockNum;
                this._loadData();
            }
        });
    }
    _loadData() {
        let requestCount = Math.min(this.stockTotalCount, this.pageCount);
        this.blockSortRequest && this.blockSortRequest.cancel();
        let params = {
            blockid: this.blockId,
            fundFlowTitle: this.titleId,
            desc: this.desc,
            start: this.start,
            count: requestCount,
            subscribe: true
        };
        this.blockSortRequest = connection.request('FetchBlockSortNative', params, (ev) => {
            var data = ev;
            if (Platform.OS === 'android') {
                data = data.map(obj => {
                    return { Obj: obj.label_, value: obj.value_ };
                });
            }
            var tempObjs = this.state.data[0].items ? this.state.data[0].items.slice() : [];
            if (tempObjs.length) {
                let newData = data.map(obj => {
                    let x = this.find(tempObjs, obj.Obj);
                    if (x) {
                        return {
                            Obj: x.Obj,
                            ZuiXinJia: x.ZuiXinJia,
                            ZhongWenJianCheng: x.ZhongWenJianCheng,
                            ZhangFu: x.ZhangFu,
                            hugeNet1Day: x.hugeNet1Day,
                            hugeNet3Day: x.hugeNet3Day,
                            hugeNet5Day: x.hugeNet5Day,
                            hugeNet10Day: x.hugeNet10Day,
                            hugeIn: x.hugeIn,
                            hugeOut: x.hugeOut,
                            superIn: x.superIn,
                            superOut: x.superOut,
                            largeIn: x.largeIn,
                            largeOut: x.largeOut,
                            mediumIn: x.mediumIn,
                            mediumOut: x.mediumOut,
                            littleIn: x.littleIn,
                            littleOut: x.littleOut,
                        };
                    } else {
                        return obj;
                    }
                })
                for (let i = 0, j = this.start; i < newData.length; i++, j++) {
                    tempObjs[j] = newData[i];
                }
            } else {
                tempObjs = data;
            }
            this.setState({ data: [{ items: tempObjs }] }, () => {
                this.fetchFullQuote(data);
            });
        });
    }
    _moreBtnOnClick() {
        Navigation.pushForParams(this.props.navigation, 'FundsFlowStatisticPage');
    }
    _sortBtnOnClick(title) {
        if (title == '当日主力净额') {
            if (this.titleId !== 1000) {
                this.titleId = 1000;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        } else if (title == '3日主力净额') {
            if (this.titleId !== 1001) {
                this.titleId = 1001;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        } else if (title == '5日主力净额') {
            if (this.titleId !== 1002) {
                this.titleId = 1002;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        } else if (title == '10日主力净额') {
            if (this.titleId !== 1003) {
                this.titleId = 1003;
                this._clearDataAndReload();
            } else {
                this.desc = !this.desc;
                this._clearDataAndReload();
            }
        }
    }
    _clearDataAndReload() {
        this.setState({ data: [{ items: [{}, {}, {}, {}, {}] }] });
        this._loadData();
    }
    _renderSection = (section) => {
        return (
            <View style={{ height: 30, flexDirection: 'row', backgroundColor: '#F2FAFF' }} key={section}>
                <View style={{ width: FUND_FLOW_FIXED_COLUMN_WIDTH, justifyContent: 'center', alignItems: 'center', paddingLeft: 5, backgroundColor: '#F2FAFF' }}>
                    <Text style={{ fontSize: 12, color: '#00000099' }}>{'股票名称'}</Text>
                </View>
                {
                    this.titles.map((title, index) => {
                        let imgSrc = require('../../images/hits/defaultt.png');
                        if (this.titleId == 1000 && index == 2) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        } else if (this.titleId == 1001 && index == 3) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        } else if (this.titleId == 1002 && index == 4) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        } else if (this.titleId == 1003 && index == 5) {
                            imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
                        }
                        return (
                            < TouchableOpacity key={index} style={{ flexDirection: 'row', width: FUND_FLOW_COLUMN_WIDTH, marginLeft: 5, marginRight: index == this.titles.length - 1 ? 15 : 5, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick(title)}>
                                <Text style={{ fontSize: 12, color: '#00000099' }}>{title}</Text>
                                {index > 1 && <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc} />}
                            </TouchableOpacity>
                        )
                    })
                }
            </View >
        );
    };

    _stockOnClick(item, index) {
        let array = this.state.data[0].items;
        let stocks = [];
        for (let i = 0; i < array.length; i++) {
            stocks.push(Object.assign({}, array[i]));
        }
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...item,
            array: stocks,
            index: index,
            isPush: true
        });
    }
    _renderItem = (path) => {
        const item = this.state.data[path.section].items[path.row];
        let isShowGraphIcon = item.Obj;

        return (
            <View style={{ flex: 1, height: 60, backgroundColor: '#fff', flexDirection: 'row', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}>
                <View style={{ width: FUND_FLOW_FIXED_COLUMN_WIDTH, alignItems: 'center', marginTop: 10, marginBottom: 10, paddingRight: 5, paddingLeft: 10, backgroundColor: '#fff' }}>
                    <View style={{ width: FUND_FLOW_FIXED_COLUMN_WIDTH - 15, height: 40, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, paddingRight: 10, backgroundColor: '#3399FF0d' }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => this._stockOnClick(item, path.row)}>
                            <Text style={{ fontSize: 15 }}>{item.ZhongWenJianCheng ? item.ZhongWenJianCheng : '--'}</Text>
                            <Text style={{ fontSize: 12, color: '#666666' }}>{item.Obj ? item.Obj : '--'}</Text>
                        </TouchableOpacity>
                        {isShowGraphIcon && <TouchableOpacity style={{ marginLeft: 10, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => {
                            if (this.graphIsShow) return;
                            this.setState({ neededRenderGraph: true }, () => {
                                // this.interval && clearInterval(this.interval);
                                this.refs.graph && this.refs.graph.show(item)
                                // this.graphIsShow = true;
                            });
                        }}>
                            <Image style={{ width: 20, height: 20 }} source={require('../../images/MainDecesion/main_decision_fund_icon.png')}></Image>
                        </TouchableOpacity>}
                    </View>
                </View>
                <FundsFlowStatisticItemComponent
                    data={{ ...item }}
                    itemOnClick={(item) => this._stockOnClick(item, path.row)}
                    style={{ flex: 1, height: 60, flexDirection: 'row', backgroundColor: '#fff', borderBottomColor: '#F1F1F1', borderBottomWidth: 1 }}
                />
            </View>
        )
    };
    _renderList() {
        return (
            <StickyForm
                bounces={false}
                style={{ backgroundColor: 'white', height: 5 * 60 + 30 }}
                contentStyle={{ width: FUND_FLOW_FIXED_COLUMN_WIDTH + (FUND_FLOW_COLUMN_WIDTH + 10) * this.titles.length + 10 }}
                hotBlock={{ lock: "left" }}
                data={this.state.data}
                scrollEnabled={true}
                heightForSection={() => 30}
                renderSection={this._renderSection}
                heightForIndexPath={() => 60}
                renderIndexPath={this._renderItem}
                showsHorizontalScrollIndicator={false}
                headerStickyEnabled={false}
            />
        )
    }
    _graphDismissCallback = () => {
        this.graphIsShow = false;
        if (!this.state.neededRenderGraph) return;
        this.setState({ neededRenderGraph: false })
    }
    graphDidMount = () => {
        this.graphIsShow = true;
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require(`${IMAGE_DIR}main_decision_long_hu_bang_small_icon.png`)} />
                        <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '900' }}>资金流向统计</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._moreBtnOnClick()}>
                        <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 1, backgroundColor: '#0000001A' }}></View>
                {this._renderList()}
                {this.state.neededRenderGraph && this.graphIsShow === false ? <FundsFlowStatisticGraph ref={'graph'} hiddenCallback={this._graphDismissCallback} onDidMount={this.graphDidMount} /> : null}
            </View>
        );
    }
}

/// 主力决策资金揭秘组件
export class MainDecisionFundSecretPanel extends Component {
    constructor(props) {
        super(props);
        this.stocks = [];
        this.state = {
            intro: '', // 资金揭秘介绍文字
            longHuZiJinCount: 0, // 龙虎资金入选的股票数量
            gaoGuanZiJinCount: 0, // 高管资金入选的股票数量
            zhuLiZiJinCount: 0, // 主力资金入选的股票数量
            stockInfo: null, // 抢筹股票池
        }

        this.postPath = '/celuexuangu/fundSummary';//页面的BaseUrl
        this.longHuPath = '/celuexuangu/getlonghuzijin';
        this.gaoGuanPath = '/celuexuangu/getgaoguanzijin';
        this.zhuLiPath = '/celuexuangu/getzhulizijin';
    }
    componentDidMount() {
        this._addNavigationChangeListener();
        this._loadIntroData();
    }
    componentWillUnmount() {
        this._offQuote();
        this.timer && clearInterval(this.timer);
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    //监听导航变化
    _addNavigationChangeListener() {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            this.loadStocksData();
            // 5分钟定时刷新股票池
            this.timer = setInterval(() => {
                this.loadStocksData();
            }, 5000 * 60);
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this._offQuote();
            this.timer && clearInterval(this.timer);
        });
    }
    // 获取资金揭秘介绍内容
    _loadIntroData() {
        YdCloud().ref(MainPathYG2 + 'CeLueJieShao/10').orderByKey().get(snap => {
            if (snap.code == 0) {
                let value = snap.nodeContent;
                this.setState({ intro: value });
            }
        });
    }

    loadStocksData() {
        this._getStockMessageCount('龙虎资金');
        this._getStockMessageCount('高管资金');
        this._getStockMessageCount('主力资金');


        let param = {};//这个是请求列表的参数
        param.page = 1;
        param.pageSize = 1;
        param.sort = 'upDown';
        param.sortOrder = 'desc';
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, this.postPath, param, (response) => {
            if (response && response.list.length > 0) {
                let newMessage = response.list;
                this.setState({
                    stockInfo: newMessage.length && newMessage[0]
                }, () => {
                    this.stocks = newMessage.length ? [newMessage[0].marketCode] : [];
                    this.getStockListInfo(() => {
                        QuotationListener.addListeners(this.stocks, (stockObj) => {
                            this.setQuotation(stockObj);
                        });
                    });
                });

            }
        }, (error) => {
        });
    }

    //获取股票总个数
    _getStockMessageCount(stockT) {
        let stockType = {
            longHu: '龙虎资金',
            gaoGuan: '高管资金',
            zhuLi: '主力资金',
        }


        let path = '';
        let param = {};
        param.onlyCount = '1';
        if (this.specialTag && this.specialTag !== "") {
            param.tszb = this.specialTag;
        }
        switch (stockT) {
            case stockType.longHu:
                path = this.longHuPath;

                break;
            case stockType.gaoGuan:
                path = this.gaoGuanPath;

                break;
            case stockType.zhuLi:
                path = this.zhuLiPath;
                break;
            default:
                break;
        }
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, path, param, (response) => {
            if (response) {
                switch (stockT) {
                    case stockType.longHu:
                        this.setState({
                            longHuZiJinCount: response.count,
                        })
                        break;
                    case stockType.gaoGuan:
                        this.setState({
                            gaoGuanZiJinCount: response.count,
                        })

                        break;
                    case stockType.zhuLi:
                        this.setState({
                            zhuLiZiJinCount: response.count,
                        })

                        break;
                    default:
                        break;
                }
            }
        }, () => {
        });
    }



    getStockListInfo(callBack) {
        if (this.stocks.length > 0) {
            QuotationListener.getStockListInfo(this.stocks, (stockObj) => {
                if (stockObj.length > 0) {
                    if (this.state.stockInfo.marketCode == stockObj[0].c) {
                        this.state.stockInfo.presentPrice = Number(stockObj[0].k);
                        this.state.stockInfo.upDown = Number(stockObj[0].y);
                    }
                    this.setState({ stockInfo: this.state.stockInfo }, () => {
                        if (callBack) { callBack() }
                    });
                } else {
                    if (callBack) { callBack() }
                }
            });
        } else {
            if (callBack) { callBack() }
        }
    }
    // 取消监听行情变化
    _offQuote() {
        if (this.stocks.length > 0) {
            QuotationListener.offListeners(this.stocks, () => { });
            this.stocks = [];
        }
    }
    setQuotation(stockObj) {
        if (stockObj.length) {
            if (this.state.stockInfo.marketCode == stockObj[0].c) {
                this.state.stockInfo.presentPrice = Number(stockObj[0].k);
                this.state.stockInfo.upDown = Number(stockObj[0].y);
                this.setState({ stockInfo: this.state.stockInfo });
            }
        }
    }
    _morePress() {
        Navigation.pushForParams(this.props.navigation, 'MoneyRevelationPage');
    }
    _stockOnClick(item) {
        let newItem = { Obj: item.marketCode, ZhongWenJianCheng: item.secName };

        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...newItem,
            isPush: true
        });
    }
    _renderStockPoolItem(item) {
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (item && item.upDown > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (item && item.upDown < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        return (
            <View style={{ flexDirection: 'row', paddingLeft: 15, paddingTop: 5, paddingBottom: 5, paddingRight: 15 }}>
                <Image style={{ width: 105, height: 105 }} source={require(`${IMAGE_DIR}main_decision_grab_stock_pool_icon.png`)}></Image>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <TouchableHighlight style={{}} underlayColor='transparent'>
                            <View style={{ paddingLeft: 10 }}>
                                <Text style={{ fontSize: 15 }}>抢筹股票池</Text>
                                <Text style={{ fontSize: 12, color: '#00000066', paddingTop: 4 }}>两路资金和三路资金同时在抢股票池</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight style={{}} underlayColor='transparent' onPress={() => this._morePress()}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 15, color: '#00000066', marginRight: 10 }}>更多</Text>
                                <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    {item ?
                        <View style={{ paddingTop: 10, paddingLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableHighlight style={{ flex: 1 }} underlayColor={'transparent'} onPress={() => this._stockOnClick(item)}>
                                <ImageBackground
                                    style={{ width: baseStyle.width - 150, height: 60, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}
                                    resizeMode='stretch'
                                    capInsets={{ top: 20, left: 20, bottom: 20, right: 20 }}
                                    source={require(`${IMAGE_DIR}main_decision_stock_info_bg_gray.png`)}>
                                    <View>
                                        <Text style={{ fontSize: 12, color: '#333333' }}>{item.secName}</Text>
                                        <Text style={{ fontSize: 12, color: '#666666', paddingTop: 7 }}>{item.secCode}</Text>
                                    </View>
                                    <View>
                                        <StockFormatText style={{ fontSize: 14, color: clr }} >{item.presentPrice}</StockFormatText>
                                        <Text style={{ fontSize: 12, color: '#666666', paddingTop: 7 }}>现价</Text>
                                    </View>
                                    <View>
                                        <StockFormatText style={{ fontSize: 14, color: clr }} sign={true} unit='%' >{item.upDown / 100}</StockFormatText>
                                        <Text style={{ fontSize: 12, color: '#666666', paddingTop: 7 }}>涨幅</Text>
                                    </View>
                                </ImageBackground>
                            </TouchableHighlight>
                        </View>
                        :
                        <View style={{ paddingTop: 10, paddingLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <ImageBackground
                                style={{ width: baseStyle.width - 150, height: 60, justifyContent: 'center', alignItems: 'center' }}
                                resizeMode='stretch'
                                capInsets={{ top: 20, left: 20, bottom: 20, right: 20 }}
                                source={require(`${IMAGE_DIR}main_decision_stock_info_bg_gray.png`)}>
                                <Text style={{ fontSize: 12, color: '#66666633' }}>暂无股票</Text>
                            </ImageBackground>
                        </View>
                    }
                </View>
            </View>
        )
    }
    _moneyPress() {
        Navigation.pushForParams(this.props.navigation, 'MoneyRevelationPage');
    }
    render() {
        let btnWidth = (baseStyle.width - 2 * 15 - 2 * 6) / 3;
        return (
            <View style={{ flex: 1, paddingBottom: 5, backgroundColor: '#ffffff' }}>
                <TouchableHighlight underlayColor={'transparent'} onPress={() => this._moneyPress()}>
                    <View>
                        <View style={{ flexDirection: 'row', height: 40, justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require(`${IMAGE_DIR}main_decision_zi_jin_jie_mi_small_icon.png`)} />
                            <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '900' }}>资金揭秘</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#00000066', marginLeft: 15, marginRight: 15, marginBottom: 10 }} numberOfLines={2}>{this.state.intro}</Text>
                    </View>
                </TouchableHighlight>
                <View style={{ height: 1, backgroundColor: '#0000001A' }}></View>
                <View style={{ flexDirection: 'row', height: 85, backgroundColor: 'white', paddingLeft: 10, paddingRight: 10, paddingTop: 15, paddingBottom: 13, justifyContent: 'space-evenly' }}>
                    {
                        [{ title: '龙虎资金', colors: ['#FF135A', '#FF5E65'], data: this.state.longHuZiJinCount },
                        { title: '高管资金', colors: ['#0061FF', '#2894FF'], data: this.state.gaoGuanZiJinCount },
                        { title: '主力资金', colors: ['#B000FF', '#C928FF'], data: this.state.zhuLiZiJinCount }].map((value, index) => {
                            return (
                                <TouchableHighlight key={index} style={{ width: btnWidth, justifyContent: 'center', alignItems: 'center' }} underlayColor={'transparent'} onPress={() => { Navigation.pushForParams(this.props.navigation, 'MoneyStockPage', { title: value.title }); }} >
                                    <LinearGradient
                                        style={{ flex: 1, width: btnWidth, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}
                                        colors={value.colors}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={{ fontSize: 15, textAlign: 'center', color: 'white' }}>{value.title}</Text>
                                        <Text style={{ fontSize: 11, textAlign: 'center', color: 'white', paddingTop: 4 }}>入选{value.data}只股票</Text>
                                    </LinearGradient>
                                </TouchableHighlight>
                            )
                        })
                    }
                </View>
                {this._renderStockPoolItem(this.state.stockInfo)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    panelContainerStyle: {
        backgroundColor: baseStyle.LINE_BG_F1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 20,
        paddingBottom: 25
    },
    panelItemStyle: {
        alignItems: 'center',
        width: PANEL_ITEM_WIDTH,
        height: 50,
    },
    panelItemImageStyle: {
        width: 30,
        height: 30,
    },
    panelItemTextStyle: {
        marginTop: 8,
        color: '#00000066',
        fontSize: 12
    }
})
