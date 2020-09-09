/**
 * 详情页顶部报价栏
 */
'use strict';
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    NativeEventEmitter,
    NativeModules,
    Platform,
    DeviceEventEmitter,
} from 'react-native';

import BaseComponent from './BaseComponent.js';
import StockFormatText from './StockFormatText.js';
import * as baseStyle from './baseStyle.js';
import RATE from '../utils/fontRate';
import { connection } from '../pages/Quote/YDYunConnection';

const EventEmitter = new NativeEventEmitter(NativeModules.YDYunChannelModule);
const UP_STYLE = {
    color: baseStyle.UP_COLOR
},
    DOWN_STYLE = {
        color: baseStyle.DOWN_COLOR
    };

export default class StockPriceView extends Component {
    static defaultProps = {
        serviceUrl: '/stkdata',
        preClicked: () => { },
        nextClicked: () => { },
        type: 0
    };

    defaultParams = {
        sub: 1,
        field: [
            'ZhongWenJianCheng',
            'ZuiXinJia',
            'ZhangDie',
            'ZhangFu',
            'LeiXing'
        ]
    };

    constructor(props) {
        super(props);
        this.loadedDataCallback = this.props.loadedDataCallback;
        this.state = {
            data: props.dynaData, // 总体数据来源//外层的State全部传入进去了
            priceboxData: props.priceboxData, // 点击十字线数据
            previousPriceboxData: props.previousPriceboxData // 十字线消失数据，之前记录的数据
        };
        this.isDidMount=false;
        this.hadRequest=false;//是否已经请求过行情,防止接收父类属性方法和得到焦点重复请求行情 

    }

    componentWillUnmount() {
        this.isDidMount=false;
        this.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
        this.YDMinChartGetDataError && this.YDMinChartGetDataError.remove();
        this.retryTimer && clearTimeout(this.retryTimer)
    }

    componentDidMount() {
        this.isDidMount=true;
        this._query(this.props);
        this.YDMinChartGetDataError = DeviceEventEmitter.addListener('YDMinChartGetDataError',()=>{
            if (Platform.OS == 'ios') {                
                this._requery();
            } 
        })


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

        // 判断是否需要重新订阅数据
        if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
            this.hadRequest=true;
            this._query(nextProps);
        }
        if (this.props !== nextProps) {
            this.setState({
                priceboxData: nextProps.priceboxData,
                previousPriceboxData: nextProps.previousPriceboxData
            });
        }
    }

    adapt(returnData) {
        let data = this._detailData(returnData);
        return data && data[0];
    }

    /**
     * 处理数据
     * @param data
     * @returns {*}
     * @private
     */
    _detailData(data) {
        let adaptData = [];
        let stockMessage = {};
        if (data) {
            stockMessage.ZhongWenJianCheng = data.name;
            stockMessage.ZuiXinJia = data.price;
            stockMessage.ZhangDie = data.increase;
            stockMessage.ZhangFu = data.increaseRatio;
            stockMessage.Obj = data.label;
            stockMessage.ShiFouTingPai = data.status;
            adaptData.push(stockMessage);
        }
        return adaptData;
    }

    cancel() {
        if (this._request && this._request.qid && this.props.params.obj) {
            connection.unregister(this._request.qid, this.props.params.obj);
        }
    }
    _requery(){
        this._query(this.props);
    }
    
    _query(props) {
        // this.cancel();
        // console.log('stock-http:='+'stockPrice qurey' )
        if (props.params && props.params.obj) {
            this.obj = props.params.obj;
            let count = 0; // 失败重试的次数记录

            this._request = connection.register('FetchFullQuoteNative', props.params.obj,
                (returndata) => {
                    if (!(returndata instanceof Error)&&this.isDidMount==true) {         
                        if(Object.keys(returndata).length == 0){
                            //console.log('股票详情页面 FetchFullQuoteNative 回调的数据error 第',count,'次重试' )
                            if (count < 5) { // 如果失败  那么就重试五次 每三秒重试一次（此策略用来解决APP放置后台一段时间后重连数据不刷新的问题）
                              let time = count == 0 ? 0 : 3000  // 第一次立马重试，然后间隔3s 
                              this.retryTimer =  setTimeout(() => {
                                this.query();  
                                count++
                              }, time);  
                            } 
                          }               
                        if (returndata.quote.label === this.obj) {
                            count = 0 // 成功后复位计数
                            Promise.resolve(this.adapt(returndata.quote)).then((data) => {
                                // console.log('stock-http:='+'stockPrice qurey finish' )
                                this.loadedDataCallback && this.loadedDataCallback(data.ShiFouTingPai);
                                if (data !== false) {
                                    this.setState({ data });
                                }
                                // 触发事件
                                let onData = this.props.onData;
                                (typeof onData === 'function') && onData(data);
                            });
                        }
                    }
                });
        }

    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState;
    }

    render() {
        return (
            <StockPriceBar
                dynaData={this.state.data}
                isHorz={this.props.isHorz}
                type={this.props.type}
                checkPriceData={this.state.priceboxData}
                previousCheckPriceData={this.state.previousPriceboxData}
                preClicked={this.props.preClicked}
                nextClicked={this.props.nextClicked}
            />
        );
    }
}

