
import * as types from './actionTypes';

export function changePersonalStockTabSort(newSort) {
  return {
    type: types.PERSONALSTOCKTAB_SORT,
    newSort
  }
}

export function setPersonalStocks(stocks) {
  return {
    type: types.SET_PERSONAL_STOCK_DATA,
    stocks
  }
}

export function topPersonStock(index) {
    return{
      type: types.USER_PERSON_STOCK_TOP,
        index
    }
}

export function addPersonalStock(stock) {
  return {
    type: types.ADD_PERSONAL_STOCK,
    stock
  }
}

export function removePersonalStock(stock) {
  return {
    type: types.REMOVE_PERSONAL_STOCK,
    stock
  }
}

export function addHistoryStock(stock) {
  return {
    type: types.ADD_HISTORY_STOCKS,
    stock
  }
}

export function clearHistoryStocks() {
  return {
    type: types.CLEAR_HISTORY_STOCKS
  }
}

export function setMinChartData(code, data) {
  return {
    type: types.MIN_CHART_DATA,
    code, data
  }
}

export function setStockInfo(info) {
  return {
    type: types.MIN_STOCK_INFO,
    info
  }
}

export function setJYShiJianDuan(code, timeSection) {
  return {
    type: types.MIN_JY_SHIJIANDUAN,
    code, timeSection
  }
}

export function setKChartStockInfo(code, stkInfo) {
  return {
    type: types.SET_K_CHART_STOCK_INFO,
    code, stkInfo
  }
}

export function setKChartData(code, data) {
  return {
    type: types.SET_K_CHART_DATA,
    code, data
  }
}

export function setMainFormula(code, fName) {
  return {
    type: types.SET_MAIN_FORMULA,
    code, fName
  }
}

export function setViceFormula(code, fName) {
  return {
    type: types.SET_VICE_FORMULA,
    code, fName
  }
}

export function setShowCount(code, showcount) {
  return {
    type: types.SET_SHOW_COUNT,
    code, showcount
  }
}

export function setStartPosition(code, pos) {
  return {
    type: types.SET_START_POSTION,
    code, pos
  }
}

export function setLegendPosition(code, pos) {
  return {
    type: types.SET_LEGEND_POSITION,
    code, pos
  }
}



export function setSearchContent(content) {
  return {
    type: types.SET_SEARCH_CONTENT,
    content
  }
}

export function showKeyboard(status) {
  return {
    type: types.SHOW_KEYBOARD,
    status
  }
}

export function setSearchResultList(list) {
  return {
    type: types.SET_SEARCH_RESULT_LIST,
    list
  }
}

export function setLoadingMessage(message) {
  return {
    type: types.SET_LOADING_MESSAGE,
    message
  }
}

export function setPersonalNewsListData(data) {
  return {
    type: types.SET_PERSONAL_NEWS_LIST_DATA,
    data
  }
}

export function setNetIsConnect(netState) {
  return {
    type: types.SET_NET_IS_CONNECT,
    netState
  }
}

export function setNetConnectInfo(netInfo) {
  return {
    type: types.SET_NET_CONNECT_INFO,
    netInfo
  }
}

//移除本地
export function removeAllTourStock (){
  return {
    type: types.USER_REMOVE_PERSON_STOCKS,
  }
};
