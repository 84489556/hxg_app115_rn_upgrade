/**
 * Keyboard by yzj
 * 
 */
'use strict';

import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight,
    Platform,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';
import PropTypes from 'prop-types';
import * as baseStyle from '../components/baseStyle';
import NumberButton from './number';
import SymbolButton from './symbol';
import { register, insertText, uninstall, switchSystemKeyboard, clearFocus, backSpace, doDelete, gainFocus } from '../../node_modules_modify/react-native-custom-keyboard';
import AsyncStorage from '@react-native-community/async-storage';

const BG_COLOR = '#6495ED';
class Keyboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { curtype: "123", }
        //bind所有方法
        this.isABC = false;
        this._switchIMEToNumber = this._switchIMEToNumber.bind(this)
        this._switchIMEToABC = this._switchIMEToABC.bind(this)
        this._switchIMEToChinese = this._switchIMEToChinese.bind(this)
        this._showKeyboardTabBar = this._showKeyboardTabBar.bind(this)
        this.ISABCListener = DeviceEventEmitter.addListener('ISABC', (e) => {
            if (e == 'true') {
                this.isABC = true;
                this.setState({ curtype: 'ABC' });
            } else {
                this.isABC = false;
                this.setState({ curtype: '123' });
            }
        })
        // AsyncStorage.getItem('isABC').then((value)=>{
        //     if(value == 'true'){
        //         this.isABC = true;
        //         this.setState({curtype: 'ABC'});
        //     }else{
        //         this.isABC = false;
        //         this.setState({curtype: '123'});
        //     }
        // });

    }


    componentWillUnmount() {
        this.ISABCListener && this.ISABCListener.remove()
    }

    _ejectSystemKeyboard() { }

    _clearAll() {
        // this.props.onClear();
    }

    //键盘点击
    _onPress(key) {
        if (key === '') {
            return;
        } else if (key === 'daxiaoxie') {
            //字母键盘上的上档键 该不做任何处理
        } else if (key === '隐藏') {
            // this.props.onSZZS();
        } else if (key === '空格') {
            // this.props.onSZCZ();
            //字母键盘上的空格键 该不做任何处理
        } else if (key === '确定') {
            // this.props.onClose()
            clearFocus(this.props.tag)
        } else if (key === 'ABC' || key === '123') {
            this.isABC = !this.isABC;
            if (this.isABC) {
                this.setState({ curtype: '123' });
            }
            else {
                this.setState({ curtype: 'ABC' });
            }
        } else if (key === 'del') {
            // this.props.onDelete(); 
            backSpace(this.props.tag)
        } else {
            //回显到输入框
            insertText(this.props.tag, key);
            // this.props.onKeyPress(key);
        }

    }

    _onLongPress(key) {
        if (key === 'del') {
            //    this._clearAll();     
        }
    }

    render() {
        if (Platform.OS == "android") {
            if (this.isABC) {
                return (
                    <View style={{ flex: 1, height: 260, backgroundColor: '#DDDDDE', paddingBottom: baseStyle.isIPhoneX ? 34 : 0 }}>
                        {this._showKeyboardTabBar(true, '#ffffff', '#333333', '#DDDDDE', '#006acc')}
                        <View style={{ flex: 1, height: 220 }}>
                            <View style={{ flexDirection: 'row', marginLeft: 5, marginRight: 5, height: 50, marginTop: 5, paddingTop: 4, paddingBottom: 4 }}>
                                <NumberButton btnName="Q" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="W" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="E" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="R" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="T" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="Y" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="U" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="I" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="O" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="P" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />

                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 15, marginRight: 15, height: 50, paddingTop: 4, paddingBottom: 4 }}>
                                <NumberButton btnName="A" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="S" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="D" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="F" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="G" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="H" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="J" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="K" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="L" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                            </View>
                            <View style={[styles.buttonGroupRow, { marginLeft: 5, marginRight: 5, height: 50, marginTop: 5 }]}>
                                <View style={{ flex: 3, flexDirection: 'row', height: 50 }}>
                                    <SymbolButton btnName='daxiaoxie' bgColor={BG_COLOR} onPressHandler={this._onPress.bind(this)} />
                                </View>
                                <View style={{ flexDirection: 'row', flex: 14, height: 42, marginTop: 4 }}>
                                    <NumberButton btnName='Z' onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="X" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="C" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="V" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="B" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="N" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="M" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                </View>
                                <View style={{ flex: 3, flexDirection: 'row', height: 50 }}>
                                    <SymbolButton btnName='del' bgColor={BG_COLOR} onPressHandler={this._onPress.bind(this)} onLongPressHandler={this._onLongPress.bind(this)} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 5, marginRight: 5, height: 55, marginBottom: 5 }}>

                                <View style={{ flex: 1, height: 60 }}><NumberButton btnName="123" onPressHandler={this._onPress.bind(this)} bgColor={'#AFB4BE'} /></View>
                                <View style={{ flex: 2, height: 60 }}><NumberButton btnName="空格" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ flex: 1, height: 60 }}><NumberButton btnName="确定" onPressHandler={this._onPress.bind(this)} bgColor={'#AFB4BE'} /></View>
                            </View>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={{ flex: 1, height: 260, backgroundColor: '#DDDDDE', paddingBottom: baseStyle.isIPhoneX ? 34 : 0 }}>
                        {this._showKeyboardTabBar(false, '#DDDDDE', '#006acc', '#ffffff', '#333333')}
                        <View style={{ flex: 1, flexDirection: 'row', height: 220 }}>
                            <View style={{ flex: 1, height: 215, backgroundColor: '#FFFFFF', borderRadius: 4, borderColor: '#FFFFFF', borderWidth: 4, marginTop: 5, marginBottom: 5, marginLeft: 5 }}>
                                <NumberButton btnName="600" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="601" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="000" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="300" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="002" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                            </View>

                            <View style={{ flex: 4, height: 220, marginRight: 3, marginTop: 2.5, marginLeft: 3, marginBottom: 2.5 }}>
                                <View style={{ flexDirection: 'row', flex: 1, height: 50 }}>
                                    <NumberButton btnName="1" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="2" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="3" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1, height: 50 }}>
                                    <NumberButton btnName="4" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="5" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="6" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1, height: 50 }}>
                                    <NumberButton btnName="7" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="8" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="9" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1, height: 50 }}>
                                    <SymbolButton btnName='ABC' onPressHandler={this._onPress.bind(this)} />
                                    <NumberButton btnName="0" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <SymbolButton btnName='del' onPressHandler={this._onPress.bind(this)} onLongPressHandler={this._onLongPress.bind(this)} />
                                </View>
                            </View>
                        </View>
                    </View>
                );
            }
        } else {
            if (this.isABC) {
                return (
                    <View style={{ flex: 1, backgroundColor: '#DDDDDE', paddingBottom: baseStyle.isIPhoneX ? 34 : 0 }}>
                        {this._showKeyboardTabBar(true, '#ffffff', '#333333', '#DDDDDE', '#006acc')}
                        <View style={[styles.buttonGroup, { marginTop: 10 }]}>
                            <View style={[styles.buttonGroupRow, { marginLeft: 5, marginRight: 5 }]}>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="Q" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="W" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="E" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="R" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="T" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="Y" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="U" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="I" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="O" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="P" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                            </View>

                            <View style={[styles.buttonGroupRow, { marginLeft: 15, marginRight: 15 }]}>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="A" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="S" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="D" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="F" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="G" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="H" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="J" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="K" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="L" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                            </View>

                            <View style={[styles.buttonGroupRow, { marginLeft: 5, marginRight: 5 }]}>
                                <View style={{ flex: 3, flexDirection: 'row', height: 41 }}>
                                    <SymbolButton btnName='daxiaoxie' bgColor={BG_COLOR} onPressHandler={this._onPress.bind(this)} />
                                </View>
                                <View style={{ flex: 14, flexDirection: 'row', height: 41 }}>
                                    <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName='Z' onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                    <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="X" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                    <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="C" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                    <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="V" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                    <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="B" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                    <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="N" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                    <View style={{ height: 41, width: 30, flex: 1 }}><NumberButton btnName="M" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                </View>
                                <View style={{ flex: 3, flexDirection: 'row', height: 41 }}>
                                    <SymbolButton btnName='del' bgColor={BG_COLOR} onPressHandler={this._onPress.bind(this)} onLongPressHandler={this._onLongPress.bind(this)} />
                                </View>
                            </View>

                            <View style={[styles.buttonGroupRow, { marginLeft: 5, marginRight: 5 }]}>
                                <View style={{ flex: 1 }}><NumberButton btnName="123" onPressHandler={this._onPress.bind(this)} bgColor={'#AFB4BE'} /></View>
                                <View style={{ flex: 2 }}><NumberButton btnName="空格" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} /></View>
                                <View style={{ flex: 1 }}><NumberButton btnName="确定" onPressHandler={this._onPress.bind(this)} bgColor={'#AFB4BE'} /></View>
                            </View>

                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={{ flex: 1, backgroundColor: '#DDDDDE', paddingBottom: baseStyle.isIPhoneX ? 34 : 0 }}>
                        {this._showKeyboardTabBar(false, '#DDDDDE', '#006acc', '#ffffff', '#333333')}
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 4, borderColor: '#FFFFFF', borderWidth: 4, marginTop: 5, marginBottom: 5, marginLeft: 5 }}>
                                <NumberButton btnName="600" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="601" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="000" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="300" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                                <NumberButton btnName="002" onPressHandler={this._onPress.bind(this)} isLeft={true} bgColor={'#FFFFFF'} />
                            </View>

                            <View style={{ flex: 4, marginRight: 3, marginTop: 2.5, marginLeft: 3, marginBottom: 2.5 }}>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <NumberButton btnName="1" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="2" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="3" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <NumberButton btnName="4" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="5" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="6" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <NumberButton btnName="7" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="8" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <NumberButton btnName="9" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                </View>

                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <SymbolButton btnName='ABC' onPressHandler={this._onPress.bind(this)} />
                                    <NumberButton btnName="0" onPressHandler={this._onPress.bind(this)} bgColor={'#FFFFFF'} />
                                    <SymbolButton btnName='del' onPressHandler={this._onPress.bind(this)} onLongPressHandler={this._onLongPress.bind(this)} />
                                </View>
                            </View>
                        </View>
                    </View>
                );
            }
        }




    };
    //切换到数字键盘
    _switchIMEToNumber(isABC) {
        if (isABC) {
            this.isABC = false;
            this.setState({ curtype: '123' });
        } else {

        }

    }
    //切换到字母键盘
    _switchIMEToABC(isABC) {
        if (isABC) {

        } else {
            this.isABC = true;
            this.setState({ curtype: 'ABC' });
        }
    }
    //切换到原生键盘
    _switchIMEToChinese(isABC) {
        DeviceEventEmitter.emit('getFocus', false);
        // switchSystemKeyboard(this.props.tag)

    }
    //数字键盘的Tip
    _showKeyboardTabBar(isNumber, numBackGroundColor, numTextColor, abcBackGroundColor, abcTextColor) {
        return (
            <View style={{ height: 42, backgroundColor: '#ffffff', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f1f1', }}>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => this._switchIMEToNumber(isNumber)}>
                        <View style={{ height: 42, justifyContent: 'center', backgroundColor: numBackGroundColor }}>
                            <Text style={{ fontSize: 15, color: numTextColor, marginLeft: 20, marginRight: 20 }}>123</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this._switchIMEToABC(isNumber)}>
                        <View style={{ height: 42, justifyContent: 'center', backgroundColor: abcBackGroundColor }}>
                            <Text style={{ fontSize: 15, color: abcTextColor, marginLeft: 20, marginRight: 20 }}>首字母</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this._switchIMEToChinese(isNumber)}>
                        <View style={{ height: 42, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#333333', marginLeft: 20, marginRight: 20 }}>中文</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{}}>
                    <TouchableOpacity onPress={() => clearFocus(this.props.tag)}>
                        <Image source={require('../images/icons/sqjp.png')} style={{ marginRight: 15 }} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

}




register('CustomKeyboard', () => Keyboard);
Keyboard.propTypes = {
    // 点击键盘按键
    onKeyPress: PropTypes.func,
    // 点击删除按钮
    onDelete: PropTypes.func,
    // 长按删除按钮
    onClear: PropTypes.func,
    // 点击关闭按钮
    onClose: PropTypes.func,
};


Keyboard.defaultProps = {
    onKeyPress: () => { },
    onDelete: () => { },
    onClear: () => { },
    onClose: () => { },
};

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonGroup: {
        flex: 2.5,
        ...Platform.select({
            ios: {
                borderColor: '#3B3738',
                borderLeftWidth: 1,
                borderBottomWidth: 1,
            }
        })
    },
    buttonGroupRow: {
        flex: 1,
        flexDirection: 'row',
        height: 48
    },
});

export default Keyboard;









