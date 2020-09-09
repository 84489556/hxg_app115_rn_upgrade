/*
 * @Author: lishuai 
 * @Date: 2019-07-04 17:55:16 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-07-20 16:40:15
 */
'use strict';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

export default class YDSegmentedTab extends Component {

	static propTypes = {
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
	// setAnimationValue({ value }) {
	//
	// }
	componentDidMount() {
		// Animated.Value监听范围 [0, tab数量-1]
		//this.props.scrollValue.addListener(this.setAnimationValue);
	}

	renderTabOption(tab, i) {
		let textColor = this.props.activeTab == i ? '#F92400' : '#00000066';
		let bgColor = this.props.activeTab == i ? "#fff" : '#f1f1f1';// 判断i是否是当前选中的tab，设置不同的颜色
		const prevTabIndex = this.props.activeTab - 1 < 0 ? 0 : this.props.activeTab - 1;
		const hiddenLine = (i == this.props.activeTab) || (prevTabIndex == i || i == this.props.tabNames.length - 1);
		let maxWord = 0;
		this.props.tabNames.forEach(element => {
			if (element.length > maxWord) {
				maxWord = element.length;
				if (maxWord > 5) {
					maxWord = 5;
				}
			}
		});
		const itemWidth = maxWord == 5 ? 95 : 75;
		return (
			<View key={i} style={{ flexDirection: 'row' }}>
				<TouchableOpacity activeOpacity={1} onPress={() => this.props.onChangeTabs !== undefined ? this.props.onChangeTabs(i) : this.props.goToPage(i)} style={[normalStyles.tabItem, { backgroundColor: bgColor, width: itemWidth }]} >
					<Text style={{ color: textColor, fontSize: 14, textAlign: 'center' }} numberOfLines={1}>
						{this.props.tabNames[i]}
					</Text>
				</TouchableOpacity>
				{hiddenLine ? null : <View style={{ width: Platform.OS === 'ios' ? 1 : 0.5, backgroundColor: '#0000001a' }}></View>}
			</View>
		);
	}

	renderRoundedRectTabOption(tab, i) {
		let textColor = this.props.activeTab == i ? '#000000cc' : '#00000066';
		let bgColor = this.props.activeTab == i ? "#0000000a" : null;// 判断i是否是当前选中的tab，设置不同的颜色
		return (
			<TouchableOpacity onPress={() => this.props.onChangeTabs !== undefined ? this.props.onChangeTabs(i) : this.props.goToPage(i)} style={[roundedRectStyles.tabItem, { backgroundColor: bgColor }]} >
				<Text style={{ color: textColor, fontSize: 12, textAlign: 'center', marginLeft: 30, marginRight: 30 }} numberOfLines={1}>
					{this.props.tabNames[i]}
				</Text>
			</TouchableOpacity >
		);
	}

	render() {
		if (this.borderStyle === 'RoundedRect') {
			return (
				<View style={[roundedRectStyles.view]}>
					<View style={roundedRectStyles.tabs}>
						{this.props.tabs.map((tab, i) => this.renderRoundedRectTabOption(tab, i))}
					</View>
				</View>
			);
		} else {
			return (
				<View style={[normalStyles.view, this.props.style]}>
					<View style={normalStyles.tabs}>
						{this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
					</View>
				</View>
			);
		}
	}
}

const normalStyles = StyleSheet.create({
	view: {
		backgroundColor: '#fff',
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabs: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 3,
		paddingLeft: 1,
		paddingRight: 1,
		backgroundColor: '#f1f1f1'
	},

	tabItem: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 28,
		marginTop: 1,
		marginBottom: 1,
	},
});

const roundedRectStyles = StyleSheet.create({
	view: {
		backgroundColor: '#f1f1f1',
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabs: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: '#0000000a',
		borderWidth: 1,
		borderRadius: 10,
	},

	tabItem: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 20
	},
});