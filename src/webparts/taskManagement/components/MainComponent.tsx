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
import UserMyTasksDB from "./UserMyTasksDB";
import UserDashboard from "./UserDashboard";
import MyTaskDBNew from "./MyTaskDBNew";
import UserClient from "./UserClient";
import Client from "./Client";
import Loader from "./Loader";
import Member from "./Members";

// Global Variables creation
let _masterArray: any[] = [];
let _curUserDetailsArray: any[] = [];
let uniqueTeams: any[] = [];
let teamArr: any[] = [];
let userTeams: any[] = [];
let _formattedData: any[] = [];
let _curArray: any[] = [];
let _isAdmin: boolean = false;
let _isTL: boolean = false;
let _isTC: boolean = false;
let _isPA: boolean = false;
let admin: any[] = [];
let TL: any[] = [];
let TC: any[] = [];
let TA: any[] = [];

const MainComponent = (props: any): JSX.Element => {
  // Local Variables creation
  const _curUser: string = props.context._pageContext._user.email;
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

  // State creation
  const [params, setParams] = useState({
    admin: false,
    currentUser: "",
    TL: false,
    TC: false,
    PA: false,
  });
  const [value, setvalue] = useState("mytasks");
  const [selectedMember, setselectedMember] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState([]);

  // Styles creation
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

  // Functions creation
  const _getErrorFunction = (err: any): void => {
    console.log("Error Message : ", err);
  };

  const _getPrialtoAdmin = (): void => {
    sp.web.siteGroups
      .getByName("AdminGroup")
      .users.get()
      .then((res: any) => {
        _isAdmin = res.some(
          (val: any) => val.Email.toLowerCase() === _curUser.toLowerCase()
        );

        _getConfigurationDatas();
      })
      .catch((err: any) => {
        _getErrorFunction("Admin group users get issue.");
      });
  };

  const _getConfigurationDatas = (): void => {
    sp.web.lists
      .getByTitle("Configuration")
      .items.select(
        // "*,Name/EMail,Name/Title,TeamCaptain/EMail,TeamCaptain/Title"

        "*,Name/ID,Name/EMail,Name/Title, Manager/ID, Manager/EMail, Manager/Title, BackingUp/ID, BackingUp/EMail, BackingUp/Title, TeamLeader/ID, TeamLeader/EMail, TeamLeader/Title, TeamCaptain/ID, TeamCaptain/EMail, TeamCaptain/Title,DirectReports/ID, DirectReports/EMail, DirectReports/Title"
      )
      // .expand("Name,TeamCaptain")
      .expand("Name,Manager,TeamCaptain,TeamLeader,DirectReports,BackingUp")
      .top(5000)
      .get()
      .then((res: any) => {
        _masterArray = res;
        _curUserDetailsArray = res.filter(
          (data: any) =>
            data.NameId &&
            data.Name.EMail.toLowerCase() === _curUser.toLowerCase()
        );

        _masterArray.length
          ? _isAdmin
            ? _prepareFilteredData()
            : _curUserDetail()
          : setTeams([]);
      })
      .catch((err: any) => {
        _getErrorFunction("Configuration List Nave Details get issue.");
      });
  };

  const _curUserDetail = (): void => {
    _isTL = false;
    _isTC = false;
    _isPA = false;

    _curUserDetailsArray.length
      ? _curUserDetailsArray.forEach((val: any) => {
          if (val.Role === "TL") {
            _isTL = true;
          } else if (val.Role === "TC") {
            _isTC = true;
          } else if (val.Role === "PA") {
            _isPA = true;
          }
        })
      : (_isPA = true);

    _prepareFilteredData();
  };

  const _prepareFilteredData = (): void => {
    let _TLArray: any[] = [];
    let _TCArray: any[] = [];
    let _PAArray: any[] = [];
    _curArray = [];
    uniqueTeams = [];
    teamArr = [];
    userTeams = [];

    if (_isAdmin) {
      _masterArray.forEach((val: any) => {
        if (!uniqueTeams.includes(val.Team)) {
          uniqueTeams.push(val.Team);
        }
      });
    } else {
      _curUserDetailsArray.forEach((val: any) => {
        if (!uniqueTeams.includes(val.Team)) {
          uniqueTeams.push(val.Team);
        }
      });
    }

    teamArr =
      _masterArray.length &&
      _masterArray.filter((val: any) => uniqueTeams.includes(val.Team));

    if (_isAdmin) {
      userTeams = teamArr;
    } else {
      if (_isTL) {
        _TLArray = teamArr.filter((team) => team.Role === "TL");
      }
      if (_isTC) {
        _TCArray = teamArr.filter((team) => team.Role === "TC");
      }
      if (_isPA) {
        _PAArray = teamArr.filter((team) => team.Role === "PA");
      }

      userTeams = [..._TLArray, ..._TCArray, ..._PAArray];
    }

    _curArray = userTeams.map((data: any) => ({
      team: data.Team,
      members: [
        {
          Name: data.Name?.Title,
          Email: data.Name?.EMail,
          Id: data.NameId,
        },
      ],
    }));

    _prepareNaveData();
  };

  const _prepareNaveData = (): void => {
    let _curMembers: any[] = [];
    _formattedData = [];

    for (let i: number = 0; uniqueTeams.length > i; i++) {
      _curMembers = [];

      for (let j: number = 0; _curArray.length > j; j++) {
        if (uniqueTeams[i] === _curArray[j].team) {
          _curMembers.push(..._curArray[j].members);
        }

        if (_curArray.length === j + 1) {
          _formattedData.push({
            team: uniqueTeams[i],
            members: [..._curMembers],
          });
        }
      }
    }

    setTeams([..._formattedData]);
  };

  const toggleTeam = (index) => {
    setExpandedTeam((prev) => (prev === index ? null : index));
  };

  const handleMemberClick = (member) => {
    setvalue("member");
    setselectedMember(member);
  };

  const memberFunction = (value, taskname) => {
    setvalue(taskname ? taskname : "");
    setSelectedTeamMember(value ? [...value] : []);
  };

  useEffect(() => {
    _getPrialtoAdmin();
  }, []);

  return (
    <div className={styles.TaskManagementSection}>
      <div className={styles.leftNav}>
        <div>
          <Label
            onClick={(e) => {
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
                  <ul style={{ margin: 0, padding: 0 }}>
                    {val.members.map((member, index) => (
                      <li
                        // className={styles.accordTeamMembers}
                        style={{
                          padding: "10px 0px",
                          cursor: "pointer",
                          listStyle: "none",
                          fontSize: "14px",
                          color: "#fff",
                          width: "100%",
                        }}
                        className={
                          value == "member" && selectedMember === member.Email
                            ? styles.activeBtn
                            : styles.inActive
                        }
                      >
                        <div
                          key={index}
                          onClick={() => {
                            handleMemberClick(member.Email);
                          }}
                          style={{ height: "100%", marginLeft: "51px" }}
                          // className={styles.accordMember}
                        >
                          {member.Name}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {true && (
            <>
              {_isAdmin && (
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
              )}
              {(_isAdmin || _isTL) && (
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
              )}
              {(_isAdmin || _isTC || _isTL) && (
                <Label
                  onClick={() => setvalue("Client")}
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
                    value == "Client" ? styles.activeBtn : styles.inActive
                  }
                >
                  Client
                </Label>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ width: "80%", padding: "12px 35px 0px 0px" }}>
        {value == "mytasks" ? (
          <>
            <MyTaskDBNew context={props.context} />
          </>
        ) : value == "member" ? (
          // <UserClient
          //   selectedMember={selectedMember}
          //   context={props.context}
          //   Email={selectedMember}
          // />
          <UserDashboard
            selectedMember={selectedMember}
            context={props.context}
            Email={selectedMember}
          />
        ) : value == "CardView" ? (
          <CardView
            context={props.context}
            memberFunction={memberFunction}
          ></CardView>
        ) : value == "OrgChart" ? (
          <OrgChart context={props.context}></OrgChart>
        ) : value == "Client" ? (
          <Client context={props.context}></Client>
        ) : value == "TeamMembers" && selectedTeamMember.length ? (
          <Member
            context={props.context}
            handleMemberClick={handleMemberClick}
            selectedTeamMember={selectedTeamMember}
            memberFunction={memberFunction}
          ></Member>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
export default MainComponent;
