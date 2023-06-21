import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { useSelector } from 'react-redux'
import {
  LayoutSplashScreen,
  TypeScreenContext
} from 'src/layout/_core/SplashScreen'

function AuthInit(props) {
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  const { Token } = useSelector(({ auth }) => ({
    Token: auth.Token
  }))
  const { type: Type } = useContext(TypeScreenContext)

  useEffect(() => {
    if (Type === 'admin') {
      async function requestUser() {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setShowSplashScreen(false)
      }
      if (Token) {
        requestUser()
      } else {
        setShowSplashScreen(false)
      }
    } else {
      setShowSplashScreen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{props.children}</>
}

export default AuthInit
