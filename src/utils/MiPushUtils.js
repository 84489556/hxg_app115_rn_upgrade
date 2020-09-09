/*
 *
 * ios&android设置小米推送的初始化，设置标签，别名，account
 *
 * */
'use strict';
import React, {Component} from "react";
import {Platform,NativeModules} from "react-native";
export default{

    /**
     * 财源股票： 小米推送注册
     * @param null
     *
     */
    register(){
        if(Platform.OS == "ios"){
           NativeModules.MIPushModule.registerMiPush();

        }else{
            NativeModules.RegisterMiPush.register();
        }
    },
    /**
     * 财源股票： 小米推送反注册
     * @param null
     *
     */
    unRegister(){
        if(Platform.OS == "ios"){
            NativeModules.MIPushModule.unregisterMiPush();
        }else{
            NativeModules.RegisterMiPush.unRegister();
        }
    },

    /**
     * 财源股票： 小米推送设置别名
     * @param alias
     *
     */
    setAlias(alias){
        if(Platform.OS == "ios"){
            NativeModules.MIPushModule.setAlias(alias);

        }else{
            NativeModules.RegisterMiPush.setAlias(alias);
        }
    },

    /**
     * 财源股票： 小米推送取消设置别名
     * @param alias
     *
     */
    unAlias(alias){
        if(Platform.OS == "ios"){
            NativeModules.MIPushModule.unAlias(alias);
        }else{
            NativeModules.RegisterMiPush.unAlias(alias);
        }
    },

    /**
     * 财源股票： 小米推送设置account
     * @param account
     *
     */
    setAccount(account){
        if(Platform.OS == "ios"){
            NativeModules.MIPushModule.setAccount(account);
        }else{
            NativeModules.RegisterMiPush.setAccount(account);
        }
    },

    /**
     * 财源股票： 小米推送取消设置account
     * @param account
     *
     */
    unAccount(account){
        if(Platform.OS == "ios"){
            NativeModules.MIPushModule.unAccount(account);
        }else{
            NativeModules.RegisterMiPush.unAccount(account);
        }
    },

    /**
     * 财源股票： 小米推送设置标签
     * @param topic
     *
     */
    setSubscribe(topic){
        if(Platform.OS == "ios"){
            NativeModules.MIPushModule.subscribe(topic);
        }else{
            NativeModules.RegisterMiPush.setSubscribe(topic);
        }
    },

    /**
     * 财源股票： 小米推送取消设置标签
     * @param topic
     *
     */
    unSubscribe(topic){
        if(Platform.OS == "ios"){
            NativeModules.MIPushModule.unsubscribe(topic);

        }else{
            NativeModules.RegisterMiPush.unSubscribe(topic);
        }
    },
    /**
     * 财源股票： 小米推送获取regID
     * @param topic
     *
     */
    getRegId(){
        if(Platform.OS == "ios"){

             return NativeModules.MIPushModule.getRegId();

            //    return
            // NativeModules.MIPushModule.getRegId();

        }else{
            //console.log('xiaomipush RegId='+NativeModules.RegisterMiPush.getRegId())
            return NativeModules.RegisterMiPush.getRegId();

        }
    }

}