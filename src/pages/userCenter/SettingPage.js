/**
 * Created by cuiwenjuan on 2019/8/2.
 */
import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    DeviceEventEmitter,
    StyleSheet,
    Platform,
    BackAndroid
} from 'react-native';

import PageHeader from '../../components/NavigationTitleView'
import SettingItem from './SettingItem'

import {commonUtil, toast} from '../../utils/CommonUtils'
import UserInfoUtil, * as type from '../../utils/UserInfoUtil'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import * as  baseStyle from '../../components/baseStyle'
import BaseComponent from '../BaseComponentPage'
import TranslucentModal from 'react-native-translucent-modal';


let headerS = '头像';
let nameS = '昵称';
let password = '密码管理';
let bindWX = '微信绑定';


var settingA = [
    {'title':headerS,'isBlank':false,'icon':require('../../images/userCenter/uc_info_avatar.png')},
    {'title':nameS,'isBlank':true,'icon':require('../../images/userCenter/uc_info_nickname.png')},
    {'title':password,'isBlank':true,'icon':require('../../images/userCenter/uc_info_changeP.png')},
    {'title':bindWX,'isBlank':true,'icon':require('../../images/userCenter/uc_info_wx.png')},
];


class SettingPage extends BaseComponent {

    constructor(props) {

        super(props);
        this.state = {
            showAlert:false,
            nickname:'',
            isShowCancelAccount:false
        }
    }

    showCancelAccountDialog(isShow) {
        this.setState({
            isShowCancelAccount:isShow
        })
    }

    //我的设置
    onBack() {
        Navigation.pop(this.props.navigation);
    }

    selected(index) {
        const {stateUserInfo} = this.props;
        let username = stateUserInfo.userInfo.nickname ?stateUserInfo.userInfo.nickname:stateUserInfo.userInfo.username;
        let wxUnionid = stateUserInfo.userInfo.wxUnionid;

        // toast(index);
        switch (index) {
            case headerS:
                Navigation.pushForParams(this.props.navigation,'ChangeHeaderPage');

                return;
            case nameS:
                Navigation.pushForParams(this.props.navigation,'ChangeUserName');
                return;

            case password:
                Navigation.pushForParams(this.props.navigation,'ChangePassword');
                return;

            case bindWX:
                if(!wxUnionid){
                    toast('请选择微信登录并进行绑定')
                }

                return;

            default:
                return;

        }
    }

    render() {

        const {stateUserInfo} = this.props;
        let username = stateUserInfo.userInfo.nickname ?stateUserInfo.userInfo.nickname:stateUserInfo.userInfo.username;
        let wx_nickname = stateUserInfo.userInfo.wx_nickname ? stateUserInfo.userInfo.wx_nickname : '';
        let wxUnionid = stateUserInfo.userInfo.wxUnionid;
        // let wx_nickname = '时间的路人c时间的路人c时间的路人c时间的路人c时间的路人c';

        let nickname = UserInfoUtil.getNickName();
        let headerName = UserInfoUtil.getUserHeader();
        let hasH = true;
        let nameString = (title) => {
            switch (title) {
                case nameS:
                    return nickname;

                case bindWX:
                    let wxNickname = wxUnionid ? (wx_nickname.length > 16 ? wx_nickname.substr(0, 16) + "..." : wx_nickname) : "未绑定";
                    return wxNickname;

                default:
                    return null;
            }
        }

        let disabled = (title) =>{
            if(wxUnionid && title === bindWX){
               return true;
            }
            return false;
        }


        return <BaseComponent style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{flex: 1, backgroundColor: commonUtil.black_F6F6F6}}>
            <PageHeader
                onBack={() => this.onBack()}
                navigation={this.props.navigation} titleText={'基本资料'}/>
            <View style={{marginTop: commonUtil.rare(20)}}>
                {
                    settingA.map((info, index) => (
                        <SettingItem text={info.title}
                                     imageIcon={info.icon}
                                     key={index}
                                     hasHeader={info.title === headerS ? hasH : false}
                                     headerName={info.title === headerS && hasH ? headerName : ''}
                                     name={nameString(info.title)}
                                     onPress={() => this.selected(info.title)}
                                     isBlank={info.isBlank}
                                     disabled={disabled(info.title)}>

                        </SettingItem>
                    ))
                }
            </View>
        </View>
        <View style={{bottom:30, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => this.showCancelAccountDialog(true) } activeOpacity={1}>
                <Text>申请注销账号</Text>
            </TouchableOpacity>
        </View>
        <TranslucentModal animationType={'none'} transparent={true} visible={this.state.isShowCancelAccount} onRequestClose={() =>  this.showCancelAccountDialog(false) }>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ffffff', marginLeft: 38, marginRight: 38, padding: 15, paddingBottom: 0, alignItems: 'center', borderRadius: 10 }}>
                    <Text style={{ color: '#262628', fontSize: 18, marginTop: 15, lineHeight: 18 * 1.4, textAlign: 'center' }}>注销账户后您所有个人信息将被删除，您账号当前权益将不再享受，若您确认注销账户请联系客服电话0311-87100588</Text>
                    <View style={{ marginTop: 15, width: baseStyle.width - 38 * 2, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
                    <TouchableOpacity style={{ height: 45, width: baseStyle.width - 38 * 2, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this.showCancelAccountDialog(false)}>
                        <Text style={{ color: '#FF0000', fontSize: 17 }}>关闭</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TranslucentModal>
        </BaseComponent>

    }

}

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(SettingPage)