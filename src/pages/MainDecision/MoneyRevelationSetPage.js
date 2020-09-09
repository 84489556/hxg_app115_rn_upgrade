/**
 * Created by cuiwenjuan on 2019/8/21.
 */
import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    Platform,
    ScrollView,
} from 'react-native';
import BaseComponentPage from '../../pages/BaseComponentPage';
import PageHeader from '../../components/NavigationTitleView'
import * as  baseStyle from '../../components/baseStyle'
import {toast,commonUtil} from '../../utils/CommonUtils'
import Yd_cloud from '../../wilddog/Yd_cloud'

let refPath = Yd_cloud().ref(MainPathYG);

//strs=str.split(",");


// datas:[{'title':'电热供应',selected:false},
//     {'title':'电热供应',selected:false},],

//let teSeZhiBo = 'TeSeZhiBiaoResult';

class MoneyRevelationSetPage extends BaseComponentPage {

    constructor(props) {
        super(props);

        this.title = this.props.navigation.state.params &&
            this.props.navigation.state.params.title && this.props.navigation.state.params.title;
        this.setData = this.props.navigation.state.params &&
            this.props.navigation.state.params.setData && this.props.navigation.state.params.setData;

        this.state = {
           // datas:[],
            others:[],
            scopeData:'',
            canSelected:false,
        }

        //this.refTszb = refPath.ref(teSeZhiBo);
    }

