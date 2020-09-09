/**
 * Created by cuiwenjuan on 2019/5/17.
 */
import { DeviceEventEmitter, Platform } from "react-native"
import DeviceInfo from 'react-native-device-info'
import * as baseStyle from '../components/baseStyle'
import { dateFormats, Utils } from '../utils/CommonUtils'
import MiPushUtils from '../utils/MiPushUtils'
import * as ScreenUtil from '../utils/ScreenUtil'
import UserInfoUtil, * as type from '../utils/UserInfoUtil'
import Yd_cloud from '../wilddog/Yd_cloud'
import * as actionType from './actionTypes'
import * as cyURL from './CYCommonUrl'
import * as UserIMAction from './UserIMAction'
import ChannelSource from '../images/jsonMessage/ChannelSource.json'
import AsyncStorage from '@react-native-community/async-storage';

/**
 * 给后台传入的手机信息
 * */

//设备信息
let getDeviceInfos = () => {

    let deviceInfos = {
        device_id: DeviceInfo.getUniqueId(),
        device_version: DeviceInfo.getSystemVersion(),
        system: DeviceInfo.getModel()
    }

    if (Platform.OS === 'android') {
        if (ScreenUtil.OS + "" != "OTHER") {
            deviceInfos.system_version = ScreenUtil.OS + "";
        }
        deviceInfos.channel = ScreenUtil.channelId;
    } else {
        deviceInfos.channel = "appstore";
    }
    return deviceInfos;
}

//登录注册添加渠道号和来源
let getChannel = () => {
    let channel = '';
    //区分release 和debug
    let channelMessage = IsRelease ? ChannelSource.releaseCannel : ChannelSource.debugCannel;

    if (Platform.OS === 'android') {
        channel = ScreenUtil.channelId;

        if (channel == '' || channel == 'umeng') {
            channel = "anzhi";
        }
    } else {
        channel = "appstore";
    }
    // console.log('stock-http:渠道来源0 === '+ channel);
    let channelS = channelMessage[channel];
    // console.log('stock-http:渠道来源 === '+ JSON.stringify(channelS));
    let source = {};
    if (channelS) {
        source = {
            'channelId': channelS.channel,
            'source': channelS.source,
        }
    }
    // console.log('渠道来源 === '+ JSON.stringify(channelS) + JSON.stringify(source));
    return source;
}


//设备类型 0:android  1:ios  2:window
let getSystemType = () => {
    let typeSystem = 0;
    if (systemID === 'ios') {
        typeSystem = 1
    }
    return typeSystem;
}

//获取软件版本号
let getVersion = () => {
    let version = UserInfoUtil.getVersion();
    version = version.replace(/[.]/g, "");
    return version;
}

let catid = 70;//产品id 慧选股默认70
let port = 2;//1位pc,2为app




let listen_value = 'value';


//源达云
let refHXG = Yd_cloud().ref(MainPathYG);
let refYingXiaoHuoDong = refHXG.ref('YingXiaoHuoDong/GuangGaoWeiAPP/')

//单点登录 /HuiXuanGuTest/App/appsso/
let appssoRef = Yd_cloud().ref(cyURL.appSSORef + 'App/appsso/');

//多头活动服务
let duoTouRef = Yd_cloud().ref(cyURL.duoTouRef + 'Power2/HuiXuanGuHuoDong');


let serverTime = (new Date).getTime() / 1000;
export let time = (callback) => {
    fetch(GetTimestampUrl)
        .then((response) => response.json())
        .then((responseJson) => {
            // console.log('获取服务器时间戳 === ',responseJson /1000);
            serverTime = responseJson / 1000;
            if (callback) {
                callback(serverTime);
            }
        })
        .catch((error) => {
            serverTime = (new Date).getTime() / 1000;
            if (callback) {
                callback(serverTime);
            }
        })
    // console.log('当前时间 == ',serverTime);
};


//====================================================================================

//用户登录注册修改密码地址发布
let userInfoUrl = cyURL.urlUserInfo;
//检查版本更新
let checkUpdates = cyURL.checkUpdate;

//====================================================================================

let ydgpURL2 = cyURL.urlYDGP;//财源生产地址


let getHXGUrl = (model) => {
    if (
        model === type.MODEL_ZAN_CeLueXueTang ||
        model === type.MODEL_Unders_CeLueXueTang ||
        model === type.MODEL_ZAN_ZhiBiaoKeTang ||
        model === type.MODEL_Unders_ZhiBiaoKeTang ||
        model === type.MODEL_panZhongGuanDian ||
        model === type.MODEL_zaoZhiXiao
    ) {
        return true;
    }
    return false;
}


//个股公告，个股资讯
let geGuNewsUrl = cyURL.urlGeGuNews;

//====================================================================================

let appModel = 6;  // m=0源达   m=1财源   m=6慧选股
let systemID = baseStyle.androidOrIos;


let tourRefIsOn = false
let tourZXGRef = false
let tourLogin = false
let isLogin = false;

export let login = (param, successCallback, failCallback) => {

    // 获取服务器的时间
    time();
    let urlS = userInfoUrl + 'api/hxg/app/v1/login';

    let version = getVersion();
    let typeSystem = getSystemType();

    let paramLogin = {
        'username': param.username,
        'password': param.password,
        'last_time': param.last_time,
        'version': version,
        'type': typeSystem
    };

    Object.assign(paramLogin, getDeviceInfos());
    Object.assign(paramLogin, getChannel());

    // console.log('登录 urlS === ' + urlS + 'param == ' + JSON.stringify(param) + 'paramLogin == ' + JSON.stringify(paramLogin));
    return (dispatch) => {
        // 登录接口请求
        if (!isLogin) {
            dispatch(refOff());
            isLogin = true;
            //console.log('user_login url=' + urlS + ' paramLogin=' + JSON.stringify(paramLogin));
            Utils.post(urlS, paramLogin, async (response) => {
                //console.log('登录成功 = ', response);
                if (response && response.code == "10000") {
                    //添加密码
                    response.data.password = paramLogin.password;
                    dispatch(loginResponse(response, successCallback, failCallback))
                    //记录退出时间
                    let logoutTime = dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
                    AsyncStorage.setItem('last_loginout_time', logoutTime + "", (error) => { });

                    AsyncStorage.setItem('nologin_state', "logout", (error) => { });
                    AsyncStorage.setItem('nologin_last_loginout_time', logoutTime + "", (error) => { });
                } else {
                    isLogin = false;
                    dispatch(refOff());
                    failCallback && failCallback(response.msg);
                }

            }, (error) => {
                isLogin = false;
                dispatch(refOff());
                failCallback && failCallback(error);
            });
        }
    }

};

