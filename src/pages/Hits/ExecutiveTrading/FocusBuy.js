/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description:高管交易tab，集中买入
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
    InteractionManager, StyleSheet, ScrollView, Alert
} from 'react-native';

import WebChart from '../../../components/WebChart';
import * as ScreenUtil from '../../../utils/ScreenUtil';
//import { StickyForm } from "react-native-largelist-v3";
import NorMalOneText from '../../../components/NorMalOneText';
import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import AsyncStorage from '@react-native-community/async-storage';
import { LargeList } from "react-native-largelist-v3";
import ChangeDetails from "./ChangeDetails";
//import {mNormalFooter} from "../../../components/mNormalFooter";
import StockFormatText from '../../../components/StockFormatText';

import { mRiskTipsFooter } from "../../../components/mRiskTipsFooter";
import RiskTipsFooterView from "../../../components/RiskTipsFooterView";

export default class FocusBuy extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            dataDiscount: null, //表格需要的数据
            datasLineAll: null,//图标回来的所有数据

            saleDetailIndex: 0,//高管交易明细的Index,默认展示第一个
            detailsList: [],//高管交易明细的数据

            showEchart: false,

            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],//表格数据
            titles: [
                { conName: "股票名称", conCode: -1 },
                { conName: "高管买入人数", conCode: 1 },
                { conName: "最新增持日期", conCode: -1 },
            ],
            //haveMoreDatas:true, //判断是否还有更多数据，true有,false无
            allLoaded: false,

        };
        this.pageNo = 1;//页数
        this.pageSize = 20;//默认每次请求60条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(251);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        this.lineIsupdate = false//设置一个值，用来防止图标点击时多次请求

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
        this.getFoucusBuyLine();
        this.getFocusBugListData();
    }
    /**
     * 获取近60持续买入人数图标数据
     * */
    getFoucusBuyLine() {

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.FOCUS_BUY_LINE, {},
            (response) => {
                if (response && response.length > 0) {
                    let datas = [];
                    for (let i = 0; i < response.length; i++) {
                        let items = {};
                        items.name = response[i].secName;
                        items.value = response[i].buyers;
                        datas.push(items);
                    }
                    this.setState({
                        dataDiscount: datas,
                        datasLineAll: response,
                    }, () => {
                        this.getSaleDetail(response[0].secCode)
                    });

                } else {
                    this.setState({ dataDiscount: [{ name: "", value: 0 }], datasLineAll: [] });
                }
            },
            (error) => {

            })
    }
    /**
     * 获取交易列表的数据
     * 每次请求60条
     * */
    getFocusBugListData() {

        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;
        //直接判断title中 index=7的交易日期 conCode值，判断升降序
        if (this.state.titles[1].conCode === 1) {
            params.desc = true;
        } else if (this.state.titles[1].conCode === 2) {
            params.desc = false;
        } else {
            params.desc = true;
        }

        if (this.pageNo === 1) {
            this.state.data[0].items = [];
        }
        //开始请求
        this.lineIsupdate = true;
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.FOCUS_BUY_TABLEDATAS, params,
            (response) => {
                this._list.endLoading();
                //console.log("请求集中",response)
                if (response && response.list.length > 0) {
                    for (let i = 0; i < response.list.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        //let titles = {};
                        newItem.id = response.list[i].id;
                        newItem.secName = response.list[i].secName;
                        newItem.secCode = response.list[i].market + "" + response.list[i].secCode;
                        //newItem.title=titles;
                        newItem.buyers = response.list[i].buyers ? response.list[i].buyers : '--';
                        newItem.transNetAmt = response.list[i].transNetAmt != null ? response.list[i].transNetAmt : '--';
                        newItem.avgPrice = response.list[i].avgPrice != null ? response.list[i].avgPrice : '--';
                        newItem.chgDate = response.list[i].chgDate ? response.list[i].chgDate.substring(0, 10) : '--';

                        this.state.data[0].items.push(newItem);

                    }

                    //页数+1
                    this.pageNo += 1;

                    this.setState({
                        data: this.state.data,
                        allLoaded: response.list.length < this.pageSize ? true : false,
                        //allLoaded:true,
                    }, () => {
                        //开始请求
                        this.lineIsupdate = false;
                    });
                } else {
                    this.setState({
                        data: this.state.data,
                        allLoaded: true,
                    }, () => {
                        //开始请求
                        this.lineIsupdate = false;
                    });
                }
            },
            (error) => {

                this.setState({
                    data: this.state.data,
                    allLoaded: true,
                }, () => {
                    //开始请求
                    this.lineIsupdate = false;
                });

            })

    }

    /**
     * 请求高管交易明细
     * */
    getSaleDetail(secCode) {
        if (secCode && secCode !== "") {
            let params = {};
            params.seccode = secCode;
            this.state.detailsList = [];
            RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.FOCUS_BUY_DETAILS, params,
                (response) => {
                    if (response && response.length > 0) {
                        for (let i = 0; i < (response.length <= 3 ? response.length : 3); i++) {
                            this.state.detailsList.push(response[i])
                        }
                        this.setState({
                            detailsList: this.state.detailsList,
                            showEchart: true
                        });

                    } else {
                        this.setState({ detailsList: [] });
                    }
                },
                (error) => {

                })
        }
    }
    /**
     * 图表回调的方法
     * */
    alertMessage = (message) => {

        console.log("图标回调", message)
        if (message.type === 'select') {
            if (this.state.saleDetailIndex !== message.payload.index) {
                this.state.saleDetailIndex = message.payload.index;
                //开始请求
                if (this.lineIsupdate === false) {
                    //console.log("去请求")
                    //有图标后再去请求单条详细的数据
                    this.getSaleDetail(this.state.datasLineAll[this.state.saleDetailIndex].secCode)
                }

            }

        }
    };

    render() {
        return (
            <LargeList
                bounces={true}
                style={{ backgroundColor: "#f6f6f6", flex: 1 }}
                //contentStyle={{alignItems: "flex-start", width: "100%" }}
                data={this.state.data}
                scrollEnabled={true}
                ref={ref => (this._list = ref)}
                heightForSection={() => this.HEADER_HEGHT}
                renderHeader={this._renderunLockHeader}
                renderSection={this._renderSection}
                heightForIndexPath={() => this.ITEM_HEGHT}
                renderIndexPath={this._renderItem}
                showsHorizontalScrollIndicator={false}
                headerStickyEnabled={false}
                directionalLockEnabled={true}
                loadingFooter={mRiskTipsFooter}
                renderFooter={this._renderMyFooters}
                onLoading={() => { this.getFocusBugListData(); }}
                allLoaded={this.state.allLoaded}
                onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { }}
            />
        )
    }

    /**
     * SectionTitle
     * {conName:"变动人",conCode:-1}
     * */
    _renderSection = (section: number) => {
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row", backgroundColor: "#f2faff", paddingHorizontal: ScreenUtil.scaleSizeW(30) }}>
                {this.state.titles.map((title, index) =>
                    <TouchableOpacity key={index} activeOpacity={1} onPress={() => { this.sortViewPress(index, title.conCode) }}
                        style={[styles.headerText, { justifyContent: index === 0 ? "flex-start" : (index === 1 ? "center" : "flex-end") }]} key={index}>
                        <Text style={styles.hinnerText} >
                            {title.conName}
                        </Text>
                        {this.getSortView(title.conCode)}
                    </TouchableOpacity>
                )}
            </View>
        );
    };
    /**
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        if (item === undefined) {
            return <View><View></View></View>;
        }
        let monColor;
        if (item.transNetAmt !== '') {
            if (item.transNetAmt > 0) {
                monColor = "#fa5033"
            } else if (item.transNetAmt === 0) {
                monColor = "rgba(0,0,0,0.4)"
            } else {
                monColor = "#5cac33"
            }
        } else {
            monColor = "rgba(0,0,0,0.4)"
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                let data = {};
                data.Obj = item.secCode;
                data.ZhongWenJianCheng = item.secName;
                data.obj = item.secCode;
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: [],
                    index: 0,
                })
            }} style={styles.row}>
                <View style={{
                    width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), height: ScreenUtil.scaleSizeW(110),
                    marginLeft: ScreenUtil.scaleSizeW(30), flexDirection: "row", paddingTop: ScreenUtil.scaleSizeW(10)
                }}>
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(90), flexDirection: "row", justifyContent: "flex-start" }}>
                        <View style={{ height: ScreenUtil.scaleSizeW(90), justifyContent: "center" }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000" }}>{item.secName}</Text>
                            <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#666666" }}>{item.secCode}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(90), flexDirection: "row", justifyContent: "center" }}>
                        <View style={{ width: ScreenUtil.scaleSizeW(120), borderRadius: ScreenUtil.scaleSizeW(10), backgroundColor: "#fcf5ff", height: ScreenUtil.scaleSizeW(90), justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(40), color: "rgba(0,0,0,0.6)" }}>{item.buyers}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(90), flexDirection: "row", justifyContent: "flex-end" }}>
                        <View style={{
                            width: ScreenUtil.scaleSizeW(125), borderRadius: ScreenUtil.scaleSizeW(10), height: ScreenUtil.scaleSizeW(90)
                            , backgroundColor: "#f5faff", justifyContent: "center", paddingLeft: ScreenUtil.scaleSizeW(10)
                        }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(26), color: "#003366" }}>{item.chgDate && item.chgDate !== '--' ? item.chgDate.substring(0, 4) : "--"}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#6282a3" }}>{item.chgDate && item.chgDate !== '--' ? item.chgDate.substring(5, 10) : "--"}</Text>
                        </View>
                    </View>
                </View>
                <View style={{
                    width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), height: ScreenUtil.scaleSizeW(120), marginLeft: ScreenUtil.scaleSizeW(30), flexDirection: "row", justifyContent: "center", alignItems: "center"
                    , marginBottom: ScreenUtil.scaleSizeW(20), borderRadius: ScreenUtil.scaleSizeW(10), backgroundColor: "#f5faff"
                }}>
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(120), justifyContent: "center", alignItems: "center" }}>
                        <StockFormatText precision={2} unit={'元/万/亿'} useDefault={true} style={{ fontSize: ScreenUtil.setSpText(40), color: monColor }}>{item.transNetAmt}</StockFormatText>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.6)" }}>高管买入金额</Text>
                    </View>
                    <View style={{ width: ScreenUtil.scaleSizeW(1), height: ScreenUtil.scaleSizeW(120), backgroundColor: "#f1f1f1" }} />
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(120), justifyContent: "center", alignItems: "center" }}>
                        <StockFormatText precision={2} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(40), color: "rgba(0,0,0,0.8)" }}>{item.avgPrice}</StockFormatText>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.6)" }}>买入均价</Text>
                    </View>
                </View>
            </TouchableOpacity>
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
                    this.pageNo = 1;
                    this.getFocusBugListData();
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
 * 加载可滑动列表的头布局
 * */
    _renderunLockHeader = () => {

        let rateOfMax = 0;
        if (this.state.dataDiscount) {
            //柱状图的纵轴配置
            let rateOfValues = [];
            this.state.dataDiscount.forEach(element => {
                rateOfValues.push(element.value);
            });
            rateOfValues.sort(function (a, b) { return a - b; });
            rateOfMax = rateOfValues[rateOfValues.length - 1];
        }
        return (
            <View style={{ height: ScreenUtil.scaleSizeW(790), alignSelf: "stretch" }}>
                <View style={{ width: ScreenUtil.screenW, justifyContent: "center", alignItems: "center", }}>
                    <View style={styles.intervalLine} />
                    <WebChart
                        style={styles.chart}
                        option={{
                            dataset: {
                                dimensions: ['name', 'value'],
                                source: this.state.dataDiscount || [{ name: null, value: 0 }],
                            },
                            backgroundColor: '#fff',
                            title: {
                                text: "近60日高管买入人数前5个股",
                                left: 10,
                                top: 5
                            },
                            grid: {
                                top: 55,
                                left: 25,
                                right: 20,
                                bottom: 20
                            },
                            tooltip: {
                                trigger: "item",
                                position: "inside",
                                show: false,
                                formatter: function (a) {
                                    let num = a.data.value;
                                    return "买入人数<br/>" + num + "人";
                                },
                                // extraCssText:'width:70px; white-space:pre-wrap'
                            },
                            xAxis: {
                                type: 'category',
                                // data: ['卫士通', '大连圣亚', '久立特材', '博信股份', '招商银行'],
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: {
                                name: '人',
                                type: 'value',
                                max: rateOfMax,
                                interval: rateOfMax, // y轴显示三个刻度值，即 0、中间值、最大值
                                axisTick: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                },
                            },

                            series: [{
                                //data: [2, 8, 7, 4, 6],
                                type: 'bar',
                                barWidth: 35,
                                name: "买入人数",
                                itemStyle: {
                                    color: "#3399ff",
                                },
                                // emphasis:{
                                //     itemStyle:{
                                //         //color:"#ff9a34",
                                //         borderWidth:2,
                                //         borderColor:"#ff9a34"
                                //     }
                                // }
                            }],
                        }
                        }
                        exScript={`
                    chart.on('mouseup', (params) => {
                  if(params.componentType === 'series') {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'select',
                      payload: {
                        index: params.dataIndex,
                      },
                    }));
                  }
                   });
                              chart.on('click', (params) => {
                                if(params.componentType === 'series') {
                                  window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'select',
                                    payload: {
                                      index: params.dataIndex,
                                    },
                                  }));
                                }
                              });
                            `}
                        onMessage={this.alertMessage}
                    />


                    <View style={styles.outView}>
                        <View style={styles.outViewthree}>
                            <Image style={[styles.triangleImage, { marginLeft: ScreenUtil.scaleSizeW(60) + this.state.saleDetailIndex * (Platform.OS === 'android' ? ScreenUtil.scaleSizeW(134) : ScreenUtil.scaleSizeW(133)) }]} source={require('../../../images/hits/up_triangle.png')} />
                        </View>

                        <View style={styles.itemAllView}>
                            <View style={styles.itemTitleView}>
                                <Text style={{ fontSize: 14, color: "#000", marginLeft: ScreenUtil.scaleSizeW(22) }}>{
                                    this.state.datasLineAll && this.state.datasLineAll.length > 0 ? this.state.datasLineAll[this.state.saleDetailIndex].secName : "--"}</Text>
                                <View style={{ flex: 1 }} />
                                <TouchableOpacity onPress={() => {
                                    Navigation.navigateForParams(this.props.navigation, "ChangeDetails",
                                        {
                                            keyWord: this.state.datasLineAll[this.state.saleDetailIndex].secName,
                                            keyWordCode: this.state.datasLineAll[this.state.saleDetailIndex].secCode
                                        })
                                }} style={{ justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#0099FF" }}>更多</Text>
                                    <Image style={{ width: ScreenUtil.scaleSizeW(30), height: ScreenUtil.scaleSizeW(20), marginRight: ScreenUtil.scaleSizeW(24), resizeMode: "contain" }}
                                        source={require('../../../images/hits/more.png')} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.itemShowView}>
                                <Text style={{ width: ScreenUtil.scaleSizeW(170), fontSize: ScreenUtil.setSpText(24), color: "#3d3d3d", marginLeft: ScreenUtil.scaleSizeW(22) }} >变动人</Text>
                                <Text style={{ width: ScreenUtil.scaleSizeW(170), fontSize: ScreenUtil.setSpText(24), color: "#3d3d3d" }}>成交价格</Text>
                                <Text style={{ flex: 1, fontSize: ScreenUtil.setSpText(24), color: "#3d3d3d" }}>买入数量</Text>
                                <Text style={{ width: ScreenUtil.scaleSizeW(100), textAlign: 'right', fontSize: ScreenUtil.setSpText(24), color: "#3d3d3d", marginRight: ScreenUtil.scaleSizeW(24) }}>交易日</Text>
                            </View>
                            {this.state.detailsList && this.state.detailsList.length > 0 ?
                                this.state.detailsList.map((tab, i) => this.getUpFormViewItem(tab, i)) : null}
                        </View>
                    </View>
                    <View style={styles.intervalLine} />

                    <NorMalOneText textContent={"最近60个交易日"} />
                </View>

            </View>)
    }

    /**
     * 脚布局
     * */
    _renderMyFooters = () => {
        if ((this.state.data && this.state.data[0].items.length === 0) || this.state.allLoaded === false) {
            return <View><View></View></View>;
        } else {
            return (
                <View>
                    <RiskTipsFooterView type={0} />
                </View>
            )
        }
    }

    // {this.getUpFormView}
    /**
     *
     * 获取表格下面视图的View
     * */
    getUpFormViewItem(tab, index) {
        return (
            <View key={index} style={styles.itemTableView}>
                <Text style={{ width: ScreenUtil.scaleSizeW(170), fontSize: ScreenUtil.setSpText(28), color: "#3d3d3d", marginLeft: ScreenUtil.scaleSizeW(22) }} numberOfLines={1} >{tab.changer}</Text>
                <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{ width: ScreenUtil.scaleSizeW(170), fontSize: ScreenUtil.setSpText(28), color: "#3d3d3d" }}>{tab.transPrice}</StockFormatText>
                <StockFormatText precision={2} unit={'股/万股/亿股'} useDefault={true} style={{ flex: 1, fontSize: ScreenUtil.setSpText(28), color: "#3d3d3d" }}>{tab.shareBuyNet}</StockFormatText>
                <Text style={{ fontSize: ScreenUtil.setSpText(28), width: ScreenUtil.scaleSizeW(100), color: "#3d3d3d", textAlign: "right", marginRight: ScreenUtil.scaleSizeW(24) }}>{tab.chgDate && tab.chgDate.length > 10 ? tab.chgDate.substring(5, 10) : ""}</Text>
            </View>);
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
    chart: {
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(350),
    },
    outView: {
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(340),
        backgroundColor: "white",
        paddingHorizontal: ScreenUtil.scaleSizeW(30),
        paddingBottom: ScreenUtil.scaleSizeW(20)
    },
    outViewthree: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60),
        height: ScreenUtil.scaleSizeW(20)
    },
    triangleImage: {
        width: ScreenUtil.scaleSizeW(30),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "stretch"
    },
    textTitle: {

        justifyContent: "center",
        width: ScreenUtil.scaleSizeW(180),
        paddingLeft: ScreenUtil.scaleSizeW(20)
    },
    itemTitleView: {
        flex: 1,
        height: ScreenUtil.scaleSizeW(60),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    itemAllView: {
        flex: 1,
        borderRadius: ScreenUtil.scaleSizeW(10),
        height: ScreenUtil.scaleSizeW(300),
        backgroundColor: "#eaf5ff",
    },
    itemShowView: {
        flex: 1,
        height: ScreenUtil.scaleSizeW(60),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#d2ecff"
    },
    itemTableView: {
        flex: 1,
        height: ScreenUtil.scaleSizeW(60),
        flexDirection: "row",
        alignItems: "center", justifyContent: "center"
    },
    //表格需要的样式
    textFix: {
        width: ScreenUtil.scaleSizeW(270),
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(30),
    },
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(30),
    },
    hinnerText: {
        fontSize: ScreenUtil.setSpText(24),
        color: "#626567"
    },
    titleText: {
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        backgroundColor: "#fff",
        width: ScreenUtil.scaleSizeW(180),
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
    },
    row: {
        flex: 1,
        width: ScreenUtil.screenW,
        borderWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor: "#fff"
    },
    contentText: {
        fontSize: ScreenUtil.setSpText(28),
        color: "#333333",
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
});
