/**
 *
 *解盘/直播间/战绩统计
 *
 * */
import React, { Component } from "react";
import { FlatList, ImageBackground, Text, View } from "react-native";
import AutoImage from '../../../../lib/autoImage1';

//获取屏幕的宽和高
var Dimensions = require('Dimensions');
var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;
export default class ZhanJiTongJi extends Component {
    constructor(props) {
        super(props)
        this.imageData = [];
        this.state = {
            listData: [],
            images: []
        }
        this._renderItem = this._renderItem.bind(this)

        let url = ZBJDomainName + "/api/scoreinfo?rid=" + ZBJ_rid
        fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((responseJson) => {
                this.setState({ listData: responseJson.data })
            })
            .catch((error) => {
                //console.log('请求网络数据错误', error);
            });

    }

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }
    render() {
        // if(this.imageData.length != this.state.listData.length){
        //     return(
        //         <View style = {{alignItems:'center'}}>
        //             <Text>正在加载...</Text>
        //         </View>
        //     );
        // }else{
        return (
            <View style={{ flex: 1 }}>
                <Text style={{ marginTop: 10, marginLeft: 15, color: '#F92400', fontSize: 15 }}>
                    最新战绩
                </Text>
                <FlatList
                    style={{ flex: 1, marginTop: 10, marginBottom: 10, marginLeft: 15, marginRight: 15 }}
                    ref={(flatList) => this._flatList = flatList}
                    renderItem={this._renderItem}
                    refreshing={false}
                    showsVerticalScrollIndicator={false}
                    // getItemLayout={(data, index) =>
                    //     ({length: 60, offset: Platform.OS == 'android'?100:60*index, index})
                    // }
                    data={this.state.listData}>
                </FlatList>
            </View>

        );
        // }
    }

    _renderItem(item) {
        let data = item.item;
        this.imageData[item.index] = { 'uri': data.imager }
        return (
            <View style={{ alignItems: 'center', backgroundColor: '#CEDFEA', paddingTop: 5, paddingLeft: 5, paddingRight: 5, paddingBottom: this.state.listData.length - 1 == item.index ? 5 : 0 }}>
                <ImageBackground key={item.index} style={{ width: width - 40, height: (width - 40) * 0.625 }}
                    source={require('../../../../images/icons/placeholder_bg_image.png')}
                >
                    <AutoImage source={{ uri: data.imager }}
                        imgStyle={{ flex: 1 }}
                        style={{ flex: 1 }}
                        imgWidth={width - 40}
                        imgHeight={(width - 40) * 0.625}
                        imgCapture={false}
                        startCapture={true}
                        moveCapture={true}
                        images={this.imageData}
                        index={item.index} />
                </ImageBackground>
            </View>
        );
    }
}