/*
 * 指标设置对话框
 */

import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Modal
} from 'react-native';
//import RootSiblings from 'react-native-root-siblings';

import * as baseStyle from '../components/baseStyle';
import { Button, Badge, Label } from 'teaset';
import ShareSetting from '../modules/ShareSetting';
import RATE from '../utils/fontRate.js';
import { PopupPromptView } from './Course/IndexStudyCoursePage';
import UserInfoUtil, * as type from '../utils/UserInfoUtil'
import BaseComponentPage from './BaseComponentPage';
import * as ScreenUtil from '../utils/ScreenUtil';
import { sensorsDataClickObject } from '../components/SensorsDataTool';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const X_HEIGHT = 812;
const X_WIDTH = 375;



export default class ChoseChartNorm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isChecked: false,
        };

        Object.assign(this.state, {
            mainIndex: 0,
            deputyIndex: 0,
            deputyIndex1: 1
        });

        this.mainArray = ShareSetting.getMainFormulas();
        this.depArray = ShareSetting.getAssistFormulas();
        this.specialArray = ShareSetting.getSpecialFormulas();
        this.refreshDialog = this.refreshDialog.bind(this)
    }

    componentDidMount() {
        let obj = this.props.navigation.state.params.choseData;
        if (obj.main) {
            if (this.mainArray.indexOf(obj.main.str) !== -1) {
                this.setState({
                    mainIndex: this.mainArray.indexOf(obj.main.str)
                });
            }
        }
        if (obj.vice) {
            if (this.depArray.indexOf(obj.vice.str) !== -1) {
                this.setState({
                    deputyIndex: this.depArray.indexOf(obj.vice.str)
                });
            }
        }
        if (obj.vice1) {
            if (this.depArray.indexOf(obj.vice1.str) !== -1) {
                this.setState({
                    deputyIndex1: this.depArray.indexOf(obj.vice1.str)
                });
            }
        }
    }

    _leftFunc = () => {
        this.props.navigation.goBack();
    };

    _trilogy = () => {
        this.setState({
            mainIndex: 0,
            deputyIndex: 0,
            deputyIndex1: 1
        });
    };

    // 点击确认回传数据
    _confirm = () => {
        ShareSetting.selectFormula(this.mainArray[this.state.mainIndex]);
        ShareSetting.selectFormula(this.depArray[this.state.deputyIndex]);
        let array = [
            this.mainArray[this.state.mainIndex],
            this.depArray[this.state.deputyIndex],
            this.depArray[this.state.deputyIndex1]
        ];
        this.props.navigation.state.params.returnData(array);
        this.props.navigation.goBack();
    };

    // 主图按钮
    renderButtons = () => {
        let buttons = [];
        this.mainArray.map((item, i) => {
            buttons.push(
                <View key = {i}>
                    <View
                        style={{
                            backgroundColor:
                                this.state.mainIndex == i ? '#FEEBE7' : '#fff',
                            borderColor:
                                this.state.mainIndex == i ? '#F92400' : '#999',
                            borderWidth: 1,
                            borderRadius: 3,
                            width: (width - 45) / 4,
                            height: 30,
                            marginBottom: 15,
                            marginRight: 5
                        }}
                    >
                        {/*<Button
                        style={{
                            backgroundColor:
                                this.state.deputyIndex1 == i
                                    ? '#FEEBE7'
                                    : '#fff',
                            borderColor:
                                this.state.deputyIndex1 == i
                                    ? '#F92400'
                                    : '#999',
                            width: (width - 45) / 4,
                            height: 30,
                            marginBottom: 15,
                            marginRight: 5
                        }}
                        title={this.depArray[i]}
                        titleStyle={{
                            fontSize:
                                this.depArray[i].length > 4 ? RATE(18) : RATE(26),
                            color:
                                this.state.deputyIndex1 == i
                                    ? '#F92400'
                                    : '#666'
                        }}
                        onPress={() => this.setState({ deputyIndex1: i })}
                        />*/}
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => {
                                let fname = this.mainArray[i]
                                let permiss = UserInfoUtil.getUserPermissions()
                                if (permiss == 0 && ShareSetting.isGuideUsers2Login(fname) != -1)
                                {
                                    // this.refs.prompt_login.show();
                                    sensorsDataClickObject.loginButtonClick.entrance = fname
                                    Navigation.pushForParams(this.props.navigation, 'LoginPage',{})
                                    return;
                                }
                                else if (permiss == 1 && ShareSetting.isGuideUsers2Pay(fname) != -1)
                                {
                                    this.refs.prompt.show();
                                    return;
                                }
                                else
                                {
                                    this.setState({ mainIndex: i })
                                }
                            }}
                        >
                            <Text
                                style={{
                                    fontSize:
                                        this.mainArray[i].length > 4
                                            ? RATE(22)
                                            : RATE(26),
                                    color:
                                        this.state.mainIndex == i
                                            ? '#F92400'
                                            : '#666'
                                }}
                            >
                                {this.mainArray[i]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {this.specialArray.indexOf(item) === -1 ? null : (
                        <Badge
                            type="square"
                            style={{
                                position: 'absolute',
                                top: -7,
                                right: 10,
                                width: 18,
                                height: 12,
                                backgroundColor: '#FF690F'
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 9 }}>
                                特
                            </Text>
                        </Badge>
                    )}
                </View>
            );
        });
        return buttons;
    };

    // 副图1按钮
    renderDeputyButtons = () => {
        let buttons = [];
        this.depArray.map((item, i) => {
            buttons.push(
                <View key = {i}>
                    <View
                        style={{
                            backgroundColor:
                                this.state.deputyIndex == i
                                    ? '#FEEBE7'
                                    : '#fff',
                            borderColor:
                                this.state.deputyIndex == i
                                    ? '#F92400'
                                    : '#999',
                            borderWidth: 1,
                            borderRadius: 3,
                            width: (width - 45) / 4,
                            height: 30,
                            marginBottom: 15,
                            marginRight: 5
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            
                            onPress={() => {
                                let fname = this.depArray[i]
                                let permiss = UserInfoUtil.getUserPermissions()
                                if (permiss == 0 && ShareSetting.isGuideUsers2Login(fname) != -1)
                                {
                                    // this.refs.prompt_login.show();
                                    sensorsDataClickObject.loginButtonClick.entrance = fname
                                    Navigation.pushForParams(this.props.navigation, 'LoginPage',{})
                                    return;
                                }
                                if(permiss < 3 && ShareSetting.isAssist3Formula(fname)){
                                    this.refs.prompt.show();
                                    return;
                                }else
                                {
                                    this.setState({ deputyIndex: i })
                                }
                                // if (permiss == 0 && ShareSetting.isGuideUsers2Login(fname) != -1)
                                // {
                                //     this.refs.prompt_login.show();
                                //     return;
                                // }
                                // else if (permiss == 1 && ShareSetting.isGuideUsers2Pay(fname) != -1)
                                // {
                                //     this.refs.prompt.show();
                                //     return;
                                // }
                                // else
                                // {
                                //     this.setState({ deputyIndex: i })
                                // }
                            }}
                        >
                            <Text
                                style={{
                                    fontSize:
                                        this.depArray[i].length > 4
                                            ? RATE(22)
                                            : RATE(26),
                                    color:
                                        this.state.deputyIndex === i
                                            ? '#F92400'
                                            : '#666'
                                }}
                            >
                                {this.depArray[i]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {this.specialArray.indexOf(item) === -1 ? null : (
                        <Badge
                            type="square"
                            style={{
                                position: 'absolute',
                                top: -7,
                                right: 10,
                                width: 18,
                                height: 12,
                                backgroundColor: '#FF690F'
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 9 }}>
                                特
                            </Text>
                        </Badge>
                    )}
                </View>
            );
        });
        return buttons;
    };

    // 副图2按钮
    renderDeputy2Buttons = () => {
        let buttons = [];
        this.depArray.map((item, i) => {
            buttons.push(
                <View key = {i}>
                    <View
                        style={{
                            backgroundColor:
                                this.state.deputyIndex1 === i
                                    ? '#FEEBE7'
                                    : '#fff',
                            borderColor:
                                this.state.deputyIndex1 === i
                                    ? '#F92400'
                                    : '#999',
                            borderWidth: 1,
                            borderRadius: 3,
                            width: (width - 45) / 4,
                            height: 30,
                            marginBottom: 15,
                            marginRight: 5
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            
                            onPress={() => {
                                let fname = this.depArray[i]
                                let permiss = UserInfoUtil.getUserPermissions()
                                if (permiss == 0 && ShareSetting.isGuideUsers2Login(fname) != -1)
                                {
                                    // this.refs.prompt_login.show();
                                    sensorsDataClickObject.loginButtonClick.entrance = fname
                                    Navigation.pushForParams(this.props.navigation, 'LoginPage',{})
                                    return;
                                }
                                if(permiss < 3 && ShareSetting.isAssist3Formula(fname)){
                                    this.refs.prompt.show();
                                    return;
                                }else
                                {
                                    this.setState({ deputyIndex1: i })
                                }
                                // if (permiss == 0 && ShareSetting.isGuideUsers2Login(fname) != -1)
                                // {
                                //     this.refs.prompt_login.show();
                                //     return;
                                // }
                                // else if (permiss == 1 && ShareSetting.isGuideUsers2Pay(fname) != -1)
                                // {
                                //     this.refs.prompt.show();
                                //     return;
                                // }
                                // else
                                // {
                                //     this.setState({ deputyIndex1: i })
                                // }
                            }}
                        >
                            <Text
                                style={{
                                    fontSize:
                                        this.depArray[i].length > 4
                                            ? RATE(22)
                                            : RATE(26),
                                    color:
                                        this.state.deputyIndex1 === i
                                            ? '#F92400'
                                            : '#666'
                                }}
                            >
                                {this.depArray[i]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {this.specialArray.indexOf(item) === -1 ? null : (
                        <Badge
                            type="square"
                            style={{
                                position: 'absolute',
                                top: -7,
                                right: 10,
                                width: 18,
                                height: 12,
                                backgroundColor: '#FF690F'
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 9 }}>
                                特
                            </Text>
                        </Badge>
                    )}
                </View>
            );
        });
        return buttons;
    };

    refreshDialog() {
        this.mainArray = ShareSetting.getMainFormulas();
        this.depArray = ShareSetting.getAssistFormulas();
        this.specialArray = ShareSetting.getSpecialFormulas();
    }

    render() {

        let checkImage = require('../images/icons/CheckBox.png');
        let checkedImage = require('../images/icons/cy_select.png');
        let statusHeight = 20;
        let titleMarginTop = 12;
        if ( baseStyle.androidOrIos == 'ios' && baseStyle.isIPhoneX) {
            statusHeight = 44;
            titleMarginTop = statusHeight-20+12;
        }
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <StatusBar barStyle={'dark-content'}/>
                <View
                    style={{
                        // position: 'absolute',
                        paddingTop:0,
                        width: width,
                        height: statusHeight+44,
                        top: 0,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                        // alignItems:'space-between'
                    }}
                >
                    <View
                        style={{
                            height: 40,
                            width: 40
                        }}
                    />
                    <Text style={{ marginTop: titleMarginTop, fontSize: 17 }}>指标</Text>
                    <TouchableOpacity
                        style={{
                            marginTop: titleMarginTop,
                            marginRight: 10,
                            height: 20,
                            width: 40,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={this._leftFunc}
                    >
                        <Image
                            style={{ height: 17, width: 17 }}
                            source={require('../images/icons/close.png')}
                        />
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <View
                        style={{
                            marginTop: 0,
                            flex: 1,
                            flexDirection: 'column'
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                marginLeft: 15
                            }}
                        >
                            主图指标
                        </Text>
                        <View
                            style={{
                                marginTop: 20,
                                marginLeft: 15,
                                marginRight: 10,
                                flex: 1,
                                flexDirection: 'row',
                                flexWrap: 'wrap'
                            }}
                        >
                            {this.renderButtons()}
                        </View>
                    </View>
                    <View
                        style={{
                            marginTop: 15,
                            flex: 1,
                            flexDirection: 'column'
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                marginLeft: 15
                            }}
                        >
                            副图1指标
                        </Text>
                        <View
                            style={{
                                marginTop: 20,
                                marginLeft: 15,
                                marginRight: 10,
                                flex: 1,
                                flexDirection: 'row',
                                flexWrap: 'wrap'
                            }}
                        >
                            {this.renderDeputyButtons()}
                        </View>
                    </View>
                    <View
                        style={{
                            marginTop: 15,
                            flex: 1,
                            flexDirection: 'column'
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                marginLeft: 15
                            }}
                        >
                            副图2指标
                        </Text>
                        <View
                            style={{
                                marginTop: 20,
                                marginLeft: 15,
                                marginRight: 10,
                                flex: 1,
                                flexDirection: 'row',
                                flexWrap: 'wrap'
                            }}
                        >
                            {this.renderDeputy2Buttons()}
                        </View>
                    </View>
                </ScrollView>
                <View
                    style={{
                        height:
                        baseStyle.isIPhoneX ? 83 : 44,
                        borderTopWidth: 1,
                        borderColor: baseStyle.LIGHTEN_GRAY,
                        flexDirection: 'row',
                        alignItems:
                            baseStyle.isIPhoneX
                                ? 'flex-start'
                                : 'center'
                    }}
                >
                    {/* <TouchableOpacity
                        onPress={this._trilogy}
                        style={{
                            marginLeft: 15,
                            marginTop:
                                baseStyle.isIPhoneX
                                    ? 15
                                    : 0,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Image
                            style={{ height: 20, width: 20 }}
                            source={
                                this.state.isChecked ||
                                (this.state.mainIndex === 0 &&
                                    this.state.deputyIndex === 0 &&
                                    this.state.deputyIndex1 === 1)
                                    ? checkedImage
                                    : checkImage
                            }
                        />
                        <Text style={{ marginLeft: 15, fontSize: 15 }}>
                            主升浪
                        </Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        onPress={this._confirm}
                        activeOpacity={0.8}
                        style={{
                            position: 'absolute',
                            right: 0,
                            height: 44,
                            width: width / 3 + 15,
                            flex: 1,
                            backgroundColor: '#F92400',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Text style={{ fontSize: 15, color: 'white' }}>
                            确认
                        </Text>
                    </TouchableOpacity>
                </View>

                <PopupPromptView ref='prompt' />



            </View>
        );
    }
}
//<PopupPromptLogin ref='prompt_login' navigation={this.props.navigation} refreshDialog={this.refreshDialog}/>
// 提示登录对话框
//let sibling = null;
class PopupPromptLogin extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        }
    }
    show() {
        this.setState({ visible: true });
    }

    hidden() {
        this.setState({ visible: false })
        //sibling.destroy();
    }

    /**
     * 登录页面跳转回调
     * */
    loginCallback(){
        this.props.refreshDialog && this.props.refreshDialog()
    }

    render() {
        return( this.state.visible ?
            <Modal animationType={'none'} transparent={true} visible={true} onRequestClose={() => { }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this.hidden()} >
                    <View style={{ backgroundColor: '#ffffff', marginLeft: 38, marginRight: 38, padding: 15, alignItems: 'center', borderRadius: 10 }}>

                        <Text style={{ color: '#262628', fontSize: 18, marginTop: 15, lineHeight: 18 * 1.4, textAlign: 'center' }}>此指标登录后可查看</Text>
                        <View style={{ marginTop: 15, width: baseStyle.width - 38 * 2, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }}></View>

                        <TouchableOpacity onPress={()=>{
                            this.hidden()
                            sensorsDataClickObject.loginButtonClick.entrance = "指标页面"
                            Navigation.pushForParams(this.props.navigation,"LoginPage", {callBack: ()=>{this.loginCallback()},})
                        }} style={styles.loginView} >
                            <Text style={{fontSize:ScreenUtil.setSpText(32),color:"#FF0000"}}>登录</Text>
                        </TouchableOpacity>

                    </View>
                </TouchableOpacity>
            </Modal>
            : null)

    }
}

const styles = StyleSheet.create({
    modelStyle:{
        width:ScreenUtil.screenW,
        height:ScreenUtil.screenH-49,
        backgroundColor:"rgba(0,0,0,0.5)",
        position:"absolute",
        left:0,
        top:0,
        justifyContent:"center",
        alignItems:"center"
    },
    bgwhite:{
        width:0.7*ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(260),
        borderRadius:ScreenUtil.scaleSizeW(12),
        backgroundColor:"#fff",
        justifyContent:"center",
        alignItems:"center"
    },
    upView:{
        flex:1,
        width:0.7*ScreenUtil.screenW,
        alignItems:"center",
        justifyContent:"center",
        borderColor:"#e8e8e8",
        borderBottomWidth:0.5
    },
    loginView:{
        width:ScreenUtil.screenW*0.7,
        alignItems:"center",
        justifyContent:"center",
        paddingVertical:ScreenUtil.scaleSizeW(20)
    }
});
