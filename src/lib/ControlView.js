import React,{Component} from 'react';
import
{
    Image,TouchableHighlight,Text,ScrollView,Modal,Dimensions
} from 'react-native';


const DEFAULT_WIDTH = Dimensions.get('window').width;
const DEFAULT_HEIGHT = Dimensions.get('window').height;
export default class ControlView extends Component
{
    constructor(props){
        super(props);

    }

    componentWillReceiveProps(nextProps, netxContext){
        this.props=nextProps;
    }
    render() {
        return (
            <Text style={{marginTop:DEFAULT_HEIGHT-50,height:30,alignItems:'center',color:'white',flex:1,textAlign:'center'}}>{this.props.index + 1}/{this.props.total}</Text>
        );

    }
};

