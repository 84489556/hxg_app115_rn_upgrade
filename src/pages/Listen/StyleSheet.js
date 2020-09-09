/**
 * 共用于新闻列表页的style
 */

import {
  StyleSheet
} from "react-native";
import * as baseStyle from '../../components/baseStyle.js';


export var styles = StyleSheet.create({
  container: {
  },
  loading: {
      height: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
  },
  loadingIcon: {
      width: 24,
      height: 24,
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 10,
      marginRight: 10
  },
  loadingLabel: {
      fontSize: 14,
      color: baseStyle.DEFAULT_TEXT_COLOR
  },
  listItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
  },
  listItemTitleView: {
    // marginTop:10
  },
  listItemTitle: {
      fontSize: 15,
      //fontWeight: '200',
      marginBottom: 10,
      flex:1,
      color: baseStyle.DEFAULT_TEXT_COLOR
  },
  listItemName: {
    fontSize: 12,
    //marginBottom: 3,
    color: baseStyle.WHITE,
    fontWeight: 'bold'
  },
  listItemCode: {
    fontSize: 12,
    // marginBottom: 5,
    color: baseStyle.WHITE
  },
  listItemSource: {
    fontSize: 12,
    color: baseStyle.GRAY
  },
  listItemTime: {
    fontSize: 12,
    color: baseStyle.GRAY
  },
  listItemContext: {
      marginBottom: 10,
      fontSize: 14,
      color: baseStyle.GRAY
  },
  listItemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between'
  },
});

