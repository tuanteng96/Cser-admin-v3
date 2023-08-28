import { combineReducers } from 'redux'
import authReducer from '../features/Auth/AuthSlice'

export const rootReducer = combineReducers({
  auth: authReducer
})