export let getPower = (params, successCallback, failCallback) => {
    //获取服务器的时间
    time();
    //console.log('权限参数 urlS ================================ ',params);
    let urlS = userInfoUrl + 'api/hxg/app/v1/get_power';

    let typeSystem = getSystemType();
    let version = getVersion();

    let tokenString = UserInfoUtil.getUserInfoReducer().token;

    let paramLogin = { 'token': tokenString, 'type': typeSystem, 'version': version };
    if (params && params.last_time) {
        paramLogin.last_time = params.last_time;
    }

    Object.assign(paramLogin, getDeviceInfos());
    Object.assign(paramLogin, getChannel());

    //console.log('获取权限 ==== ', urlS, paramLogin);
    return (dispatch) => {
        // 登录接口请求
        if (!isLogin) {
            dispatch(refOff());
            isLogin = true;
            // console.log('user_get_power url=' + urlS + ' paramLogin=' + JSON.stringify(paramLogin));
            Utils.post(urlS, paramLogin, (response) => {
                //console.log('获取权限 = ', response);
                //添加密码
                response.data.password = UserInfoUtil.getUserInfo().password;
                dispatch(loginResponse(response, successCallback, failCallback));

                //退出记录时间
                let logoutTime = dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
                AsyncStorage.setItem('last_loginout_time', logoutTime + "", (error) => { });

            }, (error) => {
                isLogin = false;
                dispatch(refOff());
                failCallback && failCallback(error);
            });
        }
    }
}

//获取活动服务
let getHuoDongPower = (successCallback, failCallback, callBack) => {
    let urlS = userInfoUrl + 'api/huo_dong/v1/get_power';
    let userInfo = UserInfoUtil.getUserInfoReducer().userInfo;
    let userId = userInfo && userInfo.userid

    let paramLogin = { 'userid': userId };
    // console.log('活动服务 ==== ', urlS, paramLogin);
    return (dispatch) => {
        Utils.post(urlS, paramLogin, (response) => {
            // console.log('活动服务 response= ', response);
            if (response && response.code.toString() === '0') {
                let powerObj = response.data;
                if (powerObj) {
                    for (let index in powerObj) {
                        if (index.toString() === '215') {//多头启动服务
                            let powerData = {
                                'type': index,
                                'data': powerObj[index]
                            };

                            // let ceShiTest = {
                            //     "catid": 80,
                            //     "counts": 1,
                            //     "end_time": 1616291425,
                            //     "id": 2,
                            //     "pid": 215,
                            //     "start_time": 1584547200,
                            //     "status": 1,
                            //     "tid": 0,
                            //     "userid": 1,
                            //     "is_due": 0
                            // };
                            // let powerData = {
                            //     'type':index,
                            //     'data':ceShiTest
                            // };

                            dispatch(userPower(powerData, serverTime));
                            // console.log('活动服务 == '+JSON.stringify(powerData));
                        }
                    }
                }
                successCallback && successCallback(response.msg);
            }
            callBack && callBack();
        }, (error) => {
            failCallback && failCallback(error);
            callBack && callBack();
        });
    }
}


export let resetPower = () => {
    let power = UserInfoUtil.getUserInfoReducer().cyPower;
    return (dispatch) => {
        dispatch(userPower(power, null));
    }
}

let loginResponse = (response, successCallback, failCallback) => {
    return (dispatch) => {
        dispatch(refOff());
        if (response.code.toString() === '10000') {
            try {

                let powerObj = response.data.power_data;
                if (powerObj) {
                    for (let index in powerObj) {
                        dispatch(userPower(powerObj[index], serverTime));
                        //console.log(powerObj[index]);
                    }
                } else {
                    dispatch(userPower(undefined, serverTime));
                }

                //权限
                // dispatch(userPower(powerObj));
                //用户信息
                dispatch(userInfo(response.data));
                //用户密码
                dispatch(userPassword(response.data.password, response, serverTime));

                //IM
                dispatch(UserIMAction.userIMOneMessage(response.data.userid));

                dispatch(loginSuccess(response.data.token, response.data.appsso));
                //单点登录
                dispatch(appSSO(response.data.userid, response.data.appsso));

                dispatch(userInfoAppYDGP(response.data.userid, response.data.username, () => {
                    successCallback && successCallback(response.msg);
                    DeviceEventEmitter.emit('LOGIN_SUCCESS');
                }));

                // //获取活动服务
                // dispatch(getHuoDongPower('', '', () => {
                //     successCallback && successCallback(response.msg);
                //     DeviceEventEmitter.emit('LOGIN_SUCCESS');
                // }));

            } catch (error) {
                isLogin = false;
                failCallback && failCallback('出现错误，请从新试试');
            }

        } else {
            isLogin = false;
            failCallback && failCallback(response.msg);
        }
    }
}

//微信登录
export let wxLogin = (params, successCallback, failCallback) => {
    //获取服务器的时间
    time();
    //console.log('微信登录 urlS ================================ ', params);
    let urlS = userInfoUrl + 'api/hxg/app/v1/wx_login';

    let typeSystem = getSystemType();
    let version = getVersion();

    let paramLogin = {
        'type': typeSystem,
        'version': version,
        'wx_unionid': params.wx_unionid,
        'last_time': params.last_time,
    };

    Object.assign(paramLogin, getDeviceInfos());
    Object.assign(paramLogin, getChannel());

    //console.log('微信登录 ==== ', urlS, paramLogin);
    return (dispatch) => {
        if (!isLogin) {
            dispatch(refOff());
            isLogin = true;
            //console.log('user_get_power url=' + urlS + ' paramLogin=' + JSON.stringify(paramLogin));
            Utils.post(urlS, paramLogin, (response) => {
                //console.log('微信登录 = ', response);
                if (response && response.code.toString() === "10000") {
                    //添加微信唯一标识ID
                    response.data.wxUnionid = params.wx_unionid;
                    dispatch(loginResponse(response, successCallback, failCallback));
                    //退出记录时间
                    let logoutTime = dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
                    AsyncStorage.setItem('last_loginout_time', logoutTime + "", (error) => { });

                    AsyncStorage.setItem('nologin_state', "logout", (error) => { });
                    AsyncStorage.setItem('nologin_last_loginout_time', logoutTime + "", (error) => { });
                } else {
                    isLogin = false;
                    dispatch(refOff());
                    successCallback && successCallback(response);
                }
            }, (error) => {
                isLogin = false;
                dispatch(refOff());
                failCallback && failCallback('网络失败');
            });
        }
    }

}

