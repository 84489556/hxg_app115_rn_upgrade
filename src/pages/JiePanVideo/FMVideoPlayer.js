/*
 * @Author: lishuai
 * @Date: 2019-09-18 13:38:36
 * @Last Modified by: lishuai
 * @Last Modified time: 2019-09-18 15:09:09
 * 展示直播播放器组件
 */


import React, { Component } from 'react';
import VideoView from '../Home/LiveLessionPage/VideoView';
import VideoPlayerView from '../../../Libraries/FMVideoPlayer/NativeVideoView';
import {
    TouchableWithoutFeedback,
    TouchableHighlight,
    ImageBackground,
    TouchableOpacity,
    PanResponder,
    StyleSheet,
    Touchable,
    Animated,
    Platform,
    Easing,
    Image,
    View,
    Text,
} from 'react-native';
import _ from 'lodash';
// import Slider from "react-native-slider";
import * as baseStyle from '../../components/baseStyle';
import Orientation from 'react-native-orientation';
// import UserInfoUtil from "../../utils/UserInfoUtil";
//获取屏幕的宽和高
var Dimensions = require('Dimensions');
var width;
var height;

var backImage = require('../../images/livelession/video_player_nav_back_icon.png');
var topBackground = require('../../images/livelession/topBackground.png');
var bottomBackground = require('../../images/livelession/zhedangxia.png');
// var play = require('../../images/livelession/play.png');
// var stop = require('../../images/livelession/pause.png');
var fullBtn = require('../../images/livelession/fullscrean.png');
var littleBtn = require('../../images/livelession/littlescrean.png');
var fullplay = require('../../images/livelession/icon-fullplay.png');
var fullstop = require('../../images/livelession/icon-fullstop.png');
var listening=require('../../images/livelession/player/listening_white.png');
var play=require('../../images/livelession/player/playing_white.png');
var stop=require('../../images/livelession/player/zanting.png');

export default class FMVideoPlayer extends Component {

    static defaultProps = {
        showOnStart: true,
        resizeMode: 'stretch',
        playWhenInactive: false,
        playInBackground: false,
        title: '',
        repeat: false,
        paused: false,
        muted: false,
        volume: 1,
        rate: 1,
    };

    constructor(props) {
        super(props);

        /**
         * All of our values that are updated by the
         * methods and listeners in this class
         */

        width = props.width;
        height = props.height;

        this.state = {
            // Video
            resizeMode: this.props.resizeMode,
            paused: this.props.paused || false,
            muted: this.props.muted,
            volume: this.props.volume,
            rate: this.props.rate,
            init: true,
            // Controls

            isFullscreen: false,
            showTimeRemaining: true,
            volumeTrackWidth: 0,
            lastScreenPress: 0,
            volumeFillWidth: 0,
            seekerFillWidth: 0,
            showControls: this.props.showOnStart,
            volumePosition: 0,
            seekerPosition: 0,
            volumeOffset: 0,
            seekerOffset: 0,
            seeking: false,

            currentTime: 0,
            duration: this.props.duration,
            error: false,
            loading: false,
            showMobile: false,
            isShowFullscreenbtn: true,
            itemClicked: false,
            isClickPlayButton: false,


        };


        /**
         * Any options that can be set at init.
         */
        this.opts = {
            playWhenInactive: this.props.playWhenInactive,
            playInBackground: this.props.playInBackground,
            repeat: this.props.repeat,
            title: this.props.title,
        };

        /**
         * Our app listeners and associated methods
         */
        this.events = {
            onError: this.props.onError || this._onError.bind(this),
            onEnd: this.props.onEnd || this._onEnd.bind(this),
            onScreenTouch: this._onScreenTouch.bind(this),
            onLoadStart: this._onLoadStart.bind(this),
            onProgress: this._onProgress.bind(this),
            onLoad: this._onLoad.bind(this),
        };

        /**
         * Functions used throughout the application
         */
        this.methods = {
            onBack: this.props.onBack || this._onBack.bind(this),
            toggleFullscreen: this._toggleFullscreen.bind(this),
            togglePlayPause: this._togglePlayPause.bind(this),
            toggleControls: this._toggleControls.bind(this),
            toggleTimer: this._toggleTimer.bind(this),
            netState: this.netState.bind(this),
        };

        /**
         * Player information
         */
        this.player = {
            controlTimeoutDelay: this.props.controlTimeout || 15000,
            volumePanResponder: PanResponder,
            seekPanResponder: PanResponder,
            controlTimeout: null,
            volumeWidth: 150,
            iconOffset: 7,
            seekWidth: 0,
            // ref: VideoView,  FIXME:调试iOS播放器的时候注释掉的此行代码
        };

        /**
         * Various animations
         */
        const initialValue = this.props.showOnStart ? 1 : 0;

        this.animations = {
            bottomControl: {
                marginBottom: new Animated.Value(0),
                opacity: new Animated.Value(initialValue),
            },
            topControl: {
                marginTop: new Animated.Value(0),
                opacity: new Animated.Value(initialValue),
            },
            video: {
                opacity: new Animated.Value(1),
            },
            loader: {
                rotate: new Animated.Value(0),
                MAX_VALUE: 360,
            },
            fullplay: {
                opacity: new Animated.Value(initialValue),
            }
        };

        /**
         * Various styles that be added...
         */
        this.styles = {
            videoStyle: this.props.videoStyle || {},
            containerStyle: this.props.style || {}
        };
    }



