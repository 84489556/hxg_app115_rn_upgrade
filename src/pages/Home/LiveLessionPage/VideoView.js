import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {requireNativeComponent,
        UIManager,
        findNodeHandle,
        View,

        } from'react-native';

const VIDEO_VIEW_REF = 'VideoView';

export default class VideoView extends Component{
    constructor(props){
        super(props);
        this.videoPath=props.VideoPath;
    }


//JavaScript调用native中实例的函数
 pause(){
        //向native层发送命令
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[VIDEO_VIEW_REF]),
            UIManager.VideoViewPlayer.Commands.pause,//Commands.pause与native层定义的COMMAND_PAUSE_NAME一致
            null//命令携带的参数数据
        );
    }



start(){
        
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[VIDEO_VIEW_REF]),
            UIManager.VideoViewPlayer.Commands.start,
            null
        );
    }
   
seekTo(position){
        
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[VIDEO_VIEW_REF]),
            UIManager.VideoViewPlayer.Commands.seekTo,
            [position]
        );
    }

release(){
        
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[VIDEO_VIEW_REF]),
            UIManager.VideoViewPlayer.Commands.release,
            null
        );
    }
getPositionForRN(){

    if(this.refs[VIDEO_VIEW_REF]) {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[VIDEO_VIEW_REF]),
            UIManager.VideoViewPlayer.Commands.getPositionForRN,
            null
        );
    }
}

switchUrl(path){
        this.videoPath=path;
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[VIDEO_VIEW_REF]),
            UIManager.VideoViewPlayer.Commands.switchUrl,
            [path]
        );
    }


// native发送事件到JavaScript

    _getCurrentPosition(event){
        if(!this.props.onProgress){
            return;
        }
        this.props.getCurrentPosition(event);
    }
 

    
 


    render(){
        //console.log("内层View+++")
        return <VideoViewPlayer
                  ref = {VIDEO_VIEW_REF}
                  getCurrentPosition={this._getCurrentPosition.bind(this)}
                  
                  {...this.props}
            
        />;
    };
}
 
VideoView.name = "VideoViewPlayer";
VideoView.propTypes = {
        VideoPath:PropTypes.string,
        MediaType:PropTypes.string,
        getStreamStategetStreamState:PropTypes.func,
        getNavigatorHeight:PropTypes.func,
        getCurrentPosition:PropTypes.func,
        getOverLiveEvent:PropTypes.func,
        getPlayState:PropTypes.func,
        getPauseState:PropTypes.func,
        getVodOverState:PropTypes.func,
        getBufferStartState:PropTypes.func,
        getBufferEndState:PropTypes.func,
        getReleaseEvent:PropTypes.func,

    ...View.propTypes,
};
 
var VideoViewPlayer = requireNativeComponent('VideoViewPlayer',VideoView,{
    nativeOnly: {onChange: true}
});

