import {USER_ADDED_LOCALLY} from "../constants";
export const setUserAddLocally=(status)=>{
    return {
        type:USER_ADDED_LOCALLY,
        payload:status
    }
}

