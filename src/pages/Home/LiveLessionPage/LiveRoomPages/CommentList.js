/**
 *
 *视频解盘(视频直播间)/交流互动列表
 *
 * */
import moment from "moment";
import React, { Component } from "react";
import { FlatList, Image, Platform, Text, TouchableOpacity, View } from "react-native";
import * as baseStyle from '../../../../components/baseStyle';
import Yd_cloud from '../../../../wilddog/Yd_cloud';

export default class CommentList extends Component {
    constructor(props) {
        super(props)
        this.data = [];
        this.Comment_Ref = Yd_cloud().ref(ZBJ_ydyun + 'chat')
        this.state = {
            listData: [],
            heightForItem: 0
        }
        this._loadData = this._loadData.bind(this)
        this._renderItem = this._renderItem.bind(this)
        this._onLayoutForItem = this._onLayoutForItem.bind(this)
        this._inputUI = this._inputUI.bind(this)
        this._onPressWenHangQing = this._onPressWenHangQing.bind(this)
        this._onPressZhenGuPiao = this._onPressZhenGuPiao.bind(this)
        this._onPressBiaoQing = this._onPressBiaoQing.bind(this)

    }
    componentDidMount() {
        this._loadData()
    }
    componentWillUnmount() {
        this.Comment_Ref && this.Comment_Ref.off('value', () => { });
    }
    detailComment(snap) {
        if (snap.success) {
            this.data = [];
            //console.log("直播间数据",snap.nodeContent);
            let values = Object.values(snap.nodeContent);
            this.data.push.apply(this.data, values.reverse());
            this.setState({ listData: [] }, () => {
                this.setState({ listData: this.data })
            })
        }
    }
    _loadData() {
        this.Comment_Ref.orderByKey().limitToLast(20).get((snap) => {
            this.detailComment(snap);
        })
        this.Comment_Ref.on('value', (snap) => {
            this.Comment_Ref.orderByKey().limitToLast(20).get((snap) => {
                this.detailComment(snap);
            })
        })
    }
    _onLayoutForItem(event) {
        //获取根View的宽高，以及左上角的坐标值
        let { height } = event.nativeEvent.layout;
        this.setState({ heightForItem: height })
    }
    //用户提问和老师互动的入口ui
    _inputUI() {
        return (
            <View style={{ width: baseStyle.width, height: 44, flexDirection: 'row', backgroundColor: '#F5F5F5', alignItems: 'center' }}>
                <TouchableOpacity activeOpacity={1} style={{ height: 34, flex: 1 }} onPress={() => { this._onPressWenHangQing() }}>
                    <View style={{
                        flex: 1,
                        height: 34,
                        borderColor: '#FF435E',
                        borderWidth: 1,
                        borderRadius: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 15,
                    }}>
                        <Text style={{ fontSize: 15, color: '#F92400' }}>问行情</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={{ height: 34, flex: 1 }} onPress={() => {
                    this._onPressZhenGuPiao()
                }}>
                    <View style={{
                        flex: 1,
                        height: 34,
                        borderColor: '#006ACC',
                        borderWidth: 1,
                        borderRadius: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 5,
                    }}>
                        <Text style={{ fontSize: 15, color: '#006ACC' }}>诊股票</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} onPress={() => { this._onPressBiaoQing() }}>
                    <Image style={{ height: 24, width: 24, marginLeft: 10, marginRight: 20 }} source={require('../../../../images/livelession/LiveRoom/biaoqing.png')} />
                </TouchableOpacity>
            </View>
        );
    }
    _onPressWenHangQing() {
        this.props.onPressWHQ()
    }
    _onPressZhenGuPiao() {
        this.props.onPressZGP()
    }
    _onPressBiaoQing() {
        this.props.onPressBQ()
    }
    _renderItem(item) {
        let data = item.item;
        // console.log('这是列表的Itye',data)
        if (data.type == 'img') {
            if (data.question == 'ding') {
                imgPath = require('../../../../images/livelession/LiveRoom/dyg01.png')
            } else if (data.question == 'guzhang') {
                imgPath = require('../../../../images/livelession/LiveRoom/gz01.png')
            } else if (data.question == 'qiandao') {
                imgPath = require('../../../../images/livelession/LiveRoom/qd01.png')
            } else if (data.question == 'songhua') {
                imgPath = require('../../../../images/livelession/LiveRoom/hua01.png')
            } else if (data.question == 'weiwu') {
                imgPath = require('../../../../images/livelession/LiveRoom/ww01.png')
            } else if (data.question == 'weixiao') {
                imgPath = require('../../../../images/livelession/LiveRoom/wx.png')
            } else if (data.question == 'zan') {
                imgPath = require('../../../../images/livelession/LiveRoom/zanyige.png')
            } else if (data.question == 'jiayou') {
                imgPath = require('../../../../images/livelession/LiveRoom/jy01.png')
            }
        }
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                marginLeft: 15,
                marginRight: 15,
                marginTop: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5E5'
            }} onLayout={this._onLayoutForItem}>
                <View style={{ width: 30, height: 30, borderRadius: 15 }}>
                    <Image style={{ width: 30, height: 30, borderRadius: 15 }} source={{ uri: data.head != '' ? data.head : 'default_header' }} />
                </View>
                <View style={{ flex: 1, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10 }}>
                        <Text style={{ fontSize: 14, color: '#333333' }}>{data.username && data.username}</Text>
                        <Text style={{ fontSize: 12, color: '#999999' }}>{data.create_time && moment(parseInt(data.create_time)).format("MM-DD HH:mm:ss")}</Text>
                    </View>
                    <View style={{ marginLeft: 10, marginTop: 10 }}>
                        {data.type == 'img'
                            ?
                            <Image style={{ width: (data.question.indexOf('11.png') != -1) ? 2 : 45, height: 18, }} source={imgPath} />
                            :
                            <Text style={{ fontSize: 13, color: '#666666' }}>{data.question}</Text>
                        }
                    </View>
                </View>
            </View>
        );
    }
    render() {
        return (
            <View style={{ flex: 1, marginBottom: baseStyle.isIPhoneX ? 34 : 0 }}>
                <FlatList
                    style={{}}
                    ref={(flatList) => this._flatList = flatList}
                    renderItem={this._renderItem}
                    refreshing={false}
                    showsVerticalScrollIndicator={false}
                    getItemLayout={(data, index) =>
                        ({ length: 60, offset: Platform.OS == 'android' ? 100 : 60 * index, index })
                    }
                    data={this.state.listData}
                />
                {this._inputUI()}
            </View>
        );
    }
}