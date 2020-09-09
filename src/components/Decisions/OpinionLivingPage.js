/*
 * @Author: lishuai 
 * @Date: 2019-09-30 09:55:39 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-07-20 14:58:31
 * 观点直播详情页
 */
import React from 'react';
import { Image, Text, TouchableHighlight, View } from 'react-native';
import Calendar from "../../components/calendar";
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import ContentListView, { VIEW_POINT_EMPTY_DATA_STYLE_2 } from '../../pages/Listen/ContentListView';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import * as baseStyle from '../../components/baseStyle';

const XDate = require('xdate');

export default class OpinionLivingPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.state = {
            selected_day: '',// 当前选中的日期
            disabled_date: {}, // 非交易日
            min_date: '',
            max_date: '',
        };
    }

    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.guandianzhiboliebiao);
        });
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    onSelectDay = (day) => {
        this.calendar.close();
        if (day) {
            let newDay = XDate(day.timestamp, true).toString('yyyyMMdd');
            this.setState({ selected_day: newDay });
        }
    }
    render() {
        let day = this.state.selected_day.slice(0, 4) + '-' + this.state.selected_day.slice(4, 6) + '-' + this.state.selected_day.slice(6, 8);
        const showCalendar = this.state.selected_day.length;
        const filterCondition = this.props.navigation.state.params.filterCondition;
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'观点直播'} rightTopView={
                    showCalendar ?
                        <TouchableHighlight style={{ alignItems: 'center', marginRight: 15 }} underlayColor={'#fff0'} onPress={() => this.calendar.show()}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image style={{ width: 11, height: 11, marginRight: 5 }} source={require('../../images/Home/home_market_status_calendar_icon.png')}></Image>
                                <Text style={{ fontSize: 12, color: '#00000066', marginRight: 5 }}>{day}</Text>
                                <Image style={{ width: 10, height: 10 }} source={require('../../images/Home/home_market_status_arrow_icon.png')}></Image>
                            </View>
                        </TouchableHighlight>
                        : null
                } />
                <ContentListView ref={(c) => this.list = c}
                    style={{ flex: 1 }}
                    filterCondition={filterCondition}
                    selectedDay={this.state.selected_day}
                    calendarDataCallback={(selected_day, min_date, max_date, disabled_date) => {
                        this.setState({ selected_day: selected_day, min_date: min_date, max_date: max_date, disabled_date: disabled_date });
                    }}
                    navigation={this.props.navigation}
                    emptyDataStyle={VIEW_POINT_EMPTY_DATA_STYLE_2}
                    showFooter={true}
                />
                <Calendar
                    ref={(calendar) => this.calendar = calendar}
                    onSelectDay={this.onSelectDay}
                    selectedDay={day}
                    minDate={this.state.min_date}
                    maxDate={this.state.max_date}
                    markedDates={this.state.disabled_date}
                />
            </BaseComponentPage>
        )
    }
}