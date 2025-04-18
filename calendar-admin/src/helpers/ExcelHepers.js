const GC = window.GC

const dataToExcel = (fileName, fn) => {
  //1. Chuẩn bị xuất

  var excelIO = new GC.Spread.Excel.IO()
  var el = document.getElementById('ex')
  if (!el) {
    el = document.createElement('div')
    el.id = 'ex'
    el.style.position = 'fixed'
    el.style.bottom = 0
    el.style.left = 0
    el.style.width = 1
    el.style.height = 1
    el.style.overflow = 'hidden'
    el.style.visibility = 'hidden'
    document.body.appendChild(el)
  }
  var inner = document.querySelector('.inner')
  if (!inner) {
    inner = document.createElement('div')
    el.style.width = '100vw'
    el.style.height = '100vh'
    el.appendChild(inner)
  }
  var workbook = new GC.Spread.Sheets.Workbook(inner)
  var sheet = workbook.getActiveSheet()

  sheet.setRowCount(300000)
  sheet.setColumnCount(50)

  fn(sheet, workbook)

  //3. Xuất
  var json = JSON.stringify(workbook.toJSON())
  excelIO.save(
    json,
    function (blob) {
      window.saveAs && window.saveAs(blob, fileName || 'ezs.xlsx') //xlsx
    },
    function (e) {
      console.log(e)
    }
  )
}

const ExcelHepers = {
  dataToExcel
}

export default ExcelHepers
