/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/6 17
 * description:研报策略tab页面
 */
import React, { Component } from 'react';
import { ActivityIndicator, Image, PixelRatio, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StickyForm } from "react-native-largelist-v3";
import LinearGradient from 'react-native-linear-gradient';
import RequestInterface from "../../actions/RequestInterface";
import ExpandableText from "../../components/ExpandableText";
import FlowLayoutSpecial from "../../components/FlowLayoutSpecial";
import { mNormalHeader } from "../../components/mNormalHeader";
import StockFormatText from '../../components/StockFormatText';
import * as CommonUtils from "../../utils/CommonUtils";
import * as ScreenUtil from '../../utils/ScreenUtil';
import Yd_cloud from "../../wilddog/Yd_cloud";
import HitsApi from "../Hits/Api/HitsApi";
import ShareSetting from '../../modules/ShareSetting';
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";
import {mRiskTipsFooter} from "../../components/mRiskTipsFooter";

let refHXG = Yd_cloud().ref(MainPathYG);
//部分源达云节点修改为MainPathYG2
let refHXG2 = Yd_cloud().ref(MainPathYG2);
export default class ResearchStrategy extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            flowDatas: ["明星分析师推荐", "明星机构推荐", "涨幅空间大"],
            growthSchool: [],//研报策略页面成长学堂
            keyWord: "研报策略",
            dataStar: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            dataHouse: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            dataBrst: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            //明星推荐师
            titlesStar: [
                { conName: "明星分析师推荐", conCode: -1 },
                { conName: "行业关注度", conCode: -1 },
                { conName: "个股关注度", conCode: -1 },
                // {conName:"买入评级",conCode:-1},
                // {conName:"增持评级",conCode:-1}
                { conName: "看多评级", conCode: -1 }
            ],
            //明星机构
            titleStartHouse: [
                { conName: "明星机构推荐", conCode: -1 },
                { conName: "行业关注度", conCode: -1 },
                { conName: "个股关注度", conCode: -1 },
                { conName: "买入评级", conCode: -1 },
                { conName: "增持评级", conCode: -1 }
            ],
            //涨幅空间
            titleBrst: [
                { conName: "标题", conCode: -1 },
                { conName: "相关股票", conCode: 1 },
                { conName: "目标涨幅%", conCode: -1 },
                { conName: "目标价(元)", conCode: -1 },
                { conName: "发布日收盘价(元)", conCode: -1 },
                { conName: "发布机构", conCode: -1 },

            ], //炸版Title
            haveMoreDatas: true, //判断是否还有更多数据，true有,false无,
            detailDescribe: "",
            newDateTime: "",
            selectTab: 0,//研报策略入选股票
            //allContent: 0,//记录所有的符合股票的数量

            // {conName:"日期",conCode:-1},
        };
        this.firstEnter = true;
        this.RequestNumber = 0;//记录一个值，记录请求次数
        this.scrollY = 0;

        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(100);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        //this.FOOTTER_HEIGHT = 50;
        this.hearderHeight = 0;
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
        this.getResearchIntro();
        this.getSchoolDatas();
        this.getResearchListData();
        // this.getHouseListData();
        // this.getBurstDatas();
        //设置页面定时器
        this._createTimer();
        this._addListeners();
    }
    _addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                //页面中可能有定时器了,所以先删除再创建
                this._removeTimer();
                this._createTimer();
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this._removeTimer();
            }
        );
    }
    _createTimer() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                //当前页面每5分钟强制刷新一次;
                //this.state.allContent = 0;
                this.state.flowDatas = ["明星分析师推荐", "明星机构推荐", "涨幅空间大"];
                this.RequestNumber = 0;
                this.getResearchIntro();
                this.getSchoolDatas();

                this.getResearchListData();
                // this.getHouseListData();
                // this.getBurstDatas();

            }, 1000 * 5 * 60);
        }
    }
    _removeTimer() {
        this.timer && clearInterval(this.timer);
        this.timer = undefined;
    }

    /**
     *
     * 获取成长学堂的数据
     * */
    getSchoolDatas() {
        let growthSchool = refHXG.ref('ChengZhangXueTang/' + this.state.keyWord);
        growthSchool.orderByKey().limitToLast(2).get((response) => {
            //console.log("请求血糖")
            //console.log(response)
            if (response.code == 0) {
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);

                for (let i = 0; i < key.length; i++) {
                    let newItem = {};
                    newItem.nodeName = "ChengZhangXueTang";//根节点名称
                    newItem.taoxiName = this.state.keyWord;//套系名称
                    newItem.key = key[i];
                    newItem.content = item[i];
                    item[i] = newItem;
                }
                item.reverse();
                this.setState({
                    growthSchool: item
                })

            }
        })
    }
    /**
     * 获取研报策略的介绍
     * CeLueJieShao后面的参数固定为1
     *
     * 标识：1研报策略,2高成长,3低估值,4高分红,5高盈利,6现金牛,7股东增持,8高运营,9白马绩优,10资金揭秘,
     * 11热点风口-热点之底部一买战法,12热点风口-热点之底部二买战法，13热点风口-热点之主升浪选股，
     * 14主题投资-热点之底部一买战法，15主题投资-热点之底部二买战法，16主题投资-主题之主升浪选股
     * */
    getResearchIntro() {
        let growthSchool = refHXG2.ref('CeLueJieShao/1');
        growthSchool.orderByKey().limitToLast(1).get((response) => {
            if (response.code == 0) {
                if (response.nodeContent) {
                    this.setState({
                        detailDescribe: response.nodeContent + ""
                        //  detailDescribe:"价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性," +
                        //  "价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性," +
                        //  "价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性," +
                        //  "价格波动具备一定的延续性，通过一段时间的的价格波动，来实现股票的低买高卖的价格差，实现资金账户的盈利。价格波动具备一定的延续性"
                    })
                } else {
                    this.setState({
                        detailDescribe: "暂未添加策略原理介绍"
                    })
                }
            } else {
                this.setState({
                    detailDescribe: "暂未添加策略原理介绍"
                })
            }
        })
    }

    /**
     * 获取明星推荐师表格数据
     * */
    getResearchListData(callBack) {
        this.state.dataStar[0].items = [];
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, HitsApi.START_RESEARCH_LIST, {},
            (response) => {
                this.RequestNumber += 1;
                if (response && response.list.length > 0) {
                    for (let i = 0; i < response.list.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        let titles = {};
                        titles.id = response.list[i].id;
                        titles.secName = response.list[i].secName;
                        titles.marketCode = response.list[i].marketCode;
                        newItem.title = titles;

                        //数据项，一定要按照数据添加
                        let dataItem = [];
                        //分析师截取前三个
                        if (response.list[i].starAnalysts && response.list[i].starAnalysts != "") {
                            let str = response.list[i].starAnalysts.split(",");
                            let newStr = "";
                            for (let i = 0; i < (str.length > 3 ? 3 : str.length); i++) {
                                newStr += str[i] + ","
                            }

                            newStr = newStr.substring(0, newStr.length - 1);
                            dataItem.push(newStr);
                        } else {
                            dataItem.push('--');
                        }

                        dataItem.push(response.list[i].industryAttention ? response.list[i].industryAttention : '--');
                        dataItem.push(response.list[i].stockConcern ? response.list[i].stockConcern : '--');
                        dataItem.push(response.list[i].watchTime != 0 ? response.list[i].watchTime : '--');

                        newItem.data = dataItem;
                        this.state.dataStar[0].items.push(newItem);

                    }
                    //this.state.dataStar[0].items = [];
                    if (this.state.selectTab === 0) {
                        this.state.flowDatas[0] = this.state.flowDatas[0] + "(" + response.list.length + "只)";
                    }
                    //this.state.allContent += response.list.length;
                    //console.log("特色指标选股",this.RequestNumber)
                    if (this.RequestNumber === 3) {
                        this.setState({
                            dataStar: this.state.dataStar,
                            haveMoreDatas: true,
                            flowDatas: this.state.flowDatas,
                            //allContent: this.state.allContent
                        }, () => {
                            this.getHouseListData(() => {
                                if (callBack) {
                                    callBack();
                                }
                            });
                        });
                    } else {
                        this.setState({
                            dataStar: this.state.dataStar,
                            haveMoreDatas: true,
                            flowDatas: this.state.flowDatas,
                        }, () => {
                            this.getHouseListData(() => {
                                if (callBack) {
                                    callBack();
                                }
                            });
                        });
                    }

                } else {
                    //console.log("呵呵呵刷新前")
                    //console.log(this.state.dataStar);
                    let newItem = {};
                    //储存第一列需要的数据
                    let titles = {};
                    titles.id = "11";
                    titles.secName = "";
                    titles.marketCode = "";
                    newItem.title = titles;

                    //数据项，一定要按照数据添加
                    let dataItem = [];
                    dataItem.push(' ');
                    dataItem.push(' ');
                    dataItem.push(' ');
                    dataItem.push(' ');
                    dataItem.push(' ');

                    newItem.data = dataItem;
                    this.state.dataStar[0].items.push(newItem);

                    this.setState({
                        dataStar: this.state.dataStar,
                        haveMoreDatas: true,
                    }, () => {
                        this.state.dataStar[0].items = [];
                        this.setState({
                            dataStar: this.state.dataStar,
                            haveMoreDatas: true,
                        });
                        this.getHouseListData(() => {
                            if (callBack) {
                                callBack();
                            }
                        });
                    });
                }
            },
            (error) => {
                let newItem = {};
                //储存第一列需要的数据
                let titles = {};
                titles.id = "11";
                titles.secName = "";
                titles.marketCode = "";
                newItem.title = titles;

                //数据项，一定要按照数据添加
                let dataItem = [];
                dataItem.push(' ');
                dataItem.push(' ');
                dataItem.push(' ');
                dataItem.push(' ');
                dataItem.push(' ');

                newItem.data = dataItem;
                this.state.dataStar[0].items.push(newItem);

                this.setState({
                    dataStar: this.state.dataStar,
                    haveMoreDatas: true,
                }, () => {
                    this.state.dataStar[0].items = [];
                    this.setState({
                        dataStar: this.state.dataStar,
                        haveMoreDatas: true,
                    });
                    this.getHouseListData(() => {
                        if (callBack) {
                            callBack();
                        }
                    });
                });

            })
    }
    /**
     * 获取明星机构表格数据
     * */
    getHouseListData(callBack) {
        this.state.dataHouse[0].items = [];
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, HitsApi.HOUSE_RESEARCH_LIST, {},
            (response) => {
                this.RequestNumber += 1;
                if (response && response.list.length > 0) {
                    for (let i = 0; i < response.list.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        let titles = {};
                        titles.id = response.list[i].id;
                        titles.secName = response.list[i].secName;
                        titles.marketCode = response.list[i].marketCode;
                        newItem.title = titles;

                        //数据项，一定要按照数据添加
                        let dataItem = [];
                        dataItem.push(response.list[i].starAgency ? response.list[i].starAgency : '--');
                        dataItem.push(response.list[i].industryAttention ? response.list[i].industryAttention : '--');
                        dataItem.push(response.list[i].stockConcern ? response.list[i].stockConcern : '--');
                        dataItem.push(response.list[i].buyRating ? response.list[i].buyRating : '--');
                        dataItem.push(response.list[i].holdRating ? response.list[i].holdRating : '--');

                        newItem.data = dataItem;
                        this.state.dataHouse[0].items.push(newItem);

                    }
                    if (this.state.selectTab === 1) {
                        this.state.flowDatas[1] = this.state.flowDatas[1] + "(" + response.list.length + "只)";
                    }
                    //this.state.allContent += response.list.length;
                    //console.log("机构刷新前",this.RequestNumber)

                    if (this.RequestNumber === 3) {
                        //console.log("进入机构刷新ssssss",this.state.flowDatas)
                        this.setState({
                            dataHouse: this.state.dataHouse,
                            haveMoreDatas: true,
                            //allContent: allContent,
                            flowDatas: this.state.flowDatas
                        }, () => {
                            this.getBurstDatas(() => {
                                if (callBack) {
                                    callBack();
                                }
                            });
                        });
                    } else {
                        this.setState({
                            dataHouse: this.state.dataHouse,
                            haveMoreDatas: true,
                            // allContent:allContent,
                            flowDatas: this.state.flowDatas
                        }, () => {
                            this.getBurstDatas(() => {
                                if (callBack) {
                                    callBack();
                                }
                            });
                        });
                    }


                } else {
                    this.setState({
                        dataHouse: this.state.dataHouse,
                        haveMoreDatas: true,
                    }, () => {
                        this.getBurstDatas(() => {
                            if (callBack) {
                                callBack();
                            }
                        });
                    });
                }
            },
            (error) => {
                this.setState({
                    dataHouse: this.state.dataHouse,
                    haveMoreDatas: true,
                }, () => {
                    this.getBurstDatas(() => {
                        if (callBack) {
                            callBack();
                        }
                    });
                });

            })
    }
    /**
     * 获取涨幅空间列表数据
     * */
    getBurstDatas(callBack) {
        this.state.dataBrst[0].items = [];
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL, HitsApi.BURST_RESEARCH_LIST, {},
            (response) => {
                this.RequestNumber += 1;
                //只要请求成功 firstEnter设置为false,防止第一次进入，空布局闪动问题
                this.firstEnter = false;
                let times = CommonUtils.dateFormats("yyyy-MM-dd hh:mm", new Date());
                if (response && response.list.length > 0) {

                    for (let i = 0; i < response.list.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        let titles = {};
                        titles.id = response.list[i].id;
                        titles.secName = response.list[i].secName;
                        titles.marketCode = response.list[i].marketCode;
                        titles.dates = response.list[i].dates ? response.list[i].dates.substring(0, 10) : '--';
                        newItem.title = titles;

                        //数据项，一定要按照数据添加
                        let dataItem = [];
                        //dataItem.push(response.list[i].dates ? response.list[i].dates.substring(0,10):'--');
                        dataItem.push(response.list[i].title ? response.list[i].title : '--');
                        dataItem.push(response.list[i].secName ? response.list[i].secName : '--');
                        dataItem.push(response.list[i].targeIncrease != null ? response.list[i].targeIncrease : '--');
                        dataItem.push(response.list[i].targetPrice != null ? Number(response.list[i].targetPrice) : '--');
                        dataItem.push(response.list[i].releaseDateClosePrice != null ? Number(response.list[i].releaseDateClosePrice) : '--');
                        dataItem.push(response.list[i].publishingAgency ? response.list[i].publishingAgency : '--');

                        newItem.data = dataItem;
                        this.state.dataBrst[0].items.push(newItem);

                    }
                    if (this.state.selectTab === 2) {
                        this.state.flowDatas[2] = this.state.flowDatas[2] + "(" + response.list.length + "只)";
                    }
                    // this.state.flowDatas[2] = this.state.flowDatas[2]+response.list.length;
                    //this.state.allContent += response.list.length;
                    //this.state.dataBrst[0].items = [];
                    //console.log("涨幅空间",this.RequestNumber)
                    if (this.RequestNumber === 3) {
                        this.setState({
                            dataBrst: this.state.dataBrst,
                            haveMoreDatas: true,
                            //allContent: this.state.allContent,
                            newDateTime: times
                        }, () => {
                            if (callBack) {
                                callBack();
                            }
                        });
                    } else {
                        this.setState({
                            dataBrst: this.state.dataBrst,
                            haveMoreDatas: true,
                            newDateTime: times
                            //allContent: this.state.allContent
                        }, () => {
                            if (callBack) {
                                callBack();
                            }
                        });
                    }
                } else {
                    this.setState({
                        dataBrst: this.state.dataBrst,
                        haveMoreDatas: true,
                        newDateTime: times
                    }, () => {
                        if (callBack) {
                            callBack();
                        }
                    });
                }
            },
            (error) => {
                this.firstEnter = false;

                let times = CommonUtils.dateFormats("yyyy-MM-dd hh:mm", new Date());
                this.setState({
                    dataBrst: this.state.dataBrst,
                    haveMoreDatas: true,
                    newDateTime: times
                }, () => {
                    if (callBack) {
                        callBack();
                    }
                });
            })
    }



    render() {

        return (
            <StickyForm
                bounces={true}
                style={{ backgroundColor: "#f6f6f6", flex: 1 }}
                contentStyle={{ alignItems: "flex-start", width: this.state.selectTab === 0 ? "145%" : this.state.selectTab === 2 ? "235%" : "180%" }}
                data={this.state.selectTab === 0 ? this.state.dataStar : (this.state.selectTab === 1 ? this.state.dataHouse : this.state.dataBrst)}
                scrollEnabled={true}
                ref={ref => (this._list = ref)}
                hearderHeight={this.hearderHeight}
                heightForSection={() => this.HEADER_HEGHT}
                renderHeader={this._renderunLockHeader}
                renderSection={this._renderSection}
                heightForIndexPath={() => this.ITEM_HEGHT}
                renderIndexPath={this._renderItem}
                renderFooter={this._renderMyFooters}
                showsHorizontalScrollIndicator={false}
                allLoaded={this.state.haveMoreDatas}
                onRefresh={() => {
                    this.firstEnter = true;
                    //this.state.allContent = 0;
                    this.state.flowDatas = ["明星分析师推荐", "明星机构推荐", "涨幅空间大"];
                    this.RequestNumber = 0;
                    this.getResearchIntro();
                    this.getSchoolDatas();
                    this.getResearchListData(() => {
                        //console.log("刷新回调1");
                        this._list.endRefresh();
                    });
                }}
                hotBlock={{ lock: "left", hotBlock: { x: 0, y: this.hearderHeight, width: 0, height: 0 } }}
                renderEmpty={this.renderEmptys}
                // renderFooter={this.isShowFooter}
                onLoading={() => { }}
                refreshHeader={mNormalHeader}
                loadingFooter={mRiskTipsFooter}
                headerStickyEnabled={false}
                onEndReached={(info) => { }}
                onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                    this.scrollY = y;
                    if (x <= 0) {
                        this.leftArrow && this.leftArrow.setNativeProps({
                            style: { opacity: 1 }
                        });
                    } else {
                        this.leftArrow && this.leftArrow.setNativeProps({
                            style: { opacity: 0 }
                        });
                    }
                }}
            />
        )
    }
    /**
     * 当数据不为空时，绘制脚布局,没有更多数据
     * */
    isShowFooter() {
        let showFooter = false;
        switch (this.state.selectTab) {
            case 0:
                if (this.state.dataStar[0].items.length > 0) {
                    showFooter = true;
                }
                break;
            case 1:
                if (this.state.dataHouse[0].items.length > 0) {
                    showFooter = true;
                }
                break;
            case 2:
                if (this.state.dataBrst[0].items.length > 0) {
                    showFooter = true;
                }
                break;
            default:
                showFooter = false;
                break;
        };
        return showFooter;
    };

    /**
     * 加载可滑动列表的头布局
     *  numberOfLines={this.state.isFold? 2:100}> 就是要是展开，默认的把行数提高到100,很大的值
     *ExpandableText在ios上显示不全，外层套一个View
     * this.RequestNumber===3? "入选股票("+this.state.allContent+"只)" :
     * lineHeight:ScreenUtil.scaleSizeW(40)
     * */
    // <View style={{marginBottom:ScreenUtil.scaleSizeW(25)}}>

    //                         </View>
    _renderunLockHeader = () => {
        return (
            <View style={{ alignSelf: "stretch" }}>
                <View style={{ width: ScreenUtil.screenW }}
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
                        colors={['#594d54', '#07001f']}
                        style={{ width: ScreenUtil.screenW, paddingBottom: ScreenUtil.scaleSizeW(153), borderRadius: ScreenUtil.scaleSizeW(10) }}>
                        <View style={{ width: ScreenUtil.screenW, justifyContent: "center", alignItems: "center", marginBottom: ScreenUtil.scaleSizeW(20) }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#fff", marginTop: ScreenUtil.scaleSizeW(30) }}>研报策略原理</Text>
                        </View>
                        <ExpandableText
                            style={{
                                width: ScreenUtil.screenW, color: "white", paddingHorizontal: ScreenUtil.scaleSizeW(30), paddingBottom: ScreenUtil.scaleSizeW(25), paddingTop: ScreenUtil.scaleSizeW(0),
                                fontSize: ScreenUtil.setSpText(28), lineHeight: ScreenUtil.scaleSizeW(40)
                            }}
                            numberOfLines={2}
                            expandText={'展开'}
                            expandTextStyle={{ color: 'rgba(255,255,255,0.6)' }}
                            expandButtonLocation={'center'}
                        >
                            {this.state.detailDescribe + ""}
                        </ExpandableText>
                        <View style={{ marginBottom: ScreenUtil.scaleSizeW(25) }} />
                        {this.state.growthSchool.length > 0 ?
                            <View style={{ width: ScreenUtil.screenW, justifyContent: "center", alignItems: "center", marginBottom: ScreenUtil.scaleSizeW(30) }}>
                                <View style={styles.schoolTitle}>
                                    <View style={{ width: ScreenUtil.scaleSizeW(6), height: ScreenUtil.scaleSizeW(28), backgroundColor: "white" }} />
                                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white", marginLeft: ScreenUtil.scaleSizeW(10) }}>成长学堂</Text>
                                    <View style={{ flex: 1 }} />
                                    <TouchableOpacity onPress={() => {
                                        Navigation.navigateForParams(this.props.navigation, "StrategyCoursePage", {})

                                        sensorsDataClickObject.videoPlay.entrance = '研报策略'
                                        sensorsDataClickObject.videoPlay.class_type = '指标学习'

                                        sensorsDataClickObject.addOnClick.page_source = '研报策略'
                                        sensorsDataClickObject.addOnClick.content_name = '成长学堂-更多'
                                        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)

                                        }} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "rgba(255,255,255,0.6)", marginRight: ScreenUtil.scaleSizeW(10) }}>更多</Text>
                                        <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(26), resizeMode: "contain" }} source={require('../../images/hits/hq_kSet_back.png')} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20), marginHorizontal: ScreenUtil.scaleSizeW(10), paddingLeft: ScreenUtil.scaleSizeW(46),
                                    backgroundColor: "rgba(0,0,0,0.2)", borderBottomRightRadius: ScreenUtil.scaleSizeW(10),
                                    borderBottomLeftRadius: ScreenUtil.scaleSizeW(10),
                                }}>
                                    {this.getGrowthSchool()}
                                </View>


                            </View>
                            : null}

                        {this.state.growthSchool != null && this.state.growthSchool.length === 0 ?
                            <View style={styles.intervalLine} />
                            :
                            null
                        }
                        <View style={styles.oneHang}>
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: Platform.OS === 'android' ? 0 : ScreenUtil.scaleSizeW(4) }}>
                                <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#000" }}>{"入选股票"}</Text>
                                <Text style={{ fontSize: ScreenUtil.setSpText(24), marginTop: Platform.OS === 'android' ? 0 : ScreenUtil.scaleSizeW(2), color: "rgba(0,0,0,0.4)" }}>
                                    {this.state.newDateTime != "" ? this.state.newDateTime + "更新" : ""}</Text>
                            </View>

                            <View style={{ width: ScreenUtil.screenW, height: 0.5, backgroundColor: "rgba(0,0,0,0.1)" }} />
                            <FlowLayoutSpecial tagDatas={this.state.flowDatas} activeIndex={this.state.selectTab} padding={ScreenUtil.scaleSizeW(10)}
                                indexCallBack={(tagName, index) => { this.indexChange(tagName, index) }} />
                        </View>

                    </LinearGradient>
                </View>
            </View>
        );
    };
    //this._list.scrollTo({x:0,y:this.scrollY},false)
    /**
     * tab切换
     * */
    indexChange(tagName, index) {
        let newFlow = ["明星分析师推荐", "明星机构推荐", "涨幅空间大"];
        let showNumber;
        switch (index) {
            case 0:
                this.sensorsAppear('明星分析师推荐')
                showNumber = this.state.dataStar[0].items.length === 0 ? "" : "(" + this.state.dataStar[0].items.length + "只)";
                newFlow[0] = newFlow[0] + showNumber;
                break;
            case 1:
                this.sensorsAppear('明星机构推荐')
                showNumber = this.state.dataHouse[0].items.length === 0 ? "" : "(" + this.state.dataHouse[0].items.length + "只)";
                newFlow[1] = newFlow[1] + showNumber;
                break;
            case 2:
                this.sensorsAppear('涨幅空间大')
                showNumber = this.state.dataBrst[0].items.length === 0 ? "" : "(" + this.state.dataBrst[0].items.length + "只)";
                newFlow[2] = newFlow[2] + showNumber;
                break;
            default:
                showNumber = "";
                break;
        }
        this.setState({
            selectTab: index,
            flowDatas: newFlow
        }, () => {
            this._list.scrollTo({ x: 0, y: this.scrollY }, false)
        })
    }



    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.second_label = label;
        sensorsDataClickObject.adLabel.first_label = '研报策略';
        sensorsDataClickObject.adLabel.module_source = '选股';
        sensorsDataClickObject.adLabel.label_level = 2;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.page_source = '研报策略';
        sensorsDataClickObject.adLabel.is_pay = '免费';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }


    /**
     * 获取成长学堂数据
     * */
    getGrowthSchool() {
        let Views = [];
        if (this.state.growthSchool != null && this.state.growthSchool.length > 0) {
            for (let i = 0; i < this.state.growthSchool.length; i++) {
                if (i === this.state.growthSchool.length - 1) {
                    Views.push(
                        <TouchableOpacity key = {i} activeOpacity={0.7} onPress={() => {
                            let path = MainPathYG + 'ChengZhangXueTang/' + this.state.keyWord + '/' + this.state.growthSchool[i].key;
                            let optionParams = { path: path, star: this.state.growthSchool[i].content.star, taoxiName: this.state.growthSchool[i].content.setsystem };
                            let c = this.state.growthSchool[i].content
                            sensorsDataClickObject.videoPlay.entrance = '研报策略'
                            sensorsDataClickObject.videoPlay.class_type = '策略学堂'
                            sensorsDataClickObject.videoPlay.class_name = c.title
                            sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(c.createTime),'yyyy-MM-dd')
                            sensorsDataClickObject.videoPlay.class_series = c.setsystem || ''
                            Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                                key: this.state.growthSchool[i].key,
                                type: 'Strategy',
                                ...optionParams
                            });
                        }} style={styles.schoolItemLast}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)" }}>{this.state.growthSchool[i].content.title + ""}</Text>
                            <View style={{ flex: 1 }} />
                            <Image style={{ width: ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(30), resizeMode: "contain" }}
                                source={require('../../images/hits/videos_img.png')} />
                        </TouchableOpacity>
                    )
                } else {
                    Views.push(
                        <TouchableOpacity key = {i} activeOpacity={0.7} onPress={() => {
                            let path = MainPathYG + 'ChengZhangXueTang/' + this.state.keyWord + '/' + this.state.growthSchool[i].key;
                            let optionParams = { path: path, star: this.state.growthSchool[i].content.star, taoxiName: this.state.growthSchool[i].content.setsystem };
                            let c = this.state.growthSchool[i].content
                            sensorsDataClickObject.videoPlay.entrance = '研报策略'
                            sensorsDataClickObject.videoPlay.class_type = '策略学堂'
                            sensorsDataClickObject.videoPlay.class_name = c.title
                            sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(c.createTime),'yyyy-MM-dd')
                            sensorsDataClickObject.videoPlay.class_series = c.setsystem || ''
                            Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
                                key: this.state.growthSchool[i].key,
                                type: 'Strategy',
                                ...optionParams
                            });
                        }} style={styles.schoolItem}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)" }}>{this.state.growthSchool[i].content.title + ""}</Text>
                            <View style={{ flex: 1 }} />
                            <Image style={{ width: ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(30), resizeMode: "contain" }}
                                source={require('../../images/hits/videos_img.png')} />
                        </TouchableOpacity>
                    )
                }
            }
        } else {
            Views = null;
        }
        return Views;
    }

    /**
     * 绘制空视图
     * width: this.state.selectTab === 2 ?"245%":"200%"
     * */
    renderEmptys = () => {
        //console.log("绘制空视图",this.firstEnter);
        let rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180) - 4);
        if (this.firstEnter === true) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ width:ScreenUtil.screenW,height:300,flex: 1,justifyContent:"center",alignItems:"center" }}>
                    <ActivityIndicator color={"gray"} />
                    </View>
                </View>
            )

        } else {
            let titles = [];
            if (this.state.selectTab === 0) {
                titles = this.state.titlesStar;
            } else if (this.state.selectTab === 1) {
                titles = this.state.titleStartHouse;
            } else {
                titles = this.state.titleBrst;
            }

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
                            top: this.HEADER_HEGHT + 400, left: 0, width: ScreenUtil.screenW
                        }}>
                        </View>
                    </View>

                </View>

            );
        }
    };

    /**
     * SectionTitle
     * */
    _renderSection = (section: number) => {
        //console.log("进入头部是刷新")
        let titles = [];
        let rights;
        if (this.state.selectTab === 0) {
            titles = this.state.titlesStar;
            rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180) - 4);
        } else if (this.state.selectTab === 1) {
            titles = this.state.titleStartHouse;
            rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(180) - 4);
        } else {
            titles = this.state.titleBrst;
            rights = Math.floor(ScreenUtil.screenW - ScreenUtil.scaleSizeW(220) - 4);
        }

        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row", backgroundColor: "#f2faff" }}>
                {
                    this.state.selectTab === 2 ?
                        <View style={[styles.fixTitleThree, {}]}>
                            <Image source={require('../../images/hits/section_bg.png')} style={{ flex: 1, width: ScreenUtil.scaleSizeW(220), height: this.HEADER_HEGHT, position: "absolute", top: 0, left: 0, resizeMode: "stretch" }} />
                            <Text style={styles.hinnerText}>日期</Text>
                            <Image
                                ref={ref => this.leftArrow = ref}
                                source={require('../../images/hits/left_arrow.png')}
                                style={{ width: 5, height: 10, position: "absolute", top: 14, right: -rights }} />
                        </View>
                        :
                        <View style={[styles.fixTitleOne, {}]}>
                            <Image source={require('../../images/hits/section_bg.png')} style={{ flex: 1, width: ScreenUtil.scaleSizeW(180), height: this.HEADER_HEGHT, position: "absolute", top: 0, left: 0, resizeMode: "stretch" }} />
                            <Text style={styles.hinnerText}>股票名称</Text>
                            <Image
                                ref={ref => this.leftArrow = ref}
                                source={require('../../images/hits/left_arrow.png')}
                                style={{ width: 5, height: 10, position: "absolute", top: 14, right: -rights }} />
                        </View>
                }


                {titles.map((title, index) =>
                    //这个地方就是根据三个不同表格样式，判断不同的Item的样式，不想拿出来,直接写上去了
                    <View style={(this.state.selectTab === 0 && index === 0) ? styles.starFixrText : ((this.state.selectTab === 2 && index === 0 ? styles.starFixrText : (this.state.selectTab === 2 && index === 1 ? [styles.headerTextSpecial, { width: ScreenUtil.scaleSizeW(200) }] : (index === 0 ? styles.headerTextSpecial : styles.headerText))))} key={index}>
                        <Text style={styles.hinnerText} >
                            {title.conName}
                        </Text>
                    </View>
                )}
            </View>
        );
    };
    /**
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        let datas;
        if (this.state.selectTab === 0) {
            datas = this.state.dataStar;
        } else if (this.state.selectTab === 1) {
            datas = this.state.dataHouse;
        } else {
            datas = this.state.dataBrst;
        }
        const item = datas[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                let data = {};
                data.Obj = item.title.marketCode;
                data.ZhongWenJianCheng = item.title.secName;
                data.obj = item.title.marketCode;
                let codeArray = [];
                if (datas[0].items.length > 0) {
                    for (let i = 0; i < datas[0].items.length; i++) {
                        let itemObj = {};
                        itemObj.Obj = datas[0].items[i].title.marketCode;
                        itemObj.ZhongWenJianCheng = datas[0].items[i].title.secName;
                        itemObj.obj = datas[0].items[i].title.marketCode;
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
                {this.state.selectTab === 2 ?
                    <View style={[styles.fixTitleThree, {}]}>
                        <Image source={require('../../images/hits/item_head_bg.png')} style={{ flex: 1, width: ScreenUtil.scaleSizeW(220), height: this.ITEM_HEGHT - 1, position: "absolute", top: 0, left: 0, resizeMode: "stretch" }} />
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#242424" }}>{item.title.dates}</Text>
                    </View>
                    :
                    <View style={[styles.fixTitleOne, {}]}>
                        <Image source={require('../../images/hits/item_head_bg.png')} style={{ flex: 1, width: ScreenUtil.scaleSizeW(180), height: this.ITEM_HEGHT - 1, position: "absolute", top: 0, left: 0, resizeMode: "stretch" }} />
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#242424" }}>{item.title.secName}</Text>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#909090" }}>{item.title.marketCode}</Text>
                    </View>
                }

                {item.data.map((title, index) => this.getItemViewType(title, index))}
            </TouchableOpacity>
        );
    };
    /**
     * 获取不同样式的View
     * */
    getItemViewType(title, index) {
        let Views;

        if (this.state.selectTab === 0) {
            //注意每个表格的设置不一样
            switch (index) {
                case 0:
                    Views = <View style={styles.textFix} key={index}><Text style={styles.contentText} numberOfLines={2} ellipsizeMode={'tail'}>{title}</Text></View>;
                    break;
                default:
                    Views = <View style={styles.text} key={index}><Text style={styles.contentText}>{title}</Text></View>;
                    break;
            }
        } else if (this.state.selectTab === 2) {
            //注意每个表格的设置不一样
            switch (index) {
                case 0:
                    //需求要求显示10个字numberOfLines={1} ellipsizeMode={'tail'} 这两个属性不能全部满足都是10个字
                    let itemsText;
                    if (title.length >= 11) {
                        itemsText = title.substring(0, 10) + "..."
                    } else {
                        itemsText = title;
                    }
                    Views = <View style={styles.textFix} key={index}><Text style={styles.contentText} >{itemsText}</Text></View>;
                    break;
                case 1:
                    Views = <View style={styles.textSpecial} key={index}>
                        <Text style={styles.contentText}>{title}</Text>
                    </View>;
                    break;
                case 3:
                    Views = <View style={styles.text} key={index}>
                        <StockFormatText precision={2} useDefault={true} style={styles.contentText}>{title}</StockFormatText>
                    </View>;
                    break;
                case 4:
                    Views = <View style={styles.text} key={index}>
                        <StockFormatText precision={2} useDefault={true} style={styles.contentText}>{title}</StockFormatText>
                    </View>;
                    break;
                case 5:
                    Views = <View style={styles.text} key={index}>
                        <StockFormatText precision={2} useDefault={true} style={styles.contentText}>{title}</StockFormatText>
                    </View>;
                    break;
                default:
                    Views = <View style={styles.text} key={index}><Text style={styles.contentText}>{title}</Text></View>;
                    break;
            }

        } else {
            //注意每个表格的设置不一样
            switch (index) {
                default:
                    Views = <View style={styles.text} key={index}><Text style={styles.contentText}>{title}</Text></View>;
                    break;
            }
        }
        return Views;
    };

    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        // if(this.state.data && this.state.data[0].items.length === 0 ){
        //     return <View><View></View></View>;
        // }else {
        //
        // }
        return(
            <View>
                <View style={{ width: ScreenUtil.screenW, paddingVertical:ScreenUtil.scaleSizeW(30),paddingHorizontal:ScreenUtil.scaleSizeW(20), backgroundColor: "#f1f1f1", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{fontSize: ScreenUtil.setSpText(28), color:"rgba(0,0,0,0.2)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0,textAlign:"center"}}
                    >温馨提示：信息内容仅供参考,不构成操作决策依据，股市有风险，投资需谨慎。</Text>
                </View>
            </View>
        )
    }
    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this._removeTimer();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    intervalLine: {
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(20),
        //backgroundColor:"#f1f1f1"
    },
    slectMarket: {


    },
    studyItem: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60),
        height: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(80) : ScreenUtil.scaleSizeW(70),
        justifyContent: "center",
        marginBottom: ScreenUtil.scaleSizeW(20),
        paddingVertical: ScreenUtil.scaleSizeW(20),
        borderBottomWidth: ScreenUtil.scaleSizeW(1),
        borderBottomColor: "#f1f1f1",
        marginHorizontal: ScreenUtil.scaleSizeW(30)
    },
    //表格需要的样式
    textFix: {
        width: ScreenUtil.scaleSizeW(350),
        justifyContent: "center",
        backgroundColor: "white",
        paddingLeft: ScreenUtil.scaleSizeW(20)
    },
    text: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "white",
        paddingLeft: ScreenUtil.scaleSizeW(20),

    },
    textSpecial: {
        width: ScreenUtil.scaleSizeW(200),
        justifyContent: "center",
        backgroundColor: "white",
        paddingLeft: ScreenUtil.scaleSizeW(20)
    },
    hinnerText: {
        fontSize: ScreenUtil.setSpText(24),
        color: "#999999"
    },
    titleText: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    starFixrText: {
        width: ScreenUtil.scaleSizeW(350),
        paddingLeft: ScreenUtil.scaleSizeW(20),
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
    },
    headerText: {
        flex: 1,
        paddingLeft: ScreenUtil.scaleSizeW(20),
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
    },
    headerTextSpecial: {
        width: ScreenUtil.scaleSizeW(232),
        paddingLeft: ScreenUtil.scaleSizeW(20),
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
    },
    row: {
        flex: 1,
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor: "#fff"
    },
    contentText: {
        fontSize: ScreenUtil.setSpText(28),
        color: "#000"
    },

    fixTitleOne: {
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        width: ScreenUtil.scaleSizeW(180)
    },
    fixTitleThree: {
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        width: ScreenUtil.scaleSizeW(220)
    },
    oneHang: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(158),
        borderTopRightRadius: ScreenUtil.scaleSizeW(10),
        borderTopLeftRadius: ScreenUtil.scaleSizeW(10),
        backgroundColor: "white",
        //flexDirection:"row",
        justifyContent: "center",
        alignItems: "center"
    },
    schoolTitle: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(20),
        height: ScreenUtil.scaleSizeW(77),
        flexDirection: "row",
        marginHorizontal: ScreenUtil.scaleSizeW(10),
        justifyContent: "center",
        alignItems: "center",
        // marginTop:ScreenUtil.scaleSizeW(20),
        backgroundColor: "rgba(0,0,0,0.2)",
        paddingHorizontal: ScreenUtil.scaleSizeW(20),
        borderTopLeftRadius: ScreenUtil.scaleSizeW(10),
        borderTopRightRadius: ScreenUtil.scaleSizeW(10),
        borderBottomWidth: 0.5, borderColor: "rgba(0,0,0,0.3)"
    },
    schoolItem: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(76),
        height: ScreenUtil.scaleSizeW(85),
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingRight: ScreenUtil.scaleSizeW(20),
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(0,0,0,0.1)",
        marginRight: ScreenUtil.scaleSizeW(10)
    },
    schoolItemLast: {
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(76),
        height: ScreenUtil.scaleSizeW(85),
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingRight: ScreenUtil.scaleSizeW(20),
        marginRight: ScreenUtil.scaleSizeW(10),
    },
});
