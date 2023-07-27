import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ConvertViToEn } from "../../../../helpers/TextHelpers";
import CheckinCrud from "./CheckinCrud";

export const CheckIn = createAsyncThunk("/login", async (StockID, thunkAPI) => {
  try {
    const { data } = await CheckinCrud.getListCheckIn(StockID);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

const initialState = {
  ListCheckIn: [],
  ListFilters: null,
  loading: false,
};

export const CheckinSlice = createSlice({
  name: "CheckIn",
  initialState,
  reducers: {
    filterBy: (state, { payload }) => {
      const { Key, Type } = payload;
      let newStateList = [...state.ListCheckIn];
      let newListFilters = [];
      if (Type) {
        if (Type.value === 2) {
          newStateList = newStateList.filter((x) => x?.CheckIn?.CheckOutTime);
        } else {
          newStateList = newStateList
            .filter((item) =>
              Type.value === 0
                ? item?.CheckIn?.OrderCheckInID
                : !item?.CheckIn?.OrderCheckInID
            )
            .filter((x) => !x?.CheckIn?.CheckOutTime);
        }
      }
      newListFilters = newStateList.filter(
        (item) =>
          ConvertViToEn(item.FullName).includes(ConvertViToEn(Key)) ||
          item.MobilePhone.includes(Key)
      );
      return {
        ...state,
        ListFilters: Key || Type ? newListFilters : null,
      };
    },
  },
  extraReducers: {
    [CheckIn.pending]: (state) => {
      //
      state.loading = true;
    },
    [CheckIn.fulfilled]: (state, { payload }) => {
      //console.log(current(state))
      return {
        ...state,
        ListCheckIn: payload,
        loading: false,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { filterBy } = CheckinSlice.actions;

export default CheckinSlice.reducer;
