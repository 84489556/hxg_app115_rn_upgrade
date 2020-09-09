/**
 * 新闻详文页
 */

'use strict'

import React from 'react';
import { Dimensions, Platform, ScrollView, Text, View, BackHandler } from 'react-native';
import RequestInterface from '../actions/RequestInterface';
import * as baseStyle from '../components/baseStyle.js';
import DateFormatText from '../components/DateFormatText.js';
import Loading from '../components/Loading.js';
import NavigationTitleView from '../components/NavigationTitleView';
import RATE, { DISTANCE, LINE_HEIGHT, LINE_SPACE } from '../utils/fontRate.js';
import BaseComponent from "./BaseComponentPage";
import BasePage from './BasePage.js';
import { WebView } from 'react-native-webview';

var WEBVIEW_REF = 'webview';

import { newsHxgProdUrl } from '../actions/CYCommonUrl';
import * as ScreenUtil from '../utils/ScreenUtil';

const injectedJavaScript = `
 //这是缩放的
  const meta = document.createElement('meta'); 
  //meta.setAttribute('content', 'initial-scale=0.5, maximum-scale=0.5, user-scalable=0'); 
  meta.setAttribute('name', 'viewport'); 
  document.getElementsByTagName('head')[0].appendChild(meta); 
  //高度获取
  //let webHeight = document.body.getBoundingClientRect().height;
  let webHeight = document.body.scrollHeight;
  window.ReactNativeWebView.postMessage(webHeight);
`
;const injectedJavaScript2 = `
const meta = document.createElement('meta'); 
meta.setAttribute('content', 'width=width-device, initial-scale=1.0');
meta.setAttribute('name', 'viewport'); 
document.getElementsByTagName('head')[0].appendChild(meta); 
document.getElementById('content').style.fontSize = '20px';
  let webHeight = document.body.scrollHeight;
  window.ReactNativeWebView.postMessage(webHeight);
`;

export default class NewsDetailPage extends BasePage {

  constructor(props) {
    super(props);

    this.state = {
      scalesPageToFit: (Platform.OS === 'ios') ? false : true,
      loading: true,
      jsonObj: null,
      height: 0
    };
    if (Platform.OS === 'android') {
      this.onBackAndroid = this.onBackAndroid.bind(this);
    }

    //兼容ioswebView加载pdf文件，目前体验差,可以优化
    this.scrollViewhight = 0;
    this.headerHight = 0;
  }

  componentWillMount() {
    // super.componentWillMount();
    //资讯来的页面news中有jsonUrl字段
    if (this.props.navigation.state.params.news.jsonUrl) {
      this.setState({ jsonObj: this.props.navigation.state.params.news })
      this.fetchJsonData(newsHxgProdUrl + this.props.navigation.state.params.news.jsonUrl)
    }
    else if (this.props.navigation.state.params.news.idPath) {
      this.setState({ jsonObj: this.props.navigation.state.params.news })
      this.getNewsContent(this.props.navigation.state.params.news.idPath)
    }
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
  }

  componentDidMount() {
    super.componentDidMount();
    // 判断新闻内容是pdf则直接打开，zlib则请求新闻数据后展示
    let contextUrl = this.props.navigation.state.params.news.url || this.props.navigation.state.params.news.Context || '';
    if (contextUrl.substr(-5) === '.zlib') {

    } else {
      if (contextUrl) {

        this.setState({ loading: false, url: contextUrl });
      }
    }
  }

