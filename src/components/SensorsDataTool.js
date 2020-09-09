/*
 * @Author: yangyin
 * @Date: 2020-07-02 09:33:01
 * @Description: 神策数据统计的工具类
 */
import { NativeModules, Platform } from 'react-native';
import UserInfoUtil, * as modelType from '../utils/UserInfoUtil'
import AsyncStorage from '@react-native-community/async-storage';

const RNSensorsAnalyticsModule = NativeModules.RNSensorsAnalyticsModule;

// actionName 事件名称  params 上传数据  resetParams 是否重置上传的数据
export function sensorsDataClickAction(actionName = '', params, resetParams = true) {

    AsyncStorage.getItem('FristInstallApp', (res) => {
        if (!res || res == undefined) {
            AsyncStorage.setItem('FristInstallApp', '1');
            RNSensorsAnalyticsModule.trackInstallation("AppInstall", {})
        }
    })
    if (params == undefined || params == '') {
        params = sensorsDataClickObject[actionName]
    }

    params.app_name = '慧选股'
    params.platform_type = Platform.OS == 'ios' ? 'iOS' : 'Android'
    params.permission = UserInfoUtil.getUserPermissions().toString()
    let newParams = Object.assign({}, params)//创建这个对象的原因是因为某些情况下在用到这个全局对象的某个对象时同时在修改就会报错
    ylog('埋点的模块===>>>', actionName, '\n参数===>>>', JSON.stringify(newParams));
    // ylog('=传值前=======>>>>>>',params);
    // ylog('=传值前=======>>>>>>',sensorsDataClickObject[actionName]);
    if (actionName == 'loginButtonClick' || actionName == 'registerSuccess' || actionName == 'loginSuccess') {
        RNSensorsAnalyticsModule.trackChannelEvent(actionName, newParams)
    } else {
        RNSensorsAnalyticsModule.track(actionName, newParams)
    }
    if (actionName == 'loginSuccess' || actionName == 'registerSuccess') {
        RNSensorsAnalyticsModule.login(UserInfoUtil.getUserId())
    }

    if (resetParams) {
        // 重置记录上传参数的对象
        let object = sensorsDataClickObject[actionName]
        let newObject = {} //创建这个对象的原因是因为 在下面循环中 object[key] = '' 有时会报对象是一个不可变对象的错
        if (object) {
            for (let key in object) {
                if (object.hasOwnProperty(key)) {
                    if (key == 'is_success' || key == 'login_is_first' || key == 'quick_Login' || key == 'has_result' || key == 'is_finish') {
                        newObject[key] = false
                    } else if (key == 'search_result_num' || key == 'keyword_number' || key == 'play_duration' || key == 'position_number') {
                        newObject[key] = 0
                    } else {
                        newObject[key] = ''
                    }
                }
            }
            sensorsDataClickObject[actionName] = newObject
            // ylog('==处理后======>>>>>>',actionName,newParams,newObject,sensorsDataClickObject[actionName]);
        }
    }
}

// 埋点事件名称
export let sensorsDataClickActionName = {
    loginButtonClick: 'loginButtonClick',
    getCode: 'getCode',
    getCodeResult: 'getCodeResult',
    registerSuccess: 'registerSuccess',
    enterWechatAuthorize: 'enterWechatAuthorize',
    wechatAuthorizeResult: 'wechatAuthorizeResult',
    bandPhoneNumber: 'bandPhoneNumber',
    loginSuccess: 'loginSuccess',
    searchClick: 'searchClick',
    sendSearchRequest: 'sendSearchRequest',
    searchResult: 'searchResult',
    clickSearchResult: 'clickSearchResult',
    shareClick: 'shareClick',
    shareMethod: 'shareMethod',
    videoPlay: 'videoPlay',
    pushShow: 'pushShow',
    adClick: 'adClick',
    adModule: 'adModule',
    adLabel: 'adLabel',
    addOnClick: 'addOnClick',
    page_view: 'page_view',
    choiceCondition: 'choiceCondition',
    adAchievements: 'adAchievements',
    addIndex: 'addIndex',
    adCIndex: 'adCIndex',
    openProduct: 'openProduct',
    addStock: 'addStock',
    adKClick: 'adKClick',
    homepageClick: 'homepageClick',
    agreePoint: 'agreePoint',
    download: 'download',
    stockPageview: 'stockPageview',

}

