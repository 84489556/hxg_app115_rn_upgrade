
import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    Dimensions,
    Image,
    Platform
} from 'react-native';

import PropTypes from 'prop-types';
import { commonUtil } from '../utils/CommonUtils'
import *as baseStyle from '../components/baseStyle'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../utils/fontRate.js';
import ShareSetting from "../modules/ShareSetting";

export default class TopButton extends Component {

    static propTypes = {
        style: PropTypes.object,
    };

    static defaultProps = {
        selected: false,
    };
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.selected,
        };
        this.disabled = false;
    }

    onPress = () => {
        if (this.disabled === false) {
            this.disabled = true;
            let times = Platform.OS === 'ios' ? 1000 : 2000;
            setTimeout(() => {
                this.disabled = false;
            }, times);

            this.setState({
                selected: !this.state.selected,
            });
            this.props.onPress && this.props.onPress(!this.state.selected);
        }
    };

    render() {
        return (
            <TouchableOpacity
                //disabled={this.state.disabled}
                onPress={() => { this.onPress() }}
                activeOpacity={1}
                style={[{
                    height: commonUtil.rare(60),
                    borderRadius: commonUtil.rare(30),
                    width: commonUtil.rare(225),
                    flexDirection: 'row',
                    // justifyContent:'space-between',
                    alignItems: 'center',
                    backgroundColor: baseStyle.BLACK_000000_05
                }]}>

                <Image source={
                    this.state.selected ?
                        require('../images/TuyereDecision/top_selected.png') :
                        require('../images/TuyereDecision/top_noSelected.png')
                } />
                <Text style={{ color: baseStyle.BLACK_000000_40, fontSize: RATE(24), marginLeft: 11 }} >
                    {'资金TOP'}
                </Text>
            </TouchableOpacity>
        )

    }
}