    /**
     | -------------------------------------------------------
     | Events
     | -------------------------------------------------------
     |
     | These are the events that the <Video> component uses
     | and can be overridden by assigning it as a prop.
     | It is suggested that you override onEnd.
     |
     */

    /**
     * When load starts we display a loading icon
     * and show the controls.
     */
    _onLoadStart() {
        let state = this.state;
        state.loading = true;
        this.loadAnimation();
        this.setState(state);

        if (typeof this.props.onLoadStart === 'function') {
            this.props.onLoadStart(...arguments);
        }
    }
    //
    /**
     * When load is finished we hide the load icon
     * and hide the controls. We also set the
     * video duration.
     *
     * @param {object} data The video meta data
     */
    _onLoad(data = {}) {
        let state = this.state;

        state.duration = data.duration;
        state.loading = false;
        this.setState(state);

        if (state.showControls) {
            this.setControlTimeout();
        }

        if (typeof this.props.onLoad === 'function') {
            this.props.onLoad(...arguments);
        }
    }

    /**
     * For onprogress we fire listeners that
     * update our seekbar and timer.
     *
     * @param {object} data The video meta data
     */
    _onProgress(currentTime) {
        let state = this.state;
        state.currentTime = currentTime;

        if (typeof this.props.onProgress === 'function') {

            this.props.onProgress(state.duration-currentTime);
        }

        this.setState(state);

    }

    _onEnd() { }

    /**
     * Set the error state to true which then
     * changes our renderError function
     *
     * @param {object} err  Err obj returned from <Video> component
     */
    _onError(err) {
        let state = this.state;
        state.error = true;
        state.loading = false;

        this.setState(state);
    }

    /**
     * This is a single and double tap listener
     * when the user taps the screen anywhere.
     * One tap toggles controls, two toggles
     * fullscreen mode.
     */
    _onScreenTouch() {
        let state = this.state;
        const time = new Date().getTime();
        const delta = time - state.lastScreenPress;
        if (state.error)
            return;
        if (delta < 300) {
            state.lastScreenPress = 0;
            this.methods.togglePlayPause();
        }

        this.methods.toggleControls();
        state.lastScreenPress = time;

        this.setState(state);
    }
    //网络状态
    netState(state) {
        //console.log('网络状态', state);
        if (state.status == 'NONE' || state.status == 'none') {
            this.setState({ error: true, loading: false, showMobile: false, paused: false }, () => {
                this.pause();
            });
        } else if (state.status == 'MOBILE' || state.status == 'cell') {
            this.setState({ showMobile: true, error: false, loading: false, paused: false }, () => {
                this.pause();
            });
        }
        else if (state.status == 'WIFI' || state.status == 'wifi') {
            this.setState({ error: false, showMobile: false, loading: false, paused: true }, () => {
                this.start();
            });
        }
    }


    /**
     | -------------------------------------------------------
     | Methods
     | -------------------------------------------------------
     |
     | These are all of our functions that interact with
     | various parts of the class. Anything from
     | calculating time remaining in a video
     | to handling control operations.
     |
     */

    /**
     * Set a timeout when the controls are shown
     * that hides them after a length of time.
     * Default is 15s
     */
    setControlTimeout() {
        this.player.controlTimeout = setTimeout(() => {
            this._hideControls();
        }, this.player.controlTimeoutDelay);
    }

    /**
     * Clear the hide controls timeout.
     */
    clearControlTimeout() {
        clearTimeout(this.player.controlTimeout);
    }

    /**
     * Reset the timer completely
     */
    resetControlTimeout() {
        this.clearControlTimeout();
        this.setControlTimeout();
    }

