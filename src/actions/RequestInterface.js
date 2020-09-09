/**
 * Created by cuiwenjuan on 2019/7/1.
 */
import { Utils } from '../utils/CommonUtils';
import * as cyURL from './CYCommonUrl';

export default {

    HXG_BASE_URL: cyURL.urlHXG,//慧选股跟地址
    XG_MODULE_URL: cyURL.urlHXG_xg,//选股模块跟地址


    /**
     * 慧选股接口基类方法
     * @param path 按照接口文档给出的path
     * @param params 格式按照接口文档写成json格式：{'pageNum':1,'pageSize':30}
     * @param successCallback
     * @param failCallback
     */
    baseGet(baseUrl, path, params, successCallback, failCallback) {

        let urlS = baseUrl + path;

        let paramString = undefined;
        for (let messageKey in params) {
            let valueString = params[messageKey];
            if (paramString) {
                paramString = paramString + '&' + messageKey + '=' + valueString;
            } else {
                paramString = '?' + messageKey + '=' + valueString;
            }
        }

        if (paramString) {
            urlS = urlS + paramString;
        }

        // console.log('慧选股接口 response ', urlS);
        Utils.get(urlS, (response) => {
            if (response.state) {
                // console.log('慧选股接口 response ',response.data);
                successCallback && successCallback(response.data);
            } else {
                if (response.msg) {
                    // console.log('慧选股接口 response msg ' + response.msg);
                    failCallback && failCallback(response.msg);
                } else {
                    // console.log('慧选股接口 response error ' ,response);
                    failCallback && failCallback(response.message);
                }
            }
        }, (error) => {
            // console.log('慧选股接口 error ' + error);
            failCallback && failCallback('其他错误');
        })

    },

    /**
     * 慧选股接口基类方法
     * @param path 按照接口文档给出的path
     * @param params 格式按照接口文档写成json格式：{'pageNum':1,'pageSize':30}
     * @param successCallback
     * @param failCallback
     */
    basePost(baseUrl, path, params, successCallback, failCallback) {

        // let urlS = baseUrl + path;
        // let param = params;

        let param = [];
        let urlS = baseUrl + path;

        let paramString = undefined;
        for (let messageKey in params) {
            let valueString = params[messageKey];
            if (paramString) {
                paramString = paramString + '&' + messageKey + '=' + valueString;
            } else {
                paramString = '?' + messageKey + '=' + valueString;
            }
        }

        if (paramString) {
            urlS = urlS + paramString;
        }

        // console.log('慧选股接口 response ', urlS);

        Utils.post(urlS, param,
            (response) => {
                //console.log('慧选股接口 post response8***）*）（&*）……&*（……（*…… ',response);
                if (response.state) {
                    // console.log('慧选股接口 post response ',response.data);
                    successCallback && successCallback(response.data);
                } else {
                    if (response.msg) {
                        // console.log('慧选股接口 post response msg ' + response.msg);
                        failCallback && failCallback(response.msg);
                    } else {
                        // console.log('慧选股接口  post response error ' ,response);
                        failCallback && failCallback(response.message);
                    }
                }
            },
            (error) => {
                // console.log('慧选股接口 post error ' + error);
                failCallback && failCallback('其他错误');
            })
    }

}