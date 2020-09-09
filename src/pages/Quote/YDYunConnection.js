/**
 * 源达行情服务
 * Created by yzj on 18/12/11.
 */
'use strict'

import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import RCTDeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';
import UserInfoUtil from '../../utils/UserInfoUtil'


const { YDYunChannelModule } = NativeModules;
const loadingManagerEmitter = new NativeEventEmitter(YDYunChannelModule);

export default class YDYunConnection {

    static CONNECTING = 0;
    static READY = 1;
    static TRANSIENT_FAILURE = 2;
    static IDLE = 3;
    static SHUTDOWN = 4;

    dataType = 'pb';

    constructor(options) {
        Object.assign(this, options);
        this.regedStocks = []; // 当前已注册的股票
        this.tempObj = null;
        this.requestQueue = {};
        this.responsed = {};
        this.codeWithNumbersQuote = {}; //注册注销商品引用计数
        this.codeWithNumbersFullQuote = {}; //注册注销商品引用计数

        this.ydyun = NativeModules.YDYunChannelModule;

        this._subs = null
        this.quotes = []
        this.fullquotes = []
        this.mins = []
        this.candles = []

        this._registerEvents(this._socketId);
    }
    createRequest(qid, interfaceName, params, callback) {
        if (interfaceName === "FetchQuoteNative"
            || interfaceName === "FetchFullQuoteNative") {
            return Object.assign({ qid, interfaceName, params, callback }, {
                cancel: this.cancelQuote.bind(this, qid, params.subcribes),
                pause: this.pauseQuote.bind(this, qid, params.subcribes),
                // resume: this.resumeQuote.bind(this, qid, params.subcribes)
                resume: this.resumeQuote.bind(this, qid)
            });
        }

        return Object.assign({ qid, interfaceName, params, callback }, {
            cancel: this.cancel.bind(this, qid),
            resume: this.resume.bind(this, qid)
        });
    }

    generateQid() {
        return this._lastQid = (this._lastQid || 0) + 1;
    }

    getUnregisterCodeList(numbers) {
        let codelist = ''
        Object.keys(numbers).forEach(code => {
            let num = numbers[code];
            if (num == 0) {
                codelist += code;
                codelist += ',';

                delete (numbers[code])
            }

        });

        codelist = codelist.substring(0, codelist.length - 1);
        return codelist
    }

    register(interfaceName, registerCodes, callback) {
        let params = { subcribes: registerCodes, unsubcribes: "", subscribe: true }
        return this.request(interfaceName, params, callback)
    }
    unregister(qid, unregisterCodes, isModifyRequest = true) {
        let realUnregisterCodes = null
        let request = this.responsed[qid]
        // console.log('stock-http:='+'---unregisterCodes---'+unregisterCodes);
        if (!request) {
            return;
        }
        if (isModifyRequest) {
            this.modifyRequest(qid, unregisterCodes)
        }


        if (request.interfaceName === "FetchQuoteNative") {
            // this.cancel(qid);
            this.removeNumber(unregisterCodes, this.codeWithNumbersQuote)
            realUnregisterCodes = this.getUnregisterCodeList(this.codeWithNumbersQuote)
        }
        else if (request.interfaceName === "FetchFullQuoteNative") {
            // this.cancel(qid);
            this.removeNumber(unregisterCodes, this.codeWithNumbersFullQuote)
            realUnregisterCodes = this.getUnregisterCodeList(this.codeWithNumbersFullQuote)
            // console.log('next realUnregisterCodes: ', realUnregisterCodes);
        }
        // console.log('stock-http:='+'realUnregisterCodes---'+realUnregisterCodes);
        if (realUnregisterCodes.length > 0) {
            let params = { subcribes: "", unsubcribes: realUnregisterCodes, subscribe: false }
            let unregisterRequest = this.createRequest(this.generateQid(), request.interfaceName, params, null)
            this.ydyun && this.ydyun.getChannelState((s) => {
                if (s === YDYunConnection.READY && unregisterRequest) {
                    this.cancel(qid);
                    this.send(unregisterRequest);
                }
            });
        }

    }

