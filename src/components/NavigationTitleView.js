/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description:
 *
 * props属性
 * navigation:导航(必传)
 * leftTopView:自定义返回按钮(选传)
 * noDivider: 是否有分割线,默认有
 * 标题(二选一)
 *      titleText:标题文字
 *      titleView:自定义标题控件
 * rightTopView:自定义右侧控件(选传)
 *
 *
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';

import * as ScreenUtil from '../utils/ScreenUtil';

export default class NavigationTitleView extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {}
    }
    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {

    }

    render() {
        return (
            <View style={this.props.noDivider !== undefined && this.props.noDivider ? styles.conNoDivider : styles.conDivider}>
                <View style={{ flexDirection: "row", width: ScreenUtil.screenW, height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90) }}>
                    {/*文字标题 或 标题控件*/}
                    {
                        this.props.titleText !== undefined ?
                            <View style={styles.navTitleBack}>
                                <Text style={styles.navTitle} numberOfLines={1}>{this.props.titleText}</Text>
                            </View> :
                            <View style={styles.titleView}>{this.props.titleView}</View>
                    }
                    {/*返回按钮*/}
                    {this.props.leftTopView !== undefined ?
                        <View style={styles.backView}>{this.props.leftTopView}</View>
                        :
                        <TouchableOpacity activeOpacity={0.6} onPress={() => this._clickBack()} style={styles.backView}>
                            <Image source={require('../images/login/login_back.png')} style={styles.backIcon} />
                        </TouchableOpacity>
                    }
                    {/*右侧按钮*/}
                    {
                        (this.props.rightTopView !== undefined) ?
                            <View style={styles.rightView}>{this.props.rightTopView}</View> :
                            <View />
                    }
                </View>
            </View>
        )
    }

    _clickBack = () => {
        this.props.onBack ? this.props.onBack() : this.props.navigation.goBack();
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {

    }

}

const styles = StyleSheet.create({
    conDivider: {
        backgroundColor: "white",
        borderBottomColor: '#f6f6f6',
        borderBottomWidth: 1,
    },
    conNoDivider: {
        backgroundColor: "white",

    },
    backView: {
        position: 'absolute',
        top: 0,
        width: 40,//这个宽度随意就行
        height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: "center"
    },
    backIcon: {
        //  position: 'absolute',
        // top: Platform.OS === 'ios' ? (44 - 25) / 2 : (44 - 25) / 2,
        width: 12,
        height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),
        marginLeft: 10,
        resizeMode: 'contain'
    },
    navTitleBack: {
        width: ScreenUtil.screenW - 80,
        height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),
        marginHorizontal: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    navTitle: {
        color: 'black',
        fontSize: ScreenUtil.setSpText(34),
        alignSelf: 'center',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0)'
    },
    titleView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: ScreenUtil.screenW
    },
    rightView: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'flex-end',
        right: 0,
        width: 100,
        height: Platform.OS === "ios" ? 44 : ScreenUtil.scaleSizeW(90),
    },
});
