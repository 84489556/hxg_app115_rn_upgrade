/**
 * Created by cuiwenjuan on 2017/8/24.
 */

import {
    DeviceEventEmitter
} from 'react-native'
import * as actionType from './actionTypes'
import {Utils} from '../utils/CommonUtils'
import * as cyURL from './CYCommonUrl'
import Yd_cloud from '../wilddog/Yd_cloud'


let refApp = Yd_cloud().ref(cyURL.appIMRef);
let urlIM = cyURL.urlIM;


/**
 * 用户 客服 IM
 */
export  let userIMAllMessage = (userId,number,successCallback,failCallback) => {
    let refS = refApp.ref("IM/"+userId);
    return (dispatch) => {
        let imMessages = [];
        refS.orderByKey().limitToLast(number).get((snapshot) => {
            // console.log('客服消息== number allMessage',JSON.stringify(snapshot));
            if(snapshot.nodeContent){
                for(let indexKey in snapshot.nodeContent){
                    let dataG = snapshot.nodeContent[indexKey];
                    let banner = {data: dataG, _key: indexKey};
                    imMessages.push(banner);
                }
                dispatch(allIMMessageAction(imMessages));
                successCallback && successCallback("获取成功")
            }else {
                successCallback && successCallback("获取失败")
            }
        })

    }
};


/**
 * 获取一条数据 最新更新的数据
 */
export  let userIMOneMessage = (userId) => {
    let refS = refApp.ref("IM/"+userId);
    refS.off();
    return (dispatch) => {
        let imMessages = [];
        refS.orderByKey().limitToLast(1).get((snapshot) => {
            //console.log('客服消息== get one',JSON.stringify(snapshot));
            if(snapshot.nodeContent){
                for(let indexKey in snapshot.nodeContent){
                    let dataG = snapshot.nodeContent[indexKey];
                    let banner = {data: dataG, _key: indexKey};
                    DeviceEventEmitter.emit('kefuHuiFu');
                    dispatch(oneIMMessageAction(banner))
                }
            }
        })

        refS.orderByKey().limitToLast(1).on('value',(snapshot) => {
            //console.log('客服消息== on one',JSON.stringify(snapshot));
            refS.orderByKey().limitToLast(1).get((snapshot) => {
                // console.log('客服消息== on get one',JSON.stringify(snapshot));
                if(snapshot.nodeContent){
                    for(let indexKey in snapshot.nodeContent){
                        let dataG = snapshot.nodeContent[indexKey];
                        let banner = {data: dataG, _key: indexKey};
                        DeviceEventEmitter.emit('kefuHuiFu');
                        dispatch(oneIMMessageAction(banner))
                    }
                }
            })
        })

    }
};


export let allIMMessageAction = (snapshot) => {
    return {
        type:actionType.USER_CENTER_IM_MESSAGE,
        snapshot,
    }
};


//客服
export let oneIMMessageAction = (snapshot,todayTimestamp,isToday) => {
    return {
        type:actionType.USER_CENTER_CUSTOMER,
        snapshot,
        todayTimestamp,
        isToday,
    }
};


//跳出IM界面
export let IMlogout = (snapshot) => {
    return {
        type:actionType.USER_CENTER_IM_LOGOUT,
        snapshot,
    }
};


export let userSendMessage= (userid,username,nickname,kfid,kfname,content,permissions, successCallback, failCallback) => {

    let customerData = {data: {
        type: "2",
        content: "您还未登录请登录后再进行咨询。",}};

    //记录当前数据的时间戳，，判断发送是否成功
    var timestamp = (new Date()).valueOf();
    let userData = {data: {
        type: "1",
        content: content,
        local_time:timestamp,
        create_time:timestamp/1000,
        success:false}};


    let urlS = urlIM + 'hxgchat/send';
    let param = {
        userid:userid,
        username:username,
        nickname:nickname,
        kfid:kfid,
        kfname:kfname,
        type:'1',
        content:content,
        localtime:timestamp
    };
    //console.log('用户和客服聊天 = '+JSON.stringify(param) + urlS);
    return(dispatch) => {

        if (permissions < 1){
            // userData.data.success = false;
            dispatch(oneIMMessageAction(userData));
            dispatch(oneIMMessageAction(customerData));
            successCallback('');

        }else {
            dispatch(oneIMMessageAction(userData));
            // successCallback('');
            Utils.postOne(urlS, param, (response) => {
                // console.log('IM 用户发消息 异常2 == ' + JSON.stringify(response));
                if (response.code == '10000') {
                    //console.log('IM 用户发消息 成功 == ' + JSON.stringify(response));
                    successCallback && successCallback(response.msg);
                } else {
                    let message = response.msg;
                    //console.log('IM 用户发消息 失败 == ' + message);
                    userData.data.success = true;
                    dispatch(oneIMMessageAction(userData));
                    failCallback && failCallback(message);
                }
            }, (error) => {
                //console.log('IM 用户发消息 异常 == ' + JSON.stringify(error));
                userData.data.success = true;
                dispatch(oneIMMessageAction(userData));
                failCallback && failCallback(error);
            });
        }
    }
};


export let getKFInfo  = (userName,pid,successCallback, failCallback) => {
    let urlS = urlIM + 'hxgchat/kfinfo';
    // userName = '15001283066'
    pid = 159;//159:慧选股五星正式, 158:慧选股四星正式, 157:慧选股三星正式
    let param = {'username':userName,'pid':pid};

    //console.log('获取客服信息 = ' +urlS +'param = '+JSON.stringify(param));
    return(dispatch) => {
        Utils.post(urlS,param,(response) => {
            if (response.code == '10000') {
                //console.log('IM 获取客服信息 成功 == ');
                successCallback && successCallback(response.msg);
                dispatch(getKFInfoAction(response.data));
            } else {
                //console.log('IM 获取客服信息 失败 == ' + response.msg);
                failCallback && failCallback(response.msg);
            }
        }, (error) => {
            //console.log('IM 获取客服信息 异常 == ' + error);
            failCallback && failCallback(error);
        });
    }
};

let getKFInfoAction = (snapshot) => {
    return {
        type:actionType.USER_CENTER_IM_KFINFO,
        snapshot,
    }
};