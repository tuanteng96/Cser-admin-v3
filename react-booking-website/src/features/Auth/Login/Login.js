import { unwrapResult } from '@reduxjs/toolkit'
import React from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../AuthSlice'

export default function Login() {
  const dispatch = useDispatch()
  const handleLogin = () => {
    //dispatch(setToken('0x4aee9d30893c5c73e5a5b8637a10d9537497f1c8'));
    const body = {
      title: 'test product',
      price: 13.5,
      description: 'lorem ipsum set',
      image: 'https://i.pravatar.cc',
      category: 'electronic'
    }
    dispatch(login(body))
      .then(unwrapResult)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
  }

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
