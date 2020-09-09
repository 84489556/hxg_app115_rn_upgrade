'use strict';

import React, {Component} from "react";
import PropTypes from 'prop-types';
import TabBar, {TabBarItem} from "../components/TabBar.js";
import * as baseStyle from "./baseStyle.js";

import {DZHYunBuySellComponent} from "./BuySellComponent.js";
import {TickComponent} from "./TickComponent.js";
import ShareSetting from "../modules/ShareSetting";

let _lastIndex = 0;

export default class PanKou extends Component {
    static defaultProps = {
        activeColor: baseStyle.TABBAR_BORDER_COLOR
    };
    static propTypes = {
        activeColor: PropTypes.string
    };

    constructor(props) {
        super(props)
    }

    _onChangeTab(index, childElement) {
        if (index !== undefined) {
            _lastIndex = index;
            ShareSetting.setWuDangIndex(_lastIndex)
        }
    }

    render() {
        return (
            <TabBar
                style={{
                    flex: 1,
                    height:25,
                    tabBar: {backgroundColor: baseStyle.WHITE},
                    tabBarItem: {},
                    tabBarItemLabel: {color: baseStyle.WU_DANG_BLACK, fontSize: 10},
                    tabBarItemSelected: {backgroundColor: baseStyle.TABBAR_BORDER_COLOR},
                    tabBarItemLabelSelected: {color: baseStyle.TABBAR_BORDER_COLOR}
                }}
                where={'BuySellAndTick'}
                lastIndex={_lastIndex}
                onChangeTab={this._onChangeTab}>
                <TabBarItem title="五档">
                    <DZHYunBuySellComponent params={this.props.obj && {obj: this.props.obj}} navigation={this.props.navigation}/>
                </TabBarItem>
                <TabBarItem title="明细">
                    <TickComponent params={this.props.obj && {obj: this.props.obj}} navigation={this.props.navigation}/>
                </TabBarItem>
            </TabBar>
        );
    }
}
