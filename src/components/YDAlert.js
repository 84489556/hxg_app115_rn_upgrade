/**
 * Created by cuiwenjuan on 2017/10/27.
 */
import React, { PureComponent } from 'react';
import {
    ToolbarAndroid,
    AppRegistry,
    StyleSheet,
    Text,
    Dimensions,
    View,
    Image,
    TouchableOpacity,
} from 'react-native';
import {commonUtil, toTouGu, getHeaderImageN} from '../utils/CommonUtils'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../utils/fontRate'
import * as  baseStyle from './baseStyle'
import CallPhone from '../utils/CallPhone';
import  Modal  from 'react-native-translucent-modal';


/**
 *
 * 直接调用

 1.
 <YDAlert
 ref={(ref) => this.ydAlert = ref}/>

 2.
 <YDAlert
 ref={(ref) => this.ydAlert = ref}
 surePress={(callBack) => {
                        callBack('0311-86909389');
                    }}
 title={'提示'}
 message={'将拨打贵宾升级电话\n0311-86909389'}
 sure={'呼叫'}/>

 * 显示方法
 * this.ydAlert.showAlert();
 *
 */

let toushuP = '0311-87100515';
let kefuP = '0311-87220499';
let shenjiP = '0311-86909389';
let xufeiP = ''

var {height, width} = Dimensions.get('window');
class YDAlert extends PureComponent {
    static defaultProps = {
        title:'提示',
        message:'将拨打贵宾升级电话\n'+shenjiP,
        cancel:'取消',
        sure:'确定',
        showMenu:false
    };
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            isShow:false,
            showMenu:this.props.showMenu,
        };
    }



    //menu菜单打电话
    _menuView(){
        return(
            <View style={[Styles.viewStyle,{justifyContent: 'flex-end'}]}>
                <View style={{backgroundColor:'#fff',}}>
                    <View style={{height:commonUtil.rare(88),width:commonUtil.width, alignItems:'center',justifyContent:'center'}}>
                        <Text>提示</Text>
                    </View>
                    <TouchableOpacity
                        style={Styles.menuButtonStyle}
                        onPress={() => this._callPhone(kefuP)}>
                        <Text style={{color:baseStyle.BLACK_666666,}}>{'客服电话：'+kefuP}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={Styles.menuButtonStyle}
                        onPress={() => this._callPhone(toushuP)}>
                        <Text style={{color:baseStyle.BLACK_666666,}}>{'投诉电话：'+toushuP}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={Styles.menuButtonStyle}
                        onPress={() => this._cancelPress()}>
                        <Text style={{color:baseStyle.BLACK_666666,}}>{this.props.cancel}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //alert打电话
    _alertPhone(){
        return(
            <View style={Styles.viewStyle}>
                <View style={Styles.alertView}>
                    <Text style={{
                        fontSize:RATE(34),
                        fontWeight:'bold',
                        marginTop:commonUtil.rare(60),
                        color:baseStyle.BLACK_333333,
                    }}>
                        {this.props.title}
                    </Text>

                    <View style={{
                        marginLeft:commonUtil.rare(30),
                        marginRight:commonUtil.rare(30),
                        marginBottom:commonUtil.rare(20),
                        // backgroundColor:'#ffa9d9',
                        flex:1,
                        alignItems:'center',
                        justifyContent:'center',
                    }}>
                        <Text
                            style={{
                                fontSize:RATE(34),
                                lineHeight:LINE_HEIGHT(34),
                                color:baseStyle.BLACK_666666,
                            }}
                            numberOfLines={0}>{this.props.message}</Text>
                    </View>

                    <View style={{
                        marginBottom:commonUtil.rare(30),
                        marginLeft:commonUtil.rare(30),
                        marginRight:commonUtil.rare(30),
                        flexDirection:'row',
                        // backgroundColor:'#cbffd5',
                        alignItems:'center',
                        justifyContent:'center'

                    }}>
                        <TouchableOpacity
                            style={[Styles.buttonStyle,{marginRight:20,}]}
                            onPress={() => this._cancelPress()}>
                            <Text style={{color:baseStyle.BLACK_666666,}}>{this.props.cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[Styles.buttonStyle,{backgroundColor:baseStyle.BLUE_HIGH_LIGHT}]}
                            onPress={() => this._surePress()}>
                            <Text style={{color:'#fff'}}>{this.props.sure}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        if (!this.state.isShow){
            return null;
        }
        return (
        <Modal
            animationType={ this.state.showMenu ? "slide":"fade"}
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
            }}
        >
            {
                this.state.showMenu ? this._menuView() : this._alertPhone()
            }

        </Modal>
        );
    };

    //menu 电话
    _callPhone(phone){
        this._hiddenAlert();
        CallPhone.callPhone(phone);
    }

    //取消
    _cancelPress(){
        this._hiddenAlert();
    }

    //alert sure按钮
    _surePress(){
        this._hiddenAlert();
        if(this.props.surePress){
            this.props.surePress((info) => {
                CallPhone.callPhone(info);
            });
        } else {
            CallPhone.callPhone(shenjiP);
        }
    }
    _hiddenAlert() {
        this.setState({isShow:false});
    };
    showAlert() {
        this.setState({isShow:true});
    };

}
const Styles = StyleSheet.create({

    viewStyle: {
        backgroundColor:'rgba(0,0,0,0.7)',
        position:'absolute',
        bottom:0,
        top:0,
        left:0,
        right:0,
        alignItems:'center',
        justifyContent:'center'
    },
    alertView:{
        backgroundColor:'#fff',
        width:commonUtil.rare(600),
        height:commonUtil.rare(380),
        borderRadius:commonUtil.rare(20),
        alignItems:'center',
    },
    buttonStyle:{
        width:commonUtil.rare(250),
        height:commonUtil.rare(88),
        alignItems:'center',
        justifyContent:'center',
        borderWidth:0.5,
        borderColor:baseStyle.BLACK_d4d4d4,
        borderRadius:commonUtil.rare(44)
        // backgroundColor:'#8dff36'
    },
    menuButtonStyle:{
        height:commonUtil.rare(88),
        width:commonUtil.width,
        alignItems:'center',
        justifyContent:'center',
        borderTopWidth:1,
        borderTopColor:baseStyle.LIGHTEN_GRAY,
    }
});

export default YDAlert;