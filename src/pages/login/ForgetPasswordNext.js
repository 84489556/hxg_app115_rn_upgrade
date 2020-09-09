/**
 * Created by cuiwenjuan on 2017/8/10.
 */
import React, { PureComponent,Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    DeviceEventEmitter,
    Platform,
} from 'react-native';

import EditView from './EditView'
import PageHeader from '../../components/PageHeader'
import {toast} from '../../utils/CommonUtils'
import  YDActivityIndicator from '../../components/YDActivityIndicator'
import {commonUtil} from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import LoginButton from './LoginButton'
import BaseComponent from '../BaseComponentPage'
import UserInfoUtil, * as type from '../../utils/UserInfoUtil'



class ForgetPassword extends BaseComponent {


    constructor(props) {
        super(props);
        this.state = {
            agreement: false,
            isPhone:true,
            animating:false,
        };
    }


    componentWillMount() {
        super.componentWillMount();

    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    onBack(){
        Navigation.popN(this.props.navigation,3);
    }

    nextClick () {
        let userNa = this.props.navigation.state.params.username;

        const {netConnected} = this.props;
        if( !netConnected.netConnected){
            toast('网络错误，请检查网络');
            return;
        }

       if(!this._checkPassword(this.password)){
           return;
       }

        //修改密码
        const {changePassword,logout} = this.props.userInfo;

        this.setState({animating:true});
        changePassword(userNa,this.password,
            (success)=> {
                this.setState({animating:false});
                // toast("找回密码成功，请登录",()=>{this.props.navigator.popToTop()})
                toast("新密码设置成功，请牢记！",()=>{
                    DeviceEventEmitter.emit('changePasswordSuccess', userNa);
                    logout();
                    this.onBack();
                });

            },
            (error)=> {
                this.setState({animating:false});
                toast(error,()=>{});

            });

    };

    _checkPassword(passwordS){
        // let reg = /[a-zA-Z]+(?=[0-9]+)|[0-9]+(?=[a-zA-Z]+)/;
        let reg = /^[A-Za-z0-9]+$/;
        let regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/;
        let regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if(!passwordS){
            return false;
        }
        if(passwordS === ""){
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

    changeTextPa(text,lengthText){
        this.password = text;
        // this.setState({
        //     isPhone: lengthText >= 6 ? false : true,
        // });
        if(Platform.OS === 'ios'){
            this.setState({
                isPhone: lengthText >= 6 ? false : true,
            });
        }else {
            //上面的方法设置，Android在删除剩最后一个字符 先显示明文在密文
            if(lengthText === 6){
                this.setState({isPhone:false})
            }else if(lengthText === 5){
                this.setState({isPhone:true})
            }
        }
    }

    render() {
        return (
        <BaseComponent>
            <View style={styles.container}>
                <PageHeader onBack={() => this.onBack()} title={'忘记密码'}/>

                <View style={{marginTop:commonUtil.rare(50), height: commonUtil.rare(60)}}>
                    <Text
                        style={{color:baseStyle.BLACK_333333,
                            fontSize:RATE(40),
                            marginLeft:commonUtil.rare(30)}}>
                        设置密码
                    </Text>
                </View>
                <View style={{marginLeft:commonUtil.rare(30), marginRight:commonUtil.rare(30)}}>

                    <EditView name='请输入您的密码'
                              secureTextEntry={true}
                              heightH = {true}
                              showEyes = {true}
                              maxLength ={20}
                              keyboardType = {'default'}
                              onChangeText={(text,lengthText) => this.changeTextPa(text,lengthText)}
                              defaultValue = {this.password}
                              // selection = {{
                              //     start: this.password ? this.password.length:0,
                              //     end: this.password ? this.password.length:0}}
                    />

                    <Text
                        style={{marginTop:commonUtil.rare(30),fontSize:RATE(24), color:baseStyle.BLACK_50}}
                        numberOfLines={0}>
                        由6-20位英文字母、数字组成。
                    </Text>

                    <LoginButton onPress={this.nextClick.bind(this)}
                                 disabled={this.state.isPhone} titleButton = {'确认'}/>

                </View>

                <YDActivityIndicator animating={this.state.animating}/>
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
});


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
        netConnected:state.NetInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(ForgetPassword)

