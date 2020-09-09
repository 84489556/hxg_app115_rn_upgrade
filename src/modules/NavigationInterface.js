/**
 * Navigation接口类
 */

'use strict';

import { NavigationActions } from 'react-navigation'



export function push(navi, name) {
    if (!navi) return

    const { navigate } = this.props.navigation;
    navigate(name)
}
export function pushForParams(navi, name , params) {
    if (!navi) return

    const { navigate } = navi
    if(params == null){
        navigate(name)
    }else{
        navigate(name,params)
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
    
    const { navigate } = navi
    const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({ routeName: name})
        ]
    })
    navi.dispatch(resetAction)
}

export function resetToForParams(navi, name,params) {
    if (!navi) return

    const { navigate } = navi
    const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({ routeName: name, params: params})
        ]
    })
    navi.dispatch(resetAction)
}


