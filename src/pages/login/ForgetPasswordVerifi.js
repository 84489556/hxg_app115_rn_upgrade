/**
 * Created by cuiwenjuan on 2017/10/30.
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
} from 'react-native';
var {height, width} = Dimensions.get('window');
import EditView from './EditView'
import PageHeader from '../../components/PageHeader'
import {toast} from '../../utils/CommonUtils'
import {commonUtil,Utils} from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import LoginButton from './LoginButton'
import ForgetPasswordNext from './ForgetPasswordNext'
import  YDActivityIndicator from '../../components/YDActivityIndicator'
import  BaseComponent from '../BaseComponentPage'

var veriStr = undefined;
let veriTime = undefined;
class ForgetPasswordVerifi extends BaseComponent {


    constructor(props) {
        super(props);
        this.state = {
            isPhone: true,
            animating:false,
            sureDisable:true,
        };
    }

    onBack(){
        Navigation.popN(this.props.navigation,2);
    }

    register() {

        if(this.verification || this.verification === "") {

            if(!veriStr){
                toast('验证码错误，请重新输入');
                return
            }

            if (this.verification !== veriStr.toString()) {
                toast('验证码错误，请重新输入');
                return;
            }
            let veriTimeNow = new Date().getTime();
            if (veriTimeNow - veriTime > 2 * 60 * 1000) {
                toast('验证码已过期，请重新获取');
                return;
            }

        }else {
            toast('验证码错误，请重新输入');
            return;
        }

        Navigation.pushForParams(this.props.navigation,'ForgetPasswordNext',{username:this.props.navigation.state.params.username})

    };

    /**
     * 获取验证码事件
     */
    getVerification() {
        const {phoneVeri} = this.props.userInfo;

        const {netConnected} = this.props;
        if( !netConnected.netConnected){
            toast('网络错误，请检查网络');
            return;
        }

        // toast(this.username);
        phoneVeri(this.props.navigation.state.params.username,
            (success) => {
                veriTime = new Date().getTime();
                veriStr = success.phone_code;
            },
            (error) => {
            });
    }

    changeTextVer(text, lengthText) {
        this.verification = text;
        this.setState({
            sureDisable:lengthText >= 4 ? false : true ,
        });
    }

    render() {
        return (
        <BaseComponent>
            <View style={styles.container}>
                <PageHeader onBack={() => this.onBack()} title={'忘记密码'}/>

                <View style={{marginTop:commonUtil.rare(50),height: commonUtil.rare(136)}}>
                    <Text
                        style={{color:baseStyle.BLACK_333333,
                            fontSize:RATE(40),
                            marginLeft:commonUtil.rare(30)}}>
                        验证码已发送至
                    </Text>
                    <Text
                        style={{color:baseStyle.BLACK_333333,
                            fontSize:RATE(30),
                            marginTop:commonUtil.rare(27),
                            marginLeft:commonUtil.rare(30)}}>
                        {this.props.navigation.state.params.username}
                    </Text>
                </View>

                <View style={{marginLeft: commonUtil.rare(30), marginRight: commonUtil.rare(30)}}>
                    <EditView  name='请输入验证码'
                               heightH = {true}
                               maxLength ={4}
                               onChangeText={(text,lengthText) => this.changeTextVer(text,lengthText)}
                               defaultValue ={this.verification}
                               showVerification = {true}
                               getVerification = {this.getVerification.bind(this)}
                               getVerifi = {true}
                               disabled={this.state.isPhone ? true:false}
                               isPhone={this.state.isPhone}

                    />

                    <LoginButton onPress={this.register.bind(this)}
                                 disabled={this.state.sureDisable}
                                 titleButton={'确定'}/>
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
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});


import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
        netConnected:state.NetInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(ForgetPasswordVerifi)