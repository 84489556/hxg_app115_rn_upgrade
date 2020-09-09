/*
 * @Author: lishuai 
 * @Date: 2019-11-18 16:16:12 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-08-28 10:50:57
 * 慧选股App涉及到观点直播模块内容的地方全部使用同一个列表，通过传入不同的过滤条件和限制条数筛选显示的数据结果，
 * 过滤条件分为如下四类(V1.0.2): 
 * 权限对应关系: -1: 全部显示 4: 四星专享 5: 五星专享
 * 营销标签类型: 1: 营销性标签 2: 非营销性标签
 * 1、FILTER_CONDITION_1: qx == -1
 * 2、FILTER_CONDITION_2: label_type == 2 && qx == -1
 * 3、FILTER_CONDITION_3: label_type == 2 && (qx == -1 || qx == 4)
 * 4、FILTER_CONDITION_4: label_type == 2 && (qx == -1 || qx == 4 || qx == 5)
 */

import React, { Component } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import Calendar from "../../components/calendar";
import ContentSourceComponent from '../../components/RiskWarning';
import RiskWarning from '../../components/RiskTipsFooterView';
import { HotFocusTipsComponent } from '../../pages/TuyereDecision/HotFocusPage';
import Yd_cloud from '../../wilddog/Yd_cloud';
import ContentView from './PointContentView';
import * as baseStyle from '../../components/baseStyle.js';
const XDate = require('xdate');

// 数据过滤类型
export const VIEW_POINT_FILTER_CONDITION_1 = 'VIEW_POINT_FILTER_CONDITION_1';
export const VIEW_POINT_FILTER_CONDITION_2 = 'VIEW_POINT_FILTER_CONDITION_2';
export const VIEW_POINT_FILTER_CONDITION_3 = 'VIEW_POINT_FILTER_CONDITION_3';
export const VIEW_POINT_FILTER_CONDITION_4 = 'VIEW_POINT_FILTER_CONDITION_4';

// 空视图样式
export const VIEW_POINT_EMPTY_DATA_STYLE_1 = 'VIEW_POINT_EMPTY_DATA_STYLE_1';
export const VIEW_POINT_EMPTY_DATA_STYLE_2 = 'VIEW_POINT_EMPTY_DATA_STYLE_2';

export default class ViewPointListView extends Component {

