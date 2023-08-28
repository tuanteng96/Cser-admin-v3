import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function AuthenticateGuard({ children }) {
  const { hasRight, CrStockID } = useSelector(({ auth }) => ({
    hasRight: auth.Info?.rightsSum?.cong_ca?.hasRight,
    CrStockID: auth.Info?.CrStockID
  }))
  if (hasRight && CrStockID) {
    return <Navigate to="/" />
  }
  return children
}
