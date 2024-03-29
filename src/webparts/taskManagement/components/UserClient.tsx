import * as React from "react";
import { useState, useEffect } from "react";
import { Label } from "@fluentui/react";
import SPServices from "../../../Global/SPServices";
import { sp } from "@pnp/sp/presets/all";
import UserClientDB from "./UserClientDB";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import styles from "./MyTasks.module.scss";
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Avatar } from "primereact/avatar";
import Loader from "./Loader";
import "./style.css";
import { Icon } from "office-ui-fabric-react";
let MyClients = [];
let MainTask = [];
let MainArray = [];
let SubTask = [];
export default function UserClients(props) {
  const UserEmail = !props.Email ? "" : props.Email;
  const [loader, setLoader] = useState(false);
  const [curMyTask, setCurMyTask] = useState<any[]>([]);
  const [masterdata, setMasterdata] = useState<any[]>([]);
  const [clientdata, setClientdata] = useState<any[]>([]);
  const [teamCaptainData, setTeamCaptainData] = useState({
    EMail: "",
    Title: "",
  });
  const [teamTLData, setTeamTLData] = useState({ EMail: "", Title: "" });
  const [curuserId, setCuruserId] = useState({
    Id: null,
    EMail: "",
    Title: "",
  });
  const [configure, setConfigure] = useState({
    backupId: null,
    EMail: "",
    Title: "",
  });

  const errFunction = (err) => {
    setLoader(false);
    BindData();
    console.log(err);
  };

  //getcuruser
  const getcurUser = () => {
    if (UserEmail) {
      let user = sp.web.siteUsers
        .getByEmail(UserEmail)
        .get()
        .then((res) => {
          let crntUserDetails = {
            Id: res.Id,
            EMail: res.Email,
            Title: res.Title,
          };

          let crntUserBackup = {
            backupId: null,
            EMail: "",
            Title: "",
          };

          SPServices.SPReadItems({
            Listname: "Configuration",
            Select:
              "*,Name/EMail,Name/Title ,Name/ID ,TeamCaptain/EMail,TeamCaptain/Title,TeamLeader/EMail,TeamLeader/Title ,BackingUp/Title,BackingUp/EMail,BackingUp/ID",
            Expand: "BackingUp ,Name,TeamCaptain,TeamLeader",
            Filter: [
              {
                FilterKey: "Name/ID",
                FilterValue: res.Id.toString(),
                Operator: "eq",
              },
            ],
          })
            .then((res: any) => {
              let x = {
                backupId: null,
                EMail: "",
                Title: "",
              };
              let TCData = {
                EMail: "",
                Title: "",
              };
              let TLData = {
                EMail: "",
                Title: "",
              };
              res.forEach((val) => {
                x.EMail = val.BackingUp ? val.BackingUp[0].EMail : "";
                x.backupId = val.BackingUp ? val.BackingUp[0].ID : "";
                x.Title = val.BackingUp ? val.BackingUp[0].Title : "";
                TCData.EMail = val.TeamCaptain ? val.TeamCaptain.EMail : "N/A";
                TCData.Title = val.TeamCaptain ? val.TeamCaptain.Title : "N/A";

                TLData.EMail = val.TeamLeader ? val.TeamLeader.EMail : "N/A";
                TLData.Title = val.TeamLeader ? val.TeamLeader.Title : "N/A";
              });
              crntUserBackup = x;
              setTeamTLData({ ...TLData });
              setTeamCaptainData({ ...TCData });
              setCuruserId({ ...crntUserDetails });
              setConfigure({ ...x });
            })
            .catch((err) => errFunction(err));
          getMyClients(res.Id);
        })
        .catch((err) => errFunction(err));
    } else {
      BindData();
    }
  };

  function getMyClients(id) {
    SPServices.SPReadItems({
      Listname: "ClientDetails",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title",

      Expand: "Assistant,Backup,Author",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "Assistant/ID",
          Operator: "eq",
          FilterValue: id,
        },
      ],
    })
      .then((res) => {
        MyClients = [];
        res.forEach((val: any) => {
          MyClients.push({ ID: val.ID, Name: val.FirstName });
        });
        if (MyClients.length > 0) {
          getMainTask(id);
        } else {
          BindData();
        }
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  //getmaintask
  const getMainTask = (id) => {
    let Filter = [
      {
        FilterKey: "Assistant/ID",
        Operator: "eq",
        FilterValue: id,
      },
    ];
    MyClients.forEach((val: any) => {
      Filter.push({
        FilterKey: "Client/ID",
        Operator: "eq",
        FilterValue: val.ID,
      });
    });
    SPServices.SPReadItems({
      Listname: "Tasks",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName",

      Expand: "Assistant,Backup,Author,Client",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      FilterCondition: "or",
    })
      .then((res) => {
        MainTask = [];
        res.forEach((val: any, index) => {
          val.ClientId &&
            MainTask.push({
              key: val.Id,
              Id: val.Id,
              Index: index,
              isParent: true,
              isClick: false,
              isAdd: false,
              isEdit: false,

              data: {
                TaskName: val.TaskName,
                ClientName: val.ClientId ? val.Client.FirstName : "",
                ClientID: val.ClientId ? val.Client.ID : "",
                Creator: {
                  Id: val.Author.ID,
                  EMail: val.Author.EMail,
                  Title: val.Author.Title,
                },
                Backup: {
                  Id: val.Backup?.ID,
                  EMail: val.Backup?.EMail,
                  Title: val.Backup?.Title,
                },
                DueDate: SPServices.displayDate(val.DueDate),
                PriorityLevel: val.PriorityLevel,
                Status: val.Status,
                Created: SPServices.displayDate(val.Created),
              },
              children: [],
            });
        });

        let arrFilter = [];
        for (let i = 0; i < MainTask.length; i++) {
          arrFilter.push({
            FilterKey: "MainTaskID/ID",
            FilterValue: MainTask[i].Id.toString(),
            Operator: "eq",
          });
        }
        if (arrFilter.length > 0) {
          getsubTask(arrFilter);
        } else {
          MainArray = [...MainTask];
          BindData();
        }
      })
      .catch((err) => {
        errFunction(err);
      });
  };

  //getsubtask
  const getsubTask = (FilterValue) => {
    MainArray = [];
    SPServices.SPReadItems({
      Listname: "SubTasks",
      Select:
        "*,  Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title, MainTaskID/ID",
      Expand: "MainTaskID, Backup, Author",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: FilterValue,
      FilterCondition: "or",
      Topcount: 5000,
    })
      .then((response) => {
        let count = 0;
        for (let i = 0; i < MainTask.length; i++) {
          /* Start Of Subtaks */
          SubTask = [];
          var res = response.filter(function (data: any) {
            return data.MainTaskID.ID == MainTask[i].Id;
          });
          res.forEach((val: any, index) => {
            val.ClientName == null &&
              SubTask.push({
                key: `${MainTask[i].Id}-${index + 1}`,
                Index: index,
                Id: val.Id,
                subId: MainTask[i].Id,
                isClick: false,
                isParent: false,
                isAdd: false,
                isEdit: false,
                data: {
                  TaskName: val.TaskName,
                  ClientName: MainTask[i].data.ClientName,
                  ClientID: MainTask[i].data.ClientID,
                  Creator: {
                    Id: val.Author.ID,
                    EMail: val.Author.EMail,
                    Title: val.Author.Title,
                  },
                  Backup: {
                    Id: val.Backup?.ID,
                    EMail: val.Backup?.EMail,
                    Title: val.Backup?.Title,
                  },
                  DueDate: SPServices.displayDate(val.DueDate),
                  PriorityLevel: val.PriorityLevel,
                  Status: val.Status,
                  Created: SPServices.displayDate(val.Created),
                },
              });
          });

          MainArray.push({
            ...MainTask[i],
            children: SubTask,
          });
          count++;

          if (count === MainTask.length) {
            // console.log(MainArray, "MainArray");
            // let tempClient=[];
            // for(let i=0;i<MyClients.length;i++)
            // {
            //     tempClient.push({ClientName:MyClients[i].Name,ID:MyClients[i].ID,Tasks:[]});
            //     for(let j=0;j<MainArray.length;j++)
            //     {
            //         if(MainArray[j].data.ClientID==MyClients[i].ID)
            //         tempClient[i].Tasks.push(MainArray[j]);
            //     }
            // }
            // setCurMyTask([...MainArray]);
            // setMasterdata([...MainArray]);
            // setClientdata([...tempClient]);
            BindData();
          }
          /* End Of Subtaks */
        }
      })
      .catch((err) => {
        errFunction(err);
      });
  };

  function BindData() {
    let tempClient = [];
    for (let i = 0; i < MyClients.length; i++) {
      tempClient.push({
        ClientName: MyClients[i].Name,
        ID: MyClients[i].ID,
        Tasks: [],
      });
      for (let j = 0; j < MainArray.length; j++) {
        if (MainArray[j].data.ClientID == MyClients[i].ID)
          tempClient[i].Tasks.push(MainArray[j]);
      }
    }
    setCurMyTask([...MainArray]);
    setMasterdata([...MainArray]);
    setClientdata([...tempClient]);
    setLoader(false);
  }

  useEffect(() => {
    setLoader(true);
    MyClients = [];
    MainTask = [];
    MainArray = [];
    SubTask = [];
    getcurUser();
  }, [props.Email]);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className={styles.commonFilterSection}>
            <div>
              <Label className={styles.leftFilterSection}>
                {curuserId.Title}
              </Label>
            </div>

            {/* <InputText
                  value={search}
                  onChange={(e: any) => SearchFilter(e.target.value)}
                /> */}
            <div className={styles.rightFilterSection}>
              <div>
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    className="searchFilter"
                    placeholder="Search"
                    value={""}
                    //onChange={(e: any) => SearchFilter(e.target.value)}
                  />
                </span>
              </div>
              <Button className={styles.btnColor} label="Automate" />
              {/* <Button
                className={styles.btnColor}
                label="Export"
                icon="pi pi-file-excel"
              /> */}

              <Icon
                iconName="ExcelDocument"
                style={{
                  background: "#edffe6",
                  color: "#175200",
                  border: "1px solid #17520010",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  height: " 34px",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                // onClick={() => exportData()}
              />
            </div>
          </div>
          {/* <div className={styles.TLTCSection}>
            <div className={styles.TLImage}>
              <b>TL :</b>
              <div className={styles.avatarAndNameFlex}>
                <Avatar
                  className={styles.avatar}
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${teamTLData.EMail}`}
                  size="normal"
                  shape="circle"
                  // label={val.TeamCaptain[0].Title}
                />
                <span>{teamTLData.Title}</span>
              </div>
            </div>
            <div className={styles.TLImage}>
              <b>TC :</b>
              <div className={styles.avatarAndNameFlex}>
                <Avatar
                  className={styles.avatar}
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${teamCaptainData.EMail}`}
                  size="normal"
                  shape="circle"
                  // label={val.TeamCaptain[0].Title}
                />
                <span>{teamCaptainData.Title}</span>
              </div>
            </div>
          </div> */}
          <Label className={styles.clientHeader}>Client Tasks</Label>
          <>
            {clientdata.length > 0 ? (
              <>
                {clientdata.map((val, i) => {
                  return (
                    <>
                      <UserClientDB
                        bind={false}
                        clientName={val.ClientName}
                        clientId={val.ID}
                        context={props.context}
                        mainData={val.Tasks}
                        crntUserData={curuserId}
                        crntBackData={configure}
                      />
                    </>
                  );
                })}
              </>
            ) : (
              <UserClientDB
                bind={false}
                context={props.context}
                mainData={masterdata}
                crntUserData={curuserId}
                crntBackData={configure}
              />
            )}
          </>
        </>
      )}
    </>
  );
}
