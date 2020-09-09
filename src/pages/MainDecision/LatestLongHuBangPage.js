/*
 * @Author: lishuai
 * @Date: 2019-08-12 09:59:01
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-12-12 16:56:29
 * 最新龙虎榜列表页面
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

export default class LatestLongHuBangPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.selected_day = ''; // 当前选中的日期
        this.disabled_date = {}; // 非交易日
        this.min_date = '';
        this.max_date = '';
        this.pageNumber = 1;
        this.desc = true; // 是否为降序
        this.state = {
            allLoaded: false, // 数据是否加载完毕
            data: [{
                items: []
            }]
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
        })
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
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/shangbanggegu', params, (x) => {
            if (!x) return;
            let items = this.state.data[0].items;
            let list = x.list;
            for (let i = 0; i < list.length; i++) {
                const element = list[i];
                let item = {
                    secCode: element.secCode,
                    secName: element.secName,
                    reason: element.reason,
                    chgRatio: element.chgRatio,
                    close: element.close,
                    buyBranchs: element.buyBranchs,
                    sellBranchs: element.sellBranchs,
                    transDate: element.transDate,
                    netAmt: element.netAmt.toFixed(2)
                }
                items.push(item);
            }
            //console.log("龙虎榜请求到的数据",{ data: [{ items: items }]});
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
    _renderSection = () => {
        let imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        return (
            <View style={{ height: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F2FAFF' }}>
                <Text style={{ fontSize: 12, color: '#00000099' }}>股票名称</Text>
                <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                    <Text style={{ fontSize: 12, color: '#00000099' }}>当日涨跌幅</Text>
                    <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc}></Image>
                </TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#00000099' }}>当日收盘价</Text>
            </View>
        );
    }
    _renderXiWeiItem(item) {
        let array = item.data.split(',');
        return (
            <View style={{ flex: 1, alignItems: 'center', borderRightColor: '#0000001a', borderRightWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    {array.map((x, index) =>
                        <View key={index} style={{ backgroundColor: x == 1 ? '#FF6666' : (x == 2 ? '#FF9933' : '#3399FF'), width: 10, height: 10, borderRadius: 5, marginRight: 5 }}></View>
                    )}
                </View>
                <Text style={{ fontSize: 12, color: '#00000066', marginTop: 6 }}>{item.type}</Text>
            </View>
        )
    }
    _itemOnClick(item) {
        let date = item.transDate.length >= 10 && item.transDate.substring(0, 10);
        if (!item.secCode || !date) return;
        Navigation.pushForParams(this.props.navigation, 'OnListDetailPage', { secCode: item.secCode, transDate: date });
    }
    _keepTwoDecimal(num) {
        let result = parseFloat(num);
        if (isNaN(result)) {
            return 0.00;
        }
        result = Math.round(num * 100) / 100;
        return result;
    }
    _renderItem = (path) => {
        let oldData = this.state.data[0].items;
        let item = oldData[path.row];
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (item.chgRatio > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (item.chgRatio < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        let amountClr = baseStyle.SMALL_TEXT_COLOR;
        if (item.netAmt > 0) {
            amountClr = baseStyle.UP_COLOR;
        } else if (item.netAmt < 0) {
            amountClr = baseStyle.DOWN_COLOR;
        }
        return (
            <TouchableOpacity
                style={{ backgroundColor: '#ffffff', borderBottomColor: '#0000001a', borderBottomWidth: 1, paddingBottom: 15 }}
                activeOpacity={1}
                onPress={() => this._itemOnClick(item)}>
                <View style={{ flexDirection: 'row', paddingTop: Platform.OS == 'ios' ? 10 : 7, paddingBottom: 5, justifyContent: 'space-around', alignItems: 'center' }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: 15 }}>{item.secName}</Text>
                        <Text style={{ fontSize: 12, color: '#666666', marginTop: Platform.OS == 'ios' ? 3 : 0 }}>{item.secCode}</Text>
                    </View>
                    <StockFormatText style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: clr, textAlign: 'center' }} unit='%'>{item.chgRatio / 100}</StockFormatText>
                    <StockFormatText style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: clr, textAlign: 'center' }}>{item.close}</StockFormatText>
                </View>
                <View style={{ flexDirection: 'row', paddingTop: Platform.OS == 'ios' ? 5 : 2, paddingBottom: 10, justifyContent: 'space-around' }}>
                    {item.buyBranchs && this._renderXiWeiItem({ type: '买入席位', data: item.buyBranchs })}
                    {item.sellBranchs && this._renderXiWeiItem({ type: '卖出席位', data: item.sellBranchs })}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <StockFormatText style={{ fontSize: 16, fontWeight: 'bold', color: amountClr }} unit={'元/万/亿'}>{parseFloat(item.netAmt)}</StockFormatText>
                        <Text style={{ fontSize: 12, color: '#00000066' }}>席位净流入</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10, marginLeft: 15, marginRight: 15, borderRadius: 5, backgroundColor: '#3399FF0D', alignItems: 'center' }}>
                    <View style={{ width: 70, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#3399FF', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#3399FF' }}>上榜原因</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, marginLeft: 10, color: '#00000099' }} numberOfLines={1}>{item.reason}</Text>
                </View>
            </TouchableOpacity>
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
                heightForIndexPath={() => 140}
                renderIndexPath={this._renderItem}
                headerStickyEnabled={true}
                loadingFooter={mRiskTipsFooter}
                refreshHeader={mNormalHeader}
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
     *
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 7, height: 7, backgroundColor: '#FF6666', borderRadius: 3.5 }}></View>
                            <Text style={{ marginLeft: 3, fontSize: 12, color: '#00000066' }}>龙头席位</Text>
                        </View>
                        <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 7, height: 7, backgroundColor: '#FF9933', borderRadius: 3.5 }}></View>
                            <Text style={{ marginLeft: 3, fontSize: 12, color: '#00000066' }}>机构席位</Text>
                        </View>
                        <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 7, height: 7, backgroundColor: '#3399FF', borderRadius: 3.5 }}></View>
                            <Text style={{ marginLeft: 3, fontSize: 12, color: '#00000066' }}>普通席位</Text>
                        </View>
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
        if( this.state.allLoaded === false){
            return <View><View></View></View>;
        }else if((this.state.data && this.state.data[0].items.length === 0 ) ||  this.state.allLoaded === true){
            return(
                <View>
                    <RiskTipsFooterView type={1}/>
                </View>
            )
        }
    }

}