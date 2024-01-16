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
import UserTasks from "./UserTasks";
import UserBackUpTasks from "./UserBackUpTasks";
import UserBackUpTasksNew from "./UserBackUpTasksNew";
import UserClients from "./UserClient";
import exportToExcel from "../../../Global/ExportExcel";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import * as moment from "moment";
import { Toast } from "primereact/toast";
let statusChoices = [];
let recurrenceChoices = [];
let arrClientData = []; //For export function..
let arrBackupData = [];
let ExportDataItems = [];

/*start Automation */
let automationTasks = [];

let selectedTasks = [];
let arrClientSelectedTasks = [];
let arrBackupSelectedTasks = [];

let clientdata = [];
let clientTasks = [];
let backupTasks = [];
/*end Automation */

export default function UserDashboard(props) {
  console.log("mainprosp", props);

  const UserEmail = !props.Email
    ? props.context.pageContext.user.email
    : props.Email;

  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [bind, setBind] = useState(false);
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
  const [user, setUser] = useState("");
  const [backUpUser, setBackUpUser] = useState("");

  /*For automation */
  const [isAutomate, setIsautomate] = useState(false);
  const [days, setDays] = useState(0);
  const [duedate, setDuedate] = useState("");
  const [taskname, setTaskName] = useState("");
  const toastTopRight = React.useRef(null);
  const [newClientData, setNewClientData] = useState([]);

  // style functions
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

  /*For automation */

  const errFunction = (err) => {
    console.log(err);
    SPServices.ErrorHandling(err, "userDashboard");
    setLoader(false);
    showMessage(
      "Something went wrong, Please contact system admin",
      toastTopRight,
      "error"
    );
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
              //setLoader(false);
            })
            .catch((err) => errFunction(err));
          getBackupUser(res.Id);
        });
    } else {
      setLoader(false);
    }
  };

  function getBackupUser(UserID) {
    SPServices.SPReadItems({
      Listname: "Configuration",
      Select:
        "*,Name/EMail,Name/Title ,Name/ID ,TeamCaptain/EMail,TeamCaptain/Title,TeamLeader/EMail,TeamLeader/Title ,BackingUp/Title,BackingUp/EMail,BackingUp/ID",
      Expand: "BackingUp ,Name,TeamCaptain,TeamLeader",
      Filter: [
        {
          FilterKey: "BackingUp/ID",
          FilterValue: UserID.toString(),
          Operator: "eq",
        },
      ],
    })
      .then(function (data: any) {
        let backUpUserEmail = "";
        if (data.length > 0) {
          backUpUserEmail = data[0].Name ? data[0].Name.EMail : "";
          setUser(UserEmail);
          setBackUpUser(backUpUserEmail);
        } else {
          setUser(UserEmail);
          setBackUpUser(backUpUserEmail);
        }
        setLoader(false);
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  function SearchFilter(e) {
    setSearch(e);
  }

  function getStatus() {
    statusChoices = [];
    SPServices.SPGetChoices({
      Listname: "Tasks",
      FieldName: "Status",
    })
      .then(function (data) {
        console.log(data["Choices"]);
        for (let i = 0; i < data["Choices"].length; i++) {
          statusChoices.push({
            name: data["Choices"][i],
            code: data["Choices"][i],
          });
        }
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  function getRecurrence() {
    recurrenceChoices = [];
    SPServices.SPGetChoices({
      Listname: "Tasks",
      FieldName: "Recurrence",
    })
      .then(function (data) {
        console.log(data["Choices"]);
        for (let i = 0; i < data["Choices"].length; i++) {
          recurrenceChoices.push({
            name: data["Choices"][i],
            code: data["Choices"][i],
          });
        }
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  useEffect(() => {
    setLoader(true);
    getStatus();
    getRecurrence();
    getcurUser();
  }, [props.Email]);

  function getDataFromClient(data) {
    arrClientData = [...data];
    console.log(arrClientData);
  }

  function getDataFromBackup(data) {
    arrBackupData = [...data];
    console.log(arrBackupData);
  }

  function BindExportData() {
    let columns = [
      { header: "Task Name", key: "TaskName", width: 20 },
      { header: "Creation log", key: "Created", width: 25 },

      { header: "Parent Task Name", key: "ParenTask", width: 25 },
      { header: "Client Name", key: "ClientName", width: 25 },
      { header: "Category", key: "Category", width: 25 },
      // { header: "Creator", key: "Creator", width: 25 },
      // { header: "Backup", key: "Backup", width: 25 },
      { header: "Priority Level", key: "PriorityLevel", width: 25 },
      { header: "Status", key: "Status", width: 25 },
      { header: "DueDate", key: "DueDate", width: 25 },

      { header: "Task Age", key: "TaskAge", width: 25 },
      { header: "Completed Date", key: "CompletedDate", width: 25 },
      { header: "Days OnEarly", key: "DaysOnEarly", width: 25 },

      { header: "Done Formula", key: "DoneFormula", width: 25 },
    ];

    const NotStartedArrClientData = arrClientData.filter((task) => {
      const taskStatus = task.data.Status;
      const childStatuses = task.children?.map((el) => el.data.Status) || [];
      return !taskStatus.includes("Done") && !childStatuses.includes("Done");
    });

    arrBackupData.forEach((el) => {
      el.Tasks = el.Tasks.filter((e) => !e?.data?.Status.includes("Done"));
    });

    let data = [
      {
        clientData: NotStartedArrClientData,
        backupData: arrBackupData,
      },
    ];

    exportToExcel(data, columns, "ClientandBackup");
  }

  /*Start automaion */

  function getClientTasks(data) {
    clientTasks = [...data];
  }

  function getBackupTasks(data) {
    backupTasks = [...data];
  }

  function getClientSelectedTasks(data) {
    arrClientSelectedTasks = [...data];
  }

  function getBackupSelectedTasks(data) {
    arrBackupSelectedTasks = [...data];
  }
  // old
  function prepareAutomationData() {
    automationTasks = [];
    let noOfDays = days;
    selectedTasks = [...arrClientSelectedTasks, ...arrBackupSelectedTasks];
    clientdata = [...clientTasks, ...backupTasks];
    let tempClientNew = [...clientdata];
    //selectedTasks=selectedTasks[0];//need to remove for this to mulitple..
    for (let i = 0; i < selectedTasks.length; i++) {
      if (selectedTasks[i].isParent) {
        automationTasks.push({
          Title: "Reminder",
          TaskIDId: selectedTasks[i].data.Id,
          SubTaskIDId: null,
          Before: days,
          //Status: selectedTasks[i].data.data.Status,
          NotifyDate: moment(selectedTasks[i].data.data.DueDate)
            .subtract(noOfDays, "days")
            .format("YYYY-MM-DD"),
        });
      } else {
        automationTasks.push({
          Title: "Reminder",
          TaskIDId: null,
          SubTaskIDId: selectedTasks[i].data.Id,
          Before: days,
          //Status: selectedTasks[i].data.data.Status,
          NotifyDate: moment(selectedTasks[i].data.data.DueDate)
            .subtract(noOfDays, "days")
            .format("YYYY-MM-DD"),
        });
      }
    }

    for (let i = 0; i < selectedTasks.length; i++) {
      try {
        let categoryIndex = tempClientNew.findIndex(
          (val) => val.ID == selectedTasks[i].categoryID
        );
        if (selectedTasks[i].isParent) {
          if (categoryIndex >= 0) {
            let taskIndex = tempClientNew[categoryIndex].Tasks.findIndex(
              (item) => {
                return item.key == selectedTasks[i].data.Id;
              }
            );
            tempClientNew[categoryIndex].Tasks[taskIndex].data.ReminderDays =
              noOfDays;
          }
        } else {
          if (categoryIndex >= 0) {
            for (
              let k = 0;
              k < tempClientNew[categoryIndex].Tasks.length;
              k++
            ) {
              for (
                let j = 0;
                j < tempClientNew[categoryIndex].Tasks[k].children.length;
                j++
              ) {
                if (
                  tempClientNew[categoryIndex].Tasks[k].children[j].Id ==
                  selectedTasks[i].data.Id
                ) {
                  tempClientNew[categoryIndex].Tasks[k].children[
                    j
                  ].data.ReminderDays = noOfDays;
                }
              }
            }
          }
        }

        prepareClientandBackupTasks(
          tempClientNew[categoryIndex],
          selectedTasks[i].taskType,
          selectedTasks[i].categoryID
        );
      } catch (e) {
        errFunction(e);
      }
    }
    selectedTasks = [];
    clientdata = [...tempClientNew];
    insertReminderNew([...automationTasks]);
    setNewClientData([...clientdata]); //for this page reference not used in any place.
  }

  // new bug fixed and updated
  // function prepareAutomationData() {
  //   automationTasks = [];
  //   let noOfDays = days;
  //   selectedTasks = [...arrClientSelectedTasks, ...arrBackupSelectedTasks];
  //   clientdata = [...clientTasks, ...backupTasks];
  //   let tempClientNew = [...clientdata];
  //   let hasPastValues = true;
  //   //selectedTasks=selectedTasks[0];//need to remove for this to mulitple..
  //   for (let i = 0; i < selectedTasks.length; i++) {
  //     let reminderDate = moment(selectedTasks[i].data.data.DueDate)
  //       .subtract(noOfDays, "days")
  //       .format("YYYY-MM-DD");
  //     let tasksDueDate = moment(selectedTasks[i].data.data.DueDate).format(
  //       "YYYY-MM-DD"
  //     );
  //     let todayDate = moment(new Date()).format("YYYY-MM-DD");

  //     if (reminderDate <= tasksDueDate && reminderDate >= todayDate) {
  //       hasPastValues = false;

  //       if (selectedTasks[i].isParent) {
  //         automationTasks.push({
  //           Title: "Reminder",
  //           TaskIDId: selectedTasks[i].data.Id,
  //           SubTaskIDId: null,
  //           Before: days,
  //           //Status: selectedTasks[i].data.data.Status,
  //           NotifyDate: moment(selectedTasks[i].data.data.DueDate)
  //             .subtract(noOfDays, "days")
  //             .format("YYYY-MM-DD"),
  //         });
  //       } else {
  //         automationTasks.push({
  //           Title: "Reminder",
  //           TaskIDId: null,
  //           SubTaskIDId: selectedTasks[i].data.Id,
  //           Before: days,
  //           //Status: selectedTasks[i].data.data.Status,
  //           NotifyDate: moment(selectedTasks[i].data.data.DueDate)
  //             .subtract(noOfDays, "days")
  //             .format("YYYY-MM-DD"),
  //         });
  //       }

  //       try {
  //         let categoryIndex = tempClientNew.findIndex(
  //           (val) => val.ID == selectedTasks[i].categoryID
  //         );
  //         if (selectedTasks[i].isParent) {
  //           if (categoryIndex >= 0) {
  //             let taskIndex = tempClientNew[categoryIndex].Tasks.findIndex(
  //               (item) => {
  //                 return item.key == selectedTasks[i].data.Id;
  //               }
  //             );
  //             tempClientNew[categoryIndex].Tasks[taskIndex].data.ReminderDays =
  //               noOfDays;

  //             tempClientNew[categoryIndex].Tasks[taskIndex].data.NotifyDate =
  //               moment(selectedTasks[i].data.data.DueDate)
  //                 .subtract(noOfDays, "days")
  //                 .format("MM/DD/YYYY");
  //           }
  //         } else {
  //           if (categoryIndex >= 0) {
  //             for (
  //               let k = 0;
  //               k < tempClientNew[categoryIndex].Tasks.length;
  //               k++
  //             ) {
  //               for (
  //                 let j = 0;
  //                 j < tempClientNew[categoryIndex].Tasks[k].children.length;
  //                 j++
  //               ) {
  //                 if (
  //                   tempClientNew[categoryIndex].Tasks[k].children[j].Id ==
  //                   selectedTasks[i].data.Id
  //                 ) {
  //                   tempClientNew[categoryIndex].Tasks[k].children[
  //                     j
  //                   ].data.ReminderDays = noOfDays;

  //                   tempClientNew[categoryIndex].Tasks[k].children[
  //                     j
  //                   ].data.NotifyDate = moment(
  //                     selectedTasks[i].data.data.DueDate
  //                   )
  //                     .subtract(noOfDays, "days")
  //                     .format("MM/DD/YYYY");
  //                 }
  //               }
  //             }
  //           }
  //         }

  //         prepareClientandBackupTasks(
  //           tempClientNew[categoryIndex],
  //           selectedTasks[i].taskType,
  //           selectedTasks[i].categoryID
  //         );
  //       } catch (e) {
  //         errFunction(e);
  //       }
  //     } else {
  //       hasPastValues = true;
  //       break; // Stop processing further tasks if one fails the condition
  //     }
  //   }
  //   if (!hasPastValues) {
  //     selectedTasks = [];
  //     clientdata = [...tempClientNew];
  //     insertReminderNew([...automationTasks]);
  //     setNewClientData([...clientdata]); //for this page reference not used in any place.
  //   } else {
  //     setLoader(false);
  //     setIsautomate(true);
  //     selectedTasks?.length > 1
  //       ? showMessage(
  //           "Some task's reminder has been set to the past! Please check.",
  //           toastTopRight,
  //           "warn"
  //         )
  //       : showMessage("Can't set reminder to the past!", toastTopRight, "warn");
  //   }
  // }

  function prepareClientandBackupTasks(updatedTasks, tasktype, clientid) {
    if (tasktype == "clientTasks") {
      let categoryIndex = clientTasks.findIndex((val) => val.ID == clientid);
      if (categoryIndex >= 0) {
        clientTasks[categoryIndex] = updatedTasks;
      }
    } else {
      let categoryIndex = backupTasks.findIndex((val) => val.ID == clientid);
      if (categoryIndex >= 0) {
        backupTasks[categoryIndex] = updatedTasks;
      }
    }
  }

  function insertReminderNew(TasksDetails) {
    let tasksListData = TasksDetails.filter((data) => {
      return data.TaskIDId != null;
    });

    let subTasksListData = TasksDetails.filter((data) => {
      return data.SubTaskIDId != null;
    });

    const batch = sp.web.createBatch();

    let list = sp.web.lists.getByTitle("Tasks");
    tasksListData.forEach((item) => {
      list.items.getById(item.TaskIDId).inBatch(batch).update({
        ReminderDays: item.Before,
        NotifyDate: item.NotifyDate,
      });
    });
    batch
      .execute()
      .then(() => {
        console.log("All done in Batch 1!");
      })
      .catch((error) => {
        console.log("Error in Batch 1!");
        errFunction(error);
      });

    const batch2 = sp.web.createBatch();
    let list2 = sp.web.lists.getByTitle("SubTasks");
    subTasksListData.forEach((item) => {
      list2.items.getById(item.SubTaskIDId).inBatch(batch2).update({
        ReminderDays: item.Before,
        NotifyDate: item.NotifyDate,
      });
    });

    batch2
      .execute()
      .then(() => {
        console.log("All done in Batch 2!");
      })
      .catch((error) => {
        console.log("Error in Batch 2!");
        errFunction(error);
      });

    const batch3 = sp.web.createBatch();
    let list3 = sp.web.lists.getByTitle("Reminder");
    TasksDetails.forEach((item: any) => {
      list3.items.inBatch(batch3).add(item);
    });

    batch3
      .execute()
      .then(() => {
        console.log("All done in Batch 3!");
        setLoader(false);
        setIsautomate(false);
        setDays(0);
        showMessage("Reminder Added Successfully", toastTopRight, "success");
      })
      .catch((error) => {
        console.log("Error in Batch 3!");
        errFunction(error);
      });
  }

  function checkAutomate() {
    setIsautomate(true);
    selectedTasks = [...arrClientSelectedTasks, ...arrBackupSelectedTasks];
    setDays(selectedTasks[0].data.data.ReminderDays);
    setTaskName(selectedTasks[0].data.data.TaskName);
    setDuedate(moment(selectedTasks[0].data.data.DueDate).format("MM/DD/YYYY"));
  }

  /*end automaion */

  const showMessage = (event, ref, severity) => {
    const label = event;

    ref.current.show({
      severity: severity,
      summary: label,
      // detail: label,
      life: 3000,
    });
  };

  let strTaskName = taskname;
  let BeforeData = duedate;

  let multipleEntry = false;
  if (selectedTasks.length == 1) {
    //BeforeData=moment(selectedTasks[0].data.data.DueDate).format("MM/DD/YYYY");
    //strTaskName=selectedTasks[0].data.data.TaskName;
  } else if (selectedTasks.length > 1) {
    BeforeData = "the due date";
    strTaskName = "Apply for multiple tasks";
    multipleEntry = true;
  }

  return (
    <>
      <Toast ref={toastTopRight} position="top-right" />
      <Dialog
        header="Header"
        position="top"
        style={{ width: "420px" }}
        className="AutomateDialog"
        visible={isAutomate}
        onHide={() => setIsautomate(false)}
      >
        <div className={styles.addCatSection}>
          <Label className={styles.Automatelabel}>Automate</Label>
          {multipleEntry ? (
            <Label style={{ color: "Red" }}>
              <br></br>
              You have selected more than one task. The current reminder will be
              applicable for all the selected item.
              <br></br>
            </Label>
          ) : (
            <h4 style={{ margin: "10px 0px 15px 0px" }}>
              Task name :{" "}
              <span style={{ color: "#f46906" }}>{strTaskName}</span>{" "}
            </h4>
          )}
          <>
            <div
              style={{
                display: "flex",
                gap: "10px",
                margin: "10px 0px",
                alignItems: "center",
              }}
            >
              <Label>Notify</Label>{" "}
              <div style={{ width: "14%" }}>
                <InputNumber
                  value={days}
                  onChange={(e: any) => setDays(e.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Label>days before </Label>
                <Label>{BeforeData}</Label>
              </div>
            </div>
          </>
          <div className={styles.catDialogBtnSection}>
            <Button
              className={styles.cancelBtn}
              onClick={() => {
                setIsautomate(false);
              }}
              label="Cancel"
            />
            <Button
              className={styles.Submitbtn}
              label="Submit"
              onClick={() => {
                if (days) {
                  setLoader(true);
                  setIsautomate(false);
                  prepareAutomationData();
                } else {
                  showMessage("Please enter value", toastTopRight, "warn");
                }
              }}
            />
          </div>
        </div>
      </Dialog>

      {loader ? (
        <Loader />
      ) : (
        <>
          <div className={styles.commonFilterSection}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {props?.viewByCardFlow ? (
                <Button
                  className={styles.righticon}
                  style={tickIconStyle}
                  // label={
                  //   props.selectedTeamMember.length
                  //     ? props.selectedTeamMember[0].TeamName
                  //     : ""
                  // }
                  icon="pi pi-arrow-left"
                  iconPos="left"
                  onClick={() => {
                    props.memberFunction(
                      props.selectedTeamByCardFlow,
                      "TeamMembers"
                    );
                  }}
                />
              ) : (
                ""
              )}
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
                    value={search}
                    onChange={(e: any) => SearchFilter(e.target.value)}
                  />
                </span>
              </div>
              <Button
                className={styles.btnColor}
                label="Automate"
                onClick={() => {
                  if (
                    arrClientSelectedTasks.length > 0 ||
                    arrBackupSelectedTasks.length > 0
                  ) {
                    checkAutomate();
                  } else {
                    showMessage(
                      "Please select any record to automate",
                      toastTopRight,
                      "warn"
                    );
                  }
                }}
              />
              <Button
                className={styles.btnColor}
                label="Export"
                icon="pi pi-file-excel"
                onClick={() => {
                  BindExportData();
                }}
              />
              <Button
                className={styles.btnColor}
                label="Done"
                onClick={() => {
                  props.HandleCompleted("Completed", user, "member");
                }}
                // icon="pi pi-file-excel"
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
          <UserTasks
            searchValue={search}
            context={props.context}
            Email={user}
            choices={statusChoices}
            clientdatafunction={getDataFromClient}
            recChoices={recurrenceChoices}
            Module={module}
            getClientTasks={getClientTasks}
            getClientSelectedTasks={getClientSelectedTasks}
            UpdatedData={clientTasks}
          />
          {/* <UserBackUpTasks searchValue={search} context={props.context} Email={backUpUser}/> */}
          <UserBackUpTasksNew
            searchValue={search}
            context={props.context}
            Email={user}
            choices={statusChoices}
            backupdatafunction={getDataFromBackup}
            recChoices={recurrenceChoices}
            Module={module}
            getBackupTasks={getBackupTasks}
            getBackupSelectedTasks={getBackupSelectedTasks}
            UpdatedData={backupTasks}
          />
        </>
      )}
    </>
  );
}
