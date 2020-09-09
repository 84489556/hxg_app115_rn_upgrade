'use strict';

import React from "react";
import {DeviceEventEmitter, Image, StyleSheet, Text, TouchableHighlight, View} from "react-native";

import * as baseStyle from "./baseStyle.js";
import BaseComponent from "./BaseComponent.js";
import {StaticTabBarItem} from "./TabBar.js";
import {sensorsDataClickActionName, sensorsDataClickObject} from "./SensorsDataTool";

export default class TabBarOriginal extends BaseComponent {

    styleSheet = StyleSheet.create({
        container: {
            flex: 1
        },
        tabBar: {
            height: 30,
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
            borderBottomWidth: 4,
            borderBottomColor: 'transparent'
        },
        tabBarItemSelected: {
            borderBottomColor: baseStyle.DARK_GRAY
        },
        tabBarItemLabel: {
            fontSize: 12,
            color: baseStyle.DEFAULT_TEXT_COLOR
        },
        tabBarItemLabelSelected: {}
    });

    static defaultProps = {
        lastIndex: 0,
        where: '',
        isBottom: false,
        smallBottom: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedIndex: props.lastIndex
        }

    }

    selectTab(index, childElement) {
        this._onPressTabBarItem(index, childElement);

    }

    _onPressTabBarItem(index, childElement) {

      this.sensorsAppear(childElement.props.title)

      // 切换到对应的标签页，并且触发事件
        if (this.state.selectedIndex !== index && (this.props.children && index < this.props.children.length)) {
            this.setState({selectedIndex: index});
            this.props.onChangeTab && this.props.onChangeTab(index, childElement);
        }
        // if (index == 0) {
        //     DeviceEventEmitter.emit('pageName', '行情新闻');
        // } else if (index == 1) {
        //     DeviceEventEmitter.emit('pageName', '行情公告');
        // } else if (index == 2) {
        //     DeviceEventEmitter.emit('pageName', '行情F10');
        // }
    }



    sensorsAppear(zone) {
        sensorsDataClickObject.adKClick.stock_code = this.state.obj;
        sensorsDataClickObject.adKClick.function_zone = '新闻公告区';
        sensorsDataClickObject.adKClick.content_name = zone;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)
    }



    _renderTabBarItem(childElement, index) {

        let hasImage = childElement.props.imageSelected && childElement.props.imageUnSelected;

        return (
            <TouchableHighlight
                style={{flex: 1}}
                key={index}
                onPress={this._onPressTabBarItem.bind(this, index, childElement)}
                underlayColor="transparent">
                {!this.props.smallBottom
                    ?
                    <View style={[
                        this.getStyles('tabBarItem'), (this.state.selectedIndex === index)
                        && this.getStyles('tabBarItemSelected'),
                    ]}>
                        { hasImage
                            ? (this.state.selectedIndex === index
                                ? (<Image style={{}} source={childElement.props.imageSelected}/>)
                                : (<Image style={{}} source={childElement.props.imageUnSelected}/>))
                            : (<Text style={[this.getStyles('tabBarItemLabel'),
                                (this.state.selectedIndex === index) && this.getStyles('tabBarItemLabelSelected')]}>
                                {childElement.props.title}
                            </Text>)
                        }
                    </View>
                    :
                    <View style={[
                        this.getStyles('tabBarItem'),
                        {
                            flexDirection: 'column',
                            alignItems: 'center',
                        }
                    ]}>
                        { hasImage
                            ? (this.state.selectedIndex === index
                                ? (<Image style={{}} source={childElement.props.imageSelected}/>)
                                : (<Image style={{}} source={childElement.props.imageUnSelected}/>))
                            : (<Text style={[this.getStyles('tabBarItemLabel'),
                                (this.state.selectedIndex === index) && this.getStyles('tabBarItemLabelSelected')]}>
                                {childElement.props.title}
                            </Text>)
                        }
                        {(this.state.selectedIndex === index && this.props.smallBottom)
                        && <View style={this.getStyles('smallBottom')}/>}
                    </View>
                }

            </TouchableHighlight>
        );
    }

    _renderTabBar() {

        // 根据多个children创建出bar
        return (
            <View style={this.getStyles('tabBar')}>
                {(this.props.children || []).map((childElement, index) => this._renderTabBarItem(childElement, index))}
            </View>
        );
    }

    render() {
        let children = this.props.children.map((child, index) => {
            if (child.type === StaticTabBarItem || index === this.state.selectedIndex) {
                return React.cloneElement(child, {key: index, selected: this.state.selectedIndex === index});
            }
        });

        if (this.props.isBottom) {
            return (
                <View style={this.getStyles('container')}>

                    <View style={{flex: 1}}>
                        {children}
                    </View>
                    {!this.props.tabBarHidden && this._renderTabBar()}
                </View>
            );
        }
        else {
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
}
