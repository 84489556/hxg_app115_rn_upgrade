/**
 * Created by tangqianzhu on 19/8/2.
 * 屏幕工具类
 * ui设计基准
 * width:750
 * height:1334
 */
import React from 'react';
import { PixelRatio, StatusBar, Platform, Text, Dimensions } from 'react-native';
import * as baseStyle from "../components/baseStyle";

//屏幕的宽高
export const screenW = Dimensions.get('window').width;
export const screenH = Dimensions.get('window').height;


//export const andStatusH = Platform.OS==='android'? StatusBar.currentHeight: ( this.isIphoneX ? 44:20);
//状态了栏高度,适配Android和ios
export const statusH = Platform.OS === 'android' ? StatusBar.currentHeight : (baseStyle.isIPhoneX ? 44 : 20);

let fontScale = PixelRatio.getFontScale();
let pixelRatio = PixelRatio.get();
// 高保真的宽度和告诉
const designWidth = 750.0;
const designHeight = 1334.0;

// 根据dp获取屏幕的px
let screenPxW = PixelRatio.getPixelSizeForLayoutSize(screenW);
let screenPxH = PixelRatio.getPixelSizeForLayoutSize(screenH);

export let isIphoneX = () => {
    if (Platform.OS === 'ios' && Dimensions.get('window').height === 812) {
        return true;
    }
    return false;
};
// utils.js
// One Plus Fix for Oxygen OS and its painful Slate font truncating on bold text
// https://github.com/facebook/react-native/issues/15114
//修复一加手机字体显示不全的问题，是因为一加手机系统字体的原因
export const opoFontFix = () => {
    if (Platform.OS !== 'android') {
        return
    }

    const oldRender = Text.render;
    Text.render = function (...args) {
        const origin = oldRender.call(this, ...args);
        return React.cloneElement(origin, {
            style: [{ fontFamily: 'Roboto' }, origin.props.style]
        })
    }
};

//储存一个全局的渠道号,为了同步去取，Android独有
export let channelId = "";
//储存一个全局的系统版本,为了同步去取 Android独有
export let OS = "";

//储存一个全局的ip地址,为了同步去取
export let ipAdress = "";

// 多头启动活动时间 1: 未开始   2: 进行中   3: 已结束
export let duoTouQiDongStatus = 1;
// 多头启动活动名称
export let duoTouQiDongName = '';
// 多头启动活动id
export let duoTouQiDongId = 0;
/**
 * 设置text
 * @param size  px
 * @returns {Number} dp
 */
export function setSpText(size: Number) {
    // let scaleWidth = screenW / designWidth;
    // let scaleHeight = screenH / designHeight;
    // let scale = Math.min(scaleWidth, scaleHeight);
    // size = Math.round(size * scale / fontScale + 0.5);
    //之前是想适配字体，但是适配后的字体在修改了系统字体后会缩小，所以还是直接使用原来的单位，像素大小除以2
    //return size % 2 === 0 ? size / 2 : (size + 1) / 2;

    //20200806修改字体适配和宽度适配一样
    let scaleWidth = size * screenPxW / designWidth;
    size = Math.round((scaleWidth / pixelRatio + 0.5));
    return size;

}

/**
 * 设置宽度
 * @param size  px
 * @returns {Number} dp
 */
export function scaleSizeW(size: Number) {
    let scaleWidth = size * screenPxW / designWidth;
    size = Math.round((scaleWidth / pixelRatio + 0.5));
    return size;
}

/**
 * 设置高度
 * @param size  px
 * @returns {Number} dp
 */
export function scaleSizeH(size: Number) {
    let scaleHeight = size * screenPxH / designHeight;
    size = Math.round((scaleHeight / pixelRatio + 0.5));
    return size;
}