//绑定手机号
export let bindPhone = (params, successCallback, failCallback) => {
    //获取服务器的时间
    time();
    //console.log('绑定手机号 urlS ================================ ', params);
    let urlS = userInfoUrl + 'api/hxg/app/v2/bind_phone';

    let typeSystem = getSystemType();
    let version = getVersion();

    let paramLogin = {
        'type': typeSystem,
        'version': version,
        'wx_unionid': params.wx_unionid,
        'wx_avatar': params.wx_avatar,
        'wx_nickname': params.wx_nickname,
        'wx_sex': params.wx_sex,
        'wx_address': params.wx_address,
        'phone': params.phone,
        'code': params.code
    };
    Object.assign(paramLogin, getDeviceInfos());
    Object.assign(paramLogin, getChannel());

    //console.log('绑定手机号 ==== ', urlS, paramLogin);
    return (dispatch) => {
        if (!isLogin) {
            dispatch(refOff());
            isLogin = true;
            // console.log('绑定手机号 url=' + urlS + ' paramLogin=' + JSON.stringify(paramLogin));
            Utils.post(urlS, paramLogin, (response) => {
                // console.log('绑定手机号 = ', JSON.stringify(response));
                if (response.code.toString() === '10000') {
                    //添加微信唯一标识ID
                    response.data.wxUnionid = params.wx_unionid;
                    dispatch(loginResponse(response, successCallback, failCallback));
                    //退出记录时间
                    let logoutTime = dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
                    AsyncStorage.setItem('last_loginout_time', logoutTime + "", (error) => { });

                    AsyncStorage.setItem('nologin_state', "logout", (error) => { });
                    AsyncStorage.setItem('nologin_last_loginout_time', logoutTime + "", (error) => { });
                } else {
                    isLogin = false;
                    dispatch(refOff());
                    failCallback && failCallback(response.msg);
                }

            }, (error) => {
                // console.log(error);
                isLogin = false;
                dispatch(refOff());
                failCallback && failCallback('网络失败');
            });
        }
    }

}






let appSSO = (userID, appsso) => {
    let ref = appssoRef.ref(userID);
    //console.log("监听挤掉节点,",ref,userID)

    return (dispatch) => {
        ref.get((snapshot) => {
            //console.log('是否是同一个用户登录 == appsso', snapshot, UserInfoUtil.getUserName(), ref);
            if (snapshot.nodeContent) {
                let ssoString = snapshot.nodeContent + '';
                //console.log('不是同一个用户取值 snapshot = ' + UserInfoUtil.getUserInfoReducer().appsso + '===' ,snapshot);
                if (UserInfoUtil.getUserInfoReducer().appsso !== ssoString) {
                    // console.log('不是同一个用户 snapshot = ' + UserInfoUtil.getUserInfoReducer().appsso + '===' + ssoString);
                    if (UserInfoUtil.getUserInfoReducer().appsso) {
                        ref.off();
                        let appssoSame = false;
                        dispatch(appSsoAction(appssoSame));
                    }
                }
            }
        });

        ref.on(listen_value, (snapshot) => {
            if (snapshot.nodeContent) {
                let ssoString = snapshot.nodeContent + '';
                if (UserInfoUtil.getUserInfoReducer().appsso !== ssoString) {
                    // console.log('不是同一个用户 snapshot = ' + UserInfoUtil.getUserInfoReducer().appsso + '===' + ssoString);
                    //console.log('不是同一个用户监听 snapshot = ' + UserInfoUtil.getUserInfoReducer().appsso + '===' , snapshot);
                    if (UserInfoUtil.getUserInfoReducer().appsso) {
                        ref.off();
                        let appssoSame = false;
                        dispatch(appSsoAction(appssoSame));
                    }
                }
            }
        })
    }

};

//进入app 判断是否在其他账号登录
export let getAppSSO = (successBack) => {
    let ref = appssoRef.ref(UserInfoUtil.getUserId());
    return (dispatch) => {

        ref.get((snapshot) => {
            // console.log('是否是同一个用户登录 == ',snapshot,UserInfoUtil.getUserId());
            if (snapshot.nodeContent) {
                let ssoString = snapshot.nodeContent + '';
                if (UserInfoUtil.getUserInfoReducer().appsso !== ssoString) {
                    // console.log('不是同一个用户 snapshot = ' + UserInfoUtil.getUserInfoReducer().appsso + '===' + ssoString);
                    if (UserInfoUtil.getUserInfoReducer().appsso) {
                        successBack(false);
                    } else {
                        successBack(true);
                    }
                } else {
                    successBack(true);
                }
            } else {
                successBack(true);
            }
        })
    }
};


export let appSsoAction = (appssoSame) => {
    return {
        type: actionType.USER_APP_SS0,
        appssoSame: appssoSame,
    }
};


export let loginSuccess = (token, appsso) => {
    return {
        type: actionType.USER_LOGIN_TOKEN,
        token: token,
        appsso: appsso,
    }
};

let userInfo = (userInfo) => {
    return {
        type: actionType.USER_LOGIN_INFO,
        userInfo,
    }
};

let userPower = (snapshot, serverTime) => {
    return {
        type: actionType.USER_LOGIN_POWER,
        snapshot,
        serverTime,
    }
};

let userPassword = (password, responseData, serverTime) => {
    return {
        type: actionType.USER_PASSWORD,
        password,
    }
};

export let gongGaoAction = (gongGaos) => {
    return {
        type: actionType.USER_CENTER_MESSAGE_GONGGAO,
        gongGaos,
    }
};


let userALLDataActionAPP2 = (snapshot, typeA) => {
    return {
        type: actionType.USER_ALL_DATA_APP2,
        snapshot,
        typeA
    }
};

export let logoutAction = () => {
    return {
        type: actionType.USER_LOGOUT,
    }
};

//批量排序 保存
export let saveAllSortAction = (personCode, isTouri) => {
    return {
        type: actionType.USER_SAVE_ALL_STOCKS,
        personCode,
        isTouri,
    }
};

//营销活动
export let yingXiaoHuoDong = () => {
    return (dispatch) => {
        refYingXiaoHuoDong.get(function (snapshot) {
            if (snapshot.nodeContent)
                dispatch(yingXiaoHuoDongAction(snapshot.nodeContent));
        });
    }
}

//批量排序 保存
export let yingXiaoHuoDongAction = (data) => {
    return {
        type: actionType.USER_YXHD_INFO,
        data,
    }
};



