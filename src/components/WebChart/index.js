/* eslint-disable */
import React from 'react';
import {
  View,
  Platform,
} from 'react-native';

import html from './index.html';
import { WebView } from 'react-native-webview';

const os = Platform.OS;

/**
 * props:
 * 
 * option(Object): Param of chart.setOption(), 
 *                 the setOption will auto execute when option is changed.
 * exScript(String): Any JavaScript that will execute when WebView is loaded.
 * oMessage(Function): The handler for the WebView's postMessage.
 *                     You will have to set postMessage in the exScript first.
 */

const injectedChart = os==='ios' ?
    ` window.addEventListener('message', (e) => {
              chart.setOption(JSON.parse(e.data, function(key, val) {
                if (val.indexOf && val.indexOf('function') > -1) {
                  return eval('(' + val + ')')
                }
                return val
              }), true);
               chart.setOption({tooltip:{show:true}});
            });`
    :
    ` document.addEventListener('message', (e) => {
              chart.setOption(JSON.parse(e.data, function(key, val) {
                if (val.indexOf && val.indexOf('function') > -1) {
                  return eval('(' + val + ')')
                }
                return val
              }), true);
               chart.setOption({tooltip:{show:true}});
            });`
;

export default class WebChart extends React.Component {
  static defaultProps = {
    option: {},
    exScript: '',
    onMessage: () => { },
  }
  componentDidUpdate(prevProps, prevState) {
    // 处理option中函数类型的属性
    const callback = (key, val) => {
      if (typeof val === 'function') {
        return val.toString();
      }
      return val;
    }
    const optionJson = JSON.stringify(this.props.option, callback);
    if (optionJson !== JSON.stringify(prevProps.option)) {

      this.update(optionJson);
    }
  }
  update = (optionJson) => {
    this.webView.postMessage(optionJson);
  }

  /*
  * @Author: lishuai 
  * @Date: 2020-04-09 15:34:16 
  * @Last Modified by: lishuai
  * @Last Modified time: 2020-04-09 16:05:01
  * useWebKit: 为 true 的时候, WebView 的 scalesPageToFit 属性会失效，造成网页显示没有适配移动设备，如果要使用 WekKit，可以给 WebView 注入 js 代码(代码可以百度)，使其达到适配移动设备的效果。
  */
  render() {
    return (
      <View style={this.props.style}>
        <WebView
          ref={(elem) => { this.webView = elem; }}
          // useWebKit={true}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          scrollEnabled={false}
          scalesPageToFit={os !== 'ios'}
          source={os === 'ios' ? html : { uri: 'file:///android_asset/web/WebChart/index.html' }}
          originWhitelist={['*']}
          injectedJavaScript={`
            const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); true;
            const chart = echarts.init(document.getElementById('main'), null, { renderer: 'svg' });
            chart.setOption(${JSON.stringify(this.props.option)});
            document.body.addEventListener('touchstart', function () {});
            window.ontouchstart = function(e){e.preventDefault();};
            ${injectedChart}
            ${this.props.exScript}
          `}
          onMessage={(e) => {
            if (Platform.OS === 'ios') {
              let undecodeOne = decodeURIComponent(e.nativeEvent.data);
              let undecodeTwo = decodeURIComponent(undecodeOne);
              this.props.onMessage(JSON.parse(undecodeTwo));
            } else {
              this.props.onMessage(JSON.parse(e.nativeEvent.data));
            }
            }
          }
          onLoadStart={()=>{
            if( Platform.OS==='ios'){
                this.webView && this.webView.postMessage(JSON.stringify(this.props.option));
            }
          }}
          onLoadEnd={()=>{}}
          onLoad={() => {}}
        />
      </View>
    );
  }
}