    /**
     * Animation to hide controls. We fade the
     * display to 0 then move them off the
     * screen so they're not interactable
     */
    hideControlAnimation() {
        Animated.parallel([
            Animated.timing(
                this.animations.fullplay.opacity, {
                    easing: Easing.easeInEaseOut,
                    toValue: 0
                }
            ),]).start();
        Animated.parallel([
            Animated.timing(
                this.animations.topControl.opacity,
                { toValue: 0 }
            ),
            Animated.timing(
                this.animations.topControl.marginTop,
                { toValue: -40 }
            ),
            Animated.timing(
                this.animations.bottomControl.opacity,
                { toValue: 0 }
            ),
            Animated.timing(
                this.animations.bottomControl.marginBottom,
                { toValue: -40 }
            ),
        ]).start();
    }

    /**
     * Animation to show controls...opposite of
     * above...move onto the screen and then
     * fade in.
     */
    showControlAnimation() {

        Animated.parallel([
            Animated.timing(
                this.animations.fullplay.opacity,
                {
                    easing: Easing.easeInEaseOut,
                    toValue: 1
                }
            ),
            Animated.timing(
                this.animations.topControl.opacity,
                { toValue: 1 }
            ),
            Animated.timing(
                this.animations.topControl.marginTop,
                { toValue: 0 }
            ),
            Animated.timing(
                this.animations.bottomControl.opacity,
                { toValue: 1 }
            ),

            Animated.timing(
                this.animations.bottomControl.marginBottom,
                { toValue: 0 }
            ),

        ]).start();
    }

    /**
     * Loop animation to spin loader icon. If not loading then stop loop.
     */
    loadAnimation() {
        if (this.state.loading) {
            Animated.sequence([
                Animated.timing(
                    this.animations.loader.rotate,
                    {
                        toValue: this.animations.loader.MAX_VALUE,
                        duration: 1500,
                        easing: Easing.linear,
                    }
                ),
                Animated.timing(
                    this.animations.loader.rotate,
                    {
                        toValue: 0,
                        duration: 0,
                        easing: Easing.linear,
                    }
                ),
            ]).start(this.loadAnimation.bind(this));
        }
    }

    /**
     * Function to hide the controls. Sets our
     * state then calls the animation.
     */
    _hideControls() {
        let state = this.state;
        state.showControls = false;
        this.hideControlAnimation();

        this.setState(state);
    }

    /**
     * Function to toggle controls based on
     * current state.
     */
    _toggleControls() {
        let state = this.state;
        state.showControls = !state.showControls;

        if (state.showControls) {
            this.showControlAnimation();
            this.setControlTimeout();
            !this.props.isShowFullscreenbtn && this.props.hiddenAboutVideoView()
        }
        else {
            this.hideControlAnimation();
            this.clearControlTimeout();
        }

        this.setState(state);
    }

    /**
     * Toggle fullscreen changes resizeMode on
     * the <Video> component then updates the
     * isFullscreen state.
     */
    _toggleFullscreen() {
        let state = this.state;
        state.isFullscreen = !state.isFullscreen;
        // state.resizeMode = state.isFullscreen === true ? 'cover' : 'contain';
        this.props.onFullBtnPress(state.isFullscreen);
        this.setState(state, () => {
        });
    }

    /**
     * Toggle playing state on <Video> component
     */
    _togglePlayPause() {
        let state = this.state;

        state.paused = !state.paused;
        this.setState(state, () => {
            if (!state.paused) {
                // if (!this.state.showMobile && !this.state.error) {
                    this.player.ref.start();
                // }
                this.timer = setInterval(
                    () => {
                        if (Platform.OS == 'android')
                            this.player.ref && this.player.ref.getPositionForRN()
                        else
                            this.player.ref && this.player.ref.getPosition();
                    },
                    1000,
                );
            }
            else {
                this.player.ref && this.player.ref.pause();
                clearInterval(this.timer);
            }
        });

    }
    pause() {
        this.setState({paused:false},()=>{
            this._togglePlayPause();
        })
    }
    start() {
        this.setState({paused:true},()=>{
            this._togglePlayPause();
        });
    }
    /**
     * Toggle between showing time remaining or
     * video duration in the timer control
     */
    _toggleTimer() {
        let state = this.state;
        state.showTimeRemaining = !state.showTimeRemaining;
        this.setState(state);
    }

    /**
     * The default 'onBack' function pops the navigator
     * and as such the video player requires a
     * navigator prop by default.
     */
    _onBack() {
        if (!this.state.isFullscreen) {
            if (this.props.navigation) {
                this.releaseTimer();
                this.player.ref.release();
                Navigation.pop(this.props.navigation);
            }
            else {
                console.warn('Warning: _onBack requires navigator property to function. Either modify the onBack prop or pass a navigator prop');
            }
        }
        else {
            this._toggleFullscreen();
        }
    }