//userInfo YuanDaGuPiao 源达股票
export let userInfoAppYDGP = (userId, phone, callBack) => {

    let refLike = refHXG.ref("Users/" + userId + "/like");
    let refUnderstand = refHXG.ref("Users/" + userId + "/understand");
    let refP = refHXG.ref("Users/" + userId + "/OptionalStock/自选股");
    let refTongZhi = refHXG.ref("Users/" + userId + "/xiaoxi");
    let pushMessage = refHXG.ref("XiaoXiZhongXin");
    let duoTou = duoTouRef.ref(userId);
    // let duoTou = duoTouRef.ref('7777');

    //多头活动
    let duoTouGet = (isGet) => {
        return (dispatch) => {
            duoTou.get(function (snapshot) {
                //console.log('多头 postList === get get get' + userId + JSON.stringify(snapshot.nodeContent));
                if (snapshot.nodeContent) {
                    let powerObj = snapshot.nodeContent;
                    for (let index in powerObj) {
                        if (index.toString() === '215') {//多头启动服务
                            let powerData = {
                                'type': index,
                                'data': powerObj[index]
                            };

                            // let ceShiTest = {
                            //     "catid": 80,
                            //     "counts": 1,
                            //     "end_time": 1587865800,
                            //     "id": 2,
                            //     "pid": 215,
                            //     "start_time": 1584547200,
                            //     "status": 1,
                            //     "tid": 0,
                            //     "userid": 1,
                            //     "is_due": 0
                            // };

                            dispatch(userPower(powerObj[index], serverTime));
                            // console.log('活动服务 == ' + JSON.stringify(powerData));
                        }
                    }
                }
            });

            if (isGet) {
                callBack();
            }
        }
    }




    return (dispatch) => {
        //多头活动
        dispatch(duoTouGet(true));
        duoTou.on(listen_value, function (snapshot) {
            //console.log('多头活动postList === on on on' + userId + JSON.stringify(snapshot.nodeContent));
            dispatch(duoTouGet());
        });


        //点赞
        refLike.get(function (snapshot) {
            // console.log('点赞postList === get get get'+userId + JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'like'));
            } else {
                dispatch(userALLDataActionAPP2({}, 'like'));
            }
        });
        //点赞
        refLike.on(listen_value, function (snapshot) {
            refLike.get(function (snapshot) {
                // console.log('点赞postList === on on '+userId + JSON.stringify(snapshot.nodeContent)+JSON.stringify(snapshot));
                if (snapshot.nodeContent) {
                    dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'like'));
                } else {
                    dispatch(userALLDataActionAPP2({}, 'like'));
                }
            });
        });


        //理解
        refUnderstand.get(function (snapshot) {
            // console.log('理解postList === get get get'+userId + JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'understand'));
            } else {
                dispatch(userALLDataActionAPP2({}, 'understand'));
            }
        });
        //理解
        refUnderstand.on(listen_value, function (snapshot) {
            // console.log('理解postList ===111 on on '+userId + JSON.stringify(snapshot));
            refUnderstand.get(function (snapshot) {
                // console.log('理解postList === on on '+userId + JSON.stringify(snapshot.nodeContent)+JSON.stringify(snapshot));
                if (snapshot.nodeContent) {
                    dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'understand'));
                } else {
                    dispatch(userALLDataActionAPP2({}, 'understand'));
                }
            });
        });


        //自选股
        refP.get(function (snapshot) {
            // console.log('自选股postList === get'+userId + JSON.stringify(snapshot));
            let codes = ''
            if (snapshot.nodeContent) {
                codes = snapshot.nodeContent;
            }
            dispatch(saveAllSortAction(codes, 'personStock'));
            UserInfoUtil.personStockEmitter();

        });

        //自选股
        refP.on(listen_value, function (snapshot) {
            // console.log('自选股postList ===  on'+userId + JSON.stringify(snapshot));
            let codes = ''
            if (snapshot.nodeContent) {
                codes = snapshot.nodeContent;
            }
            dispatch(saveAllSortAction(codes, 'personStock'));
            UserInfoUtil.personStockEmitter();
        });


        //通知时间
        refTongZhi.get((snapshot) => {

            // console.log('通知时间postList === '+userId + JSON.stringify(snapshot));
            if (snapshot.nodeContent)
                dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'TongZhi'));
        })
        //实时监听通知时间
        refTongZhi.on(listen_value, function (snapshot, prev) {
            // console.log('通知时间postList === '+userId + JSON.stringify(snapshot));
            refTongZhi.get((snapshot) => {
                if (snapshot.nodeContent)
                    dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'TongZhi'));
            })
        });



        pushMessage.orderByKey().limitToLast(1).get(function (snapshot, prev) {
            // console.log('消息推送pushMessage === '+userId + JSON.stringify(snapshot));

            if (snapshot.nodeContent) {
                let datas = Object.values(snapshot.nodeContent);
                let keys = Object.keys(snapshot.nodeContent);
                if (datas.length > 0) {
                    let gonggao = { data: datas[0], _key: keys[0] };

                    let messageData = datas[0];
                    let permiss = UserInfoUtil.getUserPermissions();
                    if (permiss < 4) {
                        if (messageData.type === '热点聚焦') { return; }
                    }
                    dispatch(gongGaoAction([gonggao]));
                }
            }
        })

        pushMessage.orderByKey().limitToLast(1).on(listen_value, function (snapshot, prev) {
            //原来的公告信息 保存现在的推送消息
            pushMessage.orderByKey().limitToLast(1).get(function (snapshot) {
                // console.log('消息推送pushMessage === '+userId + JSON.stringify(snapshot));

                //原来的公告信息 保存现在的推送消息
                if (snapshot.nodeContent) {
                    let datas = Object.values(snapshot.nodeContent);
                    let keys = Object.keys(snapshot.nodeContent);
                    if (datas.length > 0) {
                        let gonggao = { data: datas[0], _key: keys[0] };
                        let messageData = datas[0];
                        let permiss = UserInfoUtil.getUserPermissions();
                        if (permiss < 4) {
                            if (messageData.type === '热点聚焦') { return; }
                        }
                        dispatch(gongGaoAction([gonggao]));
                    }
                }
            })
        })


        MiPushUtils.getRegId().then((localDevice) => {

            let permissions = UserInfoUtil.getUserPermissions();
            // let localDevice = '默认值淡定淡定';
            if (permissions >= 1) {
                dispatch(sedMid(localDevice));
            }
        });

    }
}


