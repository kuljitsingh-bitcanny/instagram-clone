import { ADD_TO_USER_RECENT_SEARCH, CLEAR_USER_RECENT_SEARCH, REMOVE_FROM_USER_RECENT_SEARCH } from "../constants"

export const addToRecentSearch=(search)=>{
    return {
        type:ADD_TO_USER_RECENT_SEARCH,
        payload:{...search}
    }
}
export const removeFromRecentSearch=(id)=>{
    return {
        type:REMOVE_FROM_USER_RECENT_SEARCH,
        payload:id
    }
}
export const clearUserRecentSearch=()=>{
    return{
        type:CLEAR_USER_RECENT_SEARCH
    }
}