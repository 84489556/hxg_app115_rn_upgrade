/*
*
* 处理推送过来的数据，分解跳转逻辑
*
* */
'use strict';
import {Platform,DeviceEventEmitter,Alert} from 'react-native';
import { sensorsDataClickObject, sensorsDataClickActionName } from '../components/SensorsDataTool';
export default function processMiPush(data,navigation) {
    // Alert.alert(data);

    let pushData =JSON.parse(data);
    let pushPageName = ''
    if(currRoute == "CourseDetailPage"||currRoute == "LiveRoom"){
        DeviceEventEmitter.emit('pasueListener');
    }

    if(pushData.type == "公告"){
        pushPageName = 'GongGaoDetail'
        Navigation.pushForParams(navigation, 'GongGaoDetail', {
            wilddogPath: pushData.id,
        })
    }else if(pushData.type == "热点聚焦"){
        pushPageName = 'HotFocusDetailPage'
        Navigation.pushForParams(navigation, 'HotFocusDetailPage', {
            id: pushData.id,
        })
    }else if(pushData.module == "单点登录"){

    }
    sensorsDataClickObject.pushShow.push_title = pushData.title
    sensorsDataClickObject.pushShow.push_content = pushData.content
    sensorsDataClickObject.pushShow.push_type = '应用外'
    sensorsDataClickObject.pushShow.link_url = pushPageName
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.pushShow)
    // {"module": "公开课","key": "1542618030825"}
}