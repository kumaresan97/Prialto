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
import OrgChartNew from "./OrgChartNew";
import MyTaskDBNewCategory from "./MyTaskDBNewCategory";
import {
  IPersonaSharedProps,
  Persona,
  PersonaSize,
  PersonaPresence,
} from "@fluentui/react/lib/Persona";
import CompleteDashboard from "./CompleteDashboard";
import { InputText } from "primereact/inputtext";

// Interfaces
interface ISuggestion {
  id: number;
  name: string;
  email: string;
}

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
let suggestions: ISuggestion[] = [];

const MainComponent = (props: any): JSX.Element => {
  // Local Variables creation

  const Sitename = window.location.href;
  let path = Sitename.split("/")[4];

  const _curUser: string = props.context._pageContext._user.email;
  // const _curUser: string = "ka@prialto.com";

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

  const [Completeuser, setCompleteUser] = useState("");
  const [module, setModule] = useState("");
  const [navsearch, setnavsearch] = useState("");

  const [params, setParams] = useState({
    admin: false,
    currentUser: "",
    TL: false,
    TC: false,
    PA: false,
  });
  const [value, setvalue] = useState("mytasks");
  const [selectedMember, setselectedMember] = useState(null);
  const [viewByCardFlow, setviewByCardFlow] = useState(false);
  const [selectedTeamByCardFlow, setSelectedTeamByCardFlow] = useState(false);

  const [expandedTeam, setExpandedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [masterTeam, setMasterTeam] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState([]);
  const [menuExpand, setMenuExpand] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any[]>([]);
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
        suggestions = [];

        _isAdmin = res.some(
          (val: any) => val.Email.toLowerCase() === _curUser.toLowerCase()
        );

        res?.forEach((e: any) => {
          suggestions.push({
            id: e?.Id,
            name: e?.Title,
            email: e?.Email,
          });
        });
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
        "*, Name/ID, Name/EMail, Name/Title, Manager/ID, Manager/EMail, Manager/Title, BackingUp/ID, BackingUp/EMail, BackingUp/Title, TeamLeader/ID, TeamLeader/EMail, TeamLeader/Title, TeamCaptain/ID, TeamCaptain/EMail, TeamCaptain/Title, DirectReports/ID, DirectReports/EMail, DirectReports/Title"
      )
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

  const compare = (a: any, b: any) => {
    if (a.Team < b.Team) {
      return -1;
    }
    if (a.Team > b.Team) {
      return 1;
    }
    return 0;
  };

  const _prepareFilteredData = (): void => {
    let _PAArray: any[] = [];
    _curArray = [];
    uniqueTeams = [];
    teamArr = [];
    userTeams = [];

    if (_isAdmin) {
      if (_masterArray.length) {
        _masterArray.forEach((val: any, i: number) => {
          if (val.Team.length) {
            val.Team.forEach((data: string, j: number) => {
              if (i === 0 && j === 0) {
                uniqueTeams.push({ Team: data, Role: "" });
              } else {
                if (!uniqueTeams.map((obj2: any) => obj2.Team).includes(data)) {
                  uniqueTeams.push({ Team: data, Role: "" });
                }
              }
            });
          }
        });
      }
    } else {
      if (_curUserDetailsArray.length) {
        _curUserDetailsArray.forEach((val: any, i: number) => {
          if (val.Team.length) {
            val.Team.forEach((data: string, j: number) => {
              if (i === 0 && j === 0) {
                uniqueTeams.push({ Team: data, Role: val.Role });
              } else {
                if (!uniqueTeams.map((obj2: any) => obj2.Team).includes(data)) {
                  uniqueTeams.push({ Team: data, Role: val.Role });
                }
              }
            });
          }
        });
      }
    }

    uniqueTeams.sort(compare);
    if (_isAdmin || (uniqueTeams.length && (_isTL || _isTC))) {
      userTeams = _masterArray;
    } else if (_isPA) {
      _PAArray = _curUserDetailsArray.filter((team) => team.Role === "PA");
      userTeams = [..._PAArray];
    }

    _curArray = userTeams.map((data: any) => ({
      team: data.Team,
      members: [
        {
          Role: data?.Role,
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

    if (uniqueTeams.length) {
      for (let i: number = 0; uniqueTeams.length > i; i++) {
        _curMembers = [];

        for (let j: number = 0; _curArray.length > j; j++) {
          if (_curArray[j].team.length) {
            for (let k: number = 0; _curArray[j].team.length > k; k++) {
              if (uniqueTeams[i].Team === _curArray[j].team[k]) {
                delete _curArray[j].members[0].Role;
                _curMembers.push(..._curArray[j].members);
              }

              if (
                _curArray.length === j + 1 &&
                _curArray[j].team.length === k + 1
              ) {
                _formattedData.push({
                  team: uniqueTeams[i].Team,
                  members: [..._curMembers],
                });
              }
            }
          }
        }
      }
    }

    setTeams([..._formattedData]);
    setMasterTeam([..._formattedData]);
  };

  const toggleTeam = (index) => {
    setExpandedTeam((prev) => (prev === index ? null : index));
  };
  const handleMemberClick = (
    member,
    _selTeam: string,
    selectedTeamData?: any,
    ViewByCardFlow?: any
  ) => {
    let _overAllTeams: any[] = [...teams];
    let uniqueSet = new Set<string>();
    let uniqueArray = [];

    _overAllTeams = _overAllTeams?.filter(
      (data: any) => data.team === _selTeam
    )[0].members;

    _overAllTeams?.forEach((user: any) => {
      suggestions.push({
        id: user?.Id,
        name: user?.Name,
        email: user?.Email,
      });
    });

    suggestions?.forEach((item: any) => {
      if (!uniqueSet.has(item["id"])) {
        uniqueSet.add(item["id"]);
        uniqueArray.push({ ...item });
      }
    });

    setSelectedTeam([...uniqueArray]);
    setvalue("member");
    setselectedMember(member);
    setviewByCardFlow(ViewByCardFlow);
    setSelectedTeamByCardFlow(selectedTeamData);
  };
  const HandleCompleted = (Status, value, Module) => {
    setvalue(Status);
    setCompleteUser(value);
    setModule(Module);
  };
  function HandleBackBtn() {
    setvalue(module);
  }

  const memberFunction = (value, taskname) => {
    setvalue(taskname ? taskname : "");
    setSelectedTeamMember(value.members.length ? [{ ...value }] : []);
    // setSelectedTeamMember(value ? [...value] : []);
  };
  // const searchFilter = (val) => {
  //   setnavsearch(val);

  //   const results = masterTeam.filter((team) => {
  //     const teamMatch = team.team.toLowerCase().includes(val.toLowerCase());
  //     const memberMatch = team.members.some((member) =>
  //       member.Name.toLowerCase().includes(val.toLowerCase())
  //     );
  //     return teamMatch || memberMatch;
  //   });

  //   setTeams(results);
  //   // setTeams([...results]);
  // };

  useEffect(() => {
    _getPrialtoAdmin();
  }, []);

  // useEffect for handle the view of default MS gear(Settings) icon in the page by its role.
  useEffect(() => {
    let gearIcons = document.getElementById("O365_MainLink_Settings_container");

    if (_isAdmin) {
      gearIcons.classList.add("addGearIcon");
      gearIcons.classList.remove("removeGearIcon");
    } else if (_isTL || _isTC || _isPA) {
      gearIcons.classList.remove("addGearIcon");
      gearIcons.classList.add("removeGearIcon");
    }
  }, [_isAdmin, _isTL, _isTC, _isPA]);

  return (
    <>
      <h1 className={styles.pageHeader}>Member Task Tracker</h1>
      <div className={styles.TaskManagementSection}>
        <div
          className={styles.leftNav}
          style={{
            transition: `all 0.2s`,
            width: `${menuExpand ? "260px" : "92px"}`,
          }}
        >
          <div
            className={styles.iconsearchcontainer}
            // style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <div className={styles.leftNavExpandController}>
              <i
                title={menuExpand ? "Collapse" : "Expand"}
                className="pi pi-bars"
                style={{ fontSize: "1.25rem", color: "#fff" }}
                onClick={() => {
                  setMenuExpand(!menuExpand);
                }}
              ></i>
            </div>
            {menuExpand && (
              <div className={styles.rightNavSearch}>
                <Label
                  style={{
                    width: "100%",
                    color: "#ffff",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {/* Member Task Tracker */}
                </Label>
                {/* <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  placeholder="Search"
                  value={navsearch}
                  onChange={(e: any) => searchFilter(e.target.value)}
                />
              </span> */}
              </div>
            )}
          </div>
          <div>
            <Label
              onClick={(e) => {
                setvalue("mytasks");
              }}
              className={
                value == "mytasks" ? styles.activeBtn : styles.inActive
              }
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
              styles={{
                root: {
                  width: "100%",
                  fontSize: " 16px",
                  color: "#FFFFFF",
                  padding: "10px 20px",
                  cursor: "pointer",
                  // background:
                  //   value == "mytasks" ? "#576191 !important" : "none !important",
                },
              }}
            >
              {menuExpand ? "My Tasks" : ""}
              <i
                className="pi pi-file-edit"
                style={{ fontSize: "1.25rem" }}
              ></i>
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
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
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
                      {menuExpand ? val.team : ""}
                      <p title={`${val.team}`} className={styles.teamNameShort}>
                        {" "}
                        {!menuExpand ? val.team.split("-")[0] : ""}
                      </p>
                      {/* <i
                      title={val.team}
                      className="pi pi-star-fill"
                      style={{ fontSize: "1.25rem" }}
                    ></i> */}
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
                              handleMemberClick(member.Email, val.team);
                            }}
                            className={styles.teamMemberSection}
                          >
                            {menuExpand ? member.Name : ""}
                            <Persona
                              title={member.Name}
                              imageUrl={
                                "/_layouts/15/userphoto.aspx?username=" +
                                member.Email
                              }
                              size={PersonaSize.size24}
                            />
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
                {/* Card View */}
                {_isAdmin && (
                  <Label
                    onClick={() => setvalue("CardView")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    styles={{
                      root: {
                        width: "100%",
                        fontSize: " 16px !important",
                        fontWeight: "400 !important",
                        color: "#FFFFFF !important",
                        padding: "6px 20px !important",
                        cursor: "pointer !important",
                      },
                    }}
                    className={
                      value == "CardView" ? styles.activeBtn : styles.inActive
                    }
                  >
                    {menuExpand ? "Card View" : ""}
                    <i
                      className="pi pi-id-card"
                      style={{ fontSize: "1.25rem" }}
                    ></i>
                  </Label>
                )}
                {/* Org Chart */}
                {(_isAdmin || _isTL || _isTC) && (
                  <Label
                    onClick={() => setvalue("OrgChart")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    styles={{
                      root: {
                        width: "100%",
                        fontSize: " 16px !important",
                        fontWeight: "400 !important",

                        color: "#FFFFFF !important",

                        padding: "6px 20px !important",
                        cursor: "pointer !important",
                      },
                    }}
                    className={
                      value == "OrgChart" ? styles.activeBtn : styles.inActive
                    }
                  >
                    {menuExpand ? "Organization Chart" : ""}
                    <i
                      className="pi pi-sitemap"
                      style={{ fontSize: "1.25rem" }}
                    ></i>
                  </Label>
                )}
                {/* Client List */}
                {(_isAdmin || _isTC || _isTL) && (
                  <Label
                    onClick={() => setvalue("Client")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    styles={{
                      root: {
                        width: "100%",
                        fontSize: " 16px !important",
                        fontWeight: "400 !important",

                        color: "#FFFFFF !important",

                        padding: "6px 20px !important",
                        cursor: "pointer !important",
                      },
                    }}
                    className={
                      value == "Client" ? styles.activeBtn : styles.inActive
                    }
                  >
                    {menuExpand ? "Member list" : ""}
                    <i
                      className="pi pi-users"
                      style={{ fontSize: "1.25rem" }}
                    ></i>
                  </Label>
                )}
              </>
            )}
          </div>
        </div>

        <div
          style={{
            width: `calc(100% - ${menuExpand ? "280px" : "112px"})`,
            padding: "16px 16px 0 0",
          }}
        >
          {value == "mytasks" ? (
            <>
              <MyTaskDBNewCategory
                context={props.context}
                Module={module}
                Email={_curUser}
                HandleCompleted={HandleCompleted}
              />
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
              Module={module}
              HandleCompleted={HandleCompleted}
              selectedTeamByCardFlow={selectedTeamByCardFlow}
              viewByCardFlow={viewByCardFlow}
              memberFunction={memberFunction}
              groupMembersList={selectedTeam}
              _curUserDetailsArray={_curUserDetailsArray}
            />
          ) : value == "CardView" ? (
            <CardView
              context={props.context}
              memberFunction={memberFunction}
            ></CardView>
          ) : value == "Completed" ? (
            <CompleteDashboard
              context={props.context}
              // memberFunction={memberFunction}
              Completeuser={Completeuser}
              HandleBackBtn={HandleBackBtn}
              // HandleCompleted={HandleCompleted}
            ></CompleteDashboard>
          ) : value == "OrgChart" ? (
            <OrgChartNew context={props.context}></OrgChartNew>
          ) : value == "Client" ? (
            <Client
              context={props.context}
              _isAdmin={_isAdmin}
              _isTC={_isTC}
            ></Client>
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
    </>
  );
};
export default MainComponent;
