/**
 * Created by cuiwenjuan on 2017/8/10.
 */
import React, { PureComponent, Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native';

import EditView from './EditView'
import PageHeader from '../../components/NavigationTitleView'
import { toast, Utils } from '../../utils/CommonUtils'
import { commonUtil, checkPhone } from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
import LoginButton from './LoginButton'
import YDActivityIndicator from '../../components/YDActivityIndicator'
import YDAlert from '../../components/YDAlert'
import BaseComponent from '../BaseComponentPage'
import UserInfoUtil from '../../utils/UserInfoUtil'


class ForgetPassword extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            agreement: false,
            isPhone: false,
            animating: false,
        };
        this.verification = '';
        this.username = '';
        this.verification = '';
        this.phoneCode = undefined;
        this.getVerTime = undefined;
    }

    componentDidMount() {
        super.componentDidMount();
        let phone = this.props.navigation.state.params.username;
        //登录页有手机号的情况

        if (checkPhone(phone)) {

            this.username = phone;

            this.setState({
                isPhone: true,

            });
            // console.warn('忘记密码','isPhone='+this.isPhone,''+this.username);
        }
    }

    componentWillMount() {

        super.componentWillMount();
        // DeviceEventEmitter.emit('pageName', '找回密码');


    }

    componentWillUnmount() {
        super.componentWillUnmount();

        let pageName = '登录';
        // DeviceEventEmitter.emit('pageName', pageName);
    }

    nextClick() {
        if(!this._checkNetConnected()){
         return;
        }

        //手机号
        if(!checkPhone(this.username)) {
            toast('手机号格式不正确');
        }

        //验证码
        if(!this._checkVeri()){
            return;
        }

        //密码
        if(!this._checkPassword(this.password)){
            return;
        }

        this.setState({animating:true,});
        let param = {'phone':this.username,'password':this.password,'code':this.verification}
        UserInfoUtil.forgetPassword(param,
            () => {
                this.setState({animating:false,});
                toast('新密码设置成功，请牢记！',() =>{
                    this._onBack();
                });
            },
            (error) => {
            toast(error);
                this.setState({animating:false,});
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
            //toast('手机号格式不正确');
            return;
        }        
        sensorsDataClickObject.getCode.entrance = '登录页面'
        sensorsDataClickObject.getCode.service_type = '找回密码'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.getCode)
        this.setState({animating:true,});
        UserInfoUtil.getPhoneVeri(this.username,
            (success) =>{                                
                if(success.code.toString() === '10002'){
                    //console.log('验证码获取成功',JSON.stringify(success));
                    toast('账号不存在');
                    callBack && callBack(false);
                    sensorsDataClickObject.getCodeResult.is_success = false
                    sensorsDataClickObject.getCodeResult.fail_reason = '账号不存在'
                } else if(success.code.toString() === '10000'){
                    //console.log('验证码获取成功',JSON.stringify(success));

                    // this.phoneCode = success.phone_code;
                    this.getVerTime = new Date().getTime();
                    callBack && callBack(true);
                    sensorsDataClickObject.getCodeResult.is_success = true
                    sensorsDataClickObject.getCodeResult.fail_reason = ''
                } else {
                    toast(success.msg?success.msg:"发送失败，请稍后重试！");
                    callBack && callBack(false);
                    sensorsDataClickObject.getCodeResult.is_success = false
                    sensorsDataClickObject.getCodeResult.fail_reason = '发送失败'
                }
                sensorsDataClickObject.getCodeResult.service_type = '找回密码'                
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.getCodeResult)
                this.setState({animating:false,});
               // console.log('验证码获取成功',success,success.code.valueOf(),success.code);
            },
            (error) =>{
                sensorsDataClickObject.getCodeResult.service_type = '找回密码'
                sensorsDataClickObject.getCodeResult.is_success = false
                sensorsDataClickObject.getCodeResult.fail_reason = JSON.stringify(error)
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.getCodeResult)
                this.setState({animating:false,});
                callBack && callBack(false);

                // console.log('验证码获取失败',JSON.stringify(error));
            })
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
       // let reg = /^[A-Za-z0-9]+$/;
        let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;
        // let regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/;
        // let regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if(!passwordS){
            toast('请输入密码');
            return false;
        }
        if(passwordS === ""){
            toast('请输入密码');
            return false;
        }
        if(passwordS.length < 6 || passwordS.length > 20){
            toast('密码格式不正确，请重新输入');
            return false;
        }

        if (!reg.test(passwordS)) {
            toast('密码格式不正确，请重新输入');
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
                toast('验证码已过期，请重新获取');
                return false;
            }

        }else {
            toast('验证码错误，请重新输入');
            return false;
        }
        return true;
    }


    _onBack(){
        Navigation.pop(this.props.navigation)
    }


    render() {
        return (
        <BaseComponent>
            <View style={styles.container}>
                <PageHeader onBack={() => this._onBack()} navigation={this.props.navigation} titleText={'找回密码'}/>

                    <View style={{ marginLeft: commonUtil.rare(30), marginRight: commonUtil.rare(30) }}>

                    <EditView  name='请输入手机号码'
                               autoFocus ={true}
                               heightH = {true}
                               maxLength ={11}
                               onChangeText={(text,lengthText) => this.changeTextNa(text,lengthText)}
                               defaultValue ={this.username}
                               showVerification = {true}
                               getVerification = {(callBack) => {this._getTextVer(callBack)}}
                               disabled={!this.state.isPhone}
                               isPhone={this.state.isPhone}
                    />
                    <EditView  name='输入验证码'
                               heightH = {true}
                               maxLength ={4}
                               onChangeText={(text,lengthText) => this.changeTextVer(text,lengthText)}
                               defaultValue ={this.verification} />


                    <EditView name='请输入6-20位英文字母、数字组合密码'
                              heightH = {true}
                              secureTextEntry={true}
                              showEyes = {true}
                              maxLength ={20}
                              keyboardType = {'default'}
                              onChangeText={(text,lengthText) => this.changePassword(text,lengthText)}
                              defaultValue = {this.password}
                    />

                    <LoginButton
                        style={{marginTop:70}}
                                 onPress={this.nextClick.bind(this)}
                                 disabled={!this.state.isPhone}
                                 titleButton = {'提交'}/>
                    {/*<Text numberOfLines={2}*/}
                          {/*suppressHighlighting = {true}*/}
                          {/*onPress={() => {this.ydAlert.showAlert()}}*/}
                          {/*style={{fontSize:RATE(24),*/}
                              {/*color:baseStyle.BLACK_99,*/}
                              {/*marginTop:commonUtil.rare(30),*/}
                          {/*}}*/}
                    {/*>*/}

                        {/*{'若您的账户未绑定手机号，请'}*/}
                        {/*<Text style={{color:'#006ACC',textDecorationLine: 'underline',}}>联系客服</Text>*/}
                        {/*{'找回密码'}*/}
                        {/*</Text>*/}

                    </View>
                    <YDActivityIndicator animating={this.state.animating} />
                    <YDAlert
                        ref={(ref) => this.ydAlert = ref}
                        surePress={() => (callBack) => {
                            callBack('0311-68126378');
                        }}
                        title={'提示'}
                        message={'拨打客服电话\n0311-68126378'}
                        sure={'呼叫'} />
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
import { sensorsDataClickActionName, sensorsDataClickObject } from '../../components/SensorsDataTool';

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    netConnected: state.NetInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(ForgetPassword)

