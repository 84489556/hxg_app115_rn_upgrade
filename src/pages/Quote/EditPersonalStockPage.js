import React,{Component} from 'react';
import {View, Text, Image, TouchableOpacity, TouchableWithoutFeedback,Platform,BackHandler} from 'react-native';

import StockListEdit from './StockListEdit.js';
import * as baseStyle from '../../components/baseStyle.js';
import PageHeader from '../../components/PageHeader.js';
import ShareSetting from '../../modules/ShareSetting.js'
import {pop} from '../../modules/NavigationInterface'
import UserInfoUtil from '../../utils/UserInfoUtil'
import  YDActivityIndicator from  '../../components/YDActivityIndicator'
import {toast} from '../../utils/CommonUtils'
import SafeAreaView from '../../components/SafeAreaView';

let deletCodeString = undefined;
export class EditPersonalStockPage extends Component {

  constructor(props) {
    super(props)

    const { params } = this.props.navigation.state;
    this.param = params
      deletCodeString = undefined;

    this.isOperation = false;
    this.state = {
      _watchingStocks: [],
      _selectall: false,
        animating:false,
        isShowDialog:false,
    }
  }

  componentWillMount() {
    this.initSelectedArray()
      if (Platform.OS === 'android') {
          //拦截手机自带返回键
          BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
      }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
  }

  onBackAndroid = () => {
      this.onCancel();
      return true;
  };

  initSelectedArray() {
    this.isSelectedArray = []
    this.waitDeleteStockCode = []
    for(let i=0; i<this.param.data.length; i++) {
      let item = this.param.data[i]
      this.isSelectedArray.push({key:item.Obj, ZhongWenJianCheng:item.ZhongWenJianCheng, isSelected: false})
    }

    this.setState({_watchingStocks: this.isSelectedArray})
  }

  isAllEqual(array){
    if(array.length>0){
       return !array.some(function(value,index){
         return value.isSelected !== array[0].isSelected;
       });   
    }else{
        return true;
    }
  }

  selected(key) {
    for(let i=0; i<this.isSelectedArray.length; i++) {
      let item = this.isSelectedArray[i]
      if(item.key === key) {
        let b = !item.isSelected
        this.isSelectedArray[i] = {key:item.key, ZhongWenJianCheng:item.ZhongWenJianCheng, isSelected: b}
      }
    }
    
    let allEqual = this.isAllEqual(this.isSelectedArray)
    if (allEqual && this.isSelectedArray.length>0 && this.isSelectedArray[0].isSelected) this.setState({_selectall: true, _watchingStocks: this.isSelectedArray})
    else this.setState({_selectall: false, _watchingStocks: this.isSelectedArray})
  }

  onSelectAll() {
    for(let i=0; i<this.isSelectedArray.length; i++) {
        let item = this.isSelectedArray[i]
        this.isSelectedArray[i] = {key:item.key, ZhongWenJianCheng:item.ZhongWenJianCheng, isSelected: !this.state._selectall}
    }
    this.setState({_selectall:!this.state._selectall})
  }

  //拖动操作
  onChangeRow(to, from) {

    this.isOperation = true;
    let tmp = this.state._watchingStocks.slice(0)
    tmp.splice(to, 0, tmp.splice(from, 1)[0]);
    this.setState({_watchingStocks: tmp})
    this.isSelectedArray = tmp

  }

  //置顶操作
  onStick(key) {
    this.isOperation = true;
    let foundStock = null
    let tmp = this.state._watchingStocks.slice(0)

    for(let i=0; i<tmp.length; i++) {
      if(tmp[i].key == key) {
        foundStock = tmp[i]
        tmp.splice(i, 1);
        break;
      }
    }

    tmp.unshift(foundStock)
    this.setState({_watchingStocks: tmp})
    this.isSelectedArray = tmp

  }

  backHandler(toastString) {
    toastString ? this.param.toastFunc && this.param.toastFunc('保存成功') : null
    this.param.timerCallback && this.param.timerCallback()
    pop(this.props.navigation)
  }

