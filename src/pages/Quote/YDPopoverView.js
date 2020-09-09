/**
 * 长按自选股弹出的菜单
 */
import React, { PureComponent } from 'react';
import {
    StyleSheet,
    Text,
    Dimensions,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import {commonUtil} from '../../utils/CommonUtils'

var {height, width} = Dimensions.get('window');

class YDPopoverView extends PureComponent {

    static defaultProps = {
        popUpShow:true,
        popMarginTop:0,

    };
    constructor(props) {
        super(props);
        this.state = {
            popUpShow:this.props.popUpShow,
            popMarginTop:this.props.popMarginTop,
            isShow:false,
        };
    }

    componentDidMount() {
    }

    _deleteStock(){
        this.hiddenAlert();
        this.props.deleteStock && this.props.deleteStock();
    }

    _topStock(){
        this.hiddenAlert();
        this.props.topStock && this.props.topStock();
    }

    render() {
        if (!this.state.isShow){
            return null;
        }

        let popTop = 38;

        let marginTop = this.state.popMarginTop < popTop ? this.state.popMarginTop + 44 :this.state.popMarginTop;
        return (
            <View style={[Styles.viewStyle,{top:marginTop,}]}>
                {
                    this.state.popMarginTop < popTop ?<Image source={require('../../images/personStock/personS_pop_up.png')}/>:null
                }
                <View style={Styles.alertView}>
                    <TouchableOpacity style={{flexDirection:'row',alignItems:'center',justifyContent:'center',
                        flex:1,
                    }}
                                      activeOpacity={0.9}
                                      onPress={() => this._deleteStock()}>

                        <Text style={{color:'#fff',textAlign:'center', backgroundColor:'rgba(255,255,255,0)'}}>删除</Text>
                    </TouchableOpacity>
                    <View style={{width:1,marginRight:0,height:15, backgroundColor:'#fff'}}/>
                    <TouchableOpacity style={{flexDirection:'row',alignItems:'center',justifyContent:'center',flex:1}}
                                      activeOpacity={0.9}
                                      onPress={() => this._topStock()}>
                        <Text style={{color:'#fff', backgroundColor:'rgba(255,255,255,0)'}}>置顶</Text>

                    </TouchableOpacity>
                </View>
                {
                    this.state.popMarginTop > popTop ? <Image source={require('../../images/personStock/personS_pop_down.png')}/> :null
                }
            </View>
        );
    };

    hiddenAlert() {
        this.setState({isShow:false});
    };
    showAlert(top) {
        this.setState({isShow:true,popMarginTop:top});
    };

}
const Styles = StyleSheet.create({

    viewStyle: {
        position:'absolute',
        bottom:0,
        left:0,
        right:0,
        height:10,
        alignItems:'center',
        justifyContent:'center'
    },
    alertView:{
        height:commonUtil.rare(60),
        width:commonUtil.rare(270),
        flexDirection:'row',
        backgroundColor:'rgba(0,0,0,0.7)',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:5,
    },

});

export default YDPopoverView;