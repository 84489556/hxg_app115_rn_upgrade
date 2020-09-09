import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  View,
  Image,
  Modal,
  Easing,
  StyleSheet,
  PanResponder,
  NativeModules,
  findNodeHandle,
  Dimensions,
  TouchableWithoutFeedback,
    Text,
} from 'react-native';
import Animation from './Animation';
const winWidth = (Dimensions.get('window').width-100)/2;
const winHeight = Dimensions.get('window').height/4;
const maxWidth=(Dimensions.get('window').width-100);
const maxHeight=Dimensions.get('window').height/3*2;
import ControlView from './ControlView';
// import ImageViewer from './react-native-image-viewer/built/index';
import {AlbumView,Overlay,Carousel} from 'teaset';
const RCTUIManager = NativeModules.UIManager;

class ZoomImage extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    startCapture: PropTypes.bool,
    moveCapture: PropTypes.bool,
    responderNegotiate: PropTypes.func,
    easingFunc: PropTypes.func,
    rebounceDuration: PropTypes.number,
    closeDuration: PropTypes.number,
    showDuration: PropTypes.number,
    enableScaling: PropTypes.bool,
      imgCapture:PropTypes.bool,
  }
  static defaultProps = {
    disabled: false,
    startCapture: false,
    moveCapture: false,
    rebounceDuration: 800,
    closeDuration: 140,
    showDuration: 100,
    easingFunc: Easing.ease,
    enableScaling: false,
      imgCapture:true,
  }
  constructor(props) {
    super(props);
    images=this.props.images;  
    index=this.props.index;
    imageWidth=this.props.imageWidth;
    imageHeight=this.props.imageHeight;
    this.state = {
      maxSize:this.props.imgCapture?(imageWidth&&imageHeight)?ZoomImage.getMaxSizeByRatio(imageWidth/imageHeight,imageWidth,imageHeight)
          :{width:maxWidth,height:winHeight}
      :{width:imageWidth,height:imageHeight},
      isModalVisible: false
    };
    this.enableModal = true;
    // this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    // this.modalRefBind = this.modalRefBind.bind(this);
    // this.getMaxSizeByRatio = this.getMaxSizeByRatio.bind(this);
  }
  static getMaxSizeByRatio (ratio,w,h) {

    let width;
    let height;
    if(ratio>=1||(h>maxHeight&&maxHeight*ratio>maxWidth))
    {
      width=w<winWidth?winWidth:w>maxWidth?maxWidth:w;
      height=width/ratio<winHeight?winWidth:width/ratio>maxHeight?maxHeight:width/ratio;
    }
    else
    {
      height=h<winHeight?winHeight:h>maxHeight?maxHeight:h;
      width=height*ratio<winWidth?winWidth:height*ratio>maxWidth?maxWidth:height*ratio;
    }
    return {
      width:width,
      height:height,
    };
  }
  componentDidMount () {
    // if (this.props.imageWidth||this.props.imageHeight)
    // {
    //     this.setState((state) => {
    //       state.maxSize = this.getMaxSizeByRatio(this.props.imageWidth / this.props.imageHeight,this.props.imageWidth,this.props.imageHeight);
    //       this.enableModal = true;
    //     });
    // } else {
      // this.setState((state) => {
      //   state.maxSize = this.getMaxSizeByRatio(this.props.imgStyle.width / this.props.imgStyle.height);
      //   this.enableModal = true;
      // });
    // }
  }

  openModal () {
   
    if (!this.refs.view || !this.enableModal || this.props.disabled||this.fullImageView) return;
    RCTUIManager.measure(findNodeHandle(this.refs.view), (x, y, w, h, px, py) => {
      this.originPosition = {x, y, w, h, px, py};
      //console.log(this.originPosition);
      // let pressView=this.refs.view;
      // RCTUIManager.measure((x,y,w,h,px,py)=>{
        let image=this.props.images;
        let img=this.props.source;
        let defaultIndex;
        images.forEach(function(item,index,array){
            if(img.uri==item.uri)
                defaultIndex=index;
        })
      let OverlayView=(
        <Overlay.PopView
        style={{}}
        containerStyle={{flex:1}}
        overlayOpacity={1}
        type='zoomIn'
        customBounds={{x:px,y:py,w,h}}
        ref={v => this.fullImageView = v}
        >
        <AlbumView
            style={{flex:1}}
            control={<ControlView style={{backgroundColor:'red',flex:1,height:30,alignItems:'center',color:'white'}}></ControlView>}
            images={image}
            defaultIndex={defaultIndex}
            space={20}  
            onPress={()=>this.fullImageView&&this.fullImageView.close()}
        />
          </Overlay.PopView>
      );
      Overlay.show(OverlayView);
    });
  }
 
  render () {
    return (
      <TouchableWithoutFeedback style={this.props.imgStyle}
        onPress={this.openModal}
        ref="view">
          <Image
            source={this.props.source}
            resizeMode={this.props.resizeMode}
            style={[this.props.imgStyle,{width:this.state.maxSize.width,height:this.state.maxSize.height}]}/>
      </TouchableWithoutFeedback>
    );
  }
}
const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    opacity: 0
  },
  content: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  toucharea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  modalText: {
    color: '#fff'
  }
});
export default ZoomImage;