    componentWillMount() {
        super.componentWillMount();

       // this._loadMainData();
        this._getQTTJArray(this.title);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    //{'title':'个股成功率>50%',selected:false},
    //{'title':'席位成功率>60',selected:false}
    _getQTTJArray(title){
        let longHuOther = [{'title':'短期高胜率席位最新买入',selected:false}, {'title':'中期高胜率席位20天内买入',selected:false}];

        let gaoGuanOther = [{'title':'高管连续增持',selected:false},{'title':'高管集中增持',selected:false}];

        let zhuLiOther = [{'title':'主力火速增持',selected:false},{'title':'主力主导增持',selected:false}];
        let defaultArray = longHuOther;

        switch (title){
            case '龙虎资金':
                defaultArray = longHuOther;
                break;
            case '高管资金':
                defaultArray = gaoGuanOther;
                break;
            case '主力资金':
                defaultArray = zhuLiOther;
                break;
            default:
                break;
        }

        let qttjArray = [];
        let canSelected = this.state.canSelected;
        defaultArray.map((info,index) => {
            info.selected = this.setData.indexOf(index+'') > -1 ? true : false;
            if(info.selected){
                canSelected = true;
            }
            qttjArray.push(info);
        })

        this.setState({
            others:qttjArray,
            canSelected:canSelected,
        })
    }

    onBack(selectedString){

        if(selectedString){
            let selectedS = selectedString ? selectedString : {};
            this.props.navigation.state.params &&
            this.props.navigation.state.params.callBack &&
            this.props.navigation.state.params.callBack(selectedS);
        }

        Navigation.pop(this.props.navigation);
    }


    // _selectClick(info){
    //     // console.log('设置页面 111按钮render',info.datas);
    //     this.setState({
    //         datas:info,
    //         canSelected:true,
    //     })
    //
    // }

    _selectClickOther(info){
        this.setState({
            others:info,
            canSelected:true,
        })
    }

    _getNoSelected(){
       // let newArray = [];
        let otherNewArray = [];
        let canSelected = this.state.canSelected;
        // this.state.datas.map((info,index) => {
        //     info.selected = false;
        //     newArray.push(info);
        // })

        this.state.others.map((info,index) => {
            info.selected = false;
            otherNewArray.push(info);
        });

        this.setState({
           // datas:newArray,
            others:otherNewArray,
            canSelected:canSelected,
        })
    }

    _getSelected(){

        let selectedObj = {};

        //let tszbString = undefined;
        // this.state.datas.map((info,index) => {
        //     if(info.selected){
        //         tszbString = tszbString ? tszbString+','+info.title :info.title;
        //     }
        // })

        let qttjSting = undefined;
        this.state.others.map((info,index) => {
            if(info.selected){
                qttjSting = qttjSting ? qttjSting+','+index :index +'';
            }
        })
       // selectedObj.tszb = tszbString ? tszbString :'' ;
        selectedObj.qttj = qttjSting ? qttjSting : '';

        return selectedObj;
    }


    _cleanSelected(){
        this._getNoSelected();
    }

    _startSelect(){
        this.onBack(this._getSelected())
    }

    // <View>
    //                         <Text style={{
    //                             marginTop:15,
    //                             marginLeft:15,
    //                             fontSize:15,
    //                             fontWeight:'bold',
    //                         }}>{'特色指标'}</Text>
    //                         <ConditionsSetPage
    //                             data = {this.state.datas}
    //                             onPress={(info) => this._selectClick(info)}
    //                         />
    //                     </View>
    render() {

        // console.log('设置页面 111按钮render');

        let buttonBG = baseStyle.BLACK_999999;
        if(this.state.canSelected){
            buttonBG = baseStyle.BLUE_HIGH_LIGHT;
        }


        return (
            <BaseComponentPage style={{flex:1}}>
                <PageHeader
                    onBack={() => this.onBack()}
                    navigation={this.props.navigation} titleText={this.title+'叠加条件'}/>

                <ScrollView bounces={false}>


                    <View>
                        <Text style={{
                            marginTop:15,
                            marginLeft:15,
                            fontSize:15,
                            color:"#333333",
                            fontWeight:'bold',
                        }}>{'其他条件'}
                        </Text>

                        <ConditionsSetPage
                            checkBox = {true}
                            data = {this.state.others}
                            onPress={(info) => this._selectClickOther(info)}
                        />
                    </View>
                </ScrollView>


                <View style={{flex:1}}/>
                {
                    <View style={{
                        justifyContent:'space-between',
                        height:44,
                        borderTopColor:baseStyle.LINE_BG_F6,
                        borderTopWidth:1,
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity
                            onPress={() => this._cleanSelected()}
                            style={{
                                flex:3,
                                paddingLeft:15,
                                alignItems:'center',
                                flexDirection:'row'
                            }}>
                            <Image source={require('../../images/hits/screen_delete.png')}/>
                            <Text style={{fontSize:15,color:baseStyle.BLACK_333333,marginLeft:5}}>{'清空已选'}</Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this._startSelect()}
                            style={{
                                flex:2,
                               // width:commonUtil.rare(280),
                                alignItems:'center',
                                justifyContent:'center',
                                backgroundColor:buttonBG
                            }}>
                            <Text style={{fontSize:15,color:baseStyle.WHITE}}>{'开始选股'}</Text>
                        </TouchableOpacity>
                    </View>
                }

            </BaseComponentPage>
        )
    }
}


var styles = StyleSheet.create({
    itemViewStyle:{
        paddingRight:16,
        paddingLeft:14,
        backgroundColor:"#fff",
        flexDirection:'row'
    },
});
export default  MoneyRevelationSetPage;


export class ConditionsSetPage extends Component{
    constructor(props){
        super(props)
    }


    _buttonView(info,index){

        if(info.title  === '一箭三雕'){
            return null;
        }

        let buttonBGC = '#fff';
        let lineColor = baseStyle.BLACK_99;
        let textColor = baseStyle.BLACK_666666;

        if(info.selected){
            buttonBGC = '#FBECE8';
            lineColor = baseStyle.BLUE_HIGH_LIGHT;
            textColor = '#EB3E45';
        }
        let itemWidth = 0;
        if(info.title.length > 4 ){
            itemWidth = (baseStyle.width-24)/2 - 7
        }else {
            itemWidth = (baseStyle.width-24)/4 - 7 //减6就行，多减一个以免出现问题
        }
        //现在不设置宽度，不然字体太多不能显示全
        return (
            <View  key ={index} style={{marginTop:8,marginBottom:8,marginLeft:3,marginRight:3}}>
                <TouchableOpacity
                    onPress = {() => this._clickPress(info,index)}
                    style={{borderRadius:2,borderWidth:1,borderColor:lineColor,justifyContent:'center',
                        alignItems: 'center',height:30,
                        backgroundColor:buttonBGC, paddingRight:15,paddingLeft:15}}>
                    <Text style={{fontSize:14,color:textColor}}>{info.title}</Text>
                </TouchableOpacity>
            </View>
        )

    }

    _clickPress(info,index){
        let message = info;
        message.selected = !info.selected;
        this.props.onPress(
            this.props.checkBox ? this._getNewDatas(message,index)
                :this._getOneSelected(message,index)
        );
    }

    _getOneSelected(message,messageIndex){
        let newArray = [];

        this.props.data.map((info,index) => {
            if(messageIndex === index){
                newArray.push(message);
            }else {
                if(info.selected) info.selected = false;
                newArray.push(info);
            }
        })
        return newArray;
    }

    _getNewDatas(message,messageIndex){
        let newArray = [];

        this.props.data.map((info,index) => {
            if(messageIndex === index){
                newArray.push(message);
            }else {
                if(info.selected) canSelected = true;
                newArray.push(info);
            }
        })
        return newArray;
    }

    render(){
        //console.log('设置页面 按钮render');

        return(
            <View style={{padding:12,flexDirection:"row",flexWrap: 'wrap',}}>
                {this.props.data.map((info,index) => this._buttonView(info,index))}
            </View>
        )
    }
}
