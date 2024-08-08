import moment from 'moment'

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
    console.log(WorkTrack)
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
          initialValues.TimekeepingTypeValue = Math.abs(duration) * 333
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
          initialValues.TimekeepingTypeValue = Math.abs(duration) * 333
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
          let duration = moment(Intervals[indexIn].From, 'HH:mm:ss').diff(
            moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.CheckOut.TimekeepingTypeValue = Math.abs(duration) * 333
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
          let duration = moment(Intervals[indexIn].To, 'HH:mm:ss').diff(
            moment(moment(CheckOut).format('HH:mm:ss'), 'HH:mm:ss'),
            'minute'
          )
          initialValues.CheckOut.TimekeepingTypeValue = Math.abs(duration) * 333
        }
        if (Info.CheckOut?.Type?.value === 'CONG_TY') {
          initialValues.CheckOut.TimekeepingType = {
            value: 'VE_SOM',
            label: 'Về sớm'
          }
          initialValues.CheckOut.TimekeepingTypeValue = 0
        }
      }
    }
    return initialValues
    // if (index > -1) {
    //   let durationIn = moment(Intervals[index].From, 'HH:mm:ss').diff(
    //     moment(moment(CrDate).format('HH:mm:ss'), 'HH:mm:ss'),
    //     'minute'
    //   )
    //   let durationOut = moment(Intervals[index].To, 'HH:mm:ss').diff(
    //     moment(moment(CrDate).format('HH:mm:ss'), 'HH:mm:ss'),
    //     'minute'
    //   )
    //   if (!CheckIn) {
    //     initialValues.Info.WorkToday = {
    //       In: {
    //         Interval: Intervals[index],
    //         IntervalIndex: index,
    //         durationIn,
    //         durationOut,
    //         MinutesPrice
    //       }
    //     }

    //     initialValues.Info.Title = 'Hôm nay bạn đi muộn ?'

    //     if (index === 0) {
    //       initialValues.Info.WorkToday.Value = 1
    //       delete initialValues.Info.Title
    //       reject(initialValues)
    //     }
    //     if (index === 1) {
    //       initialValues.Info.WorkToday.Value = 1
    //       initialValues.Info['DI_MUON'] = {
    //         Value: MinutesPrice * Math.abs(durationIn)
    //       }
    //     }
    //     if (index === 2) {
    //       initialValues.Info.WorkToday.Value = 0.5
    //       initialValues.Info['DI_SOM'] = {
    //         Value: MinutesPrice * Math.abs(durationOut)
    //       }
    //     }
    //     if (index === 3) {
    //       initialValues.Info.WorkToday.Value = 0.5
    //       initialValues.Info['DI_MUON'] = {
    //         Value: MinutesPrice * Math.abs(durationIn)
    //       }
    //     }
    //     if (index === 4) {
    //       initialValues.Info.WorkToday.Value = 0
    //       initialValues.Info['DI_SOM'] = {
    //         Value: MinutesPrice * Math.abs(durationOut)
    //       }
    //     }
    //     if (index === 5) {
    //       initialValues.Info.WorkToday.Value = 0
    //     }
    //   } else {
    //     initialValues.Info.WorkToday = {
    //       Out: {
    //         Interval: Intervals[index],
    //         IntervalIndex: index,
    //         durationIn,
    //         durationOut,
    //         MinutesPrice
    //       }
    //     }

    //     initialValues.Info.Title = 'Hôm nay bạn về sớm ?'

    //     if (index === 0) {
    //       initialValues.Info.WorkToday.Value = 0
    //       delete initialValues.Info.Title
    //       reject(initialValues)
    //     }
    //     if (index === 1) {
    //       initialValues.Info.WorkToday.Value = 0
    //       initialValues.Info['VE_MUON'] = {
    //         Value: MinutesPrice * Math.abs(durationIn)
    //       }
    //     }
    //     if (index === 2) {
    //       initialValues.Info.WorkToday.Value =
    //         (CheckIn?.Info?.WorkToday?.Value || 0) - 0.5
    //       initialValues.Info['VE_SOM'] = {
    //         Value: MinutesPrice * Math.abs(durationOut)
    //       }
    //     }
    //     if (index === 3) {
    //       initialValues.Info.WorkToday.Value =
    //         (CheckIn?.Info?.WorkToday?.Value || 0) - 0.5
    //       initialValues.Info['VE_MUON'] = {
    //         Value: MinutesPrice * Math.abs(durationIn)
    //       }
    //     }
    //     if (index === 4) {
    //       initialValues.Info.WorkToday.Value =
    //         CheckIn?.Info?.WorkToday?.Value || 0
    //       initialValues.Info['VE_SOM'] = {
    //         Value: MinutesPrice * Math.abs(durationOut)
    //       }
    //     }
    //     if (index === 5) {
    //       initialValues.Info.WorkToday.Value =
    //         CheckIn?.Info?.WorkToday?.Value || 0
    //       initialValues.Info['VE_MUON'] = {
    //         Value: 0
    //       }
    //     }
    //   }
    // }
  }
}

export default WorksHelpers
