import * as React from "react";
import { useState, useEffect } from "react";
import "./style.css";
import { sp } from "@pnp/sp/presets/all";

import {
  Nav,
  INavLink,
  INavStyles,
  INavLinkGroup,
} from "@fluentui/react/lib/Nav";

import Mytasks from "./Mytasks";
// import styles from "./TaskManagement.module.scss";
import styles from "./MainComponent.module.scss";
import { DefaultButton, Icon, Label } from "@fluentui/react";
import Tasks from "./Tasks";
import CardView from "./CardView";
import OrgChart from "./OrgChart";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import Sample from "./Sample";

let admin: any[] = [];
let TL: any[] = [];
let TC: any[] = [];
let TA: any[] = [];

const MainComponent = (props) => {
  const [params, setParams] = useState({
    admin: false,
    currentUser: "",
  });
  const [value, setvalue] = useState("mytasks");
  const [selectedMember, setselectedMember] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const navStyles: Partial<INavStyles> = {
    root: {
      width: 208,
      height: 350,
      boxSizing: "border-box",
      border: "1px solid #eee",
      overflowY: "auto",
      backgroundColor: "#4ea0b5",
    },
  };
  const _curUser: string = props.context._pageContext._user.email;
  const getAdmin = () => {
    const users = sp.web.siteGroups
      .getById(10)
      .users()
      .then((Response) => {
        console.log(Response);
        admin = [];
        Response.forEach((val) => {
          admin.push(val.Email);
        });
        let x = admin.some((val) => val == _curUser);
        if (x) {
          setParams({ ...params, admin: x });
        } else {
          setParams({ ...params, admin: false });
        }

        getchoice();
        console.log(x, "x");
      });
  };
  const Teams = [
    {
      name: "Team A",
      members: ["arul", "Kumar", "Raj"],
    },
    {
      name: "Team B",
      members: ["arul", "Kumar", "Raj"],
    },
  ];
  const toggleTeam = (index) => {
    setExpandedTeam((prev) => (prev === index ? null : index));
  };
  const handleMemberClick = (member) => {
    setvalue("member");
    setselectedMember(member);
  };
  const getchoice = () => {
    sp.web.lists
      .getByTitle("Configuration")
      .items.select(
        "*,Name/EMail,Name/Title ,TeamCaptain/EMail,TeamCaptain/Title"
      )
      .expand("Name,TeamCaptain")
      .top(5000)
      .get()
      .then((configArr) => {
        console.log(configArr, "config");

        let uniqueTeams = [];
        let teamArr = [];
        TL = [];
        TC = [];
        TA = [];

        configArr.forEach((config) => {
          console.log(config, "config1");
          if (config.Role == "TL") {
            TL.push(config.Name.EMail);
          }
          if (config.Role == "TC") {
            TC.push(config.Name.EMail);
          }
          if (config.Role == "PA") {
            TA.push(config.Name.EMail);
          }
          console.log(TL, "TL");
          console.log(TC, "TC");
          console.log(TA, "TA");

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
          tempArr.forEach((arr) => {
            console.log(arr, "arr");

            if (arr.NameId) {
              teamMembers.push({
                Name: arr.Name.Title,
                Email: arr.Name.EMail,
                Id: arr.NameId,
              });
            }
          });
          teamArr.push({
            team: team,
            members: teamMembers,
          });
        });
        setTeams([...teamArr]);
        console.log(teamArr);

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
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getAdmin();
  }, []);
  return (
    <div className={styles.TaskManagementSection}>
      <div className={styles.leftNav}>
        <div>
          <Label
            onClick={(e) => {
              console.log(e, "e");
              setvalue("mytasks");
            }}
            className={value == "mytasks" ? styles.activeBtn : styles.inActive}
            styles={{
              root: {
                width: "100%",
                fontSize: " 16px !important",
                fontWeight: "600 !important",

                color: "#FFFFFF !important",
                padding: "10px 0px 10px 20px !important",
                cursor: "pointer !important",
                // background:
                //   value == "mytasks" ? "#576191 !important" : "none !important",
              },
            }}
          >
            My Tasks
          </Label>
          {teams.map((val, i) => {
            return (
              <div>
                <div
                  className={styles.accordTeam}
                  onClick={() => toggleTeam(i)}
                >
                  <Icon
                    iconName={
                      expandedTeam === i
                        ? "ChevronDownSmall"
                        : "ChevronRightSmall"
                    }
                    // onClick={() => toggleTeam(i)}
                    styles={{
                      root: {
                        cursor: "pointer !important",
                        fontSize: " 16px !important",
                        fontWeight: "400 !important",
                        color: "#FFFFFF !important",
                      },
                    }}
                  />
                  <Label
                    styles={{
                      root: {
                        width: "100%",
                        fontSize: " 16px !important",
                        fontWeight: "400 !important",
                        color: "#FFFFFF !important",
                        cursor: "pointer !important",
                      },
                    }}
                    // className={
                    //   value == "OrgChart" ? styles.activeBtn : styles.inActive
                    // }
                  >
                    {val.team}
                  </Label>
                </div>

                {expandedTeam === i && (
                  <ul style={{ margin: 0 }}>
                    {val.members.map((member, index) => (
                      <li
                        className={styles.accordTeamMembers}
                        // className={
                        //   value == "member" ? styles.activeBtn : styles.inActive
                        // }
                        key={index}
                        onClick={() => {
                          handleMemberClick(member.Name);
                        }}
                      >
                        {member.Name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {params.admin && (
            <>
              <Label
                onClick={() => setvalue("CardView")}
                styles={{
                  root: {
                    width: "100%",
                    fontSize: " 16px !important",
                    fontWeight: "400 !important",

                    color: "#FFFFFF !important",

                    padding: "10px 0px 10px 20px !important",
                    cursor: "pointer !important",
                  },
                }}
                className={
                  value == "CardView" ? styles.activeBtn : styles.inActive
                }
              >
                Card View
              </Label>
              <Label
                onClick={() => setvalue("OrgChart")}
                styles={{
                  root: {
                    width: "100%",
                    fontSize: " 16px !important",
                    fontWeight: "400 !important",

                    color: "#FFFFFF !important",

                    padding: "10px 0px 10px 20px !important",
                    cursor: "pointer !important",
                  },
                }}
                className={
                  value == "OrgChart" ? styles.activeBtn : styles.inActive
                }
              >
                Org Chart
              </Label>
            </>
          )}
        </div>
      </div>

      <div style={{ width: "80%", padding: "12px 35px 0px 0px" }}>
        {value == "mytasks" ? (
          <>
            {/* <Mytasks /> */}
            <Sample context={props.context} />
          </>
        ) : value == "member" ? (
          <Tasks selectedMember={selectedMember} />
        ) : value == "CardView" ? (
          <CardView></CardView>
        ) : value == "OrgChart" ? (
          <OrgChart></OrgChart>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
export default MainComponent;
