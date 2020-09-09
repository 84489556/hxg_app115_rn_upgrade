/**
 * Created by cuiwenjuan on 2019/8/23.
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    DeviceEventEmitter,
} from 'react-native';

import EditView from '../login/EditView'
import PageHeader from '../../components/NavigationTitleView'
import {toast} from '../../utils/CommonUtils'
import  YDActivityIndicator from '../../components/YDActivityIndicator'
import {commonUtil} from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import LoginButton from '../login/LoginButton'
import  BaseComponentPage from '../BaseComponentPage'


class ChangeUserName extends BaseComponentPage{

    constructor(props) {
        super(props);
        this.state = {
            isPhone:false,
            animating:false,
            isBack:false,
            isRefre:false,
            maxLength:12,
        };
    }

    componentWillMount() {
        this.pageName = '设置用户名';
    }

    componentWillUnmount() {
    }

    _checkNickName(nickName){

        let reg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;

        if (!reg.test(nickName)) {
            // toast('密码由英文字母、数字、字符组成');
            return false;
        }
        return true;
    }

    changeUsername(){
        const { netConnected, stateUserInfo } = this.props;
        if (!netConnected.netConnected) {
            toast('网络错误，请检查网络');
            return;
        }


        if(!this.username || this.username === "" ) {

            toast('用户名不能为空');
            return;
        }

        if (this._textLength(this.username) > 6) {
            toast('昵称不超过6个汉字');
            return;
        }
        // if (this._textLength(this.username) > 12) {
        //     toast('昵称长度不符合要求');
        //     return;
        // }
        if(!this._checkNickName(this.username)){
            toast('昵称格式限制为中文字母和数字');
            return;
        }

        const {changeUserInfo} = this.props.userInfo;
        let param = {'nickname':this.username,'username':stateUserInfo.userInfo.username};

        this.setState({animating:true});
        changeUserInfo(param,
            (success) => {
                this.setState({animating:false});
                toast('用户名修改成功',()=> {!this.state.isBack? Navigation.pop(this.props.navigation):null});
            },
            (error) => {
                this.setState({animating:false});
                toast('用户名修改失败');

            });

    }

    _textLength(text) {
        let reg = /[\u4e00-\u9fa5]/g;
        let chainString = text.match(reg);
        let length = text.length + (chainString && chainString.length);
        return length;
    }

    changeTextPa(text,lengthText){
        //判断中文，一个中文两个字符 处理
        let reg = /[\u4e00-\u9fa5]/g;
        let chainString = text.match(reg);

        let textString = text;
        let lengthS = 0;
        let maxLength = 12;
        if (chainString) {
            if (6 > chainString.length > 0) {
                lengthS = lengthText + chainString.length;
                if (lengthS >= 12) {
                    textString = text.substring(0, lengthText)
                    maxLength = lengthText - chainString.length;
                }
            } else if (chainString.length >= 6) {
                lengthS = lengthText + chainString.length;
                if (lengthS >= 12) {
                    textString = text.substring(0, 6)
                    maxLength = 6;
                }
            }
        }


        this.username = textString;
        this.setState({
            isPhone: lengthText >= 1 ? true : false,
            maxLength: maxLength,
            isRefre: !this.state.isRefre
        });
    }


    render() {
        return <BaseComponentPage style={{flex: 1, backgroundColor: '#ffffff',}}>
            <PageHeader
                onBack={() => {
                    this.setState({isBack:true});
                    Navigation.pop(this.props.navigation);
                }}
                navigation={this.props.navigation} titleText={'修改用户名'}/>

            <View style={{marginLeft:commonUtil.rare(30), marginRight:commonUtil.rare(30)}}>

                <EditView name='用户名'
                          keyboardType = {'default'}
                          maxLength={this.state.maxLength}
                          onChangeText={(text,lengthText) => this.changeTextPa(text,lengthText)}
                          defaultValue = {this.username} />

                {/*<Text*/}
                    {/*style={{marginTop:commonUtil.rare(30),fontSize:RATE(24), color:baseStyle.BLACK_50}}*/}
                    {/*numberOfLines={2}>*/}
                    {/*用户名只能修改一次（4-12个字符，一个汉字为2个字符）*/}
                {/*</Text>*/}

                <LoginButton onPress={this.changeUsername.bind(this)}
                             disabled={this.state.isPhone ? false:true}
                             isPhone = {this.state.isPhone} titleButton = {'保存'}/>

            </View>

            <YDActivityIndicator animating={this.state.animating}/>
        </BaseComponentPage>

    }

}



import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
        netConnected: state.NetInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(ChangeUserName)