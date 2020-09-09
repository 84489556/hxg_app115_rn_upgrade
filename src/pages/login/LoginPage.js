/**
 * Created by cuiwenjuan on 2017/8/9.
 */
'use strict';

import React from 'react';
import { DeviceEventEmitter, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
// export default LoginPage;
import { bindActionCreators } from 'redux';
import * as UserInfoAction from '../../actions/UserInfoAction';
import * as baseStyle from '../../components/baseStyle';
import YDActivityIndicator from '../../components/YDActivityIndicator';
import ShareSetting from '../../modules/ShareSetting';
import { commonUtil, toast } from '../../utils/CommonUtils';
import RATE, { LINE_HEIGHT } from '../../utils/fontRate.js';
import UserInfoUtil from '../../utils/UserInfoUtil';
import BaseComponent from '../BaseComponentPage';
import EditView from './EditView';
import LoginButton from './LoginButton';
import ShareModel from "../../utils/ShareModel";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import dismissKeyboard from '../../../node_modules/react-native/Libraries/Utilities/dismissKeyboard';
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool';
import AsyncStorage from '@react-native-community/async-storage';
// var dismissKeyboard = require('dismissKeyboard');


var { height, width } = Dimensions.get('window');

const subject = { 'name': '666666', 'age': '12' };

let cellHeight = commonUtil.rare(88);
var veriStr = undefined;
class LoginPage extends BaseComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'HOME',
        titleStyle: { color: '#ff00ff' },
        headerStyle: { backgroundColor: '#000000' }
    });


    constructor(props) {
        super(props);
        // this.username = '1500128300';
        // this.password = '666666';
        this.username = this.props.param && this.props.param.username;
        this.state = {
            isPhone: this.username && this.password ? true : false,
            animating: false,
            showHistoryView: false,
            varDisabled: false,
            showWXLogin: true,
        }
    }

    componentDidMount() {
        super.componentDidMount();
        //密码修改成功
        DeviceEventEmitter.addListener('changePasswordSuccess', (userName) => {
            this.username = userName;
            this.password = '';
            this.setState({ isPhone: false })
        });

        let arrayData = UserInfoUtil.historyUser();
        if (arrayData.length > 0) {
            this.username = arrayData[0];
            this.setState({
                varDisabled: this.username.length >= 1 ? true : false,
            });
        }


    }

    componentWillMount() {
        super.componentWillMount();

        //判断是否安装三方软件
        if (Platform.OS === 'ios') {
            ShareModel.platformTypeArray((platformA) => {
                // this._isInstall(platformA.isWeiXin, platformA.isQQ, platformA.isWeiBo)
                this.setState({ showWXLogin: platformA.isWeiXin })

            })
        } else {
            ShareModel.getPackageName((isWeiXin, isQQ, isWeiBo) => {
                this.setState({ showWXLogin: isWeiXin })
            })
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    //登录
    login() {
        this._historyHide();
        const { navigator, netConnected } = this.props;


        if (!netConnected.netConnected) {
            toast('网络错误，请检查网络');
            return;
        }
        //用户名
        if (!this.username || this.username === "") {

            toast('请输入用户名');
            return;
        }
        //验证码
        // if (this.verification || this.verification === "") {
        //     if (this.verification != veriStr) {
        //         toast('验证码不正确，请重新输入');
        //         return;
        //     }
        //
        // } else {
        //     toast('验证码不正确，请重新输入');
        //     return;
        // }


        //密码
        if (!this.password || this.password === "") {

            toast('验证码不正确，请重新输入');
            return;
        }

        let param = { 'username': this.username, 'password': this.password };

        this.setState({ animating: true, });
        //去取需要传给接口的时间
        AsyncStorage.getItem('last_loginout_time', (error, result) => {
            if (result) {
                param.last_time = result;
                this.loginUser(param);
            } else {
                this.loginUser(param);
            }
        });

    }

    // 登录 loginSuccess 事件 神策埋点
    loginSuccessFun = (is_success = false, login_method = '账号密码', fail_reason = '') => {
        let sensorsData = sensorsDataClickObject.loginSuccess
        sensorsData.login_is_first = false
        sensorsData.login_method = login_method
        sensorsData.quick_Login = login_method == '微信' ? true : false
        sensorsData.is_success = is_success
        sensorsData.fail_reason = fail_reason
        AsyncStorage.getItem('login_is_first').then((result) => {
            if (result && result != 'undefined') {
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.loginSuccess)
            } else {
                sensorsData.login_is_first = true
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.loginSuccess)
                AsyncStorage.setItem('login_is_first', 'hasLogined')
            }
        })
    }

    loginUser(param) {
        // MARK:何处跳转到登录页面需要
        SensorsDataTool.sensorsDataClickAction(SensorsDataTool.sensorsDataClickActionName.loginButtonClick, SensorsDataTool.sensorsDataClickObject.loginButtonClick)
        const { login } = this.props.userInfo;
        login(param,
            (response) => {
                UserInfoUtil.historyUser(this.username);
                //设置时间 为了先让个人中心render执行完，和跳转动画时间错开，防跳转卡顿
                setTimeout(() => {
                    toast('登录成功，欢迎回来', () => {
                    });
                    this._backPress();
                }, 500)
                this.loginSuccessFun(true, '账号密码')
            },
            (error) => {
                this.setState({ animating: false, });
                toast('账号或密码错误');
                this.loginSuccessFun(false, '账号密码', JSON.stringify(error))
            });
    }

    /**
     * 输入手机号
     * @param text
     * @param lengthText
     */
    changeTextNa(text, lengthText) {

        this.username = text;
        let length = lengthText;
        // if(length < 11){//用户更换账号时，清除验证码和密码
        //     this.password = null;
        //     this.verification = null;
        // }

        if (!(this.password && this.password.length >= 1)) {
            length = 0;
        }
        this.setState({
            isPhone: length >= 1 ? true : false,
        });
    }

    /**
     * 输入验证码
     * @param text
     * @param lengthText
     */
    changeTextVar(text, lengthText) {

        //密码
        this.password = text;
        let length = lengthText;
        if (!(this.username && this.username.length >= 1)) {
            length = -1;
        }

        if (Platform.OS === 'ios') {
            this.setState({
                isPhone: length >= 1 ? true : false,
            });
        } else {
            //上面的方法设置，Android在删除剩最后一个字符 先显示明文在密文
            if (length === 1) {
                this.setState({ isPhone: true })
            } else if (length === 0) {
                this.setState({ isPhone: false })
            }else if (length > 1){
                this.setState({ isPhone: true })
            }
        }
    }

    /**
     * 登录跳转
     * @private
     */
    _backPress() {
        Navigation.pop(this.props.navigation);
        this.props.navigation.state.params && this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack();
    }

    /**
     * 历史数据UI
     * @private
     */
    _historyData() {
        let arrayData = UserInfoUtil.historyUser();
        //获取数据
        return (
            <ScrollView
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,1)',
                    position: 'absolute',
                    top: commonUtil.rare(80),
                    left: 0,
                    right: 0,
                    height: arrayData.length > 3 ? 3 * cellHeight : null,
                    borderWidth: 1,
                    borderColor: '#efefef',
                    borderBottomWidth: 0,
                }}
                keyboardShouldPersistTaps={'handled'}>

                {
                    arrayData.map((info, index) => (
                        <TouchableHighlight
                            onPress={() => this._historyPress(info)}
                            underlayColor={'#eff8ff'}
                            style={{
                                flex: 1,
                                height: cellHeight,
                                borderBottomColor: '#efefef',
                                borderBottomWidth: 1,
                                justifyContent: 'center',
                            }}>
                            <Text
                                style={{
                                    marginLeft: commonUtil.rare(10),
                                    fontSize: RATE(30),
                                    color: baseStyle.BLACK_333333,
                                }}>
                                {info}
                            </Text>

                        </TouchableHighlight>
                    ))
                }
            </ScrollView>
        );

    }

    _historyPress(data) {
        this.username = data;
        this.password = null;
        this.setState({
            varDisabled: data >= 11 ? true : false,
        });
        this._historyHide();
    }

    _historyHide() {
        this.setState({
            showHistoryView: false,
        });
    }

    _historyShow() {
        this.setState({
            showHistoryView: true,
        });
    }

    _openCloseArrow() {
        this.setState({
            showHistoryView: !this.state.showHistoryView,
        });
    }

    /**
     * 获取验证码事件
     * {"code":"10000","msg":"send success","password":"b40027c73371ebfbd5772f5fee535369"}
     */
    getVerification() {
        const { phoneVeri } = this.props.userInfo;

        if (this.username) {
            if (!this.state.varDisabled) {
                toast('请输入正确的手机号');
                return;
            }
            phoneVeri(this.username,
                (responData) => {
                    this.password = responData.password;
                    veriStr = responData.phone_code;
                    toast(veriStr)
                },
                (error) => {
                });
        } else {
            toast('手机号不能为空哦')
        }
    }

    //协议界面
    agreementPage(protocal) {
        if (protocal == "yinsi") {
            Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: '隐私政策协议' })
        } else {
            Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: '服务协议' })
        }
    }


    // { province: '北京',
    //     unionid: 'olG6n0alpKLnvyJYbPo3a9t9Ct5w',
    //     language: 'zh_CN',
    //     privilege: [],
    //     country: '中国',
    //     headimgurl: 'http://thirdwx.qlogo.cn/mmopen/vi_32/fLfosqPUic4EyRmvibJPuJ3yIVdx9MbzW2WX8Z2mDGibBsibAyzMJM3zz7bQOqPGdqnjzvMUSwEviaF1SjNfhXMGAwg/132',
    //     city: '',
    //     sex: 1,
    //     nickname: '时间的路人c',
    //     openid: 'oKDl0waN6-jmjvv6jf8wLKc0IQCc' },

    _wxLogin() {
        const { wxLogin } = this.props.userInfo;

        // let wxID = 'olG6n0alpKLnvyJYbPo3a9t9Ct5w';
        // // let wxID = '';
        // let wxInfos = {
        //     'wx_unionid':wxID,
        //     'wx_avatar':'http://thirdwx.qlogo.cn/mmopen/vi_32/fLfosqPUic4EyRmvibJPuJ3yIVdx9MbzW2WX8Z2mDGibBsibAyzMJM3zz7bQOqPGdqnjzvMUSwEviaF1SjNfhXMGAwg/132',
        //     'wx_nickname':'时间的路人c',
        //     'wx_sex':1,
        //     'wx_address':'中国北京'
        // };

        //不管授权成功与否，都记录一次点击
        BuriedpointUtils.setItemClickByName(BuriedpointUtils.PageMatchID.weixinLogin);
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.enterWechatAuthorize)
        ShareModel.authLogin(2, (response) => {
            //console.log(response);
            sensorsDataClickObject.wechatAuthorizeResult.is_success = response.code == 0 ? true : false
            sensorsDataClickObject.wechatAuthorizeResult.fail_reason = response.code == 0 ? '' : '微信授权失败'
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.wechatAuthorizeResult)
            let wxInfos = {};
            if (response.code != 0) {
                toast("微信授权失败");
                return;
            }
            if (Platform.OS === 'ios') {
                let infoData = response.userInfo && response.userInfo;
                wxInfos = {
                    'wx_unionid': infoData.unionid,
                    'wx_avatar': infoData.headimgurl,
                    'wx_nickname': infoData.nickname,
                    'wx_sex': infoData.sex,
                    'wx_address': infoData.country + infoData.province + infoData.city
                };
            } else {
                wxInfos = {
                    'wx_unionid': response.userId,
                    'wx_avatar': response.userAvatar,
                    'wx_nickname': response.userName,
                    'wx_sex': response.userGender,
                    'wx_address': response.userAdress
                };
            }
            let param = { 'wx_unionid': wxInfos.wx_unionid };

            AsyncStorage.getItem('last_loginout_time', (error, result) => {
                if (result) {
                    param.last_time = result
                }
                wxLogin(param,
                    (response) => {
                        if (response && response.code && response.code.toString() === '10002') {
                            //该微信号未绑定
                            // toast('该微信号未绑定 ');
                            Navigation.pushForParams(this.props.navigation, 'BindPhonePage', { wxInfos: wxInfos })
                        } else if (response && response.code && response.code.toString() === '10001') {
                            //微信id不能为空
                            toast('微信id不能为空');
                        } else {
                            //登录成功
                            toast('登录成功');
                            this._backPress();
                            // toast(response);
                        }
                        this.loginSuccessFun(true, '微信')
                    },
                    (error) => {
                        toast('登录失败');
                        this.loginSuccessFun(false, '微信', JSON.stringify(error))
                    });
            });



        });


    }

    render() {

        let phoneH = commonUtil.rare(14)
        let statusBarHeightDPIos = ShareSetting.getStatusBarHeightDP() + phoneH;
        let statusBarHeightDAndroid = ShareSetting.getStatusBarHeightDP() + commonUtil.rare(15);

        let topDis = Platform.OS == 'ios' ? statusBarHeightDPIos : statusBarHeightDAndroid;
        // console.log("距离头部间距",Platform.OS==='ios'? commonUtil.rare(104)+30 : StatusBar.currentHeight+30)
        let logoImage = <View>
            <View style={{ paddingTop: Platform.OS === 'ios' ? commonUtil.rare(104) + (baseStyle.isIPhoneX ? 30 : 0) : StatusBar.currentHeight + 30 }} />
            <Image style={{ width: width }} source={require('../../images/login/login_logo.png')} />
        </View>;

        let statusBarView = <StatusBar
            // barStyle='default'
            barStyle='dark-content'
            // backgroundColor='transparent'
            // backgroundColor='#fff'
            style={{ height: ShareSetting.getStatusBarHeightDP() }} />;

        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff', }}>
                {//状态栏
                    statusBarView
                }

                <TouchableOpacity
                    style={{
                        flex: 1,
                    }}
                    activeOpacity={1.0}
                    onPress={() => {
                        dismissKeyboard();
                        this._historyHide()
                    }}>
                    <KeyboardAvoidingView behavior="position" style={{
                        justifyContent: 'center',
                    }}>
                        {//logo
                            logoImage
                        }

                        <View style={{ marginLeft: commonUtil.rare(30), marginRight: commonUtil.rare(30) }}>
                            <EditView name='请输入手机号码'
                                autoFocus={true}
                                heightH={true}
                                // showArrow={true}//是否显示历史账号按钮
                                maxLength={11}
                                zhangkai={!this.state.showHistoryView}
                                showHistory={() => this._openCloseArrow()}
                                // keyboardType={'numeric'}
                                keyboardType={'default'}
                                onChangeText={(text, lengthText) => this.changeTextNa(text, lengthText)}
                                defaultValue={this.username} />

                            <EditView name='请输入您的密码'
                                secureTextEntry={true}
                                showEyes={true}
                                maxLength={20}
                                keyboardType={'default'}
                                onChangeText={(text, lengthText) => this.changeTextVar(text, lengthText)}
                                defaultValue={this.password}
                            // selection = {Platform.OS === 'ios' ? null :{
                            //     start: this.password ? this.password.length:0,
                            //     end: this.password ? this.password.length:0}}
                            />

                            <Text numberOfLines={2}
                                suppressHighlighting={true}
                                style={{
                                    fontSize: RATE(24),
                                    lineHeight: LINE_HEIGHT(24),
                                    color: baseStyle.BLACK_333333,
                                    marginTop: commonUtil.rare(15),
                                    textAlign: 'left',
                                    marginLeft: commonUtil.rare(10),
                                }}
                            >
                                {'登录即表示同意'}
                                <Text style={{ color: baseStyle.BLUE_0099FF }} onPress={() => this.agreementPage("yinsi")}>{'《隐私政策协议》'}</Text>和
                                <Text style={{ color: baseStyle.BLUE_0099FF }} onPress={() => this.agreementPage("fuwu")}>{'《服务协议》'}</Text>
                            </Text>

                            <LoginButton style={{ marginTop: commonUtil.rare(52) }}
                                onPress={this.login.bind(this)}
                                disabled={this.state.isPhone ? false : true}
                                disabledBGC={baseStyle.RED_FFD5CE}
                                titleButton={'登录'} />

                            <View style={{ marginTop: commonUtil.rare(20), flexDirection: 'row' }}>

                                <Text style={{ color: baseStyle.BLUE_0099FF, fontSize: RATE(24), marginRight: commonUtil.rare(10) }}
                                    onPress={() => {
                                        {/*toast('立即注册')*/ }

                                        let callBack = this.props.navigation.state.params && this.props.navigation.state.params.callBack;
                                        Navigation.pushForParams(this.props.navigation, 'RegisterPage', { username: this.username, callBack: callBack });
                                    }}>
                                    立即注册
                                </Text>

                                <View style={{ flex: 1 }} />
                                <Text style={{ color: baseStyle.BLUE_0099FF, fontSize: RATE(24), marginRight: commonUtil.rare(10) }}
                                    onPress={() => {
                                        {/*toast('忘记密码')*/ }
                                        console.warn('忘记密码');
                                        Navigation.pushForParams(this.props.navigation, 'ForgetPassword', { username: this.username })
                                    }}>
                                    忘记密码
                                </Text>
                            </View>

                            {
                                this.state.showWXLogin ?
                                    <View>
                                        <Text style={{
                                            fontSize: 12,
                                            color: baseStyle.BLACK_000000_40,
                                            marginTop: commonUtil.rare(80),
                                            textAlign: 'center'
                                        }}>
                                            {'一键登录'}
                                        </Text>

                                        <TouchableOpacity onPress={() => { this._wxLogin(); }}
                                            activeOpacity={0.7}
                                            style={[{
                                                marginTop: commonUtil.rare(15),
                                                height: commonUtil.rare(80),
                                                borderRadius: commonUtil.rare(5),
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: baseStyle.BLACK_000000_10
                                            }]}>

                                            <Image source={require('../../images/login/login_wx.png')} />
                                            <Text style={{ fontSize: RATE(32), marginLeft: 2 }} >
                                                微信登录
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    : null

                            }

                            {this.state.showHistoryView ? this._historyData() : null}
                        </View>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
                <YDActivityIndicator animating={this.state.animating} />

                <TouchableOpacity
                    hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
                    style={{
                        position: 'absolute',
                        top: topDis,
                        left: commonUtil.rare(30),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        this._backPress()
                    }}>
                    <Image source={require('../../images/login/login_close.png')} />
                </TouchableOpacity>

            </View>
        );
    }

}

const LoginStyles = StyleSheet.create({});


export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    netConnected: state.NetInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(LoginPage)

