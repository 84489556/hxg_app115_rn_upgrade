import * as types from '../actions/actionTypes';

const _limitNumber = 2

const initialState = {
  /*
  * object array
  * param code
  * param minChartData
  * param minStockInfo
  * param minJYShiJianDuan
  */
  minDatum: []
};

export default function MinChartReducer(state = initialState, action = {}) {
  switch (action.type) {

    case types.MIN_CHART_DATA:
    {
      for(var i=0; i<state.minDatum.length; i++) {
        if (state.minDatum[i].code === action.code) {
          let found = state.minDatum[i]
          let newItem = Object.assign({}, found, {
            minChartData: action.data
          })
          state.minDatum[i] = newItem
          return state
        }
      }

      state.minDatum.push({
        minChartData: action.data,
        code: action.code
      })

      if (state.minDatum.length > _limitNumber) {
        state.minDatum.splice(0, 1)
      }
      
      return state
    }

    case types.MIN_STOCK_INFO:
    {
      for(var i=0; i<state.minDatum.length; i++) {
        if (state.minDatum[i].code === action.info.Obj) {
          let found = state.minDatum[i]
          let newItem = Object.assign({}, found, {
            minStockInfo: action.info
          })
          state.minDatum[i] = newItem
          return state
        }
      }

      state.minDatum.push({
        minStockInfo: action.info,
        code: action.info.Obj
      })

      if (state.minDatum.length > _limitNumber) {
        state.minDatum.splice(0, 1)
      }

      return state
    }

    case types.MIN_JY_SHIJIANDUAN:
    {
      for(var i=0; i<state.minDatum.length; i++) {
        if (state.minDatum[i].code === action.code) {
          let found = state.minDatum[i]
          let newItem = Object.assign({}, found, {
            minJYShiJianDuan: action.timeSection
          })
          state.minDatum[i] = newItem
          return state
        }
      }

      state.minDatum.push({
        minJYShiJianDuan: action.timeSection,
        code: action.code
      })

      if (state.minDatum.length > _limitNumber) {
        state.minDatum.splice(0, 1)
      }
      
      return state
    }

    default:
      return state;
  }
}

