import * as types from '../actions/actionTypes';

const initialState = {
  sortState: 2,
  personalStockData: []
};

export default function PersonalStocksTabReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.PERSONALSTOCKTAB_SORT:
      return Object.assign({}, state, {
        sortState: action.newSort
      })
    case types.SET_PERSONAL_STOCK_DATA:
      return Object.assign({}, state, {
        personalStockData: action.stocks
      })
      //退出
      case types.USER_LOGOUT:

          return Object.assign({},state,{
              personalStockData: []
          });


      default:
      return state;
  }
}