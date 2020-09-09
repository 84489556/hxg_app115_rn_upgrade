/*
 * @Author: lishuai
 * @Date: 2019-08-12 09:59:21
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-12-19 15:17:56
 * 龙虎密码列表页面
 */
import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { LargeList } from 'react-native-largelist-v3';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import { mNormalHeader } from "../../components/mNormalHeader";
import StockFormatText from '../../components/StockFormatText';
import YDSearchBar from '../../components/YDSearchBar';
import BaseComponentPage from '../../pages/BaseComponentPage';
import { toast } from '../../utils/CommonUtils';
import * as ScreenUtil from "../../utils/ScreenUtil";
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool';

const PageSize = 20;

import {mRiskTipsFooter} from "../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../components/RiskTipsFooterView";

export default class LongHuPasswordPage extends BaseComponentPage {
    constructor(props) {
        super(props);
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
        this._loadData();
    }

    _loadData() {
        let params = { 'pageNum': this.pageNumber, 'pageSize': PageSize, 'sortField': 'onlistDays', 'desc': this.desc };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/longhumima', params, (x) => {
            if (!x) return;
            let items = this.state.data[0].items;
            let list = x.list;
            for (let i = 0; i < list.length; i++) {
                const element = list[i];
                let item = {
                    secCode: element.secCode,
                    secName: element.secName,
                    latestChgRatio: element.latestChgRatio,
                    latestClosePrice: element.latestClosePrice,
                    onlistDays: element.onlistDays,
                    risingOnlistDays: element.risingOnlistDays || 0,
                    fallingOnlistDays: element.fallingOnlistDays || 0,
                    win3: element.win3,
                    transDate: element.transDate
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
    _sortBtnOnClick() {
        this.desc = !this.desc;
        this.pageNumber = 1;
        this.setState({ data: [{ items: [] }] });
        this._loadData();
    }
    _itemOnClick(item) {
        let date = item.transDate.length >= 10 && item.transDate.substring(0, 10);
        if (!item.secCode || !date) return;
        Navigation.pushForParams(this.props.navigation, 'OnListDetailPage', { secCode: item.secCode, transDate: date });
    }
    _searchOnClick() {
        Navigation.pushForParams(this.props.navigation, 'LongHuPasswordSearchPage',{entrance:'龙虎榜-龙虎密码'});        
        sensorsDataClickObject.searchClick.entrance = '龙虎榜-龙虎密码'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick)
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ height: 38, flexDirection: 'row', paddingLeft: 15, paddingRight: 15, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#00000066' }}>最近三个月</Text>
                    </View>
                    <YDSearchBar placeholderText={'请输入代码/全拼/首字母'} onClick={() => this._searchOnClick()}></YDSearchBar>
                </View>
                {this._renderList()}
            </View>
        )
    }
    _renderSection = () => {
        let imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        return (
            <View style={{ height: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F2FAFF' }}>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>股票名称</Text>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>涨跌幅</Text>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>最新价</Text>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                    <Text style={{ fontSize: 12, color: '#00000099' }}>上榜天数</Text>
                    <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc}></Image>
                </TouchableOpacity>
            </View>
        );
    };
    _renderOnListDaysBar(type, data) {
        const imgSrc = type == '上榜天数(上涨)' ? require('../../images/MainDecesion/long_hu_password_array_up_icon.png') : require('../../images/MainDecesion/long_hu_password_array_down_icon.png');
        const bgColor = type == '上榜天数(上涨)' ? '#F92400' : '#339900';
        return (
            <View style={{ flex: 1, paddingLeft: 15, paddingRight: 15, borderRightWidth: 1, borderRightColor: '#0000001a' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 15, backgroundColor: bgColor, borderRadius: 15 / 2, overflow: 'hidden' }}>
                    <Image style={{ width: 23, height: 15 }} source={imgSrc}></Image>
                    <Text style={{ fontSize: 15, color: '#ffffff', textAlignVertical: 'center' }}>{data}</Text>
                    <View style={{ width: 23, height: 15 }} />
                </View>
                <Text style={{ fontSize: 12, color: '#00000066', marginTop: Platform.OS == 'ios' ? 2 : -2, textAlign: 'center' }}>{type}</Text>
            </View>
        );
    }

    _renderProgressBar(type, data, color) {
        let value = parseFloat(data / 100);
        return (
            <View style={{ flex: 1, paddingLeft: 15, paddingRight: 15 }}>
                <View style={{ flexDirection: 'row', height: 15, backgroundColor: '#CCCCCC', borderRadius: 15 / 2, overflow: 'hidden' }}>
                    <View style={{ flex: value, backgroundColor: color, borderRadius: 15 / 2 }}></View>
                </View>
                <View style={{ marginTop: -15, height: 15, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: '#ffffff', textAlignVertical: 'center' }}>{data}%</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#00000066', marginTop: Platform.OS == 'ios' ? 2 : -2, textAlign: 'center' }}>{type}</Text>
            </View>
        );
    }

    _renderItem = (path) => {
        let oldData = this.state.data[0].items;
        let item = oldData[path.row];
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (item.latestChgRatio > 0) {
            clr = baseStyle.UP_COLOR;
        } else if (item.latestChgRatio < 0) {
            clr = baseStyle.DOWN_COLOR;
        }
        let onlistColor = '#3399FF';
        if (item.onlistDays > 2 && item.onlistDays < 5) {
            onlistColor = '#FF6600';
        } else if (item.onlistDays >= 5) {
            onlistColor = '#FF3300';
        }
        let win3Color = '#3399FF';
        if (item.win3 > 60 && item.win3 <= 80) {
            win3Color = '#FF6600';
        } else if (item.win3 > 80) {
            win3Color = '#FF3300';
        }
        return (
            <TouchableOpacity
                style={{ backgroundColor: '#ffffff', borderBottomColor: '#0000001a', borderBottomWidth: 1, paddingBottom: 15 }}
                activeOpacity={1}
                onPress={() => this._itemOnClick(item)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, paddingLeft: 15 }}>{item.secName}</Text>
                        <Text style={{ fontSize: 12, paddingLeft: 15, color: '#666666', marginTop: Platform.OS == 'ios' ? 3 : 0 }}>{item.secCode}</Text>
                    </View>
                    <StockFormatText style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: clr, textAlign: 'center' }} unit='%' >{item.latestChgRatio / 100}</StockFormatText>
                    <StockFormatText style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: clr, textAlign: 'center' }} >{item.latestClosePrice}</StockFormatText>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 25, height: 25, borderRadius: 25 / 2, backgroundColor: onlistColor, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>{item.onlistDays}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 10, paddingBottom: 15 }}>
                    {this._renderOnListDaysBar('上榜天数(上涨)', item.risingOnlistDays)}
                    {this._renderOnListDaysBar('上榜天数(下跌)', item.fallingOnlistDays)}
                    {this._renderProgressBar('上榜三日成功率', item.win3, win3Color)}
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
                heightForIndexPath={() => 110}
                renderIndexPath={this._renderItem}
                headerStickyEnabled={true}
                refreshHeader={mNormalHeader}
                loadingFooter={mRiskTipsFooter}
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