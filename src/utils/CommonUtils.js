'use strict';
import moment from "moment";
import {
    Dimensions,
    PixelRatio,
    Platform,
    Linking,
    DeviceEventEmitter,
} from "react-native";
import Toast from "react-native-root-toast";
import { isNumber } from "../lib/htmlparser2";
import AsyncStorage from '@react-native-community/async-storage';


var timeOut = 15000;
export let Utils = {

    /**
     * fetch简单封装
     * url: 请求的URL
     * successCallback: 请求成功回调
     * failCallback: 请求失败回调
     *
     * */
    get: (url, successCallback, failCallback) => {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(() => {
                reject('网络请求超时');
            }, timeOut)
        });

        Promise.race([fetch(url), promise])
            .then((response) => response.text())
            .then((responseData) => {
                // console.log('get 网络返回 = ',responseData);
                successCallback && successCallback(JSON.parse(responseData || '{}'));
            })
            .catch((errorS) => {
                failCallback && failCallback(errorS);
            }).done();

    },
    /**
     * fetch简单封装
     * url: 请求的URL
     * successCallback: 请求成功回调
     * failCallback: 请求失败回调
     *
     * */
    post: (url, param, successCallback, failCallback) => {

        let fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(param)
        };

        var promise = new Promise(function (resolve, reject) {
            setTimeout(() => {
                reject('网络请求超时');
            }, timeOut)
        });

        Promise.race([fetch(url, fetchOptions), promise])
            .then((response) => response.text())
            .then((responseData) => {
                // console.log('post 网络返回 W= ',responseData);
                successCallback && successCallback(JSON.parse(responseData || '{}'));
            })
            .catch((errorS) => {
                //console.log('post 网络返回错误 W= ',errorS);
                failCallback && failCallback(errorS);
            });

    },

    /**
     * fetch简单封装
     * url: 请求的URL
     * successCallback: 请求成功回调
     * failCallback: 请求失败回调
     *
     * */
    postFormData: (url, param, successCallback, failCallback) => {

        if (param == null || param === {}) {
            failCallback && failCallback("传递参数为空");
            return;
        }
        let formdata = new FormData();
        let keys = Object.keys(param);
        let values = Object.values(param);
        for (let i = 0; i < keys.length; i++) {
            formdata.append(keys[i] + "", values[i] + "");
        }
        let fetchOptions = {
            method: 'POST',
            headers: {
                //'Accept': 'application/json',
                'Content-Type': 'multipart/form-data;'
            },
            body: formdata
        };

        var promise = new Promise(function (resolve, reject) {
            setTimeout(() => {
                reject('网络请求超时');
            }, timeOut)
        });

        Promise.race([fetch(url, fetchOptions), promise])
            .then((response) => response.text())
            .then((responseData) => {
                // console.log('post 网络返回 W= ',responseData);
                successCallback && successCallback(JSON.parse(responseData || '{}'));
            })
            .catch((errorS) => {
                //console.log('post 网络返回错误 W= ',errorS);
                failCallback && failCallback(errorS);
            });

    },
    /**
     * 同上post，不同是单一请求
     * url: 请求的URL
     * successCallback: 请求成功回调
     * failCallback: 请求失败回调
     *
     * */
    postOne: (url, param, successCallback, failCallback) => {

        let fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(param)
        };

        fetch(url, fetchOptions)
            .then((response) => response.text())
            .then((responseData) => {
                // console.log('post 网络返回 W= ',responseData);
                successCallback && successCallback(JSON.parse(responseData || '{}'));
            })
            .catch((errorS) => {
                // console.log('post 网络返回 W= ',errorS);
                failCallback && failCallback(errorS);
            });

    },

    postToHotStock: (url, param1, param2) => {
        // if (UserInfoUtil.getUserPermissions() > 1) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'code': param1,
                'name': param2,
                'userId': "",
                'num': ""

            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status == '10000') {

                } else {

                }

            })
            .catch((error) => {

            });
        // }

    }
};

