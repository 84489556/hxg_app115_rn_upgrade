
import React, {PureComponent} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import ShareSetting from "../modules/ShareSetting";
import RATE from "../utils/fontRate";

class NoNetBar extends PureComponent {

    static defaultProps = {
    };

    constructor(props) {
        super(props);

    }

    render() {
        let netBreak = this.props.netConnected != undefined && !this.props.netConnected;
        if (!netBreak) {
            // 网络良好时 不返回
            return null;
        }
        return (
            <View style={{
                width: ShareSetting.getDeviceWidthDP(),
                height: 22,
                backgroundColor: "#FDF1F0",
            }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={() => {
                        //toast("点击")
                    }}>
                    <Text style={{
                        fontSize: RATE(24),
                        color: "#C72D27",
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                    }}>
                        网络断开，请检查网络设置>>
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

}

function mapStateToProps(state) {
    let connected = state && state.NetInfoReducer && state.NetInfoReducer.netConnected;
    return {
        netConnected: connected,
    };
}

export default connect(mapStateToProps, {})(NoNetBar);