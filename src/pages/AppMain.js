/**
 * 主体框架
 * pp. create by 2019-05-16
 */
import React, { Component } from 'react';
import { AppState, DeviceEventEmitter, Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Orientation from "react-native-orientation";
import TabNavigator from "react-native-tab-navigator";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AllActions from "../actions/AllActions";
import * as cyURL from '../actions/CYCommonUrl';
import RequestInterface from "../actions/RequestInterface";
import * as UserInfoAction from "../actions/UserInfoAction";
import * as baseStyle from "../components/baseStyle.js";
import CYAlert from '../components/CYAlert';
import UpdateAlert from '../components/UpdateAlert';
import TingSheng from '../pages/Listen/TingSheng';
import * as CommonUtils from '../utils/CommonUtils';
import { toast } from "../utils/CommonUtils";
import { loadIndexCourseData } from '../utils/IndexCourseHelper';
import MiPushUtils from "../utils/MiPushUtils";
import * as ScreenUtil from '../utils/ScreenUtil';
import UserInfoUtil from '../utils/UserInfoUtil';
import HitsPage from './Hits/HitsPage';
import HomePage from './Home/HomePage';
import MarketingAlert from './marketActivity/MarketingAlert';
import ProcessMiPush from "./ProcessMiPush";
import { loadeIndexSectorFile, loadeStockCodeFile } from "./Quote/DownLoadStockCode";
import ScrollableQuotationTab from './Quote/ScrollableQuotationTab';
import StockSelectPage from './StockSelect/StockSelectPage';
import * as BuriedpointUtils from '../utils/BuriedpointUtils';
const UmengAnalytics = require('react-native').NativeModules.UmengAnalytics;
import NetInfo from "@react-native-community/netinfo";
import Modal from 'react-native-translucent-modal'
import * as SensorsDataTool from '../components/SensorsDataTool'
import AsyncStorage from '@react-native-community/async-storage';
import SQLite from '../utils/SQLiteHelper';
import { sensorsDataClickObject } from "../components/SensorsDataTool";
import { sensorsDataClickActionName } from "../components/SensorsDataTool";

global.SensorsDataTool = SensorsDataTool
//用户登录注册修改密码地址发布
let userInfoUrl = cyURL.urlUserInfo;
var isPushGD = true;
var sqLite = new SQLite();
var db;

const k_kan_shi = 'kan_shi';
const k_guan_dian = 'guan_dian';
const k_shou_ye = 'shou_ye';
const k_da_bang = 'da_bang';
const k_xuan_gu = 'xuan_gu';

class AppMain extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedTab: k_shou_ye,
            modalVisible: false,
        };
        this.mDoublePress = false;//设置一个值控制不能连续点击切换tab

        this.onPressTingSheng = this.onPressTingSheng.bind(this);
        this.onPressShouYe = this.onPressShouYe.bind(this);
        this.onPressJieLi = this.onPressJieLi.bind(this);
        this.onPressDingJu = this.onPressDingJu.bind(this);
        //开启数据库
        if (!global.db) {
            global.db = sqLite.open();
        }
        sqLite.createTable();

        // 添加掉埋点统计
        if (Platform.OS === 'ios') {
            // UmengAnalytics.setAppkeyAndChannelId('5d64fdfb3fc1959c04000c1d', 'hxg');
        } else {
            UmengAnalytics.setAppkeyAndChannelId('5d67821c4ca357cd6f000c5e', ScreenUtil.channelId + '');
            UmengAnalytics.setDebugMode(false);
        }
    }

    componentDidMount() {
        this.registListener();
        UserInfoUtil.getPermissionsTimer();

        if (Platform.OS == 'ios') {
            //注册用于接收push过来的数据
            DeviceEventEmitter.addListener('mipush', (data) => {
                data.type == 'MiPush_didReceiveRemoteNotification' && ProcessMiPush(data.data, this.props.navigation)
            });
        } else {
            //注册用于接收push过来的数据
            DeviceEventEmitter.addListener('MIPUSHPARAMS', (data) => {
                ProcessMiPush(data, this.props.navigation)
            });
        }
        //注册小米推送
        MiPushUtils.register();
        //根据环境打标签，然后后台推送的时候，分环境推送
        // if(IsRelease){
        //     //正式环境
        //     MiPushUtils.setSubscribe("hxg_release_environment");
        // }else {
        //     //测试环境
        //     MiPushUtils.setSubscribe("hxg_debug_environment");
        // }
        Orientation.lockToPortrait();
        DeviceEventEmitter.addListener('LOAD_PROGRESS', (msg) => {
            // let title = "当前下载进度：" + msg;
            // toast(title)
            // if (msg >= 99) {
            //     this.setState({ modalVisible: false })
            // }
        });
        this._checkVersionUpdata();
        AppState.addEventListener('change', this._handleAppStateChange);

        loadeStockCodeFile();
        loadeIndexSectorFile();

        setTimeout(() => {
            this.resetLogin();
        }, 1000);

        setTimeout(() => {
            loadIndexCourseData();
        }, 2000);

        this._createTimer();
        //上传激活信息,只有第一次的时候
        this.submitOnceIn();
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            //一进入首页就开始存储第一条页面停留数据
            BuriedpointUtils.setItemByMianWillFoucs();
        });

        BuriedpointUtils.startTimeInterVal();

        //监听网络变化事件
        this.netInfoSubscriber = NetInfo.addEventListener(this._handleConnectivityChange);
        //console.log("杀死后启动app))))))))))))))))))",UserInfoUtil.getUserInfo())

        if (UserInfoUtil.getUserPermissions() > 0) {
            NativeModules.RNSensorsAnalyticsModule.login(UserInfoUtil.getUserId())
        }
    }

    //网络状态
    _handleConnectivityChange = (status) => {
        // alert(status.isConnected)
        const { stateUserInfo } = this.props;
        const { getAppSSO } = this.props.userInfo;
        const { setNetIsConnect } = this.props.actions;
        setNetIsConnect(status.isConnected)

        if (stateUserInfo.permissions >= 1) {
            if (status.isConnected) {
                getAppSSO((isOneLogin) => {
                    if (!isOneLogin) {
                        this._logOut(true)
                    }
                })
            }
        }
    }

    submitOnceIn() {
        //去取需要传给接口的时间
        AsyncStorage.getItem('submit_once_active', (error, result) => {
            if (result == null) {
                //本地设置已经激活
                AsyncStorage.setItem('submit_once_active', "true", (error) => {
                    if (error) {
                        //console.log("存储时间失败")
                    } else {
                        //console.log("存储时间完成")
                    }
                });
                this.submitDeviceInfo()
            } else {
                //this.submitDeviceInfo()
            }
        });
    }
    //上传激活信息
    submitDeviceInfo() {
        let params = {
            catid: 70,
            port: 2,
            device_id: DeviceInfo.getUniqueId(),
            type: Platform.OS === 'ios' ? 1 : 0,
            device_version: DeviceInfo.getSystemVersion(),
            system: DeviceInfo.getModel(),
            // system_version:  没有拿到的话不传这个字段，所以在接口调用时，动态添加
            channel: Platform.OS === 'android' ? ScreenUtil.channelId + "" : "appstore"
        };
        //合并请求设备信息的对象
        if (Platform.OS === 'android') {
            if (ScreenUtil.OS + "" !== "OTHER") {
                params.system_version = ScreenUtil.OS + "";
            }
        }
        // console.log("激活信息========================", params)ji

        RequestInterface.basePost(userInfoUrl, 'api/hxg/v1/active', params,
            (response) => {

            })
    }

    _createTimer() {
        //每次创建前前销毁掉之前的
        //this._removeTimer();
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.setTimes();
            }, 1000 * 2 * 60);
        }
    }
    /**
     * 存储时间
     * */
    async setTimes() {
        let time = CommonUtils.dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
        //在AppMain一直走一个定时器,每两分钟储存一个当前时间的时间戳;
        let userState = await AsyncStorage.getItem('nologin_state');

        let permissions = UserInfoUtil.getUserPermissions();

        if (permissions < 1 && userState === "login") {  // 游客
            AsyncStorage.setItem('nologin_last_loginout_time', time + "", (error) => {
            });
        } else if (permissions >= 1) {  // 登录用户
            AsyncStorage.setItem('last_loginout_time', time + "", (error) => {
                if (error) {
                    // console.log("存储时间失败")
                } else {
                    //  console.log("存储时间完成")
                }
            });
        }
    }
    _removeTimer() {
        this.timer && clearInterval(this.timer);
        this.timer = undefined;
    }

    componentWillUnmount() {
        this.tabChange && this.tabChange.remove();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        AppState.removeEventListener('change', this._handleAppStateChange);
        this._removeTimer();
        //关闭数据库
        sqLite.close();
        //关闭定时器
        BuriedpointUtils.clearTimeInterVal();
        this.netInfoSubscriber && this.netInfoSubscriber()
    }

    //应用前后台监听方法
    _handleAppStateChange = (nextAppState) => {
        // console.log('App has come to the foreground!' + this.state.currentAppState + '===' +nextAppState)
        // if (this.state.currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        //     console.log('App has come to the foreground!')
        // }
        // this.setState({currentAppState: nextAppState});
        if (nextAppState === 'active') {
            if (Platform.OS === 'ios') {
                this._checkVersionUpdata();
            }
            //console.log("回到前台")
        }
        else if (nextAppState === 'background') {
            //console.log("进入后台")
            //进入后台时，储存一个上次退出时间
            if (Platform.OS === 'android') {
                this.setTimes();
            }
        } else if (nextAppState === 'inactive') {
            //进入后台时，储存一个上次退出时间，ios有过渡时间的方法，在这个方法做操作
            if (Platform.OS === 'ios') {
                this.setTimes();
            }
        }
    };

    resetLogin() {
        const { stateUserInfo } = this.props;
        const { logout, touristsLogin, getPower, getAppSSO } = this.props.userInfo;
        if (stateUserInfo.permissions >= 1) {
            getAppSSO((isOneLogin) => {
                if (isOneLogin) {
                    let param = { 'username': stateUserInfo.userName, 'password': stateUserInfo.password };
                    //去取需要传给接口的时间
                    AsyncStorage.getItem('last_loginout_time', (error, result) => {
                        if (result !== null) {
                            param.last_time = result;
                        }
                        if (error) {
                            getPower(param,
                                (success) => {
                                    // alert('登录成功');
                                },
                                (error) => { logout(); })
                        } else {
                            // param.last_time = result;
                            getPower(param,
                                (success) => {
                                    // alert('登录成功');
                                },
                                (error) => { logout(); })
                        }
                    });
                } else {
                    this._logOut(true)
                }
            })
        } else {
            touristsLogin(UserInfoUtil.getDeviceID());
        }
    }

    registListener() {
        /**
         * 注册appMain的tab切换监听
         * obj 里面参数
         * mainIndex  0,1,2,3,4 依次代表5个tab
         * childIndex 0-n 代表子tab切换 如果不需要,则不需要传childIndex
         * */
        this.tabChange = DeviceEventEmitter.addListener('tabChangeListener', (obj) => {
            if (obj && obj.mainIndex != undefined) {
                switch (obj.mainIndex) {
                    case 0:
                        this.setState({ selectedTab: k_kan_shi });
                        break;
                    case 1:
                        this.setState({ selectedTab: k_guan_dian }, () => {
                            if (obj.childIndex != undefined) {
                                DeviceEventEmitter.emit('ViewPointSubTabBarChanged', obj.childIndex);
                            }
                        });
                        break;
                    case 2:
                        this.setState({ selectedTab: k_shou_ye });
                        break;
                    case 3:
                        this.setState({ selectedTab: k_da_bang }, () => {
                            if (obj.childIndex != undefined) {
                                DeviceEventEmitter.emit('GET_ISLOGIN_STATUS', obj.childIndex);
                            }
                        });
                        break;
                    case 4:
                        this.setState({ selectedTab: k_xuan_gu }, () => {
                            if (obj.childIndex != undefined) {
                                DeviceEventEmitter.emit('GET_ISLOGIN_STATUS_XG', obj.childIndex);
                            }
                        });
                        break;
                    default:
                        this.setState({ selectedTab: k_kan_shi });
                        break;
                }
            }
        });
    }

    onPressKanPan() {
        if (this.mDoublePress === false) {
            this.mDoublePress = true;
            this.sensorsAppear('看势');
            this.setState({ selectedTab: k_kan_shi }, () => { this.mDoublePress = false });
            DeviceEventEmitter.emit('ZS_ISREGISTER', true);
            DeviceEventEmitter.emit('ZX_ISREGISTER', true);
            this.sendMainIndex(0)
        }
    }

    onPressTingSheng() {
        if (this.mDoublePress === false) {
            this.mDoublePress = true;
            this.sensorsAppear('观点');
            sensorsDataClickObject.adModule.entrance = '观点';
            DeviceEventEmitter.emit('ZS_ISREGISTER', false);
            DeviceEventEmitter.emit('ZX_ISREGISTER', false);
            this.setState({ selectedTab: k_guan_dian }, () => { this.mDoublePress = false });
            this.sendMainIndex(1)
        }
    }

    onPressShouYe() {
        if (this.mDoublePress === false) {
            this.mDoublePress = true;
            this.sensorsAppear('首页');
            DeviceEventEmitter.emit('ZS_ISREGISTER', false);
            DeviceEventEmitter.emit('ZX_ISREGISTER', false);
            this.setState({ selectedTab: k_shou_ye }, () => { this.mDoublePress = false });
            this.sendMainIndex(2)
        }
    }

    onPressJieLi() {
        if (this.mDoublePress === false) {
            this.mDoublePress = true;
            this.sensorsAppear('打榜');
            DeviceEventEmitter.emit('ZS_ISREGISTER', false);
            DeviceEventEmitter.emit('ZX_ISREGISTER', false);
            this.setState({ selectedTab: k_da_bang }, () => { this.mDoublePress = false });
            DeviceEventEmitter.emit('GET_ISLOGIN_STATUS');
            this.sendMainIndex(3)
        }
    }

    onPressDingJu() {
        if (this.mDoublePress === false) {
            this.mDoublePress = true;
            this.sensorsAppear('选股');
            DeviceEventEmitter.emit('ZS_ISREGISTER', false);
            DeviceEventEmitter.emit('ZX_ISREGISTER', false);
            this.setState({ selectedTab: k_xuan_gu }, () => { this.mDoublePress = false; });
            DeviceEventEmitter.emit('GET_ISLOGIN_STATUS_XG');
            this.sendMainIndex(4)
        }
    }

    /**
     * 点击储存现在的位置
     *
     * */
    sendMainIndex(index) {
        let datas = {
            mainPosition: index
        };
        AsyncStorage.setItem('main_index', JSON.stringify(datas), function (error) {
            if (error) {
                //console.log("存储失败")
            } else {
                //console.log("存储完成")
            }
        });
        //储存位置后,再发通知临时改变
        DeviceEventEmitter.emit('MAIN_TAB_CHANGE', index);
        //储存页面的切换的时间
        //BuriedpointUtils
        switch (index) {
            case 0:
                BuriedpointUtils.setItemByPosition(["kanshi"]);
                break;
            case 1:
                BuriedpointUtils.setItemByPosition(["guandian"]);
                break;
            case 2:
                BuriedpointUtils.setItemByPosition(["shouye"]);
                break;
            case 3:
                BuriedpointUtils.setItemByPosition(["dabang"]);
                break;
            case 4:
                //因为选股的tab会因为权限的变化,默认的tab也会变化,所以直接通过
                //StockSelectPage中页面tan切换完以后回调它自己的tab位置，在回调方法里面存值
                //BuriedpointUtils.setItemByPosition(["xuangu"]);
                break;
        }
    }
    /**
     * 储存第四个tab的值
     * 其中的默认值在StockSelectPage变化
     * */
    setBuriedpoint() {
        BuriedpointUtils.setItemByPosition(["xuangu"]);
    }

    render() {
        const { selectedTab } = this.state;
        const { stateUserInfo } = this.props;
        return (
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff', paddingBottom: (Platform.OS == 'ios' && baseStyle.isIPhoneX) ? 34 : 0 }}>
                {Platform.OS === 'ios' ?
                    <StatusBar barStyle='dark-content' />
                    :
                    <StatusBar barStyle='dark-content' backgroundColor='transparent' />
                }
                <View style={{ flex: 1 }}>
                    {stateUserInfo.appssoSame ? null : this._logOut(true)}
                    <TabNavigator
                        tabBarStyle={{
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            borderTopColor: '#3D4A7121',
                            borderTopWidth: 1,
                            paddingTop: Platform.OS == 'ios' ? 1 : 3,
                            height: 49,
                            overflow: 'hidden',
                        }} sceneStyle={{ paddingBottom: 49 }}>
                        <TabNavigator.Item
                            title="看势"
                            selected={selectedTab === k_kan_shi}
                            selectedTitleStyle={styles.selectedTextStyle}
                            titleStyle={styles.textStyle}
                            renderIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_kanpan_unselect_icon.png")} />}
                            renderSelectedIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_kanpan_select_icon.png")} />}
                            onPress={this.onPressKanPan.bind(this)}>
                            <ScrollableQuotationTab navigation={this.props.navigation} />
                        </TabNavigator.Item>
                        <TabNavigator.Item
                            title="观点"
                            selected={selectedTab === k_guan_dian}
                            selectedTitleStyle={styles.selectedTextStyle}
                            titleStyle={styles.textStyle}
                            renderIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_tingsheng_unselect_icon.png")} />}
                            renderSelectedIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_tingsheng_select_icon.png")} />}
                            onPress={() => this.onPressTingSheng()}>
                            <TingSheng navigation={this.props.navigation}
                                isPushGD={(isPush) => {
                                    isPushGD = isPush
                                }} />
                        </TabNavigator.Item>

                        <TabNavigator.Item
                            // title="首页"
                            selected={selectedTab === k_shou_ye}
                            selectedTitleStyle={styles.selectedTextStyle}
                            titleStyle={styles.textStyle}
                            // renderIcon={() => <Image source={require("../images/tab/tabbar_shouye_unselect_icon.png")} />}
                            // renderSelectedIcon={() => <Image source={require("../images/tab/tabbar_shouye_select_icon.png")} />}
                            onPress={() => this.onPressShouYe()}>
                            <HomePage
                                ref={(main_ref) => {
                                    this.mainPage_ref = main_ref
                                }}
                                navigation={this.props.navigation}
                                {...this.props} />
                        </TabNavigator.Item>
                        <TabNavigator.Item
                            title="打榜"
                            selected={selectedTab === k_da_bang}
                            selectedTitleStyle={styles.selectedTextStyle}
                            titleStyle={styles.textStyle}
                            renderIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_jieli_unselect_icon.png")} />}
                            renderSelectedIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_jieli_select_icon.png")} />}
                            onPress={() => this.onPressJieLi()}>

                            <HitsPage navigation={this.props.navigation} />
                        </TabNavigator.Item>
                        <TabNavigator.Item
                            title="选股"
                            selected={selectedTab === k_xuan_gu}
                            selectedTitleStyle={styles.selectedTextStyle}
                            titleStyle={styles.textStyle}
                            renderIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_dingju_unselect_icon.png")} />}
                            renderSelectedIcon={() => <Image style={{ width: 18, height: 19 }} source={require("../images/tab/tabbar_dingju_select_icon.png")} />}
                            onPress={() => this.onPressDingJu()}>
                            <StockSelectPage navigation={this.props.navigation}
                                setBuriedpoint={() => { this.setBuriedpoint(); }}
                            />
                        </TabNavigator.Item>
                    </TabNavigator>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={{
                            position: 'absolute',
                            left: (baseStyle.width - 50) / 2,
                            bottom: 0,
                            width: 50,
                            height: 69,
                        }}
                        onPress={() => this.onPressShouYe()}>
                        <View style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <Image style={{
                                width: 47,
                                height: 47,
                                resizeMode: 'contain'
                            }} source={selectedTab === k_shou_ye ? require("../images/tab/tabbar_shouye_select_icon.png") : require("../images/tab/tabbar_shouye_unselect_icon.png")} />
                            <Text style={[{ marginTop: 4 }, (selectedTab === k_shou_ye) ? styles.selectedTextStyle : styles.textStyle]}>首页</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <MarketingAlert
                    navigation={this.props.navigation}
                    ref={(ref) => this.ydAlert = ref} />
                <CYAlert type={2}
                    title={'退出登录通知'}
                    message={'您的账号已在其他设备上登录，若非本人操作，请重新登录并及时修改密码'}
                    sure={'重新登录'}
                    cancel={'退出'}
                    surePress={() => {
                        this._login()
                    }}
                    cancelPress={() => {
                        Navigation.resetTo(this.props.navigation, 'AppMain')
                    }}
                    ref={(ref) => this.cyAlertAppsso = ref} />

                <UpdateAlert
                    surePress={() => {
                        this.setState({ modalVisible: true })
                    }}
                    ref={(ref) => this.CYUpdateAlert = ref} />
                {this.updateMask()}
            </View>
        )
    }

    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = label
        sensorsDataClickObject.adLabel.module_source = label
        sensorsDataClickObject.adLabel.label_level = 1;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.page_source = label;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }

    _checkVersionUpdata() {
        this.CYUpdateAlert.showAlert();
    }

    updateMask() {
        return (
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                }}
            >
                <View style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    position: 'absolute',
                    bottom: 0,
                    top: 0,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <View style={{ width: ScreenUtil.screenW * 0.55, height: ScreenUtil.screenW * 0.66, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: 5 }}>
                        <Image style={{ width: ScreenUtil.screenW * 0.4, height: ScreenUtil.screenW * 0.43, resizeMode: "stretch" }} source={require('../images/login/update_ing.png')} />
                        <Text style={{ color: "rgba(0,0,0,0.8)", fontSize: ScreenUtil.scaleSizeW(32), marginTop: ScreenUtil.scaleSizeW(40) }}>升级中请稍后</Text>
                    </View>
                </View>
            </Modal>
        )
    }

    _logOut(isAppSso) {
        const { logout } = this.props.userInfo;
        logout(isAppSso);
        this.cyAlertAppsso.showAlert()
    }

    _login() {
        const { stateUserInfo } = this.props;
        const { login, logout, touristsLogin, wxLogin } = this.props.userInfo;
        let wxUnionid = stateUserInfo.wxUnionid;
        let param = { 'username': stateUserInfo.userName, 'password': stateUserInfo.password };
        let wxParam = { 'wx_unionid': wxUnionid };
        sensorsDataClickObject.loginButtonClick.entrance = '弹窗登录'
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.loginButtonClick)
        // console.log("密码",stateUserInfo.password)
        if (wxUnionid) {
            wxLogin(wxParam,
                (response) => {
                    if (!(response && response.code)) {
                        this.loginSuccessSensorsFun(true, true, '')
                        //登录成功
                        toast('登录成功，欢迎回来');
                        if (this.state.selectedTab == k_da_bang) {
                            DeviceEventEmitter.emit('GET_ISLOGIN_STATUS');
                        }
                    }
                },
                (error) => {
                    toast('登录失败')
                    logout();
                    this.loginSuccessSensorsFun(true, false, error)
                });

        } else {
            login(param, (success) => {
                toast('登录成功，欢迎回来')
                this.loginSuccessSensorsFun(false, true, '')
                //解决打榜中2个账号同时登录成功,但是弹窗未关闭的冲突
                if (this.state.selectedTab == k_da_bang) {
                    DeviceEventEmitter.emit('GET_ISLOGIN_STATUS');
                }
            },
                (error) => {
                    toast(error)
                    logout();
                    this.loginSuccessSensorsFun(false, false, error)
                });
        }
    }

    loginSuccessSensorsFun = (isQuick_Login, isSuccess, fail_reason) => {
        sensorsDataClickObject.loginSuccess.login_is_first = false
        sensorsDataClickObject.loginSuccess.login_method = isQuick_Login == true ? '微信' : '账号密码'
        sensorsDataClickObject.loginSuccess.quick_Login = isQuick_Login
        sensorsDataClickObject.loginSuccess.is_success = isSuccess
        sensorsDataClickObject.loginSuccess.fail_reason = fail_reason
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.loginSuccess)
    }
}

const styles = StyleSheet.create({
    textStyle: {
        color: baseStyle.BLACK_70,
        fontSize: 10,
    },
    selectedTextStyle: {
        color: baseStyle.BLUE_HIGH_LIGHT,
        fontSize: 10
    }
});

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch),
        actions: bindActionCreators(AllActions, dispatch)
    })
)(AppMain)
