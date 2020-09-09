'use strict';
import React, { Component } from 'react';
import {
    FlatList,
    View,
    Text,
    Image,
    TouchableOpacity,
    Platform,
} from 'react-native';
import ShareSetting from '../modules/ShareSetting.js';
import * as baseStyle from '../components/baseStyle.js';
import {sensorsDataClickActionName, sensorsDataClickObject} from "./SensorsDataTool";

export default class KChartSider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curDivison: ShareSetting.getCurrentEmpowerName(),
            curMainFormula: ShareSetting.getCurrentMainFormulaName(),
            curViceFormula: ShareSetting.getCurrentAssistFormulaName(),
            chartHeaderData: []
        };
        this.normal_style = { color: baseStyle.SMALL_NAME_COLOR ,fontSize: 12};
        this.sel_style = { color: '#F92400', fontSize:12 };
    }

    renderItem(item, isSelect, onSelect) {
        if (item === '常用指标') {
            return (
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#006ACC',
                        height: 20
                    }}
                >
                    <Text style={{ fontSize: 12, color: 'white' }}>{item}</Text>
                </View>
            );
        } else if (item === '特色指标') {
            return (
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#FF690F',
                        height: 20
                    }}
                >
                    <Text style={{ fontSize: 12, color: 'white' }}>{item}</Text>
                </View>
            );
        } else {
            return (
                <View
                    style={{
                        paddingTop:item == 'VOL'||item == '蓝粉彩带' || item == '除权' ?15:0,
                        paddingBottom:15,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TouchableOpacity style={{flex:1}}
                                      onPress={() => onSelect(item)}
                                      hitSlop={{top: 5, left: 20, bottom: 5, right: 20}}
                    >
                        <Text
                            style={
                                [isSelect(item) ? this.sel_style : this.normal_style]
                            }
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    renderSplit() {
        return (
            <View style={{ flex: 0}}>
                {['除权', '前复权', '后复权'].map(item => {
                    return this.renderItem(
                        item,
                        data => {
                            return data === this.state.curDivison;
                        },
                        data => {
                            this.setState({ curDivison: data });
                            this.props.onSplitChange &&
                                this.props.onSplitChange(data);
                        }
                    );
                })}
            </View>
        );
    }

    selectFormula(data) {
        this.setState({ curViceFormula: data });
    }

    renderFormula() {

        ShareSetting.getMainFormulas();
        let formulaList=[];
        formulaList.push('特色指标');
        ShareSetting.getHorSpecialFormulas().map(function(name){
            formulaList.push(name)
        });
        formulaList.push('常用指标');
        ShareSetting.getHorAssistFormulas().map(function(name){
            formulaList.push(name)
        });


        return (
            <FlatList
                data={formulaList}
                showsHorizontalScrollIndicator= {false}
                renderItem={({ item }) =>
                    this.renderItem(
                        item,
                        data => {
                            return (
                                data === this.state.curMainFormula ||
                                data === this.state.curViceFormula ||
                                data === this.state.curDivison
                            );
                        },
                        data => {
                          this.sensorsAddIndex(data);
                            if (ShareSetting.isMainFormula(data)) {
                                this.setState({ curMainFormula: data });
                                this.props.onFormulaChange &&
                                    this.props.onFormulaChange(data);
                            } else if (ShareSetting.isEmpower(data)) {
                                this.setState({ curDivison: data });
                                this.props.onSplitChange &&
                                    this.props.onSplitChange(data);
                            } else {
                                this.setState({ curViceFormula: data });
                                this.props.onFormulaChange &&
                                    this.props.onFormulaChange(data);
                            }
                        }
                    )
                }
            />
        );
    }

  sensorsAddIndex( name) {

    if (name === '蓝粉彩带' || name === 'MA' || name === 'BOLL' || name === '抄底策略' || name === '多空预警' || name === '中期彩带') {
      sensorsDataClickObject.addIndex.index_type = '主图指标';
    } else {
      sensorsDataClickObject.addIndex.index_type = '副图指标';
    }

    sensorsDataClickObject.addIndex.index_name = name;
    sensorsDataClickObject.addIndex.entrance = '全屏页指标选择';
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addIndex);

  }

    render() {
        return (
            <View
                style={{
                    width: 78,
                    backgroundColor: '#fff',
                    marginRight: 15,
                    borderWidth: 1,
                    borderColor: baseStyle.LIGHTEN_GRAY,
                    borderLeft:1,borderRight:1,borderBottomWidth:1,borderTopWidth:Platform.OS == 'ios'?1:0
                }}
                onLayout={event => {
                    this.props.setSiderWidth(event.nativeEvent.layout.width);
                }}
            >
                {this.renderFormula()}

                <View style={{width: 78,height:30,}}>
                    <TouchableOpacity
                        style={{
                            flex:1,
                            justifyContent:'center',
                            alignItems:'center',
                            borderTopWidth:1,
                            borderTopColor:baseStyle.LINE_BG_F1
                        }}
                        hitSlop={{top: 0, left: 20, bottom: 0, right: 20}}
                        onPress={() =>{
                            {/*alert('设置页面')*/}
                            Navigation.pushForParams(this.props.navigation, 'KLineSetPage', { curGraphIndex: this.props.curGraphIndex })

                            // Navigation.pushForParams(this.props.navigation, 'KLineSetPageLanch',{curGraphIndex:this.props.curGraphIndex})
                        }}>
                        <Image source={require('../images/icons/hq_kSet_set.png')}/>

                    </TouchableOpacity>

                </View>
            </View>
        );
    }
}
