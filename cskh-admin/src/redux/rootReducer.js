import { combineReducers } from "redux";
import authReducer from "../features/Auth/_redux/AuthSlice";

export const rootReducer = combineReducers({
    auth: authReducer,
});