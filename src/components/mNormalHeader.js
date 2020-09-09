/**
 * Author: Shi(bolan0000@icloud.com)
 * Date: 2019/1/18
 * Copyright (c) 2018, AoTang, Inc.
 *
 * Description:
 */

import React from "react";
import {  RefreshHeader, HeaderStatus } from "react-native-spring-scrollview/RefreshHeader";
import {
    ActivityIndicator,
    Animated,
    View,
    StyleSheet,
    Text
} from "react-native";

import * as ScreenUtil from "../utils/ScreenUtil";

export class mNormalHeader extends RefreshHeader {
    static height = 60;
    static style = "stickyContent";
    render() {

        const { maxHeight,offsetX } = this.props;
        return (
            <Animated.View style={[styles.container,{
                transform: [
                    {
                        translateX: offsetX.interpolate({
                            inputRange: [-maxHeight - 1 - 10, -maxHeight - 10, -50, -49],
                            outputRange: [-maxHeight - 1 - 10, -maxHeight - 10, -50, -49]
                        })
                    }
                ]
            }]}>
                {this._renderIcon()}
                <View style={styles.rContainer}>
                    <Text style={styles.text}>
                        {this.getTitle()}
                    </Text>
                    {this.renderContent()}
                </View>
            </Animated.View>
        );
    }

    _renderIcon() {
        const s = this.state.status;
        if (s === "refreshing" || s === "rebound") {
            return <ActivityIndicator color={"gray"}/>;
        }
        const { maxHeight, offset } = this.props;
        return (
            <Animated.Image
                source={require("../images/hits/arrow.png")}
                style={{
                    transform: [
                        {
                            rotate: offset.interpolate({
                                inputRange: [-maxHeight - 1 - 10, -maxHeight - 10, -50, -49],
                                outputRange: ["180deg", "180deg", "0deg", "0deg"]
                            })
                        }
                    ]
                }}
            />
        );
    }

    renderContent(){
        return null;
    }

    getTitle() {
        const s = this.state.status;
        if (s === "pulling" || s === "waiting") {
            return "下拉刷新";
        } else if (s === "pullingEnough") {
            return "松开刷新    ";
        } else if (s === "refreshing") {
            return "正在加载...";
        } else if (s === "pullingCancel") {
            return "取消刷新";
        } else if (s === "rebound") {
            return "刷新完成";
        }
    }
}

const styles = StyleSheet.create({
    container: {
        width:ScreenUtil.screenW,
        height:60,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor:"#f6f6f6"
    },
    rContainer: {
        //marginLeft: 8
    },
    text: {
        marginVertical: 5,
        marginLeft:ScreenUtil.scaleSizeW(20),
        fontSize: ScreenUtil.setSpText(26),
        color: "#666",
        textAlign: "center",
    }
});