  onComplete(endLoad) {

    //直接设置，为了防止安卓物理返回按钮冲突
    this.isOperation = false
    let personalData = []
    let codeString = ''
    for(let i=0; i<this.state._watchingStocks.length; i++) {
        let code = this.state._watchingStocks[i].key
        this.param.data.find((element) => {
            if (element.Obj == code) {
                personalData.push(element)
                codeString = codeString ? codeString +','+code :code
                // codeString = codeString ? code +','+codeString :code
            }
        })
    }

      UserInfoUtil.sortPersonStock(codeString,
          () =>{
              this.setState({animating:false})
              const {setPersonalStocks} = this.props.actions
              setPersonalStocks(personalData)
              this.waitDeleteStockCode.forEach((item) => {
                  this._removePersonalStock(item)
              })

              endLoad ? endLoad('保存成功'): toast('保存成功');
          }
          ,
          () => {
              this.isOperation = true;
              this.setState({animating:false})
              endLoad ? endLoad('保存失败'): toast('保存失败');
          })
  }

  onCancel() {
      if(this.isOperation ){
          this.setState({isShowDialog: true})
      }else {
          this.backHandler();
      }
  }

  onDeleteAll() {

    this.waitDeleteStockCode = []
    for(let i=0; i<this.state._watchingStocks.length; i++) {
      this.waitDeleteStockCode.push(this.state._watchingStocks[i].Obj)
    }

    this.setState({_watchingStocks: []})
    this.isSelectedArray = []
  }

  onDelete() {
    this.isOperation = true;
    let tmp = this.state._watchingStocks.slice(0)
    
    for(let delItem=0; delItem<this.isSelectedArray.length; delItem++) {
      let d = this.isSelectedArray[delItem]
      if (d.isSelected) {
        for(let i=0; i<tmp.length; i++) {
          if(tmp[i].key === d.key) {
            this.waitDeleteStockCode.push(tmp[i].key)
            tmp.splice(i, 1);
            break;
          }
        }
      }
    }

    this.setState({_watchingStocks: tmp})
    this.isSelectedArray = tmp
  }

  _removePersonalStock(code) {
    const {removePersonalStock} = this.props.actions
    removePersonalStock({Obj: code})
  }

  renderStockList(data) {

    return data && data.length > 0 && (
        <View style={{flex: 1}}>
          <View style={{height: 30, backgroundColor: baseStyle.WHITE, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
            <View style={{flex: 0.5}}><Text style={{color: baseStyle.GRAY,textAlign: 'center'}}></Text></View>
            <View style={{flex: 1,flexDirection: 'row',alignItems:'center'}}><Text style={{color: baseStyle.GRAY,textAlign: 'center'}}>全部自选</Text></View>
            <View style={{flex: 1}}><Text style={{color: baseStyle.GRAY,textAlign: 'center'}}>置顶</Text></View>
            <View style={{flex: 1}}><Text style={{color: baseStyle.GRAY,textAlign: 'center'}}>拖动</Text></View>         
          </View>
          
          <StockListEdit style={{flex: 1}} 
            onStick={this.onStick.bind(this)} 
            onChangeRow={this.onChangeRow.bind(this)} 
            selected={this.selected.bind(this)}
            data={data} />
        </View>
      );
  }

  renderImage() {
    var source = this.state._selectall ? require('../../images/icons/CheckedBox.png') : require('../../images/icons/CheckBox.png');
    return (
        <Image source={source}/>
    )
  }

  render() {
      
    let hasSelected = true
    if (this.isSelectedArray.length > 0) {
        if (this.isAllEqual(this.isSelectedArray) && !this.isSelectedArray[0].isSelected) hasSelected = false
    }
    else {
        hasSelected = false
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: baseStyle.BLUE_HIGH_LIGHT
        }}>
       <View style={{
           // backgroundColor: baseStyle.TITLE_BACKGROUND_COLOR,
           backgroundColor: '#fff',
           paddingBottom: baseStyle.isIPhoneX ? 34 : 0,
           flex: 1}}>
         <PageHeader 
            onBack={this.onCancel.bind(this)} 
            title="编辑自选"
            rightComponent={
                <View style={{flex: 1, alignItems: 'flex-end', marginTop:12, marginRight: 0}}>
                    <TouchableOpacity onPress={() => {this.onComplete()}}>
                        <Text style={{width: 30, height: 30, color:'#999999'}}>保存</Text>
                    </TouchableOpacity>
                </View>
            }
         />

         {
             (this.state._watchingStocks && this.state._watchingStocks.length > 0) ? (
               <View style={{flex:1, backgroundColor: baseStyle.WHITE}}>
                 {this.renderStockList(this.state._watchingStocks)}
               </View>
             )
             : 
             (
               <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor: baseStyle.NO_CONTENT_BACKGROUND_COLOR}}>
                 <Text style={{fontSize:14, color:baseStyle.SMALL_NAME_COLOR, textAlign:'center', }}>暂无股票</Text>
               </View>
             )
         }

