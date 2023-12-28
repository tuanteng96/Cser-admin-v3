import { Provider } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from 'src/features/Home'
import AuthInit from 'src/features/Auth/AuthInit'
// import Worksheet from 'src/features/Home/pages/Worksheet'
import SalaryApproval from 'src/features/Home/pages/SalaryApproval'
import Timekeeping from 'src/features/Home/pages/Timekeeping'
import TimekeepingHome from 'src/features/Home/pages/Timekeeping/TimekeepingHome'
import TimekeepingMember from 'src/features/Home/pages/Timekeeping/TimekeepingMember'
import AuthenticateGuard from 'src/guards/AuthenticateGuard'
import Authentication from 'src/features/Authentication'
import UnauthenticateGuard from 'src/guards/UnauthenticateGuard'
import ScrollToTop from 'src/layout/_core/ScrollToTop'
import ShiftWorks from 'src/features/Home/pages/ShiftWorks'
import TakeBreakPage from 'src/features/Home/pages/TakeBreak'
import PayOffPage from 'src/features/Home/pages/Payoff'
import MonthlyPayroll from 'src/features/Home/pages/MonthlyPayroll'
import CalendarWork from 'src/features/Home/pages/CalendarWork'

function App({ store }) {
  return (
    <Provider store={store}>
      <AuthInit>
        <ScrollToTop>
          <Routes>
            <Route
              path="/"
              element={
                <UnauthenticateGuard>
                  <Home />
                </UnauthenticateGuard>
              }
            >
              <Route index element={<Navigate to="bang-cham-cong" />} />
              <Route path="bang-cham-cong" element={<Timekeeping />}>
                <Route index element={<TimekeepingHome />} />
                <Route path="ca-lam-viec" element={<ShiftWorks />}></Route>
                <Route path="thuong-phat" element={<PayOffPage />}></Route>
                <Route path="lich-lam-viec" element={<CalendarWork />}></Route>
                <Route
                  path="danh-sach-xin-nghi"
                  element={<TakeBreakPage />}
                ></Route>
                <Route
                  path="danh-sach-theo-thang"
                  element={<MonthlyPayroll />}
                ></Route>
                <Route path=":id" element={<TimekeepingMember />}></Route>
              </Route>
              <Route
                path="duyet-cham-cong"
                element={<SalaryApproval />}
              ></Route>
            </Route>
            <Route
              path="/yeu-cau-quyen-truy-cap"
              element={
                <AuthenticateGuard>
                  <Authentication />
                </AuthenticateGuard>
              }
            />
            <Route
              path="/Admin/Userwork/index.html"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </ScrollToTop>
      </AuthInit>
    </Provider>
  )
}

export default App
