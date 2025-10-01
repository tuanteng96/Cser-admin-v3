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
              ID: 11593,
              Title: 'Cser Hà Nội'
            },
            {
              ID: 11594,
              Title: 'Cser Hồ Chí Minh'
            },
            {
              ID: 11595,
              Title: 'Cser Đà nẵng'
            }
          ],
          StockRights: [
            {
              ID: 11593,
              Title: 'Cser Hà Nội'
            },
            {
              ID: 11594,
              Title: 'Cser Hồ Chí Minh'
            },
            {
              ID: 11595,
              Title: 'Cser Đà nẵng'
            }
          ],
          CrStockID: 11593, //8975
          rightsSum: {
            cong_ca: {
              hasRight: true,
              stocks: [
                { ID: 11594, Title: 'Cser Hà Nội' },
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
              },
              {
                group: 'Phần mềm',
                rights: [
                  {
                    IsAllStock: true,
                    hasRight: true,
                    name: 'ketoan_hcns',
                    subs: [
                      {
                        IsAllStock: true,
                        hasRight: true,
                        name: 'cong_ca',
                        stocks: '',
                        text: 'Công ca',
                        stocksList: [
                          {
                            ID: 11593,
                            Title: 'Cser Hà Nội'
                          },
                          {
                            ID: 11594,
                            Title: 'Cser Hồ Chí Minh'
                          },
                          {
                            ID: 11595,
                            Title: 'Cser Đà nẵng'
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
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjE5ODExMjA1NjYiLCJuYmYiOjE3NTQ4OTY4NjQsImV4cCI6MTg0MTI5Njg2NCwiaWF0IjoxNzU0ODk2ODY0fQ.dkHZyNDoB5suWCPi-uqMMZB_g5H5jGpphOdTdA8UuCU'
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
