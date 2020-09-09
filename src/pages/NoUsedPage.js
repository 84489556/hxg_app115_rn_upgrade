/**
 * Created by jzg on 2017/9/12.
 * 新手引导页
 */


'use strict';

import React, { Component } from "react";
import { Image, Platform, TouchableOpacity, View, Text, Dimensions } from "react-native";
import ShareSetting from "../modules/ShareSetting";
import * as baseStyle from '../components/baseStyle'
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserInfoAction from "../actions/UserInfoAction";
import * as AllActions from "../actions/AllActions";
import UserInfoUtil from "../utils/UserInfoUtil";
import AsyncStorage from '@react-native-community/async-storage';

export const jiePan_home = 10; // 解盘-首页
export const jiePan_live = 11; // 解盘-直播间
export const xuanGu_home = 20; // 选股-首页
export const keCheng_home = 30;
export const keCheng_detail = 31; // 课堂-详情页
export const keCheng_daKa = 32; // 课堂-大咖来了
export const hangQing_home = 40; // 行情-首页
export const hangQing_detail = 41; // 行情-详情页
export const woDe_home = 50; // 我的-首页
export const longhuketang = 52; // 我的-首页

class NoUsedPage extends Component {

    static defaultProps = {
        where: 0, // 使用场景，默认没有
        guideHeight: 0,
    };

    constructor(props) {
        super(props);
        this.isUsed = '2.0.17'; // 是否使用过标识
        this.storageKey = 'NoUsed';
        this.screen16_9 = true;
        this.state = {
            isUsed: true, // 默认不会展示
            currentPageIndex: 0, // 当前页面索引
            imageHiget: Dimensions.get('window').height,
        };
        this._onLayout = this._onLayout.bind(this);
    }

    // 页面加载完后显示
    componentDidMount() {

    }
    componentWillMount() {
        //查看是否需要加载引导图
        this._getStorage();
        let Proportion = (ShareSetting.getDeviceHeightDP() * 9) / (ShareSetting.getDeviceWidthDP() * 16);
        if (Proportion > 1) {
            this.screen16_9 = true
        } else {
            this.screen16_9 = false
        }

    }

    componentWillReceiveProps(nextProps, nextContext) {
        // this.storageKey = 'NoUsed' + nextProps.where; // 本地存储key
        // this._getStorage();
        // return true;
    }

    // 获取本地使用标识
    _getStorage() {

        AsyncStorage.getItem(this.storageKey, (error, result) => {
            if (Platform.OS === 'ios') {
                let checkMessage = UserInfoUtil.getUserInfoReducer().checkMessage;
                if (checkMessage <= 0) {
                    //正常显示
                    if (result === this.isUsed) {
                        //使用过，不展示
                        this.setState({ isUsed: true });
                    } else {
                        // 没使用过，展示
                        this.setState({ isUsed: false });
                    }
                }
            } else {
                if (result === this.isUsed) {
                    // 使用过，不展示
                    this.setState({ isUsed: true });
                } else {
                    // 没使用过，展示
                    this.setState({ isUsed: false });
                }
            }


        });
    }

    //监听安卓虚拟键，如果发生改变，重置图片高度
    _onLayout(event) {
        let eventHeight = event.nativeEvent.layout.height;
        if (Platform.OS === 'android') {
            // alert('_onLayout');
            this.setState({
                imageHiget: eventHeight
            });
        }
    }

