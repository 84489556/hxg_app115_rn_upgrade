import * as types from '../actions/actionTypes';

const initialState = {
  searchResultList: []
};

export default function SearchReducer(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_SEARCH_RESULT_LIST:
    {
      return Object.assign({}, state, {
        searchResultList: action.list
      })
    }
    default:
      return state;
  }
}