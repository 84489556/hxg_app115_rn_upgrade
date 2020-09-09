'use strict'

import React from "react";
import {StyleSheet, Text, TouchableHighlight, View, Platform} from "react-native";

import * as baseStyle from "./baseStyle.js";
import BaseComponent from "./BaseComponent.js";
import ShareSetting from "../modules/ShareSetting.js";


let _lastIndexQuote = 0;
let _lastIndexNews = 0;
let _lastIndexStockPool = 0;
let _lastIndexPost = 0;

export default class TabBar extends BaseComponent {

    styleSheet = StyleSheet.create({
        container: {
            flex: 1,
        },
        tabBar: {
            height: 29,
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
        },
        tabBarItem: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomWidth: 0,
            borderBottomColor: 'transparent'
        },
        tabBarItemSelected: {
            borderBottomColor: baseStyle.DARK_GRAY
        },
        tabBarItemLabel: {
            fontSize: 14,
            color: baseStyle.DEFAULT_TEXT_COLOR
        },
        tabBarItemLabelSelected: {}
    });

    static defaultProps = {
        lastIndex: 0,
        where: ''
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: props.lastIndex
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.lastIndex !== nextProps.lastIndex)
            && (this.props.where === 'BuySellAndTick' || this.props.where === 'BuySellAndTickLandscape')) {
            this.setState({selectedIndex: ShareSetting.getWuDangIndex()});
        }
    }

    selectTab(index, childElement) {
        this._onPressTabBarItem(index, childElement);
    }

    _onPressTabBarItem(index, childElement) {
        if (this.getLastIndex(childElement) !== index && (this.props.children && index < this.props.children.length)) {
            this.setState({selectedIndex: index});
            this.props.onChangeTab && this.props.onChangeTab(index, childElement);
            this.setLastIndex(index);
        }
    }

    setLastIndex(index) {
        if (this.props.where === 'Quote') {
            _lastIndexQuote = index;
        } else if (this.props.where === 'News') {
            _lastIndexNews = index;
        } else if (this.props.where === 'StockPool') {
            _lastIndexStockPool = index;
        } else if (this.props.where === 'Post') {
            _lastIndexPost = index;
        }
    }

    getLastIndex(childElement) {
        if (childElement.props.title === '自选' || childElement.props.title === '沪深' || childElement.props.title === '资讯') {
            return _lastIndexQuote;
        } else if (childElement.props.title === '热点' || childElement.props.title === '自选股' || childElement.props.title === '新股' || childElement.props.title === '晨报') {
            return _lastIndexNews;
        } else if (childElement.props.title === '盘中' || childElement.props.title === '盘后' || childElement.props.title === '当日' || childElement.props.title === '历史') {
            return _lastIndexStockPool;
        } else if (childElement.props.title === '热门' || childElement.props.title === '广场') {
            return _lastIndexPost;
        } else if ((this.props.where === 'BuySellAndTick' || this.props.where === 'BuySellAndTickLandscape')
            && (childElement.props.title === '五档' || childElement.props.title === '明细')) {
            return ShareSetting.getWuDangIndex()
        } else {
            return 0;
        }
    }


    _renderTabBarItem(childElement, index, cutLine) {
        let lastSelect = this.getLastIndex(childElement);
        return (
            <TouchableHighlight
                style={{flex: 1}}
                key={index}
                onPress={this._onPressTabBarItem.bind(this, index, childElement)}
                underlayColor="transparent">
                <View style={{flex:1, alignItems:'center',justifyContent:'center'}}>

                    {/*(this.state.selectedIndex === index) && this.getStyles('tabBarItemSelected'),原下划线*/}
                    <View style={[
                        this.getStyles('tabBarItem'),
                        (Platform.OS === 'ios') &&
                        {
                            borderRadius: 1,
                            borderLeftWidth: cutLine ? 0.5 : 0,
                            borderLeftColor: '#fff',
                            borderRightWidth: cutLine ? 0.5 : 0,
                            borderRightColor: '#fff',
                        }
                    ]}>
                        <Text style={[
                            this.getStyles('tabBarItemLabel'),
                            (this.state.selectedIndex === index) && this.getStyles('tabBarItemLabelSelected'),
                            // {fontSize: 14}
                        ]}>{childElement.props.title}</Text>
                    </View>

                    {/*新改版下划线*/}
                    <View style={[{
                        width:10,
                        height:4,
                        borderRadius:2,
                    },(this.state.selectedIndex === index) && this.getStyles('tabBarItemSelected')]}/>
                </View>
            </TouchableHighlight>
        );
    }

    _renderTabBar() {
        // 根据多个children创建出bar
        return (
            <View>
                <View style={this.getStyles('tabBar')}>
                    {(this.props.children || []).map((childElement, index) => this._renderTabBarItem(childElement, index, this.props.cutLine))}
                </View>
            </View>
        );
    }

    render() {
        // children 为tab下的内容页 相当于ViewPager
        let children = this.props.children.map((child, index) => {
            if (child.type === StaticTabBarItem || index === this.state.selectedIndex) {
                return React.cloneElement(child, {key: index, selected: this.state.selectedIndex === index});
            }
        });
        return (
            <View style={this.getStyles('container')}>
                {!this.props.tabBarHidden && this._renderTabBar()}
                <View style={{flex: 1}}>
                    {children}
                </View>
            </View>
        );
    }
}

export class TabBarItem extends BaseComponent {
    render() {
        return this.props.children || <View/>;
    }
}

export class StaticTabBarItem extends BaseComponent {
    render() {
        if (this.props.selected) {
            this.rendered = true;
            return (
                <View style={{flex: 1}}>{this.props.children}</View>
            )
        } else if (this.rendered) {
            return (
                <View style={{
                    overflow: 'hidden',
                    position: 'absolute',
                    opacity: 0,
                    height: 0,
                    width: 0
                }}>{this.props.children}</View>
            )
        } else {
            return <View/>
        }
    }
}
