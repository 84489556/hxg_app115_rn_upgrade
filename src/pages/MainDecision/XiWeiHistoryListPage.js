/*
 * @Author: lishuai 
 * @Date: 2019-08-30 10:27:08 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-07-20 16:22:34
 * 席位历史数据列表页面
 */
import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { LargeList } from 'react-native-largelist-v3';
//import RootSiblings from 'react-native-root-siblings';
import TranslucentModal from 'react-native-translucent-modal';
import RequestInterface from '../../actions/RequestInterface';
import * as baseStyle from '../../components/baseStyle';
import { mNormalFooter } from "../../components/mNormalFooter";
import NavigationTitleView from '../../components/NavigationTitleView';
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from '../../pages/BaseComponentPage';
import { toast } from '../../utils/CommonUtils';
import * as ScreenUtil from '../../utils/ScreenUtil';

export default class XiWeiHistoryListPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.branchId = this.props.navigation.state.params.branchId;
        this.pageNumber = 1;
        this.months = 1; // 请求数据的周期参数 1、3、6、12
        this.state = {
            allLoaded: false, // 数据是否加载完毕
            currentIndex: 0, // 当前显示时的周期的索引值， 默认0
            branchName: '', // 营业部名称
            branchType: '', // 席位类型
            win3: 0,
            online_times: 0,
            list: [{ items: null }]
        }
    }

    componentDidMount() {
        this._loadData();
    }

    _loadData() {
        if (!this.branchId) return;
        let params = { 'branchId': this.branchId, 'months': this.months, 'pageNum': this.pageNumber, 'pageSize': 20 };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/yingyebushangbanglishiByPage', params, (x) => {
            if (!x) return;
            let list = this.state.list[0].items || [];
            list = list.concat(x.shares);
            this.setState({ branchName: x.branch_name, branchType: x.branch_type, win3: x.win3, online_times: x.online_times, list: [{ items: list }], allLoaded: x.shares.length < 20 }, () => {
                this.refs.list.endLoading();
            });

        }, (error) => {
            this.pageNumber = this.pageNumber - 1;
            this.setState({ allLoaded: false }, () => {
                this.refs.list.endLoading();
            });
            toast(error);
        })
    }

    _loadMoreData = () => {
        this.pageNumber = this.pageNumber + 1;
        this._loadData();
    }

    _tabOnChange(index) {
        if (index == this.state.currentIndex) return;
        if (index == 0) {
            this.months = 1;
        } else if (index == 1) {
            this.months = 3;
        } else if (index == 2) {
            this.months = 6;
        } else if (index == 3) {
            this.months = 12;
        }
        this.pageNumber = 1;
        this.setState({ list: [{ items: [] }], currentIndex: index }, () => {
            this._loadData();
        });
    }
    _itemOnClick(code, date) {
        Navigation.pushForParams(this.props.navigation, 'OnListDetailPage', { secCode: code, transDate: date });
    }
    _renderHeader = () => {
        let xiweiIconSrc = require('../../images/MainDecesion/on_list_mechanism_icon.png');
        if (this.state.branchType == '普通席位') {
            xiweiIconSrc = require('../../images/MainDecesion/on_list_normal_icon.png');
        } else if (this.state.branchType == '龙头席位') {
            xiweiIconSrc = require('../../images/MainDecesion/on_list_long_tou_icon.png');
        }
        return (
            <>
                <View style={{ height: 5, backgroundColor: baseStyle.LINE_BG_F6 }}></View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15, paddingRight: 15, backgroundColor: '#fff' }}>
                    <View style={{ position: 'absolute', left: 15, top: 16.5, width: 3, height: 14, backgroundColor: '#F92400' }}></View>
                    <View style={{ flex: 1, marginTop: 15, marginBottom: 15, marginLeft: 10, paddingRight: 15, borderRightWidth: 1, borderRightColor: '#0000001a' }}>
                        <Text style={{ fontSize: 15, color: '#000000cc', lineHeight: 18 }} numberOfLines={2}>{this.state.branchName}</Text>
                    </View>
                    <Image style={{ marginLeft: 15, width: 65, height: 15 }} source={xiweiIconSrc}></Image>
                </View>
                <View style={{ height: 5, backgroundColor: baseStyle.LINE_BG_F6 }}></View>
                <View style={{ flexDirection: 'row', paddingLeft: 15, paddingRight: 15, paddingTop: 15, paddingBottom: 10, alignItems: 'center', backgroundColor: '#ffffff' }}>
                    <View style={{ width: 3, height: 14, backgroundColor: '#F92400' }}></View>
                    <Text style={{ flex: 1, marginLeft: 5, fontSize: 15, color: '#000000cc' }}>{'营业部上榜历史数据'}</Text>
                </View>
            </>
        );
    }
    _renderSectionHeader = () => {
        let onlistTimes = this.state.online_times || 0;
        let win3Rate = this.state.win3 || 0;
        return (
            <View style={{ backgroundColor: '#fff', height: 65 }}>
                <SegmentedView tabs={['一个月', '三个月', '六个月', '一年']} tabOnChange={(index) => this._tabOnChange(index)} selectedIndex={this.state.currentIndex} />
                <View style={{ marginLeft: 15, marginRight: 15, backgroundColor: '#E8E8E8', height: 1 }}></View>
                <View style={{ flexDirection: 'row', paddingLeft: 15, paddingRight: 15, height: 30, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#666666', fontSize: 12 }}>上榜次数:{onlistTimes}次</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => this.refs.prompt.show()}>
                            <Image style={{ width: 15, height: 15 }} source={require('../../images/icons/doubt_icon.png')}></Image>
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 5, fontSize: 12, color: '#333333' }}>3日胜率: </Text>
                        <Text style={{ fontSize: 12, color: '#FF0036' }}>{win3Rate + '%'}</Text>
                    </View>
                </View>
            </View>
        );
    }
    _renderItem = (path) => {
        let data = this.state.list[0].items[path.row];
        if (!data) return;
        let date = new Date(data.listingDate);
        let year = date.getFullYear();
        let month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        let time = year + '-' + month + '-' + day;
        let stock = data.secName + '(' + data.secCode + ')';
        let amtColor = baseStyle.SMALL_TEXT_COLOR;
        if (data.netAmt > 0) {
            amtColor = '#FF0036';
        } else if (data.netAmt < 0) {
            amtColor = '#209900';
        }
        let chgRatioColor = baseStyle.SMALL_TEXT_COLOR;
        if (data.chgRatio > 0) {
            chgRatioColor = '#FF0036';
        } else if (data.chgRatio < 0) {
            chgRatioColor = '#209900';
        }
        return (
            <View style={{ flex: 1, paddingLeft: 15, paddingRight: 15, backgroundColor: '#fff' }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: '#0099FF1a', borderRadius: 10, padding: 15, paddingBottom: 0, marginBottom: 10 }} activeOpacity={1} onPress={() => this._itemOnClick(data.secCode, time)}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: '#333333' }}>{time}</Text>
                        <Text style={{ fontSize: 12, color: '#333333' }}>{stock}</Text>
                    </View>
                    <View style={{ marginTop: 10, height: 1, backgroundColor: '#006ACC33' }}></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#666666' }}>净买额</Text>
                            <StockFormatText style={{ fontSize: 12, color: amtColor, marginLeft: 10 }} unit={'元/万/亿'}>{data.netAmt}</StockFormatText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#666666' }}>上榜日涨幅</Text>
                            <StockFormatText style={{ fontSize: 12, color: chgRatioColor, marginLeft: 10 }} unit={'%'}>{data.chgRatio / 100}</StockFormatText>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#666666' }}>买入金额</Text>
                            <StockFormatText style={{ fontSize: 12, color: '#FF0036', marginLeft: 10 }} unit={'元/万/亿'}>{data.buyAmt}</StockFormatText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#666666' }}>卖出金额</Text>
                            <StockFormatText style={{ fontSize: 12, color: '#209900', marginLeft: 10 }} unit={'元/万/亿'}>{data.sellAmt}</StockFormatText>
                        </View>
                    </View>
                    <View style={{ marginTop: 15, height: 1, backgroundColor: '#006ACC33' }}></View>
                    <View style={{ height: 40, justifyContent: 'center' }}>
                        <Text style={{ color: '#006ACC', fontSize: 12 }}>上榜原因: {data.reason}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    _renderEmpty = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Image style={{ marginTop: 66 }} source={require('../../images/livelession/view_point_empty_logo.png')}></Image>
                <Text style={{ fontSize: 15, color: '#00000066', marginTop: 10 }}>暂无数据</Text>
            </View>
        )
    }
    render() {
        let list = this.state.list;
        if (!list[0].items) {
            return null;
        }
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'席位历史数据'} />
                <LargeList
                    ref='list'
                    style={{ flex: 1, backgroundColor: baseStyle.LINE_BG_F6 }}
                    data={list}
                    allLoaded={this.state.allLoaded}
                    heightForIndexPath={() => Platform.OS == 'ios' ? 170 : ScreenUtil.scaleSizeH(325)}
                    renderHeader={this._renderHeader}
                    renderEmpty={this._renderEmpty}
                    renderIndexPath={this._renderItem}
                    heightForSection={() => 65}
                    renderSection={this._renderSectionHeader}
                    loadingFooter={mNormalFooter}
                    onLoading={this._loadMoreData}
                />
                <PopupPromptView ref='prompt' />
            </BaseComponentPage>
        )
    }
}

