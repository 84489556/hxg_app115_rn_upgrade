/**
 * 存储共享的数据，保证多个组件中状态的一致性
 */

import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';
import * as BaseStyle from '../components/baseStyle';
import UserInfoUtil from '../utils/UserInfoUtil'

let _MainFormulaMin = ['分时走势', '分时冲关'];
let _FutuFormulaMin = ['成交量', '资金流入'];

let _MainFormulaStorage = ['蓝粉彩带', 'MA', 'BOLL'];
let _Assist3Formula = [
    '波动极限',
    '主力动态',
    '蓝粉买点'
];
let _AssistFormulaStorage = [

    '操盘提醒',
    '底部出击',
    'VOL',
    'MACD',
    'KDJ',
    'RSI',
    'WR',
    'BIAS',
    'CCI',
    '主力动态',

    '波动极限',
    '量能黄金',
    '周期拐点',
    '资金雷达',
    '多空资金',
    '主力资金'


];
let _HorAssistFormula = [
    'VOL',
    'MA',
    'MACD',
    'KDJ',
    'RSI',
    'WR',
    'BIAS',
    'CCI',
    'BOLL'
]


let _EmpowerStorage = ['除权', '前复权', '后复权'];
let _SpecialFormula = [
    '短线趋势彩虹',
    '趋势彩虹',
    // '量能黄金',
    '周期拐点',
    '波动极限',
    '强弱转换',
    // '蓝粉彩带',
    // '操盘提醒',
    // '底部出击',
    '顶底判断',
    '分时冲关',
    '多空资金',
    '主力资金',
    '资金流入',
    '九转战法',
    '主力动态',
    '资金雷达',
    '多空预警'
];

let _HorSpecialFormula = [
    //蓝粉彩带、中期彩带、抄底策略、波动极限、主力动态、底部出击、操盘提醒、量能黄金、周期拐点、5日主力资金、多空预警、多空资金、主力资金


    '蓝粉彩带',
    '中期彩带',
    '抄底策略',
    '波动极限',
    '主力动态',
    '底部出击',
    '操盘提醒',
    '量能黄金',
    '周期拐点',
    '资金雷达',
    '多空预警',
    '多空资金',
    '主力资金'
];
let _LoopFormula = [
    '操盘提醒',
    '底部出击',
    'VOL',
    'MACD',
    'KDJ',
    'RSI',
    'WR',
    'BIAS',
    'CCI'
    //,
    // '主力动态'
];
// 游客可见但点击后需提示登录
let _GuideUsers2Login = [
    // '顶底判断',
    // '周期拐点',
    // '波动极限',
    '蓝粉买点',
    '中期彩带',
    '抄底策略',

    '量能黄金',
    '周期拐点',
    '波动极限',
    '多空资金',
    '主力资金',
    '主力动态',
    '资金雷达',
    '多空预警'
]
// 免费用户登录后可见但不可用（弹窗）
let _GuideUsers2Pay = [
    '趋势导航',
    '波动极限',
    '主力动态'
]
let _ZSLTerm = [
    '蓝粉彩带',
    '底部出击',
    '操盘提醒'

]
let _JZZFTerm = [
    '多空预警',
    'MACD'
]
let _LFMDTerm = [
    '蓝粉彩带',
    '底部出击',
    '主力动态'
]

let _BUnable =  [
    '多空资金',
    '主力资金',
    '资金雷达'
]
let _GraphPeriod = ['分时', '日K', '周K', '月K', '1分', '5分', '15分', '30分', '60分'];
// let _GraphPeriod = ['分时', '日K', '周K', '月K'];
//k线的缩放条数
const _KLineNumberInScreenArray = [5, 8, 13, 21, 34, 55, 89, 144, 233, 250];
//默认k线是显示数组第六个 55条
let _IndexOfKLineNumber = 5;

let _SelectedMainFormula = '蓝粉彩带';
let _SelectedAssistFormula = '操盘提醒';
let _SelectedVice2Formula = '底部出击';
let _SelectedEmpower = '前复权';

