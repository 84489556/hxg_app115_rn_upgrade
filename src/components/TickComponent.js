'use strict';

import React, { Component } from 'react';
import { View, StyleSheet, Platform,FlatList } from 'react-native';

import * as baseStyle from './baseStyle.js';
import BaseComponent from './BaseComponent.js';
import StockFormatText from './StockFormatText.js';
import DateFormatText from './DateFormatText.js';
import ShareSetting from '../modules/ShareSetting.js';
import { connection } from "../pages/Quote/YDYunConnection";

export default class TickList extends BaseComponent {

    static defaultProps = {
        ticks: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            dataSource: null,
        };

        this.lastChengJiaoLiang = 0;
        this.lastChengJiaoDanBiShu = 0;
    }

    getTickNumberOfRequest() {
        let n = 10;

        if (ShareSetting.getDeviceWidthPX() > 1080) {
            n = 25;
        }
        else if (ShareSetting.getDeviceWidthPX() > 720) {
            n = 22;
        }
        else {
            n = 22;
        }

        if (Platform.OS === 'ios')
            n = 22;

        return n;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.ticks !== nextProps.ticks) {
            let len = nextProps.ticks.Data && nextProps.ticks.Data.length;
            if (len === undefined) return;

            let dispDataNumber = this.getTickNumberOfRequest();
            let partData = nextProps.ticks.Data;
            if (len - dispDataNumber > 0) {
                partData = partData.slice(len - dispDataNumber, len);
            }

            this.setState({ dataSource:partData});
        }
    }

    styleSheet = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginBottom: 18,
            marginLeft: 3,
            marginRight: Platform.OS === 'ios' ? 10 : 0
        },
        time: {
            color: baseStyle.WU_DANG_BLACK,
            fontSize: 10,
            ...Platform.select({
                ios: {
                    width: 34,
                },
                android: {
                    flex: 1,
                }
            })
        },
        price: {
            fontSize: 10,
            ...Platform.select({
                ios: {
                    width: 40,
                    textAlign: 'right',
                },
                android: {
                    flex: 1,
                }
            })
        },
        volumn: {
            color: baseStyle.BLUE,
            fontSize: 10,
            ...Platform.select({
                ios: {
                    width: 30,
                    textAlign: 'right',
                },
                android: {
                    flex: 1,
                    textAlign: 'center'
                }
            })
        }
    });

    _renderItem(data) {
        //默认红色
        let clr = baseStyle.RED;
        if (data.MaiMaiFangXiang === 'Buy') {
            clr = baseStyle.RED;
        }
        else if (data.MaiMaiFangXiang === 'Sell') {
            clr = baseStyle.GREEN;
        }

        if (Platform.OS === 'ios') {
            if (data.MaiMaiFangXiang.toString() === '1') {
                clr = baseStyle.RED;
            }
            else if (data.MaiMaiFangXiang.toString() === '0') {
                clr = baseStyle.GREEN;
            }
        }

        let every = data.DanCiChengJiaoLiang;

        return (
            <View style={this.getStyles('container')}>
                <DateFormatText style={this.getStyles('time')} format="HH:mm">{data.ShiJian}</DateFormatText>
                <StockFormatText style={this.getStyles('price', { color: clr })}>{data.ChengJiaoJia}</StockFormatText>
                <StockFormatText style={this.getStyles('volumn')} unit="万/亿"
                    precision={0}>{every / 100}</StockFormatText>
            </View>
        );
    }

    render() {
        if (!this.state.dataSource) {
            return (<View />);
        }
        return (
            <FlatList
                style={{ marginTop: 10 }}
                data={this.state.dataSource}
                renderItem={({item, index, separators}) => this._renderItem(item, separators, index)}
                // renderRow={this._renderItem.bind(this)}
                removeClippedSubviews={false}
            />
        );
    }
}

export class TickComponent extends Component {

    static defaultProps = {
        serviceUrl: '/quote/tick'
    };

    constructor(props) {
        super(props);

        this.defaultParams = {
        };

        this.state = {
            data: []
        }
        this.isDidMount = false;
    }

    componentWillUnmount() {
        this.isDidMount = false;
        this.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    componentDidMount() {
        this.isDidMount = true;
        this._query(this.props);
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this._query(this.props);
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            payload => {
                this.cancel();
            }
        );
    }

    componentWillReceiveProps(nextProps) {
        // 判断是否需要重新订阅数据
        if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
            this._query(nextProps);
        }
    }

    adapt(returndata) {
        //对数据进行处理
        let count = 0;
        let dataArray = [];
        if (Platform.OS === 'ios') {
            count = returndata.entitiesArray_Count;
            dataArray = returndata.entitiesArray;
        } else {
            count = returndata.entitiesCount;
            dataArray = returndata.entitiesList;
        }

        if (count <= 0) {
            return;
        }

        let stateData = [];
        if (this.state.data !== undefined && this.state.data.Data !== undefined) {
            stateData = this.state.data.Data;
        }
        dataArray.map((item) => {
            let tempData = {
                ChengJiaoDanBiShu: 0,
                ChengJiaoE: 0,
                ChengJiaoLiang: 0,
                ChengJiaoJia: item.price,
                DanCiChengJiaoDanBiShu: item.curTradeNumber,
                DanCiChengJiaoE: item.curAmount,
                DanCiChengJiaoLiang: item.curVolume,
                Id: 0,
                MaiMaiFangXiang: item.dir,
                ShiFouZhuDongXingMaiDan: 0,
                ShiJian: item.time,
            };
            stateData.push(tempData);
        });
        //数据追加，最多显示二十条
        let newData = [];
        if (stateData.length > 20) {
            for (let i = stateData.length - 20; i < stateData.length; i++) {
                newData.push(stateData[i]);
            }
        } else {
            newData = stateData;
        }
        let adaptData = [];
        adaptData.push({ "Obj": returndata.label, "QingPan": "0", "Data": newData });
        return adaptData && adaptData[0];
    }
    cancel() {
        this.requestTicks && this.requestTicks.cancel();
        this.requestTicks = null;
    }
    _requery() {
        this._query(this.props);
    }
    _query(props) {
        // 取消上次请求
        // this.cancel();

        // 重新请求
        if (props.params) {
            //label 股票代码 ，date 0代表取当天分笔数据（其他传时间戳），start 行筛选，从0开始计数。例如0表示从第1行开始，-1表示最后一行开始，7表示从第8行开始。
            //time 行筛选，Time!=0时, 表示从Time所在数据行开筛选，此时不走start逻辑， 该行数据不返回。count 行筛选，表示从start的位置筛选多少行数据（包括start) ,subscribe 是否订阅
            this.requestTicks = connection.request('FetchTicksNative', { label: props.params.obj, date: 0, start: -1, time: 0, count: -20, subscribe: true }, (returndata) => {
                Promise.resolve(this.adapt(returndata)).then((data) => {
                    if (this.isDidMount == true) {
                        if (data !== false) {
                            this.setState({ data });
                        }
                        // 触发事件
                        let onData = this.props.onData;
                        (typeof onData === 'function') && onData(data);
                    }
                });

            });
            return this.requestTicks;
        }
    }
    render() {
        return <TickList ticks={this.state.data} />;
    }
}
