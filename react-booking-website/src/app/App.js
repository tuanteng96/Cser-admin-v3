import { Provider } from 'react-redux'
import AuthInit from 'src/features/Auth/AuthInit'
import Home from 'src/features/Home'

function App({ store }) {
  return (
    <Provider store={store}>
      <AuthInit>
        <Home />
      </AuthInit>
    </Provider>
  )
}

export default App
