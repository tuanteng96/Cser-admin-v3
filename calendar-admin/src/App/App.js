import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import AuthInit from "./modules/Auth/_redux/AuthInit";
import BookingPage from "./modules/Booking/BookingPage";
import CalendarPage from "./modules/Calendar/CalendarPage";
import CheckInPage from "./modules/Checkin/CheckInPage";

export const AppContext = React.createContext();

const getParamsURL = (name) => {
  const URL_STRING = window.location.href;
  var URL_NEW = new URL(URL_STRING);
  return URL_NEW.searchParams.get(name);
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
        {!NameCurrent && (
          <AuthInit>
            <CalendarPage />
          </AuthInit>
        )}
        {NameCurrent === "POPUP" && (
          <AuthInit>
            <BookingPage />
          </AuthInit>
        )}
        {NameCurrent === "CHECKIN" && (
          <AuthInit>
            <CheckInPage />
          </AuthInit>
        )}
        <ToastContainer />
      </AppContext.Provider>
    </Provider>
  );
}

export default App;