  getNewsContent(newIdPath) {
    RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, newIdPath, "",
      (x) => {
        if (!x) return;

        this.fetchJsonData(newsHxgProdUrl + x.content)

      }, (error) => {
        //alert(error);
      })
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
  }
  onBackAndroid() {
    Navigation.pop(this.props.navigation);
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    return true;

  }
  fetchJsonData(jsonUrl) {
    fetch(jsonUrl)
      .then((res) => res.json())
      .then((json) => {
        this.setState({ loading: false, jsonObj: json })
      })
      .catch((e) => {
        this.setState({ loading: true, jsonObj: null })
      });
  }
  renderJsonNews() {
    let data = this.state.jsonObj;
    let isUri = !!this.state.url;
    let stateChange = isUri ? this.onNavigationStateChange : () => { };
    let thisSource = { html: data.content ? '<html><head><meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"></head><body>' + data.content + '</body></html>' : '' };

    if (Platform.OS === 'android') {
     // thisSource.baseUrl = "";//神奇的东方力量
    }
    return (
      <BaseComponent style={{ flex: 1 }}>
        <NavigationTitleView navigation={this.props.navigation} titleText={'资讯详情'} />
        <ScrollView style={{ backgroundColor: '#fff', }}>
          <Text style={{ fontSize: RATE(40), lineHeight: LINE_HEIGHT(40), marginTop: ScreenUtil.scaleSizeW(29), marginHorizontal: ScreenUtil.scaleSizeW(30), marginBottom: ScreenUtil.scaleSizeW(20), color: "#262628", }}>
            {data.title || this.props.navigation.state.params.news.title || this.props.navigation.state.params.news.Title}
          </Text>
          <View style={{ marginHorizontal: ScreenUtil.scaleSizeW(29), marginBottom: ScreenUtil.scaleSizeW(29), flexDirection: 'row', justifyContent: 'space-between', removeClippedSubviews: true }}>
            <Text style={{ paddingRight: 5, fontSize: RATE(24), color: baseStyle.BLACK_70 }}>
              {this.props.navigation.state.params.news.sourceName}
            </Text>
            <Text style={{ textAlign: 'right', paddingRight: 5, fontSize: RATE(24), color: baseStyle.BLACK_70 }}>
              {this.props.navigation.state.params.news.date.length >= 10 ? this.props.navigation.state.params.news.date.substring(0, 10) : this.props.navigation.state.params.news.date.length}
            </Text>
          </View>
          {/* 详文 */}
          {this.state.loading ?
            <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.screenH - 200, alignItems: "center", justifyContent: "center" }}><Loading /></View>
            :
            <View style={{ flex: 1, overflow: 'hidden' }}>
              <WebView
                ref={WEBVIEW_REF}
                useWebKit={true}
                automaticallyAdjustContentInsets={true}
                style={{ flex: 1, width: Dimensions.get('window').width, height: this.state.height }}
                injectedJavaScript={injectedJavaScript}
                onMessage={(event) => {
                  try {
                      if (event.nativeEvent.data !== undefined && event.nativeEvent.data !== null) {
                          this.setState({
                              height: parseInt(event.nativeEvent.data)
                          });
                      }
                  } catch (error) {
                    //console.log('ShowWebViewPage onMessage错误', error);
                  }
                }}
                source={thisSource}
                // source={{html: data.content? data.content:'',baseUrl:''}}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                decelerationRate="normal"
                startInLoadingState={false}
                scalesPageToFit={this.state.scalesPageToFit}
                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                onNavigationStateChange={stateChange}
              />
            </View>
          }
        </ScrollView>
      </BaseComponent>
    );
  }
  // OnMessageActions = {
  //   setHeight: (height) => {
  //     if (height > 0) {
  //       this.setState({ height: height });
  //     }
  //   },
  // };
  render() {
    if (this.state.jsonObj) {
      return this.renderJsonNews()
    }
    let isUri = !!this.state.url;
    let source = isUri ? { uri: this.state.url } : { html: this.state.html };
    let stateChange = isUri ? this.onNavigationStateChange : () => { };
    return (
      <BaseComponent style={{ flex: 1 }}>
        <NavigationTitleView
          navigation={this.props.navigation}
          titleText={this.props.navigation.state.params.title} />

        <ScrollView style={{ padding: 10 ,flex:1}}
          onLayout={(event) => {
            if (event.nativeEvent.layout.height !== this.hearderHeight) {
              this.scrollViewhight = event.nativeEvent.layout.height;
            }
          }}
        >
          <View style={{ width: ScreenUtil.screenW }}
            onLayout={(event) => {
              if (event.nativeEvent.layout.height !== this.hearderHeight) {
                this.headerHight = event.nativeEvent.layout.height;
              }
            }}
          >
            <Text style={{ width: ScreenUtil.screenW - 20, fontSize: RATE(40), lineHeight: LINE_HEIGHT(40), marginTop: 3, marginBottom: 10, color: "#262628", }}>
              {this.props.navigation.state.params.news.title || this.props.navigation.state.params.news.Title}
            </Text>
            {this.props.navigation.state.params.news.source ?
              (<View style={{ width: ScreenUtil.screenW - 20, flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ fontSize: RATE(24), color: baseStyle.BLACK_70 }}>{this.props.navigation.state.params.news.source}</Text>
                <DateFormatText format="YYYY-MM-DD" style={{ textAlign: 'left', paddingLeft: 5, fontSize: RATE(24), color: baseStyle.BLACK_70 }}>{this.props.navigation.state.params.news.date}</DateFormatText>
              </View>)
              : (
                <View style={{ width: ScreenUtil.screenW - 20, flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text style={{ fontSize: RATE(24), color: baseStyle.BLACK_70 }}>{this.props.navigation.state.params.news.type}</Text>
                  <DateFormatText format="YYYY-MM-DD" style={{ textAlign: 'left', paddingLeft: 5, fontSize: RATE(24), color: baseStyle.BLACK_70 }}>{this.props.navigation.state.params.news.date}</DateFormatText>
                </View>
              )
            }
          </View>

          {/* 详文 */}
          {this.state.loading ?
            <View style={{ flex: 1, height: 300, alignItems: "center", justifyContent: "center" }}><Loading /></View> :
            <View style={{ flex: 1, overflow: 'hidden' }}>
              <WebView
                ref={WEBVIEW_REF}
                useWebKit={true}
                automaticallyAdjustContentInsets={false}
               // style={{ flex: 1, width: Dimensions.get('window').width - 20, height: Math.abs(this.scrollViewhight - this.headerHight) }}
                style={{ flex: 1, width: Dimensions.get('window').width - 20, height: Platform.OS==='ios'?Math.abs(this.scrollViewhight -  this.headerHight) : this.state.height }}
                source={source}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                decelerationRate="normal"
                startInLoadingState={false}
                onMessage={(event) => {

                  try {
                      if (event.nativeEvent.data !== undefined && event.nativeEvent.data !== null) {
                          //console.log("高度回调",parseInt(event.nativeEvent.data))
                          //这里Android高度好像少了点，给加个固定高度
                          this.setState({
                              height: parseInt(event.nativeEvent.data)+40
                          });
                      }
                  } catch (error) {
                    //console.log('ShowWebViewPage onMessage错误', error);
                  }
                }}
                injectedJavaScript={Platform.OS==='android'?injectedJavaScript2:injectedJavaScript}
                scalesPageToFit={this.state.scalesPageToFit}
                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                onNavigationStateChange={stateChange}
              />
            </View>
          }
        </ScrollView>
      </BaseComponent>
    );
  }

  onNavigationStateChange = (navState) => {
    this.setState({
      url: navState.url,
      // loading: navState.url!=this.props.navigation.state.params.url?navState.loading:false,
      scalesPageToFit: (Platform.OS === 'ios') ? false : true
    });
  }

  onShouldStartLoadWithRequest = (event) => {
    // Implement any custom loading logic here, don't forget to return!
    //console.info('onShouldStartLoadWithRequest');
    return true;
  }
}