    /**
     * Calculate the time to show in the timer area
     * based on if they want to see time remaining
     * or duration. Formatted to look as 00:00.
     */
    calculateTime() {
        if (this.state.showTimeRemaining) {
            const time = this.state.duration;
            return `${this.formatTime(time / 1000)}`;
        }

        return this.formatTime(this.state.duration / 1000);
    }
    currentTime() {

        return this.formatTime(this.state.currentTime / 1000);
    }

    /**
     * Format a time string as mm:ss
     *
     * @param {int} time time in milliseconds
     * @return {string} formatted time string in mm:ss format
     */
    formatTime(time = 0) {
        const symbol = this.state.showRemainingTime ? '-' : '';
        // time = Math.min(
        //     Math.max( time, 0 ),
        //     this.state.duration
        // );

        const formattedMinutes = _.padStart(Math.floor(time / 60).toFixed(0), 2, 0);
        const formattedSeconds = _.padStart(Math.floor(time % 60).toFixed(0), 2, 0);

        return `${symbol}${formattedMinutes}:${formattedSeconds}`;
    }

    /**
     * Set the position of the seekbar's components
     * (both fill and handle) according to the
     * position supplied.
     *Mat
     * @param {float} position position in px of seeker handle}
     */
    setSeekerPosition(position = 0) {
        let state = this.state;
        position = this.constrainToSeekerMinMax(position);

        state.seekerFillWidth = position;
        state.seekerPosition = position;

        if (!state.seeking) {
            state.seekerOffset = position
        };

        this.setState(state);
    }

    /**
     * Contrain the location of the seeker to the
     * min/max value based on how big the
     * seeker is.
     *
     * @param {float} val position of seeker handle in px
     * @return {float} contrained position of seeker handle in px
     */
    constrainToSeekerMinMax(val = 0) {
        if (val <= 0) {
            return 0;
        }
        else if (val >= this.player.seekerWidth) {
            return this.player.seekerWidth;
        }
        return val;
    }

    /**
     * Calculate the position that the seeker should be
     * at along its track.
     *
     * @return {float} position of seeker handle in px based on currentTime
     */
    calculateSeekerPosition() {
        const percent = this.state.currentTime / this.state.duration;
        return this.player.seekerWidth * percent;
    }

    /**
     * Return the time that the video should be at
     * based on where the seeker handle is.
     *
     * @return {float} time in ms based on seekerPosition.
     */
    calculateTimeFromSeekerPosition() {
        const percent = this.state.seekerPosition / this.player.seekerWidth;
        return this.state.duration * percent;
    }

    /**
     * Seek to a time in the video.
     *
     * @param {float} time time to seek to in ms
     */
    seekTo(time = 0) {
        let state = this.state;
        state.currentTime = time;
        this.player.ref.seekTo(state.currentTime);
        this.setState(state);
    }

    /**
     * Set the position of the volume slider
     *
     * @param {float} position position of the volume handle in px
     */
    setVolumePosition(position = 0) {
        let state = this.state;
        position = this.constrainToVolumeMinMax(position);
        state.volumePosition = position + this.player.iconOffset;
        state.volumeFillWidth = position;

        state.volumeTrackWidth = this.player.volumeWidth - state.volumeFillWidth;

        if (state.volumeFillWidth < 0) {
            state.volumeFillWidth = 0;
        }

        if (state.volumeTrackWidth > 150) {
            state.volumeTrackWidth = 150;
        }

        this.setState(state);
    }

    /**
     * Constrain the volume bar to the min/max of
     * its track's width.
     *
     * @param {float} val position of the volume handle in px
     * @return {float} contrained position of the volume handle in px
     */
    constrainToVolumeMinMax(val = 0) {
        if (val <= 0) {
            return 0;
        }
        else if (val >= this.player.volumeWidth + 9) {
            return this.player.volumeWidth + 9;
        }
        return val;
    }

    /**
     * Get the volume based on the position of the
     * volume object.
     *
     * @return {float} volume level based on volume handle position
     */
    calculateVolumeFromVolumePosition() {
        return this.state.volumePosition / this.player.volumeWidth;
    }

    /**
     * Get the position of the volume handle based
     * on the volume
     *
     * @return {float} volume handle position in px based on volume
     */
    calculateVolumePositionFromVolume() {
        return this.player.volumeWidth / this.state.volume;
    }



    /**
     | -------------------------------------------------------
     | React Component functions
     | -------------------------------------------------------
     |
     | Here we're initializing our listeners and getting
     | the component ready using the built-in React
     | Component methods
     |
     */

    /**
     * Before mounting, init our seekbar and volume bar
     * pan responders.
     */
    componentWillMount() {
        // this.initSeekPanResponder();
        // this.initVolumePanResponder();


    }

