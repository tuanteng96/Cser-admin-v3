import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { persistStore } from 'redux-persist'

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: getDefaultMiddleware => [
    ...getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
      thunk: true
    })
  ]
})

export default store
export const persistor = persistStore(store)
