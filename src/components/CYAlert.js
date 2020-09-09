
import React, { PureComponent } from 'react';
import {
    StyleSheet,
    Text,
    Dimensions,
    View,
    Image,
    TouchableOpacity,
    ScrollView,Platform
} from 'react-native';
import { commonUtil, toTouGu, } from '../utils/CommonUtils'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../utils/fontRate'
import * as  baseStyle from './baseStyle'
import CallPhone from '../utils/CallPhone';
import Modal from 'react-native-translucent-modal';

/**
 *
 * 直接调用

 1.
 <CYAlert
 ref={(ref) => this.cyAlert = ref}/>

 2.属性
 type 0 1 2 3 4 两个按钮 5一个按钮
 0 标题+电话 （同时需要属性 title  phone）
 1 内容提示  （需要属性 message）
 2 标题+内容  （同时需要属性 title  message）
 3 标题+内容+电话（点击拨号）（同时需要属性 title  message  phone）
 4 标题+长内容（同时需要属性 title  message）
 5 内容+按钮 （需要属性 message）  sure 确定按钮显示文字 surePress 确定按钮的点击方法,默认隐藏弹窗

 sure 确定按钮显示文字
 cancel 取消按钮显示文字
 surePress 确定按钮的点击方法,默认呼叫电话

 * 显示方法
 * this.ydAlert.showAlert();
 * 隐藏方法
 * this.ydAlert._hiddenAlert();
 */

let toushuP = '0311-87100515';
let kefuP = '0311-87220499';
let shenjiP = '0311-86909389';
let xufeiP = ''

