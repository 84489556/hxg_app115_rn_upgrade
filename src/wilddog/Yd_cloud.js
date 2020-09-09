/**
 * 源达云
 */
'use strict';
import ydWilddog from './yd_wilddog';

// 配置信息
let config_ydtg = {
    username: 'abc',
    password: 123,
    ip: 'yun.ydtg.com.cn',
    token: 'sgdsgdsikhuewikdnjlkgh'
};


let initSync =  false ;
let sync = null;

export default function initYd_cloud(moduleName) {
    if(initSync === false){
        // 初始化 App
        let app = ydWilddog.initializeApp(config_ydtg, moduleName);
        // 创建 Sync 对象
        sync = app.sync();
        initSync = true;
    }
    return sync;
}
