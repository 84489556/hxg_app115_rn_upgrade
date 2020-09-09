import React, { Component } from 'react'
import {
    Dimensions,
    Image,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    NativeModules,
    DeviceEventEmitter,
} from 'react-native'

const FMPlayerManager = NativeModules.FMPlayerManager;
import ProgressBar from '../../../node_modules_modify/react-native-simple-progressbar';
import _ from 'lodash';

// Possibles states
const PLAYING = 'PLAYING'
const STREAMING = 'STREAMING'
const PAUSED = 'PAUSED'
const STOPPED = 'STOPPED'
const ERROR = 'ERROR'
const METADATA_UPDATED = 'METADATA_UPDATED'
const BUFFERING = 'BUFFERING'

const DEFAULT_WIDTH = Dimensions.get('window').width;
const play_buggle = require('./img/play_bugle.png');
const unplay_buggle = require('./img/unplay_bugle.png');
const unplayed_buggle = require('../../images/JiePan/pzgd_sanjiao.png');
const video_play = require('./img/video-play.gif');
const video_stop = require('./img/video-stop.png');
class FMVideoView extends Component {

    constructor(props, context) {
        super(props, context);
        const formattedMinutes = _.padStart(Math.floor(props.data.play_length / 1000 / 60).toFixed(0), 2, 0);
        const formattedSeconds = _.padStart(Math.round(props.data.play_length / 1000 % 60).toFixed(0), 2, 0);
        let duration = formattedMinutes + "′" + formattedSeconds + '″';
        this.state = {
            // videoImage: require('../img/gif-mr.png'),
            videoBugleImage: unplayed_buggle,
            playState: ERROR,
            playURL: props.data.play_address,
            decodeType: 'software',
            mediaType: 'videoOnDemand',
            buttonImage: video_stop,
            progress: 0,
            duration: props.data.play_length,
            time: duration,
            videotype: props.data.type,
        }
        this.playButtonClicked = this._playButtonClicked.bind(this);
    }

