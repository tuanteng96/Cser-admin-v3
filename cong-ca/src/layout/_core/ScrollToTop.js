import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const ScrollToTop = props => {
  const location = useLocation()
  let navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  // useEffect(() => {
  //   if (location?.pathname === '/Admin/Userwork/index.html') {
  //     navigate('/', { replace: true })
  //   } else {
  //     const pathnameList = location?.pathname.split('/')
  //     if (pathnameList && pathnameList.length === 2) {
  //       if (pathnameList[1]) {
  //         window.top.location.hash = `mb:/${pathnameList[1]}`
  //       } else {
  //         window.top.location.hash = ''
  //       }
  //     }
  //     if (pathnameList.length === 3) {
  //       window.top.location.hash = `mb:/${pathnameList[1]}/${pathnameList[2]}`
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location])

  useEffect(() => {
    if (window.top.location.hash) {
      const url = window.top.location.hash.slice(
        4,
        window.top.location.hash.length
      )
      navigate('/', { replace: true })
      navigate(url, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{props.children}</>
}

export default ScrollToTop
