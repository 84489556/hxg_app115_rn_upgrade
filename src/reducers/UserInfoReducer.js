/**
 * Created by cuiwenjuan on 2017/8/9.
 */
import * as typeAction from '../actions/actionTypes'

const initialState = {
    password: '',//用户密码
    userName: '',//用户名
    wxUnionid:'',//微信唯一标识id
    cyPower: {},//财源滚滚 服务
    hdPower:{},//活动权限信息
    userInfo: {},//用户信息
    token: '',
    appsso: '',
    appssoSame: true,
    userMessageGongG: [],//我的消息 和公告
    personStocks: [],//我的自选股
    personTStocks: [],//游客新操作数据
    permissions: 0,  //财源股票 0：未登录 1：普通用户 3:三星  4：四星， 5：五星，
    activityPer:'', //活动权限：'215'：多头活动
    zan: {},
    understand:{},//理解
    isFirst: '0.0.0',//是否是第一次使用//每个版本都需要有引导页，这里使用版本号进行标识
    historyArray: [],
    serverTime: null,//服务器时间
    tongZhiTime: null, //通知时间戳
    versionMessage: {},
    checkMessage: 0,
    kaiPingMessage:{},
    tanKuangMessage:{},

};

var getServersDays = (endTime, nowTime) => {

    if (!nowTime) {
        nowTime = Date.parse(new Date()) / 1000;
    }

    let date3 = endTime * 1000 - nowTime * 1000;
    let dayNumber = Math.floor(date3 / (24 * 3600 * 1000));
    //console.log('dayNumberdayNumberdayNumberdayNumber = '+dayNumber);
    if (dayNumber === 0 && date3 > 0) {
        dayNumber = 0;
    } else if (dayNumber < 0 && date3 <= 0) {
        dayNumber = -1;
    }
    return dayNumber;
};



