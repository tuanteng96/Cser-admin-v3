import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { DevHelpers } from 'src/helpers/DevHelpers'
import useWindowSize from 'src/hooks/useWindowSize'
import { LayoutSplashScreen } from 'src/layout/_core/SplashScreen'
import { setProfile } from './AuthSlice'
import moreApi from 'src/api/more.api'

async function checkInfo(fn) {
  if (window.top.Info && window.top.token && window.top.GlobalConfig) {
    let { data } = await moreApi.getNameConfig('App.webnoti')
    let FirebaseApp = null
    if (
      data?.data &&
      data?.data.filter(x => x.Name === 'App.webnoti').length > 0
    ) {
      let firebaseStr = data?.data.filter(x => x.Name === 'App.webnoti')[0][
        'ValueText'
      ]

      FirebaseApp = firebaseStr
    }

    fn({ FirebaseApp })
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
              ID: 11620,
              Title: 'Cser Hà Nội'
            },
            {
              ID: 11621,
              Title: 'Cser Hồ Chí Minh'
            },
            {
              ID: 11623,
              Title: '11622.Cser Đà Nẵng'
            },
            {
              ID: 11625,
              Title: 'Cơ sở A'
            },
            {
              ID: 11626,
              Title: 'Cơ sở B'
            }
          ],
          StockRights: [
            {
              ID: 11620,
              Title: 'Cser Hà Nội'
            },
            {
              ID: 11621,
              Title: 'Cser Hồ Chí Minh'
            },
            {
              ID: 11623,
              Title: '11622.Cser Đà Nẵng'
            },
            {
              ID: 11625,
              Title: 'Cơ sở A'
            },
            {
              ID: 11626,
              Title: 'Cơ sở B'
            }
          ],
          CrStockID: 11620, //8975
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
                            ID: 11620,
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
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjExMjQ2MTAxMDE5MDAwMDEiLCJuYmYiOjE3NjQ5MDIwMTQsImV4cCI6MTg1MTMwMjAxNCwiaWF0IjoxNzY0OTAyMDE0fQ.6CfqMi94GFG-sVBYZW8SA5U3Abd_9UnDu61n2kSKwvQ'
        window.GlobalConfig = {
          Admin: {
            roster: true
          },
          APP: {
            Working: {
              TimeClose: '21:00:00',
              TimeOpen: '10:00:00'
            }
          }
        }
      }
      checkInfo(({ FirebaseApp }) => {
        dispatch(
          setProfile({
            Info: window.top.Info,
            Token: window.top.token,
            GlobalConfig: window.top.GlobalConfig,
            FirebaseApp: FirebaseApp
          })
        )
        setShowSplashScreen(false)
      })
    }

    if (!window.top.Info || !window.top.token || !window.top.GlobalConfig) {
      requestUser()
    } else {
      ;(async () => {
        let { data } = await moreApi.getNameConfig('App.webnoti')
        let FirebaseApp = null
        if (
          data?.data &&
          data?.data.filter(x => x.Name === 'App.webnoti').length > 0
        ) {
          let firebaseStr = data?.data.filter(x => x.Name === 'App.webnoti')[0][
            'ValueText'
          ]

          FirebaseApp = firebaseStr
        }
        dispatch(
          setProfile({
            Info: window.top.Info,
            Token: window.top.token,
            GlobalConfig: window.top.GlobalConfig,
            FirebaseApp
          })
        )
        setShowSplashScreen(false)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{props.children}</>
}

export default AuthInit
