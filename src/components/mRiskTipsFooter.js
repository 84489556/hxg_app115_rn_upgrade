/**
 * Author: Shi(bolan0000@icloud.com)
 * Date: 2019/1/18
 * Copyright (c) 2018, AoTang, Inc.
 *
 * Description:
 */

import React from "react";

import {  LoadingFooter, FooterStatus } from "react-native-spring-scrollview/LoadingFooter";
import {
    ActivityIndicator,
    Animated,
    View,
    StyleSheet,
    Text, Platform
} from "react-native";
import * as ScreenUtil from "../utils/ScreenUtil";

export class mRiskTipsFooter extends LoadingFooter {
    static height = 60;

    static style = "stickyContent";


    render() {
        const { maxHeight,offsetX,bottomOffset } = this.props;
        //console.log(offsetX)
        if (this.state.status === "allLoaded")
            return (
                <Animated.View style={[styles.container,{
                    transform: [
                        {
                            translateX: offsetX.interpolate({
                                inputRange: [bottomOffset - 1 + 45,
                                    bottomOffset + 45,
                                    bottomOffset + maxHeight,
                                    bottomOffset + maxHeight + 1],
                                outputRange: [bottomOffset - 1 + 45,
                                    bottomOffset + 45,
                                    bottomOffset + maxHeight,
                                    bottomOffset + maxHeight + 1]
                            })
                        }
                    ]

                }]}>
                    <Text style={styles.text}>{this.getTitle()}</Text>

                </Animated.View>
            );
        //  <View>
        //                         <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(274), backgroundColor: "#f3f0f3", alignItems: "center", justifyContent: "center" }}>
        //                             <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>风险提示：</Text>
        //                             <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>本产品基于公司的数据和算法生成，作为辅助投资决策工具，</Text>
        //                             <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>不构成投资建议，盈亏自负。</Text>
        //                             <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>产品信息仅供参考，投资有风险，入市需谨慎。</Text>
        //                             <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>联系我们：0311-66856698</Text>
        //                             <Text style={{fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",paddingVertical:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):0}}>投诉电话：0311-87100515</Text>
        //                         </View>
        //                     </View>

        // <Text style={styles.text}>{this.getTitle()}</Text>
        return (
            <Animated.View style={[styles.container,{
                transform: [
                    {
                        translateX: offsetX.interpolate({
                            inputRange: [bottomOffset - 1 + 45,
                                bottomOffset + 45,
                                bottomOffset + maxHeight,
                                bottomOffset + maxHeight + 1],
                            outputRange: [bottomOffset - 1 + 45,
                                bottomOffset + 45,
                                bottomOffset + maxHeight,
                                bottomOffset + maxHeight + 1]
                        })
                    }
                ]

            }]}>
                {this._renderIcon()}
                <View style={styles.rContainer}>
                    <Text style={styles.text}>{this.getTitle()}</Text>
                    {this.renderContent()}
                </View>
            </Animated.View>
        );
    }

    _renderIcon() {
        const s = this.state.status;
        if (s === "loading" || s === "cancelLoading" || s === "rebound") {
            return <ActivityIndicator color={"gray"}/>;
        }
        const { maxHeight, offset, bottomOffset } = this.props;
        return (
            <Animated.Image
                source={require("../images/hits/arrow.png")}
                style={{
                    transform: [
                        {
                            rotate: offset.interpolate({
                                inputRange: [
                                    bottomOffset - 1 + 45,
                                    bottomOffset + 45,
                                    bottomOffset + maxHeight,
                                    bottomOffset + maxHeight + 1
                                ],
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
        if (s === "dragging" || s === "waiting") {
            return "上拉加载更多";
        } else if (s === "draggingEnough") {
            return "松开加载";
        } else if (s === "loading") {
            return "正在加载...";
        } else if (s === "draggingCancel") {
            return "取消加载";
        } else if (s === "rebound") {
            return "加载完成";
        } else if (s === "allLoaded") {
            return "";
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
       // marginLeft: 20
    },
    text: {
        marginVertical: 5,
        fontSize: ScreenUtil.setSpText(26),
        color: "#666",
        textAlign: "center",
        marginLeft:ScreenUtil.scaleSizeW(20),
    }
});
