import * as React from "react";
import { useState, useEffect } from "react";
import { Label } from "@fluentui/react";
import SPServices from "../../../Global/SPServices";
import { sp } from "@pnp/sp/presets/all";
import MyTaskDataCategory from "./MyTaskDataCategory";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import styles from "./MyTasks.module.scss";
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Avatar } from "primereact/avatar";
import Loader from "./Loader";
import { Toast } from "primereact/toast";
import exportToExcel from "../../../Global/ExportExcel";
import { Dialog } from "primereact/dialog";
let MyClients = [];
let MyCategories = [];
let MainTask = [];
let MainArray = [];
let SubTask = [];
let statusChoices = [];
export default function MyTaskDBNewCategory(props) {
  const UserEmail = !props.Email
    ? props.context.pageContext.user.email
    : props.Email;
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [curMyTask, setCurMyTask] = useState<any[]>([]);
  const [masterdata, setMasterdata] = useState<any[]>([]);
  const [clientdata, setClientdata] = useState<any[]>([]);
  const toastTopRight = React.useRef(null);
  const [categoryId, setCategoryId] = useState(null);
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
  const [isCatDialog, setIsCatDialog] = useState(false);
  const [iseditdialog, setIseditdialog] = useState(false);
  const errFunction = (err) => {
    setLoader(false);
    BindData();
    showMessage(
      "Something went wrong, Please contact system admin",
      toastTopRight,
      "error"
    );
  };

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

  //getcuruser
  const getcurUser = () => {
    if (UserEmail) {
      let user = sp.web.siteUsers
        .getByEmail(UserEmail)
        .get()
        .then((res) => {
          console.log(UserEmail);
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
          getCategories(res.Id);
        })
        .catch((err) => errFunction(err));
    } else {
      BindData();
    }
  };

  function getCategories(id) {
    SPServices.SPReadItems({
      Listname: "Categories",
      Select: "*, UserName/ID, UserName/EMail, UserName/Title",

      Expand: "UserName",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "UserName/ID",
          Operator: "eq",
          FilterValue: id,
        },
      ],
    })
      .then(function (data: any) {
        for (let i = 0; i < data.length; i++) {
          MyCategories.push({ ID: data[i].ID, Name: data[i].Title });
        }
        if (data.length > 0) getMyClients(id);
        else BindData();
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

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
      FilterCondition: "and",
    })
      .then((res) => {
        MyClients = [];
        res.forEach((val: any) => {
          MyClients.push({ ID: val.ID, Name: val.FirstName });
        });
        getMainTask(id);
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
    SPServices.SPReadItems({
      Listname: "Tasks",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName,Category/ID",

      Expand: "Assistant,Backup,Author,Client,Category",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      FilterCondition: "and",
    })
      .then((res) => {
        MainTask = [];
        res.forEach((val: any, index) => {
          if (!val.ClientId) {
            console.log(val.Id);
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
                CategoryID: val.CategoryId ? val.Category.ID : "",
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
                Created:
                  val.Author?.Title + " " + SPServices.displayDate(val.Created),

                // Created:
                //   SPServices.displayDate(val.Created) + " " + val.Author.Title,
              },
              children: [],
            });
          }
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
                  Created:
                    val.Author.Title +
                    " " +
                    SPServices.displayDate(val.Created),
                },
              });
          });

          MainArray.push({
            ...MainTask[i],
            children: SubTask,
          });
          count++;

          if (count === MainTask.length) {
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
    for (let i = 0; i < MyCategories.length; i++) {
      tempClient.push({
        Title: MyCategories[i].Name,
        ID: MyCategories[i].ID,
        Tasks: [],
      });
      for (let j = 0; j < MainArray.length; j++) {
        if (MainArray[j].data.CategoryID == MyCategories[i].ID)
          tempClient[i].Tasks.push(MainArray[j]);
      }
    }
    setCurMyTask([...MainArray]);
    setMasterdata([...MainArray]);
    setClientdata([...tempClient]);
    setLoader(false);
  }

  const SearchFilter = (e) => {
    setSearch(e);

    // let filteredResults = masterdata.filter((item) => {
    //   if (item.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())) {
    //     return true;
    //   }

    //   const childMatches = item.children.filter((child) =>
    //     child.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())
    //   );

    //   if (childMatches.length > 0) {
    //     return true;
    //   }

    //   return false;
    // });

    // setCurMyTask([...filteredResults]);
  };

  let columns = [
    { header: "Task Name", key: "TaskName", width: 15 },
    { header: "Parent Task Name", key: "ParenTask", width: 15 },
    { header: "Creator", key: "Creator", width: 25 },
    { header: "Backup", key: "Backup", width: 25 },
    { header: "DueDate", key: "DueDate", width: 25 },

    { header: "Priority Level", key: "PriorityLevel", width: 25 },
    { header: "Status", key: "Status", width: 25 },
    { header: "Creation log", key: "Created", width: 25 },
  ];

  const exportData = () => {
    exportToExcel(curMyTask, columns, "MyTask");
  };

  function onSpinner() {
    //setLoader(true);
  }

  function offSpinner() {
    //setLoader(false);
  }

  function addCategory(value) {
    setLoader(true);
    SPServices.SPAddItem({
      Listname: "Categories",
      RequestJSON: {
        Title: value,
        UserNameId: curuserId.Id,
      },
    })
      .then(function (res) {
        MyCategories.push({ ID: res.data.ID, Name: value });
        let tempClient = [...clientdata];
        tempClient.push({
          Title: value,
          ID: res.data.ID,
          Tasks: [],
        });
        setClientdata([...tempClient]);
        setCategoryValue("");
        setIsCatDialog(false);
        setLoader(false);
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  function validation() {
    let isAllValueFilled = true;
    if (!categoryValue) {
      isAllValueFilled = false;
    }
    return isAllValueFilled;
  }

  const showMessage = (event, ref, severity) => {
    const label = event;

    ref.current.show({
      severity: severity,
      summary: label,
      // detail: label,
      life: 3000,
    });
  };
  const UpdateCategory = (value, Id) => {
    setLoader(true);
    SPServices.SPUpdateItem({
      Listname: "Categories",
      ID: Id,
      RequestJSON: {
        Title: value,
      },
    })
      .then((val) => {
        console.log(val);
        setLoader(false);
        setCategoryId(null);
        setIseditdialog(false);
        setCategoryValue("");
      })
      .catch((err) => {
        errFunction(err);
      });
  };
  const Editcategory = (value, value1, value3) => {
    setIseditdialog(value);
    setCategoryValue(value1);
    setCategoryId(value3);
    console.log(value, value1, value3);
  };

  useEffect(() => {
    setLoader(true);
    MyClients = [];
    MyCategories = [];
    MainTask = [];
    MainArray = [];
    SubTask = [];
    statusChoices = [];
    getStatus();
    getcurUser();
  }, [props.Email]);

  return (
    <>
      <Dialog
        header="Header"
        style={{ width: "420px" }}
        visible={isCatDialog}
        onHide={() => setIsCatDialog(false)}
      >
        <div className={styles.addCatSection}>
          <Label>Add New Category</Label>
          <div>
            <InputText
              style={{ width: "100%" }}
              value={categoryValue}
              onChange={(e: any) => setCategoryValue(e.target.value)}
            />
          </div>
          <div className={styles.catDialogBtnSection}>
            <Button
              className={styles.btnColor}
              onClick={() => {
                if (validation()) addCategory(categoryValue);
                else
                  showMessage(
                    "Please enter valid Category",
                    toastTopRight,
                    "warn"
                  );
              }}
              label="Add"
            />
            <Button
              className={styles.btnColor}
              onClick={() => {
                setCategoryValue("");
                setIsCatDialog(false);
              }}
              label="Cancel"
            />
          </div>
        </div>
      </Dialog>
      <Dialog
        header="Header"
        style={{ width: "420px" }}
        visible={iseditdialog}
        onHide={() => setIsCatDialog(false)}
      >
        <div className={styles.addCatSection}>
          <Label>Update Category</Label>
          <div>
            <InputText
              style={{ width: "100%" }}
              value={categoryValue}
              onChange={(e: any) => setCategoryValue(e.target.value)}
            />
          </div>
          <div className={styles.catDialogBtnSection}>
            <Button
              className={styles.btnColor}
              onClick={() => {
                if (validation()) UpdateCategory(categoryValue, categoryId);
                else
                  showMessage(
                    "Please enter valid Category",
                    toastTopRight,
                    "warn"
                  );
              }}
              label="Update"
            />
            <Button
              className={styles.btnColor}
              onClick={() => {
                setCategoryValue("");
                setIseditdialog(false);
              }}
              label="Cancel"
            />
          </div>
        </div>
      </Dialog>

      {loader ? (
        <Loader />
      ) : (
        <>
          <div className={styles.commonFilterSection}>
            <div>
              <Label className={styles.leftFilterSection}></Label>
              <>
                <div>
                  <Toast ref={toastTopRight} position="top-right" />
                </div>
              </>
            </div>
            <div className={styles.rightFilterSection}>
              <div>
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    placeholder="Search"
                    className="searchFilter"
                    value={search}
                    onChange={(e: any) => SearchFilter(e.target.value)}
                  />
                </span>
              </div>

              <Button
                className={styles.btnColor}
                label="Export"
                onClick={() => exportData()}
                icon="pi pi-file-excel"
              />
              <Button className={styles.btnColor} label="Automate" />
              <Button
                className={styles.btnColor}
                label="Add Category"
                onClick={() => {
                  setIsCatDialog(true);
                }}
              />
            </div>
          </div>
          <>
            {clientdata.length > 0 ? (
              <>
                {clientdata.map((val, i) => {
                  return (
                    <>
                      <MyTaskDataCategory
                        bind={false}
                        clientName={""}
                        clientId={""}
                        categoryName={val.Title}
                        categoryId={val.ID}
                        searchValue={search}
                        Editcategory={Editcategory}
                        onspinner={onSpinner}
                        offspinner={offSpinner}
                        context={props.context}
                        mainData={val.Tasks}
                        crntUserData={curuserId}
                        crntBackData={configure}
                        choices={statusChoices}
                      />
                    </>
                  );
                })}
              </>
            ) : (
              <>
                <MyTaskDataCategory
                  bind={false}
                  clientName={""}
                  clientId={""}
                  categoryName={""}
                  categoryId={""}
                  searchValue={""}
                  onspinner={onSpinner}
                  offspinner={offSpinner}
                  context={props.context}
                  mainData={curMyTask}
                  crntUserData={curuserId}
                  crntBackData={configure}
                  choices={statusChoices}
                />
              </>
            )}
          </>
        </>
      )}
    </>
  );
}
