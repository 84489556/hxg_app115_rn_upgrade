/**
 * 股票列表项
 */
"use strict";

import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Animated,
  Dimensions,
  Platform
} from "react-native";
import BaseComponent from "../BaseComponentPage";
import StockFormatText from "../../components/StockFormatText";
import * as baseStyle from "../../components/baseStyle";
import ShareSetting from "../../modules/ShareSetting";
import RATE, { DISTANCE } from "../../utils/fontRate";

var deviceWidth = Dimensions.get("window").width;

export default class StockListItem extends BaseComponent {
  styleSheet = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      height: 44,
      paddingLeft: Platform.OS === "ios" ? 9 : 10,
      paddingRight: Platform.OS === "ios" ? 9 : 10,
      borderBottomWidth: 0.5,
      borderBottomColor: baseStyle.LINE_BG_F1
      // backgroundColor:'#ff4334'
    },
    stockLabel: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center"
    },
    name: {
      color: baseStyle.BLACK_100,
      //fontWeight: '200',
      fontSize: RATE(30),
      marginBottom: 4,
      textAlign: "left"
      // backgroundColor:'#cd92ff'
    },
    code: {
      color: baseStyle.BLACK_70,
      fontSize: RATE(24),
      textAlign: "left"
    },
    priceContainer: {
      flex: 1,
      paddingVertical: 5,
      ...Platform.select({ ios: { flex: 0, width: 80 } })
    },
    riseMark: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0
    },
    riseMarkUp: {
      backgroundColor: baseStyle.UP_COLOR
    },
    riseMarkDown: {
      backgroundColor: baseStyle.DOWN_COLOR
    },
    price: {
      textAlign: Platform.OS === "ios" ? "right" : "right",
      fontSize: RATE(32),
      color: baseStyle.BLACK_70,
      paddingRight: Platform.OS === "ios" ? 0 : 0
      // backgroundColor:'#b0ff86'
    },
    priceUp: {
      color: baseStyle.UP_COLOR
    },
    priceDown: {
      color: baseStyle.DOWN_COLOR
    },
    ratioContainer: {
      //backgroundColor: baseStyle.GRAY,
      paddingHorizontal: 2,
      paddingVertical: 5,
      width: deviceWidth < 350 ? 75 : 100,
      marginLeft: 20
    },
    ratioContainerUp: {
      //backgroundColor: baseStyle.UP_BACKGROUND_COLOR
    },
    ratioContainerDown: {
      //backgroundColor: baseStyle.DOWN_BACKGROUND_COLOR
    },
    ratio: {
      fontSize: RATE(32),
      color: baseStyle.WHITE,
      textAlign: "center"
    },
    rise: {
      fontSize: RATE(32),
      color: baseStyle.BLACK_70,
      textAlign: "right",
      width: deviceWidth < 350 ? 80 : 100,
      ...Platform.select({ ios: { width: null, textAlign: "right" } })
    },

    riseUp: {
      color: baseStyle.UP_COLOR
    },
    riseDown: {
      color: baseStyle.DOWN_COLOR
    }
  });

  constructor(props) {
    super(props);

    this.state = {
      riseMarkOpacity: new Animated.Value(0),
      rise: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    // 判断价格变化,显示上涨或者下跌动画效果
    if (
      nextProps.Obj === this.props.Obj &&
      nextProps.ZuiXinJia !== this.props.ZuiXinJia
    ) {
      this.state.riseMarkOpacity.setValue(1);
      Animated.timing(this.state.riseMarkOpacity, {
        toValue: 0,
        duration: 500,
        delay: 0
      }).start();
      this.setState({ rise: nextProps.ZuiXinJia - this.props.ZuiXinJia });
    }
  }

  _renderZhongWenJianCheng() {
    let name = this.props.ZhongWenJianCheng;
    if (ShareSetting.isDelistedStock(name)) {
      name = name.replace("(退市)", "");

      return (
        <View key="ZhongWenJianCheng" style={this.getStyles("stockLabel")}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View>
              <StockFormatText style={this.getStyles("name")}>
                {name}
              </StockFormatText>
            </View>
            <View
              style={[
                this.getStyles("name"),
                {
                  justifyContent: "center",
                  padding: DISTANCE(12),
                  height: DISTANCE(32),
                  marginLeft: DISTANCE(10),
                  backgroundColor: baseStyle.BLACK_30,
                  borderRadius: 4
                }
              ]}
            >
              <View style={{}}>
                <Text style={{ color: baseStyle.WHITE, fontSize: RATE(20) }}>
                  退
                </Text>
              </View>
            </View>
          </View>
          <StockFormatText style={this.getStyles("code")}>
            {this.props.Obj}
          </StockFormatText>
        </View>
      );
    }

    return (
      <View key="ZhongWenJianCheng" style={this.getStyles("stockLabel")}>
        <StockFormatText style={this.getStyles("name")}>
          {this.props.ZhongWenJianCheng}
        </StockFormatText>
        <StockFormatText style={this.getStyles("code")}>
          {this.props.Obj}
        </StockFormatText>
      </View>
    );
  }

  _renderZuiXinJia() {
    return (
      <View
        key="ZuiXinJia"
        style={[this.getStyles("priceContainer"), this.props.ZuiXinJiaStyle]}
      >
        {/* <Animated.View
                    style={this.getUpDownStyle('riseMark', this.state.rise, {opacity: this.state.riseMarkOpacity})}/> */}
        <StockFormatText
          titlename={"ZuiXinJia"}
          style={this.getUpDownStyle("price", this.props.ZhangFu)}
        >
          {this.props.ZuiXinJia}
        </StockFormatText>
      </View>
    );
  }

  _renderZhangDie() {
    return (
      <StockFormatText
        key="ZhangDie"
        style={[
          this.getUpDownStyle("rise", this.props.ZhangDie),
          { textAlign: "right", flex: 1 }
        ]}
        sign={true}
      >
        {this.props.ZhangDie}
      </StockFormatText>
    );
  }

  _renderZhangFu() {
    return (
      <StockFormatText
        key="ZhangFu"
        style={[
          this.getUpDownStyle("rise", this.props.ZhangFu),
          { width: deviceWidth < 350 ? 80 : 100 }
        ]}
        unit="%"
        sign={true}
      >
        {this.props.ZhangFu / 100}
      </StockFormatText>
    );
    // return (
    //   <View key="ZhangFu" style={this.getUpDownStyle('ratioContainer', this.props.ZhangFu)}>
    //     <StockFormatText style={this.getStyles('ratio')} unit="%" sign={true}>{this.props.ZhangFu / 100}</StockFormatText>
    //   </View>
    // );
  }

  _renderZhenFu() {
    return (
      <StockFormatText
        key="ZhenFu"
        unit="%"
        style={{
          textAlign: "center",
          fontSize: 16,
          marginLeft: 20,
          width: 100
        }}
      >
        {this.props.ZhenFu / 100}
      </StockFormatText>
    );
  }

  _renderHuanShou() {
    return (
      <StockFormatText
        key="HuanShou"
        unit="%"
        style={{
          textAlign: "center",
          fontSize: RATE(32),
          color: baseStyle.BLACK_100,
          marginLeft: 20,
          width: 100
        }}
      >
        {this.props.HuanShou / 100}
      </StockFormatText>
    );
  }

  render() {
    // 判断如果props中column中字段存在,则展示指定的字段,最多4列,默认展示[名称,现价,涨跌,涨幅]
    let column = (
      this.props.column || [
        "ZhongWenJianCheng",
        "ZuiXinJia",
        "ZhangDie",
        "ZhangFu"
      ]
    ).slice(0, 4),
      result = (
        <View style={this.getStyles("container")}>
          {column.map(eachColumn => this["_render" + eachColumn]())}
        </View>
      );
    return this.props.onPress ? (
      <TouchableHighlight
        style={{ backgroundColor: "#fff" }}
        onPress={() => this.props.onPress && this.props.onPress(this.props)}
        onLongPress={() =>
          this.props.onLongPress && this.props.onLongPress(this.props)
        }
        underlayColor={baseStyle.HIGH_LIGHT_COLOR}
      >
        {result}
      </TouchableHighlight>
    ) : (
        result
      );
  }
}
