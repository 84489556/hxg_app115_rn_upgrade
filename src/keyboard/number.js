/**
 * Keyboard by yzj
 */
import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
} from 'react-native';



class number extends Component {
  constructor(props) {
    super();

    this.state = {
      //value: valueHash[props.btnName]
    };
    
  }

  handlerPress(e) {
    this.props.onPressHandler(
      this.props.btnName
    );
  }

  handlerLongPress() {
    if (this.props.onLongPressHandler === undefined) {
      return;
    }

    this.props.onLongPressHandler(this.props.btnName);
  }

  render() {
    if (this.props.isLeft) {
      return (
        <TouchableHighlight
          style={styles.styleButton}
          activeOpacity={1}
          animationVelocity={0}
          underlayColor={'#c0c0c0'}
          onPress={(e) => this.handlerPress(e)}
          onLongPress={()=>this.handlerLongPress()}
          >
          <Text style={styles.styleText}>
            {this.props.btnName}
          </Text>
        </TouchableHighlight>
      );
    }else{
      return (
        <TouchableHighlight
          style={[styles.styleButtonForLeft,,{backgroundColor:this.props.bgColor}]}
          activeOpacity={1}
          animationVelocity={0}
          underlayColor={'#c0c0c0'}
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
    backgroundColor: '#ffffff',
    // ...Platform.select({ios:{
    //   borderWidth: 0,
    //   borderTopWidth: 1,
    //   borderRightWidth:1,
    //
    // }})
  },
  styleButtonForLeft: {
    //padding: 30,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,borderRadius:6,borderColor: '#DDDDDE',
    backgroundColor: '#5A5F62',
    // ...Platform.select({ios:{
    //   borderWidth: 0,
    //   borderTopWidth: 1,
    //   borderRightWidth:1,
    //
    // }})
  },
  styleText: {
    color: '#333333',
    fontSize:20,
  },
});

export default number;