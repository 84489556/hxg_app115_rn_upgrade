

import React, { Component, PropTypes } from 'react';
import { NativeModules, requireNativeComponent,findNodeHandle } from 'react-native';

// var RCTGenseeLive = requireNativeComponent('RCTGenseeLive', LiveView);
var RCTHuodeLive = requireNativeComponent('RCTHuodeLive', LiveView);

export default class LiveView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFullscreen: false
        }
    }
    // componentWillReceiveProps(nextProps) {
    //     if (nextProps != this.props) {
    //         this.props.width = nextProps.width;
    //         this.props.height = nextProps.height;
    //         width = nextProps.width;
    //         height = nextProps.height;
    //         // this.setState({ isFullscreen: nextProps.height == 211 ? false : true });
    //         // Platform.OS == 'ios' && this.player.ref.reloadView({ width: nextProps.width, height: nextProps.height });
    //         HuodeLiveManager.reloadView(findNodeHandle(this), { "width": nextProps.width, "height": nextProps.height });
    //     }
    // }
    landspace()
    {
        HuodeLiveManager.landspace(findNodeHandle(this));//GenseeLiveManager
    }
    portiort()
    {
        HuodeLiveManager.portiort(findNodeHandle(this));
    }
    // //刷新页面,dic 长高
    reloadView(dic){
        HuodeLiveManager.reloadView(findNodeHandle(this),dic);
    }
    play()
    {
        HuodeLiveManager.play(findNodeHandle(this));
    }
    stop()
    {
        HuodeLiveManager.stop(findNodeHandle(this));
    }
    pause() {
        HuodeLiveManager.pause(findNodeHandle(this));
    }
    resume() {
        HuodeLiveManager.resume(findNodeHandle(this));
    }
    release()
    {
        HuodeLiveManager.releaseViewWithTag(findNodeHandle(this));
    }
    // switchUrl(vodId, dic, isPlay) {
    //     HuodeLiveManager.changePlaybackId(vodId, dic, findNodeHandle(this), !isPlay);
    // }

  //初始化传递的参数
    /**

     * @param dic 其他数据（domain：房间名称，webcaseId：直播ID，nickname：用户名称）

     */
  render() {
    // return <RCTGenseeLive {...this.props} />;
    return <RCTHuodeLive {...this.props} />;
  }
}

export var PlayerManager = NativeModules.PlayerManager;
// export var GenseeLiveManager=NativeModules.GenseeLiveManager;
export var HuodeLiveManager=NativeModules.HuodeLive;