let toastY = undefined;
export let toast = (text, callBack) => {

    if (toastY) {
        Toast.hide(toastY);
    }

    toastY = Toast.show(text, {
        duration: Toast.durations.SHORT,
        position: commonUtil.height / 2 - 20,
        shadow: false,
        animation: true,
        hideOnPress: true,
        delay: 0,
        onShow: () => {
            // calls on toast\`s appear animation start
        },
        onShown: () => {
            // calls on toast\`s appear animation end.
        },
        onHide: () => {
            // calls on toast\`s hide animation start.
        },
        onHidden: () => {
            //移除toast
            Toast.hide(toastY);
            if (callBack) {
                callBack();
            }
            // calls on toast\`s hide animation end.
        }
    })
};


/**
 * 返回本地用户头像名称
 * @param imageName 野狗头像名称
 * @returns {string}
 */
export let getHeaderImageN = (imageName) => {
    let serverImages = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
        'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20'];

    let images = [];
    let imageN = undefined;
    for (let j = 0; j < 20; j++) {
        j < 10 ? imageN = 'header_man' + (j + 1) : imageN = 'header_woman' + (j % 10 + 1);
        images.push(imageN);
    }

    let headerName = 'default_header';
    for (let i = 0; i < 20; i++) {
        if (serverImages[i] == imageName) {
            headerName = images[i];
            break;
        }
    }
    return headerName;
};

/**
 * 返回野狗用户头像名称
 * @param imageName 本地头像名称
 * @returns {string}
 */
export let getHeaderImageW = (imageName) => {
    let serverImages = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
        'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20'];

    let images = [];
    let imageN = undefined;
    for (let j = 0; j < 20; j++) {
        j < 10 ? imageN = 'header_man' + (j + 1) : imageN = 'header_woman' + (j % 10 + 1);
        images.push(imageN);
    }

    let headerName = 'A01';
    for (let i = 0; i < 20; i++) {
        if (images[i] == imageName) {
            headerName = serverImages[i];
            break;
        }
    }
    return headerName;
};


/**
 * 跳转到系统浏览器显示
 * @param url
 */
export let gongkaike = (url) => {
    if (!url || url === '') {
        // toast('网络有问题，一会再试')

    } else {
        Linking.openURL(url)
            .catch((err) => {
                // toast('网络有问题，一会再试')
            });
    }
};



/**
 * 用户名持续化
 */
export let setUserPhone = (userPhone) => {
    AsyncStorage.setItem('userPhone', JSON.stringify(userPhone), (error, result) => {
        if (!error) {
        }
    });
};
export let getUserPhone = (callBack) => {
    AsyncStorage.getItem('userPhone')
        .then((value) => {
            let jsonValue = JSON.parse((value));
            callBack(jsonValue);
        })
};


/**
 * 验证 手机号
 */
export let checkPhone = (phone) => {

    // let reg = /^1\d{10}$/;
    let reg = /^1(2|3|4|5|6|7|8|9)\d{9}$/;

    if (!phone) {
        return false;
    }

    if (phone === "") {
        return false;
    }

    if (!reg.test(phone)) {
        return false;
    }

    return true;
};
/**
 * 验证B股
 */
export let isBQuote = (stockCode) => {


    if (!stockCode) {
        return false;
    }

    if (stockCode === "") {
        return false;
    }

    if (stockCode.substr(0, 3) == '900' || stockCode.substr(0, 3) == '200') {
        return true;
    }

    return false;
};

/**
 *
 * @param fmt 时间格式
 * @param timeStamp 时间戳
 * @returns {*}
 */
export let getTime = (fmt, timeStamp) => {
    var newDate = new Date();
    newDate.setTime(timeStamp);
    return dateFtt(fmt, newDate);
};