class StockPriceBar extends BaseComponent {
    static defaultProps = {
        dynaData: {},
        preClicked: () => { },
        nextClicked: () => { },
        type: 0
    };

    constructor(props) {
        super(props);
    }

    styleSheet = StyleSheet.create(
        Object.assign(
            {
                container: {
                    flex: 1,
                    flexDirection: 'row'
                    //borderBottomWidth: 1,
                    //borderBottomColor: baseStyle.SPLIT_LINE_COLOR
                },
                priceContainer: {
                    flexDirection: 'row'
                    //alignItems: 'center',
                    //justifyContent: 'flex-start'
                },
                price: {
                    fontSize: 36,
                    margin: 10,
                    marginTop: 5,
                    marginBottom: 5,
                    color: baseStyle.DEFAULT_TEXT_COLOR
                },
                updn: {
                    fontSize: RATE(30),
                    color: baseStyle.DEFAULT_TEXT_COLOR
                },
                updnRatio: {
                    marginLeft: 10,
                    fontSize: 12,
                    color: baseStyle.DEFAULT_TEXT_COLOR
                },
                time: {
                    marginLeft: 10,
                    fontSize: 12,
                    color: baseStyle.DEFAULT_TEXT_COLOR
                },
                grid: {
                    flex: 1,
                    //alignItems: 'center',
                    justifyContent: 'center'
                },
                row: {
                    flexDirection: 'row'
                },
                cell: {
                    flex: 1,
                    flexDirection: 'row'
                    //padding: 3,
                },
                cellText: {
                    color: baseStyle.DEAULT_TEXT_COLOR,
                    textAlign: 'left',
                    fontSize: 12,
                    margin: 2
                }
            },
            Object.assign.apply(
                Object,
                ['price', 'updn', 'updnRatio'].map(name => {
                    return {
                        [`${name}Up`]: UP_STYLE,
                        [`${name}Down`]: DOWN_STYLE
                    };
                })
            )
        )
    );

