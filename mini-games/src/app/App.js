import { Provider } from 'react-redux'
import { Route, Routes } from 'react-router-dom'
import Home from 'src/features/Home/Home'
import { PersistGate } from 'redux-persist/integration/react'
import AuthInit from 'src/features/Auth/AuthInit'
import { TypeScreenProvider } from 'src/layout/_core/SplashScreen'

function App({ store, persistor }) {
  return (
    <Provider store={store}>
      <TypeScreenProvider>
        <PersistGate loading={'Đang tải ...'} persistor={persistor}>
          <AuthInit>
            <Routes>
              <Route path="/" element={<Home />}></Route>
            </Routes>
          </AuthInit>
        </PersistGate>
      </TypeScreenProvider>
    </Provider>
  )
}

export default App
