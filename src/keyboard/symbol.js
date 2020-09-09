/**
 * Keyboard by yzj
 */
import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  Platform
} from 'react-native';

class number extends Component {
  handlerPress(e) {
    this.props.onPressHandler(this.props.btnName);
  }

  handlerLongPress() {
    if (this.props.onLongPressHandler === undefined) {
      return;
    }

    this.props.onLongPressHandler(this.props.btnName);
  }

  render() {
    if (this.props.btnName === 'daxiaoxie') {
      return (
        <TouchableHighlight
          style={[styles.styleButton]}
          activeOpacity={1}
          animationVelocity={0}
          underlayColor={'#c0c0c0'}
          onPress={(e) => this.handlerPress(e)}
          onLongPress={()=>this.handlerLongPress()}
          >
          <View style={styles.styleImage}>
            <Image source={require('./images/daxiaoxie.png')}/>
          </View>
        </TouchableHighlight>
      );
    }

    if (this.props.btnName === 'del') {
      return (
        <TouchableHighlight
          style={[styles.styleButton]}
          activeOpacity={1}
          animationVelocity={0}
          underlayColor={'#c0c0c0'}
          onPress={(e) => this.handlerPress(e)}
          onLongPress={()=>this.handlerLongPress()}
          >
          <View style={styles.styleImage}>
            <Image source={require('./images/icon_delete.png')}/>
          </View>
        </TouchableHighlight>
      );
    }
    else {
      return (
        <TouchableHighlight
          style={[styles.styleButton]}
          activeOpacity={1}
          animationVelocity={0}
          underlayColor={'#AFB4BE'}
          onPress={(e) => this.handlerPress(e)}
          onLongPress={()=>this.handlerLongPress()}
          >
          <Text style={styles.styleText}>
            {this.props.btnName}
          </Text>
        </TouchableHighlight>
      );
    }

  }
}

var styles = StyleSheet.create({
  styleButton: {
    //padding: 30,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderRadius:6,
    borderColor: '#DDDDDE',
    backgroundColor: '#ABB3BE',

  },
  styleText: {
    color: '#333333',
    fontSize:20,
  },
  styleImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default number;