    render() {
        let clr = baseStyle.DOWN_COLOR;
        if (this.props.dynaData.ZhangFu > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (this.props.dynaData.ZhangFu === 0) {
            clr = baseStyle.SMALL_TEXT_COLOR;
        }

        //查价
        let zd = 0;
        let zf = 0;
        if (this.props.checkPriceData) {
            if (this.props.previousCheckPriceData) {
                zd = this.props.checkPriceData.ShouPanJia - this.props.previousCheckPriceData.ShouPanJia;
                zf = zd / this.props.previousCheckPriceData.ShouPanJia;
            }
            else {
                zd = this.props.checkPriceData.ShouPanJia - this.props.checkPriceData.KaiPanJia
                zf = zd / this.props.checkPriceData.KaiPanJia
            }

            if (zd < 0) {
                clr = baseStyle.DOWN_COLOR;
            } else if (zd === 0) {
                clr = baseStyle.SMALL_TEXT_COLOR;
            } else {
                clr = baseStyle.UP_COLOR;
            }
        }

        let zuiXinJiaPrice = this.props.dynaData.ZuiXinJia;
        if (zuiXinJiaPrice === 0) zuiXinJiaPrice = this.props.dynaData.ZuoShou;

        if (1 === this.props.isHorz) {
            return this._renderH(clr, zd, zf, zuiXinJiaPrice);
        } else {
            return this._renderV(clr, zd, zf, zuiXinJiaPrice);
        }
    }
    /**
     * 行情大字显示和右边的价格的涨跌还有涨跌的百分比
     * */
    _renderV(clr, zd, zf, zxj) {
        return (
            <View
                style={{
                    // backgroundColor: 'red',
                    flexDirection: 'row',
                    alignItems: 'center',
                    // height: 40
                }}
            >
                <View
                    style={
                        {
                            // backgroundColor: '#ff00ff',
                        }
                    }
                >
                    {this.props.checkPriceData ? (
                        <StockFormatText
                            style={{
                                // backgroundColor: '#00ffff',
                                fontWeight: '400',
                                fontSize: RATE(88),
                                color: clr
                            }}
                        >
                            {this.props.checkPriceData.ShouPanJia}
                        </StockFormatText>
                    ) : (
                            <StockFormatText
                                style={{
                                    // backgroundColor: '#00ffff',
                                    fontWeight: '400',
                                    fontSize: RATE(88),
                                    color: clr
                                }}
                            >
                                {zxj}
                            </StockFormatText>
                        )}
                </View>
                <View
                    style={{
                        flex: 1,
                        // backgroundColor: '#ffff00',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        marginLeft: 15
                    }}
                >
                    {this.props.checkPriceData ? (
                        <StockFormatText
                            style={{ fontSize: RATE(30), color: clr }}
                            sign={true}
                        >
                            {zd}
                        </StockFormatText>
                    ) : (
                            <StockFormatText
                                style={this.getUpDownStyle(
                                    'updn',
                                    this.props.dynaData.ZhangFu
                                )}
                                sign={true}
                            >
                                {this.props.dynaData.ZhangDie}
                            </StockFormatText>
                        )}
                    {this.props.checkPriceData ? (
                        <StockFormatText
                            style={{ fontSize: RATE(30), color: clr }}
                            unit="%"
                            sign={true}
                        >
                            {zf}
                        </StockFormatText>
                    ) : (
                            <StockFormatText
                                style={this.getUpDownStyle(
                                    'updn',
                                    this.props.dynaData.ZhangFu
                                )}
                                unit="%"
                                sign={true}
                            >
                                {this.props.dynaData.ZhangFu / 100}
                            </StockFormatText>
                        )}
                </View>
            </View>
        );
    }

    _renderH(clr, zd, zf, zxj) {

        let strs = this.props.dynaData.ZhongWenJianCheng && this.props.dynaData.ZhongWenJianCheng.split("(");
        let strName = "";
        if (strs) {
            strName = strs[0];
        }
        let strTitleObj = this.props.dynaData.Obj && (this.props.dynaData.Obj).substring(2, 8);
        // let strTitleParams = this.props.navigation.state.params.obj&&(this.props.navigation.state.params.obj).substring(2,8);

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <View
                    style={{
                        // position: 'absolute',
                        // left: 0,
                        // marginLeft:0,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    {this.props.type !== 0 ? (
                        <TouchableOpacity
                            style={{ marginLeft: -20, height: 40, width: 40, alignItems: 'flex-end', justifyContent: 'center' }}
                            onPress={this.props.preClicked}
                        >
                            <Image
                                source={require('../images/icons/pre_btn.png')}
                            />
                        </TouchableOpacity>
                    ) : null}

                    <StockFormatText
                        style={{
                            fontSize: RATE(36),
                            color: baseStyle.BLACK_100,
                            marginLeft: 12
                        }}
                    >
                        {strName}
                    </StockFormatText>
                    <StockFormatText
                        style={{
                            fontSize: RATE(36),
                            color: baseStyle.BLACK_100,
                            marginLeft: 12
                        }}
                    >
                        {strTitleObj}
                    </StockFormatText>
                    {this.props.type !== 0 ? (
                        <TouchableOpacity
                            style={{ marginLeft: 10, height: 40, width: 40, alignItems: 'flex-start', justifyContent: 'center' }}
                            onPress={this.props.nextClicked}
                        >
                            <Image
                                source={require('../images/icons/next_btn.png')}
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 10
                    }}
                >
                    {this.props.checkPriceData ? (
                        <StockFormatText
                            style={{
                                fontWeight: 'bold',
                                fontSize: RATE(36),
                                color: clr,
                                textAlign: 'center',
                            }}
                        >
                            {this.props.checkPriceData.ShouPanJia}
                        </StockFormatText>
                    ) : (
                            <StockFormatText
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: RATE(36),
                                    color: clr,
                                    textAlign: 'center',
                                }}
                            >
                                {zxj}
                            </StockFormatText>
                        )}
                    <Text style={{ marginLeft: 10, color: clr }}>(</Text>
                    {this.props.checkPriceData ? (
                        <StockFormatText
                            style={{ fontSize: RATE(30), color: clr }}
                            sign={true}
                        >
                            {zd}
                        </StockFormatText>
                    ) : (
                            <StockFormatText
                                style={this.getUpDownStyle(
                                    'updn',
                                    this.props.dynaData.ZhangFu
                                )}
                                sign={true}
                            >
                                {this.props.dynaData.ZhangDie}
                            </StockFormatText>
                        )}
                    {this.props.checkPriceData ? (
                        <StockFormatText
                            style={{
                                fontSize: RATE(30),
                                color: clr,
                                marginLeft: 10
                            }}
                            unit="%"
                            sign={true}
                        >
                            {zf}
                        </StockFormatText>
                    ) : (
                            <StockFormatText
                                style={this.getUpDownStyle(
                                    'updn',
                                    this.props.dynaData.ZhangFu,
                                    { marginLeft: 10 }
                                )}
                                unit="%"
                                sign={true}
                            >
                                {this.props.dynaData.ZhangFu / 100}
                            </StockFormatText>
                        )}
                    <Text style={{ color: clr }}>)</Text>
                </View>

            </View>
        );
    }
}
