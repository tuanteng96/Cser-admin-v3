import { createSlice } from '@reduxjs/toolkit'
const initialState = null;

export const jsonSlice = createSlice({
    name: 'Json',
    initialState,
    reducers: {
        setConfig: (state, { payload }) => {
            return {
                ...state,
                ...payload
            }
        }
    },
})

export const { setConfig } = jsonSlice.actions
export default jsonSlice.reducer;