    /**
     * To allow basic playback management from the outside
     * we have to handle possible props changes to state changes
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps!= this.props) {

            this.showControlAnimation();
            this.props.width = nextProps.width;
            this.props.height = nextProps.height;
            width = nextProps.width;
            height = nextProps.height;
            this.setState({ isFullscreen: nextProps.height == 211 ? false : true });
            Platform.OS == 'ios' && this.player.ref.reloadView({ width: nextProps.width, height: nextProps.height });
        }

    }

    /**
     * Upon mounting, calculate the position of the volume
     * bar based on the volume property supplied to it.
     */
    componentDidMount() {

        Platform.OS == 'ios' && !this.state.showMobile && !this.state.error && this.start();


    }

    /**
     * When the component is about to unmount kill the
     * timeout less it fire in the prev/next scene
     */
    componentWillUnmount() {
        this.releaseTimer();
        this.player.ref.release();
    }
    releaseTimer() {
        this.clearControlTimeout();
        clearTimeout(this.timer);
    }



    /**
     * Get our seekbar responder going
     */


    /**
     * Initialize the volume pan responder.
     */
    initVolumePanResponder() {
        this.player.volumePanResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => {
                this.clearControlTimeout();
            },

            /**
             * Update the volume as we change the position.
             * If we go to 0 then turn on the mute prop
             * to avoid that weird static-y sound.
             */
            onPanResponderMove: (evt, gestureState) => {
                let state = this.state;
                const position = this.state.volumeOffset + gestureState.dx;

                this.setVolumePosition(position);
                state.volume = this.calculateVolumeFromVolumePosition();

                if (state.volume <= 0) {
                    state.muted = true;
                }
                else {
                    state.muted = false;
                }

                this.setState(state);
            },

            /**
             * Update the offset...
             */
            onPanResponderRelease: (evt, gestureState) => {
                let state = this.state;
                state.volumeOffset = state.volumePosition;
                this.setControlTimeout();
                this.setState(state);
            }
        });
    }


    /**
     | -------------------------------------------------------
     | Rendering
     | -------------------------------------------------------
     |
     | This section contains all of our render methods.
     | In addition to the typical React render func
     | we also have all the render methods for
     | the controls.
     |
     */

    /**
     * Standard render control function that handles
     * everything except the sliders. Adds a
     * consistent <TouchableHighlight>
     * wrapper and styling.
     */
    renderControl(children, callback, style = {}) {
        return (
            <TouchableOpacity
                underlayColor="transparent"
                activeOpacity={0.3}
                onPress={() => {
                    this.resetControlTimeout();
                    if (!this.props.isShowFullscreenbtn) {
                        Orientation.lockToPortrait();
                        Navigation.pop(this.props.navigation)
                    }
                    callback();
                }}
                style={[
                    styles.controls.control,
                    style
                ]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    /**
     * Renders an empty control, used to disable a control without breaking the view layout.
     */
    renderNullControl() {
        return (
            <View style={[styles.controls.control]} />
        );
    }

    /**
     * Groups the top bar controls together in an animated
     * view and spaces them out.
     */
    renderTopControls() {

        const backControl = !this.props.disableBack ? this.renderBack() : this.renderNullControl();

        return (
            <Animated.View style={[
                styles.controls.top,
                {
                    opacity: this.animations.topControl.opacity,
                    marginTop: this.animations.topControl.marginTop,
                    width: this.props.width,
                }
            ]}>
                <ImageBackground
                    source={topBackground}
                    style={[styles.controls.column]}
                    imageStyle={[styles.controls.vignette]}>
                    <View style={styles.controls.topControlGroup}>
                        {backControl}
                    </View>
                </ImageBackground>
            </Animated.View>
        );
    }

    /**
     * Back button control
     */
    renderBack() {

        return this.renderControl(
            <Image
                source={backImage}
                style={styles.controls.back}
            />,
            this.methods.onBack,
        );
    }

    /**
     * Render the volume slider and attach the pan handlers
     */
    renderVolume() {

        return (
            <View style={styles.volume.container}>
                <View style={[
                    styles.volume.fill,
                    { width: this.state.volumeFillWidth }
                ]} />
                <View style={[
                    styles.volume.track,
                    { width: this.state.volumeTrackWidth }
                ]} />
                <View
                    style={[
                        styles.volume.handle,
                        { left: this.state.volumePosition }
                    ]}
                    {...this.player.volumePanResponder.panHandlers}
                >
                    {/*<Image style={ styles.volume.icon } source={ require( './assets/img/volume.png' ) } />*/}
                </View>
            </View>
        );
    }

    /**
     * Render fullscreen toggle and set icon based on the fullscreen state.
     */
    renderFullscreen() {

        let source = this.state.isFullscreen === true ? littleBtn : fullBtn;
        return this.renderControl(
            <Image source={source} />,
            this.methods.toggleFullscreen,
            styles.controls.fullscreen
        );
    }

    renderPlayOrPauseControls() {
        let source = this.state.paused === true ? fullplay : fullstop;

        return (
            <View style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor:baseStyle.BLACK_000000_60,
            }}>

                    <View source={source} style={{

                    }} >
                        <View style={{flexDirection:'row',marginBottom:20,}}>
                            <TouchableOpacity onPress={()=>{
                            this.methods.togglePlayPause();
                        }}>{this.renderPlayPause()}
                        </TouchableOpacity>
                        <Text style={{marginLeft:5,fontSize:15,color:'white'}}>
                            {!this.state.paused?'语音播放中':'语音暂停'}
                        </Text>
                        </View>
                        <TouchableOpacity onPress={()=>{
                            this.props.onChangeVideo&&this.props.onChangeVideo();
                        }}>
                        <View style={{marginLeft:5,borderRadius:17,width:103,height:36,borderColor:'white',borderWidth:1,backgroundColor:'transparent',justifyContent:'center',alignItems:'center'}}>
                            <Text style={{fontSize:12,color: 'white'}}>{'切换视频播放'}</Text>
                        </View>
                        </TouchableOpacity>
                    </View>

            </View>
        )

    }

    /**
     * Render bottom control group and wrap it in a holder
     */
    renderBottomControls() {

        // const playPauseControl = !this.props.disablePlayPause ? this.renderPlayPause() : this.renderNullControl();
        const playPauseControl = this.renderPlayPause();
        // const timerControl = !this.props.disableTimer ? this.renderTimer() : this.renderNullControl();
        // const seekbarControl = !this.props.disableSeekbar ? this.renderSeekbar() : this.renderNullControl();
        const fullscreenControl =
            !this.props.disableFullscreen ? this.renderFullscreen() : this.renderNullControl();
        if (this.state.error || this.state.showMobile)
            return null;
        return (
            <Animated.View style={[
                styles.controls.bottom,

                {
                    opacity: this.animations.bottomControl.opacity,
                    marginBottom: this.animations.bottomControl.marginBottom,
                    width: this.props.width,
                }
            ]}>
                <ImageBackground
                    source={bottomBackground}
                    style={[styles.controls.column]}
                    imageStyle={[styles.controls.vignette]}>

                    <View style={[
                        styles.controls.row,
                        styles.controls.bottomControlGroup
                    ]}>
                        {/*{playPauseControl}*/}
                        {/*{this.currentTimeControl()}*/}
                        {/*{seekbarControl}*/}
                        {/*{timerControl}*/}
                        {fullscreenControl}

                    </View>
                </ImageBackground>
            </Animated.View>
        );
    }

    /**
     * Render the play/pause button and show the respective icon
     */
    renderPlayPause() {

        let source = this.state.paused === true ? play : stop;
        return this.renderControl(
            <Image source={source} style={{ width: 24, height: 15, alignItems: 'center', resizeMode: 'stretch' }} />,
            this.methods.togglePlayPause,
            styles.controls.playPause
        );
    }

    /**
     * Render our title...if supplied.
     */
    currentTimeControl() {

        return this.renderControl(
            <Text style={styles.controls.titleText}>
                {this.currentTime()}
            </Text>,
            this.methods.toggleTimer,
            styles.controls.title,
        );

    }

    /**
     * Show our timer.
     */
    renderTimer() {

        return this.renderControl(
            <Text style={styles.controls.timerText}>
                {this.calculateTime()}
            </Text>,
            this.methods.toggleTimer,
            styles.controls.timer
        );
    }

    renderMobileView() {
        if (this.state.showMobile) {
            const formattedMinutes = _.padStart(Math.floor(this.state.duration / 1000 / 60).toFixed(0), 2, 0);
            return (
                <TouchableWithoutFeedback
                    onPress={
                        this.methods.toggleControls
                    }>
                    <View style={[styles.loader.container, {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }]}>
                        <Text style={{ fontSize: 12, color: '#FFFFFF' }}>
                            正在使用非WIFI网络，播放将产生流量费用
                        </Text>
                        <TouchableOpacity onPress={() => {
                            this.setState({ showMobile: false },
                                this.methods.togglePlayPause
                            );
                        }}>
                            <Image style={{ marginTop: 12, width: 85, height: 34 }}
                                   source={require('../../images/livelession/video_play.png')} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 10 }}>
                            {/*{formattedMinutes>0&&'预计'+formattedMinutes+'分钟'}*/}
                        </Text>

                    </View>
                </TouchableWithoutFeedback>
            )
        }
    }

    /**
     * Show loading icon
     */
    renderLoader() {
        if (this.state.loading) {
            return (
                <View style={[styles.loader.container, {
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }]}>
                    <Animated.Image source={require('../../images/livelession/MorningUnderstand/buffering.gif')} style={[
                        styles.loader.icon,
                        {
                            transform: [
                                {
                                    rotate: this.animations.loader.rotate.interpolate({
                                        inputRange: [0, 360],
                                        outputRange: ['0deg', '360deg']
                                    })
                                }
                            ]
                        }
                    ]} />
                    <Text></Text>
                </View>
            );
        }
        return null;
    }

    renderError() {
        if (this.state.error) {
            return (
                <TouchableWithoutFeedback
                    onPress={
                        this.methods.toggleControls
                    }
                >
                    <View style={styles.error.container}>
                        <Image source={require('../../images/livelession/loadError.png')} style={styles.error.icon} />
                        <Text style={styles.error.text}>
                            亲亲，咱们要失联了...
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        }
        return null;
    }
    switchUrl(url) {
        this.setState({
            showMobile: false,
            currentTime: 0,
            loading: false,
            error: false,
            paused: false,
        });
        this.player.ref && this.player.ref.switchUrl(url);
    }

    render() {

        let width = this.props.width;
        let height = this.props.height;
        return (
                <View style={[styles.container, {
                    width: width,
                    height: height, marginLeft: 0,
                    marginBottom: 0,
                    backgroundColor:'black',
                }, this.styles.containerStyle]}>
                    {this._renderVideoView()}
                    <Image ref={videoImage => this.videoImage = videoImage} source={{ uri: this.state.init ? this.props.imageUrl : '' }}
                           style={[{
                               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: width,
                               height: height, resizeMode: 'stretch'
                           }]} />
                    { this.renderPlayOrPauseControls()}

                </View>
        )
    }
    _renderVideoView() {
        if (Platform.OS == 'android') {
            if (this.player.ref || !this.state.error) {
                return (<VideoView style={{width: this.props.width, height: this.props.height}}
                                   ref={videoPlayer => this.player.ref = videoPlayer}
                                   VideoPath={this.props.videoPath}
                                   getStreamState={(event) => {
                                       this.setState({duration: event.nativeEvent.allTime}, () => {
                                           this.setState({isClickPlayButton: true}, () => {
                                               if (!this.state.error && !this.state.showMobile)
                                                   this.player.ref.start();
                                           })
                                       });
                                   }}
                                   getOverLiveEvent={() => {

                                   }}
                                   getPlayState={() => {
                                       let state = this.state;
                                       if (state.init == true)
                                           state.init = false;
                                       this.setState(state,()=>{
                                        this.props.onChangePlayerStatus&&this.props.onChangePlayerStatus(1);
                                       });
                                   }}
                                   getPauseState={() => {
                                    this.props.onChangePlayerStatus&&this.props.onChangePlayerStatus(0);
                                   }}
                                   getBufferStartState={() => {
                                       !this.state.error && !this.state.paused && this.setState({loading: true})
                                   }}
                                   getBufferEndState={() => {
                                       let state = this.state;
                                       state.loading = false;

                                       this.setState(state);
                                   }}
                                   getReleaseEvent={() => {
                                       this.props.onRelease()
                                   }}
                                   getVodOverState={() => {
                                       this.setState({paused: true, currentTime: 0}, () => {
                                           this._showContraller();
                                       })
                                   }}
                                   getCurrentPosition={(event) => {
                                       if (!this.state.paused && parseInt(event.nativeEvent.currentPosition) < parseInt(this.state.duration)) {
                                           this.events.onProgress(event.nativeEvent.currentPosition);
                                       }
                                   }}
                />)
            }
                else
                    return null;

                // return (
                //     <VideoView style={{width:this.state.width,height:this.state.height,}}
                //                    ref={videoPlayer => this.player.ref = videoPlayer}
                //                    VideoPath='http://vodeweylgie.vod.126.net/vodeweylgie/GOnrCeEJ_2709660024_hd.mp4'//{this.props.videoPath}
                //                    getStreamState={(event) => {
                //                        this.setState({loading: false, duration: event.nativeEvent.allTime}, () => {
                //                            this.setState({isClickPlayButton: true}, () => {
                //                                if (!this.state.error && !this.state.showMobile) {
                //                                    this.start();
                //                                }
                //                            })
                //                        });
                //                    }}
                //                    getOverLiveEvent={() => {
                //
                //                    }}
                //
                //                    getPlayState={() => {
                //
                //                    }}
                //                    getPauseState={() => {
                //                    }}
                //                    getBufferStartState={() => {
                //                        !this.state.error && !this.state.paused && this.setState({loading: true})
                //                    }}
                //                    getBufferEndState={() => {
                //                        this.setState({loading: false})
                //                    }}
                //                    getReleaseEvent={() => {
                //                        this.props.onRelease&&this.props.onRelease()
                //                    }}
                //                    getVodOverState={() => {
                //                        this.setState({paused: true, currentTime: 0}, () => {
                //
                //                        })
                //                    }}
                //                    getCurrentPosition={(event) => {
                //                        // this.setState({paused:false});
                //                        this.events.onProgress(event.nativeEvent.currentPosition);
                //
                //                    }}
                // />
                //
                // )

        } else {
            return <VideoPlayerView style={[styles.player.video, this.styles.videoStyle]}
                                    videoPath={this.props.videoPath}
                                    firstPlay={this.props.firstPlay}
                                    ref={videoPlayer => this.player.ref = videoPlayer}
                                    getCurrentPosition={(currentTime) => {
                                        // this.setState({loading: false});
                                         this.events.onProgress(currentTime);
                                    }}
                                    getDuration={(duration) => {
                                        this.setState({duration: duration});
                                    }}
                                    getBufferStartState={() => {
                                        // !this.state.error && !this.state.paused && this.setState({loading: true,})
                                        // console.log('加载中',this.state.error,this.state.paused,this.state.loading);
                                    }}
                                    getPlayingState={()=>{
                                        this.props.onChangePlayerStatus&&this.props.onChangePlayerStatus(1);
                                    }}
                                    getPausedState={()=>{
                                        this.props.onChangePlayerStatus&&this.props.onChangePlayerStatus(0);
                                    }}
                                    getBufferEndState={() => {
                                        // this.setState({loading: false}, () => {
                                        //     this._showContraller();
                                        // })
                                    }}
                                    getStreamState={() => {
                                        // if (this.props.progress > 0 && this.onToSeek) {
                                        //     this.player.ref && this.player.ref.seekTo(Math.floor(this.props.progress));
                                        //     this.onToSeek = false;
                                        //
                                        // }

                                    }}

                                    getVideoFinishState={() => {
                                        this.setState({
                                            paused: true,
                                            currentTime: 0,
                                        }, () => {
                                            this.methods.toggleControls();

                                        })


                                    }}
                                    getErrorState={() => {
                                        // this.setState({error: true, errortype: 2})
                                    }}
            />
        }

    }
    _hiddenContraller() {
        let state = this.state;
        state.showControls = false;
        this.hideControlAnimation();
        this.clearControlTimeout();
        this.setState(state)
    }
    _showContraller() {
        let state = this.state;
        state.showControls = true;
        this.showControlAnimation();
        this.clearControlTimeout();
        this.setState(state);
    }

}



