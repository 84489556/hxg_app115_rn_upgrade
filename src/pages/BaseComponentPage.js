/**
 * Created by cuiwenjuan on 2018/11/29.
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DeviceEventEmitter, Platform, StatusBar, View } from 'react-native';
import * as baseStyle from '../components/baseStyle';

export default class BaseComponent extends Component {
    static propTypes = {
        style: PropTypes.object,
        topColor: PropTypes.string,
        topNeed: PropTypes.bool
    };
    static defaultProps = {
        style: {},
        topColor: 'white',
        topNeed: true
    };

    constructor(props) {
        super(props);
        this.state = {
            notchHeight_android: 0
        };
        if (this.constructor.name !== 'BaseComponent') {
        }
        if (Platform.OS == 'android') {
            // NativeModules.GETNOTCHSIZE.getNotchSize((size) => {
            //     this.setState({ notchHeight_android: size })
            // });
            // console.log( StatusBar.currentHeight)
            //this.setState({ notchHeight_android: StatusBar.currentHeight })
        }
    }
    componentWillMount() {

    }
    componentDidMount() {

    }
    componentWillUnmount() {

    }

    onBackAndroid = () => {
        this.onBack();
        return true;
    };

    onBack() {
        let { onBack } = this.props;
        return (typeof onBack === 'function') ? onBack() : Navigation.pop(this.props.navigation);
    }

    renderStatusBar() {
        if (this.props.topNeed) {
            let statusBarHeight = 0;
            if (Platform.OS == 'ios') {
                statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
            } else {
                statusBarHeight = StatusBar.currentHeight;
            }
            return (
                <View style={{
                    height: statusBarHeight,
                    width: baseStyle.width,
                    backgroundColor: this.props.topColor
                }} />
            )
        } else {
            return null;
        }
    }
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    paddingBottom: baseStyle.isIPhoneX ? 34 : 0,
                    backgroundColor: '#fff',
                    ...this.props.style
                }}
            >
                {Platform.OS === 'ios' ? <StatusBar barStyle='dark-content' /> : <StatusBar barStyle='dark-content' backgroundColor='transparent' />}
                {this.renderStatusBar()}
                {this.props.children}
            </View>
        );
    }
}