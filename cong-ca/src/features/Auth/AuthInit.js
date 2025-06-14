import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { DevHelpers } from 'src/helpers/DevHelpers'
import useWindowSize from 'src/hooks/useWindowSize'
import { LayoutSplashScreen } from 'src/layout/_core/SplashScreen'
import { setProfile } from './AuthSlice'

function checkInfo(fn) {
  if (window.top.Info && window.top.token && window.top.GlobalConfig) {
    fn()
  } else {
    setTimeout(() => {
      checkInfo(fn)
    }, 50)
  }
}

function AuthInit(props) {
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  const dispatch = useDispatch()
  // We should request user by authToken before rendering the application
  const size = useWindowSize()

  useEffect(() => {
    const outer = document.createElement('div')
    outer.style.visibility = 'hidden'
    outer.style.overflow = 'scroll' // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
    document.body.appendChild(outer)
    // Creating inner element and placing it in the container
    const inner = document.createElement('div')
    outer.appendChild(inner)
    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer)
    document.documentElement.style.setProperty(
      '--width-scrollbar',
      scrollbarWidth + 'px'
    )
  }, [size])

  useEffect(() => {
    async function requestUser() {
      if (DevHelpers.isDevelopment()) {
        window.Info = {
          User: {
            FullName: 'Admin System',
            UserName: 'admin',
            ID: 1
          },
          Stocks: [
            {
              ID: 778,
              Title: 'Quản lý cơ sở',
              ParentID: 0
            },
            {
              ID: 11541,
              Title: 'Cser Hà Nội',
              ParentID: 778
            },
            {
              ID: 11441,
              Title: 'Cser Hồ Chí Minh',
              ParentID: 778
            }
          ],
          StockRights: [
            {
              ID: 11541,
              Title: 'Cser Hà Nội',
              ParentID: 778
            },
            {
              ID: 11441,
              Title: 'Cser Hồ Chí Minh',
              ParentID: 778
            },
            {
              ID: 11387,
              Title: 'Cser Chấm công',
              ParentID: 778
            }
          ],
          CrStockID: 11541, //8975
          rightsSum: {
            cong_ca: {
              hasRight: true,
              stocks: [
                { ID: 11541, Title: 'Cser Hà Nội' },
                { ID: 11425, Title: 'Cser Hồ Chí Minh' },
                { ID: 11395, Title: 'Cser Đà nẵng' }
              ],
              IsAllStock: true
            }
          },
          rightTree: {
            groups: [
              {
                group: 'Cài đặt',
                rights: [
                  {
                    IsAllStock: true,
                    hasRight: true,
                    name: 'user',
                    text: 'Quản lý nhân viên',
                    subs: [
                      {
                        IsAllStock: false,
                        hasRight: true,
                        name: 'usrmng',
                        stocks: '',
                        text: 'Quản lý nhân viên',
                        stocksList: [
                          {
                            ID: 11450,
                            Title: 'Cser Hà Nội'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
        window.token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjE5ODExMjAxMTciLCJuYmYiOjE3NDk0NzkyNjUsImV4cCI6MTgzNTg3OTI2NSwiaWF0IjoxNzQ5NDc5MjY1fQ.PFD7VbZrTRWFh8CXi3vOo5D4VeAA6SlJ-YH2x-6I_k0'
        window.GlobalConfig = {
          APP: {
            Working: {
              TimeClose: '21:00:00',
              TimeOpen: '10:00:00'
            }
          }
        }
      }
      checkInfo(() => {
        dispatch(
          setProfile({
            Info: window.top.Info,
            Token: window.top.token,
            GlobalConfig: window.top.GlobalConfig
          })
        )
        setShowSplashScreen(false)
      })
    }

    if (!window.top.Info || !window.top.token || !window.top.GlobalConfig) {
      requestUser()
    } else {
      dispatch(
        setProfile({
          Info: window.top.Info,
          Token: window.top.token,
          GlobalConfig: window.top.GlobalConfig
        })
      )
      setShowSplashScreen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{props.children}</>
}

export default AuthInit
