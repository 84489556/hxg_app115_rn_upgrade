/**
 * Created by cuiwenjuan on 2019/3/20.
 */
'use strict'

import { NativeModules,Platform,NativeEventEmitter} from 'react-native';
import UserInfoUtil from '../../utils/UserInfoUtil'


const { YDHistoryCandleStick } = NativeModules;
const loadingManagerEmitter = new NativeEventEmitter(YDHistoryCandleStick);

export default class YDHistoryStick{


    constructor(options) {
        Object.assign(this, options);
        this.historyStick = NativeModules.YDHistoryCandleStick;
        this._eventEmitter();
    }


    request(timeStamp, code,split,period,fetchMoreCount ,callback) {
        this.callBack = callback;

        this.historyStick && this.historyStick.getHistoryCanleStick(timeStamp,code,split,period,fetchMoreCount);
    }



    _eventEmitter() {
        loadingManagerEmitter.addListener('YDHistoryCandleStick', ev => {
            // console.log('RN receive event ydChannelMessage = ', ev)

            let data;
            if(Platform.OS === 'ios'){
                data = ev.data || {}
            }else {
                data = JSON.parse(ev.data) || {}
            }
            let callback = this.callBack;
            if (typeof callback === 'function') {
                callback(data);
            }


        })
    }

}

export let historyCandleStick = new YDHistoryStick();