    componentDidMount() {

        this.subscription = DeviceEventEmitter.addListener('AudioBridgeEvent', this._statusUpdate.bind(this));
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this.setState({
                progress: 0.0,
                playState: STOPPED,
                buttonImage: video_stop,
                videotype: 2,
            })
            this.timer && clearInterval(this.timer);
            FMPlayerManager.shutdown();
        });
        this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
            this.setState({
                progress: 0.0,
                playState: STOPPED,
                buttonImage: video_stop,
                videotype: 2,
            })
            this.timer && clearInterval(this.timer);
            FMPlayerManager.shutdown();
        });
    }

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
        this.willBlurSubscription && this.willBlurSubscription.remove();
        // FMPlayerManager.shutdown();
    }

    componentWillReceiveProps(nextProps, netxContext) {

        if (nextProps.data.key == this.props.data.key) {
            if (nextProps.data.type == this.state.videotype)
                return;
            else {
                this.setState({ videotype: nextProps.data.type });
                return;
            }
        }
        const formattedMinutes = _.padStart(Math.floor(nextProps.data.play_length / 1000 / 60).toFixed(0), 2, 0);
        const formattedSeconds = _.padStart(Math.round(nextProps.data.play_length / 1000 % 60).toFixed(0), 2, 0);
        let duration = formattedMinutes + "′" + formattedSeconds + '″';
        this.setState({
            // videoImage: require('../img/gif-mr.png'),
            playState: ERROR,
            playURL: nextProps.data.play_address,
            decodeType: 'software',
            mediaType: 'videoOnDemand',
            buttonImage: video_stop,
            progress: 0,
            duration: nextProps.data.play_length,
            time: duration

        }, () => {
            clearInterval(this.timer);
        });
    }

    // 定时器定时修改进度
    _timerRun() {

        FMPlayerManager.getStatus((error, status) => {
            // console.log('播放进度：', this.state.playState, status.currentTime);
            if (this.state.playURL === status.url) {

                if (status.status === STOPPED) {
                    clearInterval(this.timer);
                    this.setState({
                        progress: 0.0,
                        playState: status.status,
                        buttonImage: video_stop,
                        videotype: 2,
                    })
                    return;
                }
                if (this.state.playState == BUFFERING) {
                    if (status.status == BUFFERING)
                        return;
                    else
                        this.setState({
                            playState: status.status,
                        })
                }
                else
                    this.setState({
                        playState: status.status,
                        progress: status.currentTime * 1000,

                    })
            }
        })


    }
    //播放器状态监听方法
    _statusUpdate(params) {
        // console.log('播放进度：', this.state.playState, params.currentTime);
        if (this.state.playURL === params.url) {
            if (this.state.playState == BUFFERING)
                return;
            switch (params.status) {
                case PLAYING:
                case BUFFERING: {

                    this.setState({
                        playState: params.status,
                        progress: params.currentTime * 1000,
                        buttonImage: video_play,
                    })

                    break;
                }

                case PAUSED: {
                    this.setState({
                        playState: params.status,
                        buttonImage: video_stop
                    })
                    break;
                }
                case ERROR:
                case STOPPED: {
                    FMPlayerManager.shutdown();
                    this.setState({
                        playState: params.status,
                        buttonImage: video_stop,
                        videotype: 2,
                    })
                    break;
                }

            }
        }
        else {
            this.setState({
                playState: STOPPED,
                buttonImage: video_stop,
                progress: 0.0,
            }, () => {
                clearInterval(this.timer);
            })
        }
    }

    // 播放按钮点击事件
    _playButtonClicked() {

        switch (this.state.playState) {


            case PLAYING:
            case BUFFERING:
            case STREAMING: {
                FMPlayerManager.pause();
                this.setState({
                    buttonImage: video_stop,
                    videoBugleImage: unplayed_buggle
                })
                break;
            }
            case PAUSED: {
                FMPlayerManager.resume();
                this.setState({
                    buttonImage: video_stop,
                    videoBugleImage: unplay_buggle
                })
                break;
            }
            case STOPPED:
            case ERROR: {

                FMPlayerManager.play(this.state.playURL, {
                    decodeType: this.state.decodeType,
                    mediaType: this.state.mediaType
                });
                this.setState({
                    buttonImage: video_stop,
                    videoBugleImage: unplay_buggle

                });
                DeviceEventEmitter.emit('changeType', this.props.data);
                this.timer = setInterval(() => {
                    this._timerRun();
                }, 1000);
                break;
            }
        }
    }

    render() {
        let width = 57 + (175 - 57) / (120 - 1) * (this.state.duration > 12000 ? 120 : this.state.duration / 1000);
        return (
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <TouchableOpacity onPress={this._playButtonClicked.bind(this)}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        {/*<Image style={styles.teacherImage} source={this.state.videotype==2?play_buggle:unplayed_buggle}/>*/}
                        <View style={{ flexDirection: 'row' }}>

                            <ProgressBar ref='progress'
                                width={width} height={37} progress={this.state.progress} size={this.state.duration}
                                style={{
                                    backgroundColor: this.state.progress > 0 ? '#F1F1F1' : this.state.videotype == 2 ? '#F1F1F1' : '#3399FF',
                                    borderRadius: 30,
                                    borderColor: this.state.progress > 0 ? '#F1F1F1' : this.state.videotype == 2 ? '#F1F1F1' : '#3399FF',
                                    borderWidth: 0.01,
                                }}
                                hideProgressText={true}
                                color={this.state.videotype == 2 ? '#F1F1F1' : '#3399FF'}>
                                <View style={{ position: 'absolute', top: 11.5, left: 11.5, height: 37, width: 37 }}>
                                    <Image style={styles.gifImage}
                                        source={this.state.buttonImage} />
                                </View>
                                <View style={styles.textView}>
                                    <Text style={styles.text}>{this.state.time}</Text>
                                </View>
                            </ProgressBar>

                        </View>
                    </View>
                </TouchableOpacity>

            </View>

        )
    }
}
export default FMVideoView;

var styles = StyleSheet.create({
    viewStyle: {
        flexDirection: 'column',
        // backgroundColor: 'white',
        justifyContent: 'space-between',
        borderColor: 'white',
        borderWidth: 3,
        backgroundColor: 'red',
    },

    gifImage: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        justifyContent: 'center',
    },


    teacherImage: {
        marginTop: 12,
        marginLeft: 8,
        width: 9,
        height: 5,
        resizeMode: 'contain',

    },
    textView: {
        position: 'absolute', top: 8, left: 30,
        // marginLeft:5,
        justifyContent: 'center',
        // alignItems: 'center',
    },
    text: {
        backgroundColor: 'transparent',
        fontSize: 15,
        color: 'white',
    }
})
