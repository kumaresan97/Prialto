import * as React from "react";
import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { InputText } from "primereact/inputtext";
import SPServices from "../../../Global/SPServices";
import { IClient } from "../../../Global/TaskMngmnt";
const Client = (props) => {
  const [isadd, setisAdd] = useState(false);
  const [isedit, setisEdit] = useState(false);
  let products: IClient = {
    Id: 1,
    FirstName: "1000",
    LastName: "f230fh0g3",
    CompanyName: "o BamboWatch",
    Assistant: {
      Id: null,
      EMail: "",
      Title: "Kumaresan",
    },
    Backup: {
      Id: null,
      EMail: "",
      Title: "raj",
    },
  };
  let x: IClient = {
    Id: null,
    FirstName: "",
    LastName: "",
    CompanyName: "",
    Assistant: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Backup: {
      Id: null,
      EMail: "",
      Title: "",
    },
  };
  const [clientdetail, setClientdetail] = useState<IClient[]>([]);
  const [value, setValue] = useState(x);
  const handledata = (obj) => {
    setisAdd(false);
    setValue({ ...obj });

    console.log(obj, "edit");
  };

  const AddItem = (obj) => {
    debugger;
    console.log(obj, "obj");

    let json = {
      FirstName: value.FirstName ? value.FirstName : "",
      LastName: value.LastName ? value.LastName : "",
      CompanyName: value.CompanyName ? value.CompanyName : "",
      AssistantId: value.Assistant.Id ? value.Assistant.Id : null,
      BackupId: value.Backup.Id ? value.Backup.Id : null,
    };

    SPServices.SPAddItem({
      Listname: "ClientDetails",
      RequestJSON: json,
    })
      .then((res) => {
        setisAdd(false);
        setisEdit(false);
        setValue({ ...x });
        // getcurUser();
        console.log(res, "success");
      })
      .catch((err) => errFunction(err));
  };
  const Editfunction = (obj) => {
    let json = {
      FirstName: value.FirstName ? value.FirstName : "",
      LastName: value.LastName ? value.LastName : "",
      CompanyName: value.CompanyName ? value.CompanyName : "",
      AssistantId: value.Assistant.Id ? value.Assistant.Id : null,
      BackupId: value.Backup.Id ? value.Backup.Id : null,
    };
    SPServices.SPUpdateItem({
      Listname: "ClientDetails",
      ID: obj.Id,
      RequestJSON: json,
    })
      .then((res) => {
        console.log(res, "editsuccessfully");
        setisAdd(false);
        setisAdd(false);
        setValue({ ...x });

        getdatas();
      })
      .catch((err) => errFunction(err));
  };

  const _handleDataoperation = (key, obj) => {
    debugger;
    console.log(obj, "obj");

    if (isedit && obj.Id) {
      Editfunction(obj);
    } else if (!obj.Id && isadd) {
      AddItem(obj);
    } else if (key == "cancel") {
      if (obj.Id) {
        let cancel = [...clientdetail].filter((val) => val.Id !== null);
        setisAdd(false);
        setisEdit(false);
        setClientdetail([...cancel]);
      } else {
        let cancel = [...clientdetail].filter((val) => val.Id !== null);
        setisAdd(false);
        setisEdit(false);
        setClientdetail([...cancel]);
      }
    }
  };

  const _action = (obj: any): JSX.Element => {
    return (
      <div>
        {isedit == false && isadd == false && (
          <Button
            type="button"
            icon="pi pi-pencil"
            onClick={(_) => {
              handledata(obj);
              setisEdit(true);
            }}
          />
        )}
        {((isadd && obj.Id == value.Id) || (isedit && obj.Id == value.Id)) && (
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              type="button"
              icon="pi pi-check"
              rounded
              onClick={(_) => {
                _handleDataoperation("check", obj);
              }}
            />
            <Button
              type="button"
              icon="pi pi-times"
              rounded
              onClick={(_) => {
                _handleDataoperation("cancel", obj);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const _addTextField = (val: any, fieldType: string): JSX.Element => {
    const data: any = val;

    if (!val.Id && isadd) {
      if (fieldType == "FirstName") {
        return (
          <InputText
            type="text"
            placeholder="TaskName"
            value={value.FirstName}
            onChange={(e) => getOnchange("FirstName", e.target.value)}
          />
        );
      }
      if (fieldType == "LastName") {
        return (
          <InputText
            type="text"
            placeholder="TaskName"
            value={value.LastName}
            onChange={(e) => getOnchange("LastName", e.target.value)}
          />
        );
      }
      if (fieldType == "CompanyName") {
        return (
          <InputText
            type="text"
            placeholder="TaskName"
            value={value.CompanyName}
            onChange={(e) => getOnchange("CompanyName", e.target.value)}
          />
        );
      }

      if (fieldType == "Assistant") {
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
            defaultSelectedUsers={
              value.Assistant.EMail ? [value.Assistant.EMail] : []
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Assistant", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Assistant", null);
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
            defaultSelectedUsers={
              value.Backup.EMail ? [value.Backup.EMail] : []
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

      //   return <InputText type="text" value={""} />;
    } else if (val.Id && isedit && val.Id === value.Id) {
      if (fieldType == "FirstName") {
        return (
          <InputText
            type="text"
            placeholder="TaskName"
            value={value.FirstName}
            onChange={(e) => getOnchange("FirstName", e.target.value)}
          />
        );
      }
      if (fieldType == "LastName") {
        return (
          <InputText
            type="text"
            placeholder="TaskName"
            value={value.LastName}
            onChange={(e) => getOnchange("LastName", e.target.value)}
          />
        );
      }
      if (fieldType == "CompanyName") {
        return (
          <InputText
            type="text"
            placeholder="TaskName"
            value={value.CompanyName}
            onChange={(e) => getOnchange("CompanyName", e.target.value)}
          />
        );
      }

      if (fieldType == "Assistant") {
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
            defaultSelectedUsers={
              value.Assistant.EMail ? [value.Assistant.EMail] : []
            }
            // defaultSelectedUsers={[]}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Assistant", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Assistant", null);
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
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              value.Backup.EMail ? [value.Backup.EMail] : []
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
    } else {
      if (fieldType == "Assistant" || fieldType == "Backup") {
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
      }
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
  };
  const errFunction = (err) => {
    console.log(err);
  };
  const getdatas = () => {
    SPServices.SPReadItems({
      Listname: "ClientDetails",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title",

      Expand: "Assistant,Backup,Author",
      Orderby: "Created",
      Orderbydecorasc: false,
    })
      .then((res) => {
        let array: IClient[] = [];
        res.forEach((val: any) => {
          array.push({
            Id: val.Id,
            FirstName: val.FirstName ? val.FirstName : "",
            LastName: val.LastName ? val.LastName : "",
            CompanyName: val.CompanyName ? val.CompanyName : "",
            Assistant: {
              Id: val.Assistant?.ID,
              EMail: val.Assistant?.EMail,
              Title: val.Assistant?.Title,
            },
            Backup: {
              Id: val.Backup?.ID,
              EMail: val.Backup?.EMail,
              Title: val.Backup?.Title,
            },
          });
        });
        setClientdetail([...array]);
      })
      .catch((err) => errFunction(err));
  };

  const getOnchange = (key, _value) => {
    let FormData = { ...value };
    // let err = { ...error };

    if (key == "Assistant") {
      FormData.Assistant.Id = _value;
    } else if (key == "Backup") {
      FormData.Backup.Id = _value;
    } else {
      FormData[key] = _value;
    }

    console.log(FormData, "formdata");

    setValue({ ...FormData });
  };
  useEffect(() => {
    getdatas();
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          margin: "0px 0px 10px 0px",
        }}
      >
        {/* <InputText
          value={search}
          onChange={(e: any) => SearchFilter(e.target.value)}
        /> */}

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Search"
            // value={search}
            // onChange={(e: any) => SearchFilter(e.target.value)}
          />
        </span>
        <Button
          label="Export"
          severity="warning"
          //   onClick={() => {
          //     _handleData("addParent", { ..._sampleParent });
          //   }}
        />
        <Button
          label="Add Client"
          severity="warning"
          onClick={() => {
            setisEdit(false);
            setisAdd(true);
            setClientdetail([...clientdetail, x]);
            // _handleData("addParent", { ..._sampleParent });
          }}
        />
      </div>
      <DataTable
        value={clientdetail}
        sortMode="multiple"
        tableStyle={{ minWidth: "60rem" }}
      >
        <Column
          field="FirstName"
          header="First Name"
          sortable
          body={(obj: any) => _addTextField(obj, "FirstName")}
        ></Column>
        <Column
          field="LastName"
          header="last Name"
          sortable
          body={(obj: any) => _addTextField(obj, "LastName")}
        ></Column>
        <Column
          field="CompanyName"
          header="Company Name"
          sortable
          body={(obj: any) => _addTextField(obj, "CompanyName")}
        ></Column>
        <Column
          field="Assistant"
          header="Assistant"
          sortable
          body={(obj: any) => _addTextField(obj, "Assistant")}
        ></Column>
        <Column
          field="Backup"
          header="Backup"
          sortable
          body={(obj: any) => _addTextField(obj, "Backup")}
        ></Column>
        <Column header="Action" body={(obj) => _action(obj)}></Column>
      </DataTable>
    </div>
  );
};
export default Client;
