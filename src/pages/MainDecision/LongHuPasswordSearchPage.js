/*
 * @Author: lishuai
 * @Date: 2019-09-17 18:00:57
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-12-16 19:01:47
 * 龙虎密码搜索页面
 */

import React from 'react';
import { Image, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LargeList } from "react-native-largelist-v3";
import RequestInterface from "../../actions/RequestInterface";
import * as baseStyle from '../../components/baseStyle';
import { mNormalFooter } from "../../components/mNormalFooter";
import NavigationTitleView from "../../components/NavigationTitleView";
import StockFormatText from '../../components/StockFormatText';
import BaseComponentPage from "../../pages/BaseComponentPage";
import { toast } from '../../utils/CommonUtils';
import * as ScreenUtil from "../../utils/ScreenUtil";
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool';
import ShareSetting from "../../modules/ShareSetting";
import HistoryView from "../../components/HistoryView";
import AsyncStorage from '@react-native-community/async-storage';

const PageSize = 20;

export default class LongHuPasswordSearchPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.pageNumber = 1;
        this.state = {
            textInput: "",//关键字
            data: [{
                items: []
            }],
            allLoaded: false, // 数据是否加载完毕
            isShowHistory: true
        };
        this.isRequist = false;//是否在请求中
    }
    componentDidMount() {

    }

    fetchData() {
        this.isRequist = true;
        let params = { 'pageNum': this.pageNumber, 'pageSize': PageSize, 'keyword': this.state.textInput };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/searchLongHuMiMa', params, (x) => {
            this.isRequist = false;
            if (!x) return;
            if (this.state.isShowHistory) return;
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
            this.isRequist = false;
            toast(error);
        })
    }
    _loadMoreData() {
        this.pageNumber = this.pageNumber + 1;
        this.fetchData();
    }
    _clickBack = () => {
        this.props.onBack ? this.props.onBack() : this.props.navigation.goBack();
    };
    _itemOnClick(item, path) {

        this.itemOnClick(item);

        let keywordType = this.state.textInput
        if (IsNumberString(this.state.textInput)) {
            keywordType = '股票代码'
        } else {
            // keywordType = item.secName
            keywordType = '板块名称'
        }
        sensorsDataClickObject.clickSearchResult.keyword = this.state.textInput
        sensorsDataClickObject.clickSearchResult.search_result_num = this.state.data[path.section].items.length
        sensorsDataClickObject.clickSearchResult.keyword_type = keywordType
        sensorsDataClickObject.clickSearchResult.keyword_number = path.row + 1
        sensorsDataClickObject.clickSearchResult.label_name = '龙虎密码'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.clickSearchResult)

    }

    itemOnClick(item) {
        let date = item.transDate.length >= 10 && item.transDate.substring(0, 10);
        if (!item.secCode || !date) return;
        Navigation.pushForParams(this.props.navigation, 'OnListDetailPage', { secCode: item.secCode, transDate: date });
        this.saveHistoryData({
            secCode: item.secCode,
            secName: item.secName,
            transDate: item.transDate
        });

    }
    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"龙虎密码"} />
                <LargeList
                    bounces={(this.state.textInput && this.state.textInput !== "" && this.state.data[0].items.length > 0) ? true : false}
                    style={{ backgroundColor: '#ffffff', flex: 1 }}
                    data={this.state.data}
                    scrollEnabled={true}
                    ref={'list'}
                    heightForSection={() => 30}
                    renderHeader={this._renderunLockHeader}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => 110}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    headerStickyEnabled={false}
                    directionalLockEnabled={true}
                    loadingFooter={mNormalFooter}
                    renderFooter={this._renderFooters}
                    onLoading={() => {
                        if (this.state.textInput !== "") {
                            this._loadMoreData();
                        } else {
                            this.refs.list.endLoading();
                        }
                    }}
                    allLoaded={this.state.allLoaded}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { }}
                />

            </BaseComponentPage>
        )
    }

    _renderHistory = () => {

        return (
            <View sytle={{ width: ScreenUtil.screenW }}>
                {<HistoryView
                    type={'grid'}
                    historykey='search_history_longhu'
                    itemOnClick={this.itemOnClick.bind(this)}
                />
                }
            </View>
        )

    };


    /**
     * 加载脚布局
     * 此处用脚布局来控制空视图，避免页面由空视图和列表数据转换造成页面焦点失去
     * */
    _renderFooters = () => {
        if (this.state.textInput == "" || this.isRequist === true) {
            return (
                <View style={{ height: 0, width: ScreenUtil.screenW }}>
                    <View style={{ flex: 1 }} />
                </View>
            )
        } else {
            if (this.state.data[0].items.length === 0) {
                return (
                    <View style={{ width: ScreenUtil.screenW, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ alignItems: "center", justifyContent: "center", marginBottom: ScreenUtil.screenH / 3 }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                                source={require('../../images/TuyereDecision/no_stock_data.png')} />
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",
                                marginTop: ScreenUtil.scaleSizeW(100)
                            }}>暂无股票入选</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={{ height: 0, width: ScreenUtil.screenW }}>
                        <View style={{ flex: 1 }} />
                    </View>
                );
            }
        }
    };
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
            win3Color = '#FF9900';
        } else if (item.win3 > 80) {
            win3Color = '#FF3300';
        }
        return (
            <TouchableOpacity
                style={{ borderBottomColor: '#0000001a', borderBottomWidth: 1, paddingBottom: 15 }}
                activeOpacity={1}
                onPress={() => this._itemOnClick(item, path)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, paddingLeft: 15 }}>{item.secName}</Text>
                        <Text style={{ fontSize: 12, paddingLeft: 15, color: '#666666', marginTop: 5 }}>{item.secCode}</Text>
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
    _renderunLockHeader = () => {
        return (
            <View style={{
                width: ScreenUtil.screenW,
            }}>
                <View style={{
                    width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(90), alignItems: "center", justifyContent: "center",
                    backgroundColor: "#f1f1f1", flexDirection: "row"
                }}>
                    <View style={{
                        flex: 1, height: ScreenUtil.scaleSizeW(50), marginLeft: ScreenUtil.scaleSizeW(30),
                        flexDirection: "row", backgroundColor: "#d8d8d8", alignItems: "center", borderRadius: ScreenUtil.scaleSizeW(8)
                    }}>
                        <Image style={{ width: ScreenUtil.scaleSizeW(22), height: ScreenUtil.scaleSizeW(22), marginLeft: ScreenUtil.scaleSizeW(17), resizeMode: "contain" }}
                            source={require('../../images/hits/search.png')} />
                        <TextInput
                            style={{ fontSize: ScreenUtil.setSpText(28), flex: 1, marginRight: ScreenUtil.scaleSizeW(20), padding: 0, color: "#9d9d9d", marginLeft: ScreenUtil.scaleSizeW(17) }}
                            onChangeText={(text) => { this.onTextChange(text) }}
                            placeholder={"请输入股票代码/全拼/首字母"}
                            numberOfLines={1}
                            autoFocus={true}
                            value={this.state.textInput}
                        />
                    </View>
                    <TouchableOpacity onPress={() => { this._clickBack() }} style={{ width: ScreenUtil.scaleSizeW(115), height: ScreenUtil.scaleSizeW(90), justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(0,0,0,0.4)" }}>取消</Text>
                    </TouchableOpacity>

                </View>

                {this.state.isShowHistory ? this._renderHistory() : null}

            </View>
        );
    };
    onTextChange(text) {
        if (text !== "") {
            this.isRequist = true;
            this.setState({
                textInput: text,
                data: [{ items: [] }],
                isShowHistory: false
            }, () => {
                this.pageNumber = 1;
                this.fetchData();
            })
        } else {
            this.pageNumber = 1;
            this.setState({
                textInput: text,
                data: [{ items: [] }],
                isShowHistory: true
            })
        }
    }

    _renderSection = () => {
        if (this.state.data[0].items.length == 0) {
            return null;
        } else {
            return (
                <View style={{ height: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F2FAFF' }}>
                    <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>股票名称</Text>
                    <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>涨跌幅</Text>
                    <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>最新价</Text>
                    <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                        <Text style={{ fontSize: 12, color: '#00000099' }}>上榜天数</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    saveHistoryData(item) {
        if (!item) return;
        AsyncStorage.getItem('search_history_longhu')
            .then((value) => {
                let data = [];

                if (value) {
                    data = JSON.parse(value);
                }

                for (let i = 0; i < data.length; i++) {
                    if (data[i].secCode === item.secCode) {//相同的股票

                        return;
                    }
                }
                //最多存6个
                if (data.length >= 6) {
                    data.splice(5, 1);

                }


                data.unshift(item);
                AsyncStorage.setItem('search_history_longhu', JSON.stringify(data), (error) => {
                });
            })
    }

}