// 埋点传参
export let sensorsDataClickObject = {
    loginButtonClick: {
        entrance: '',
    },
    getCode: {
        entrance: '',
        service_type: '',
    },
    getCodeResult: {
        service_type: '',
        is_success: false,
        fail_reason: ''
    },
    registerSuccess: {
        regist_method: '',
        is_success: false,
        fail_reason: ''
    },
    enterWechatAuthorize: {},
    wechatAuthorizeResult: {
        is_success: false,
        fail_reason: ''
    },
    bandPhoneNumber: {
        is_success: false,
        fail_reason: ''
    },
    loginSuccess: {
        login_is_first: false,
        login_method: '',
        quick_Login: false,
        is_success: false,
        fail_reason: ''
    },
    searchClick: {
        entrance: ''
    },
    sendSearchRequest: {
        entrance: '',
        keyword: '',
        keyword_type: ''
    },
    searchResult: {
        keyword: '',
        has_result: false,
        search_result_num: 0,
        keyword_type: ''
    },
    clickSearchResult: {
        keyword: '',
        search_result_num: 0,
        keyword_type: '',
        label_name: '',
        keyword_number: 0
    },
    shareClick: {
        content_name: '',
        content_show_type: '',
        publish_time: '',
        content_source: ''
    },
    shareMethod: {
        content_name: '',
        content_show_type: '',
        publish_time: '',
        share_method: ''
    },
    videoPlay: {
        entrance: '',
        class_name: '',
        class_type: '',
        class_series: '',
        publish_time: '',
        video_evaluation: '',
        watch_num: '',
        video_time: '',
        video_type: '',
        is_finish: false,
        play_duration: 0,
    },
    pushShow: {
        push_title: '',
        push_content: '',
        push_type: '',
        link_url: ''
    },
    addOnClick: {
        page_source: '',
        content_name: '',
    },
    adModule: {
        entrance: '',
        module_type: '',
        module_name: '',
    },
    adLabel: {
        module_source: '',
        first_label: '',
        second_label: '',
        third_label: '',
        label_level: 0,
        label_name: '',
        page_source: '',
        is_pay: ''
    },
    adClick: {
        ad_title: '',
        ad_position: '',
        ad_type: '',
        page_source: '',
        position_number: 0

    },
    page_view: {
        page_name: '',
        entrance: '',
        page_url: '',
        page_duration: ''
    },
    choiceCondition: {
        module_source: '',
        condition_type: '',
        page_source: '',
        condition_content: ''
    },
    adAchievements: {
        module_source: '',
        page_source: '',
    },
    addIndex: {
        index_type: '',
        index_name: '',
        entrance: ''
    },
    adCIndex: {
        main_name: '',
        main_type: '',
        futu1_name: '',
        futu1_type: '',
        futu2_name: '',
        futu2_type: '',
        combine_results: ''
    },
    openProduct: {
        open_product: '',
        open_time: '',
        open_is_first: ''
    },
    addStock: {
        stock_code: '',
        stock_name: '',
        page_source: ''
    },
    adKClick: {
        stock_code: '',
        function_zone: '',
        content_name: '',
        page_source: ''
    },
    homepageClick: {
        page_source: '',
        content_name: ''
    },
    agreePoint: {
        content_show_type: '',
        agree_content: '',
        publish_time: ''
    },
    download: {
        utm_source: ''
    },
    stockPageview: {
        stock_code: '',
        stock_name: '',
        type: ''
    }











}





