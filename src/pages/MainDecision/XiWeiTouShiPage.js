/*
 * @Author: lishuai 
 * @Date: 2019-08-21 11:19:48 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-08-24 16:36:38
 * 席位透视详情页
 */

import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { LargeList } from 'react-native-largelist-v3';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import { mNormalFooter } from "../../components/mNormalFooter";
import NavigationTitleView from '../../components/NavigationTitleView';
import StockFormatText from '../../components/StockFormatText';
import WebChart from '../../components/WebChart';
import BaseComponentPage from '../../pages/BaseComponentPage';
import { toast } from '../../utils/CommonUtils';

export default class XiWeiTouShiPage extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.pageNumber = 1;
        this.state = {
            allLoaded: false, // 数据是否加载完毕
            detailData: {},
            rateOfSuccessData: [], // 席位成功率
            onListDataOfAmount: [], // 上榜数据金额
            onListDataOfTimes: [], // 上榜数据次数
            xieTongListData: [{ items: [] }] // 协同操作列表数据
        }
    }

    componentDidMount() {
        this._loadData();
    }
    componentWillUnmount() {
        this.timeout && clearTimeout(this.timeout);
    }
    _loadXiWeiData() {
        return new Promise(resolve => {
            let branchId = this.props.navigation.state.params.branchId;
            if (!branchId) return;
            let params = { 'branchId': branchId };
            RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/xiweitoushi', params, (x) => {
                if (!x) return;
                let item = {
                    id: x.id,
                    branchId: x.branchId, //席位id
                    branchName: x.branchName, //席位名称
                    branchType: x.branchType, //席位类型
                    style: x.style, //操作风格
                    stars: x.stars, //资金实力
                    win1: x.win1, //次日成功率
                    win3: x.win3, //3日成功率
                    win5: x.win5, //5日成功率
                    win10: x.win10, //10日成功率
                    win20: x.win20, //20日成功率
                    earning1: x.earning1, //次日跟买收益率
                    earning3: x.earning3, //3日跟买收益率
                    earning5: x.earning5, //5日跟买收益率
                    earning10: x.earning10, //10日跟买收益率
                    earning20: x.earning20, //20日跟买收益率
                    risingTimes: x.risingTimes, //上涨上榜次数
                    risingAvgAmt: parseFloat(x.risingAvgAmt / 10000).toFixed(2), //上涨上榜平均金额
                    fallingTimes: x.fallingTimes, //下跌上榜次数
                    fallingAvgAmt: parseFloat(x.fallingAvgAmt / 10000).toFixed(2), //下跌上榜平均金额
                    amplitudeTimes: x.amplitudeTimes, //振幅上榜次数
                    amplitudeAvgAmt: parseFloat(x.amplitudeAvgAmt / 10000).toFixed(2), //振幅上榜平均金额
                    turnoverTimes: x.turnoverTimes, //换手上榜次数
                    turnoverAvgAmt: parseFloat(x.turnoverAvgAmt / 10000).toFixed(2) //换手上榜平均金额
                }
                let rateOfSuccessData = [
                    { name: '次日', value: item.win1 ? item.win1 : 0 },
                    { name: '三日', value: item.win3 ? item.win3 : 0 },
                    { name: '五日', value: item.win5 ? item.win5 : 0 },
                    { name: '十日', value: item.win10 ? item.win10 : 0 },
                    { name: '二十日', value: item.win20 ? item.win20 : 0 },
                ];
                let onListDataOfAmount = [
                    item.risingAvgAmt ? item.risingAvgAmt : 0,
                    item.fallingAvgAmt ? item.fallingAvgAmt : 0,
                    item.amplitudeAvgAmt ? item.amplitudeAvgAmt : 0,
                    item.turnoverAvgAmt ? item.turnoverAvgAmt : 0
                ];
                let onListDataOfTimes = [
                    item.risingTimes,
                    item.fallingTimes,
                    item.amplitudeTimes,
                    item.turnoverTimes
                ];
                resolve({ detailData: item, rateOfSuccessData: rateOfSuccessData, onListDataOfAmount: onListDataOfAmount, onListDataOfTimes: onListDataOfTimes });
            }, (error) => {
                toast(error);
            })
        });
    };

    _loadXieTongData() {
        return new Promise(resolve => {
            let branchId = this.props.navigation.state.params.branchId;
            if (!branchId) return;
            let params = { 'sortField': 'combinationTimes', 'desc': true, 'branchId': branchId, 'pageNum': this.pageNumber, 'pageSize': 20 };
            RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/xietongcaozuo', params, (x) => {
                if (!x) return;
                let list = x.list;
                resolve({ xieTongListData: list, pages: x.pages });
            }, (error) => {
                toast(error);
            })
        });
    };

    async _loadData() {
        const xiWei = this._loadXiWeiData();
        const xieTong = this._loadXieTongData();
        let x = await xiWei;
        let y = await xieTong;
        this.setState({
            detailData: x.detailData,
            rateOfSuccessData: x.rateOfSuccessData,
            onListDataOfAmount: x.onListDataOfAmount,
            onListDataOfTimes: x.onListDataOfTimes,
            xieTongListData: [{ items: y.xieTongListData }],
            allLoaded: this.pageNumber >= y.pages
        }, () => {
            this.refs.list.endLoading();
        });
    }
    _loadMoreData = () => {
        this.pageNumber = this.pageNumber + 1;
        this._loadXieTongData().then(x => {
            let oldData = this.state.xieTongListData[0].items;
            oldData = oldData.concat(x.xieTongListData);
            this.setState({ xieTongListData: [{ items: oldData }], allLoaded: this.pageNumber >= x.pages }, () => {
                this.refs.list.endLoading();
            });
        }).catch(() => {

        });
    }
    _clickXiWeiHistory() {
        let branchId = this.props.navigation.state.params.branchId;
        if (!branchId) return;
        Navigation.pushForParams(this.props.navigation, 'XiWeiHistoryListPage', { branchId: branchId });
    }
    _renderHeaderInfo() {
        let color = '#0084FF';
        if (this.state.detailData && this.state.detailData.branchType == '机构席位') {
            color = '#FF8400';
        } else if (this.state.detailData && this.state.detailData.branchType == '龙头席位') {
            color = '#FF2C99'
        }
        return (
            <>
                <View style={{ height: 8, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                <View style={{ backgroundColor: '#fff', paddingLeft: 15, paddingRight: 15, paddingBottom: 15, paddingTop: 10 }}>
                    <Text style={{ fontSize: 20, lineHeight: 25, fontWeight: 'bold' }} numberOfLines={2}>{this.state.detailData && this.state.detailData.branchName}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 20 }}>
                        <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                            {this._renderStarItem(this.state.detailData && this.state.detailData.stars)}
                            <Text style={{ marginTop: 6, fontSize: 12, color: '#00000066', textAlign: 'center' }}>资金规模</Text>
                        </View>
                        <View style={{ width: 1, height: 31, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                        <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: color, textAlign: 'center' }}>{this.state.detailData && this.state.detailData.branchType}</Text>
                            <Text style={{ fontSize: 12, color: '#00000066', textAlign: 'center', marginTop: 6 }}>席位类型</Text>
                        </View>
                    </View>
                </View>
            </>
        )
    }
    _renderStarItem(stars) {
        let array = [];
        for (let i = 0; i < 5; i++) {
            if (i < stars) {
                array.push(1);
            } else {
                array.push(0);
            }
        }
        return (
            <View style={{ width: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                {array.map((idx, index) =>
                    <Image key={index} style={{ width: 14, height: 14 }} source={idx == 1 ? require('../../images/icons/star_selected_icon.png') : require('../../images/icons/star_unselected_icon.png')}></Image>
                )}
            </View>
        )
    }

    _renderItem = (path) => {
        let data = this.state.xieTongListData[0].items[path.row];
        let secNames = data.secNames.split(',');
        let stocks = [];
        if (secNames.length > 3) {
            stocks.push(secNames[0]);
            stocks.push(secNames[1]);
            stocks.push(secNames[2]);
        } else {
            stocks = secNames;
        }
        stocks = stocks.map(value => {
            return value.split(';')[0];
        });
        return (
            <View style={{ paddingLeft: 15, paddingRight: 15, flexDirection: 'row', borderBottomColor: '#F1F1F1', borderBottomWidth: 1, alignItems: 'center', backgroundColor: 'white' }}>
                <Text style={{ flex: 1.68, fontSize: 12, color: '#000000cc', lineHeight: 15, paddingRight: 10 }} numberOfLines={2} >{data && data.oneBranchName}</Text>
                <StockFormatText style={{ flex: 0.76, fontSize: 15, fontWeight: 'bold', color: '#000000cc' }} unit={'次/万/亿'} >{data && data.combinationTimes}</StockFormatText>
                <View style={{ flex: 0.56, justifyContent: 'center', alignItems: 'flex-end' }}>
                    {
                        stocks.map((value, index) => {
                            return (
                                <Text key={index} style={{ fontSize: 12, fontWeight: 'bold', color: '#000000cc', textAlign: 'center', marginTop: Platform.OS == 'ios' ? 2 : 0 }} >{value}</Text>
                            );
                        })
                    }
                </View>
            </View >
        );
    };

    // 取整，大于0向上取整，小于0向下取整
    _round(x) {
        if (x == 0) return 0;
        return x > 0 ? Math.ceil(x) : Math.floor(x);
    }

    _renderChart_A() {
        let data = this.state.rateOfSuccessData;
        let rateOfValues = [];
        data.forEach(element => {
            rateOfValues.push(element.value);
        });
        rateOfValues.sort(function (a, b) { return a - b; });
        rateOfValues.reverse();
        let rateOfMax = Math.ceil(rateOfValues[0]);
        let rateOfMin = this._round(rateOfValues[rateOfValues.length - 1] > 0 ? 0 : rateOfValues[rateOfValues.length - 1]);
        const interval = Math.ceil((rateOfMax + Math.abs(rateOfMin)) / 2); // y轴显示三个刻度值，即 最小值、中间值、最大值

        let seriesData = [];
        data.forEach(element => {
            seriesData.push({ value: element.value, itemStyle: { normal: { color: element.value > 0 ? '#FF3333' : '#339900' } } });
        });
        return (
            <View style={{ backgroundColor: '#fff' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, marginLeft: 12 }}>
                    <View style={{ width: 3, height: 14, backgroundColor: '#F92400' }}></View>
                    <Text style={{ marginLeft: 5, fontSize: 15, color: '#000000cc' }}>席位成功率</Text>
                </View>
                <Text style={{ marginLeft: 12, fontSize: 11, marginTop: 10, color: '#00000066' }}>单位: %</Text>
                {data.length > 0 ?
                    <WebChart
                        style={{ marginTop: 5, width: baseStyle.width, height: 120 }}
                        option={{
                            grid: {
                                left: 30,
                                right: 15,
                                bottom: 20,
                                top: 18,
                            },
                            xAxis: {
                                data: ['次日', '三日', '五日', '十日', '二十日'],
                                type: 'category',
                                show: true,
                                position: 'bottom',
                                axisTick: {
                                    show: false,
                                },
                                axisLabel: {
                                    margin: 5,
                                    color: '#00000066',
                                    fontSize: 11,
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0,0,0,0.1)'
                                    }
                                },
                            },
                            yAxis: {
                                type: 'value',
                                max: rateOfMax,
                                min: rateOfMin,
                                minInterval: 1,
                                interval: interval,
                                axisTick: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                },
                                axisLabel: {
                                    color: '#00000066',
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgba(0,0,0,0.1)'
                                    }
                                },
                            },
                            series: [{
                                label: {
                                    show: true,
                                    position: 'top',
                                    distance: Platform.OS == 'ios' ? 13 : 2,
                                    color: '#00000099'
                                },
                                data: seriesData,
                                type: 'bar',
                                barWidth: 20,
                            }],
                        }}
                    />
                    : null}
            </View>
        )
    }
    _getMaxValue(array) {
        let values = array.slice(0);
        values.sort(function (a, b) { return a - b });
        values.reverse();
        return Math.ceil(values[0]);
    }
    // 绘制上榜数据
    _renderOnListChart() {
        let amountMax = this._getMaxValue(this.state.onListDataOfAmount);
        let timesMax = this._getMaxValue(this.state.onListDataOfTimes);
        return (
            <View style={{ backgroundColor: '#fff' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, marginLeft: 15 }}>
                    <View style={{ width: 3, height: 14, backgroundColor: '#F92400' }}></View>
                    <Text style={{ marginLeft: 5, fontSize: 15, color: '#000000cc' }}>上榜数据</Text>
                </View>
                <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                    <Text style={{ marginLeft: 12, fontSize: 11, color: '#00000066' }}>单位: 万</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#0099FF' }}></View>
                        <Text style={{ fontSize: 11, color: '#00000066', marginLeft: 5 }}>平均上榜金额</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFF00' }}></View>
                        <Text style={{ fontSize: 11, color: '#00000066', marginLeft: 5 }}>上榜次数</Text>
                    </View>
                    <Text style={{ marginLeft: 12, fontSize: 11, color: '#00000066' }}>单位: 次</Text>
                </View>
                <WebChart
                    style={{ marginTop: 5, width: baseStyle.width, height: 120 }}
                    option={{
                        grid: {
                            left: 35,
                            right: 35,
                            bottom: 20,
                            top: 18,
                        },
                        xAxis: {
                            type: 'category',
                            data: ['上涨上榜', '下跌上榜', '振幅上榜', '换手上榜'],
                            show: true,
                            position: 'bottom',
                            axisTick: {
                                show: false,
                            },
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(0,0,0,0.1)'
                                }
                            },
                            axisLabel: {
                                margin: 5,
                                color: '#00000066',
                                fontSize: 11,
                            },
                        },
                        yAxis: [{
                            type: 'value',
                            max: amountMax,
                            interval: Math.ceil(amountMax / 2), // 金额y轴显示三个刻度值，即 0、中间值、最大值
                            splitLine: {
                                show: false,
                            },
                            axisTick: {
                                show: false,
                            },
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(0,0,0,0.1)'
                                }
                            },
                            axisLabel: {
                                color: '#00000066',
                                fontSize: 11,
                            },
                        }, {
                            type: 'value',
                            max: timesMax,
                            interval: Math.ceil(timesMax / 2),
                            splitLine: {
                                show: false,
                            },
                            axisTick: {
                                show: false,
                            },
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(0,0,0,0.1)'
                                }
                            },
                            axisLabel: {
                                color: '#00000066',
                                fontSize: 11,
                            },
                        }],
                        series: [{
                            type: 'bar',
                            data: this.state.onListDataOfAmount,
                            label: {
                                show: true,
                                position: 'top',
                                distance: Platform.OS == 'ios' ? 13 : 2,
                                color: '#00000099'
                            },
                            itemStyle: {
                                color: '#0099FF',
                            },
                            barGap: '50%',
                            barWidth: 23
                        }, {
                            yAxisIndex: 1,
                            type: 'bar',
                            data: this.state.onListDataOfTimes,
                            label: {
                                show: true,
                                position: 'top',
                                distance: Platform.OS == 'ios' ? 13 : 2,
                                color: '#00000099'
                            },
                            itemStyle: {
                                color: '#FFFF00',
                            },
                            barGap: '50%',
                            barWidth: 23
                        }]
                    }}
                >
                </WebChart>
            </View>
        );
    }
    _renderHeader = () => {
        return (
            <View>
                {this._renderHeaderInfo()}
                <View style={{ height: 8, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                {this._renderChart_A()}
                <View style={{ height: 8, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                {this._renderOnListChart()}
                <View style={{ height: 8, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                <View style={{ height: 40, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' }}>
                    <View style={{ marginLeft: 15, width: 3, height: 14, backgroundColor: '#F92400' }}></View>
                    <Text style={{ marginLeft: 5, fontSize: 15, color: '#000000cc' }}>协同操作</Text>
                </View>
                <View style={{ height: 30, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4FAFF', paddingLeft: 15, paddingRight: 15 }}>
                    <Text style={{ flex: 1.68, color: '#00000099', fontSize: 12, paddingRight: 10 }}>买入营业部名称</Text>
                    <Text style={{ flex: 0.76, color: '#00000099', fontSize: 12 }}>协同次数</Text>
                    <Text style={{ flex: 0.56, color: '#00000099', fontSize: 12, textAlign: 'right' }}>操作股票</Text>
                </View>
            </View>
        )
    }
    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'席位透视'} rightTopView={
                    <TouchableOpacity style={{ width: 100, height: 44, marginRight: 10, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this._clickXiWeiHistory()}>
                        <Text style={{ fontSize: 15, color: '#000000cc' }}>席位历史数据</Text>
                    </TouchableOpacity>
                } />
                <LargeList
                    ref='list'
                    style={{ flex: 1, backgroundColor: baseStyle.LINE_BG_F1 }}
                    data={this.state.xieTongListData}
                    allLoaded={this.state.allLoaded}
                    heightForIndexPath={() => 60}
                    renderHeader={this._renderHeader}
                    renderIndexPath={this._renderItem}
                    loadingFooter={mNormalFooter}
                    onLoading={this._loadMoreData}
                />
            </BaseComponentPage>
        )
    }
}