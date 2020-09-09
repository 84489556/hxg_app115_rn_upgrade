import * as types from '../actions/actionTypes';

const initialState = {
  netConnected: true,
  connectionInfo: null
};

export default function NetInfoReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_NET_IS_CONNECT:
    {
      return Object.assign({}, state, {
        netConnected: action.netState
      })
    }
    case types.SET_NET_CONNECT_INFO:
    {
      return Object.assign({}, state, {
        connectionInfo: action.netInfo
      })
    }
    default:
      return state;
  }
}