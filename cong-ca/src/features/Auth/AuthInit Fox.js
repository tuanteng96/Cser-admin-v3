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
              ID: 8975,
              Title: 'Saigon Office',
              Lat: 0,
              Lng: 0,
              WifiID: 'ac:a3:1e:4:e2:35',
              WifiName: 'Face Wash Fox',
              IsPublic: 1
            },
            {
              ID: 12356,
              Title: 'Vincom Plaza 3-2',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:f7:6f:29',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12357,
              Title: 'Yên Hoa Hà Nội',
              Lat: 0,
              Lng: 0,
              WifiID: 'a0:89:66:ca:14:9',
              WifiName: 'FACEWASHFOX',
              IsPublic: 1
            },
            {
              ID: 12358,
              Title: 'Hạ Long Vũng Tàu',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 0
            },
            {
              ID: 12359,
              Title: 'Nguyễn Du Q1',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12360,
              Title: 'Vincom Plaza Skylake',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12361,
              Title: 'Vincom Phạm Ngọc Thạch',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:e5:72:a8',
              WifiName: 'FACEWASHFOX',
              IsPublic: 1
            },
            {
              ID: 12362,
              Title: 'Starlake',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12363,
              Title: 'Marina',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12365,
              Title: 'Greenbay',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12366,
              Title: 'Lumiere',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12367,
              Title: 'Times City',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12368,
              Title: 'HANOI TOWER',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12369,
              Title: 'SAIGON PEARL',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12370,
              Title: 'Vincom Saigonres',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12371,
              Title: 'Diamond Island',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12372,
              Title: 'Vincom Bắc Từ Liêm',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12373,
              Title: 'LOTTE HANOI',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12374,
              Title: 'HANOI CENTRE',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12333,
              Title: 'Aeon Mall Tân Phú Celadon',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:d1:d7:19',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12329,
              Title: 'Đảo Ngọc Ngũ Xã HN',
              Lat: 0,
              Lng: 0,
              WifiID: '0:c8:96:29:e5:21',
              WifiName: 'Face Wash Fox',
              IsPublic: 1
            },
            {
              ID: 12330,
              Title: 'Gold Coast Nha Trang',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:d9:41:99',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12331,
              Title: 'Trương Định Q3',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:e7:10:91',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12336,
              Title: 'Trần Phú Đà Nẵng',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12338,
              Title: 'Sương Nguyệt Ánh Q1',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12344,
              Title: 'TTTM Estella Place',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:69:5a:91',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12345,
              Title: 'SC VivoCity',
              Lat: 0,
              Lng: 0,
              WifiID: 'ac:a3:1e:4:e2:36',
              WifiName: 'fwfwifi',
              IsPublic: 1
            },
            {
              ID: 12346,
              Title: 'Midtown Q7',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12347,
              Title: 'Aeon Mall Bình Tân',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:27:4a:a1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12348,
              Title: 'Nowzone Q1',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:9a:3f:99',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12350,
              Title: 'Ha Noi Office',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12351,
              Title: 'Saigon Centre',
              Lat: 10.7732077801471,
              Lng: 106.701059803134,
              WifiID: 'b8:29:3:c7:7c:41',
              WifiName: 'FACE WASH FOX_5G',
              IsPublic: 1
            },
            {
              ID: 12352,
              Title: 'Hub Kho Saigon ',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:c7:f8:79',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12353,
              Title: 'THI SÁCH Q1',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:d4:65:31',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12354,
              Title: 'Kosmo Tây Hồ',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:61:d7:81',
              WifiName: 'FACEWASHFOX 5G',
              IsPublic: 1
            },
            {
              ID: 12301,
              Title: 'Riviera Point Q7',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:fc:77:69',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12302,
              Title: 'Vincom Bà Triệu',
              Lat: 21.0112658,
              Lng: 105.8499174,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12306,
              Title: 'Vincom Lê Văn Việt',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:5c:5f:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12307,
              Title: 'Vincom Thảo Điền',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:5f:36:e1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12313,
              Title: 'Parc Mall Q8',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12315,
              Title: 'Vista Verde',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:94:38:f1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12316,
              Title: 'Westpoint Phạm Hùng',
              Lat: 0,
              Lng: 0,
              WifiID: '3c:f9:f0:5b:c3:13',
              WifiName: 'Face Wash Fox',
              IsPublic: 1
            },
            {
              ID: 12320,
              Title: 'Crescent Mall Q7',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12322,
              Title: 'The Botanica QTB',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:b2:83:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12323,
              Title: 'Hoa Lan Q PN',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:5c:5f:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12324,
              Title: 'Everrich Infinity Q5',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ce:4:9',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12325,
              Title: 'Thống Nhất Vũng Tàu',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12326,
              Title: 'Võ Thị Sáu Q1',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ce:3:71',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12327,
              Title: 'Imperia Sky Garden HN',
              Lat: 0,
              Lng: 0,
              WifiID: '0:c8:96:21:ba:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 11287,
              Title: 'The Sun Avenue',
              Lat: 0,
              Lng: 0,
              WifiID: '24:b:2a:82:49:2',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 11288,
              Title: 'Vincom Landmark 81',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:5c:5f:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 11289,
              Title: 'Vincom Quang Trung',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:5a:f4:61',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12290,
              Title: 'Vincom Phan Văn Trị',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:62:5f:f9',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            }
          ],
          StockRights: [
            {
              ID: 8975,
              Title: 'Saigon Office',
              Lat: 0,
              Lng: 0,
              WifiID: 'ac:a3:1e:4:e2:35',
              WifiName: 'Face Wash Fox',
              IsPublic: 1
            },
            {
              ID: 12356,
              Title: 'Vincom Plaza 3-2',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:f7:6f:29',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12357,
              Title: 'Yên Hoa Hà Nội',
              Lat: 0,
              Lng: 0,
              WifiID: 'a0:89:66:ca:14:9',
              WifiName: 'FACEWASHFOX',
              IsPublic: 1
            },
            {
              ID: 12358,
              Title: 'Hạ Long Vũng Tàu',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 0
            },
            {
              ID: 12359,
              Title: 'Nguyễn Du Q1',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12360,
              Title: 'Vincom Plaza Skylake',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12361,
              Title: 'Vincom Phạm Ngọc Thạch',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:e5:72:a8',
              WifiName: 'FACEWASHFOX',
              IsPublic: 1
            },
            {
              ID: 12362,
              Title: 'Starlake',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12363,
              Title: 'Marina',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12365,
              Title: 'Greenbay',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12366,
              Title: 'Lumiere',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12367,
              Title: 'Times City',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12368,
              Title: 'HANOI TOWER',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12369,
              Title: 'SAIGON PEARL',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12370,
              Title: 'Vincom Saigonres',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12371,
              Title: 'Diamond Island',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12372,
              Title: 'Vincom Bắc Từ Liêm',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12373,
              Title: 'LOTTE HANOI',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12374,
              Title: 'HANOI CENTRE',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12333,
              Title: 'Aeon Mall Tân Phú Celadon',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:d1:d7:19',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12329,
              Title: 'Đảo Ngọc Ngũ Xã HN',
              Lat: 0,
              Lng: 0,
              WifiID: '0:c8:96:29:e5:21',
              WifiName: 'Face Wash Fox',
              IsPublic: 1
            },
            {
              ID: 12330,
              Title: 'Gold Coast Nha Trang',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:d9:41:99',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12331,
              Title: 'Trương Định Q3',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:e7:10:91',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12336,
              Title: 'Trần Phú Đà Nẵng',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12338,
              Title: 'Sương Nguyệt Ánh Q1',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12344,
              Title: 'TTTM Estella Place',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:69:5a:91',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12345,
              Title: 'SC VivoCity',
              Lat: 0,
              Lng: 0,
              WifiID: 'ac:a3:1e:4:e2:36',
              WifiName: 'fwfwifi',
              IsPublic: 1
            },
            {
              ID: 12346,
              Title: 'Midtown Q7',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12347,
              Title: 'Aeon Mall Bình Tân',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:27:4a:a1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12348,
              Title: 'Nowzone Q1',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:9a:3f:99',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12350,
              Title: 'Ha Noi Office',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12351,
              Title: 'Saigon Centre',
              Lat: 10.7732077801471,
              Lng: 106.701059803134,
              WifiID: 'b8:29:3:c7:7c:41',
              WifiName: 'FACE WASH FOX_5G',
              IsPublic: 1
            },
            {
              ID: 12352,
              Title: 'Hub Kho Saigon ',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:c7:f8:79',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12353,
              Title: 'THI SÁCH Q1',
              Lat: 0,
              Lng: 0,
              WifiID: 'b8:29:3:d4:65:31',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12354,
              Title: 'Kosmo Tây Hồ',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:61:d7:81',
              WifiName: 'FACEWASHFOX 5G',
              IsPublic: 1
            },
            {
              ID: 12301,
              Title: 'Riviera Point Q7',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:fc:77:69',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12302,
              Title: 'Vincom Bà Triệu',
              Lat: 21.0112658,
              Lng: 105.8499174,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12306,
              Title: 'Vincom Lê Văn Việt',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:5c:5f:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12307,
              Title: 'Vincom Thảo Điền',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:5f:36:e1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12313,
              Title: 'Parc Mall Q8',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12315,
              Title: 'Vista Verde',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:94:38:f1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12316,
              Title: 'Westpoint Phạm Hùng',
              Lat: 0,
              Lng: 0,
              WifiID: '3c:f9:f0:5b:c3:13',
              WifiName: 'Face Wash Fox',
              IsPublic: 1
            },
            {
              ID: 12320,
              Title: 'Crescent Mall Q7',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ac:89:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12322,
              Title: 'The Botanica QTB',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:b2:83:41',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12323,
              Title: 'Hoa Lan Q PN',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:5c:5f:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12324,
              Title: 'Everrich Infinity Q5',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ce:4:9',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12325,
              Title: 'Thống Nhất Vũng Tàu',
              Lat: 0,
              Lng: 0,
              WifiID: '',
              WifiName: '',
              IsPublic: 1
            },
            {
              ID: 12326,
              Title: 'Võ Thị Sáu Q1',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:ce:3:71',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12327,
              Title: 'Imperia Sky Garden HN',
              Lat: 0,
              Lng: 0,
              WifiID: '0:c8:96:21:ba:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 11287,
              Title: 'The Sun Avenue',
              Lat: 0,
              Lng: 0,
              WifiID: '24:b:2a:82:49:2',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 11288,
              Title: 'Vincom Landmark 81',
              Lat: 0,
              Lng: 0,
              WifiID: 'cc:71:90:5c:5f:b1',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 11289,
              Title: 'Vincom Quang Trung',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:5a:f4:61',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            },
            {
              ID: 12290,
              Title: 'Vincom Phan Văn Trị',
              Lat: 0,
              Lng: 0,
              WifiID: '4c:12:e8:62:5f:f9',
              WifiName: 'FACE WASH FOX',
              IsPublic: 1
            }
          ],
          CrStockID: 8975, //8975
          rightsSum: {
            cong_ca: {
              hasRight: true,
              stocks: [
                {
                  ID: 778,
                  Title: 'Quản lý cơ sở',
                  ParentID: 0
                },
                {
                  ID: 8975,
                  Title: 'Saigon Office',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'ac:a3:1e:4:e2:35',
                  WifiName: 'Face Wash Fox',
                  IsPublic: 1
                },
                {
                  ID: 12356,
                  Title: 'Vincom Plaza 3-2',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:f7:6f:29',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12357,
                  Title: 'Yên Hoa Hà Nội',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'a0:89:66:ca:14:9',
                  WifiName: 'FACEWASHFOX',
                  IsPublic: 1
                },
                {
                  ID: 12358,
                  Title: 'Hạ Long Vũng Tàu',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 0
                },
                {
                  ID: 12359,
                  Title: 'Nguyễn Du Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12360,
                  Title: 'Vincom Plaza Skylake',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12361,
                  Title: 'Vincom Phạm Ngọc Thạch',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:e5:72:a8',
                  WifiName: 'FACEWASHFOX',
                  IsPublic: 1
                },
                {
                  ID: 12362,
                  Title: 'Starlake',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12363,
                  Title: 'Marina',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12365,
                  Title: 'Greenbay',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12366,
                  Title: 'Lumiere',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12367,
                  Title: 'Times City',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12368,
                  Title: 'HANOI TOWER',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12369,
                  Title: 'SAIGON PEARL',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12370,
                  Title: 'Vincom Saigonres',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12371,
                  Title: 'Diamond Island',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12372,
                  Title: 'Vincom Bắc Từ Liêm',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12373,
                  Title: 'LOTTE HANOI',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12374,
                  Title: 'HANOI CENTRE',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12333,
                  Title: 'Aeon Mall Tân Phú Celadon',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:d1:d7:19',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12329,
                  Title: 'Đảo Ngọc Ngũ Xã HN',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '0:c8:96:29:e5:21',
                  WifiName: 'Face Wash Fox',
                  IsPublic: 1
                },
                {
                  ID: 12330,
                  Title: 'Gold Coast Nha Trang',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:d9:41:99',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12331,
                  Title: 'Trương Định Q3',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:e7:10:91',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12336,
                  Title: 'Trần Phú Đà Nẵng',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12338,
                  Title: 'Sương Nguyệt Ánh Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12344,
                  Title: 'TTTM Estella Place',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:69:5a:91',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12345,
                  Title: 'SC VivoCity',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'ac:a3:1e:4:e2:36',
                  WifiName: 'fwfwifi',
                  IsPublic: 1
                },
                {
                  ID: 12346,
                  Title: 'Midtown Q7',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12347,
                  Title: 'Aeon Mall Bình Tân',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:27:4a:a1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12348,
                  Title: 'Nowzone Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:9a:3f:99',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12350,
                  Title: 'Ha Noi Office',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12351,
                  Title: 'Saigon Centre',
                  Lat: 10.7732077801471,
                  Lng: 106.701059803134,
                  WifiID: 'b8:29:3:c7:7c:41',
                  WifiName: 'FACE WASH FOX_5G',
                  IsPublic: 1
                },
                {
                  ID: 12352,
                  Title: 'Hub Kho Saigon ',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:c7:f8:79',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12353,
                  Title: 'THI SÁCH Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:d4:65:31',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12354,
                  Title: 'Kosmo Tây Hồ',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:61:d7:81',
                  WifiName: 'FACEWASHFOX 5G',
                  IsPublic: 1
                },
                {
                  ID: 12301,
                  Title: 'Riviera Point Q7',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:fc:77:69',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12302,
                  Title: 'Vincom Bà Triệu',
                  Lat: 21.0112658,
                  Lng: 105.8499174,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12306,
                  Title: 'Vincom Lê Văn Việt',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:5c:5f:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12307,
                  Title: 'Vincom Thảo Điền',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:5f:36:e1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12313,
                  Title: 'Parc Mall Q8',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12315,
                  Title: 'Vista Verde',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:94:38:f1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12316,
                  Title: 'Westpoint Phạm Hùng',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '3c:f9:f0:5b:c3:13',
                  WifiName: 'Face Wash Fox',
                  IsPublic: 1
                },
                {
                  ID: 12320,
                  Title: 'Crescent Mall Q7',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12322,
                  Title: 'The Botanica QTB',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:b2:83:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12323,
                  Title: 'Hoa Lan Q PN',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:5c:5f:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12324,
                  Title: 'Everrich Infinity Q5',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ce:4:9',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12325,
                  Title: 'Thống Nhất Vũng Tàu',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12326,
                  Title: 'Võ Thị Sáu Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ce:3:71',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12327,
                  Title: 'Imperia Sky Garden HN',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '0:c8:96:21:ba:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 11287,
                  Title: 'The Sun Avenue',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '24:b:2a:82:49:2',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 11288,
                  Title: 'Vincom Landmark 81',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:5c:5f:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 11289,
                  Title: 'Vincom Quang Trung',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:5a:f4:61',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12290,
                  Title: 'Vincom Phan Văn Trị',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:62:5f:f9',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                }
              ],
              StockRights: [
                {
                  ID: 8975,
                  Title: 'Saigon Office',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'ac:a3:1e:4:e2:35',
                  WifiName: 'Face Wash Fox',
                  IsPublic: 1
                },
                {
                  ID: 12356,
                  Title: 'Vincom Plaza 3-2',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:f7:6f:29',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12357,
                  Title: 'Yên Hoa Hà Nội',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'a0:89:66:ca:14:9',
                  WifiName: 'FACEWASHFOX',
                  IsPublic: 1
                },
                {
                  ID: 12358,
                  Title: 'Hạ Long Vũng Tàu',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 0
                },
                {
                  ID: 12359,
                  Title: 'Nguyễn Du Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12360,
                  Title: 'Vincom Plaza Skylake',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12361,
                  Title: 'Vincom Phạm Ngọc Thạch',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:e5:72:a8',
                  WifiName: 'FACEWASHFOX',
                  IsPublic: 1
                },
                {
                  ID: 12362,
                  Title: 'Starlake',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12363,
                  Title: 'Marina',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12365,
                  Title: 'Greenbay',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12366,
                  Title: 'Lumiere',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12367,
                  Title: 'Times City',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12368,
                  Title: 'HANOI TOWER',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12369,
                  Title: 'SAIGON PEARL',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12370,
                  Title: 'Vincom Saigonres',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12371,
                  Title: 'Diamond Island',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12372,
                  Title: 'Vincom Bắc Từ Liêm',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12373,
                  Title: 'LOTTE HANOI',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12374,
                  Title: 'HANOI CENTRE',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12333,
                  Title: 'Aeon Mall Tân Phú Celadon',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:d1:d7:19',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12329,
                  Title: 'Đảo Ngọc Ngũ Xã HN',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '0:c8:96:29:e5:21',
                  WifiName: 'Face Wash Fox',
                  IsPublic: 1
                },
                {
                  ID: 12330,
                  Title: 'Gold Coast Nha Trang',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:d9:41:99',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12331,
                  Title: 'Trương Định Q3',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:e7:10:91',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12336,
                  Title: 'Trần Phú Đà Nẵng',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12338,
                  Title: 'Sương Nguyệt Ánh Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12344,
                  Title: 'TTTM Estella Place',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:69:5a:91',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12345,
                  Title: 'SC VivoCity',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'ac:a3:1e:4:e2:36',
                  WifiName: 'fwfwifi',
                  IsPublic: 1
                },
                {
                  ID: 12346,
                  Title: 'Midtown Q7',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12347,
                  Title: 'Aeon Mall Bình Tân',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:27:4a:a1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12348,
                  Title: 'Nowzone Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:9a:3f:99',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12350,
                  Title: 'Ha Noi Office',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12351,
                  Title: 'Saigon Centre',
                  Lat: 10.7732077801471,
                  Lng: 106.701059803134,
                  WifiID: 'b8:29:3:c7:7c:41',
                  WifiName: 'FACE WASH FOX_5G',
                  IsPublic: 1
                },
                {
                  ID: 12352,
                  Title: 'Hub Kho Saigon ',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:c7:f8:79',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12353,
                  Title: 'THI SÁCH Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'b8:29:3:d4:65:31',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12354,
                  Title: 'Kosmo Tây Hồ',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:61:d7:81',
                  WifiName: 'FACEWASHFOX 5G',
                  IsPublic: 1
                },
                {
                  ID: 12301,
                  Title: 'Riviera Point Q7',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:fc:77:69',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12302,
                  Title: 'Vincom Bà Triệu',
                  Lat: 21.0112658,
                  Lng: 105.8499174,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12306,
                  Title: 'Vincom Lê Văn Việt',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:5c:5f:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12307,
                  Title: 'Vincom Thảo Điền',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:5f:36:e1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12313,
                  Title: 'Parc Mall Q8',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12315,
                  Title: 'Vista Verde',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:94:38:f1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12316,
                  Title: 'Westpoint Phạm Hùng',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '3c:f9:f0:5b:c3:13',
                  WifiName: 'Face Wash Fox',
                  IsPublic: 1
                },
                {
                  ID: 12320,
                  Title: 'Crescent Mall Q7',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ac:89:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12322,
                  Title: 'The Botanica QTB',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:b2:83:41',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12323,
                  Title: 'Hoa Lan Q PN',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:5c:5f:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12324,
                  Title: 'Everrich Infinity Q5',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ce:4:9',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12325,
                  Title: 'Thống Nhất Vũng Tàu',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '',
                  WifiName: '',
                  IsPublic: 1
                },
                {
                  ID: 12326,
                  Title: 'Võ Thị Sáu Q1',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:ce:3:71',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12327,
                  Title: 'Imperia Sky Garden HN',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '0:c8:96:21:ba:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 11287,
                  Title: 'The Sun Avenue',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '24:b:2a:82:49:2',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 11288,
                  Title: 'Vincom Landmark 81',
                  Lat: 0,
                  Lng: 0,
                  WifiID: 'cc:71:90:5c:5f:b1',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 11289,
                  Title: 'Vincom Quang Trung',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:5a:f4:61',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                },
                {
                  ID: 12290,
                  Title: 'Vincom Phan Văn Trị',
                  Lat: 0,
                  Lng: 0,
                  WifiID: '4c:12:e8:62:5f:f9',
                  WifiName: 'FACE WASH FOX',
                  IsPublic: 1
                }
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
                            ID: 778,
                            Title: 'Quản lý cơ sở',
                            ParentID: 0
                          },
                          {
                            ID: 8975,
                            Title: 'Saigon Office',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'ac:a3:1e:4:e2:35',
                            WifiName: 'Face Wash Fox',
                            IsPublic: 1
                          },
                          {
                            ID: 12356,
                            Title: 'Vincom Plaza 3-2',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:f7:6f:29',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12357,
                            Title: 'Yên Hoa Hà Nội',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'a0:89:66:ca:14:9',
                            WifiName: 'FACEWASHFOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12358,
                            Title: 'Hạ Long Vũng Tàu',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 0
                          },
                          {
                            ID: 12359,
                            Title: 'Nguyễn Du Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12360,
                            Title: 'Vincom Plaza Skylake',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12361,
                            Title: 'Vincom Phạm Ngọc Thạch',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:e5:72:a8',
                            WifiName: 'FACEWASHFOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12362,
                            Title: 'Starlake',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12363,
                            Title: 'Marina',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12365,
                            Title: 'Greenbay',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12366,
                            Title: 'Lumiere',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12367,
                            Title: 'Times City',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12368,
                            Title: 'HANOI TOWER',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12369,
                            Title: 'SAIGON PEARL',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12370,
                            Title: 'Vincom Saigonres',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12371,
                            Title: 'Diamond Island',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12372,
                            Title: 'Vincom Bắc Từ Liêm',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12373,
                            Title: 'LOTTE HANOI',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12374,
                            Title: 'HANOI CENTRE',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12333,
                            Title: 'Aeon Mall Tân Phú Celadon',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:d1:d7:19',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12329,
                            Title: 'Đảo Ngọc Ngũ Xã HN',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '0:c8:96:29:e5:21',
                            WifiName: 'Face Wash Fox',
                            IsPublic: 1
                          },
                          {
                            ID: 12330,
                            Title: 'Gold Coast Nha Trang',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:d9:41:99',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12331,
                            Title: 'Trương Định Q3',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:e7:10:91',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12336,
                            Title: 'Trần Phú Đà Nẵng',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12338,
                            Title: 'Sương Nguyệt Ánh Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12344,
                            Title: 'TTTM Estella Place',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:69:5a:91',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12345,
                            Title: 'SC VivoCity',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'ac:a3:1e:4:e2:36',
                            WifiName: 'fwfwifi',
                            IsPublic: 1
                          },
                          {
                            ID: 12346,
                            Title: 'Midtown Q7',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12347,
                            Title: 'Aeon Mall Bình Tân',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:27:4a:a1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12348,
                            Title: 'Nowzone Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:9a:3f:99',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12350,
                            Title: 'Ha Noi Office',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12351,
                            Title: 'Saigon Centre',
                            Lat: 10.7732077801471,
                            Lng: 106.701059803134,
                            WifiID: 'b8:29:3:c7:7c:41',
                            WifiName: 'FACE WASH FOX_5G',
                            IsPublic: 1
                          },
                          {
                            ID: 12352,
                            Title: 'Hub Kho Saigon ',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:c7:f8:79',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12353,
                            Title: 'THI SÁCH Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:d4:65:31',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12354,
                            Title: 'Kosmo Tây Hồ',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:61:d7:81',
                            WifiName: 'FACEWASHFOX 5G',
                            IsPublic: 1
                          },
                          {
                            ID: 12301,
                            Title: 'Riviera Point Q7',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:fc:77:69',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12302,
                            Title: 'Vincom Bà Triệu',
                            Lat: 21.0112658,
                            Lng: 105.8499174,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12306,
                            Title: 'Vincom Lê Văn Việt',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:5c:5f:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12307,
                            Title: 'Vincom Thảo Điền',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:5f:36:e1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12313,
                            Title: 'Parc Mall Q8',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12315,
                            Title: 'Vista Verde',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:94:38:f1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12316,
                            Title: 'Westpoint Phạm Hùng',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '3c:f9:f0:5b:c3:13',
                            WifiName: 'Face Wash Fox',
                            IsPublic: 1
                          },
                          {
                            ID: 12320,
                            Title: 'Crescent Mall Q7',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12322,
                            Title: 'The Botanica QTB',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:b2:83:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12323,
                            Title: 'Hoa Lan Q PN',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:5c:5f:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12324,
                            Title: 'Everrich Infinity Q5',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ce:4:9',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12325,
                            Title: 'Thống Nhất Vũng Tàu',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12326,
                            Title: 'Võ Thị Sáu Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ce:3:71',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12327,
                            Title: 'Imperia Sky Garden HN',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '0:c8:96:21:ba:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 11287,
                            Title: 'The Sun Avenue',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '24:b:2a:82:49:2',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 11288,
                            Title: 'Vincom Landmark 81',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:5c:5f:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 11289,
                            Title: 'Vincom Quang Trung',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:5a:f4:61',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12290,
                            Title: 'Vincom Phan Văn Trị',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:62:5f:f9',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          }
                        ],
                        StockRights: [
                          {
                            ID: 8975,
                            Title: 'Saigon Office',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'ac:a3:1e:4:e2:35',
                            WifiName: 'Face Wash Fox',
                            IsPublic: 1
                          },
                          {
                            ID: 12356,
                            Title: 'Vincom Plaza 3-2',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:f7:6f:29',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12357,
                            Title: 'Yên Hoa Hà Nội',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'a0:89:66:ca:14:9',
                            WifiName: 'FACEWASHFOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12358,
                            Title: 'Hạ Long Vũng Tàu',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 0
                          },
                          {
                            ID: 12359,
                            Title: 'Nguyễn Du Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12360,
                            Title: 'Vincom Plaza Skylake',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12361,
                            Title: 'Vincom Phạm Ngọc Thạch',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:e5:72:a8',
                            WifiName: 'FACEWASHFOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12362,
                            Title: 'Starlake',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12363,
                            Title: 'Marina',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12365,
                            Title: 'Greenbay',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12366,
                            Title: 'Lumiere',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12367,
                            Title: 'Times City',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12368,
                            Title: 'HANOI TOWER',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12369,
                            Title: 'SAIGON PEARL',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12370,
                            Title: 'Vincom Saigonres',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12371,
                            Title: 'Diamond Island',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12372,
                            Title: 'Vincom Bắc Từ Liêm',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12373,
                            Title: 'LOTTE HANOI',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12374,
                            Title: 'HANOI CENTRE',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12333,
                            Title: 'Aeon Mall Tân Phú Celadon',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:d1:d7:19',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12329,
                            Title: 'Đảo Ngọc Ngũ Xã HN',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '0:c8:96:29:e5:21',
                            WifiName: 'Face Wash Fox',
                            IsPublic: 1
                          },
                          {
                            ID: 12330,
                            Title: 'Gold Coast Nha Trang',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:d9:41:99',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12331,
                            Title: 'Trương Định Q3',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:e7:10:91',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12336,
                            Title: 'Trần Phú Đà Nẵng',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12338,
                            Title: 'Sương Nguyệt Ánh Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12344,
                            Title: 'TTTM Estella Place',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:69:5a:91',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12345,
                            Title: 'SC VivoCity',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'ac:a3:1e:4:e2:36',
                            WifiName: 'fwfwifi',
                            IsPublic: 1
                          },
                          {
                            ID: 12346,
                            Title: 'Midtown Q7',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12347,
                            Title: 'Aeon Mall Bình Tân',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:27:4a:a1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12348,
                            Title: 'Nowzone Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:9a:3f:99',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12350,
                            Title: 'Ha Noi Office',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12351,
                            Title: 'Saigon Centre',
                            Lat: 10.7732077801471,
                            Lng: 106.701059803134,
                            WifiID: 'b8:29:3:c7:7c:41',
                            WifiName: 'FACE WASH FOX_5G',
                            IsPublic: 1
                          },
                          {
                            ID: 12352,
                            Title: 'Hub Kho Saigon ',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:c7:f8:79',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12353,
                            Title: 'THI SÁCH Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'b8:29:3:d4:65:31',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12354,
                            Title: 'Kosmo Tây Hồ',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:61:d7:81',
                            WifiName: 'FACEWASHFOX 5G',
                            IsPublic: 1
                          },
                          {
                            ID: 12301,
                            Title: 'Riviera Point Q7',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:fc:77:69',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12302,
                            Title: 'Vincom Bà Triệu',
                            Lat: 21.0112658,
                            Lng: 105.8499174,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12306,
                            Title: 'Vincom Lê Văn Việt',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:5c:5f:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12307,
                            Title: 'Vincom Thảo Điền',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:5f:36:e1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12313,
                            Title: 'Parc Mall Q8',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12315,
                            Title: 'Vista Verde',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:94:38:f1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12316,
                            Title: 'Westpoint Phạm Hùng',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '3c:f9:f0:5b:c3:13',
                            WifiName: 'Face Wash Fox',
                            IsPublic: 1
                          },
                          {
                            ID: 12320,
                            Title: 'Crescent Mall Q7',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ac:89:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12322,
                            Title: 'The Botanica QTB',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:b2:83:41',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12323,
                            Title: 'Hoa Lan Q PN',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:5c:5f:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12324,
                            Title: 'Everrich Infinity Q5',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ce:4:9',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12325,
                            Title: 'Thống Nhất Vũng Tàu',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '',
                            WifiName: '',
                            IsPublic: 1
                          },
                          {
                            ID: 12326,
                            Title: 'Võ Thị Sáu Q1',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:ce:3:71',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12327,
                            Title: 'Imperia Sky Garden HN',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '0:c8:96:21:ba:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 11287,
                            Title: 'The Sun Avenue',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '24:b:2a:82:49:2',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 11288,
                            Title: 'Vincom Landmark 81',
                            Lat: 0,
                            Lng: 0,
                            WifiID: 'cc:71:90:5c:5f:b1',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 11289,
                            Title: 'Vincom Quang Trung',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:5a:f4:61',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
                          },
                          {
                            ID: 12290,
                            Title: 'Vincom Phan Văn Trị',
                            Lat: 0,
                            Lng: 0,
                            WifiID: '4c:12:e8:62:5f:f9',
                            WifiName: 'FACE WASH FOX',
                            IsPublic: 1
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
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxMDY2NyIsIlRva2VuSWQiOiIxMTI2MDEwNTgzMTAwMDEzIiwibmJmIjoxNzY0OTIyNzUwLCJleHAiOjE4NTEzMjI3NTAsImlhdCI6MTc2NDkyMjc1MH0.CwIjj8epbd3UAKnV5P4q9eZfgAAQ6bVDieg4xpR4l8k'
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
