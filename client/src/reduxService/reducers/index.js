import {combineReducers} from "redux";
import homePageLoaderReducer from "./homePageLoaderReducer";
import userLocalAddReducer from "./userLocalAddReducer";
import userRecentSearchReducer from "./userRecentSearchReducer";

const rootReducer=combineReducers({
    isUserAddedLocally:userLocalAddReducer,
    recentSearch:userRecentSearchReducer,
    homePageLoader:homePageLoaderReducer,
});

export default rootReducer;