/**
 * This object houses our styles. There's player
 * specific styles and control specific ones.
 * And then there's volume/seeker styles.
 */
const styles = {
    player: StyleSheet.create({
        container: {
            // flex: 1,
            alignSelf: 'stretch',
            justifyContent: 'space-between',
            backgroundColor: '#000',
        },
        video: {
            // flex:1,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,

        },
    }),
    error: StyleSheet.create({
        container: {
            backgroundColor: '#262628',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
        },
        icon: {
            marginBottom: 16,
        },
        text: {
            backgroundColor: 'transparent',
            color: '#ffffff'
        },
    }),
    loader: StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
    }),
    controls: StyleSheet.create({
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: null,
            width: null,
        },
        column: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        vignette: {
            resizeMode: 'stretch',
            width: width,
            flex: 1,
        },
        // control: {
        //     padding: 16,
        // },
        text: {
            backgroundColor: 'transparent',
            color: '#FFF',
            fontSize: 14,
            textAlign: 'center',
        },
        pullRight: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        top: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            alignItems: 'stretch',
            justifyContent: 'flex-start',
        },
        bottom: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'stretch',
            height: 40,
            justifyContent: 'flex-end',

        },
        topControlGroup: {
            alignSelf: 'stretch',
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
        },
        bottomControlGroup: {
            flex: 1,
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        volume: {
            flexDirection: 'row',
        },
        fullscreen: {
            justifyContent: 'flex-end',
            marginRight: 15,
            marginLeft: 10,
        },
        playPause: {
            position: 'relative',
            resizeMode: 'stretch',
        },
        title: {
            marginLeft: 10,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',

        },
        titleText: {
            textAlign: 'center',
            backgroundColor: 'transparent',
            color: '#FFF',
            fontSize: 11,
        },
        timer: {
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            // width: 80,
        },
        timerText: {
            backgroundColor: 'transparent',
            color: '#FFF',
            fontSize: 11,
            textAlign: 'right',
        },
        back: {

            resizeMode: 'contain',
            width: 32,
            height: 32,
            marginLeft: 15,
        }
    }),

};
