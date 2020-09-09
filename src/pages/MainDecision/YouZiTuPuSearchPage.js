/*
 * @Author: lishuai
 * @Date: 2019-09-18 09:48:23
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-12-09 11:51:51
 * 游资图谱搜索页面
 */

import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
import HistoryView from "../../components/HistoryView";
import AsyncStorage from '@react-native-community/async-storage';

const PageSize = 20;

export default class YouZiTuPuSearchPage extends BaseComponentPage {

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
        let params = { 'pageNum': this.pageNumber, 'pageSize': PageSize, 'sortField': 'win3', 'desc': true, 'branch': this.state.textInput };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/youzitupu', params, (x) => {
            this.isRequist = false;
            if (!x) return;
            if (this.state.isShowHistory) return;
            let items = this.state.data[0].items;
            let list = x.list;
            for (let i = 0; i < list.length; i++) {
                const element = list[i];
                let item = {
                    branchId: element.branchId,
                    branchName: element.branchName,
                    onlineTimes: element.onlineTimes,
                    branchType: element.branchType,
                    rank: element.rank,
                    stars: element.stars,
                    win3: element.win3
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

    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"游资图谱"} />
                <LargeList
                    bounces={(this.state.textInput && this.state.textInput !== "" && this.state.data[0].items.length > 0) ? true : false}
                    style={{ backgroundColor: "white", flex: 1 }}
                    data={this.state.data}
                    scrollEnabled={true}
                    ref={'list'}
                    heightForSection={() => 30}
                    renderHeader={this._renderunLockHeader}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => 80}
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
    _renderStarItem(stars) {
        let array = [1, 1, 1, 1];
        return (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {array.map(idx =>
                    <Image style={{ width: 14, height: 14, right: 3 }} source={idx < stars ? require('../../images/icons/star_selected_icon.png') : require('../../images/icons/star_unselected_icon.png')}></Image>
                )}
            </View>
        )
    }

    _itemOnClick(item, id, path) {
        // Navigation.pushForParams(this.props.navigation, 'XiWeiTouShiPage', { branchId: id });
        let keywordType = '营业部名称';
        sensorsDataClickObject.clickSearchResult.keyword = this.state.textInput;
        sensorsDataClickObject.clickSearchResult.search_result_num = this.state.data[path.section].items.length;
        sensorsDataClickObject.clickSearchResult.keyword_type = keywordType;
        sensorsDataClickObject.clickSearchResult.keyword_number = path.row + 1;
        sensorsDataClickObject.clickSearchResult.label_name = '游资图谱';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.clickSearchResult)

        this.itemOnClick(item);

    }

    _renderItem = (path) => {
        let oldData = this.state.data[0].items;
        let item = oldData[path.row];
        return (
            <TouchableOpacity
                style={{ backgroundColor: '#ffffff', borderBottomColor: '#0000001a', borderBottomWidth: 1, paddingTop: 10, paddingBottom: 10 }}
                activeOpacity={1} onPress={() => this._itemOnClick(item, item.branchId, path)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Text style={{ flex: 1, fontSize: 16, color: '#000000cc', textAlign: 'center' }}>{item.onlineTimes}</Text>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: '#000000', textAlign: 'center' }}>{item.branchType}</Text>
                    {this._renderStarItem(item.stars)}
                    <StockFormatText style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: '#000000CC', textAlign: 'center' }} unit='%' >{item.win3 / 100}</StockFormatText>
                </View>
                <View style={{ marginLeft: 15, marginRight: 15, marginTop: 10, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                <View style={{ flexDirection: 'row', marginTop: 10, paddingLeft: 10, paddingRight: 10, alignItems: 'center' }}>
                    <View style={{ width: 50, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#3399FF', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#3399FF' }}>营业部</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, marginLeft: 10, color: '#00000099' }} numberOfLines={1}>{item.branchName}</Text>
                </View>
            </TouchableOpacity>
        );
    };
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
                            placeholder={"请输入营业部名称"}
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

    _renderHistory = () => {

        return (
            <View sytle={{ width: ScreenUtil.screenW }}>
                {<HistoryView
                    type={'listview'}
                    historykey='search_history_yuozitupu'
                    itemOnClick={this.itemOnClick.bind(this)}
                />
                }
            </View>
        )

    };


    itemOnClick(item) {
        Navigation.pushForParams(this.props.navigation, 'XiWeiTouShiPage', { branchId: item.branchId });
        item = {
            secCode: item.branchId,
            secName: item.branchName,
            branchId: item.branchId,
            branchName: item.branchName
        };

        this.saveHistoryData(item);
    }


    onTextChange(text) {
        if (text !== "") {
            this.isRequist = true;
            this.setState({
                textInput: text,
                isShowHistory: false
            }, () => {
                this.pageNumber = 1;
                this.fetchData();
            })
        } else {
            this.pageNumber = 1;
            this.state.data[0].items = [];
            this.setState({
                textInput: text,
                data: this.state.data,
                isShowHistory: true
            })
        }
    }
    saveHistoryData(item) {
        if (!item) return;
        AsyncStorage.getItem('search_history_yuozitupu')
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
                AsyncStorage.setItem('search_history_yuozitupu', JSON.stringify(data), (error) => {
                });
            })
    }

    _renderSection = () => {
        if (this.state.data[0].items.length == 0) {
            return null;
        } else {
            return (
                <View style={{ height: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F2FAFF' }}>
                    <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>上榜次数</Text>
                    <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>席位类型</Text>
                    <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>资金实力</Text>
                    <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                        <Text style={{ fontSize: 12, color: '#00000099' }}>三日成功率</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };
}
