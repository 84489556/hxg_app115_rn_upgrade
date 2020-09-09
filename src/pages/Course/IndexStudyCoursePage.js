/*
 * @Author: lishuai
 * @Date: 2019-08-14 18:01:43
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-08-26 12:08:57
 * 指标学习课程列表页面
 */
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import TranslucentModal from 'react-native-translucent-modal';
import * as baseStyle from "../../components/baseStyle";
import RiskWarning from '../../components/RiskTipsFooterView';
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import UserInfoUtil from '../../utils/UserInfoUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import { connect } from 'react-redux';
import { sensorsDataClickObject } from "../../components/SensorsDataTool";
import ShareSetting from "../../modules/ShareSetting";

//只是Android 使用
import FastImage from 'react-native-fast-image'

class IndexStudyCoursePage extends BaseComponentPage {

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
            refreshing: false
        }
    }
    componentDidMount() {
        this._fetchAllTaoXiNameData();
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zhibiaoxuexiliebiao);
        });
        sensorsDataClickObject.videoPlay.entrance = '指标学习列表'
        sensorsDataClickObject.videoPlay.class_type = '指标学习列表'
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
            YdCloud().ref(MainPathYG + 'ZhiBiaoKeTang/' + permission).orderByKey().firstLevel().get(snap => {
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
            YdCloud().ref(MainPathYG + 'ZhiBiaoTaoXiJieShao/' + x.name).get(snap => {
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
        const path = MainPathYG + 'ZhiBiaoKeTang/' + this.state.curTaoXi.permission + '/' + this.state.curTaoXi.name;
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
        const path = MainPathYG + 'ZhiBiaoKeTang/' + this.state.curTaoXi.permission + '/' + this.state.curTaoXi.name;
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
    // 课程点击跳转
    _itemOnClick(data) {
        let path = MainPathYG + 'ZhiBiaoKeTang/' + data.star + '/' + data.setsystem + '/' + data.createTime;
        let optionParams = { path: path, star: data.star, taoxiName: data.setsystem };
        Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
            key: data.createTime,
            type: 'IndexStudy',
            ...optionParams
        });
        sensorsDataClickObject.videoPlay.class_series = data.setsystem
        sensorsDataClickObject.videoPlay.class_name = data.title
        sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(data.createTime), 'yyyy-MM-dd')

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
            sensorsDataClickObject.loginButtonClick.entrance = '指标学习'
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
                            {showLock ? <Image style={{ width: 10, height: 12, marginLeft: 5 }} source={require('../../images/livelession/Growth/course_lock_icon.png')}></Image> : null}
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
                            />
                        }

                    </ImageBackground>
                </View>
            </TouchableOpacity>
        );
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
                    selectedIdx={selectedIdx}
                    data={this.state.taoXiData}
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
    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'指标学习'} />
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
    }

    render() {
        return (this.state.visible ?
            <TranslucentModal animationType={'none'} transparent={true} visible={true} onRequestClose={() => { this.hidden() }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#ffffff', marginLeft: 38, marginRight: 38, padding: 15, paddingBottom: 0, alignItems: 'center', borderRadius: 10 }}>
                        <Text style={{ color: '#666666', fontSize: 15 }}>您还未开通该功能权限！</Text>
                        <Text style={{ color: '#262628', fontSize: 18, marginTop: 15, lineHeight: 18 * 1.4, textAlign: 'center' }}>客服电话:0311-66856698{'\n'}竭诚为您服务</Text>
                        <View style={{ marginTop: 15, width: baseStyle.width - 38 * 2, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                        <TouchableOpacity style={{ height: 45, width: baseStyle.width - 38 * 2, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this.hidden()}>
                            <Text style={{ color: '#FF0000', fontSize: 17 }}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TranslucentModal> : null)
    }
}

export class TaoXiInfoView extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            title: '',
            subtitle: ''
        }
    }
    show(title, subtitle) {
        this.setState({ visible: true, title: title, subtitle: subtitle });
    }

    hidden() {
        this.setState({ visible: false })
    }

    render() {
        return (this.state.visible ?
            <TranslucentModal animationType={'none'} transparent={true} visible={true} onRequestClose={() => { this.hidden() }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }} >
                    <View style={{ height: baseStyle.height * 0.417, backgroundColor: '#ffffff', marginLeft: 38, marginRight: 38, padding: 15, paddingBottom: 0, alignItems: 'center', borderRadius: 10 }}>
                        <Text style={{ color: '#666666', fontSize: 15 }}>{this.state.title}</Text>
                        <View style={{ marginTop: 15, width: baseStyle.width - 38 * 2, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                        <ScrollView showsVerticalScrollIndicator={false} alwaysBounceVertical={true}>
                            <Text style={{ color: '#262628', fontSize: 18, marginTop: 15, lineHeight: 18 * 1.4, textAlign: 'center' }}>{this.state.subtitle}</Text>
                        </ScrollView>
                        <View style={{ marginTop: 15, width: baseStyle.width - 38 * 2, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                        <TouchableOpacity style={{ height: 45, width: baseStyle.width - 38 * 2, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this.hidden()}>
                            <Text style={{ color: '#FF0000', fontSize: 17 }}>我知道了</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TranslucentModal> : null)

    }
}

// 课程模块用到的标签云组件
export class CourseLabelCloudComponent extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {
            fold: true, // 收起展开状态，默认收起
            selectedKindIndex: this.props.selectedIdx, // 选中的分类索引
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedIdx != this.props.selectedIdx) {
            this.setState({ selectedKindIndex: nextProps.selectedIdx });
        }
    }
    tabItemOnChange(index, value) {
        if (index !== this.state.selectedKindIndex) {
            this.setState({ selectedKindIndex: index, fold: true }, () => {
                this.props.handleTabChanged && this.props.handleTabChanged(value);
            });
        }
    }
    render() {
        let subTabItemWidth = (baseStyle.width - 45) / 4;
        let allTabs = this.props.data;
        const showFold = this.props.data.length > 8;
        let foldTabs = allTabs.length > 8 ? allTabs.slice(0, 8) : allTabs;
        let data = this.state.fold ? foldTabs : allTabs;
        const foldText = this.state.fold ? '展开' : '收起';
        const foldImgSrc = this.state.fold ? require('../../images/icons/course_arrow_down_icon.png') : require('../../images/icons/course_arrow_up_icon.png');
        if (!data.length) return null;
        return (
            <View>
                <View style={{ backgroundColor: '#f6f6f6', padding: 10, paddingBottom: 0 }}>
                    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10, flexDirection: 'row', flexWrap: 'wrap', paddingBottom: showFold ? 0 : 10 }}>
                        {data.map((value, index) => {
                            let isSelected = this.state.selectedKindIndex == index;
                            let textColor = isSelected ? '#ffffff' : '#00000066';
                            let bgColor = isSelected ? '#3399FF' : '#0000000d';
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={{ width: subTabItemWidth, height: 35, marginTop: 5, marginLeft: 5, paddingLeft: 5, paddingRight: 5, borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: bgColor }}
                                    activeOpacity={1}
                                    onPress={() => this.tabItemOnChange(index, value)}>
                                    <Text style={{ textAlign: 'center', fontSize: 14, color: textColor }} numberOfLines={2}>{value.name}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    {showFold && <TouchableOpacity style={{ height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', flexDirection: 'row' }} activeOpacity={1} onPress={() => this.setState({ fold: !this.state.fold })}>
                        <Text style={{ color: '#00000066', fontSize: 12 }}>{foldText}</Text>
                        <Image style={{ marginLeft: 5 }} source={foldImgSrc}></Image>
                    </TouchableOpacity>}
                </View>
                <TouchableOpacity activeOpacity={1} onPress={showFold ? () => this.setState({ fold: !this.state.fold }) : () => { }}>
                    <Image style={{ width: baseStyle.width, marginTop: -9 }} source={require('../../images/livelession/Growth/course_shadow_bg.png')}></Image>
                </TouchableOpacity>
            </View>
        )
    }
}

export default connect((state) => ({
    permission: state.UserInfoReducer.permissions,
    activityPer: state.UserInfoReducer.activityPer
}))(IndexStudyCoursePage)
