import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import * as baseStyle from '../../components/baseStyle.js';
import RATE from '../../utils/fontRate.js';
import { has } from '../../utils/IndexCourseHelper';

export default class ChartHeader extends Component {
    static propTypes = {
        items: PropTypes.arrayOf(
            PropTypes.shape({
                str: PropTypes.string.isRequired,
                color: PropTypes.string
            })
        ).isRequired,
        index: PropTypes.number,
        choseNormPage: PropTypes.func,
        toPlayVideo: PropTypes.func,
        style: PropTypes.object,
        containerStyle: PropTypes.object
    };
    static defaultProps = {
        items: [],
        index: 0,
        choseNormPage: () => { },
        toPlayVideo: () => { }
    };

    constructor(props) {
        super(props);
        this.name = '';
        this.tmpArray = [];
    }

    componentDidMount() { }

    render() {
        return (
            <View style={[{ flexDirection: 'row', height: 28, borderColor: baseStyle.LINE_BG_F1, alignItems: 'center' }, this.props.style, this.props.containerStyle]}>
                {
                    this.props.index > 0 ?
                        <View style={{ height: 20, width: 65, borderColor: baseStyle.LIGHTEN_GRAY, borderWidth: 1, borderRadius: 2, marginRight: 5 }}>
                            <TouchableOpacity style={{ height: 20, alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }} onPress={this.props.choseNormPage} >
                                <Text style={{ marginLeft: 5, marginRight: 5, color: baseStyle.BLACK_70, fontSize: RATE(20) }} >
                                    {this.props.items.length > 0 && this.props.items[0].str.indexOf('时间') === -1 ? this.props.items[0].str : '--'}
                                </Text>
                                <Image style={{ height: 8, width: 8, marginRight: 5 }} source={require('../../images/icons/zhibiao_jiantou.png')} />
                            </TouchableOpacity>
                        </View> : null
                }

                {
                    this.props.items.map((item, index) => {
                        if (this.props.index > 0) {
                            if (this.props.toPlayVideo) {
                                return has(item.str) ?
                                    <View key = {index} style={{ position: 'absolute', right: 15, height: 28, width: 49, flexDirection: 'row', backgroundColor: '#fff' }} >
                                        <Image style={{ marginTop: 2, height: 24, width: 3 }} source={require('../../images/icons/line_h.png')} />
                                        <TouchableOpacity style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }} onPress={this.props.toPlayVideo}>
                                            <Image style={{ marginLeft: 5, marginRight: 5, height: 17, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                                            <Text style={{ color: '#006ACC', fontSize: RATE(20) }}>学指标</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : null;
                            } else {
                                return null;
                            }
                        } else {
                            return (
                                <Text key={index} style={{ color: item.color || baseStyle.BLACK_70, fontSize: RATE(20), marginRight: 10 }} numberOfLines = {1}>
                                    {item && item.str.indexOf(':') !== -1 ? item.str : '--'}
                                </Text>
                            );
                        }
                    })
                }
            </View>
        );
    }
}
