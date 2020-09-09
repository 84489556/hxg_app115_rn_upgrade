import * as types from '../actions/actionTypes';

const initialState = {
  historyStocks: []
};

export default function HistoryReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.ADD_HISTORY_STOCKS:
    {
      let stock = action.stock
      let stocks = state.historyStocks
      let foundStock = stocks.find(eachStock => stock.Obj === eachStock.Obj);
      if (!foundStock && stock.Obj !== undefined) {
          stocks.unshift(stock)
        // stocks.push(stock)
      }
      if(stocks.length > 10){
          stocks = stocks.slice(0,9)
      }
      return Object.assign({}, state, {
        historyStocks: stocks
      })
    }
    case types.CLEAR_HISTORY_STOCKS:
    {
      return Object.assign({}, state, {
        historyStocks: []
      })
    }
    default:
      return state;
  }
}