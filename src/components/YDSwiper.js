/**
 * Created by cuiwenjuan on 2018/11/13.
 */
import React, { Component } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import * as baseStyle from './baseStyle';
import ShareSetting from "../modules/ShareSetting.js";

const X_HEIGHT = 812;
const X_WIDTH = 375;

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default class YDSwiper extends Component {
    static propTypes = {
        style: PropTypes.object,
    };
    static defaultProps = {
        style: {},
    };
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0
        };
    }

    onAnimationEnd(e) {

        // 1.求出水平方向的偏移量  
        var offsetX = e.nativeEvent.contentOffset.x;

        // 2.求出当前的页数         floor函数 取整  
        var currentPage = Math.floor(Math.floor(offsetX) / Math.floor(ShareSetting.getDeviceWidthDP()));
        // alert('123==' +offsetX +'ShareSetting.getDeviceWidthDP() = '+ ShareSetting.getDeviceWidthDP())

        //有些屏幕移动一屏的偏移量比 屏幕宽度小一点点
        if ((offsetX - currentPage * ShareSetting.getDeviceWidthDP()) > ShareSetting.getDeviceWidthDP() * 2 / 3) {
            currentPage = currentPage + 1;
        }

        // 3.更新状态机  
        this.setState({
            // 当前页  
            currentPage: currentPage
        })
    }

    render() {

        let length = this.props.children.length;

        return (
            <View>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    horizontal={true}
                    scrollEnabled={true}
                    pagingEnabled={true}
                    //滚动动画结束时调用此函数
                    onMomentumScrollEnd={(e) => this.onAnimationEnd(e)}
                >
                    {this.props.children && this.props.children.map((info) => {
                        return info;
                    })}
                </ScrollView>
                <View
                    style={{
                        backgroundColor: this.props.pageControlBgColor || 'transparent',
                        paddingTop: 5,
                    }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                        {this.props.pageControlStyle === 'CircleDot' ?
                            this.props.children && this.props.children.map((info, index) => {
                                return <View key = {index} style={{ backgroundColor: this.state.currentPage === index ? '#F92400' : '#CFCFCF', width: 5, height: 5, borderRadius: 2.5, margin: 3 }} />
                            })
                            :
                            this.props.children && this.props.children.map((info, index) => {
                                return <View key = {index} style={{ backgroundColor: this.state.currentPage === index ? '#00000099' : '#00000066', width: this.state.currentPage === index ? 15 : 5, height: 5, borderRadius: 2.5, marginLeft: 3, marginRight: 3 }} />
                            })
                        }
                    </View>
                </View>
            </View>
        );
    }
}