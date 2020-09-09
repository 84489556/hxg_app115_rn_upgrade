/*
 * @Author: lishuai
 * @Date: 2019-08-12 09:59:44
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-11-29 15:27:46
 * 机构重仓列表页面
 */
import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { LargeList } from 'react-native-largelist-v3';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import Calendar from "../../components/calendar";
import { mNormalHeader } from "../../components/mNormalHeader";
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from '../../pages/BaseComponentPage';
import { toast } from '../../utils/CommonUtils';
import YdCloud from '../../wilddog/Yd_cloud';
import * as ScreenUtil from "../../utils/ScreenUtil";

const XDate = require('xdate');
const PageSize = 20;

import {mRiskTipsFooter} from "../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../components/RiskTipsFooterView";

export default class MechanismWeightWarehousePage extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.selected_day = ''; // 当前选中的日期
        this.disabled_date = {}; // 非交易日
        this.min_date = '';
        this.max_date = '';
        this.pageNumber = 1;
        this.desc = true; // 是否为降序
        this.state = {
            data: [{
                items: []
            }],
            allLoaded: false, // 数据是否加载完毕
        }
    }

    componentDidMount() {
        this._loadCalendar();
    }
    // 获取近一年交易日数据
    _loadCalendar() {
        YdCloud().ref(MainPathYG + 'openning_calendar').orderByKey().get((snap) => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let openCalendar = [];
                values.forEach((child) => {
                    openCalendar = openCalendar.concat(Object.values(child));
                })
                if (!this.selected_day && openCalendar.length > 0) {
                    let day = openCalendar[openCalendar.length - 1];
                    this.selected_day = day;
                }
                this._loadData();
                //时间选择器加载数据
                this.handleTradeDays(Object.values(this.disabled_date), openCalendar);
            }
        });
    }
    handleTradeDays(curDays, nextDays) {
        if (curDays.length == nextDays.length) {
            let same = true;
            for (let i = 0; i < curDays.length; ++i) {
                if (curDays[i] != nextDays[i]) {
                    same = false;
                    break;
                }
            }
            if (same) return;
            if (nextDays.length == 0) return;
        }
        let disabled_date = {};
        let filterdDays = nextDays;
        let min_date = filterdDays[0];
        let max_date = filterdDays[filterdDays.length - 1];
        let from = new XDate(min_date), to = new XDate(max_date);
        for (; from <= to; from = new XDate(from, true).addDays(1)) {
            if (filterdDays.indexOf(from.toString('yyyy-MM-dd')) == -1) {
                disabled_date[from.toString('yyyy-MM-dd')] = { disabled: true }
            }
        }
        this.min_date = min_date;
        this.max_date = max_date;
        this.disabled_date = disabled_date;
        this.setState({});
    }
    _loadData() {
        let params = { 'pageNum': this.pageNumber, 'pageSize': PageSize, 'sortField': 'chgRatio', 'desc': this.desc, 'tradeDate': this.selected_day };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/jigouzhongcang', params, (x) => {
            if (!x) return;
            let items = this.state.data[0].items;
            let list = x.list;
            for (let i = 0; i < list.length; i++) {
                const element = list[i];
                let item = {
                    secCode: element.secCode,
                    secName: element.secName,
                    branchs: element.branchs,
                    chgRatio: element.chgRatio,
                    transDate: element.transDate,
                    buyAmt: element.buyAmt,
                    sellAmt: element.sellAmt,
                    close: element.close
                }
                items.push(item);
            }
            this.setState({ data: [{ items: items }], allLoaded: this.pageNumber >= x.pages }, () => {
                this.refs.list.endLoading();
            });
        }, (error) => {
            toast(error);
        })
    }
    _loadMoreData = () => {
        this.pageNumber = this.pageNumber + 1;
        this._loadData();
    }
    onSelectDay = (day) => {
        this.calendar.close();
        if (day) {
            let newDay = XDate(day.timestamp, true).toString('yyyy-MM-dd');
            if (newDay == this.selected_day) return;
            this.selected_day = newDay;
            this.pageNumber = 1;
            this.setState({ data: [{ items: [] }] });
            this._loadData();
        }
    }
    _sortBtnOnClick() {
        this.desc = !this.desc;
        this.pageNumber = 1;
        this.setState({ data: [{ items: [] }] });
        this._loadData();
    }
    _keepTwoDecimal(num) {
        let result = parseFloat(num);
        if (isNaN(result)) {
            return 0.00;
        }
        result = Math.round(num * 100) / 100;
        return result;
    }
    _itemOnClick(item) {
        let date = item.transDate.length >= 10 && item.transDate.substring(0, 10);
        if (!item.secCode || !date) return;
        Navigation.pushForParams(this.props.navigation, 'OnListDetailPage', { secCode: item.secCode, transDate: date });
    }

    _renderSection = () => {
        let imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        return (
            <View style={{ height: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F2FAFF' }}>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>股票名称</Text>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                    <Text style={{ fontSize: 12, color: '#00000099' }}>当日涨跌幅</Text>
                    <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc}></Image>
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>当日收盘价</Text>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>机构参与数</Text>
            </View>
        );
    };
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
    _renderItem = (path) => {
        let oldData = this.state.data[0].items;
        let item = oldData[path.row];
        return (
            <TouchableOpacity
                style={{ backgroundColor: '#ffffff', borderBottomColor: '#0000001a', borderBottomWidth: 1, paddingTop: 15, paddingBottom: 15 }}
                activeOpacity={1}
                onPress={() => this._itemOnClick(item)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: 15 }}>{item.secName}</Text>
                        <Text style={{ fontSize: 12, color: '#666666', marginTop: Platform.OS == 'ios' ? 3 : 0 }}>{item.secCode}</Text>
                    </View>
                    <StockFormatText style={{ flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: this._getStockTextColor(item.chgRatio) }} unit='%' >{item.chgRatio / 100}</StockFormatText>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>{item.close}</Text>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ height: 20, paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3399FF', borderRadius: 5 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>{item.branchs}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: Platform.OS == 'ios' ? 12 : 8, justifyContent: 'space-around', alignItems: 'center' }}>
                    <View style={{ flex: 1, alignItems: 'center', borderRightColor: baseStyle.LINE_BG_F1, borderRightWidth: 1 }}>
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: baseStyle.UP_COLOR }} precision={2} unit={'元/万/亿'}>{item.buyAmt}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000066', marginTop: Platform.OS == 'ios' ? 0 : -2 }}>机构席位买入</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: baseStyle.DOWN_COLOR }} precision={2} unit={'元/万/亿'}>{item.sellAmt}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000066', marginTop: Platform.OS == 'ios' ? 0 : -2 }}>机构席位卖出</Text>
                    </View>
                </View>
            </TouchableOpacity >
        );
    };
    _renderList() {
        return (
            <LargeList
                ref='list'
                style={{ backgroundColor: baseStyle.LINE_BG_F1, flex: 1 }}
                data={this.state.data}
                allLoaded={this.state.allLoaded}
                heightForSection={() => 30}
                renderSection={this._renderSection}
                heightForIndexPath={() => 110}
                renderIndexPath={this._renderItem}
                refreshHeader={mNormalHeader}
                loadingFooter={mRiskTipsFooter}
                headerStickyEnabled={true}
                onLoading={this._loadMoreData}
                renderEmpty={this.renderEmptys}
                renderFooter={this._renderMyFooters}
                onScroll={
                    ({ nativeEvent: { contentOffset: { x, y } } }) => {

                    }
                }
            />
        )
    }
    /**
     * 绘制空视图
     * */
    renderEmptys = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ width: ScreenUtil.screenW, flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ width: ScreenUtil.screenW, flex: 1, backgroundColor: "#f6f6f6", alignItems: "center", justifyContent: "center" }}>
                        <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                            source={require('../../images/TuyereDecision/no_stock_data.png')} />
                        <Text style={{
                            fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",
                            marginTop: ScreenUtil.scaleSizeW(100)
                        }}>暂无数据</Text>
                    </View>
                    {/*这个View是一个遮盖的View,只是用来挡住上拉加载那个文字的，因为现在这个StickyForm的renderFooter方法是不能正确回调的*/}
                    <View style={{
                        height: 60, position: "absolute", flexDirection: "row", backgroundColor: "#f6f6f6",
                        bottom: -60, left: 0, width: ScreenUtil.screenW
                    }} />

                </View>
            </View>
        )
    };
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ height: 38, flexDirection: 'row', paddingLeft: 15, paddingRight: 15, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#00000066' }}>最近一年</Text>
                    </View>
                    <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={1} onPress={() => this.calendar.show()}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={{ width: 11, height: 11, marginRight: 10 }} source={require('../../images/Home/home_market_status_calendar_icon.png')}></Image>
                            <Text style={{ fontSize: 12, color: '#00000066', marginRight: 5 }}>{this.selected_day}</Text>
                            <Image style={{ width: 10, height: 10 }} source={require('../../images/Home/home_market_status_arrow_icon.png')}></Image>
                        </View>
                    </TouchableOpacity>
                </View>
                {this._renderList()}
                <Calendar ref={(calendar) => this.calendar = calendar}
                    onSelectDay={this.onSelectDay}
                    selectedDay={this.selected_day}
                    minDate={this.min_date}
                    maxDate={this.max_date}
                    markedDates={this.disabled_date}
                />
            </View>
        )
    }

    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        if((this.state.data && this.state.data[0].items.length === 0 )|| this.state.allLoaded === false){
            return <View><View></View></View>;
        }else {
            return(
                <View>
                    <RiskTipsFooterView type={0}/>
                </View>
            )
        }
    }

}