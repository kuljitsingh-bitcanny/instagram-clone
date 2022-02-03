import { SET_HOME_PAGE_LOADER } from "../constants"

export const setHomePageLoader=(status)=>{
    return {type:SET_HOME_PAGE_LOADER,payload:status}
}