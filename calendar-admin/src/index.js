import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App/App";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { SplashScreenProvider } from "./layout/_core/SplashScreen";
import * as _redux from "./redux/index";
import axiosClient from "./redux/axioClient";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

const { PUBLIC_URL } = process.env;

_redux.setupAxios(axiosClient, store);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SplashScreenProvider>
        <App store={store} basename={PUBLIC_URL} />
      </SplashScreenProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
