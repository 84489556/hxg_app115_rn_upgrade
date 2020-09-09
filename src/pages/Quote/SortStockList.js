import React, { Component } from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    AppState
} from "react-native";

import StockList from "./StockList.js";
import StockFormatText from "../../components/StockFormatText";
import * as baseStyle from "../../components/baseStyle.js";
import ShareSetting from "../../modules/ShareSetting.js";
import RATE, { DISTANCE } from "../../utils/fontRate";
import Yd_sync from '../../wilddog/Yd_cloud';

import NetInfo from "@react-native-community/netinfo";
// 排序结果和行情数据不一致,修改为使用stkdata服务的排序功能
export default class SortStockList extends Component {

    static defaultProps = {
        serviceUrl: "/stkdata",
    };
    defaultParams = {
        field: 'ZhongWenJianCheng,ZuiXinJia,ZhangFu',
        orderby: 'ZhangFu',
        start: 0,
        count: 10,
        desc: true,
        gql: 'block=市场\\\\沪深市场\\\\沪深A股',
        mode: 2,
        sub: 1,
    };

    constructor(props) {
        super(props);
        this.stockList = [],
            //涨幅榜
            this.block_ranking_sort1_ref = Yd_sync("zf").ref("/quote_ranking_list/data/sort_001");
        //总股票数
        this.block_ranking_count_ref = Yd_sync("count").ref("/quote_ranking_list/count");
        this.block_ranking_sort_end1_ref = undefined;
        this.block_ranking_sort_end2_ref = undefined;
        // 初始空数据
        this.state = {
            data: new Array(props.params.count || this.defaultParams.count).fill({})
        };
        // this.defaultParams.orderby = this.props.params.field;
        // this.defaultParams.field = 'ZhongWenJianCheng,ZuiXinJia,ZhangFu'
    }
    componentDidMount() {
        //     this.refresh_ZDFList = DeviceEventEmitter.addListener('refresh_ZDFList', () => {
        //         this.block_ranking_sort1_ref = Yd_sync.ref("/quote_ranking_list/data/sort_001");
        //         this.block_ranking_count_ref = Yd_sync.ref("/quote_ranking_list/count");
        //         this.block_ranking_sort_end1_ref = undefined;
        //         this.block_ranking_sort_end2_ref = undefined;
        //         this.zdf_Sort()
        //     })
        this.netInfoSubscriber = NetInfo.addEventListener(this.handleConnectivityChange);
    }
    componentWillUnmount() {
        this.netInfoSubscriber && this.netInfoSubscriber();
        this.block_ranking_sort1_ref && this.block_ranking_sort1_ref.off("value", () => { });
        this.block_ranking_sort_end1_ref && this.block_ranking_sort_end1_ref.off('value', () => { });
        this.block_ranking_sort_end2_ref && this.block_ranking_sort_end2_ref.off('value', () => { });
        // this.refresh_ZDFList&&this.refresh_ZDFList.remove();
    }

    //监听网络状态的改变
    handleConnectivityChange = (status) => {
        if (Platform.OS == 'android') {
            if (status.type == 'none') { }
            else if (status.type == 'unknown') { }
            else if (status.type  == 'cellular') {
                // this.zdf_Sort()
            }
            else if (status.type  == 'wifi') {
                // this.zdf_Sort()
            }
        }

    }

