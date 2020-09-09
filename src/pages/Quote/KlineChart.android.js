'use strict'

import React, { Component } from 'react';
import {
    //    PanResponder,
    View,
    StyleSheet,
    Platform,
    Image,
    Text,
    DeviceEventEmitter,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Orientation from 'react-native-orientation';
import _KLineChart from './YDKLineChart';
import * as baseStyle from '../../components/baseStyle.js';
import BaseComponent from '../../components/BaseComponent.js';
import Loading from '../../components/Loading.js';
import Button from '../../components/Button.js'
// import { VerticalLine, HorizontalLine } from './PriceBox.js'
import ShareSetting from '../../modules/ShareSetting.js';
import { connection } from './YDYunConnection';


/*
 * recognized figer number
 * 0,tap
 * 1,pan
 * 2,pinch 捏合
 */
let _recognized = 0;

let _loopFormula = ShareSetting.getLoopFormula();

//k线缩放的根数按照斐波那契数列
const _KLineNumberInScreenArray = [5, 8, 13, 21, 34, 55, 89, 144, 233, 250];

var isResponder = true;
let _defaultIndexOfKLineNumber = 5;
let presentMove = false;

class KlineChart extends BaseComponent {

    constructor(props) {
        super(props);
        //新加的用于控制k线缩放状态的变量
        this._IndexOfKLineNumber = _defaultIndexOfKLineNumber;

        let newLength = props.chartData.length;
        // let show = _KLineNumberInScreenArray[_defaultIndexOfKLineNumber];
        let show = _KLineNumberInScreenArray[this._IndexOfKLineNumber];

        let startposinit = newLength - show;
        if (startposinit < 0) startposinit = 0;
        this.isMoveTime = 0
        this.isMoveTime_single = 0
        this.isMoveTime_cross = 0
        this.state = {
            mainFormula: this.props.main != undefined ? this.props.main : '蓝粉彩带',//主图指标
            viceFormula: this.props.first != undefined ? this.props.first : '操盘提醒',//副图1指标
            secondViceName: '底部出击',//副图2指标
            showCount: show,
            startPos: startposinit,
            legendPos: -1,
            priceboxStyle: {},
            vertiacllineStyle: {},
            horizontallineStyle: {},
            priceboxData: null,
            fuTu: '2',
            //新加关于k线缩放的属性
            pShowCount: show,
            showModal: false,
            modalText: '',
            //是否获取到所有的k线数据
            KlineAllData: false,
            curCrossY: 0
        };

        this.layout = {};
        this.isFetching = false;
        //与十字光标显示隐藏相关属性
        this.showPriceBox = false;
        this.priceboxStyle = {
            opacity: 0,
            left: null,
            right: null,
        };
        this.verticallineStyle = {
            opacity: 0,
            left: null,
            height: 0,
        };
        this.horizontallineStyle = {
            opacity: 0,
            top: null,
            width: 0,
        };
        this.isDidMount = false;
        this._tapStartTime = 0;
        this.loopNumber = 1;
        this.loopNumber2 = 1;
        this.updataListener = DeviceEventEmitter.addListener('updataListener', (mainFormula, viceFormula, secondViceFormula) => {
            AsyncStorage.setItem('MAINNAME', mainFormula, (errs) => {//根据外层选择的指标，进行组件内的K线图指标刷新,并且存起来,每个股票都复用相同的选择过的指标
                if (!errs && mainFormula != null) {
                    this.setState({ mainFormula: mainFormula })
                }
            });
            AsyncStorage.setItem('FIRSTNAME', viceFormula, (errs) => {
                if (!errs && viceFormula != null) {
                    this.setState({ viceFormula: viceFormula })
                }
            });
            AsyncStorage.setItem('SECONDNAME', secondViceFormula, (errs) => {
                if (!errs && secondViceFormula != null) {
                    this.setState({ secondViceName: secondViceFormula }, () => {
                    })
                }
            });
            // this.setState({mainFormula:mainFormula,viceFormula:viceFormula,secondViceName:secondViceFormula})
        });

       
        //this._lastPinchDiff=0;
        this.zooming = false;
        this.pShowCount = show;
        //k线的放大缩小的控制方法
        this.controlKline = this.controlKline.bind(this);
        this.panendend = false;
        this.panTag = 0;
        this.currentDate = 0;
        this.moveDx = 0;

        this.splitData = [];
    };

    componentWillReceiveProps(nextProps) {

        // let showLast = (this.state.startPos+this.state.showCount == oldLength);
        this.isFetching = false;
        let newLength = nextProps.chartData.length;
        let oldLength = this.props.chartData.length;
        let showLast = this.state.startPos + this.state.showCount >= oldLength;


        //change period
        if (this.props.tabName !== nextProps.tabName) {

            // this.setState({
            //     showCount: _KLineNumberInScreenArray[_defaultIndexOfKLineNumber],
            //     pShowCount: _KLineNumberInScreenArray[_defaultIndexOfKLineNumber],
            // });
            this.setState({
                showCount: _KLineNumberInScreenArray[this._IndexOfKLineNumber],
                pShowCount: _KLineNumberInScreenArray[this._IndexOfKLineNumber],
            });
            // this.setState({startPos: Math.max( newLength-_KLineNumberInScreenArray[_defaultIndexOfKLineNumber], 0)});
            this.setState({ startPos: Math.max(newLength - _KLineNumberInScreenArray[this._IndexOfKLineNumber], 0) });
        }
        //change K line in same period
        else {
            // if (newLength === oldLength && showLast) {
            //     this.setState({'startPos': Math.max(newLength - this.state.showCount, 0)});
            //     return;
            // }
            // if(this.props.stkInfo.Obj!==nextProps.stkInfo.Obj){
            //     this.setState({startPos: Math.max(newLength - _KLineNumberInScreenArray[this._IndexOfKLineNumber], 0)});
            //     return;
            // }

            if (newLength === oldLength) {
                // this.setState({'startPos': Math.max( this.props.oldLength + this.state.startPos, 0)});
                return;
            }

            else if (newLength < oldLength) {
                // this.setState({'startPos': Math.max( newLength-this.state.showCount, 0)});
                this.setState({ startPos: Math.max(newLength - this.state.showCount, 0) });
            }

            else if ((newLength - oldLength == 1) && showLast) {
                // this.setState({'startPos': Math.max( newLength-this.state.showCount, 0)});
                this.setState({ startPos: Math.max(newLength - this.state.showCount, 0) });
            }

            else if (newLength > oldLength && (this.props.chartData[oldLength - 1].ShiJian === nextProps.chartData[newLength - 1].ShiJian)) {
                // this.setState({'startPos': Math.max( this.state.startPos+newLength-oldLength, 0)});
                this.setState({ startPos: Math.max(this.state.startPos + newLength - oldLength, 0) });
            }

        }

    };

    componentWillUnMount() {
        this.isDidMount = false;
        this.updataListener && this.updataListener.remove();
        this.updataLandscapeListener && this.updataLandscapeListener.remove();
        ShareSetting.setIndexOfKLineNumber(5);


        this.biggerListener && this.biggerListener.remove();
        this.smallerListener && this.smallerListener.remove();
        this.olderListener && this.olderListener.remove();
        this.laterListener && this.laterListener.remove();
        this.KlineAllDataListener && this.KlineAllDataListener.remove();
        this.notFullListener && this.notFullListener.remove();

        this.toPorListener && this.toPorListener.remove();
        this.longPressTimer && clearTimeout(this.longPressTimer);
        this.toland && this.toland.remove();
        this.panMove && this.panMove.remove();
        this.pinchMoveEmitter && this.pinchMoveEmitter.remove();
        this.changeSplitData && this.changeSplitData.remove();

    }

    ///Gesture recognition begin

    componentWillMount() {
        _loopFormula = ShareSetting.getLoopFormula();
        let newLength = this.props.chartData.length;
        // let show = _KLineNumberInScreenArray[_defaultIndexOfKLineNumber];
        let show = _KLineNumberInScreenArray[this._IndexOfKLineNumber];
        let startposinit = newLength - show;
        if (startposinit < 0) startposinit = 0;
        // 由横屏切回竖屏时，K线操作还原
        this.toPorListener = DeviceEventEmitter.addListener('toPor', () => {
            this._IndexOfKLineNumber = _defaultIndexOfKLineNumber;
            this.setState({
                showCount: _KLineNumberInScreenArray[_defaultIndexOfKLineNumber],
                pShowCount: _KLineNumberInScreenArray[_defaultIndexOfKLineNumber],
            });
            let newLength1 = this.props.chartData.length;
            // this.setState({startPos: Math.max( newLength-_KLineNumberInScreenArray[_defaultIndexOfKLineNumber], 0)});
            // this.setState({startPos: Math.max(newLength - _KLineNumberInScreenArray[_defaultIndexOfKLineNumber], 0)});
            this.setState({ 'startPos': Math.max(newLength1 - this.state.showCount, 0) });
        });
        // 由竖屏切换到横屏时，记录竖屏k线状态
        this.toland = DeviceEventEmitter.addListener('toLand', () => {
            _defaultIndexOfKLineNumber = this._IndexOfKLineNumber;
        })

        // DeviceEventEmitter.addListener('panMove', () => {
        //     this.panTag = 1;
        // })

        // this.pinchMoveEmitter = DeviceEventEmitter.addListener('pinchMove', (value) => {
        //     this.pShowCount = value.count;
        //     this.panTag = 0;
        //     this.panendend = false;
        //     this.setState({
        //         showCount: value.count,
        //         pShowCount: value.count
        //     })
        // });

        // K线操作通知
        this.biggerListener = DeviceEventEmitter.addListener('bigger', () => {
            this.controlKline(0);
        });
        this.smallerListener = DeviceEventEmitter.addListener('smaller', () => {
            this.controlKline(1);
        });
        this.olderListener = DeviceEventEmitter.addListener('older', () => {
            this.controlKline(2);
        });
        this.laterListener = DeviceEventEmitter.addListener('later', () => {
            this.controlKline(3);
        });
        this.KlineAllDataListener = DeviceEventEmitter.addListener('KlineAllData', () => {
            this.setState({
                KlineAllData: true,
            })
        });
        this.notFullListener = DeviceEventEmitter.addListener('notFull', () => {
            //如果KlineAllData为true，又有新的数据，则置为false，档没有数据时再置为true
            if (this.state.KlineAllData) {
                this.setState({
                    KlineAllData: false,
                })
            }

        });

        this.changeSplitData = DeviceEventEmitter.addListener('changeSplitData', (result) => {
            this.splitData = result.data;
        });

        AsyncStorage.getItem('MAINNAME', (errs, result) => {
            if (!errs) {
                if (result == null || !ShareSetting.isMainTarget(result)) {
                    this.setState({ mainFormula: '蓝粉彩带' })
                } else {
                    this.setState({ mainFormula: result })
                }
            }
        });
        AsyncStorage.getItem('FIRSTNAME', (errs, result) => {
            if (!errs) {
                if (result == null || !ShareSetting.isLoopTarget(result)) {
                    this.setState({ viceFormula: '操盘提醒' })
                } else {
                    this.setState({ viceFormula: result })
                }
            }
        });
        AsyncStorage.getItem('SECONDNAME', (errs, result) => {
            if (!errs) {
                if (result == null || !ShareSetting.isLoopTarget(result)) {
                    this.setState({ secondViceName: '底部出击' }, () => {
                    })
                } else {
                    this.setState({ secondViceName: result }, () => {
                    })
                }
            }
        });

      
    }

    componentDidMount() {
        this.isDidMount = true;
        //如果横屏调用滑动
        // if(this.props.isLandscape){

        // this.setState({
        //     showCount:_KLineNumberInScreenArray[ShareSetting.getIndexOfKLineNumber()],
        // })
        // }
    }
    // 控制栏控制方法
    controlKline = (flag) => {
        switch (flag) {
            case 0: {
                console.log('controlKline', 'detailzoomIn--------');
                this.kchart && this.kchart.zoomOut();
            }
                break;
            case 1: {
                this.kchart && this.kchart.zoomIn();
            }
                break;
            case 2: {
                this.kchart && this.kchart.moveLeft();
            }
                break;
            case 3: {
                this.kchart && this.kchart.moveRight();
            }
                break;
        }

    }
    // 控制栏控制方法
    // controlKline = (flag) => {
    //     if (this.showPriceBox) {
    //         this.showPriceBox = false;
    //     }
    //     switch (flag) {
    //         case 0: {
    //             this.showPriceBox = false;
    //             this.handleResetCheckPriceState();
    //             let index = _KLineNumberInScreenArray.indexOf(this.state.showCount);
    //             if (index < 0 || index > 9) {
    //                 return;
    //             }

    //             if (index === 0) {
    //                 this.setState({
    //                     showModal: true,
    //                     modalText: '已经最大了！'
    //                 }, () => {
    //                     this.panTag = 0;
    //                     DeviceEventEmitter.emit('isLimited');
    //                     setTimeout(() => {
    //                         this.setState({
    //                             showModal: false
    //                         })
    //                     }, 1000);
    //                 })
    //             } else {
    //                 index--;
    //                 let count = _KLineNumberInScreenArray[index];


    //                 this.setState({
    //                     pShowCount: count,
    //                 }, () => {
    //                     if (this.props.chartData.length > count) {
    //                         let curPos = this.state.startPos;
    //                         if (this.props.chartData.length > this.state.showCount) {
    //                             //k线的数量比当前显示的数量多
    //                             curPos = curPos + Math.abs(count - this.state.showCount);
    //                         } else {
    //                             //k线的数量比当前显示的数量少
    //                             curPos = 0;
    //                         }

    //                         this.setState({
    //                             startPos: curPos,
    //                             showCount: count,
    //                         });
    //                         //设置显示k线条数
    //                         if (!this.props.isLandscape) {
    //                             let indexk = _KLineNumberInScreenArray.indexOf(count);
    //                             if (indexk < 0 || indexk > 9) {
    //                                 return;
    //                             }
    //                             ShareSetting.setIndexOfKLineNumber(indexk);
    //                         }
    //                     } else {
    //                         //数据不够一屏，以左边为基准放大
    //                         this.setState({
    //                             startPos: 0,
    //                             showCount: count,
    //                         })
    //                         // this.controlKline(0);
    //                         //设置显示k线条数
    //                         if (!this.props.isLandscape) {
    //                             let indexk = _KLineNumberInScreenArray.indexOf(count);
    //                             if (indexk < 0 || indexk > 9) {
    //                                 return;
    //                             }
    //                             ShareSetting.setIndexOfKLineNumber(indexk);
    //                             // ShareSetting.setIndexOfKLineNumber(_KLineNumberInScreenArray.indexOf(count));
    //                         }
    //                     }
    //                 })
    //             }
    //             // this._IndexOfKLineNumber = _KLineNumberInScreenArray.indexOf(this.state.showCount);
    //             if (index < 0 || index > 9) {
    //                 return;
    //             }
    //             this._IndexOfKLineNumber = index;
    //         }
    //             break;
    //         case 1: {
    //             this.showPriceBox = false;


    //             this.handleResetCheckPriceState();
    //             let index = _KLineNumberInScreenArray.indexOf(this.state.showCount);
    //             if (index < 0 || index > 9) {
    //                 return;
    //             }
    //             if (index === _KLineNumberInScreenArray.length - 1) {
    //                 this.setState({
    //                     showModal: true,
    //                     modalText: '已经最小了！'
    //                 }, () => {
    //                     this.panTag = 0;
    //                     DeviceEventEmitter.emit('isLimited');
    //                     setTimeout(() => {
    //                         this.setState({
    //                             showModal: false
    //                         })
    //                     }, 1000);
    //                 })
    //             } else {
    //                 index++;
    //                 let count = _KLineNumberInScreenArray[index];

    //                 this.setState({
    //                     pShowCount: count,
    //                 }, () => {
    //                     //     +this.props.chartData.length+'===>count:'+count);
    //                     if (this.props.chartData.length >= count) {
    //                         let curPos = this.state.startPos;

    //                         this.setState({
    //                             startPos: curPos - Math.abs(count - this.state.showCount),
    //                             showCount: count,
    //                         }, () => {
    //                             this._onGestureEnd()
    //                         });
    //                         //设置显示k线条数
    //                         if (!this.props.isLandscape) {
    //                             // ShareSetting.setIndexOfKLineNumber(_KLineNumberInScreenArray.indexOf(count));
    //                             let indexk = _KLineNumberInScreenArray.indexOf(count);
    //                             if (indexk < 0 || indexk > 9) {
    //                                 return;
    //                             }
    //                             ShareSetting.setIndexOfKLineNumber(indexk);

    //                         }
    //                     } else {
    //                         //数据不够一屏
    //                         this.setState({
    //                             startPos: 0,
    //                             showCount: count,
    //                         });
    //                         // this.setState({
    //                         //     startPos: 0,
    //                         //     showCount: this.props.chartData.length,
    //                         // });
    //                         //设置显示k线条数
    //                         if (!this.props.isLandscape) {
    //                             // ShareSetting.setIndexOfKLineNumber(_KLineNumberInScreenArray.indexOf(count));
    //                             let indexk = _KLineNumberInScreenArray.indexOf(count);
    //                             if (indexk < 0 || indexk > 9) {
    //                                 return;
    //                             }
    //                             ShareSetting.setIndexOfKLineNumber(indexk);
    //                         }

    //                     }
    //                 })
    //             }
    //             // this._IndexOfKLineNumber = _KLineNumberInScreenArray.indexOf(this.state.showCount);
    //             if (index < 0 || index > 9) {
    //                 return;
    //             }
    //             this._IndexOfKLineNumber = index;
    //         }
    //             break;
    //         case 2: {
    //             this.showPriceBox = false;
    //             this.handleResetCheckPriceState();
    //             this.lastStartPos = this.state.startPos;
    //             let show = this.state.showCount;
    //             let newLast = Math.min(
    //                 this.lastStartPos + show - 1,
    //                 this.props.chartData.length - 1
    //             );
    //             let newPos = Math.max(newLast - show + 1, 0);
    //             newPos = newPos - 1
    //             if (newPos >= 0) {
    //                 if (newLast + 1 !== this.props.chartData.length) {
    //                     this.setState({
    //                         startPos: newPos,
    //                         moveCount: -(this.props.chartData.length - newPos - show),
    //                     }, () => {
    //                         this._onGestureEnd()
    //                     });
    //                 } else {
    //                     this.setState({
    //                         startPos: newPos,
    //                         moveCount: -(this.props.chartData.length - newPos - show),
    //                     }, () => {
    //                         this._onGestureEnd()
    //                     });
    //                 }
    //             } else {
    //                 if (!this.state.showModal) {
    //                     //如果接受到数据全部获取
    //                     if (this.state.KlineAllData) {
    //                         this.setState({
    //                             showModal: true,
    //                             modalText: '已经是最老K线！'
    //                         }, () => {
    //                             DeviceEventEmitter.emit('isLimited');
    //                             setTimeout(() => {
    //                                 this.setState({
    //                                     showModal: false
    //                                 })
    //                             }, 1000);
    //                         })
    //                     }
    //                 }
    //             }
    //         }

    //             break;
    //         case 3: {
    //             this.showPriceBox = false;
    //             this.handleResetCheckPriceState();
    //             this.lastStartPos = this.state.startPos;
    //             let show = this.state.showCount;
    //             let newLast = Math.min(
    //                 this.lastStartPos + show - 1,
    //                 this.props.chartData.length - 1
    //             );
    //             let newPos = Math.max(newLast - show + 1, 0);
    //             newPos = newPos + 1
    //             if (newPos + show - 1 < this.props.chartData.length) {
    //                 if (newLast + 1 !== this.props.chartData.length) {
    //                     this.setState({
    //                         startPos: newPos,
    //                         moveCount: -(this.props.chartData.length - newPos - show),
    //                     });
    //                 } else {
    //                     this.setState({
    //                         startPos: newPos,
    //                         moveCount: -(this.props.chartData.length - newPos - show),
    //                     });
    //                 }
    //             } else {
    //                 if (this.panendend || this.panTag === 0) {
    //                     this.setState({
    //                         showModal: true,
    //                         modalText: '已经是最新K线！'
    //                     }, () => {
    //                         DeviceEventEmitter.emit('isLimited');
    //                         this.panendend = false;
    //                         this.panTag = 0;
    //                         setTimeout(() => {
    //                             this.setState({
    //                                 showModal: false
    //                             })
    //                         }, 1000);
    //                     })
    //                 }
    //             }
    //         }
    //             break;
    //     }
    // }

    changeTarget(futu){

        if(futu==undefined){
            return;
        }
        if(futu==1){
                this.setState({fuTu:'1'},()=>{
                    let f = _loopFormula[this.loopNumber];
                    ShareSetting.selectFormula(f);
                    if(f != null){
                        // this.props&&this.props.callbackLoopNum&& this.props.callbackLoopNum(f);
                        AsyncStorage.setItem('FIRSTNAME',f,(errs)=>{
                            if (!errs && f != null) {
                                this.setState( {viceFormula : f} );
                            }
                        });
                    }
                    this.loopNumber++;

                    if (this.loopNumber >= _loopFormula.length){
                        this.loopNumber = 0;
                    }

            })
                            
        }else if(futu==2){
            this.setState({fuTu:'2'},()=>{
                let f = _loopFormula[this.loopNumber2];
                ShareSetting.selectVice2Formula(f);
                if(f != null){
                    AsyncStorage.setItem('SECONDNAME',f,(errs)=>{
                        if (!errs && f != null) {
                            this.setState( {secondViceName : f} );
                        }
                    });
                }

                this.loopNumber2++;

                if (this.loopNumber2 >= _loopFormula.length){
                    this.loopNumber2 = 0;
                }

            })
               
        }

    }

    // changeToLandscape(e, s) {

    //     if (e && e.nativeEvent && e.nativeEvent.locationY) {
    //         let a = Math.round(e.nativeEvent.locationY);
    //         if (a > (this.layout.height * 1 / 2) - 30) {
    //             if (a > (this.layout.height * 1 / 2) + 30 && a < (this.layout.height * 3 / 4) + 30) {
    //                 this.setState({ fuTu: '1' }, () => {
    //                     let f = _loopFormula[this.loopNumber];
    //                     ShareSetting.selectFormula(f);
    //                     if (f != null) {
    //                         AsyncStorage.setItem('FIRSTNAME', f, (errs) => {
    //                             if (!errs && f != null) {
    //                                 this.setState({ viceFormula: f });
    //                             }
    //                         });
    //                     }

    //                     this.loopNumber++;

    //                     if (this.loopNumber >= _loopFormula.length) {
    //                         this.loopNumber = 0;
    //                     }
    //                 })
    //             }
    //             if (a > (this.layout.height * 3 / 4) + 30 && a < this.layout.height) {
    //                 this.setState({ fuTu: '2' }, () => {
    //                     let f = _loopFormula[this.loopNumber2];
    //                     // ShareSetting.selectFormula(f);
    //                     if (f != null) {
    //                         AsyncStorage.setItem('SECONDNAME', f, (errs) => {
    //                             if (!errs && f != null) {
    //                                 this.setState({ secondViceName: f }, () => {
    //                                 });
    //                             }
    //                         });
    //                     }

    //                     this.loopNumber2++;

    //                     if (this.loopNumber2 >= _loopFormula.length) {
    //                         this.loopNumber2 = 0;
    //                     }
    //                 })
    //             }
    //         }
    //         else {
    //             Orientation.lockToLandscape();
    //         }
    //     }

    // }

    //通过点击的位置判断切换副图还是出现十字线
    // handleTap(e,s) {
    //     if (e && e.nativeEvent && e.nativeEvent.locationY) {
    //         let a = Math.round(e.nativeEvent.locationY);
    //         if (a > this.layout.height * 1/2) {
    //             if(a > this.layout.height * 1/2 && a < this.layout.height * 3/4){
    //                 this.setState({fuTu:'1'},()=>{
    //                     let f = _loopFormula[this.loopNumber];
    //                     ShareSetting.selectFormula(f);
    //                     if(f != null){
    //                         this.props&&this.props.callbackLoopNum&& this.props.callbackLoopNum(f);
    //                         AsyncStorage.setItem('FIRSTNAME',f,(errs)=>{
    //                             if (!errs && f != null) {
    //                                 this.setState( {viceFormula : f} );
    //                             }
    //                         });
    //                     }
    //                     this.loopNumber++;
    //
    //                     if (this.loopNumber >= _loopFormula.length){
    //                         this.loopNumber = 0;
    //                     }
    //                 })
    //             }if(a > this.layout.height * 3/4 && a < this.layout.height){
    //                 this.setState({fuTu:'2'},()=>{
    //                     let f = _loopFormula[this.loopNumber2];
    //                     ShareSetting.selectFormula(f);
    //                     if(f != null){
    //                         AsyncStorage.setItem('SECONDNAME',f,(errs)=>{
    //                             if (!errs && f != null) {
    //                                 this.setState( {secondViceName : f} );
    //                             }
    //                         });
    //                     }
    //
    //                     this.loopNumber2++;
    //
    //                     if (this.loopNumber2 >= _loopFormula.length){
    //                         this.loopNumber2 = 0;
    //                     }
    //                 })
    //             }
    //         }
    //         else {
    //             this._onTap(e,s);
    //         }
    //     }else {
    //         this._onTap(e,s);
    //     }
    //
    // }

    render() {
        return (
            <View style={styles.flex}>
                <View style={styles.flex} {...this.props.handlers} >
                    {/* <View {...this._panResponder.panHandlers} style={styles.flex}
                    onLayout={this._onLayout.bind(this)} {...this.props.handlers} > */}

                    <_KLineChart
                        // ref="kchart"
                        ref={(kchart) => {
                            this.kchart = kchart
                        }}
                        style={styles.flex}
                        isLandscape={this.props.isLandscape}
                        fuTu={this.state.fuTu}
                        chartData={{
                            period: this.props.period,
                            split: this.props.split,
                            chartType: 'kline',
                            stkInfo: this.props.stkInfo,
                            color: {
                                ShangZhangYanSe: baseStyle.RED,
                                XiaDieYanSe: baseStyle.GREEN,
                                BeiJingYanSe: baseStyle.WHITE
                            },
                            chartData: this.props.chartData
                        }}
                        mainName={this.state.mainFormula}
                        viceName={this.state.viceFormula}
                        secondViceName={this.state.secondViceName}
                        showCount={this.state.showCount}
                        startPos={this.state.startPos}
                        legendPos={this.state.legendPos}
                        getTimeForKLine={(event) => {
                            if (event.nativeEvent.selected && event.nativeEvent.selected != -1) {
                                this.showPriceBox = true;
                                this._showKlineData(event.nativeEvent.selected);
                            } else {
                                this.showPriceBox = false;
                                this.changeTarget(event.nativeEvent.futu);
                            }
                           

                            // event.nativeEvent.time && console.warn('controlKline=time=' + event.nativeEvent.time+"   showPriceBox="+this.showPriceBox);

                            event.nativeEvent.time && DeviceEventEmitter.emit('getTimeListener', event.nativeEvent.time, this.showPriceBox);
                            event.nativeEvent.time && DeviceEventEmitter.emit('getTimeForLandscapeListener', event.nativeEvent.time);

                        }}
                        getMADataForKLine={(event) => {
                            let legendData = event.nativeEvent.array;
                            let colorData = event.nativeEvent.colorArray
                            let zhuTuName = event.nativeEvent.zhuTuName
                            if (legendData && colorData)
                                DeviceEventEmitter.emit('getDataForKChartListener', legendData, colorData, zhuTuName);
                        }}
                        getFuTu1DataForKLine={(event) => {
                            let name = event.nativeEvent.fuTuName;

                            let legendData = event.nativeEvent.fuTuArray;
                            let colorData = event.nativeEvent.fuTuColorArray
                            DeviceEventEmitter.emit('getfuTu1DataForKChartListener', name, legendData, colorData);
                        }}
                        getFuTu2DataForKLine={(event) => {
                            let name = event.nativeEvent.fuTuName;

                            let legendData = event.nativeEvent.fuTuArray;
                            let colorData = event.nativeEvent.fuTuColorArray
                            DeviceEventEmitter.emit('getfuTu2DataForKChartListener', name, legendData, colorData);

                        }}
                        getLanMADataForKLine={(event) => {
                            let legendData = event.nativeEvent.array;
                            let colorData = event.nativeEvent.colorArray
                            let zhuTuName = event.nativeEvent.zhuTuName
                            DeviceEventEmitter.emit('getDataForLandscapeListener', legendData, colorData, zhuTuName);
                        }}
                        getLanFuTu1DataForKLine={(event) => {
                            let name = event.nativeEvent.fuTuName;
                            let legendData = event.nativeEvent.fuTuArray;
                            let colorData = event.nativeEvent.fuTuColorArray
                            DeviceEventEmitter.emit('getfuTuDataForLandscapeListener', legendData, colorData, name);
                        }}
                    />
                    {
                        1 === 1 ? (
                            <View />
                        )
                            : (
                                <PriceBox style={[styles.pricebox, this.state.priceboxStyle]}
                                    data={this.state.priceboxData} />
                            )
                    }


                    {/* <VerticalLine style={[styles.verticalline, this.state.verticallineStyle]} />
                    <HorizontalLine style={[styles.horizontalline, this.state.horizontallineStyle]} /> */}
                </View>

                {
                    this.state.showModal ? (
                        <View
                            style={{
                                position: 'absolute',
                                width: Dimensions.get('window').width,
                                height: Dimensions.get('window').height,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 40,
                                    left: (Dimensions.get('window').width - 150) / 2,
                                    width: 150,
                                    height: 50,
                                    borderRadius: 5,
                                    backgroundColor: 'black',
                                    opacity: 0.8,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text style={{ color: 'white' }}>
                                    {this.state.modalText}
                                </Text>
                            </View>
                        </View>
                    ) : null

                }


            </View>
        );


    };

    _onLayout(event) {
        this.layout = event.nativeEvent.layout;

        if (this.props.hammer) {
            const mc = this.props.hammer;
            let pan = mc.get('pan');
            if (pan) {
                let threshold = event.nativeEvent.layout.width / this.state.showCount;
                pan.options.threshold = threshold;
            }
        }
    };

    _onPickFormula(formula) {
        if (ShareSetting.isMainFormula(formula)) {
            this.setState({ 'mainFormula': formula });
        } else {
            this.setState({ 'viceFormula': formula });
        }
    };


    // _onCrossMove(e, s) {
    //     // console.warn('e.nativeEvent.locationY=' + e.nativeEvent.locationY, 's.dy=' + s.dy);
    //     // if (s.moveX > this.layout.width || e.nativeEvent.locationY > this.layout.height || e.nativeEvent.locationY < 1) {
    //     //     return;
    //     // }
    //     // e && e.nativeEvent && e.nativeEvent.locationY && this._showPriceBox(s.moveX, e.nativeEvent.locationY);


    //     if(e && e.nativeEvent && e.nativeEvent.locationY &&this.state.curCrossY<=0){
    //         this.state.curCrossY=e.nativeEvent.locationY;
    //     }
    //     if (s.moveX > this.layout.width || this.state.curCrossY+ s.dy -5> this.layout.height|| this.state.curCrossY+ s.dy < 4) {
    //         return;
    //     }

    //     e && e.nativeEvent && e.nativeEvent.locationY && this._showPriceBox(s.moveX+15, this.state.curCrossY+ s.dy-5);

    // };

    // _onPanStart(e) {
    //     if (!this.showPriceBox) {
    //         this.lastStartPos = this.state.startPos;
    //     }
    // };

    // _onPanMove(e, s) {
    //     if (!this.showPriceBox && this.lastStartPos !== undefined) {
    //         let kWidth = this.layout.width / this.state.showCount;
    //         let moveCount = -Math.round(s.dx / kWidth);
    //         let show = this.state.showCount;
    //         let newLast = Math.min(this.lastStartPos + show - 1 + moveCount, this.props.chartData.length - 1);
    //         let newPos = Math.max(newLast - show + 1, 0);
    //         if (newPos != this.state.startPos) {
    //             this.setState({ startPos: newPos });
    //         }
    //         //滑动的产生的位移，当前x坐标
    //         let nowDx = s.moveX;

    //         if (newPos + show >= this.props.chartData.length && (nowDx - this.moveDx < 0)) {
    //             this.moveDx = 0;
    //             //最新k线,当弹窗消失后才可以再次显示
    //             if (!this.state.showModal) {
    //                 if (this.panTag === 0 || this.panendend) {
    //                     this.setState({
    //                         showModal: true,
    //                         modalText: '已经是最新K线！'
    //                     }, () => {
    //                         DeviceEventEmitter.emit('isLimited');
    //                         this.panendend = false;
    //                         this.panTag = 0;
    //                         setTimeout(() => {
    //                             this.setState({
    //                                 showModal: false
    //                             })
    //                         }, 1000);
    //                     })
    //                 }
    //             }

    //         }
    //         else if (newPos < 1 && (nowDx - this.moveDx > 0)) {
    //             //提示最老k线
    //             this.moveDx = 0;
    //             if (!this.state.showModal) {
    //                 // if(this.state.KlineAllData||this.isFetching) {
    //                 if (this.state.KlineAllData) {
    //                     // if (this.panTag === 0 || this.panendend) {
    //                     this.setState({
    //                         showModal: true,
    //                         modalText: '已经是最老K线！'
    //                     }, () => {
    //                         DeviceEventEmitter.emit('isLimited');
    //                         this.panendend = false;
    //                         this.panTag = 0;
    //                         setTimeout(() => {
    //                             this.setState({
    //                                 showModal: false
    //                             })
    //                         }, 1000);
    //                     })
    //                     // }
    //                     this.isFetchin = false;
    //                 }
    //                 // else {
    //                 //         //没有到最后就去获取一次数据
    //                 //     if( this.state.startPos < 1 && this.props.fetchMore && !this.isFetching ){
    //                 //         this.props.fetchMore();
    //                 //         this.isFetching = true;
    //                 //     }
    //                 //
    //                 // }
    //             }
    //         }

    //     }

    // };


    _onGestureEnd4DetailPage() {
        if (_recognized === 1) {
            this._onPanEnd();
            this._tapStartTime = 0;
            _recognized = 0;
        }
        else if (_recognized === 2) {
            this._onPinchEnd();
            this._tapStartTime = 0;
            _recognized = 0;
        }


    }

    _onPanEnd(e) {
        this.moveDx = 0;
        if (!this.showPriceBox) {
            this._onGestureEnd(e);
        }
    };

    _onPanCancel(e) {
    };

    //手势缩放的方法
    // _onPinchStart(e, s) {
    //     if (e.touches[0] !== undefined) {
    //         if (e.touches[1] !== undefined) {
    //             let kWidth = this.layout.width / this.state.showCount;
    //             //startPos
    //             this.lastStartPos = this.state.startPos;
    //             //showCount当前显示多少根k线
    //             this.lastShowCount = this.state.showCount;
    //             this.lastKWidth = kWidth;

    //             //从两指的x轴距离 中间开始放大
    //             this.lastCenterX = (e.touches[1].locationX + e.touches[0].locationX) / 2;
    //             //放大的算法
    //             this.lastCenterPos = Math.floor(this.lastStartPos + this.lastCenterX / kWidth);
    //             //手指的x轴距离
    //             this.lastPinchX0 = e.touches[0].locationX;
    //             this.lastPinchX1 = e.touches[1].locationX;
    //             this.lastDistance = this.getPinchDistance(e.touches[0].pageX, e.touches[1].pageX, e.touches[0].pageY, e.touches[1].pageY)
    //         }
    //     }

    // };


    //双指滑动
    // _onPinchMove(e, s) {
    //     if (e.touches[0] !== undefined) {
    //         if (e.touches[1] !== undefined) {
    //             let distance = this.getPinchDistance(e.touches[0].pageX, e.touches[1].pageX, e.touches[0].pageY, e.touches[1].pageY)
    //             if (Math.abs(distance - this.lastDistance) < 10) return
    //             this.isMoveTime = new Date().getTime();
    //             if ((distance - this.lastDistance) < 0) {//缩小
    //                 if (this.state.showModal === true) {
    //                     return;
    //                 }
    //                 this.controlKline(1);
    //             }
    //             else {//放大
    //                 if (this.state.showModal === true) {
    //                     return;
    //                 }
    //                 this.controlKline(0);
    //             }
    //             this.lastDistance = distance;
    //         }
    //     }
    //
    // };


    getPinchDistance(x0, x1, y0, y1) {
        //x0-x1的平方+y0-y1的平方的开方 勾股定理返回手指间的移动距离
        return Math.pow((Math.pow(Math.abs(x0 - x1), 2) + Math.pow(Math.abs(y0 - y1), 2)), 0.5)
    }

    _onPinchEnd(e) {
        this._onGestureEnd(e);
    };

    _onPinchCancel(e) {
        this._onGestureEnd(e);
    };

    //十字光标的显示和隐藏
    // _onTap(e, s) {
    //     this.showPriceBox = !this.showPriceBox;
    //     if (e && e.nativeEvent && e.nativeEvent.locationY)
    //         this._showPriceBox(s.x0, e.nativeEvent.locationY);
    //     else if (e && e.locationY)
    //         this._showPriceBox(s.x0, e.locationY);
    //     else
    //         this._showPriceBox(s.x0, s.y0);
    // };

    _resetCheckPriceState() {
        if (this.showPriceBox == true) {
            this.showPriceBox = false;
            this.handleResetCheckPriceState();
        }
    }

    _showKlineData(index) {
        if (this.props.split === 0) {
            if (index > this.props.chartData.length - 1 || index < 0) return;
            let stickData = Object.assign({}, this.props.chartData[index]);
            let previousStickData = Object.assign({}, this.props.chartData[index - 1]);
            this.props.callback(stickData, previousStickData);
        } else {
            if (index > this.splitData.length - 1 || index < 0) return;
            let stickData = Object.assign({}, this._changeToChartData(this.splitData[index]));
            let previousStickData = index == 0 ? null : Object.assign({}, this._changeToChartData(this.splitData[index - 1]));
            this.props.callback(stickData, previousStickData);
        }
    }
    handleResetCheckPriceState() {
        this.priceboxStyle.opacity = 0.0;
        // this.setState({'priceboxStyle':Object.assign({},this.priceboxStyle)});

        this.verticallineStyle.opacity = 0.0;
        // this.setState({'verticallineStyle' : Object.assign({}, this.verticallineStyle)});
        this.props.callback(null, null);
        // this.setState({legendPos : -1});
        this.lastVerticalPos = -1;

        this.horizontallineStyle.opacity = 0.0;
        this.setState({
            priceboxStyle: Object.assign({}, this.priceboxStyle),
            verticallineStyle: Object.assign({}, this.verticallineStyle),
            legendPos: -1,
            horizontallineStyle: Object.assign({}, this.horizontallineStyle)
        });
    }

    _showPriceBox(xPos, yPos) {
        if (!this.lastVerticalPos) this.lastVerticalPos = -1;

        let kWidth = this.layout.width / this.state.showCount;
        let stickPos = Math.floor((xPos - ShareSetting.getKlineLeftRightMargin()) / kWidth);
        let currentVerticalPos = (stickPos + 0.5) * kWidth;
        let currentHorizontalPos = yPos - 0;

        // if( currentVerticalPos === this.lastVerticalPos && this.showPriceBox == true) {return;}
        // else {this.lastVerticalPos = currentVerticalPos;}

        this.lastVerticalPos = currentVerticalPos;

        let onLeft = xPos < this.layout.width / 2;
        if (this.showPriceBox) {
            if (onLeft) {
                this.priceboxStyle.right = 0;
                this.priceboxStyle.left = null;
            } else {
                this.priceboxStyle.right = null;
                this.priceboxStyle.left = 0;
            }
            this.priceboxStyle.opacity = 0.8;
            // this.setState({'priceboxStyle':Object.assign({},this.priceboxStyle)});

            this.verticallineStyle.opacity = 1.0;
            this.verticallineStyle.height = this.layout.height;
            this.verticallineStyle.left = currentVerticalPos;
            // this.setState({'verticallineStyle' : Object.assign({}, this.verticallineStyle)});
            // this.setState({'priceboxData' : Object.assign({}, this.props.chartData[this.state.startPos+stickPos])});

            // let stickData = Object.assign({}, this.props.chartData[this.state.startPos + stickPos]);
            // let previousStickData = Object.assign({}, this.props.chartData[this.state.startPos + stickPos - 1]);
            // this.props.callback(stickData, previousStickData);

            this.horizontallineStyle.opacity = 1.0;
            this.horizontallineStyle.width = this.layout.width;
            this.horizontallineStyle.top = currentHorizontalPos;
            this.setState({
                horizontallineStyle: Object.assign({}, this.horizontallineStyle),
                priceboxStyle: Object.assign({}, this.priceboxStyle),
                verticallineStyle: Object.assign({}, this.verticallineStyle),
                priceboxData: Object.assign({}, this.props.chartData[this.state.startPos + stickPos]),
                legendPos: this.state.startPos + stickPos
            });

            let index = this.state.startPos + stickPos
            if (this.props.split === 0) {
                if (index > this.props.chartData.length - 1 || index < 0) return;
                let stickData = Object.assign({}, this.props.chartData[index]);
                let previousStickData = Object.assign({}, this.props.chartData[index - 1]);
                this.props.callback(stickData, previousStickData);
            } else {
                if (index > this.splitData.length - 1 || index < 0) return;
                let stickData = Object.assign({}, this._changeToChartData(this.splitData[index]));
                let previousStickData = index == 0 ? null : Object.assign({}, this._changeToChartData(this.splitData[index - 1]));
                this.props.callback(stickData, previousStickData);
            }

            // this.setState({legendPos : this.state.startPos+stickPos});



        } else {
            this.handleResetCheckPriceState();
        }
    }

    _onGestureEnd(e) {
        if (this.state.startPos < 1 && this.props.fetchMore && !this.isFetching) {
            this.props.fetchMore();
            this.isFetching = true;
        }
    }

    _changeToChartData(data) {
        if (data === undefined)
            return

        let temp = JSON.parse(data);
        let tempData = {
            ShiJian: temp.time,
            KaiPanJia: this._keepTwoDecimal(temp.open),
            ZuiGaoJia: this._keepTwoDecimal(temp.high),
            ZuiDiJia: this._keepTwoDecimal(temp.low),
            ShouPanJia: this._keepTwoDecimal(temp.close),
            ChengJiaoLiang: this._keepTwoDecimal(temp.volume),
            ChengJiaoE: this._keepTwoDecimal(temp.amount),
            ChengJiaoBiShu: 0,
            ChiCang: 0,
            ZengCang: 0,
            JieSuanJia: 0,
            FixedAmount: this._keepTwoDecimal(temp.fPAmount),
            FixedVolume: this._keepTwoDecimal(temp.fPVolume)
        };
        return tempData;
    }

    _keepTwoDecimal(num) {
        let result = parseFloat(num);
        if (isNaN(result)) {
            return 0.00;
        }
        result = Math.round(num * 100) / 100;
        return result;
    }

}
;

let KlineWithGesture = Platform.select({
    //ios: () => addGestureRecognizer(KlineChart),
    ios: () => KlineChart,
    android: () => KlineChart,
})();
let { NativeModules } = require('react-native');
export class DZHKlineChart extends Component {

    static defaultProps = {
        serviceUrl: '/quote/kline',
        callbackLoopNum: () => {
        }
    };


    constructor(props) {
        super(props);

        this.isFull = false;
        this.period = '1day';
        this.tempPeriod = 0;
        this.periodName = ""
        this.lableArr = [];
        this.currIndex = 0;
        this.targetIndex = -1;
        this.isFirstValid_DL = false;
        this.isFetchMore = true;
        this.dataSource = [];
        this.oldLength = 0;
        this.defaultParams = {
            //period: '1day',
            split: 1,//除复权 除权0，前复权1，后复权2
            start: -460,//加载数据条数
            sub: true,//true实时推送，false 不推送
        };

        this.state = {
            findex: -1,//从最后一根开始获取数据
            floatButtonBottom: 0,
            sideBtnBottom: 0
        };

        this.layout = {};
        this.showSlider = false;
        this.isDidMount = false;
    }

    componentDidMount() {
        this.isDidMount = true;
        //初始化复权情况
        this._onChangeEmpower(ShareSetting.getCurrentEmpowerName());
        this._query(this.props);
        this.initDownLoadHistoryData();
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this._query(this.props);
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            payload => {
                this.cancel();
            }
        );
    }

    componentWillUnmount() {
        this.isDidMount = false;
        this.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    componentWillReceiveProps(nextProps) {
        // 判断是否需要重新订阅数据
        if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
            this._query(nextProps);

            this.tempPeriod = 0;
            this.periodName = ""
            this.lableArr = [];
            this.currIndex = 0;
            this.targetIndex = -1;
            this.isFirstValid_DL = false;
            this.isFetchMore = true;
            this.dataSource = [];
            this.oldLength = 0;
            this.initDownLoadHistoryData();
        }
    }

    cancel() {
        this.requestCandleStick && this.requestCandleStick.cancel();
        this.requestCandleStick = null;
    }

    query() {
        this._query(this.props);
    }

    adapt(returndata) {
        let data = this._detailData(returndata);
        if (this.period !== this.props.params.period) {
            this.kdata && this.kdata.splice(0, this.kdata.length);
            this.period = this.props.params.period;
        }

        if (data.length > 0) {
            const { setKChartData } = this.props.actions;
            const { klineDatum } = this.props.stateKChart;
            for (let i = 0; i < data.length; i++) {
                if (data[i].Data.length > 1) {
                    setKChartData(data[i].Obj, data[i].Data)
                }
            }


            data = data[0].Data || [];
            // if (!this.kdata) {
            this.kdata = data;
            // }
            // else {
            //     while (this.kdata.length > 0) {
            //         if (this.comparePeriod(this.kdata[this.kdata.length - 1].ShiJian,
            //                 data[0].ShiJian,
            //                 this.props.params.period ||
            //                 this.defaultParams.period) >= 0) {
            //             this.kdata.pop();
            //         }
            //         else {
            //             break;
            //         }
            //     }
            //     data.forEach(stick => this.kdata.push(stick));
            // }
            this.isFull = this.kdata.length != Math.abs(this.defaultParams.start);
            if (this.isFull) {
                // //已经加载完数据了
                // DeviceEventEmitter.emit('KlineAllData');
            } else {
                DeviceEventEmitter.emit('notFull');
            }
            return Object.assign([], this.kdata);
        }
        return false;
    }

    comparePeriod(time1, time2, period) {
        // let t1 = new Date(time1*1000);
        // let t2 = new Date(time2*1000);

        if (period === '1min' || period === '5min' || period === '15min' ||
            period === '30min' || period === '60min' || period === '120min') {
            return time1 - time2;
        }
        else if (period === '1day') {
            let day1 = parseInt(time1 / 86400);
            let day2 = parseInt(time2 / 86400);
            return day1 - day2;
        } else if (period === 'week') {
            let day1 = parseInt(time1 / 86400);
            let day2 = parseInt(time2 / 86400);
            let week1 = parseInt((day1 + 3) / 7);
            let week2 = parseInt((day2 + 3) / 7);
            // return week1 - week2;
            //时间戳进行对比，不同就追加到后面。 以前的判断会将倒数第二个数据删除点
            return time1 - time2;
        } else if (period === 'month') {
            // let date1 = new Date(time1*1000);
            // let date2 = new Date(time2*1000);
            // return (date1.getYear() - date2.getYear())*12  + (date1.getMonth() - date2.getMonth());
            return time1 - time2;
        }
    }

    initDownLoadHistoryData() {
        if (this.props.params) {
            this.tempPeriod = 0;
            this.periodName = ""
            if (this.props.params.period === '1day') {
                this.tempPeriod = 5;
                this.periodName = "_DayK"
            } else if (this.props.params.period === 'week') {
                this.tempPeriod = 6;
                this.periodName = "_WeekK"
            } else if (this.props.params.period === 'month') {
                this.tempPeriod = 7;
                this.periodName = "_MonthK"
            } else if (this.props.params.period === '1min') {
                this.tempPeriod = 0;
                this.periodName = "_1MinK"
            } else if (this.props.params.period === '5min') {
                this.tempPeriod = 1;
                this.periodName = "_5MinK"
            } else if (this.props.params.period === '15min') {
                this.tempPeriod = 2;
                this.periodName = "_15MinK"
            } else if (this.props.params.period === '30min') {
                this.tempPeriod = 3;
                this.periodName = "_30MinK"
            } else if (this.props.params.period === '60min') {
                this.tempPeriod = 4;
                this.periodName = "_60MinK"
            }
            let url = "";
            if (this.periodName == "_WeekK" || this.periodName == "_MonthK") {
                url = "https://usergate51.ydtg.com.cn/candleStick_0/"
                    + this.periodName
                    + "/"
                    + "/candlestick_"
                    + this.props.params.obj
                    + "_"
                    + this.tempPeriod
                    + "_0_index.data"
            } else {
                url = "https://usergate51.ydtg.com.cn/candleStick_0/"
                    + this.periodName
                    + "/"
                    + this.props.params.obj + "/candlestick_"
                    + this.props.params.obj
                    + "_"
                    + this.tempPeriod
                    + "_0_index.data";
            }

            let lableStr = NativeModules
                .REQUEST_HISTORY_DATA
                .requestHistoryData(url)
            lableStr.then((lable) => {
                this.lableArr = lable.split(",")
                this.currIndex = this.lableArr.length - 2;
            })
        }
    }

    fetchMore() {
        if (!this.isFetchMore) return;
        this.isFetchMore = false;
        if (this.currIndex == -1) {
            DeviceEventEmitter.emit('KlineAllData');
            return;
        }
        // this.defaultParams.start *= 2;
        // this._query(this.props);
        let lable = this.lableArr[this.currIndex];
        let url = "";
        if (this.periodName == "_WeekK" || this.periodName == "_MonthK") {
            url = "https://usergate51.ydtg.com.cn/candleStick_0/"
                + this.periodName
                + "/"
                + "/candlestick_"
                + this.props.params.obj
                + "_"
                + this.tempPeriod + "_0.data"
        } else {
            url = "https://usergate51.ydtg.com.cn/candleStick_0/"
                + this.periodName
                + "/"
                + this.props.params.obj
                + "/candlestick_"
                + this.props.params.obj
                + "_"
                + this.tempPeriod + "_0_" + lable + ".data";
        }
        let kLineData = NativeModules
            .REQUEST_HISTORY_DATA
            .requestHistoryData(url)

        kLineData.then((mess) => {
            let data = this._detailData2({ entitiesList: JSON.parse(mess) });
            this.currIndex -= 1;
            if (!this.isFirstValid_DL) {

                for (let i = data.length - 1; i >= 0; i--) {
                    if (data[i].ShiJian <= this.state.data[0].ShiJian) {
                        if (data[i].ShiJian == this.state.data[0].ShiJian) {
                            this.targetIndex = i;
                        } else if (data[i].ShiJian < this.state.data[0].ShiJian) {
                            this.targetIndex = i + 1;
                        }
                        break;
                    }
                }
                // for (let i = 0; i < data.length; i++) {
                //     if (parseInt(data[i].ShiJian) <= parseInt(this.state.data[0].ShiJian)) {
                //         this.targetIndex = i;
                //         alert(this.targetIndex)
                //     }
                // }
                if (this.targetIndex != -1) {
                    let sliceData = data.slice(0, this.targetIndex)
                    this.oldLength = sliceData.length;
                    if (sliceData.length == 0) {
                        this.isFetchMore = true;
                        this.isFirstValid_DL = true;
                        this.fetchMore();
                    } else {
                        this.dataSource = sliceData.concat(this.dataSource);
                        this.setState({ data: this.dataSource }, () => {
                            this.isFetchMore = true;
                            this.isFirstValid_DL = true;
                        });
                    }
                } else {
                    this.isFetchMore = true;
                    this.fetchMore();

                }
            } else {
                this.oldLength = data.length;
                this.dataSource = data.concat(this.dataSource);
                this.setState({ data: this.dataSource }, () => {
                    this.isFetchMore = true;
                });
            }
            // 触发事件
            let onData = this.props.onData;
            (typeof onData === 'function') && onData(data);

            // });
        })
    }

    _onChangeEmpower(value) {
        // value = '除权';
        let split = this.defaultParams.split;
        let tmp = ShareSetting.getEmpowerIndexByName(value);
        if (tmp >= 0) split = tmp;

        if (this.defaultParams.split !== split) {
            this.defaultParams.split = split;
            this._query(this.props);

            this.tempPeriod = 0;
            this.periodName = ""
            this.lableArr = [];
            this.currIndex = 0;
            this.targetIndex = -1;
            this.isFirstValid_DL = false;
            this.isFetchMore = true;
            this.dataSource = [];
            this.oldLength = 0;
            this.initDownLoadHistoryData();
        }

    }

    _onChangeDefaultIndex(number) {
        _defaultIndexOfKLineNumber = number;

    }

    _onGestureEnd4DetailPageInDZHKlineChart() {
        if (_recognized === 1 || _recognized === 2) {
            this.refs.klc._onGestureEnd4DetailPage();
        }
    }

    /**
     *
     * period
     * 1分钟  0 ,5分钟  1, 15分钟 2, 30分钟 3, 60分钟 4,
     * 日 5, 周 6, 月  7,季 8,半年 9,年 10 ,
     */
    _query(props) {
        // 取消上次请求
        this.cancel();

        // 重新请求
        if (props.params) {
            // 记录上一次请求参数
            let tempPeriod = 0;
            if (props.params.period === '1day') {
                tempPeriod = 5;
            } else if (props.params.period === 'week') {
                tempPeriod = 6;
            } else if (props.params.period === 'month') {
                tempPeriod = 7;
            } else if (props.params.period === '1min') {
                tempPeriod = 0;
            } else if (props.params.period === '5min') {
                tempPeriod = 1;
            } else if (props.params.period === '15min') {
                tempPeriod = 2;
            } else if (props.params.period === '30min') {
                tempPeriod = 3;
            } else if (props.params.period === '60min') {
                tempPeriod = 4;
            }
            this.requestCandleStick = connection.request('FetchCandleStickNative', {
                label: props.params.obj,
                period: tempPeriod,
                // split: this.defaultParams.split,
                split: 0,
                start: this.state.findex,
                time: 0,
                count: this.defaultParams.start,
                subscribe: this.defaultParams.sub
            }, (returndata) => {
                if (!(returndata instanceof Error)) {
                    Promise.resolve(this.adapt(returndata)).then((data) => {
                        if (this.isDidMount == true) {
                            if (data !== false) {
                                if (this.dataSource.length == 0) {
                                    this.setState({ data });
                                    this.dataSource = data
                                }
                                if (this.dataSource.length >= data.length) {
                                    for (let i = this.dataSource.length - 1; i >= 0; i--) {
                                        if (this.dataSource[i].ShiJian <= data[0].ShiJian) {
                                            let index = 0;
                                            if (this.dataSource[i].ShiJian == data[0].ShiJian) {
                                                index = i;
                                            } else if (data[i].ShiJian < this.state.data[0].ShiJian) {
                                                index = i + 1;
                                            }
                                            let sliceData = this.dataSource.slice(0, index)
                                            this.dataSource = sliceData.concat(data)
                                            this.setState({ data: this.dataSource });
                                            break;
                                        }
                                    }
                                }
                                // this.setState({data});
                                // this.dataSource = data
                            }
                            // 触发事件
                            let onData = this.props.onData;
                            (typeof onData === 'function') && onData(data);
                        }
                    });
                }
            });
            return this.requestCandleStick;
        }

    }

    /**
     * 数据处理与当前一致
     * "ShiJian": 1547568000,时间
     "KaiPanJia": 2.98,开盘价
     "ZuiGaoJia": 3.27,最高价
     "ZuiDiJia": 2.96,最新价
     "ShouPanJia": 3.27,收盘价
     "ChengJiaoLiang": 31508200,成交量   5295600
     "ChengJiaoE": 99726472,成交额
     "ChengJiaoBiShu": 8170,成交笔数
     "ChiCang": 0,持仓
     "ZengCang": 0,增仓
     "JieSuanJia": 0结算价
     * @param data
     * @private
     */
    _detailData(data) {
        if (data.entitiesCount <= 0) {
            return;
        }
        let newData = [];
        data.entitiesList.map((item) => {
            let stick = item.sticks
            let fundFlow = item.fundLow
            let tempData = {
                ShiJian: stick.time,
                KaiPanJia: this._keepTwoDecimal(stick.open),
                ZuiGaoJia: this._keepTwoDecimal(stick.high),
                ZuiDiJia: this._keepTwoDecimal(stick.low),
                ShouPanJia: this._keepTwoDecimal(stick.close),
                ChengJiaoLiang: this._keepTwoDecimal(stick.volume),
                ChengJiaoE: this._keepTwoDecimal(stick.amount),
                ChengJiaoBiShu: 0,
                ChiCang: 0,
                ZengCang: 0,
                JieSuanJia: 0,
                FixedAmount: this._keepTwoDecimal(stick.fPAmount),
                FixedVolume: this._keepTwoDecimal(stick.fPVolume),
                //资金流入流出数据
                initialized: true,
                littleIn: fundFlow.littleIn,
                littleOut: fundFlow.littleOut,
                mediumIn: fundFlow.mediumIn,
                mediumOut: fundFlow.mediumOut,
                hugeIn: fundFlow.hugeIn,
                hugeOut: fundFlow.hugeOut,
                largeIn: fundFlow.largeIn,
                largeOut: fundFlow.largeOut,
                superIn: fundFlow.superIn,
                superOut: fundFlow.superOut,
                total: fundFlow.total
            };
            newData.push(tempData);
        });
        let adaptData = [];
        adaptData.push({ "Obj": data.label, "Data": newData });
        return adaptData;
    }


    _detailData2(data) {
        if (data.entitiesCount <= 0) {
            return;
        }
        let newData = [];
        data.entitiesList.map((item) => {
            let tempData = {
                ShiJian: item.time,
                KaiPanJia: this._keepTwoDecimal(item.open),
                ZuiGaoJia: this._keepTwoDecimal(item.high),
                ZuiDiJia: this._keepTwoDecimal(item.low),
                ShouPanJia: this._keepTwoDecimal(item.close),
                ChengJiaoLiang: this._keepTwoDecimal(item.volume),
                ChengJiaoE: this._keepTwoDecimal(item.amount),
                ChengJiaoBiShu: 0,
                ChiCang: 0,
                ZengCang: 0,
                JieSuanJia: 0,
                FixedAmount: this._keepTwoDecimal(item.fPAmount),
                FixedVolume: this._keepTwoDecimal(item.fPVolume)
            };
            newData.push(tempData);
        });

        return newData;
    }


    _keepTwoDecimal(num) {
        let result = parseFloat(num);
        if (isNaN(result)) {
            return 0.00;
        }
        result = Math.round(num * 100) / 100;
        return result;
    }

    _drawSpecialFormulaFromBar(formulaName) {

        this._onPickFormula(formulaName);

    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState;
    }

    resetCheckPriceState() {
        this.refs.klc && this.refs.klc._resetCheckPriceState();
    }

    _onLayout(event) {
        this.layout = event.nativeEvent.layout;
        this.setState({ floatButtonBottom: this.layout.height / 3 });
        this.setState({ sideBtnBottom: this.layout.height / 2 })
    };

    render() {
        let tempPeriod = 5;
        if (this.props.params.period === '1day') {
            tempPeriod = 5;
        } else if (this.props.params.period === 'week') {
            tempPeriod = 6;
        } else if (this.props.params.period === 'month') {
            tempPeriod = 7;
        } else if (this.props.params.period === '1min') {
            tempPeriod = 0;
        } else if (this.props.params.period === '5min') {
            tempPeriod = 1;
        } else if (this.props.params.period === '15min') {
            tempPeriod = 2;
        } else if (this.props.params.period === '30min') {
            tempPeriod = 3;
        } else if (this.props.params.period === '60min') {
            tempPeriod = 4;
        }
        let modalDropdownButtonFontSize = 12;
        if (ShareSetting.getDeviceWidthPX() > 1080) {
            modalDropdownButtonFontSize = 18;
        }

        const floatbuttonStyle = {
            width: 32,
            height: 32,
            position: 'absolute',
            right: 5, bottom: this.state.floatButtonBottom - 32,
        };


        let kDatum = this.state.data

        // if (!kDatum) {
        // const {klineDatum} = this.props.stateKChart
        // if (klineDatum) {
        //     let code = (this.props.params && this.props.params.obj) || ''
        //     let found = klineDatum.find(each => each.code === code)
        //     if (found) {
        //         kDatum = found.chartData
        //     }
        // }
        // }


        if (!kDatum) {
            return <Loading></Loading>;
        } else {
            let wdBtnImage;
            if (this.showSlider) {
                wdBtnImage = require("../../images/icons/arrow_move_right.png");
                // this.showSlider = false;
            } else {
                wdBtnImage = require("../../images/icons/arrow_move_left.png");
                // this.showSlider = true;
            }
            return (
                // <View style={styles.flex} onLayout={this._onLayout.bind(this)}>
                <View style={styles.flex} >
                    <View style={{ flex: 1, flexDirection: 'column' }}>

                        <View style={{ flex: 14 }}>
                            <KlineChart ref='klc'
                                style={this.props.style}
                                isLandscape={this.props.isLandscape}
                                callbackLoopNum={this.props.callbackLoopNum}
                                chartData={kDatum}
                                main={this.props.main}
                                oldLength={this.oldLength}
                                first={this.props.first}
                                stkInfo={{
                                    Obj: (this.props.params && this.props.params.obj) || '',
                                    MingCheng: this.props.name || ''
                                }}
                                fetchMore={this.fetchMore.bind(this)}
                                isBig={this.props.isBig}
                                callback={this.props.callback}
                                tabName={this.props.tabName}
                                callbackScrollTouch={this.props.callbackScrollTouch}
                                split={(this.props.params.type === 1 && this.props.params.period === '1day') ? this.defaultParams.split : 0}
                                period={tempPeriod}
                            />

                            {
                                this.props.isBig &&
                                <Button
                                    containerStyle={{ position: 'absolute', right: 0, bottom: this.state.sideBtnBottom }}
                                    onPress={() => {
                                        this.showSlider = !this.showSlider
                                        this.props.callbackSideBtn()
                                    }}>
                                    <Image source={wdBtnImage} />
                                </Button>
                            }


                        </View>

                    </View>

                </View>);
        }
    }

    _onDropDownMenu(idx, lableText) {
        this._onChangeEmpower(lableText);
        ShareSetting.selectFormula(lableText);
    }

    // _onShowEmpowerPicker() {
    //   this.refs.epicker._setModalVisible(true);
    // }

    _onShowPicker() {
        this.refs.picker._setModalVisible(true);
    };

    _onPickFormula(formula) {
        ShareSetting.selectFormula(formula);

        if (ShareSetting.isEmpower(formula)) {

            this._onChangeEmpower(formula);
        }
        else {
            this.refs.klc && this.refs.klc._onPickFormula(formula);
        }

    };

    _onPopup() {
        this.props.navigator.pop();
    }

}
;
var styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    icon: {
        width: 30,
        height: 30,
    },
    pannel: {
        flex: 1,
        width: 60,
        height: 30,
        position: 'absolute',
        //right: 0,
        //top: 0,
        flexDirection: 'row',
        opacity: 0.5,
        backgroundColor: 'transparent'
    },
    pricebox: {
        flex: 1,
        width: 95,
        height: 120,
        position: 'absolute',
        left: 0,
        top: 0,
        flexDirection: 'row',
        opacity: 0.0,
        backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR,
    },
    verticalline: {
        flex: 1,
        position: 'absolute',
        opacity: 0.0,
        width: 0.5,
        top: 0,
        backgroundColor: baseStyle.DARK_GRAY,
    },
    horizontalline: {
        flex: 1,
        position: 'absolute',
        opacity: 0.0,
        height: 0.5,
        left: 0,
        backgroundColor: baseStyle.DARK_GRAY,
    }
});


function HOCFactory() {
    return class HOC extends React.Component {
        getWrappedInstance = () => {
            if (this.props.forwardRef) {
                return this.wrappedInstance;
            }
        }

        setWrappedInstance = (ref) => {
            this.wrappedInstance = ref;
        }

        render() {

            let props = {
                ...this.props
            };
            if (this.props.forwardRef) {
                props.ref = this.setWrappedInstance;
            }

            return <DZHKlineChart {...props} />
        }
    }
}

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AllActions from '../../actions/AllActions'

export default connect((state) => ({
    stateKChart: state.KChartReducer
}),
    (dispatch) => ({
        actions: bindActionCreators(AllActions, dispatch)
    }), null,
    { forwardRef: true }
)(HOCFactory())
