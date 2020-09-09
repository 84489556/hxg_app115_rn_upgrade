/**
 * Created by cuiwenjuan on 2017/8/10.
 */
import React, {PureComponent, Component} from 'react';
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
import {toast,checkPhone} from '../../utils/CommonUtils'
import {commonUtil,Utils} from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import LoginButton from './LoginButton'

import ShareSetting from '../../modules/ShareSetting'
import  YDActivityIndicator from '../../components/YDActivityIndicator'
import YDAlert from '../../components/YDAlert'
import BaseComponent from '../BaseComponentPage'
import UserInfoUtil from '../../utils/UserInfoUtil'
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"

class RegisterPage extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            agreement: false,
            isPhone: false,
            animating:false,
        };
        this.username = '';
        this.password = '';
        this.verification = '';
        this.phoneCode = undefined;
        this.getVerTime = undefined;
    }
    componentDidMount() {
        super.componentDidMount();
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zhuce);
        });

        let phone = this.props.navigation.state.params.username;
        //登录页有手机号的情况
        if(checkPhone(phone)){
            this.username = phone;
            this.setState({
                isPhone: true,
            });
        }
    }
    componentWillUnmount(){
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    componentWillMount() {

        super.componentWillMount();
        // DeviceEventEmitter.emit('pageName', '找回密码');


    }

    register() {

        const {login} = this.props.userInfo;
        //网络
        if(!this._checkNetConnected()){
            return;
        }

        //手机号
        if(!checkPhone(this.username)){
            toast('手机号格式不正确');
            return;
        }

        //密码
        if(!this._checkPassword(this.password)){
            return;
        }

        //验证码
        if(!this._checkVeri()){
            return;
        }

        let param = {'username':this.username,'password':this.password,'code':this.verification};
        this.setState({animating:true});

        UserInfoUtil.register(param,
            () =>{
                sensorsDataClickObject.registerSuccess.regist_method = '手机号'
                sensorsDataClickObject.registerSuccess.is_success = true
                sensorsDataClickObject.registerSuccess.fail_reason = ''
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.registerSuccess)
                UserInfoUtil.historyUser(this.username);
                this.setState({animating:false},()=>{
                    //注册成功，返回
                    Navigation.popN(this.props.navigation,2);
                    this.props.navigation.state.params && this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack();
                });
            },
            (error) =>{
                toast(error);
                sensorsDataClickObject.registerSuccess.regist_method = '手机号'
                sensorsDataClickObject.registerSuccess.is_success = false
                sensorsDataClickObject.registerSuccess.fail_reason = error ? error: ""
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.registerSuccess)
                this.setState({animating:false});
            })


    };

    //协议界面
    agreementPage(protocal) {
        if ( protocal == "yinsi") {
            Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: '隐私政策协议' })
        } else {
            Navigation.pushForParams(this.props.navigation, 'PrivacyAgreement', { title: '用户许可协议' })
        }
    }

    changeTextNa(text, lengthText) {
        this.username = text;
        lengthText > 11 ? toast('您输入的手机号超过11位') : null;
        let isPhoneNumber = checkPhone(text);
        this.setState({
            isPhone: isPhoneNumber ? true : false,
        });
    }

    changeTextVer(text,lengthText){
        this.verification = text;
        this.setState({
            agreement: !this.state.agreement,
        });
    }

    changePassword(text,lengthText){
        this.password = text
        this.setState({
            agreement: !this.state.agreement,
        });
    }

    //获取验证码
    _getTextVer(callBack){

        if(!this._checkNetConnected()){
            return;
        }

        if(!checkPhone(this.username)){
           // toast('手机号格式不正确');
            return;
        }

        // {"code":"10002","msg":"用户名已存在","data":{"avatar":"header_woman3","encrypt":"6ivp3y","is_teacher":0,"nickname":"好的好","password":"72aa3294c8e39926ba32f22e723236f6","phone":"15001283066","regdate":1513910076,"tid":0,"userid":57,"username":"15001283066"}}
        sensorsDataClickObject.getCode.entrance = '注册页面'
        sensorsDataClickObject.getCode.service_type = '注册'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.getCode)

        this.setState({animating:true,});
        UserInfoUtil.getPhoneVeri(this.username,
            (success) =>{                
                if(success.code.toString() === '10002'){
                    toast('手机号码已注册，请直接登录');
                    callBack && callBack(false);
                    sensorsDataClickObject.getCodeResult.is_success = false
                    sensorsDataClickObject.getCodeResult.fail_reason = '手机号码已注册，请直接登录'
                }else if(success.code.toString() === '10000'){
                    sensorsDataClickObject.getCodeResult.is_success = true
                    sensorsDataClickObject.getCodeResult.fail_reason = ''
                    // this.phoneCode = success.phone_code;
                    this.getVerTime = new Date().getTime();
                    callBack && callBack(true);
                } else {
                    toast(success.msg?success.msg:"发送失败，请稍后重试！");
                    callBack && callBack(false);
                    sensorsDataClickObject.getCodeResult.is_success = false
                    sensorsDataClickObject.getCodeResult.fail_reason = '发送失败'
                }
                sensorsDataClickObject.getCodeResult.service_type = '注册'                
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.getCodeResult)
                this.setState({animating:false,});
                //console.log('验证码获取成功',JSON.stringify(success));
            },
            (error) =>{
                sensorsDataClickObject.getCodeResult.service_type = '注册'
                sensorsDataClickObject.getCodeResult.is_success = false
                sensorsDataClickObject.getCodeResult.fail_reason = JSON.stringify(error)
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.getCodeResult)
                this.setState({animating:false,});
                // console.log('验证码获取失败',JSON.stringify(error));
                callBack && callBack(false);
            },'reg_send_code')
    }

    //检测网络链接返回true
    _checkNetConnected(){
        const {netConnected} = this.props;
        if( !netConnected.netConnected){
            toast('网络错误，请检查网络');
            return false;
        }
        return true;
    }

    _checkPassword(passwordS){
        // let reg = /[a-zA-Z]+(?=[0-9]+)|[0-9]+(?=[a-zA-Z]+)/;
        let reg = /^[A-Za-z0-9]+$/;
        let regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/;
        let regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if(!passwordS){
            toast('请输入密码');
            return false;
        }
        if(passwordS === ""){
            toast('请输入密码');
            return false;
        }
        if(passwordS.length < 6 || passwordS.length > 20){
            toast('密码格式不正确');
            return false;
        }

        if (!reg.test(passwordS)) {
            toast('密码格式不正确');
            return false;
        }
        // if(!regEn.test(passwordS)){
        //     toast('密码由英文字母、数字、字符组成');
        //     return false;
        // }
        return true;
    }

    _checkVeri(){
        //验证码
        if(this.verification && this.verification !== "") {

            if(!this.getVerTime){
                toast('验证码错误，请重新输入');
                return false;
            }

            // if (this.verification !== this.phoneCode.toString()) {
            //     toast('验证码错误，请重新输入');
            //     return false;
            // }
            let veriTimeNow = new Date().getTime();
            if (veriTimeNow - this.getVerTime > 2 * 60 * 1000) {
                toast('验证码已超时');
                return false;
            }

        }else {
            toast('验证码错误，请重新输入');
            return false;
        }
        return true;
    }

    render() {
        return (
            <BaseComponent>
            <View style={styles.container}>
                <PageHeader onBack={() => Navigation.pop(this.props.navigation)} navigation={this.props.navigation} titleText={'注册账号'}/>


                <View style={{marginLeft: commonUtil.rare(30), marginRight: commonUtil.rare(30)}}>

                    <EditView  name='请输入手机号'
                               autoFocus ={true}
                               heightH = {true}
                               maxLength ={11}
                               onChangeText={(text,lengthText) => this.changeTextNa(text,lengthText)}
                               defaultValue ={this.username}
                    />



                    <EditView name='请输入6-20为密码'
                              heightH = {true}
                              secureTextEntry={true}
                              showEyes = {true}
                              maxLength ={20}
                              keyboardType = {'default'}
                              onChangeText={(text,lengthText) => this.changePassword(text,lengthText)}
                              defaultValue = {this.password}

                    />

                    <EditView  name='输入验证码'
                               heightH = {true}
                               maxLength ={4}
                               onChangeText={(text,lengthText) => this.changeTextVer(text,lengthText)}
                               defaultValue ={this.verification}
                               showVerification = {true}
                               getVerification = {(callBack) => {this._getTextVer(callBack)}}
                               disabled={!this.state.isPhone}
                               isPhone={this.state.isPhone}
                    />

                    <Text numberOfLines={2}
                          suppressHighlighting = {true}
                          style={{
                              fontSize: RATE(24),
                              lineHeight: LINE_HEIGHT(24),
                              color: baseStyle.BLACK_99,
                              marginTop: commonUtil.rare(108),
                              textAlign: 'center',
                          }}
                    >
                        {'点击“注册账号”按钮表示您已同意'}
                        <Text style={{ color: baseStyle.BLUE_0099FF,textDecorationLine:'underline'}} onPress={() => this.agreementPage("xuke")}>{'《用户许可协议》'}</Text>
                    </Text>
                    <LoginButton
                        style={{marginTop:10}}
                        onPress={() => this.register()}
                        disabled={!this.state.isPhone}
                        titleButton = {'注册账号'}/>

                    <View style={{marginTop: commonUtil.rare(20),flexDirection:'row'}}>

                        <View style={{flex:1}}/>
                        <Text style={{color:  baseStyle.BLUE_0099FF,fontSize: RATE(24),marginRight:commonUtil.rare(10)}}
                              onPress={() => {
                                  Navigation.pop(this.props.navigation)
                                  {/*Navigation.pushForParams(this.props.navigation,'ForgetPassword',{username:this.username})*/}
                              }}>
                            已有账号，去登录
                        </Text>
                    </View>


                </View>

                <YDActivityIndicator animating={this.state.animating}/>
                <YDAlert ref={(ref) => this.ydAlert = ref} message = {'该手机号已经被注册'} surePress = {() => this._goLogin()} />
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


import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool';
// import { fail } from 'assert';

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
        netConnected:state.NetInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(RegisterPage)