    modifyRequest(qid, unregisterCodes) {
        let request = this.responsed[qid]
        if (unregisterCodes === undefined) {
            return;
        }
        let uncodes = unregisterCodes.split(",")
        let codes = request.params.subcribes.split(",")

        uncodes.forEach(code => {
            codes = codes.filter(item => item !== code);
        });

        request.params.subcribes = codes.join(',');

        if (codes.length == 0) this.responsed[qid] = null
    }

    resume() {
        this.resumed = []
        this.refresh()
    }

    resumeQuote(qid) {
        this.ydyun && this.ydyun.getChannelState((s) => {
            if (s === YDYunConnection.READY) {
                let request = this.responsed[qid];
                request && this.send(request, true);

                // if(request.interfaceName === "FetchQuoteNative") {
                //     this.addNumber(request.params.subcribes,this.codeWithNumbersQuote)
                // }

                // else if(request.interfaceName === "FetchFullQuoteNative") {
                //     this.addNumber(request.params.subcribes,this.codeWithNumbersFullQuote)
                // }
            }
        });
    }

    pause() {

        this.paused = []

        Object.keys(this.responsed).forEach(qid => {
            let request = this.responsed[qid];

            if (request && (
                request.interfaceName === "FetchQuoteNative" ||
                request.interfaceName === "FetchFullQuoteNative")) {
                request.pause()
            }
            else if (request && request.interfaceName === "FetchConstituentStockNative") {
                this._cancelConstituentStock(parseInt(qid), request)
            }
            else if (request) {
                this._cancelSingleStream(parseInt(qid))
            }
        });

    }

    pauseQuote(qid, unregisterCodes) {
        if (unregisterCodes.length > 0) {
            let request = this.responsed[qid]
            let params = { subcribes: "", unsubcribes: unregisterCodes, subscribe: false }
            let unregisterRequest = this.createRequest(this.generateQid(), request.interfaceName, params, null)

            this.ydyun && this.ydyun.getChannelState((s) => {
                if (s === YDYunConnection.READY && unregisterRequest) {
                    this.send(unregisterRequest);
                    this.paused[qid] = unregisterRequest;
                }
            });
        }
    }

    addNumber(codelist, numberArray) {
        if (codelist === undefined) {
            return;
        }
        let codes = codelist.split(",")

        codes.forEach(code => {
            let has = numberArray[code]
            if (has != null) {
                numberArray[code] = ++has
            }
            else {
                numberArray[code] = 1
            }

        });

        // console.log('stock-http:addNumber numberArray= ', numberArray);

    }

    removeNumber(codelist, numberArray) {
        if (codelist === undefined) {
            return;
        }
        let codes = codelist.split(",")

        codes.forEach(code => {
            let has = numberArray[code]
            if (has != null) {
                let val = --has
                if (val < 0) val = 0
                numberArray[code] = val
            }
            else {

            }

        });

        // console.log('stock-http:removeNumber numberArray= ', numberArray);

    }

