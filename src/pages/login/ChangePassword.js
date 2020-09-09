/**
 * Created by cuiwenjuan on 2017/8/17.
 */
import React, { PureComponent, Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView
} from 'react-native';

import EditView from './EditView'
import PageHeader from '../../components/NavigationTitleView'
import { toast } from '../../utils/CommonUtils'
import YDActivityIndicator from '../../components/YDActivityIndicator'
import { commonUtil } from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
import dismissKeyboard from '../../../node_modules/react-native/Libraries/Utilities/dismissKeyboard';
import BaseComponent from '../BaseComponentPage'
import LoginButton from './LoginButton'

class ChangePassword extends BaseComponent {


    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        this.param = params
        this.state = {
            agreement: false,
            isPhone: false,
            animating: false,
        };
    }

    componentWillMount() {
        super.componentWillMount()

    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }



    nextClick() {
        const { changeNewPassword, logout } = this.props.userInfo;
        const { stateUserInfo, netConnected } = this.props;
        dismissKeyboard();


        if (!netConnected.netConnected) {
            toast('网络错误，请检查网络');
            return;
        }
        if (!this.oldPassword || this.oldPassword === "") {
            toast('请输入原密码');
            return;
        }
        //判断旧密码是否正确
        if (this.oldPassword !== stateUserInfo.password) {
            toast('原密码不正确');
            return;
        }

        if (!this.newPassword || this.newPassword === "") {
            toast('请输入新密码');
            return;
        }
        //判断密码格式
        if (!this._checkPassword(this.newPassword)) {
            toast('新密码格式不正确');
            return;
        }

        if (!this.password || this.password === "") {

            toast('请再次输入新密码');
            return;
        }



        if (this.newPassword !== this.password) {
            toast('两次密码输入不一致');
            return;
        }

        if (this.newPassword === this.oldPassword) {
            toast('新密码不能与旧密码相同');
            return;
        }

        this.setState({ animating: true, });
        changeNewPassword(stateUserInfo.userInfo.username, this.oldPassword, this.newPassword,
            (success) => {
                this.setState({ animating: false, });
                toast('密码修改成功', () => {
                    // logout();
                    Navigation.pop(this.props.navigation)
                })
            },
            (error) => {
                this.setState({ animating: false, });
                if (error === '密码错误') {
                    toast('旧密码不正确')
                } else {
                    toast('密码修改失败，请重新修改')
                }
            });
    };

    _checkPassword(passwordS) {
        // let reg = /[a-zA-Z]+(?=[0-9]+)|[0-9]+(?=[a-zA-Z]+)/;
        let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;

        if (!reg.test(passwordS)) {
            // toast('密码由英文字母、数字、字符组成');
            return false;
        }
        return true;
    }


    changeTextOldPa(text, lengthText) {
        this.oldPassword = text;
        this.setState({
            isPhone: lengthText >= 1 ? true : false,
        });
    }

    changeTextNewPa(text, lengthText) {
        this.newPassword = text;
        this.setState({
            isPhone: lengthText >= 1 ? true : false,
        });
    }

    changeTextPa(text, lengthText) {
        this.password = text;
        this.setState({
            isPhone: lengthText >= 1 ? true : false,
        });
    }

    render() {
        return (
            <BaseComponent style={styles.container}>
                <TouchableOpacity style={styles.container} activeOpacity={1.0} onPress={() => { dismissKeyboard() }}>
                    <PageHeader onBack={() => Navigation.pop(this.props.navigation)} navigation={this.props.navigation} titleText={'修改密码'} />

                    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                        <View style={{ marginLeft: commonUtil.rare(30), marginRight: commonUtil.rare(30) }}>

                            <EditView name='请输入原密码'
                                secureTextEntry={true}
                                maxLength={20}
                                keyboardType={'default'}
                                onChangeText={(text, lengthText) => this.changeTextOldPa(text, lengthText)}
                                defaultValue={this.oldPassword} />
                            <EditView name='请输入新密码,不少于6位字符'
                                secureTextEntry={true}
                                maxLength={20}
                                keyboardType={'default'}
                                onChangeText={(text, lengthText) => this.changeTextNewPa(text, lengthText)}
                                defaultValue={this.newPassword} />
                            <EditView name='请再次输入新密码'
                                secureTextEntry={true}
                                maxLength={20}
                                keyboardType={'default'}
                                onChangeText={(text, lengthText) => this.changeTextPa(text, lengthText)}
                                defaultValue={this.password} />
                            <Text style={{ marginTop: commonUtil.rare(30), fontSize: RATE(24), color: baseStyle.BLACK_50 }}>
                                密码为6-20位英文字母、数字组合
                    </Text>


                            <LoginButton
                                style={{ marginTop: commonUtil.rare(90) }}
                                onPress={this.nextClick.bind(this)}
                                disabled={this.state.isPhone ? false : true}
                                isPhone={this.state.isPhone} titleButton={'保存'} />


                            <YDActivityIndicator animating={this.state.animating} />

                        </View>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
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
    welcome: {
        fontSize: RATE(40),
        textAlign: 'center',
        margin: 10,
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

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    netConnected: state.NetInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(ChangePassword)
