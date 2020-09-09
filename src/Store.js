/**
 * Created by cuiwenjuan on 2017/8/22.
 */
import {createStore, applyMiddleware, combineReducers, compose} from 'redux'
import thunk from 'redux-thunk'
import * as reducers from './reducers'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'


import logger from 'redux-logger';
// import './wilddog/initWilddog.js';
import './config'


const middlewares = [thunk];

//不是开发环境不要打印日志
if (process.env.NODE_ENV === `development`) {
    const { logger } = require(`redux-logger`);
    middlewares.push(logger);
}

const persistConfig = {
    key: 'root',
    storage: storage,
}

const reducer = combineReducers(reducers)
const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer, undefined, compose(applyMiddleware(...middlewares)))

// const store = compose(persistedReducer, {}, applyMiddleware(...middlewares));

//把reducers组成一个reducers对象返回
// const reducer = combineReducers(reducers)
// const store = createStore(reducer, undefined, compose(applyMiddleware(...middlewares)))


// const reducer = combineReducers(reducers)
// const store = createStore(reducer, undefined, compose(applyMiddleware(logger,thunk),autoRehydrate()))
export default store;