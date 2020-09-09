'use strict';

import React, { Component } from 'react';

import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Animated,
} from 'react-native';
import PropTypes from 'prop-types';

class HomeTabBar extends Component {

    propTypes = {
        goToPage: PropTypes.func, // 跳转到对应tab的方法
        activeTab: PropTypes.number, // 当前被选中的tab下标
        tabs: PropTypes.array, // 所有tabs集合
        tabNames: PropTypes.array, // 保存Tab名称
        tabIconNames: PropTypes.array, // 保存Tab图标
    };

    setAnimationValue({ value }) {

    }
    componentDidMount() {
        // Animated.Value监听范围 [0, tab数量-1]
        this.props.scrollValue.addListener(this.setAnimationValue);
    }

    renderTabOption(tab, i) {
        let color = this.props.activeTab == i ? '#f92400' : '#fff';
        let backcolor = this.props.activeTab == i ? "#fff" : null;// 判断i是否是当前选中的tab，设置不同的颜色
        let showLine = this.props.tabNames.length > i + 1;
        let border = showLine ? { borderRightColor: '#fff', borderRightWidth: 1 } : null;
        return (
            <TouchableOpacity onPress={() => this.props.goToPage(i)} style={[styles.tabItem, { backgroundColor: backcolor }, border]}>
                <View >
                    <View style={[{
                        flex: 1,
                        height: 28,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }]}>
                        <Text style={{ color: color, fontSize: 14 }} numberOfLines={1}>
                            {this.props.tabNames[i]}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <Animated.View style={this.props.styles}>
                <View style={[styles.view]}>
                    <View style={[{
                        borderRadius: 3, borderColor: '#fff', borderWidth: 1.0,
                        width: 212, height: 29,
                    }, this.props.tabBarRootStyle]}>
                        <View style={styles.tabs}>
                            {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    view: {
        backgroundColor: '#f92400',//baseStyle.TABBAR_BORDER_COLOR,
        height: 44,
        alignItems: 'center', justifyContent: 'center',
        borderBottomColor: 'rgba(0,0,0,0.1)',
        borderBottomWidth: 1
    },
    tabs: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',

    },

    tabItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        // borderLeftWidth:0.5,
        // borderLeftColor:'white',
        // borderRightColor:'white',
        // borderRightWidth:0.5,
    },
});


export default HomeTabBar;