    render() {
        let nextImagePath = require('../images/bg16-9/guide_next.png');
        let finshImagePath = require('../images/bg16-9/guide_finsh.png');
        let buttonImage = this.state.currentPageIndex > 2 ? finshImagePath : nextImagePath;
        let topText = 20;
        let topVIew = 0;
        // let bottomImage = baseStyle.isIPhoneX ? 34 :0;
        let bottomImage = 0;
        if (Platform.OS === 'ios') {
            if (baseStyle.isIPhoneX) {
                topText = 20 + 44;
                topVIew = -24;
            }
        } else {
            if (this.screen16_9) {
                topText = 20 + 25;
            }
        }
        // 图片选择
        let bgPath = this._getBgPath();
        if (bgPath == null) {
            // 没有图片
            return null;
        } else if (this.state.isUsed) {
            // 使用过，不展示
            return null;
        }
        // 没使用过，且有图片可展示
        return (
            <View
                style={{
                    flex: 1,
                    height: this.props.guideHeight,
                    position: 'absolute',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    top: topVIew,
                }}
                onLayout={(event) => { this._onLayout(event) }}
            >
                <View style={{
                    flex: 1,
                    // height: this.state.imageHiget,
                    width: Dimensions.get('window').width,
                    flexDirection: 'column'
                }}
                >
                    {this._titleView()}
                    <Image source={bgPath}
                        style={{
                            flex: 1,
                            width: Dimensions.get('window').width,
                            resizeMode: 'stretch',
                        }} />

                    <View
                        style={{
                            width: Dimensions.get('window').width,
                            height: bottomImage,
                            backgroundColor: 'rgba(0,0,0,0.8)'
                        }}
                    />
                </View>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        left: Dimensions.get('window').width / 2 - 50,
                        bottom: baseStyle.isIPhoneX ? 34 + 80 : 80,
                        height: 40,
                        width: 100,
                        // backgroundColor:'red'
                    }}
                    activeOpacity={1}
                    onPress={() => this._imagePress()}>
                    <Image
                        source={buttonImage}
                        style={{
                            height: 40,
                            width: 100,
                            resizeMode: 'stretch',
                        }} />
                </TouchableOpacity>
                <Text
                    style={{
                        position: 'absolute',
                        top: topText,
                        right: 15,
                        fontSize: 15,
                        color: '#FFFFFF'
                    }}
                    onPress={() => {
                        AsyncStorage.setItem(this.storageKey, this.isUsed, () => {
                            // 使用过，不展示
                            this.setState({ isUsed: true });
                        });
                    }}
                >
                    跳过
                </Text>
            </View>
        );
    }

    _titleView() {
        if (this.screen16_9) {
            //如果是大于16：9 例如18：9，则添加头部，
            if (Platform.OS === 'ios') {
                if (baseStyle.isIPhoneX) {
                    return (<View
                        style={{
                            height: 44 - 24,
                            width: Dimensions.get('window').width,
                            backgroundColor: 'rgba(0,0,0,0.8)'
                        }}
                    />)
                } else {
                    return (<View />)
                }

            } else {
                return (<View
                    style={{
                        height: 25,
                        width: Dimensions.get('window').width,
                        backgroundColor: 'rgba(0,0,0,0.8)'
                        // backgroundColor:'yellow'
                    }}
                />)
            }
        } else {
            return (<View />);
        }
    }
    _imagePress() {
        let pageIndex = this.state.currentPageIndex;
        if (pageIndex > 2) {//完成
            // 全部点击之后修改本地使用标识
            AsyncStorage.setItem(this.storageKey, this.isUsed, () => {
                // 使用过，不展示
                this.setState({ isUsed: true });
            });
        } else {//下一步
            this.setState({
                currentPageIndex: pageIndex + 1,
            });
        }
    }
    /**
     * 获取新手指导图片
     * @private
     */
    _getBgPath() {
        let path = null;
        //全部使用16：9的那套图
        if (this.state.currentPageIndex === 0) {
            path = require('../images/bg16-9/guide_shoye_16_10.png');
        } else if (this.state.currentPageIndex === 1) {
            path = require('../images/bg16-9/guide_center_16_10.png');
        } else if (this.state.currentPageIndex === 2) {
            path = require('../images/bg16-9/guide_guandian_16_10.png');
        } else if (this.state.currentPageIndex === 3) {
            path = require('../images/bg16-9/guide_vip_16_10.png');
        }
        // if (this.screen16_9) {
        //     //如果是大于16：9 例18：9，使用16：9的图加title，guide_shoye_16_10.png为16：9的图
        //     if (this.state.currentPageIndex === 0) {
        //         path = require('../images/bg16-9/guide_shoye_16_10.png');
        //     } else if (this.state.currentPageIndex === 1) {
        //         path = require('../images/bg16-9/guide_center_16_10.png');
        //     } else if (this.state.currentPageIndex === 2) {
        //         path = require('../images/bg16-9/guide_guandian_16_10.png');
        //     } else if (this.state.currentPageIndex === 3) {
        //         path = require('../images/bg16-9/guide_vip_16_10.png');
        //     }
        // }else {
        //     //如果是16：9或者16：10，使用16：10的图
        //
        //     if (this.state.currentPageIndex === 0) {//首页
        //         path = require('../images/bg16-9/guide_shoye_16_9.png');
        //     } else if (this.state.currentPageIndex === 1) {//个人中心
        //         path = require('../images/bg16-9/guide_center_16_9.png');
        //     } else if (this.state.currentPageIndex === 2) {//观点
        //         path = require('../images/bg16-9/guide_guandian_16_9.png');
        //     } else if (this.state.currentPageIndex === 3) {//vip
        //         path = require('../images/bg16-9/guide_vip_16_9.png');
        //     }
        //
        //
        // }
        return path;
    }
}
export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch),
        actions: bindActionCreators(AllActions, dispatch)
    })
)(NoUsedPage)