import React, { Suspense, lazy, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import AuthInit from "./modules/Auth/_redux/AuthInit";
import TopBarProgress from "react-topbar-progress-indicator";
import { createPortal } from "react-dom";
import { Navigate, Route, Routes } from "react-router-dom";

const BookingPage = lazy(() => import("./modules/Booking/BookingPage"));
const CalendarMassagePage = lazy(() =>
  import("./modules/Calendar/CalendarMassagePage")
);
const CalendarPage = lazy(() => import("./modules/Calendar/CalendarPage"));
const CheckInPage = lazy(() => import("./modules/Checkin/CheckInPage"));

export const AppContext = React.createContext();

const getParamsURL = (name) => {
  const URL_STRING = window.location.href;
  var URL_NEW = new URL(URL_STRING);
  return URL_NEW.searchParams.get(name);
};

const SuspensedView = ({ children }) => {
  TopBarProgress.config({
    barColors: {
      0: "#3699ff",
    },
    barThickness: 1,
    shadowBlur: 5,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

function App({ store, basename }) {
  const [NameCurrent, setNameCurrent] = useState("");
  const [isTelesales, setIsTelesales] = useState(false);
  useEffect(() => {
    var IsPop = getParamsURL("ispop");
    var IsCheckin = getParamsURL("ischeckin");
    if (IsPop) {
      setNameCurrent("POPUP");
    }
    if (IsCheckin) {
      setNameCurrent("CHECKIN");
      window.top &&
        window.top.SideBarCheckInReady &&
        window.top.SideBarCheckInReady();
    }
  }, []);

  useEffect(() => {
    const telesales = getParamsURL("isTelesales");
    setIsTelesales(telesales || false);
  }, []);

  return (
    <Provider store={store}>
      <AppContext.Provider
        value={{
          isTelesales,
        }}
      >
        <AuthInit>
          <Routes>
            <Route path="/">
              {!NameCurrent && (
                <>
                  <Route
                    index
                    element={
                      <SuspensedView>
                        <CalendarPage />
                      </SuspensedView>
                    }
                  />
                  <Route
                    path="massage"
                    element={
                      <SuspensedView>
                        <CalendarMassagePage />
                      </SuspensedView>
                    }
                  ></Route>
                </>
              )}
              {NameCurrent === "POPUP" && (
                <Route
                  index
                  element={
                    <SuspensedView>
                      <BookingPage />
                    </SuspensedView>
                  }
                />
              )}
              {NameCurrent === "CHECKIN" && (
                <Route
                  index
                  element={
                    <SuspensedView>
                      <CheckInPage />
                    </SuspensedView>
                  }
                />
              )}
            </Route>
            <Route
              path="/admin/bookadmin/index.html"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </AuthInit>
      </AppContext.Provider>
      {createPortal(<ToastContainer />, document.body)}
    </Provider>
  );
}

export default App;