//游客登录获取点赞数据 通过设备标识
export let touristsLogin = (userId, success) => {
    let refLike = refHXG.ref("Users/" + userId + "/like");
    let refUnderstand = refHXG.ref("Users/" + userId + "/understand");
    let refP = refHXG.ref("Users/" + userId + "/OptionalStock/自选股");
    let refTongZhi = refHXG.ref("Users/" + userId + "/xiaoxi");
    let pushMessage = refHXG.ref("XiaoXiZhongXin");

    return (dispatch) => {

        if (!tourRefIsOn) {
            tourRefIsOn = true
            refLike.get(function (snapshot) {
                // console.log('点赞postList === get get get'+userId + JSON.stringify(snapshot.nodeContent));
                if (snapshot.nodeContent) {
                    dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'like'));
                } else {
                    dispatch(userALLDataActionAPP2({}, 'like'));
                }
            });

            //点赞
            refLike.on(listen_value, function (snapshot) {
                // console.log('点赞postList === on on 111'+userId + JSON.stringify(snapshot));
                refLike.get(function (snapshot) {
                    // console.log('点赞postList === on on '+userId + JSON.stringify(snapshot.nodeContent));
                    if (snapshot.nodeContent) {
                        dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'like'));
                    } else {
                        dispatch(userALLDataActionAPP2({}, 'like'));
                    }
                });
            });


            //理解
            refUnderstand.get(function (snapshot) {
                // console.log('理解postList === get get get'+userId + JSON.stringify(snapshot.nodeContent));
                if (snapshot.nodeContent) {
                    dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'understand'));
                } else {
                    dispatch(userALLDataActionAPP2({}, 'understand'));
                }
            });
            //理解
            refUnderstand.on(listen_value, function (snapshot) {
                // console.log('理解postList ===111 on on '+userId + JSON.stringify(snapshot));
                refUnderstand.get(function (snapshot) {
                    // console.log('理解postList === on on '+userId + JSON.stringify(snapshot));
                    if (snapshot.nodeContent) {
                        dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'understand'));
                    } else {
                        dispatch(userALLDataActionAPP2({}, 'understand'));
                    }
                });
            });

        }
        if (!tourZXGRef) {
            tourZXGRef = true
            //自选股
            refP.get(function (snapshot) {
                // console.log('自选股postList 游客 === '+userId + JSON.stringify(snapshot));
                if (snapshot.nodeContent)
                    // dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'ZiXuanGu'));
                    dispatch(saveAllSortAction(snapshot.nodeContent, 'personStock'));
            });
        }
        if (!tourLogin) {
            tourLogin = true;

            refTongZhi.get(function (snapshot) {
                // console.log('通知时间postList === '+userId + JSON.stringify(snapshot));
                if (snapshot.nodeContent)
                    dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'TongZhi'));
            });
            refTongZhi.on(listen_value, function (snapshot) {
                refTongZhi.get(function (snapshot) {
                    // console.log('通知时间postList === '+userId + JSON.stringify(snapshot));
                    if (snapshot.nodeContent)
                        dispatch(userALLDataActionAPP2(snapshot.nodeContent, 'TongZhi'));
                });
            });


            //通知 的module里面包含公告
            pushMessage.orderByKey().limitToLast(1).get(function (snapshot, prev) {
                // console.log('消息推送pushMessage === '+userId + JSON.stringify(snapshot));

                //原来的公告信息 保存现在的推送消息
                if (snapshot.nodeContent) {
                    let datas = Object.values(snapshot.nodeContent);
                    let keys = Object.keys(snapshot.nodeContent);
                    if (datas.length > 0) {
                        let moduleString = datas[0].type;
                        let gonggao = { data: datas[0], _key: keys[0] };
                        // console.log('消息推送pushMessage === '+userId + JSON.stringify(datas));
                        if (moduleString === '公告')
                            dispatch(gongGaoAction([gonggao]));
                    }
                }
            })
            pushMessage.orderByKey().limitToLast(1).on(listen_value, function (snapshot, prev) {
                //原来的公告信息 保存现在的推送消息
                pushMessage.orderByKey().limitToLast(1).get(function (snapshot, prev) {
                    // console.log('消息推送pushMessage === '+userId + JSON.stringify(snapshot));

                    //原来的公告信息 保存现在的推送消息
                    if (snapshot.nodeContent) {
                        let datas = Object.values(snapshot.nodeContent);
                        let keys = Object.keys(snapshot.nodeContent);
                        if (datas.length > 0) {
                            let moduleString = datas[0].type;
                            let gonggao = { data: datas[0], _key: keys[0] };
                            if (moduleString === '公告')
                                dispatch(gongGaoAction([gonggao]));
                        }
                    }
                })
            })

        }

    }
}

export let refOff = () => {
    let userInfo = UserInfoUtil.getUserInfoReducer().userInfo;

    let userID = userInfo && userInfo.userid;
    let userName = userInfo && userInfo.username;

    let refAppSSO = appssoRef.ref(userID);
    let refLike = refHXG.ref("Users/" + userID + "/like");
    let refUnderstand = refHXG.ref("Users/" + userID + "/understand");
    let refP = refHXG.ref("Users/" + userID + "/OptionalStock/自选股");
    let refTongZhi = refHXG.ref("Users/" + userID + "/xiaoxi");
    let pushMessage = refHXG.ref("XiaoXiZhongXin");
    let duoTou = duoTouRef.ref(userID);

    return (dispatch) => {
        //console.log("移出监听",refAppSSO)
        refAppSSO.off('value');
        refLike.off();
        refUnderstand.off();
        refP.off();
        refTongZhi.off();
        pushMessage.off();
        duoTou.off();
    }

};

export let logout = (isAppSso) => {
    let deviceID = UserInfoUtil.getDeviceID();

    let userId = UserInfoUtil.getUserId();
    let permissions = UserInfoUtil.getUserPermissions();
    let power = UserInfoUtil.getUserInfoReducer().cyPower;
    let pid = power.pid ? power.pid : 0;


    //去除所有标签
    // MiPushUtils.unSubscribe("yd_vip4")
    // MiPushUtils.unSubscribe("yd_vip3")
    // MiPushUtils.unSubscribe("yd_vip5")
    return (dispatch) => {
        tourRefIsOn = false;//判断自选股点赞是否标记
        tourZXGRef = false; //判断是否已经请求过自选股
        tourLogin = false

        isLogin = false;

        if (permissions >= 1) {
            if (!isAppSso) {
                dispatch(sendLogout(pid, userId));
            }
        }

        dispatch(refOff());
        dispatch(logoutAction());

        //用户退出后展示点赞的数据展示本机用户的内容
        dispatch(touristsLogin(deviceID))
        dispatch(caiYuanCheckState())
        // dispatch(isFirstUse(true));

        //退出记录时间
        let logoutTime = dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
        AsyncStorage.setItem('last_loginout_time', logoutTime + "", (error) => { });
    }


};


