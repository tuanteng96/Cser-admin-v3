import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function UnauthenticateGuard({ children }) {
  const { Token } = useSelector(({ auth }) => ({
    Token: auth.Token
  }))

  const location = useLocation()

  if (Token) {
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} />
  }

  return children
}
