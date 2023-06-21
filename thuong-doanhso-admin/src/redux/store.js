import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../features/Auth/_redux/authSlice";
import bonusReducer from "../features/BonusSales/_redux/BonusSlice";

export default configureStore({
    reducer: {
        Auth: authReducer,
        Bouns: bonusReducer
    },
})