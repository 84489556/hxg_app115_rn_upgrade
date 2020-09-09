/*
* numberOfLines  显示的行数  默认值：2
* expandView   展开按钮view  --
* unexpandView  收起按钮view  --
* onExpand    点击展开事件回调  --
* onCollapse  点击收起事件回调  --
* expandText  展开按钮文字内容  默认值：展开
* foldText  收起按钮文字内容  默认值：收起
* expandButtonLocation  按钮位置（只能是固定三个值） 默认值：'flex-end'
*
*
* demo
 <View style={{padding:10}}>
 <ExpandableText
 // numberOfLines={2}
 // expandText={'全文'}
 // expandButtonLocation = {'center'}
 >
 {'123'}
 </ExpandableText>
*/



import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


let textHeight = 20;
export default class ExpandableText extends React.Component {
  constructor(props) {
    super(props);
    this.expandText = props.expandText;
    this.foldText = props.foldText;

    this.state = {
      expanded: false,
      numberOfLines: null,
      showExpandView: false,
      containerHeight: 0,
      expandText: this.expandText,
    }
    this.numberOfLines = props.numberOfLines;
    this.minHeight = textHeight * this.numberOfLines;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // console.log('shouldComponentUpdate1111 = ',nextProps,this.props);
    if (this.props.children !== nextProps.children) {
      // console.log("shouldComponentUpdate1111---组件需要更新");
      this.maxHeight = undefined;
      this.minHeight = textHeight * this.numberOfLines;;
      return true;
    }

    if (nextState.numberOfLines !== this.state.numberOfLines
      || nextState.expanded !== this.state.expanded
      || nextState.showExpandView !== this.state.showExpandView) {
      // console.log("shouldComponentUpdate1111---组件需要更新  state",nextState,this.state);
      return true;
    }

    return false;
  }

  onTextLayout(event) {
    this.maxHeight = event.nativeEvent.layout.height
    // console.log('shouldComponentUpdate1111 onTextLayout' ,this.state.numberOfLines,this.numberOfLines,event.nativeEvent.layout,this.minHeight)
    if (this.minHeight && !this.state.numberOfLines) {
      if (this.maxHeight > this.minHeight) {
        this.minHeight = undefined;
        this.setState({ showExpandView: true, numberOfLines: this.numberOfLines })
      }
    }
  }

  onPressExpand() {
    if (!this.state.expanded) {
      this.setState({ numberOfLines: null, expandText: this.foldText, expanded: true })
      if (this.props.onCollapse) {
        this.props.onCollapse()
      }
    } else {
      this.setState({ numberOfLines: this.numberOfLines, expandText: this.expandText, expanded: false })
      if (this.props.onExpand) {
        this.props.onExpand()
      }
    }
  }


  _renderExpandView = () => {

    //console.log('render _renderExpandView',this.state.numberOfLines)
    let imageS = require('../images/login/zhankai.png');

    if (this.state.expanded) {
      imageS = require('../images/login/shouqi.png');
    }

    const { expandTextStyle, expandButtonLocation } = this.props
    return (
      <View style={{ flexDirection: 'row', justifyContent: expandButtonLocation, alignItems: 'center' }}>
        <Text style={[styles.expandText, expandTextStyle]}>
          {this.state.expandText}
        </Text>
        <Image style={{ marginLeft: 4 }} source={imageS} />
      </View>
    )
  }


  render() {
    let renderExpandView = this._renderExpandView();
    const { expandView, unexpandView, numberOfLines, ...rest } = this.props


    if (!this.state.expanded && expandView) {
      renderExpandView = expandView()
    }
    if (this.state.expanded && unexpandView) {
      renderExpandView = unexpandView()
    }

    // console.log('shouldComponentUpdate1111 render ',this.state.numberOfLines,this.props.children,this.state.expanded,this.state.showExpandView);
    renderExpandView = this.state.showExpandView ? renderExpandView : null

    return (
      <View>
        <Text
          // numberOfLines={0}
          numberOfLines={this.state.numberOfLines}
          onLayout={this.onTextLayout.bind(this)}
          style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', lineHeight: 20 }}
          {...rest}
        >
          {this.props.children}
        </Text>

        <TouchableOpacity onPress={this.onPressExpand.bind(this)}>
          {renderExpandView}
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  expandText: {
    color: '#44a2ff',
    marginTop: 0,
    textAlign: 'right',
  },
})

ExpandableText.propTypes = {
  children: PropTypes.string.isRequired,
  numberOfLines: PropTypes.number,
  expandView: PropTypes.func,
  unexpandView: PropTypes.func,
  onExpand: PropTypes.func,
  onCollapse: PropTypes.func,
  expandText: PropTypes.string,
  foldText: PropTypes.string,
  expandButtonLocation: PropTypes.oneOf(['flex-start', 'center', 'flex-end']),
}

ExpandableText.defaultProps = {
  numberOfLines: 2,
  expandText: '展开',
  foldText: '收起',
  expandButtonLocation: 'flex-end'

}
