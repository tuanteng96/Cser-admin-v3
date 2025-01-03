import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Provider } from 'react-redux'
import AuthInit from 'src/features/Auth/AuthInit'
import Home from 'src/features/Home'

function App({ store }) {
  const { i18n } = useTranslation()

  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  const lang = urlParams.get('lang') || 'vi'

  useEffect(() => {
    i18n.changeLanguage(lang)
  }, [lang])

  return (
    <Provider store={store}>
      <AuthInit>
        <Home />
      </AuthInit>
    </Provider>
  )
}

export default App
