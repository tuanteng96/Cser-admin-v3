import { createSlice } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";

const auth = createSlice({
    name: "auth",
    initialState: {
        user: {}
    },
    reducers: {
        setUser: (state, action) => {
            return {
                ...state,
                user: action.payload
            };
        },
    }
});

const persistConfig = {
    key: 'auth',
    storage: storage,
    //blacklist: ['user']
};

const { reducer, actions } = auth;
export const { setUser } = actions;
export default persistReducer(persistConfig, reducer);