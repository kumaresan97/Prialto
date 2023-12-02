import * as React from "react";
import { Card } from "primereact/card";
import { Label, Persona, PersonaSize } from "@fluentui/react";
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import { Badge } from "primereact/badge";
import { sp } from "@pnp/sp/presets/all";
import styles from "./Cardview.module.scss";
import { useEffect, useState } from "react";
import Members from "./Members";
import Loader from "./Loader";

const CardView = (props) => {
  const [Cardarr, setCardarr] = useState([]);
  const [loader, setLoader] = useState(false);
  const [selectedMember, setSelectedmembers] = useState([]);
  // const cardview = [
  //   {
  //     TeamName: "Albha",
  //     TeamCaptain: {
  //       EMail: "devaraj@chandrudemo.onmicrosoft.com",
  //       Title: "Deva",
  //     },
  //     TeamLeader: {
  //       EMail: "devaraj@chandrudemo.onmicrosoft.com",
  //       Title: "Deva",
  //     },
  //     Members: [
  //       { id: 1, Title: "Kumar" },
  //       { id: 1, Title: "Kumar" },
  //       { id: 1, Title: "Kumar" },
  //     ],
  //   },
  //   {
  //     TeamName: "Albha",
  //     TeamCaptain: {
  //       EMail: "devaraj@chandrudemo.onmicrosoft.com",
  //       Title: "Deva",
  //     },
  //     TeamLeader: {
  //       EMail: "devaraj@chandrudemo.onmicrosoft.com",
  //       Title: "Deva",
  //     },
  //     Members: [
  //       { id: 1, Title: "Kumar", EMail: "devaraj@chandrudemo.onmicrosoft.com" },
  //       { id: 1, Title: "Kumar", EMail: "devaraj@chandrudemo.onmicrosoft.com" },
  //       { id: 1, Title: "Kumar", EMail: "devaraj@chandrudemo.onmicrosoft.com" },
  //     ],
  //   },
  // ];

  const getchoice = () => {
    sp.web.lists
      .getByTitle("Configuration")
      .items.select(
        "*,Name/EMail,Name/Title ,Name/ID,TeamCaptain/EMail,TeamCaptain/Title,TeamCaptain/ID ,TeamLeader/EMail,TeamLeader/Title,TeamLeader/ID"
      )
      .expand("Name,TeamCaptain,TeamLeader")
      .top(5000)
      .get()
      .then((configArr) => {
        let uniqueTeams = [];
        let teamArr = [];

        configArr.forEach((config) => {
          if (
            uniqueTeams.findIndex((arr) => {
              return arr == config.Team;
            }) == -1
          ) {
            uniqueTeams.push(config.Team);
          }
        });
        uniqueTeams.forEach((team) => {
          let tempArr = configArr.filter((arr) => {
            return arr.Team == team;
          });
          let teamMembers = [];
          let TeamCaptain = [];
          let TeamLeader = [];

          tempArr.forEach((arr) => {
            if (arr.NameId) {
              teamMembers.push({
                Name: arr.Name?.Title,
                Email: arr.Name?.EMail,
                Id: arr.NameId,
              });
            }
            if (arr.TeamLeaderId) {
              TeamLeader.push({
                Title: arr.TeamLeader?.Title,
                Email: arr.TeamLeader?.EMail,
                Id: arr.TeamLeader?.ID,
              });
            }
            if (arr.TeamCaptainId) {
              TeamCaptain.push({
                Title: arr.TeamCaptain?.Title,
                Email: arr.TeamCaptain?.EMail,
                Id: arr.TeamCaptain?.ID,
              });
            }
          });
          teamArr.push({
            TeamName: team,
            TeamLeader: TeamLeader,
            TeamCaptain: TeamCaptain,

            members: teamMembers,
          });
        });

        setCardarr([...teamArr]);
        // setTeams([...teamArr]);

        // sp.web.lists
        //   .getByTitle("Configuration")
        //   .items //   .filter(`Role eq "TL" &&  TeamLeader eq ${curUser}`)
        //   .filter(`Name/EMail eq '${curUser}' `)
        //   .top(5000)
        //   .get()
        //   .then((TeamMemberresult) => {
        //     console.log(TeamMemberresult);
        //   })
        //   .catch((err123) => {
        //     console.log(err123);
        //   });
        // console.log(Teamresult);

        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        errFunction(err);
      });
  };
  const errFunction = (err) => {
    console.log(err);
  };
  const teamClick = (value, task) => {
    props.memberFunction(value, task);
    // setSelectedmembers(value ? [...value] : []);
  };
  useEffect(() => {
    setLoader(true);
    getchoice();
  }, []);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div>
          {/* {selectedMember.length > 0 ? (
            <Members
              selectedMember={selectedMember}
              memberFunction={memberFunction}
            />
          ) : ( */}
          <div>
            <h2>Team List</h2>
            <div
              className={styles.mainContainer}
              // style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: "10px" }}
            >
              {Cardarr.length &&
                Cardarr.map((val: any) => {
                  return (
                    <div className={styles.cardSize}>
                      <Card
                        style={{ width: "100%", cursor: "pointer" }}
                        onClick={() => {
                          teamClick(val.members, "TeamMembers");
                        }}
                      >
                        <>
                          <div className={styles.secDivider}>
                            <div className={styles.leftSideContainer}>
                              <Label className={styles.roleHead}>Team</Label>
                              <Label className={styles.noPaddingLable}>
                                {val.TeamName}
                              </Label>
                            </div>
                            <div className={styles.rightSideContainer}>
                              <Label className={styles.roleHead}>
                                Team Captain
                              </Label>
                              <div className={styles.teaCaptianSec}>
                                <Avatar
                                  image={`/_layouts/15/userphoto.aspx?size=S&username=${val.TeamCaptain[0].Email}`}
                                  size="normal"
                                  shape="circle"
                                  label={val.TeamCaptain[0].Title}
                                />
                                <Label
                                  className={styles.noPaddingLable}
                                  style={{ marginLeft: 6 }}
                                >
                                  {val.TeamCaptain[0].Title}
                                </Label>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              justifyContent: "space-between",
                            }}
                          >
                            <div className={styles.leftSideContainer}>
                              <Label className={styles.roleHead}>
                                Team Leader
                              </Label>
                              <div className={styles.teaCaptianSec}>
                                <Avatar
                                  image={`/_layouts/15/userphoto.aspx?size=S&username=${val.TeamLeader[0]?.Email}`}
                                  size="normal"
                                  shape="circle"
                                  label={val.TeamLeader[0]?.Title}
                                />
                                <Label
                                  className={styles.noPaddingLable}
                                  style={{ marginLeft: 6 }}
                                >
                                  {val.TeamLeader[0]?.Title}
                                </Label>
                              </div>
                            </div>
                            <div className={styles.rightSideContainer}>
                              <Label className={styles.roleHead}>
                                Team Members
                              </Label>
                              <div style={{ display: "flex" }}>
                                <AvatarGroup>
                                  {val.members.slice(0, 5).map((res) => {
                                    let test =
                                      "/_layouts/15/userphoto.aspx?size=S&username=" +
                                      res.Email;
                                    return (
                                      <Avatar
                                        image={test}
                                        size="normal"
                                        shape="circle"
                                      />
                                    );
                                  })}
                                  {val.members.length > 5 && (
                                    <Avatar
                                      size="normal"
                                      shape="circle"
                                      label={`+${val.members.length - 3} `}
                                    />
                                  )}
                                </AvatarGroup>
                              </div>
                            </div>
                          </div>
                        </>
                      </Card>
                    </div>
                  );
                })}
            </div>
          </div>
          {/* )} */}
        </div>
      )}
    </>
  );
};
export default CardView;
