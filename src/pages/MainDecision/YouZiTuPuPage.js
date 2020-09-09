/*
 * @Author: lishuai
 * @Date: 2019-08-12 10:00:07
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-12-13 17:20:27
 * 游资图谱列表页面
 */
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
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
export default class YouZiTuPuPage extends BaseComponentPage {
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
        let params = { 'pageNum': this.pageNumber, 'pageSize': PageSize, 'sortField': 'onlineTimes', 'desc': this.desc };
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, '/ydhxg/LongHuBang/youzitupu', params, (x) => {
            if (!x) return;
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
    _searchBtnOnClick() {
        Navigation.pushForParams(this.props.navigation, 'YouZiTuPuSearchPage',{entrance:'龙虎榜-游资图谱'})        
        sensorsDataClickObject.searchClick.entrance = '龙虎榜-游资图谱'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick)
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ height: 38, flexDirection: 'row', paddingLeft: 15, paddingRight: 15, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#00000066' }}>最近三个月</Text>
                    </View>
                    <YDSearchBar placeholderText={'请输入营业部名称'} onClick={() => this._searchBtnOnClick()}></YDSearchBar>
                </View>
                {this._renderList()}
            </View>
        )
    }
    _renderSection = () => {
        let imgSrc = this.desc ? require('../../images/hits/positive.png') : require('../../images/hits/negative.png');
        return (
            <View style={{ height: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F2FAFF' }}>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._sortBtnOnClick()}>
                    <Text style={{ fontSize: 12, color: '#00000099' }}>上榜次数</Text>
                    <Image style={{ width: 6, height: 12, marginLeft: 3 }} source={imgSrc}></Image>
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>席位类型</Text>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>资金实力</Text>
                <Text style={{ flex: 1, fontSize: 12, color: '#00000099', textAlign: 'center' }}>三日成功率</Text>
            </View>
        );
    };
    _renderStarItem(stars) {
        let array = [];
        for (let i = 0; i < 5; i++) {
            if (i < stars) {
                array.push(1);
            } else {
                array.push(0);
            }
        }
        return (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {array.map((value, index) =>
                    <Image key={index} style={{ width: 14, height: 14, marginLeft: 1, marginRight: 1 }} source={value == 1 ? require('../../images/icons/star_selected_icon.png') : require('../../images/icons/star_unselected_icon.png')}></Image>
                )}
            </View>
        )
    }

    _itemOnClick(id) {
        Navigation.pushForParams(this.props.navigation, 'XiWeiTouShiPage', { branchId: id });
    }

    _renderItem = (path) => {
        let oldData = this.state.data[0].items;
        let item = oldData[path.row];
        return (
            <TouchableOpacity
                style={{ backgroundColor: '#ffffff', borderBottomColor: '#0000001a', borderBottomWidth: 1, paddingTop: 10, paddingBottom: 10 }}
                activeOpacity={1} onPress={() => this._itemOnClick(item.branchId)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Text style={{ flex: 1, fontSize: 16, color: '#000000cc', textAlign: 'center', fontWeight: 'bold' }}>{item.onlineTimes}</Text>
                    <Text style={{ flex: 1, fontSize: 16, color: '#000000', textAlign: 'center', fontWeight: 'bold' }}>{item.branchType}</Text>
                    {this._renderStarItem(item.stars)}
                    <StockFormatText style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: '#000000CC', textAlign: 'center' }} unit='%' >{item.win3 / 100}</StockFormatText>
                </View>
                <View style={{ marginLeft: 15, marginRight: 15, marginTop: 10, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                <View style={{ flex: 1, flexDirection: 'row', marginTop: 10, paddingLeft: 10, paddingRight: 10, alignItems: 'center' }}>
                    <View style={{ width: 50, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#3399FF', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#3399FF' }}>营业部</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, marginLeft: 10, color: '#00000099' }} numberOfLines={1}>{item.branchName}</Text>
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
                heightForIndexPath={() => 90}
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