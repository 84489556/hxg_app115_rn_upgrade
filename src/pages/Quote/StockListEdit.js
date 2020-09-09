'use strict';

import React, {Component} from 'react';
import {
  StyleSheet, 
  View, 
  Text, 
  TouchableHighlight, 
  TouchableWithoutFeedback, 
  Image
} from 'react-native';

import SortableListView from './SortableListView'
import * as baseStyle from '../../components/baseStyle.js';
import ShareSetting from  '../../modules/ShareSetting'


class RowComponent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isChecked: this.props.isSelected
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.isChecked !== nextProps.isSelected) {
      this.setState({isChecked: nextProps.isSelected})
      console.debug('componentWillReceiveProps', nextProps.isSelected)
    }
  }

  onClick(key) {
    this.props.selected(key)
    this.setState({isChecked: !this.state.isChecked})
  }

  renderImage() {
    var source = this.state.isChecked ? require('../../images/icons/CheckedBox.png') : require('../../images/icons/CheckBox.png');
    return (
        <Image source={source}/>
    )
  }

  render() {
    console.debug('RowComponent render')

    var dragImage = require('../../images/icons/drag.png')
    var toTopImage = require('../../images/icons/totop.png')

      let ZhongWenJianCheng = this.props.data.ZhongWenJianCheng
      let isTS = ShareSetting.isDelistedStock(ZhongWenJianCheng)
    return <TouchableHighlight underlayColor={'#eee'} style={{backgroundColor: baseStyle.WHITE, borderBottomWidth:1, borderColor: '#eee'}} {...this.props.sortHandlers}>


    <View style={styles.container}>

        <TouchableHighlight
            style={{flex: 0.5}}
            onPress={()=>this.onClick(this.props.data.key)}
            underlayColor='transparent'
        >
          <View style={[styles.stockLabel,{flexDirection: 'row', alignItems: 'center'}]}>
            {this.renderImage()}
          </View>
        </TouchableHighlight>


        <View style={[styles.stockLabel, {alignItems:'center',flexDirection:'row',justifyContent:'flex-start',
            marginBottom: 4,
        }]}>
          <Text style={styles.name}>{ZhongWenJianCheng.replace(/\(退市\)/g,"")}</Text>
            {isTS ? <View style={{
                backgroundColor:'#AAAAAA',
                borderRadius:4,
                height:16,
                width:21,
                justifyContent:'center',
                alignItems:'center',
                marginLeft:3,
            }}>
              <Text style={{color:'#fff',fontSize:10}}>{'退'}</Text>
            </View> : null}
        </View>


        <View style={[styles.stockLabel, {alignItems:'center'}]} >
            <TouchableWithoutFeedback
                hitSlop={{top: 0, left: 20, bottom: 0, right: 20}}
                onPress={() => {
            this.props.onStick(this.props.data.key);
            }}>
              <View style={{flex:1,width: 30, height: 30, alignItems:'center',justifyContent:'center'}}>
                  <Image source={toTopImage}/>
              </View>
            </TouchableWithoutFeedback>
        </View>

        <TouchableWithoutFeedback onPressIn={this.props.handleLongPress}>
            <View style={[styles.stockLabel, {alignItems:'center'}]}>
                <Image source={dragImage} style={{width: 17, height: 14}}/>
            </View>
        </TouchableWithoutFeedback>
      </View>


    </TouchableHighlight>
  }
}

export default class StockListEdit extends Component {

  constructor(props) {
    super(props)

    this.state = {
        data: props.data
    }
  }

//   componentDidMount() {
//     _order = Object.keys(this.props.data)
//   }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({data: nextProps.data})
    }
  }

  renderRow(data, section, index, handleLongPress, active) {
    return <RowComponent data={data} handleLongPress={handleLongPress} onStick={this.props.onStick} isSelected={data.isSelected} selected={this.props.selected}/>
  }

  render() {

    return (
      <View style={{flex: 1, backgroundColor: '#F5FCFF',}}>

        <SortableListView
            style={{flex: 1, marginBottom: 0}}
            data={this.props.data}
            onRowMoved={e => {
              this.props.onChangeRow(e.to, e.from)
            }}
            renderRow={(row, section, index, handleLongPress, active) => this.renderRow(row, section, index, handleLongPress, active)}
        />
      </View>
      )

  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    // paddingLeft: Platform.OS === 'ios' ? 9:10,
    // paddingRight: Platform.OS === 'ios' ? 9:10,
    borderBottomWidth: 1,
    borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR,
  },
  stockLabel: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    color: baseStyle.DEFAULT_TEXT_COLOR,
    fontSize: 16,
    textAlign: 'center',
  }
});

