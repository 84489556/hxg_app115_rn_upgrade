/**
 * Created by cuiwenjuan on 2019/8/9.
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList,
    StyleSheet,
    Platform,
    DeviceEventEmitter,
    Linking,

} from 'react-native';

import PageHeader from '../../components/NavigationTitleView'
import { commonUtil, toast } from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import BaseComponent from '../BaseComponentPage'
import UserInfoUtil from '../../utils/UserInfoUtil'
import Yd_cloud from '../../wilddog/Yd_cloud'
import * as cyURL from '../../actions/CYCommonUrl'
import { Utils } from '../../utils/CommonUtils'
import { WebView } from 'react-native-webview';
import  Modal  from 'react-native-translucent-modal';


let refPath = Yd_cloud().ref(MainPathYG);


/**

 例如：name:'资金流入'//功能名称  permissions:5 //功能所属权限(营销活动可以没有这个)  =>资金流入只有五星用户可以看到
        Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage',{
            name:'',
            permissions:'',
            url:'',
            showButton:''//是否显示按钮
            type:'',//'MarketingDetailPage'
            callBack:()=>{}
        })

 // Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage',{permissions:3,type:'FuFeiYingXiaoYe'})

 */


const marketType = {
    fuFeiYingXiaoYe: 'FuFeiYingXiaoYe',
}

import * as BuriedpointUtils from "../../utils/BuriedpointUtils"
class MarketingDetailPage extends BaseComponent {

    constructor(props) {
        super(props);
        this.URL = 'https://ydtg.com.cn/2018/qsxf/index.html';

        this.title = this.props.navigation.state.params && this.props.navigation.state.params.name ? this.props.navigation.state.params.name : '营销页面';
        this.URL = this.props.navigation.state.params && this.props.navigation.state.params.url ? this.props.navigation.state.params.url : '';
        this.type = this.props.navigation.state.params && this.props.navigation.state.params.type ? this.props.navigation.state.params.type : undefined;
        this.permissions = this.props.navigation.state.params && this.props.navigation.state.params.permissions ? this.props.navigation.state.params.permissions : undefined;
        this.showButton = this.props.navigation.state.params && this.props.navigation.state.params.showButton && this.props.navigation.state.params.showButton;
        this.refP = this._getRef();
        if (this.refP) { this._loadData(this.refP) }
        this.state = {
            dataSource: [],
            modalVisible: false,
            URL: this.URL,
            title: this.title,
            showButton: this.showButton,

            modalShow: ""//弹窗弹出来显示的内容
        }
    }

    componentWillMount() {
        super.componentWillMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.huodongxiangqing);
        });
    }

    _getRef() {
        let ref = undefined;
        if (this.type && this.type === marketType.fuFeiYingXiaoYe) {
            if (this.permissions) {
                ref = refPath.ref('YingXiaoHuoDong/FuFeiYingXiaoYeAPP/' + this.permissions)
            }
        }
        return ref;

    }

    _loadData(ref) {
        ref.get((snapshot) => {
            //console.log('付费营销活动postList === ', JSON.stringify(snapshot));
            if (snapshot.nodeContent) {
                let data = snapshot.nodeContent;
                this.setState({
                    title: data.name,
                    URL: data.link,
                    showButton: data.ktqx
                })
            }
        })
    }


    onBack() {
        this.props.navigation.state.params && this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack();
        Navigation.pop(this.props.navigation);
    }

    _onPress() {
        let permissions = UserInfoUtil.getUserPermissions();

        if (permissions < 1) {
            sensorsDataClickObject.loginButtonClick.entrance = this.state.title
            Navigation.pushForParams(this.props.navigation, 'LoginPage', {
                callBack: () => {
                    let permission = UserInfoUtil.getUserPermissions();
                    if (permission >= 1) {
                        Navigation.pop(this.props.navigation);
                    }
                }
            });
        } else {

            const { stateUserInfo } = this.props;
            let userName = stateUserInfo.userName;
            let param = { 'username': userName, 'pid': 3, 'type': 3 };  // 产品线 ID pid:3，type固定值3
            Utils.post(cyURL.urlHXG_marketing, param,
                (success) => {
                    this.setState({
                        modalShow: success.msg ? success.msg : "",
                        modalVisible: true
                    })

                },
                (error) => {
                    // toast('发送失败，请稍后重试');
                    this.setState({
                        modalShow: "发送失败，请稍后重试",
                        modalVisible: true
                    })
                });


            // toast('开通权限')
        }
    }

    _surePress() {
        this.setState({ modalVisible: false })
        this.onBack();
    }
    //  {'您已申请该服务，请等待专属客服与您联系'}
    _alertView() {
        return (
            <Modal
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => { }}>
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 8,
                        height: 129,
                        width: commonUtil.width - 37 * 2
                    }}>
                        <View style={{
                            height: 84,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontSize: 18,
                                color: baseStyle.BLACK_100,
                                textAlign: 'center',
                                marginRight: 32,
                                marginLeft: 32,
                            }}>

                                {this.state.modalShow + ""}
                            </Text>
                        </View>
                        <View style={{ flex: 1, height: 1, backgroundColor: baseStyle.LINE_BG_F1 }} />
                        <TouchableOpacity
                            style={{
                                alignItems: 'center', justifyContent: 'center',
                                height: 44,
                            }}
                            activeOpacity={1}
                            onPress={() => this._surePress()}>
                            <Text style={{
                                fontSize: 17,
                                color: baseStyle.BLUE_HIGH_LIGHT,
                            }}>{'确定'}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>
        )
    }

    render() {

        let checkMessage = UserInfoUtil.getUserInfoReducer().checkMessage <= 0


        let url = this.state.URL;
        return <BaseComponent style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <PageHeader
                    onBack={() => this.onBack()} navigation={this.props.navigation} titleText={this.state.title} />
                {Platform.OS === 'ios' ?
                    <WebView style={{}} source={{ uri: url }}
                        useWebKit={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        decelerationRate="normal"
                        startInLoadingState={true} />
                    :
                    <View style={{ width: ScreenUtil.screenW, flex: 1, overflow: 'hidden' }}>
                        <WebView style={{}} source={{ uri: url }}
                            useWebKit={true}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            decelerationRate="normal"
                            startInLoadingState={true} />

                    </View>
                }


                {
                    checkMessage ? this.state.showButton ?
                        <View style={{
                            position: 'absolute',
                            left: 15,
                            right: 15,
                            bottom: 13,
                            height: 40,
                            flexDirection: 'row',
                            backgroundColor: baseStyle.BLUE_HIGH_LIGHT,
                            borderRadius: 5,
                        }}>

                            <TouchableOpacity
                                style={{
                                    flex: 1, alignItems: 'center', justifyContent: 'center'
                                }}
                                activeOpacity={1}
                                onPress={() => this._onPress()}>
                                <Text style={{
                                    fontSize: 17,
                                    color: baseStyle.WHITE,
                                }}>{'开通权限'}</Text>
                            </TouchableOpacity>
                        </View> : null : null
                }


            </View>
            {
                this._alertView()
            }

        </BaseComponent>

    }

}


var styles = StyleSheet.create({
    itemViewStyle: {
        marginRight: 6,
        marginLeft: 6,
        marginTop: 10,
        backgroundColor: "#fff",
        height: 244,
        borderRadius: 5,
        overflow: 'hidden'
    },
});



import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import * as ScreenUtil from "../../utils/ScreenUtil";
import { sensorsDataClickObject } from '../../components/SensorsDataTool';

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(MarketingDetailPage)