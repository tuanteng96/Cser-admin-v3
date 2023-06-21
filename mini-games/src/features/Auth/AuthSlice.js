import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import persistReducer from 'redux-persist/es/persistReducer'
import storage from 'redux-persist/lib/storage'
import authApi from 'src/api/auth.api'

export const login = createAsyncThunk('/login', async (data, thunkAPI) => {
  try {
    const response = await authApi.login(data)
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue(error)
  }
})

const Auth = createSlice({
  name: 'auth',
  initialState: {
    Token: ''
  },
  reducers: {
    setToken: (state, action) => {
      return {
        ...state,
        Token: action.payload
      }
    }
  },
  extraReducers: {
    [login.fulfilled]: (state, { payload }) => {
      return {
        ...state,
        Token: payload.data.id
      }
    }
  }
})

const persistConfig = {
  key: 'auth',
  storage: storage
  //blacklist: ['user']
}

const { reducer, actions } = Auth
export const { setToken } = actions
export default persistReducer(persistConfig, reducer)
