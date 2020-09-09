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
    constructor(props) {
        super(props)
        this.state = {
            border: { borderRightColor: '#fff', borderRightWidth: 1 },
            index: 1
        }

    }
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
        let color = this.props.activeTab == i ? '#000000' : '#00000066'
        let backcolor = this.props.activeTab == i ? "#D8D8D8" : null;// 判断i是否是当前选中的tab，设置不同的颜色
        let border = { borderLeftColor: '#0000000a', borderLeftWidth: 1, borderRightColor: '#0000000a', borderRightWidth: 1 };
        let radius;
        if (i == 0 || i == this.props.tabNames.length - 1)
            radius = (this.props.activeTab == i && i == 0) ? { borderBottomLeftRadius: 10, borderTopLeftRadius: 10 } : (this.props.activeTab == i && i == this.props.tabNames.length - 1 ? { borderTopRightRadius: 10, borderBottomRightRadius: 10 } : null);
        else
            radius = border;
        return (
            <TouchableOpacity key = {i} onPress={() => {
                // if(i == 0){
                //     this.setState({index:0,border:{borderBottomLeftRadius:3,borderTopLeftRadius:3}})
                // }else if(i == 1){
                //     this.setState({index:1,border:{borderRightColor: '#fff', borderRightWidth: 1}})
                // }else if(i == 2){
                //     this.setState({index:2,border:{borderTopRightRadius:3,borderBottomRightRadius:3}},()=>{
                //     })
                // }
                this.props.goToPage(i)
            }} style={[styles.tabItem, { flex: 1, backgroundColor: backcolor }, radius]}>
                <View style={{ flex: 1 }}>
                    <View style={[{
                        flex: 1,
                        height: 20,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'

                    }]}>
                        <Text style={{ color: color, fontSize: 12 }} numberOfLines={1}>
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
                        borderRadius: 10, borderColor: '#0000000a', borderWidth: 1.0,
                        width: 212, height: 20,
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
        backgroundColor: '#f1f1f1',
        height: 35,
        alignItems: 'center', justifyContent: 'center',
        borderBottomColor: 'rgba(0,0,0,0.1)',
        borderBottomWidth: 0
    },
    tabs: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',

    },

    tabItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 20,

        // borderLeftWidth:0.5,
        // borderLeftColor:'white',
        // borderRightColor:'white',
        // borderRightWidth:0.5,
    },
});


export default HomeTabBar;