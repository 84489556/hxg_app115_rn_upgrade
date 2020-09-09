/**
 * 用于显示股票格式化数据Text组件
 */
'use strict'

import React, { Component } from 'react';
import { Text } from 'react-native';

const DEFAULT_VALUE = '--';

export default class StockFormatText extends Component {

    /**
     * 格式化文本，将输入的数字参数格式化为指定精度的字符串
     * @param {!number|string|null} data      需要格式化的数字，可以是数字，字符串或者null对象
     * @param {?number} precision             保留小数精度，null则默认取2位小数
     * @param {?''|'K'|'M'|'K/M'|'%'} unit    单位，按自定的单位格式化数据，null则为''为不加单位
     * @param {boolean|string=} useDefault    是否使用默认值，默认显示--，字符串类型表示需要显示的默认值
     * @returns {string}
     */
    static formatNumber(data, precision, unit, useDefault) {

        if (data == null) {
            data = 0;
        }

        let n = Number(data);
        if ((/*n == 0 || */isNaN(n)) && useDefault !== false) {
            return useDefault || DEFAULT_VALUE;
        }

        let isNegative = false;
        unit = unit || '';
        precision = precision != null ? precision : 2;

        if (unit === 'K/M') {
            if (n >= 10 * 1000 * 1000) {
                unit = 'M';
            } else if (n >= 10 * 1000) {
                unit = 'K';
            } else {
                unit = '';
            }
        }

        else if (unit === '万/亿') {
            isNegative = n < 0;
            n = Math.abs(n);
            if (n >= 10000 * 10000) {
                unit = '亿';
            } else if (n >= 10000) {
                unit = '万';
            } else {
                unit = '';
            }
        }
        else if (unit === '万手/亿手') {
            if (n >= 10000 * 10000) {
                unit = '亿手';
            } else if (n >= 10000) {
                unit = '万手';
            } else {
                unit = '';
            }
        }//新加
        else if (unit === '手/万手/亿手') {
            if (n >= 10000 * 10000) {
                unit = '亿手';
            } else if (n >= 10000) {
                unit = '万手';
            } else {
                unit = '手';
            }
        }
        else if (unit === '股/万股/亿股') {
            isNegative = n < 0;
            n = Math.abs(n);
            if (n >= 10000 * 10000) {
                unit = '亿股';
            } else if (n >= 10000) {
                unit = '万股';
            } else {
                unit = '股';
            }
        }
        else if (unit === '元/万/亿') {
            isNegative = n < 0;
            n = Math.abs(n);
            if (n >= 10000 * 10000) {
                unit = '亿';
            } else if (n >= 10000) {
                unit = '万';
            } else {
                unit = '元';
            }
        } else if (unit === '次/万/亿') {
            if (n >= 10000 * 10000) {
                unit = '亿';
            } else if (n >= 10000) {
                unit = '万';
            } else {
                unit = '次';
            }
        }

        switch (unit) {
            case '%': n = n * 100; break;
            case 'K': n = n / 1000; break;
            case 'M': n = n / (1000 * 1000); break;
            case 100: n = n / 100; unit = ''; break;
            case '万': { n = n / 10000; n >= 1000 ? precision = 2 : null; }; break;
            case '亿': { n = n / (10000 * 10000); n >= 1000 ? precision = 2 : null }; break;
            case '万手': n = n / 10000; break;
            case '亿手': n = n / (10000 * 10000); break;
            //新加
            case '元': { precision = 0 } break;
            case '次': { precision = 0; unit = ''; } break;
            case '手': { precision = 0 } break;
            case '股': { precision = 0 } break;
            case '万股': n = n / 10000; break;
            case '亿股': n = n / (10000 * 10000); break;
        }
        return (isNegative ? '-' : '') + n.toFixed(precision) + unit;
    }

    formatText(name) {
        let { children, data, precision, unit, useDefault, sign } = this.props;
        let text, suffix = '';

        if (children === undefined) {
            return DEFAULT_VALUE
        }

        if (data === undefined) data = children;
        else suffix = children || '';

        // 字符串直接返回，非字符串则格式化为数字文本
        if (typeof data === 'string') {
            return data;
        }
        else if (name === "ZuiXinJia" && (data === undefined || 0 === data)) {
            return DEFAULT_VALUE;
        }
        else {
            text = StockFormatText.formatNumber(data, precision, unit, useDefault);
            sign === true && data > 0 && (text = '+' + text);
            return (text !== DEFAULT_VALUE) ? text + suffix : text;
        }
    }

    render() {
        return <Text style={this.props.style} numberOfLines={1}>{this.formatText(this.props.titlename)}</Text>;
    }
}
