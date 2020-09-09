import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Platform,
    Image,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import RATE from '../utils/fontRate.js';
import * as baseStyle from '../components/baseStyle.js';
import ShareSetting from '../modules/ShareSetting';
import { has } from '../utils/IndexCourseHelper';

const screenHeight = Dimensions.get('window').height;
const loopArray = ShareSetting.getLoopFormula();
const mainArray = ShareSetting.getMainFormulas();
const specialArray = ShareSetting.getSpecialFormulas();

export default class LandHeader extends Component {
    static propTypes = {
        items: PropTypes.arrayOf(
            PropTypes.shape({
                str: PropTypes.string.isRequired,
                color: PropTypes.string
            })
        ).isRequired,
        index: PropTypes.number,
        style: PropTypes.object,
        toPlayVideo: PropTypes.func,
        showSider: PropTypes.bool,
        containerStyle: PropTypes.object
    };
    static defaultProps = {
        items: [],
        index: 0,
        toPlayVideo: () => { }
    };

    constructor(props) {
        super(props);
    }

    render() {
        let chartName;
        return (
            <View
                style={[
                    {
                        flexDirection: 'row',
                        height: 30,
                        // borderColor: baseStyle.LINE_BG_F1,
                        // borderBottomWidth: 0.5,
                        // borderTopWidth: this.props.index > 0 ? 0 : 1,
                        alignItems: 'center',
                        width: baseStyle.isIPhoneX
                            ? screenHeight - 15 - 15 - 10 - 30
                            : screenHeight - 15 - 15
                    },
                    this.props.style,
                    this.props.containerStyle
                ]}
            >
                {this.props.items.map((item, index) => {
                    if (this.props.index > 0) {
                    } else {
                        return (
                            <Text key = {index}
                                style={{
                                    color: item.color || baseStyle.BLACK_70,
                                    fontSize: RATE(20),
                                    marginRight: 10
                                }}
                            >
                                {item ? item.str : '--'}
                            </Text>
                        );
                    }
                })}
                {this.props.items.map((item, index) => {
                    if (this.props.index > 0) {
                        return has(item.str) ? (
                            // return specialArray.indexOf(item.str) !== -1 && this.props.items.length > 0 ? (
                            <View key = {index}
                                style={{
                                    position: 'absolute',
                                    right: this.props.showSider
                                        ? baseStyle.isIPhoneX
                                            ? 78 + 35 + 35
                                            : 78 + 15 + 8
                                        : baseStyle.isIPhoneX
                                            ? 44 + 5
                                            : 20 + 5,
                                    height: 30,
                                    width: 49,
                                    flexDirection: 'row'
                                }}
                            >
                                <Image
                                    // resizeMode={'contain'}
                                    style={{
                                        marginTop: 2,
                                        height: 25,
                                        width: 3
                                    }}
                                    source={require('../images/icons/line_h.png')}
                                />
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        marginLeft: 3,
                                        alignItems: 'center',
                                        flexDirection: 'row'
                                    }}
                                    onPress={this.props.toPlayVideo}
                                >
                                    <Image
                                        style={{
                                            marginLeft: 5,
                                            marginRight: 5,
                                            height: 17,
                                            width: 16
                                        }}
                                        source={require('../images/icons/zhibiao_bofang.png')}
                                    />
                                    <Text
                                        style={{
                                            color: '#006ACC',
                                            fontSize: RATE(20)
                                        }}
                                    >
                                        学指标
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null;
                    } else {
                        return null;
                    }
                })}
            </View>
        );
    }
}
