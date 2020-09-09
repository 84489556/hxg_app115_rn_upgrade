'use strict';
import React, { Component } from 'react';
import {
    NativeModules,
    requireNativeComponent,
    findNodeHandle,
    DeviceEventEmitter
} from 'react-native';
import PropTypes from 'prop-types';

var RCTWYPlayerView = requireNativeComponent('VideoPlayerView', VideoPlayerView);
const PLAYING = 'PLAYING'
const STREAMING = 'STREAMING'
const PAUSED = 'PAUSED'
const STOPPED = 'STOPPED'
const ERROR = 'ERROR'
const METADATA_UPDATED = 'METADATA_UPDATED'
const BUFFERING = 'BUFFERING'
const FINISHED = 'FINISHED'
export default class VideoPlayerView extends Component {

    static propTypes = {

        videoPath: PropTypes.string,
        domain: PropTypes.string,
        downFlag: PropTypes.bool,
        isliving: PropTypes.bool,
    };
    static defaultProps = {
        decodeType: 'software',
        mediaType: 'videoOnDemand',
        downFlag: false,
        isliving: false,
    }
    constructor(props) {
        super(props)
        //播放失败为true，播放成功为false
        this.failstart = false;
        this.state = {
            videoPath: this.props.videoPath,
            isliving: this.props.isliving,
            init: false,
        }

    };
    componentWillReceiveProps(nextProps, netxContext) {
        this.props = nextProps;
        if (this.failstart)
            this.start();
        // this.setState({
        //     videoPath:this.props.videoPath,
        // },()=>{
        //
        // })


    }
    componentWillMount() {
        this.subscription = DeviceEventEmitter.addListener('AudioBridgeEvent', this._statusUpdate.bind(this));

    }
    componentDidMount() {

    }
    componentWillUnmount() {
        this.subscription.remove();
        this.release();
    }
    _statusUpdate(params) {
        switch (params.status) {

            case BUFFERING: {
                this.props.getBufferStartState();
                break;
            }
            case ERROR: {
                this.props.getErrorState();
                break;
            }
            case PLAYING: {
                this.props.getBufferEndState();
                this.props.getPlayingState&&this.props.getPlayingState();
                break;
            }
            case PAUSED:{
                this.props.getPausedState&&this.props.getPausedState();
            }
                break;
            case FINISHED:
                {
                    this.props.getVideoFinishState();
                    break;
                }
            default:
                break;

        }

    }

    release() {
        VideoPlayerManager.shutdown();
    }

    switchUrl(path) {
        this.pause();
        VideoPlayerManager.changeUrlStr(path, { 'decodeType': 'software', 'mediaType': this.state.isliving ? 'livestream' : 'videoOnDemand' }, findNodeHandle(this));
    }
    getPlayerState() {
        VideoPlayerManager.getPlayerStatus(findNodeHandle(this), (status) => {
            return status.state;
        });
    }
    seekTo(position) {
        VideoPlayerManager.seekTo(position / 1000, findNodeHandle(this));
    }
    pause() {
        VideoPlayerManager.pause(findNodeHandle(this));
    }
    reloadView(dic) {
        VideoPlayerManager.reloadView(findNodeHandle(this), dic);
    }
    start() {
        if (!this.props.videoPath) {
            this.failstart = true;
        }
        else if (!this.state.init && this.props.videoPath) {

            let dic = {
                'url': this.props.videoPath
                , 'decodeType': 'software', 'mediaType': this.state.isliving ? 'livestream' : 'videoOnDemand'
            };
            this.setState({ init: true }, () => {
                VideoPlayerManager.play(findNodeHandle(this), dic);
                this.props.getBufferStartState();
                this.failstart = false;
            })
        }
        else
            VideoPlayerManager.resume(findNodeHandle(this));
    }
    getPosition() {
        VideoPlayerManager.getPlayerStatus(findNodeHandle(this), (status) => {
            if (status.status != STOPPED)
                this.props.getCurrentPosition(status.currentTime * 1000);
            this.props.getDuration(status.duration * 1000);
        })
    }
    render() {

        return <RCTWYPlayerView {...this.props} />;
    }
}
export var VideoPlayerManager = NativeModules.VideoPlayerView;