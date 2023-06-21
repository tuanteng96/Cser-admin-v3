import React from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import AuthInit from "../features/Auth/_redux/AuthInit";
import { LayoutSplashScreen } from "../layout/_core/EzsSplashScreen";
import RoutesPage from "./RoutesPage";

function App({ store, persistor, basename }) {
  return (
    /* Provide Redux store */
    <Provider store={store}>
      <PersistGate loading={<LayoutSplashScreen />} persistor={persistor}>
        <BrowserRouter basename={basename}>
          <AuthInit>
            <RoutesPage />
          </AuthInit>
          <ToastContainer />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
