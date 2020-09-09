/**
 * Created by cuiwenjuan on 2017/8/24.
 */
import * as typeAction from '../actions/actionTypes'

const initialState = {
    allIM : [],
    kfInfo:{},
    todayTimestamp:null,
    isToday:false,

};


let UserIMReducer = (state = initialState,action) => {
    switch (action.type){

        //消息
        case typeAction.USER_CENTER_IM_MESSAGE:

            let allIMArray = Array.from(action.snapshot);

            if(!state.isToday || allIMArray.length === 0){
                let lengthArray = state.allIM.length;
                let actionArryLength = allIMArray.length;
                let length =  actionArryLength - lengthArray


                for(let i = state.allIM.length -1 ; i >= 0; i --) {
                    let messagI = state.allIM[i]
                    if(messagI.data.phone){
                        allIMArray.splice(i +length + 1,0,messagI);
                        break;
                    }
                }
            }

            return Object.assign({}, state, {
                allIM:allIMArray,
            });

            //客服
        case typeAction.USER_CENTER_CUSTOMER:

            let todayTt = state.todayTimestamp;
            let today = state.isToday;
            let imMessage = Array.from(state.allIM);

            //进入app的时间戳
            if(action.todayTimestamp){
                todayTt = action.todayTimestamp;
            }
            //判断是否是今天
            today = action.isToday;

            if(action.snapshot){
                let code = action.snapshot;

                //today 为underfind 和false 添加数据，
                if(!today){
                    let index = -1;
                    imMessage.map((item, i) => {

                        //通过local_time 判断是否是同一个数据
                        if(item.data.local_time && (item.data.local_time === code.data.local_time)){
                            imMessage.splice(i,1,code);
                            index = 1;
                        }

                        //判断是否是提示语
                        if(item.data.phone && (item.data.phone === code.data.phone)){
                            index = 1;
                        }
                    });
                    if(index == -1){
                        imMessage.push(code);
                    }

                }else if(imMessage.length <=0){//如果没有聊天记录，今天不是第一次浏览 显示默认数据
                    imMessage.push(code);
                }
            }

            return Object.assign({}, state, {
                allIM:imMessage,
                todayTimestamp:todayTt,
                isToday:today
            });


        //客服信息
        case typeAction.USER_CENTER_IM_KFINFO:

            return Object.assign({}, state, {
                kfInfo:action.snapshot,
            });

        //退出客服界面
        case typeAction.USER_CENTER_IM_LOGOUT:

            return Object.assign({}, state, {
                allIM:[],
            });

            //退出应用
        case typeAction.USER_LOGOUT:

            return Object.assign({}, state, {
                allIM:[],
                kfInfo:{},
                todayTimestamp:null,
                // isToday:false,
            });
        default:
            return state;
    }
};

export default UserIMReducer;