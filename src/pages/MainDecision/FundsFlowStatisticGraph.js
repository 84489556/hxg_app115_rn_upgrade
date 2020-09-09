/*
 * @Author: lishuai 
 * @Date: 2019-08-27 13:47:18 
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-11-25 19:34:25
 * 资金流向统计饼图
 */
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
//import RootSiblings from 'react-native-root-siblings';
import TranslucentModal from 'react-native-translucent-modal';
import * as baseStyle from '../../components/baseStyle';
import StockFormatText from '../../components/StockFormatText';
import WebChart from '../../components/WebChart';
import BaseComponentPage from '../../pages/BaseComponentPage';

//let sibling = null;

export default class FundsFlowStatisticGraph extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            data: {},
        }
    }

    componentDidMount() {
       // this.props.onDidMount && this.props.onDidMount();
    }

    _renderChart(chartData) {
        let gridWidth = (baseStyle.width / 2);
        let webChartHeight = baseStyle.width * 0.667;
        let colors = ['#0A4B2A', '#018040', '#01AA55', '#01D56A', '#FF2D4B', '#CC243C', '#991B2D', '#66121E'];
        return (
            <WebChart
                style={{ marginTop: 15, width: baseStyle.width, height: webChartHeight }}
                option={{
                    grid: {
                        left: (baseStyle.width - gridWidth) / 2,
                        top: (webChartHeight - gridWidth) / 2,
                        width: gridWidth,
                        height: gridWidth,
                    },
                    color: colors,
                    series: [{
                        type: 'pie',
                        radius: gridWidth / 2,
                        center: [baseStyle.width / 2, webChartHeight / 2],
                        data: chartData,
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 1,
                        },
                        hoverOffset: 0,
                        label: {
                            show: true,
                            position: 'outside',
                            color: '#00000099',
                            fontSize: 12,
                        },
                    }]
                }}
            >
            </WebChart>
        );
    }

    show(data) {
        this.setState({ visible: true, data: data });
    }

    hidden() {
        this.props.hiddenCallback && this.props.hiddenCallback();
        this.setState({ visible: false });
       // sibling.destroy();
    }
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
    render() {
        let data = this.state.data;
        let textColor = this._getStockTextColor(data.hugeIn && data.hugeOut ? parseFloat(data.hugeIn - data.hugeOut) : 0);
        let chartData = [
            { value: data.superOut && data.superOut, name: '超大单流出' },
            { value: data.largeOut && data.largeOut, name: '大单流出' },
            { value: data.mediumOut && data.mediumOut, name: '中单流出' },
            { value: data.littleOut && data.littleOut, name: '小单流出' },
            { value: data.littleIn && data.littleIn, name: '小单流入' },
            { value: data.mediumIn && data.mediumIn, name: '中单流入' },
            { value: data.largeIn && data.largeIn, name: '大单流入' },
            { value: data.superIn && data.superIn, name: '超大单流入' }
        ];
        return ( this.state.visible ?
            <TranslucentModal animationType={'none'} transparent={true} visible={true} onRequestClose={() => { this.hidden() }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} >
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => this.hidden()}></TouchableOpacity>
                <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingBottom: baseStyle.isIPhoneX ? 44 : 10 }}>
                    <TouchableOpacity style={{ height: 45, alignItems: 'center' }} activeOpacity={1} onPress={() => this.hidden()}>
                        <Image style={{ width: 18, height: 18 }} source={require('../../images/icons/funds_flow_arrow_icon.png')}></Image>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, color: '#000000', textAlign: 'center' }}>{data.ZhongWenJianCheng && data.ZhongWenJianCheng} {data.Obj && data.Obj}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingTop: 25, paddingBottom: 5 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#000000' }}>主力流入</Text>
                            <StockFormatText style={{ fontSize: 12, marginTop: 5, color: '#FF3333' }} unit={'元/万/亿'}>{data.hugeIn && parseFloat(data.hugeIn)}</StockFormatText>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#000000' }}>主力流出</Text>
                            <StockFormatText style={{ fontSize: 12, marginTop: 5, color: '#00CC66' }} unit={'元/万/亿'}>{data.hugeOut && parseFloat(data.hugeOut)}</StockFormatText>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#000000' }}>主力净流入</Text>
                            <StockFormatText style={{ fontSize: 12, marginTop: 5, color: textColor }} unit={'元/万/亿'}>{data.hugeIn && data.hugeOut ? parseFloat(data.hugeIn - data.hugeOut) : 0}</StockFormatText>
                        </View>
                    </View>
                    {this._renderChart(chartData)}
                    <View style={{ flexDirection: 'row', backgroundColor: '#F2FAFF', height: 30, marginTop: 20, alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ width: baseStyle.width / 3 }} ></View>
                        <View style={{ width: baseStyle.width / 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ backgroundColor: '#FF3333', width: 5, height: 5, borderRadius: 5 / 2 }}></View>
                            <Text style={{ fontSize: 12, color: '#00000099', marginLeft: 3 }}>流入</Text>
                        </View>
                        <View style={{ width: baseStyle.width / 3, flexDirection: 'row', alignItems: 'center', marginLeft: 30 }}>
                            <View style={{ backgroundColor: '#00CC66', width: 5, height: 5, borderRadius: 5 / 2 }}></View>
                            <Text style={{ fontSize: 12, color: '#00000099', marginLeft: 3 }}>流出</Text>
                        </View>
                    </View>
                    {this._renderItem({ title: '超大单', in: data.superIn && data.superIn, out: data.superOut && data.superOut })}
                    {this._renderItem({ title: '大单', in: data.largeIn && data.largeIn, out: data.largeOut && data.largeOut })}
                    {this._renderItem({ title: '中单', in: data.mediumIn && data.mediumIn, out: data.mediumOut && data.mediumOut })}
                    {this._renderItem({ title: '小单', in: data.littleIn && data.littleIn, out: data.littleOut && data.littleOut })}
                </View>
            </View>
        </TranslucentModal> : null)

    }

    _renderItem(item) {
        return (
            <View style={{ flexDirection: 'row', backgroundColor: '#ffffff', height: 30, alignItems: 'center', justifyContent: 'space-between', borderBottomColor: '#0000001a', borderBottomWidth: 1 }}>
                <Text style={{ paddingLeft: 20, fontSize: 12, color: '#000000cc', width: baseStyle.width / 3 }} >{item.title}</Text>
                <StockFormatText style={{ fontSize: 12, color: '#FF3333', width: baseStyle.width / 3, textAlign: 'center' }} unit={'万/亿'}>{item.in && parseFloat(item.in)}</StockFormatText>
                <StockFormatText style={{ paddingLeft: 30, fontSize: 12, color: '#00CC66', width: baseStyle.width / 3 }} unit={'万/亿'}>{item.out && parseFloat(item.out)}</StockFormatText>
            </View>
        )
    }
}
