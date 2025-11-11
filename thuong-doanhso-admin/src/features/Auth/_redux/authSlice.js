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
        ID: 11617,
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
    CrStockID: 11617,
  };

  window.top.token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjExMjQ2MTAxMDE5MDAwMDEiLCJuYmYiOjE3NjI0ODU4NTMsImV4cCI6MTg0ODg4NTg1MywiaWF0IjoxNzYyNDg1ODUzfQ.UW9uewGts9PYqHPdKQOxDLuKea6SnErCwItSbKBgl04";

  window.top.OrderBonus23Info = {
    OrderID: 59963,
    Order: {
      //Status: "finish",
      //AdminAction: "TANG_DH_KET_THUC_NO",
    },
  };

  window.top.GlobalConfig = {
    Admin: {
      thuong_ds_nang_cao: false,
      hoa_hong_an_gia: true,
      cai_dat_phi: {
        an_tinh_hs_ds: true,
        sp_loai_bo: "20258,20416,20417",
        visible: true,
        TIP: {
          ProdID: "20258",
          ProdTitle: "TIP",
        },
        PHIDICHVU: {
          ProdID: "20416",
          ProdTitle: "Phí dịch vụ",
          Value: "8",
          Type: "don_hang",
          _Type: "dich_vu",
          donhang_type: [0, 1, 2, 3, 4],
          donhang_price: "GG",
          _donhang_price: "NG",
          max: 100000,
        },
        PHIQUETTHE: {
          ProdID: "20417",
          ProdTitle: "Phí quẹt thẻ",
          Value: "3.5",
        },
      },
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
