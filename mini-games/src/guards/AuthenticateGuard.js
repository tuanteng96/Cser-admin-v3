import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function AuthenticateGuard({ children }) {
  const { Token } = useSelector(({ auth }) => ({
    Token: auth.Token
  }))

  const location = useLocation()

  if (!Token) {
    return <Navigate to="/login" state={{ from: location }} />
  }

  return children
}
