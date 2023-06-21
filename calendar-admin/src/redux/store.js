import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../App/modules/Auth/_redux/authSlice";
import bookingReducer from "../App/modules/Booking/_redux/bookingSlice";
import checkinReducer from "../App/modules/Checkin/_redux/CheckinSlice";
import jsonReducer from "../App/modules/Auth/_redux/jsonSlice"

export default configureStore({
    reducer: {
        Auth: authReducer,
        JsonConfig: jsonReducer,
        Booking: bookingReducer,
        CheckIn: checkinReducer
    },
})