let _errorFormulaName = 'NaN';

let _noStockNotice = '暂无股票  点击添加';
let _curGraphIndex = 0;
let _wudangIndex = 0;
let _isDisplayBuySellComponent = true;

let _deviceWidthDP = Dimensions.get('window').width;
let _deviceHeightDP = Dimensions.get('window').height;
let _deviceWidthPX = _deviceWidthDP * PixelRatio.get();
let _deviceHeightPX = _deviceHeightDP * PixelRatio.get();

let _base64Head = 'data:image/jpeg;base64,';
let _startLineIndex = 0;
let _klineLeftRightMargin = 15;

/**
 * 友盟统计各页面名称
 */
const rdjmName = '热点揭秘主页面'
const zxckName = '中线参考主页面'
const jztzName = '价值投资主页面'
const gpgzName = '股票跟踪主页面'
const xrdName = '小热点详情页'
const dztName = '大主题详情页'
const zxckDetailName = '中线参考详情页'
const jztzDetailName = '价值投资详情页'
const gpgzDetailName = '股票跟踪详情页'
const gpgzHistoryName = '股票跟踪历史列表页'


export default {

    isGuideUsers2Login(name) {
        return _GuideUsers2Login.indexOf(name);
    },

    isGuideUsers2Pay(name) {
        return _GuideUsers2Pay.indexOf(name);
    },

    getZSLTermItem(idx) {
        if (idx >= _ZSLTerm.length)
            idx = 0
        return _ZSLTerm[idx]
    },

    getJZZFTermItem(idx) {
        if (idx >= _JZZFTerm.length)
            idx = 0
        return _JZZFTerm[idx]
    },

    getLFMDTermItem(idx) {
        if (idx >= _LFMDTerm.length)
            idx = 0
        return _LFMDTerm[idx]
    },

    getMinMainFormula() {
        return _MainFormulaMin
    },

    getMinFutuFormula() {
        return _FutuFormulaMin
    },

    getMinMainFormulaNameByIndex(index) {
        if (index >= _MainFormulaMin.length)
            index = 0
        return _MainFormulaMin[index]
    },

    getMinFutuFormulaNameByIndex(index) {
        if (index >= _FutuFormulaMin.length)
            index = 0
        return _FutuFormulaMin[index]
    },

    getRdjmName() {
        return rdjmName
    },

    getZxckName() {
        return zxckName
    },

    getJztzName() {
        return jztzName
    },

    getGpgzName() {
        return gpgzName
    },

    getXrdName() {
        return xrdName
    },

    getDztName() {
        return dztName
    },

    getZxckDetailName() {
        return zxckDetailName
    },

    getJztzDetailName() {
        return jztzDetailName
    },

    getGpgzDetailName() {
        return gpgzDetailName
    },

    getGpgzHistoryName() {
        return gpgzHistoryName
    },

    isStock(code) {
        let len = code.length
        if (len !== 8) return false

        let beginTwo = code.slice(0, 2)
        if (beginTwo !== 'SH' && beginTwo !== 'SZ') {
            return false
        }
        else {
            return true
        }
    },

    isDelistedStock(name) {
        let b = false
        if (name && name.indexOf("(退市)") > 0) {
            b = true
        }
        return b
    },

    trimCode(code) {
        if (!code) return ''

        result = code

        if (result.length === 8) {
            result = result.slice(2, result.length)
        }

        return result
    },

    getDate(tim, flag) {

        if (!tim) {
            return;
        }

        tim = tim.toString()

        if (tim.indexOf('-') != -1) {
            date = tim.substring(0, 19);
            date = tim.replace(/-/g, '/');
            tim = new Date(date).getTime();
        }

        var newDate = new Date();
        newDate.setTime(tim);
        let month = this.fillZero(newDate.getMonth() + 1, 2)
        let day = this.fillZero(newDate.getDate(), 2)
        let hour = this.fillZero(newDate.getHours(), 2)
        let minutes = this.fillZero(newDate.getMinutes(), 2);
        let seconds =  this.fillZero(newDate.getSeconds(), 2);

        let result = newDate.getFullYear() + '年' + month + '月' + day + '日'
            + ',' + newDate.getHours() + ':' + minutes

        if (flag === 'rdjm' || flag === 'zxck' || flag === 'jztz_detail') {
            result = month + '-' + day + '  ' + hour + ':' + minutes
        }
        else if (flag === 'jztz' || flag === 'gpgz_history') {
            result = newDate.getFullYear() + '-' + month + '-' + day + '  '// + hour + ':' + minutes
        } else if (flag === 'noBlank') {
            //和flag === 'jztz' 一样，只是最后不需要加上空格
            result = newDate.getFullYear() + '-' + month + '-' + day // + hour + ':' + minutes

        }
        else if (flag === 'updateTime') {
            result = hour + ':' + minutes
        }
        else if (flag === 'cgal') {
            result = month + '-' + day;
        }
        else if (flag === 'gpgz') {
            this.isToday(tim) ? result = hour + ':' + minutes : result = month + '-' + day + '  ' + hour + ':' + minutes
        } else if (flag === 'today') {
            this.isToday(tim) ? result = hour + ':' + minutes : result = newDate.getFullYear() + '-' + month + '-' + day + '  ' + newDate.getHours() + ':' + minutes
        } else if (flag === 'yyyy-MM-dd HH:mm') {
            result = newDate.getFullYear() + '-' + month + '-' + day + '  ' + (newDate.getHours() > 9 ? newDate.getHours() : "0" + newDate.getHours()) + ':' + minutes
        } else if (flag === 'yyyy/MM/dd') {
            result = newDate.getFullYear() + '/' + month + '/' + day
        }  else if (flag === 'yyyy-MM-dd') {
            result = newDate.getFullYear() + '-' + month + '-' + day
        } else if (flag === 'yyyy/MM/dd HH:mm') {
            result = newDate.getFullYear() + '/' + month + '/' + day + '  ' + (newDate.getHours() > 9 ? newDate.getHours() : "0" + newDate.getHours()) + ':' + minutes
        }else  if(flag==='HH:mm:ss'){
            result = (newDate.getHours() > 9 ? newDate.getHours() : "0" + newDate.getHours()) + ':' + minutes+":"+seconds
        }

        else if (flag === '年') {
            result = newDate.getFullYear() + '年' + month + '月' + day + '日'
                + ' ' + (newDate.getHours() > 9 ? newDate.getHours() : "0" + newDate.getHours()) + ':' + minutes
        } else {
            // this.isToday(tim) ? result = hour + ':' + minutes : result = month + '-' + day + '  ' + hour + ':' + minutes
            if (this.isToday(tim)) {
                result = '今天 ' + hour + ':' + minutes
            } else if (this.isYestoday(tim)) {
                result = '昨天 ' + hour + ':' + minutes
            } else if (this.isThisYear(tim)) {
                result = month + '-' + day + '  ' + hour + ':' + minutes
            } else {
                result = newDate.getFullYear() + '-' + month + '-' + day + '  ' + newDate.getHours() + ':' + minutes
            }
        }

        return result
    },

    isToday(tim) {
        var newDate = new Date();
        newDate.setTime(tim);
        var today = new Date();
        if (newDate.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)) {
            return true
        }
        return false
    },

    isYestoday(tim) {
        var newDate = new Date();
        newDate.setTime(tim);
        var yestoday = new Date();
        yestoday.setDate(yestoday.getDate() - 1);

        if (newDate.setHours(0, 0, 0, 0) == yestoday.setHours(0, 0, 0, 0)) {
            return true
        }
        return false;
    },

    isThisYear(tim) {
        var newDate = new Date();
        newDate.setTime(tim);
        let beforeYear = newDate.getFullYear();

        var tody = new Date();
        let todyYear = tody.getFullYear();

        if (todyYear === beforeYear) {
            return true;
        }
        return false;
    },

    fillZero(val, lenLimit) {
        let result = val.toString()
        let valLen = result.length
        if (valLen < lenLimit) {
            for (var i = valLen; i < lenLimit; i++) {
                result = '0' + result
            }
        }

        return result
    },

    getBase64Head() {
        return _base64Head;
    },

    getStatusBarHeightDP() {
        if (Platform.OS === 'ios') {
            return BaseStyle.isIPhoneX ? 44 : 20;
        } else if (Platform.OS === 'android') {
            return StatusBar.currentHeight;
        } else {
            return 20;
        }
    },

    getZhangFuBangTitle() {
        return '涨幅榜';
    },

    getDieFuBangTitle() {
        return '跌幅榜';
    },

    getDeviceWidthDP() {
        return _deviceWidthDP;
    },

    getDeviceHeightDP() {
        return _deviceHeightDP;
    },

    getDeviceWidthPX() {
        return _deviceWidthPX;
    },

    getDeviceHeightPX() {
        return _deviceHeightPX;
    },

    getCurGraphIndex() {
        return _curGraphIndex;
    },

    setCurGraphIndex(index) {
        _curGraphIndex = index;
    },

    getWuDangIndex() {
        return _wudangIndex
    },

    setWuDangIndex(index) {
        _wudangIndex = index
    },

    isDisplayBuySellComponent() {
        return _isDisplayBuySellComponent
    },

    setDisplayStateBuySellComponent(b) {
        _isDisplayBuySellComponent = b
    },

    getMainFormulas() {
        let permiss = UserInfoUtil.getUserPermissions()
        switch (permiss) {
            case 0: {
                _MainFormulaStorage = ['蓝粉彩带', 'MA', 'BOLL', '抄底策略', '中期彩带']
                break;
            }
            case 1: {
                _MainFormulaStorage = ['蓝粉彩带', 'MA', 'BOLL', '抄底策略', '中期彩带']
                break;
            }
            case 3: {
                _MainFormulaStorage = ['蓝粉彩带', 'MA', 'BOLL', '抄底策略', '中期彩带']
                break;
            }
            case 4: {
                _MainFormulaStorage = ['蓝粉彩带', 'MA', 'BOLL', '抄底策略', '多空预警', '中期彩带']
                break;
            }
            case 5: {
                // _MainFormulaStorage = ['蓝粉彩带','趋势导航','MA','BOLL','顶底判断','九转战法']
                _MainFormulaStorage = ['蓝粉彩带', 'MA', 'BOLL', '抄底策略', '多空预警', '中期彩带']

                break;
            }
            default:
                break;
        }

        return _MainFormulaStorage;
    },

    getAssistFormulas() {
        let permiss = UserInfoUtil.getUserPermissions()
        switch (permiss) {
            case 0: {
                _AssistFormulaStorage = ['操盘提醒', '底部出击', '波动极限', '量能黄金',
                'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI']
                break;
            }
            case 1: {
                _AssistFormulaStorage = ['操盘提醒', '底部出击', '波动极限', '量能黄金',
                'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI']
                break;
            }
            case 3: {
                _AssistFormulaStorage = ['操盘提醒', '底部出击', '波动极限', '量能黄金',
                    'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI']
                break;
            }
            case 4: {
                _AssistFormulaStorage = ['操盘提醒', '底部出击', '波动极限', '量能黄金', '周期拐点',
                    'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI', '资金雷达']
                break;
            }
            case 5: {
                _AssistFormulaStorage = ['操盘提醒', '底部出击', '波动极限', '量能黄金', '周期拐点',
                    'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI', '多空资金', '主力资金', '资金雷达']
                break;
            }
            default:
                break;
        }
        return _AssistFormulaStorage;
    },

    getHorAssistFormulas(){
        return _HorAssistFormula;
    },
    getHorSpecialFormulas() {
        let permiss = UserInfoUtil.getUserPermissions()
        switch (permiss) {
            case 0: {
                _HorSpecialFormula = ['蓝粉彩带', '底部出击','操盘提醒']
                break;
            }
            case 1: {
                _HorSpecialFormula = ['蓝粉彩带','中期彩带','抄底策略', '底部出击','操盘提醒',
                '量能黄金']
                break;
            }
            case 3: {
                _HorSpecialFormula = ['蓝粉彩带','中期彩带','抄底策略', '波动极限','主力动态',
                '底部出击','操盘提醒','量能黄金']
                break;
            }
            case 4: {
                _HorSpecialFormula = ['蓝粉彩带','中期彩带','抄底策略', '波动极限','主力动态',
                    '底部出击','操盘提醒','量能黄金','周期拐点','资金雷达','多空预警']
                break;
            }
            case 5: {
                _HorSpecialFormula = ['蓝粉彩带','中期彩带','抄底策略', '波动极限','主力动态',
                    '底部出击','操盘提醒','量能黄金','周期拐点','资金雷达','多空预警','多空资金',
                    '主力资金']
                break;
            }
            default:
                break;
        }
        return _HorSpecialFormula;
    },

    getSpecialFormulas() {
        return _SpecialFormula;
    },

    getEmpower() {
        return _EmpowerStorage;
    },

    getLoopFormula() {
        // return _LoopFormula;
        let permiss = UserInfoUtil.getUserPermissions()
        switch (permiss) {
            case 0: {
                _LoopFormula = ['操盘提醒', '底部出击', 
                'WR', 'BIAS', 'CCI',  'VOL', 'MACD', 'KDJ', 'RSI']
                break;
            }
            case 1: {
                _LoopFormula = ['操盘提醒', '底部出击',  '量能黄金',
                'WR', 'BIAS', 'CCI',  'VOL', 'MACD', 'KDJ', 'RSI']
                break;
            }
            case 3: {
                _LoopFormula = ['操盘提醒', '底部出击', '波动极限', '量能黄金',
                    'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI']
                break;
            }
            case 4: {
                _LoopFormula = ['操盘提醒', '底部出击', '波动极限', '量能黄金', '周期拐点',
                    'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI', '资金雷达']
                break;
            }
            case 5: {
                _LoopFormula = ['操盘提醒', '底部出击', '波动极限', '量能黄金', '周期拐点',
                    'WR', 'BIAS', 'CCI', '主力动态', 'VOL', 'MACD', 'KDJ', 'RSI', '多空资金', '主力资金', '资金雷达']
                break;
            }
            default:
                break;
        }
        // console.log('zhibiao---_LoopFormula----'+_LoopFormula);
        return _LoopFormula;
    },

    //获取当前显示的k线条数
    getIndexOfKLineNumber() {
        return _IndexOfKLineNumber;
    },
    //设置显示k线条数
    setIndexOfKLineNumber(index) {
        _IndexOfKLineNumber = index;
    },

    getNoStockNotice() {
        return _noStockNotice;
    },

    getSpecialFormulaNameByIndex(n) {
        if (n < _SpecialFormula.length) return _SpecialFormula[n];
        return _errorFormulaName;
    },

    getHorAssistFormulaNameByIndex(n) {
        if (n < _HorAssistFormula.length) return _HorAssistFormula[n];
        return _errorFormulaName;
    },
    getHorSpecialFormulaNameByIndex(n) {
        if (n < _HorSpecialFormula.length) return _HorSpecialFormula[n];
        return _errorFormulaName;
    },
    getGraphPeriodNameByIndex(n) {
        if (n < _GraphPeriod.length) return _GraphPeriod[n];
        return _errorFormulaName;
    },

    getGraphPeriods() {
        return _GraphPeriod;
    },

    getSelectedSpecialFormulaIndex() {

        for (var n = 0; n < _SpecialFormula.length; ++n) {
            if (this.isSelected(_SpecialFormula[n])) return n;
        }

        return -1;

    },

    getMainFormulaNameByIndex(n) {
        if (n < _MainFormulaStorage.length) return _MainFormulaStorage[n];
        return _errorFormulaName;
    },

    getAssistFormulaNameByIndex(n) {
        if (n < _AssistFormulaStorage.length) return _AssistFormulaStorage[n];
        return _errorFormulaName;
    },

    getEmpowerIndexByName(name) {
        return _EmpowerStorage.indexOf(name);
    },

    getEmpowerNameByIndex(n) {
        if (n < _EmpowerStorage.length) return _EmpowerStorage[n];
        return _errorFormulaName;
    },

    isMainFormula(name) {
        if (_MainFormulaStorage.indexOf(name) !== -1) {
            return true;
        }

        return false;
    },

    isAssistFormula(name) {
        if (_AssistFormulaStorage.indexOf(name) !== -1) {
            return true;
        }

        return false;
    },
    isAssist3Formula(name) {
        if (_Assist3Formula.indexOf(name) !== -1) {
            return true;
        }

        return false;
    },
    isEmpower(name) {
        if (_EmpowerStorage.indexOf(name) !== -1) {
            return true;
        }

        return false;
    },

    isBUnable(name){
        if (_BUnable.indexOf(name) !== -1) {
            return true;
        }

        return false;
    },
    isMainTarget(name) {
        if (this.getMainFormulas().indexOf(name) !== -1) {
            return true;
        }

        return false;
    },

    isLoopTarget(name) {
        if (this.getLoopFormula().indexOf(name) !== -1) {
            return true;
        }

        return false;
    },
    getCurrentMainFormulaName() {
        return _SelectedMainFormula;
    },

    getCurrentAssistFormulaName() {
        return _SelectedAssistFormula;
    },

    getCurrentVice2FormulaName() {
        return _SelectedVice2Formula;
    },

    getCurrentEmpowerName() {
        return _SelectedEmpower;
    },

    selectFormula(name) {

        if (_MainFormulaStorage.indexOf(name) !== -1) {
            _SelectedMainFormula = name;
        }
        else if (_AssistFormulaStorage.indexOf(name) !== -1) {
            _SelectedAssistFormula = name;
        }
        else if (_EmpowerStorage.indexOf(name) !== -1) {
            _SelectedEmpower = name;
        }

    },

    selectVice2Formula(name) {

        if (_AssistFormulaStorage.indexOf(name) !== -1) {
            _SelectedVice2Formula = name;
        }
    },

    isSelected(name) {

        if (_SelectedMainFormula === name || _SelectedAssistFormula === name || _SelectedEmpower === name) {
            return true;
        }

        return false;

    },

    getSepcialFormulaIndexByName(name) {
        return _SpecialFormula.indexOf(name);
    },

    getPageHeaderHeight(statusBarHeightDP) {
        return Platform.OS == 'ios' ? 44 + statusBarHeightDP : 48 + statusBarHeightDP
    },

    getStartLineIndex() {
        return _startLineIndex;
    },

    setStartLineIndex(val) {
        _startLineIndex = val;
    },

    reset() {
        _SelectedMainFormula = '蓝粉彩带';
        _SelectedAssistFormula = '操盘提醒';
        _SelectedVice2Formula = '底部出击';
        _SelectedEmpower = '前复权';
    },

    isKeChuangStock(code) {
        return (code.indexOf("SH688") != -1)
    },

    getKlineLeftRightMargin() {
        return _klineLeftRightMargin
    },

    // 时间戳转时间格式
    getTime(tim, flag) {
        let date = new Date(tim * 1000);
        let year = date.getFullYear() + '-'
            + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
            + date.getDate() + ' ';
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        let time = h + m + s

        if (flag === 'year')
            return year
        else if (flag === 'time')
            return time
        else
            return year + time
    }
};
