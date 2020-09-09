/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description:
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    ImageBackground,
    StatusBar,
    InteractionManager, StyleSheet
} from 'react-native';



export default class HitsPage extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {

        }

    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {


    }

    render() {
        return (
            <View style={styles.container}>

            </View>
        )
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