    resetInit() {
        // this.requestQueue = {};
        this.responsed = {};
        this.codeWithNumbersQuote = {}; //注册注销商品引用计数
        this.codeWithNumbersFullQuote = {}; //注册注销商品引用计数

        // this._subs = null
        this.quotes = []
        this.fullquotes = []
        this.mins = []
        this.candles = []
    }
    request(interfaceName, params, callback) {
        let qid = this.generateQid(),
            request = this.createRequest(qid, interfaceName, params, callback);

        let token = UserInfoUtil.getUserInfoReducer().token
        // console.log('UserToken = ', token);
        if (token == '')
            token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjoxLCJ1aWQiOiIxNTY0NTU3MDE4MzYyIiwiYWRtaW4iOmZhbHNlLCJpYXQiOjE1NjQ0NzA2MTgsImV4cCI6MTU2NTE2MTgxOCwiY2xhaW1zIjp7InN5c3JvbGUiOiJ1c2VyIn19.DUea52ZXqFbb8TNQOJfoL1HvAnAIhlJYSsTThxk_THA"
        this.ydyun && this.ydyun.setTokenString(token, (result) => {
            if (result) {
                this.ydyun && this.ydyun.getChannelState((s) => {
                    if (s === YDYunConnection.READY) {
                        Object.keys(this.requestQueue).forEach(qid => {
                            let request = this.requestQueue[qid];
                            // console.log('stock-http---', 'request--'+request+"   qid="+qid);

                            if (request) {
                                this.send(request);

                                // if (params.subscribe) {
                                this.responsed[qid] = request
                                // }

                                this.requestQueue[qid] = null

                            }

                        });
                    }
                });
            }
        });

        this.requestQueue[qid] = request;

        return request;
    }

    refresh(qid) {
        // this.ydyun && this.ydyun.getChannelState((s) => {
        //     if (s === YDYunConnection.READY) {

        //         if (qid !== undefined){
        //             let request = this.responsed[qid];
        //             request && this.send(request,true);
        //         }
        //         else {
        Object.keys(this.responsed).forEach(qid => {
            if (!this.resumed) {
                let request = this.responsed[qid];
                request && this.send(request, true);
                // request && this.send(request);
                if (!qid)
                    this.resumed[qid] = request
            }
        });
        Object.keys(this.requestQueue).forEach(qid => {
            if (!this.resumed) {
                let request = this.requestQueue[qid];
                request && this.send(request, true);
                // request && this.send(request);
                if (!qid)
                    this.resumed[qid] = request
            }
        });
        //         }

        //     }
        // });
    }

    refreshQuote(qid, registerCodes) {
        this.ydyun && this.ydyun.getChannelState((s) => {
            if (s === YDYunConnection.READY) {
                let request = this.responsed[qid];
                request && this.register(request.interfaceName, registerCodes, request.callback);
            }
        });
    }

    cancel(qid) {
        // 指定qid则取消指定的request，否则取消全部请求
        if (qid !== undefined) {
            if (this.requestQueue[qid] || this.responsed[qid]) {
                this._cancelRequest(qid)
                this.responsed[qid] = null;
            };
        } else {
            Object.keys(this.responsed).forEach(reqid => this._cancelRequest(parseInt(reqid)));
            this.responsed = []
        }
    }

    cancelQuote(qid, unregisterCodes) {
        this.unregister(qid, unregisterCodes);
        if (this.paused && this.paused.length === 0) return;
        if (Platform.OS == 'ios') {
            this.ydyun && this.ydyun.getChannelState((s) => {
                if (s === YDYunConnection.READY) {
                    this.ydyun && this.ydyun.cancelQuote();
                    this.ydyun && this.ydyun.cancelFullQuote();
                }
            });
        }
    }

    //   closeChannel() {

    //     // 取消所有请求后
    //     this.cancel();

    //     //断开双向流
    //     this.ydyun && this.ydyun.closeQuote()
    //     this.ydyun && this.ydyun.closeFullQuote()

    //     // 断开连接
    //     this.ydyun && this.ydyun.shutdown()
    //   }

    _cancelRequest(qid) {
        let request = this.responsed[qid] || this.requestQueue[qid];
        if (request && (
            request.interfaceName === "FetchQuoteNative" ||
            request.interfaceName === "FetchFullQuoteNative")) {
            request.cancel();
            if (this.responsed[qid] != null) {
                this.responsed[qid] = null;
            }
            if (this.requestQueue[qid] != null) {
                this.requestQueue[qid] = null;
            }
        }
        else if (request && request.interfaceName === "FetchConstituentStockNative") {
            this._cancelConstituentStock(qid, request)
        }
        else if (request) {
            this._cancelSingleStream(qid)
        }

    }

