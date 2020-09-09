/**
 * Created by cuiwenjuan on 2019/8/26.
 */
import React, {PureComponent} from "react";
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    NativeModules,
    Platform,
    BackHandler,
    Image
} from "react-native";
import {commonUtil} from "../utils/CommonUtils";
import RATE, {LINE_HEIGHT} from "../utils/fontRate";
import * as  baseStyle from "./baseStyle";
import CallPhone from "../utils/CallPhone";
import UserInfoUtil from '../utils/UserInfoUtil'



var {height, width} = Dimensions.get('window');

/**
 * 使用方法

 <UpdateAlert
 surePress={() => {
                        this.ydAlert.showAlert();
                    }}
 ref={(ref) => this.ydXGAlert = ref}
 navigation = {this.props.navigation}


 方法showAlert(permissions)  传星级

 />
 */

import Modal from 'react-native-translucent-modal'

class UpdateAlert extends PureComponent {
    static defaultProps = {
        title: '发现新版本',
        cancel: '',
        sure: '立即升级',
        message: ''
    };

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            permissions:0,
            cancel: this.props.cancel,
            sure: this.props.sure,
            message: this.props.message,
            version:'1.0.0',
        };
    }

    componentDidMount() {
    }

    /**
     *
     {"code":"10000","
     msg":"success","
     data":{
     "version_no":"1.0",//版本号
     "content":"\u6d4b\u8bd5",//内容
     "catid":"68",//app平台
     "download_url":"http:\/\/cdn.api.zslxt.com\/upload\/20180622\/ed822a21d4d1f9947df602a29ad8851d.apk",//apk地址
     "publisher":"\u5218\u4e16\u96c4"//上传者
     }}
     * @returns {boolean}
     */
    versionNew(){

        // return false;

        let versionMessage = UserInfoUtil.getUserInfoReducer().versionMessage;
        //console.log("================++++++++++++++++++++++++=",versionMessage);
        let newVersion = versionMessage.version_no;
        let versionL = UserInfoUtil.getVersion();

        let content = versionMessage.content && versionMessage.content.replace(/@#/g,'\n');

        this.setState({
            version:newVersion,
            message:content,
        })

        //请求返回的是空信息 没有新的
        if(!newVersion){
            //console.log('newVersion = '+newVersion + 'versionL = '+versionL);
            return true;
        }
        // newVersion = '1.1.0';
        // versionL = '1.0.0'
        //如果有数据，和本地进行比较
        let isNew = versionL >= newVersion;
        //console.log('newVersion = '+newVersion + 'versionL = '+versionL +'isNew = '+isNew);
        return isNew;
    }

    //立即升级
    _surePress() {
        this.setState({modalVisible: false});

        let apkURL =  UserInfoUtil.getUserInfoReducer().versionMessage.download_url;
        if (Platform.OS === 'ios') {
            CallPhone.checkVersionUpdata();
        }else {
            //只有Android才显示蒙层，强制更新，下载apk过程不能操作
            this.props.surePress && this.props.surePress()
            //Android强制更新，暂时注释
            NativeModules.upgrade.upgrade(apkURL);
             // NativeModules.upgrade.upgrade('http://cdn.api.zslxt.com/upload/20190823/91368c27cd9241d3bcbe1cc4b697bdcb.apk');
        }

    }

    //信息提示框
    _noTeQuanView(){
        return(
            <View style={Styles.viewStyle}>
                <ImageBackground style={Styles.alertView}
                                 source={require('../images/userCenter/uc_update_bg.png')}>
                    <Text style={{
                        fontSize:RATE(38),
                        fontWeight:'bold',
                        marginTop:commonUtil.rare(72),
                        color:baseStyle.WHITE,
                        marginLeft:commonUtil.rare(61)
                    }}>
                        {this.props.title}
                    </Text><Text style={{
                    fontSize:RATE(34),
                    fontWeight:'bold',
                    marginTop:commonUtil.rare(20),
                    color:baseStyle.WHITE,
                    marginLeft:commonUtil.rare(61)
                }}>
                    {'V' + this.state.version}
                </Text>
                    <View style={{ marginLeft:commonUtil.rare(77),
                        marginRight:commonUtil.rare(77),
                        marginBottom:commonUtil.rare(67),
                        marginTop:commonUtil.rare(151),
                        flex:1,
                    }}>
                        <ScrollView style={{

                            // backgroundColor:'#ffa9d9',

                            // alignItems:'center',
                            // justifyContent:'center',
                        }}>
                            <Text
                                style={{
                                    fontSize:RATE(30),
                                    lineHeight:LINE_HEIGHT(30),
                                    color:baseStyle.BLACK_333333,
                                }}
                                numberOfLines={0}>{this.state.message}</Text>

                        </ScrollView>
                    </View>

                    <View style={{
                        marginBottom:commonUtil.rare(46),
                        marginLeft:commonUtil.rare(30),
                        marginRight:commonUtil.rare(30),
                        flexDirection:'row',
                        // backgroundColor:'#cbffd5',
                        alignItems:'center',
                        justifyContent:'center'

                    }}>
                        <TouchableOpacity
                            style={[Styles.buttonStyle,{backgroundColor:baseStyle.BLUE_HIGH_LIGHT}]}
                            onPress={() => this._surePress()}>
                            <Text style={{color:'#fff'}}>{this.state.sure}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={{
                            position:'absolute',
                            top:commonUtil.rare(72),
                            right:commonUtil.rare(20),}}
                        onPress={() => this.hiddenAlert()}>
                        <Image
                               source={require('../images/userCenter/uc_updata_close.png')}
                        />
                    </TouchableOpacity>
                </ImageBackground>
            </View>
        )
    }

    searchStockAlert() {
        return (
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                }}
            >
                { this._noTeQuanView()}
            </Modal>
        )
    }


    render() {
        return (
            this.searchStockAlert()
        );
    };

    showAlert() {
        if(!this.versionNew()){
            this.setState({modalVisible: true});
        }
    }

    hiddenAlert() {

        if (Platform.OS === 'ios') {
            CallPhone.closeApp();
        }else {
            BackHandler.exitApp();
        }
        this.setState({modalVisible: false});
    }

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
        // backgroundColor:'#fff',
        width:commonUtil.rare(540),
        height:commonUtil.rare(642),
        borderRadius:commonUtil.rare(20),
        // alignItems:'center',
    },
    buttonStyle: {
        width: commonUtil.rare(440),
        height: commonUtil.rare(68),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: commonUtil.rare(44)
        // backgroundColor:'#8dff36'
    },

});

export default UpdateAlert;