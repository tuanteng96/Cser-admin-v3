import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import "./_assets/plugins/keenthemes-icons/font/ki.css";
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import store from './redux/store';

const { PUBLIC_URL } = process.env;

ReactDOM.render(
  <React.StrictMode>
    <App store={store} basename={PUBLIC_URL}/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
