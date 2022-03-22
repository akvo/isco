import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { CookiesProvider } from "react-cookie";
import "antd/dist/antd.min.css";
import "./index.scss"; // only to reset antd style
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const history = createBrowserHistory();

ReactDOM.render(
  <CookiesProvider>
    <Router history={history}>
      <App />
    </Router>
  </CookiesProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
