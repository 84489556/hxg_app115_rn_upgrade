/**
 * @providesModule DZHChart
 */

// 'use strict';

// import React, { Component } from 'react';
// import {
//     requireNativeComponent,
//     NativeModules,
//     findNodeHandle,
//     findNumericNodeHandle
// } from 'react-native';
// import PropTypes from 'prop-types';

// var NativeYDMinChart = requireNativeComponent('RCTYdMinline', YDMinChart, {
//     nativeOnly: {
//         chartData: true,
//         legendPos: true
//     }
// });

// export default class YDMinChart extends Component {
//     static propTypes = {
//         chartData: PropTypes.object,
//         legendPos: PropTypes.number
//     };

//     render() {
//         return (
//             <NativeYDMinChart
//                 style={this.props.style}
//                 chartData={JSON.stringify(this.props.chartData)}
//                 legendPos={this.props.legendPos}
//             />
//         );
//     }
// }

// var NativeYdKChart = requireNativeComponent('RCTYdKline', _KLineChart, {
//     nativeOnly: {
//         isLandscape: true,
//         fuTu: true,
//         chartData: true,
//         mainName: true,
//         viceName: true,
//         showCount: true,
//         startPos: true,
//         legendPos: true,
//         tapY: true,
//         chartLoc: true,
//         isLand: true,
//         split: true
//     }
// });

// export class _KLineChart extends Component {
//     static propTypes = {
//         isLandscape: React.PropTypes.string,
//         fuTu: React.PropTypes.string,
//         chartData: React.PropTypes.object,
//         mainName: React.PropTypes.string,
//         viceName: React.PropTypes.string,
//         showCount: React.PropTypes.number,
//         startPos: React.PropTypes.number,
//         legendPos: React.PropTypes.number,
//         tapY: React.PropTypes.number,
//         chartLoc: React.PropTypes.string,
//         isLand: React.PropTypes.number,
//         split: React.PropTypes.number,
//         onSplitDataBlock:React.PropTypes.func,
//     };
//     render() {
//         return (
//             <NativeYdKChart
//                 style={this.props.style}
//                 fuTu={this.props.fuTu}
//                 chartData={JSON.stringify(this.props.chartData)}
//                 mainName={this.props.mainName}
//                 viceName={this.props.viceName}
//                 chartLoc={this.props.chartLoc}
//                 isLand={this.props.isLand}
//                 showCount={this.props.showCount}
//                 startPos={this.props.startPos}
//                 legendPos={this.props.legendPos}
//                 tapY={this.props.tapY}
//                 split={this.props.split}
//                 onSplitDataBlock = {this.props.onSplitDataBlock}
//                 ref={ref => (this.nativeComponent = ref)}
//             />
//         );
//     }

//     getMainFormulaData(pos, formulas, callback) {
//         let reactTag = findNodeHandle(this.nativeComponent);
//         NativeModules.YdKlineManager.getMainFormulaData(
//             reactTag,
//             pos,
//             formulas,
//             data => callback(data)
//         );
//     }
// }
