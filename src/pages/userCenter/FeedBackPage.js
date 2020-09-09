/**
 * Created by cuiwenjuan on 2019/9/20.
 */
import React from 'react';
import { Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View ,findNodeHandle} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as cyURL from '../../actions/CYCommonUrl';
import * as UserInfoAction from '../../actions/UserInfoAction';
import * as baseStyle from '../../components/baseStyle';
import PageHeader from '../../components/NavigationTitleView';
import { checkPhone, commonUtil, toast, Utils } from '../../utils/CommonUtils';
import BaseComponent from '../BaseComponentPage';



let width = commonUtil.width;
let height = commonUtil.height;
class FeedBackPage extends BaseComponent {

    constructor(props) {

        super(props);
        this.state = {
            textLength: 0,
           // buttonIndex: 0,
           // showButton: false,
        }
        this.title = '';
        this.content = '';
        this.phone = '';
        this.email = '';
        this.textInput = undefined;
    }

    componentWillMount() {
        super.componentWillMount();

        //键盘监听事件
        // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));

    }

    componentWillUnmount() {
        super.componentWillUnmount();

        //移除键盘监听
        // this.keyboardDidShowListener.remove();
        // this.keyboardDidHideListener.remove();
    }

    // //键盘弹出
    // _keyboardDidShow(e) {
    //
    //     this.setState({ showButton: true })
    // }
    //
    // //键盘收回
    // _keyboardDidHide(e) {
    //     this.setState({ showButton: false })
    // }

    //我的设置
    onBack() {
        Navigation.pop(this.props.navigation);
    }


    _lineView() {
        return (
            <View style={{ width: commonUtil.width, height: 8, backgroundColor: baseStyle.LINE_BG_F1 }} />
        );
    }
    // _scrollToInput (reactNode: any) {
    //     // Add a 'scroll' ref to your ScrollView
    //     this.scroll.props.scrollToFocusedInput(reactNode)
    // }

