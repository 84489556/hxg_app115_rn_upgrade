/*
 * @Author: lishuai 
 * @Date: 2019-10-18 14:41:27 
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-10-18 15:14:34
 * 该文件提供行情模块分时和k线所有指标对应的指标视频课数据
 */

import YdCloud from "../wilddog/Yd_cloud";

let IndexCoursePath = MainPathYG + 'ZhiBiaoXueTang';

let indexData = new Map();

/**
 * 获取该指标是否有视频课程
 * @param {string} name 指标名称
 */
export function has(name) {
    if (name===undefined || name===null) {
        return false;
    }
    // 去除字符串两头空格
    let n = name.replace(/^\s+|\s+$/g, "");
    if (!n.length) return false;
    return indexData.has(name);
}
/**
 * 返回该指标所对应的视频课程
 * @param {string} name 指标名称
 */
export function get(name) {
    let n = name.replace(/^\s+|\s+$/g, "");
    if (!n.length) return [];
    return indexData.get(name);
}

// 获取指标课堂数据
export function loadIndexCourseData() {
    getIndexData();
    // YdCloud().ref(IndexCoursePath).orderByKey().on('value', snap => {
    //     if (snap.code == 0) {
    //         getIndexData();
    //     }
    // });
}

function getIndexData() {
    YdCloud().ref(IndexCoursePath).orderByKey().get(snap => {
        if (snap.code == 0) {
            let values = Object.values(snap.nodeContent);
            let keys = Object.keys(snap.nodeContent);
            for (let i = 0; i < keys.length; i++) {
                const element = keys[i];
                indexData.set(element, Object.values(values[i]));
            }
        }
    });
}