/**
/**
 * Created by cuiwenjuan on 2017/8/14.
 */
/**
 * 设置
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    DeviceEventEmitter,
    StyleSheet,
    Alert,
    Platform,
    NativeModules,
    StatusBar
} from 'react-native';

import SettingItem from './SettingItem'
import LoginPage from '../login/LoginPage'
import { toast } from '../../utils/CommonUtils'
import PrivacyAgreement from './PrivacyAgreement'
import { commonUtil, getTime, checkPhone, customerPhone, ourPhone, complaintPhone } from '../../utils/CommonUtils'

import UserInfoUtil, * as modelType from '../../utils/UserInfoUtil'
import RATE from '../../utils/fontRate.js';
import * as  baseStyle from '../../components/baseStyle'
import BaseComponent from '../BaseComponentPage'
import ShareSetting from '../../modules/ShareSetting'
import CYAlert from '../../components/CYAlert'
import CallPhone from '../../utils/CallPhone';
import RequestInterface from '../../actions/RequestInterface'
//import ShareView from '../../components/ShareView'


let callCust = '联系客服';
// let faL = '法律声明';
let privacy = '隐私政策协议';
// let mianZe = '免责声明';
let fuwu = "服务协议";
let checkUpdate = '检查更新';
let callOurs = '联系我们';
let remittanceWay = '汇款方式';
let complaintText = '投诉电话';
let feedBack = '意见反馈';

var settingArray = [remittanceWay, callCust, callOurs, complaintText, privacy, fuwu, feedBack, checkUpdate,];
var settingArrayTourist = [remittanceWay, callOurs, complaintText, privacy, fuwu, feedBack, checkUpdate];

var imageArray = [
    require('../../images/userCenter/uc_icon_remittanceWay.png'),
    require('../../images/userCenter/uc_iocn_cust.png'),
    require('../../images/userCenter/uc_icon_callOur.png'),
    require('../../images/userCenter/uc_icon_complaintPhone.png'),
    // require('../../images/userCenter/uc_iocn_fal.png'),
    require('../../images/userCenter/uc_icon_privacy.png'),
    require('../../images/userCenter/uc_icon_mianze.png'),
    require('../../images/userCenter/uc_icon_feedback.png'),
    require('../../images/userCenter/uc_icon_checkUp.png'),
]
var imageArrayTourist = [
    require('../../images/userCenter/uc_icon_remittanceWay.png'),
    require('../../images/userCenter/uc_iocn_cust.png'),
    require('../../images/userCenter/uc_icon_complaintPhone.png'),
    // require('../../images/userCenter/uc_iocn_fal.png'),
    require('../../images/userCenter/uc_icon_privacy.png'),
    require('../../images/userCenter/uc_icon_mianze.png'),
    require('../../images/userCenter/uc_icon_feedback.png'),
    require('../../images/userCenter/uc_icon_checkUp.png'),
]

let activityCenter = '活动中心';
let serviceMall = '服务商城';
let myOrder = '我的订单';
let myPermissions = '我的权限';

let activityTitleArray = [activityCenter, serviceMall, myOrder, myPermissions];
let activityImageArray = [
    require('../../images/userCenter/uc_activity.png'),
    require('../../images/userCenter/uc_service.png'),
    require('../../images/userCenter/uc_order.png'),
    require('../../images/userCenter/uc_permission.png'),
];


let time = (timeStamp) => {
    return getTime("yyyy-MM-dd", timeStamp * 1000);
};

let getPhone = (pString) => {

    if (checkPhone(pString)) {
        pString = pString.split('')
        pString.splice(3, 4, '****');
    }
    return pString;
};

let xingImage = (permissions) => {

    if (permissions === DuoTou) {
        return require('../../images/userCenter/uc_duoTou.png')
    } else if (permissions === 3) {
        return require('../../images/userCenter/uc_xingSan.png')
    } else if (permissions === 4) {
        return require('../../images/userCenter/uc_xingSi.png')
    } else if (permissions === 5) {
        return require('../../images/userCenter/uc_xingWu.png')
    } else if (permissions === 1) {
        return require('../../images/userCenter/uc_xingZero.png')
    } else if (permissions <= 0) {
        return require('../../images/userCenter/uc_youke.png')
    }
}
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"
class UserCenter extends BaseComponent {


    constructor(props) {
        super(props);

        this.state = ({
            versionMessage: {},
            newVersionRUL: ''
        })
    }

    componentWillMount() {
        super.componentWillMount();
    }

    showToast(text) {
        toast('未登录')
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.yonghuzhongxinzhuye);
            sensorsDataClickObject.adModule.entrance = '首页'
            sensorsDataClickObject.adModule.module_name = '用户中心';
            sensorsDataClickObject.adModule.module_type = '用户中心';
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
        });
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }
    hxgJieKou() {
        // UserInfoUtil.ydgpZanNew('1550592000000',modelType.MODEL_daKaLaiLa,1,undefined,undefined,()=> {
        //
        // },()=>{
        //
        // })

        // UserInfoUtil.ydgpZanNew('58',modelType.MODEL_ZAN_CeLueXueTang,1,undefined,undefined,()=> {
        //
        // },()=>{
        //
        // },'测试名称0830-20','1567417302597')

        // UserInfoUtil.understand('58',modelType.MODEL_xiaoBaiKeTang,2,()=> {
        //
        //  },()=>{
        //
        //  },'测试名称0830-20','1567417302597')


        // let array = UserInfoUtil.getZanMessage(modelType.ZAN_ZhiBiaoKeTang);
        // console.log('点赞数据 === ',array.indexOf('22'));


        // let array = UserInfoUtil.getUnderstandArray(modelType.ZAN_XiaoBaiKe);
        // let array = UserInfoUtil.getUnderstand(modelType.ZAN_XiaoBaiKe,'1567050797293');
        //  console.log('点赞数据 === ',array);


        // 加自选
        //     UserInfoUtil.addPersonStock('sh000003','123',()=>{},() => {})

        //删除一个
        // UserInfoUtil.deletePersonStock('sh000001','123',() => {},()=>{})
        //删除全部
        // UserInfoUtil.deleteAllPersonStock('sh000001,sh000003,sh000004',()=>{},()=>{})

        //批量排序
        // UserInfoUtil.sortPersonStock('sh000001,sh000004',()=>{},()=>{})
        //置顶
        // UserInfoUtil.topPersonStock('sh000004',()=>{},()=>{})

        // let array =  UserInfoUtil.getZanMessage(modelType.MODEL_daKaLaiLa);
        //  console.log('点赞数据 === ',array);

        //userInfo
        const { login } = this.props.userInfo;
        login();
    }







    selected(info) {
        const { navigator, stateUserInfo } = this.props;
        let username = stateUserInfo.userInfo.nickname ? stateUserInfo.userInfo.nickname : stateUserInfo.userInfo.username;
        // this.shareView.show();
        switch (info) {
            case remittanceWay:
                Navigation.pushForParams(this.props.navigation, 'TransferWay')
                return;

            case callOurs: //联系我们
                if (Platform.OS === 'ios') {
                    CallPhone.callPhone(ourPhone);

                } else {
                    this.cyAlert.showAlert();
                }
                return
            case callCust://联系客服
                if (Platform.OS === 'ios') {
                    CallPhone.callPhone(customerPhone);
                } else {
                    this.cyAlertCust.showAlert();
                }

                return
            case complaintText://投诉电话
                if (Platform.OS === 'ios') {
                    CallPhone.callPhone(complaintPhone);
                } else {
                    this.cyAlertComplaint.showAlert();
                }
                return;


            // case faL://法律声明
            //     Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: faL })

            //     return;
            // case mianZe://免责声明
            //     Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: mianZe })

            //     return;
            case privacy://隐私协议
                Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: privacy })

                return;
            case fuwu://服务协议
                Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: fuwu })

                return;
            case feedBack:
                Navigation.pushForParams(this.props.navigation, 'FeedBackPage');
                return;
            case checkUpdate://检查更新
                UserInfoUtil.versionMessage("1",
                    (success) => {
                        //console.log("呵呵:",success)
                        if (success.code.toString() === '10000') {
                            let data = success.data;
                            let verson = data.version_no;
                            let downloadUrl = data.download_url;
                            let content = data.content && data.content.replace(/@#/g, '\n');
                            // let message = '最新版本：v' + verson + '\n\n'
                            //     + '更新内容:\n' + content;
                            let message = { version: verson, content: content }

                            let versionL = UserInfoUtil.getVersion();
                            //请求返回的是空信息 没有新的
                            if (verson && versionL < verson) {
                                this.setState({
                                    versionMessage: message,
                                    newVersionRUL: downloadUrl
                                })

                                this.cyAlertCheckVersion.showAlert();
                            } else {
                                toast('已经是最新版本')
                            }
                        } else {
                            toast(success.msg)
                        }

                    },
                    (error) => {
                        //console.log("呵呵:",error)
                        toast(error)
                    })

                return;
            default:
                return;

        }
    }

    _activityOnPress(info) {
        // toast(info);
        // this.hxgJieKou();
        // return;

        let permissions = UserInfoUtil.getUserPermissions();

        switch (info) {
            case activityCenter:
                Navigation.pushForParams(this.props.navigation, 'ActivityCenter');
                return;
            case serviceMall:
                Navigation.pushForParams(this.props.navigation, 'ServiceMall');
                return;
            case myOrder:

                if (permissions < 1) {
                    sensorsDataClickObject.loginButtonClick.entrance = '我的订单'
                    Navigation.pushForParams(this.props.navigation, 'LoginPage', {
                        callBack: () => {
                            // toast('回调成功')
                            //  Navigation.pushForParams(this.props.navigation, 'UserOrder');

                            let permission = UserInfoUtil.getUserPermissions();
                            if (permission >= 1) {
                                Navigation.pushForParams(this.props.navigation, 'UserOrder');
                            }
                        }
                    });
                } else {
                    Navigation.pushForParams(this.props.navigation, 'UserOrder');
                }
                return;
            case myPermissions:

                if (permissions < 1) {
                    sensorsDataClickObject.loginButtonClick.entrance = '我的权限'
                    Navigation.pushForParams(this.props.navigation, 'LoginPage', {
                        callBack: () => {
                            let permission = UserInfoUtil.getUserPermissions();
                            if (permission >= 1) {
                                Navigation.pushForParams(this.props.navigation, 'UserPermissionsPage');
                            }
                        }
                    });
                } else {
                    Navigation.pushForParams(this.props.navigation, 'UserPermissionsPage');
                }
                return;
            default:
                return;
        }
    }

    //密码修改成功回调方法
    _changePCallBack() {
        this.cyAlertChangePassword.showAlert();
    }


    logoutPress() {
        this.cyAlertLogout.showAlert();
    }
    //退出登录
    logout() {
        const { logout } = this.props.userInfo;
        let userId = UserInfoUtil.getUserId()
        logout();
    }

    //我的设置
    onBack() {
        //console.log("点击返回")
        Navigation.pop(this.props.navigation);
    }


    //我的客服
    customer() {
        Navigation.pushForParams(this.props.navigation, 'Customer', { title: '客服' });
    }

    //我的消息
    userMessage() {
        Navigation.pushForParams(this.props.navigation, 'UserMessage');
    }

    //修改头像
    _changeHeader() {

        let permission = UserInfoUtil.getUserPermissions()
        if (permission >= 1 ) {
            Navigation.pushForParams(this.props.navigation, 'SettingPage')
        } else {
            sensorsDataClickObject.loginButtonClick.entrance = '用户中心'
            Navigation.pushForParams(this.props.navigation, 'LoginPage', { index: 1 })
        }   
    }


    _redPointView() {
        return (
            <View
                style={{
                    backgroundColor: baseStyle.BLUE_LIGHT,
                    position: 'absolute',
                    top: 0,
                    right: 2,
                    borderColor: '#fff',
                    width: commonUtil.rare(20),//jiaoBwidth,
                    height: commonUtil.rare(20),
                    borderRadius: commonUtil.rare(10),
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
            </View>
        )
    }
    //header（设置 通知和客服）
    _headerTitle() {
        let check = UserInfoUtil.getUserInfoReducer().checkMessage > 0;

        const { stateUserInfo } = this.props;
        let permissions = UserInfoUtil.getUserPermissions();
        let isNewTongZ = UserInfoUtil.hasNewTongZhi();
        let isNewChatMessage = UserInfoUtil.hasNewChatMessages();


        return (
            <View style={{
                backgroundColor: baseStyle.BLUE_HIGH_LIGHT,
                height: 44,
                borderBottomColor: baseStyle.SPLIT_LINE_COLOR,
                borderBottomWidth: 0,
                // paddingTop: ShareSetting.getStatusBarHeightDP(),
            }}>
                <View style={{ flexDirection: 'row', marginTop: 5, flex: 1, marginLeft: 15, marginRight: 15 }}>
                    <TouchableOpacity
                        hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
                        style={{ width: 30, height: 30, justifyContent: 'center' }}
                        activeOpacity={0.7}
                        onPress={this.onBack.bind(this)}>
                        <Image style={{ width: 9, height: 16 }} source={require('../../images/userCenter/uc_back.png')} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center', }}>
                        {/*<Text style={{fontSize: 18, color: '#ffffff'}}/>*/}
                    </View>
                    {
                        !check && permissions > 1 ? <TouchableOpacity
                            hitSlop={{ top: 20, left: 10, bottom: 20, right: 20 }}
                            activeOpacity={0.7}
                            onPress={this.customer.bind(this)}>
                            <Image source={require('../../images/userCenter/uc_kefu.png')} />
                            {
                                isNewChatMessage ? this._redPointView()
                                    :
                                    null
                            }
                        </TouchableOpacity> : null
                    }

                    <TouchableOpacity
                        hitSlop={{ top: 20, left: 20, bottom: 20, right: 10 }}
                        style={{ marginLeft: commonUtil.rare(30) }}
                        activeOpacity={0.7} onPress={this.userMessage.bind(this)}>
                        <Image source={require('../../images/userCenter/uc_gr_xiaoxi.png')} />
                        {
                            isNewTongZ ? this._redPointView()
                                :
                                null
                        }

                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //个人中心头 （用户名 头像 等级 服务时间）
    _headerCYUser() {
        let check = UserInfoUtil.getUserInfoReducer().checkMessage > 0;

        const { stateUserInfo } = this.props;
        let imageUri = UserInfoUtil.getUserHeader();
        let permissions = UserInfoUtil.getUserPermissions();
        let activity = UserInfoUtil.getUserInfoReducer().activityPer;
        let cyPower = UserInfoUtil.getUserInfoReducer().cyPower;
        // permissions = 5;
        //console.log("财源power", cyPower)

        let nickname = stateUserInfo.userInfo.nickname ? stateUserInfo.userInfo.nickname : stateUserInfo.userInfo.username;
        nickname = getPhone(nickname);


        //星级图
        if(activity === DuoTou)
            permissions = DuoTou;
        let xingI = xingImage(permissions);


        //获取服务剩余天数
        let dayNumber = cyPower.numberDays;
        let dayMiaoSu = '服务' + dayNumber + '天后到期';
        let isDefaultH = imageUri;
        let loginColor = 'rgba(255,255,255,0.6)';

        if (permissions < 1) {
            let nickNameT = UserInfoUtil.getDeviceID();
            let qian = nickNameT.slice(0, 3);
            let hou = nickNameT.slice(nickNameT.length - 3);
            nickname = '游客' + qian + hou;
            dayMiaoSu = '立即登录 >';
            loginColor = baseStyle.BLACK_40;
            isDefaultH = 'default_header'
        } else if (!cyPower.isStart) {  //未开始
            dayMiaoSu = '服务尚未开始'
        } else if (dayNumber === 0) {
            dayMiaoSu = '服务' + ShareSetting.getDate(cyPower.end_time * 1000, 'yyyy/MM/dd HH:mm') + '到期'
        } else if (dayNumber < 0) {
            dayMiaoSu = '服务已到期,请续费';
            xingI = xingImage(cyPower.permissions);
            if(cyPower.permissions === DuoTou){
                dayMiaoSu = '服务已到期';
            }
        }

        if (check) {
            if (permissions >= 1) {
                dayMiaoSu = '欢迎加入源达慧选股';
            }
            xingI = '';
        }

        if (permissions === 1 && cyPower.start_time === undefined) {
            dayMiaoSu = '欢迎加入源达慧选股';
        }

        return (

            <View
                style={{
                    height: commonUtil.rare(190),
                    backgroundColor: baseStyle.BLUE_HIGH_LIGHT,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: commonUtil.rare(30),
                }}>


                <TouchableOpacity onPress={() => this._changeHeader()}
                    activeOpacity={0.8}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            style={{
                                height: commonUtil.rare(headerImageH),
                                width: commonUtil.rare(headerImageH),
                                borderRadius: commonUtil.rare(headerImageH / 2),
                                borderColor: '#ffffff',
                            }}
                            source={{ uri: isDefaultH }} />
                        {
                            <View style={{ marginLeft: commonUtil.rare(25) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    {/*<Image style={{marginRight: commonUtil.rare(2)}}*/}
                                    {/*source={permissions >= 2 ? require('../../images/userCenter/uc_money_icon.png') : require('../../images/userCenter/uc_noMoney_icon.png')}/>*/}
                                    <Text
                                        style={styles.userNameStyle}>
                                        {nickname}
                                    </Text>
                                    {
                                        permissions >= 1 &&
                                        <Image style={{ marginLeft: 5 }} source={require('../../images/userCenter/uc_set.png')} />
                                    }
                                </View>
                                <Text
                                    style={[styles.settingStyle, {
                                        textAlign: 'left',
                                        marginTop: commonUtil.rare(24),
                                        color: loginColor ? loginColor : null
                                    }]}>
                                    {dayMiaoSu}
                                </Text>

                            </View>
                        }

                    </View>
                </TouchableOpacity>
                {
                    <View style={{ justifyContent: 'center' }}>
                        <Image style={{ marginTop: commonUtil.rare(8) }} source={xingI} />
                        {/*<Text*/}
                        {/*style={[styles.settingStyle, {*/}
                        {/*textAlign: 'right',*/}
                        {/*marginBottom: commonUtil.rare(8)*/}
                        {/*}]}>*/}
                        {/*{'您的账号服务期还剩' + dayNumber + '天'}*/}
                        {/*</Text>*/}
                    </View>
                }
            </View>
        )
    }

    //
    _userCenterCell(info, index, iconImage) {

        let check = UserInfoUtil.getUserInfoReducer().checkMessage > 0;
        if (check && info === remittanceWay) {
            return null;
        }

        let isBlank = (info === complaintText || info === checkUpdate || info === feedBack)
        let name = '';
        if (info === callOurs) {
            name = ourPhone;
        } else if (info === callCust) {
            name = customerPhone;
        } else if (info === complaintText) {
            name = complaintPhone;
        } else if (info === checkUpdate) {
            name = '当前版本 V' + UserInfoUtil.getVersion() + ' (build: ' + UserInfoUtil.getBuildNumber() + ')';
        }

        let styleColor = {};
        if (info === callOurs || info === callCust || info === complaintText) {
            styleColor = { color: '#0099FF' }
        }

        return (
            <SettingItem
                key={index}
                style={styleColor}
                text={info}
                name={name}
                onPress={() => this.selected(info)}
                isBlank={isBlank}
                isShowArrow={false}
                imageIcon={iconImage}>

            </SettingItem>
        )
    }


    _activityView() {

        return (
            <View style={{ flexDirection: 'row', marginTop: commonUtil.rare(20), backgroundColor: '#fff' }}>
                {
                    activityTitleArray.map((text, index) => (
                        <TouchableOpacity key={index}
                            onPress={() => { this._activityOnPress(text) }}
                            style={{ flex: 1, height: 75 }}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={activityImageArray[index]} />
                                    <Text style={{ color: baseStyle.BLACK_40, fontSize: 12, marginTop: 5 }}>{text}</Text>
                                </View>
                                <View style={{ width: 1, height: 40, backgroundColor: baseStyle.BLACK_000000_10 }} />
                            </View>
                        </TouchableOpacity>
                    ))
                }
            </View>
        )
    }



    render() {

        let check = UserInfoUtil.getUserInfoReducer().checkMessage > 0;


        const { stateUserInfo } = this.props;
        let permissions = UserInfoUtil.getUserPermissions();

        let cellArray = settingArrayTourist
        let iconImageArray = imageArrayTourist
        if (permissions > 1) {
            iconImageArray = imageArray;
            cellArray = settingArray;
        }

        return <BaseComponent style={{ flex: 1, backgroundColor: '#fff' }} topColor={baseStyle.BLUE_HIGH_LIGHT}>
            {this._headerTitle()}
            {/*//头像用户名*/}
            {this._headerCYUser()}
            <ScrollView style={{ flex: 1, backgroundColor: commonUtil.black_F6F6F6 }}>

                {/*//服务获取订单*/}
                {!check && this._activityView()}

                <View style={{ marginTop: commonUtil.rare(20) }}>

                    {
                        cellArray.map((text, index) => (
                            this._userCenterCell(text, index, iconImageArray[index])
                        ))
                    }

                </View>

                {
                    UserInfoUtil.getUserPermissions() > 0 ?
                        <TouchableOpacity onPress={this.logoutPress.bind(this)}
                            style={{
                                // marginLeft: commonUtil.rare(30),
                                // marginRight: commonUtil.rare(30),
                                marginTop: commonUtil.rare(0),
                                height: commonUtil.rare(88),
                                backgroundColor: "#fff",
                                borderRadius: 0,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 40
                            }}>
                            <Text style={{ color: baseStyle.BLUE_HIGH_LIGHT, fontSize: RATE(32), }}>
                                退出登录
                            </Text>
                        </TouchableOpacity>
                        : null
                }
                <CYAlert type={0} title={'将拨打联系我们电话'} phone={ourPhone} ref={(ref) => this.cyAlert = ref} />
                <CYAlert type={0} title={'将拨打客服服务电话'} phone={customerPhone} ref={(ref) => this.cyAlertCust = ref} />
                <CYAlert type={0} title={'将拨打投诉服务电话'} phone={complaintPhone} ref={(ref) => this.cyAlertComplaint = ref} />
                <CYAlert type={1}
                    message={'确认退出账户？'}
                    sure={'确定'}
                    surePress={() => this.logout()}
                    ref={(ref) => this.cyAlertLogout = ref} />
                <CYAlert type={3}
                    title={'重新登录'}
                    message={'您的账号密码已修改，请重新登录，如非本人操作，请拨打客服电话，客服电话：'}
                    phone={customerPhone}
                    sure={'重新登录'}
                    surePress={() => { 
                        sensorsDataClickObject.loginButtonClick.entrance = '用户中心'
                        Navigation.pushForParams(this.props.navigation, 'LoginPage')
                     }}
                    ref={(ref) => this.cyAlertChangePassword = ref} />

                <CYAlert type={4}
                    title={'发现新版本'}
                    message={this.state.versionMessage}
                    sure={'立即更新'}
                    surePress={() => {
                        if (Platform.OS === 'ios') {
                            CallPhone.checkVersionUpdata();
                        } else {
                            NativeModules.upgrade.upgrade(this.state.newVersionRUL);
                        }
                    }}
                    ref={(ref) => this.cyAlertCheckVersion = ref} />
            </ScrollView>



        </BaseComponent>

    }
//  <ShareView ref={(shareView) => this.shareView = shareView}
//                 keyString={'1234'}
//                 model={'1234'} />
}
let headerImageH = 120;

var styles = StyleSheet.create({
    userNameStyle: {
        color: '#fff',
        fontSize: RATE(30),
    },

    settingStyle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: RATE(24)
    },
});

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import {sensorsDataClickActionName, sensorsDataClickObject} from '../../components/SensorsDataTool';

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    stateUserIMMessage: state.UserIMReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(UserCenter)
