/**
 * 买卖盘组件
 */
'use strict';

import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

import * as baseStyle from './baseStyle.js';
import BaseComponent from '../pages/BaseComponentPage';
import StockFormatText from './StockFormatText.js';
import { connection } from '../pages/Quote/YDYunConnection';



export default class BuySellComponent extends BaseComponent {
    static defaultProps = {
        data: {}
    };
    styleSheet = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            // marginTop: 10,
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: Platform.OS === 'ios' ? 10 : 10,
            justifyContent: Platform.OS === 'ios' ? 'space-around' : 'space-between',
        },
        cell: {
            color: baseStyle.WU_DANG_TEXT_COLOR,
            fontSize: 10,
            // ...Platform.select({
            //     ios: {
            //         flex: 0,
            //         width: 20,
            //     }
            // }),
        },
        price: {
            ...Platform.select({
                ios: {
                    width: 40,
                    textAlign: 'right'
                }
            }),
        },
        priceUp: {
            color: baseStyle.UP_COLOR,
        },
        priceDown: {
            color: baseStyle.DOWN_COLOR,
        },
        volume: {
            textAlign: 'center',
            ...Platform.select({
                ios: {
                    width: 30,
                    textAlign: 'right'
                }
            }),
        },
        split: {
            borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR,
            borderBottomWidth: 1
        }
    });

    _renderItem(title, price, volumn) {

        let fColor = { color: baseStyle.WU_DANG_VOLUMN_TEXT_COLOR };
        let up = (price || 0) - (this.props.data.ZuoShou || 0);
        let tempVolumn = volumn && volumn / 100;
        if (price <= 0 || price === undefined) {
            price = '--';
            if (tempVolumn === undefined) {
                tempVolumn = '-- ';
            }
        }
        let textColor = baseStyle.WU_DANG_VOLUMN_TEXT_COLOR;
        if (up > 0) {
            textColor = baseStyle.UP_COLOR;
        } else {
            textColor = baseStyle.DOWN_COLOR;
        }
        return (
            <View key={title} style={[this.styleSheet.row, { paddingLeft: Platform.OS === 'ios' ? 2 : 5, paddingRight: Platform.OS === 'ios' ? 3 : 0 }]}>
                <Text style={this.styleSheet.cell}>{title}</Text>
                <StockFormatText
                    style={[this.styleSheet.cell, { color: textColor }]}>{price}</StockFormatText>
                <StockFormatText style={[this.styleSheet.cell, this.styleSheet.volume, fColor]} unit="万/亿"
                    precision={0}>{tempVolumn}</StockFormatText>
            </View>
        );
    }

    _renderSellList() {
        return [5, 4, 3, 2, 1].map(num => this._renderItem(`卖${num}`, this.props.data[`WeiTuoMaiChuJia${num}`], this.props.data[`WeiTuoMaiChuLiang${num}`]));
    }

    _renderBuyList() {
        return [1, 2, 3, 4, 5].map(num => this._renderItem(`买${num}`, this.props.data[`WeiTuoMaiRuJia${num}`], this.props.data[`WeiTuoMaiRuLiang${num}`]));
    }

    render() {
        return (
            <View style={this.styleSheet.container}>
                {this._renderSellList()}
                <View
                    style={{
                        backgroundColor: baseStyle.DEFAULT_BORDER_COLOR,
                        height: 1,
                        // marginTop: -8,
                        // marginBottom: 10,
                        marginRight: 15
                    }}
                />
                {this._renderBuyList()}
            </View>
        );
    }
}

export class DZHYunBuySellComponent extends Component {

    static defaultProps = {
    };

    constructor(props) {
        super(props);

        this.defaultParams = {
            sub: true,
        };
        this.state = {
            data: []
        }
        this.isDidMount=false;
        this.hadRequest=false;//是否已经请求过行情,防止接收父类属性方法和得到焦点重复请求行情 
    }
    
    componentWillUnmount() {
        this.isDidMount=false;
        this.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    componentDidMount() {
        this.isDidMount=true;
        this._query(this.props);
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            payload => {
                if(this.hadRequest==false){
                  this._query(this.props);
                }
                this.hadRequest=false;
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            payload => {
                this.hadRequest=false;
                this.cancel();
            }
        );
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
            this.hadRequest=true;
            this._query(nextProps);
        }
    }

