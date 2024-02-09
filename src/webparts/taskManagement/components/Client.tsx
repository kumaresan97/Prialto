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
import styles from "./TaskManagement.module.scss";
import { ConfirmDialog } from "primereact/confirmdialog";
import Loader from "./Loader";
import exportToExcel from "../../../Global/ExportExcel";
import { Toast } from "primereact/toast";
import { Icon, Persona } from "office-ui-fabric-react";
import { PersonaSize } from "@fluentui/react";
let _isTL: boolean = false;
let _isTC: boolean = false;
let _isPA: boolean = false;
const Client = (props) => {
  const _curUser: string = props.context._pageContext._user.email;
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
  const [showDialog, setShowDialog] = useState(false);
  const [mastedata, setMasterdata] = useState([]);
  const toastTopRight = React.useRef(null);

  const [itemToDelete, setItemToDelete] = useState<any>(null);
  // style variables
  const editIconStyle = {
    backgroundColor: "transparent",
    color: "#555",
    border: "none",
    // height: 26,
    // width: 26,
    width: "1.5rem",
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
  const [isadd, setisAdd] = useState(false);
  const [isedit, setisEdit] = useState(false);
  // let products: IClient = {
  //   Id: 1,
  //   FirstName: "1000",
  //   LastName: "f230fh0g3",
  //   CompanyName: "o BamboWatch",
  //   Assistant: {
  //     Id: null,
  //     EMail: "",
  //     Title: "Kumaresan",
  //   },
  //   // Backup: {
  //   //   Id: null,
  //   //   EMail: "",
  //   //   Title: "raj",
  //   // },
  // };
  let Data: IClient = {
    Id: null,
    FirstName: "",
    LastName: "",
    CompanyName: "",
    Assistant: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Backup: [
      {
        Id: null,
        EMail: "",
        Title: "",
      },
    ],
  };
  let Newdatadd: IClient = {
    Id: null,
    FirstName: "",
    LastName: "",
    CompanyName: "",
    Assistant: {
      Id: null,
      EMail: "",
      Title: "",
    },
    Backup: [
      {
        Id: null,
        EMail: "",
        Title: "",
      },
    ],
  };

  const [loader, setLoader] = useState(false);

  const [clientdetail, setClientdetail] = useState<IClient[]>([]);

  const [value, setValue] = useState(Data);
  const [search, setSearch] = useState("");

  const handledata = (obj) => {
    setisEdit(true);
    setisAdd(false);

    setValue({ ...obj });
  };

  const AddItem = (obj) => {
    setLoader(true);

    let Backupids = [];

    if (value.Backup && value.Backup.length >= 1) {
      value.Backup.forEach((val) => {
        if (val && val.Id) {
          Backupids.push(val.Id);
        }
      });
    }
    let json = {
      FirstName: value.FirstName ? value.FirstName : "",
      LastName: value.LastName ? value.LastName : "",
      CompanyName: value.CompanyName ? value.CompanyName : "",
      AssistantId: value.Assistant.Id ? value.Assistant.Id : null,
      BackupId: { results: Backupids },
      // BackupId: value.Backup.Id ? value.Backup.Id : null,
    };

    SPServices.SPAddItem({
      Listname: "ClientDetails",
      RequestJSON: json,
    })
      .then((res) => {
        let resobj = {
          Id: res.data.ID,
          FirstName: value.FirstName ? value.FirstName : "",
          LastName: value.LastName ? value.LastName : "",
          CompanyName: value.CompanyName ? value.CompanyName : "",
          Assistant: {
            Id: value.Assistant?.Id,
            EMail: value.Assistant?.EMail,
            Title: value.Assistant?.Title,
          },

          // AssistantId: value.Assistant.Id ? value.Assistant.Id : null,

          Backup: Array.isArray(value.Backup)
            ? value.Backup.map((response) => ({
                Id: response?.ID,
                EMail: response?.EMail,
                Title: response?.Title,
              }))
            : [],
        };

        let x = clientdetail.filter((val) => val.Id !== null);
        //setClientdetail([...x, resobj]);
        setClientdetail([resobj, ...x]);
        setisAdd(false);
        setisEdit(false);

        setValue({ ...Data });

        setLoader(false);
        showMessage("Data Added Successfully", toastTopRight, "success");

        // getdatas();
        // getcurUser();
      })
      .catch((err) => {
        setLoader(false);
        errFunction(err);
        SPServices.ErrorHandling(err, "Member");
      });
  };
  const Editfunction = (obj) => {
    setLoader(true);

    let Backupids = [];

    if (value.Backup && value.Backup.length >= 1) {
      value.Backup.forEach((val) => {
        if (val && val.Id) {
          Backupids.push(val.Id);
        }
      });
    }
    let json = {
      FirstName: value.FirstName ? value.FirstName : "",
      LastName: value.LastName ? value.LastName : "",
      CompanyName: value.CompanyName ? value.CompanyName : "",
      AssistantId: value.Assistant.Id ? value.Assistant.Id : null,
      BackupId: { results: Backupids },

      // BackupId: value.Backup.Id ? value.Backup.Id : null,
    };
    SPServices.SPUpdateItem({
      Listname: "ClientDetails",
      ID: obj.Id,
      RequestJSON: json,
    })
      .then((res) => {
        let resobj = {
          Id: obj.Id,
          FirstName: value.FirstName ? value.FirstName : "",
          LastName: value.LastName ? value.LastName : "",
          CompanyName: value.CompanyName ? value.CompanyName : "",
          Assistant: {
            Id: value.Assistant?.Id,
            EMail: value.Assistant?.EMail,
            Title: value.Assistant?.Title,
          },

          // AssistantId: value.Assistant.Id ? value.Assistant.Id : null,

          Backup: Array.isArray(value.Backup)
            ? value.Backup.map((response) => ({
                Id: response?.ID,
                EMail: response?.EMail,
                Title: response?.Title,
              }))
            : [],
        };
        let updatedClientDetail = clientdetail.map((val) => {
          if (val.Id === obj.Id) {
            return resobj;
          }
          return val;
        });

        setClientdetail([...updatedClientDetail]);

        // setClientdetail([...clientdetail]);

        setisAdd(false);
        setisEdit(false);
        setValue({ ...Data });
        setLoader(false);
        showMessage("Data Edited Successfully", toastTopRight, "success");

        // getdatas();
      })
      .catch((err) => {
        setLoader(false);
        errFunction(err);
        SPServices.ErrorHandling(err, "Member");
      });
    // .catch((err) => errFunction(err));
  };

  const _handleDataoperation = (key, obj) => {
    if (isedit && obj.Id) {
      Editfunction(obj);
    } else if (!obj.Id && isadd && key == "check") {
      AddItem(obj);
    }
    //else if (key == "cancel") {
    //   if (obj.Id) {
    //     // If the item has an Id (existing item), do nothing
    //     setisAdd(false);
    //     setisEdit(false);
    //   } else {
    //     // If the item doesn't have an Id (new item), remove it
    //     const updatedClientDetail = clientdetail.filter(
    //       (val) => val.Id !== null
    //     );

    //     setClientdetail(updatedClientDetail);
    //     setisAdd(false);
    //     setisEdit(false);
    //   }
    // }
  };

  function _handleDataoperationNew(key, obj) {
    if (obj.Id) {
      // If the item has an Id (existing item), do nothing
      setisAdd(false);
      setisEdit(false);
      setValue({ ...Data });
    } else {
      // If the item doesn't have an Id (new item), remove it
      const updatedClientDetail = clientdetail.filter((val) => val.Id !== null);

      setClientdetail(updatedClientDetail);
      // setValue({ ...Data });
      setisAdd(false);
      setisEdit(false);
    }
  }

  const _action = (obj: any): JSX.Element => {
    return (
      <div>
        {isedit == false && isadd == false && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="button"
              icon="pi pi-pencil"
              // disabled={props._isAdmin ? false : true}
              style={editIconStyle}
              onClick={(_) => {
                setisEdit(true);

                setisAdd(false);
                handledata(obj);
              }}
            />
            <Button
              type="button"
              icon=" pi pi-trash"
              // disabled={props._isAdmin ? false : true}
              style={delIconBtnStyle}
              onClick={(_) => {
                confirmDelete(obj);
                // handledata(obj);
                // setisEdit(true);
              }}
            />
          </div>
        )}
        {((isadd && obj.Id == value.Id) || (isedit && obj.Id == value.Id)) && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              className={styles.iconStyle}
              type="button"
              icon="pi pi-check"
              rounded
              style={tickIconStyle}
              onClick={(_) => {
                const missingFields = validation();
                if (missingFields.length === 0) {
                  _handleDataoperation("check", obj);
                } else {
                  // missingFields.forEach((field) => {
                  const errorMessage = `Please enter ${missingFields[currentFieldIndex]}`;
                  showMessage(errorMessage, toastTopRight, "warn");

                  currentFieldIndex =
                    (currentFieldIndex + 1) % missingFields.length;
                }
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
              className={styles.iconStyle}
              type="button"
              icon="pi pi-times"
              rounded
              style={delIconBtnStyle}
              onClick={(_) => {
                _handleDataoperationNew("cancel", obj);
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
        let clsValid = "";
        !value.FirstName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <>
            <InputText
              type="text"
              placeholder="First name"
              className={`${styles.tblTxtBox}${clsValid}`}
              value={value.FirstName}
              onChange={(e) => getOnchange("FirstName", e.target.value)}
            />
            {/* <p>Error</p> */}
          </>
        );
      }
      if (fieldType == "LastName") {
        let clsValid = "";
        !value.LastName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <InputText
            type="text"
            placeholder="Last name"
            className={`${styles.tblTxtBox}${clsValid}`}
            value={value.LastName}
            onChange={(e) => getOnchange("LastName", e.target.value)}
          />
        );
      }
      if (fieldType == "CompanyName") {
        let clsValid = "";
        !value.CompanyName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <InputText
            type="text"
            placeholder="Company name"
            value={value.CompanyName}
            className={`${styles.tblTxtBox}${clsValid}`}
            onChange={(e) => getOnchange("CompanyName", e.target.value)}
          />
        );
      }
      if (fieldType == "Assistant") {
        let clsValid = "";
        !value.Assistant?.Id ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={false}
            // required={true}
            placeholder=" Enter user"
            ensureUser={true}
            // showHiddenInUI={false}
            peoplePickerCntrlclassName={
              !value.Assistant?.Id ? styles.peoplepickerErrStyle : ""
            }
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={
              value.Assistant.EMail ? [value.Assistant.EMail] : []
            }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items[0];
                getOnchange("Assistant", selectedItem);
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
        let clsValid = "";
        !value.Backup ||
        value.Backup.length === 0 ||
        !value.Backup.some((user) => user.Id !== null)
          ? (clsValid = "md:w-20rem w-full p-invalid")
          : "";

        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={20}
            groupName={""}
            showtooltip={false}
            // required={true}
            styles={multiPeoplePickerStyle}
            // peoplePickerCntrlclassName={
            //   !value.Backup ||
            //   value.Backup.length === 0 ||
            //   !value.Backup.some((user) => user.Id !== null)
            //     ? styles.peoplepickerErrStyle
            //     : ""
            // }
            // peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            showHiddenInUI={true}
            principalTypes={[PrincipalType.User]}
            defaultSelectedUsers={value.Backup?.map((report) => {
              return report.EMail;
            })}
            // defaultSelectedUsers={
            //   value.Backup.EMail ? [value.Backup.EMail] : []
            // }
            resolveDelay={1000}
            onChange={(items: any[]) => {
              if (items.length > 0) {
                const selectedItem = items;
                getOnchange("Backup", selectedItem);
                // getonChange("PeopleEmail", selectedItem.secondaryText);
              } else {
                // No selection, pass null or handle as needed
                getOnchange("Backup", []);
              }
            }}
          />
        );
      }

      //   return <InputText type="text" value={""} />;
    } else if (val.Id && isedit && val.Id === value.Id) {
      if (fieldType == "FirstName") {
        let clsValid = "";
        !value.FirstName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <InputText
            type="text"
            // placeholder="TaskName"
            className={`${styles.tblTxtBox}${clsValid}`}
            value={value.FirstName}
            onChange={(e) => getOnchange("FirstName", e.target.value)}
          />
          // {/* <p className={styles.errMsg}>error</p> */}
        );
      }
      if (fieldType == "LastName") {
        let clsValid = "";
        !value.LastName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <>
            <InputText
              type="text"
              // placeholder="TaskName"

              className={`${styles.tblTxtBox}${clsValid}`}
              value={value.LastName}
              onChange={(e) => getOnchange("LastName", e.target.value)}
            />
            {/* <p className={styles.errMsg}>error</p> */}
          </>
        );
      }
      if (fieldType == "CompanyName") {
        let clsValid = "";
        !value.CompanyName ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <>
            <InputText
              type="text"
              className={`${styles.tblTxtBox}${clsValid}`}
              // placeholder="TaskName"
              value={value.CompanyName}
              onChange={(e) => getOnchange("CompanyName", e.target.value)}
            />
            {/* <p className={styles.errMsg}>error</p> */}
          </>
        );
      }

      if (fieldType == "Assistant") {
        let clsValid = "";
        !value.Assistant?.Id ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <>
            <PeoplePicker
              context={props.context}
              personSelectionLimit={1}
              groupName={""}
              showtooltip={true}
              // required={true}
              ensureUser={true}
              // showHiddenInUI={false}
              peoplePickerCntrlclassName={
                !value.Assistant?.Id ? styles.peoplepickerErrStyle : ""
              }
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
                  getOnchange("Assistant", selectedItem);
                  // getonChange("PeopleEmail", selectedItem.secondaryText);
                } else {
                  // No selection, pass null or handle as needed
                  getOnchange("Assistant", null);
                }
              }}
            />
            {/* <p className={styles.errMsg}>error</p> */}
          </>
        );
      }
      if (fieldType == "Backup") {
        let clsValid = "";
        !value.Backup ||
        value.Backup.length === 0 ||
        !value.Backup.some((user) => user.Id !== null)
          ? (clsValid = "md:w-20rem w-full p-invalid")
          : "";

        return (
          <>
            <PeoplePicker
              context={props.context}
              personSelectionLimit={20}
              styles={multiPeoplePickerStyle}
              // peoplePickerCntrlclassName={
              //   !value.Backup ||
              //   value.Backup.length === 0 ||
              //   !value.Backup.some((user) => user.Id !== null)
              //     ? styles.peoplepickerErrStyle
              //     : ""
              // }
              // peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
              groupName={""}
              showtooltip={true}
              // required={true}
              ensureUser={true}
              // showHiddenInUI={false}
              showHiddenInUI={true}
              principalTypes={[PrincipalType.User]}
              defaultSelectedUsers={value.Backup?.map((report) => {
                return report.EMail;
              })}
              // defaultSelectedUsers={
              //   value.Backup.EMail ? [value.Backup.EMail] : []
              // }
              resolveDelay={1000}
              onChange={(items: any[]) => {
                if (items.length > 0) {
                  const selectedItem = items;
                  getOnchange("Backup", selectedItem);
                  // getonChange("PeopleEmail", selectedItem.secondaryText);
                } else {
                  // No selection, pass null or handle as needed
                  getOnchange("Backup", []);
                }
              }}
            />{" "}
            {/* <p className={styles.errMsg}>error</p> */}
          </>
        );
      }
    } else {
      if (fieldType == "Assistant") {
        return (
          <span
            className={styles.textOverflow}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <Persona
              imageUrl={
                data &&
                "/_layouts/15/userphoto.aspx?username=" + data[fieldType].EMail
              }
              size={PersonaSize.size24}
            />{" "}
            {data[fieldType].Title}
          </span>
        );
      }

      if (fieldType == "Backup") {
        return (
          <>
            {data[fieldType].length > 0 &&
              data[fieldType].map((val, index) => (
                <span
                  key={index} // Add a unique key prop when mapping elements in React
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                  className={styles.textOverflow}
                >
                  <Persona
                    imageUrl={
                      data &&
                      "/_layouts/15/userphoto.aspx?username=" + val.EMail
                    }
                    size={PersonaSize.size24}
                  />
                  {val.Title}
                </span>
              ))}
          </>
        );
      }
      return <span className={styles.textOverflow}>{data[fieldType]}</span>;
    }
  };
  const errFunction = (err) => {
    setLoader(false);
    showMessage(
      "Something went wrong, Please contact system admin",
      toastTopRight,
      "error"
    );
    console.log(err);
  };
  const getdatas = (MyTeamMembers) => {
    SPServices.SPReadItems({
      Listname: "ClientDetails",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title",

      Expand: "Assistant,Backup,Author",
      Orderby: "Created",
      Orderbydecorasc: false,
      Topcount: 5000,
    })
      .then((res) => {
        let array: IClient[] = [];
        res.forEach((val: any) => {
          let isTeamMemberinAssitant = false;
          isTeamMemberinAssitant = MyTeamMembers.includes(val.Assistant?.EMail);
          let isTeamMemberinBackup = false;
          if (val.Backup) {
            for (let i = 0; i < val.Backup.length; i++) {
              if (MyTeamMembers.includes(val.Backup[i].EMail)) {
                isTeamMemberinBackup = true;
              }
            }
          }

          if (
            isTeamMemberinAssitant ||
            isTeamMemberinBackup ||
            props._isAdmin
          ) {
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

              Backup: Array.isArray(val.Backup)
                ? val.Backup?.map((response) => ({
                    Id: response?.ID,
                    EMail: response?.EMail,
                    Title: response?.Title,
                  }))
                : [],

              // Backup: {
              //   Id: val.Backup?.ID,
              //   EMail: val.Backup?.EMail,
              //   Title: val.Backup?.Title,
              // },
            });
          }
        });
        setClientdetail([...array]);
        setMasterdata([...array]);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        errFunction(err);
        SPServices.ErrorHandling(err, "Member");
      });
    // .catch((err) => errFunction(err));
  };

  const getOnchange = (key, _value) => {
    let FormData = { ...value };
    let Newdata = {
      Id: FormData.Id,
      FirstName: key == "FirstName" ? _value : FormData.FirstName,
      LastName: key == "LastName" ? _value : FormData.LastName,
      CompanyName: key == "CompanyName" ? _value : FormData.CompanyName,
      Assistant:
        key == "Assistant"
          ? {
              Id: _value ? _value.id : null,
              EMail: _value ? _value.secondaryText : "",
              Title: _value ? _value.text : "",
            }
          : FormData.Assistant,
      Backup:
        key == "Backup"
          ? _value.map((item) => ({
              Id: item.id,
              EMail: item.secondaryText,
              Title: item.text,
            }))
          : FormData.Backup,
    };
    // let err = { ...error };

    // if (key == "Assistant") {
    //   (FormData.Assistant.Id = _value ? _value.id : null),
    //     (FormData.Assistant.EMail = _value ? _value.secondaryText : ""),
    //     (FormData.Assistant.Title = _value ? _value.text : "");
    // } else if (key === "Backup") {
    //   FormData[key] = _value.map((item) => ({
    //     Id: item.id,
    //     EMail: item.secondaryText,
    //     Title: item.text,
    //   }));
    // }

    // else {
    //   FormData[key] = _value;
    // }

    setValue({ ...Newdata });
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
        Listname: "ClientDetails",
        ID: itemToDelete.Id,
      }).then((res) => {
        setShowDialog(false);
        setLoader(false);
        let deleteobj = clientdetail.filter(
          (val) => val.Id !== itemToDelete.Id
        );
        setClientdetail([...deleteobj]);
        showMessage("Data Deleted Successfully", toastTopRight, "success");

        // getdatas();
      });
    } else {
      setShowDialog(false);
    }
  };

  const SearchFilter = (e) => {
    setSearch(e);

    // const filteredData = mastedata.filter((item) => {
    //   const searchableFields = [
    //     "First Name",
    //     "Last Name",
    //     "Assistant",
    //     "Company Name",
    //     "Backup",
    //   ];

    //   return searchableFields.some((field) => {
    //     if (typeof item[field] === "object") {
    //       const nestedObject = item[field] as {
    //         [key: string]: string | number | null;
    //       };
    //       return Object.values(nestedObject).some(
    //         (value) =>
    //           value && value.toString().toLowerCase().includes(e.toLowerCase())
    //       );
    //     } else {
    //       return (
    //         item[field]
    //           // ?.toString()
    //           .toLowerCase()
    //           .includes(e.toLowerCase())
    //       );
    //     }
    //   });
    // });

    const filteredData = mastedata.filter((item) => {
      const searchableFields = [
        "FirstName",
        "LastName",
        "Assistant",
        "CompanyName",
        "Backup",
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

    setClientdetail([...filteredData]);
  };

  let columns = [
    { header: "First name", key: "FirstName", width: 25 },
    { header: "Last name", key: "LastName", width: 25 },
    { header: "Company name", key: "CompanyName", width: 25 },
    { header: "Assistant", key: "Assistant", width: 25 },

    { header: "Backup", key: "Backup", width: 25 },
  ];
  const exportExcel = () => {
    exportToExcel(clientdetail, columns, "Client");
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
  //     !value?.FirstName ||
  //     !value?.LastName ||
  //     !value?.CompanyName ||
  //     // !value.Backup.Id ||
  //     !value?.Assistant?.Id
  //   ) {
  //     isAllValueFilled = false;
  //   }
  //   return isAllValueFilled;
  // }
  let currentFieldIndex = 0;

  function validation() {
    const missingFields = [];

    if (!value.FirstName || value.FirstName == "") {
      missingFields.push("First name");
    } else if (!value.LastName || value.LastName === "") {
      missingFields.push("Last name");
    } else if (!value.CompanyName || value.CompanyName == "") {
      missingFields.push("Company name");
    } else if (!value.Assistant?.Id || value.Assistant?.Id === null) {
      missingFields.push("Assistant");
    }
    // else if (
    //   !value.Backup ||
    //   value.Backup.length === 0 ||
    //   !value.Backup.some((user) => user.Id !== null)
    // ) {
    //   missingFields.push("Backup");
    // }

    return missingFields;
  }

  const getTeamMembers = () => {
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
        dataManipulation(res);
      })
      .catch((err) => {
        setLoader(false);
        errFunction(err);
        SPServices.ErrorHandling(err, "Member");
      });
    // .catch((err: any) => {
    //   errFunction("Configuration List Nave Details get issue.");
    // });
  };

  function dataManipulation(data) {
    let arrDisplay = [];
    let myTeams = [];
    let myTeamMembers = [];
    _isTL = false;
    _isTC = false;
    _isPA = false;

    data.forEach((val: any) => {
      if (val.Role === "TL" && val.Name.EMail == _curUser) {
        _isTL = true;
        if (val.Team.length > 0) {
          for (let i = 0; i < val.Team.length; i++) {
            myTeams.push(val.Team[i]);
          }
        }
      } else if (val.Role === "TC" && val.Name.EMail == _curUser) {
        _isTC = true;
        if (val.Team.length > 0) {
          for (let i = 0; i < val.Team.length; i++) {
            myTeams.push(val.Team[i]);
          }
        }
      } else if (val.Role === "PA") {
        _isPA = true;
      }
    });

    for (let i = 0; i < data.length; i++) {
      let ismyTeam = false;
      for (let j = 0; j < data[i].Team.length; j++) {
        let availorNot = myTeams.includes(data[i].Team[j]);
        if (availorNot) {
          ismyTeam = true;
        }
      }

      if (((_isTL || _isTC) && ismyTeam) || props._isAdmin) {
        myTeamMembers.push(data[i].Name.EMail);
        arrDisplay.push(data[i]);
      }
    }
    getdatas(myTeamMembers);
  }

  useEffect(() => {
    setLoader(true);
    getTeamMembers();
  }, []);

  return (
    <>
      <Toast ref={toastTopRight} position="top-right" />

      {loader ? (
        <Loader />
      ) : (
        <div>
          <div
            // style={{
            //   display: "flex",
            //   justifyContent: "flex-end",header
            //   gap: "12px",
            //   margin: "0px 0px 10px 0px",
            // }}
            className={styles.clientContainer}
          >
            <h2>Member list</h2>
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

              {/* <Button
                icon="pi pi-file-excel"
                className={styles.btnColor}
                label="Export"
                onClick={() => {
                  exportExcel();
                }}
                //   onClick={() => {
                //     _handleData("addParent", { ..._sampleParent });
                //   }}
              /> */}

              <Icon
                iconName="ExcelDocument"
                style={{
                  background: "#edffe6",
                  color: "#175200",
                  border: "1px solid #17520010",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  height: " 34px",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() => exportExcel()}
              />
              {
                <Button
                  label="Add Member"
                  className={styles.btnColor}
                  // disabled={props._isAdmin ? false : true}
                  onClick={() => {
                    setisAdd(true);

                    setisEdit(false);
                    //setClientdetail([...clientdetail, Newdatadd]);
                    clientdetail?.filter((e) => e.Id === null)?.length === 0
                      ? setClientdetail([Newdatadd, ...clientdetail])
                      : showMessage(
                          "Can't add multiple Member at a time",
                          toastTopRight,
                          "warn"
                        );

                    setValue({ ...Data });
                    // _handleData("addParent", { ..._sampleParent });
                  }}
                />
              }
            </div>
          </div>
          <div className={styles.dataTableContainer}>
            <DataTable
              value={clientdetail}
              sortMode="multiple"
              removableSort
              tableStyle={{ minWidth: "60rem" }}
              paginator
              rows={10}
            >
              <Column
                field="FirstName"
                header="First name"
                style={{ width: "200px" }}
                sortable
                body={(obj: any) => _addTextField(obj, "FirstName")}
              ></Column>
              <Column
                field="LastName"
                header="Last name"
                style={{ width: "200px" }}
                sortable
                body={(obj: any) => _addTextField(obj, "LastName")}
              ></Column>
              <Column
                field="CompanyName"
                header="Company name"
                style={{ width: "200px" }}
                sortable
                body={(obj: any) => _addTextField(obj, "CompanyName")}
              ></Column>
              <Column
                field="Assistant"
                header="Assistant"
                style={{ width: "200px" }}
                sortable
                body={(obj: any) => _addTextField(obj, "Assistant")}
              ></Column>
              <Column
                field="Backup"
                header="Backup"
                style={{ width: "200px" }}
                sortable
                body={(obj: any) => _addTextField(obj, "Backup")}
              ></Column>
              {
                <Column
                  header="Action"
                  style={{ width: "200px" }}
                  body={(obj) => _action(obj)}
                ></Column>
              }
            </DataTable>
          </div>

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
export default Client;