let UserInfoReducer = (state = initialState, action) => {
    switch (action.type) {
        case typeAction.USER_PASSWORD:
            return Object.assign({}, state, {
                password: action.password,
            });

        case typeAction.USER_APP_SS0:
            return Object.assign({}, state, {
                appssoSame: action.appssoSame,
            });
        case typeAction.USER_LOGIN_TOKEN:

            let appssoString = action.appsso ? action.appsso : state.appsso

            return Object.assign({}, state, {
                token: action.token,
                appsso: appssoString,
                appssoSame: true,
            });

        case typeAction.USER_LOGIN_INFO:
            return Object.assign({}, state, {
                userInfo: action.userInfo,
                userName: action.userInfo.username,
                wxUnionid:action.userInfo.wxUnionid,
            });

        //修改用户信息
        case typeAction.USER_INFO_CHANGE:

            let userI = state.userInfo;
            if (action.param.nickname) {
                userI.nickname = action.param.nickname
            }
            if (action.param.avatar) {
                userI.avatar = action.param.avatar
            }
            return Object.assign({}, state, {
                userInfo: userI,
            });

        //权限
        case typeAction.USER_LOGIN_POWER:
            let powerdata = 1;
            let power = {};
            let huoDPower = {};
            let currentPer = state.permissions;
            let currentPower = state.cyPower;
            let activityP = '';
            if (action.snapshot) {
                let powerData = action.snapshot;
                if(powerData.pid && powerData.pid.toString() === '215'){//多头活动
                    huoDPower = powerData;
                    power = currentPower;
                    powerdata = currentPer;
                    //先判断之前权限, 付费到期
                    if(currentPer === 1){
                        activityP = DuoTou;
                        // powerdata = 2;
                        //登录用户， 多头启动用户，付费到期后-》多头启动到期
                        power = huoDPower;
                        power.isStart = true;
                        let days = getServersDays(huoDPower.end_time, action.serverTime);
                        power.numberDays = days;
                        power.permissions = DuoTou;

                        if(days < 0){
                            powerdata = 1;
                            activityP = '';
                            //付费到期的
                            if(currentPower && currentPower.permissions && currentPower.permissions >= 3){
                                if(huoDPower.end_time <= currentPower.end_time){
                                    power = currentPower;
                                }
                            }
                        }
                    }

                }else {
                    power = powerData;
                    power.isStart = false;

                    if (powerData.pid.toString() === '157') {//三星
                        powerdata = 1;
                        power.isStart = true;
                        power.permissions = 3;

                        let days = getServersDays(power.end_time, action.serverTime);
                        power.numberDays = days;

                        if (power.start_time >= action.serverTime) {//未开始
                            power.isStart = false;
                        } else if (days >= 0) {//未过期
                            powerdata = 3;
                        }

                    } else if (powerData.pid.toString() === '158') {//四星
                        powerdata = 1;
                        power.isStart = true;
                        power.permissions = 4;

                        let days = getServersDays(power.end_time, action.serverTime);
                        power.numberDays = days;
                        if (power.start_time >= action.serverTime) {
                            power.isStart = false;
                        } else if (days >= 0) {
                            powerdata = 4;
                        }

                    } else if (powerData.pid.toString() === '159') {//五星
                        powerdata = 1;
                        power.isStart = true;
                        power.permissions = 5;

                        let days = getServersDays(power.end_time, action.serverTime);
                        power.numberDays = days;
                        if (power.start_time >= action.serverTime) {
                            power.isStart = false;
                        } else if (days >= 0) {
                            powerdata = 5;
                        }
                    }
                }

            }


            return Object.assign({}, state, {
                permissions: powerdata,
                hdPower:huoDPower,
                cyPower: power,
                serverTime: action.serverTime,
                activityPer:activityP,
            });

        case typeAction.USER_ALL_DATA_APP2:
            let tongzhiT = null;
            let zanS = {};
            let understandS = {};

            let keyLeixing = action.typeA;
            //console.log('用户数据 类型 = '+keyLeixing);

            let datas = Object.values(action.snapshot);
            let keys = Object.keys(action.snapshot);

            //console.log('用户数据 类型 = datas '+JSON.stringify(datas));


            if(keyLeixing === 'TongZhi'){
                tongzhiT = datas[0];
            }
            else if (keyLeixing === 'like'){
                keys.forEach((keyString) => {
                    let likeData = action.snapshot[keyString];
                    let zanArray = Object.keys(likeData);
                    zanS[keyString] = zanArray;
                })

            }else if(keyLeixing === 'understand'){
                keys.forEach((keyString) => {
                    let likeData = action.snapshot[keyString];
                    // let understandArray = Object.keys(likeData);
                    understandS[keyString] = likeData;
                })
            }

            if(keyLeixing === 'TongZhi'){
                return Object.assign({},state,{
                    tongZhiTime:tongzhiT,
                });
            }

            if(keyLeixing === 'like'){
                return Object.assign({},state,{
                    zan:zanS,
                });
            }

            if(keyLeixing === 'understand'){
                return Object.assign({},state,{
                    understand:understandS,
                });
            }



        //公告 消息
        case typeAction.USER_CENTER_MESSAGE_GONGGAO:

            let gonggaos = [];
            gonggaos = action.gongGaos;

            //消息和公告合并
            // for(var i in state.userMessage){
            //     gonggaos.push(state.userMessage[i]);
            // }
            //排序
            gonggaos.sort((a, b) => {
                return b._key - a._key;
            });

            return Object.assign({}, state, {
                userMessageGongG: gonggaos,
            });



        //自选股
        case typeAction.USER_SAVE_ALL_STOCKS:
            {
                let codeString = action.personCode;
                //源达云 无数据返回的不是null 而是'null'字符串，过滤
                let codeA = (codeString && codeString !== 'null') ?  codeString.split(",") : [];
                let newStocks = [];

                codeA.map((info) => {
                    if(info && info !== 'undefined' && info !== '') {
                        let i = newStocks.indexOf(info)
                        if(i === -1){//去重复数据
                            newStocks.push(info)
                        }
                    }
                })

                if (action.isTouri) {//用户数据操作
                    return Object.assign({}, state, {
                        personStocks: newStocks
                    })
                } else {//未登录用户新数据
                    return Object.assign({}, state, {
                        personTStocks: newStocks
                    })
                }
            }

        case typeAction.USER_IS_FIRST_USE:
            return Object.assign({}, state, {
                isFirst: action.isFirst
            });

        //历史账号
        case typeAction.USER_LOGIN_ADD_HISTORYS:
            let historys = Array.from(state.historyArray);
            let username = action.username;
            let threeHistory = [];

            let i = historys.indexOf(username);
            if (i > -1) {
                historys.splice(i, 1)
                historys.unshift(username)
            }
            if (i === -1) {
                historys.unshift(username)
            }

            if (historys.length > 3) {
                threeHistory = historys.slice(0, 3);
            } else {
                threeHistory = historys;
            }
            return Object.assign({}, state, {
                historyArray: threeHistory
            });

        case typeAction.GET_APP_VERSION:
            return Object.assign({}, state, {
                versionMessage: action.versionMessage
            });
        case typeAction.GET_APP_IOSCHECK:
            return Object.assign({}, state, {
                checkMessage: action.checkMessage
            });

        case typeAction.USER_YXHD_INFO://营销活动
            let dataMessage = action.data;
            let kaiPing = dataMessage.KaiPing;
            let tanKuang = dataMessage.ShouYeTanKuang;
            //console.log('营销活动 ==== ',dataMessage,kaiPing,tanKuang);

            return Object.assign({}, state, {
                kaiPingMessage:kaiPing,
                tanKuangMessage:tanKuang,
            });

        //移除本地数据  全部删除
        case typeAction.USER_REMOVE_PERSON_STOCKS:
            return Object.assign({}, state, {
                personTStocks: []
            })


        //退出
        case typeAction.USER_LOGOUT:

            return Object.assign({}, state, {
                // password:'',//用户密码
                cyPower: {},
                huoDPower:{},
                userInfo: {},//用户信息
                token: '',
                appsso: '',
                appssoSame: true,
                // userMessageGongG:[],//我的消息 和公告
                personStocks: [],//我的自选股
                permissions: 0,// 1：游客， 2：注册用户， 3：普通版， 4：专业版
                activityPer:'',
                zan: {},
                understand:{},
            });

        default:
            return state;
    }
};

export default UserInfoReducer;


