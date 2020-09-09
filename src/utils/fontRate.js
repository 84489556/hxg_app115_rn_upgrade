import{ Dimensions,Platform,PixelRatio } from 'react-native';
var {height, width} = Dimensions.get('window');
var pixelRatio = PixelRatio.get(); 

let RATE = Platform.select({
  ios: (pxSize) => pxSize * Math.min(height, width) / 750,
  android: (pxSize) => pxSize /2,
})

export var DISTANCE = Platform.select({
  ios: (pxSize) => pxSize /2,
  android: (pxSize) => pxSize /2,
})

const LINE_HEIGH_RATIO = 1.5;

export var LINE_HEIGHT = (pxSize) => RATE(pxSize) * LINE_HEIGH_RATIO;
export var LINE_SPACE = (pxSize) => (pxSize/2) * (LINE_HEIGH_RATIO - 1) / 2;

export default RATE;