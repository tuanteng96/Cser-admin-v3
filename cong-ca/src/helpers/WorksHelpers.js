import moment from 'moment'
import { ref, push, get, remove, child } from 'firebase/database'

const WorksHelpers = {
  getConfirmOutInDivide: ({ WorkTrack }) => {
    let { CheckIn, CheckOut, Info } = WorkTrack
    let Intervals = [
      {
        From: '00:00:00',
        To: '08:45:59'
      },
      {
        From: '08:46:00',
        To: '11:29:59'
      },
      {
        From: '11:30:00',
        To: '13:59:59'
      },
      {
        From: '14:00:00',
        To: '16:29:59'
      },
      {
        From: '16:30:00',
        To: '18:59:59'
      },
      {
        From: '19:00:00',
        To: '23:59:59'
      }
    ]
    let initialValues = {
      ...Info
    }

    let MinutesPrice = 333

    //Xử lý CheckIn
    let indexIn = Intervals.findIndex(
      x =>
        moment(moment(CheckIn).format('HH:mm:ss'), 'HH:mm:ss').isSameOrAfter(
          moment(x.From, 'HH:mm:ss')
        ) &&
        moment(moment(CheckIn).format('HH:mm:ss'), 'HH:mm:ss').isSameOrBefore(
          moment(x.To, 'HH:mm:ss')
        )
    )

    if (indexIn > -1) {
      if (indexIn === 0) {
        initialValues.CountWork = 1
        initialValues.TimekeepingTypeValue = 0
        initialValues.Type = ''
        initialValues.TimekeepingType = ''
      }
      if (indexIn === 1) {
        initialValues.CountWork = 1
        if (Info?.Type?.value === 'CA_NHAN') {
          initialValues.TimekeepingType = {
            value: 'DI_MUON',
            label: 'Đi muộn'
          }
          let duration = moment(Intervals[indexIn].From, 'HH:mm:ss').diff(
            moment(moment(CheckIn).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.TimekeepingTypeValue = Math.abs(duration) * MinutesPrice
        }
        if (Info?.Type?.value === 'CONG_TY') {
          initialValues.TimekeepingType = {
            value: 'DI_MUON',
            label: 'Đi muộn'
          }
          initialValues.TimekeepingTypeValue = 0
        }
      }
      if (indexIn === 2) {
        if (Info?.Type?.value === 'CA_NHAN') {
          initialValues.CountWork = 0.5
          initialValues.TimekeepingType = {
            value: 'DI_SOM',
            label: 'Đi sớm'
          }
          let duration = moment(Intervals[indexIn].To, 'HH:mm:ss').diff(
            moment(moment(CheckIn).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.TimekeepingTypeValue = Math.abs(duration) * MinutesPrice
        }
        if (Info?.Type?.value === 'CONG_TY') {
          initialValues.CountWork = 1
          initialValues.TimekeepingType = {
            value: 'DI_MUON',
            label: 'Đi muộn'
          }
          initialValues.TimekeepingTypeValue = 0
        }
      }
      if (indexIn === 3) {
        if (Info?.Type?.value === 'CA_NHAN') {
          initialValues.CountWork = 0.5
          initialValues.TimekeepingType = {
            value: 'DI_MUON',
            label: 'Đi muộn'
          }
          let duration = moment(Intervals[indexIn].From, 'HH:mm:ss').diff(
            moment(moment(CheckIn).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.TimekeepingTypeValue = Math.abs(duration) * MinutesPrice
        }
        if (Info?.Type?.value === 'CONG_TY') {
          initialValues.CountWork = 1
          initialValues.TimekeepingType = {
            value: 'DI_MUON',
            label: 'Đi muộn'
          }
          initialValues.TimekeepingTypeValue = 0
        }
      }
      if (indexIn === 4) {
        if (Info?.Type?.value === 'CA_NHAN') {
          initialValues.CountWork = 0
          initialValues.TimekeepingType = {
            value: 'DI_SOM',
            label: 'Đi sớm'
          }
          let duration = moment(Intervals[indexIn].To, 'HH:mm:ss').diff(
            moment(moment(CheckIn).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.TimekeepingTypeValue = Math.abs(duration) * MinutesPrice
        }
        if (Info?.Type?.value === 'CONG_TY') {
          initialValues.CountWork = 1
          initialValues.TimekeepingType = {
            value: 'DI_MUON',
            label: 'Đi muộn'
          }
          initialValues.TimekeepingTypeValue = 0
        }
      }

      if (indexIn === 5) {
        if (Info?.Type?.value === 'CA_NHAN') {
          initialValues.CountWork = 0
          initialValues.TimekeepingType = ''
          initialValues.TimekeepingTypeValue = 0
        }
        if (Info?.Type?.value === 'CONG_TY') {
          initialValues.CountWork = 1
          initialValues.TimekeepingType = {
            value: 'DI_MUON',
            label: 'Đi muộn'
          }
          initialValues.TimekeepingTypeValue = 0
        }
      }
    }

    //Xử lý CheckOut
    if (CheckOut) {
      let indexOut = Intervals.findIndex(
        x =>
          moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss').isSameOrAfter(
            moment(x.From, 'HH:mm:ss')
          ) &&
          moment(
            moment(CheckOut).format('HH:mm:ss'),
            'HH:mm:ss'
          ).isSameOrBefore(moment(x.To, 'HH:mm:ss'))
      )
      if (indexOut === 0) {
        initialValues.CountWork = 0
        initialValues.CheckOut.TimekeepingTypeValue = 0
        initialValues.CheckOut.Type = ''
        initialValues.CheckOut.TimekeepingType = ''
      }
      if (indexOut === 1) {
        if (Info.CheckOut?.Type?.value === 'CA_NHAN') {
          initialValues.CountWork = 0
          initialValues.CheckOut.TimekeepingType = {
            label: 'VE_MUON',
            value: 'Về muộn'
          }
          let duration = moment(Intervals[indexOut].From, 'HH:mm:ss').diff(
            moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.CheckOut.TimekeepingTypeValue =
            Math.abs(duration) * MinutesPrice
        }
        if (Info.CheckOut?.Type?.value === 'CONG_TY') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_SOM',
            label: 'Về sớm'
          }
          initialValues.CheckOut.TimekeepingTypeValue = 0
        }
      }
      if (indexOut === 2) {
        if (Info.CheckOut?.Type?.value === 'CA_NHAN') {
          initialValues.CountWork = initialValues.CountWork - 0.5
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_SOM',
            label: 'Về sớm'
          }
          let duration = moment(Intervals[indexOut].To, 'HH:mm:ss').diff(
            moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.CheckOut.TimekeepingTypeValue =
            Math.abs(duration) * MinutesPrice
        }
        if (Info.CheckOut?.Type?.value === 'CONG_TY') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_SOM',
            label: 'Về sớm'
          }
          initialValues.CheckOut.TimekeepingTypeValue = 0
        }
      }
      if (indexOut === 3) {
        if (Info.CheckOut?.Type?.value === 'CA_NHAN') {
          initialValues.CountWork = initialValues.CountWork - 0.5
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_MUON',
            label: 'Về muộn'
          }
          let duration = moment(Intervals[indexOut].From, 'HH:mm:ss').diff(
            moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.CheckOut.TimekeepingTypeValue =
            Math.abs(duration) * MinutesPrice
        }
        if (Info.CheckOut?.Type?.value === 'CONG_TY') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_SOM',
            label: 'Về sớm'
          }
          initialValues.CheckOut.TimekeepingTypeValue = 0
        }
      }
      if (indexOut === 4) {
        if (Info.CheckOut?.Type?.value === 'CA_NHAN') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_SOM',
            label: 'Về sớm'
          }
          let duration = moment(Intervals[indexOut].To, 'HH:mm:ss').diff(
            moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.CheckOut.TimekeepingTypeValue =
            Math.abs(duration) * MinutesPrice
        }
        if (Info.CheckOut?.Type?.value === 'CONG_TY') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_SOM',
            label: 'Về sớm'
          }
          initialValues.CheckOut.TimekeepingTypeValue = 0
        }
      }

      if (indexOut === 5) {
        if (Info.CheckOut?.Type?.value === 'CA_NHAN') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_MUON',
            label: 'Về muộn'
          }
          initialValues.CheckOut.TimekeepingTypeValue = 0
        }
        if (Info.CheckOut?.Type?.value === 'CONG_TY') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_MUON',
            label: 'Về muộn'
          }
          let isSameOrAfter = moment(
            moment(CheckIn).format('HH:mm:ss'),
            'HH:mm:ss'
          ).isSameOrAfter(moment(Intervals[indexOut].From, 'HH:mm:ss'))

          if (!isSameOrAfter) {
            let durationInNew = moment(
              Intervals[indexOut].From,
              'HH:mm:ss'
            ).diff(
              moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
              'minute'
            )
            initialValues.CheckOut.TimekeepingTypeValue =
              Math.abs(durationInNew) * MinutesPrice
          } else {
            let durationInNew = moment(
              moment(CheckIn).format('HH:mm:ss'),
              'HH:mm:ss'
            ).diff(
              moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
              'minute'
            )

            initialValues.CheckOut.TimekeepingTypeValue =
              Math.abs(durationInNew) * MinutesPrice
          }
        }
      }
    }
    return initialValues
  },
  addAdminRecord: async ({ database, data }) => {
    if (!database) {
      console.log('Thiếu dữ liệu để push.')
      return
    }

    const adminRef = ref(database, 'appcc/')

    // Format ngày hiện tại
    const today = moment().format('DD/MM/YYYY')

    try {
      // Push dữ liệu mới
      await push(adminRef, {
        CreateDate: moment().format('HH:mm DD/MM/YYYY'),
        data
      })

      console.log('Thêm mới thành công.')

      // Lấy toàn bộ danh sách hiện tại
      const snapshot = await get(adminRef)

      if (snapshot.exists()) {
        const data = snapshot.val()

        // Duyệt từng item
        for (let key in data) {
          const item = data[key]
          const itemDate = item?.CreateDate?.split(' ')[1] // lấy phần DD/MM/YYYY

          // Nếu khác ngày hiện tại thì xoá
          if (itemDate && itemDate !== today) {
            await remove(child(adminRef, key))
            console.log('Đã xoá record cũ:', key, itemDate)
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi push dữ liệu:', err)
    }
  }
}

export default WorksHelpers
