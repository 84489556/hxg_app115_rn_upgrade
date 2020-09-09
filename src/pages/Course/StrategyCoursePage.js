/*
 * @Author: lishuai
 * @Date: 2019-08-14 18:01:57
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-08-26 12:09:22
 * 策略学堂课程列表页面
 */
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Platform,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import NavigationTitleView from '../../components/NavigationTitleView';
import RiskWarning from '../../components/RiskTipsFooterView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import UserInfoUtil from '../../utils/UserInfoUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import { CourseLabelCloudComponent, PopupPromptView, TaoXiInfoView } from './IndexStudyCoursePage';
import { connect } from 'react-redux';
//只是Android 使用
import FastImage from 'react-native-fast-image'
import { sensorsDataClickObject } from "../../components/SensorsDataTool";
import ShareSetting from "../../modules/ShareSetting";

class StrategyCoursePage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.pageNumber = 20;
        this.permission = UserInfoUtil.getUserPermissions();
        this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou;
        this.taoXiNameData = []; // 套系名称
        this.state = {
            taoXiData: [], // 套系标签数据
            curTaoXi: null, // 当前选中的套系
            data: [],
            pageKey: '',
            showFooter: 0,// 控制footer， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            refreshing: false,
        }
    }

    componentDidMount() {
        this._fetchAllTaoXiNameData();
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.celueketangliebiao);
        });
        sensorsDataClickObject.videoPlay.entrance = '策略学堂列表'
        sensorsDataClickObject.videoPlay.class_type = '策略学堂'
    }
    componentWillReceiveProps() {
        if (this.permission !== UserInfoUtil.getUserPermissions()) {
            this.permission = UserInfoUtil.getUserPermissions();
            this._fetchAllTaoXiNameData();
        }
        if (this.isDuoTouUser != (UserInfoUtil.getUserInfoReducer().activityPer === DuoTou)) {
            this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou;
        }
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }
    // 获取用户权限可见的全部套系名称
    async _fetchAllTaoXiNameData() {
        this.taoXiNameData = [];
        let permissions = [0, -2, 3];
        if (this.permission == 4) {
            permissions.push(4);
        } else if (this.permission == 5) {
            permissions.push(4);
            permissions.push(5);
        }
        await Promise.all(permissions.map(x => this._fetchTaoXiNameData(x))).then(x => {
            for (const value of x) {
                if (value instanceof Array) {
                    this.taoXiNameData = this.taoXiNameData.concat(value);
                }
            }
            this._fetchKindData();
        }).catch(error => {
            this.setState({ showFooter: 0, refreshing: false });
        });
    }
    // 获取套系名称
    _fetchTaoXiNameData(permission) {
        return new Promise((resolve) => {
            YdCloud().ref(MainPathYG + 'ChengZhangKeTang/' + permission).orderByKey().firstLevel().get(snap => {
                if (snap.code == 0) {
                    let keys = Object.keys(snap.nodeContent);
                    let x = keys.map(key => {
                        return { permission: permission, name: key };
                    })
                    resolve(x);
                } else {
                    resolve(null);
                }
            });
        })
    }
    // 获取套系数据
    async _fetchKindData() {
        let array = this.taoXiNameData;
        await Promise.all(array.map(x => this._fetchTaoXiInfoData(x))).then(x => {
            let values = [];
            // 过滤掉null
            x.forEach(element => {
                if (element) {
                    values.push(element);
                }
            });
            values.sort(function (a, b) {
                return b.createTime - a.createTime; // 倒序
            });
            this.setState({ taoXiData: values, curTaoXi: values.length ? values[0] : null }, () => {
                this._loadListData();
            })
        }).catch(error => {
            this.setState({ showFooter: 0, refreshing: false });
        });
    }
    // 获取套系介绍信息
    _fetchTaoXiInfoData(x) {
        return new Promise((resolve) => {
            YdCloud().ref(MainPathYG + 'CeLueTaoXiJieShao/' + x.name).get(snap => {
                if (snap.code == 0) {
                    let info = snap.nodeContent;
                    info.name = x.name;
                    info.permission = x.permission;
                    resolve(info);
                } else {
                    resolve(null);
                }
            });
        })
    }
    _loadListData() {
        if (!this.state.curTaoXi) return;
        const path = MainPathYG + 'ChengZhangKeTang/' + this.state.curTaoXi.permission + '/' + this.state.curTaoXi.name;
        YdCloud().ref(path).orderByKey().orderByKey().limitToLast(this.pageNumber).get((snap) => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                values.reverse();
                let footer = values.length < this.pageNumber ? 1 : 2;
                this.setState({ pageKey: keys[0], data: values, showFooter: footer, refreshing: false });
            } else {
                this._fetchAllTaoXiNameData();
            }
        });
    }
    _loadMoreData() {
        if (this.state.data.length < this.pageNumber) return;
        const path = MainPathYG + 'ChengZhangKeTang/' + this.state.curTaoXi.permission + '/' + this.state.curTaoXi.name;
        YdCloud().ref(path).orderByKey().endAt(this.state.pageKey).limitToLast(this.pageNumber + 1).get((snap) => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                values.splice(values.length - 1, 1); // 删除重复的那一条数据
                values.reverse();
                let oldData = this.state.data;
                let newData = oldData.concat(values);
                let footer = values.length < this.pageNumber ? 1 : 2;
                this.setState({ pageKey: keys[0], data: newData, showFooter: footer, refreshing: false })
            }
        });
    }
    tabItemOnChange(value) {
        this.setState({ curTaoXi: value, data: [] }, () => {
            this._loadListData();
        });
    }
    //下拉刷新
    _onRefreshTop() {
        this.setState({ refreshing: true }, () => {
            this._loadListData();
        });
    }
    //上拉加载更多
    _onRefresh() {
        this._loadMoreData();
    }
    _bottomComponent() {
        if (this.state.showFooter === 1) {
            return (
                <RiskWarning />
            );
        } else if (this.state.showFooter === 2) {
            return (
                <View style={{ flexDirection: 'row', height: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                    <ActivityIndicator />
                    <Text style={{ marginLeft: 5, color: '#999999' }}>正在加载...</Text>
                </View>
            );
        } else if (this.state.showFooter === 0) {
            return null;
        }
    }
    renderHeaderView() {
        if (!this.state.curTaoXi) return null;
        let selectedIdx = 0;
        for (let i = 0; i < this.state.taoXiData.length; i++) {
            const element = this.state.taoXiData[i];
            if (element.name == this.state.curTaoXi.name) {
                selectedIdx = i;
                break;
            }
        }
        const name = this.state.curTaoXi ? this.state.curTaoXi.name : '';
        const subtitle = this.state.curTaoXi ? this.state.curTaoXi.introduce : '';
        sensorsDataClickObject.videoPlay.class_series = name;
        return (
            <View>
                <CourseLabelCloudComponent
                    data={this.state.taoXiData}
                    selectedIdx={selectedIdx}
                    handleTabChanged={(value) => this.tabItemOnChange(value)}
                />
                <View style={{ height: 40, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: '#0000001a', borderBottomWidth: 1 }}>
                    <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={require('../../images/livelession/Growth/strategy_section_icon.png')}></Image>
                        <Text style={{ fontSize: 15, marginLeft: 6, color: '#000000cc' }}>{name}</Text>
                    </View>
                    <TouchableOpacity style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this.taoXiInfo && this.taoXiInfo.show(name, subtitle)}>
                        <Image style={{ width: 15, height: 15 }} source={require('../../images/icons/doubt_icon.png')}></Image>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    //  <Image style={{ width: 80, height: 45, borderRadius: 10 }} source={{ uri: data.cover_url }}></Image>
    _renderItem = (items) => {
        let data = items.item;
        if (!data) return null;
        let showLock = false;
        let showBottomLine = (this.state.data.length - 1 != items.index);
        if (this.permission == 0 || this.permission == 1) {
            if (this.isDuoTouUser) {
                showLock = this.permission < data.star;
            } else {
                showLock = this.permission < data.star || data.star == -2;// star 值-2说明是多头启动权限的课程
            }
        }
        return (
            <TouchableOpacity style={{ height: 65, paddingLeft: 15, paddingRight: 15, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => this.itemClicked(data)}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#0000001A', borderBottomWidth: showBottomLine ? 1 : 0 }}>
                    <View>
                        <Text style={{ fontSize: 15, color: '#000000' }}>{data.title}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            <Text style={{ fontSize: 12, color: '#ff660099' }}>{data.like}人已点赞</Text>
                            {showLock ?
                                <Image style={{ width: 10, height: 12, marginLeft: 5 }} source={require('../../images/livelession/Growth/course_lock_icon.png')}></Image> :
                                null}
                        </View>
                    </View>
                    <ImageBackground style={{ width: 80, height: 45, borderRadius: 10, overflow: 'hidden' }} source={require('../../images/icons/placeholder_bg_image.png')}>


                        {Platform.OS === 'ios' ?
                            <Image
                                style={{ width: 80, height: 45, borderRadius: 10 }}
                                source={{ uri: data.cover_url }}
                            />
                            :
                            <FastImage
                                style={{ width: 80, height: 45, borderRadius: 10 }}
                                source={{ uri: data.cover_url }}
                            //resizeMode={FastImage.resizeMode.stretch}
                            />
                        }
                    </ImageBackground>
                </View>
            </TouchableOpacity>
        );
    }
    // 课程点击跳转
    _itemOnClick(data) {
        let path = MainPathYG + 'ChengZhangKeTang/' + data.star + '/' + data.setsystem + '/' + data.createTime;
        let optionParams = { path: path, star: data.star, taoxiName: data.setsystem };
        Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
            key: data.createTime,
            type: 'Strategy',
            ...optionParams
        });
        sensorsDataClickObject.videoPlay.class_name = data.title
        sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(data.createTime), 'yyyy-MM-dd')
        console.log(sensorsDataClickObject.videoPlay.publish_time);

    }
    // 未付费用户点击课程
    itemOnClickForUnpaidUser(data) {
        if (this.isDuoTouUser) {
            if (this.permission < data.star) {
                this.prompt && this.prompt.show();
            } else {
                this._itemOnClick(data);
            }
        } else {
            if (this.permission < data.star || data.star == -2) {
                this.prompt && this.prompt.show();
            } else {
                this._itemOnClick(data);
            }
        }
    }
    itemClicked(item) {
        if (item.id === undefined) return;
        if (this.permission == 0) { // 游客
            sensorsDataClickObject.loginButtonClick.entrance = '策略学堂'
            Navigation.pushForParams(this.props.navigation, "LoginPage", {
                callBack: () => {
                    if (this.permission == 0) return;
                    if (this.permission == 1) { // 未付费用户
                        this.itemOnClickForUnpaidUser(item);
                    } else { // 付费用户
                        this._itemOnClick(item);
                    }
                }
            });
        } else if (this.permission == 1) { // 未付费用户
            this.itemOnClickForUnpaidUser(item);
        } else { // 付费用户
            this._itemOnClick(item);
        }
    }

    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'策略学堂'} />
                {this.renderHeaderView()}
                <FlatList
                    style={{ flex: 1 }}
                    data={this.state.data}
                    extraData={this.state}
                    onRefresh={this._onRefreshTop.bind(this)}
                    refreshing={this.state.refreshing}
                    onEndReached={this._onRefresh.bind(this)}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={this._bottomComponent.bind(this)}
                    ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    renderItem={this._renderItem}
                />
                {<PopupPromptView ref={ref => this.prompt = ref} />}
                {<TaoXiInfoView ref={info => this.taoXiInfo = info} />}
            </BaseComponentPage>
        )
    }
}

export default connect((state) => ({
    permission: state.UserInfoReducer.permissions,
    activityPer: state.UserInfoReducer.activityPer
}))(StrategyCoursePage)
