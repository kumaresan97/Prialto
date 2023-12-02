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
import { Dropdown } from "primereact/dropdown";
import SPServices from "../../../Global/SPServices";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import styles from "./TaskManagement.module.scss";
import Loader from "./Loader";

interface clinet {
  Id: number;
  // FirstName: string;
  // LastName: string;
  Name: {
    Id: number;
    EMail: string;
    Title: string;
  };
  Role: string;
  Manager: {
    Id: number;
    EMail: string;
    Title: string;
  };
  Team: string;
  TeamCaptain: {
    Id: number;
    EMail: string;
    Title: string;
  };
  TeamLeader: {
    Id: number;
    EMail: string;
    Title: string;
  };
  Cohort: string;

  DirectReports: {
    Id: number;
    EMail: string;
    Title: string;
  }[];
  BackingUp: {
    Id: number;
    EMail: string;
    Title: string;
  }[];
}
let role = [
  { name: "PA", code: "PA" },
  { name: "TC", code: "TC" },
  { name: "TL", code: "TL" },
];
let team = [
  { name: "Team1", code: "Team1" },
  { name: "Team2", code: "Team2" },
  { name: "Team3", code: "Team3" },
];

const OrgChart = (props) => {
  // style variables
  const multiPeoplePickerStyle = {
    root: {
      minWidth: 200,
      background: "rgba(218, 218, 218, 0.29)",
      ".ms-BasePicker-text": {
        minHeigth: 36,
        maxHeight: 50,
        overflowX: "hidden",
        padding: "3px 5px",
        background: "#fff",
      },
    },
  };
  const [loader, setLoader] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // let products: clinet[] = [
  //   {
  //     Id: 1,
  //     FirstName: "1000",
  //     LastName: "f230fh0g3",
  //     Role: "PA",
  //     Manager: {
  //       Id: null,
  //       EMail: "",
  //       Title: "Kumaresan",
  //     },
  //     Team: "Team1",
  //     TeamCaptain: {
  //       Id: null,
  //       EMail: "",
  //       Title: "raj",
  //     },
  //     TeamLeader: {
  //       Id: null,
  //       EMail: "",
  //       Title: "raj",
  //     },
  //     Cohort: "2",
  //     // Country: "india",
  //     DirectReports: [
  //       {
  //         Id: null,
  //         EMail: "",
  //         Title: "raj",
  //       },
  //     ],
  //     BackingUp: [
  //       {
  //         Id: null,
  //         EMail: "",
  //         Title: "raj",
  //       },
  //     ],
  //   },
  // ];

  let addparent: clinet = {
    Id: null,
    // FirstName: "",
    // LastName: "",
    Name: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Role: "",
    Manager: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Team: "",
    TeamCaptain: {
      Id: null,
      EMail: "",
      Title: "",
    },
    TeamLeader: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Cohort: "",

    DirectReports: [
      {
        Id: null,
        EMail: "",
        Title: "",
      },
    ],
    BackingUp: [
      {
        Id: null,
        EMail: "",
        Title: "",
      },
    ],
  };
  let addInput: clinet = {
    Id: null,
    // FirstName: "",
    // LastName: "",
    Name: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Role: "",
    Manager: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Team: "",
    TeamCaptain: {
      Id: null,
      EMail: "",
      Title: "",
    },
    TeamLeader: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Cohort: "",

    DirectReports: [
      {
        Id: null,
        EMail: "",
        Title: "",
      },
    ],
    BackingUp: [
      {
        Id: null,
        EMail: "",
        Title: "",
      },
    ],
  };

  const editIconStyle = {
    backgroundColor: "transparent",
    color: "#007C81",
    border: "none",
    // height: 26,
    // width: 26,
  };
  const tickIconStyle = {
    backgroundColor: "transparent",
    border: "transparent",
    color: "#007C81",
    height: 26,
    width: 26,
  };
  const delIconBtnStyle = {
    color: "#BF4927",
    border: "none",
    backgroundColor: "transparent",
    height: 26,
    width: 26,
    fontSize: "1.3rem",
  };

  const [value, setValue] = useState([]);
  const [mastedata, setMasterdata] = useState([]);
  const [curobj, setcurobj] = useState(addparent);
  const [add, setAdd] = useState(false);
  const [search, setSearch] = useState("");

  const [edit, setEdit] = useState(false);

  const _addTextField = (val: any, fieldType: string): JSX.Element => {
    const data: any = val;

    if (!val.Id && add) {
      // if (fieldType == "FirstName") {
      //   return (
      //     <InputText
      //       type="text"
      //       placeholder="FirstName"
      //       value={curobj.FirstName}
      //       onChange={(e) => getOnchange("FirstName", e.target.value)}
      //     />
      //   );
      // }
      // if (fieldType == "LastName") {
      //   return (
      //     <InputText
      //       type="text"
      //       placeholder="LastName"
      //       value={curobj.LastName}
      //       onChange={(e) => getOnchange("LastName", e.target.value)}
      //     />
      //   );
      // }

      if (fieldType == "Name") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={curobj.Name.EMail ? [curobj.Name.EMail] : []}
            // defaultSelectedUsers={[]}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Name", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Name", null);
              }
            }}
          />
        );
      }
      if (fieldType == "Role") {
        return (
          <Dropdown
            options={role}
            placeholder="Role"
            optionLabel="name"
            value={curobj.Role}
            style={{ width: "100%" }}
            onChange={(e: any) => getOnchange("Role", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }

      if (fieldType == "Manager") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              curobj.Manager.EMail ? [curobj.Manager.EMail] : []
            }
            // defaultSelectedUsers={[]}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Manager", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Manager", null);
              }
            }}
          />
        );
      }

      if (fieldType == "Team") {
        return (
          <Dropdown
            options={team}
            placeholder="Team"
            optionLabel="name"
            value={curobj.Team}
            style={{ width: "100%" }}
            onChange={(e: any) => getOnchange("Team", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "TeamCaptain") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              curobj.TeamCaptain.EMail ? [curobj.TeamCaptain.EMail] : []
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("TeamCaptain", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("TeamCaptain", null);
              }
            }}
          />
        );
      }

      if (fieldType == "TeamLeader") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              curobj.TeamLeader.EMail ? [curobj.TeamLeader.EMail] : []
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("TeamLeader", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("TeamLeader", null);
              }
            }}
          />
        );
      }
      if (fieldType == "Cohort") {
        return (
          <InputText
            type="text"
            placeholder="Cohort"
            value={curobj.Cohort}
            onChange={(e) => getOnchange("Cohort", e.target.value)}
          />
        );
      }
      if (fieldType == "DirectReports") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={3}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   curobj.DirectReports[0].EMail
            //     ? [curobj.DirectReports[0].EMail]
            //     : []
            // }

            defaultSelectedUsers={curobj.DirectReports.map((report) => {
              return report.EMail;
            })}
            // defaultSelectedUsers={[
            //   "devaraj@chandrudemo.onmicrosoft.com",
            //   "devaraj@chandrudemo.onmicrosoft.com",
            // ]}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items;
                getOnchange("DirectReports", selectedItem);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("DirectReports", []);
              }
            }}
          />
        );
      }
      if (fieldType == "BackingUp") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={3}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   curobj.BackingUp[0].EMail ? [curobj.BackingUp[0].EMail] : []
            // }
            defaultSelectedUsers={curobj.BackingUp?.map((report) => {
              return report.EMail;
            })}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items;
                getOnchange("BackingUp", selectedItem);
                // getonChange("BackingUp", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("BackingUp", []);
              }
            }}
          />
        );
      }

      //   return <InputText type="text" value={""} />;
    } else if (val.Id && edit && val.Id === curobj.Id) {
      // if (fieldType == "FirstName") {
      //   return (
      //     <InputText
      //       type="text"
      //       placeholder="FirstName"
      //       value={curobj.FirstName}
      //       onChange={(e) => getOnchange("FirstName", e.target.value)}
      //     />
      //   );
      // }
      // if (fieldType == "LastName") {
      //   return (
      //     <InputText
      //       type="text"
      //       placeholder="LastName"
      //       value={curobj.LastName}
      //       onChange={(e) => getOnchange("LastName", e.target.value)}
      //     />
      //   );
      // }

      if (fieldType == "Name") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={curobj.Name.EMail ? [curobj.Name.EMail] : []}
            // defaultSelectedUsers={[]}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Name", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Name", null);
              }
            }}
          />
        );
      }
      if (fieldType == "Role") {
        return (
          <Dropdown
            options={role}
            placeholder="Role"
            optionLabel="name"
            value={curobj.Role}
            onChange={(e: any) => getOnchange("Role", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }

      if (fieldType == "Manager") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              curobj.Manager.EMail ? [curobj.Manager.EMail] : []
            }
            // defaultSelectedUsers={[]}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Manager", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Manager", null);
              }
            }}
          />
        );
      }

      if (fieldType == "Team") {
        return (
          <Dropdown
            options={team}
            placeholder="Team"
            optionLabel="name"
            value={curobj.Team}
            onChange={(e: any) => getOnchange("Team", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      if (fieldType == "TeamCaptain") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              curobj.TeamCaptain.EMail ? [curobj.TeamCaptain.EMail] : []
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("TeamCaptain", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("TeamCaptain", null);
              }
            }}
          />
        );
      }
      if (fieldType == "TeamLeader") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              curobj.TeamLeader.EMail ? [curobj.TeamLeader.EMail] : []
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("TeamLeader", selectedItem.id);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("TeamLeader", null);
              }
            }}
          />
        );
      }
      if (fieldType == "Cohort") {
        return (
          <InputText
            type="text"
            placeholder="Cohort"
            value={curobj.Cohort}
            onChange={(e) => getOnchange("Cohort", e.target.value)}
          />
        );
      }
      if (fieldType == "DirectReports") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={3}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   curobj.DirectReports[0].EMail
            //     ? [curobj.DirectReports[0].EMail]
            //     : []
            // }
            defaultSelectedUsers={curobj.DirectReports.map((report) => {
              return report.EMail;
            })}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items;
                getOnchange("DirectReports", selectedItem);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("DirectReports", []);
              }
            }}
          />
        );
      }
      if (fieldType == "BackingUp") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={3}
            styles={multiPeoplePickerStyle}
            groupName={""}
            showtooltip={true}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={curobj.BackingUp.map((report) => {
              return report.EMail;
            })}
            // defaultSelectedUsers={
            //   curobj.DirectReports[0].EMail
            //     ? [curobj.DirectReports[0].EMail]
            //     : []
            // }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items;
                getOnchange("BackingUp", selectedItem);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("BackingUp", []);
              }
            }}
          />
        );
      }
    } else {
      if (
        fieldType == "TeamCaptain" ||
        fieldType == "TeamLeader" ||
        fieldType == "Manager" ||
        fieldType == "Name"
      ) {
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

      // if (fieldType == "DirectReports") {
      //   data[fieldType].length &&
      //     data[fieldType].map((val) => {
      //       return (
      //         <span
      //           style={{
      //             textOverflow: "ellipsis",
      //             overflow: "hidden",
      //             whiteSpace: "nowrap",
      //             display: "block",
      //             width: "160px",
      //           }}
      //         >
      //           {val.Title}
      //         </span>
      //       );
      //     });
      // }

      if (fieldType === "DirectReports" || fieldType == "BackingUp") {
        return (
          <>
            {data[fieldType].length > 0 &&
              data[fieldType].map((val, index) => (
                <span
                  key={index} // Add a unique key prop when mapping elements in React
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    display: "block",
                    width: "160px",
                  }}
                >
                  {val.Title}
                </span>
              ))}
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

  const getOnchange = (key, _value) => {
    let FormData = { ...curobj };
    // let err = { ...error };

    if (key == "Manager") {
      FormData.Manager.Id = _value;
    } else if (key == "TeamCaptain") {
      FormData.TeamCaptain.Id = _value;
    } else if (key == "TeamLeader") {
      FormData.TeamLeader.Id = _value;
      // } else if (key == "DirectReports") {
      //   FormData.DirectReports[0].Id = _value;
      // } else if (key == "BackingUp") {
      //   FormData.BackingUp[0].Id = _value;
      // }
    } else if (key == "Name") {
      FormData.Name.Id = _value;
      // } else if (key == "DirectReports") {
      //   FormData.DirectReports[0].Id = _value;
      // } else if (key == "BackingUp") {
      //   FormData.BackingUp[0].Id = _value;
      // }
    } else if (key === "DirectReports" || key === "BackingUp") {
      // Handle arrays of objects for DirectReports, BackingUp
      FormData[key] = _value.map((item) => ({
        Id: item.id,
        EMail: item.secondaryText,
        Title: item.text,
      }));
    } else {
      FormData[key] = _value;
    }

    setcurobj({ ...FormData });
  };

  const AddItem = (obj) => {
    setLoader(true);
    let directorId = [];
    let BackupId = [];

    // curobj.DirectReports.length >= 1 &&
    //   curobj.DirectReports.map((val) => {
    //     directorId.push(val.Id);
    //   });
    // curobj.BackingUp.length >= 1 &&
    //   curobj.BackingUp.map((val) => {
    //     BackupId.push(val.Id);
    //   });

    if (curobj.DirectReports && curobj.DirectReports.length >= 1) {
      curobj.DirectReports.forEach((val) => {
        if (val && val.Id) {
          directorId.push(val.Id);
        }
      });
    }

    if (curobj.BackingUp && curobj.BackingUp.length >= 1) {
      curobj.BackingUp.forEach((val) => {
        if (val && val.Id) {
          BackupId.push(val.Id);
        }
      });
    }
    debugger;
    let json = {
      // FirstName: curobj.FirstName ? curobj.FirstName : "",
      // LastName: curobj.LastName ? curobj.LastName : "",
      NameId: curobj.Name.Id ? curobj.Name.Id : null,
      Role: curobj.Role ? curobj.Role["name"] : "",
      Team: curobj.Team ? curobj.Team["name"] : "",
      Cohort: curobj.Cohort ? curobj.Cohort : "",
      ManagerId: curobj.Manager.Id ? curobj.Manager.Id : null,
      // BackingUpId: BackupId.length && { results: BackupId },
      BackingUpId: { results: BackupId },

      // BackingUpId: curobj.BackingUp[0].Id ? curobj.BackingUp[0].Id : null,
      TeamCaptainId: curobj.TeamCaptain.Id ? curobj.TeamCaptain.Id : null,
      TeamLeaderId: curobj.TeamLeader.Id ? curobj.TeamLeader.Id : null,
      // DirectReportsId: curobj.DirectReports[0].Id
      //   ? curobj.DirectReports[0].Id
      //   : null,
      // DirectReportsId: directorId.length ? { results: directorId },
      DirectReportsId: { results: directorId },
    };

    SPServices.SPAddItem({
      Listname: "Configuration",
      RequestJSON: json,
    })
      .then((res) => {
        setAdd(false);
        setEdit(false);
        setcurobj({ ...addparent });
        setLoader(true);

        getdatas();
      })
      .catch((err) => errFunction("Configuration err ", err));
  };

  const errFunction = (type, err) => {
    setLoader(false);
    console.log(type, err);
  };
  const _handleDataoperation = (key, obj) => {
    if (edit && obj.Id) {
      Editfunction(obj);
    } else if (!obj.Id && add && key == "check") {
      AddItem(obj);
    } else if (key == "cancel") {
      if (obj.Id) {
        // If the item has an Id (existing item), do nothing
        setAdd(false);
        setEdit(false);
      } else {
        // If the item doesn't have an Id (new item), remove it
        const updatedClientDetail = value.filter((val) => val.Id !== null);
        setAdd(false);
        setEdit(false);
        setValue(updatedClientDetail);
      }
    }
  };

  const handledata = (obj) => {
    setAdd(false);

    let editobj: any = { ...obj };

    editobj.Team = {
      name: obj.Team,
      code: obj.Team,
    };
    editobj.Role = {
      name: obj.Role,
      code: obj.Role,
    };
    setcurobj({ ...editobj });
  };
  const _action = (obj: any): JSX.Element => {
    return (
      <div>
        {edit == false && add == false && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              type="button"
              icon="pi pi-pencil"
              style={editIconStyle}
              onClick={(_) => {
                handledata(obj);
                setEdit(true);
              }}
            />

            <Button
              type="button"
              icon=" pi pi-trash"
              style={delIconBtnStyle}
              onClick={(_) => {
                confirmDelete(obj);
                // handledata(obj);
                // setisEdit(true);
              }}
            />
          </div>
        )}
        {((add && obj.Id == curobj.Id) || (edit && obj.Id == curobj.Id)) && (
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              type="button"
              icon="pi pi-check"
              style={tickIconStyle}
              rounded
              onClick={(_) => {
                _handleDataoperation("check", obj);
              }}
            />
            <Button
              type="button"
              icon="pi pi-times"
              style={delIconBtnStyle}
              rounded
              onClick={(_) => {
                setAdd(false);
                setEdit(false);
                _handleDataoperation("cancel", obj);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const Editfunction = (obj) => {
    setLoader(true);

    let directorId = [];
    let BackupId = [];
    // curobj.DirectReports.length >= 1 &&
    //   curobj.DirectReports.map((val) => {
    //     directorId.push(val.Id);
    //   });

    // curobj.BackingUp.length >= 1 &&
    //   curobj.BackingUp.map((val) => {
    //     BackupId.push(val.Id);
    //   });

    if (curobj.DirectReports && curobj.DirectReports.length >= 1) {
      curobj.DirectReports.forEach((val) => {
        if (val && val.Id) {
          directorId.push(val.Id);
        }
      });
    }

    if (curobj.BackingUp && curobj.BackingUp.length >= 1) {
      curobj.BackingUp.forEach((val) => {
        if (val && val.Id) {
          BackupId.push(val.Id);
        }
      });
    }
    let json = {
      NameId: curobj.Name.Id ? curobj.Name.Id : null,

      // FirstName: curobj.FirstName ? curobj.FirstName : "",
      // LastName: curobj.LastName ? curobj.LastName : "",
      Role: curobj.Role ? curobj.Role["name"] : "",
      Team: curobj.Team ? curobj.Team["name"] : "",
      Cohort: curobj.Cohort ? curobj.Cohort : "",
      ManagerId: curobj.Manager.Id ? curobj.Manager.Id : null,
      BackingUpId: { results: BackupId },

      // BackingUpId: curobj.BackingUp[0].Id ? curobj.BackingUp[0].Id : null,
      TeamCaptainId: curobj.TeamCaptain.Id ? curobj.TeamCaptain.Id : null,
      TeamLeaderId: curobj.TeamLeader.Id ? curobj.TeamLeader.Id : null,
      // DirectReportsId: curobj.DirectReports[0].Id
      //   ? curobj.DirectReports[0].Id
      //   : null,

      DirectReportsId: { results: directorId },
    };

    SPServices.SPUpdateItem({
      Listname: "Configuration",
      ID: obj.Id,
      RequestJSON: json,
    })
      .then((res) => {
        setAdd(false);
        setAdd(false);
        setcurobj({ ...addparent });
        setLoader(false);

        getdatas();
      })
      .catch((err) => errFunction("Configuration json", err));
  };

  const getdatas = () => {
    SPServices.SPReadItems({
      Listname: "Configuration",
      Select:
        "*,Name/ID,Name/EMail,Name/Title, Manager/ID, Manager/EMail, Manager/Title, BackingUp/ID, BackingUp/EMail, BackingUp/Title, TeamLeader/ID, TeamLeader/EMail, TeamLeader/Title, TeamCaptain/ID, TeamCaptain/EMail, TeamCaptain/Title,DirectReports/ID, DirectReports/EMail, DirectReports/Title",

      Expand: "Name,Manager,TeamCaptain,TeamLeader,DirectReports,BackingUp",
      Orderby: "Created",
      Orderbydecorasc: false,
    })
      .then((res) => {
        let array: clinet[] = [];
        res.forEach((val: any) => {
          array.push({
            Id: val.Id,
            // FirstName: val.FirstName ? val.FirstName : "",
            // LastName: val.LastName ? val.LastName : "",
            Name: {
              Id: val.Name?.ID,
              EMail: val.Name?.EMail,
              Title: val.Name?.Title,
            },
            Role: val.Role ? val.Role : "",
            Team: val.Team ? val.Team : "",
            Cohort: val.Cohort ? val.Cohort : "",
            Manager: {
              Id: val.Manager?.ID,
              EMail: val.Manager?.EMail,
              Title: val.Manager?.Title,
            },
            TeamCaptain: {
              Id: val.TeamCaptain?.ID,
              EMail: val.TeamCaptain?.EMail,
              Title: val.TeamCaptain?.Title,
            },
            TeamLeader: {
              Id: val.TeamLeader?.ID,
              EMail: val.TeamLeader?.EMail,
              Title: val.TeamLeader?.Title,
            },
            // DirectReports:
            //   val.DirectReports.length &&
            //   val.DirectReports.map((response) => ({
            //     Id: response?.ID,
            //     EMail: response?.EMail,
            //     Title: response?.Title,
            //   })),
            DirectReports: Array.isArray(val.DirectReports)
              ? val.DirectReports.map((response) => ({
                  Id: response?.ID,
                  EMail: response?.EMail,
                  Title: response?.Title,
                }))
              : [],

            // BackingUp: [
            //   {
            //     Id: val.BackingUp?.ID,
            //     EMail: val.BackingUp?.EMail,
            //     Title: val.BackingUp?.Title,
            //   },
            // ],
            BackingUp: Array.isArray(val.BackingUp)
              ? val.BackingUp.map((response) => ({
                  Id: response?.ID,
                  EMail: response?.EMail,
                  Title: response?.Title,
                }))
              : [],
          });
        });
        setValue([...array]);
        setMasterdata([...array]);
        setAdd(false);
        setEdit(false);
        setLoader(false);
      })
      .catch((err) => errFunction("Configuration get all data", err));
  };

  const SearchFilter = (e) => {
    setSearch(e);

    // let filteredResults = masterdata.filter((item) =>
    //   item.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())
    // );

    // setCurMyTask([...filteredResults]);

    // let filteredResults = mastedata.filter((item) =>
    //   Object.values(item).some(
    //     (value) =>
    //       value && value.toString().toLowerCase().includes(e.toLowerCase())
    //   )
    // );

    const filteredData = mastedata.filter((item) => {
      const searchableFields = [
        "Name",
        "Role",
        "Team",
        "Cohort",
        "Manager", // Add fields from the nested objects to search within them
        "TeamCaptain",
        "TeamLeader",
      ];

      return searchableFields.some((field) => {
        if (typeof item[field] === "object") {
          // Search within nested object fields
          const nestedObject = item[field] as {
            [key: string]: string | number | null;
          };
          return Object.values(nestedObject).some(
            (value) =>
              value && value.toString().toLowerCase().includes(e.toLowerCase())
          );
        } else {
          // Search within regular string fields
          return item[field].toString().toLowerCase().includes(e.toLowerCase());
        }
      });
    });

    setValue([...filteredData]);
  };

  // const addParent=()=>{
  //      setValue([...products,addparent]);

  // }
  const confirmDelete = (item: any) => {
    setItemToDelete(item);
    // Set the item to delete
    setShowDialog(true);
    // deleteItem(item)
  };
  const deleteItem = () => {
    setLoader(true);

    if (showDialog) {
      SPServices.SPDeleteItem({
        Listname: "Configuration",
        ID: itemToDelete.Id,
      }).then((res) => {
        setShowDialog(false);
        setLoader(false);

        getdatas();
      });
    } else {
      setLoader(false);
      setShowDialog(false);
    }
  };
  useEffect(() => {
    setLoader(true);
    getdatas();
  }, []);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div>
          <div className={styles.clientContainer}>
            <h2>Org Chart</h2>
            {/* <InputText
          value={search}
          onChange={(e: any) => SearchFilter(e.target.value)}
        /> */}
            <div className={styles.rightSection}>
              <div>
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    placeholder="Search"
                    value={search}
                    onChange={(e: any) => SearchFilter(e.target.value)}
                  />
                </span>
              </div>
              <Button
                label="Export"
                icon="pi pi-file-excel"
                className={styles.btnColor}
                //   onClick={() => {
                //     _handleData("addParent", { ..._sampleParent });
                //   }}
              />
              <Button
                label="Add New"
                className={styles.btnColor}
                onClick={() => {
                  setEdit(false);
                  setAdd(true);
                  setValue([...value, addInput]);

                  // _handleData("addParent", { ..._sampleParent });
                }}
              />
            </div>
          </div>
          <DataTable
            value={value}
            removableSort
            sortMode="multiple"
            className={styles.dataTableContainer}
            tableStyle={{ minWidth: "60rem" }}
          >
            <Column
              field="Name"
              header="Name"
              sortable
              style={{ width: "20%" }}
              body={(obj: any) => _addTextField(obj, "Name")}
            ></Column>
            {/* <Column
              field="LastName"
              header="last Name"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "LastName")}
            ></Column> */}
            <Column
              field="Role"
              header="Role"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "Role")}
            ></Column>
            <Column
              field="Manager"
              header="Manager"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "Manager")}
            ></Column>
            <Column
              field="Team"
              header="Team"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "Team")}
            ></Column>

            <Column
              field="TeamCaptain"
              header="Team Captain"
              sortable
              body={(obj: any) => _addTextField(obj, "TeamCaptain")}
            ></Column>
            <Column
              field="TeamLeader"
              header="Team Leader"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "TeamLeader")}
            ></Column>
            <Column
              field="Cohort"
              header="Cohort"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "Cohort")}
            ></Column>
            {/* <Column
            field="Country"
            header="Country"
            sortable
            body={(obj: any) => _addTextField(obj, "Country")}
          ></Column> */}
            <Column
              field="DirectReports"
              header="Direct Reports"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "DirectReports")}
            ></Column>
            <Column
              field="BackingUp"
              header="Backing Up"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "BackingUp")}
            ></Column>
            <Column header="Action" body={(obj) => _action(obj)}></Column>
          </DataTable>

          <ConfirmDialog
            visible={showDialog}
            onHide={() => setShowDialog(false)}
            message="Are you sure you want to delete?"
            header="Confirmation"
            icon="pi pi-exclamation-triangle"
            acceptClassName="p-button-danger"
            acceptLabel="Yes"
            rejectLabel="No"
            accept={deleteItem}
            reject={() => setShowDialog(false)}
          />
        </div>
      )}
    </>
  );
};
export default OrgChart;
