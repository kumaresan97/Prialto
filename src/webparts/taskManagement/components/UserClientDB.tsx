import * as React from "react";
import { useState, useEffect } from "react";
import { TreeTable, TreeTableExpandedKeysType } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Label } from "@fluentui/react";
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
  { name: "Newindia", code: "Newindia" },
];

let MyClients=[];
let MainTask: IParent[] = [];
let SubTask: IChild[] = [];
let MainArray: IParent[] = [];

const UserClientDB = (props): JSX.Element => {
  //const UserEmail=!props.Email?props.context.pageContext.user.email:props.Email;
  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);
  const [search, setSearch] = useState("");

  const [curuserId, setCuruserId] = useState(props.crntUserData);

  const data: IMyTasks = {
    TaskName: "",
    ClientName:"",
    ClientID:0,
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
      ClientName:"",
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
      ClientName:"",
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

  //onchange values get
  const getOnchange = (key, _value) => {
    let FormData = { ...curdata };
    if (key == "Backup") {
      debugger;
      FormData.Backup.Id = _value.id;
      FormData.Backup.EMail= _value.secondaryText;
      FormData.Backup.Title=_value.text;
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
          rounded
          onClick={(_) => {
            _handleData("addChild", obj);
            toggleApplications(obj.key);
          }}
        />
        <Button
          disabled={obj.isClick}
          type="button"
          icon="pi pi-pencil"
          rounded
          onClick={(_) => {
            _handleData("edit", obj);
          }}
        />
        <Button
          disabled={obj.isClick}
          type="button"
          icon="pi pi-trash"
          rounded
          onClick={() => deleteData(obj)}
        />
      </div>
    );
  };
  //check,cancelbutton
  const _actionSubmit = (obj: any): JSX.Element => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          icon="pi pi-check"
          rounded
          onClick={(_) => {
            _handleDataoperation(obj);
          }}
        />
        <Button
          type="button"
          icon="pi pi-times"
          rounded
          onClick={(_) => {
            _handleData("cancel", obj);
          }}
        />
      </div>
    );
  };
  //handle update,delete,edit
  const _handleDataoperation = (obj) => {

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
      BackupId: curdata.Backup.Id ? curdata.Backup.Id : configure.backupId,
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      MainTaskIDId: Number(obj.key.split("-")[0]),
    };
    let Main = {
      TaskName: curdata.TaskName ? curdata.TaskName : "",
      BackupId: curdata.Backup.Id ? curdata.Backup.Id : configure.backupId,
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
      AssistantId: curuserId.Id,
      ClientId:3
    };

    let Json = obj.isParent ? Main : sub;

    
    SPServices.SPAddItem({
      Listname: ListName,
      RequestJSON: Json,
    })
      .then((res) => {

        let newData=  {};
        //Preparing Parent or Child object here.
        if(obj.isParent)
        {
          newData={
            "key": res.data.ID,
            "Id": res.data.ID,
            "isParent": true,
            "isClick": false,
            "isEdit": false,
            "isAdd": false,
            "data": {
              "TaskName": Json.TaskName,
              "ClientName": props.clientName,
              "ClientID": props.clientId,
              "DueDate": SPServices.displayDate(Json.DueDate),
              "PriorityLevel": Json.PriorityLevel,
              "Status": Json.Status,
              "Created": moment().format("YYYY-MM-DD"),
              "Backup": curdata.Backup.Id?curdata.Backup:configure,
              "Creator": curdata.Creator
            },
            "children": []
          }
          BindAfternewData(newData);
        }
        else
        {
          //Manipulation done here to prepare the array index and then the key of the object for childern.
          let indexOfObj=curMyTask.findIndex(data=>data.Id==obj.subId);
          let indexOfChildren=-1;
          let lengthOfObject=0;
          if(indexOfObj>=0)
          {
            lengthOfObject=curMyTask[indexOfObj].children.length;
            indexOfChildren=curMyTask[indexOfObj].children.findIndex(data=>!data.Id);
          }
          else{
            lengthOfObject=1;
          }

          newData={
                    //key: `${obj.subId}-${lengthOfObject}`,
                    key:obj.key,
                    Index:lengthOfObject-1,
                    Id: res.data.ID,
                    subId: obj.subId,
                    isClick: false,
                    isParent: false,
                    isAdd: false,
                    isEdit: false,
                    data: {
                      TaskName: curdata.TaskName,
                      ClientName:props.clientName,
                      ClientID:props.clientId,
                      Creator: curdata.Creator,
                      Backup: curdata.Backup.Id?curdata.Backup:configure,
                      DueDate: SPServices.displayDate(Json.DueDate),
                      PriorityLevel: Json.PriorityLevel,
                      Status: Json.Status,
                      Created: moment().format("YYYY-MM-DD")
              }
           }

           if(indexOfObj>=0)
           BindAfternewChildData(newData,indexOfObj,indexOfChildren);
        }
      })
      .catch((err) => errFunction(err));
  };
  //deleteitem
  const deleteData = (obj) => {
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
          for (let i: number = 0; Ids.length > i; i++) 
          {
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

  function DeleteFunction(obj)
  {
    if(obj.isParent){
      BindAfterDataDelete(obj.Id)
    }
    else
    {
      BindAfterChildDataDelete(obj.Id,obj.subId,obj.Index)
    }
    
  }

  //editfunction
  const Editfunction = (obj) => {
    let ListName = obj.isParent ? "Tasks" : "SubTasks";
    let editval = {
      TaskName: curdata.TaskName,
      BackupId: curdata.Backup.Id,
      DueDate: curdata.DueDate ? new Date(curdata.DueDate).toISOString() : null,
      PriorityLevel: curdata.PriorityLevel["name"]
        ? curdata.PriorityLevel["name"]
        : "",
      Status: curdata.Status["name"] ? curdata.Status["name"] : "",
    };
    SPServices.SPUpdateItem({
      Listname: ListName,
      ID: obj.Id,
      RequestJSON: editval,
    })
      .then((res) => {
        let newData={};
        if(obj.isParent){
        newData=  {
          "key": obj.Id,
          "Id": obj.Id,
          "isParent": true,
          "isClick": false,
          "isEdit": false,
          "isAdd": false,
          "data": {
            "TaskName": editval.TaskName,
            "ClientName": props.clientName,
            "ClientID": props.clientId,
            "DueDate": SPServices.displayDate(editval.DueDate),
            "PriorityLevel": editval.PriorityLevel,
            "Status": editval.Status,
            "Created": moment().format("YYYY-MM-DD"),
            "Backup": curdata.Backup.Id?curdata.Backup:configure,
            "Creator": curdata.Creator
          },
          "children": obj.children
        }
        BindAfterDataEdit(newData,obj);
        }
        else
        {
          newData={
            key:obj.key,
            Index:obj.Index,
            Id: res.data.ID,
            subId: obj.subId,
            isClick: false,
            isParent: false,
            isAdd: false,
            isEdit: false,
            data: {
              TaskName: curdata.TaskName,
              ClientName:props.clientName,
              ClientID:props.clientId,
              Creator: curdata.Creator,
              Backup: curdata.Backup.Id?curdata.Backup:configure,
              DueDate: SPServices.displayDate(editval.DueDate),
              PriorityLevel: editval.PriorityLevel,
              Status: editval.Status,
              Created: moment().format("YYYY-MM-DD")
      
        }}
        let indexOfObj=curMyTask.findIndex(data=>data.Id==obj.subId);
        if(indexOfObj>=0)
        BindAfternewChildData(newData,indexOfObj,obj.Index);
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
    console.log("test")
  };
  //addtextfield
  const _addTextField = (val: any, fieldType: string): JSX.Element => {
    
    const data: any = val?.data;

    if (!val.Id && val.isAdd) {
      if (fieldType == "TaskName") {
        return (
          <InputText
            type="text"
            placeholder="TaskName"
            value={curdata.TaskName}
            className={styles.tblTxtBox}
            onChange={(e: any) => getOnchange("TaskName", e.target.value)}
          />
        );
      }
      if (fieldType == "DueDate") {
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
        return (
          <Dropdown
            options={dropval}
            placeholder="priority level"
            optionLabel="name"
            value={curdata.PriorityLevel || null}
            onChange={(e: any) => getOnchange("PriorityLevel", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Status") {
        return (
          <Dropdown
            options={dropval}
            placeholder="Select a status"
            optionLabel="name"
            value={curdata.Status || null}
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
        return (
          <InputText
            type="text"
            value={curdata.TaskName}
            onChange={(e: any) => getOnchange("TaskName", e.target.value)}
          />
        );
      }
      if (fieldType == "DueDate") {
        return <Calendar value={new Date(curdata.DueDate)} onChange={(e) => getOnchange("DueDate", e.value)} showIcon />;
      }

      if (fieldType == "Creator") {
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
        return (
          <Dropdown
            options={dropval}
            placeholder="Select a priority level"
            optionLabel="name"
            value={curdata.PriorityLevel}
            onChange={(e: any) => getOnchange("PriorityLevel", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "Status") {
        return (
          <Dropdown
            options={dropval}
            placeholder="Select a status"
            optionLabel="name"
            value={curdata.Status}
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

  function BindAfternewData(newData)
  {
        let tempData=curMyTask;
        let indexOfObj=tempData.findIndex(data=>!data.Id);
        if(indexOfObj>=0)
        {
          tempData[indexOfObj]=newData;
        }
        for(let i=0;i<tempData.length;i++)
        {
          tempData[i].isClick=false;
          tempData[i].isAdd=false;
          tempData[i].isEdit=false;
        }
        setCurMyTask([...tempData]);
        setMasterdata([...tempData]);
        setCurdata({...data});
  }


  function BindAfternewChildData(newData,parentIndex,childIndex)
  {
        let tempData=curMyTask;
        tempData[parentIndex].children[childIndex]=newData;
        for(let i=0;i<tempData.length;i++)
        {
          tempData[i].isClick=false;
          tempData[i].isAdd=false;
          tempData[i].isEdit=false;
          for(let j=0;j<tempData[i].children.length;j++)
          {
            tempData[i].children[j].isClick=false;
            tempData[i].children[j].isAdd=false;
            tempData[i].children[j].isEdit=false;
  
          }

        }
        setCurMyTask([...tempData]);
        setMasterdata([...tempData]);
        setCurdata({...data});
  }

  function BindAfterDataEdit(newData,oldObject)
  {
        let tempData=curMyTask;
        let indexOfObj=tempData.findIndex(data=>data.Id==oldObject.Id);
        if(indexOfObj>=0)
        {
          tempData[indexOfObj]=newData;
          
        }
        for(let i=0;i<tempData.length;i++)
        {
          tempData[i].isClick=false;
          tempData[i].isAdd=false;
          tempData[i].isEdit=false;
          for(let j=0;j<tempData[i].children.length;j++)
          {
            tempData[i].children[j].isClick=false;
            tempData[i].children[j].isAdd=false;
            tempData[i].children[j].isEdit=false;
          }

        }
        setCurMyTask([...tempData]);
        setMasterdata([...tempData]);
        setCurdata({...data});
  }

  function BindAfterDataDelete(ID)
  {
        let tempData=curMyTask;
        let indexOfObj=tempData.findIndex(data=>data.Id==ID);
        if(indexOfObj>=0)
        {
          tempData.splice(indexOfObj,1);
        }
        setCurMyTask([...tempData]);
        setMasterdata([...tempData]);
        setCurdata({...data});
  }

  function BindAfterChildDataDelete(ID,parentId,childIndex)
  {
        let tempData=curMyTask;
        let indexOfObj=tempData.findIndex(data=>data.Id==parentId);
        tempData[indexOfObj].children.splice(childIndex,1);
        setCurMyTask([...tempData]);
        setMasterdata([...tempData]);
        setCurdata({...data});
  }

  
  useEffect(() => 
  {
    setCurMyTask([...props.mainData]);
    setMasterdata([...props.mainData]);
  }, [props.bind]);

  return (
    <div className={styles.myTaskSection}>
      <div
        className={styles.myTaskHeader}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "10px 0px",
        }}
      >
        <Label>{props.clientName?props.clientName:""}</Label>
        <Button
          label="New task"
          severity="warning"
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
          header="TaskName"
          expander
          sortable
          style={{ width: "265px" }}
          body={(obj: any) => _addTextField(obj, "TaskName")}
        />
        <Column style={{ width: "200px" }} body={(obj: any) => _action(obj)} />
        <Column
          field="ClientName"
          header="ClientName"
          sortable
          style={{ width: "200px" }}
        />
        <Column
          field="Creator"
          header="Creator"
          sortable
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Creator")}
        />
        <Column
          field="Backup"
          header="Backup"
          sortable
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Backup")}
        />
        <Column
          field="DueDate"
          header="Due Date"
          sortable
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "DueDate")}
        />

        <Column
          field="PriorityLevel"
          header=" Priority Level"
          sortable
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "PriorityLevel")}
        />
        <Column
          field="Status"
          header="Status"
          sortable
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Status")}
        />
        <Column
          field="Created"
          header="Created"
          sortable
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Created")}
        />
        <Column
          style={{ width: "150px" }}
          body={(obj: any,index) =>
            obj.isClick && (obj.isAdd || obj.isEdit) && _actionSubmit(obj)
          }
        />
      </TreeTable>
    </div>
  );
};

export default UserClientDB;
