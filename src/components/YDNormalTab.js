/*
 * @Author: lishuai 
 * @Date: 2019-07-04 17:55:16 
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-07-17 16:56:00
 */
'use strict';

import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
	Text,
	Animated,
	ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';

export default class YDNormalTab extends Component {

	propTypes = {
		goToPage: PropTypes.func, // 跳转到对应tab的方法
		activeTab: PropTypes.number, // 当前被选中的tab下标
		tabs: PropTypes.array, // 所有tabs集合
		tabNames: PropTypes.array, // 保存Tab名称
		tabIconNames: PropTypes.array, // 保存Tab图标
	};

	constructor(props) {
		super(props);
		this.borderStyle = this.props.borderStyle || 'Normal';
	}
	setAnimationValue({ value }) {

	}
	componentDidMount() {
		// Animated.Value监听范围 [0, tab数量-1]
		this.props.scrollValue.addListener(this.setAnimationValue);
	}

	renderTabOption(tab, i) {
		let textColor = this.props.activeTab == i ? '#F92400' : '#00000066';
		let bgColor = null;// this.props.activeTab == i ? "gray" : '#f1f1f1';// 判断i是否是当前选中的tab，设置不同的颜色
		let fontSize = this.props.activeTab == i ? 14 : 12;
		return (
			<TouchableOpacity onPress={() => this.props.goToPage(i)} style={[normalStyles.tabItem, { backgroundColor: bgColor }]} >
				<Text style={{ color: textColor, fontSize: fontSize, textAlign: 'center', marginLeft: 14, marginRight: 14 }} numberOfLines={1}>
					{this.props.tabNames[i]}
				</Text>
			</TouchableOpacity >
		);
	}

	renderRoundedRectTabOption(tab, i) {
		let textColor = this.props.activeTab == i ? '#1D69F1' : '#999999';
		let border = this.props.activeTab == i ? { borderColor: '#1D69F1', borderWidth: 1, borderRadius: 12.5 } : { borderColor: '#D3D3D3', borderWidth: 1, borderRadius: 12.5 };
		return (
			<TouchableOpacity onPress={() => this.props.goToPage(i)} style={[roundedRectStyles.tabItem, border]} >
				<Text style={{ color: textColor, fontSize: 12, textAlign: 'center', marginLeft: 15, marginRight: 15 }} numberOfLines={1}>
					{this.props.tabNames[i]}
				</Text>
			</TouchableOpacity >
		);
	}

	render() {
		if (this.borderStyle === 'RoundedRect') {
			return (
				<Animated.View style={[roundedRectStyles.view]}>
					<ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
						<View style={roundedRectStyles.tabs}>
							{this.props.tabs.map((tab, i) => this.renderRoundedRectTabOption(tab, i))}
						</View>
					</ScrollView>
				</Animated.View >
			);
		} else {
			return (
				<Animated.View style={[normalStyles.view]}>
					<ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
						<View style={normalStyles.tabs}>
							{this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
						</View>
					</ScrollView>
				</Animated.View >
			);
		}

	}
}

const normalStyles = StyleSheet.create({
	view: {
		backgroundColor: 'green',
		height: 30,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabs: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'stretch',
	},

	tabItem: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

const roundedRectStyles = StyleSheet.create({
	view: {
		backgroundColor: '#fff',
		height: 45,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabs: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},

	tabItem: {
		height: 25,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 5,
		marginRight: 5,
	},
});