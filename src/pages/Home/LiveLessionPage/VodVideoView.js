import React,{ Component} from 'react';
import {
    requireNativeComponent,
    View,
    UIManager,
    findNodeHandle,
} from 'react-native';

import PropTypes from 'prop-types';

var RCT_VIDEO_REF = 'VodVideoView';

class VodVideoView extends Component{
    constructor(props){
        super(props);
    }

    _onCaching(event){
        if(!this.props.onCaching){
            
            return;
        }
        this.props.onCaching(event);
    }
    _getPauseStateForJava(){
        if(!this.props.getPauseStateForJava){
            
            return;
        }
        this.props.getPauseStateForJava();
    }
    _getPlayStateForJava(){
        if(!this.props.getPlayStateForJava){
            
            return;
        }
        this.props.getPlayStateForJava();
    }

     _onSeek(event){
        if(!this.props.onSeek){
            return;
        }
        this.props.onSeek(event.nativeEvent.onSeek);
    }

     _getPlayTime(event){
        if(!this.props.getPlayTime){
            return;
        }
        this.props.getPlayTime(event.nativeEvent.getPlayTime);
    }

    _onPrepared(event){
        if(!this.props.onPrepared){
            return;
        }
        this.props.onPrepared(event.nativeEvent.duration);
    }

    _onError(){
        if(!this.props.onError){
            return;
        }
        this.props.onError();
    }
    

    _onBufferUpdate(event){
        if(!this.props.onBufferUpdate){
            return;
        }
        this.props.onBufferUpdate(event.nativeEvent.buffer);
    }

    _onProgress(event){
        if(!this.props.onProgress){
            return;
        }
        this.props.onProgress(event.nativeEvent.progress);
    }

     _onCompletion(event){
        if(!this.props.onCompletion){
            return;
        }
        this.props.onCompletion(event.nativeEvent);
    }

    

    pause(){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.pause,//Commands.pause与native层定义的COMMAND_PAUSE_NAME一致
            null//命令携带的参数数据
        );
    }

    resume(){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.resume,
            null//命令携带的参数数据
        );
    }

    start(){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.start,
            null
        );
    }

    leave(){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.leave,
            null
        );  
    }

    init(){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.init,
            null
        );  
    }
    seekTo(position){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.seekTo,
            [position]
        );  
    }
    switch(seek){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.switch,
            [seek]
        );  
    }
    switchUrl(seek) {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeVodVideo.Commands.switch,
            [seek]
        );  
    }
    render(){
        return <RCTVodVideoView
            {...this.props}
            ref = {RCT_VIDEO_REF}
            onPrepared={this._onPrepared.bind(this)}
            onCompletion={this._onCompletion.bind(this)}
            onError={this._onError.bind(this)}
            onBufferUpdate={this._onBufferUpdate.bind(this)}
            onProgress={this._onProgress.bind(this)}
            onSeek={this._onSeek.bind(this)}
            getPlayTime={this._getPlayTime.bind(this)}
            onCaching = {this._onCaching.bind(this)}
            getPauseStateForJava = {this._getPauseStateForJava.bind(this)}
            getPlayStateForJava = {this._getPlayStateForJava.bind(this)}

           
        />;
    };
}

VodVideoView.name = "VodVideoView";
VodVideoView.propTypes = {
    onPrepared:PropTypes.func,
    onCompletion:PropTypes.func,
    onError:PropTypes.func,
    onBufferUpdate:PropTypes.func,
    onProgress:PropTypes.func,
    onSeek:PropTypes.func,
    getPlayTime:PropTypes.func,
    onCaching:PropTypes.func,
    getPauseStateForJava:PropTypes.func,
    getPlayStateForJava:PropTypes.func,
    style:PropTypes.style,
    source:PropTypes.shape({
        url:PropTypes.string,
        headers:PropTypes.object,
    }),
    ...View.propTypes,
};

var RCTVodVideoView = requireNativeComponent('NativeHuoDeVodVideo',VodVideoView,{
    nativeOnly: {onChange: true}
});
module.exports = VodVideoView;
