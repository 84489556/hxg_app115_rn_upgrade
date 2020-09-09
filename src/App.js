/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, NativeModules, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Provider } from 'react-redux'
import store from './Store'
import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistStore, persistReducer } from 'redux-persist'
import PageNavigator from './PageNavigator'
import './config.js';
import './log';
const persistor = persistStore(store)

import { opoFontFix } from './utils/ScreenUtil'
import * as ScreenUtil from './utils/ScreenUtil'
import DeviceInfo from "react-native-device-info";
import { sensorsDataClickObject, sensorsDataClickActionName } from './components/SensorsDataTool';
const UmengAnalyticsModel = require('react-native').NativeModules.UmengAnalytics;
// One Plus Fix for Oxygen OS
opoFontFix();

TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, { allowFontScaling: false });
Text.defaultProps = Object.assign({}, Text.defaultProps, { allowFontScaling: false });

type Props = {};

export default class App extends Component<Props> {
    componentDidMount() {

        if (Platform.OS == "android") {
            setTimeout(() => {
                NativeModules.YD_SplashScreenModule.hidden();
            }, 2000);
            //每次开机直接去取Android的渠道号和系统版本号
            UmengAnalyticsModel.getChannelId().then(
                (channelID) => {
                    // console.log("渠道的渠道号",channelID)
                    ScreenUtil.channelId = channelID;
                    AsyncStorage.getItem('HasUpLoadChannelID', (res) => {
                        if (!res || res == undefined) {
                            AsyncStorage.setItem('HasUpLoadChannelID', '1');
                            sensorsDataClickObject.download.utm_source = channelID
                            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.download)
                        }
                    })
                }
            ).catch(() => {

            });
            //每次开机直接去取Android的渠道号和系统版本号
            UmengAnalyticsModel.getOS().then(
                (OS) => {
                    // console.log("系统版本号",OS)
                    ScreenUtil.OS = OS;
                }
            ).catch(() => {

            });
        } else {
            AsyncStorage.getItem('HasUpLoadChannelID', (res) => {
                if (!res || res == undefined) {
                    AsyncStorage.setItem('HasUpLoadChannelID', '1');
                    sensorsDataClickObject.download.utm_source = "App Store"
                    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.download)
                }
            })
        }
        DeviceInfo.getIpAddress().then((ipAdress) => {
            ScreenUtil.ipAdress = ipAdress;
        })
    }

    render() {
        return (
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <PageNavigator />
                </PersistGate>
            </Provider>
        );
    }
}
