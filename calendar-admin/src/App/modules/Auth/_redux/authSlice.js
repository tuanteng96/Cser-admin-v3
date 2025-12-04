import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "Auth",
  initialState: {},
  reducers: {
    setInfo: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    },
    setCrStockID: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    }
  },
});

// Action creators are generated for each case reducer function
export const { setInfo, setCrStockID } = authSlice.actions;

export default authSlice.reducer;