    adapt(returndata) {
        let data = [];
        if (!returndata) return;
        // 注意此处的fp要区分平台，iOS皆为小写(fp), Android为(fP)
        let fpTrading = Platform.OS === 'ios' ? returndata.fpStatus == 23 : returndata.fPStatus == 'FP_TRADING';

        if (fpTrading) {
            let temp1 = {
                Obj: returndata.label,
                WeiTuoMaiChuJia1: returndata.price,
                WeiTuoMaiChuJia2: undefined,
                WeiTuoMaiChuJia3: undefined,
                WeiTuoMaiChuJia4: undefined,
                WeiTuoMaiChuJia5: undefined,
                WeiTuoMaiChuLiang1: ((Platform.OS === 'ios') ? returndata.fpSellVolume : returndata.fPSellVolume),
                WeiTuoMaiChuLiang2: undefined,
                WeiTuoMaiChuLiang3: undefined,
                WeiTuoMaiChuLiang4: undefined,
                WeiTuoMaiChuLiang5: undefined,
                WeiTuoMaiRuJia1: returndata.price,
                WeiTuoMaiRuJia2: undefined,
                WeiTuoMaiRuJia3: undefined,
                WeiTuoMaiRuJia4: undefined,
                WeiTuoMaiRuJia5: undefined,
                WeiTuoMaiRuLiang1: ((Platform.OS === 'ios') ? returndata.fpBuyVolume : returndata.fPBuyVolume),
                WeiTuoMaiRuLiang2: undefined,
                WeiTuoMaiRuLiang3: undefined,
                WeiTuoMaiRuLiang4: undefined,
                WeiTuoMaiRuLiang5: undefined,
                XuHao: 0,//接口没有此字段，设置0
                ZuoShou: returndata.preClose,//接口没有此字段，设置0
                price: returndata.price,
                fPStatus: returndata.fPStatus,
                fPBuyVolume: returndata.fPBuyVolume,
                fPSellVolume: returndata.fPSellVolume,
            };

            data.push(temp1);
            return data && data[0];
        }

        let temp = {
            Obj: returndata.label,
            WeiTuoMaiChuJia1: returndata.sellPrice1,
            WeiTuoMaiChuJia2: returndata.sellPrice2,
            WeiTuoMaiChuJia3: returndata.sellPrice3,
            WeiTuoMaiChuJia4: returndata.sellPrice4,
            WeiTuoMaiChuJia5: returndata.sellPrice5,
            WeiTuoMaiChuLiang1: returndata.sellVolume1,
            WeiTuoMaiChuLiang2: returndata.sellVolume2,
            WeiTuoMaiChuLiang3: returndata.sellVolume3,
            WeiTuoMaiChuLiang4: returndata.sellVolume4,
            WeiTuoMaiChuLiang5: returndata.sellVolume5,
            WeiTuoMaiRuJia1: returndata.buyPrice1,
            WeiTuoMaiRuJia2: returndata.buyPrice2,
            WeiTuoMaiRuJia3: returndata.buyPrice3,
            WeiTuoMaiRuJia4: returndata.buyPrice4,
            WeiTuoMaiRuJia5: returndata.buyPrice5,
            WeiTuoMaiRuLiang1: returndata.buyVolume1,
            WeiTuoMaiRuLiang2: returndata.buyVolume2,
            WeiTuoMaiRuLiang3: returndata.buyVolume3,
            WeiTuoMaiRuLiang4: returndata.buyVolume4,
            WeiTuoMaiRuLiang5: returndata.buyVolume5,
            XuHao: 0,//接口没有此字段，设置0
            ZuoShou: returndata.preClose,//接口没有此字段，设置0
            price: returndata.price,
            fPStatus: returndata.fPStatus,
            fPBuyVolume: returndata.fPBuyVolume,
            fPSellVolume: returndata.fPSellVolume,
        };
        data.push(temp);
        return data && data[0];
    }
    cancel() {
        if (this.requestBuySell && this.requestBuySell.qid && this.props.params.obj) {
            connection.unregister(this.requestBuySell.qid, this.props.params.obj);
        }
    }
    _requery() {
        // console.log('stock-http---netChange--getWuDangIndex-_query--');
        this._query(this.props);
    }
    _query(props) {
        // this.cancel();
        if (props.params && props.params.obj) {
            this.obj = props.params.obj;
            this.requestBuySell = connection.register('FetchFullQuoteNative', props.params.obj,
                (returndata) => {
                    if (returndata.quote.label === this.obj) {
                        Promise.resolve(this.adapt(returndata.quote)).then((data) => {
                            if(this.isDidMount==true){
                                if (data !== false) {
                                    this.setState({ data });
                                }
                                // 触发事件
                                let onData = this.props.onData;
                                (typeof onData === 'function') && onData(data);
                           }
                        });
                    }
                });
            return this.requestBuySell;
        }
    }
    render() {
        return <BuySellComponent data={this.state.data} />;
    }
}
