/**
 * Created by cuiwenjuan on 2017/8/14.
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    // ListView,
    RefreshControl,
    Keyboard,
    DeviceEventEmitter,
    Platform,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import PageHeader from '../../components/NavigationTitleView'
import UserInfoUtil, * as type from '../../utils/UserInfoUtil'
import { commonUtil, maidianCenter, toast, customerPhone, complaintPhone } from '../../utils/CommonUtils'
import * as baseStyle from '../../components/baseStyle'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
// import UmengAnalytics from 'react-native-umeng-analytics'
// import SafeAreaView from '../../components/SafeAreaView';
import BaseComponent from '../BaseComponentPage'
import ShareSetting from '../../modules/ShareSetting'


let key = '';
let first = true;
let customerAsyncString = 'customerAsyncString';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"
class Customer extends BaseComponent {


    constructor(props) {
        super(props);
        this.state = {
            inputShow: false,
            data: UserInfoUtil.getUserIMReducer().allIM,
            keyboardHeight: 0,
            scrollViewHeight: 0,
            cellViewHeight: 80,
            cellHeight: 320,
            refreshing: true,
            inputHeight: 0,
            customerData: null
        }

        this.numbers = 20;
        this.pluNumber = 20;
        this.lastTime = 0;
    }

    componentWillMount() {
        super.componentWillMount();

        //键盘监听事件
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this.noticeListener = DeviceEventEmitter.addListener('NoticeUserLogout', (data) => {
            this.onBack();
        });
        this.pageName = '个人中心客服';
        //
        // const {userIMOneMessage} = this.props.userIM;
        // userIMOneMessage(UserInfoUtil.getUserId());


        UserInfoUtil.getIMKFInfo();

        this.reloadWordData()

    }
    componentDidMount() {
        super.componentDidMount();

        //清除所有数据
        // const {IMlogout} = this.props.userIM;
        // IMlogout();

        //组件加载
        setTimeout(() => {
            this.setState({ refreshing: false });
        }, 200)

        //通知，用户客服回复，显示最后一条数据
        this.subsctiption = DeviceEventEmitter.addListener('kefuHuiFu', () => {
            setTimeout(() => {
                this._flatList.scrollToEnd()
            }, 10);
        });

        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zaixiankefu);
            sensorsDataClickObject.adModule.entrance = ''
            sensorsDataClickObject.adModule.module_name = '在线客服';
            sensorsDataClickObject.adModule.module_type = '其它';
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
        });

    }

    componentWillUnmount() {
        super.componentWillUnmount();

        //移除键盘监听
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.subsctiption.remove();
        this.noticeListener.remove();
        const { IMlogout } = this.props.userIM;
        IMlogout();

        //存储是否是今天时间戳
        var timestamp = Date.parse(new Date()) / 1000;
        AsyncStorage.setItem(customerAsyncString, JSON.stringify(timestamp), (error, result) => {
            if (!error) {
            }
        });
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    onBack() {
        Navigation.pop(this.props.navigation);
    }

    //默认回复数据
    _getCustomDefault() {
        const { oneIMMessageAction } = this.props.userIM;
        var timestamp = Date.parse(new Date()) / 1000;
        let customerData = {
            data: {
                create_time: timestamp,
                type: "2",
                content: "您好，专属客服为您服务！",
                custPhone: customerPhone,
                complaintPhone: complaintPhone,
            }
        };

        AsyncStorage.getItem(customerAsyncString)
            .then((value) => {
                let isToday = false;

                // 数据不存在，或者不是今天

                if (!value) {//不是今天
                    isToday = false
                } else {
                    if (ShareSetting.isToday(value * 1000)) {
                        isToday = true;
                    } else {//不是今天
                        isToday = false;
                    }
                }
                oneIMMessageAction(customerData, timestamp, isToday);

            });

    }

    //键盘弹出
    _keyboardDidShow(e) {

        this._flatList.scrollToEnd();
    }

    //键盘收回
    _keyboardDidHide(e) {
        this._flatList.scrollToEnd();
    }



    userMessage() {
        const { stateUserInfo } = this.props;
        console.log('stateUserInfo usermaessage = ' + JSON.stringify(stateUserInfo.userMessage));
    }

    /**
     *创建cell
     */
    renderCell = ({ item, sectionID, rowID }) => {

        // console.log('客服 === ',item);
        let showTime = true;
        //非第一条数据 并且 与上一条数据间隔5分钟的，不显示时间
        if (rowID > 0 && (item.data.create_time - this.lastTime) <= 5 * 60) {
            showTime = false;
        }
        this.lastTime = item.data.create_time;

        let time = ShareSetting.getDate(item.data.create_time * 1000, 'today')

        return (
            <View onLayout={e => {

                // if (this.listViewArray.length <= 21 && rowID >= 10) {
                //     this._flatList.scrollToEnd()
                // }
                {/*this.setState({scrollViewHeight: e.nativeEvent.layout.y > this.state.scrollViewHeight ? e.nativeEvent.layout.y : this.state.scrollViewHeight});*/ }
            }}
                style={{
                    // backgroundColor:'#cbffd5',
                    paddingTop: commonUtil.rare(30)
                }}>

                {
                    showTime ?
                        <View style={{ alignItems: 'center' }}>
                            <View style={{
                                backgroundColor: baseStyle.BLACK_05,
                                paddingRight: commonUtil.rare(20),
                                paddingLeft: commonUtil.rare(20),
                                borderRadius: commonUtil.rare(20),
                                height: commonUtil.rare(40),
                                alignItems: 'center',
                                justifyContent: 'center'
                            }} >
                                <Text style={{ fontSize: RATE(24), color: baseStyle.BLACK_40 }}>{time}</Text>
                            </View>

                        </View>
                        :
                        null
                }

                {/*<Text> {'111' + JSON.stringify(item)} </Text>*/}
                {
                    item.data.type == 2 ?
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            padding: commonUtil.rare(30),
                            justifyContent: 'flex-start'
                        }}>

                            <Image style={styles.headerStyle}
                                source={require('../../images/userCenter/uc_IMKF_header.png')} />
                            <Image style={{ marginLeft: commonUtil.rare(20), marginTop: commonUtil.rare(30) }}
                                source={require('../../images/userCenter/uc_IM_kf.png')} />


                            <View>
                                <View style={{
                                    backgroundColor: baseStyle.BLACK_05,
                                    borderRadius: 5,
                                    marginLeft: commonUtil.rare(0),
                                    marginRight: commonUtil.rare(140)
                                }}>
                                    <Text
                                        numberOfLines={0} style={[styles.textStyle, { color: baseStyle.BLACK_70 }]}>
                                        {item.data.content}
                                        {/*<Text style={{color:'#44a2ff'}} onPress={() => {}}>{item.data.phone ? item.data.phone : null}</Text>*/}
                                    </Text>

                                </View>
                                {
                                    item.data.custPhone && <Text
                                        numberOfLines={0} style={[{ color: 'rgba(0,0,0,0.4)', fontSize: 11, marginTop: 2 }]}>
                                        {'客服电话:'}
                                        <Text style={{ color: 'rgba(255,51,51,0.4)' }} onPress={() => { }}>{item.data.custPhone ? item.data.custPhone : null}</Text>
                                        {' 投诉电话:'}
                                        <Text style={{ color: 'rgba(255,51,51,0.4)' }} onPress={() => { }}>{item.data.complaintPhone ? item.data.complaintPhone : null}</Text>
                                    </Text>
                                }

                            </View>


                        </View>
                        :
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            padding: commonUtil.rare(30),
                            justifyContent: 'flex-end',
                            // backgroundColor:'#cbffd5'
                        }}>

                            <View style={{
                                marginRight: commonUtil.rare(0),
                                marginLeft: commonUtil.rare(160),
                                // backgroundColor:'#1fff27',
                                flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
                            }}>
                                {
                                    item.data.success ?
                                        <Image style={{ marginRight: commonUtil.rare(20), }}
                                            source={require('../../images/userCenter/uc_kefu_sendfail.png')} />
                                        : null
                                }


                                <View style={{
                                    borderRadius: 5,
                                    backgroundColor: baseStyle.BLUE_HIGH_LIGHT
                                }}>

                                    <Text numberOfLines={0} style={[styles.textStyle, { color: '#ffffff' }]}>
                                        {item.data.content}
                                    </Text>


                                </View>
                            </View>

                            <Image style={{
                                marginLeft: -1,
                                marginRight: commonUtil.rare(20),
                                marginTop: commonUtil.rare(30)
                            }}
                                source={require('../../images/userCenter/uc_IM_user.png')} />

                            <Image style={styles.headerStyle} source={{ uri: UserInfoUtil.getUserHeader() }} />
                        </View>
                }

            </View>
        )
    }

    /** 加载更多*/
    reloadWordData() {
        const { userIMAllMessage } = this.props.userIM;
        const { stateUserInfo } = this.props;
        if (stateUserInfo.permissions > 0) {
            userIMAllMessage(UserInfoUtil.getUserId(), this.numbers, (success) => {

                if (this.numbers <= this.pluNumber) {
                    //填写默认数据
                    this._getCustomDefault();
                    setTimeout(() => {
                        this._flatList.scrollToEnd()
                    }, 10);
                }
                this.numbers = this.numbers + this.pluNumber;
            });

        }
    }


    render() {
        // console.log('客服 render ');
        // let customer = [customerData, customerData1];
        // let listS = customer.concat(UserInfoUtil.getUserIMReducer().allIM);
        let listS = Array.from(UserInfoUtil.getUserIMReducer().allIM);

        this.listViewArray = listS;

        return <BaseComponent style={{ flex: 1, backgroundColor: '#fff' }}>
            <PageHeader onBack={() => this.onBack()} navigation={this.props.navigation} titleText={'客服'} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <FlatList
                    // style={{backgroundColor:'#cbffd5',flex: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={this.reloadWordData.bind(this)}
                        />}
                    ref={(flatList) => this._flatList = flatList}
                    data={listS}
                    renderItem={this.renderCell}
                >
                </FlatList>

                {/*//写*/}
                {this._renderBottom()}
                {/*//获取焦点后*/}
                {/*{this._renderInput()}*/}
            </KeyboardAvoidingView>


        </BaseComponent>

    }

    //测试 用户发消息
    custom() {
        const { userIMuser } = this.props.userIM
        let userData = {
            data: {
                gengXinShiJian: "1503365082000",
                headurl: "",
                kfID: "",
                kfName: "",
                leiXing: "1",
                neiRong: "这是一个什么问题呢？",
                userID: "1",
                userName: "222"
            }
        };

        userIMuser(userData);

        UserInfoUtil.userSendIMMessage('这是一个什么问题呢？',
            (success) => {
            },
            (error) => {
            })
    }


    //测试客服消息
    userClic() {

        const { userIMcustom } = this.props.userIM;
        let customerData = {
            data: {
                gengXinShiJian: "1503365082000",
                headurl: "",
                kfID: "1",
                kfName: "客服",
                leiXing: "1",
                neiRong: "我答复你这是一个什么问题哦",
                userID: "",
                userName: ""
            }
        };

        userIMcustom(customerData);
        this._flatList.scrollToEnd();

    }


    _onWritePress() {
        this.setState({ inputShow: true });
    }

    //输入框
    _renderBottom() {
        let sendButton = (
            <TouchableOpacity style={{
                marginLeft: 15,
                backgroundColor: baseStyle.BLUE_HIGH_LIGHT,
                height: 29,
                width: 60,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2
            }}
                onPress={() => this._pushComment()}>
                <Text style={{ color: baseStyle.WHITE }}>发送</Text>
            </TouchableOpacity>
        );

        return (

            <View style={{ height: 49, borderTopWidth: 1, borderTopColor: baseStyle.MAIN_CHANNEL_BACKGROUND_COLOR }}>
                {
                    this.state.inputShow ?
                        <View style={{
                            alignItems: 'center', height: 49,
                            backgroundColor: baseStyle.MAIN_CHANNEL_BACKGROUND_COLOR,
                        }}>
                            <View style={{ height: 1, backgroundColor: baseStyle.MAIN_CHANNEL_BACKGROUND_COLOR }} />
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                paddingHorizontal: 15,
                                paddingVertical: 8,
                                alignItems: 'center',
                            }}>
                                <View
                                    style={{
                                        height: 29,
                                        flex: 1,
                                        backgroundColor: '#fff',
                                        borderRadius: 2,
                                        padding: 5,
                                        justifyContent: 'center'
                                    }}>
                                    <TextInput
                                        placeholder=""
                                        maxLength={200}
                                        multiline={true}
                                        numberOfLines={3}
                                        autoFocus={true}
                                        // onEndEditing={(event) => this.setState({inputShow: false})}
                                        underlineColorAndroid="transparent"
                                        selectionColor={baseStyle.BLUE_HIGH_LIGHT}
                                        ref={(ref) => this.input = ref}
                                        style={{
                                            flex: 1,
                                            fontSize: RATE(30),
                                            padding: 0,
                                            textAlignVertical: 'center',
                                            // backgroundColor:'#ffad92',//'rgba(38, 38, 40, 0.05)',
                                        }}
                                        onChangeText={(text) => {
                                            this.inputContent = text;
                                        }}
                                        onContentSizeChange={(params) => {
                                            // this.setState({
                                            //     inputHeight: 0
                                            // })
                                            {/*console.log('客服行高 = '+params.nativeEvent.contentSize.height);*/ }
                                        }}
                                    />
                                </View>
                                {sendButton}
                            </View>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 49, paddingHorizontal: 15, backgroundColor: baseStyle.MAIN_CHANNEL_BACKGROUND_COLOR }}>
                            <View style={{ height: 1, backgroundColor: baseStyle.MAIN_CHANNEL_BACKGROUND_COLOR }} />
                            <TouchableOpacity style={{ flex: 1, height: 29, }}
                                onPress={() => this._onWritePress()}>
                                <View style={{
                                    flex: 1, flexDirection: 'row', alignItems: 'center',
                                    borderRadius: 3, backgroundColor: '#fff',
                                }}>
                                    <Image style={{ marginHorizontal: 10 }}
                                        source={require('../../images/icons/post_detail_write.png')} />
                                    <Text style={{ fontSize: 12, color: baseStyle.BLACK_99 }}>想说点什么</Text>
                                </View>
                            </TouchableOpacity>
                            {sendButton}
                        </View>
                }
            </View>
        );
    }


    //发送消息
    _pushComment() {
        //输入的内容
        let inputContent = this.inputContent;

        //消息清空
        this.input && this.input.clear();

        //数据部位空 发送
        if (inputContent) {

            this._flatList.scrollToEnd();
            UserInfoUtil.userSendIMMessage(inputContent,
                (success) => {
                    setTimeout(() => {
                        this._flatList.scrollToEnd()
                    }, 10);
                },
                (error) => {
                    setTimeout(() => {
                        this._flatList.scrollToEnd()
                    }, 10);
                    toast('消息发送失败，如需帮助请拨打客服电话')
                })
        }
        this.inputContent = undefined;
    }

}


var styles = StyleSheet.create({
    headerStyle: {
        width: commonUtil.rare(90),
        height: commonUtil.rare(90),
        borderRadius: commonUtil.rare(90 / 2),
    },
    textStyle: {
        //设置行号
        fontSize: RATE(30),
        lineHeight: LINE_HEIGHT(30),
        margin: commonUtil.rare(20),

    }
});


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import * as UserIMAction from '../../actions/UserIMAction'
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../components/SensorsDataTool";

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    statePersonalStocks: state.UserIMReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch),
        userIM: bindActionCreators(UserIMAction, dispatch),
    })
)(Customer)

