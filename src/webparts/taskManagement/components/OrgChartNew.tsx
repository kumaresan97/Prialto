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
import * as moment from "moment";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import { Toast } from "primereact/toast";

import exportToExcel from "../../../Global/ExportExcel";
import { sp } from "@pnp/sp/presets/all";

let _masterArray: any[] = [];
let _curUserDetailsArray: any[] = [];
let uniqueTeams: any[] = [];
let teamArr: any[] = [];
let userTeams: any[] = [];
let _formattedData: any[] = [];
let _curArray: any[] = [];
let teamChoices = [];
let _isAdmin: boolean = false;
let _isTL: boolean = false;
let _isTC: boolean = false;
let _isPA: boolean = false;
let test: any = {};

interface clinet {
  Id: number;
  // FirstName: string;
  // LastName: string;
  Name: {
    Id: number;
    EMail: string;
    Title: string;
  };
  Role: any;
  Manager: {
    Id: number;
    EMail: string;
    Title: string;
  };
  Team: any;
  // TeamCaptain: {
  //   Id: number;
  //   EMail: string;
  //   Title: string;
  // };
  // TeamLeader: {
  //   Id: number;
  //   EMail: string;
  //   Title: string;
  // };
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
let requiredFields = [
  "Name",
  "Manager",
  "Cohort",
  "Role",
  "Team",
  // "TeamCaptain",
  // "TeamLeader",
];
const OrgChart = (props) => {
  // style variables
  const multiPeoplePickerStyle = {
    root: {
      minWidth: 200,
      background: "rgba(218, 218, 218, 0.29)",
      ".ms-BasePicker-text": {
        minHeigth: 38,
        maxHeight: 50,
        overflowX: "hidden",
        padding: "1px 5px",
        minWidth: "100%",
        background: "#fff",
      },
    },
  };
  const [loader, setLoader] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const toastTopRight = React.useRef(null);

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
    Role: role[0],
    Manager: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Team: team[0],
    // TeamCaptain: {
    //   Id: null,
    //   EMail: "",
    //   Title: "",
    // },
    // TeamLeader: {
    //   Id: null,
    //   EMail: "",
    //   Title: "",
    // },
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
    Role: role[0].name,
    Manager: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Team: team[0].name,
    // TeamCaptain: {
    //   Id: null,
    //   EMail: "",
    //   Title: "",
    // },
    // TeamLeader: {
    //   Id: null,
    //   EMail: "",
    //   Title: "",
    // },
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
  const _curUser: string = props.context._pageContext._user.email;

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
            peoplePickerCntrlclassName={
              !curobj.Name?.Id ? styles.peoplepickerErrStyle : ""
            }
            // required={true}
            placeholder=" Enter user"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              curobj.Name?.EMail ? [curobj?.Name.EMail] : []
            }
            // defaultSelectedUsers={[]}
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Name", selectedItem);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                getOnchange("Name", null);
              }
            }}
          />
        );
      }
      if (fieldType == "Role") {
        let clsValid = "";
        !curobj.Role ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <Dropdown
            options={role}
            placeholder="Role"
            optionLabel="name"
            // defaultValue={role}
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
            // peoplePickerCntrlclassName={
            //   !curobj.Manager?.Id ? styles.peoplepickerErrStyle : ""
            // }
            // required={true}
            placeholder="Enter user"
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
                getOnchange("Manager", selectedItem);
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
        let clsValid = "";
        !curobj.Team ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <Dropdown
            options={team}
            placeholder="Cohort"
            optionLabel="name"
            value={curobj.Team}
            style={{ width: "100%" }}
            onChange={(e: any) => getOnchange("Team", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      // if (fieldType == "TeamCaptain") {
      //   let clsValid = "";
      //   !curobj.TeamCaptain?.Id
      //     ? (clsValid = "md:w-20rem w-full p-invalid")
      //     : "";
      //   return (
      //     <PeoplePicker
      //       context={props.context}
      //       personSelectionLimit={1}
      //       groupName={""}
      //       showtooltip={true}
      //       peoplePickerCntrlclassName={
      //         !curobj.TeamCaptain?.Id ? styles.peoplepickerErrStyle : ""
      //       }
      //       styles={multiPeoplePickerStyle}
      //       // required={true}
      //       placeholder=" Enter user"
      //       ensureUser={true}
      //       // showHiddenInUI={false}
      //       showHiddenInUI={true}
      //       principalTypes={[PrincipalType.User]}
      //       defaultSelectedUsers={
      //         curobj.TeamCaptain.EMail ? [curobj.TeamCaptain.EMail] : []
      //       }
      //       resolveDelay={1000}
      //       onChange={(items: any[]) => {
      //         if (items.length > 0) {
      //           const selectedItem = items[0];
      //           getOnchange("TeamCaptain", selectedItem);
      //           // getonChange("PeopleEmail", selectedItem.secondaryText);
      //         } else {
      //           // No selection, pass null or handle as needed
      //           getOnchange("TeamCaptain", null);
      //         }
      //       }}
      //     />
      //   );
      // }

      // if (fieldType == "TeamLeader") {
      //   let clsValid = "";
      //   !curobj.TeamLeader?.Id
      //     ? (clsValid = "md:w-20rem w-full p-invalid")
      //     : "";
      //   return (
      //     <PeoplePicker
      //       context={props.context}
      //       personSelectionLimit={1}
      //       groupName={""}
      //       showtooltip={true}
      //       styles={multiPeoplePickerStyle}
      //       peoplePickerCntrlclassName={
      //         !curobj.TeamLeader?.Id ? styles.peoplepickerErrStyle : ""
      //       }
      //       // required={true}
      //       placeholder="Enter user"
      //       ensureUser={true}
      //       // showHiddenInUI={false}
      //       showHiddenInUI={true}
      //       principalTypes={[PrincipalType.User]}
      //       defaultSelectedUsers={
      //         curobj.TeamLeader.EMail ? [curobj.TeamLeader.EMail] : []
      //       }
      //       resolveDelay={1000}
      //       onChange={(items: any[]) => {
      //         if (items.length > 0) {
      //           const selectedItem = items[0];
      //           getOnchange("TeamLeader", selectedItem);
      //           // getonChange("PeopleEmail", selectedItem.secondaryText);
      //         } else {
      //           // No selection, pass null or handle as needed
      //           getOnchange("TeamLeader", null);
      //         }
      //       }}
      //     />
      //   );
      // }
      if (fieldType == "Cohort") {
        let clsValid = "";
        !curobj.Cohort ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <InputText
            type="text"
            placeholder="Cohort"
            value={curobj.Cohort}
            // className={!curobj.Cohort ? styles.tblTxtBox : clsValid}
            className={`${styles.tblTxtBox}${clsValid}`}
            onChange={(e) => getOnchange("Cohort", e.target.value)}
          />
        );
      }
      if (fieldType == "DirectReports") {
        // let clsValid = "";
        // !curobj.DirectReports[0].Id
        //   ? (clsValid = "md:w-20rem w-full p-invalid")
        //   : "";
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={20}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
            // required={true}
            placeholder="Enter user"
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
        let clsValid = "";
        !curobj.BackingUp ||
        curobj.BackingUp.length === 0 ||
        !curobj.BackingUp.some((user) => user.Id !== null)
          ? (clsValid = "md:w-20rem w-full p-invalid")
          : "";

        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={3}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            peoplePickerCntrlclassName={
              !curobj.BackingUp ||
              curobj.BackingUp.length === 0 ||
              !curobj.BackingUp.some((user) => user.Id !== null)
                ? styles.peoplepickerErrStyle
                : ""
            }
            // required={true}
            placeholder="Enter user"
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
        let clsValid = "";
        !curobj.Name?.Id ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            peoplePickerCntrlclassName={
              !curobj.Name?.Id ? styles.peoplepickerErrStyle : ""
            }
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
                getOnchange("Name", selectedItem);
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
        let clsValid = "";
        !curobj.Role ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <Dropdown
            options={role}
            style={{ width: "100%" }}
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
            // peoplePickerCntrlclassName={
            //   !curobj.Manager?.Id ? styles.peoplepickerErrStyle : ""
            // }
            // required={true}
            placeholder="Enter user"
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
                getOnchange("Manager", selectedItem);
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
        let clsValid = "";
        !curobj.Team ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <Dropdown
            style={{ width: "100%" }}
            options={team}
            placeholder="Cohort"
            optionLabel="name"
            value={curobj.Team}
            onChange={(e: any) => getOnchange("Team", e.value)}
            // className="w-full md:w-14rem"
          />
        );
      }
      // if (fieldType == "TeamCaptain") {
      //   let clsValid = "";
      //   !curobj.TeamCaptain?.Id
      //     ? (clsValid = "md:w-20rem w-full p-invalid")
      //     : "";
      //   return (
      //     <PeoplePicker
      //       context={props.context}
      //       personSelectionLimit={1}
      //       groupName={""}
      //       showtooltip={true}
      //       styles={multiPeoplePickerStyle}
      //       peoplePickerCntrlclassName={
      //         !curobj.TeamCaptain?.Id ? styles.peoplepickerErrStyle : ""
      //       }
      //       // required={true}
      //       placeholder="Enter user"
      //       ensureUser={true}
      //       // showHiddenInUI={false}
      //       showHiddenInUI={true}
      //       principalTypes={[PrincipalType.User]}
      //       defaultSelectedUsers={
      //         curobj.TeamCaptain.EMail ? [curobj.TeamCaptain.EMail] : []
      //       }
      //       resolveDelay={1000}
      //       onChange={(items: any[]) => {
      //         if (items.length > 0) {
      //           const selectedItem = items[0];
      //           getOnchange("TeamCaptain", selectedItem);
      //           // getonChange("PeopleEmail", selectedItem.secondaryText);
      //         } else {
      //           // No selection, pass null or handle as needed
      //           getOnchange("TeamCaptain", null);
      //         }
      //       }}
      //     />
      //   );
      // }
      // if (fieldType == "TeamLeader") {
      //   let clsValid = "";
      //   !curobj.TeamLeader?.Id
      //     ? (clsValid = "md:w-20rem w-full p-invalid")
      //     : "";
      //   return (
      //     <PeoplePicker
      //       context={props.context}
      //       personSelectionLimit={1}
      //       groupName={""}
      //       showtooltip={true}
      //       styles={multiPeoplePickerStyle}
      //       peoplePickerCntrlclassName={
      //         !curobj.TeamLeader?.Id ? styles.peoplepickerErrStyle : ""
      //       }
      //       // required={true}
      //       placeholder="Enter user"
      //       ensureUser={true}
      //       // showHiddenInUI={false}
      //       showHiddenInUI={true}
      //       principalTypes={[PrincipalType.User]}
      //       defaultSelectedUsers={
      //         curobj.TeamLeader.EMail ? [curobj.TeamLeader.EMail] : []
      //       }
      //       resolveDelay={1000}
      //       onChange={(items: any[]) => {
      //         if (items.length > 0) {
      //           const selectedItem = items[0];
      //           getOnchange("TeamLeader", selectedItem);
      //           // getonChange("PeopleEmail", selectedItem.secondaryText);
      //         } else {
      //           // No selection, pass null or handle as needed
      //           getOnchange("TeamLeader", null);
      //         }
      //       }}
      //     />
      //   );
      // }
      if (fieldType == "Cohort") {
        let clsValid = "";
        !curobj.Cohort ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <InputText
            type="text"
            placeholder="Cohort"
            value={curobj.Cohort}
            // className={!curobj.Cohort ? styles.tblTxtBox : clsValid}
            className={`${styles.tblTxtBox}${clsValid}`}
            onChange={(e) => getOnchange("Cohort", e.target.value)}
          />
        );
      }
      if (fieldType == "DirectReports") {
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={20}
            groupName={""}
            showtooltip={true}
            styles={multiPeoplePickerStyle}
            // peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
            // required={true}
            placeholder="Enter user"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            // defaultSelectedUsers={
            //   curobj.DirectReports[0].EMail
            //     ? [curobj.DirectReports[0].EMail]
            //     : []
            // }
            defaultSelectedUsers={curobj.DirectReports?.map((report) => {
              return report?.EMail;
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
        let clsValid = "";
        !curobj.BackingUp ||
        curobj.BackingUp.length === 0 ||
        !curobj.BackingUp.some((user) => user.Id !== null)
          ? (clsValid = "md:w-20rem w-full p-invalid")
          : "";
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={3}
            styles={multiPeoplePickerStyle}
            peoplePickerCntrlclassName={
              !curobj.BackingUp ||
              curobj.BackingUp.length === 0 ||
              !curobj.BackingUp.some((user) => user.Id !== null)
                ? styles.peoplepickerErrStyle
                : ""
            }
            // peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
            groupName={""}
            showtooltip={true}
            // required={true}
            placeholder="Enter user"
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
        // fieldType == "TeamCaptain" ||
        // fieldType == "TeamLeader" ||
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
    // let FormData = { ...curobj };
    // let err = { ...error };
    let previousData = { ...curobj };
    let FormDataNew = {
      Id: previousData.Id,
      Name:
        key == "Name"
          ? {
              Id: _value ? _value.id : null,
              EMail: _value ? _value.secondaryText : "",
              Title: _value ? _value.text : "",
            }
          : previousData.Name,

      Manager:
        key == "Manager"
          ? {
              Id: _value ? _value.id : null,
              EMail: _value ? _value.secondaryText : "",
              Title: _value ? _value.text : "",
            }
          : previousData.Manager,
      Role: key == "Role" ? (previousData[key] = _value) : previousData.Role,
      Team: key == "Team" ? (previousData[key] = _value) : previousData.Team,
      Cohort: "",
      // Manager: previousData.Manager,

      DirectReports:
        key == "DirectReports"
          ? (previousData[key] = _value?.map((item) => ({
              Id: item.id,
              EMail: item.secondaryText,
              Title: item.text,
            })))
          : previousData.DirectReports,
      BackingUp:
        key == "BackingUp"
          ? _value?.map((item) => ({
              Id: item.id,
              EMail: item.secondaryText,
              Title: item.text,
            }))
          : previousData.BackingUp,
    };
    /*if (key == "Manager") {
      (FormData.Manager.Id = _value ? _value.id : null),
        (FormData.Manager.EMail = _value ? _value.secondaryText : ""),
        (FormData.Manager.Title = _value ? _value.text : "");
    } FormData[key] = _value.map((item) => ({
        Id: item.id,
        EMail: item.secondaryText,
        Title: item.text,
      }));
    //  else if (key == "TeamCaptain") {
    //   (FormData.TeamCaptain.Id = _value ? _value.id : null),
    //     (FormData.TeamCaptain.EMail = _value ? _value.secondaryText : ""),
    //     (FormData.TeamCaptain.Title = _value ? _value.text : "");
    // } else if (key == "TeamLeader") {
    //   (FormData.TeamLeader.Id = _value ? _value.id : null),
    //     (FormData.TeamLeader.EMail = _value ? _value.secondaryText : ""),
    //     (FormData.TeamLeader.Title = _value ? _value.text : "");

    // }
    else if (key == "Name") {
      (FormData.Name.Id = _value ? _value.id : null),
        (FormData.Name.EMail = _value ? _value.secondaryText : ""),
        (FormData.Name.Title = _value ? _value.text : "");
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
    }*/

    setcurobj({ ...FormDataNew });
  };

  const AddItem = (obj) => {
    setLoader(true);
    let directorId = [];
    let BackupId = [];
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
      // FirstName: curobj.FirstName ? curobj.FirstName : "",
      // LastName: curobj.LastName ? curobj.LastName : "",
      NameId: curobj.Name.Id ? curobj.Name.Id : null,
      Role: curobj.Role ? curobj.Role["name"] : "",
      Team: curobj.Team ? curobj.Team["name"] : "",
      // Cohort: curobj.Cohort ? curobj.Cohort : "",
      ManagerId: curobj.Manager.Id ? curobj.Manager.Id : null,
      // BackingUpId: BackupId.length && { results: BackupId },
      BackingUpId: { results: BackupId },

      // BackingUpId: curobj.BackingUp[0].Id ? curobj.BackingUp[0].Id : null,
      // TeamCaptainId: curobj.TeamCaptain.Id ? curobj.TeamCaptain.Id : null,
      // TeamLeaderId: curobj.TeamLeader.Id ? curobj.TeamLeader.Id : null,
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
        let resjson = {
          Id: res.data.Id,
          Name: {
            Id: curobj.Name?.Id,
            EMail: curobj.Name?.EMail,
            Title: curobj.Name?.Title,
          },
          Role: curobj.Role ? curobj.Role["name"] : "",
          Team: curobj.Team ? curobj.Team["name"] : "",
          Cohort: "",
          Manager: {
            Id: curobj.Manager?.Id,
            EMail: curobj.Manager?.EMail,
            Title: curobj.Manager?.Title,
          },
          // TeamCaptain: {
          //   Id: curobj.TeamCaptain?.Id,
          //   EMail: curobj.TeamCaptain?.EMail,
          //   Title: curobj.TeamCaptain?.Title,
          // },
          // TeamLeader: {
          //   Id: curobj.TeamLeader?.Id,
          //   EMail: curobj.TeamLeader?.EMail,
          //   Title: curobj.TeamLeader?.Title,
          // },
          DirectReports: Array.isArray(curobj.DirectReports)
            ? curobj.DirectReports.map((response) => ({
                Id: response?.Id,
                EMail: response?.EMail,
                Title: response?.Title,
              }))
            : [],
          BackingUp: Array.isArray(curobj.BackingUp)
            ? curobj.BackingUp.map((response) => ({
                Id: response?.Id,
                EMail: response?.EMail,
                Title: response?.Title,
              }))
            : [],
        };

        let filterdatas = value.filter((val) => val.Id !== null);
        setValue([...filterdatas, resjson]);
        showMessage("Data Added Successfully", toastTopRight, "success");

        setAdd(false);
        setEdit(false);
        setcurobj({ ...addparent });
        setLoader(false);

        // getdatas();
      })
      .catch((err) => errFunction("Configuration err ", err));
  };

  const errFunction = (type, err) => {
    setLoader(false);
    console.log(type, err);
  };

  const handledata = (obj) => {
    previousvalue = obj;
    debugger;
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
    console.log(editobj, "editobj");
    setcurobj({ ...editobj });
  };
  const _handleDataoperation = (key, obj) => {
    if (edit && obj.Id) {
      Editfunction(obj);
    } else if (!obj.Id && add && key == "check") {
      AddItem(obj);
    }
  };
  function _handleDataoperationNew(key, obj) {
    console.log(previousvalue, "previous");

    debugger;
    if (obj.Id) {
      setAdd(false);
      setEdit(false);
      setcurobj({ ...addparent });
    } else {
      const updatedClientDetail = value.filter((val) => val.Id !== null);

      setValue(updatedClientDetail);
      // setValue({ ...Data });
      setAdd(false);
      setEdit(false);
    }
  }
  let previousvalue = null;

  const _action = (obj: any): JSX.Element => {
    return (
      <div>
        {edit == false && add == false && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="button"
              icon="pi pi-pencil"
              style={editIconStyle}
              onClick={(_) => {
                test = obj;
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
                const missingFields = validateObject();
                if (missingFields.length === 0) {
                  _handleDataoperation("check", obj);
                } else {
                  // missingFields.forEach((field) => {
                  const errorMessage = `Please enter ${missingFields[currentFieldIndex]}`;
                  showMessage(errorMessage, toastTopRight, "warn");

                  currentFieldIndex =
                    (currentFieldIndex + 1) % missingFields.length;
                }
                // });

                // if (validation()) {
                //   _handleDataoperation("check", obj);
                // } else {
                //   showMessage(
                //     "Please fill mandatory fields",
                //     toastTopRight,
                //     "warn"
                //   );
                // }
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
                _handleDataoperationNew("cancel", obj);
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
      // Cohort: curobj.Cohort ? curobj.Cohort : "",
      ManagerId: curobj.Manager.Id ? curobj.Manager.Id : null,
      BackingUpId: { results: BackupId },

      // BackingUpId: curobj.BackingUp[0].Id ? curobj.BackingUp[0].Id : null,
      // TeamCaptainId: curobj.TeamCaptain.Id ? curobj.TeamCaptain.Id : null,
      // TeamLeaderId: curobj.TeamLeader.Id ? curobj.TeamLeader.Id : null,
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
        let editobj = {
          Id: obj.Id,
          Name: {
            Id: curobj.Name?.Id,
            EMail: curobj.Name?.EMail,
            Title: curobj.Name?.Title,
          },
          Role: curobj.Role ? curobj.Role["name"] : "",
          Team: curobj.Team ? curobj.Team["name"] : "",
          Cohort: "",
          Manager: {
            Id: curobj.Manager?.Id,
            EMail: curobj.Manager?.EMail,
            Title: curobj.Manager?.Title,
          },
          // TeamCaptain: {
          //   Id: curobj.TeamCaptain?.Id,
          //   EMail: curobj.TeamCaptain?.EMail,
          //   Title: curobj.TeamCaptain?.Title,
          // },
          // TeamLeader: {
          //   Id: curobj.TeamLeader?.Id,
          //   EMail: curobj.TeamLeader?.EMail,
          //   Title: curobj.TeamLeader?.Title,
          // },
          DirectReports: Array.isArray(curobj.DirectReports)
            ? curobj.DirectReports.map((response) => ({
                Id: response?.Id,
                EMail: response?.EMail,
                Title: response?.Title,
              }))
            : [],
          BackingUp: Array.isArray(curobj.BackingUp)
            ? curobj.BackingUp.map((response) => ({
                Id: response?.Id,
                EMail: response?.EMail,
                Title: response?.Title,
              }))
            : [],
        };

        let updatedClientDetail = value.map((val) => {
          if (val.Id === obj.Id) {
            return editobj;
          }
          return val;
        });
        setValue([...updatedClientDetail]);
        setAdd(false);
        setEdit(false);
        setcurobj({ ...addparent });
        setLoader(false);
        showMessage("Data Edited Successfully", toastTopRight, "success");

        // getdatas();
      })
      .catch((err) => errFunction("Configuration json", err));
  };

  //get admin

  const _getPrialtoAdmin = (): void => {
    sp.web.siteGroups
      .getByName("AdminGroup")
      .users.get()
      .then((res: any) => {
        _isAdmin = res.some(
          (val: any) => val.Email.toLowerCase() === _curUser.toLowerCase()
        );

        // _getConfigurationDatas();
        getdatas();
      })
      .catch((err: any) => {
        errFunction("", "Admin group users get issue.");
      });
  };

  function getTeamChoices() {
    teamChoices = [];
    SPServices.SPGetChoices({
      Listname: "Configuration",
      FieldName: "Team",
    })
      .then(function (data) {
        for (let i = 0; i < data["Choices"].length; i++) {
          teamChoices.push({
            name: data["Choices"][i],
            code: data["Choices"][i],
          });
        }
        team = teamChoices;
      })
      .catch(function (error) {
        errFunction("getTeamChoices", error);
      });
  }

  const getdatas = () => {
    debugger;
    SPServices.SPReadItems({
      Listname: "Configuration",
      Select:
        "*,Name/ID,Name/EMail,Name/Title, Manager/ID, Manager/EMail, Manager/Title, BackingUp/ID, BackingUp/EMail, BackingUp/Title, TeamLeader/ID, TeamLeader/EMail, TeamLeader/Title, TeamCaptain/ID, TeamCaptain/EMail, TeamCaptain/Title, DirectReports/ID, DirectReports/EMail, DirectReports/Title",
      Expand:
        "Name, Manager, TeamCaptain, TeamLeader, DirectReports, BackingUp",
      Orderby: "Created",
      Orderbydecorasc: false,
      Topcount: 5000,
    })
      .then((res: any) => {
        _masterArray = res;

        dataManipulation(res);

        /* _curUserDetailsArray = res.filter(
          (data: any) =>
            data.NameId &&
            data.Name.EMail.toLowerCase() === _curUser.toLowerCase()
        );

        _masterArray.length
          ? _isAdmin
            ? _prepareFilteredData()
            : _curUserDetail()
          : setValue([]);
        setLoader(false);*/
      })
      .catch((err: any) => {
        errFunction("Configuration List Nave Details get issue.", "");
      });
  };

  function dataManipulation(data) {
    let arrDisplay = [];
    let myTeams = [];
    _isTL = false;
    _isTC = false;
    _isPA = false;

    data.forEach((val: any) => {
      if (val.Role === "TL" && val.Name.EMail == _curUser) {
        _isTL = true;
        myTeams.push(val.Team);
      } else if (val.Role === "TC" && val.Name.EMail == _curUser) {
        _isTC = true;
        myTeams.push(val.Team);
      } else if (val.Role === "PA") {
        _isPA = true;
      }
    });

    for (let i = 0; i < data.length; i++) {
      let ismyTeam = myTeams.includes(data[i].Team);

      if ((_isTL && ismyTeam) || _isAdmin) {
        arrDisplay.push(data[i]);
      }
    }

    BindData(arrDisplay);
  }

  function BindData(Data) {
    let orgcgart = [];
    Data.forEach((val) => {
      orgcgart.push({
        Id: val.Id,
        Name: {
          Id: val.Name?.ID,
          EMail: val.Name?.EMail,
          Title: val.Name?.Title,
        },
        Role: val.Role ? val.Role : "",
        Team: val.Team ? val.Team : "",
        Cohort: "",
        Manager: {
          Id: val.Manager?.ID,
          EMail: val.Manager?.EMail,
          Title: val.Manager?.Title,
        },

        // TeamCaptain: {
        //   Id: val.TeamCaptain?.ID,
        //   EMail: val.TeamCaptain?.EMail,
        //   Title: val.TeamCaptain?.Title,
        // },
        // TeamLeader: {
        //   Id: val.TeamLeader?.ID,
        //   EMail: val.TeamLeader?.EMail,
        //   Title: val.TeamLeader?.Title,
        // },

        DirectReports: Array.isArray(val?.DirectReports)
          ? val?.DirectReports.map((response) => ({
              Id: response?.ID,
              EMail: response?.EMail,
              Title: response?.Title,
            }))
          : [],
        BackingUp: Array.isArray(val.BackingUp)
          ? val.BackingUp.map((response) => ({
              Id: response?.ID,
              EMail: response?.EMail,
              Title: response?.Title,
            }))
          : [],
      });
    });

    setValue([...orgcgart]);
    setMasterdata([...orgcgart]);
    setLoader(false);
  }

  // const _curUserDetail = (): void => {
  //   _isTL = false;
  //   _isTC = false;
  //   _isPA = false;

  //   _curUserDetailsArray.length &&
  //     _curUserDetailsArray.forEach((val: any) => {
  //       if (val.Role === "TL") {
  //         _isTL = true;
  //       } else if (val.Role === "TC") {
  //         _isTC = true;
  //       } else if (val.Role === "PA") {
  //         _isPA = true;
  //       }
  //     });
  //   // : (_isPA = true);

  //   _prepareFilteredData();
  // };

  // const _prepareFilteredData = (): void => {
  //   let _TLArray: any[] = [];
  //   let _TCArray: any[] = [];
  //   let _PAArray: any[] = [];

  //   _curArray = [];
  //   uniqueTeams = [];
  //   teamArr = [];
  //   userTeams = [];

  //   if (_isAdmin) {
  //     _masterArray.forEach((val: any) => {
  //       // if (!uniqueTeams.includes(val.Team)) {
  //       uniqueTeams.push(val.Team);
  //       // }
  //     });
  //   } else {
  //     _curUserDetailsArray.forEach((val: any) => {
  //       // if (!uniqueTeams.includes(val.Team)) {
  //       uniqueTeams.push(val.Team);
  //       // }
  //     });
  //   }

  //   teamArr =
  //     _masterArray.length &&
  //     _masterArray.filter((val: any) => uniqueTeams.includes(val.Team));

  //   if (_isAdmin) {
  //     userTeams = teamArr;
  //   } else {
  //     if (_isTL) {
  //       _TLArray = teamArr.filter((team) => team.Role === "TL");
  //     }
  //     userTeams = [..._TLArray];
  //   }

  //   //BindData(userTeams);
  // };

  const SearchFilter = (e) => {
    setSearch(e);

    const filteredData = mastedata.filter((item) => {
      const searchableFields = [
        "Name",
        "Role",
        "Team",
        "Cohort",
        "Manager", // Add fields from the nested objects to search within them
        // "TeamCaptain",
        // "TeamLeader",
      ];
      return searchableFields.some((field) => {
        const fieldValue = item[field];

        if (fieldValue !== undefined && fieldValue !== null) {
          if (typeof fieldValue === "object") {
            const nestedObject = fieldValue as {
              [key: string]: string | number | null;
            };
            return Object.values(nestedObject).some(
              (value) =>
                value &&
                value.toString().toLowerCase().includes(e.toLowerCase())
            );
          } else {
            return (
              fieldValue
                // ?.toString()
                .toLowerCase()
                .includes(e.toLowerCase())
            );
          }
        }

        return false; // Return false for undefined or null fields
      });
    });

    setValue([...filteredData]);
  };

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
        let deleteobj = value.filter((val) => val.Id !== itemToDelete.Id);
        setValue([...deleteobj]);
        setShowDialog(false);
        setLoader(false);
        showMessage("Data Deleted Successfully", toastTopRight, "success");

        // getdatas();
      });
    } else {
      setLoader(false);
      setShowDialog(false);
    }
  };

  //dummy mytaskheader

  let columns = [
    { header: "Name", key: "Name", width: 15 },
    { header: "Role", key: "Role", width: 25 },
    { header: "Cohort", key: "Team", width: 25 },
    // { header: "Cohort", key: "Cohort", width: 25 },

    { header: "Manager", key: "Manager", width: 25 },

    // { header: "Team Captain", key: "TeamCaptain", width: 25 },
    // { header: "Team Leader", key: "TeamLeader", width: 25 },
    { header: "Direct Reports", key: "DirectReports", width: 25 },
    // { header: "Backing Up", key: "BackingUp", width: 25 },
  ];

  const ExportExcel = async () => {
    setLoader(true);
    try {
      await exportToExcel(value, columns, "OrgChart");
      setLoader(false); // Set loader to false after export is done
    } catch (err) {
      setLoader(false); // Handle error by setting loader to false
      console.error("Export error:", err);
      // Add additional error handling if required
    }
  };

  const showMessage = (event, ref, severity) => {
    const label = event;

    ref.current.show({
      severity: severity,
      summary: label,
      // detail: label,
      life: 3000,
    });
  };

  // function validation() {
  //   let isAllValueFilled = true;
  //   if (
  //     !curobj.Name.Id ||
  //     !curobj.Manager.Id ||
  //     !curobj.Cohort ||
  //     !curobj.Role ||
  //     !curobj.Team ||
  //     !curobj.TeamCaptain.Id ||
  //     !curobj.TeamLeader.Id ||
  //     // !curobj.DirectReports[0].Id ||
  //     (!curobj.BackingUp||curobj.BackingUp.length===0)

  //   ) {
  //     isAllValueFilled = false;
  //   }
  //   return isAllValueFilled;
  // }

  let currentFieldIndex = 0;

  // function validation() {
  //   const requiredFields = [
  //     "Name",
  //     "Manager",
  //     "Cohort",
  //     "Role",
  //     "Team",
  //     "TeamCaptain",
  //     "TeamLeader",
  //   ];

  //   const missingFields = [];

  //   requiredFields.forEach((field) => {
  //     if (!curobj[field]?.Id) {
  //       missingFields.push(field);
  //     }
  //   });

  //   if (
  //     !curobj.BackingUp ||
  //     curobj.BackingUp.length === 0 ||
  //     !curobj.BackingUp.some((user) => user.Id !== null)
  //   ) {
  //     missingFields.push("BackingUp");
  //   }

  //   return missingFields;
  // }

  function validateObject() {
    const missingFields = [];

    if (!curobj.Name?.Id || curobj.Name?.Id === null) {
      missingFields.push("Name");
    } else if (!curobj.Role || curobj.Role === "") {
      missingFields.push("Role");
    }
    //  else if (!curobj.Manager?.Id || curobj.Manager?.Id === null) {
    //   missingFields.push("Manager");
    // }
    else if (!curobj.Team || curobj.Team === "") {
      missingFields.push("Cohort");
    }

    //  else if (!curobj.TeamCaptain?.Id || curobj.TeamCaptain?.Id === null) {
    //   missingFields.push("Team captain");
    // }
    // else if (!curobj.TeamLeader?.Id || curobj.TeamLeader?.Id === null) {
    //   missingFields.push("Team leader");
    // }
    //  else if (!curobj.Cohort || curobj.Cohort === "") {
    //   missingFields.push("cohort");
    // }
    // if (!curobj.DirectReports[0]?.Id || curobj.DirectReports[0]?.Id === null) {
    //   missingFields.push('DirectReports');
    // }
    // else if (
    //   !curobj.BackingUp ||
    //   curobj.BackingUp.length === 0 ||
    //   !curobj.BackingUp.some((user) => user.Id !== null)
    // ) {
    //   missingFields.push("Backing up");
    // }

    return missingFields;
  }
  useEffect(() => {
    setLoader(true);
    // getdatas();
    getTeamChoices();
    _getPrialtoAdmin();
  }, []);
  return (
    <>
      <Toast ref={toastTopRight} position="top-right" />

      {loader ? (
        <Loader />
      ) : (
        <div>
          <div className={styles.clientContainer}>
            <h2>Organization Chart</h2>
            {/* <InputText
          value={search}
          onChange={(e: any) => SearchFilter(e.target.value)}
        /> */}
            <div className={styles.rightSection}>
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
                label="Export"
                icon="pi pi-file-excel"
                onClick={() => ExportExcel()}
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
              header="Cohort"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "Team")}
            ></Column>

            {/* <Column
              field="TeamCaptain"
              header="Team captain"
              sortable
              body={(obj: any) => _addTextField(obj, "TeamCaptain")}
            ></Column>
            <Column
              field="TeamLeader"
              header="Team leader"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "TeamLeader")}
            ></Column> */}
            {/* <Column
              field="Cohort"
              header="Cohort"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "Cohort")}
            ></Column> */}
            {/* <Column
            field="Country"
            header="Country"
            sortable
            body={(obj: any) => _addTextField(obj, "Country")}
          ></Column> */}
            <Column
              field="DirectReports"
              header="Direct reports"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "DirectReports")}
            ></Column>
            {/* <Column
              field="BackingUp"
              header="Backing up"
              style={{ width: "20%" }}
              sortable
              body={(obj: any) => _addTextField(obj, "BackingUp")}
            ></Column> */}
            <Column header="Action" body={(obj) => _action(obj)}></Column>
          </DataTable>

          <ConfirmDialog
            visible={showDialog}
            onHide={() => setShowDialog(false)}
            message="Are you sure you want to delete?"
            // header="Confirmation"
            // icon="pi pi-exclamation-triangle"
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
