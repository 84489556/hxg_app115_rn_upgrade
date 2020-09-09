'use strict';
import React, { Component, PropTypes } from 'react';
import { NativeModules, requireNativeComponent, findNodeHandle, DeviceEventEmitter } from 'react-native';


var RCTHuodePlayback = requireNativeComponent('RCTHuodePlayback', VodView);
export default class VodView extends Component {
  //   static propTypes = {
  //     /**
  //     * 当这个属性被设置为true，并且地图上绑定了一个有效的可视区域的情况下，
  //     * 可以通过捏放操作来改变摄像头的偏转角度。
  //     * 当这个属性被设置成false时，摄像头的角度会被忽略，地图会一直显示为俯视状态。
  //     */
  //     pitchEnabled: PropTypes.bool,
  //   };
  componentWillMount() {
    this.progresslistener = DeviceEventEmitter.addListener('positionEvent', (data) => { this.props.onProgress&&this.props.onProgress(data.position) });
    this.preparedlistener = DeviceEventEmitter.addListener('initEvent', (data) => { this.props.onPrepared && this.props.onPrepared(data.duration) });
    this.completionlistener = DeviceEventEmitter.addListener('onStopEvent', (data) => { this.props.onCompletion&&this.props.onCompletion(data) });
  }
  componentWillUnmount() {
    this.progresslistener&&this.progresslistener.remove();
    this.preparedlistener&&this.preparedlistener.remove();
    this.completionlistener&&this.completionlistener.remove();

  }
  landspace() {
    HuodePlaybackManager.landspace(findNodeHandle(this));
  }
  portiort() {
    HuodePlaybackManager.portiort(findNodeHandle(this));
  }
  //播放器网络状态变化
  netState(state) {
    HuodePlaybackManager.noWifiVideoView(findNodeHandle(this), state);
  }
  //传递视频的vodid和其他需要的数据；
  /**
   * 切换视频播放源
   * @param vodId 视频id
   * @param dic 其他数据（image：图片地址）
   * @param isPlay 是否播放
   * @param failCallback 失败回调
   */
  switchUrl(vodId, dic, isPlay) {
    HuodePlaybackManager.changePlaybackId(vodId, dic, findNodeHandle(this), !isPlay);
  }
  seekTo(position) {
    HuodePlaybackManager.seekTo(position,findNodeHandle(this));
  }
  getPlayerState(returnFunction) {
    HuodePlaybackManager.getPlayerStatus(findNodeHandle(this), (status) => {
      return returnFunction(status);
    });
  }
  reloadView(dic) {
    HuodePlaybackManager.reloadView(findNodeHandle(this), dic);
  }
  play() {
    HuodePlaybackManager.play(findNodeHandle(this));
  }
  stop()
  {
    HuodePlaybackManager.stop(findNodeHandle(this));
  }
  pause() {
    HuodePlaybackManager.pause(findNodeHandle(this));
  }
  resume() {
    HuodePlaybackManager.resume(findNodeHandle(this));
  }
  release(){
    HuodePlaybackManager.releaseView(findNodeHandle(this));
  }
  onCompletion(){
    HuodePlaybackManager.onCompletion(findNodeHandle(this));
  }
  
  render() {
    return <RCTHuodePlayback {...this.props} />;
  }
}
export var VodPlayerManager = NativeModules.VodPlayerManager;
// export var GenseeVodManager = NativeModules.GenseeVodManager;
export var HuodePlaybackManager = NativeModules.HuodePlayback;