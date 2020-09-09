import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Modal,
    Platform
} from 'react-native';

import {Calendar,LocaleConfig} from 'react-native-calendars';

import RATE from '../utils/fontRate.js';
import * as baseStyle from '../components/baseStyle.js';

LocaleConfig.locales['cn'] = {
  monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
  monthNamesShort: ['01','02','03','04','05','06','07','08','09','10','11','12'],
  dayNames: ['星期日', '星期一','星期二	','星期三','星期四','星期五','星期六'],
  dayNamesShort: ['日','一','二','三','四','五','六']
};

LocaleConfig.defaultLocale = 'cn';

const calendarHeight = 300;
import TranslucentModal from 'react-native-translucent-modal';
 
export default class CalendarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: new Animated.Value(0),
      hide: true,
      selected: props.selectedDay,
    };
    this.lastSelect = undefined;
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  componentWillReceiveProps(nextProps,netxContext){
    this.setState({selected: nextProps.selectedDay});
  }
  render(){
    //let selected_date = {[this.state.selected]: {selected: true}};
    let markedDates = {...this.props.markedDates};
    markedDates[this.state.selected] = {selected: true};
    if (this.state.hide) {
      return (<View style={{backgroundColor:'red'}}/>)
    } else {
        return (
            <TranslucentModal
                animationType={'none'}
                transparent={true}
                visible={!this.state.hide}
                onRequestClose={() => {this._setModalVisible && this._setModalVisible()}}>

                <TouchableWithoutFeedback onPress={()=>{this._setModalVisible && this._setModalVisible()}}>
                    <View style={styles.container} >
                        <TouchableWithoutFeedback>
                            <Animated.View style={[styles.innerContainer, {
                                transform: [{
                                    translateY: this.state.offset.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [calendarHeight, 0]
                                    }),
                                }]
                            }]}>
                                <Calendar
                                    //onDayPress={this.props.onSelectDay}
                                    onDayPress={(day)=>{
                                        this.setState({selected:day.dateString})
                                        this.lastSelect = day;
                                    }}
                                    onCancel={()=>this.close()}
                                    onOK={()=>{
                                        this.props.onSelectDay(this.lastSelect)
                                    }}
                                    style={styles.calendar}
                                    hideExtraDays
                                    maxDate={this.props.maxDate}
                                    minDate={this.props.minDate}
                                    markedDates={markedDates}
                                    current={this.state.selected}
                                    monthFormat={'yyyy-MM'}
                                    theme={{
                                        calendarBackground: baseStyle.WHITE,
                                        textSectionTitleColor: baseStyle.BLACK_100,
                                        dayTextColor: baseStyle.BLACK_100,
                                        todayTextColor: baseStyle.PINK_HIGH_LIGHT,
                                        selectedDayTextColor: baseStyle.WHITE,
                                        monthTextColor: baseStyle.BLACK_100,
                                        selectedDayBackgroundColor: baseStyle.PINK_HIGH_LIGHT,
                                        arrowColor: baseStyle.BLACK_100,
                                        textDisabledColor: baseStyle.BLACK_50,
                                        textDayFontSize: RATE(36),
                                        textMonthFontSize: RATE(32),
                                        textDayHeaderFontSize: RATE(36),
                                        textButtonFontSize:RATE(32),
                                        textButtonColor:baseStyle.BLUE_HIGH_LIGHT,
                                    }}
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </TranslucentModal>
        );


    }   
  }
    _setModalVisible(){
      this.out();
    }

  //显示动画
  in() {
    //  StatusBar.setBackgroundColor("#00ff00",false);

    Animated.timing( this.state.offset,
      {
        easing: Easing.linear,
        duration: 200,
        toValue: 1,
      }
    ).start();
 }
 
  //隐藏动画
  out() {
     // StatusBar.setBarStyle("dark-content",false);
    Animated.timing(this.state.offset,
      {
        easing: Easing.linear,
        duration: 200,
        toValue: 0,
      }
    ).start((finished) => this.setState({hide: true}));
  }
 
  //取消
  close() {
    if (!this.state.hide) {
      this.out();
    }
  }
 
  show() {
    if (this.state.hide) {
      this.setState({hide: false}, this.in);
    }
  }
}

// function RATE(x) {
//   var {height, width} = Dimensions.get('window');
// 	return x * Math.min(height, width) / 750;
// }


const styles = StyleSheet.create({
  calendar: {
    borderTopWidth: 0,
    paddingTop: 0,
    borderBottomWidth: 0,
    borderColor: '#eee',
    height: calendarHeight,
  },
  innerContainer: {
    borderRadius: 0,
    //alignItems: 'flex-end',
    backgroundColor: '#fff',
    //padding:20,
    justifyContent: 'flex-end',
    height: calendarHeight,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 0,
    backgroundColor: baseStyle.BLACK_50,
  },
});