var { height, width } = Dimensions.get('window');
export default class CYAlert extends PureComponent {
    static defaultProps = {
        title: '',
        message: '',
        phone: shenjiP,
        cancel: '取消',
        sure: '呼叫',
        type: 0,
    };
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            isShow: false,
            showMenu: this.props.showMenu,
        };
    }

    clickPhone() {
        let phone = this.props.phone;
        return (

            <View>
                <Text
                    style={{
                        fontSize: RATE(28),
                        lineHeight: LINE_HEIGHT(28),
                        color: baseStyle.BLACK_666666,
                    }}
                    numberOfLines={0}>{this.props.message}
                    <Text
                        style={{
                            fontSize: RATE(28),
                            lineHeight: LINE_HEIGHT(28),
                            color: '#1576D0',
                        }}
                        numberOfLines={0}
                        onPress={() => { this._callPhone(phone) }}
                    >
                        {phone}
                    </Text>
                </Text>
            </View>

        );
    }



    //其他弹窗
    _menuView() {
        let height;
        switch (this.props.type) {
            case 0:
            case 1:
                height = 260;
                break;
            case 2:
                height = 340;
                break;
            case 3:
                height = 370;
                break;
            case 4:
                height = 470;
                break;

        }
        return (
            <View style={Styles.viewStyle}>
                <View style={{
                    backgroundColor: '#fff',
                    width: commonUtil.rare(600),
                    height: commonUtil.rare(height),
                    borderRadius: commonUtil.rare(20),
                    alignItems: 'center',
                }}>
                    <Text style={{
                        fontSize: RATE(30),
                        fontWeight: 'bold',
                        marginTop: commonUtil.rare(30),
                        color: baseStyle.WU_DANG_TEXT_COLOR,
                    }}>
                        {this.props.title}
                    </Text>
                    <View style={{
                        marginTop: commonUtil.rare(44),
                        width: commonUtil.rare(600),
                        height: 1,
                        backgroundColor: '#F1F1F1'
                    }} />
                    <View style={{
                        marginLeft: commonUtil.rare(30),
                        marginRight: commonUtil.rare(30),
                        marginTop: commonUtil.rare(30),
                        marginBottom: commonUtil.rare(40),
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',

                    }}>
                        {
                            this.props.type === 3 ? this.clickPhone() : (
                                this.props.type === 2 ?
                                    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                                    <Text
                                        style={{
                                            fontSize: RATE(28),
                                            //lineHeight: LINE_HEIGHT(28),
                                            color: baseStyle.BLACK_666666,
                                        }}
                                        //numberOfLines={0}
                                    >{this.props.message}
                                    </Text>
                                    </View>
                                    :
                                    <ScrollView style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text
                                            style={{
                                                fontSize: RATE(28),
                                                lineHeight: LINE_HEIGHT(28),
                                                color: baseStyle.BLACK_666666,
                                            }}
                                            numberOfLines={0}>{this.props.message}
                                        </Text>
                                    </ScrollView>
                            )

                        }
                    </View>

                    <View style={{
                        width: commonUtil.rare(600),
                        height: commonUtil.rare(90),
                        flexDirection: 'column',
                        // backgroundColor:'#cbffd5',
                        alignItems: 'center',
                        justifyContent: 'center'

                    }}>
                        <View style={{ width: commonUtil.rare(600), height: 1, backgroundColor: '#F1F1F1' }} />
                        <View style={{ flexDirection: 'row', flex: 1, height: commonUtil.rare(88), width: commonUtil.rare(600), }}>

                            <TouchableOpacity
                                style={Styles.buttonStyle}
                                onPress={() => this._cancelPress()}>
                                <Text style={{ color: '#006ACC', }}>{this.props.cancel}</Text>
                            </TouchableOpacity>
                            <View style={{ width: 1, height: commonUtil.rare(88), backgroundColor: '#F1F1F1' }} />
                            <TouchableOpacity
                                style={Styles.buttonStyle}
                                onPress={() => this._surePress()}>
                                <Text style={{ color: '#FF0000' }}>{this.props.sure}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        )
    }
    //alert打电话
    _alertPhone() {
        return (
            <View style={Styles.viewStyle}>
                <View style={Styles.alertView}>
                    <Text style={{
                        fontSize: RATE(30),
                        fontWeight: 'bold',
                        marginTop: commonUtil.rare(30),
                        color: baseStyle.BLACK_666666,
                    }}>
                        {this.props.title}
                    </Text>

                    <View style={{
                        marginLeft: commonUtil.rare(30),
                        marginRight: commonUtil.rare(30),
                        marginTop: commonUtil.rare(30),
                        marginBottom: commonUtil.rare(40),
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text
                            style={{
                                fontSize: RATE(36),
                                lineHeight: LINE_HEIGHT(36),
                                color: baseStyle.WU_DANG_TEXT_COLOR,
                            }}
                            numberOfLines={0}>
                            {this.props.type === 0 ? this.props.phone : this.props.message}

                        </Text>
                    </View>

                    <View style={{
                        width: commonUtil.rare(600),
                        height: commonUtil.rare(90),
                        flexDirection: 'column',
                        // backgroundColor:'#cbffd5',
                        alignItems: 'center',
                        justifyContent: 'center'

                    }}>
                        <View style={{ width: commonUtil.rare(600), height: 1, backgroundColor: '#F1F1F1' }} />
                        <View style={{ flexDirection: 'row', flex: 1, height: commonUtil.rare(88), width: commonUtil.rare(600), }}>

                            <TouchableOpacity
                                style={Styles.buttonStyle}
                                onPress={() => this._cancelPress()}>
                                <Text style={{ color: '#006ACC', }}>{this.props.cancel}</Text>
                            </TouchableOpacity>
                            <View style={{ width: 1, height: commonUtil.rare(88), backgroundColor: '#F1F1F1' }} />
                            <TouchableOpacity
                                style={Styles.buttonStyle}
                                onPress={() => { this._surePress() }}>
                                <Text style={{ color: '#FF0000' }}>{this.props.sure}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        )
    }

    _oneButton() {
        return (
            <View style={Styles.viewStyle}>
                <View style={{
                    backgroundColor: '#fff',
                    width: commonUtil.rare(600),
                    height: commonUtil.rare(260),
                    borderRadius: commonUtil.rare(20),
                    alignItems: 'center',
                }}>
                    <View style={{
                        marginLeft: commonUtil.rare(30),
                        marginRight: commonUtil.rare(30),
                        marginTop: commonUtil.rare(70),
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {this.props.title && <Text style={{
                            fontSize: RATE(30),
                            color: '#666666',
                            marginBottom: commonUtil.rare(30)
                        }}>
                            {this.props.title}
                        </Text>}
                        <Text style={{
                            fontSize: RATE(36),
                            color: '#262628'
                        }}>
                            {this.props.message}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => { this._sureOneButton() }}
                    >
                        <View style={{
                            height: commonUtil.rare(90),
                            width: commonUtil.rare(600),
                            flexDirection: 'column',
                            marginTop: commonUtil.rare(70),
                            alignItems: 'center'
                        }}>
                            <View style={{
                                height: 1, width: commonUtil.rare(600),
                                backgroundColor: '#F1F1F1'
                            }} />
                            <Text style={{
                                fontSize: RATE(34),
                                color: '#FF0000',
                                marginTop: commonUtil.rare(26),
                            }}>
                                {this.props.sure}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    _checkUpdataView(){

        let message = this.props.message;
        let version = message.version;
        let content = message.content;


        return (
            <View style={Styles.viewStyle}>

                <View style={{
                    // backgroundColor: '#fff',
                    height: 331,
                    borderRadius: commonUtil.rare(20),
                    overflow:'hidden'
                }}>
                    <Image source={require('../images/userCenter/uc_check_updata.png')}/>
                    <View style={{flex:1,backgroundColor: '#fff',marginTop:-1}}>
                        <Text style={{textAlign:'center',fontSize:15,color:baseStyle.BLACK_100,marginTop:10}}>{'发现新版本'}</Text>
                        <Text style={{textAlign:'center',fontSize:15,color:baseStyle.BLACK_000000_80,marginTop:8}}>{'V'+version}</Text>

                        <ScrollView style={{flex:1,marginTop:10,marginRight:15,marginLeft:15}}>
                            <Text
                                style={{
                                    fontSize:RATE(30),
                                    lineHeight:LINE_HEIGHT(30),
                                    color:baseStyle.BLACK_333333,
                                }}
                                numberOfLines={0}>{content}</Text>

                        </ScrollView>

                        <View style={{ flexDirection: 'row', height: commonUtil.rare(70) }}>

                            <TouchableOpacity
                                style={[Styles.buttonStyle,{backgroundColor:'#cccccc'}]}
                                onPress={() => this._cancelPress()}>
                                <Text style={{ color: baseStyle.BLACK_666666 }}>{this.props.cancel}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.buttonStyle,{backgroundColor:'#F92400'}]}
                                onPress={() => { this._surePress() }}>
                                <Text style={{ color: '#ffffff' }}>{'更新'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </View>
        );
    }


    slectAlert() {
        if (this.props.type === 0) {
            return this._alertPhone()
        }
        else if (this.props.type === 1) {
            return this._alertPhone()
        }
        else if (this.props.type === 2) {
            return this._menuView()
        }
        else if (this.props.type === 3) {
            return this._menuView()
        }
        else if (this.props.type === 4) {
            return this._checkUpdataView()
        }
        else if (this.props.type === 5) {
            return this._oneButton()
        }
    }

    render() {
        if (!this.state.isShow) {
            return null;
        }

        return (
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                }}
            >
                {
                    this.slectAlert()
                    // this.state.showMenu ? this._menuView() : this._alertPhone()

                }

            </Modal>
        );
    };

    //menu 电话
    _callPhone(phone) {
        this._hiddenAlert();
        CallPhone.callPhone(phone);
    }

    //取消
    _cancelPress() {
        this._hiddenAlert();
        this.props.cancelPress ? this.props.cancelPress() : null
    }

    // sure按钮
    _surePress() {
        this._hiddenAlert();
        this.props.surePress ? this.props.surePress() : CallPhone.callPhone(this.props.phone);

    }
    _sureOneButton() {
        this._hiddenAlert();
        this.props.surePress ? this.props.surePress() : null
    }
    _hiddenAlert() {
        this.setState({ isShow: false });
    };
    showAlert() {
        this.setState({ isShow: true });
    };

}
const Styles = StyleSheet.create({

    viewStyle: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    alertView: {
        backgroundColor: '#fff',
        width: commonUtil.rare(600),
        height: commonUtil.rare(260),
        borderRadius: commonUtil.rare(20),
        alignItems: 'center',
    },
    buttonStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButtonStyle: {
        height: commonUtil.rare(88),
        width: commonUtil.width,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: baseStyle.LIGHTEN_GRAY,
    }
});