         <View style={{flexDirection:'row', height:44, backgroundColor:baseStyle.WHITE}}>
            <View style={{flexDirection:'row', flex:2}}>

                <View style={{justifyContent: 'center', paddingLeft:15, paddingRight:15}}>
                    <TouchableWithoutFeedback onPress={this.onSelectAll.bind(this)}>
                        {this.renderImage()}
                    </TouchableWithoutFeedback>
                </View>

                <View style={{justifyContent: 'center'}}>
                    <Text style={{color:'#333333'}} onPress={this.onSelectAll.bind(this)}>全选</Text>
                </View>

            </View>
            

            {
                hasSelected ? (
                    <TouchableOpacity onPress={this.onDelete.bind(this)} activeOpacity={0.8}>
                        <View style={{height:44, width:140, alignItems:'center', justifyContent:'center', backgroundColor:'#F92400'}}>     
                            <Text style={{color:baseStyle.WHITE}}>删除</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableWithoutFeedback>
                        <View style={{height:44, width:140, alignItems:'center', justifyContent:'center', backgroundColor:'#AAAAAA'}}>     
                            <Text style={{color:baseStyle.WHITE}}>删除</Text>
                        </View>
                    </TouchableWithoutFeedback>
                )
            }

         </View>
         <YDActivityIndicator animating={this.state.animating}/>
           {this._custom_Dialog()}

      </View>
        </SafeAreaView>
    );
  }


    _custom_Dialog(){
        if(this.state.isShowDialog)
            return(
                <View style = {{flex:1,
                    height:baseStyle.height,
                    width:baseStyle.width,
                    backgroundColor:'rgba(0,0,0,0.6)',
                    position: 'absolute',
                    left:0,
                    bottom: 0,
                    right:0,
                    top:0,
                    justifyContent:'center',
                    alignItems:'center'
                }}>
                    <View style = {{height:129,
                        width:300,
                        backgroundColor:'#FFFFFF',
                        borderRadius:5,
                        alignItems:'center'
                    }}>
                        <Text style = {{fontSize:15,color: baseStyle.BLACK_666666,marginTop:15}}>您有操作未进行保存</Text>
                        <Text style = {{fontSize:18,color:'#262628',marginTop:10}}>{'是否保存？'}</Text>
                        <View style = {{flexDirection:'row',
                            width:300,
                            height:44,
                            borderTopWidth:1,
                            borderTopColor:'#F1F1F1',
                            marginTop:Platform.OS == 'ios'?21:15
                        }}>
                            <TouchableOpacity onPress= {() => {
                                this.setState({isShowDialog:false},() => {
                                    this.backHandler();
                                })
                            }}

                            >
                                <View style = {{width:150,
                                    height:44,
                                    justifyContent:'center',
                                    alignItems:'center',
                                    borderRightWidth:1,
                                    borderRightColor:'#F1F1F1'
                                }}>
                                    <Text style = {{fontSize:17,
                                        color:'#006ACC'}}>
                                        不保存
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress= {() => {
                                this.setState({isShowDialog:false},()=>{
                                    this.onComplete((toastSting)=> {
                                        this.backHandler(toastSting);
                                    });
                                })
                            }}>
                                <View style = {{width:150,height:44,justifyContent:'center',alignItems:'center'}}>
                                    <Text style = {{fontSize:17,
                                        color:'#FF0000'}}>
                                        保存
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
    }

}



import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as AllActions from '../../actions/AllActions'

export default connect((state) => ({
  }),
  (dispatch) => ({
    actions: bindActionCreators(AllActions, dispatch)
  })
)(EditPersonalStockPage)