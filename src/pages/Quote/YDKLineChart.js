import React,{Component} from 'react';
import {
    requireNativeComponent,
    View,
    UIManager,
    findNodeHandle,
    NativeModules,
} from 'react-native';
import PropTypes from 'prop-types';


var RCT_KLINECHART_REF = 'YDKLineChart';

class YDKLineChart extends Component{
    constructor(props){
        super(props);
    }

    startPos_forDetail(pos){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_KLINECHART_REF]),
            UIManager.RCTYdKline.Commands.startPos,
            [pos]
        );
    }

    showCount(count){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_KLINECHART_REF]),
            UIManager.RCTYdKline.Commands.showCount,
            [count]
        );
    }
    zoomIn(){ //放大
        // console.log('controlKline','YDKLineChartzoomIn--------');
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_KLINECHART_REF]),
            UIManager.RCTYdKline.Commands.zoomIn,
            null
        );
    }
    zoomOut(){
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_KLINECHART_REF]),
            UIManager.RCTYdKline.Commands.zoomOut,
            null
        );
    }
    moveLeft(){
        // console.log('controlKline','YDKLineChartmoveLeft--------');
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_KLINECHART_REF]),
            UIManager.RCTYdKline.Commands.moveLeft,
            null
        );
    }
    moveRight(){
        // console.log('controlKline','YDKLineChartmoveRight--------');
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs[RCT_KLINECHART_REF]),
            UIManager.RCTYdKline.Commands.moveRight,
            null
        );
    }
    getMainFormulaData(pos, formulas, callback) {
        let reactTag = findNodeHandle(this.refs[RCT_KLINECHART_REF]);
        NativeModules.YdKlineManager.getMainFormulaData(
            reactTag,
            pos,
            formulas,
            data => callback(data)
        );
    }

    render(){
        return <NativeYdKChart
            {...this.props}
            ref = {RCT_KLINECHART_REF}
            isLandscape = {this.props.isLandscape}
            fuTu = {this.props.fuTu}
            chartData = { JSON.stringify(this.props.chartData)}
            mainName = { this.props.mainName }
            viceName = { this.props.viceName }
            secondViceName = { this.props.secondViceName }
            showCount = { this.props.showCount }
            startPos = { this.props.startPos }
            legendPos = { this.props.legendPos }
            tapY = { this.props.tapY }
            split = { this.props.split }
            onSplitDataBlock = {this.props.onSplitDataBlock}
        />;
    };
}

YDKLineChart.name = "YDKLineChart";
YDKLineChart.propTypes = {
    isLandscape:PropTypes.string,
    fuTu:PropTypes.string,
    chartData: PropTypes.object,
    mainName: PropTypes.string,
    viceName: PropTypes.string,
    chartLoc: PropTypes.string,
    isLand: PropTypes.number,
    secondViceName: PropTypes.string,
    showCount: PropTypes.number,
    startPos: PropTypes.number,
    legendPos: PropTypes.number,
    tapY: PropTypes.number,
    split: PropTypes.number,
    getTimeForKLine:PropTypes.func,
    getMADataForKLine:PropTypes.func,
    getFuTuData1ForKLine:PropTypes.func,
    getFuTuData2ForKLine:PropTypes.func,
    onSplitDataBlock:PropTypes.func,
    ...View.propTypes,
};

var NativeYdKChart = requireNativeComponent('RCTYdKline', YDKLineChart,{nativeOnly: {
    isLandscape:true,
    fuTu:true,
    chartData: true,
    mainName: true,
    viceName: true,
    chartLoc: true,
    isLand: true,
    secondViceName: true,
    showCount: true,
    startPos: true,
    legendPos: true,
    tapY: true,
    split: true
}});
module.exports = YDKLineChart;