    constructor(props, context) {
        super(props, context);
        this.calendarRef = Yd_cloud().ref(MainPathYG + 'ZhuanJiaFenXi/GuanDianZhiBoCal');
        this.state = {
            data: [],
            selected_day: undefined,
            new_day: undefined,
            min_date: undefined,
            max_date: undefined,
            disabled_date: {},
            heightForItem: 0,
            isRefreshing: false,
            showTips: false, // 是否显示顶部新消息提示条
            footerStatus: 0, // 显示footer
            teacherInfo: []
        }
        this.offsetY = 0;
        this.headerHeight = 0; // 列表头部view高度
        this.heightForItem = 0;
        this.allHeight = 0;
        this.itemHeight = [];
        this.index = -1;
        this._onLayoutForItem = this._onLayoutForItem.bind(this);
    }
    componentDidMount() {
        // this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {

        // });
        // this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {

        // });
        this.loadCalenderData();
        this.calendarRef.on('value', snap => {
            if (snap.code == 0) {
                if (snap.nodeContent) {
                    const day = Object.values(snap.nodeContent)[0];
                    this.loadCalenderData(day);
                } else {
                    this.loadCalenderData();
                }
            }
        });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedDay != this.state.selectedDay) {
            this.itemsRef && this.itemsRef.orderByKey().off('value', () => { });
            this.setState({ selected_day: nextProps.selectedDay }, () => {
                this.itemsRef = Yd_cloud().ref(MainPathYG + 'ZhuanJiaFenXi/GuanDianZhiBo2/' + nextProps.selectedDay);
                this._onRefresh();
            });
        }
        if (nextProps.filterCondition != this.props.filterCondition) {
            this._onRefresh();
        }
    }

    componentWillUnmount() {
        this.itemsRef && this.itemsRef.orderByKey().off('value', () => { });
        this.calendarRef && this.calendarRef.off('value', () => { });
        // this.willFocusSubscription && this.willFocusSubscription.remove();
        // this.willBlurSubscription && this.willBlurSubscription.remove();
    };
    // 获取观点直播交易日历数据
    loadCalenderData(day) {
        this.calendarRef.orderByKey().get((snap) => {
            if (snap.nodeContent) {
                let items = snap.nodeContent;
                let values = [];
                if (items == null) {
                    this.setState({ nodate: true });
                    return;
                }
                Object.values(items).forEach((child) => {
                    values = values.concat(Object.values(child));
                });
                let selectedDay = day || values.length && values[Object.keys(values).length - 1];
                if ((this.state.selected_day === undefined || this.state.selected_day != selectedDay) && Object.keys(values).length) {
                    this.setState({ selected_day: selectedDay, new_day: selectedDay });
                    this.itemsRef = Yd_cloud().ref(MainPathYG + 'ZhuanJiaFenXi/GuanDianZhiBo2/' + selectedDay);
                    this._onRefresh();
                }
                this.handleTradeDays(Object.values(this.state.disabled_date), Object.values(values));
            } else {
                this.setState({ data: [] });
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
        let min_date = this.formatDate(filterdDays[0]);
        let max_date = this.formatDate(filterdDays[filterdDays.length - 1]);
        let from = new XDate(min_date), to = new XDate(max_date);
        for (; from <= to; from = new XDate(from, true).addDays(1)) {
            if (filterdDays.indexOf(from.toString('yyyyMMdd')) == -1) {
                disabled_date[from.toString('yyyy-MM-dd')] = { disabled: true }
            }
        }
        this.setState({ min_date: min_date, max_date: max_date, disabled_date: disabled_date }, () => {
            this.props.calendarDataCallback && this.props.calendarDataCallback(this.state.selected_day, min_date, max_date, disabled_date);
        });
    }
    formatDate(day) {
        return day === undefined ? '1970-00-00' : day.slice(0, 4) + '-' + day.slice(4, 6) + '-' + day.slice(6, 8);
    }
    filterData(data) {
        let rowdatas = data;
        const condition = this.props.filterCondition;
        let ret = [];
        for (const value of rowdatas) {
            if (condition == VIEW_POINT_FILTER_CONDITION_1) {
                if (value.qx == -1) {
                    ret.push(value);
                    if (this.props.limit > 0 && ret.length == this.props.limit) {
                        break;
                    }
                }
            } else if (condition == VIEW_POINT_FILTER_CONDITION_2) {
                if (value.label_type != 1 && value.qx == -1) {
                    ret.push(value);
                    if (this.props.limit > 0 && ret.length == this.props.limit) {
                        break;
                    }
                }
            } else if (condition == VIEW_POINT_FILTER_CONDITION_3) {
                if (value.label_type != 1 && (value.qx == -1 || value.qx == 4)) {
                    ret.push(value);
                    if (this.props.limit > 0 && ret.length == this.props.limit) {
                        break;
                    }
                }
            } else if (condition == VIEW_POINT_FILTER_CONDITION_4) {
                if (value.label_type != 1 && (value.qx == -1 || value.qx == 4 || value.qx == 5)) {
                    ret.push(value);
                    if (this.props.limit > 0 && ret.length == this.props.limit) {
                        break;
                    }
                }
            } else {
                ret.push(value);
            }
        }
        return ret;
    }
    //下拉刷新回调
    _refresh = () => {
        this.setState({ isRefreshing: true });
        setTimeout(() => {
            this.setState({ isRefreshing: false, }, () => {
                this._onRefresh
            });
        }, 3000);
    }
    _onRefresh() {
        this.fetchingNew = true;
        this.heightForItem = 0;
        this.allHeight = 0;
        this.itemHeight = [];
        this.itemsRef && this.itemsRef.orderByKey().get((snap) => {
            if (snap.code == 0) {
                this._processData(snap.nodeContent)
            } else {
                this.setState({ data: [] });
            }
        });
        this.itemsRef && this.itemsRef.orderByKey().on('value', (snap) => {
            if (snap.code == 0) {
                if (snap.nodeContent) {
                    const value = snap.nodeContent;
                    const key = value.viewpoint_id;
                    const curLatestDataKey = this.state.data.length ? this.state.data[0].viewpoint_id : 0;
                    if (key > curLatestDataKey && this.offsetY > this.headerHeight) {
                        if (this.props.filterCondition == VIEW_POINT_FILTER_CONDITION_1) {
                            if (value.qx == -1) {
                                this.setState({ showTips: true });
                            }
                        } else if (this.props.filterCondition == VIEW_POINT_FILTER_CONDITION_2) {
                            if (value.label_type != 1 && value.qx == -1) {
                                this.setState({ showTips: true });
                            }
                        } else if (this.props.filterCondition == VIEW_POINT_FILTER_CONDITION_3) {
                            if (value.label_type != 1 && (value.qx == -1 || value.qx == 4)) {
                                this.setState({ showTips: true });
                            }
                        } else if (this.props.filterCondition == VIEW_POINT_FILTER_CONDITION_4) {
                            if (value.label_type != 1 && (value.qx == -1 || value.qx == 4 || value.qx == 5)) {
                                this.setState({ showTips: true });
                            }
                        }
                    }
                }
                this.itemsRef.orderByKey().get((snap) => {
                    if (snap.code == 0) {
                        this._processData(snap.nodeContent)
                    }
                });
            }
        });
    }

    // 数据处理
    _processData(data) {
        const keys = Object.keys(data).reverse()
        let values = [];
        Object.values(data).reverse().forEach((child, index, array) => {
            child['key'] = keys[index];
            values.push(child);
        });
        let filteredData = this.filterData(values);
        let teacherIds = filteredData.map(e => {
            return e.teacher;
        })
        let deduplicatedTeacherIds = Array.from(new Set(teacherIds));
        let teacherInfos = [];
        for (let i = 0; i < deduplicatedTeacherIds.length; i++) {
            const teacherId = deduplicatedTeacherIds[i];
            for (let index = 0; index < filteredData.length; index++) {
                const element = filteredData[index];
                if (element.teacher == teacherId && element.teacDescription) {
                    teacherInfos.push(element.teacDescription);
                    break;
                }
            }
        }
        this.setState({ data: filteredData, teacherInfo: teacherInfos, footerStatus: 1 });
    }

    _onLayoutForItem(event) {
        //获取根View的宽高，以及左上角的坐标值
        let { x, y, width, height } = event.nativeEvent.layout;
        this.heightForItem = Math.ceil(height);
        this.itemHeight.push(this.allHeight);
        this.allHeight += Math.ceil(height);
        this.index += 1;
    }
    onSelectDay = (day) => {
        if (day) {
            let newDay = XDate(day.timestamp, true).toString('yyyyMMdd');
            this.setState({ previous_day: this.state.selected_day, selected_day: newDay }, () => {
                this.itemsRef = Yd_cloud().ref(MainPathYG + 'ZhuanJiaFenXi/GuanDianZhiBo2/' + newDay);
                this._onRefresh();
            });
        }
        this.calendar.close();
    }
    // 查看新观点点击事件
    _tipsOnClick = () => {
        this.setState({ showTips: false }, () => {
            this.list && this.list.scrollToOffset({ offset: this.headerHeight, animated: true })
        });
    }
    renderListView() {
        let data = this.state.data;
        return (
            <FlatList
                ref={list => this.list = list}
                style={{ flex: 1 }}
                data={data}
                renderItem={this._renderItem}
                ListHeaderComponent={this.renderHeader()}
                ListFooterComponent={this._bottomComponent}
                ListEmptyComponent={this.renderEmptyDataView()}
                ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
                contentContainerStyle={{ flexGrow: 1 }}
                onScroll={(event) => {
                    this.offsetY = event.nativeEvent.contentOffset.y;
                    if (this.offsetY < this.headerHeight + 100) { // 100是个大概值，因为观点内容不同，第一行的高度也不同
                        this.setState({ showTips: false });
                    }
                }}
            />
        )
    }
    _bottomComponent = () => {
        if (this.props.showFooter && this.state.footerStatus === 1 && this.state.data.length) {
            let data = this.state.teacherInfo;
            if (!data.length) {
                return <RiskWarning />
            }
            return (
                <View>
                    {this.state.teacherInfo.length && <ContentSourceComponent data={this.state.teacherInfo} />}
                    <RiskWarning />
                </View>
            );
        } else {
            return null;
        }
    }
    renderHeader() {
        if (this.props.header) {
            return (
                <View onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    this.headerHeight = height;
                }}>
                    {this.props.header}
                    <View style={{ flexDirection: 'row', height: 40, paddingLeft: 15, paddingRight: 15, justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#fff' }} activeOpacity={1} onPress={() => this.liveRoomOnClick()}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={{ height: 18, width: 18 }} source={require('../../images/MainDecesion/main_decision_opinion_living_small_icon.png')} />
                            <Text style={{ fontSize: 20, color: '#000', marginLeft: 5, fontWeight: '900' }}>观点直播</Text>
                        </View>
                        {this.state.selected_day ?
                            <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', marginBottom: -7 }} activeOpacity={0.5} onPress={() => this.state.disabled_date && this.calendar.show()}>
                                <Image style={{ height: 11, width: 11 }} source={require('../../images/JiePan/gdzb_rili.png')} />
                                <Text style={{ color: '#999999', fontSize: 12, marginLeft: 5 }}>{this.formatDate(this.state.selected_day)}</Text>
                                <Image style={{ marginLeft: 5, height: 10, width: 10 }} source={require('../../images/JiePan/gdzb_xiala.png')} />
                            </TouchableOpacity>
                            : null}
                    </View>
                </View>
            )
        } else {
            return null;
        }
    }
    renderCalendar() {
        return (
            <Calendar ref={(calendar) => this.calendar = calendar}
                onSelectDay={this.onSelectDay}
                selectedDay={this.formatDate(this.state.selected_day)}
                minDate={this.state.min_date}
                maxDate={this.state.max_date}
                markedDates={this.state.disabled_date}
            />
        );
    }
    renderEmptyDataView() {
        if (this.props.emptyDataStyle == VIEW_POINT_EMPTY_DATA_STYLE_2) {
            let statusBarHeight = 0, bottomSpace = 0;
            if (Platform.OS == 'ios') {
                statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
                bottomSpace = baseStyle.isIPhoneX ? 34 : 0;
            } else {
                statusBarHeight = StatusBar.currentHeight;
            }
            return (
                <View style={{ height: baseStyle.height - statusBarHeight - bottomSpace - 45, justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Image style={{ marginTop: 66 }} source={require('../../images/livelession/view_point_empty_logo.png')}></Image>
                        <Text style={{ fontSize: 15, color: '#00000066', marginTop: 10 }}>今日暂未更新</Text>
                    </View>
                    {this.props.showFooter && <RiskWarning />}
                </View>
            )
        } else {
            return (
                <View>
                    <View style={{ height: 125, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                        <View style={{ backgroundColor: '#3399FF1A', width: 115, height: 34, borderRadius: 34 / 2, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10, color: '#003366' }}>今日暂未更新</Text>
                        </View>
                    </View>
                    {this.props.showFooter && <RiskWarning />}
                </View>

            )
        }
    }
    _renderItem = (item) => {
        const isLast = item.index == this.state.data.length - 1;
        return (
            <ContentView style={{ flex: 1 }}
                rowData={item.item}
                isPermissionLast={isLast}
                navigation={this.props.navigation}
                onLayout={this._onLayoutForItem}
                releaseView={this.releaseView}
                showBtn={this.props.showBtn}
            />
        )
    }
    render() {
        if (!this.state.data) {
            return null;
        }
        return (
            <View style={{ flex: 1 }}>
                {this.renderListView()}
                {this.renderCalendar()}
                {this.state.showTips && <HotFocusTipsComponent style={{ position: 'absolute', top: 0 }} tipsOnClickCallback={this._tipsOnClick} />}
            </View>
        )
    }
}