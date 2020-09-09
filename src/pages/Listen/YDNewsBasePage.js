/**
 * 新闻列表基类
 */

"use strict";

import React, { Component } from "react";
import {
  InteractionManager
} from "react-native";


import RequestInterface from '../../actions/RequestInterface';


export default class YDNewsBasePage extends Component {

  static defaultProps = {
    serviceUrl: ''
  };

  defaultParams = {};

  constructor(props) {
    super(props);

    this.state = {
      // data: [{
      //   items: []
      // }],
      total:0
    };

    this.timer = null;

    this.loaded = false

  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._loadData(this.props);
    });

    this.startTimer()
  }

  refreshSelfNews() {
    this._loadData(this.props);
  }

  startTimer() {

    //定时每30分钟请求一次数据
    this.timer = setInterval(() => {
      this._loadData(this.props);
    }, 1000 * 60 * 30);

  }

  stopTimer = () => {
    this.timer && clearInterval(this.timer);
  };

  componentWillReceiveProps(nextProps) {

    // 判断是否需要重新订阅数据
    if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
      this._loadData(nextProps);
    }
  }

  // 查询参数格式化，将object格式化为json字符串，将array格式化为逗号分隔字符串
  _formatQueryParams(params) {
    let result = {};
    Object.keys(params).map((key) => {
      let value = params[key];
      if (Array.isArray(value)) {
        result[key] = value.join(',');
      } else if (typeof value === 'object') {
        result[key] = JSON.stringify(value);
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  adapt(data) {
    let {adapt} = this.props;
    return (typeof adapt === 'function') ? adapt(data) : data;
  }

  _loadData(props) {
    this.loaded = false
    RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, props.serviceUrl, this.defaultParams, 
      (x) => {
        this.loaded = true
        if (!x) return;
        let items = this.state.data[0].items;
        let list = x.list;
        this.setState({total: x.total})

        Promise.resolve(this.adapt(list)).then((data) => {
          this.setState({ data: [{ items: data }] })
        });
 
    }, (error) => {
        
    })
  }

  render() {
    if (this.props.children) {
      let child = React.Children.only(this.props.children);

      return React.cloneElement(child, this.state.data[0].items && {
          [this.props.propName || 'data']: this.state.data[0].items
        });
    }

    return <View></View>;

  }

}

