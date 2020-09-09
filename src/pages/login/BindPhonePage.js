/**
 * Created by cuiwenjuan on 2020/3/25.
 */
import React, { PureComponent, Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    DeviceEventEmitter,
    StatusBar,
} from 'react-native';
import EditView from './EditView'
import PageHeader from '../../components/NavigationTitleView'
import { toast, checkPhone } from '../../utils/CommonUtils'
import { commonUtil, Utils } from '../../utils/CommonUtils'
import LoginButton from './LoginButton'
import AsyncStorage from '@react-native-community/async-storage';
import YDActivityIndicator from '../../components/YDActivityIndicator'
import BaseComponent from '../BaseComponentPage'
import UserInfoUtil from '../../utils/UserInfoUtil'
import * as baseStyle from '../../components/baseStyle'

class BindPhonePage extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            agreement: false,
            isPhone: false,
            animating: false,
        };
        this.username = '';
        this.verification = '';
        this.phoneCode = undefined;
        this.getVerTime = undefined;
    }
    componentDidMount() {
        super.componentDidMount();
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录 待确定
            // BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zhuce);
        });

        this.wxInfo = this.props.navigation.state.params.wxInfos;
    }
    componentWillUnmount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    componentWillMount() {

        super.componentWillMount();
        // DeviceEventEmitter.emit('pageName', '绑定手机号');


    }

    register() {

        const { bindPhone } = this.props.userInfo;
        //网络
        if (!this._checkNetConnected()) {
            return;
        }

        //手机号
        if (!checkPhone(this.username)) {
            toast('手机号格式不正确');
            return;
        }

        //验证码
        if (!this._checkVeri()) {
            return;
        }

        let param = this.wxInfo;
        param.phone = this.username;
        param.code = this.verification;
        this.setState({ animating: true });

        AsyncStorage.getItem('last_loginout_time', (error, result) => {
            if (result) {
                param.last_time = result
            }
            bindPhone(param,
                (response) => {
                    this.setState({ animating: false }, () => {
                        //绑定成功                        
                        toast('登录成功');
                        Navigation.popN(this.props.navigation, 2);
                        this.props.navigation.state.params && this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack();
                    });
                    sensorsDataClickObject.bandPhoneNumber.is_success = true
                    sensorsDataClickObject.bandPhoneNumber.fail_reason = ''
                    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.bandPhoneNumber)
                },
                (error) => {
                    if (error === '网络失败') {
                        toast('网络失败');
                        sensorsDataClickObject.bandPhoneNumber.is_success = false
                        sensorsDataClickObject.bandPhoneNumber.fail_reason = '网络失败'
                        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.bandPhoneNumber)
                    } else {
                        toast(error);
                        sensorsDataClickObject.bandPhoneNumber.is_success = false
                        sensorsDataClickObject.bandPhoneNumber.fail_reason = error
                        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.bandPhoneNumber)
                    }
                    this.setState({ animating: false });
                });
        })

    };

    changeTextNa(text, lengthText) {
        this.username = text;
        lengthText > 11 ? toast('您输入的手机号超过11位') : null;
        let isPhoneNumber = checkPhone(text);
        this.setState({
            isPhone: isPhoneNumber ? true : false,
        });
    }

    changeTextVer(text, lengthText) {
        this.verification = text;
        this.setState({
            agreement: !this.state.agreement,
        });
    }

    //获取验证码
    _getTextVer(callBack) {

        if (!this._checkNetConnected()) {
            return;
        }

        if (!checkPhone(this.username)) {
            // toast('手机号格式不正确');
            return;
        }

        this.setState({ animating: true, });

        sensorsDataClickObject.getCode.entrance = '微信登录'
        sensorsDataClickObject.getCode.service_type = '绑定手机号'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.getCode)
        UserInfoUtil.getPhoneVeri(this.username,
            (success) => {
                if (success.code.toString() === '10000') {
                    //返回无code
                    // this.phoneCode = success.phone_code;
                    this.getVerTime = new Date().getTime();
                    callBack && callBack(true);
                } else {
                    toast(success.msg ? success.msg : "发送失败，请稍后重试！");
                    callBack && callBack(false);
                }
                this.setState({ animating: false, });
                //console.log('验证码获取成功',JSON.stringify(success));
            },
            (error) => {
                this.setState({ animating: false, });
                // console.log('验证码获取失败',JSON.stringify(error));
                callBack && callBack(false);
            }, 'sms')
    }

    //检测网络链接返回true
    _checkNetConnected() {
        const { netConnected } = this.props;
        if (!netConnected.netConnected) {
            toast('网络错误，请检查网络');
            return false;
        }
        return true;
    }

    _checkVeri() {
        //验证码
        if (this.verification && this.verification !== "") {

            if (!this.getVerTime) {
                toast('验证码不正确');
                return false;
            }

            // if (this.verification !== this.phoneCode.toString()) {
            //     toast('验证码不正确');
            //     return false;
            // }
            let veriTimeNow = new Date().getTime();
            if (veriTimeNow - this.getVerTime > 2 * 60 * 1000) {
                toast('验证码已过期，请重新获取');
                return false;
            }

        } else {
            toast('请输入验证码');
            return false;
        }
        return true;
    }

    render() {
        return (
            <BaseComponent>
                <View style={styles.container}>
                    <PageHeader noDivider={{ backgroundColor: '#fff' }} onBack={() => Navigation.pop(this.props.navigation)} navigation={this.props.navigation} titleText={''} />


                    <View style={{ marginLeft: commonUtil.rare(30), marginRight: commonUtil.rare(30) }}>
                        <View style={{
                            // backgroundColor:'#cd92ff',
                            marginTop: commonUtil.rare(40),
                            marginBottom: commonUtil.rare(52),
                            alignItems: 'center',
                        }}>

                            <Text style={{ fontSize: 17 }}>
                                手机号码绑定
                            </Text>
                            <Text style={{ fontSize: 12, color: baseStyle.BLACK_000000_40, marginTop: 4 }}>
                                为了您的账户安全，请绑定手机号
                            </Text>

                        </View>



                        <EditView name='请输入手机号'
                            autoFocus={true}
                            heightH={true}
                            maxLength={11}
                            onChangeText={(text, lengthText) => this.changeTextNa(text, lengthText)}
                            defaultValue={this.username}
                        />

                        <EditView name='请输入验证码'
                            heightH={true}
                            maxLength={4}
                            onChangeText={(text, lengthText) => this.changeTextVer(text, lengthText)}
                            defaultValue={this.verification}
                            showVerification={true}
                            getVerification={(callBack) => { this._getTextVer(callBack) }}
                            disabled={!this.state.isPhone}
                            isPhone={this.state.isPhone}
                        />


                        <LoginButton
                            style={{ marginTop: 25 }}
                            onPress={() => this.register()}
                            disabled={!this.state.isPhone}
                            titleButton={'绑定'} />


                    </View>

                    <YDActivityIndicator animating={this.state.animating} />
                </View>
            </BaseComponent>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 30,
        backgroundColor: '#ffffff',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool';
// import { fail } from 'assert';

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    netConnected: state.NetInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(BindPhonePage)
