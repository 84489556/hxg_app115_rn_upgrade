/**
 * 基础组件
 */
'use strict'

import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class BaseComponent extends Component {

  static defaultProps = {

    // 全局传入的主题样式
    theme: {},

    // 组件创建时传入的样式
    style: {}
  };
  static propTypes = {
    theme: PropTypes.object,
    style: PropTypes.object
  };

  // 组件本身样式，应该在每个组件中定义
  styleSheet = {
  };

  getStyles(name, otherStyle) {
    if (Array.isArray(name)) return Array.prototype.concat.apply([], name.map(eachName => this.getStyles(eachName)));
    return [
      this.styleSheet && this.styleSheet[name],
      this.props.theme && this.props.theme[this.constructor.name] && this.props.theme[this.constructor.name][name],
      this.props.style && this.props.style[name],
      otherStyle
    ];
  }

  getUpDownStyle(name, value, otherStyle) {
    let styles = [this.getStyles(name, otherStyle)];
    if (value > 0) styles.push(this.getStyles(name + 'Up'));
    else if (value < 0) styles.push(this.getStyles(name + 'Down'));
    return styles;
  }
}
