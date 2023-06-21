import { createSlice } from '@reduxjs/toolkit'
import { MemberBookInfoMock } from '../_mocks/mockBooking';

const MemberBookInfo = window.top.MemberBookInfo || MemberBookInfoMock;

const initialState = MemberBookInfo;

export const bookingSlice = createSlice({
    name: 'Booking',
    initialState,
    reducers: {
        //increment: (state) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes
        //state.value += 1
        //}
    },
})

// Action creators are generated for each case reducer function
//export const { increment } = authSlice.actions

export default bookingSlice.reducer;