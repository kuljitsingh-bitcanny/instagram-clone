import {USER_ADDED_LOCALLY} from "../constants";

const initalState=false;

 const userLocalAddReducer=(state=initalState,action)=>{
    switch(action.type){
        case USER_ADDED_LOCALLY:
            return action.payload;
        default:
            return state;
    }
}
export default userLocalAddReducer;