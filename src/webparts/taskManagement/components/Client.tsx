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
const Client = (props) => {
  const [showDialog, setShowDialog] = useState(false);
  const [mastedata, setMasterdata] = useState([]);
  const toastTopRight = React.useRef(null);

  const [itemToDelete, setItemToDelete] = useState<any>(null);
  // style variables
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
    Backup: {
      Id: null,
      EMail: "",
      Title: "",
    },
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
    Backup: {
      Id: null,
      EMail: "",
      Title: "",
    },
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
        setValue({ ...Data });
        setLoader(false);
        getdatas();
        // getcurUser();
      })
      .catch((err) => errFunction(err));
  };
  const Editfunction = (obj) => {
    setLoader(true);
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
        setisAdd(false);
        setisEdit(false);
        setValue({ ...Data });
        setLoader(false);

        getdatas();
      })
      .catch((err) => errFunction(err));
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
    debugger;
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
                if (validation()) {
                  _handleDataoperation("check", obj);
                } else {
                  showMessage(
                    "Please fill mandatory fields",
                    toastTopRight,
                    "warn"
                  );
                }
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
              placeholder="FirstName"
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
            placeholder="LastName"
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
            placeholder="CompanyName"
            value={value.CompanyName}
            className={`${styles.tblTxtBox}${clsValid}`}
            onChange={(e) => getOnchange("CompanyName", e.target.value)}
          />
        );
      }
      if (fieldType == "Assistant") {
        let clsValid = "";
        !value.Assistant.Id ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={false}
            // required={true}
            placeholder="Enter Email"
            ensureUser={true}
            // showHiddenInUI={false}
            peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
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
        let clsValid = "";
        !value.Backup.Id ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <PeoplePicker
            context={props.context}
            personSelectionLimit={1}
            groupName={""}
            showtooltip={false}
            // required={true}
            peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
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
        !value.Assistant.Id ? (clsValid = "md:w-20rem w-full p-invalid") : "";
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
              peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
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
            {/* <p className={styles.errMsg}>error</p> */}
          </>
        );
      }
      if (fieldType == "Backup") {
        let clsValid = "";
        !value.Backup.Id ? (clsValid = "md:w-20rem w-full p-invalid") : "";
        return (
          <>
            <PeoplePicker
              context={props.context}
              personSelectionLimit={1}
              peoplePickerCntrlclassName={styles.peoplepickerErrStyle}
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
            />{" "}
            {/* <p className={styles.errMsg}>error</p> */}
          </>
        );
      }
    } else {
      if (fieldType == "Assistant" || fieldType == "Backup") {
        return (
          <span className={styles.textOverflow}>{data[fieldType].Title}</span>
        );
      }
      return <span className={styles.textOverflow}>{data[fieldType]}</span>;
    }
  };
  const errFunction = (err) => {
    setLoader(false);
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
        setMasterdata([...array]);
        setLoader(false);
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

    setValue({ ...FormData });
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

        getdatas();
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
    { header: "First Name", key: "FirstName", width: 15 },
    { header: "First Name", key: "LastName", width: 25 },
    { header: "Company Name", key: "CompanyName", width: 25 },
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
      detail: label,
      life: 3000,
    });
  };

  function validation() {
    let isAllValueFilled = true;
    if (
      !value.FirstName ||
      !value.LastName ||
      !value.CompanyName ||
      !value.Backup.Id ||
      !value.Assistant.Id
    ) {
      isAllValueFilled = false;
    }
    return isAllValueFilled;
  }
  useEffect(() => {
    setLoader(true);
    getdatas();
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
            <h2>Client</h2>
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
                icon="pi pi-file-excel"
                className={styles.btnColor}
                label="Export"
                onClick={() => {
                  exportExcel();
                }}
                //   onClick={() => {
                //     _handleData("addParent", { ..._sampleParent });
                //   }}
              />
              <Button
                label="Add Client"
                className={styles.btnColor}
                onClick={() => {
                  setisAdd(true);

                  setisEdit(false);
                  setClientdetail([...clientdetail, Newdatadd]);

                  setValue({ ...Data });
                  // _handleData("addParent", { ..._sampleParent });
                }}
              />
            </div>
          </div>
          <div className={styles.dataTableContainer}>
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
                header="Last Name"
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
export default Client;
