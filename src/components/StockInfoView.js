/*
 * 详情页单品种报价
 */

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    Dimensions
} from 'react-native';

import BaseComponent from './BaseComponent';
import StockFormatText from './StockFormatText';
import * as baseStyle from './baseStyle';
import RATE from '../utils/fontRate';
import { connection } from '../pages/Quote/YDYunConnection';
import { Utils } from '../utils/CommonUtils'
import {sensorsDataClickActionName, sensorsDataClickObject} from "./SensorsDataTool";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


export default class StockInfoView extends Component {

    static defaultProps = {
        serviceUrl: '/stkdata'
    };

    defaultParams = {
        sub: 1,
        field: [
            'ZhongWenJianCheng',
            'ZuiXinJia',
            'ZhangDie',
            'ZhangFu',
            'ShiJian',
            'KaiPanJia',
            'ZuoShou',
            'ZuiGaoJia',
            'ZuiDiJia',
            'ChengJiaoLiang',
            'ChengJiaoE',
            'HuanShou',
            'ShiYingLv',
            'ShiJingLv',
            'ZongShiZhi',
            'LeiXing',
            'ZhangTing',
            'DieTing',
            'ZongGuBen',
            'LiuTongAGu',
            'fpVolume', // 盘后成交量
            'fpAmount' // 盘后成交额
        ]
    };

    constructor(props) {
        super(props);

        this.state = {
            data: props.dynaData, // 总体数据来源
            priceboxData: props.priceboxData, // 点击十字线数据
            previousPriceboxData: props.previousPriceboxData, // 十字线消失数据
            zgb: 0,
            ltgfhj: 0,
            type: props.type,//股票类型
        };
        this.isDidMount=false;
        this.hadRequest=false;//是否已经请求过行情,防止接收父类属性方法和得到焦点重复请求行情 
    }

