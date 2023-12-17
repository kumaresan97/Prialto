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
import Loader from "./Loader";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
let x = [];
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
//   { name: "Pending", code: "Pending" },
//   { name: "In Progress", code: "In Progress" },
//   { name: "Completed", code: "Completed" },
//   { name: "Done", code: "Done" },
];

let MyClients = [];
let MainTask: IParent[] = [];
let SubTask: IChild[] = [];
let MainArray: IParent[] = [];

const UserClientDB = (props): JSX.Element => {
  // style variables
  dropStatus = props.choices;
  const cellStyle = { backgroundColor: "#fff", width: 176 };
  // const cellStyle = { backgroundColor: "#EAEEEE", width: 200 };
  // const TaskCellStyle = { backgroundColor: "#EAEEEE", width: 265 };
  const TaskCellStyle = { backgroundColor: "#fff", width: 265 };
  const actionCellStyle = { backgroundColor: "#fff", width: 150 };
  // const actionCellStyle = { backgroundColor: "#EAEEEE", width: 150 };
  const iconbtnStyle = {
    backgroundColor: "transparent",
    color: "#007C81",
    border: "none",
    height: 24,
    width: 24,
    // borderRadius: "50%",
  };
  const tickIconStyle = {
    backgroundColor: "transparent",
    border: "transparent",
    color: "#007C81",
  };
  const pencilIconBtnStyle = {
    color: "#007C81",
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

  //const UserEmail=!props.Email?props.context.pageContext.user.email:props.Email;
  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);
  const [search, setSearch] = useState("");
  const [loader, setLoader] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteObj, setDeleteObj] = useState<any>({});
  const toastTopRight = React.useRef(null);
  //Here we exchanges crntUser value with assitant value
  //const [curuserId, setCuruserId] = useState(props.crntUserData);
  const [curuserId, setCuruserId] = useState(props.assistant);

  const data: IMyTasks = {
    TaskName: "",
    ClientName: "",
    ClientID: 0,
    DueDate: "",
    PriorityLevel: "",
    Status: "",
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
      TaskName: "",
      ClientName: props.clientName ? props.clientName : "",
      DueDate: "",
      PriorityLevel: "",
      Status: "",
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
      TaskName: "",
      ClientName: props.clientName ? props.clientName : "",
      DueDate: "",
      PriorityLevel: "",
      Status: "",
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
    },
  };

  const [curdata, setCurdata] = useState<IMyTasks>(data);
  const [curMyTask, setCurMyTask] = useState<any[]>([]);
  const [masterdata, setMasterdata] = useState<any[]>([]);
  // style function
  // const priorityLevelStyle = (PLevel) => {
  //   let bgColor: string = "";
  //   let color: string = "";
  //   if (PLevel == "Urgent") {
  //     // bgColor = "#BF4927";
  //     bgColor = "#ffb5a0";
  //     color = "#BF4927";
  //   } else if (PLevel == "High" || PLevel == "In Progress") {
  //     bgColor = "#ffdfc8";
  //     color = "#f46906";
  //   } else if (PLevel == "Normal") {
  //     // bgColor = "#009BA2";
  //     bgColor = "#bbfcff";
  //     color = "#4b6164";
  //   } else if (PLevel == "New Task" || PLevel == "Pending") {
  //     // bgColor = "#68BAC4";
  //     bgColor = "#d1faff";
  //     color = "#444444";
  //   } else if (PLevel == "Done" || PLevel == "Completed") {
  //     // bgColor = "#007C81";
  //     bgColor = "#c6fdff";
  //     color = "#007C81";
  //   }
  //   return (
  //     <div
  //       className={styles.pLevelStyle}
  //       style={{ backgroundColor: bgColor, color: color }}
  //     >
  //       {PLevel}
  //     </div>
  //   );
  // };
  const priorityLevelStyle = (PLevel) => {
    let bgColor: string = "";
    let color: string = "";
    if (PLevel == "Urgent") {
      color = "#bf4927";
      bgColor = "#ffded5";
    } else if (PLevel == "High") {
      bgColor = "#ffd5b8";
      color = "#f46906";
    } else if (PLevel == "Normal") {
      bgColor = "#bbfcff";
      color = "#4b6164";
    } else if (PLevel == "In Progress") {
      bgColor = "#defffd";
      color = "#666666";
    } else if (PLevel == "Pending") {
      bgColor = "#f5ffbd";
      color = "#5c5c5c";
    } else if (PLevel == "Completed") {
      bgColor = "#c7ffc7";
      color = "#1a8100";
    } else if (PLevel == "Done") {
      bgColor = "#dfffbb";
      color = "#6e6e6e";
    }
    else{
      bgColor = "#dfffbb";
      color = "#6e6e6e";
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
          style={pencilIconBtnStyle}
          onClick={(_) => {
            _handleData("edit", obj);
          }}
        />
        <Button
          style={delIconBtnStyle}
          disabled={obj.isClick}
          type="button"
          icon="pi pi-trash"
          onClick={() => {
            setDeleteObj(obj);
            setVisible(true);
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
            if (validation()) {
              _handleDataoperation(obj);
            } else {
              showMessage("Please enter Task name", toastTopRight, "warn");
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
    let sub = {
      TaskName: curdata.TaskName ? curdata.TaskName : "",
      // BackupId: curdata.Backup.Id ///Changes for backup users multiple
      //   ? curdata.Backup.Id
      //   : configure.backupId
      //   ? configure.backupId
      //   : null,
      BackupId:{ 'results': props.backupUsers },
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      MainTaskIDId: Number(obj.key.split("-")[0]),
      ClientId: props.clientId,
      AssistantId: curuserId.Id,
    };
    let Main = {
      TaskName: curdata.TaskName ? curdata.TaskName : "",
      // BackupId: curdata.Backup.Id ///Changes for backup users multiple
      //   ? curdata.Backup.Id
      //   : configure.backupId
      //   ? configure.backupId
      //   : null,
      BackupId:{ 'results': props.backupUsers },
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      AssistantId: curuserId.Id,
      ClientId: props.clientId,
    };

    let Json = obj.isParent ? Main : sub;

    SPServices.SPAddItem({
      Listname: ListName,
      RequestJSON: Json,
    })
      .then((res) => {

        /*For Recurrence Insert */
        let newJson={
          TaskIDId:res.data.ID,
          RecurrenceType:curdata.Status["name"]
        }

        let newSubJson={
          SubTaskIDId:res.data.ID,
          RecurrenceType:curdata.Status["name"]
        }

        let inputJson=obj.isParent?newJson:newSubJson;
        AddRecurrence(curdata.Status["name"],inputJson);
        /*For Recurrence Insert End*/


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
              ClientID: props.clientId,
              DueDate: SPServices.displayDate(Json.DueDate),
              PriorityLevel: Json.PriorityLevel,
              Status: Json.Status,
              Created: moment().format("YYYY-MM-DD"),
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              Creator: curdata.Creator,
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
              ClientID: props.clientId,
              Creator: curdata.Creator,
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              DueDate: SPServices.displayDate(Json.DueDate),
              PriorityLevel: Json.PriorityLevel,
              Status: Json.Status,
              Created: moment().format("YYYY-MM-DD"),
            },
          };

          if (indexOfObj >= 0)
            BindAfternewChildData(newData, indexOfObj, indexOfChildren);
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

  /* for recurrence add and update */
  async function AddRecurrence(Status,dataJson)
  {
    if(Status!="Completed"&&Status!="On-hold"&&Status!="One time"){
      await SPServices.SPAddItem({
      Listname:"Recurrence",
      RequestJSON:dataJson
      }).then(function(data){}).catch(function(error){
        errFunction(error);
      })
      }
  }

  async function UpdateRecurrence(Status,dataJson,ListID)
  {
    if(Status!="Completed"&&Status!="On-hold"&&Status!="One time"){
      await SPServices.SPUpdateItem({
      Listname:"Recurrence",
      ID:ListID,
      RequestJSON:dataJson
      }).then(function(data){}).catch(function(error){
        errFunction(error);
      })
      }
  }

  async function InsertOrUpdateRecurrence(recordID,obj,Status)
  {
      /*For Recurrence Update */
      let newJson={
        TaskIDId:recordID,
        RecurrenceType:Status
      }

      let newSubJson={
        SubTaskIDId:recordID,
        RecurrenceType:Status
      }

      let inputJson=obj.isParent?newJson:newSubJson;
      let filterValue=obj.isParent?"TaskID/ID":"SubTaskID/ID";

      SPServices.SPReadItems({
        Listname:"Recurrence",
        Select:"*,TaskID/ID,SubTaskID/ID",
        Expand:"TaskID,SubTaskID",
        Filter:[
          {
            FilterKey: filterValue,
            FilterValue: recordID,
            Operator: "eq",
          },
        ],
      }).then(function(data:any)
      {
          if(data.length>0)
          {
              UpdateRecurrence(Status,inputJson,data[0].ID)
          }
          else
          {
            AddRecurrence(Status,inputJson);
          }
      
      }).catch(function(error)
      {

      })
      /*For Recurrence Update */

  }

  /* for recurrence add and update end*/

  //editfunction
  const Editfunction = (obj) => {
    let ListName = obj.isParent ? "Tasks" : "SubTasks";
    let editval = {
      TaskName: curdata.TaskName,
      //BackupId: curdata.Backup.Id,
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      ClientId: props.clientId,
    };
    SPServices.SPUpdateItem({
      Listname: ListName,
      ID: obj.Id,
      RequestJSON: editval,
    })
      .then((res) => {
        InsertOrUpdateRecurrence(obj.Id,obj,curdata.Status["name"]);
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
              ClientID: props.clientId,
              DueDate: SPServices.displayDate(editval.DueDate),
              PriorityLevel: editval.PriorityLevel,
              Status: editval.Status,
              Created: moment().format("YYYY-MM-DD"),
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              Creator: curdata.Creator,
            },
            children: obj.children,
          };
          BindAfterDataEdit(newData, obj);
        } else {
          newData = {
            key: obj.key,
            Index: obj.Index,
            Id: res.data.ID,
            subId: obj.subId,
            isClick: false,
            isParent: false,
            isAdd: false,
            isEdit: false,
            data: {
              TaskName: curdata.TaskName,
              ClientName: props.clientName,
              ClientID: props.clientId,
              Creator: curdata.Creator,
              Backup: curdata.Backup.Id ? curdata.Backup : configure,
              DueDate: SPServices.displayDate(editval.DueDate),
              PriorityLevel: editval.PriorityLevel,
              Status: editval.Status,
              Created: moment().format("YYYY-MM-DD"),
            },
          };
          let indexOfObj = curMyTask.findIndex((data) => data.Id == obj.subId);
          if (indexOfObj >= 0)
            BindAfternewChildData(newData, indexOfObj, obj.Index);
        }
      })
      .catch((err) => errFunction(err));
  };
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
        curdata.DueDate = obj.data.DueDate;
        curdata.Created = obj.data.Created;
        curdata.PriorityLevel = {
          name: obj.data.PriorityLevel,
          code: obj.data.PriorityLevel,
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
        curdata.DueDate = obj.data.DueDate;
        curdata.Created = obj.data.Created;
        curdata.PriorityLevel = {
          name: obj.data.PriorityLevel,
          code: obj.data.PriorityLevel,
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
      _concatArray = [...curMyTask].concat([{ ...obj }]);
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
    console.log("test");
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
        }
        return (
          <Calendar
            placeholder="Date"
            value={new Date(curdata.DueDate)}
            onChange={(e) => getOnchange("DueDate", e.value)}
            showIcon
          />
        );
      }
      if (fieldType == "Creator") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            disabled={true}
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
            ///Changes for backup users multiple
            //defaultSelectedUsers={curuserId.EMail ? [curuserId.EMail] : []}

            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Creator", selectedItem);
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
            ///Changes for backup users multiple
            // defaultSelectedUsers={
            //   curdata.Backup.EMail ? [curdata.Backup.EMail] : [configure.EMail]
            // }
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
            style={{ width: "85%" }}
            options={dropStatus}
            placeholder="Select a status"
            optionLabel="name"
            value={dropStatus[indexOfDrop]}
            onChange={(e: any) => getOnchange("Status", e.value)}

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
            showIcon
          />
        );
      }

      if (fieldType == "Creator") {
        return (
          <PeoplePicker
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
            ///Changes for backup users multiple
            //defaultSelectedUsers={curuserId.EMail ? [curuserId.EMail] : []}
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
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            // required={true}
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   value.PeopleEmail ? [value.PeopleEmail] : []
            // }
            ///Changes for backup users multiple
            //defaultSelectedUsers={curdata.Backup.EMail ? [curdata.Backup.EMail] : []}
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
            style={{ width: "85%" }}
            options={dropStatus}
            placeholder="Select a status"
            optionLabel="name"
            value={dropStatus[indexOfDrop]}
            onChange={(e: any) => getOnchange("Status", e.value)}

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
      } else if (fieldType == "Status" || fieldType == "PriorityLevel") {
        return priorityLevelStyle(data[fieldType]);
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
    console.log(err);
    setLoader(false);
    showMessage(
      "Something went wrong, Please contact system admin",
      toastTopRight,
      "error"
    );
  };

  const onSelect = (event) => {
    // x = [];
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

    if (_expandedKeys[`${key}`]) delete _expandedKeys[`${key}`];
    else _expandedKeys[`${key}`] = true;
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
    setLoader(false);
  }

  function BindAfternewChildData(newData, parentIndex, childIndex) {
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
    setLoader(false);
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
    setLoader(false);
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
    setLoader(false);
  }

  function BindAfterChildDataDelete(ID, parentId, childIndex) {
    let tempData = curMyTask;
    let indexOfObj = tempData.findIndex((data) => data.Id == parentId);
    tempData[indexOfObj].children.splice(childIndex, 1);
    setCurMyTask([...tempData]);
    setMasterdata([...tempData]);
    setCurdata({ ...data });
    setLoader(false);
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

  function validation() {
    let isAllValueFilled = true;
    if (!curdata.TaskName) {
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

  useEffect(() => {
    SearchFilter(props.searchValue);
  }, [props.searchValue]);

  useEffect(() => {
    setCurMyTask([...props.mainData]);
    setMasterdata([...props.mainData]);
  }, [props.mainData]);

  return (
    <>
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
          <div
            className={styles.myTaskHeader}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // margin: "10px 0px",
            }}
          >
            <Label
              className={styles.leftFilterSection}
              style={{ color: "#009b9f" }}
            >
              {props.clientName ? props.clientName : ""}
            </Label>
            <Button
              label="New task"
              visible={props.clientName ? true : false}
              className={styles.btnColor}
              onClick={() => {
                _handleData("addParent", { ..._sampleParent });
              }}
            />
          </div>
          <TreeTable
            selectionMode="checkbox"
            sortMode="multiple"
            selectionKeys={selectedNodeKeys}
            onSelect={onSelect}
            onUnselect={unselect}
            disabled={true}
            expandedKeys={expandedKeys}
            onToggle={(e) => setExpandedKeys(e.value)}
            onSelectionChange={(e) => {
              setSelectedNodeKeys(e.value);
            }}
            value={[...curMyTask]}
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
            <Column style={cellStyle} body={(obj: any) => _action(obj)} />
            <Column
              field="ClientName"
              header="Client name"
              sortable
              style={cellStyle}
            />
            {/*///Changes for backup users multiple*/}
            {/* <Column
              field="Assitant"
              header="Assitant"
              sortable
              style={cellStyle}
              body={(obj: any) => _addTextField(obj, "Creator")}
            />
            <Column
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
              style={cellStyle}
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
        </div>
      )}
    </>
  );
};

export default UserClientDB;