//退出登录
export let sendLogout = (pid, userid) => {

    let url = userInfoUrl + 'api/hxg/app/v1/logout';
    let typeSystem = getSystemType();
    let params = {
        'userid': userid,
        'pid': pid,
        'type': typeSystem
    }

    //合并请求设备信息的对象
    Object.assign(params, getDeviceInfos());

    // console.log("退出登录=========================",params)
    return (dispatch) => {
        Utils.post(url, params, (response) => {
            //console.log("fetch--------- 世雄logout === secc", response, userid);
            if (response.code == '10000') {
                DeviceEventEmitter.emit('LOGOUT_SUCCESS');
            }
        }, (error) => {
            //console.log("fetch--------- 世雄logout === fail", error, userid);
        })
    }
}

//发送小米id
export let sedMid = (mid) => {

    let nowTime = Date.parse(new Date()) / 1000;
    let userId = UserInfoUtil.getUserId();
    let power = UserInfoUtil.getUserInfoReducer().cyPower;
    let pid = power.pid ? power.pid : 0;
    let startTime = power.start_time ? power.start_time : nowTime;

    let url = userInfoUrl + 'api/hxg/v1/set_mid';
    let systemType = 1;
    if (systemID === 'ios') {
        systemType = 2;
    }
    let params = {
        'userid': userId,
        'pid': pid,
        'start_time': startTime,
        'mid': mid,
        'type': systemType
    }

    //console.log("小米id == ", url, params);

    return (dispatch) => {
        Utils.post(url, params, (response) => {
            //console.log("fetch--------- 世雄secc", response, userId);
        }, (error) => {
            //console.log("fetch--------- 世雄fail", error, userId);
        })
    }
}


/**
 * 注册
 * @param username
 * @param password
 * @param successCallback
 * @param failCallback
 * @returns {function()}
 */

export let register = (param, successCallback, failCallback) => {

    let urlS = userInfoUrl + 'api/hxg/v2/reglogin';
    // let param = {'username':username,'password':password};
    param.catid = catid;//产 品id,慧选股默认为 70
    param.port = port;//1为PC,2为App,3为公众号

    let systemType = getSystemType();
    param.type = systemType;//0为Android,1为ios,2为window

    //合并请求设备信息的对象
    Object.assign(param, getDeviceInfos());
    Object.assign(param, getChannel());

    // console.log('urlS === ' + urlS + ',param = ', param);
    return (dispatch) => {
        dispatch(refOff());
        Utils.post(urlS, param, (response) => {
            // console.log('注册成功 === ', response);
            dispatch(loginResponse(response, successCallback, failCallback))

        }, (error) => {
            isLogin = false;
            dispatch(refOff());
            failCallback && failCallback('网络失败');
        });
    }
};

/**
 * 修改用户信息
 * @param param  需要修改的信息 {}
 * @returns {function()}
 */
export let changeUserInfo = (param, successCallback, failCallback) => {
    let urlS = userInfoUrl + 'api/hxg/v1/edit_user';

    return (dispatch) => {
        Utils.post(urlS, param, (response) => {
            if (response.code.toString() === '10000') {
                successCallback && successCallback(response.msg);
                dispatch(changeInfoAction(param));
            } else {
                failCallback && failCallback(response.msg);
            }
        }, (error) => {
            failCallback && failCallback(error);
        });
    }
};

let changeInfoAction = (param) => {

    return {
        type: actionType.USER_INFO_CHANGE,
        param,
    }
};

/**
 * 忘记密码 （根据具体的接口在修改）
 * @param username
 * @param password
 * @returns {function(*)}
 */
export let changePassword = (param, successCallback, failCallback) => {
    let urlS = userInfoUrl + 'api/hxg/v2/forget_pass';
    param.catid = catid;
    param.port = port;

    // console.log('忘记密码 = ' + JSON.stringify(param) + urlS);

    return (dispatch) => {
        Utils.post(urlS, param,
            (response) => {
                if (response.code.toString() === '10000') {
                    // dispatch(userPassword(password));
                    successCallback && successCallback(response.msg);
                } else {
                    failCallback && failCallback(response.msg);
                    // failCallback && failCallback('密码修改失败');
                }
            },
            (error) => {
                failCallback && failCallback('网络失败');
            },
        )
    }
};


/**
 * 修改密码 （根据具体的接口在修改）
 * @param username
 * @param password
 * @returns {function(*)}
 */

export let changeNewPassword = (username, oldPassword, newPassword, successCallback, failCallback) => {
    let urlS = userInfoUrl + 'api/hxg/v1/edit_pass';

    let param = { 'username': username, 'password': newPassword, 'oldpassword': oldPassword, 'catid': catid };
    // console.log('修改密码 = ' + JSON.stringify(param) + urlS);

    return (dispatch) => {
        Utils.post(urlS, param,
            (response) => {
                //console.log('修改密码 =response ' + JSON.stringify(response));
                if (response.code.toString() === '10000') {
                    dispatch(userPassword(newPassword));
                    successCallback && successCallback(response.msg);
                } else {
                    failCallback && failCallback(response.msg);
                    // failCallback && failCallback('密码修改失败');
                }
            },
            (error) => {
                failCallback && failCallback(error);
            },
        )
    }
};


export let phoneVeri = (mobile, successCallback, failCallback, isRegister) => {

    let urlS = userInfoUrl + 'api/hxg/v2/send_code';//验证手机号
    if (isRegister && isRegister === 'reg_send_code') {
        urlS = userInfoUrl + 'api/hxg/v2/reg_send_code';//注册验证手机号
    } else if (isRegister && isRegister === 'sms') {
        urlS = userInfoUrl + 'api/hxg/v2/sms';//只发送验证码
    }
    let param = { 'phone': mobile, 'port': port };

    // console.log('发送验证码 == ', urlS, param);
    return (dispatch) => {

        Utils.post(urlS, param,
            (response) => {
                // alert(JSON.stringify(response));
                // console.log('验证密码'+JSON.stringify(response) + urlS +'param '+param);
                successCallback && successCallback(response);
            },
            (error) => {
                // console.log('验证密码'+error);
                failCallback && failCallback(error);
            },
        )

    }
};


export let isFirstUse = (isFirst) => {
    return {
        type: actionType.USER_IS_FIRST_USE,
        isFirst,
    }
};


export let historyUser = (username) => {
    return {
        type: actionType.USER_LOGIN_ADD_HISTORYS,
        username,
    }
};

/**
 * 点赞接口
 * @param userID
 * @param key
 * @param op
 * @param model
 * @param columnId
 * @param flag
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */
export let ydgpZanNew = (key, op, model, columnId, flag, successCallback, failCallback, system, creationTime) => {

    return (dispatch) => {
        if (getHXGUrl(model)) {
            dispatch(zanHXG(key, op, model, successCallback, failCallback, system, creationTime));
        } else {
            dispatch(ydgpZan(key, op, model, columnId, flag, successCallback, failCallback));
        }
    }
};

