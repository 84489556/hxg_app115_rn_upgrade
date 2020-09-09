/*
 * @Author: lishuai
 * @Date: 2019-08-09 11:28:10
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-05-21 17:11:40
 * 风口决策列表
 */
import React, { Component } from 'react';
import {
    Image,
    ImageBackground,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import GrowthClassroomComponent from '../../components/Decisions/DecisionGrowthClassroomComponent';
import InterpretationVideoComponent from '../../components/Decisions/DecisionInterpretationVideoComponent';
import OpinionLivingComponent from '../../components/Decisions/DecisionOpinionLivingComponent';
import NavigationTitleView from '../../components/NavigationTitleView';
import RiskTipsFooterView from '../../components/RiskTipsFooterView';
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from '../../pages/BaseComponentPage';
import QuotationListener from "../../utils/QuotationListener";
import UserInfoUtil from '../../utils/UserInfoUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";

export default class TuyereDecisionPage extends BaseComponentPage {
    // 观点直播
    _renderOpinionLivingPanel() {
        return (
            <OpinionLivingComponent navigation={this.props.navigation}  entrance = {'风口决策'} />
        )
    }
    // 精品讲堂(直播课堂)
    _renderInterpretationVideoPanel() {
        return (
            <InterpretationVideoComponent navigation={this.props.navigation} permission={4} entrance = '风口决策' />
        )
    }
    // 热点策略
    _renderHotDecisionPanel() {
        return (
            <HotDecisionEntryComponent navigation={this.props.navigation} />
        )
    }
    // 主题策略
    _renderTopicDecisionPanel() {
        return (
            <TopicDecisionEntryComponent navigation={this.props.navigation} />
        )
    }
    _renderValueStrategyPanel() {
        return (
            <ValueStrategyComponent navigation={this.props.navigation} />
        )
    }
    // 成长学堂
    _renderGrowthClassroomPanel() {
        return (
            <GrowthClassroomComponent navigation={this.props.navigation} permission={4} entrance = '风口决策' />
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
    _renderOpinionAndJiePanVideo() {
        return (
            <View>
                {this._lineUI()}
                {this._renderInterpretationVideoPanel()}
                {this._lineUI()}
                {this._renderOpinionLivingPanel()}
            </View>
        )
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.jiazhicelue);
        });
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }


    render() {
        let permission = UserInfoUtil.getUserPermissions();
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'风口决策'} />
                <ScrollView style={{ backgroundColor: baseStyle.LINE_BG_F1 }}>
                    {permission == 4 && this._renderOpinionAndJiePanVideo()}
                    {this._lineUI()}
                    {this._renderHotDecisionPanel()}
                    {this._lineUI()}
                    {this._renderTopicDecisionPanel()}
                    {this._lineUI()}
                    {this._renderValueStrategyPanel()}
                    {this._lineUI()}
                    {this._renderGrowthClassroomPanel()}
                    {this._renderRiskWarningPanel()}
                </ScrollView>
            </BaseComponentPage>
        );
    }
}
// 热点聚焦列表Item组件
export class HotFocusListItemComponent extends Component {
    _stockOnClick(item, index, stocks) {
        let newItem = { Obj: item.codePrefix + item.code, ZhongWenJianCheng: item.name };
        let array = stocks.map((value) => {
            return { Obj: value.code, ZhongWenJianCheng: value.name }
        });
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...newItem,
            array: array,
            index: index,
            isPush: true
        });
    }
    _renderStockItem(item, index, stocks) {
        return (
            <TouchableOpacity key={index} style={{ flexDirection: 'row' }} activeOpacity={1} onPress={() => this._stockOnClick(item, index, stocks)}>
                <ImageBackground
                    style={{ flexDirection: 'row', width: (baseStyle.width - 35) / 2, height: 60, justifyContent: 'space-evenly', alignItems: 'center' }}
                    capInsets={{ top: 20, left: 20, bottom: 20, right: 20 }}
                    resizeMode='stretch'
                    source={require('../../images/MainDecesion/main_decision_stock_info_bg.png')}>
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>{item && item.name}</Text>
                        <Text style={{ fontSize: 15, textAlign: 'center', color: '#ffffff' }}>{item && item.code}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        )
    }
    _renderStockView() {
        if (!this.props.data.stocks.length) return null;
        let stocks = this.props.data.stocks.slice(0, 2);
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                {stocks.map((item, index) => this._renderStockItem(item, index, stocks))}
            </View>
        )
    }
    render() {
        return (
            <TouchableOpacity key={this.props.data.id} style={{ flex: 1, padding: 15, paddingBottom: 10 }} activeOpacity={1} onPress={() => this.props.itemOnClick && this.props.itemOnClick(this.props.data.id)}>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <View style={{ width: 3, height: 14, backgroundColor: '#F92400' }}></View>
                        <Text style={{ marginLeft: 6, fontSize: 15, color: '#000000CC' }}>{this.props.data.title}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#26262866' }}>{this.props.data.pubTime.substring(0, 16)}</Text>
                    <Text style={{ flex: 1, fontSize: 14, color: '#26262899', marginTop: 4 }} numberOfLines={2}>{this.props.data.content}</Text>
                    {this._renderStockView()}
                </View>
            </TouchableOpacity>
        )
    }
}
// 价值策略组件
export class ValueStrategyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    componentDidMount() {
        this.loadData();
    }
    loadData() {
        YdCloud().ref(MainPathYG2 + 'CeLueZhongXin/JiaZhiCeLue/NewOne').get(response => {
            if (response.code == 0) {
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);
                for (let i = 0; i < key.length; i++) {
                    item[i].key = key[i];
                }
                if (item.length > 0) {
                    let screenItem = [];//新数据，筛选一下只需要8个类型的
                    for (let j = 0; j < item.length; j++) {
                        let name = item[j].key;
                        //按照固定顺序显示
                        let sortIndex;
                        switch (name) {
                            case "高成长":
                                sortIndex = 1;
                                break;
                            case "高盈利":
                                sortIndex = 2;
                                break;
                            case "高分红":
                                sortIndex = 3;
                                break;
                            case "高送转":
                                sortIndex = 4;
                                break;
                            case "低估值":
                                sortIndex = 5;
                                break;
                            case "股东增持":
                                sortIndex = 6;
                                break;
                            case "白马绩优":
                                sortIndex = 7;
                                break;
                            case "业绩预增":
                                sortIndex = 8;
                                break;
                        }
                        if (sortIndex) {
                            item[j].sortIndexs = sortIndex;
                            screenItem.push(item[j]);
                        }
                    }
                    this.state.data = screenItem.sort(this.sortNumSmalltoBig);
                    //处理了所有数据以后，再请求节点的最新介绍,现在两个节点不是在一起的
                    YdCloud().ref(MainPathYG2 + 'CeLueJieShao').get((valueIntros) => {
                        if (valueIntros.code == 0 && valueIntros.nodeContent) {
                            for (let j = 0; j < this.state.data.length; j++) {
                                //console.log("Item", valueIntros);
                                switch (this.state.data[j].key) {
                                    case "高成长":
                                        if (valueIntros.nodeContent["2"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["2"];
                                        }
                                        break;
                                    case "高盈利":
                                        if (valueIntros.nodeContent["5"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["5"];
                                        }
                                        break;
                                    case "高分红":
                                        if (valueIntros.nodeContent["4"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["4"];
                                        }
                                        break;
                                    case "高送转":
                                        if (valueIntros.nodeContent["6"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["6"];
                                        }
                                        break;
                                    case "低估值":
                                        if (valueIntros.nodeContent["3"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["3"];
                                        }
                                        break;
                                    case "股东增持":
                                        if (valueIntros.nodeContent["7"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["7"];
                                        }
                                        break;
                                    case "白马绩优":
                                        if (valueIntros.nodeContent["9"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["9"];
                                        }
                                        break;
                                    case "业绩预增":
                                        if (valueIntros.nodeContent["8"]) {
                                            this.state.data[j].jieshao = valueIntros.nodeContent["8"];
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }


                            this.setState({
                                data: this.state.data,
                            });
                        } else {
                            this.setState({
                                data: this.state.data,
                            });
                        }
                    });
                } else {
                    this.setState({ data: this.state.data, });
                }
            } else {
                this.setState({ data: [] });
            }
        });
    }
    /**
     * 从小到大排序
     * 固定顺序
     * */
    sortNumSmalltoBig(a, b) {
        return a.sortIndexs - b.sortIndexs;
    }


    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = '风口决策';
        sensorsDataClickObject.adLabel.second_label = label;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.module_source = '选股'
        sensorsDataClickObject.adLabel.page_source = '风口决策';
        sensorsDataClickObject.adLabel.is_pay = '风口决策';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)

        sensorsDataClickObject.choiceCondition.page_source = label;
        sensorsDataClickObject.choiceCondition.module_source='价值策略'

        sensorsDataClickObject.adModule.entrance = '';
        sensorsDataClickObject.adModule.module_name = label;
        sensorsDataClickObject.adModule.module_type = '选股';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)

        sensorsDataClickObject.adAchievements.module_source = '价值策略'

    }


    renderItem(value) {
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                //价值策略 8个价值
                this.sensorsAppear(value.key);
                Navigation.pushForParams(this.props.navigation, "ValueDetailPage", { keyWord: value.key, intro: value.jieshao })
            }} style={{ flex: 1 }}>
                <View style={{ height: 45, backgroundColor: '#FF33331A', borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                    <View style={{ marginTop: 10, alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                        <Text style={{ color: '#660000', fontSize: 15 }}>{value.key}</Text>
                    </View>
                </View>
                <View style={{ height: 75, backgroundColor: '#FF33990D', borderBottomLeftRadius: 5, borderBottomRightRadius: 5, padding: 10, paddingTop: 24.5 }}>
                    <Text style={{ color: '#00000066', fontSize: 14 }} numberOfLines={2}>{value.jieshao}</Text>
                </View>
                <View style={{ position: 'absolute', top: 35, left: ((baseStyle.width - 35) / 2 - 120) / 2, width: 120, height: 20, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#3399FF', fontSize: 11 }}>入选{value.count  > 8 ? 8 :value.count}只股票</Text>
                </View>
            </TouchableOpacity>
        );
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require('../../images/MainDecesion/main_decision_zi_jin_jie_mi_small_icon.png')} />
                    <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '600' }}>价值策略</Text>
                </View>
                <View style={{ height: 1, backgroundColor: '#0000001A' }}></View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 5, justifyContent: 'space-between' }}>
                    {this.state.data.map((value, index) => {
                        return (
                            <View key={index} style={{ width: (baseStyle.width - 35) / 2, paddingBottom: 5 }}>
                                {this.renderItem(value)}
                            </View>
                        )
                    })}
                </View>
            </View>
        );
    }
}
// 主题策略入口组件
export class TopicDecisionEntryComponent extends Component {
    constructor(props) {
        super(props);
        this.topicName = ''; // 主题名称
        this.stocks = []; // 股票代码
        this.state = {
            data: [],
            intro: '' //主题策略介绍
        }
    }
    componentDidMount() {
        this._addNavigationChangeListener();
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    _loadData() {
        YdCloud().ref(MainPathYG2 + 'ZhuTiTouZi/ZhuTiTouZiNew').get(snap => {
            if (snap.code == 0) {
                let keys = Object.keys(snap.nodeContent);
                let values = Object.values(snap.nodeContent);
                if (values.length && (keys.length == values.length)) {
                    for (let i = 0; i < values.length; i++) {
                        values[i].theme_name = keys[i]
                    }
                    values.sort(function (a, b) {
                        return b.level - a.level; // 倒序
                    });
                    this.topicName = values[0].theme_name;
                    this._loadStockList();
                }
            }
        });
        //直接取主题策略的节点18，如果取不到值,则没有介绍
        YdCloud().ref(MainPathYG2 + 'CeLueJieShao/18').get(snap => {
            if (snap.code == 0) {
                if (snap.nodeContent) {
                    this.setState({ intro: snap.nodeContent })
                }
            }
        });
    }
    _loadStockList() {
        let params = { 'ztmc': this.topicName, 'tszb': '放量上攻' };
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, '/celuexuangu/ztclxg', params, (x) => {
            if (!x) return;
            let data = x.list.slice(0, 3);
            this.setState({ data: data }, () => {
                this.stocks = data.map(value => {
                    return value.marketCode;
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
                    for (let i = 0; i < this.state.data.length; i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            if (this.state.data[i].marketCode == stockObj[j].c) {
                                this.state.data[i].presentPrice = Number(stockObj[j].k);
                                this.state.data[i].upDown = Number(stockObj[j].y);
                            }
                        }
                    }
                    this.setState({ data: this.state.data }, () => {
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
            // 5分钟定时刷新股票池
            this.timer = setInterval(() => {
                this._loadStockList();
            }, 5000 * 60);
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this._offQuote();
            this.timer && clearInterval(this.timer);
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
        if (this.state.data.length > 0) {
            for (let i = 0; i < this.state.data.length; i++) {
                if (this.state.data[i].marketCode == stockObj.c) {
                    this.state.data[i].presentPrice = Number(stockObj.k);
                    this.state.data[i].upDown = Number(stockObj.y);
                }
            }
            this.setState({ data: this.state.data });
        }
    }
    moreBtnOnClick = () => {
        Navigation.pushForParams(this.props.navigation, 'MainInvestmentTab', {});
    }
    render() {
        return (
            <StrategyUIComponent navigation={this.props.navigation} data={{ type: '主题策略', intro: this.state.intro, stockData: this.state.data, moreBtnCallback: this.moreBtnOnClick }} />
        )
    }
}
// 热点策略入口组件
export class HotDecisionEntryComponent extends Component {
    constructor(props) {
        super(props);
        this.stocks = []; // 股票代码
        this.state = {
            data: [],
            intro: '' //热点策略介绍
        }
    }
    componentDidMount() {
        this._addNavigationChangeListener();
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    _loadData() {
        this._loadStockList();
        //直接取热点策略的节点17，如果取不到值,则没有介绍
        YdCloud().ref(MainPathYG2 + 'CeLueJieShao/17').get(snap => {
            if (snap.code == 0) {
                if (snap.nodeContent) {
                    this.setState({ intro: snap.nodeContent })
                }
            }
        });
    }
    _loadStockList() {
        let params = { 'tszb': '放量上攻', 'page': 1, 'pageSize': 8, 'sort': 'daDanFounds', 'sortOrder': 'desc', 'top': 1 };
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, '/celuexuangu/getredianfengkou1', params, (x) => {
            if (!x) return;
            let data = x.list.slice(0, 3);
            this.setState({ data: data }, () => {
                this.stocks = data.map(value => {
                    return value.marketCode;
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
                    for (let i = 0; i < this.state.data.length; i++) {
                        for (let j = 0; j < stockObj.length; j++) {
                            if (this.state.data[i].marketCode == stockObj[j].c) {
                                this.state.data[i].presentPrice = Number(stockObj[j].k);
                                this.state.data[i].upDown = Number(stockObj[j].y);
                            }
                        }
                    }
                    this.setState({ data: this.state.data }, () => {
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
            // 5分钟定时刷新股票池
            this.timer = setInterval(() => {
                this._loadStockList();
            }, 5000 * 60);
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this._offQuote();
            this.timer && clearInterval(this.timer);
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
        if (this.state.data.length > 0) {
            for (let i = 0; i < this.state.data.length; i++) {
                if (this.state.data[i].marketCode == stockObj.c) {
                    this.state.data[i].presentPrice = Number(stockObj.k);
                    this.state.data[i].upDown = Number(stockObj.y);
                }
            }
            this.setState({ data: this.state.data });
        }
    }
    moreBtnOnClick = () => {
        Navigation.pushForParams(this.props.navigation, 'HotTuyerePages', {});
    }
    render() {
        return (
            <StrategyUIComponent navigation={this.props.navigation} data={{ type: '热点策略', intro: this.state.intro, stockData: this.state.data, moreBtnCallback: this.moreBtnOnClick }} />
        )
    }
}
// 热点策略、主题策略UI组件
export class StrategyUIComponent extends Component {
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
    stockOnClick(item, index) {
        const newItem = { Obj: item.marketCode, ZhongWenJianCheng: item.secName };
        let originalStocks = this.props.data.stockData;
        let stocks = originalStocks.map(value => {
            return { Obj: value.marketCode, ZhongWenJianCheng: value.secName };
        });
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...newItem,
            array: stocks,
            index: index,
            isPush: true
        });
    }
    moreBtnOnClick(name) {
        sensorsDataClickObject.choiceCondition.page_source = name;
        sensorsDataClickObject.choiceCondition.module_source =name;
        this.props.data.moreBtnCallback && this.props.data.moreBtnCallback();
    }
    renderStockItem(data) {
        let priceClr = this._getStockTextColor(data ? data.upDown : 0);
        return (
            <View style={{ flex: 1, paddingTop: 15, paddingBottom: 15, justifyContent: 'center' }}>
                <Text style={{ fontSize: 15, color: '#000', textAlign: 'center' }}>{data.secName}</Text>
                <Text style={{ fontSize: 12, color: '#00000066', textAlign: 'center', marginTop: Platform.OS == 'ios' ? 5 : 2 }}>{data.secCode}</Text>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-start', marginTop: 13 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <StockFormatText style={{ fontSize: 15, color: priceClr, textAlign: 'center', marginTop: Platform.OS == 'ios' ? 0 : -3 }} unit='%' sign={true}>{data.upDown / 100}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000066', textAlign: 'center', marginTop: Platform.OS == 'ios' ? 3 : -1 }}>涨幅</Text>
                    </View>
                    <View style={{ width: 1, height: 33, backgroundColor: '#0000001A' }}></View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <StockFormatText style={{ fontSize: 15, color: priceClr, textAlign: 'center', marginTop: Platform.OS == 'ios' ? 0 : -3 }} precision={2}>{data.presentPrice}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000066', textAlign: 'center', marginTop: Platform.OS == 'ios' ? 3 : -1 }}>现价</Text>
                    </View>
                </View>
            </View>
        )
    }
    renderNotStockView() {
        return (
            <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 10, height: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3399FF0D' }}>
                <Text style={{ fontSize: 15, color: '#00000066' }}>暂无股票入选</Text>
            </View>
        )
    }
    _renderItem(item, index) {
        let itemWidth = (baseStyle.width - 2 * 15 - 2 * 5) / 3;
        return (
            <TouchableOpacity key={item.marketCode} style={{ paddingLeft: 3, paddingRight: 3, alignItems: 'center' }} activeOpacity={1} onPress={() => this.stockOnClick(item, index)}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flex: 1, width: itemWidth, borderRadius: 5, backgroundColor: '#3399FF1A' }}>
                        {this.renderStockItem(item)}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    render() {
        let name = this.props.data.type;
        let intro = this.props.data.intro || '暂无热点策略介绍';
        let stocks = this.props.data.stockData;
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 40, justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#0000001A', borderBottomWidth: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 18, height: 18, marginLeft: 15 }} source={require('../../images/MainDecesion/main_decision_zi_jin_jie_mi_small_icon.png')} />
                        <Text style={{ fontSize: 20, color: '#000000', marginLeft: 6, fontWeight: '600' }}>{name}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={() => this.moreBtnOnClick(name)}>
                        <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10 }} activeOpacity={1} onPress={() => this.moreBtnOnClick(name)}>
                    <Text style={{ color: '#00000099', fontSize: 14, lineHeight: 20 }} numberOfLines={2}>{intro}</Text>
                </TouchableOpacity>
                {
                    stocks.length ?
                        <View style={{ flexDirection: 'row', paddingLeft: 12, paddingRight: 12, paddingBottom: 10 }}>
                            {stocks.map((value, index) => {
                                return this._renderItem(value, index);
                            })}
                        </View>
                        :
                        this.renderNotStockView()
                }
            </View>
        )
    }
}
