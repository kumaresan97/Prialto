import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import * as React from "react";
import styles from "./MainComponent.module.scss";
const Member = (props) => {
  // console.log(props.selectedMember);
  const tickIconStyle = {
    backgroundColor: "transparent",
    border: "transparent",
    color: "#007C81",
    height: 30,
    width: 30,
    fontSize: "30px",
  };
  const ShareMember = (val) => {
    props.handleMemberClick(val);
  };
  return (
    <div>
      <Button
        className={styles.righticon}
        style={tickIconStyle}
        icon="pi pi-arrow-left"
        onClick={() => {
          props.memberFunction(null, "CardView");
        }}
      />
      <div>
        {props.selectedTeamMember.length &&
          props.selectedTeamMember.map((val) => {
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "10px 0px",
                  cursor:'pointer',
                  borderBottom: "1px solid #d9d9d9",
                }}
                onClick={() => ShareMember(val.Email)}
              >
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <Avatar
                    image={`/_layouts/15/userphoto.aspx?size=S&username=${val.Email}`}
                    size="normal"
                    shape="circle"
                  />
                  <p>{val?.Name}</p>
                </div>
                <Button
                  onClick={() => ShareMember(val.Email)}
                  icon="pi pi-arrow-right"
                  rounded
                  className={styles.lefticon}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};
export default Member;
