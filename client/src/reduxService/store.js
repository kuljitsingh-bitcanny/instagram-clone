import {createStore,applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk"
import rootReducer from "./reducers";

const store=createStore(rootReducer,{},applyMiddleware(thunkMiddleware));

console.log(store);

export default store;