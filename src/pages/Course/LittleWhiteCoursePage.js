/*
 * @Author: lishuai
 * @Date: 2019-08-14 18:01:01
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-06-30 16:26:00
 * 股小白课程列表
 */
import React from "react";
import { ActivityIndicator, FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import ScrollableTabView, { DefaultTabBar } from "react-native-scrollable-tab-view";
import * as baseStyle from "../../components/baseStyle";
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import * as ScreenUtil from '../../utils/ScreenUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import { sensorsDataClickObject } from "../../components/SensorsDataTool";

//只是Android 使用
import FastImage from 'react-native-fast-image'

export default class LittleWhiteCoursePage extends BaseComponentPage {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        sensorsDataClickObject.videoPlay.entrance = '股小白列表'
        sensorsDataClickObject.videoPlay.class_type = '股小白'
    }
    render() {
        let initialPage = this.props.navigation.state.params.selectedIndex;
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'股小白'} noDivider={true} />
                <ScrollableTabView
                    tabLabel=''
                    style={{ backgroundColor: 'white', height: 33 }}
                    initialPage={initialPage}
                    locked={false}
                    tabBarUnderlineStyle={{ height: 0 }}
                    tabBarActiveTextColor={"#F92400"}
                    tabBarInactiveTextColor={'#999999'}
                    renderTabBar={() =>
                        <DefaultTabBar tabStyle={styles.tabStyles} style={{ height: 33, borderBottomWidth: 1, borderBottomColor: '#0000001a' }} />
                    }>
                    <LittleWhiteCourseSubPage tabLabel='技术小贴士' navigation={this.props.navigation} type='技术小贴士' kindId={1525759611928} />
                    <LittleWhiteCourseSubPage tabLabel='基本没问题' navigation={this.props.navigation} type='基本没问题' kindId={1525759642591} />
                    <LittleWhiteCourseSubPage tabLabel='操作小技巧' navigation={this.props.navigation} type='操作小技巧' kindId={1525759716486} />
                    <LittleWhiteCourseSubPage tabLabel='小白心态好' navigation={this.props.navigation} type='小白心态好' kindId={1525759786868} />
                </ScrollableTabView>
            </BaseComponentPage>
        )
    }
}