    _cancelConstituentStock(qid, request) {
        if (this.responsed[qid] != null) {
            this.ydyun && this.ydyun.cancelConstituentStock(qid, request.params.blockid)
            this.responsed[qid] = null
        }
        else if (this.requestQueue[qid] != null) {
            this.requestQueue[qid] = null
        }


    }

    _cancelSingleStream(qid) {
        if (this.responsed[qid] != null) {
            this.ydyun && this.ydyun.cancel(qid)
            this.responsed[qid] = null
        }
        else if (this.requestQueue[qid] != null) {
            this.requestQueue[qid] = null
        }
    }

    dataComing(evt) {
        try {
            let data;
            if (Platform.OS === 'ios') {
                data = evt.data || {}
            } else {
                data = JSON.parse(evt.data) || {}
            }
            let qid = evt.qid,
                request = this.requestQueue && this.requestQueue[qid] || this.responsed && this.responsed[qid];

            let callback = request.callback;
            if (typeof callback === 'function') {
                callback(data);
            }

        } catch (e) {
            //console.log(e.message)
        }
    }

    dataComingQuote(evt) {
        if (this.tempObj == null) {
            this.tempObj = evt;
        }
        try {
            let data, code, interfaceName;
            interfaceName = evt.interfaceName;

            if (interfaceName === "FetchQuoteNative") {

                if (Platform.OS === 'ios') {
                    data = evt.data || {};
                } else {
                    data = JSON.parse(evt.data) || {};
                }

                code = data.label;

                Object.keys(this.responsed).forEach(qid => {
                    let request = this.responsed[qid];

                    if (request && request.interfaceName === "FetchQuoteNative"
                        && request.params.subcribes.indexOf(code) != -1) {

                        let callback = request.callback;
                        if (typeof callback === 'function') {
                            callback(data);
                            this.quotes[code] = data
                        }
                    }

                });

            }

            if (interfaceName === "FetchFullQuoteNative") {

                if (Platform.OS === 'ios') {
                    data = evt.data || {};
                } else {
                    data = JSON.parse(evt.data) || {};
                }

                code = data.quote.label;
                let stock = null;
                for (const key in this.regedStocks) {
                    if (this.regedStocks.hasOwnProperty(key)) {
                        const element = this.regedStocks[key];
                        if (element.code == code) {
                            stock = element;
                            break;
                        }

                    }
                }
                if (stock) {
                    for (const key in stock.callbacks) {
                        if (stock.callbacks.hasOwnProperty(key)) {
                            const element = stock.callbacks[key];
                            element(data);
                        }
                    }
                }
                Object.keys(this.responsed).forEach(qid => {
                    let request = this.responsed[qid];

                    if (request && request.interfaceName === "FetchFullQuoteNative"
                        && request.params.subcribes.indexOf(code) != -1) {

                        let callback = request.callback;
                        if (typeof callback === 'function') {
                            callback(data);
                            this.fullquotes[code] = data;
                        }
                    }
                });

            }

        } catch (e) {
            //console.log(e.message)
        }
    }

