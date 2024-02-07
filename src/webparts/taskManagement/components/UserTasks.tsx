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
import * as moment from "moment";
import SidePanel from "./SidePanel";
import QuillEditor from "./QuillEditor";
let MyClients = [];
let MainTask = [];
let MainArray = [];
let SubTask = [];
let selectedTasks = [];
export default function UserTasks(props) {
  const UserEmail = !props.Email ? "" : props.Email;
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
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
    SPServices.ErrorHandling(err, "UserTasks");
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
          MyClients.push({
            ID: val.ID,
            Name: val.FirstName,
            clientNames: {
              FirstName: val ? val.FirstName : "",
              LastName: val ? val.LastName : "",
              CompanyName: val ? val.CompanyName : "",
            },
            Assistant: {
              Id: val.Assistant ? val.Assistant.ID : "",
              EMail: val.Assistant ? val.Assistant.EMail : "",
              Title: val.Assistant ? val.Assistant.Title : "",
            },
            BackupUsers: val.BackupId ? val.BackupId : [],
          });
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
      // {
      //   FilterKey: "Assistant/ID",
      //   Operator: "eq",
      //   FilterValue: id,
      // },
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
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName,Client/LastName,Client/CompanyName,RecurParent/ID",

      Expand: "Assistant,Backup,Author,Client,RecurParent",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      FilterCondition: "or",
    })
      .then((res) => {
        MainTask = [];
        res.forEach((val: any, index) => {
          val.ClientId &&
            val.Status != "Done" &&
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
                // ClientName: val.ClientId ? val.Client.FirstName : "",
                ClientName: val.ClientId
                  ? `${val.Client.FirstName} ${val.Client.LastName}`
                  : "",
                ClientID: val.ClientId ? val.Client.ID : "",
                Creator: {
                  Id: val.Assistant.ID,
                  EMail: val.Assistant.EMail,
                  Title: val.Assistant.Title,
                },
                Backup: {
                  // Id: val.Backup?.ID,///Changes for backup users multiple
                  // EMail: val.Backup?.EMail,
                  // Title: val.Backup?.Title,
                  Id: "",
                  EMail: "",
                  Title: "",
                },
                DueDate: SPServices.displayDate(val.DueDate),
                PriorityLevel: val.PriorityLevel,
                ReminderRef: val.ReminderRef,
                ReminderDays: val.ReminderDays,
                Status: val.Status,
                Recurrence: val.Recurrence,
                CreatedByFlow: val.CreatedByFlow,
                RecurParent: val.RecurParent ? val.RecurParent.ID : "",
                TaskAge: val.TaskAge ? val.TaskAge : null,
                CompletedDate: val.CompletedDate
                  ? SPServices.displayDate(val.CompletedDate)
                  : null,
                DoneFormula: val.DoneFormula ? val.DoneFormula : "",
                DaysOnEarly: val.DaysOnEarly ? val.DaysOnEarly : null,
                HasComments: val?.HasComments,
                Created:
                  val.Author.Title + " " + SPServices.displayDate(val.Created),
                NotifyDate: val.NotifyDate
                  ? moment(val.NotifyDate).format("MM/DD/YYYY")
                  : "",
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
        } //arrFilter removed arrFilter changed for issue fix..
        if (arrFilter.length > 0) {
          getsubTask(Filter);
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
        "*,  Assistant/ID, Assistant/EMail, Assistant/Title,Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title, MainTaskID/ID,RecurParent/ID",
      Expand: "MainTaskID, Backup, Author,Assistant,RecurParent",
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
                    Id: val.Assistant?.ID,
                    EMail: val.Assistant?.EMail,
                    Title: val.Assistant?.Title,
                  },
                  Backup: {
                    // Id: val.Backup?.ID,///Changes for backup users multiple
                    // EMail: val.Backup?.EMail,
                    // Title: val.Backup?.Title,
                    Id: "",
                    EMail: "",
                    Title: "",
                  },
                  DueDate: SPServices.displayDate(val.DueDate),
                  PriorityLevel: val.PriorityLevel,
                  ReminderRef: val.ReminderRef,
                  ReminderDays: val.ReminderDays,
                  Status: val.Status,
                  Recurrence: val.Recurrence,
                  CreatedByFlow: val.CreatedByFlow,
                  RecurParent: val.RecurParent ? val.RecurParent.ID : "",
                  TaskAge: val.TaskAge ? val.TaskAge : null,
                  CompletedDate: val.CompletedDate
                    ? SPServices.displayDate(val.CompletedDate)
                    : null,
                  DoneFormula: val.DoneFormula ? val.DoneFormula : "",
                  DaysOnEarly: val.DaysOnEarly ? val.DaysOnEarly : null,
                  Created:
                    val.Author.Title + "" + SPServices.displayDate(val.Created),
                  NotifyDate: val.NotifyDate
                    ? moment(val.NotifyDate).format("MM/DD/YYYY")
                    : "",
                  HasComments: val?.HasComments,
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
        clientNames: MyClients[i].clientNames,

        ID: MyClients[i].ID,
        Assistant: MyClients[i].Assistant,
        BackupUsers: MyClients[i].BackupUsers, ///Changes for backup users multiple
        Tasks: [],
      });
      for (let j = 0; j < MainArray.length; j++) {
        if (MainArray[j].data.ClientID == MyClients[i].ID)
          tempClient[i].Tasks.push(MainArray[j]);
      }
    }
    props.clientdatafunction([...MainArray]);
    props.getClientTasks([...tempClient]);
    setCurMyTask([...MainArray]);
    setMasterdata([...MainArray]);
    setClientdata([...tempClient]);
    setLoader(false);
  }

  const onselect = (event) => {
    if (event.node.isParent) {
      selectedTasks.push({
        data: event.node,
        Id: event.node.Id,
        subId: "",
        isSelected: true,
        isParent: true,
        categoryID: event.node.data.clientId,
        taskType: "clientTasks",
      });

      for (let i = 0; i < event.node.children.length; i++) {
        selectedTasks.push({
          data: event.node.children[i],
          Id: event.node.children[i].Id,
          subId: event.node.Id,
          isSelected: true,
          isParent: false,
          categoryID: event.node.data.clientId,
          taskType: "clientTasks",
        });
      }
    } else {
      selectedTasks.push({
        data: event.node,
        Id: event.node.Id,
        subId: event.node.subId,
        isSelected: true,
        isParent: false,
        categoryID: event.node.data.clientId,
        taskType: "clientTasks",
      });
    }

    props.getClientSelectedTasks([...selectedTasks]);
  };

  const unselect = (event) => {
    if (event.node.isParent) {
      for (let i = 0; i < selectedTasks.length; i++) {
        if (selectedTasks[i].Id == event.node.Id) {
          selectedTasks[i].isSelected = false;
        }
      }

      for (let i = 0; i < selectedTasks.length; i++) {
        if (selectedTasks[i].subId == event.node.Id) {
          selectedTasks[i].isSelected = false;
        }
      }
    } else {
      for (let i = 0; i < selectedTasks.length; i++) {
        if (selectedTasks[i].Id == event.node.Id) {
          selectedTasks[i].isSelected = false;
        }
      }
    }

    let crntSelectedTasks = selectedTasks.filter((item) => {
      return item.isSelected == true;
    });
    selectedTasks = [...crntSelectedTasks];
    props.getClientSelectedTasks([...selectedTasks]);
  };

  function updateDataFromChildComponent(clientId, Tasks) {
    let tempClientNew = [...clientdata];
    let categoryIndex = tempClientNew.findIndex((val) => val.ID == clientId);
    if (categoryIndex < 0) {
      console.log("Category not found");
    } else {
      tempClientNew[categoryIndex].Tasks = Tasks;
    }
    setClientdata([...tempClientNew]);
    props.getClientTasks([...tempClientNew]);
  }

  useEffect(() => {
    selectedTasks = [];
    setClientdata([...props.UpdatedData]);
  }, [props.UpdatedData]);

  useEffect(() => {
    setSearch(props.searchValue);
  }, [props.searchValue]);

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
          {/* <Label className={styles.clientHeader}>Member Tasks</Label> */}
          <>
            {clientdata.length > 0 ? (
              <>
                {clientdata.map((val, i) => {
                  return (
                    <>
                      <UserClientDB
                        bind={false}
                        searchValue={props.searchValue}
                        clientName={val.ClientName}
                        Clientdatas={val.clientNames}
                        clientId={val.ID}
                        assistant={val.Assistant ? val.Assistant : curuserId}
                        context={props.context}
                        mainData={val.Tasks}
                        crntUserData={curuserId}
                        crntBackData={configure}
                        backupUsers={val.BackupUsers}
                        choices={props.choices}
                        recChoices={props.recChoices}
                        onselect={onselect}
                        unselect={unselect}
                        groupMembersList={props.groupMembersList}
                        _curUserDetailsArray={props._curUserDetailsArray}
                        updateDataFromChildComponent={
                          updateDataFromChildComponent
                        }
                        getMainTask={getMainTask}
                      />
                    </>
                  );
                })}
              </>
            ) : (
              <UserClientDB
                bind={false}
                assistant={curuserId}
                searchValue={props.searchValue}
                context={props.context}
                mainData={masterdata}
                crntUserData={curuserId}
                crntBackData={configure}
                groupMembersList={props.groupMembersList}
                _curUserDetailsArray={props._curUserDetailsArray}
                Clientdatas={{ FirstName: "", LastName: "", CompanyName: "" }}
                backupUsers={[]}
                getMainTask={getMainTask}
              />
            )}
          </>
        </>
      )}
    </>
  );
}
