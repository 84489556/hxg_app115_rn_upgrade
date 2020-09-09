/**
 * Created by cuiwenjuan on 2017/7/6.
 */
import React, { PureComponent } from 'react';
import *as baseStyle from '../../components/baseStyle'
import { commonUtil } from '../../utils/CommonUtils'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';


import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity
} from 'react-native';

import RegisterPage from './RegisterPage';

let verifiFirst = true;
class EditView extends PureComponent {
    static defaultProps = {
        heightH: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            text: '',//输入内容
            eyesClose: true,//密码眼睛开关状态
            showEyes: this.props.showEyes,//是否显示密码眼睛开关
            showVerification: this.props.showVerification,//是否显示验证码按钮
            seconds: 60,//验证码倒计时时间
            deleteB: false,//是否显示删除内容按钮
            selected: false,//
            showArrow: this.props.showArrow,//是否显示展开或收起按钮
            disabled: false,
        };
        verifiFirst = true;
        //验证码倒计时
        this._index = 60;
        this._timer = null;
        this.props.getVerifi ? this._verification() : null;

    }

    componentWillUnmount() {
        this._timer && clearInterval(this._timer);
    }

    //密码 眼睛开关按钮
    _onPressButton() {
        this.setState({
            eyesClose: !this.state.eyesClose,
        })
        this.input.blur()
    }

    //获取验证码方法
    _verification() {
        this.setState({disabled : true})

        this.props.getVerification((isValidPhone)=>{
            if (isValidPhone && this.props.isPhone) {
                verifiFirst = false
    
                this._timer = setInterval(() => {
                    this.setState({ seconds: this._index-- });
                    if (this.state.seconds <= 0) {
                        this._timer && clearInterval(this._timer);
                        this._index = 60;
                        // alert("时间到了");
                        this.setState({disabled : false})
                    }
                }, 1000);
            } else {
                setTimeout(()=>{
                    this.setState({disabled : false})
                },0)
            }
        });
    }


    //输入框输入的内容
    _onChange(text) {
        this.setState({ text });
        //返回输入的字符串和字符串的长度

        str = text.replace(/(^\s*)|(\s*$)/g, "");

        this.setState({ deleteB: str.length > 0 ? true : false });
        if (str.length <= 0) {
            this.deletButtonShow = false;
        }

        this.props.onChangeText(str, str.length);
    }

    //有默认值时，显示删除按钮
    _showDeleteButton(defaultValue) {
        if (!defaultValue) {
            return false;
        }
        if (defaultValue === "") {
            return false;
        }
        this.deletButtonShow = true;
        return true;
    }


    //secureTextEntry={this.state.eyesClose&&this.state.showEyes ? true:false}
    // secureTextEntry={this.props.secureTextEntry}

    render() {
        return (
            <View style={[LoginStyles.TextInputView,{height:this.props.heightH?commonUtil.rare(140):commonUtil.rare(114)}]}>
                <View style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center',marginBottom: commonUtil.rare(20),}}>
                    {/*<Image style={LoginStyles.icon}*/}
                    {/*source={this.props.source}/>*/}

                    <TextInput style={LoginStyles.TextInput}
                        // clearButtonMode="while-editing"
                        autoFocus={this.props.autoFocus}
                        maxLength={this.props.maxLength}
                        secureTextEntry={(this.state.eyesClose && this.state.showEyes) ? true : false}
                        placeholder={this.props.name}
                        defaultValue={this._showDeleteButton(this.props.defaultValue) ? this.props.defaultValue : null}
                        keyboardType={this.props.keyboardType || "numeric"}
                        onChangeText={(text) => this._onChange(text)}
                        underlineColorAndroid="transparent"
                        ref={(ref) => this.input = ref}
                        selection={this.props.selection}
                    />

                    {
                        //deletButtonShow显示删除按钮
                        this.state.deleteB || this.deletButtonShow ?
                            <TouchableOpacity
                                onPressIn={() => {
                                    this.setState({ selected: true })
                                }}
                                onPressOut={() => {
                                    this.setState({ selected: false })
                                }}
                                onPress={() => this._onChange('')}>
                                <Image
                                    source={this.state.selected ? require('../../images/login/login_del_new.png') : require('../../images/login/login_del_new.png')}>
                                </Image>
                            </TouchableOpacity> : null
                    }

                    {
                        //显示密码 眼睛开关
                        this.state.showEyes ? <TouchableOpacity onPress={this._onPressButton.bind(this)}>
                            <Image
                                style={{ height: 20, width: 20, marginRight: 5, marginLeft: commonUtil.rare(40) }}
                                source={this.state.eyesClose ? require('../../images/login/login_eyes_close.png') : require('../../images/login/login_eyes.png')}
                            />
                        </TouchableOpacity> : null
                    }

                    {
                        //更多账号 展开或收起按钮
                        this.state.showArrow ? <TouchableOpacity onPress={() => this.props.showHistory()}>
                            <Image
                                style={{ height: 20, width: 20, marginRight: 5, marginLeft: commonUtil.rare(40) }}
                                source={this.props.zhangkai ? require('../../images/login/login_zhankai.png') : require('../../images/login/login_shouqi.png')}
                            />
                        </TouchableOpacity> : null
                    }

                    {
                        //验证码按钮
                        this.state.showVerification ?
                            <TouchableOpacity style={[LoginStyles.verification,{backgroundColor:this.props.isPhone ? baseStyle.BLUE_HIGH_LIGHT: baseStyle.BLACK_d2d2d2 }]}
                                              // disabled={ this.state.seconds <= 0 ? false : true}//禁止按钮交互
                                              disabled={this.props.disabled?this.props.disabled :this.state.disabled}//禁止按钮交互
                                              onPress={this._verification.bind(this)}>
                                <Text style={{ fontSize: 12, color: "#fff"}}>
                                    {verifiFirst ? "获取验证码" : this.state.seconds <= 0 ? "重新获取" : this.state.seconds+'S' }
                                </Text>
                            </TouchableOpacity> : null
                    }
                </View>

            </View>
        );
    }
}

const LoginStyles = StyleSheet.create({
    TextInputView: {
        marginTop: 0,
        height: commonUtil.rare(114),
        // backgroundColor: '#cd92ff',
        borderBottomWidth: 1,
        borderColor: baseStyle.LINE_BG_F1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },

    TextInput: {
        // backgroundColor: '#8dff36',
        flex: 1,
        // height:15,
        fontSize: RATE(30),
        marginLeft: commonUtil.rare(10),
        color: baseStyle.BLACK_100,
        paddingVertical: 0,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },

    icon: {
        // backgroundColor: '#ffffff',
        height: commonUtil.rare(40),
        width: commonUtil.rare(40),
    },
    eyes: {
        // backgroundColor: '#ffffff',
        height: commonUtil.rare(40),
        width: commonUtil.rare(40),
        marginRight: 5,
        marginLeft: 5,
    },
    verification: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        marginRight: 5,
        marginLeft: 5,
        padding:3,
        paddingLeft:15,
        paddingRight:15,
        borderRadius:5



    },
});

export default EditView;