    isAlready(req, isForce) {

        if (req.interfaceName === "FetchQuoteNative" || req.interfaceName === "FetchFullQuoteNative") {

            if (isForce) {

                for (let i in this.resumed) {
                    let r = this.resumed[i];
                    if (r && r.interfaceName === req.interfaceName
                        && r.params.subcribes === req.params.subcribes
                        && r.params.unsubcribes === req.params.unsubcribes) {
                        //console.log('stock-http:='+'resumed qurey' )
                        return true
                    }
                }

            }

            else {

                for (let i in this.responsed) {
                    let r = this.responsed[i];
                    if (r && r.interfaceName === req.interfaceName
                        && r.params.subcribes === req.params.subcribes
                        && r.params.unsubcribes === req.params.unsubcribes) {
                        // console.log('stock-http:='+'responsed qurey' )

                        return true
                    }
                }

                for (let j in this.paused) {
                    let r = this.paused[j];
                    if (r && r.interfaceName === req.interfaceName
                        && r.params.subcribes === req.params.subcribes
                        && r.params.unsubcribes === req.params.unsubcribes) {
                        // console.log('stock-http:='+'paused qurey' )

                        return true
                    }
                }

            }
        }

        else if (req.interfaceName === "FetchMinDataNative") {

            if (isForce) {

                for (let i in this.resumed) {
                    let r = this.resumed[i];

                    if (r && r.interfaceName === req.interfaceName
                        && r.params.days === req.params.days
                        && r.params.label === req.params.label) {
                        return true
                    }
                }

            }

            else {

                for (let i in this.responsed) {
                    let r = this.responsed[i];
                    if (r && r.interfaceName === req.interfaceName
                        && r.params.days === req.params.days
                        && r.params.label === req.params.label) {
                        return true
                    }
                }

                for (let j in this.paused) {
                    let r = this.paused[j];
                    if (r && r.interfaceName === req.interfaceName
                        && r.params.days === req.params.days
                        && r.params.label === req.params.label) {
                        return true
                    }
                }

            }
        }


        return false
    }

    send(request, isForce = false) {

        switch (request.interfaceName) {
            case 'FetchConstituentStockNative': {
                //console.log("这是主力决策资金流向统计调用grpc前",JSON.stringify(request))
                this.ydyun && this.ydyun.FetchConstituentStockNative(JSON.stringify(request), request.callback)
            }
                break;

            case 'FetchQuoteNative': {

                this.addNumber(request.params.subcribes, this.codeWithNumbersQuote)

                if (this.isAlready(request, isForce) && !isForce) {
                    let code = request.params.subcribes
                    let data = this.quotes[code]
                    data && request && request.callback(data)
                }
                else if (isForce && this.isAlready(request, isForce)) {

                }
                else {
                    this.ydyun && this.ydyun.FetchQuoteNative(JSON.stringify(request))
                }

            }
                break;

            case 'FetchFullQuoteNative': {

                this.addNumber(request.params.subcribes, this.codeWithNumbersFullQuote)

                if (this.isAlready(request) && !isForce) {
                    let code = request.params.subcribes
                    let data = this.fullquotes[code]
                    data && request && request.callback(data)

                }
                else if (isForce && this.isAlready(request, isForce)) {

                }

                else {
                    this.ydyun && this.ydyun.FetchFullQuoteNative(JSON.stringify(request))
                }

            }
                break;

            case 'FetchStaticQuoteNative': {
                this.ydyun && this.ydyun.FetchStaticQuoteNative(JSON.stringify(request))
            }
                break;

            case 'FetchCandleStickNative': {
                this.ydyun && this.ydyun.FetchCandleStickNative(JSON.stringify(request))
            }
                break;

            case 'FetchMinDataNative': {
                this.ydyun && this.ydyun.FetchMinDataNative(JSON.stringify(request))
            }
                break;

            case 'FetchHistoryMinDataNative': {
                this.ydyun && this.ydyun.FetchHistoryMinDataNative(JSON.stringify(request))
            }
                break;

            case 'FetchTicksNative': {
                this.ydyun && this.ydyun.FetchTicksNative(JSON.stringify(request))
            }
                break;

            case 'FetchSortNative': {
                this.ydyun && this.ydyun.FetchSortNative(JSON.stringify(request))
            }
                break;

            case 'FetchBlockSortNative': {
                this.ydyun && this.ydyun.FetchBlockSortNative(JSON.stringify(request))
            }
                break;

            case 'FetchPriVolNative': {
                this.ydyun && this.ydyun.FetchPriVolNative(JSON.stringify(request))
            }
                break;

            default:
                break;
        }

    }

    consoleParams(obj) {
        var description = "\n";
        for (var i in obj) {
            var property = obj[i];
            description += i + " = " + property + "\n";
        }

        return description

    }

