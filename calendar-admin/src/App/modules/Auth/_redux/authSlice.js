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
  },
});

// Action creators are generated for each case reducer function
export const { setInfo } = authSlice.actions;

export default authSlice.reducer;
