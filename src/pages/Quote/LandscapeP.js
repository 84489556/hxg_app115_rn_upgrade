'use strict';
import React from 'react';
import { BackHandler, DeviceEventEmitter, Dimensions, Image, NativeModules, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Orientation from 'react-native-orientation';
import ScrollableTabView, { DefaultTabBar } from "react-native-scrollable-tab-view";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AllActions from '../../actions/AllActions';
import * as baseStyle from '../../components/baseStyle.js';
import Button from '../../components/Button.js';
import { DZHYunBuySellComponent } from '../../components/BuySellComponent.js';
import ExpandedView, { TouchFlag } from "../../components/ExpandedView";
import KChartSider from '../../components/KChartSider.js';
import LandHeader from '../../components/LandscapeChartHeader';
import ModalDropdown from '../../components/ModalDropdown.js';
import PanKou from '../../components/PanKou';
import StockPriceView from '../../components/StockPriceView.js';
import TabBar, { TabBarItem } from '../../components/TabBar.js';
import { TickComponent } from '../../components/TickComponent.js';
import ShareSetting from '../../modules/ShareSetting.js';
import { isBQuote, isLandscape } from '../../utils/CommonUtils';
import { has } from '../../utils/IndexCourseHelper';
import UserInfoUtil from '../../utils/UserInfoUtil';
import BasePage from '../BasePage.js';
import { getStockCodeType } from "./DownLoadStockCode";
import DZHKlineChartAndroid from './KlineChart.android.js';
import { DZHKlineChart as DZHKlineChartIOS } from './KlineChart.ios.js';
import DZHMinChart from './MinChart.js';
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../components/SensorsDataTool";

const icon_move_right = require('../../images/icons/arrow_move_right.png');
const icon_move_left = require('../../images/icons/arrow_move_left.png');
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export class LandscapePage extends BasePage {

    constructor(props) {
        super(props)
        Platform.OS === 'ios' ? this.initIOS() : this.initAndroid();
        //添加切换股票的相应属性
        this.loopStock = 0;
    }

    initIOS() {
        this.state = {
            //股票数组
            objs: [],

            obj: null,
            type: null, // 1->stock; other->index
            time: null,
            priceboxData: null,
            previousPriceboxData: null,
            curGraphIndex: 0,
            showSider: true,
            chartHeaderData: [],
            viceHeaderData: [],
            viceHeaderData1: [],
            selectedFormulas: [
                ShareSetting.getCurrentMainFormulaName(),
                ShareSetting.getCurrentAssistFormulaName()
            ],
            refresh: 0,
            showPriceBox: false,
            notchSize: 0,
            height_kline: 0,
            width_kline: screenHeight,
            curMinMainFormulaIdx: 0,
            curMinFutuFormulaIdx: 0,
            minFutuFloatButtonBottom: 0,
        };
        this.FutuFormulaPickerPaddingTop = 30
        this.buttonsindex = 0;
        this.layout = {};
        Orientation.getOrientation((err, orientation) => {
            if (orientation === 'LANDSCAPE') {
                //如果手机自动横屏开启，当前是横屏，就先竖屏再横屏
                Orientation.lockToPortrait();
                Orientation.lockToLandscapeLeft();
            } else {
                Orientation.lockToLandscapeLeft();
            }
        })
        // Orientation.lockToLandscapeLeft();
    }

    initAndroid() {
        this.fuTuData = [];
        this.zhuTuName = this.props.navigation.state.params.zhuTuName;
        this.fuTuName = this.props.navigation.state.params.fuTuName;
        this.isBackground = false
        this.state = {
            //切换股票数组
            objs: [],

            obj: null,
            type: null,       // 1->stock; other->index
            priceboxData: null,
            previousPriceboxData: null,
            curGraphIndex: 0,
            curFormulaIndx: -1,
            isDisplayBuySellComponent: true,
            height_kline: 0,
            width_kline: screenHeight,
            shijian: this.props.navigation.state.params.shijian,
            shijia: this.props.navigation.state.params.shijia,
            junjia: this.props.navigation.state.params.junjia,
            zhangfu: this.props.navigation.state.params.zhangfu,
            yichong: this.props.navigation.state.params.yichong,
            erchong: this.props.navigation.state.params.erchong,
            chengjiaoliang: '成交量:--',
            zhangfuColor: this.props.navigation.state.params.zhangfuColor,
            junjiaColor: this.props.navigation.state.params.junjiaColor || '#fe9350',
            maData: this.props.navigation.state.params.maData,
            colorData: this.props.navigation.state.params.colorData,
            fuTuData: [],
            fuTuColorData: this.props.navigation.state.params.fuTu1ColorData,
            fuTuName: this.props.navigation.state.params.fuTuName,
            zhuTuName: this.props.navigation.state.params.zhuTuName,
            siderWidth: 0,
            p1: '',
            p2: '',
            p3: '',
            p4: '',
            p5: '',
            showSider: true,
            zhuTuTime: '00/00/00',
            refresh: true,
            showPriceBox: false,
            curMinMainFormulaIdx: 0,
            curMinFutuFormulaIdx: 0,
            minFutuFloatButtonBottom: 0,
            notchSize: 0,
            lastFuTuName: ''
        }
        this.getDataForLandscapeListener = DeviceEventEmitter.addListener('getDataForLandscapeListener', (data, colorData, name) => {
            let filterData = [];
            let filterColorData = [];
            if (data.length == 0) {
                this.setState({ maData: filterData, colorData: filterColorData, zhuTuName: name }, () => {
                    return;
                })
            }

            for (let i = 0; i < data.length; i++) {
                if (data[i] != '--') {
                    filterData.push(data[i]);
                    filterColorData.push(colorData[i])
                }
                if (i == data.length - 1) {
                    this.setState({ maData: filterData, colorData: filterColorData, zhuTuName: name })
                }
            }


        });
        this.getTimeForLandscapeListener = DeviceEventEmitter.addListener('getTimeForLandscapeListener', (time) => {
            this.setState({ zhuTuTime: time })

        });
        this.getfuTuDataForLandscapeListener = DeviceEventEmitter.addListener('getfuTuDataForLandscapeListener', (data, colorData, name) => {
            this.fuTuData = data
            if (!this.lastFuTuName && this.state.lastFuTuName !== name) {
                this.setState({ lastFuTuName: name });
                this.sensorsAddIndex('副图指标', name, '全屏页')
            }
            this.setState({ fuTuData: [] }, () => {
                this.setState({ fuTuData: data, fuTuColorData: colorData, fuTuName: name })
            });
        });
        this.getDataListener = DeviceEventEmitter.addListener('getDataListener', (data) => {
            this.setState({ shijian: data.shijian }, () => {
                if (data.shijia === -1) {
                    this.setState({ shijia: '--', zhangfu: '--' })
                } else {
                    if (data.shijia - data.zuoshou > 0) {
                        this.setState({ zhangfuColor: '#fc525a' })
                    }
                    else if (data.shijia - data.zuoshou === 0) {
                        this.setState({ zhangfuColor: '#828282' })
                    }
                    else {
                        this.setState({ zhangfuColor: '#0ec98e' })
                    }

                    let zhangfu = "--"
                    if (data.zuoshou == 0) {
                        this.setState({ shijia: data.shijia.toFixed(2), zhangfu: zhangfu })
                    }
                    else {
                        zhangfu = ((data.shijia - data.zuoshou) * 100) / data.zuoshou
                        this.setState({ shijia: data.shijia.toFixed(2), zhangfu: zhangfu.toFixed(2) + '%' })
                    }

                }
                if (data.junjia === -1) {
                    this.setState({ junjia: '--' })
                } else {
                    this.setState({ junjia: data.junjia.toFixed(2) })
                }

            })
        });
        // this.getMinDataForLandscapeListener = DeviceEventEmitter.addListener('getMinDataForLandscapeListener', (data) => {
        // // this.getMinDataForLandscapeListener = DeviceEventEmitter.addListener('getDataListener', (data) => {
        //     console.log('getDataListener lance',data);
        //     this.setState({shijian:data.shijian,
        //         shijia:data.shijia,
        //         junjia:data.junjia,
        //         zhangfu:data.zhangfu,
        //         zhangfuColor:data.zhangfuColor,
        //         junjiaColor:data.junjiaColor,
        //     })
        //
        // });
        this.formulaindex = -1;

        this.FutuFormulaPickerPaddingTop = 5

    }
    // _backToPortrait() {
    //     Orientation.getOrientation((err, orientation) => {
    //         //
    //         // if(orientation==='LANDSCAPE')  {
    //         //     Orientation.lockToLandscape();
    //         //     Orientation.lockToPortrait();
    //         // }else {
    //         //     Orientation.lockToPortrait();
    //         // }
    //         Orientation.lockToPortrait();
    //     });
    //     Orientation.lockToPortrait();

    // }
    pageWillActive() {
        super.pageWillActive();

        // 切换前加载动态行情数据
        this.preLoad = true;
        //股票切换新增传递过来属性
        let objs = this.props.navigation.state.params.Objs;
        let name = this.props.navigation.state.params.ZhongWenJianCheng;
        this.loopStock = this.props.navigation.state.params.index;

        let obj = this.props.navigation.state.params.Obj;
        // this.setState({ obj });

        this.setState({ obj: obj, objs: objs, ZhongWenJianCheng: name, curGraphIndex: ShareSetting.getCurGraphIndex() }, () => {
            if (Platform.OS === 'ios') {
                if (ShareSetting.getCurGraphIndex() > 0) {
                    let splitName = ShareSetting.getCurrentEmpowerName();
                    let split = ShareSetting.getEmpowerIndexByName(splitName);
                    if (this.refs.kchart) {
                        this.refs.kchart._onChangeEmpower(split);
                    } else {
                        ShareSetting.selectFormula('前复权');
                    }
                }

            }
            else {
                if (this.refs.KLineInLandscapePage && this.getKLineInLandscapePageRef()) {
                    this.getKLineInLandscapePageRef()._onChangeEmpower(ShareSetting.getCurrentEmpowerName());
                } else {
                    ShareSetting.selectFormula('前复权');
                }

            }
        });

        if (Platform.OS === 'ios') {
            // this.refs.periodTab.changeActiveTab(ShareSetting.getCurGraphIndex());
        }
        else {
            this.setState({ isDisplayBuySellComponent: ShareSetting.isDisplayBuySellComponent() });
        }
        getStockCodeType(obj, (value) => {
            if (value === 0) {
                this.setState({
                    type: 0,
                });
            } else {
                this.setState({
                    type: 1,
                });
            }
        });
    }

    pageDidActive() {
        super.pageDidActive();

        let obj = this.props.navigation.state.params.Obj;

        // 切换后加载分时图和新闻数据
        this.postLoad = true;

        if (this.state.curGraphIndex > 0) {

            if (Platform.OS === 'ios') {
                // let splitName = ShareSetting.getCurrentEmpowerName();
                // let split = ShareSetting.getEmpowerIndexByName(splitName);
                // this.refs.kchart._onChangeEmpower(split);

                this.refs.kchart && this.refs.kchart._onPickFormula(
                    ShareSetting.getCurrentMainFormulaName()
                );
                this.refs.kchart && this.refs.kchart._onPickFormula(
                    ShareSetting.getCurrentAssistFormulaName()
                );
            }
            else {
                // this.getKLineInLandscapePageRef()._onChangeEmpower(ShareSetting.getCurrentEmpowerName());
                this.getKLineInLandscapePageRef()._onPickFormula(ShareSetting.getCurrentMainFormulaName());
                this.getKLineInLandscapePageRef()._onPickFormula(ShareSetting.getCurrentAssistFormulaName());
            }

        }
        this.forceUpdate();
    }

    pageWillDeactive() {
        super.pageWillDeactive();
        // if (Platform.OS === 'ios') Orientation.unlockAllOrientations();
    }

    componentWillMount() {
        isLandscape(true);
        if (Platform.OS === 'android') {
            //拦截手机自带返回键
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
            Orientation.addOrientationListener(this._orientationDidChange);
            // AppState.addEventListener('change', this._handleAppStateChange);
            NativeModules.GETNOTCHSIZE.getNotchSize((size) => {
                this.setState({ notchSize: size })
            });

        }
    }

    componentDidMount() {
        super.componentDidMount();

        //k线设置页面设置前后复权通知
        this.listenerKLine = DeviceEventEmitter.addListener('KLineSetPage', (info) => {
            let split = ShareSetting.getEmpowerIndexByName(info);
            if (Platform.OS === 'ios') {
                this.refs.kchart._onChangeEmpower(split);
            } else {
                this.refs.KLineInLandscapePage && this.getKLineInLandscapePageRef()._onChangeEmpower(info);
            }
        });

        if (Platform.OS === 'ios') {
            if (this.props.navigation.state.params.Obj) {
                Orientation.removeOrientationListener(
                    this._orientationDidChange
                );
            }
            // Orientation.addOrientationListener(this._orientationDidChange);
            // DeviceEventEmitter.emit('pageName', '沪深详情页横屏');
            // DeviceEventEmitter.emit('pageName', '新闻');
            let formulas = this.props.navigation.state.params.formulas;
            this.setState(
                {
                    selectedFormulas: formulas
                },
                () => {
                    formulas.map((item, index) => {
                        if (index !== 2 && this.refs.kchart) {
                            this.refs.kchart._onPickFormula(item);
                        }
                    });
                }
            );
        } else {
            this.getChengjiaoliangForMin = DeviceEventEmitter.addListener('sendChengjiaoliangForMin', (data) => {
                this.setState({ chengjiaoliang: data.chengjiaoliang })
            });
            this.getFuTu1DataForMin = DeviceEventEmitter.addListener('sendShuangChongForMin', (data) => {
                // if (!data.yichong) {

                if (data.yichong == -1) {
                    this.setState({ yichong: '0.00' })
                } else {
                    this.setState({ yichong: '1.00' })
                }

                // }
                // if (!data.erchong) {

                if (data.erchong == -1) {
                    this.setState({ erchong: '0.00' })
                } else {
                    this.setState({ erchong: '1.00' })
                }

                // }
            });
        }


    }

    componentWillUnmount() {
        super.componentWillUnmount();
        Orientation.removeOrientationListener(this._orientationDidChange);
        // DeviceEventEmitter.emit('pageName', '沪深');

        if (Platform.OS === 'ios') {
            DeviceEventEmitter.emit('landOut', true);
        }
        else {
            // AppState.removeEventListener('change', this._handleAppStateChange);
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
            this.getDataForLandscapeListener && this.getDataForLandscapeListener.remove();
            this.getfuTuDataForLandscapeListener && this.getfuTuDataForLandscapeListener.remove();
            this.getMinDataForLandscapeListener && this.getMinDataForLandscapeListener.remove();
            this.getFuTu1DataForMin && this.getFuTu1DataForMin.remove();
            this.getChengjiaoliangForMin && this.getChengjiaoliangForMin.remove();
            this.getDataListener && this.getDataListener.remove();
        }
        this.listenerKLine && this.listenerKLine.remove();
        DeviceEventEmitter.emit('toPor');
    }

    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps && super.componentWillReceiveProps(nextProps);

    }

    _orientationDidChange = (orientation) => {
        if (Platform.OS === 'ios') {
            if (orientation === 'PORTRAIT') {
                let array = [
                    ShareSetting.getCurrentMainFormulaName(),
                    ShareSetting.getCurrentAssistFormulaName(),
                    ShareSetting.getCurGraphIndex()
                ];

                let lanObj = {
                    array: array,
                    obj: this.state.obj,
                    objs: this.state.objs,
                    ZhongWenJianCheng: this.state.ZhongWenJianCheng,
                    index: this.loopStock
                };

                this.props.navigation.state.params.returnFromLand(lanObj);
                this.setState({
                    showSider: false
                });
            } else {
                this.setState({
                    refresh: 1
                });
            }
        }

    }

    _dataCallbackIOS(priceData, previousPriceData) {

        let mmain = ShareSetting.getCurrentMainFormulaName();
        let vvice = ShareSetting.getCurrentAssistFormulaName();

        this.setState(
            {
                // priceboxData: priceData,
                // previousPriceboxData: previousPriceData
            },
            () => {
                if (this.refs.kchart) {
                    this.refs.kchart._onPickFormula(mmain);
                    this.refs.kchart._onPickFormula(vvice);
                }
            }
        );
    }

    _dataCallbackIOS1(priceData, previousPriceData) {
        this.setState(
            {
                priceboxData: priceData,
                previousPriceboxData: previousPriceData
            });
    }

    callbackChartLoc = item => {
        if (Platform.OS === 'ios') {
            //console.log(item);
            let loopFormulas = ShareSetting.getLoopFormula();
            let formula = loopFormulas[item];
            let chartLoc = { chartLoc: formula };
            if (this.refs.kchart) {
                this.refs.kchart._onPickFormula(chartLoc);
            }
        }
    };

    callbackVice = item => {
        if (Platform.OS === 'ios') {
            //console.log(item);
            let loopFormulas = ShareSetting.getLoopFormula();
            let formula = loopFormulas[item];
            this.sensorsAddIndex('副图指标', formula, '全屏页')
            if (this.refs.kchart && formula) {
                this.refs.kchart._onPickFormula(formula);
                if (this.refs.kSider) {
                    this.refs.kSider.selectFormula(formula);
                }
            }
        }
    };

    callbackPriceBox = item => {
        if (Platform.OS === 'ios') {
            //console.log(item);
            this.setState({
                showPriceBox: item
            });
        }
    };

    callbackHeadTime = item => {
        this.setState({
            time: item
        });
    }

    controlKlineChart = (flag) => {
        switch (flag) {
            case TouchFlag.bigger:
                DeviceEventEmitter.emit('bigger');
                break;
            case TouchFlag.smaller:
                DeviceEventEmitter.emit('smaller');
                break;
            case TouchFlag.older:
                DeviceEventEmitter.emit('older');
                break;
            case TouchFlag.later:
                DeviceEventEmitter.emit('later');
                break;
        }
    };

    _onMinMainDropDownMenu(idx, lableText) {
        this.setState({ curMinMainFormulaIdx: idx })
        this.sensorsAddIndex("主图指标", lableText, '全屏分时')

    }

    _onMinFutuDropDownMenu(idx, lableText) {
        this.setState({ curMinFutuFormulaIdx: idx })
        this.sensorsAddIndex("主图指标", lableText, '全屏分时')

    }

    sensorsAddIndex(type, name, entrance) {
        sensorsDataClickObject.addIndex.index_name = name;
        sensorsDataClickObject.addIndex.index_type = type;
        sensorsDataClickObject.addIndex.entrance = entrance;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addIndex);

    }


    sensorsAdKClick(tab) {
        sensorsDataClickObject.adKClick.stock_code = this.state.obj;
        sensorsDataClickObject.adKClick.function_zone = '分时K线区';
        sensorsDataClickObject.adKClick.content_name = tab;
        sensorsDataClickObject.adKClick.page_source = '个股详情';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)
    }



    getPeriodText() {
        let text = '1day';
        if (this.state.curGraphIndex === 1) text = '1day';
        if (this.state.curGraphIndex === 2) text = 'week';
        if (this.state.curGraphIndex === 3) text = 'month';
        if (this.state.curGraphIndex === 4) text = '1min';
        if (this.state.curGraphIndex === 5) text = '5min';
        if (this.state.curGraphIndex === 6) text = '15min';
        if (this.state.curGraphIndex === 7) text = '30min';
        if (this.state.curGraphIndex === 8) text = '60min';

        return text;
    }

    // 跳转至学指标页面
    _toPlayVideo(name) {
        // if (Platform.OS === 'ios') {
        Orientation.removeOrientationListener(this._orientationDidChange);
        Navigation.pushForParams(this.props.navigation, 'TargetStudyPage', {
            name: name,
            fromPage: 'LandscapePage',
            refreshOrientionListener: () => {
                // Orientation.addOrientationListener(this._orientationDidChange);
            }
        });
        // }
    };

    render() {
        if (Platform.OS === 'ios') {
            return this.renderIOS()
        }
        return this.renderAndroid()
    }
    // 分时主图指标选择框(iOS)
    renderMinMainDropDown() {
        let mainoptions = ShareSetting.getMinMainFormula();
        return (
            <View style={{ marginLeft: 15, borderColor: '#0000001a', borderWidth: 1, width: 72, height: 20, justifyContent: 'center' }}>
                <ModalDropdown
                    supportedOrientations={['landscape-right']}
                    ref="min_main_dropDown"
                    forwardRef
                    defaultValue={mainoptions[this.state.curMinMainFormulaIdx]}
                    defaultIndex={0}
                    onSelect={(idx, value) => this._onMinMainDropDownMenu(idx, value)}
                    style={{
                        width: 70,
                        justifyContent: "center"
                    }}
                    textStyle={{
                        textAlign: "center",
                        fontSize: 12,
                        color: '#000000'
                    }}
                    buttonStyle={{
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                    dropdownStyle={{
                        height: 80,
                        width: 70,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 15
                    }}
                    options={mainoptions}
                    renderRow={(rowData) => {
                        return (
                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center", height: 25, width: 70 }}>
                                <Text style={{ color: baseStyle.WHITE, fontSize: 12 }}>{rowData}</Text>
                            </View>
                        )
                    }}
                    itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
                    itemActiveOpacity={0.5}
                />
            </View>
        );
    }
    // 分时副图指标选择框(iOS)
    renderMinViceDropDown() {
        let futuoptions = ShareSetting.getMinFutuFormula();
        return (
            <View style={{ borderColor: '#0000001a', borderWidth: 1, width: 72, height: 20, justifyContent: 'center' }}>
                <ModalDropdown
                    supportedOrientations={['landscape-right']}
                    ref="min_vice_dropDown"
                    forwardRef
                    defaultValue={futuoptions[this.state.curMinFutuFormulaIdx]}
                    defaultIndex={0}
                    onSelect={(idx, value) => this._onMinFutuDropDownMenu(idx, value)}
                    style={{
                        width: 70,
                        justifyContent: "center"
                    }}
                    textStyle={{
                        textAlign: "center",
                        fontSize: 12,
                        color: '#000000'
                    }}
                    buttonStyle={{
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                    dropdownStyle={{
                        height: 80,
                        width: 70,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 15
                    }}
                    options={futuoptions}
                    renderRow={(rowData) => {
                        return (
                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center", height: 25, width: 70 }}>
                                <Text style={{ color: baseStyle.WHITE, fontSize: 12 }}>{rowData}</Text>
                            </View>
                        )
                    }}
                    itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
                    itemActiveOpacity={0.5}
                />
            </View>
        );
    }
    // 分时主图header(iOS)
    _renderMinMainChartHeader() {
        let permission = UserInfoUtil.getUserPermissions();
        let mainName = ShareSetting.getMinMainFormula()[this.state.curMinMainFormulaIdx];
        return (
            permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
                <View style={{ flexDirection: 'row', height: 25, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
                    {this.renderMinMainDropDown()}
                    <LandHeader
                        style={{ marginLeft: 10, marginRight: 10, flex: 1 }}
                        showSider={this.state.showSider}
                        toPlayVideo={() => { }}
                        items={this.state.chartHeaderData}
                        index={this.state.curGraphIndex}
                    />
                    {
                        has(mainName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, marginRight: 10, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(mainName) }}>
                            <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                            <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
                        </TouchableOpacity>
                    }
                </View> :
                <View style={{ flexDirection: 'row', height: 25, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
                    <LandHeader
                        style={{ flex: 1, marginLeft: 15 }}
                        showSider={this.state.showSider}
                        toPlayVideo={() => { }}
                        items={this.state.chartHeaderData}
                        index={this.state.curGraphIndex}
                    />
                    {
                        has(mainName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, marginRight: 10, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(mainName) }}>
                            <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                            <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
                        </TouchableOpacity>
                    }
                </View>
        )
    }
    // 分时副图header(iOS)
    _renderMinViceChartHeader() {
        let permission = UserInfoUtil.getUserPermissions();
        let viceName = ShareSetting.getMinFutuFormula()[this.state.curMinFutuFormulaIdx];
        let showSider = this.state.type === 1 && this.state.showSider;
        let landHeaderWidth = showSider ? (baseStyle.height - 125 - (baseStyle.isIPhoneX ? 88 + 30 : 30) - 70 - 70) : (baseStyle.height - (baseStyle.isIPhoneX ? 88 + 30 : 30) - 70 - 70);
        let viceTop = this.layout.height ? (this.layout.height - 20 - 24) * 3 / 4 + 20 : 0;
        return (
            permission == 5 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
                <View style={{ position: 'absolute', top: viceTop, flexDirection: 'row', height: 24, alignItems: 'center' }}>
                    {this.renderMinViceDropDown()}
                    <LandHeader
                        style={{ marginLeft: 10, height: 20, width: landHeaderWidth }}
                        showSider={this.state.showSider}
                        toPlayVideo={() => { }}
                        items={this.state.viceHeaderData}
                        index={this.state.curGraphIndex}
                    />
                    {
                        has(viceName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, marginRight: 10, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(viceName) }}>
                            <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                            <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
                        </TouchableOpacity>
                    }
                </View> :
                <View style={{ position: 'absolute', top: viceTop, flexDirection: 'row', height: 24, alignItems: 'center' }}>
                    <LandHeader
                        style={{ height: 20, width: baseStyle.width - (this.state.type === 1 && this.state.showSider) ? (88 - 125) : 88 }}
                        showSider={this.state.showSider}
                        toPlayVideo={() => { }}
                        items={this.state.viceHeaderData}
                        index={this.state.curGraphIndex}
                    />
                    {
                        has(viceName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, marginRight: 10, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(viceName) }}>
                            <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                            <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
                        </TouchableOpacity>
                    }
                </View>
        );
    }
    renderIOS() {
        let eachTabWitdh = (screenHeight - (baseStyle.isIPhoneX ? 88 : 0)) / 9;
        let Obj = this.state.obj;
        let ZhongWenJianCheng = this.state.ZhongWenJianCheng;
        let personalButton = UserInfoUtil.isPersonStock(Obj) ? (
            <Button
                onPress={() =>
                    UserInfoUtil.deletePersonStock(Obj)
                }
            >
                <Image
                    style={{ marginRight: 12 }}
                    source={require('../../images/icons/detail2_personal_remove.png')}
                />
            </Button>
        ) : (
                <Button
                    onPress={() =>
                        UserInfoUtil.addPersonStock(Obj)
                    }
                >
                    <Image
                        style={{ marginRight: 12 }}
                        source={require('../../images/icons/detail2_personal_add.png')}
                    />
                </Button>
            );
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    paddingBottom: baseStyle.isIPhoneX ? 34 : 0,
                    paddingRight: baseStyle.isIPhoneX ? 44 : 0,
                    paddingLeft: baseStyle.isIPhoneX ? 44 : 0
                }}
            >
                <StatusBar
                    backgroundColor={baseStyle.TABBAR_BORDER_COLOR}
                    translucent={true}
                    hidden={true}
                    animated={true}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: 12,
                        paddingBottom: 12,
                        backgroundColor: '#fff'
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <StockPriceView
                            navigation={this.props.navigation}
                            onData={data => {
                                if (this.state.type !== data.LeiXing) {
                                    this.setState({
                                        // type: data.LeiXing
                                    });
                                }
                            }}
                            ref={ref => (this.spv = ref)}
                            params={
                                this.preLoad &&
                                this.state.obj && { obj: this.state.obj }
                            }
                            dynaData={this.state}
                            priceboxData={this.state.priceboxData}
                            previousPriceboxData={
                                this.state.previousPriceboxData
                            }
                            isHorz={1}
                            type={this.state.objs.length > 1 ? 1 : 0}
                            preClicked={() => {
                                if (parseInt(this.loopStock) === 0) {
                                    this.loopStock = this.state.objs.length - 1;
                                    let data = this.state.objs[this.loopStock];
                                    this.setState({
                                        obj: data.Obj,
                                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                                        showPriceBox: false
                                    })
                                } else {
                                    this.loopStock--;
                                    let data = this.state.objs[this.loopStock];
                                    this.setState({
                                        obj: data.Obj,
                                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                                        showPriceBox: false
                                    })
                                }
                            }}
                            nextClicked={() => {
                                if (parseInt(this.loopStock) === this.state.objs.length - 1) {
                                    this.loopStock = 0;
                                    let data = this.state.objs[this.loopStock];
                                    this.setState({
                                        obj: data.Obj,
                                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                                        showPriceBox: false
                                    })
                                } else {
                                    this.loopStock++;
                                    let data = this.state.objs[this.loopStock];
                                    this.setState({
                                        obj: data.Obj,
                                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                                        showPriceBox: false
                                    })
                                }
                            }}
                        />
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            right: 12,
                            flexDirection: 'row'
                        }}
                    >
                        {personalButton}
                        <Button
                            onPress={event => {
                                isLandscape(false);
                                // Orientation.unlockAllOrientations();
                                Orientation.getOrientation((err, orientation) => {
                                    if (orientation !== 'LANDSCAPE') {
                                        Orientation.lockToLandscapeLeft();
                                        Orientation.lockToPortrait();
                                    } else {
                                        Orientation.lockToPortrait();
                                    }
                                })

                                let array = [
                                    ShareSetting.getCurrentMainFormulaName(),
                                    ShareSetting.getCurrentAssistFormulaName(),
                                    ShareSetting.getCurGraphIndex()
                                ];
                                let lanObj = {
                                    array: array,
                                    obj: this.state.obj,
                                    objs: this.state.objs,
                                    ZhongWenJianCheng: this.state.ZhongWenJianCheng,
                                    index: this.loopStock
                                }

                                this.props.navigation.state.params.returnFromLand(lanObj);
                                Navigation.pop(this.props.navigation);
                                this.setState({
                                    showSider: false
                                });
                            }}
                        >
                            <Image
                                source={require('../../images/icons/search_text_del.png')}
                            />
                        </Button>
                    </View>
                </View>
                {this.state.curGraphIndex === 0 ? (
                    this._renderMinMainChartHeader()
                ) : null}

                {this.state.curGraphIndex === 0
                    ? this.renderMinChart()
                    : this.renderKChart()}
                {
                    this.state.curGraphIndex !== 0
                        ? <ExpandedView
                            isLand={1}
                            styles={{ position: 'absolute', top: (baseStyle.width / 2) - 10, left: baseStyle.isIPhoneX ? 44 : 15 }}
                            bigPress={() => this.controlKlineChart(0)}
                            smallPress={() => this.controlKlineChart(1)}
                            oldPress={() => this.controlKlineChart(2)}
                            latePress={() => this.controlKlineChart(3)}
                            landPress={() => this._mineChangeToLandscape()}
                        />
                        : null
                }
                <View style={{ height: 40, flexDirection: 'row' }}>
                    <ScrollableTabView
                        tabBarActiveTextColor={baseStyle.SCROLLABLE_TAB_ACTIVE_TEXT_COLOR}
                        tabBarUnderlineStyle={{
                            marginLeft: (eachTabWitdh - 15) / 2,
                            width: 15,
                            height: 3,
                            borderRadius: 2.5,
                            backgroundColor: '#F92400',
                        }}
                        tabBarTextStyle={{ fontSize: 15 }}
                        tabBarInactiveTextColor={baseStyle.SCROLLABLE_TAB_INACTIVE_TEXT_COLOR}
                        renderTabBar={() => <DefaultTabBar
                            style={{ height: 40, borderBottomWidth: 0 }}
                            tabStyle={{ width: eachTabWitdh }}
                        />}
                        onChangeTab={(obj) => {
                            this.sensorsAdKClick(obj.i)
                            this.setState({ curGraphIndex: obj.i });
                            ShareSetting.setCurGraphIndex(obj.i);
                            this._dataCallbackIOS(null, null);
                            this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();
                        }}>
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(0)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(1)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(2)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(3)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(4)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(5)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(6)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(7)} />
                        <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(8)} />
                    </ScrollableTabView>
                </View>
            </View>
        );
    }

    renderMinChart() {
        let mainIndexName = ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx);
        let viceIndexName = ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx);
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingLeft: 15,
                    paddingRight: this.state.showSider && this.state.type === 1 ? 0 : 15,
                    borderBottomWidth: 1,
                    borderColor: baseStyle.LIGHTEN_GRAY
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center' }} onLayout={this._onLayout.bind(this)}>
                    <DZHMinChart
                        mainName={mainIndexName}
                        viceName={viceIndexName}
                        navigation={this.props.navigation}
                        statusPaused={this.state.statusPaused}
                        isDaPan={this.state.type}
                        params={
                            this.postLoad &&
                            this.state.obj && { obj: this.state.obj }
                        }
                        onMainFmlResult={data =>
                            this.setState({ chartHeaderData: data.main, viceHeaderData: data.vice })
                        }
                    />
                    {this.state.curGraphIndex === 0 ? (
                        this._renderMinViceChartHeader()
                    ) : null}
                    {/* 侧边栏开关 */
                        this.state.type === 1 && (
                            <Button
                                containerStyle={{
                                    flex: 0,
                                    position: 'absolute',
                                    alignSelf: 'flex-end'
                                }}
                                onPress={() =>
                                    this.setState({
                                        showSider: !this.state.showSider
                                    })
                                }
                            >
                                <Image
                                    source={
                                        this.state.showSider
                                            ? icon_move_left
                                            : icon_move_right
                                    }
                                />
                            </Button>
                        )}

                </View>
                {/* 盘口 */
                    this.state.type === 1 &&
                    this.state.showSider === true && (
                        <View
                            style={{
                                flex: 0,
                                borderLeftWidth: 1,
                                borderLeftColor: baseStyle.WUDANG_BORDER_COLOR,
                                width: 125
                            }}
                        >
                            <PanKou
                                navigation={this.props.navigation}
                                activeColor={'#F92400'}
                                obj={this.postLoad && this.state.obj} />
                        </View>
                    )}
            </View>
        );
    }

    renderKChart() {    // 横屏K线
        if (this.state.type === null) {
            return;
        }

        let viceName = ShareSetting.getCurrentAssistFormulaName();
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingLeft: 15,
                    paddingRight: this.state.showSider ? 0 : 15,
                    borderBottomWidth: 1,
                    borderColor: baseStyle.LIGHTEN_GRAY
                }}
            >
                <View
                    onLayout={this._onLayout.bind(this)}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        borderColor: baseStyle.LIGHTEN_GRAY,
                        borderTopWidth: 1
                    }}
                >
                    {/* K 线 */}
                    <DZHKlineChartIOS
                        ref="kchart"
                        callback={this._dataCallbackIOS.bind(this)}
                        callbackF={this._dataCallbackIOS1.bind(this)}
                        params={
                            this.state.obj && {
                                obj: this.state.obj,
                                period: this.getPeriodText(),
                                type: this.state.type,
                            }
                        }
                        name={
                            this.props.navigation.state.params.ZhongWenJianCheng
                        }
                        callback1={item => {
                            this.callbackChartLoc(item);
                        }}
                        callback2={item => {
                            this.callbackVice(item);
                        }}
                        callbackPriceBox={item => {
                            this.callbackPriceBox(item);
                        }}
                        callbackHeadTime={item => {
                            this.callbackHeadTime(item)
                        }}
                        isLand={1}
                        navigation={this.props.navigation}
                        onMainFmlResult={data =>
                            this.setState({
                                chartHeaderData: data.main,
                                viceHeaderData: data.vice,
                                viceHeaderData1: data.vice1
                            })
                        }
                    />
                    {/* K线图上面的 K线类型 */}
                    <LandHeader
                        style={{
                            position: 'absolute',
                            top: 0,
                            // borderBottomWidth: 1
                        }}
                        showSider={this.state.showSider}
                        toPlayVideo={() => {
                            this._toPlayVideo(this.state.chartHeaderData[0].str);
                        }}
                        items={this.state.chartHeaderData}
                        index={this.state.curGraphIndex}
                        containerStyle={{ marginHorizontal: 0 }}
                    />
                    {/* 指标图上面的 指标类型*/}
                    <View style={{ position: 'absolute', bottom: this.state.minFutuFloatButtonBottom, flexDirection: 'row', height: 20, alignItems: 'center' }}>
                        {this._showBQuoteUnableAlert(viceName)}
                        <LandHeader
                            toPlayVideo={() => {
                                this._toPlayVideo(this.state.viceHeaderData[0].str);
                            }}
                            showSider={this.state.showSider}
                            index={this.state.curGraphIndex}
                            items={this.state.viceHeaderData}
                        />
                    </View>
                    {/* 侧边栏开关 */}
                    <Button
                        containerStyle={{
                            flex: 0,
                            position: 'absolute',
                            alignSelf: 'flex-end'
                        }}
                        onPress={() =>
                            this.setState({ showSider: !this.state.showSider })
                        }
                    >
                        <Image
                            source={
                                this.state.showSider
                                    ? icon_move_left
                                    : icon_move_right
                            }
                        />
                    </Button>
                </View>

                {this.state.showSider === true && (
                    <KChartSider
                        ref={'kSider'}
                        navigation={this.props.navigation}
                        setSiderWidth={() => { }}
                        stkType={this.state.type}
                        curGraphIndex={this.state.curGraphIndex}
                        onSplitChange={empower => {
                            let split = ShareSetting.getEmpowerIndexByName(
                                empower
                            );
                            this.refs.kchart._onChangeEmpower(split);
                            ShareSetting.selectFormula(empower);
                        }}
                        onFormulaChange={formula => {
                            this.refs.kchart._onPickFormula(formula);
                            ShareSetting.selectFormula(formula);
                        }}
                    />
                )}
            </View>
        );
    }
    /*for ios end */


    /*for android */
    _isPersonalStock() {
        let isPersonS = UserInfoUtil.isPersonStock(this.state.obj);
        return isPersonS;
    }

    _addPersonalStock() {
        if (Platform.OS === 'android') {
            if (this.state.obj && this.state.obj !== undefined) {
                UserInfoUtil.addPersonStock(this.state.obj, () => {
                    sensorsDataClickObject.addStock.stock_code = this.state.obj;
                    sensorsDataClickObject.addStock.stock_name = this.state.ZhongWenJianCheng;
                    sensorsDataClickObject.addStock.page_source = '全屏K图';
                    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addStock);
                    this.setState({ isRefresh: !this.state.refresh }, () => {

                    })
                }, () => {


                });
            }
        }
    }

    _removePersonalStock() {
        if (Platform.OS === 'android') {
            if (this.state.obj && this.state.obj !== undefined) {
                UserInfoUtil.deletePersonStock(this.state.obj, () => {
                    this.setState({ isRefresh: !this.state.refresh }, () => {

                    })
                }, () => {

                })
            }
        }
    }

    _dataCallback(priceData, previousPriceData) {
        if (Platform.OS === 'android') {
            this.setState({ priceboxData: priceData, previousPriceboxData: previousPriceData });
        }
    }

    getButtonsFlex() {
        if (Platform.OS === 'android') {
            let fl = 1;
            if (ShareSetting.getDeviceWidthPX() > 1080) {
                fl = 0.5;
            }
        }
    }

    getKLineInLandscapePageRef() {
        return this.refs && this.refs.KLineInLandscapePage.getWrappedInstance()
        //return this.refs.KLineInLandscapePage.refs.wrappedInstance.getWrappedInstance()
    }

    _displayBuySellComponent() {
        if (Platform.OS === 'android') {
            let b = !this.state.isDisplayBuySellComponent;
            this.setState({ isDisplayBuySellComponent: b });
            ShareSetting.setDisplayStateBuySellComponent(b)
        }
    }

    _onChangeTab(index, childElement) {
        if (Platform.OS === 'android') {
            if (index !== undefined) {
                ShareSetting.setWuDangIndex(index)
            }
        }
    }

    onPressOrientation(event) {
        if (Platform.OS === 'android') {
            this.props.navigation.state.params.setImageName(this.zhuTuName, this.fuTuName)
            Orientation.lockToPortrait();
        }
    }

    onPressFormulaBtn() {
        if (Platform.OS === 'android') {
            this.setState({ showSider: !this.state.showSider })
        }
    }

    _setSiderWidth(width) {
        if (Platform.OS === 'android') {
            this.setState({ siderWidth: width })
        }
    }

    onBackAndroid = () => {
        //竖屏展示
        isLandscape(false);
        this.setState({ showSider: false }, () => {
            let lanObj = {
                obj: this.state.obj,
                objs: this.state.objs,
                ZhongWenJianCheng: this.state.ZhongWenJianCheng,
                index: this.loopStock
            };
            this.props.navigation.state.params.setImageName(this.zhuTuName, this.fuTuName);
            // 返回竖屏时携带当前个股的index等信息
            this.props.navigation.state.params.returnFromLand(lanObj);
            Orientation.lockToPortrait();
            Navigation.pop(this.props.navigation)
            Orientation.removeOrientationListener(this._orientationDidChange);
            // BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
            // AppState.removeEventListener('change', this._handleAppStateChange);
        });
        DeviceEventEmitter.emit('toPor');
        return true;
    };

    // 同步副图和抽屉栏选中状态
    callbackLoopName = item => {
        if (this.refs.kSider1) {
            this.refs.kSider1.selectFormula(item);
        }
    }

    _onLayout(event) {
        this.layout = event.nativeEvent.layout;
        this.setState({ minFutuFloatButtonBottom: this.layout.height / 3 - this.FutuFormulaPickerPaddingTop });
    };

    renderAndroid() {
        let permission = UserInfoUtil.getUserPermissions();
        let periodText = this.getPeriodText();
        let personalButton;

        // 已经是自选股了，则为移出按钮，否则是添加按钮
        personalButton = this._isPersonalStock() ? (
            <Button onPress={() => this._removePersonalStock()}>
                <Image style={{ marginRight: 12 }}
                    source={require('../../images/icons/detail2_personal_remove.png')} />
            </Button>
        ) : (
                <Button onPress={() => this._addPersonalStock()}>
                    <Image style={{ marginRight: 12 }}
                        source={require('../../images/icons/detail2_personal_add.png')} />
                </Button>
            );

        let tabBarSingleWidthFormulaPicker = screenWidth / 6 + 10;
        let mainoptions = ShareSetting.getMinMainFormula()
        let futuoptions = ShareSetting.getMinFutuFormula()

        return (
            <View style={{
                backgroundColor: '#fff',
                flex: 1,

            }}>
                <View style={{
                    paddingRight: IsNotch ? 12 : 0,
                    paddingLeft: IsNotch ? 24 : 0,
                    flex: 1,
                }} >
                    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                        <StatusBar
                            backgroundColor={baseStyle.TABBAR_BORDER_COLOR}
                            translucent={true}
                            hidden={true}
                            animated={false}
                        />
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 48,
                                backgroundColor: '#fff',
                            }}>

                            <View style={{ flex: 1 }}>
                                <StockPriceView
                                    navigation={this.props.navigation}
                                    onData={(data) => {
                                        if (this.state.type !== data.LeiXing) {
                                            this.setState({
                                                // type: data.LeiXing
                                            })
                                        }
                                    }}
                                    ref={(ref) => this.spv = ref}
                                    params={this.preLoad && this.state.obj && { obj: this.state.obj }}
                                    loadedDataCallback={(statusPaused) => {
                                        this.setState({
                                            statusPaused: statusPaused
                                        })
                                    }}
                                    dynaData={this.state}
                                    priceboxData={this.state.priceboxData}
                                    previousPriceboxData={this.state.previousPriceboxData}
                                    isHorz={1}
                                    type={this.state.objs.length > 1 ? 1 : 0}
                                    preClicked={() => {
                                        if (parseInt(this.loopStock) === 0) {
                                            this.loopStock = this.state.objs.length - 1;
                                            let data = this.state.objs[this.loopStock];
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng: data.ZhongWenJianCheng,
                                            })
                                        } else {
                                            this.loopStock--;
                                            let data = this.state.objs[this.loopStock];
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng: data.ZhongWenJianCheng,
                                            })
                                        }
                                    }}
                                    nextClicked={() => {
                                        if (parseInt(this.loopStock) === this.state.objs.length - 1) {
                                            this.loopStock = 0;
                                            let data = this.state.objs[this.loopStock];
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng: data.ZhongWenJianCheng,
                                            })
                                        } else {
                                            this.loopStock++;
                                            let data = this.state.objs[this.loopStock];
                                            this.setState({
                                                obj: data.Obj,
                                                ZhongWenJianCheng: data.ZhongWenJianCheng,
                                            })
                                        }
                                    }}
                                />
                            </View>
                            <View style={{
                                position: 'absolute',
                                right: 12,
                                flexDirection: 'row',
                            }}>
                                {personalButton}
                                <Button onPress={() => { this.onBackAndroid() }}>
                                    <Image source={require('../../images/icons/search_text_del.png')} />
                                </Button>
                            </View>
                        </View>
                        <View style={{ height: 0.5, backgroundColor: baseStyle.LINE_BG_F1 }} />
                        {/* 按钮框 */}
                        {
                            this.state.height_kline > 0
                                ? <ExpandedView
                                    isLand={1}
                                    styles={{ position: 'absolute', top: (this.state.height_kline * 2) / 3, left: 25 }}
                                    bigPress={() => this.controlKlineChart(0)}
                                    smallPress={() => this.controlKlineChart(1)}
                                    oldPress={() => this.controlKlineChart(2)}
                                    latePress={() => this.controlKlineChart(3)}
                                    landPress={() => this._mineChangeToLandscape()}
                                />
                                : null
                        }
                        {
                            this.state.curGraphIndex === 0 ? (
                                <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }} >

                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, paddingBottom: 8 }}>

                                        {permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
                                            <View style={{ borderColor: '#0000001a', borderWidth: 1, width: 72, justifyContent: 'center', marginLeft: 5 }}>

                                                <ModalDropdown
                                                    ref='dropDownMinMain' forwardRef
                                                    defaultValue={ShareSetting.getMinMainFormulaNameByIndex(0)}
                                                    defaultIndex={0}
                                                    onSelect={(idx, value) => this._onMinMainDropDownMenu(idx, value)}
                                                    options={mainoptions}
                                                    style={{
                                                        // width: 70,
                                                        justifyContent: "center"
                                                    }}
                                                    textStyle={{
                                                        textAlign: "center",
                                                        fontSize: 12,
                                                        color: '#000000'
                                                    }}
                                                    buttonStyle={{
                                                        height: 20,
                                                        justifyContent: "center",
                                                        alignItems: "center"
                                                    }}
                                                    dropdownStyle={{
                                                        height: 80,
                                                        width: 70,
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        marginTop: 8,
                                                    }}
                                                    renderRow={(rowData) => {
                                                        return (
                                                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", width: 70 }}>
                                                                <View style={{ justifyContent: "center", alignItems: "center", height: 25, borderBottomColor: '#999999', borderBottomWidth: 1 }}>
                                                                    <Text style={{ color: baseStyle.WHITE, fontSize: 12 }}>{rowData}</Text>

                                                                </View>
                                                            </View>
                                                        )
                                                    }}
                                                    itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
                                                    itemActiveOpacity={0.5}
                                                />
                                            </View>
                                            : <View style={{ height: 30 }} />

                                        }
                                        {this.state.curMinMainFormulaIdx == 1 ?
                                            <Text style={{ fontSize: 10, marginLeft: 15, color: this.state.zhangfuColor }}>
                                                {'一冲：' + this.state.yichong}
                                            </Text>
                                            :
                                            <Text style={{ fontSize: 10, marginLeft: 15, color: '#828282' }}>
                                                {'时间：' + this.state.shijian}
                                            </Text>
                                        }
                                        {this.state.curMinMainFormulaIdx == 1 ?
                                            <Text style={{ fontSize: 10, marginLeft: 15, color: this.state.zhangfuColor }}>
                                                {'双冲：' + this.state.erchong}
                                            </Text>
                                            :
                                            <Text style={{ fontSize: 10, marginLeft: 15, color: '#828282' }}>
                                                {'现价：' + this.state.shijia}
                                            </Text>
                                        }

                                        {
                                            this.state.curMinMainFormulaIdx == 1 ? this.state.type === 1 ?
                                                <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.junjiaColor }}>{'现价：' + this.state.shijia}</Text>
                                                : null
                                                :
                                                this.state.type === 1 ?
                                                    <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.junjiaColor }}>{'均价：' + this.state.junjia}</Text>
                                                    : null

                                        }
                                        {this.state.curMinMainFormulaIdx == 1 ? <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.junjiaColor }}>{'均价：' + this.state.junjia}</Text>
                                            : <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.zhangfuColor }}>{'涨幅：' + this.state.zhangfu}</Text>
                                        }

                                        {/* <Text style={{ fontSize: 10, marginLeft: 15, color: '#555555' }}>
                                            {'时间：' + this.state.shijian}
                                        </Text>
                                        <Text style={{ fontSize: 10, marginLeft: 10, color: '#555555' }}>
                                            {'现价：' + this.state.shijia}
                                        </Text>

                                        {
                                            this.state.type === 1 ?
                                                <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.junjiaColor }}>
                                                    {'均价：' + this.state.junjia}
                                                </Text>
                                                : null
                                        }

                                        <Text style={{ fontSize: 10, marginLeft: 10, color: this.state.zhangfuColor }}>
                                            {'涨幅：' + this.state.zhangfu}
                                        </Text> */}

                                        <View style={{
                                            position: 'absolute',
                                            alignItems: 'flex-end',
                                            justifyContent: 'center',
                                            width: tabBarSingleWidthFormulaPicker,
                                            right: 0,
                                            // bottom: this.state.minFutuFloatButtonBottom
                                        }}>
                                            {has(ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx)) && this.state.curMinMainFormulaIdx == 1 //双突战法
                                                ?
                                                <TouchableOpacity onPress={() => {
                                                    Navigation.pushForParams(this.props.navigation, 'TargetStudyPage', {
                                                        name: ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx),
                                                        fromPage: 'LandscapePage',
                                                        // toPortrait: this._backToPortrait.bind(this),
                                                        // toPortrait:this.toPlayVideo(mainName),
                                                    })
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        // height:30,
                                                        width: 75,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                        <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                :
                                                null
                                            }
                                        </View>

                                    </View>
                                    <View style={{ height: 1, backgroundColor: baseStyle.LINE_BG_F1 }} />
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <View style={{ flex: 10 }} onLayout={this._onLayout.bind(this)}>
                                            <DZHMinChart
                                                mainName={ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx)}
                                                viceName={ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx)}
                                                navigation={this.props.navigation}
                                                statusPaused={this.state.statusPaused}
                                                isDaPan={this.state.type}
                                                callback={this._displayBuySellComponent.bind(this)}
                                                isBig={true}
                                                params={this.postLoad && this.state.obj &&
                                                    { obj: this.state.obj }} />
                                            <View style={{ flexDirection: 'row', bottom: this.state.minFutuFloatButtonBottom }}>
                                                {permission >= 5 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
                                                    <View style={{
                                                        // alignItems: 'flex-start',
                                                        justifyContent: 'center',
                                                        // paddingLeft: 5,
                                                        marginLeft: 5,
                                                        width: 72,
                                                        // bottom: this.state.minFutuFloatButtonBottom,
                                                        borderWidth: 1,
                                                        borderColor: '#0000001a'
                                                    }}>
                                                        <ModalDropdown
                                                            ref='dropDownMinFutu' forwardRef
                                                            defaultValue={ShareSetting.getMinFutuFormulaNameByIndex(0)}
                                                            defaultIndex={0}
                                                            onSelect={(idx, value) => this._onMinFutuDropDownMenu(idx, value)}
                                                            options={futuoptions}
                                                            style={{
                                                                // width: 70,
                                                                justifyContent: "center"
                                                            }}
                                                            textStyle={{
                                                                textAlign: "center",
                                                                fontSize: 12,
                                                                color: '#000000'
                                                            }}
                                                            buttonStyle={{
                                                                height: 20,
                                                                justifyContent: "center",
                                                                alignItems: "center"
                                                            }}
                                                            dropdownStyle={{
                                                                height: 80,
                                                                width: 70,
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                marginTop: 8,
                                                            }}
                                                            renderRow={(rowData) => {
                                                                return (
                                                                    <View style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", width: 70 }}>
                                                                        <View style={{ justifyContent: "center", alignItems: "center", height: 25, borderBottomColor: '#999999', borderBottomWidth: 1 }}>
                                                                            <Text style={{ color: baseStyle.WHITE, fontSize: 12 }}>{rowData}</Text>
                                                                        </View>
                                                                    </View>
                                                                )
                                                            }}
                                                            itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
                                                            itemActiveOpacity={0.5}
                                                        />
                                                    </View>
                                                    : <View style={{ height: 30 }} />

                                                }
                                                {this.state.curMinFutuFormulaIdx == 0 ? //成交量
                                                    <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 15, color: '#828282' }}>
                                                        {this.state.chengjiaoliang}
                                                    </Text> : null
                                                }
                                            </View>

                                            <View style={{
                                                position: 'absolute',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                width: tabBarSingleWidthFormulaPicker,
                                                right: 0,
                                                bottom: this.state.minFutuFloatButtonBottom
                                            }}>

                                                {has(ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx)) && this.state.curMinFutuFormulaIdx == 1 //资金流入
                                                    ?
                                                    <TouchableOpacity onPress={() => {
                                                        Navigation.pushForParams(this.props.navigation, 'TargetStudyPage', {
                                                            name: ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx),
                                                            fromPage: 'LandscapePage',
                                                            // toPortrait: this._backToPortrait.bind(this),
                                                            // toPortrait:this.toPlayVideo(viceName),
                                                        })
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            // height:30,
                                                            width: 75,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                            <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    :
                                                    null
                                                }
                                            </View>

                                        </View>

                                        {this.state.type === 1 && ShareSetting.isDisplayBuySellComponent() === true && (
                                            <View style={{ flex: 2, borderLeftWidth: 1, borderLeftColor: baseStyle.WUDANG_BORDER_COLOR, width: 125 }}>
                                                <TabBar
                                                    style={{
                                                        flex: 1,
                                                        tabBar: { backgroundColor: baseStyle.WHITE, height: 25 },
                                                        tabBarItem: {},
                                                        tabBarItemLabel: { color: baseStyle.WU_DANG_BLACK, fontSize: 13 },
                                                        tabBarItemSelected: { borderBottomColor: baseStyle.TABBAR_BORDER_COLOR },
                                                        //tabBarItemLabelSelected: {color: baseStyle.WU_DANG_BLACK}
                                                        tabBarItemLabelSelected: { color: baseStyle.TABBAR_BORDER_COLOR }

                                                    }}
                                                    where={'BuySellAndTickLandscape'} lastIndex={ShareSetting.getWuDangIndex()} onChangeTab={this._onChangeTab} ref={(ref) => ref && !this.state.tabBar && (this.setState({ tabBar: ref }))}>
                                                    <TabBarItem title="五档">
                                                        <DZHYunBuySellComponent navigation={this.props.navigation} params={this.postLoad && this.state.obj && { obj: this.state.obj }}></DZHYunBuySellComponent>
                                                    </TabBarItem>
                                                    <TabBarItem title="明细">
                                                        <TickComponent navigation={this.props.navigation} params={this.postLoad && this.state.obj && { obj: this.state.obj }}></TickComponent>
                                                    </TabBarItem>
                                                </TabBar>
                                                <View
                                                    style={{
                                                        backgroundColor: baseStyle.DEFAULT_BORDER_COLOR,
                                                        height: 1,
                                                        marginRight: 15
                                                    }}
                                                />
                                            </View>
                                        )}

                                    </View>

                                    <View style={{ height: 40, flexDirection: 'row' }}>
                                        <ScrollableTabView
                                            style={{ width: screenHeight, height: 40 }}
                                            tabBarActiveTextColor={baseStyle.SCROLLABLE_TAB_ACTIVE_TEXT_COLOR}
                                            tabBarTextStyle={{ fontSize: 15 }}
                                            tabBarInactiveTextColor={baseStyle.SCROLLABLE_TAB_INACTIVE_TEXT_COLOR}
                                            initialPage={this.state.curGraphIndex}
                                            //page={this.state.curGraphIndex}
                                            renderTabBar={() => <DefaultTabBar
                                                tabStyle={{
                                                    height: 30,
                                                    width: screenHeight / 9,
                                                    marginTop: 12
                                                }} />}
                                            onChangeTab={(obj) => {
                                                this.sensorsAdKClick(obj.i)
                                                this.setState({ curGraphIndex: obj.i });
                                                ShareSetting.setCurGraphIndex(obj.i);

                                                this.refs.KLineInLandscapePage && this.getKLineInLandscapePageRef().resetCheckPriceState();
                                            }
                                            }>
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(0)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(1)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(2)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(3)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(4)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(5)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(6)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(7)} />
                                            <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(8)} />
                                        </ScrollableTabView>
                                    </View>
                                </View>
                            ) : (
                                    <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }} >
                                        <View style={{ flex: 1, flexDirection: 'row' }} onLayout={(event) => { this.setState({ height_kline: event.nativeEvent.layout.height, width_kline: event.nativeEvent.layout.width }) }}>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ height: 1, backgroundColor: baseStyle.LINE_BG_F1 }} />
                                                <View style={{ flexDirection: 'row', alignItems: 'center', height: 25 }}>
                                                    <View style={{ flexDirection: 'row', flex: 1 }}>
                                                        <Text style={{ fontSize: 10, marginLeft: 10, color: '#333333' }}>
                                                            {this.state.zhuTuName}
                                                        </Text>
                                                        <Text style={{ fontSize: 10, marginLeft: 10, color: '#333333' }}>
                                                            {this.state.zhuTuTime}
                                                        </Text>


                                                        {
                                                            this.state.maData.length > 0 ? (
                                                                <View style={{ flexDirection: 'row', flex: 1 }}>

                                                                    {this.state.maData.map(
                                                                        (data, index) => (
                                                                            <Text key={index} style={{ fontSize: 10, marginLeft: 10, color: '#' + this.state.colorData[index] }}>
                                                                                {this.state.maData[index]}
                                                                            </Text>
                                                                        ))}

                                                                </View>
                                                            ) : (
                                                                    <View />
                                                                )
                                                        }


                                                    </View>
                                                    {has(this.state.zhuTuName) ?
                                                        <Image style={{ width: 3, height: 20 }} source={require('../../images/icons/line_icon.png')} />
                                                        :
                                                        null}
                                                    {has(this.state.zhuTuName) ?
                                                        <TouchableOpacity onPress={() => {
                                                            Navigation.pushForParams(this.props.navigation, 'TargetStudyPage', { name: this.state.zhuTuName, fromPage: 'LandscapePage' })
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                height: 30,
                                                                width: 75,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                                <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                        :
                                                        null
                                                    }
                                                    {/* {this.state.zhuTuName === '短线趋势彩虹' || this.state.zhuTuName === '趋势彩虹'
                                                        || this.state.zhuTuName === '蓝粉彩带'|| this.state.zhuTuName === '中期彩带'
                                                        ?
                                                        <Image style={{ width: 3, height: 20 }} source={require('../../images/icons/line_icon.png')} />
                                                        :
                                                        null
                                                    } */}
                                                    {/* {this.state.zhuTuName === '短线趋势彩虹' || this.state.zhuTuName === '趋势彩虹'
                                                        || this.state.zhuTuName === '蓝粉彩带'|| this.state.zhuTuName === '中期彩带'
                                                        ?
                                                        <TouchableOpacity onPress={() => {
                                                            Navigation.pushForParams(this.props.navigation, 'TargetStudyPage', { name: this.state.zhuTuName, fromPage: 'LandscapePage' })
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                height: 30,
                                                                width: 75,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                                <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                        :
                                                        null
                                                    } */}
                                                </View>
                                                <View style={{ height: 1, backgroundColor: baseStyle.LINE_BG_F1 }} />
                                                {this.state.type !== null && (<DZHKlineChartAndroid
                                                    ref='KLineInLandscapePage' forwardRef
                                                    isLandscape={'true'}
                                                    callbackLoopNum={(item) => {
                                                        this.callbackLoopName(item);
                                                    }}
                                                    tabName={ShareSetting.getGraphPeriodNameByIndex(this.state.curGraphIndex)}
                                                    callback={this._dataCallback.bind(this)}
                                                    callbackSideBtn={this.onPressFormulaBtn.bind(this)}
                                                    main={this.zhuTuName}
                                                    first={this.fuTuName}
                                                    isBig={true}
                                                    params={this.state.obj && {
                                                        obj: this.state.obj,
                                                        // period: periodText,
                                                        period: this.getPeriodText(),
                                                        type: this.state.type

                                                    }}
                                                    name={this.props.navigation.state.params.ZhongWenJianCheng}
                                                    navigation={this.props.navigation}>
                                                </DZHKlineChartAndroid>)}
                                            </View>


                                            {this.state.showSider === true &&
                                                <KChartSider
                                                    ref={'kSider1'}
                                                    navigation={this.props.navigation}
                                                    stkType={this.state.type}
                                                    setSiderWidth={(width) => { this._setSiderWidth(width) }}
                                                    curGraphIndex={this.state.curGraphIndex}
                                                    onSplitChange={(empower) => {
                                                        this.refs.KLineInLandscapePage && this.getKLineInLandscapePageRef()._onChangeEmpower(empower);
                                                        ShareSetting.selectFormula(empower);
                                                    }}
                                                    onFormulaChange={(formula) => {
                                                        if (ShareSetting.isAssistFormula(formula)) {
                                                            this.fuTuName = formula;
                                                        } else {
                                                            this.zhuTuName = formula;
                                                        }

                                                        this.refs.KLineInLandscapePage && this.getKLineInLandscapePageRef()._onPickFormula(formula);
                                                        ShareSetting.selectFormula(formula);
                                                    }}
                                                />
                                            }
                                            {this.state.height_kline > 0 ? <View style={{
                                                position: 'absolute',
                                                width: this.state.showSider === true ? this.state.width_kline - this.state.siderWidth - 20 : this.state.width_kline,
                                                left: 0,
                                                right: 0,
                                                top: ((this.state.height_kline * 2 / 3)),
                                                height: 25,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                borderBottomColor: '#E5E5E5',
                                                borderBottomWidth: 1,
                                                borderTopColor: '#E5E5E5',
                                                borderTopWidth: 1,
                                                justifyContent: 'space-between',
                                                backgroundColor: '#FFFFFF'
                                            }}>
                                                {this._showBQuoteUnableAlert(this.state.fuTuName)}

                                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                                    <Text style={{ fontSize: 10, marginLeft: 10, color: '#333333' }}>
                                                        {this.state.fuTuName}
                                                    </Text>
                                                    {this.fuTuData.map(
                                                        (data, index) => (
                                                            <Text key={index} style={{ fontSize: 10, marginLeft: 10, color: '#' + this.state.fuTuColorData[index] }}>
                                                                {this.fuTuData[index]}
                                                            </Text>
                                                        ))
                                                    }

                                                </View>

                                                {has(this.state.fuTuName) ?
                                                    <Image style={{ width: 3, height: 20 }} source={require('../../images/icons/line_icon.png')} />
                                                    :
                                                    null
                                                }
                                                {has(this.state.fuTuName) ?
                                                    <TouchableOpacity onPress={() => {
                                                        Navigation.pushForParams(this.props.navigation, 'TargetStudyPage', { name: this.state.fuTuName, fromPage: 'LandscapePage' })
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            height: 25,
                                                            width: 75,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                            <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    :
                                                    null
                                                }
                                                {/* {this.state.fuTuName === '量能黄金' || this.state.fuTuName === '周期拐点'
                                                    || this.state.fuTuName === '波动极限' || this.state.fuTuName === '强弱转换'
                                                    || this.state.fuTuName === '操盘提醒' || this.state.fuTuName === '底部筹码'
                                                    ?
                                                    <Image style={{ width: 3, height: 20 }} source={require('../../images/icons/line_icon.png')} />
                                                    :
                                                    null
                                                }
                                                {this.state.fuTuName === '量能黄金' || this.state.fuTuName === '周期拐点'
                                                    || this.state.fuTuName === '波动极限' || this.state.fuTuName === '强弱转换'
                                                    || this.state.fuTuName === '操盘提醒' || this.state.fuTuName === '底部筹码'
                                                    ?
                                                    <TouchableOpacity onPress={() => {
                                                        Navigation.pushForParams(this.props.navigation, 'TargetStudyPage', { name: this.state.fuTuName, fromPage: 'LandscapePage' })
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            height: 25,
                                                            width: 75,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <Image style={{ width: 16, height: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                                            <Text style={{ color: '#006ACC', marginLeft: 6, fontSize: 12 }}>学指标</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    :
                                                    null
                                                } */}
                                            </View> : null}
                                        </View>


                                        <View style={{ height: 40, flexDirection: 'row' }}>
                                            <ScrollableTabView
                                                style={{ width: screenHeight, height: 40 }}
                                                tabBarActiveTextColor={baseStyle.SCROLLABLE_TAB_ACTIVE_TEXT_COLOR}
                                                tabBarUnderlineStyle={{
                                                    marginLeft: (screenWidth + this.state.notchSize) / 13,
                                                    // marginLeft: (screenWidth + NavigationHeight + this.state.notchSize) / 13,
                                                    width: 15,
                                                    height: 3,
                                                    backgroundColor: '#F92400',
                                                    borderRadius: 1,
                                                    marginBottom: 8
                                                }}
                                                tabBarTextStyle={{ fontSize: 15 }}
                                                tabBarInactiveTextColor={baseStyle.SCROLLABLE_TAB_INACTIVE_TEXT_COLOR}
                                                initialPage={this.state.curGraphIndex}
                                               // page={this.state.curGraphIndex}
                                                renderTabBar={() => <DefaultTabBar
                                                    tabStyle={{
                                                        height: 30,
                                                        width: (screenHeight) / 9,
                                                        marginTop: 12
                                                    }} />}
                                                onChangeTab={(obj) => {
                                                    this.setState({ curGraphIndex: obj.i });
                                                    ShareSetting.setCurGraphIndex(obj.i);
                                                    this.refs.KLineInLandscapePage && this.getKLineInLandscapePageRef().resetCheckPriceState();
                                                }
                                                }>
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(0)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(1)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(2)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(3)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(4)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(5)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(6)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(7)} />
                                                <Text tabLabel={ShareSetting.getGraphPeriodNameByIndex(8)} />
                                            </ScrollableTabView>
                                        </View>
                                    </View>
                                )
                        }

                        <View style={{ height: 3, backgroundColor: '#fff' }} />
                    </View>
                </View>
            </View>
        );
    }
    /*for android end */

    /* B股不显示指标 */
    _showBQuoteUnableAlert(zhibaoName) {
        if (!this.state.obj) {
            return;
        }
        if (!this.state.width_kline) {
            return;
        }
        return (
            isBQuote(this.state.obj.substr(2, 6)) && ShareSetting.isBUnable(zhibaoName) ?
                <View style={{
                    top: 40,
                    left:
                        Platform.OS === 'ios' ?
                            (this.state.showSider === true ? (this.state.width_kline - 125 - 20 - 155) / 2 : (this.state.width_kline - 155) / 2)
                            :
                            (this.state.showSider === true ? (this.state.width_kline - this.state.siderWidth - 20 - 155) / 2 : (this.state.width_kline - 155) / 2),

                    //  left:(this.state.width_kline-155)/2,
                    position: 'absolute',
                    flexDirection: 'row',
                    height: 30,
                    paddingLeft: 8,
                    paddingRight: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 15,
                    backgroundColor: 'rgba(51,153,255,0.1)',
                }}>
                    <Text style={{ alignItems: 'center', justifyContent: 'center', color: '#003366', fontSize: 12 }}>本指标不适用于当前品种</Text>

                </View>
                : null
        );
    }
}

const tabStyles = StyleSheet.create({
    tab: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: 0,
        marginRight: 20,
        width: baseStyle.isIPhoneX
            ? (screenHeight - 20 * 8 - 40) / 9
            : (screenHeight - 20 * 8 - 10) / 9
    },
    activeTab: {
        borderBottomColor: baseStyle.BLUE_HIGH_LIGHT,
        borderBottomWidth: 2
    },
    inactiveTab: {
    },
    text: {
        fontSize: 15
    },
    activeText: {
        color: baseStyle.BLUE_HIGH_LIGHT
    },
    inactiveText: {
        color: baseStyle.BLACK_70
    },
    container: {
        height: 40,
        borderWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#ccc'
    },
    tabs: {
        paddingLeft: 5,
        justifyContent: 'flex-start'
    }
});




export default connect(
    state => ({
        userInfo: state.UserInfoReducer,
        statePersonalStockList: state.PersonalStockListReducer
    }),
    dispatch => ({
        actions: bindActionCreators(AllActions, dispatch)
    })
)(LandscapePage);
