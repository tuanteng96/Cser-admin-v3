import {
    createSlice
} from '@reduxjs/toolkit'

const initialState = {
    divided: []
};

export const bonusSlice = createSlice({
    name: 'Bonus',
    initialState,
    reducers: {
        setBonus: (state, payload) => {
            return ({
                ...state,
                ...payload
            })
        }
    },
})

// Action creators are generated for each case reducer function
export const {
    setBonus
} = bonusSlice.actions

export default bonusSlice.reducer;