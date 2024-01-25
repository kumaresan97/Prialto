import React, { memo } from "react";
import { Sidebar } from "primereact/sidebar";
import classes from "./SidePanel.module.scss";
const SidePanel = ({ visible, position, onHide, children, panelHeading }) => {
  return (
    <div className={classes.sidePanelWrapper}>
      <Sidebar
        visible={visible}
        position={position}
        onHide={onHide}
        className={classes.sidePanel}
        header={panelHeading}
      >
        {children}
      </Sidebar>
    </div>
  );
};

export default memo(SidePanel);
