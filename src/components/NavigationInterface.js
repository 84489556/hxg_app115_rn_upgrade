/*
 * @Author: yangyin
 * @Date: 2020-07-03 15:15:15
 * @Description: 
 */ 
/**
 * Navigation接口类
 */

'use strict';

import { NavigationActions } from 'react-navigation'



export function push(navi, name) {
    if (!navi) return
    pushForParams(navi, name, null)
}
export function pushForParams(navi, name, params) {
    if (!navi) return
    const { push } = navi;
    ylog('===NEXT ROUTER==========>>>>>>>>',name);
    
    if (params == null) {
        push(name);
    } else {
        push(name, params);
    }
}
export function navigateForParams(navi, name, params) {
    if (!navi) return
    const { navigate } = navi;
    ylog('===NEXT ROUTER==========>>>>>>>>',name);
    if (params == null) {
        navigate(name);
    } else {
        navigate(name, params);
    }
}
export function pop(navi) {
    navi && navi.goBack()
}

export function popToTop(navi, name) {
    navi && navi.popToTop()
}

export function popN(navi, number) {
    navi && navi.pop(number)
}

export function resetTo(navi, name) {
    if (!navi) return

    // const { navigate } = navi
    // const resetAction = NavigationActions.navigate({
    //     index: 0,
    //     actions: [
    //         NavigationActions.navigate({ routeName: name})
    //     ]
    // })
    // navi.dispatch(resetAction)


    navi.reset([NavigationActions.navigate({ routeName: name })], 0)
}

export function resetToForParams(navi, name, params) {
    if (!navi) return

    const { navigate } = navi
    const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({ routeName: name, params: params })
        ]
    })
    navi.dispatch(resetAction)
}


