import * as React from "react";
import { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
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

  //   const _myTaskArray = [
  //     {
  //       key: "1",
  //       Id: "1",
  //       isParent: true,
  //       isClick: false,
  //       isEdit: false,
  //       isAdd: false,
  //       data: {
  //         name: "LinkedIn Learning",
  //         Creator: "devaraj@chandrudemo.onmicrosoft.com",
  //         Backup: "devaraj@chandrudemo.onmicrosoft.com",
  //         DueDate: "08/11/1997",
  //         PriorityLevel: "high",
  //         Status: "complete",
  //         Created: "08/11/1997",
  //       },
  //       children: [
  //         {
  //           key: "1-1",
  //           Id: "1",
  //           isParent: false,
  //           isClick: false,
  //           isEdit: false,
  //           isAdd: false,
  //           data: {
  //             name: "How to Schedule",
  //             Creator: "devaraj@chandrudemo.onmicrosoft.com",
  //             Backup: "devaraj@chandrudemo.onmicrosoft.com",
  //             DueDate: "08/11/1997",
  //             PriorityLevel: "high",
  //             Status: "complete",
  //             Created: "08/11/1997",
  //           },
  //         },
  //         {
  //           key: "1-2",
  //           Id: "2",
  //           isParent: false,
  //           isClick: false,
  //           isEdit: false,
  //           isAdd: false,
  //           data: {
  //             name: "How to Schedule",
  //             Creator: "devaraj@chandrudemo.onmicrosoft.com",
  //             Backup: "devaraj@chandrudemo.onmicrosoft.com",
  //             DueDate: "08/11/1997",
  //             PriorityLevel: "high",
  //             Status: "complete",
  //             Created: "08/11/1997",
  //           },
  //         },
  //         // {
  //         //   key: "1-3",
  //         //   Id: "3",
  //         //   isParent: false,
  //         //   isClick: false,
  //         //   isEdit: false,
  //         //   isAdd: false,
  //         //   data: {
  //         //     name: "Applications",
  //         //     Creator: "devaraj@chandrudemo.onmicrosoft.com",
  //         //     Backup: "devaraj@chandrudemo.onmicrosoft.com",
  //         //     DueDate: "08/11/1997",
  //         //     PriorityLevel: "high",
  //         //     Status: "complete",
  //         //     Created: "08/11/1997",
  //         //   },
  //         // },
  //       ],
  //     },
  //     {
  //       key: "2",
  //       Id: "2",
  //       isParent: true,
  //       isClick: false,
  //       isEdit: false,
  //       isAdd: false,
  //       data: {
  //         name: "Unload Dishwasher",
  //         Creator: "devaraj@chandrudemo.onmicrosoft.com",
  //         Backup: "devaraj@chandrudemo.onmicrosoft.com",
  //         DueDate: "08/11/1997",
  //         PriorityLevel: "high",
  //         Status: "complete",
  //         Created: "08/11/1997",
  //       },
  //       children: [
  //         {
  //           key: "2-1",
  //           Id: "4",
  //           isParent: false,
  //           isClick: false,
  //           isEdit: false,
  //           isAdd: false,
  //           data: {
  //             name: "How to Schedule",
  //             Creator: "devaraj@chandrudemo.onmicrosoft.com",
  //             Backup: "devaraj@chandrudemo.onmicrosoft.com",
  //             DueDate: "08/11/1997",
  //             PriorityLevel: "high",
  //             Status: "complete",
  //             Created: "08/11/1997",
  //           },
  //         },
  //         {
  //           key: "2-2",
  //           Id: "5",
  //           isParent: false,
  //           isClick: false,
  //           isEdit: false,
  //           isAdd: false,
  //           data: {
  //             name: "How to Schedule",
  //             Creator: "devaraj@chandrudemo.onmicrosoft.com",
  //             Backup: "devaraj@chandrudemo.onmicrosoft.com",
  //             DueDate: "08/11/1997",
  //             PriorityLevel: "high",
  //             Status: "complete",
  //             Created: "08/11/1997",
  //           },
  //         },
  //       ],
  //     },
  //   ];

  const [curMyTask, setCurMyTask] = useState<any[]>([]);
  const [masterdata, setMasterdata] = useState<any[]>([]);
  //onchange values get
  const getOnchange = (key, _value) => {
    let FormData = { ...curdata };
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
    console.log(obj, "obj");

    if (obj.isParent && obj.isEdit && obj.Id) {
      Editfunction(obj);
    } else if (obj.isParent && !obj.Id) {
      AddItem(obj);
    } else if (!obj.isParent && !obj.Id) {
      AddItem(obj);
    }
  };
  //Add item
  const AddItem = (obj) => {
    console.log(obj, "obj");

    let ListName = obj.isParent ? "Tasks" : "SubTasks";
    let sub = {
      TaskName: curdata.TaskName,
      BackupId: curdata.Backup.Id,
      DueDate: new Date(curdata.DueDate).toISOString(),
      PriorityLevel: curdata.PriorityLevel["name"],
      Status: curdata.Status["name"],
      MainTaskIDId: Number(obj.key.split("-")[0]),
    };
    let Main = {
      TaskName: curdata.TaskName,
      BackupId: curdata.Backup.Id,
      DueDate: new Date(curdata.DueDate).toISOString(),
      PriorityLevel: curdata.PriorityLevel["name"],
      Status: curdata.Status["name"],
    };

    let Json = obj.isParent ? Main : sub;

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
      DueDate: new Date(curdata.DueDate).toISOString(),
      PriorityLevel: curdata.PriorityLevel["name"],
      Status: curdata.Status["name"],
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
  //getmaintask
  const getMainTask = (id) => {
    SPServices.SPReadItems({
      // Listname: "Disclosed Investors Dev",
      Listname: "Tasks",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title",

      Expand: "Assistant,Backup,Author",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "Assistant/ID",
          FilterValue: id,
          Operator: "eq",
        },
      ],
      //   FilterCondition: curuserId ? `AssistantId eq '${curuserId}'` : "",
    })
      .then((res) => {
        MainTask = [];
        res.forEach((val: any) => {
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
                Id: val.Backup.ID,
                EMail: val.Backup.EMail,
                Title: val.Backup.Title,
              },
              DueDate: val.DueDate,
              PriorityLevel: val.PriorityLevel,
              Status: val.Status,
              Created: val.Created,
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
    debugger;
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
                  Id: val.Backup.ID,
                  EMail: val.Backup.EMail,
                  Title: val.Backup.Title,
                },
                DueDate: val.DueDate,
                PriorityLevel: val.PriorityLevel,
                Status: val.Status,
                Created: val.Created,
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
          onClick={() => {
            _handleData("addParent", { ..._sampleParent });
          }}
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
        // selectionMode="multiple"
        sortMode="multiple"
        selectionKeys={selectedNodeKeys}
        onSelect={onSelect}
        onUnselect={unselect}
        onSelectionChange={(e) => {
          console.log(e);
          setSelectedNodeKeys(e.value);
        }}
        value={[...curMyTask]}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
      >
        <Column
          field="TaskName"
          header="TaskName"
          expander
          sortable
          style={{ width: "265px" }}
          //   style={{ height: "3.5rem", width: "150px" }}
          body={(obj: any) => _addTextField(obj, "TaskName")}
        />
        <Column
          //   headerClassName="w-10rem"
          style={{ width: "200px" }}
          body={(obj: any) =>
            // !obj.isClick && _action(obj)
            _action(obj)
          }
        />

        <Column
          field="Creator"
          header="Creator"
          sortable
          style={{ width: "200px" }}
          //   style={{ height: "3.5rem", width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Creator")}
        />
        <Column
          field="Backup"
          header="Backup"
          sortable
          //   style={{ height: "3.5rem", width: "200px" }}
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Backup")}
        />
        <Column
          field="DueDate"
          header="Due Date"
          sortable
          //   style={{ height: "3.5rem", width: "200px" }}
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "DueDate")}
        />

        <Column
          field="PriorityLevel"
          header=" Priority Level"
          sortable
          //   style={{ height: "3.5rem", width: "150px" }}
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "PriorityLevel")}
        />
        <Column
          field="Status"
          header="Status"
          sortable
          //   style={{ height: "3.5rem", width: "150px" }}
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Status")}
        />
        <Column
          field="Created"
          header="Created"
          sortable
          //   style={{ height: "3.5rem", width: "150px" }}
          style={{ width: "200px" }}
          body={(obj: any) => _addTextField(obj, "Created")}
        />
        <Column
          //   headerClassName="w-10rem"
          //   style={{ width: "150px" }}
          style={{ width: "150px" }}
          body={
            (obj: any) =>
              obj.isClick && (obj.isAdd || obj.isEdit) && _actionSubmit(obj)
            // _actionSubmit(obj)
          }
        />
      </TreeTable>
    </div>
  );
};

export default Sample;
