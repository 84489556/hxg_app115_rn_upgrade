/**
 * Created by cuiwenjuan on 2017/11/9.
 */
import React, {PureComponent} from "react";
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {commonUtil} from "../../utils/CommonUtils";
import RATE, {LINE_HEIGHT} from "../../utils/fontRate";
import * as  baseStyle from '../../components/baseStyle.js';
import Modal from 'react-native-translucent-modal';

var {height, width} = Dimensions.get('window');

/**
 * 使用方法

 <YDXGAlert
 surePress={() => {
                        this.ydAlert.showAlert();
                    }}
 ref={(ref) => this.ydXGAlert = ref}
 navigation = {this.props.navigation}


 方法showAlert(permissions)  传星级

 />
 */



class YDXGAlert extends PureComponent {
    static defaultProps = {
        title: '提示',
        cancel: '了解五星专享服务',
        sure: '立即升级',
        message: '抱歉，您暂无权限查看此内容\n开通五星账号即可查看'
    };

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            permissions:0,
            cancel: this.props.cancel,
            sure: this.props.sure,
            message: this.props.message
        };
    }

    componentDidMount() {
    }

    //立即升级
    _surePress() {
        this.hiddenAlert();
        this.props.surePress && this.props.surePress()
    }

    //了解五星专享服务
    _cancelPress() {
        this.hiddenAlert();
        Navigation.pushForParams(this.props.navigation,'ProductIntro')
    }

    //我的特权提示框
    _noTeQuanView(){
        return(
            <View style={Styles.viewStyle}>
                <View style={Styles.alertView}>
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: commonUtil.rare(10),
                            right: commonUtil.rare(10),
                        }}
                        onPress={() => {
                            this.setState({
                                modalVisible: false,
                            })
                        }}>
                        <Image source={require('../../images/personStock/personS_alert_close.png')}/>
                    </TouchableOpacity>

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
                            numberOfLines={0}>{this.state.message}</Text>
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
                            <Text style={{color:'#006ACC',  textDecorationLine: 'underline',}}>{this.state.cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[Styles.buttonStyle,{backgroundColor:baseStyle.BLUE_HIGH_LIGHT}]}
                            onPress={() => this._surePress()}>
                            <Text style={{color:'#fff'}}>{this.state.sure}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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

    showAlert(permissions) {
        let permissThree = '抱歉，您暂无权限查看此内容\n开通三星账号即可查看';
        let permissFour = '抱歉，您暂无权限查看此内容\n开通四星账号即可查看';
        let permissFive = '抱歉，您暂无权限查看此内容\n开通五星账号即可查看';

        let cancelThree = '了解三星专享服务';
        let cancelFour = '了解四星专享服务';
        let cancelFive = '了解五星专享服务';

        let message ;
        let cannel;
        if(permissions === 3){
            message = permissThree;
            cannel = cancelThree;
        }else if(permissions === 4 ){
            message = permissFour;
            cannel = cancelFour;
        }else if(permissions === 5) {
            message = permissFive;
            cannel = cancelFive;
        }

        this.setState({modalVisible: true,cancel:cannel,message:message});
    }

    hiddenAlert() {
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
        backgroundColor:'#fff',
        width:commonUtil.rare(600),
        height:commonUtil.rare(380),
        borderRadius:commonUtil.rare(20),
        alignItems:'center',
    },
    buttonStyle: {
        width: commonUtil.rare(250),
        height: commonUtil.rare(88),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: commonUtil.rare(44)
        // backgroundColor:'#8dff36'
    },

});

export default YDXGAlert;