/// 股小白列表中的技术小贴士、基本没问题、操作小技巧、小白心态好列表
export class LittleWhiteCourseSubPage extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.taoXiRef = YdCloud().ref(MainPathCaiYuan + '/TaoXi')
        this.pageNumber = 20;
        this.taoXiId = this.props.kindId;
        this.state = {
            pageKey: '',
            data: null,
            showFooter: 2,// 控制footer， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            refreshing: false,
        }
        this._renderItem = this._renderItem.bind(this);
    }

    componentDidMount() {
        // this._reloadData();
        this._loadListData();        
    }

    _reloadData() {
        this.taoXiRef.orderByKey().get(snap => {
            if (snap.code == 0) {
                let items = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                for (let i = 0; i < items.length; i++) {
                    const element = items[i];
                    if (element.name == this.props.type) {
                        this.taoXiId = keys[i];
                        break;
                    }
                }
                if (this.taoXiId == 0) return;
                this._loadListData();
            }
        });
    }

    _loadListData() {
        YdCloud().ref(MainPathYG + 'XiaoBaiKeTang/' + this.taoXiId).orderByKey().limitToLast(this.pageNumber).get((snap) => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                values.reverse();
                let footer = values.length < this.pageNumber ? 1 : 2;
                this.setState({ pageKey: keys[0], data: values, showFooter: footer, refreshing: false });
            } else {
                // 如果有数据则不清空
                if (this.state.data) {
                    this.setState({ showFooter: 0, refreshing: false });
                } else { // 没有数据时设置为空数组，以便显示空数据页面
                    this.setState({ data: [], showFooter: 0, refreshing: false });
                }
            }
        });
    }
    _loadMoreData() {
        if (this.state.data.length < this.pageNumber) return;
        YdCloud().ref(MainPathYG + 'XiaoBaiKeTang/' + this.taoXiId).orderByKey().endAt(this.state.pageKey).limitToLast(this.pageNumber + 1).get((snap) => {
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
                <View style={{ height: 30, alignItems: 'center', justifyContent: 'flex-start', }}>
                    <Text style={{ color: '#999999', fontSize: 14, marginTop: 5, marginBottom: 5, }}>
                        没有更多数据了
                    </Text>
                </View>
            );
        } else if (this.state.showFooter === 2) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator />
                    <Text style={{ marginLeft: 5, color: '#999999' }}>正在加载...</Text>
                </View>
            );
        } else {
            return null;
        }
    }
    _itemClicked(item) {
        if (item.id === undefined || this.state.itemClicked) return;
        this.setState({ itemClicked: true }, () => {
            setTimeout(() => {
                this.setState({ itemClicked: false });
            }, 1000);
        })
        Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
            key: item.id,
            type: 'LittleWhite',
            kindId: item.set_id,
            path: MainPathYG + 'XiaoBaiKeTang/' + item.set_id + '/' + item.id
        });
        sensorsDataClickObject.videoPlay.class_series = this.props.tabLabel
        sensorsDataClickObject.videoPlay.class_name = item.title || ''
    }
    _renderItem(items) {
        let item = items.item;
        let itemWidth = baseStyle.width / 2 - 12.5;
        let itemHeight = itemWidth / 16 * 9;
        return (
            <TouchableOpacity key={item.create_time} activeOpacity={1} onPress={() => { this._itemClicked(item) }}>
                <View style={[styles.courseItemStyle, { marginLeft: items.index % 2 != 0 ? 5 : 10, marginRight: items.index % 2 == 0 ? 0 : 10 }]}>
                    <ImageBackground style={{ height: itemHeight, width: itemWidth, resizeMode: 'stretch' }}
                        source={require('../../images/icons/placeholder_bg_image.png')}>
                        {Platform.OS === 'ios' ?
                            <Image
                                style={{ height: itemHeight, width: itemWidth, position: "absolute", left: 0, top: 0, resizeMode: 'stretch' }}
                                source={{ uri: item.cover }}
                            />
                            :
                            <FastImage
                                style={{ height: itemHeight, width: itemWidth, position: "absolute", left: 0, top: 0 }}
                                source={{ uri: item.cover }}
                                resizeMode={FastImage.resizeMode.stretch}
                            />
                        }
                        <View style={{
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            height: 18,
                            width: 70,
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
                                {item && item.create_time && item.create_time.substring(0, 10)}
                            </Text>
                        </View>


                    </ImageBackground>
                    <View style={{ marginLeft: 5, marginTop: 10 }} >
                        <Text numberOfLines={1} style={{ fontSize: 14, color: '#555555', }}>
                            {item.period}期: {item.title}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    renderEmptyDataView = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Image style={{ marginTop: 66 }} source={require('../../images/livelession/view_point_empty_logo.png')}></Image>
                <Text style={{ fontSize: 15, color: '#00000066', marginTop: 10 }}>暂无课程</Text>
            </View>
        )
    }
    render() {
        if (!this.state.data) {
            return null;
        }
        return (
            <FlatList
                style={{ flex: 1 }}
                data={this.state.data}
                extraData={this.state}
                onRefresh={this._onRefreshTop.bind(this)}
                refreshing={this.state.refreshing}
                onEndReached={this._onRefresh.bind(this)}
                onEndReachedThreshold={0.1}
                ListFooterComponent={this._bottomComponent.bind(this)}
                ListEmptyComponent={this.renderEmptyDataView}
                renderItem={this._renderItem}
                numColumns={2}
            />
        )
    }
}

const styles = StyleSheet.create({
    tabStyles: {
        height: ScreenUtil.scaleSizeW(60),
        marginTop: 7,
    },
    courseItemStyle: {
        width: baseStyle.width / 2 - 12.5,
        flex: 1,
        marginTop: 15,
        backgroundColor: 'white',
    },
    footer: {
        flexDirection: 'row',
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
});