    componentWillUnmount() {
        this.isDidMount=false;
        this.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
        // NetInfo.removeEventListener("change", this.handleConnectivityChange());

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
        // NetInfo.addEventListener('change', this.handleConnectivityChange);
    }
    //监听网络状态的改变
    handleConnectivityChange = status => {
        if(status){
            this._query(this.props);
        }

    };
    componentWillReceiveProps(nextProps) {
        // 判断是否需要重新订阅数据
        if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
            // console.log('stock-http---componentWillReceiveProps--_query---');
            this.hadRequest=true;
            this._query(nextProps);
            
        }
        if (this.props !== nextProps) {
            this.setState({
                priceboxData: nextProps.priceboxData,
                previousPriceboxData: nextProps.previousPriceboxData
            });
        }
        if (this.props.type !== nextProps.type) {
            this.setState({
                type: nextProps.type,
            });
        }
    }

    adapt(returnData) {
        let data = this._detailData(returnData);
        return data && data[0];
    }

    _detailData(data) {
        let adaptData = [];
        let stockMessage = {};
        if (data) {
            stockMessage.obj = data.label;
            stockMessage.ZhongWenJianCheng = data.name;
            stockMessage.ZuiXinJia = data.price;
            stockMessage.ZhangDie = data.increase;
            stockMessage.ZhangFu = data.increaseRatio;
            stockMessage.KaiPanJia = data.open;
            stockMessage.ZuiGaoJia = data.high;
            stockMessage.ZuiDiJia = data.low;
            stockMessage.ChengJiaoLiang = data.volume / 100;//上证指数和之前的相差一个单位手
            stockMessage.ChengJiaoE = data.amount;
            stockMessage.HuanShou = data.exchangeRatio / 100;
            if (Platform.OS === 'ios') {
                stockMessage.fpVolume = data.fpVolume;
                stockMessage.fpAmount = data.fpAmount;
                stockMessage.ShiYingLv = data.peratio;
                stockMessage.ShiJingLv = data.pbratio;
            } else {
                stockMessage.fpVolume = data.fPVolume;
                stockMessage.fpAmount = data.fPAmount;
                stockMessage.ShiYingLv = data.pERatio;
                stockMessage.ShiJingLv = data.pBRatio;
            }
            stockMessage.ZhangTing = data.upper;
            stockMessage.DieTing = data.lower;

            //总市值
            // stockMessage.ZongGuBen = data.totalMarketValue/10000;
            //流通市值
            // stockMessage.LiuTongAGu = data.circulateMarketValue/10000;
            //总股本
            stockMessage.ZongGuBen = this.state.zgb;
            //流通股本
            stockMessage.LiuTongAGu = this.state.ltgfhj;

            adaptData.push(stockMessage);
        }

        return adaptData;
    }


    cancel() {
       
        if (this._request && this._request.qid && this.props.params.obj) {
            // console.log('stock-http:='+'cancel---'+this.props.params.obj);
            connection.unregister(this._request.qid, this.props.params.obj);
        }
    }

    _requery(){
        this._query(this.props);
    }
    _query(props) {
        // this.cancel();
        // console.log('stock-http:='+'stockinfo qurey' )

        if (props.params && props.params.obj) {
            this._getGB(props.params.obj);
            this.obj = props.params.obj;
            this._request = connection.register('FetchFullQuoteNative', props.params.obj,
                (returndata) => {
                    if (!(returndata instanceof Error)) {
                        if (returndata.quote.label === this.obj) {
                            Promise.resolve(this.adapt(returndata.quote)).then((data) => {
                               // console.log('stock-http:='+'stockinfo qurey finish' )
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
                    }
                });
        }

    }

    _getGB(obj) {
        let code = obj.substring(2, 8);//股本
        let url = 'https://newf10.ydtg.com.cn/apis/fis/v1/skf10/sk/shareStructures?gpdm='
            + code + '&page=1&size=1';
        Utils.get(url, (res) => {
            if(this.isDidMount==true){
                if (res.data.result.length > 0) {
                    // let temZgb = (res.data.result[0].zgb)/10000;
                    // let temLtgb = (res.data.result[0].ltag)/10000;
                    let temZgb = (res.data.result[0].zgb);
                    let temLtgb = (res.data.result[0].ltag);
                    this._setGB(temZgb, temLtgb);
                    // this.setState({
                    //     zgb:temZgb/10000,
                    //     ltgfhj:temLtgb/10000,
                    // })
                }
            }
        }, (error) => {

        });
    }
    _setGB(zgb, ltgb) {
        let data = this.state.data;
        let stockMessage = {};
        stockMessage.obj = data.obj;
        stockMessage.ZhongWenJianCheng = data.ZhongWenJianCheng;
        stockMessage.ZuiXinJia = data.ZuiXinJia;
        stockMessage.ZhangDie = data.ZhangDie;
        stockMessage.ZhangFu = data.ZhangFu;
        stockMessage.KaiPanJia = data.KaiPanJia;
        stockMessage.ZuiGaoJia = data.ZuiGaoJia;
        stockMessage.ZuiDiJia = data.ZuiDiJia;
        stockMessage.ChengJiaoLiang = data.ChengJiaoLiang;
        stockMessage.ChengJiaoE = data.ChengJiaoE;
        stockMessage.HuanShou = data.HuanShou;
        stockMessage.ShiYingLv = data.ShiYingLv;
        stockMessage.ShiJingLv = data.ShiJingLv;
        stockMessage.ZhangTing = data.ZhangTing;
        stockMessage.DieTing = data.DieTing;
        stockMessage.ZongGuBen = zgb;
        stockMessage.LiuTongAGu = ltgb;
        stockMessage.fpVolume = data.fpVolume;
        stockMessage.fpAmount = data.fpAmount;
        this.setState({
            data: stockMessage,
            zgb: zgb,
            ltgfhj: ltgb,
        })

    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState;
    }

    render() {
        return (
            <StockInfoBar
                dynaData={this.state.data}
                isHorz={this.props.isHorz}
                checkPriceData={this.state.priceboxData}
                previousCheckPriceData={this.state.previousPriceboxData}
                type={this.state.type}
            />
        );
    }
}

class StockInfoBar extends BaseComponent {
    static defaultProps = {
        dynaData: {},
        unfoldClick: () => { }
    };

    constructor(props) {
        super(props);
        this.state = {
            isUnfold: false
        };
    }

    _unfoldClick = () => {

      sensorsDataClickObject.adKClick.stock_code = this.props.dynaData.obj;
      sensorsDataClickObject.adKClick.function_zone = '行情信息区';
      sensorsDataClickObject.adKClick.content_name = '更多资料';
      SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)
        this.setState({
            isUnfold: !this.state.isUnfold
        });
    };

    render() {
        let unfold = require('../images/icons/fold.png');
        let fold = require('../images/icons/unfold.png');
        let code = this.props.dynaData.obj || '';
        let isKeChuangStock = (code.indexOf('SH688') != -1)//多了盘后成交量和盘后成交额

        return (
            <View
                style={{
                    width: SCREEN_WIDTH,
                    // backgroundColor: '#ed5',
                    flexDirection: 'row'
                }}
            >
                <View
                    style={{
                        flexWrap: this.state.isUnfold ? 'wrap' : 'nowrap',
                        flexDirection: 'row',
                        marginLeft: 15,
                        width: SCREEN_WIDTH - 60
                    }}
                >
                    <View>
                        {this._renderGridCell(
                            '今开',
                            this.props.dynaData.KaiPanJia
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '最高',
                            this.props.dynaData.ZuiGaoJia
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '最低',
                            this.props.dynaData.ZuiDiJia
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '涨停',
                            this.props.dynaData.ZhangTing
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '换手率',
                            this.props.dynaData.HuanShou,
                            { unit: '%' }
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '成交量(手)',
                            this.props.dynaData.ChengJiaoLiang,
                            { unit: '万/亿' }
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '成交额',
                            this.props.dynaData.ChengJiaoE,
                            { unit: '万/亿' }
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '跌停',
                            this.props.dynaData.DieTing
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '总股本',
                            this.props.dynaData.ZongGuBen,
                            { unit: '万/亿' }
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '市盈率',
                            this.props.dynaData.ShiYingLv
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '流通股',
                            this.props.dynaData.LiuTongAGu,
                            { unit: '万/亿' }
                        )}
                    </View>
                    <View>
                        {this._renderGridCell(
                            '市净',
                            this.props.dynaData.ShiJingLv
                        )}
                    </View>
                    {isKeChuangStock && (<View>
                        {this._renderGridCell(
                            '盘后成交量',
                            this.props.dynaData.fpVolume,
                            { unit: '万/亿' }
                        )}
                    </View>)}
                    {isKeChuangStock && (<View>
                        {this._renderGridCell(
                            '盘后成交额',
                            this.props.dynaData.fpAmount,
                            { unit: '万/亿' }
                        )}
                    </View>)}
                </View>
                <View
                    style={{
                        width: 45,
                        height: 45,
                        backgroundColor: '#fff',
                    }}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={this._unfoldClick}
                    >
                        <Image
                            style={{
                                position: 'absolute',
                                width: 6,
                                height: 6,
                                bottom: 5,
                                right: 15
                            }}
                            source={this.state.isUnfold ? fold : unfold}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    _renderGridCell(name, data, props) {
        let d = data;

        if ((name === '开' || name === '今开') && this.props.checkPriceData) {
            d = this.props.checkPriceData.KaiPanJia;
        } else if (
            (name === '高' || name === '最高') &&
            this.props.checkPriceData
        ) {
            d = this.props.checkPriceData.ZuiGaoJia;
        } else if (
            (name === '低' || name === '最低') &&
            this.props.checkPriceData
        ) {
            d = this.props.checkPriceData.ZuiDiJia;
        } else if (
            (name === '量' || name === '成交量(手)') &&
            this.props.checkPriceData
        ) {
            d = this.props.checkPriceData.ChengJiaoLiang / 100;
        } else if (
            (name === '额' || name === '成交额') &&
            this.props.checkPriceData
        ) {
            d = this.props.checkPriceData.ChengJiaoE;
        } else if (
            (name === '换' || name === '换手率') &&
            this.props.checkPriceData
        ) {
            if (this.props.type === 0) {
                d = '--';
            } else {
                let c = this.props.checkPriceData.ChengJiaoLiang;
                let l = this.props.dynaData.LiuTongAGu;
                d = (c) / l;
                if (d === Infinity) {
                    d = '--';
                }
            }

        } else if (
            name === '涨停' &&
            (this.props.dynaData.ZhangTing === 99999.99 ||
                this.props.dynaData.ZhangTing === 100000.0 ||
                this.props.dynaData.ZhangTing === 0)
        ) {
            d = '--';
        } else if (
            name === '跌停' &&
            (this.props.dynaData.DieTing === 0.01 ||
                this.props.dynaData.ZhangTing === 0)
        ) {
            d = '--';
        } else if (
            (name === '流通股' || name === '总股本') &&
            ((d > 10000 && d < 100000000) || d > 10000000000)
        ) {
            props.precision = 0;
        }
        return (
            <View
                style={{
                    // backgroundColor: '#00ffff',
                    flexDirection: 'column',
                    marginBottom: 15,
                    width: (SCREEN_WIDTH - 60) / 4
                }}
            >
                <Text
                    style={{
                        color: baseStyle.BLACK_555555,
                        fontSize: RATE(24),
                        margin: 1,
                        marginBottom: 7
                    }}
                >
                    {name}
                </Text>
                <StockFormatText
                    {...props}
                    style={{
                        color: baseStyle.BLACK_333333,
                        margin: 1,
                        fontSize: RATE(28)
                    }}
                >
                    {d}
                </StockFormatText>
            </View>
        );
    }
}
