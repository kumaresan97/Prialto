import * as React from "react";
import { useState, useEffect } from "react";
import { TreeTable, TreeTableExpandedKeysType } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IPersonaStyles, Label } from "@fluentui/react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { sp } from "@pnp/sp/presets/all";
import styles from "./MyTasks.module.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import SPServices from "../../../Global/SPServices";
import { IChild, IMyTasks, IParent } from "../../../Global/TaskMngmnt";
import * as moment from "moment";
import { Panel, findIndex } from "office-ui-fabric-react";
import Loader from "./Loader";

import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import SidePanel from "./SidePanel";
import QuillEditor from "./QuillEditor";
import { Menu } from "primereact/menu";
const categoryImg: any = require("../assets/images/important.png");
let x = [];
let arrdisplayItems = []; //manipulation array just for data store..
const cities = [
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
];
const dropval = [
  { name: "High", code: "High" },
  { name: "Normal", code: "Urgent" },
  { name: "Urgent", code: "Normal" },
];

let dropStatus = [
  // { name: "Pending", code: "Pending" },
  // { name: "In Progress", code: "In Progress" },
  // { name: "Completed", code: "Completed" },
  // { name: "Done", code: "Done" },
];

let dropRecurrence = [];

let MyClients = [];
let MainTask: IParent[] = [];
let SubTask: IChild[] = [];
let MainArray: IParent[] = [];
const editIconStyle = {
  backgroundColor: "transparent",
  color: "#007C81",
  border: "none",
  // height: 26,
  // width: 26,
};

const pencilIconBtnStyle = {
  color: "#007C81",
  border: "none",
  backgroundColor: "transparent",
  height: 26,
  width: 26,
  marginLeft: 4,
};