let dateFtt = (fmt, date) => {
    var o = {
        "M+": date.getMonth() + 1,                 //月份
        "d+": date.getDate(),                    //日
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

export let dateFormats = (fmt, date) => {
    var o = {
        "M+": date.getMonth() + 1,                 //月份
        "d+": date.getDate(),                    //日
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

var pixelRatio = PixelRatio.get();
export let commonUtil = {

    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,

    //比例
    // rare(x) {
    //     return x * Math.min(this.height, this.width) / 750;
    // },
    rare: Platform.select({
        ios: (pxSize) => pxSize * Math.min(Dimensions.get('window').height, Dimensions.get('window').width) / 750,
        android: (pxSize) => pxSize / 2,
    }),

    // 颜色
    black_F6F6F6: '#f6f6f6',
    black_F1F1F1: '#f1f1f1',
    white_FFFFFF: '#ffffff',
    black_262628: '#262628',
    //blue_2289E7: '#2289e7',
    green_0EC98E: '#0ec98e',
    red_FC7076: '#FC7076',

};

export let isToday = (stamp) => {
    let isT = false;
    let str = parseInt(stamp); //字符串转整型;
    let serverTime = UserInfoUtil.getUserInfoReducer().serverTime * 1000;
    let strSe = parseInt(serverTime);//'1517500800000'
    if (new Date(str).toDateString() === new Date(strSe).toDateString()) {
        isT = true;
    }
    return isT;
}

let _isLandscape = false;//false为竖屏
/**
 * 返回是否是横屏 设置横竖屏
 * @param isLands
 * @returns {boolean}
 */
export let isLandscape = (isLands) => {

    if (!(isLands === undefined)) {
        _isLandscape = isLands;
    }
    return _isLandscape;
}

//获取已读消息数据
let isReaderMessage = 'TongZhiIsReader'
export let getReaderMessage = (callBack) => {
    AsyncStorage.getItem(isReaderMessage)
        .then((value) => {
            let jsonValue = JSON.parse((value));
            callBack(jsonValue);
        })
}

//存储已读消息数据
export let setReaderMessage = (isReaderArray) => {
    AsyncStorage.setItem(isReaderMessage, JSON.stringify(isReaderArray), (error, result) => {
        if (!error) {
        }
    });
}
//获取时长，不是标准的时间
export let getHmsORms = (longTime) => {
    // console.log('longTime======'+longTime);
    // longTime=3900000;
    if (longTime >= 3600000) {
        let h = parseInt(longTime / 3600000);
        if (h > 9) {
            return h + ':' + moment(longTime).format("mm:ss");
        } else {
            return '0' + h + ':' + moment(longTime).format("mm:ss");
        }

    } else {
        return moment(longTime).format("mm:ss");
    }
}
//获取时长，不是标准的时间
export let get2HmsORms = (longTime, allTime) => {
    // console.log('longTime======'+longTime);
    // allTime=3900000;
    if (allTime >= 3600000) {
        let h = parseInt(longTime / 3600000);
        if (h > 9) {
            return h + ':' + moment(longTime).format("mm:ss");
        } else {
            return '0' + h + ':' + moment(longTime).format("mm:ss");
        }

    } else {
        return moment(longTime).format("mm:ss");
    }
}

/**
 *
 * @param array
 * @param low
 * @param high
 * @param val
 * @returns {number|*}
 */
export let searchStockIndex = (array, low, high, val) => {
    if (low > high) return -1;
    let mid = low + ((high - low) >> 1);
    let midValObj = '';
    if (Platform.OS === 'ios') {
        midValObj = array[mid]["Obj"];
    } else {
        midValObj = array[mid]["label_"];
    }
    let midValCode = parseInt(midValObj.substring(2));
    let valCode = parseInt(val.substring(2));
    if (midValCode == valCode) {
        return mid;
    } else if (midValCode < valCode) {
        return searchStockIndex(array, mid + 1, high, val);
    } else {
        return searchStockIndex(array, low, mid - 1, val);
    }
}


export let personStockListenName = 'personStocksChange';
export let customerPhone = '0311-87100588';
export let buyPhone = '0311-86909389';
export let ourPhone = '0311-66856698'
export let complaintPhone = '0311-87100515'

var lastNavTime = "";
export const jumpPage = (navigation, page, params) => {
    //上次点击与本次点击时间差在 1000 毫秒之内，就返回
    if (lastNavTime + 1000 >= Date.now()) {
        return;
    }
    lastNavTime = Date.now();
    if (navigation) {
        navigation.push(page, params);
    }
}


// 判断字符串是不是纯数字
global.IsNumberString = (val) => {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
        return true;
    } else {
        return false;
    }
}
