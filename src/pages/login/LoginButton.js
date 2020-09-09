/**
 * Created by cuiwenjuan on 2017/8/29.
 */
import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
} from 'react-native';

import PropTypes from 'prop-types';
import { commonUtil } from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE from '../../utils/fontRate.js';
import dismissKeyboard from '../../../node_modules/react-native/Libraries/Utilities/dismissKeyboard';

export default class LoginButton extends Component {

    static propTypes = {
        style: PropTypes.object,
        disabledBGC: PropTypes.string
    };
    static defaultProps = {
        disabledBGC: baseStyle.BLACK_d2d2d2,
        style: {}
    };

    onPress = () => {
        this.props.onPress();
        dismissKeyboard();
    };

    render() {
        return (
            <TouchableOpacity onPress={() => { this.onPress() }}
                disabled={this.props.disabled}
                style={[{
                    marginTop: commonUtil.rare(40),
                    height: commonUtil.rare(80),
                    borderRadius: commonUtil.rare(5),
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: !this.props.disabled ? baseStyle.BLUE_HIGH_LIGHT : this.props.disabledBGC,
                }, this.props.style]}>
                <Text style={{ color: '#ffffff', fontSize: RATE(32), }} >
                    {this.props.titleButton}
                </Text>
            </TouchableOpacity>
        )

    }
}