export class SegmentedView extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: this.props.selectedIndex || 0
        };
    }

    _tabOnChange(index) {
        if (this.state.selectedIndex !== index) {
            this.setState({ selectedIndex: index }, () => {
                this.props.tabOnChange && this.props.tabOnChange(index);
            });
        }
    }

    render() {
        if (!this.props.tabs || !this.props.tabs.length) return null;
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#ffffff' }}>
                {this.props.tabs.map((value, index) => {
                    let isSelected = this.state.selectedIndex == index ? true : false;
                    let textColor = isSelected ? '#F92400' : '#999999';
                    return (
                        <TouchableOpacity key={index} style={{ alignItems: 'center' }} activeOpacity={1} onPress={() => this._tabOnChange(index)}>
                            <Text style={{ fontSize: 14, color: textColor, marginTop: 8 }}>{value}</Text>
                            {isSelected ? <View style={{ width: 15, height: 3, backgroundColor: '#F92400', borderRadius: 3 / 2, marginTop: 8 }}></View> : null}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
}

//let sibling = null;
export class PopupPromptView extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        }
    }
    show() {
        this.setState({ visible: true });
    }

    hidden() {
        this.setState({ visible: false })
        // sibling.destroy();
    }

    render() {
        return (this.state.visible ?
            <TranslucentModal animationType={'none'} transparent={true} visible={true} onRequestClose={() => { this.hidden() }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this.hidden()} >
                    <View style={{ backgroundColor: '#ffffff', marginLeft: 38, marginRight: 38, padding: 15, alignItems: 'center', borderRadius: 10 }}>
                        <Text style={{ color: '#666666', fontSize: 15 }}>3日胜率</Text>
                        <Text style={{ color: '#262628', fontSize: 18, marginTop: 15, lineHeight: 18 * 1.4 }}>“3日胜率”指买入后三个交易日内 可盈利的概率，可分为1月，3月，6月，1年统计</Text>
                        <View style={{ marginTop: 15, width: baseStyle.width - 38 * 2, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                        <Text style={{ color: '#FF0000', fontSize: 17, marginTop: 15 }} onPress={() => this.hidden()}>知道了</Text>
                    </View>
                </TouchableOpacity>
            </TranslucentModal>
            : null);
    }
}