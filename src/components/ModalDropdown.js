
'use strict';

import React, {
  Component,
} from 'react';

import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TouchableHighlight,
  Platform,
  Modal,
  Image,
  StatusBar,
  ActivityIndicator,
    FlatList,
} from 'react-native';
import PropTypes from 'prop-types';

//const TOUCHABLE_ELEMENTS = ['TouchableHighlight', 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableWithNativeFeedback'];

import ModalAndroid from 'react-native-translucent-modal';
//import * as ScreenUtil from '../utils/ScreenUtil';

export class ModalDropdown extends Component {
  static defaultProps = {
    disabled: false,
    defaultIndex: -1,
    defaultValue: 'Please select...',
    options: null,
  };

  static propTypes = {
    disabled: PropTypes.bool,
    defaultIndex: PropTypes.number,
    defaultValue: PropTypes.string,

    options: PropTypes.arrayOf(PropTypes.string),

    style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    dropdownStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),

    renderRow: PropTypes.func,
    renderSeparator: PropTypes.func,

    onDropdownWillShow: PropTypes.func,
    onDropdownWillHide: PropTypes.func,
    onSelect: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this._button = null;
    this._buttonFrame = null;
    this._nextValue = null;
    this._nextIndex = null;

    this.state = {
      disabled: props.disabled,
      loading: props.options == null,
      showDropdown: false,
      buttonText: props.defaultValue,
      selectedIndex: props.defaultIndex,
    };
  }

  componentWillReceiveProps(nextProps) {
    var buttonText = this._nextValue == null ? this.state.buttonText : this._nextValue;
    var selectedIndex = this._nextIndex == null ? this.state.selectedIndex : this._nextIndex;
    if (selectedIndex < 0) {
      selectedIndex = nextProps.defaultIndex;
      if (selectedIndex < 0) {
        buttonText = nextProps.defaultValue;
      }
    }
    this._nextValue = null;
    this._nextIndex = null;

    this.setState({
      disabled: nextProps.disabled,
      loading: nextProps.options == null,
      buttonText: buttonText,
      selectedIndex: selectedIndex,
    });
  }

  render() {
    return (
      <View {...this.props}>
        {this._renderButton()}
        {this._renderModal()}
      </View>
    );
  }

  _updatePosition(callback) {
    if (this._button && this._button.measure) {
      this._button.measure((fx, fy, width, height, px, py) => {
        this._buttonFrame = { x: px, y: py, w: width, h: height };
        callback && callback();
      });
    }
  }

  show() {
    this._updatePosition(() => {
      this.setState({
        showDropdown: true,
      });
    });
  }

  hide() {
    this.setState({
      showDropdown: false,
    });
  }

  select(idx) {
    var value = this.props.defaultValue;
    if (idx == null || this.props.options == null || idx >= this.props.options.length) {
      idx = this.props.defaultIndex;
    }

    if (idx >= 0) {
      value = this.props.options[idx];
    }

    this._nextValue = value;
    this._nextIndex = idx;

    this.setState({
      buttonText: value,
      selectedIndex: idx,
    });
  }

  _renderButton() {
    return (
      <TouchableOpacity ref={button => this._button = button}
        disabled={this.props.disabled}
        onPress={this._onButtonPress.bind(this)}>
        {
          this.props.children ||
          (
            <View style={[this.props.buttonStyle, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={[styles.buttonText, this.props.textStyle]}
                numberOfLines={1}>
                {this.state.buttonText}
              </Text>
              <Image style={{ marginLeft: 5, width: 8, height: 4 }} source={require('../images/icons/perioddropdown.png')} />
            </View>
          )
        }
      </TouchableOpacity>
    );
  }

  _onButtonPress() {
    if (!this.props.onDropdownWillShow ||
      this.props.onDropdownWillShow() !== false) {
      this.show();
    }
  }
  _renderModal() {
    if (this.state.showDropdown && this._buttonFrame) {
      let imgH = 5, imgW = 14
      let frameStyle = this._calcPosition();
      frameStyle.height += imgH; //顶部三角的高度
      //console.log(`frameStyle={width:${frameStyle.width}, height:${frameStyle.height}, top:${frameStyle.top}, left:${frameStyle.left}}`);
      if (Platform.OS === 'ios') {
        return (
          <Modal supportedOrientations={this.props.supportedOrientations}
            animationType='fade'
            transparent={true}
            onRequestClose={this._onRequestClose.bind(this)}>

            <TouchableWithoutFeedback onPress={this._onModalPress.bind(this)}>
              <View style={[styles.modal, { backgroundColor: 'transparent' }]}>

                <View style={[styles.dropdown, this.props.dropdownStyle, frameStyle, { backgroundColor: 'transparent' }]}>
                  <View style={{ backgroundColor: 'transparent' }}>
                    <Image style={[{ width: imgW, height: imgH }]} source={require('../images/icons/arrow_in_dropdownmodal.png')} />
                  </View>
                  {this.state.loading ? this._renderLoading() : this._renderDropdown()}
                </View>

              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )
      } else {
        return (
          <ModalAndroid animationType='fade'
            transparent={true}
            onRequestClose={this._onRequestClose.bind(this)}>

            <TouchableWithoutFeedback onPress={this._onModalPress.bind(this)}>
              <View style={[styles.modal, { backgroundColor: 'transparent' }]}>
                <View style={[styles.dropdown, this.props.dropdownStyle, frameStyle, { backgroundColor: 'transparent' }]}>
                  <View style={{ backgroundColor: 'transparent' }}>
                    <Image style={[{ width: imgW, height: imgH }]} source={require('../images/icons/arrow_in_dropdownmodal.png')} />
                  </View>
                  {this.state.loading ? this._renderLoading() : this._renderDropdown()}
                </View>

              </View>
            </TouchableWithoutFeedback>
          </ModalAndroid>
        )
      }
    }
  }
  //transparent
  _calcPosition() {
    let dimensions = Dimensions.get('window');
    let windowWidth = dimensions.width;
    let windowHeight = dimensions.height;

    let dropdownHeight = (this.props.dropdownStyle && StyleSheet.flatten(this.props.dropdownStyle).height) ||
      StyleSheet.flatten(styles.dropdown).height;

    let bottomSpace = windowHeight - this._buttonFrame.y - this._buttonFrame.h;
    let rightSpace = windowWidth - this._buttonFrame.x;
    let showInBottom = bottomSpace >= dropdownHeight || bottomSpace >= this._buttonFrame.y;
    let showInLeft = rightSpace >= this._buttonFrame.x;


    var style = {
      height: dropdownHeight,
      top: showInBottom ? Platform.OS == "android" ? this._buttonFrame.y + this.props.dropdownStyle.marginTop : this._buttonFrame.y /*+ this._buttonFrame.h*/ : Math.max(0, this._buttonFrame.y - dropdownHeight),//下拉时多出空白的问题
    }


    if (showInLeft) {
      style.left = this._buttonFrame.x;
    } else {
      let dropdownWidth = (this.props.dropdownStyle && StyleSheet.flatten(this.props.dropdownStyle).width) ||
        (this.props.style && StyleSheet.flatten(this.props.style).width) || -1;
      if (dropdownWidth !== -1) {
        style.width = dropdownWidth;
      }
      style.right = rightSpace - this._buttonFrame.w;
    }

    return style;
  }

  _onRequestClose() {
    if (!this.props.onDropdownWillHide ||
      this.props.onDropdownWillHide() !== false) {
      this.hide();
    }
  }

  _onModalPress() {
    if (!this.props.onDropdownWillHide ||
      this.props.onDropdownWillHide() !== false) {
      this.hide();
    }
  }

  _renderLoading() {
    return (
      <ActivityIndicator size='small' />
    );
  }

  _renderDropdown() {
    let newDatas = [];
    if(this.props.options && this.props.options.length>0){
      for (let i = 0; i<this.props.options.length;i++){
         let items = {};
         items.index = i;
         items.datas = this.props.options[i];
          newDatas.push(items)
      }
    }
    return (
      // <ListView style={styles.list}
      //   dataSource={this._dataSource}
      //   renderRow={this._renderRow.bind(this)}
      //   renderSeparator={this.props.renderSeparator || this._renderSeparator.bind(this)}
      //   automaticallyAdjustContentInsets={false}
      // />
        <FlatList
            style={styles.list}
            data = {newDatas}
            ItemSeparatorComponent={()=>{return <View style={styles.separator}/>}}
            renderItem = {({item})=>this.renderItems(item)}
      />
    );
  }
    renderItems(item){
        //console.log("dropDownItem数据",item);
        let highlighted = item.index == this.state.selectedIndex;
        return(
        this.props.renderRow ?
            <TouchableHighlight key= {item.index} onPress={()=>{this._onflatlistRowPress(item)}} style={{}}>
                {this.props.renderRow(item.datas,item.index,highlighted)}
            </TouchableHighlight>
            :
        <TouchableHighlight key= {item.index} onPress={()=>{this._onflatlistRowPress(item)}}>
            <Text style={[styles.rowText, highlighted && styles.highlightedRowText]}>
                {item.datas}
            </Text>
        </TouchableHighlight>)
    }

    _onflatlistRowPress(item) {
        if (!this.props.onSelect ||
            this.props.onSelect(item.index, item.datas) !== false) {
            this._nextValue = item.datas;
            this._nextIndex = item.index;
            this.setState({
                buttonText: item.datas,
                selectedIndex: item.index,
            });
        }
        if (!this.props.onDropdownWillHide ||
            this.props.onDropdownWillHide() !== false) {
            this.setState({
                showDropdown: false,
            });
        }
    }

  // get _dataSource() {
  // let ds = new ListView.DataSource({
  //   rowHasChanged: (r1, r2) => r1 !== r2,
  // });
  // return ds.cloneWithRows(this.props.options);
  // }

  // _renderRow(rowData, sectionID, rowID, highlightRow) {
  //   let key = `row_${rowID}`;
  //   let highlighted = rowID == this.state.selectedIndex
  //   let row = !this.props.renderRow ?
  //     (<Text style={[styles.rowText, highlighted && styles.highlightedRowText]}>
  //       {rowData}
  //     </Text>) :
  //     this.props.renderRow(rowData, rowID, highlighted);
  //   let preservedProps = {
  //     key: key,
  //     onPress: () => this._onRowPress(rowData, sectionID, rowID, highlightRow),
  //   };
  //   if (TOUCHABLE_ELEMENTS.find(name => name == row.type.displayName)) {
  //     var props = { ...row.props };
  //     props.key = preservedProps.key;
  //     props.onPress = preservedProps.onPress;
  //     switch (row.type.displayName) {
  //       case 'TouchableHighlight': {
  //         return (
  //           <TouchableHighlight {...props}>
  //             {row.props.children}
  //           </TouchableHighlight>
  //         );
  //       }
  //         break;
  //       case 'TouchableOpacity': {
  //         return (
  //           <TouchableOpacity {...props}>
  //             {row.props.children}
  //           </TouchableOpacity>
  //         );
  //       }
  //         break;
  //       case 'TouchableWithoutFeedback': {
  //         return (
  //           <TouchableWithoutFeedback {...props}>
  //             {row.props.children}
  //           </TouchableWithoutFeedback>
  //         );
  //       }
  //         break;
  //       case 'TouchableWithNativeFeedback': {
  //         return (
  //           <TouchableWithNativeFeedback {...props}>
  //             {row.props.children}
  //           </TouchableWithNativeFeedback>
  //         );
  //       }
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  //   return (
  //     <TouchableHighlight {...preservedProps}>
  //       {row}
  //     </TouchableHighlight>
  //   );
  // }

  // _onRowPress(rowData, sectionID, rowID, highlightRow) {
  //   if (!this.props.onSelect ||
  //     this.props.onSelect(rowID, rowData) !== false) {
  //     highlightRow(sectionID, rowID);
  //     this._nextValue = rowData;
  //     this._nextIndex = rowID;
  //     this.setState({
  //       buttonText: rowData,
  //       selectedIndex: rowID,
  //     });
  //   }
  //   if (!this.props.onDropdownWillHide ||
  //     this.props.onDropdownWillHide() !== false) {
  //     this.setState({
  //       showDropdown: false,
  //     });
  //   }
  // }

  // _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
  //   let key = `spr_${rowID}`;
  //   return (<View style={styles.separator}
  //     key={key}
  //   />);
  // }
}

const styles = StyleSheet.create({
  button: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
  },
  modal: {
    flex: 1,
    flexDirection: 'column'
  },
  dropdown: {
    position: 'absolute',
    height: (35 + StyleSheet.hairlineWidth) * 5,
    // borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgray',
    borderRadius: 2,
    backgroundColor: 'white',
    justifyContent: 'center',

  },
  loading: {
    alignSelf: 'center',
  },
  list: {
    flex: 1,
  },
  rowText: {
    flex: 1,
    paddingHorizontal: 6,
    fontSize: 11,
    height: 32,
    lineHeight: 32,
    color: 'gray',
    backgroundColor: 'white',
    textAlignVertical: 'center',
  },
  highlightedRowText: {
    color: 'black',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'lightgray',
  }
});



function HOCFactory() {
  return class HOC extends React.Component {
    getWrappedInstance = () => {
      if (this.props.forwardRef) {
        return this.wrappedInstance;
      }
    }

    setWrappedInstance = (ref) => {
      this.wrappedInstance = ref;
    }

    render() {
      let props = {
        ...this.props
      };

      if (this.props.forwardRef) {
        props.ref = this.setWrappedInstance;
      }

      return <ModalDropdown {...props} />
    }
  }
}


import { connect } from 'react-redux';


export default connect((state) => ({

}),
  (dispatch) => ({

  }), null,
  { forwardRef: true }
)(HOCFactory())