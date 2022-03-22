import { Component } from "react";
import "css/Frame.css";

class Frame extends Component {
  handleClose = () => {
    window.ipc.send("close-app");
  };
  handleMinimize = () => {
    window.ipc.send("minimize-app");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  handleMaximize = () => {
    window.ipc.send("maximize-app");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  render() {
    const platformName: string = window.ipc.sendSync("get-platform-name");
    return (
      <div id="frame-bar">
        <div id="frame-top" className="frame-drag"></div>
        <div id="frame-content">
          <div className="vert-frame frame-drag"></div>
          {platformName === "darwin" && (
            <div id="frame-content-darwin">
              <div id="frame-buttons-darwin">
                <button
                  className="frame-button-darwin"
                  id="frame-button-darwin_close"
                  onClick={this.handleClose}
                  tabIndex={-1}
                ></button>
                <button
                  className="frame-button-darwin"
                  id="frame-button-darwin_minimize"
                  onClick={this.handleMinimize}
                  tabIndex={-1}
                ></button>
                <button
                  className="frame-button-darwin"
                  id="frame-button-darwin_restoredown"
                  onClick={this.handleMaximize}
                  tabIndex={-1}
                ></button>
              </div>
            </div>
          )}
          {platformName !== "darwin" && (
            <div id="frame-content-windows">
              <div id="frame-title-dock">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/logo.png`}
                  alt="logo"
                />
                <span id="frame-title">
                  {window.ipc.sendSync("get-launcher-name")}
                </span>
              </div>
              <div id="frame-buttons-windows">
                <button
                  className="frame-button"
                  id="frame-button_minimize"
                  onClick={this.handleMinimize}
                  tabIndex={-1}
                >
                  <svg
                    name="title-bar-minimize"
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                  >
                    <rect
                      stroke="#ffffff"
                      fill="#ffffff"
                      width="10"
                      height="1"
                      x="1"
                      y="6"
                    ></rect>
                  </svg>
                </button>
                <button
                  className="frame-button"
                  id="frame-button_restoredown"
                  onClick={this.handleMaximize}
                  tabIndex={-1}
                >
                  <svg
                    name="title-bar-maximize"
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                  >
                    <rect
                      width="9"
                      height="9"
                      x="1.5"
                      y="1.5"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.4px"
                    ></rect>
                  </svg>
                </button>
                <button
                  className="frame-button"
                  id="frame-button_close"
                  onClick={this.handleClose}
                  tabIndex={-1}
                >
                  <svg
                    name="title-bar-close"
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                  >
                    <polygon
                      stroke="#ffffff"
                      fill="#ffffff"
                      fillRule="evenodd"
                      points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
                    ></polygon>
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="vert-frame frame-drag"></div>
        </div>
      </div>
    );
  }
}

export default Frame;