    subscribe(service, data, callback) {
        data = data || [];
        data.sub = 1;
        return this.request(service, data, callback);
    }

    _unregisterEvents() {
        this._subs.forEach(e => e.remove());
        this._subs = [];
    }

    _registerEvents(id) {

        if (Platform.OS === 'ios') {
            this._subs = [
                loadingManagerEmitter.addListener('ydChannelMessage', ev => {
                    this.dataComing(ev)
                }),

                loadingManagerEmitter.addListener('ydChannelMessage4Quote', ev => {
                    this.dataComingQuote(ev)
                }),
                loadingManagerEmitter.addListener('ydChannelBlockSortMessage', ev => {
                    this.dataComing(ev)
                })
            ];

        } else {
            this._subs = [
                RCTDeviceEventEmitter.addListener('ydChannelMessage', ev => {
                    this.dataComing(ev)
                }),
                RCTDeviceEventEmitter.addListener('ydChannelClosed', ev => {

                }),
                RCTDeviceEventEmitter.addListener('ydChannelFailed', ev => {

                }),
                RCTDeviceEventEmitter.addListener('ydChannelMessage4Quote', ev => {
                    this.dataComingQuote(ev)
                })
            ];
        }
    }

    find(code) {
        let idx = -1;
        for (let i = 0; i < this.regedStocks.length; i++) {
            if (this.regedStocks[i].code == code) {
                idx = i;
                break;
            }
        }
        return idx;
    }

    yd_fetchFullQuote(regCodes, unRegCodes, callback) {
        if (!Array.isArray(regCodes) || !Array.isArray(unRegCodes) || !callback) {
            throw 'regCodes or unRegCodes is not a Array! or callback is not a function! ';
        }
        // console.log('yd_fetchFullQuote ', regCodes, unRegCodes);
        let willReg = [], willUnReg = [];
        for (let index = 0; index < regCodes.length; index++) {
            const code = regCodes[index];
            let idx = this.find(code);
            let obj = this.regedStocks[idx];
            if (!obj) {
                obj = {};
                obj.code = code;
                obj.callbacks = [callback];
                this.regedStocks.push(obj);
                willReg.push(code);
            } else {
                obj.callbacks.push(callback);
                if (this.tempObj) {
                    callback(this.tempObj.data);
                }
            }
        }
        for (let uindex = 0; uindex < unRegCodes.length; uindex++) {
            const code = unRegCodes[uindex];
            let uidx = this.find(code);
            let uobj = this.regedStocks[uidx];
            if (uobj && uobj.callbacks.length) {// 增加这个判断是为了外面多次调用注销或者在注册之前先注销
                let iidx = -1;
                for (let i = 0; i < uobj.callbacks.length; i++) {
                    const element = uobj.callbacks[i];
                    if (element == callback) {
                        iidx = i;
                        break;
                    }
                }
                if (iidx == -1) break;
                uobj.callbacks.splice(iidx, 1);// 此处可以删除第一个回调或者最后一个回调
                if (uobj.callbacks.length == 0) {
                    // 调用注销
                    willUnReg.push(code);
                    this.regedStocks.splice(uidx, 1);
                    let x = 23;
                    console.log(x);
                }
            }
        }

        // console.log('yd_fetchFullQuote regedStocks: ', this.regedStocks);
        if (willReg.length || willUnReg.length) {
            this.tempObj = null;
            let regString = willReg.join(',');
            let unRegString = willUnReg.join(',');
            let params = { interfaceName: 'FetchFullQuoteNative', params: { subcribes: regString, unsubcribes: unRegString } };
            // console.log('yd_fetchFullQuote next params: ', JSON.stringify(params))
            this.ydyun && this.ydyun.FetchFullQuoteNative(JSON.stringify(params));
        }
    }
}

export let connection = new YDYunConnection({
    address: null,
    dataType: global.DZHYUN_DATA_TYPE
});
