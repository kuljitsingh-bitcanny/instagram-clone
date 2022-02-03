import { ADD_TO_USER_RECENT_SEARCH, CLEAR_USER_RECENT_SEARCH, REMOVE_FROM_USER_RECENT_SEARCH } from "../constants";

const initialState=[];

const userRecentSearchReducer=(state=initialState,action)=>{
    switch(action.type){
        case ADD_TO_USER_RECENT_SEARCH:
            const filteredSearch=state.filter((search)=>search.id !== action.payload.id);
            return [action.payload,...filteredSearch];
        case REMOVE_FROM_USER_RECENT_SEARCH:
            return state.filter((search)=>search.id !== action.payload);
        case CLEAR_USER_RECENT_SEARCH:
            return [];
        default:
            return state;
    }
}

export default userRecentSearchReducer;