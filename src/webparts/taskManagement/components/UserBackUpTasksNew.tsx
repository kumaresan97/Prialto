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
let MyClients = [];
let MyTaskIds = [];
let MainTask = [];
let MainArray = [];
let SubTask = [];
let selectedTasks = [];
export default function UserBackUpTasksNew(props) {
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
    SPServices.ErrorHandling(err, "userBackupTaksNew");
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
            backupId: res.Id,
            EMail: res.Email,
            Title: res.Title,
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
                // x.EMail = val.BackingUp?val.BackingUp[0].EMail:"";
                // x.backupId = val.BackingUp?val.BackingUp[0].ID:"";
                // x.Title = val.BackingUp?val.BackingUp[0].Title:"";

                TCData.EMail = val.TeamCaptain ? val.TeamCaptain.EMail : "N/A";
                TCData.Title = val.TeamCaptain ? val.TeamCaptain.Title : "N/A";

                TLData.EMail = val.TeamLeader ? val.TeamLeader.EMail : "N/A";
                TLData.Title = val.TeamLeader ? val.TeamLeader.Title : "N/A";
              });
              //crntUserBackup = x;
              setTeamTLData({ ...TLData });
              setTeamCaptainData({ ...TCData });
              setCuruserId({ ...crntUserDetails });
              setConfigure({ ...crntUserBackup });
            })
            .catch((err) => errFunction(err));
          getMyClients(res.Id);
          //getAllTaskID(res.Id);
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
          FilterKey: "Backup/ID",
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
            CompanyDatas: {
              FirstName: val.FirstName,
              LastName: val.LastName ? val.LastName : "",
              CompanyName: val.CompanyName,
            },
            Assistant: {
              Id: val.Assistant.ID,
              EMail: val.Assistant.EMail,
              Title: val.Assistant.Title,
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

  function getAllTaskID(id) {
    let Filter = [
      {
        FilterKey: "Backup/ID",
        Operator: "eq",
        FilterValue: id,
      },
      {
        FilterKey: "Assistant/ID",
        Operator: "ne",
        FilterValue: id,
      },
      {
        FilterKey: "Client/ID",
        Operator: "gt",
        FilterValue: 0,
      },
    ];
    SPServices.SPReadItems({
      Listname: "Tasks",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName",

      Expand: "Assistant,Backup,Author,Client",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      FilterCondition: "and",
    })
      .then((res) => {
        MyTaskIds = [];
        res.forEach((val: any) => {
          MyTaskIds.push({ ID: val.ID });
        });
        getAllSubTaskID(id);
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  function getAllSubTaskID(id) {
    let Filter = [
      {
        FilterKey: "Backup/ID",
        Operator: "eq",
        FilterValue: id,
      },
      {
        FilterKey: "Assistant/ID",
        Operator: "ne",
        FilterValue: id,
      },
    ];
    SPServices.SPReadItems({
      Listname: "SubTasks",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName,Client/LastName,Client/CompanyName,MainTaskID/ID",

      Expand: "Assistant,Backup,Author,Client,MainTaskID",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      FilterCondition: "and",
    })
      .then((res) => {
        res.forEach((val: any) => {
          if (val.MainTaskID) MyTaskIds.push({ ID: val.MainTaskID.ID });
        });

        const ids = MyTaskIds.map(({ ID }) => ID);
        const filtered = MyTaskIds.filter(
          ({ ID }, index) => !ids.includes(ID, index + 1)
        );

        MyTaskIds = filtered;
        if (MyTaskIds.length < 0) {
          BindData();
        } else {
          getMainTask(id);
        }
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  //getmaintask
  const getMainTask = (id) => {
    let Filter = [];
    // if (MyTaskIds.length > 0) {
    //   MyTaskIds.forEach((val: any) => {
    //     Filter.push({
    //       FilterKey: "ID",
    //       Operator: "eq",
    //       FilterValue: val.ID,
    //     });
    //   });
    // } else {
    //   Filter.push({
    //     FilterKey: "ID",
    //     Operator: "eq",
    //     FilterValue: 0,
    //   });
    // }

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
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName,Client/LastName,Client/CompanyName",

      Expand: "Assistant,Backup,Author,Client",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      FilterCondition: "or",
    })
      .then((res) => {
        console.log(res, "res");
        MainTask = [];
        res.forEach((val: any, index) => {
          val.ClientId &&
            val.Status != "Done" &&
            val.AssitantId != id &&
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
                Clientdatas: {
                  FirstName: val.ClientId ? val.Client.FirstName : "",
                  LastName: val.ClientId ? val.Client.LastName : "",
                  CompanyName: val.ClientId ? val.Client.CompanyName : "",
                },
                // ClientName: val.ClientId ? val.Client.FirstName : "",
                ClientName: val.ClientId
                  ? `${val.Client.FirstName} ${val.Client.LastName}`
                  : "",
                ClientID: val.ClientId ? val.Client.ID : "",
                BackupUsers: val.BackupId ? val.BackupId : [],
                Creator: {
                  Id: val.Assistant.ID,
                  EMail: val.Assistant.EMail,
                  Title: val.Assistant.Title,
                },
                Backup: {
                  Id: val.Backup?.ID,
                  EMail: val.Backup?.EMail,
                  Title: val.Backup?.Title,
                },
                DueDate: SPServices.displayDate(val.DueDate),
                PriorityLevel: val.PriorityLevel,
                ReminderRef: val.ReminderRef,
                ReminderDays: val.ReminderDays,
                Status: val.Status,
                Recurrence: val.Recurrence,
                TaskAge: val.TaskAge ? val.TaskAge : null,
                CompletedDate: val.CompletedDate
                  ? SPServices.displayDate(val.CompletedDate)
                  : null,
                DoneFormula: val.DoneFormula ? val.DoneFormula : "",
                DaysOnEarly: val.DaysOnEarly ? val.DaysOnEarly : null,
                Created:
                  val.Author?.Title + " " + SPServices.displayDate(val.Created),
                HasComments: val?.HasComments,
              },
              children: [],
            });
        });

        let arrFilter = [];
        ///MyClients = [];
        for (let i = 0; i < MainTask.length; i++) {
          /*
          let IDtoCompare = MainTask[i].data.ClientID
            ? MainTask[i].data.ClientID
            : "";
          let duplicate = MyClients.some((person) => person.ID === IDtoCompare);
          if (!duplicate) {
            MyClients.push({
              ID: MainTask[i].data.ClientID ? MainTask[i].data.ClientID : "",
              Name: MainTask[i].data.ClientName
                ? MainTask[i].data.ClientName
                : "",
              CompanyDatas: MainTask[i].data.Clientdatas,
              Assistant: {
                Id: MainTask[i].data.Creator ? MainTask[i].data.Creator.Id : "",
                EMail: MainTask[i].data.Creator
                  ? MainTask[i].data.Creator.EMail
                  : "",
                Title: MainTask[i].data.Creator
                  ? MainTask[i].data.Creator.Title
                  : "",
              },
              BackupUsers: MainTask[i].data.BackupUsers,
            });
          }*/

          arrFilter.push({
            FilterKey: "MainTaskID/ID",
            FilterValue: MainTask[i].Id.toString(),
            Operator: "eq",
          });
        }
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
        "*,  Backup/ID, Backup/EMail, Backup/Title,Assistant/ID, Assistant/EMail, Assistant/Title, Author/ID, Author/EMail, Author/Title, MainTaskID/ID",
      Expand: "MainTaskID, Backup, Author,Assistant",
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
                // Clientdatas: {
                //   FirstName: val.ClientId ? val.Client?.FirstName : "",
                //   LastName: val.ClientId ? val.Client?.LastName : "",
                //   CompanyName: val.ClientId ? val.Client?.CompanyName : "",
                // },
                ClientID: MainTask[i].data.ClientID,
                Creator: {
                  Id: val.Assistant?.ID,
                  EMail: val.Assistant?.EMail,
                  Title: val.Assistant?.Title,
                },
                Backup: {
                  Id: val.Backup?.ID,
                  EMail: val.Backup?.EMail,
                  Title: val.Backup?.Title,
                },
                DueDate: SPServices.displayDate(val.DueDate),
                PriorityLevel: val.PriorityLevel,
                ReminderRef: val.ReminderRef,
                ReminderDays: val.ReminderDays,
                Status: val.Status,
                Recurrence: val.Recurrence,
                TaskAge: val.TaskAge ? val.TaskAge : null,
                CompletedDate: val.CompletedDate
                  ? SPServices.displayDate(val.CompletedDate)
                  : null,
                DoneFormula: val.DoneFormula ? val.DoneFormula : "",
                DaysOnEarly: val.DaysOnEarly ? val.DaysOnEarly : null,
                Created:
                  val.Author?.Title + " " + SPServices.displayDate(val.Created),
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
      /*
      tempClient.push({
        ClientName: MyClients[i].Name,
        CompanyDatas: MainTask[i].data.Clientdatas,

        ID: MyClients[i].ID,
        Assistant: MyClients[i].Assistant,
        BackupUsers: MainTask[i].data.BackupUsers,
        Tasks: [],
      });
      */
      tempClient.push({
        ClientName: MyClients[i].Name,
        CompanyDatas: MyClients[i].CompanyDatas,
        ID: MyClients[i].ID,
        Assistant: MyClients[i].Assistant,
        BackupUsers: MyClients[i].BackupUsers,
        Tasks: [],
      });
      for (let j = 0; j < MainArray.length; j++) {
        if (MainArray[j].data.ClientID == MyClients[i].ID)
          tempClient[i].Tasks.push(MainArray[j]);
      }
    }
    console.log(tempClient, "tempclient");

    props.backupdatafunction([...tempClient]);
    props.getBackupTasks([...tempClient]);
    setCurMyTask([...MainArray]);
    setMasterdata([...MainArray]);
    setClientdata([...tempClient]);
    setLoader(false);
  }

  // function BindDataAfterSearch(FilterData) {
  //   let tempClient = [];
  //   for (let i = 0; i < MyClients.length; i++) {
  //     tempClient.push({
  //       ClientName: MyClients[i].Name,
  //       ID: MyClients[i].ID,
  //       Tasks: [],
  //     });
  //     for (let j = 0; j < FilterData.length; j++) {
  //       if (FilterData[j].data.ClientID == MyClients[i].ID)
  //         tempClient[i].Tasks.push(FilterData[j]);
  //     }
  //   }
  //   setClientdata([...tempClient]);
  //   setLoader(false);
  // }

  // const SearchFilter = (e) => {
  //   setSearch(e);

  //   let filteredResults = curMyTask.filter((item) => {
  //     if (item.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())) {
  //       return true;
  //     }

  //     const childMatches = item.children.filter((child) =>
  //       child.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())
  //     );

  //     if (childMatches.length > 0) {
  //       return true;
  //     }

  //     return false;
  //   });
  //   BindDataAfterSearch([...filteredResults]);
  //   //setCurMyTask([...filteredResults]);
  // };

  const onselect = (event) => {
    if (event.node.isParent) {
      selectedTasks.push({
        data: event.node,
        Id: event.node.Id,
        subId: "",
        isSelected: true,
        isParent: true,
        categoryID: event.node.data.ClientID,
        taskType: "backupTasks",
      });

      for (let i = 0; i < event.node.children.length; i++) {
        selectedTasks.push({
          data: event.node.children[i],
          Id: event.node.children[i].Id,
          subId: event.node.Id,
          isSelected: true,
          isParent: false,
          categoryID: event.node.data.ClientID,
          taskType: "backupTasks",
        });
      }
    } else {
      selectedTasks.push({
        data: event.node,
        Id: event.node.Id,
        subId: event.node.subId,
        isSelected: true,
        isParent: false,
        categoryID: event.node.data.ClientID,
        taskType: "backupTasks",
      });
    }

    props.getBackupSelectedTasks([...selectedTasks]);
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
    props.getBackupSelectedTasks([...selectedTasks]);
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
    props.getBackupTasks([...tempClientNew]);
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
          <Label className={styles.clientHeader}>Backup Tasks</Label>
          <>
            {clientdata.length > 0 ? (
              <>
                {clientdata.map((val, i) => {
                  console.log(val, "valdb");
                  return (
                    <>
                      <UserClientDB
                        bind={false}
                        searchValue={props.searchValue}
                        Clientdatas={val.CompanyDatas}
                        clientName={val.ClientName}
                        clientId={val.ID}
                        context={props.context}
                        mainData={val.Tasks}
                        assistant={val.Assistant ? val.Assistant : curuserId}
                        crntUserData={curuserId}
                        crntBackData={configure}
                        choices={props.choices}
                        recChoices={props.recChoices}
                        backupUsers={val.BackupUsers} ///Changes for backup users multiple
                        onselect={onselect}
                        unselect={unselect}
                        updateDataFromChildComponent={
                          updateDataFromChildComponent
                        }
                        groupMembersList={props.groupMembersList}
                        _curUserDetailsArray={props._curUserDetailsArray}
                        getMainTask={getcurUser}
                      />
                    </>
                  );
                })}
              </>
            ) : (
              <UserClientDB
                bind={false}
                searchValue={props.searchValue}
                context={props.context}
                assistant={curuserId}
                mainData={masterdata}
                crntUserData={curuserId}
                crntBackData={configure}
                choices={props.choices}
                Clientdatas={{ FirstName: "", LastName: "", CompanyName: "" }}
                backupUsers={[]}
                groupMembersList={props.groupMembersList}
                _curUserDetailsArray={props._curUserDetailsArray}
                getMainTask={getcurUser}
              />
            )}
          </>
        </>
      )}
    </>
  );
}
