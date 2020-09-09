import React, { Component } from 'react';
import {
    requireNativeComponent,
    View,
} from 'react-native';
import PropTypes from 'prop-types';

var RCT_MINCHART_REF = 'YDMinChart';


class YDMinChart extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <NativeYDMinChart
            {...this.props}
            ref={RCT_MINCHART_REF}
            style={this.props.style}
            chartData={JSON.stringify(this.props.chartData)}
            legendPos={this.props.legendPos}
            mainName = { this.props.mainName }
            viceName = { this.props.viceName }
            circulateEquityA = { this.props.circulateEquityA }
        />;
    };
}

YDMinChart.name = "YDMinChart";
YDMinChart.propTypes = {
    chartData: PropTypes.object,
    mainName: PropTypes.string,
    viceName: PropTypes.string,
    circulateEquityA: PropTypes.number,
    legendPos: PropTypes.number,
    getData: PropTypes.func,
    ...View.propTypes,
};

var NativeYDMinChart = requireNativeComponent('RCTYdMinline', YDMinChart, {
    nativeOnly: {
        chartData: true,
        legendPos: true,
       
    }
});
module.exports = YDMinChart;
