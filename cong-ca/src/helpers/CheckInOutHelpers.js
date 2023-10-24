export const CheckInOutHelpers = {
  getTimekeepingType: info => {
    let obj = {
      Value: '',
      Option: ''
    }
    if (info['DI_SOM']) {
      obj = {
        Value: info['DI_SOM'].Value,
        Option: {
          label: 'Đi sớm',
          value: 'DI_SOM'
        }
      }
    }
    if (info['DI_MUON']) {
      obj = {
        Value: info['DI_MUON'].Value ? -Math.abs(info['DI_MUON'].Value) : 0,
        Option: {
          label: 'Đi muộn',
          value: 'DI_MUON'
        }
      }
    }
    if (info['VE_SOM']) {
      obj = {
        Value: info['VE_SOM'].Value,
        Option: {
          label: 'Về sớm',
          value: 'VE_SOM'
        }
      }
    }
    if (info['VE_MUON']) {
      obj = {
        Value: info['VE_MUON'].Value ? -Math.abs(info['VE_MUON'].Value) : 0,
        Option: {
          label: 'Về muộn',
          value: 'VE_MUON'
        }
      }
    }
    return obj
  }
}
