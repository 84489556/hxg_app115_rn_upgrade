/**
 * 新闻列表
 */
'use strict'

import React, { Component } from "react";
import { View, Text, TouchableHighlight, StyleSheet ,FlatList} from 'react-native';

import * as baseStyle from './baseStyle.js';
import BaseComponent from './BaseComponent.js';
import DateFormatText from './DateFormatText.js';
import Loading from './Loading.js';
import UserInfoUtil from '../utils/UserInfoUtil';


export default class NewsList extends BaseComponent {

  styleSheet = StyleSheet.create({
    container: {
    },
    loading: {
      height: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingIcon: {
      width: 24,
      height: 24,
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 10,
      marginRight: 10
    },
    loadingLabel: {
      fontSize: 14,
      color: baseStyle.DEFAULT_TEXT_COLOR
    },
    listItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
    },
    listItemTitle: {
      fontSize: 16,
      marginBottom: 10,
      color: baseStyle.DEFAULT_TEXT_COLOR
    },
    listItemContext: {
      marginBottom: 10,
      fontSize: 14,
      color: baseStyle.GRAY
    },
    listItemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    ...Object.assign.apply(Object, ['listItemSource', 'listItemTime'].map(name => ({ [name]: { fontSize: 12, color: baseStyle.GRAY } })))
  });

  constructor(props) {
    super(props);

    // 初始状态
    this.state = {
    }
  }

