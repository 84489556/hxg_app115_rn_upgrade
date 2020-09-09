/**
 * Created by cuiwenjuan on 2017/8/22.
 */

import React, { Component } from 'react';
import { DeviceEventEmitter } from 'react-native';
import store from '../Store'
import * as UserInfoAction from '../actions/UserInfoAction'
import * as UserIMAction from '../actions/UserIMAction'
// import * as AllAction from  '../actions/AllActions'
import { personStocksChange, getHeaderImageW, toast } from '../utils/CommonUtils'
import DeviceInfo from 'react-native-device-info';
import RequestInterface from '../actions/RequestInterface'
import AsyncStorage from '@react-native-community/async-storage';

//点赞数据
export const ZAN_ZhaoZhiXiao = '4000'; // 早知晓
export const ZAN_WuWeiQuShiZhanFa = 'WuWeiQuShiZhanFa'; //五维趋势战法
export const ZAN_LiNianKe = 'LiNianKe'; // 理念可
export const ZAN_ShiZhanKe = 'ShiZhanKe'; // 实战课
export const ZAN_DaKaLaiLe = 'DaKaLaiLe'; // 大咖来了
export const ZAN_XiaoBaiKe = 'XiaoBaiKeTang'; // 小白课
export const ZAN_GuPiaoChi = 'GuPiaoChi'; // 股票池
export const ZAN_YanBaoDianJing = 'YanBaoDianJin'; // 研报点金
export const ZAN_ZhiBoJian = 'ZhiBoJian'; // 直播间
export const ZAN_GuanDianZhiBo = '1000';// 观点直播//'PanZhongGuanDian'; //盘中观点
export const ZAN_ZhiBiao = 'ZhiBiao'; //
export const ZAN_LongHuKeTang = 'LongHuKeTang'; //龙虎课堂
export const ZAN_CeLueXueTang = '2000'; // 策略学堂点赞
export const Unders_CeLueXueTang = '2500'; // 策略学堂是否理解
export const ZAN_ZhiBiaoKeTang = '3000'; // 指标课堂点赞
export const Unders_ZhiBiaoKeTang = '3500'; // 指标课堂是否理解



//model类型new
export const MODEL_daKaLaiLa = '1'; // 大咖来了
export const MODEL_wuWeiQuShiZhanFa = '2'; // 理念课，五维趋势战法
export const MODEL_zaoZhiXiao = ZAN_ZhaoZhiXiao; // 早知晓
export const MODEL_panZhongGuanDian = ZAN_GuanDianZhiBo; //观点直播//'5'; // 盘中观点
export const MODEL_shiZhanKe = '7'; // 实战课
export const MODEL_xiaoBaiKeTang = '4'; // 小白课堂
export const MODEL_yanBaoDianJin = '6'; // 研报点金
export const MODEL_guPiaoCi = '8'; // 股票池
export const MODEL_panQianJiDu = '18'; // 盘前解读
export const MODEL_wuJianFenXi = '10'; // 午间分析
export const MODEL_shouPanDianPing = '11'; // 收盘点评
export const MODEL_zunXiangGuPiaoCi = '12'; // 尊享股票池
export const MODEL_reDianJuJi = '13'; // 热点狙击
export const MODEL_touYanJinGu = '14'; // 投研金股
export const MODEL_jiChuKeLiBiao = '15'; // 基础课列表
export const MODEL_gongKaiKeLieBiao = '16'; // 公开课列表
export const MODEL_longHuKeTang = 'LongHuKeTang'; // 龙虎课堂
export const MODEL_CyReDianKeTang = 'CyReDianKeTang'; // 热点课堂s
export const MODEL_ZAN_CeLueXueTang = ZAN_CeLueXueTang; // 策略学堂点赞
export const MODEL_Unders_CeLueXueTang = Unders_CeLueXueTang; // 策略学堂是否理解
export const MODEL_ZAN_ZhiBiaoKeTang = ZAN_ZhiBiaoKeTang; // 指标课堂点赞
export const MODEL_Unders_ZhiBiaoKeTang = Unders_ZhiBiaoKeTang; // 指标课堂是否理解





//分享类型
/**
 * type= 1微信好友
 type=2 微信朋友圈
 type=3 QQ好友
 type=4 QQ空间
 type= 5 微博
 type=6 圈子好友
 * @type {string}
 */
