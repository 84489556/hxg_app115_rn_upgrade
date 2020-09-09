/**
 * Created by cuiwenjuan on 2018/3/6.
 */
import {Platform, NativeModules} from 'react-native';

var module = null;
if (Platform.OS == 'ios') {
    module = NativeModules.sharemodule;
} else if (Platform.OS == 'android') {
    module = NativeModules.sharemodule;
} else if (Platform.OS == 'web') {
    //暂未实现web功能
}
export default module;