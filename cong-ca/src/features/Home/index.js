import React from 'react'
import { Outlet } from 'react-router-dom'
import 'src/_assets/sass/pages/_home.scss'

export default function Home() {
  return (
    <div className="h-100">
      <Outlet />
    </div>
  )
}
