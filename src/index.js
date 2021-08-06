import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import Frame from "./components/Frame"
import Auth from "./components/Auth"
import Launcher from "./components/Launcher"


ReactDOM.render(
  <React.StrictMode>
    <div id="main" style={{ backgroundImage: `url("${process.env.PUBLIC_URL}/assets/images/background.png")` }}>
      <Frame />
      <Router>
        <Switch>
          <Route path="/" exact component={Auth} />
          <Route path="/launcher" exact component={Launcher} />
        </Switch>
      </Router>
    </div>

  </React.StrictMode>,
  document.getElementById("root")
)