  componentWillReceiveProps(nextProp) {
    nextProp.data && this.setState({
      dataSource: nextProp.data
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.dataSource !== nextState.dataSource;
  }

  _renderRow(rowData) {
    return (
      <TouchableHighlight
        onPress={this.props.onPressItem && this.props.onPressItem.bind(this, rowData)}
        underlayColor={baseStyle.HIGH_LIGHT_COLOR}>
        <View style={this.getStyles('listItem')}>
          <Text style={this.getStyles('listItemTitle')}>{rowData.xwbt}</Text>
          <View style={this.getStyles('listItemFooter')}>
            <Text style={this.getStyles('listItemSource')}>{rowData.xwly}</Text>
            <DateFormatText style={this.getStyles('listItemTime')} format="YYYY-MM-DD">{rowData.xwrq}</DateFormatText>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  _renderFooter() {

    // 如果loading为true则在底部显示加载中样式
    return (this.props.loading === true) && (
      <Loading style={{ loading: { height: 500 } }}></Loading>
    );
  }

  render() {
    if (!this.state.dataSource) {
      return this._renderFooter();
    }
    return (
      <FlatList
        bounces={false}
        style={this.getStyles('container')}
        data={this.state.dataSource}
        renderItem={({item, index, separators}) => this._renderRow(item)}
        onEndReached={this.props.onEndReached}
        ListFooterComponent={this._renderFooter.bind(this)}
        removeClippedSubviews={false}/>
    );
  }
}

export class YDNewsList extends Component {

  constructor(props) {
    super(props);

    this.defaultParams = {
      count: 10,
      start: 0
    };

    this.state = {
      data: null,
      loading: true
    };

    this._hasMore = true;
  }

  componentDidMount() {
    this._query(this.props);
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(nextProps) {
    // 判断是否需要重新订阅数据
    if (nextProps.params && nextProps.params.obj && this.props.params.obj != nextProps.params.obj){
      this.setState({loading:true},
          () =>{
            this._query(nextProps);
          })
    }

  }

  adapt(data) {

    if (data === undefined)
      return false

    let result = data

    // 如果数据长度小于请求的count则表示没有更多数据了
    this._hasMore = !(result.length < this.defaultParams.count);

    this.setState({ loading: false });

    return ([]).concat(result);
  }

  _query(props) {

    if (props.params && props.params.obj) {

      UserInfoUtil.getGeGuXinWen(props.params.obj.substring(2, 8),

        (returndata) => {
          if (!(returndata instanceof Error)) {
            Promise.resolve(this.adapt(returndata)).then((data) => {
              if (data !== false) {

                this.setState({
                  data:data,
                  loading:false
                });

                // 触发事件
                let onData = this.props.onData;
                (typeof onData === 'function') && onData(data);
              }
            });
          }
        },
          (error) => {
            let  data = [];
            this.setState({
              data:data,
              loading:false
            });
          });
    }
  }

  _onEndReached(event) {

    // 判断是否还有数据，有数据则显示加载中，然后继续加载后面数据
    if (this._hasMore) {
      this.setState({ loading: true });
      this.defaultParams.start = this.defaultParams.start || 0
    }
  }

  render() {
    return (
      <NewsList
        style={this.props.style}
        data={this.state.data}
        loading={this.state.loading}
        onPressItem={this.props.onPressItem}
      />
    );
  }
}

export class AnnouncementList extends BaseComponent {

  styleSheet = StyleSheet.create({
    container: {
    },
    loading: {
      height: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingIcon: {
      width: 24,
      height: 24,
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 10,
      marginRight: 10
    },
    loadingLabel: {
      fontSize: 14,
      color: baseStyle.DEFAULT_TEXT_COLOR
    },
    listItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
    },
    listItemTitle: {
      fontSize: 16,
      marginBottom: 10,
      color: baseStyle.DEFAULT_TEXT_COLOR
    },
    listItemContext: {
      marginBottom: 10,
      fontSize: 14,
      color: baseStyle.GRAY
    },
    listItemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    ...Object.assign.apply(Object, ['listItemSource', 'listItemTime'].map(name => ({ [name]: { fontSize: 12, color: baseStyle.GRAY } })))
  });

  constructor(props) {
    super(props);

    // 初始状态
    this.state = {
    }
  }

  componentWillReceiveProps(nextProp) {
    nextProp.data && this.setState({
      dataSource: nextProp.data
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.dataSource !== nextState.dataSource;
  }

  _renderRow(rowData) {
    return (
      <TouchableHighlight
        onPress={this.props.onPressItem && this.props.onPressItem.bind(this, rowData)}
        underlayColor={baseStyle.HIGH_LIGHT_COLOR}>
        <View style={this.getStyles('listItem')}>
          <Text style={this.getStyles('listItemTitle')}>{rowData.ggbt}</Text>
          <View style={this.getStyles('listItemFooter')}>
            <Text style={this.getStyles('listItemSource')}>{rowData.gglx}</Text>
            <DateFormatText style={this.getStyles('listItemTime')} format="YYYY-MM-DD">{rowData.ggrq}</DateFormatText>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  _renderFooter() {

    // 如果loading为true则在底部显示加载中样式
    return (this.props.loading === true) && (
      <Loading style={{ loading: { height: 500 } }}></Loading>
    );
  }

  render() {
    if (!this.state.dataSource) {
      return this._renderFooter();
    }
    return (
      <FlatList
          bounces={false}
        style={this.getStyles('container')}
        data={this.state.dataSource}
          renderItem={({item, index, separators}) => this._renderRow(item)}
        onEndReached={this.props.onEndReached}
          ListFooterComponent={this._renderFooter.bind(this)}
        removeClippedSubviews={false}
        >
      </FlatList>
    );
  }
}

export class YDAnnouncementList extends Component {

  constructor(props) {
    super(props);

    this.defaultParams = {
      count: 10,
      start: 0
    };

    this.state = {
      data: null,
      loading: true
    };

    this._hasMore = true;
  }

  componentDidMount() {
    this._query(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // 判断是否需要重新订阅数据
    if (nextProps.params && this.props.params.obj && this.props.params.obj != nextProps.params.obj){
      this.setState({
        loading:true
      },() => {
        this._query(nextProps);
      })
    }

  }

  adapt(data) {

    if (data === undefined)
      return false

    let result = data;

    // 如果数据长度小于请求的count则表示没有更多数据了
    this._hasMore = !(result.length < this.defaultParams.count);

    this.setState({ loading: false, data: result });

    return (this.state.data);
  }

  _query(props) {

    if (props.params && props.params.obj) {
      this._request = UserInfoUtil.getGeGuGongGao(props.params.obj.substring(2, 8),
          (returndata) => {

            if (!(returndata instanceof Error)) {
              Promise.resolve(this.adapt(returndata)).then((data) => {
                if (data !== false) {

                  this.setState({
                    data:data,
                    loading:false
                  });

                  // 触发事件
                  let onData = this.props.onData;
                  (typeof onData === 'function') && onData(data);
                }
              });
            }
          },
          (error) => {
            let data = [];
            this.setState({
              data:data,
              loading:false
            });
      });

    }
  }

  _onEndReached(event) {

    // 判断是否还有数据，有数据则显示加载中，然后继续加载后面数据
    if (this._hasMore) {
      this.setState({ loading: true });
      this.defaultParams.start = this.defaultParams.start || 0
    }
  }

  render() {
    return (
      <AnnouncementList
        style={this.props.style}
        data={this.state.data}
        loading={this.state.loading}
        onPressItem={this.props.onPressItem}
      />
    );
  }
}
