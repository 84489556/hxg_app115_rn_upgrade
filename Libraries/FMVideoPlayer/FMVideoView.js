'use strict';
import React, { Component } from 'react';
import { NativeModules, requireNativeComponent, findNodeHandle } from 'react-native';

// export var VodPlayerManager = NativeModules.VodPlayerManager;

var RCTWYPlayerView = requireNativeComponent('RCTWYPlayerView', WYPlayerView);

export default class WYPlayerView extends Component {
    //   static propTypes = {
    //     /**
    //     * 当这个属性被设置为true，并且地图上绑定了一个有效的可视区域的情况下，
    //     * 可以通过捏放操作来改变摄像头的偏转角度。
    //     * 当这个属性被设置成false时，摄像头的角度会被忽略，地图会一直显示为俯视状态。
    //     */
    //     pitchEnabled: PropTypes.bool,
    //   };
    release() {
        WYPlayerManager.releaseView();
    }
    //播放器网络状态变化
    netState(state) {
        WYPlayerManager.noWifiVideoView(findNodeHandle(this), state);
    }
    switchUrl(path) {
        WYPlayerManager.changeUrlStr(path, {}, findNodeHandle(this));
    }
    getPlayerState() {
        WYPlayerManager.getPlayerState(findNodeHandle(this), (status) => {
            return status.state;
        });
    }
    pause() {
        WYPlayerManager.stopVideoView(findNodeHandle(this));
    }
    start() {
        WYPlayerManager.playVideoView(findNodeHandle(this));
    }
    render() {
        return <RCTWYPlayerView {...this.props} />;
    }
}
export var WYPlayerManager = NativeModules.WYPlayerViewManager;