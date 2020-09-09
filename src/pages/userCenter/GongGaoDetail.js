/**
 * Created by cuiwenjuan on 2018/12/6.
 */
/**
 * Created by cuiwenjuan on 2018/5/28.
 */
import React, {Component} from 'react'
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    Image,
    ImageBackground,
} from 'react-native';


import PageHeader from '../../components/NavigationTitleView.js';
import * as baseStyle from '../../components/baseStyle.js';
import RATE, {LINE_HEIGHT, LINE_SPACE, DISTANCE} from '../../utils/fontRate'
import BaseComponent from '../BaseComponentPage'
import Yd_cloud from '../../wilddog/Yd_cloud'

let refPath = Yd_cloud().ref(MainPathYG+'XiaoXiZhongXin');
var ScreenWidth = Dimensions.get('window').width


class GongGaoDetail extends BaseComponent {

    constructor(props) {
        super(props)

        this.state = {
            data: null,
            // isDisplayAgreeBtns: true,
        };

        this.itemsRef = refPath.ref(props.navigation.state.params.wilddogPath +'G');
    }

    componentDidMount() {
        super.componentDidMount();
        this.listenForItems(this.itemsRef);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    onBack(){
        Navigation.pop(this.props.navigation)
    }

    listenForItems(itemsRef) {

        itemsRef.get((snap) => {
            //console.log('公告详情页 == ',snap)
            if(snap.nodeContent){
                this.setState({
                    data: snap.nodeContent,
                })
            }
        })

        // itemsRef.once('value', (snap) => {
        //     this.setState({
        //         data: snap.val(),
        //     })
        // })
    }

    render() {

        if(!this.state.data){
            return (
                <BaseComponent>
                    <PageHeader onBack={() => this.onBack()}
                                navigation={this.props.navigation} titleText={'公告详情'}/>
                </BaseComponent>
            );
        }

        let title = this.state.data.title
        let content = this.state.data.content
        let createtime = this.state.data.pubTime
        let picture = this.state.data.url


        return (
            <BaseComponent style={{flex: 1, flexDirection: 'column',backgroundColor:'#fff'}}>
                <PageHeader onBack={() => this.onBack()}
                            navigation={this.props.navigation} titleText={'公告详情'}/>

                <ScrollView ref='totop'
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            directionalLockEnabled={true}
                            bounces={false}
                            scrollsToTop={false}
                            scrollEventThrottle={2000}
                >
                    <View>
                        <View style={{padding:15}}>
                            <Text style={{fontSize:18, color:baseStyle.BLACK_333333,marginTop:5}}>{title}</Text>
                            <Text style={{fontSize:12,marginTop:14,marginBottom:7,color:baseStyle.BLACK_99}}>{createtime}</Text>
                        </View>

                        <View style={{width:ScreenWidth,height:8, backgroundColor:baseStyle.LINE_BG_F1}}/>

                        <View style={{padding:15}}>
                            {
                                picture ?<ImageBackground style={{height: DISTANCE(391), width: ScreenWidth - 30,marginBottom:DISTANCE(30)}}
                                                          source={require('../../images/icons/placeholder_bg_image.png')}>
                                    <Image style={{height: DISTANCE(391), width: ScreenWidth - 30}}
                                           source={{uri:picture}}/>

                                </ImageBackground>:null
                            }

                            <Text style={{fontSize:RATE(30), color:baseStyle.BLACK_333333,lineHeight:LINE_HEIGHT(30)}}>{content}</Text>
                        </View>
                    </View>

                </ScrollView>
            </BaseComponent>)
    }

}

export default GongGaoDetail;
