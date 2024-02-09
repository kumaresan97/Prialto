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
    width: "100%",
    fontSize: "30px",
    display: "contents",
    padding: 0,
  };
  const ShareMember = (val) => {
    props.handleMemberClick(
      val,
      props.selectedTeamMember[0]?.TeamName,
      props.selectedTeamMember,
      true
    );
  };
  return (
    <div>
      <Button
        className={styles.righticon}
        // style={tickIconStyle}
        label={
          props.selectedTeamMember?.length
            ? props.selectedTeamMember[0]?.TeamName
            : ""
        }
        icon="pi pi-arrow-left"
        iconPos="left"
        onClick={() => {
          props.memberFunction(null, "CardView");
        }}
      />
      <div className={styles.TeamMembers}>
        {props.selectedTeamMember?.length &&
          props.selectedTeamMember[0]?.members.map((val) => {
            return (
              <div
                className={styles.memberCard}
                onClick={() => {
                  ShareMember(val.Email);
                }}
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
                  icon="pi pi-angle-right"
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
