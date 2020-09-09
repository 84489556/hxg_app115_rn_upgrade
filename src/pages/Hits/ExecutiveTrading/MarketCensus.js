/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description:市场统计tab
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    Alert,
    StyleSheet, StatusBar, TouchableOpacity,
    Image, PixelRatio
} from 'react-native';

import FlowLayout from '../../../components/FlowLayout';
import * as ScreenUtil from "../../../utils/ScreenUtil";
import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import { StickyForm } from "react-native-largelist-v3";
import StockFormatText from '../../../components/StockFormatText';
//import { mNormalFooter } from "../../../components/mNormalFooter";
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../../components/SensorsDataTool";

import {mRiskTipsFooter} from "../../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../../components/RiskTipsFooterView";

export default class MarketCensus extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            flowDatas: ["全市场", "沪市", "深市", "中小板", "创业板", "科创板"],
            selectCode: "all",//选择的市场的code,默认为"",全市场
            selectIndex: 0,//选择的市场的code,默认为"",全市场

            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],//表格数据
            // {conName:"高管买入次数",conCode:-1},
            //                 {conName:"高管卖出次数",conCode:-1}
            titles: [
                { conName: "高管买卖净额", conCode: -1 },
                { conName: "高管买入金额", conCode: -1 },
                { conName: "高管卖出金额", conCode: -1 },

            ],
            // haveMoreDatas:true, //判断是否还有更多数据，true有,false无
            allLoaded: false,//是否还有加载更多数据

            datasSort: 1,//交易日期排序，1默认倒序,2升序
        };
        this.getMarketListData = this.getMarketListData.bind(this);

        this.firstEnter = true;
        this.pageNo = 1;//页数
        this.pageSize = 20;//默认每次请求60条数据

        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(131);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        this.hearderHeight = 0;//给表格原生传入的header高度，防止滑动问题
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
        this.getMarketListData();

    }

    /**
     * 获取交易列表的数据
     * 每次请求60条
     * */
    getMarketListData() {

        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;
        if (this.state.selectCode !== "") {
            params.classic = this.state.selectCode;
        }

        //直接判断title中 index=7的交易日期 conCode值，判断升降序
        if (this.state.datasSort === 1) {
            params.desc = true;
        } else if (this.state.datasSort === 2) {
            params.desc = false;
        } else {
            params.desc = true;
        }

        if (this.pageNo === 1) {
            this.state.data[0].items = [];
        }

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.MARKET_CENCUS_LIST, params,
            (response) => {
                this.firstEnter = false;
                this._list.endLoading();
                //console.log("回调数据",response)
                if (response && response.list.length > 0) {
                    for (let i = 0; i < response.list.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        let titles = {};
                        titles.id = response.list[i].id;
                        titles.transMonth = response.list[i].transMonth;
                        //titles.secCode = response.list[i].secCode;
                        newItem.title = titles;

                        //数据项，一定要按照数据添加
                        let dataItem = [];
                        dataItem.push(response.list[i].netAmt != null ? response.list[i].netAmt : '--');
                        dataItem.push(response.list[i].buyAmt != null ? response.list[i].buyAmt : '--');
                        dataItem.push(response.list[i].sellAmt != null ? response.list[i].sellAmt : '--');
                        dataItem.push(response.list[i].buyTimes != null ? response.list[i].buyTimes : '--');
                        dataItem.push(response.list[i].sellTimes != null ? response.list[i].sellTimes : '--');

                        newItem.data = dataItem;
                        this.state.data[0].items.push(newItem);

                    }

                    //页数+1
                    this.pageNo += 1;
                    //记录数据的条数
                    //this.DATA_ITEM_LENGTH = this.state.data[0].items.length;

                    this.setState({
                        data: this.state.data,
                        allLoaded: response.list.length < this.pageSize ? true : false,
                    });
                } else {
                    this.setState({
                        data: this.state.data,
                        allLoaded: true,
                    });
                }
            },
            (error) => {
                this.firstEnter = false;
                this.state.data[0].items = [];
                this.setState({
                    data: this.state.data,
                    allLoaded: true,
                });

            })

    }

    render() {
        return (<StickyForm
            bounces={true}
            style={{ backgroundColor: "#f6f6f6", flex: 1 }}
            contentStyle={{ alignItems: "flex-start", width: "160%" }}
            data={this.state.data}
            scrollEnabled={true}
            ref={ref => (this._list = ref)}
            hearderHeight={this.hearderHeight}
            allLoaded={this.state.allLoaded}
            heightForSection={() => this.HEADER_HEGHT}
            renderHeader={this._renderunLockHeader}
            renderSection={this._renderSection}
            heightForIndexPath={() => this.ITEM_HEGHT}
            renderIndexPath={this._renderItem}
            renderEmpty={this.renderEmptys}
            showsHorizontalScrollIndicator={false}
            headerStickyEnabled={false}
            directionalLockEnabled={true}
            onEndReached={(info) => { }}
            onLoading={() => {
                this.getMarketListData();
            }}
            hotBlock={{ lock: "left", hotBlock: { x: 0, y: this.hearderHeight, width: 0, height: 0 } }}
            loadingFooter={mRiskTipsFooter}
            renderFooter={this._renderMyFooters}
            onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { }}
        />
        )
    }

    /**
     * 绘制空视图
     *
     * */
    renderEmptys = () => {
        if (this.firstEnter === true) {
            return (
                <View style={{ flex: 1 }} />
            )

        } else {
            return (
                <View style={{ height: this.HEADER_HEGHT + 400, flexDirection: "row" }}>
                    <View>
                        <TouchableOpacity activeOpacity={1} onPress={() => { this.sortViewPress(this.state.datasSort) }}
                            style={[styles.textTitle, { backgroundColor: "#f2faff", flexDirection: "row" }]}>
                            <Text style={styles.hinnerText}>交易月份</Text>
                            {this.getSortView(this.state.datasSort)}
                        </TouchableOpacity>
                        <View style={{ width: ScreenUtil.screenW, height: 400, backgroundColor: "#f6f6f6", alignItems: "center", justifyContent: "center" }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                                source={require('../../../images/TuyereDecision/no_stock_data.png')} />
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",
                                marginTop: ScreenUtil.scaleSizeW(100)
                            }}>暂无股票入选</Text>
                        </View>
                    </View>
                    <View style={{
                        height: this.HEADER_HEGHT, position: "absolute", flexDirection: "row",
                        top: 0, left: ScreenUtil.scaleSizeW(180), width: ScreenUtil.screenW * 1.6 - ScreenUtil.scaleSizeW(180)
                    }}>
                        {this.state.titles.map((title, index) =>
                            <View style={index === 0 ? styles.headerTextFix : styles.headerText} key={index}>
                                <Text style={styles.hinnerText}>
                                    {title.conName}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            );
        }
    };

    /**
     * 加载可滑动列表的头布局
     * */
    _renderunLockHeader = () => {
        return (
            <View style={{ alignSelf: "stretch" }}>
                <View style={{ height: ScreenUtil.scaleSizeW(90), width: ScreenUtil.screenW, justifyContent: "center", alignItems: "center", paddingHorizontal: ScreenUtil.scaleSizeW(30) }}
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
                    <FlowLayout tagDatas={this.state.flowDatas} activeIndex={this.state.selectIndex} indexCallBack={(tagName, index) => { this.upDatasMarket(tagName, index) }} />

                </View>
            </View>)
    };
    /**
     * 选择市场刷新数据
     *   optionDropdown :['沪市', '深市','创业板','中小板'],//高管交易榜最新交易市场名称
        optionDropdownCode:[212001,212100,216003,216002],//高管交易榜最新交易市场Code
     * */
    upDatasMarket(tagName, index) {
        switch (tagName) {
            case "全市场":
                this.state.selectCode = "all";
                sensorsDataClickObject.addOnClick.page_source = '高管交易榜-市场统计'
                sensorsDataClickObject.addOnClick.content_name = '全市场'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)
                break;
            case "沪市":
                this.state.selectCode = "212001";
                sensorsDataClickObject.addOnClick.page_source = '高管交易榜-市场统计'
                sensorsDataClickObject.addOnClick.content_name = '沪深'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)
                break;
            case "深市":
                this.state.selectCode = "212100";
                sensorsDataClickObject.addOnClick.page_source = '高管交易榜-市场统计'
                sensorsDataClickObject.addOnClick.content_name = '深市'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)

                break;
            case "中小板":
                this.state.selectCode = "216002";
                sensorsDataClickObject.addOnClick.page_source = '高管交易榜-市场统计'
                sensorsDataClickObject.addOnClick.content_name = '中小板'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)
                break;
            case "创业板":
                this.state.selectCode = "216003";
                sensorsDataClickObject.addOnClick.page_source = '高管交易榜-市场统计'
                sensorsDataClickObject.addOnClick.content_name = '创业板'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)
                break;
            case "科创板":
                this.state.selectCode = "216011";
                sensorsDataClickObject.addOnClick.page_source = '高管交易榜-市场统计'
                sensorsDataClickObject.addOnClick.content_name = '科创板'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)
                break;
            default:
                this.state.selectCode = "";
                break;
        }
        this.pageNo = 1;
        this.setState({ selectCode: this.state.selectCode, selectIndex: index }, () => this.getMarketListData());

    }
    /**
     * SectionTitle
     * {conName:"变动人",conCode:-1}
     * */
    _renderSection = (section: number) => {
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row" }}>
                <View>
                    <TouchableOpacity activeOpacity={1} onPress={() => { this.sortViewPress(this.state.datasSort) }}
                        style={[styles.textTitle, { backgroundColor: "#f2faff", flexDirection: "row" }]}>
                        <Text style={styles.hinnerText}>交易月份</Text>
                        {this.getSortView(this.state.datasSort)}
                    </TouchableOpacity>
                </View>
                {this.state.titles.map((title, index) =>
                    <View style={index === 0 ? styles.headerTextFix : styles.headerText} key={index}>
                        <Text style={styles.hinnerText}>
                            {title.conName}
                        </Text>
                    </View>
                )}
            </View>
        );
    };
    /**
     * 顶部view的点击事件
     * */
    sortViewPress(conCode) {
        this._list && this._list.scrollTo({ x: 0, y: 0}, true).then(()=>{
            this.setState({
                datasSort: conCode === 1 ? 2 : 1,
            }, () => {
                this.pageNo = 1;
                this.getMarketListData();
            });
        })
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
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        if(item===undefined ){
            return <View><View></View></View>;
        }
        return (
            <View style={styles.row}>
                <View style={styles.titleText}>
                    <View style={{
                        width: ScreenUtil.scaleSizeW(125), borderRadius: ScreenUtil.scaleSizeW(10), height: ScreenUtil.scaleSizeW(90)
                        , backgroundColor: "#f5faff", justifyContent: "center", paddingLeft: ScreenUtil.scaleSizeW(20)
                    }}>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(26), color: "#003366" }}>{item.title.transMonth && item.title.transMonth !== '--' ? item.title.transMonth.substring(0, 4) : "--"}</Text>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(28), color: "#6282a3" }}>{item.title.transMonth && item.title.transMonth !== '--' ? item.title.transMonth.substring(5, 10) + "月" : "--"}</Text>
                    </View>
                </View>
                <View style={[styles.text, { width: ScreenUtil.scaleSizeW(250) }]} >
                    <StockFormatText precision={2} unit={'元/万/亿'} useDefault={true} style={[styles.contentText, { color: this.getColor(item.data[0]) }]}>{item.data[0]}</StockFormatText>
                </View>
                <View style={[styles.text, { flex: 1 }]} >
                    <View style={{
                        height: ScreenUtil.scaleSizeW(90), paddingRight: ScreenUtil.scaleSizeW(2), backgroundColor: "#fff5f5", borderRadius: ScreenUtil.scaleSizeW(10)
                        , flexDirection: "row", justifyContent: "center", alignItems: "center"
                    }}>
                        <View style={{ height: ScreenUtil.scaleSizeW(90), paddingHorizontal: ScreenUtil.scaleSizeW(10), alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }}>{item.data[3]}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(22), color: "rgba(0,0,0,0.4)" }}>买入次数</Text>
                        </View>
                        <View style={{ height: ScreenUtil.scaleSizeW(90), width: ScreenUtil.scaleSizeW(1), backgroundColor: "#f1f1f1" }} />
                        <StockFormatText precision={2} unit={'元/万/亿'} useDefault={true} style={[styles.contentText, { color: this.getColor(item.data[1]), marginHorizontal: ScreenUtil.scaleSizeW(18) }]}>{item.data[1]}</StockFormatText>
                    </View>
                </View>
                <View style={[styles.text, { flex: 1 }]} >
                    <View style={{
                        height: ScreenUtil.scaleSizeW(90), paddingRight: ScreenUtil.scaleSizeW(2), backgroundColor: "#f7fcf5", borderRadius: ScreenUtil.scaleSizeW(10)
                        , flexDirection: "row", justifyContent: "center", alignItems: "center"
                    }}>
                        <View style={{ height: ScreenUtil.scaleSizeW(90), paddingHorizontal: ScreenUtil.scaleSizeW(10), alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }}>{item.data[4]}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(22), color: "rgba(0,0,0,0.4)" }}>卖出次数</Text>
                        </View>
                        <View style={{ height: ScreenUtil.scaleSizeW(90), width: ScreenUtil.scaleSizeW(1), backgroundColor: "#f1f1f1" }} />

                        <StockFormatText precision={2} unit={'元/万/亿'} useDefault={true} style={[styles.contentText, { color: this.getColor(item.data[2]), marginHorizontal: ScreenUtil.scaleSizeW(18) }]}>{item.data[2]}</StockFormatText>
                    </View>
                </View>

            </View>
        );
    };
    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        if((this.state.data && this.state.data[0].items.length === 0 )|| this.state.allLoaded === false){
            return <View><View></View></View>;
        }else {
            return(
                <View>
                    <View style={{ width: ScreenUtil.screenW, paddingVertical:ScreenUtil.scaleSizeW(30),paddingHorizontal:ScreenUtil.scaleSizeW(20), backgroundColor: "#f1f1f1", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{fontSize: ScreenUtil.setSpText(28), color:"rgba(0,0,0,0.2)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0,textAlign:"center"}}
                        >温馨提示：信息内容仅供参考,不构成操作决策依据，股市有风险，投资需谨慎。</Text>
                    </View>
                </View>
            )
        }
    }

    /**
     * 根据大小返回颜色
     *
     * */
    getColor(number) {
        let colors = "";
        if (number != "") {
            if (number > 0) {
                colors = "#fa5033";
            } else if (number < 0) {
                colors = "#5cac33";
            } else {
                colors = "#999999";
            }
        } else {
            colors = "#000";
        }
        return colors;
    }


    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


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
        justifyContent: "center",
        alignItems: "center"
    },
    hinnerText: {
        fontSize: ScreenUtil.setSpText(24),
        color: "#626567"
    },
    titleText: {
        justifyContent: "center",
        alignItems: "center",
        // paddingLeft:ScreenUtil.scaleSizeW(20),
        backgroundColor: "#fff",
        width: ScreenUtil.scaleSizeW(180),
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
        justifyContent: "center"
        //paddingLeft:ScreenUtil.scaleSizeW(30)
    },
    headerTextFix: {
        width: ScreenUtil.scaleSizeW(250),
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
        justifyContent: "center"
    },
    row: {
        flex: 1,
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor: "#fff"
    },
    contentText: {
        fontSize: ScreenUtil.setSpText(32),
        color: "#333333",
        width: ScreenUtil.scaleSizeW(180),
        textAlign: "center"
    },
    textTitle: {
        justifyContent: "center",
        alignItems: "center",
        //paddingLeft:ScreenUtil.scaleSizeW(20),
        height: 35,
        width: ScreenUtil.scaleSizeW(180)
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
});