let ydgpZan = (key, op, model, columnId, flag, successCallback, failCallback) => {
    let userID = UserInfoUtil.getUserId();

    let urlString = ydgpURL2;
    let param = {
        userId: userID,
        id: key,
        m: appModel,
        op: op,
        model: model,
    };

    if (columnId) {
        param.columnId = columnId;
    }

    if (flag) {
        param.flag = flag;
    }

    let urlS = urlString + 'like';

    // console.log('慧选股点赞 财源== ', urlS, param);
    return (dispatch) => {
        Utils.post(urlS, param, (response) => {
            //console.log('慧选股点赞 财源== ', JSON.stringify(response));
            if (response.code == 1) {
                //游客登录  防止第一次进入app 监听不到这个节点
                if (UserInfoUtil.getUserPermissions() < 1) {
                    dispatch(touristsLogin(UserInfoUtil.getDeviceID()));
                }
                successCallback && successCallback(response);
            } else {
                let message = response.message;
                failCallback && failCallback(message);
            }
        }, (error) => {
            //console.log('慧选股点赞 财源== 失败', JSON.stringify(error));
            failCallback && failCallback(error);
        });
    }

}

let zanHXG = (key, op, model, successCallback, failCallback, system, creationTime) => {
    let userID = UserInfoUtil.getUserId();
    let permissions = UserInfoUtil.getUserPermissions();
    if (permissions <= 1) {
        permissions = 0;
    }
    let urlString = cyURL.urlHXG_zan + 'ydhxg/';
    let param = {
        module: model,
        id: key,
        userId: userID,
        type: op,
        star: permissions,
        system: system,
        creationTime: creationTime,
    }
    let urlS = urlString + 'likeAll';

    // console.log('慧选股点赞 == url', urlS, param);
    return (dispatch) => {
        Utils.post(urlS, param, (response) => {
            // console.log('慧选股点赞 == ', JSON.stringify(response));
            if (response.state) {
                //游客登录  防止第一次进入app 监听不到这个节点
                if (UserInfoUtil.getUserPermissions() < 1) {
                    dispatch(touristsLogin(UserInfoUtil.getDeviceID()));
                }
                successCallback && successCallback(response);
            } else {
                let message = response.message;
                failCallback && failCallback(message);
            }
        }, (error) => {
            failCallback && failCallback(error);
        });
    }
}

export let understand = (key, mark, model, successCallback, failCallback, system, creationTime) => {
    return (dispatch) => {
        if (getHXGUrl(model)) {
            dispatch(zanHXG(key, mark, model, successCallback, failCallback, system, creationTime));
        } else {
            dispatch(understandYDPG(key, mark, model, successCallback, failCallback));
        }
    }
}

let understandYDPG = (key, mark, model, successCallback, failCallback) => {
    let userID = UserInfoUtil.getUserId();

    let urlString = ydgpURL2;
    let param = {
        userId: userID,
        id: key,
        m: appModel,
        op: 1,
        model: model,
        mark: mark,
    };

    let urlS = urlString + 'understand';
    //console.log('慧选股理解 财源== ', urlS, param);
    return (dispatch) => {
        Utils.post(urlS, param, (response) => {
            //console.log('慧选股理解 财源== ', JSON.stringify(response));
            if (response.code == 1) {
                //游客登录  防止第一次进入app 监听不到这个节点
                if (UserInfoUtil.getUserPermissions() < 1) {
                    dispatch(touristsLogin(UserInfoUtil.getDeviceID()));
                }
                successCallback && successCallback(response);
            } else {
                let message = response.message;
                failCallback && failCallback(message);
            }
        }, (error) => {
            //console.log('慧选股理解 财源== 失败', JSON.stringify(error));
            failCallback && failCallback(error);
        });
    }
}


/**
 * 浏览量
 * @param userID
 * @param key
 * @param model
 * @param columnId
 * @param flag
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */
export let viewNumberNew = (userID, key, model, columnId, flag, successCallback, failCallback) => {

    //获取对应模块的url地址
    let urlString = ydgpURL2;
    let urlS = urlString + 'view';

    let param = {
        userId: userID,
        id: key,
        m: appModel,
        model: model,
        columnId: columnId,
        flag: flag,
        systemId: systemID,
    };

    return (dispatch) => {
        Utils.post(urlS, param, (response) => {
            if (response.code == 1) {
                successCallback && successCallback(response);
            } else {
                let message = response.message;
                failCallback && failCallback(message);
            }
        }, (error) => {
            failCallback && failCallback(error);
        });
    }
};

/**
 * 源达股票 分享成功后调用的接口
 * @param key
 * @param model
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */
export let ydgpShareNew = (key, model, successCallback, failCallback) => {

    //获取对应模块的url地址
    let urlString = ydgpURL2;
    let urlS = urlString + 'share';
    let param = {
        id: key,
        m: appModel,
        model: model,
        systemId: systemID,
    };
    return (dispatch) => {
        Utils.post(urlS, param, (response) => {
            if (response.code == 1) {
                successCallback && successCallback(response);
            } else {
                let message = response.message;
                failCallback && failCallback(message);
            }
        }, (error) => {
            failCallback && failCallback(error);
        });
    }
};


/**
 * 多头活动分享后接口
 */
export let shareDuoTou = (successCallback, failCallback) => {
    let urlS = cyURL.urlHXG_xg + '/tuoke/user/share';
    let userId = UserInfoUtil.getUserInfoReducer().userInfo.userid;
    let userPhone = UserInfoUtil.getUserInfoReducer().userInfo.phone;
    let userName = UserInfoUtil.getUserInfoReducer().userInfo.username;
    let activityId = ScreenUtil.duoTouQiDongId;
    let activityName = ScreenUtil.duoTouQiDongName;

    let param = {
        userId: userId,
        userPhone: userPhone,
        userName: userName,
        activityId: activityId,
        activityName: activityName,
    };

    //console.log('多头分享 ==== ', urlS, param);
    return (dispatch) => {
        Utils.postFormData(urlS, param, (response) => {
            //console.log('多头分享 ==== ', JSON.stringify(response));
            if (response.state) {
                successCallback && successCallback(response);
            } else {
                let message = response.msg;
                failCallback && failCallback(message);
            }
        }, (error) => {
            failCallback && failCallback(error);
        });
    }
}


