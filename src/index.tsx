import "index.css";
import reportWebVitals from "reportWebVitals";

import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Routes, Route } from "react-router-dom";
import Frame from "components/Frame";

import LauncherUpdater from "screens/LauncherUpdater";

declare global {
  interface Window {
    ipc: {
      send: (channel: string, data?: any) => void;
      sendSync: (channel: string, data?: any) => any;
      receive: (channel: string, func: (...datas: any) => void) => void;
    };
  }
}

ReactDOM.render(
  <React.StrictMode>
    <div
      id="main"
      style={{
        backgroundImage: `url("${process.env.PUBLIC_URL}/assets/images/background.png")`,
      }}
    >
      <Frame />
      <HashRouter>
        <Routes>
          <Route path="/" element={LauncherUpdater} />
        </Routes>
      </HashRouter>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);
/*
          <Route path="/auth" element={Auth} />
          <Route path="/launcher" element={Launcher} />
          <Route path="/updater" element={Updater} />
          <Route path="/settings" element={Settings} />
*/

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
