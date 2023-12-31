import * as React from "react";
import "./Loader.css";
const Loader = () => {
  return (
    <div className="loaderBox">
      {/* <div className="lds-hourglass"></div> */}
      <div className="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Loader;
