/**
 * Created by cuiwenjuan on 2017/11/8.
 */
import {Platform, NativeModules} from 'react-native';

var module = null;
if (Platform.OS == 'ios') {
    module = NativeModules.CallPhoneModuleIos;
} else if (Platform.OS == 'android') {
    module = NativeModules.CallPhoneModule;
} else if (Platform.OS == 'web') {
    //暂未实现web功能
}
export default module;