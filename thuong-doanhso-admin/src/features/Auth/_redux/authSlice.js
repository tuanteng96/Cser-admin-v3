import { createSlice } from "@reduxjs/toolkit";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  window.top.Info = {
    Stocks: [
      {
        ID: 778,
        Title: "Quản lý cơ sở",
        ParentID: 0,
      },
      {
        ID: 11557,
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
    rightTree: {
      groups: [
        {
          group: "Chức năng khác",
          rights: [
            {
              IsAllStock: true,
              hasRight: true,
              name: "adminTools",
              text: "Công cụ hệ thống",
              subs: [
                {
                  name: "adminTools_byStock",
                  IsAllStock: true,
                  hasRight: true,
                },
              ],
            },
          ],
        },
      ],
    },
    User: {
      ID: 1,
    },
    CrStockID: 11557,
  };

  window.top.token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjE5ODExMjAxNDciLCJuYmYiOjE3NDk4MDU0ODMsImV4cCI6MTgzNjIwNTQ4MywiaWF0IjoxNzQ5ODA1NDgzfQ.AUyP04Y42DhZJ6YK4cAcVVOx7dDeU5CfwYC2C83Eqec";

  window.top.OrderBonus23Info = {
    OrderID: 58110,
    Order: {
      //Status: "finish",
      //AdminAction: "TANG_DH_KET_THUC_NO",
    },
  };

  window.top.GlobalConfig = {
    Admin: {
      thuong_ds_nang_cao: false,
      hoa_hong_an_gia: true
    },
  };
}

const OrderInfo = window.top.OrderBonus23Info;

const Info = window.top?.Info;

const initialState = {
  ...OrderInfo,
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
