
'use strict'
import React, {Component} from 'react';

export default class BasePage extends Component {

  constructor(props) {
    super(props);

    this._isActived = true;
  }

  componentDidMount() {
    this.pageWillActive();
    this.pageDidActive();
  }

  componentWillUnmount() {
  }

  // 页面将要切换到当前页面时触发（切换动画前）
  pageWillActive() {
    console.debug('pageWillActive', this.constructor.name);
  }

  // 页面已经切换到当前页面时触发（切换动画后）
  pageDidActive() {
    console.debug('pageDidActive', this.constructor.name);
    this._isActived = true;
  }

  // 页面将要从当前页面切换到其它页面时触发（切换动画前）
  pageWillDeactive() {
    //console.debug('pageWillDeactive', this.constructor.name);
    this._isActived = false;
  }
}