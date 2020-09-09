import * as types from '../actions/actionTypes';

const _limitNumber = 2

const initialState = {
  /*
  ** object array
  ** param code
  ** param stkInfo
  ** param chartData
  ** param mainFormula
  ** param viceFormula
  ** param showCount
  ** param startPos
  ** param legendPos
  */
  klineDatum: []
};

export default function KChartReducer(state = initialState, action = {}) {
  switch (action.type) {

    case types.SET_K_CHART_STOCK_INFO:
    {
      for(var i=0; i<state.klineDatum.length; i++) {
        if (state.klineDatum[i].code === action.code) {
          let found = state.klineDatum[i]
          let newItem = Object.assign({}, found, {
            stkInfo: action.stkInfo
          })
          state.klineDatum[i] = newItem
          return state
        }
      }

      state.klineDatum.push({
        stkInfo: action.stkInfo,
        code: action.code
      })

      if (state.klineDatum.length > _limitNumber) {
        state.klineDatum.splice(0, 1)
      }
      
      return state
    }

    case types.SET_K_CHART_DATA:
    {
      for(var i=0; i<state.klineDatum.length; i++) {
        if (state.klineDatum[i].code === action.code) {
      //     let foundDatum = state.klineDatum[i]

      //     for(var j=0; j<action.data.length; j++) {
      //       foundDatum.chartData.push(action.data[j])
      //       foundDatum.chartData.shift()
      //     }
          
      //     let newItem = Object.assign({}, foundDatum)
      //     state.klineDatum[i] = newItem
          return state
        }
      }

      state.klineDatum.push({
        chartData: action.data,
        code: action.code
      })

      if (state.klineDatum.length > _limitNumber) {
        state.klineDatum.splice(0, 1)
      }
      
      return state
    }

    case types.SET_MAIN_FORMULA:
    {
      for(var i=0; i<state.klineDatum.length; i++) {
        if (state.klineDatum[i].code === action.code) {
          let found = state.klineDatum[i]
          let newItem = Object.assign({}, found, {
            mainFormula: action.fName
          })
          state.klineDatum[i] = newItem
          return state
        }
      }

      state.klineDatum.push({
        mainFormula: action.fName,
        code: action.code
      })

      if (state.klineDatum.length > _limitNumber) {
        state.klineDatum.splice(0, 1)
      }
      
      return state
    }

    case types.SET_VICE_FORMULA:
    {
      for(var i=0; i<state.klineDatum.length; i++) {
        if (state.klineDatum[i].code === action.code) {
          let found = state.klineDatum[i]
          let newItem = Object.assign({}, found, {
            viceFormula: action.fName
          })
          state.klineDatum[i] = newItem
          return state
        }
      }

      state.klineDatum.push({
        viceFormula: action.fName,
        code: action.code
      })

      if (state.klineDatum.length > _limitNumber) {
        state.klineDatum.splice(0, 1)
      }
      
      return state
    }

    case types.SET_SHOW_COUNT:
    {
      for(var i=0; i<state.klineDatum.length; i++) {
        if (state.klineDatum[i].code === action.code) {
          let found = state.klineDatum[i]
          let newItem = Object.assign({}, found, {
            showCount: action.showcount
          })
          state.klineDatum[i] = newItem
          return state
        }
      }

      state.klineDatum.push({
        showCount: action.showcount,
        code: action.code
      })

      if (state.klineDatum.length > _limitNumber) {
        state.klineDatum.splice(0, 1)
      }
      
      return state
    }

    case types.SET_START_POSTION:
    {
      for(var i=0; i<state.klineDatum.length; i++) {
        if (state.klineDatum[i].code === action.code) {
          let found = state.klineDatum[i]
          let newItem = Object.assign({}, found, {
            startPos: action.pos
          })
          state.klineDatum[i] = newItem
          return state
        }
      }

      state.klineDatum.push({
        startPos: action.pos,
        code: action.code
      })

      if (state.klineDatum.length > _limitNumber) {
        state.klineDatum.splice(0, 1)
      }
      
      return state
    }

    case types.SET_LEGEND_POSITION:
    {
      for(var i=0; i<state.klineDatum.length; i++) {
        if (state.klineDatum[i].code === action.code) {
          let found = state.klineDatum[i]
          let newItem = Object.assign({}, found, {
            legendPos: action.pos
          })
          state.klineDatum[i] = newItem
          return state
        }
      }

      state.klineDatum.push({
        legendPos: action.pos,
        code: action.code
      })

      if (state.klineDatum.length > _limitNumber) {
        state.klineDatum.splice(0, 1)
      }
      
      return state
    }

    default:
      return state;
  }
}

