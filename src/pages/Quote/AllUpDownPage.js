import React from "react";
import {
    DeviceEventEmitter,
    Text,
    View,
    StyleSheet
} from "react-native";
import UpDownList from "./UpDownList.js";
import * as baseStyle from "../../components/baseStyle.js";
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import ShareSetting from "../../modules/ShareSetting.js";
import UpDownButton from "../../components/UpDownButton";
import RATE from "../../utils/fontRate";

export default class AllUpDownPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        // 初始空数据
        this.state = {
            title: this.props.navigation.state.params.title,
        };
    }

    changeList() {
        if (this.state.title === ShareSetting.getZhangFuBangTitle()) {
            this.setState({ title: ShareSetting.getDieFuBangTitle() });
        } else {
            this.setState({ title: ShareSetting.getZhangFuBangTitle() });
        }
    }

    render() {
        let b = false;
        if (this.state.title === ShareSetting.getZhangFuBangTitle()) {
            b = true;
        }

        return (
            <BaseComponentPage style={{ flex: 1, backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR }}>
                <NavigationTitleView
                    onBack={() => {
                        Navigation.pop(this.props.navigation)
                    }}
                    titleText={this.state.title} />
                <View style={Styles.titleStyle}>
                    <Text style={{ flex: 1, color: baseStyle.BLACK_70, fontSize: RATE(24), textAlign: 'left', width: 150 }}>名称</Text>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <UpDownButton onPress={this.changeList.bind(this)} desc={!b} containerStyle={{ flex: 1, height: 25 }} />
                    </View>
                    <Text style={{ flex: 1, color: baseStyle.BLACK_70, fontSize: RATE(24), textAlign: 'right', width: 130 }}>现价</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR }}>
                    <UpDownList title={this.state.title} isAll={true} params={{ field: "ZhangFu", desc: b }} navigation={this.props.navigation} />
                </View>
            </BaseComponentPage>
        );
    }
}

const Styles = StyleSheet.create({
    titleStyle: {
        backgroundColor: baseStyle.LIGHTEN_GRAY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 35,
        paddingLeft: 12,
        paddingRight: 12
    }
})