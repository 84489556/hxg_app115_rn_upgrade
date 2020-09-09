/*
 * @Author: lishuai 
 * @Date: 2019-08-29 09:56:38 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-08-06 10:44:25
 * 上榜详情页页面
 */
import React from 'react';
import { FlatList, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import Picker from 'react-native-picker';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import { showPicker } from "../../components/DatePicker";
import NavigationTitleView from '../../components/NavigationTitleView';
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from '../../pages/BaseComponentPage';
import { toast } from '../../utils/CommonUtils';
import Modal from 'react-native-translucent-modal';
export default class OnListDetailPage extends BaseComponentPage {
    constructor(props) {
        super(props);

        this.secCode = this.props.navigation.state.params.secCode; // 股票代码
        this.transDate = this.props.navigation.state.params.transDate; // 上榜日期
        this.state = {
            detailData: null, // 详情数据
            onListData: [], // 上榜原因
            onListCalendar: [], // 上榜日历
            isShow: false,//弹窗背景蒙层
        }
    }
    componentDidMount() {
        this._loadOnListDetailData();
        this._loadOnListCalendarData();
    }
    // 获取上榜详情数据
    _loadOnListDetailData() {

        if (!this.secCode || !this.transDate) return;
        let params = { 'seccode': this.secCode, 'tradeDate': this.transDate };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/shangbangxiangqing', params, (x) => {
            if (!x) return;
            let item = {
                market: x.market, // 交易市场 SH 上海, SZ 深证
                rank: x.rank, // 名次
                secName: x.secName, // 股票名称
                secCode: x.secCode, // 股票代码
                preClose: x.preClose, // 收盘价
                turnoverRatio: x.turnoverRatio, // 换手率
                chgRatio: x.chgRatio, // 涨跌幅
                floatMarketValue: x.floatMarketValue, // 流通市值
                buy5AndSell5: x.buy5AndSell5 // 所有上榜原因数据
            };

            this.setState({ detailData: item, onListData: item.buy5AndSell5 })
        }, (error) => {
            toast(error);
        })
    };

    // 获取个股上榜日历
    _loadOnListCalendarData() {
        if (!this.secCode) return;
        let params = { 'secCode': this.secCode };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/gegushangbangrili', params, (x) => {
            if (!x) return;

            let dates = [];
            for (let i = 0; i < x.length; i++) {
                const element = x[i];
                if (!element.transDate) continue;
                dates.push(element.transDate);
            }
            var data = [];
            for (let i = 0; i < dates.length; i++) {
                let e = dates[i];
                let y = e.substring(0, 4) + '年';
                let m = e.substring(5, 7) + '月';
                let d = e.substring(8, 10) + '日';
                if (this._has(data, y)) { // 判断是否有年
                    let month = this._get(data, y);
                    if (this._has(month, m)) { // 判断年中是否有月
                        let day = this._get(month, m);
                        if (day.indexOf(d) == -1) { // 判断月中是否有日
                            day.push(d);
                        }
                    } else {
                        let _month = {};
                        let days = [d];
                        _month[m] = days;
                        month.push(_month);
                    }
                } else {
                    let year = {};
                    let month = {};
                    let days = [d];
                    month[m] = days;
                    year[y] = [month];
                    data.push(year);
                }
            }

            this.setState({
                onListCalendar: data
            });
        }, (error) => {
            toast(error);
        })
    }
    _has(array, value) {
        let ret = false;
        for (const x of array) {
            let keys = Object.keys(x);
            if (keys.indexOf(value) !== -1) {
                ret = true;
                break;
            }
        }
        return ret;
    }
    _get(array, value) {
        let ret = null;
        for (const x of array) {
            let keys = Object.keys(x);
            let values = Object.values(x);
            if (keys.indexOf(value) !== -1) {
                ret = values[keys.indexOf(value)];
                break;
            }
        }
        return ret;
    }
    _showPick() {
        if (!this.transDate) return;
        let date = this.transDate;
        let data = date.split('-');
        let selectedDate = [];
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (index == 0) {
                element += '年';
            } else if (index == 1) {
                element += '月';
            } else {
                element += '日';
            }
            selectedDate.push(element);
        }
        showPicker(this.state.onListCalendar, selectedDate, (date) => {
            let year = date[0].split('年')[0];
            let month = date[1].split('月')[0];
            let day = date[2].split('日')[0];
            if (year && month && day) {
                let d = year + '-' + month + '-' + day;
                if (d !== this.transDate) {
                    this.transDate = d;
                    this.setState({

                    }, () => {
                        this._loadOnListDetailData();
                    });
                }
                this.setState({ isShow: false })
            }
        }, () => {
            this.setState({ isShow: false })
        });
    }
    _showPick2() {
        this.setState({ isShow: true });
    }
    _hidePicker() {
        this.setState({ isShow: false });
        Picker.hide();
    };
    _stockOnClick(item) {
        let newItem = { Obj: item.market + item.secCode, ZhongWenJianCheng: item.secName };

        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...newItem,
            isPush: true
        });
    }
    _renderStockInfoView() {
        let detailData = this.state.detailData;
        if (!detailData) return null;
        let marketText = detailData.market === 'SZ' ? '深市名次' : '沪市名次';
        let imgSrc = null;
        if (detailData.rank == 1) {
            imgSrc = require('../../images/MainDecesion/on_list_no_1.png');
        } else if (detailData.rank == 2) {
            imgSrc = require('../../images/MainDecesion/on_list_no_2.png');
        } else if (detailData.rank == 3) {
            imgSrc = require('../../images/MainDecesion/on_list_no_3.png');
        }
        let rankFontSize = 30;
        if (detailData.rank > 999) {
            rankFontSize = 20;
        } else if (detailData.rank > 99) {
            rankFontSize = 25;
        }
        let rankText = detailData.rank && detailData.rank > 3 && detailData.rank;
        if (rankText > 999) {
            rankText = '999+';
        }
        let color = baseStyle.SMALL_TEXT_COLOR;
        if (detailData.chgRatio > 0) {
            color = baseStyle.UP_COLOR;
        } else if (detailData.chgRatio < 0) {
            color = baseStyle.DOWN_COLOR;
        }
        return (
            <View style={{ flex: 1, paddingTop: 10 }}>
                <View style={{ flexDirection: 'row', marginLeft: 15, marginRight: 15, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, backgroundColor: '#0099FF', alignItems: 'center', justifyContent: 'space-between' }}>
                        {
                            rankText ?
                                <View style={{ backgroundColor: ' #ff1', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: rankFontSize, color: '#fff' }}>{rankText}</Text>
                                </View> :
                                <Image style={{ width: 23, height: 33 }} source={imgSrc}></Image>
                        }
                        <Text style={{ fontSize: 12, color: '#ffffff', marginBottom: 7 }}>{marketText}</Text>
                    </View>
                    <TouchableOpacity style={{ flex: 0.53, paddingLeft: 15, paddingRight: 15, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }} activeOpacity={1} onPress={() => this._stockOnClick(detailData)}>
                        <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#00000066' }}>上榜股票</Text>
                            <Text style={{ fontSize: 17, color: '#000000', marginTop: 5 }}>{detailData.secName}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#00000066', marginTop: 23, marginLeft: 8 }}>{detailData.secCode}</Text>
                    </TouchableOpacity>
                    <View style={{ width: 1, height: 32, backgroundColor: '#0000001a' }}></View>
                    <View style={{ flex: 0.47, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#00000066' }}>上榜日期</Text>
                            <Text style={{ fontSize: 17, color: '#000000', marginTop: 5 }}>{this.transDate}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={1} onPress={() => {
                            this._showPick2()
                        }}>
                            <Image style={{ width: 16, height: 16 }} source={require('../../images/MainDecesion/on_list_calendar_icon.png')}></Image>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ paddingTop: 15, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                    {[
                        { value: detailData.preClose, name: '收盘价', unit: '', color: color },
                        { value: detailData.floatMarketValue, name: '流通市值', unit: '元/万/亿', color: baseStyle.SMALL_TEXT_COLOR },
                        { value: detailData.chgRatio / 100, name: '上榜日涨幅', unit: '%', color: color },
                        { value: detailData.turnoverRatio / 100, name: '换手率', unit: '%', color: color }
                    ].map((value, idx) => {
                        return (
                            <View key={idx} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderRightColor: '#0000001a', borderRightWidth: (parseInt(idx / 3) == 0) ? 1 : 0 }}>
                                <StockFormatText style={{ fontSize: 15, color: value.color }} unit={value.unit}>{value.value}</StockFormatText>
                                <Text style={{ fontSize: 12, color: '#00000066', marginTop: 7 }}>{value.name}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }
    _renderItem = (item) => {
        return (
            <OnListReasonItemComponent data={item.item} itemOnClick={branchId => this._listItemOnClick(branchId)} />
        );
    }
    _listItemOnClick(branchId) {
        Navigation.pushForParams(this.props.navigation, 'XiWeiHistoryListPage', { branchId: branchId });
    }
    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'上榜详情'} />
                <FlatList
                    style={{ flex: 1, backgroundColor: baseStyle.LINE_BG_F1 }}
                    data={this.state.onListData}
                    renderItem={this._renderItem}
                    ListHeaderComponent={this._renderStockInfoView()}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
                    <Modal
                        animationType={"none"}
                        transparent={true}
                        visible={this.state.isShow}
                        onRequestClose={() => { }}
                        onShow={() => {
                            this._showPick();
                        }}
                        onDismiss={() => {
                            Picker.hide();
                        }}
                    >
                        <TouchableOpacity style={{
                            position: 'absolute',
                            top: 0,
                            width: baseStyle.width,
                            height: baseStyle.height,
                            backgroundColor: 'rgba(0,0,0,0.4)'
                        }} activeOpacity={1} onPress={() => this._hidePicker()}>
                        </TouchableOpacity>
                    </Modal>
            </BaseComponentPage>
        );
    }
}

export class OnListReasonItemComponent extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0 // 0：买五， 1: 卖五
        }
    }

    _tabOnChange(title) {
        if (title === '买五') {
            if (this.state.selectedIndex == 0) return;
            this.setState({ selectedIndex: 0 })
        } else if (title === '卖五') {
            if (this.state.selectedIndex == 1) return;
            this.setState({ selectedIndex: 1 })
        }
    }
    _itemOnClick(branchId) {
        this.props.itemOnClick && this.props.itemOnClick(branchId);
    }
    render() {

        let title = this.state.selectedIndex == 0 ? '买入营业部' : '卖出营业部';
        let totalAmountText = this.state.selectedIndex == 0 ? '买入合计' : '卖出合计';
        let itemAmtText = this.state.selectedIndex == 0 ? '买入额' : '卖出额';
        let isSelected = this.state.selectedIndex == 0 ? true : false;
        let reason = this.props.data.reasonName && this.props.data.reasonName;
        let data = isSelected ? this.props.data.buy5 : this.props.data.sell5;
        let totalAmount = 0;
        return (
            <View style={{ backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomColor: '#0000001a', borderBottomWidth: 1 }}>
                    <View style={{ backgroundColor: '#0099FF', width: 80, height: 22, borderRadius: 22 / 2, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#ffffff' }}>上榜原因</Text>
                    </View>
                    <Text style={{ flex: 1, marginLeft: 15, fontSize: 14, lineHeight: 14 * 1.3 }} numberOfLines={2}>{reason}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} activeOpacity={1} onPress={() => this._tabOnChange('买五')}>
                        <Text style={{ fontSize: 14, color: isSelected ? '#F92400' : '#999999', marginTop: 13 }}>买五</Text>
                        {isSelected ? <View style={{ width: 15, height: 3, backgroundColor: '#F92400', borderRadius: 3 / 2, marginTop: 8 }}></View> : null}
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} activeOpacity={1} onPress={() => this._tabOnChange('卖五')}>
                        <Text style={{ fontSize: 14, color: !isSelected ? '#F92400' : '#999999', marginTop: 13 }}>卖五</Text>
                        {!isSelected ? <View style={{ width: 15, height: 3, backgroundColor: '#F92400', borderRadius: 3 / 2, marginTop: 8 }}></View> : null}
                    </TouchableOpacity>
                </View>
                {
                    data ?
                        <View>
                            <View style={{ flexDirection: 'row', paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F1F8FD' }}>
                                <Text style={{ fontSize: 12, color: '#666666' }}>{title}</Text>
                                <Text style={{ fontSize: 12, color: '#666666' }}>{itemAmtText}</Text>
                            </View>
                            {data.map((value, index) => {
                                let xiweiIconSrc = require('../../images/MainDecesion/on_list_mechanism_icon.png');
                                if (value.branchType == '普通席位') {
                                    xiweiIconSrc = require('../../images/MainDecesion/on_list_normal_icon.png');
                                } else if (value.branchType == '龙头席位') {
                                    xiweiIconSrc = require('../../images/MainDecesion/on_list_long_tou_icon.png');
                                }
                                let amt = isSelected ? value.buyAmt : value.sellAmt;
                                totalAmount += amt;
                                return (
                                    <TouchableOpacity key={index} style={{ flexDirection: 'row', paddingLeft: 15, paddingRight: 15, paddingTop: Platform.OS == 'ios' ? 15 : 10, paddingBottom: Platform.OS == 'ios' ? 15 : 10, alignItems: 'center', justifyContent: 'space-between', borderBottomColor: '#0000001a', borderBottomWidth: 1 }} activeOpacity={1} onPress={() => this._itemOnClick(value.branchId)}>
                                        <Text style={{ flex: 0.7, fontSize: 12, color: '#333333', lineHeight: 18, textAlignVertical: 'center' }} numberOfLines={2}>{value.branchName}</Text>
                                        <Image style={{ width: 65, height: 15, marginLeft: 15, marginRight: 15, resizeMode: 'contain' }} source={xiweiIconSrc}></Image>
                                        <StockFormatText style={{ flex: 0.3, fontSize: 12, color: isSelected ? '#FF0036' : '#339900', textAlign: 'right' }} unit={'元/万/亿'}>{amt}</StockFormatText>
                                    </TouchableOpacity>
                                );
                            })}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 15, paddingRight: 15, paddingBottom: 15 }}>
                                <Text style={{ fontSize: 12, color: '#333333' }}>{totalAmountText}</Text>
                                <StockFormatText style={{ fontSize: 12, color: isSelected ? '#FF0036' : '#339900', marginLeft: 10 }} unit={'元/万/亿'}>{totalAmount}</StockFormatText>
                            </View>
                        </View>
                        :
                        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#333' }}>暂无数据</Text>
                        </View>
                }
            </View>
        );
    }
}