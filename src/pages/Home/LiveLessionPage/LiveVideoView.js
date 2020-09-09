import React, {Component} from 'react';
import {
    requireNativeComponent,
    View,
    UIManager,
    findNodeHandle,
} from 'react-native';

import PropTypes from 'prop-types';

var RCT_VIDEO_REF = 'LiveVideoView';
var LiveVideoView_android = {
    name: "LiveVideoView_android",
    propTypes: {
        style: PropTypes.style,
        source: PropTypes.shape({
            url: PropTypes.string,
            headers: PropTypes.object,
        }),
        ...View.propTypes
    }
}


var RCTLiveVideoView = requireNativeComponent('NativeHuoDeLiveVideo', LiveVideoView_android, {
    nativeOnly: {onChange: true}
});

class LiveVideoView extends Component {
    constructor(props) {
        super(props);
        this.stutes = 0 ;
    }

    start() {

        if (this.stutes ===  UIManager.NativeHuoDeLiveVideo.Commands.start) {
            return
        }
        this.stutes = UIManager.NativeHuoDeLiveVideo.Commands.start;
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeLiveVideo.Commands.start,
            null
        );
    }
    pause(){
        this.stutes = UIManager.NativeHuoDeLiveVideo.Commands.stop;
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeLiveVideo.Commands.stop,
            null
        );
    }
    leave() {
        this.stutes = UIManager.NativeHuoDeLiveVideo.Commands.leave;
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_VIDEO_REF]),
            UIManager.NativeHuoDeLiveVideo.Commands.leave,
            null
        );
    }

    render() {
        return (
            <RCTLiveVideoView
                {...this.props}
                ref={RCT_VIDEO_REF}

            />
        );
    };
}

// LiveVideoView_android.name = "LiveVideoView";
// LiveVideoView_android.propTypes = {
//     style: PropTypes.style,
//     source:PropTypes.shape({
//         url:PropTypes.string,
//         headers:PropTypes.object,
//     }),
//     ...View.propTypes,
// };

module.exports = LiveVideoView;



