import { SET_HOME_PAGE_LOADER } from "../constants";

const initialState=false;

const homePageLoaderReducer=(state=initialState,action)=>{
    switch(action.type){
        case SET_HOME_PAGE_LOADER:
            return action.payload;
        default:
            return state;
    }
}
export default homePageLoaderReducer;