export const SHARE_WECHAT_SESSION = '1'; //微信好友
export const SHARE_WECHAT_TIMELINE = '1'; //微信朋友圈
export const SHARE_QQ = '1'; //QQ好友
export const SHARE_QZONE = '1'; //QQ控件
export const SHARE_WEIBO = '1'; //微博


//本地股票最大个数
export const STOCK_MAX_NUMBER = 100;


export default {


    /**
     * 获取版本信息
     * @returns {string}
     */
    getVersion() {
        return DeviceInfo.getVersion();
    },
    /**
         * 获取版本build号
         * @returns {string}
         */
    getBuildNumber() {
        return DeviceInfo.getBuildNumber();
    },
    /**
     * 获取设备唯一标识
     * @returns {string}
     */
    getDeviceID() {
        return DeviceInfo.getUniqueId();
    },

    /**
     * 返回用户userid
     * @returns {*}
     */
    getUserId() {
        let userId = store.getState().UserInfoReducer.userInfo.userid ?
            store.getState().UserInfoReducer.userInfo.userid
            : this.getDeviceID();
        return userId;
    },

    /**
     * 返回用户名 （是手机号 非昵称 ）
     * @returns {*|string}
     */
    getUserName() {
        let name = store.getState().UserInfoReducer.userInfo.username ?
            store.getState().UserInfoReducer.userInfo.username : '源达股票';
        return name;
    },

    /**
     * 返回昵称
     * @returns {*|string}
     */
    getNickName() {
        return store.getState().UserInfoReducer.userInfo.nickname;
    },

    /**
     * 返回用户头像
     */
    getUserHeader() {
        let headerS = 'default_header';
        if (this.getUserInfo().avatar) {

            headerS = this.getUserInfo().avatar;
        }
        return headerS;
    },

    /**
     * 返回用户信息
     * @returns {*|string}
     */
    getUserInfo() {
        return store.getState().UserInfoReducer.userInfo;
    },

    /**
     * 慧选股 返回用户权限类型 0：游客，1：登录用户 3：三星， 4：四星， 5：五星
     * @returns {*|string}
     */
    getUserPermissions() {

        let permiss = store.getState().UserInfoReducer.permissions;
        let check = store.getState().UserInfoReducer.checkMessage > 0;

        if (check && permiss >= 1) {
            permiss = 5;
        }
        // permiss = 5;
        return permiss;
    },

    /**
     * 权限倒计时
     */
    getPermissionsTimer() {
        //let
        let power = this.getUserInfoReducer().cyPower;
        let endTime = power && power.end_time;
        let date = endTime * 1000 - new Date().getTime();

        // console.log('权限获取倒计时 ==== ',date, endTime,new Date().getTime());
        if (date < (24 * 3600 * 1000) && date > 0 && !this._timer) {
            this._timer = setInterval(() => {
                // console.log('权限获取倒计时 ==== 倒计时',date);
                if (endTime < new Date().getTime() / 1000) {
                    this._timer && clearInterval(this._timer);
                    store.dispatch(UserInfoAction.resetPower());
                }
            }, 1000 * 60);
        }
    },


    /**
     * 返回到期天数dayNumber，
     * dayNumber > 0: 未到期，  dayNumber <= 0: 到期
     */
    getUserServersDays() {

        let endTime = this.getUserInfoReducer().cyPower.end_time
        // endTime = '1528707792';
        let date3 = endTime * 1000 - new Date().getTime();
        let dayNumber = Math.floor(date3 / (24 * 3600 * 1000));
        if (dayNumber === 0 && date3 > 0) {
            dayNumber = 1;
        } else if (dayNumber <= 0 && date3 <= 0) {
            // dayNumber = 0;
        }
        return dayNumber;
    },

    /**
     * 返回用户权限类型名称 0：游客， 1：注册用户， 2：专业版
     * @returns {*|string}
     */
    getUserPermissionsName() {
        let permissions = this.getUserPermissions();
        return permissions == 2 ? "专业版" :
            permissions == 1 ? "注册用户" : "游客";
    },

    /**
     * 返回所有的 userinfoReducer
     * @returns {*}
     */
    getUserInfoReducer() {
        return store.getState().UserInfoReducer;
    },

    /**
     * IM
     * @returns {*}
     */
    getUserIMReducer() {
        return store.getState().UserIMReducer;
    },


    /**
     * 获取IM全部信息
     * @returns {*}
     */
    userIMAllMessage() {
        store.dispatch(UserIMAction.userIM(this.getUserId()));
    },


    /**
     * 获取banner图
     */
    getBanner() {
        store.dispatch(UserInfoAction.bannerArray());
    },

    /**
     * 获取公开课url
     */
    getPublicClassURL(successCallback, failCallback) {
        store.dispatch(UserInfoAction.publicClassURL(successCallback, failCallback));
    },

    /**
     * 判断是否是自选股
     * @param stockId 股票代码
     */
    isPersonStock(stockId) {
        let stockA = this.getUserInfoReducer().personStocks;
        if (!stockA) {
            stockA = [];
        }
        let i = stockA.indexOf(stockId);
        if (i > -1) {
            return true;
        }
        return false;
    },

    /**
     *
     * @param stockCodes
     * @param successCallback
     * @param failCallback
     */
    uploadTourStock(successCallback, failCallback){
        let stocks = store.getState().UserInfoReducer.personStocks;
        let tourStocks = store.getState().UserInfoReducer.personTStocks;
        // console.log('同步游客数据',stocks,tourStocks);
        if(tourStocks && tourStocks.length > 0){
            //本地数据,在源达云 自选股基础上，最多同步100只股票
            let stocksLength = stocks.length;
            let upStocks = [];
            tourStocks.map((info) => {
                if(info && stocks.indexOf(info) === -1 && upStocks.length < (STOCK_MAX_NUMBER - stocksLength)){
                    upStocks.push(info);
                }
            })
            upStocks =  upStocks.concat(stocks);

            let stockString = upStocks.toString();
            let tourStockString = stockString.toString();
            //同步成功后删除数据
            this.optionalStock(stockString,successCallback,failCallback);
            this.deleTourStocks(tourStockString);
        }
    },

    deleTourStocks(tourStockString,successCallback,failCallback){
        let userId = this.getDeviceID();
        let groupName = '自选股';
        let path = '/ydhxg/KanShi/optionalStock';
        let param = {
            userId: userId,
            codes: '',
            groupName: groupName,
        }
        RequestInterface.basePost(RequestInterface.HXG_BASE_URL, path, param,
            (successText) => {},
            (errorText) => {})
    },


    /**
     * 添加自选股
     * @param stockId 股票代码
     * @param successCallback 成功回调
     * @param failCallback 失败回调
     */
    addPersonStock(stockId, successCallback, failCallback) {
        let stocks = store.getState().UserInfoReducer.personStocks;

        if(stocks.length >= STOCK_MAX_NUMBER){
            failCallback && failCallback('最多添加'+STOCK_MAX_NUMBER+'只自选股');
        }else {
            let codes = stockId;
            stocks.map((code) => {
                if(code && codes.indexOf(code) === -1)
                    codes = codes ? codes+','+code : code;
            })
            // console.log('数组长度',stocks.length,stocks,codes,' === ',stockId);
            this.optionalStock(codes,successCallback,failCallback);
        }
    },


    /**
     * 移除自选股
     * @param stockId 股票代码
     * @param successCallback 成功回调
     * @param failCallback 失败回调
     */
    deletePersonStock(stockId, successCallback, failCallback) {

        let stocks = store.getState().UserInfoReducer.personStocks;
        let codes = '';
        let i = stocks.indexOf(stockId);
        stocks.splice(i, 1)
        // console.log('数组长度',stocks.length,stocks);
        stocks.map((code) => {
            if (code)
                codes = codes ? codes + ',' + code : code;
        })
        this.optionalStock(codes, successCallback, failCallback);
    },

    /**
     * 自选股置顶
     * @param stockId
     * @param successCallback
     * @param failCallback
     */
    topPersonStock(stockId, successCallback, failCallback) {

        let stocks = store.getState().UserInfoReducer.personStocks;
        let codes = stockId;
        let i = stocks.indexOf(stockId);
        stocks.splice(i, 1)
        // console.log('数组长度',stocks.length,stocks);
        stocks.map((code) => {
            if (code)
                codes = codes ? codes + ',' + code : code;
        })
        this.optionalStock(codes, successCallback, failCallback);
    },


    personStockEmitter() {
        DeviceEventEmitter.emit(personStocksChange);
    },


    /**
     * 批量排序
     * @param codes
     * @param successCallback
     * @param failCallback
     */
    sortPersonStock(codes, successCallback, failCallback) {
        this.optionalStock(codes, successCallback, failCallback);
    },


    /**
     * 自选股操作
     */
    optionalStock(codes, successCallback, failCallback) {
        let userId = this.getUserId() ? this.getUserId() : this.getDeviceID();
        let groupName = '自选股';
        let path = '/ydhxg/KanShi/optionalStock';
        let param = {
            userId: userId,
            codes: codes,
            groupName: groupName,
        }

        // console.log('自选股操作',path,param);
        RequestInterface.basePost(RequestInterface.HXG_BASE_URL, path, param,
            (successText) => {
                // 游客登录  防止第一次进入app 监听不到这个节点
                store.dispatch(UserInfoAction.saveAllSortAction(codes, 'personStock'));

                if (this.getUserPermissions() < 1) {
                    //游客保存最新操作
                    store.dispatch(UserInfoAction.saveAllSortAction(codes));

                    store.dispatch(UserInfoAction.touristsLogin(userId));
                }
                this.personStockEmitter();
                successCallback && successCallback(successText)
            },
            (errorText) => {
                failCallback && failCallback('添加失败')
            })
    },

    getZanType(eventType) {
        let typeS = eventType;
        switch (eventType) {
            case MODEL_xiaoBaiKeTang:
                typeS = ZAN_XiaoBaiKe;
                break;
            case MODEL_daKaLaiLa:
                typeS = ZAN_DaKaLaiLe;
                break;
            default:
                break;
        }
        return typeS;

    },

    /**
     * 返回点赞的数据
     * @param eventType 点赞的频道
     * @returns {*}
     */
    getZanMessage(eventType) {
        eventType = this.getZanType(eventType);

        let zan = store.getState().UserInfoReducer.zan;
        let zanA = [];
        for (var key in zan) {
            if (key == eventType) {
                zanA = zan[key];
                return zanA;
            }
        }
        return zanA;
    },


    /**
     * 返回理解 记录
     * @param eventType
     * @param key
     * @returns {{}}
     */
    getUnderstand(eventType, key) {
        let understands = this.getUnderstandArray(eventType);
        let keys = Object.keys(understands);
        let index = keys.indexOf(key);
        let understand = {};
        if (index >= 0) {
            understand = understands[key];
        }
        return understand;
    },

    //返回理解 摸个模块下所有理解
    getUnderstandArray(eventType) {
        eventType = this.getZanType(eventType);

        let zan = store.getState().UserInfoReducer.understand;
        let zanA = [];
        for (var key in zan) {
            if (key == eventType) {
                zanA = zan[key];
                return zanA;
            }
        }
        return zanA;
    },



    /**
     * 登录
     * @param param
     * @param successCallback
     * @param failCallback
     */
    login(param, successCallback, failCallback) {
        store.dispatch(UserInfoAction.login(param,
            (successText) => {
                successCallback && successCallback(successText)
            },
            (errorText) => {
                failCallback && failCallback(errorText)
            }));
    },


    /**
     * 注册
     * @param param
     * @param successCallback
     * @param failCallback
     */
    register(param, successCallback, failCallback) {
        store.dispatch(UserInfoAction.register(param,
            (successText) => {
                successCallback && successCallback(successText)
            },
            (errorText) => {
                failCallback && failCallback(errorText)
            }));
    },

    /**
     * 获取短信验证码
     * @param mobile 手机号
     * @param successCallback 成功回调
     * @param failCallback 失败回调
     */
    getPhoneVeri(mobile, successCallback, failCallback, isRegister) {
        store.dispatch(UserInfoAction.phoneVeri(mobile,
            (successText) => {
                successCallback && successCallback(successText)
            },
            (errorText) => {
                failCallback && failCallback(errorText)
            }, isRegister));

    },

    /**
     * 修改用户信息
     * @param param
     * @param successCallback
     * @param failCallback
     */
    changeUserInfo(param, successCallback, failCallback) {
        store.dispatch(UserInfoAction.changeUserInfo(param,
            (successText) => {
                successCallback && successCallback(successText)
            },
            (errorText) => {
                failCallback && failCallback(errorText)
            }));
    },

    /**
     * 忘记密码
     * @param username 用户名 （手机号）
     * @param password 密码
     * @param successCallback
     * @param failCallback
     */
    forgetPassword(param, successCallback, failCallback) {
        store.dispatch(UserInfoAction.changePassword(param,
            (successText) => {
                successCallback && successCallback(successText)
            },
            (errorText) => {
                failCallback && failCallback(errorText)
            }));

    },

    /**
     * 修改密码
     * @param username 用户名
     * @param oldPassword 旧手机号
     * @param newPassword 新手机号
     * @param successCallback
     * @param failCallback
     */
    changePassword(username, oldPassword, newPassword, successCallback, failCallback) {
        store.dispatch(UserInfoAction.changeNewPassword(username, oldPassword, newPassword,
            (successText) => {
                successCallback && successCallback(successText)
            },
            (errorText) => {
                failCallback && failCallback(errorText)
            }));
    },

    /**
     * IM 获取 客服信息 （现在只有一个客服，不需要获取客服信息，财源2.0添加多个客服，获取客服信息）
     * @param successCallback
     * @param failCallback
     */
    getIMKFInfo(successCallback, failCallback) {
        let kfInfo = store.getState().UserIMReducer.kfInfo;
        let username = this.getUserName()
        let pid = this.getUserInfoReducer().cyPower.pid;
        //判断时间
        store.dispatch(UserIMAction.getKFInfo(username, pid,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }))
    },

    /**
     * IM 用户给客服发消息
     * @param content
     * @param successCallback
     * @param failCallback
     */
    userSendIMMessage(content, successCallback, failCallback) {
        let kfInfo = store.getState().UserIMReducer.kfInfo;
        let kfName = kfInfo.kfname;
        let kfUserId = kfInfo.kfid;

        store.dispatch(UserIMAction.userSendMessage(this.getUserId(), this.getUserName(), this.getNickName(), kfUserId, kfName, content, this.getUserPermissions(),
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }))

    },


    /**
     * 第一次登录
     * @param isFirst
     */
    isFirstUse(isFirst) {
        store.dispatch(UserInfoAction.isFirstUse(isFirst));
    },

    logout() {
        store.dispatch(UserInfoAction.logout());
    },

    //历史账号
    historyUser(username) {
        username && store.dispatch(UserInfoAction.historyUser(username));
        return store.getState().UserInfoReducer.historyArray;
    },

    /**
     * 源达股票new 点赞接口
     * @param key 内容id
     * @param model 模块
     * @param op 点赞: 1 取消点赞: -1
     * @param columnId 栏目id
     * @param flag 是首页节点 ：1  不是首页节点：2
     * @param successCallback
     * @param failCallback
     * //慧选股版本添加的参数
     * @param system 套系 （早知晓，观点直播 ：固定是字符串'-1'）
     * @param creationTime 创建时间
     */
    ydgpZanNew(key, model, op, columnId, flag, successCallback, failCallback, system, creationTime) {

        store.dispatch(UserInfoAction.ydgpZanNew(key, op, model, columnId, flag,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }, system, creationTime));
    },

    /**
     * 慧选股  理解
     * @param key
     * @param mark
     * @param model
     * @param successCallback
     * @param failCallback
     * @param system
     * @param creationTime
     */
    understand(key, model, mark, successCallback, failCallback, system, creationTime) {
        store.dispatch(UserInfoAction.understand(key, mark, model,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }, system, creationTime));
    },


    /**
     * 源达股票new 播放量,阅读量,浏览量统计均用此接口
     * @param key
     * @param model
     * @param columnId
     * @param flag
     * @param successCallback
     * @param failCallback
     */
    viewNumbernew(key, model, columnId, flag, successCallback, failCallback) {
        let userId = this.getUserId() ? this.getUserId() : this.getDeviceID();
        store.dispatch(UserInfoAction.viewNumberNew(userId, key, model, columnId, flag,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }));
    },


    /**
     * 源达股票new 分享后调用的接口
     * @param key
     * @param model
     * @param successCallback
     * @param failCallback
     */
    ydgpShareNew(key, model, successCallback, failCallback) {
        store.dispatch(UserInfoAction.ydgpShareNew(key, model,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }));
    },


    shareDuoTou(successCallback, failCallback) {
        store.dispatch(UserInfoAction.shareDuoTou(
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }));
    },


    /**
     * 是否有新的通知消息
     * @returns {boolean}
     */
    hasNewTongZhi() {
        let tongzhis = this.getUserInfoReducer().userMessageGongG;
        if (!tongzhis) {
            return false;
        }
        let tongzhi = tongzhis.length > 0 ? tongzhis[0] : null;
        let tim = tongzhi ? tongzhi.data.id : '';
        let tongZT = this.getUserInfoReducer().tongZhiTime;
        let isRead = tim < tongZT;

        //0条通知
        if (tongzhis.length < 0) {
            return false;
        }

        //有通知 没有阅读过
        if (!tongZT) {
            return true;
        }

        //通知信息时间 大于最后一次阅读的时间
        if (isRead) {
            return false
        }
        return true;
    },

    /**
     * 是否有新的通知消息
     * @returns {boolean}
     */
    hasNewChatMessages() {
        let userIMReducer = store.getState().UserIMReducer;

        let tongzhis = Array.from(userIMReducer.allIM);
        let lastChatMessage = tongzhis.length > 0 ? tongzhis.pop() : null;

        let todayTime = userIMReducer.todayTimestamp;
        //无聊天记录，无心消息
        if (!lastChatMessage) {
            return false;
        }

        //用户发送消息
        if (lastChatMessage.data.type === '1') {
            return false;
        }

        //时间不存在，没有看过，lastChatMessage有消息，有新消息
        if (!todayTime) {
            return true;
        }

        //时间存在，有历史聊天记录, 野狗最后一条时间大于本地时间，有新消息
        if (lastChatMessage.data.create_time > todayTime) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * 记录通知最后阅读时间
     */
    readTongZhi(successCallback, failCallback) {
        store.dispatch(UserInfoAction.tongZhiTim(this.getUserId(),
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }));
    },

    /**
     * 获取版本信息
     */
    versionMessage(typeString, successCallback, failCallback) {
        store.dispatch(UserInfoAction.caiYuanCheckVersion(typeString,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }));
    },

    /**
     * 获取版本信息
     */
    checkMessage(successCallback, failCallback) {
        //修改过，传入了最后的登录时间给游客登录接口
        AsyncStorage.getItem('last_loginout_time', (error, result) => {
            if (error) {
                store.dispatch(UserInfoAction.caiYuanCheckState(
                    (response) => {
                        successCallback && successCallback(response)
                    },
                    (error) => {
                        failCallback && failCallback(error)
                    }, 0
                ));
            } else {
                store.dispatch(UserInfoAction.caiYuanCheckState(
                    (response) => {
                        successCallback && successCallback(response)
                    },
                    (error) => {
                        failCallback && failCallback(error)
                    },
                    result
                ));
                //return result;
            }
        });

    },

    /**
     * 新行情，资讯
     */
    getLastesNews(page, size, successCallback, failCallback) {
        store.dispatch(UserInfoAction.lastesNews(page, size,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }));
    },

    /**
     * 新行情，个股公告
     */
    getGeGuGongGao(code, successCallback, failCallback) {
        store.dispatch(UserInfoAction.geGuGongGao(code,
            (response) => {
                // console.log('公告信息 response',response);
                successCallback && successCallback(response)
            },
            (error) => {
                // console.log('公告信息 error',error);
                failCallback && failCallback(error)
            }));
    },

    /**
     * 新行情，个股新闻
     */
    getGeGuXinWen(code, successCallback, failCallback) {
        store.dispatch(UserInfoAction.geGuXinWen(code,
            (response) => {
                successCallback && successCallback(response)
            },
            (error) => {
                failCallback && failCallback(error)
            }));
    },

    /**
     * 营销页
     * @param successCallback
     * @param failCallback
     */
    getYingXiaoHuoDong() {
        store.dispatch(UserInfoAction.yingXiaoHuoDong());
    }


}