/**
 * 通知最后阅读时间
 * @param userID
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */
export let tongZhiTim = (userID, successCallback, failCallback) => {
    let urlS = cyURL.urlHXG_xg + '/functionManage/xiaoxi?id=' + userID;
    let param = {
        userId: userID,
    };
    // {"msg":"成功","data":false,"state":true}
    return (dispatch) => {
        Utils.post(urlS, param, (response) => {

            //console.log('通知时间 ==== ', JSON.stringify(response));
            if (response.state) {
                successCallback && successCallback(response);
            } else {
                let message = response.msg;
                failCallback && failCallback(message);
            }
        }, (error) => {
            failCallback && failCallback(error);
        });
    }
}



/**
 * 获取caiYuanVersion
 *
 * 通过对比版本号 ：Android和ios版本号必须统一
 *
 * @param typeString 0强制更新 1检测
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */

export let caiYuanCheckVersion = (typeString, successCallback, failCallback) => {
    let urlS = checkUpdates + 'api/app_version/get_version';

    let param = {
        catid: catid,//财源65  源达68  慧选股70
        type: typeString,//1，检测  0强制更新
    };

    //console.log('检测更新 ==== ', urlS, typeString);
    return (dispatch) => {
        Utils.post(urlS, param, (response) => {
            //console.log('检测更新 ==== ', JSON.stringify(response), typeString);
            if (response.code === '10000') {
                if (typeString === '0') {
                    let version = response.data;
                    dispatch(changeVersion(version));
                }
                successCallback && successCallback(response);
            } else {
                let message = response.msg;
                failCallback && failCallback(message);
            }
        }, (error) => {
            failCallback && failCallback(error);
        });
    }
}


/**
 * 获取财源股票状态get_power
 *
 *
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */

export let caiYuanCheckState = (successCallback, failCallback, lastTime) => {
    //console.log('免登陆=== ', UserInfoUtil.getUserInfo());
    let urlS = userInfoUrl + 'api/hxg/app/v1/no_login';
    let version = getVersion();
    let userID = UserInfoUtil.getUserId();

    let param = {
        userid: userID,
        version: version,
        type: 1,
    };

    //上次退出时间
    if (lastTime != 0) {
        param.last_time = lastTime;
    }
    //合并请求设备信息的对象
    Object.assign(param, getDeviceInfos());

    //   console.log('游客登录 == ', urlS, param,lastTime);
    return (dispatch) => {
        AsyncStorage.getItem('nologin_last_loginout_time').then((result) => {
            if (result && result != 'undefined') {
                param.last_time = result;
            } else {
                let logoutTime = dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
                param.last_time = logoutTime;
            }
            //console.log('no_login url=' + urlS + ' param=' + JSON.stringify(param));

            Utils.post(urlS, param, (response) => {
                if (response.code === '10000') {
                    //console.log('游客登录 == ', response);
                    let check = response.data.check;
                    // check = 1;

                    let tokenString = response.data.token;
                    if (UserInfoUtil.getUserPermissions() < 1) {
                        // console.log('游客登录之后 token = ', tokenString);
                        // console.log('游客登录之后 token = ', UserInfoUtil.getUserInfo().password);
                        //console.log('游客登录之后 token ***********= ',UserInfoUtil);
                        dispatch(loginSuccess(tokenString));
                        DeviceEventEmitter.emit('LOGIN_SUCCESS');
                    }
                    if (systemID == 'ios') {
                        dispatch(changeCheck(check));
                    }
                    successCallback && successCallback(response);
                    //记录退出时间
                    AsyncStorage.setItem('nologin_state', "login", (error) => { });
                    let time = dateFormats("yyyy-MM-dd hh:mm:ss", new Date());
                    AsyncStorage.setItem('nologin_last_loginout_time', time + "", (error) => { });
                } else {
                    let message = response.message;
                    failCallback && failCallback(message);
                }
            }, (error) => {
                failCallback && failCallback(error);
            });
        })
    }
}

let changeVersion = (versionMessage, checkMessage) => {
    return {
        type: actionType.GET_APP_VERSION,
        versionMessage,
        checkMessage
    }
};
let changeCheck = (checkMessage) => {
    return {
        type: actionType.GET_APP_IOSCHECK,
        checkMessage
    }
};

/**
 * 新行情 获取资讯数据
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */
export let lastesNews = (page, size, successCallback, failCallback) => {

    // let urlS = F10Url+'apis/fis/v1/pcapp/nar/latestNews?page='+page+'&size='+size;
    // // let param = {
    // //     page:page,
    // //     size: size,
    // // };
    // console.log('新行情 获取f10数据 urlS=== '+urlS );
    // return (dispatch) => {
    //     Utils.get(urlS, (response) => {
    //         if (response.state) {
    //             console.log('新行情 获取f10数据 成功 == ');
    //             successCallback && successCallback(response.data);
    //         } else {
    //             let message = response.msg;
    //             console.log('新行情 获取f10数据 失败 == ' + message + urlS);
    //             failCallback && failCallback(message);
    //         }
    //     }, (error) => {
    //         console.log('新行情 获取f10数据 == ' + error);
    //         failCallback && failCallback(error);
    //     });
    // }

    let urlS = F10Url + 'F10/zuixinxinwen.json'
    //console.log('新行情 获取f10数据 urlS=== ' + urlS);
    return (dispatch) => {
        Utils.get(urlS, (response) => {
            //console.log('新行情 获取f10数据 成功 == ');
            successCallback && successCallback(response);

        }, (error) => {
            //console.log('新行情 获取f10数据 == ' + error);
            failCallback && failCallback(error);
        });
    }

}

/**
 * 新行情 个股公告数据
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */
export let geGuGongGao = (code, successCallback, failCallback) => {

    let urlS = geGuNewsUrl + 'F10/gggg/' + code + '.json'
    //console.log('新行情 个股公告数据 urlS=== ' + urlS);
    return (dispatch) => {
        Utils.get(urlS, (response) => {
            //console.log('新行情 个股公告数据 成功 == ');
            successCallback && successCallback(response);

        }, (error) => {
            //console.log('新行情 个股公告数据 == ' + error);
            failCallback && failCallback(error);
        });
    }
}

/**
 * 源达 个股新闻
 * @param successCallback
 * @param failCallback
 * @returns {function(*)}
 */
export let geGuXinWen = (code, successCallback, failCallback) => {

    let urlS = geGuNewsUrl + 'F10/ggxw/' + code + '.json'
    //console.log('新行情 个股新闻 urlS=== ' + urlS);
    return (dispatch) => {
        Utils.get(urlS, (response) => {
            //console.log('新行情 个股新闻 成功 == ');
            successCallback && successCallback(response);

        }, (error) => {
            //console.log('新行情 个股新闻 == ' + error);
            failCallback && failCallback(error);
        });
    }
}
