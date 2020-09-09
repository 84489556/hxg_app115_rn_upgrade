/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2020/8/21 17
 * description:温馨提示
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    ImageBackground,
    StatusBar,
    InteractionManager, StyleSheet
} from 'react-native';
import * as ScreenUtil from "../utils/ScreenUtil";

const textContent = [
    '温馨提示：信息内容仅供参考,不构成操作决策依据，股市有风险，投资需谨慎。',
    '温馨提示：数据来源于同花顺，信息内容仅供参考，不构成操作决策依据。股市有风险，投资需谨慎。'
];

export default class RiskTipsFooterView extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {

            textContent: this.getText(this.props.type)

        }
    }
    /**
     * 获取温馨提示文字
     * */
    getText(types) {
        switch (types) {
            case 0:
                return textContent[types];
                break;
            case 1:
                return textContent[types];
                break;
            default:
                return textContent[0];
                break;
        }
    }

    /**
     * 页面将要加载
     * */
    componentWillMount() { }

    /**
     * 页面加载完成
     * */
    componentDidMount() {


    }

    render() {
        return (
            <View style={{ width: ScreenUtil.screenW, paddingVertical: ScreenUtil.scaleSizeW(30), paddingHorizontal: ScreenUtil.scaleSizeW(20), backgroundColor: "#f1f1f1", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(0,0,0,0.2)", paddingVertical: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(3) : 0, textAlign: "center" }}
                >{this.state.textContent}</Text>
            </View>
        )
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
