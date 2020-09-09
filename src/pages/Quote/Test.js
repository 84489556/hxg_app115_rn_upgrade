'use strict'

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import ScrollableTabView from "react-native-scrollable-tab-view";
import YDSegmentedTab from '../../components/YDSegmentedTab';
import YDNormalTab from '../../components/YDNormalTab';
import RiskWarning from '../../components/RiskWarning';

export default class StockFormatText extends Component {
    render() {
        return (
            <View style={{ backgroundColor: 'gray' }}>
                <ScrollableTabView
                    style={{ marginTop: 24, backgroundColor: 'white' }}
                    initialPage={1}
                    renderTabBar={() =>
                        <YDSegmentedTab
                            style={{ backgroundColor: 'green', textAlign: 'center', alignItems: 'center', justifyContent: 'center', }}
                            // tabStyle={{ width: 68, height: 28 }}
                            tabNames={['自选', '沪深', '资讯']}
                        // tabNames={['专家分析', '资讯        ']}
                        // tabNames={['特色指标选股', '价值策略', '研报策略']}
                        />
                    }
                >
                    <View style={{ backgroundColor: 'red' }} tabLabel='自选'>
                        <Text>自选</Text>
                    </View>
                    <View style={{ backgroundColor: 'green' }} tabLabel='沪深'>
                        <Text>沪深</Text>
                    </View>
                    <View style={{ backgroundColor: 'blue' }} tabLabel='资讯'>
                        <Text>资讯</Text>
                    </View>
                </ScrollableTabView>

                <ScrollableTabView
                    style={{ marginTop: 124, backgroundColor: 'white' }}
                    initialPage={1}
                    renderTabBar={() =>
                        <YDSegmentedTab
                            // tabStyle={{ height: 20, selectedBgColor: '#fff', selectedTextColor: '#000000cc', unSelectedBgColor:  }}
                            tabNames={['自选', '沪深', '资讯']}
                            borderStyle={'RoundedRect'}
                        // tabNames={['专家分析', '资讯        ']}
                        // tabNames={['特色指标选股', '价值策略', '研报策略']}
                        />
                    }
                >
                    <View style={{ backgroundColor: 'red' }} tabLabel='自选'>
                        <Text>自选</Text>
                    </View>
                    <View style={{ backgroundColor: 'green' }} tabLabel='沪深'>
                        <Text>沪深</Text>
                    </View>
                    <View style={{ backgroundColor: 'blue' }} tabLabel='资讯'>
                        <Text>资讯</Text>
                    </View>
                </ScrollableTabView>


                <ScrollableTabView
                    style={{ marginTop: 164, backgroundColor: 'white' }}
                    initialPage={1}
                    renderTabBar={() =>
                        <YDNormalTab
                            // tabStyle={{ height: 20, selectedBgColor: '#fff', selectedTextColor: '#000000cc', unSelectedBgColor:  }}
                            // tabNames={['财经报道', '自选', '快讯', '公司新闻', '公司研究', '行业研究']}
                            // tabNames={['专家分析', '资讯']}
                            tabNames={['特色指标选股', '价值策略', '研报策略']}
                        />
                    }
                >
                    <View style={{ backgroundColor: 'red' }} tabLabel='自选'>
                        <Text>自选</Text>
                    </View>
                    <View style={{ backgroundColor: 'green' }} tabLabel='沪深'>
                        <Text>沪深</Text>
                    </View>
                    <View style={{ backgroundColor: 'blue' }} tabLabel='资讯'>
                        <Text>资讯</Text>
                    </View>
                    {/* <View style={{ backgroundColor: 'red' }} tabLabel='自选'>
                        <Text>自选</Text>
                    </View>
                    <View style={{ backgroundColor: 'green' }} tabLabel='沪深'>
                        <Text>沪深</Text>
                    </View>
                    <View style={{ backgroundColor: 'blue' }} tabLabel='资讯'>
                        <Text>资讯</Text>
                    </View> */}
                </ScrollableTabView>

                <ScrollableTabView
                    style={{ marginTop: 264, backgroundColor: 'white' }}
                    initialPage={1}
                    renderTabBar={() =>
                        <YDNormalTab
                            // tabStyle={{ height: 20, selectedBgColor: '#fff', selectedTextColor: '#000000cc', unSelectedBgColor:  }}
                            tabNames={['财经报道', '自选', '快讯', '公司新闻', '公司研究', '行业研究']}
                            // tabNames={['专家分析', '资讯']}
                            // tabNames={['特色指标选股', '价值策略', '研报策略']}
                            borderStyle={'RoundedRect'}
                        />
                    }
                >
                    <View style={{ backgroundColor: 'red' }} tabLabel='自选'>
                        <Text>自选</Text>
                    </View>
                    <View style={{ backgroundColor: 'green' }} tabLabel='沪深'>
                        <Text>沪深</Text>
                    </View>
                    <View style={{ backgroundColor: 'blue' }} tabLabel='资讯'>
                        <Text>资讯</Text>
                    </View>
                    <View style={{ backgroundColor: 'red' }} tabLabel='自选'>
                        <Text>自选</Text>
                    </View>
                    <View style={{ backgroundColor: 'green' }} tabLabel='沪深'>
                        <Text>沪深</Text>
                    </View>
                    <View style={{ backgroundColor: 'blue' }} tabLabel='资讯'>
                        <Text>资讯</Text>
                    </View>
                </ScrollableTabView>

                <RiskWarning style={{ marginTop: 350 }}>

                </RiskWarning>
            </View>
        );
    }
}