    render() {

        // let upImage = require('../../images/userCenter/uc_feedback_up_s.png');
        // let downImage = require('../../images/userCenter/uc_feedback_down_s.png');
        // let upDisable = false;
        // let downDisable = false;

        // if (this.state.buttonIndex === 1) {
        //     upDisable = true;
        //     upImage = require('../../images/userCenter/uc_feedback_up.png');
        // } else if (this.state.buttonIndex === 4) {
        //     downDisable = true;
        //     downImage = require('../../images/userCenter/uc_feedback_down.png');
        // }

        return <BaseComponent style={{ flex: 1, backgroundColor: '#fff' }}>
            <PageHeader
                onBack={() => this.onBack()}
                navigation={this.props.navigation} titleText={'意见反馈'} />

            <KeyboardAvoidingView
                behavior="height"
                //keyboardVerticalOffset={Platform.OS==='android'? 0:40}
                // innerRef={ref => {
                //     this.scroll = ref
                // }}
                style={{
                    justifyContent: 'center',
                    flex: 1
                }}>
                <ScrollView>
                    <View style={{ padding: 15 }}>
                        <Text style={{ fontSize: 20, color: baseStyle.BLACK_000000_80 }}>{'标题'}</Text>
                        <TextInput
                            style={{
                                height: 40,
                                // backgroundColor: '#f5f5f5',
                                borderBottomWidth: 1,
                                borderBottomColor: baseStyle.LINE_BG_F1
                            }}
                            keyboardType={'default'}
                            maxLength={20}
                           // ref={(ref) => this.input1 = ref}
                            onChangeText={(text) => {
                                let textL = text.length;
                                this.title = text;
                                if (textL >= 20) {
                                    toast('字数已达上限！');
                                }
                            }}
                            onFocus={(event: Event) => {
                                // this.textInput = this.input1;
                                // this.setState({ buttonIndex: 1 ,showButton:true})
                            }}
                            placeholder='最多20个汉字' />
                    </View>
                    {this._lineView()}
                    <View style={{ padding: 15 }}>
                        <TextInput
                            style={{
                                height: 250,
                                // backgroundColor: '#f5f5f5',
                                textAlignVertical: 'top',
                                fontSize: 15,
                            }}
                            numberOfLines={0}
                            returnKeyType={'send'}
                            maxLength={400}
                            multiline={true}
                            //ref={(ref) => this.input2 = ref}
                            placeholder='请输入您的反馈意见内容'
                            onChangeText={(text) => {
                                //console.log('意见：', text.length, text)
                                this.content = text;
                                let textL = text.length;
                                if (textL <= 400) {
                                    this.setState({ textLength: text.length, });
                                    //showButton:true
                                }
                            }}
                            onFocus={(event: Event) => {
                                // this.textInput = this.input2
                                // this.setState({ buttonIndex: 2 })
                            }} />

                        <View style={{ alignItems: 'flex-end' }}>
                            <Text>{this.state.textLength + '/400'}</Text>
                        </View>
                    </View>
                    {this._lineView()}
                    <View style={{ padding: 15 }}>
                        <TextInput
                            style={{
                                height: 44,
                                // backgroundColor: '#f5f5f5',
                                borderBottomWidth: 1,
                                borderBottomColor: baseStyle.LINE_BG_F1
                            }}
                           // ref={(ref) => this.input3 = ref}
                            maxLength={11}
                            onChangeText={(text) => {
                                this.phone = text;
                            }}
                            onFocus={(event: Event) => {
                                // this.textInput = this.input3
                                // this.setState({ buttonIndex: 3 })
                            }}
                            placeholder='请输入您的联系电话' />

                        <TextInput
                            style={{
                                height: 44,
                                // backgroundColor: '#f5f5f5',
                                borderBottomWidth: 1,
                                borderBottomColor: baseStyle.LINE_BG_F1
                            }}
                            keyboardType={'email-address'}
                            //ref={(ref) => this.input4 = ref}
                            onChangeText={(text) => {
                                this.email = text;
                            }}
                            onFocus={(event: Event) => {
                                // this.textInput = this.input4
                                // this.setState({ buttonIndex: 4 })
                            }}
                            placeholder='请输入您的E-mail' />
                    </View>

                    <View style={{ padding: 15, marginTop: 20 }}>
                        <TouchableOpacity
                            style={{
                                height: 44,
                                borderRadius: 10,
                                backgroundColor: '#f92400',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => this._onSure()}
                        >

                            <Text style={{ fontSize: 16, color: '#fff' }}>{'确定'}</Text>
                        </TouchableOpacity>

                    </View>


                </ScrollView>


            </KeyboardAvoidingView>


        </BaseComponent>

    }
    //Platform.OS === 'ios'
    //{
    //                     this.state.showButton &&
    //                     <View style={{
    //                         backgroundColor: '#f6f6f6',
    //                         width: width,
    //                         height: 40,
    //                         marginBottom:Platform.OS==='android'?0:-40,
    //                         flexDirection: 'row',
    //                         paddingLeft: 15,
    //                         paddingRight: 15,
    //                         alignItems: 'center',
    //                         alignSelf:"stretch"
    //                     }}>
    //                         <TouchableOpacity
    //                             style={{ marginRight: 15 }}
    //                             disabled={upDisable}
    //                             onPress={() => this._onPress(this.state.buttonIndex - 1)}>
    //                             <Image source={upImage} />
    //                         </TouchableOpacity>
    //
    //                         <TouchableOpacity
    //                             disabled={downDisable}
    //                             onPress={() => this._onPress(this.state.buttonIndex + 1)}>
    //                             <Image source={downImage} />
    //                         </TouchableOpacity>
    //                         <View style={{ flex: 1 }} />
    //                         <TouchableOpacity onPress={() => this._onPressFinish()}>
    //                             <Image source={require('../../images/userCenter/uc_feedback_finish.png')} />
    //                         </TouchableOpacity>
    //
    //                     </View>
    //                 }

    _onSure() {
        //提交数据

        const { netConnected } = this.props;
        if (!netConnected.netConnected) {
            toast('网络错误，请检查网络');
            return;
        }

        if (this.title.length <= 0) {
            toast('请填写标题！');
            return;
        }

        if (this.content.length <= 0) {
            toast('请输入反馈内容！');
            return;
        }

        if (this.phone.length <= 0) {
            toast('请输入联系电话！');
            return;
        }

        if (this.email.length <= 0) {
            toast('请输入您的E-mail！');
            return;
        }

        //判断电话格式
        if (!this._checkPhone(this.phone)) {
            toast('联系电话格式不正确');
            return;
        }

        //判断邮箱格式
        if (!this._checkEmail(this.email)) {
            toast('邮箱格式不正确');
            return;
        }

        let param = {
            title: this.title,
            question: this.content,
            tel: this.phone,
            from: this.email
        }

        //提交意见反馈
        Utils.postOne(cyURL.urlFeedBack, param, (response) => {
            if (response.code === 200) {
                response.msg && toast('感谢您的反馈！');
                this.onBack();
            } else {
                response.msg && toast(response.msg);
            }
        }, (error) => {
            toast("提交异常!");
        });

        //提交
        //返回成功 ： toast('感谢您的反馈！'); 同时返回到个人中心页面

    }

    _checkPhone(phone) {
        let reg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}$/;
        if (checkPhone(phone)) {//手机号
            return true;
        }

        if (!reg.test(phone)) {//固话
            return false;
        }

        return true;
    }

    _checkEmail(email) {
        let reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if (!reg.test(email)) {
            return false;
        }
        return true;
    }



    _onPressFinish() {
        this.textInput.blur();
    }


    _onPress(info) {

        if (info === 1) {
            this.textInput = this.input1
        } else if (info === 2) {
            this.textInput = this.input2
        } else if (info === 3) {
            this.textInput = this.input3
        } else if (info === 4) {
            this.textInput = this.input4
        }
        this.input1.blur();
        this.input2.blur();
        this.input3.blur();
        this.input4.blur();
        setTimeout(()=>{
            this.textInput.focus();
        },700);
    }

}


export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    netConnected: state.NetInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(FeedBackPage)