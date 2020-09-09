
import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import * as baseStyle from './baseStyle';

const X_HEIGHT = 812;
const X_WIDTH = 375;

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default class SafeAreaView extends Component {
    static propTypes = {
        style: PropTypes.object,
        topColor: PropTypes.string,
        topNeed: PropTypes.bool
    };
    static defaultProps = {
        style: {},
        topColor: '#f92400',
        topNeed: true
    };
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    paddingBottom: baseStyle.isIPhoneX ? 0 : 0,
                    backgroundColor: '#fff'
                }}
            >
                {/* {baseStyle.isIPhoneX  && this.props.topNeed ? (
                    <View
                        style={{
                            height: 24,
                            width: width,
                            backgroundColor: this.props.topColor
                        }}
                    />
                ) : null} */}
                {this.props.children}
            </View>
        );
    }
}
