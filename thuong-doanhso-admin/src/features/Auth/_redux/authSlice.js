import { createSlice } from "@reduxjs/toolkit";

const OrderInfo = window.top.OrderBonus23Info || {
  OrderID: 44406,
};
const CrStockID = window.top?.Info?.CrStockID || 8975;
const Info = window.top?.Info || {
  Stocks: [
    {
      ID: 778,
      Title: "Quản lý cơ sở",
      ParentID: 0,
    },
    {
      ID: 8975,
      Title: "Cser Hà Nội",
      ParentID: 778,
    },
    {
      ID: 10053,
      Title: "Cser Hồ Chí Minh",
      ParentID: 778,
    },
  ],
  rightsSum: {
    pos: {
      hasRight: true,
      stocks: [{ ID: 8975, Title: "Cser Hà Nội" }],
      IsAllStock: false,
    },
  },
  User: {
    ID: 1,
  },
};

const initialState = {
  ...OrderInfo,
  CrStockID,
  ...Info,
};

export const authSlice = createSlice({
  name: "Auth",
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
});

// Action creators are generated for each case reducer function
//export const { increment } = authSlice.actions

export default authSlice.reducer;
