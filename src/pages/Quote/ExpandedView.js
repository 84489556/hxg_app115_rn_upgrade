/**
 * Created by mhc
 * Expended View
 */

import React, { PureComponent } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  DeviceEventEmitter,
  Animated
} from "react-native";

export const TouchFlag = {
  bigger: 0,
  smaller: 1,
  older: 2,
  later: 3,
  land: 4
};

type Props = {
  bigPress: Function,
  smallPress: Function,
  latePress: Function,
  oldPress: Function,
  landPress: Function,
  isLand: Number,
  styles: Object
};

type State = {};

export default class ExpendedView extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      width: 35,
      expanded: false,
      animation: new Animated.Value(35)
    };
    this.expanded = false;
    this.timer = null;
    this.coefficient = 0;
  }

  componentDidMount() {
    this.isLimited=DeviceEventEmitter.addListener("isLimited", () => {
      this.stopTimer();
    });
  }
  componentWillUnmount(){
    this.isLimited&&this.isLimited.remove();
  }

  onClicked = () => {
    let msg = this.expanded ? "收回" : "展开";
    const { animation } = this.state;

    const initialValue = this.expanded ? 175 : 35;
    const finalValue = this.expanded ? 35 : 175;

    this.expanded = !this.expanded;

    this.setState({ expanded: this.expanded });

    animation.setValue(initialValue);
    Animated.timing(animation, {
      toValue: finalValue,
      duration: 200
    }).start();
  };

  startTimer = flag => {
    switch (flag) {
      case TouchFlag.bigger:
        this.props.bigPress();
        break;
      case TouchFlag.smaller:
        this.props.smallPress();
        break;
      case TouchFlag.older:
        this.props.oldPress();
        break;
      case TouchFlag.later:
        this.props.latePress();
        break;
    }
    //定时每0.5秒运行一次
    this.timer = setInterval(() => {
      switch (flag) {
        case TouchFlag.bigger:
          this.props.bigPress();
          break;
        case TouchFlag.smaller:
          this.props.smallPress();
          break;
        case TouchFlag.older:
          this.props.oldPress();
          break;
        case TouchFlag.later:
          this.props.latePress();
          break;
      }
    }, 500);
  };

  stopTimer = () => {
    clearInterval(this.timer);
  };

  onPress = flag => {
    switch (flag) {
      case TouchFlag.bigger:
        this.props.bigPress();
        break;
      case TouchFlag.smaller:
        this.props.smallPress();
        break;
      case TouchFlag.older:
        this.props.oldPress();
        break;
      case TouchFlag.later:
        this.props.latePress();
        break;
    }
  };
  onLandPress = () => {
    this.props.landPress();
  };
  render() {
    let title = this.state.expanded ? "收回" : "展开";
    let expandIcon = this.state.expanded;
    const { animation } = this.state;
    return (
      <View
        style={[{ height: 35, flexDirection: "row" }, this.props.styles]}
        zIndex={1}
      >
        <Animated.View
          style={{
            overflow: "hidden",
            height: 35,
            flexDirection: "row",
            width: animation
          }}
          zIndex={2}
        >
          <TouchableOpacity style={styles.itemStyle} onPress={this.onClicked}>
            <Image style={styles.contentImage} source={expandIcon} />
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={styles.itemStyle}
              onPress={() => {
                this.onPress(TouchFlag.bigger);
              }}
              onLongPress={() => {
                this.startTimer(TouchFlag.bigger);
              }}
              onPressOut={this.stopTimer}
            >
              <Image
                style={styles.contentImage}
                source={require("../../images/icons/bigger_icon.png")}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={styles.itemStyle}
              onPress={() => {
                this.onPress(TouchFlag.smaller);
              }}
              onLongPress={() => {
                this.startTimer(TouchFlag.smaller);
              }}
              onPressOut={this.stopTimer}
            >
              <Image
                style={styles.contentImage}
                source={require("../../images/icons/smaller_icon.png")}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={styles.itemStyle}
              onPress={() => {
                this.onPress(TouchFlag.older);
              }}
              onLongPress={() => {
                this.startTimer(TouchFlag.older);
              }}
              onPressOut={this.stopTimer}
            >
              <Image
                style={styles.contentImage}
                source={require("../../images/icons/older_icon.png")}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={styles.itemStyle}
              onPress={() => {
                this.onPress(TouchFlag.later);
              }}
              onLongPress={() => {
                this.startTimer(TouchFlag.later);
              }}
              onPressOut={this.stopTimer}
            >
              <Image
                style={styles.contentImage}
                source={require("../../images/icons/later_icon.png")}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
        {this.props.isLand !== 1 ? (
          <View>
            <TouchableOpacity
              style={styles.itemStyle}
              onPress={this.onLandPress}
            >
              <Image
                style={styles.contentImage}
                source={require("../../images/icons/land_icon.png")}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center"
  },
  itemStyle: {
    opacity: 0.9,
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center"
  },
  contentImage: {
    height: 20,
    width: 20
  }
});
