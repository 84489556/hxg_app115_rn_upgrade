import React, {Component} from 'react'
import {
    Dimensions,
    Image,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native'

import ProgressBar from '../../../node_modules_modify/react-native-simple-progressbar';
import  _ from 'lodash';

// Possibles states
const INIT = 'INIT'
const PLAYING = 'PLAYING'
const STREAMING = 'STREAMING'
const PAUSED = 'PAUSED'
const STOPPED = 'STOPPED'
const ERROR = 'ERROR'
const METADATA_UPDATED = 'METADATA_UPDATED'
const BUFFERING = 'BUFFERING'
const width = Dimensions.get('window').width
const height= Dimensions.get('window').height
const play_buggle=require('./img/play_bugle.png');
const unplay_buggle=require('./img/unplay_bugle.png');
const unplayed_buggle=require('../../images/JiePan/pzgd_sanjiao.png');
const video_play=require('./img/video-play.gif');
const video_stop=require('./img/video-stop.png');


class FMVideoView extends Component {

    constructor(props, context) {
        super(props, context);
        const formattedMinutes = _.padStart(Math.floor(props.data.play_length / 1000 / 60).toFixed(0), 2, 0);
        const formattedSeconds = _.padStart(Math.round(props.data.play_length / 1000 % 60).toFixed(0), 2, 0);
        let duration = formattedMinutes + "′" + formattedSeconds + '″';
        this.state = {
            videoBugleImage: unplayed_buggle,
            playState: INIT,
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
        this.stateUpdate = this._stateUpdate.bind(this);
        this.endVideo = this._endVideo.bind(this);
        this.getVideo = this.getVideo.bind(this);
        // this._videoView = this._videoView.bind(this);
        // this.video=this.props.video;

    }

    getPlayState() {
        return this.state.playState
    }

    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener('AudioBridgeEvent1', this.stateUpdate);
        this.subscription1 = DeviceEventEmitter.addListener('AudioBridgeEnd', this.endVideo);
        this.subscription2 = DeviceEventEmitter.addListener('SendVideoEvent', this.getVideo);
        DeviceEventEmitter.emit('videoPath', this.state.playURL);

        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this.setState({
                progress: 0,
                playState: STOPPED,
                buttonImage: video_stop,
                //videotype: 2,
            });
            this.timer && clearInterval(this.timer);
            if (this.video){
                this.video.pause();
            }

        });
        this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
            this.setState({
                progress: 0,
                playState: STOPPED,
                buttonImage: video_stop,
                //videotype: 2,
            });
            this.timer && clearInterval(this.timer);
            if (this.video ){
                this.video.pause();
            }
        });

    }

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
        this.subscription.remove();
        this.subscription1.remove();
        this.subscription2.remove();
        // FMPlayerManager.shutdown();
        this.appMainTabChange.remove();
        this.willBlurSubscription.remove();
    }

    //初始化完成后传过来播放器
    getVideo(Video) {
        //console.log("PointConetView,andropid收到消息",this.video)
        if(this.video===undefined){
            this.video = Video;
        }
    }

    componentWillReceiveProps(nextProps, netxContext) {

        // if(nextProps.video&&nextProps.video!=null)
        //     this.video=nextProps.video;
        if (nextProps.data.key == this.props.data.key) {
            if (nextProps.data.type == this.state.videotype)
                return;
            else {
                this.setState({videotype: nextProps.data.type});
                return;
            }
        }
        else {
            clearInterval(this.timer);
        }
        const formattedMinutes = _.padStart(Math.floor(nextProps.data.play_length / 1000 / 60).toFixed(0), 2, 0);
        const formattedSeconds = _.padStart(Math.round(nextProps.data.play_length / 1000 % 60).toFixed(0), 2, 0);
        let duration = formattedMinutes + "′" + formattedSeconds + '″';
        this.setState({
            playState: PAUSED,
            playURL: nextProps.data.play_address,
            decodeType: 'software',
            mediaType: 'videoOnDemand',
            buttonImage: video_stop,
            progress: 0,
            duration: nextProps.data.play_length,
            time: duration

        });
    }

    // 定时器定时修改进度
    _stateUpdate(currentPosition) {
        if(currentPosition == null)return;
        if (this.state.playURL === this.video.videoPath) {
            this.setState({
                progress: currentPosition,
            })

        }
        else {
            this.setState({
                progress: 0,
                playState: STOPPED,
                buttonImage: video_stop,
            }, () => {
                clearInterval(this.timer);
            })
        }

    }

    _endVideo() {
        this.timer && clearInterval(this.timer);
        this.video = null;
        this.setState({
            progress: 0,
            playState: STOPPED,
            buttonImage: video_stop,
        })
    }

    // 播放按钮点击事件
    _playButtonClicked() {
        // this.setState({
        //     buttonImage: video_play
        // });
        this.timer && clearInterval(this.timer);
        if (!this.video) return;
        if (this.state.playURL != this.video.videoPath) {
            this._switchContentUrl(this.state.playURL);
            this.timer = setInterval(
                () => {
                    this.video && this._getPositionForRN()
                },
                0,
            );

            this.setState({
                buttonImage: video_play,
                videoBugleImage: play_buggle,
                playState: PLAYING,
                progress: 0,
            })
        }
        else {
            switch (this.state.playState) {

                case INIT: {
                    this.setState({
                        // videoImage: require('../img/gif-dongtu.gif'),
                        buttonImage: video_play,
                        videoBugleImage: play_buggle,
                        playState: PLAYING,
                    })
                    if (this.video != undefined) {
                        this.video.start();
                        this.timer = setInterval(
                            () => {
                                this.video && this._getPositionForRN()
                            },
                            1000,
                        )
                    }
                    ;
                    break;

                }
                case PLAYING: {
                    this.setState({
                        buttonImage: video_stop,
                        videoBugleImage: play_buggle,
                        playState: PAUSED,
                        // videoImage: require('../img/gif-mr.png'),
                    }, () => {
                        this.timer && clearInterval(this.timer);
                    })
                    if (this.video != undefined)
                        this.video.pause();
                    break;
                }
                case PAUSED: {
                    this.setState({
                        // videoImage: require('../img/gif-dongtu.gif'),
                        buttonImage: video_play,
                        videoBugleImage: play_buggle,
                        playState: PLAYING,
                    })
                    if (this.video != undefined) {
                        this.video.start();
                        this.timer = setInterval(
                            () => {
                                this.video && this._getPositionForRN()
                            },
                            1000,
                        )
                    }
                    ;
                    break;

                }
                case STOPPED: {
                    if (this.video != undefined) {
                        this._switchContentUrl(this.state.playURL);
                        this.timer = setInterval(
                            () => {
                                this.video && this._getPositionForRN()
                            },
                            1000,
                        );
                    }

                    this.setState({
                        // videoImage: require('../img/gif-dongtu.gif'),
                        buttonImage: video_play,
                        videoBugleImage: play_buggle,
                        playState: PLAYING,
                    })
                    DeviceEventEmitter.emit('changeType', this.props.data);
                    break;

                }
            }
        }
    }

    render() {
        let width=57+(175-57)/(120-1)*(this.state.duration>12000?120:this.state.duration/1000);
        return (
            <View style={{flexDirection:'row',flex:1}}>
                <TouchableOpacity onPress={this._playButtonClicked.bind(this)}>
                    <View style={{flexDirection:'column',flex:1}}>
                        {/*<Image style={styles.teacherImage} source={this.state.videotype==2?play_buggle:unplayed_buggle}/>*/}
                        <View style={{flexDirection:'row'}}>

                            <ProgressBar ref='progress'
                                         width={width} height={37} progress={this.state.progress} size={this.state.duration}
                                         style={{
                                             backgroundColor:this.state.progress>0?'#F1F1F1':this.state.videotype==2?'#F1F1F1':'#3399FF',
                                             borderRadius:30,
                                             borderColor:this.state.progress>0?'#F1F1F1':this.state.videotype==2?'#F1F1F1':'#3399FF',
                                             borderWidth:0.01,
                                         }}
                                         hideProgressText={true}
                                         color={this.state.videotype==2?'#F1F1F1':'#3399FF'}>
                                
                                    <View style={{position:'absolute',top:11.5,left:11.5,height:37,width:37}}>
                                        <Image style={styles.gifImage}
                                           source={this.state.buttonImage} />
                                    
                                    </View>
                                    <View style={styles.textView}>
                                        <Text style={styles.text}>{this.state.time}</Text>
                                    </View>
                                
                            </ProgressBar>
                            {/*<View style={{*/}
                            {/*height:37,*/}
                            {/*width:30,*/}

                            {/*// borderTopLeftRadius:3,*/}
                            {/*// borderBottomLeftRadius:3,*/}
                            {/*// backgroundColor:this.state.videotype==2?'#FFBBAF':'#FF917E',*/}
                            {/*alignItems:'center',*/}
                            {/*justifyContent:'center'}}>*/}
                            {/*<Image style={styles.gifImage}*/}
                            {/*source={this.state.buttonImage} />*/}
                            {/*</View>*/}
                        </View>
                    </View>
                </TouchableOpacity>
                
            </View>

        )
    }
    // render() {
    //     // let leiXing = this.props.data.leiXing;
    //     // let zhiBo = this.props.data.zhiBo;
    //
    //     let width=57+(175-57)/(120-1)*(this.state.duration/1000);
    //     return (
    //         <View style={styles.viewstyle}>
    //             <View style={{flexDirection:'row',flex:1}}>
    //
    //                 <TouchableOpacity onPress={this._playButtonClicked.bind(this)}
    //                                   activeOpacity={1}>
    //                     <View style={{flexDirection:'column',flex:1}}>
    //                         <Image style={styles.teacherImage} source={this.state.videotype==2?play_buggle:unplayed_buggle}/>
    //                         <View style={{flexDirection:'row'}}>
    //
    //                             <ProgressBar ref='progress'
    //                                          width={width} height={37} progress={this.state.progress} size={this.state.duration}
    //                                          style={{
    //                                              backgroundColor:this.state.progress>0?'#FFE5E7':this.state.videotype==2?'#f7c2c6':'#eb7d84',
    //                                              borderBottomRightRadius:3,
    //                                              borderTopRightRadius:3,
    //                                              borderColor:this.state.progress>0?'#FFE5E7':this.state.videotype==2?'#f7c2c6':'#eb7d84',
    //                                              borderWidth:0.01,
    //                                              marginLeft:27,
    //                                          }}
    //                                          hideProgressText={true}
    //                                          color={this.state.videotype==2?'#f7c2c6':'#eb7d84'}>
    //                             </ProgressBar>
    //                             <View style={{
    //                                 height:37,
    //                                 width:30,
    //                                 position: 'absolute',
    //                                 left:0,
    //                                 borderTopLeftRadius:3,
    //                                 borderBottomLeftRadius:3,
    //                                 backgroundColor:this.state.videotype==2?'#f7c2c6':'#eb7d84',
    //                                 alignItems:'center',
    //                                 justifyContent:'center'}}>
    //                                 <Image style={styles.gifImage}
    //                                        source={this.state.buttonImage} />
    //                             </View>
    //                         </View>
    //                     </View>
    //                 </TouchableOpacity>
    //                 <View style={styles.textView}>
    //                     <Text style={styles.text}>{this.state.time}</Text>
    //                 </View>
    //             </View>
    //
    //         </View>
    //     )
    //     }

    //获取当前进度
    _getPositionForRN() {
        if (this.video != undefined)
            this.video.getPositionForRN();
    }
    //释放资源并播放器对象置空
    _onPressRelease() {
        if (this.video != undefined)
            this.video.release();
    }

    //切换流地址
    _switchContentUrl(url) {
        if (this.video != undefined)
        {
            this.video.switchUrl(url);
            DeviceEventEmitter.emit('changeType',this.props.data);
        }
    }

}
export default FMVideoView;

var styles = StyleSheet.create({
    viewStyle: {
        flexDirection: 'column',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        borderColor: 'white',
        borderWidth: 3,
        flex:1,
    },

    gifImage: {
        width:14,
        height:14,
        resizeMode: 'contain',
        justifyContent: 'center',
    },


    teacherImage: {
        marginTop: 12,
        marginLeft:8,
        width:9,
        height:5,
        resizeMode: 'contain',

    },
    textView: {
        position:'absolute',top:8,left:30,
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