const MyTaskDataCategory = (props): JSX.Element => {
  let commentDetailsVar = {
    CommentsText: "",
    TaggedPeople: "",
    TaskIDId: "",
  };

  // style variables
  const cellStyle = { backgroundColor: "#fff", width: 176 };
  // const cellStyle = { backgroundColor: "#EAEEEE", width: 200 };
  // const TaskCellStyle = { backgroundColor: "#EAEEEE", width: 265 };
  const TaskCellStyle = { backgroundColor: "#fff", width: 265 };
  const actionCellStyle = { backgroundColor: "#fff", width: 150 };
  // const actionCellStyle = { backgroundColor: "#EAEEEE", width: 150 };
  const iconbtnStyle = {
    backgroundColor: "transparent",
    // color: "#007C81",
    color: "#555555",
    border: "none",
    height: 24,
    width: 24,
    marginLeft: 4,
    // borderRadius: "50%",
  };
  const tickIconStyle = {
    backgroundColor: "transparent",
    border: "transparent",
    color: "#007C81",
    // color: "#555555",
  };
  const pencilIconBtnStyle = {
    // color: "#007C81",
    color: "#555555",
    border: "none",
    backgroundColor: "transparent",
    height: 26,
    width: 26,
    marginLeft: 4,
  };
  const delIconBtnStyle = {
    color: "#BF4927",
    border: "none",
    backgroundColor: "transparent",
    height: 26,
    width: 26,
    fontSize: "1.3rem",
  };
  const personaStyle: Partial<IPersonaStyles> = {
    root: {
      ".ms-Persona-image": {
        borderRadius: 8,
      },
    },
  };
  const peopickerStyle = {
    root: {
      ".ms-PickerPersona-container": {
        minHeight: 34,
      },
    },
  };

  dropStatus = props.choices;
  dropRecurrence = props.recChoices;
  //const UserEmail=!props.Email?props.context.pageContext.user.email:props.Email;

  const [MData, setMData] = useState<any[]>([]);

  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);
  const [search, setSearch] = useState("");
  const [loader, setLoader] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteObj, setDeleteObj] = useState<any>({});
  const [curuserId, setCuruserId] = useState(props.crntUserData);
  const [iseditdialog, setIseditdialog] = useState(false);
  const [isDeletedialog, setIsDeletedialog] = useState(false);

  const [categoryValue, setCategoryValue] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [isCatDialog, setIsCatDialog] = useState(false);
  const [displayItems, setDisplayItems] = useState([]);

  const data: IMyTasks = {
    HasComments: false,
    TaskName: "",
    ClientName: "",
    ClientID: 0,
    DueDate: "",
    PriorityLevel: "",
    Status: "",
    Recurrence: "",
    CreatedByFlow: false,
    RecurParent: "",
    Created: new Date().toString(),
    Backup: {
      EMail: "",
      Id: null,
      Title: "",
    },
    Creator: {
      EMail: curuserId.EMail,
      Id: curuserId.Id,
      Title: curuserId.Title,
    },
    ReminderRef: 0,
    ReminderDays: 0,
  };
  const [configure, setConfigure] = useState(props.crntBackData);
  const [expandedKeys, setExpandedKeys] =
    useState<TreeTableExpandedKeysType | null>(null);

  const _sampleParent: IParent = {
    key: "",
    Id: null,
    isParent: true,
    isClick: false,
    isEdit: false,
    isAdd: false,
    data: {
      HasComments: false,
      TaskName: "",
      ClientName: "",
      DueDate: "",
      PriorityLevel: "",
      Status: "",
      Recurrence: "",
      CreatedByFlow: false,
      RecurParent: "",
      Created: new Date().toString(),
      Backup: {
        EMail: configure.EMail,
        Id: configure.backupId,
        Title: configure.Title,
      },
      Creator: {
        EMail: curuserId.EMail,
        Id: curuserId.Id,
        Title: curuserId.Title,
      },
      ReminderRef: 0,
      ReminderDays: 0,
    },
    children: [],
  };

  const _sampleChild: IChild = {
    key: "",
    Id: null,
    isParent: false,
    subId: null,
    isClick: false,
    isEdit: false,
    isAdd: false,
    data: {
      HasComments: false,
      TaskName: "",
      ClientName: "",
      DueDate: "",
      PriorityLevel: "",
      Status: "",
      Recurrence: "",
      CreatedByFlow: false,
      RecurParent: "",
      Created: new Date().toString(),
      Backup: {
        EMail: configure.EMail,
        Id: configure.backupId,
        Title: configure.Title,
      },
      Creator: {
        EMail: curuserId.EMail,
        Id: curuserId.Id,
        Title: curuserId.Title,
      },
      ReminderRef: 0,
      ReminderDays: 0,
    },
  };

  const [curdata, setCurdata] = useState<IMyTasks>(data);
  const [curMyTask, setCurMyTask] = useState<any[]>([]);

  const [masterdata, setMasterdata] = useState<any[]>([]);

  const toastTopRight = React.useRef(null);
  // style function
  const priorityLevelStyle = (PLevel) => {
    let bgColor: string = "";
    let color: string = "";
    if (PLevel == "Urgent") {
      color = "#dc3100";
      bgColor = "#ffe5dd";
    } else if (PLevel == "High") {
      // bgColor = "#ffd5b8";
      // color = "#f46906";
      bgColor = "#ffeadb";
      color = "#bc0000";
    } else if (PLevel == "Normal") {
      bgColor = "#d5fdff";
      color = "#00525d";
    } else if (PLevel == "In Progress") {
      bgColor = "#d9fffd";
      color = "#005b5d";
    } else if (PLevel == "Pending") {
      bgColor = "#f5ffbd";
      color = "#5c5c5c";
    } else if (PLevel == "Completed") {
      bgColor = "#c7ffc7";
      color = "#1a8100";
    } else if (PLevel == "Done") {
      bgColor = "#daffd6";
      color = "#175200";
    } else if (PLevel == "One time") {
      bgColor = "#d6dcff";
      color = "#182154";
    } else if (PLevel == "Daily") {
      bgColor = "#ffdcdc";
      color = "#680000";
    } else if (PLevel == "Every Monday") {
      bgColor = "#ffe7d5";
      color = "#6f3000";
    } else if (PLevel == "Every Tuesday") {
      bgColor = "#ecffce";
      color = "#355800";
    } else if (PLevel == "Every Wednesday") {
      bgColor = "#f2ffd6";
      color = "#1b4d00";
    } else if (PLevel == "Every Thursday") {
      bgColor = "#ffcef4";
      color = "#6c0054";
    } else if (PLevel == "Every Friday") {
      bgColor = "#ffeaea";
      color = "#a55b5b";
    } else if (PLevel == "Every Saturday") {
      bgColor = "#e1d5ff";
      color = "#20006f";
    } else if (PLevel == "Every Sunday") {
      bgColor = "#ffd4e8";
      color = "#6d0034";
    } else if (PLevel == "Weekly") {
      bgColor = "#ffd0d0";
      color = "#700000";
    } else if (PLevel == "Monthly") {
      bgColor = "#d9f8ff";
      color = "#003c4a";
    } else if (PLevel == "On-hold") {
      bgColor = "#f7f6da";
      color = "#4a4a3b";
    } else {
      bgColor = "#daffd6";
      color = "#175200";
    }
    return (
      <div
        className={styles.pLevelStyle}
        style={{ backgroundColor: bgColor, color: color }}
      >
        {PLevel}
      </div>
    );
  };

  //onchange values get
  const getOnchange = (key, _value) => {
    let FormData = { ...curdata };
    if (key == "Backup") {
      FormData.Backup.Id = _value.id;
      FormData.Backup.EMail = _value.secondaryText;
      FormData.Backup.Title = _value.text;
    } else if (key == "Status" || key == "PriorityLevel") {
      FormData[key] = _value;
    }

    // if(key=="Backup"){
    //     FormData.Backup.Id=_value
    // }
    else {
      FormData[key] = _value;
    }

    setCurdata({ ...FormData });
  };

  //delete,update,add buttons

  const _action = (obj: any): JSX.Element => {
    return (
      <div className={styles.tblAction}>
        <Button
          disabled={obj.isClick}
          type="button"
          icon="pi pi-plus"
          style={iconbtnStyle}
          onClick={(_) => {
            _handleData("addChild", obj);
            toggleApplications(obj.key);
          }}
        />
        <Button
          disabled={obj.isClick}
          type="button"
          icon="pi pi-pencil"
          style={iconbtnStyle}
          onClick={(_) => {
            _handleData("edit", obj);
          }}
        />
        {/* <Button
          disabled={obj.isClick}
          type="button"
          icon="pi pi-comment"
          style={pencilIconBtnStyle}
          onClick={(_) => {
            // console.log("sdfi", obj.Id);
            // setCommentsPanel({
            //   open: true,
            //   rowData: obj.Id,
            // });
            // _handleData("edit", obj);
          }}
        /> */}
        <Button
          style={delIconBtnStyle}
          disabled={obj.isClick}
          type="button"
          icon="pi pi-trash"
          onClick={() => {
            setDeleteObj(obj);
            setVisible(true);
            //deleteData(obj);
          }}
        />
      </div>
    );
  };
  //check,cancelbutton
  const _actionSubmit = (obj: any): JSX.Element => {
    return (
      <div className={styles.actionContainer}>
        <Button
          type="button"
          style={tickIconStyle}
          icon="pi pi-check"
          onClick={(_) => {
            if (validation(obj)) {
              _handleDataoperation(obj);
            } else {
            }
          }}
        />
        <Button
          type="button"
          style={delIconBtnStyle}
          icon="pi pi-times"
          onClick={(_) => {
            _handleData("cancel", obj);
            setCurdata({ ...data });
          }}
        />
      </div>
    );
  };
  //handle update,delete,edit
  const _handleDataoperation = (obj) => {
    setLoader(true);
    //if (obj.isParent && obj.isEdit && obj.Id) {
    if (obj.isEdit && obj.Id) {
      Editfunction(obj);
    } else if (obj.isParent && !obj.Id) {
      AddItem(obj);
    } else if (!obj.isParent && !obj.Id) {
      AddItem(obj);
    }
  };
  //Add item
  const AddItem = (obj) => {
    let ListName = obj.isParent ? "Tasks" : "SubTasks";
    let strDoneOnTime = "Overdue";
    let daysEarly = 0;

    if (
      moment(curdata.DueDate).format("YYYY-MM-DD") >=
        moment().format("YYYY-MM-DD") &&
      curdata.Status["name"] == "Done"
    ) {
      strDoneOnTime = "Done On Time";
      var TDate = moment(moment().format("YYYY-MM-DD"));
      daysEarly = moment(curdata.DueDate).diff(TDate, "days");
    } else if (
      moment(curdata.DueDate).format("YYYY-MM-DD") >=
        moment().format("YYYY-MM-DD") &&
      curdata.Status["name"] != "Done"
    ) {
      strDoneOnTime = "On Track";
    }

    let sub = {
      TaskName: curdata.TaskName ? curdata.TaskName : "",
      AssistantId: curuserId.Id,
      // BackupId: curdata.Backup.Id
      //   ? curdata.Backup.Id
      //   : configure.backupId
      //   ? configure.backupId
      //   : null,
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      Recurrence: curdata.Recurrence["name"] ? curdata.Recurrence["name"] : "",
      MainTaskIDId: Number(obj.key.split("-")[0]),
      CategoryId: props.categoryId,
      TaskAge: 0,
      CompletedDate:
        curdata.Status["name"] == "Done" ? moment().format() : null,
      DoneFormula: strDoneOnTime,
      DaysOnEarly: daysEarly,
      CreatedByFlow: false,
    };
    let Main = {
      TaskName: curdata.TaskName ? curdata.TaskName : "",
      // BackupId: curdata.Backup.Id
      //   ? curdata.Backup.Id
      //   : configure.backupId
      //   ? configure.backupId
      //   : null,
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      Recurrence: curdata.Recurrence["name"] ? curdata.Recurrence["name"] : "",
      AssistantId: curuserId.Id,
      CategoryId: props.categoryId,
      TaskAge: 0,
      CompletedDate:
        curdata.Status["name"] == "Done" ? moment().format() : null,
      DoneFormula: strDoneOnTime,
      DaysOnEarly: daysEarly,
      CreatedByFlow: false,
    };

    let Json = obj.isParent ? Main : sub;

    SPServices.SPAddItem({
      Listname: ListName,
      RequestJSON: Json,
    })
      .then(async (res) => {
        /*For Recurrence Insert */
        let newJson = {
          TaskIDId: res.data.ID,
          RecurrenceType: curdata.Recurrence["name"],
          Status: "InProgress",
        };

        let newSubJson = {
          SubTaskIDId: res.data.ID,
          RecurrenceType: curdata.Recurrence["name"],
          Status: "InProgress",
        };

        let inputJson = obj.isParent ? newJson : newSubJson;
        AddRecurrence(curdata.Recurrence["name"], inputJson);

        // if(curdata.Status["name"]!="Completed"&&curdata.Status["name"]!="On-hold"&&curdata.Status["name"]!="one time"){
        // await SPServices.SPAddItem({
        // Listname:"Recurrence",
        // RequestJSON:inputJson
        // }).then(function(data){}).catch(function(error){
        //   errFunction(error);
        // })
        //}
        /*For Recurrence Update */

        let newData = {};
        //Preparing Parent or Child object here.
        if (obj.isParent) {
          newData = {
            key: res.data.ID,
            Id: res.data.ID,
            isParent: true,
            isClick: false,
            isEdit: false,
            isAdd: false,
            data: {
              TaskName: Json.TaskName,
              ClientName: props.clientName,
              //ClientID: props.clientId,
              DueDate: SPServices.displayDate(Json.DueDate),
              PriorityLevel: Json.PriorityLevel,
              Status: Json.Status,
              Recurrence: Json.Recurrence,
              Created: moment().format("YYYY-MM-DD"),
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              Creator: curdata.Creator,
              CategoryID: props.categoryId,
              ReminderRef: 0,
              ReminderDays: 0,
            },
            children: [],
          };
          BindAfternewData(newData);
        } else {
          //Manipulation done here to prepare the array index and then the key of the object for childern.
          let indexOfObj = curMyTask.findIndex((data) => data.Id == obj.subId);
          let indexOfChildren = -1;
          let lengthOfObject = 0;
          if (indexOfObj >= 0) {
            lengthOfObject = curMyTask[indexOfObj].children.length;
            indexOfChildren = curMyTask[indexOfObj].children.findIndex(
              (data) => !data.Id
            );
          } else {
            lengthOfObject = 1;
          }

          newData = {
            //key: `${obj.subId}-${lengthOfObject}`,
            key: obj.key,
            Index: lengthOfObject - 1,
            Id: res.data.ID,
            subId: obj.subId,
            isClick: false,
            isParent: false,
            isAdd: false,
            isEdit: false,
            data: {
              TaskName: curdata.TaskName,
              ClientName: props.clientName,
              CategoryID: props.categoryId,
              //ClientID: props.clientId,
              Creator: curdata.Creator,
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              DueDate: SPServices.displayDate(Json.DueDate),
              PriorityLevel: Json.PriorityLevel,
              Status: Json.Status,
              Recurrence: Json.Recurrence,
              Created: moment().format("YYYY-MM-DD"),
              ReminderRef: 0,
              ReminderDays: 0,
            },
          };

          if (indexOfObj >= 0)
            BindAfternewChildData(
              newData,
              indexOfObj,
              indexOfChildren,
              "Added"
            );
        }
      })
      .catch((err) => errFunction(err));
  };
  //deleteitem
  const deleteData = (obj) => {
    setLoader(true);
    let ListName = obj.isParent ? "Tasks" : "SubTasks";
    let Ids = [];

    ListName === "Tasks" &&
      obj.children.length &&
      obj?.children.map((val) =>
        Ids.push({
          Id: val.Id,
          isParent: val.isParent,
        })
      );

    SPServices.SPDeleteItem({
      Listname: ListName,
      ID: obj.Id,
    })
      .then((res) => {
        if (Ids.length) {
          DeleteFunction(obj);
          for (let i: number = 0; Ids.length > i; i++) {
            SPServices.SPDeleteItem({
              Listname: "SubTasks",
              ID: Ids[i].Id,
            })
              .then((res) => {
                if (Ids.length === i + 1) {
                  console.log("delete successfully");
                  //getcurUser();
                }
              })
              .catch((err) => {
                errFunction(err);
              });
          }
        } else {
          console.log("delete successfully");
          DeleteFunction(obj);
        }
      })
      .catch((err) => {
        errFunction(err);
      });
  };

  function DeleteFunction(obj) {
    if (obj.isParent) {
      BindAfterDataDelete(obj.Id);
    } else {
      BindAfterChildDataDelete(obj.Id, obj.subId, obj.Index);
    }
  }

  async function AddRecurrence(Status, dataJson) {
    if (Status != "Done" && Status != "On-hold" && Status != "One time") {
      await SPServices.SPAddItem({
        Listname: "Recurrence",
        RequestJSON: dataJson,
      })
        .then(function (data) {})
        .catch(function (error) {
          errFunction(error);
        });
    }
  }

  async function UpdateRecurrence(Status, dataJson, ListID) {
    if (Status != "Done" && Status != "On-hold" && Status != "One time") {
      await SPServices.SPUpdateItem({
        Listname: "Recurrence",
        ID: ListID,
        RequestJSON: dataJson,
      })
        .then(function (data) {})
        .catch(function (error) {
          errFunction(error);
        });
    }
  }

  async function UpdateParentItemRecurrence(recordID, Status, obj) {
    let listName = obj.isParent ? "Tasks" : "SubTasks";
    await SPServices.SPUpdateItem({
      Listname: listName,
      ID: recordID,
      RequestJSON: {
        Recurrence: Status,
      },
    })
      .then(function () {})
      .catch(function (error) {
        errFunction(error);
      });
  }

  async function InsertOrUpdateRecurrence(recordID, obj, Status) {
    /*For Recurrence Update */
    let newJson = {
      TaskIDId: recordID,
      RecurrenceType: Status,
      Status: "InProgress",
    };

    let newSubJson = {
      SubTaskIDId: recordID,
      RecurrenceType: Status,
      Status: "InProgress",
    };

    let inputJson = obj.isParent ? newJson : newSubJson;
    let filterValue = obj.isParent ? "TaskID/ID" : "SubTaskID/ID";

    SPServices.SPReadItems({
      Listname: "Recurrence",
      Select: "*,TaskID/ID,SubTaskID/ID",
      Expand: "TaskID,SubTaskID",
      Filter: [
        {
          FilterKey: filterValue,
          FilterValue: recordID,
          Operator: "eq",
        },
      ],
    })
      .then(function (data: any) {
        if (data.length > 0) {
          UpdateRecurrence(Status, inputJson, data[0].ID);
        } else {
          AddRecurrence(Status, inputJson);
        }
      })
      .catch(function (error) {
        errFunction(error);
      });
    /*For Recurrence Update */
  }

  //editfunction
  const Editfunction = (obj) => {
    let ListName = obj.isParent ? "Tasks" : "SubTasks";

    let daysEarly = 0;
    let strDoneOnTime = "Overdue";
    if (
      moment(curdata.DueDate).format("YYYY-MM-DD") >=
        moment().format("YYYY-MM-DD") &&
      curdata.Status["name"] == "Done"
    ) {
      strDoneOnTime = "Done On Time";
      var TDate = moment(moment().format("YYYY-MM-DD"));
      daysEarly = moment(curdata.DueDate).diff(TDate, "days");
    } else if (
      moment(curdata.DueDate).format("YYYY-MM-DD") >=
        moment().format("YYYY-MM-DD") &&
      curdata.Status["name"] != "Done"
    ) {
      strDoneOnTime = "On Track";
    }

    let isRecurChanged = false;
    if (curdata.Recurrence["name"] != obj.data.Recurrence) {
      isRecurChanged = true;
    }

    let editval = {
      TaskName: curdata.TaskName,
      //BackupId: curdata.Backup.Id ? curdata.Backup.Id : null,
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      Recurrence: curdata.Recurrence["name"] ? curdata.Recurrence["name"] : "",
      TaskAge: 0,
      CompletedDate:
        curdata.Status["name"] == "Done" ? moment().format() : null,
      DoneFormula: strDoneOnTime,
      DaysOnEarly: daysEarly,
    };

    SPServices.SPUpdateItem({
      Listname: ListName,
      ID: obj.Id,
      RequestJSON: editval,
    })
      .then((res) => {
        if (!curdata.CreatedByFlow) {
          InsertOrUpdateRecurrence(obj.Id, obj, curdata.Recurrence["name"]);
        } else if (curdata.CreatedByFlow && isRecurChanged) {
          if (curdata.RecurParent)
            UpdateParentItemRecurrence(
              curdata.RecurParent,
              curdata.Recurrence["name"],
              obj
            );
          //As of now disabled we need to confirm..
        }

        let newData = {};
        if (obj.isParent) {
          newData = {
            key: obj.Id,
            Id: obj.Id,
            isParent: true,
            isClick: false,
            isEdit: false,
            isAdd: false,
            data: {
              TaskName: editval.TaskName,
              ClientName: props.clientName,
              CategoryID: props.categoryId,
              //ClientID: props.clientId,
              DueDate: SPServices.displayDate(editval.DueDate),
              PriorityLevel: editval.PriorityLevel,
              Status: editval.Status,
              Recurrence: editval.Recurrence,
              CreatedByFlow: curdata.CreatedByFlow,
              RecurParent: curdata.RecurParent,
              Created: moment().format("YYYY-MM-DD"),
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              Creator: curdata.Creator,
              ReminderRef: curdata.ReminderRef,
              ReminderDays: curdata.ReminderDays,
            },
            children: obj.children,
          };
          BindAfterDataEdit(newData, obj);
        } else {
          newData = {
            key: obj.key,
            Index: obj.Index,
            Id: obj.Id,
            // Id: res.data.ID,
            subId: obj.subId,
            isClick: false,
            isParent: false,
            isAdd: false,
            isEdit: false,
            data: {
              TaskName: curdata.TaskName,
              ClientName: props.clientName,
              CategoryID: props.categoryId,
              //ClientID: props.clientId,
              Creator: curdata.Creator,
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              DueDate: SPServices.displayDate(editval.DueDate),
              PriorityLevel: editval.PriorityLevel,
              Status: editval.Status,
              Recurrence: editval.Recurrence,
              CreatedByFlow: curdata.CreatedByFlow,
              RecurParent: curdata.RecurParent,
              Created: moment().format("YYYY-MM-DD"),
              ReminderRef: curdata.ReminderRef,
              ReminderDays: curdata.ReminderDays,
            },
          };
          let indexOfObj = curMyTask.findIndex((data) => data.Id == obj.subId);
          if (indexOfObj >= 0)
            BindAfternewChildData(newData, indexOfObj, obj.Index, "Updated");
        }
      })
      .catch((err) => errFunction(err));
  };

  // const Editfunction = (obj) => {
  //   let ListName = obj.isParent ? "Tasks" : "SubTasks";
  //   console.log("obj0", obj);
  //   console.log("curdayta", curdata);

  //   let pendingChild =
  //     obj.isParent && obj?.children?.filter((el) => el?.Status !== "Done");

  //   console.log("pendingChild", pendingChild);

  //   let daysEarly = 0;
  //   let strDoneOnTime = "Overdue";
  //   if (
  //     moment(curdata.DueDate).format("YYYY-MM-DD") >=
  //       moment().format("YYYY-MM-DD") &&
  //     curdata.Status["name"] == "Done"
  //   ) {
  //     strDoneOnTime = "Done On Time";
  //     var TDate = moment(moment().format("YYYY-MM-DD"));
  //     daysEarly = moment(curdata.DueDate).diff(TDate, "days");
  //   } else if (
  //     moment(curdata.DueDate).format("YYYY-MM-DD") >=
  //       moment().format("YYYY-MM-DD") &&
  //     curdata.Status["name"] != "Done"
  //   ) {
  //     strDoneOnTime = "On Track";
  //   }

  //   let isRecurChanged = false;
  //   if (curdata.Recurrence["name"] != obj.data.Recurrence) {
  //     isRecurChanged = true;
  //   }

  //   let editval = {
  //     TaskName: curdata.TaskName,
  //     //BackupId: curdata.Backup.Id ? curdata.Backup.Id : null,
  //     DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
  //     PriorityLevel: curdata.PriorityLevel["name"]
  //       ? curdata.PriorityLevel["name"]
  //       : "",
  //     Status: curdata.Status["name"] ? curdata.Status["name"] : "",
  //     Recurrence: curdata.Recurrence["name"] ? curdata.Recurrence["name"] : "",
  //     TaskAge: 0,
  //     CompletedDate:
  //       curdata.Status["name"] == "Done" ? moment().format() : null,
  //     DoneFormula: strDoneOnTime,
  //     DaysOnEarly: daysEarly,
  //   };

  //   SPServices.SPUpdateItem({
  //     Listname: ListName,
  //     ID: obj.Id,
  //     RequestJSON: editval,
  //   })
  //     .then((res) => {
  //       if (!curdata.CreatedByFlow) {
  //         InsertOrUpdateRecurrence(obj.Id, obj, curdata.Recurrence["name"]);
  //       } else if (curdata.CreatedByFlow && isRecurChanged) {
  //         if (curdata.RecurParent)
  //           UpdateParentItemRecurrence(
  //             curdata.RecurParent,
  //             curdata.Recurrence["name"],
  //             obj
  //           );
  //         //As of now disabled we need to confirm..
  //       }

  //       let newData = {};
  //       if (obj.isParent) {
  //         newData = {
  //           key: obj.Id,
  //           Id: obj.Id,
  //           isParent: true,
  //           isClick: false,
  //           isEdit: false,
  //           isAdd: false,
  //           data: {
  //             TaskName: editval.TaskName,
  //             ClientName: props.clientName,
  //             CategoryID: props.categoryId,
  //             //ClientID: props.clientId,
  //             DueDate: SPServices.displayDate(editval.DueDate),
  //             PriorityLevel: editval.PriorityLevel,
  //             Status: editval.Status,
  //             Recurrence: editval.Recurrence,
  //             CreatedByFlow: curdata.CreatedByFlow,
  //             RecurParent: curdata.RecurParent,
  //             Created: moment().format("YYYY-MM-DD"),
  //             Backup: curdata.Backup.Id ? curdata.Backup : configure,
  //             Creator: curdata.Creator,
  //             ReminderRef: curdata.ReminderRef,
  //             ReminderDays: curdata.ReminderDays,
  //           },
  //           children: obj.children,
  //         };
  //         BindAfterDataEdit(newData, obj);
  //         if (obj?.Status.name === "Done" && pendingChild?.length !== 0) {
  //           obj.children?.map((e) => {
  //             if (e?.chidren?.Status !== "Done") {
  //               newData = {
  //                 key: e.key,
  //                 Index: e.Index,
  //                 Id: e.Id,
  //                 // Id: res.data.ID,
  //                 subId: e.subId,
  //                 isClick: false,
  //                 isParent: false,
  //                 isAdd: false,
  //                 isEdit: false,
  //                 data: {
  //                   TaskName: curdata.TaskName,
  //                   ClientName: props.clientName,
  //                   CategoryID: props.categoryId,
  //                   //ClientID: props.clientId,
  //                   Creator: curdata.Creator,
  //                   Backup: curdata.Backup.Id ? curdata.Backup : configure,
  //                   DueDate: SPServices.displayDate(editval.DueDate),
  //                   PriorityLevel: editval.PriorityLevel,
  //                   Status: "Done",
  //                   Recurrence: editval.Recurrence,
  //                   CreatedByFlow: curdata.CreatedByFlow,
  //                   RecurParent: curdata.RecurParent,
  //                   Created: moment().format("YYYY-MM-DD"),
  //                   ReminderRef: curdata.ReminderRef,
  //                   ReminderDays: curdata.ReminderDays,
  //                 },
  //               };
  //             }
  //           });

  //           console.log("newddd", newData);

  //           obj.children.forEach((element) => {
  //             BindAfternewChildData(
  //               newData,
  //               element.subId,
  //               element.Index,
  //               "Updated"
  //             );
  //           });
  //         }
  //       } else {
  //         newData = {
  //           key: obj.key,
  //           Index: obj.Index,
  //           Id: obj.Id,
  //           // Id: res.data.ID,
  //           subId: obj.subId,
  //           isClick: false,
  //           isParent: false,
  //           isAdd: false,
  //           isEdit: false,
  //           data: {
  //             TaskName: curdata.TaskName,
  //             ClientName: props.clientName,
  //             CategoryID: props.categoryId,
  //             //ClientID: props.clientId,
  //             Creator: curdata.Creator,
  //             Backup: curdata.Backup.Id ? curdata.Backup : configure,
  //             DueDate: SPServices.displayDate(editval.DueDate),
  //             PriorityLevel: editval.PriorityLevel,
  //             Status: editval.Status,
  //             Recurrence: editval.Recurrence,
  //             CreatedByFlow: curdata.CreatedByFlow,
  //             RecurParent: curdata.RecurParent,
  //             Created: moment().format("YYYY-MM-DD"),
  //             ReminderRef: curdata.ReminderRef,
  //             ReminderDays: curdata.ReminderDays,
  //           },
  //         };

  //         let indexOfObj = curMyTask.findIndex((data) => data.Id == obj.subId);
  //         if (indexOfObj >= 0)
  //           BindAfternewChildData(newData, indexOfObj, obj.Index, "Updated");
  //       }
  //     })
  //     .catch((err) => errFunction(err));
  // };

  //handledata

  const _handleData = (type: string, obj: any): void => {
    let _curArray: any[] = [];

    if (type == "addChild") {
      _curArray = [...curMyTask].map((val: any) => {
        //   _curArray = _curArray.map((val: any) => {
        if (val.Id == obj.key.toString().split("-")[0]) {
          val.isClick = true;
          val.isEdit = false;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = true),
              (child.isEdit = false),
              (child.isAdd = false)
            )
          );
          val.children.push({
            ..._sampleChild,
            key: val.Id + "-" + (val.children.length + 1),
            subId: val.Id,
            isAdd: true,
            isClick: true,
          });
        } else {
          val.isClick = true;
          val.isEdit = false;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = true),
              (child.isEdit = false),
              (child.isAdd = false)
            )
          );
        }

        return val;
      });
    } else if (type == "edit") {
      if (obj.isParent) {
        curdata.TaskName = obj.data.TaskName;
        curdata.Backup = obj.data.Backup;
        curdata.Creator = obj.data.Creator;
        curdata.DueDate = SPServices.displayDate(obj.data.DueDate);
        curdata.Created = obj.data.Created;
        curdata.ReminderDays = obj.data.ReminderDays;
        curdata.CreatedByFlow = obj.data.CreatedByFlow;
        (curdata.RecurParent = obj.data.RecurParent),
          (curdata.PriorityLevel = {
            name: obj.data.PriorityLevel,
            code: obj.data.PriorityLevel,
          });
        curdata.Recurrence = {
          name: obj.data.Recurrence,
          code: obj.data.Recurrence,
        };
        curdata.Status = {
          name: obj.data.Status,
          code: obj.data.Status,
        };
        setCurdata({ ...curdata });
      } else {
        curdata.TaskName = obj.data.TaskName;
        curdata.Backup = obj.data.Backup;
        curdata.Creator = obj.data.Creator;
        curdata.DueDate = SPServices.displayDate(obj.data.DueDate);
        curdata.Created = obj.data.Created;
        curdata.ReminderDays = obj.data.ReminderDays;
        curdata.CreatedByFlow = obj.data.CreatedByFlow;
        (curdata.RecurParent = obj.data.RecurParent),
          (curdata.PriorityLevel = {
            name: obj.data.PriorityLevel,
            code: obj.data.PriorityLevel,
          });
        curdata.Recurrence = {
          name: obj.data.Recurrence,
          code: obj.data.Recurrence,
        };
        curdata.Status = {
          name: obj.data.Status,
          code: obj.data.Status,
        };
        setCurdata({ ...curdata });
      }

      _curArray = [...curMyTask].map((val: any) => {
        //   _curArray = _curArray.map((val: any) => {
        let _splitKey: any[] = [];
        _splitKey = obj.key.toString().split("-");

        if (_splitKey.length == 1 && val.Id == _splitKey[0]) {
          val.isClick = true;
          val.isEdit = true;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = true),
              (child.isEdit = false),
              (child.isAdd = false)
            )
          );
        } else if (val.Id == _splitKey[0]) {
          val.isClick = true;
          val.isEdit = false;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = true),
              (child.isEdit = child.key == obj.key ? true : false),
              (child.isAdd = false)
            )
          );
        } else {
          val.isClick = true;
          val.isEdit = false;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = true),
              (child.isEdit = false),
              (child.isAdd = false)
            )
          );
        }
        return val;
      });
    } else if (type == "cancel") {
      if (obj.Id || obj.key) {
        _curArray = [...curMyTask].map((val: any) => {
          val.isClick = false;
          val.isEdit = false;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = false),
              (child.isEdit = false),
              (child.isAdd = false)
            )
          );
          val.children = val.children.filter((child) => child.Id !== null);

          return val;
        });
      } else {
        let _removeArray: any[] = [];
        _removeArray = [...curMyTask].filter((child) => child.Id);
        _curArray = [..._removeArray].map((val: any) => {
          val.isClick = false;
          val.isEdit = false;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = false),
              (child.isEdit = false),
              (child.isAdd = false)
            )
          );

          return val;
        });
      }
    } else if (type == "addParent") {
      let _concatArray: any[] = [];
      //_concatArray = [...curMyTask].concat([{ ...obj }]);
      _concatArray = [{ ...obj }].concat([...curMyTask]);
      _curArray = [..._concatArray].map((val: any) => {
        if (!val.Id) {
          val.isClick = true;
          val.isEdit = false;
          val.isAdd = true;
        } else {
          val.isClick = true;
          val.isEdit = false;
          val.isAdd = false;
          val.children.forEach(
            (child: any) => (
              (child.isClick = true),
              (child.isEdit = false),
              (child.isAdd = false)
            )
          );
        }

        return val;
      });
    }

    setCurMyTask([..._curArray]);
  };
  //addtextfield
  const _addTextField = (val: any, fieldType: string): JSX.Element => {
    const data: any = val?.data;

    if (!val.Id && val.isAdd) {
      if (fieldType == "TaskName") {
        let clsValid = "";
        !curdata.TaskName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <InputText
            type="text"
            placeholder="Task name"
            value={curdata.TaskName}
            autoFocus
            className={`${styles.tblTxtBox}${clsValid}`}
            onChange={(e: any) => getOnchange("TaskName", e.target.value)}
          />
        );
      }
      if (fieldType == "DueDate") {
        let clsValid = "";
        if (!curdata.DueDate) {
          clsValid = "md:w-20rem w-full p-invalid";
          curdata.DueDate = moment().format();
        } else {
          clsValid = "";
        }

        return (
          <Calendar
            placeholder="Date"
            value={new Date(curdata.DueDate)}
            onChange={(e) => getOnchange("DueDate", e.value)}
            showIcon
            className={`${styles.tblTxtBox}`}
          />
        );
      }
      if (fieldType == "Creator") {
        return (
          <PeoplePicker
            styles={peopickerStyle}
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            disabled={true}
            peoplePickerCntrlclassName={
              curuserId.EMail ? "" : styles.peoplepickerErrStyle
            }
            showtooltip={true}
            placeholder="Enter Email"
            // required={true}
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   value.PeopleEmail ? [value.PeopleEmail] : []
            // }
            defaultSelectedUsers={curuserId.EMail ? [curuserId.EMail] : []}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Creator", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Creator", null);
              }
            }}
          />
        );
      }
      if (fieldType == "Backup") {
        return (
          <PeoplePicker
            styles={peopickerStyle}
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   value.PeopleEmail ? [value.PeopleEmail] : []
            // }
            defaultSelectedUsers={
              curdata.Backup.EMail ? [curdata.Backup.EMail] : [configure.EMail]
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Backup", selectedItem);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Backup", null);
              }
            }}
          />
        );
      }
      if (fieldType == "PriorityLevel") {
        let indexOfDrop = dropval.findIndex(
          (data) => data.name == curdata.PriorityLevel.name
        );
        indexOfDrop < 0 ? (indexOfDrop = 0) : "";
        if (!curdata.PriorityLevel.name) {
          curdata.PriorityLevel = dropval[indexOfDrop];
        }
        return (
          <Dropdown
            options={dropval}
            style={{ width: "85%" }}
            placeholder="priority level"
            optionLabel="name"
            value={dropval[indexOfDrop]}
            onChange={(e: any) => getOnchange("PriorityLevel", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Status") {
        let indexOfDrop = dropStatus.findIndex(
          (data) => data.name == curdata.Status.name
        );
        indexOfDrop < 0 ? (indexOfDrop = 0) : "";
        if (!curdata.Status.name) {
          curdata.Status = dropStatus[indexOfDrop];
        }
        return (
          <Dropdown
            options={dropStatus}
            style={{ width: "85%" }}
            placeholder="Select a status"
            optionLabel="name"
            value={dropStatus[indexOfDrop]}
            onChange={(e: any) => getOnchange("Status", e.value)}

            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Recurrence") {
        let indexOfDrop = dropRecurrence.findIndex(
          (data) => data.name == curdata.Recurrence.name
        );
        indexOfDrop < 0 ? (indexOfDrop = 0) : "";
        if (!curdata.Recurrence.name) {
          curdata.Recurrence = dropRecurrence[indexOfDrop];
        }
        return (
          <Dropdown
            options={dropRecurrence}
            style={{ width: "85%" }}
            placeholder="Select a status"
            optionLabel="name"
            value={dropRecurrence[indexOfDrop]}
            onChange={(e: any) => getOnchange("Recurrence", e.value)}

            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Created") {
        return (
          <Calendar
            placeholder="Date"
            value={new Date(curdata.Created)}
            onChange={(e: any) => getOnchange("Created", e.value)}
            showIcon
          />
        );
      }
      //   return <InputText type="text" value={""} />;
    } else if (val.Id && val.isEdit) {
      if (fieldType == "TaskName") {
        let clsValid = "";
        !curdata.TaskName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <InputText
            type="text"
            value={curdata.TaskName}
            className={`${styles.tblTxtBox}${clsValid}`}
            onChange={(e: any) => getOnchange("TaskName", e.target.value)}
          />
        );
      }
      if (fieldType == "DueDate") {
        let clsValid = "";
        if (!curdata.DueDate) {
          clsValid = "md:w-20rem w-full p-invalid";
          curdata.DueDate = moment().format();
        } else {
          clsValid = "";
        }
        return (
          <Calendar
            value={new Date(curdata.DueDate)}
            onChange={(e) => getOnchange("DueDate", e.value)}
            className={`${styles.tblTxtBox}`}
            showIcon
          />
        );
      }

      if (fieldType == "Creator") {
        return (
          <PeoplePicker
            styles={peopickerStyle}
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            disabled={true}
            showtooltip={true}
            // required={true}
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   value.PeopleEmail ? [value.PeopleEmail] : []
            // }
            defaultSelectedUsers={curuserId.EMail ? [curuserId.EMail] : []}
            resolveDelay={1000}
            // onChange={(items: any[]) => {
            //   if (items.length > 0) {
            //     const selectedItem = items[0];
            //     getonChange("assignId", selectedItem.id);
            //     // getonChange("PeopleEmail", selectedItem.secondaryText);
            //   } else {
            //     // No selection, pass null or handle as needed
            //     getonChange("assignId", null);
            //   }
            // }}
          />
        );
      }
      if (fieldType == "Backup") {
        return (
          <PeoplePicker
            styles={peopickerStyle}
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            disabled={true}
            showtooltip={true}
            // required={true}
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   value.PeopleEmail ? [value.PeopleEmail] : []
            // }
            defaultSelectedUsers={
              curdata.Backup.EMail ? [curdata.Backup.EMail] : []
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Backup", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Backup", null);
              }
            }}
          />
        );
      }
      if (fieldType == "PriorityLevel") {
        let indexOfDrop = dropval.findIndex(
          (data) => data.name == curdata.PriorityLevel.name
        );
        indexOfDrop < 0 ? (indexOfDrop = 0) : "";
        if (!curdata.PriorityLevel.name) {
          curdata.PriorityLevel = dropval[indexOfDrop];
        }
        return (
          <Dropdown
            options={dropval}
            placeholder="Select a priority level"
            optionLabel="name"
            value={dropval[indexOfDrop]}
            onChange={(e: any) => getOnchange("PriorityLevel", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Status") {
        let indexOfDrop = dropStatus.findIndex(
          (data) => data.name == curdata.Status.name
        );
        indexOfDrop < 0 ? (indexOfDrop = 0) : "";
        if (!curdata.Status.name) {
          curdata.Status = dropStatus[indexOfDrop];
        }
        return (
          <Dropdown
            options={dropStatus}
            placeholder="Select a status"
            optionLabel="name"
            value={dropStatus[indexOfDrop]}
            onChange={(e: any) => getOnchange("Status", e.value)}

            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Recurrence") {
        let indexOfDrop = dropRecurrence.findIndex(
          (data) => data.name == curdata.Recurrence.name
        );
        indexOfDrop < 0 ? (indexOfDrop = 0) : "";
        if (!curdata.Recurrence.name) {
          curdata.Recurrence = dropRecurrence[indexOfDrop];
        }
        return (
          <Dropdown
            options={dropRecurrence}
            style={{ width: "85%" }}
            placeholder="Select a status"
            optionLabel="name"
            value={dropRecurrence[indexOfDrop]}
            onChange={(e: any) => getOnchange("Recurrence", e.value)}

            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Created") {
        return (
          <Calendar
            value={new Date(curdata.Created)}
            onChange={(e: any) => getOnchange("Created", e.value)}
            showIcon
          />
        );
      }
    } else {
      if (fieldType == "Creator" || fieldType == "Backup") {
        return (
          <span
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "block",
              width: "160px",
            }}
          >
            {data[fieldType].Title}
          </span>
        );
      } else if (
        fieldType == "Status" ||
        fieldType == "PriorityLevel" ||
        fieldType == "Recurrence"
      ) {
        return priorityLevelStyle(data[fieldType]);
      } else if (fieldType == "TaskName") {
        return (
          <>
            {/* <span
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "block",
                width: "160px",
              }}
              title={data[fieldType]}
            >
              {data[fieldType]}
            </span> */}
            <Button
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "block",
                width: "auto",
                background: "none",
                border: "none",
                outline: "none",
                color: "#000",
                fontWeight: "400",
                padding: 0,
                paddingRight: "5px",
                marginTop: "-4px",
                cursor: "text",
                maxWidth: "150px",
                fontSize: "15px",
              }}
              tooltip={data[fieldType]}
              // tooltip={
              //   "uhiufh iushdifyius dhifuhsiudh iuhsiudhfiuhs idhfuihsi udh fiygsuygdfuygweygfuygwefuygwuge fuygw eu"
              // }
              tooltipOptions={{
                position: "right",
                style: {
                  maxWidth: "340px",
                },
              }}
            >
              {data[fieldType]}
            </Button>
            {data["ReminderDays"] > 0 ? (
              // <Button
              //   type="button"
              //   icon="pi pi-stopwatch"
              //   title={data["ReminderDays"] + " days"}
              //   style={pencilIconBtnStyle}
              // ></Button>
              <Button
                type="button"
                icon="pi pi-stopwatch"
                // style={pencilIconBtnStyle}
                style={{
                  color: "#007C81",
                  border: "none",
                  backgroundColor: "transparent",
                  height: 26,
                  width: 26,
                  marginLeft: "auto",
                }}
                // tooltip={data["ReminderDays"] + " days"}
                tooltip={`Notify on ${data["NotifyDate"]}`}
                tooltipOptions={{
                  showDelay: 500,
                  hideDelay: 300,
                }}
              />
            ) : (
              ""
            )}
          </>
        );
      } else {
        return (
          <span
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "block",
              width: "160px",
            }}
          >
            {data[fieldType]}
          </span>
        );
      }
    }
  };

  const errFunction = (err) => {
    setLoader(false);
    SPServices.ErrorHandling(err, "MyTasksDB");
    showMessage(
      "Something went wrong, Please contact system admin",
      toastTopRight,
      "error"
    );
  };

  const onSelect = (event) => {
    //x = [];
    x.push(event.node.Id);
  };
  const unselect = (event) => {
    x = x.filter((removeId) => {
      return removeId != event.node.Id;
    });
  };
  const SearchFilter = (e) => {
    setSearch(e);

    let filteredResults = masterdata.filter((item) => {
      if (item.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())) {
        return true;
      }

      const childMatches = item.children.filter((child) =>
        child.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())
      );

      if (childMatches.length > 0) {
        return true;
      }

      return false;
    });

    setCurMyTask([...filteredResults]);
  };
  const toggleApplications = (key) => {
    let _expandedKeys = { ...expandedKeys };

    // if (_expandedKeys[`${key}`]) delete _expandedKeys[`${key}`];
    // else _expandedKeys[`${key}`] = true;
    // ;
    _expandedKeys[key] = !_expandedKeys[key];
    setExpandedKeys(_expandedKeys);
  };

  function BindAfternewData(newData) {
    let tempData = curMyTask;
    let indexOfObj = tempData.findIndex((data) => !data.Id);
    if (indexOfObj >= 0) {
      tempData[indexOfObj] = newData;
    }
    for (let i = 0; i < tempData.length; i++) {
      tempData[i].isClick = false;
      tempData[i].isAdd = false;
      tempData[i].isEdit = false;
    }
    setCurMyTask([...tempData]);
    setMasterdata([...tempData]);
    setCurdata({ ...data });
    props.updateDataFromChildComponent(props.categoryId, [...tempData]);
    setLoader(false);
    showMessage("Task added successfully", toastTopRight, "success");
  }

  function BindAfternewChildData(
    newData,
    parentIndex,
    childIndex,
    popupMessage
  ) {
    let tempData = curMyTask;
    tempData[parentIndex].children[childIndex] = newData;
    for (let i = 0; i < tempData.length; i++) {
      tempData[i].isClick = false;
      tempData[i].isAdd = false;
      tempData[i].isEdit = false;
      for (let j = 0; j < tempData[i].children.length; j++) {
        tempData[i].children[j].isClick = false;
        tempData[i].children[j].isAdd = false;
        tempData[i].children[j].isEdit = false;
      }
    }

    setCurMyTask([...tempData]);
    setMasterdata([...tempData]);
    setCurdata({ ...data });

    props.updateDataFromChildComponent(props.categoryId, [...tempData]);
    setLoader(false);
    showMessage(
      `Sub Task ${popupMessage} successfully`,
      toastTopRight,
      "success"
    );
  }

  function BindAfterDataEdit(newData, oldObject) {
    let tempData = curMyTask;
    let indexOfObj = tempData.findIndex((data) => data.Id == oldObject.Id);
    if (indexOfObj >= 0) {
      tempData[indexOfObj] = newData;
    }
    for (let i = 0; i < tempData.length; i++) {
      tempData[i].isClick = false;
      tempData[i].isAdd = false;
      tempData[i].isEdit = false;
      for (let j = 0; j < tempData[i].children.length; j++) {
        tempData[i].children[j].isClick = false;
        tempData[i].children[j].isAdd = false;
        tempData[i].children[j].isEdit = false;
      }
    }

    setCurMyTask([...tempData]);
    setMasterdata([...tempData]);
    setCurdata({ ...data });
    props.updateDataFromChildComponent(props.categoryId, [...tempData]);
    setLoader(false);
    showMessage("Task updated successfully", toastTopRight, "success");
  }

  function BindAfterDataDelete(ID) {
    let tempData = curMyTask;
    let indexOfObj = tempData.findIndex((data) => data.Id == ID);
    if (indexOfObj >= 0) {
      tempData.splice(indexOfObj, 1);
    }
    setCurMyTask([...tempData]);
    setMasterdata([...tempData]);
    setCurdata({ ...data });
    props.updateDataFromChildComponent(props.categoryId, [...tempData]);
    setLoader(false);
    showMessage("Task deleted successfully", toastTopRight, "success");
  }

  function BindAfterChildDataDelete(ID, parentId, childIndex) {
    let tempData = curMyTask;
    let indexOfObj = tempData.findIndex((data) => data.Id == parentId);
    tempData[indexOfObj].children.splice(childIndex, 1);
    setCurMyTask([...tempData]);
    setMasterdata([...tempData]);
    setCurdata({ ...data });
    props.updateDataFromChildComponent(props.categoryId, [...tempData]);
    setLoader(false);
    showMessage("Sub Task deleted successfully", toastTopRight, "success");
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

  function validation(objNew) {
    let isAllValueFilled = true;

    let ParentDueDate = [];
    let ChildDueDate = [];
    let ParentDate = "";
    let isDueDateGt = true;
    try {
      if (objNew.isParent == false) {
        ParentDueDate = [...curMyTask].filter(
          (item) => item.Id == objNew.subId
        );
        ParentDate = moment(ParentDueDate[0].data.DueDate, "MM/DD/YYYY").format(
          "YYYY-MM-DD"
        );
        isDueDateGt =
          ParentDate >= moment(curdata.DueDate).format("YYYY-MM-DD");
      } else {
        ChildDueDate = objNew.children.filter(
          (item) =>
            moment(item.data.DueDate, "MM/DD/YYYY").format("YYYY-MM-DD") >
            moment(curdata.DueDate).format("YYYY-MM-DD")
        );
      }
    } catch (e) {
      console.log(e);
    }

    if (!curdata.TaskName) {
      isAllValueFilled = false;
      showMessage("Please enter Task name", toastTopRight, "warn");
    } else if (!isDueDateGt) {
      isAllValueFilled = false;
      showMessage(
        "Due date should be less than parent task",
        toastTopRight,
        "warn"
      );
    } else if (ChildDueDate.length > 0) {
      isAllValueFilled = false;
      showMessage(
        "Due date should be greater than child task",
        toastTopRight,
        "warn"
      );
    }
    return isAllValueFilled;
  }

  function validationCategory() {
    let isAllValueFilled = true;
    if (!categoryValue) {
      isAllValueFilled = false;
    }
    return isAllValueFilled;
  }

  function accept() {
    deleteData(deleteObj);
    setVisible(false);
    setDeleteObj({});
  }

  function reject() {
    setVisible(false);
    setDeleteObj({});
  }

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
        props.categoryName = categoryValue;
        props.updateCategory(categoryValue, Id);
        setLoader(false);
        setCategoryId(null);
        setIseditdialog(false);
        setCategoryValue("");
        showMessage("Category Updated Successfully!", toastTopRight, "success");
      })
      .catch((err) => {
        errFunction(err);
      });
  };
  const Editcategory = (value, value1, value3) => {
    setIseditdialog(value);
    setCategoryValue(value1);
    setCategoryId(value3);
  };

  function DeleteCategory(value, value1, value3) {
    setIsDeletedialog(value);
    setCategoryId(value3);
  }

  function acceptDeleteCategory() {
    setLoader(true);
    SPServices.SPDeleteItem({
      Listname: "Categories",
      ID: categoryId,
    })
      .then(function (res) {
        props.RemoveCategory(categoryId);
        setIsDeletedialog(false);
        setCategoryId("");
        setLoader(false);
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  function rejectDeleteCategory() {
    setIsDeletedialog(false);
    setCategoryId("");
  }

  useEffect(() => {
    SearchFilter(props.searchValue);
  }, [props.searchValue]);

  useEffect(() => {
    setCurMyTask([...props.mainData]);
    setMasterdata([...props.mainData]);
  }, [props.mainData]);

  arrdisplayItems = [...curMyTask].filter(
    (item) => item.data.Status != "Completed" && item.data.Status != "Done"
  );
  for (let i = 0; i < arrdisplayItems.length; i++) {
    let newChildrens = [];
    //remove the done data from child array..
    for (let j = 0; j < arrdisplayItems[i].children.length; j++) {
      if (arrdisplayItems[i].children[j].data.Status != "Done") {
        newChildrens.push(arrdisplayItems[i].children[j]);
      }
    }
    arrdisplayItems[i].children = newChildrens;
  }

  const menuLeft = React.useRef(null);
  const itemsWithOutData = [
    {
      label: "Category options",
      items: [
        {
          label: "Update",
          icon: "pi pi-pencil",
          command: (event) => {
            Editcategory(true, props.categoryName, props.categoryId);
          },
        },
        {
          label: "Delete",
          icon: "pi pi-trash",
          command: () => {
            arrdisplayItems.length === 0 &&
              DeleteCategory(true, props.categoryName, props.categoryId);
          },
        },
      ],
    },
  ];

  const itemsWithData = [
    {
      label: "Category options",
      items: [
        {
          label: "Update",
          icon: "pi pi-pencil",
          command: (event) => {
            Editcategory(true, props.categoryName, props.categoryId);
          },
        },
      ],
    },
  ];

  return (
    <>
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
                if (validationCategory())
                  UpdateCategory(categoryValue, categoryId);
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
              className={styles.cancelBtn}
              onClick={() => {
                setCategoryValue("");
                setCategoryId(null);
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
        <div className={styles.myTaskSection}>
          <Toast ref={toastTopRight} position="top-right" />
          <ConfirmDialog
            visible={visible}
            onHide={() => setVisible(false)}
            message="Are you sure you want to delete?"
            // header="Confirmation"
            // icon="pi pi-exclamation-triangle"
            accept={accept}
            reject={reject}
          />

          <ConfirmDialog
            visible={isDeletedialog}
            onHide={() => setIsDeletedialog(false)}
            message="Are you sure you want to delete?"
            // header="Confirmation"
            // icon="pi pi-exclamation-triangle"
            accept={acceptDeleteCategory}
            reject={rejectDeleteCategory}
          />
          {props.categoryName && (
            <div className={styles.myTaskHeader}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h2
                // style={{ color: "#f46906",fontSize: "20px",fontWeight: "700"}}
                >
                  <img src={categoryImg} /> {props.categoryName}
                </h2>
                {/* {props.categoryName ? (
                <>
                  <Button
                    type="button"
                    icon="pi pi-pencil"
                    style={pencilIconBtnStyle}
                    onClick={() => {
                      Editcategory(true, props.categoryName, props.categoryId);
                    }}
                  ></Button>
                  {arrdisplayItems.length == 0 ? (
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      style={delIconBtnStyle}
                      onClick={() => {
                        DeleteCategory(
                          true,
                          props.categoryName,
                          props.categoryId
                        );
                      }}
                    ></Button>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                ""
              )} */}
              </div>
              {props.categoryName ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* <Button
                  label="New task"
                  className={styles.btnColor}
                  onClick={(e) => {
                    let ifHasDublicateChild = curMyTask?.filter((e) => {
                      return e.children.some((el) => el.Id === null);
                    });

                    if (ifHasDublicateChild?.length !== 0) {
                      curMyTask?.map((e) => {
                        if (e?.children) {
                          e.children = e.children.filter(
                            (el) => el.Id !== null
                          );
                        }
                        return e;
                      });
                    }

                    curMyTask?.filter((e) => e.Id === null)?.length === 0
                      ? _handleData("addParent", { ..._sampleParent })
                      : showMessage(
                          "Can't add multiple tasks at a time",
                          toastTopRight,
                          "warn"
                        );
                  }}
                /> */}

                  <span className="p-buttonset">
                    <Button
                      // label="New task"
                      icon="pi pi-plus"
                      className={styles.btnColor}
                      style={{
                        padding: " 4px 18px",
                        height: " 30px",
                        fontSize: " 14px",
                        fontWeight: " 500",
                      }}
                      onClick={(e) => {
                        let ifHasDublicateChild = curMyTask?.filter((e) => {
                          return e.children.some((el) => el.Id === null);
                        });

                        if (ifHasDublicateChild?.length !== 0) {
                          curMyTask?.map((e) => {
                            if (e?.children) {
                              e.children = e.children.filter(
                                (el) => el.Id !== null
                              );
                            }
                            return e;
                          });
                        }

                        curMyTask?.filter((e) => e.Id === null)?.length === 0
                          ? _handleData("addParent", { ..._sampleParent })
                          : showMessage(
                              "Can't add multiple tasks at a time",
                              toastTopRight,
                              "warn"
                            );
                      }}
                    />
                    <Menu
                      model={
                        arrdisplayItems.length == 0
                          ? itemsWithOutData
                          : itemsWithData
                      }
                      popup
                      ref={menuLeft}
                      id="popup_menu_left"
                    />
                    <Button
                      className={styles.secondaryBtn}
                      icon="pi pi-ellipsis-v"
                      onClick={(event) => {
                        menuLeft.current.toggle(event);
                      }}
                    ></Button>
                  </span>
                </div>
              ) : (
                ""
              )}
            </div>
          )}
          <TreeTable
            removableSort
            selectionMode="checkbox"
            sortMode="multiple"
            selectionKeys={selectedNodeKeys}
            onSelect={(event) => {
              onSelect(event);
              props.onselect(event);
            }}
            onUnselect={(event) => {
              unselect(event);
              props.unselect(event);
            }}
            expandedKeys={expandedKeys}
            onToggle={(e) => setExpandedKeys(e.value)}
            onSelectionChange={(e) => {
              setSelectedNodeKeys(e.value);
            }}
            value={[...arrdisplayItems]}
            tableStyle={{ minWidth: "50rem" }}
            // paginator
            // rows={10}
          >
            <Column
              field="TaskName"
              header="Task name"
              expander
              sortable
              style={TaskCellStyle}
              body={(obj: any) => _addTextField(obj, "TaskName")}
            />
            <Column
              style={{
                backgroundColor: "#fff",
                width: 140,
              }}
              body={(obj: any) => _action(obj)}
            />
            {/* <Column
          field="ClientName"
          header="ClientName"
          sortable
          style={cellStyle}
        /> */}
            {/* <Column
              field="Assitant"
              header="Assitant"
              sortable
              style={cellStyle}
              body={(obj: any) => _addTextField(obj, "Creator")}
            /> */}
            {/* <Column
          field="Backup"
          header="Backup"
          sortable
          style={cellStyle}
          body={(obj: any) => _addTextField(obj, "Backup")}
        /> */}
            <Column
              field="DueDate"
              header="Due date"
              sortable
              style={{
                backgroundColor: "#fff",
                width: 150,
              }}
              body={(obj: any) => _addTextField(obj, "DueDate")}
            />

            <Column
              field="PriorityLevel"
              header=" Priority level"
              sortable
              style={cellStyle}
              body={(obj: any) => _addTextField(obj, "PriorityLevel")}
            />
            <Column
              field="Recurrence"
              header="Recurrence"
              sortable
              style={cellStyle}
              body={(obj: any) => _addTextField(obj, "Recurrence")}
            />
            <Column
              field="Status"
              header="Status"
              sortable
              style={cellStyle}
              body={(obj: any) => _addTextField(obj, "Status")}
            />
            {/* <Column
          field="Created"
          header="Created"
          sortable
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Created")}
        /> */}
            <Column
              style={actionCellStyle}
              body={(obj: any, index) =>
                obj.isClick && (obj.isAdd || obj.isEdit) && _actionSubmit(obj)
              }
            />
          </TreeTable>

          {/* <Dialog
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
      </Dialog> */}
        </div>
      )}
    </>
  );
};

export default MyTaskDataCategory;
