import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import "./index.scss";
import "./_assets/plugins/keenthemes-icons/font/ki.css";
import * as _redux from "./redux";
import axiosClient from "./redux/axioClient";
import { EzsSplashScreenProvider } from "./layout/_core/EzsSplashScreen";
import store, { persistor } from "./redux/store";
import reportWebVitals from "./reportWebVitals";

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { PUBLIC_URL } = process.env;

_redux.setupAxios(axiosClient, store);

ReactDOM.render(
  <React.StrictMode>
    <EzsSplashScreenProvider>
      <App store={store} persistor={persistor} basename={PUBLIC_URL} />
    </EzsSplashScreenProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
