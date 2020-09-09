/*
 * @Author: lishuai 
 * @Date: 2019-08-16 13:16:35 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-06-08 16:17:33
 * 热点聚焦列表
 */

import React from 'react';
import { DeviceEventEmitter, Image, Text, TouchableOpacity, View } from 'react-native';
import * as baseStyle from '../../components/baseStyle';
import PullListView, { RefreshState } from '../../components/PullListView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import UserInfoUtil from '../../utils/UserInfoUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import { HotFocusListItemComponent } from './TuyereDecisionPage';

export default class HotFocusPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.hotFocusRef = YdCloud().ref(MainPathYG + 'ZhuanJiaFenXi/ReDianJuJiao');
        this.pageKey = ''; // 用来翻页的标记
        this.pageNumber = 20;
        this.offsetY = 0;
        this.state = {
            data: [],
            refreshState: RefreshState.Idle, // footer状态
            headerFreshState: true,
            showTips: false, // 是否显示顶部新消息提示条
        };
    }
    componentDidMount() {
        this._loadData()
        this._onData();
        this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
            if (obj != 1) {
                this.hotFocusRef && this.hotFocusRef.orderByKey().off('child_add', () => { });
            } else {
                this._onData();
            }
        });
    }
    componentWillUnmount() {
        this.hotFocusRef && this.hotFocusRef.orderByKey().off('child_add', () => { });
        this.appMainTabChange && this.appMainTabChange.remove();
    }
    _filterHTML(str) {
        str = str.replace(/<\/?[^>]+>/g, ''); // 去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); // 去除行尾空白
        str = str.replace(/\n[\s| | ]*\r/g, '\n'); // 去除多余空行
        str = str.replace(/&nbsp;/ig, ''); // 去掉&nbsp;
        return str;
    }
    _loadData() {
        this.hotFocusRef.orderByKey().limitToLast(this.pageNumber).get(snap => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                values.reverse();
                this.pageKey = keys[0];
                for (let i = 0; i < keys.length; i++) {
                    const element = values[i];
                    try {
                        element.stocks = Object.values(element.stocks);
                    } catch (error) {
                        element.stocks = [];
                    }
                    element.content = this._filterHTML(element.content);
                }
                this.setState({ data: values, refreshState: keys.length < this.pageNumber ? RefreshState.NoMoreData : RefreshState.Idle, headerFreshState: false });
            }
        });
    }
    _loadMoreData = () => {
        if (!this.state.data.length) return;
        this.setState({ refreshState: RefreshState.FooterRefreshing });
        this.hotFocusRef.orderByKey().endAt(this.pageKey).limitToLast(this.pageNumber + 1).get(snap => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                this.pageKey = keys[0];
                values.splice(values.length - 1, 1); // 删除重复的那一条数据
                values.reverse();
                for (let i = 0; i < values.length - 1; i++) {
                    const element = values[i];
                    element.stocks = Object.values(element.stocks)
                    element.content = this._filterHTML(element.content);
                }
                let oldData = this.state.data;
                let newData = oldData.concat(values);
                this.setState({ data: newData, refreshState: keys.length < this.pageNumber ? RefreshState.NoMoreData : RefreshState.Idle });
            }
        });
    }
    // 监听热点聚焦列表数据更新
    _onData() {
        this.hotFocusRef.orderByKey().on('child_add', snap => {
            if (snap.code == 0) {
                let value = snap.nodeContent;
                value.stocks = Object.values(value.stocks);
                value.content = this._filterHTML(value.content);
                let oldData = this.state.data;
                oldData.unshift(value);
                this.setState({ data: oldData, showTips: this.offsetY > 0 });
            }
        });
    }
    // 查看新观点点击事件
    _tipsOnClick = () => {
        this.setState({ showTips: false }, () => {
            this.list.goTop();
        });
    }
    /// 热点聚焦cell点击事件
    _hotFocusItemOnClick(id) {
        Navigation.pushForParams(this.props.navigation, 'HotFocusDetailPage', { id: id });
    }
    // 开通权限
    openPermisionOnClick() {
        Navigation.pushForParams(this.props.navigation, "MarketingDetailPage", {
            name: "开通权限",
            permissions: 3,
            type: 'FuFeiYingXiaoYe'
        })
    }
    _renderItem = (data) => {
        return (
            <View style={{ borderBottomColor: baseStyle.LINE_BG_F6, borderBottomWidth: 10 }}>
                <HotFocusListItemComponent
                    data={data.item}
                    itemOnClick={(id) => this._hotFocusItemOnClick(id)}
                    navigation={this.props.navigation}
                />
            </View>
        )
    }
    _renderList() {
        return (
            <PullListView
                ref={list => this.list = list}
                style={{ flex: 1 }}
                data={this.state.data}
                renderItem={this._renderItem}
                refreshState={this.state.refreshState}
                onFooterRefresh={this._loadMoreData}
                footerNoMoreDataText='没有更多内容了'
                refreshing={this.state.headerFreshState}
                onRefresh={() => {
                    this._loadData();
                }}
                keyExtractor={(item, index) => item + index}
                extraData={this.state}
                onScroll={x => {
                    this.offsetY = x.nativeEvent.contentOffset.y;
                    if (this.offsetY < 150) {
                        this.setState({ showTips: false });
                    }
                }}
            />
        );
    }
    render() {
        let userPermission = UserInfoUtil.getUserPermissions();
        if (userPermission >= 3) {
            return (
                <View style={{ flex: 1, backgroundColor: '#fff', borderTopColor: '#F1F1F1', borderTopWidth: 1 }}>
                    {this._renderList()}
                    {this.state.showTips && <HotFocusTipsComponent style={{ position: 'absolute', top: 0 }} tipsOnClickCallback={this._tipsOnClick} />}
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1, backgroundColor: '#f6f6f6', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: "#626262" }}>您暂无权限查看当前功能</Text>
                    <TouchableOpacity
                        onPress={() => { this.openPermisionOnClick() }}
                        style={{
                            width: 150,
                            height: 40,
                            marginTop: 30,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 5,
                            backgroundColor: "#f91e00"
                        }}>
                        <Text style={{ fontSize: 17, color: "#fff" }}>去开通</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
}

export class HotFocusTipsComponent extends BaseComponentPage {
    render() {
        return (
            <TouchableOpacity
                style={[{ height: 30, width: baseStyle.width, flexDirection: 'row', backgroundColor: '#FF3333', justifyContent: 'center', alignItems: 'center' }, this.props.style]}
                onPress={() => this.props.tipsOnClickCallback && this.props.tipsOnClickCallback()}>
                <Image source={require('../../images/icons/hot_focus_tips_arrow_icon.png')}></Image>
                <Text style={{ fontSize: 14, color: '#fff', marginLeft: 15 }}>查看新观点</Text>
            </TouchableOpacity>
        );
    }
}