/**
 * Created by pp. on 17/9/5.
 */
'use strict';

import React,  { Component  } from 'react';
import {findNodeHandle, requireNativeComponent, UIManager, View} from 'react-native';
import PropTypes from 'prop-types';
var PDF = {
    name: 'PDF',
    propTypes: {
        url:PropTypes.string,
        ...View.propTypes,
       
    },
};
var PDFView = requireNativeComponent('PDFView', PDF, {
    nativeOnly: {onChange: true}
});
class PDFViewManager extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <PDFView
                {...this.props}

            />
        );
    };
}

module.exports = PDFViewManager;
