import * as React from "react";
import { useState, useEffect } from "react";
import { TreeTable, TreeTableExpandedKeysType } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Label, Persona, PersonaSize } from "@fluentui/react";
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
let MainTask: IParent[] = [];
let SubTask: IChild[] = [];
let MainArray: IParent[] = [];
const Sample = (props): JSX.Element => {
  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);
  const [search, setSearch] = useState("");

  const [curuserId, setCuruserId] = useState({
    Id: null,
    EMail: "",
    Title: "",
  });

  const data: IMyTasks = {
    TaskName: "",
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
  const [configure, setConfigure] = useState({
    backupId: null,
    EMail: "",
    Title: "",
  });
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
    },
  };
  const [curdata, setCurdata] = useState<IMyTasks>(data);
  const [curMyTask, setCurMyTask] = useState<any[]>([]);
  const [error, setError] = useState({
    TaskName: "",

    DueDate: "",
  });
  const [masterdata, setMasterdata] = useState<any[]>([]);

  //onchange values get
  const getOnchange = (key, _value) => {
    let FormData = { ...curdata };
    let err = { ...error };
    if (key == "TaskName") {
      if (_value.trim() == "") {
        err[key] = "TaskName required";
      } else {
        err[key] = "";
      }
    }
    if (key == "DueDate") {
      if (_value == null) {
        err[key] = "DueDate required";
      } else {
        err[key] = null;
      }
    }
    if (key == "Backup") {
      FormData.Backup.Id = _value;
    } else if (key == "Status" || key == "PriorityLevel") {
      FormData[key] = _value;
    }

    // if(key=="Backup"){
    //     FormData.Backup.Id=_value
    // }
    else {
      FormData[key] = _value;
    }
    console.log(FormData, "formdata");
    setError({ ...err });

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
          onClick={(_) => {
            console.log(_);

            _handleData("addChild", obj);
            toggleApplications(obj.key);
          }}
        />
        {/* <i
          className="pi pi-plus"
          onClick={() => {
            _handleData("addChild", obj);
            toggleApplications(obj.key);
          }}
        ></i> */}

        <Button
          disabled={obj.isClick}
          type="button"
          icon="pi pi-pencil"
          onClick={(_) => {
            _handleData("edit", obj);
          }}
        />
        <Button
          disabled={obj.isClick}
          type="button"
          icon="pi pi-trash"
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
          disabled={error.TaskName || error.DueDate ? true : false}
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
    console.log(obj, "obj");

    if (obj.isParent && obj.isEdit && obj.Id) {
      Editfunction(obj);
    } else if (obj.isParent && !obj.Id) {
      AddItem(obj);
    } else if (!obj.isParent && !obj.Id) {
      AddItem(obj);
    }
  };

  //validate

  const validate = () => {
    let valid = true;
    const newErrors = { ...error };

    if (!curdata.TaskName.trim()) {
      newErrors.TaskName = "TaskName is required";
      valid = false;
    }

    if (!curdata.DueDate) {
      newErrors.DueDate = "Date is required";
      valid = false;
    }

    setError({ ...newErrors });
    return valid;
  };
  //Add item
  const AddItem = (obj) => {
    debugger;
    console.log(obj, "obj");

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
    };

    let Json = obj.isParent ? Main : sub;

    const isValid = validate();

    if (isValid) {
      SPServices.SPAddItem({
        Listname: ListName,
        RequestJSON: Json,
      })
        .then((res) => {
          setCurdata({ ...data });
          getcurUser();
          console.log(res, "success");
        })
        .catch((err) => errFunction(err));
    }
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

    console.log(Ids);

    SPServices.SPDeleteItem({
      Listname: ListName,
      ID: obj.Id,
    })
      .then((res) => {
        if (Ids.length) {
          for (let i: number = 0; Ids.length > i; i++) {
            SPServices.SPDeleteItem({
              Listname: "SubTasks",
              ID: Ids[i].Id,
            })
              .then((res) => {
                if (Ids.length === i + 1) {
                  console.log("delete successfully");
                  getcurUser();
                }
              })
              .catch((err) => {
                errFunction(err);
              });
          }
        } else {
          console.log("delete successfully");
          getcurUser();
        }
      })
      .catch((err) => {
        errFunction(err);
      });
  };

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
        console.log(res, "editsuccessfully");
        setCurdata({ ...data });

        getcurUser();
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
  };
  //addtextfield
  const _addTextField = (val: any, fieldType: string): JSX.Element => {
    // console.log(val, "valtext");
    const data: any = val?.data;

    if (!val.Id && val.isAdd) {
      if (fieldType == "TaskName") {
        return (
          <>
            <InputText
              type="text"
              placeholder="TaskName"
              value={curdata.TaskName}
              aria-errormessage={error.TaskName ? error.TaskName : ""}
              className={styles.tblTxtBox}
              onChange={(e: any) => getOnchange("TaskName", e.target.value)}
            />
            {error.TaskName && <div className="p-error">{error.TaskName}</div>}
          </>
        );
      }
      if (fieldType == "DueDate") {
        return (
          <>
            <Calendar
              placeholder="Date"
              value={new Date(curdata.DueDate)}
              onChange={(e) => getOnchange("DueDate", e.value)}
              showIcon
            />
            {/* {error.DueDate && <div className="p-error">{error.DueDate}</div>} */}
          </>
        );
      }
      //   if (fieldType == "Creator") {
      //     return (
      //       <PeoplePicker
      //         context={props.context}
      //         personSelectionLimit={1}
      //         groupName={""}
      //         showtooltip={true}
      //         placeholder="Enter Email"
      //         // required={true}
      //         ensureUser={true}
      //         // showHiddenInUI={false}
      //         showHiddenInUI={true}
      //         principalTypes={[PrincipalType.User]}
      //         // defaultSelectedUsers={
      //         //   value.PeopleEmail ? [value.PeopleEmail] : []
      //         // }
      //         defaultSelectedUsers={curuserId.EMail ? [curuserId.EMail] : []}
      //         resolveDelay={1000}
      //         onChange={(items: any[]) => {
      //           if (items.length > 0) {
      //             const selectedItem = items[0];
      //             getOnchange("Creator", selectedItem.id);
      //             // getonChange("PeopleEmail", selectedItem.secondaryText);
      //           } else {
      //             // No selection, pass null or handle as needed
      //             getOnchange("Creator", null);
      //           }
      //         }}
      //       />
      //     );
      //   }
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
        return <Calendar value={new Date(curdata.DueDate)} showIcon />;
      }

      //   if (fieldType == "Creator") {
      //     return (
      //       <PeoplePicker
      //         context={props.context}
      //         personSelectionLimit={1}
      //         groupName={""}
      //         showtooltip={true}
      //         // required={true}
      //         ensureUser={true}
      //         // showHiddenInUI={false}
      //         showHiddenInUI={true}
      //         principalTypes={[PrincipalType.User]}
      //         // defaultSelectedUsers={
      //         //   value.PeopleEmail ? [value.PeopleEmail] : []
      //         // }
      //         defaultSelectedUsers={curuserId.EMail ? [curuserId.EMail] : []}
      //         resolveDelay={1000}
      //         // onChange={(items: any[]) => {
      //         //   if (items.length > 0) {
      //         //     const selectedItem = items[0];
      //         //     getonChange("assignId", selectedItem.id);
      //         //     // getonChange("PeopleEmail", selectedItem.secondaryText);
      //         //   } else {
      //         //     // No selection, pass null or handle as needed
      //         //     getonChange("assignId", null);
      //         //   }
      //         // }}
      //       />
      //     );
      //   }
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
      //   if (fieldType == "Backup") {
      //     return (
      //       <span
      //         style={{
      //           textOverflow: "ellipsis",
      //           overflow: "hidden",
      //           whiteSpace: "nowrap",
      //           display: "block",
      //           width: "160px",
      //         }}
      //       >
      //         {data[fieldType].Title}
      //       </span>
      //     );
      //   }
      if (fieldType == "Creator" || fieldType == "Backup") {
        return (
          <Persona
            size={PersonaSize.size32}
            text={data[fieldType].Title}
            imageUrl={
              curuserId.Id &&
              "/_layouts/15/userphoto.aspx?size=S&username=" +
                data[fieldType].EMail
            }
          />
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
  //getmaintask
  const getMainTask = (id) => {
    debugger;
    SPServices.SPReadItems({
      Listname: "Tasks",
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
        MainTask = [];
        res.forEach((val: any) => {
          val.ClientName == null &&
            MainTask.push({
              key: val.Id,
              Id: val.Id,
              isParent: true,
              isClick: false,
              isAdd: false,
              isEdit: false,
              data: {
                TaskName: val.TaskName,
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
                DueDate: val.DueDate ? moment(val.DueDate).format("l") : null,
                PriorityLevel: val.PriorityLevel,
                Status: val.Status,
                Created: moment(val.Created).format("l"),
              },
              children: [],
            });
        });
        console.log(MainTask, "maintask");
        getsubTask();
      })
      .catch((err) => {
        errFunction(err);
      });
  };
  //getsubtask
  const getsubTask = () => {
    MainArray = [];
    let count = 0;

    for (let i = 0; i < MainTask.length; i++) {
      SPServices.SPReadItems({
        Listname: "SubTasks",
        Select:
          "*,  Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title, MainTaskID/ID",
        Expand: "MainTaskID, Backup, Author",
        Orderby: "Created",
        Orderbydecorasc: false,
        Filter: [
          {
            FilterKey: "MainTaskID/ID",
            FilterValue: MainTask[i].Id.toString(),
            Operator: "eq",
          },
        ],
        Topcount: 5000,
      })
        .then((res) => {
          SubTask = [];

          res.forEach((val: any, index) => {
            val.ClientName == null &&
              SubTask.push({
                key: `${MainTask[i].Id}-${index + 1}`,
                Id: val.Id,
                subId: MainTask[i].Id,
                isClick: false,
                isParent: false,
                isAdd: false,
                isEdit: false,
                data: {
                  TaskName: val.TaskName,
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
                  DueDate: val.DueDate ? moment(val.DueDate).format("l") : null,
                  PriorityLevel: val.PriorityLevel,
                  Status: val.Status,
                  Created: moment(val.Created).format("l"),
                },
              });
          });

          MainArray.push({
            ...MainTask[i],
            children: SubTask,
          });
          count++;

          if (count === MainTask.length) {
            setCurMyTask([...MainArray]);
            setMasterdata([...MainArray]);
          }

          console.log(MainArray, "MainArray");
        })
        .catch((err) => {
          errFunction(err);
        });
    }
  };
  //getcuruser
  const getcurUser = () => {
    let user = sp.web.currentUser().then((res) => {
      console.log(res.Id);
      curuserId.Id = res.Id;
      curuserId.EMail = res.Email;
      curuserId.Title = res.Title;
      SPServices.SPReadItems({
        Listname: "Configuration",
        Select:
          "*,Name/EMail,Name/Title ,Name/ID ,TeamCaptain/EMail,TeamCaptain/Title ,BackingUp/Title,BackingUp/EMail,BackingUp/ID",
        Expand: "BackingUp ,Name,TeamCaptain",
        Filter: [
          {
            FilterKey: "Name/ID",
            FilterValue: res.Id.toString(),
            Operator: "eq",
          },
        ],
      })
        .then((res: any) => {
          let x = { ...configure };
          res.forEach((val) => {
            x.EMail = val.BackingUp[0].EMail;
            x.backupId = val.BackingUp[0].ID;
            x.Title = val.BackingUp[0].Title;
          });
          setConfigure({ ...x });
          //   console.log(res.BackingUp[0].EMail, "backup");
          //   res.BackingUp.EMail
        })
        .catch((err) => errFunction(err));

      setCuruserId({ ...curuserId });
      getMainTask(res.Id);
    });
  };
  console.log(setSelectedNodeKeys, "nodekeys");
  const onSelect = (event) => {
    // x = [];
    x.push(event.node.Id);
    console.log(x, "xpush");
    console.log(event.node.Id);
  };
  const unselect = (event) => {
    x = x.filter((removeId) => {
      return removeId != event.node.Id;
    });
    console.log(x, "yremove,");
    console.log(event.node.Id);
  };
  const SearchFilter = (e) => {
    setSearch(e);

    // let filteredResults = masterdata.filter((item) =>
    //   item.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())
    // );

    // setCurMyTask([...filteredResults]);

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
    console.log(e);
  };
  const toggleApplications = (key) => {
    let _expandedKeys = { ...expandedKeys };

    if (_expandedKeys[`${key}`]) delete _expandedKeys[`${key}`];
    else _expandedKeys[`${key}`] = true;
    setExpandedKeys(_expandedKeys);
  };
  useEffect(() => {
    // setCurMyTask([..._myTaskArray]);
    getcurUser();
  }, []);

  return (
    <div className={styles.myTaskSection}>
      <div className={styles.filterSection}>
        {/* <InputText
          value={search}
          onChange={(e: any) => SearchFilter(e.target.value)}
        /> */}

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Search"
            value={search}
            onChange={(e: any) => SearchFilter(e.target.value)}
          />
        </span>
        <Button
          label="Automate"
          severity="warning"
          //   onClick={() => {
          //     _handleData("addParent", { ..._sampleParent });
          //   }}
        />
        <Button
          label="Export"
          severity="warning"
          onClick={() => {
            _handleData("addParent", { ..._sampleParent });
          }}
        />
      </div>
      <div
        className={styles.myTaskHeader}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "10px 0px",
        }}
      >
        <Label>My Tasks</Label>
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
          console.log(e);
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
          body={(obj: any) =>
            obj.isClick && (obj.isAdd || obj.isEdit) && _actionSubmit(obj)
          }
        />
      </TreeTable>
    </div>
  );
};

export default Sample;