    componentDidMount() {
        this.zdf_Sort();
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    //应用前后台监听方法
    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            this.zdf_Sort();
        }
        else if (nextAppState === 'background') {
            this.block_ranking_sort1_ref && this.block_ranking_sort1_ref.off("value", () => { });
            this.block_ranking_sort_end1_ref && this.block_ranking_sort_end1_ref.off('value', () => { });
            this.block_ranking_sort_end2_ref && this.block_ranking_sort_end2_ref.off('value', () => { });
        } else if (nextAppState === 'inactive') {
            //进入后台时，储存一个上次退出时间，ios有过渡时间的方法，在这个方法做操作
            if (Platform.OS === 'ios') {
            }

        }
    };

    //涨幅榜、跌幅榜
    zdf_Sort() {
        //涨幅榜
        if (this.props.title == ShareSetting.getZhangFuBangTitle()) {
            this.block_ranking_sort1_ref.on('value', (snapshot) => {
                // console.log('abc 1')
                this.renderCell(snapshot.nodeContent)
            })

            this.block_ranking_sort1_ref.get((snapshot) => {
                // console.log('abc 2')
                this.renderCell(snapshot.nodeContent)
            })
            //跌幅榜
        } else {
            this.block_ranking_count_ref.get((snapshot) => {
                // console.log('abc 3')
                let number = parseInt(snapshot.nodeContent) / 10;
                let splitArray = number.toString().split(".");
                let reciprocal_1 = "";
                let reciprocal_2 = "";
                let reciprocal_1_List = [];
                let reciprocal_2_List = [];
                if (splitArray.length == 2) {
                    reciprocal_1 = "sort_" + (parseInt(splitArray[0]) + 1);
                    reciprocal_2 = "sort_" + splitArray[0];
                } else {
                    reciprocal_1 = "sort_" + splitArray[0];
                    reciprocal_2 = "sort_" + (parseInt(splitArray[0]) - 1);
                }
                this.block_ranking_sort_end1_ref = Yd_sync("df_1").ref("/quote_ranking_list/data/" + reciprocal_1);
                this.block_ranking_sort_end2_ref = Yd_sync("df_2").ref("/quote_ranking_list/data/" + reciprocal_2);

                // Yd_sync("df_2").ref("/quote_ranking_list/data/" + reciprocal_2).get((snapshot) => {
                this.block_ranking_sort_end2_ref.get((snapshot) => {
                    // console.log('abc 4')
                    this.processStringData(snapshot.nodeContent, (list) => {
                        reciprocal_1_List = list;
                        Yd_sync("df_1").ref("/quote_ranking_list/data/" + reciprocal_1).get((snapshot) => {
                            this.processStringData(snapshot.nodeContent, (list_last) => {
                                reciprocal_2_List = list_last;
                                this.setState({ data: [] }, () => {
                                    this.setState({ data: ((list.concat(list_last)).slice((list.concat(list_last).length - 1) - 9, (list.concat(list_last).length))).reverse() });
                                });
                            })
                        })
                    })
                })
                // Yd_sync("df_1").ref("/quote_ranking_list/data/" + reciprocal_1).on('value', (snapshot) => {
                this.block_ranking_sort_end1_ref.on('value', (snapshot) => {
                    // console.log('abc 5')
                    if (global.currRoute_3 === "HS") {
                        this.processStringData(snapshot.nodeContent, (list) => {
                            reciprocal_1_List = list;
                            // console.log("跌幅榜数据变化——倒1", list)
                            this.setState({ data: [] }, () => {
                                this.setState({ data: ((reciprocal_2_List.concat(reciprocal_1_List)).slice((reciprocal_2_List.concat(reciprocal_1_List).length - 1) - 9, (reciprocal_2_List.concat(reciprocal_1_List).length))).reverse() });
                            });

                        })
                    }
                })
                // Yd_sync("df_2").ref("/quote_ranking_list/data/" + reciprocal_2).on('value', (snapshot) => {
                this.block_ranking_sort_end2_ref.on('value', (snapshot) => {
                    // console.log('abc 6')
                    if (global.currRoute_3 === "HS") {
                        this.processStringData(snapshot.nodeContent, (list_last) => {
                            reciprocal_2_List = list_last;
                            // console.log("跌幅榜数据变化——倒2", list_last)
                            this.setState({ data: [] }, () => {
                                this.setState({ data: ((reciprocal_2_List.concat(reciprocal_1_List)).slice((reciprocal_2_List.concat(reciprocal_1_List).length - 1) - 9, (reciprocal_2_List.concat(reciprocal_1_List).length))).reverse() });
                            });
                        })
                    }
                })

            })
        }
    }

    renderCell(strData) {
        this.processStringData(strData, (list) => {
            this.setState({ data: [] }, () => {
                this.setState({ data: list });
            });
        })
    }

    processStringData(strData, successCallBack) {
        let block_Data = {};
        let parseJsonObj = {};
        let dataList = [];
        let str1 = strData.replace(/\</g, "{")
        let str2 = str1.replace(/\>/g, "}")
        let str3 = str2.replace(/\$/g, ":")
        let arr = str3.split("&");
        arr.map((data, index) => {
            parseJsonObj = JSON.parse(data)
            block_Data = {
                ZhongWenJianCheng: parseJsonObj.n,
                ZhangFu: parseJsonObj.r,
                ZuiXinJia: Number(parseJsonObj.p),
                Obj: parseJsonObj.c
            }
            dataList.push(block_Data)
            if (index == arr.length - 1) {
                successCallBack(dataList)
                block_Data = null;
                parseJsonObj = null;
                dataList = null;
                str1 = null;
                str2 = null;
                str3 = null;
                arr = null;
            }
        })

    }

    // adapt(data) {
    //     // 得到排序结果后,再查询对应股票数据(最新价)
    //     if (data.length > 0) {
    //         this.setState({data: data});
    //         // console.log('涨幅 跌幅 ==data =  '+JSON.stringify(data))
    //         // let objs = [];
    //         // let result = data.map(eachData => {
    //         //     objs.push(eachData.Obj);
    //         //     return {Obj: eachData.Obj, [this.props.params.field]: eachData.Value};
    //         // });
    //         // connection.request('/stkdata', {
    //         //     obj: objs,
    //         //     field: ['ZuiXinJia', 'ZhongWenJianCheng', 'ZhangFu', 'HuanShou', 'ZhenFu']
    //         // }, (data) => {
    //         //     if (data.length > 0) {
    //         //         let map = Object.assign.apply(Object, data.map((eachData) => {
    //         //             return {[eachData.Obj]: eachData};
    //         //         }));
    //         //         result = result.map((eachData => {
    //         //             let stock = map[eachData.Obj];
    //         //             return stock ? Object.assign({}, eachData, stock) : eachData;
    //         //         }));
    //         //         this.setState({data: result});
    //         //         console.log('涨幅 跌幅 ==+++++++== '+JSON.stringify(result))
    //         //     }
    //         // });
    //     }
    //     return false;
    // }

    _renderRow(rowData, rowID) {
        //return <StockListItem {...rowData} column={['ZhongWenJianCheng', 'ZuiXinJia', this.props.params.field]} onPress={this._onItemPress.bind(this, rowData)}></StockListItem>
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (rowData.ZhangFu > 0)
            clr = baseStyle.UP_COLOR;
        else if (rowData.ZhangFu < 0)
            clr = baseStyle.DOWN_COLOR;
        return (
            <TouchableOpacity onPress={this._onItemPress.bind(this, rowData, rowID)}>
                <View style={[
                    styles.container,
                    {
                        backgroundColor: baseStyle.WHITE,
                        paddingLeft: 10,
                        paddingRight: 10,
                    }
                ]}>
                    <View style={{
                        flex: 4,
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        //backgroundColor:'#0ff'
                    }}>
                        <View key="ZhongWenJianCheng" style={{
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <StockFormatText style={{
                                color: baseStyle.BLACK_100,
                                fontSize: RATE(30),
                                marginBottom: 4,
                                textAlign: 'left',
                            }}>{rowData.ZhongWenJianCheng}</StockFormatText>
                            <StockFormatText style={{
                                color: baseStyle.BLACK_70,
                                fontSize: RATE(24),
                                textAlign: 'left',
                            }}>{rowData.Obj}</StockFormatText>
                        </View>
                        <View key="ZuiXinJia" style={{}}>
                            <StockFormatText titlename={"ZuiXinJia"}
                                style={{
                                    textAlign: 'center',
                                    fontSize: RATE(30),
                                    color: baseStyle.BLACK_100,
                                    fontFamily: 'Helvetica Neue'
                                }}>
                                {rowData.ZuiXinJia}
                            </StockFormatText>
                        </View>
                    </View>
                    <View key="ZhangFu" style={{ flex: 3 }}>
                        <StockFormatText unit="%" sign={true}
                            style={{
                                textAlign: 'right',
                                fontSize: RATE(30),
                                color: clr,
                                fontFamily: 'Helvetica Neue'
                            }}>
                            {rowData.ZhangFu / 100}
                        </StockFormatText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    _onItemPress(data, rowID) {

        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: this.state.data,
            index: rowID,
            fromPage: 'listPage'
        })
    }

    _intoAllList() {
        Navigation.navigateForParams(this.props.navigation, 'AllUpDownPage', { title: this.props.title })
    }

    render() {
        let data = this.state.data;
        return (
            <View style={{ backgroundColor: baseStyle.LINE_BG_F6 }}>
                <View style={{ height: 9 }} />
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'space-between',
                    height: 35,
                    paddingHorizontal: 15,
                    backgroundColor: '#fff',
                }}>
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{
                            color: baseStyle.BLACK_70,
                            fontSize: RATE(30),
                        }}>{this.props.title}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                //backgroundColor: '#ff0',
                            }}
                            activeOpacity={1}
                            onPressIn={() => this.setState({ arrowPress: true })}
                            onPressOut={() => this.setState({ arrowPress: false })}
                            onPress={this._intoAllList.bind(this)}>
                            <Image source={this.state.arrowPress
                                ? require('../../images/icons/arrow_right_bc_press_yes.png')
                                : require('../../images/icons/arrow_right_bc_press_no.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 1, backgroundColor: baseStyle.LINE_BG_F6 }} />
                <View style={{
                    flexDirection: 'row',
                    height: 30,
                    alignItems: 'center',
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: baseStyle.LINE_BG_F1,
                    backgroundColor: baseStyle.WHITE,
                }}>
                    <View style={{
                        flex: 4,
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        //backgroundColor:'#0ff'
                    }}>
                        <Text style={{
                            color: baseStyle.BLACK_70,
                            fontSize: RATE(24),
                            textAlign: 'left',
                        }}>名称</Text>
                        <Text style={{
                            color: baseStyle.BLACK_70,
                            fontSize: RATE(24),
                        }}>现价</Text>
                    </View>
                    <View style={{
                        flex: 3,
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        //backgroundColor:'#0ff'
                    }}>
                        <Text style={{
                            color: baseStyle.BLACK_70,
                            fontSize: RATE(24),
                            textAlign: 'right',
                        }}>{this.props.title}</Text>
                    </View>
                </View>
                {
                    data && data.length > 0 &&
                    <StockList data={data} renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, rowID)} />
                }
            </View>
        );
    }
}

let styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 49,
        // paddingLeft: 10,
        // paddingRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.LINE_BG_F1
    },
    indexBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    indexBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        // marginTop:100,
    },
});

