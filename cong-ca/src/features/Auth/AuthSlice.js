import { createSlice } from '@reduxjs/toolkit'

const Auth = createSlice({
  name: 'auth',
  initialState: {
    Info: null
  },
  reducers: {
    setProfile: (state, { payload }) => {
      return {
        ...state,
        Token: payload.Token,
        Info: payload.Info,
        GlobalConfig: payload.GlobalConfig,
        FirebaseApp: payload.FirebaseApp
      }
    }
  }
})

const { reducer, actions } = Auth
export const { setProfile } = actions
export default reducer
