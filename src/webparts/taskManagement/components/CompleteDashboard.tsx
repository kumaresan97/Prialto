import * as React from "react";

import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import SPServices from "../../../Global/SPServices";
import { sp } from "@pnp/sp/presets/all";
import Loader from "./Loader";
import { InputText } from "primereact/inputtext";
import exportToExcel from "../../../Global/ExportExcel";
let mainarray = [];
let subArray = [];
import styles from "./MainComponent.module.scss";

const CompleteDashboard = (props) => {
  // style variables
  const tickIconStyle = {
    backgroundColor: "transparent",
    border: "transparent",
    color: "#007C81",
    height: 30,
    width: "100%",
    fontSize: "30px",
    display: "contents",
    padding: 0,
  };

  console.log("mains", mainarray);
  console.log("subs0", subArray);

  const UserEmail = props.context.pageContext.user.email;
  const [Userdata, setUserdata] = useState([]);
  console.log("usrdata", Userdata);

  const [masterdata, setMasterdata] = useState([]);
  const [search, setSearch] = useState("");

  const [loader, setLoader] = useState(false);

  let userid = null;
  const [curuser, setCuruser] = useState(null);
  const getcurUser = () => {
    if (UserEmail) {
      let user = sp.web.siteUsers
        .getByEmail(UserEmail)
        .get()
        .then((res) => {
          //   console.log("res", res.Id);

          let crntUserDetails = {
            Id: res?.Id,
            EMail: res?.Email,
            Title: res?.Title,
          };
          userid = res?.Id;

          setCuruser(crntUserDetails);

          getTask(props.Completeuser);
        })
        .catch((err) => {
          setLoader(false);
          SPServices.ErrorHandling(err, "Completedashboard");
        });
      // .catch((err) => {
      //   console.log(err);
      //   setLoader(false);
      // });
    }
  };
  const getTask = (id) => {
    let Filter = [
      {
        FilterKey: "Assistant/EMail",
        Operator: "eq",
        FilterValue: id.toLowerCase(),
      },
      {
        FilterKey: "Status",
        Operator: "eq",
        FilterValue: "Done",
      },
    ];

    SPServices.SPReadItems({
      Listname: "Tasks",

      Select:
        "*, Assistant/ID,Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName,Category/Title",

      Expand: "Assistant,Backup,Author,Client,Category",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      Topcount: 5000,
      FilterCondition: "and",
    })
      .then((val) => {
        mainarray = [];

        val.forEach((resdata: any) => {
          mainarray.push({
            parentTasKName: "",
            key: "",
            TaskName: resdata.TaskName,
            Category: resdata.Category?.Title,
            Client: resdata.Client?.FirstName,
            Id: resdata.Id,
            // NotifyDate: resdata?.NotifyDate
            //   ? SPServices.displayDate(resdata.NotifyDate)
            //   : "",
            Creator: {
              Id: resdata.Author.ID,
              EMail: resdata.Author.EMail,
              Title: resdata.Author.Title,
            },
            Backup: {
              Id: resdata.Backup?.ID,
              EMail: resdata.Backup?.EMail,
              Title: resdata.Backup?.Title,
            },
            TaskAge: resdata?.TaskAge ? resdata.TaskAge : null,
            DaysOnEarly: resdata ? resdata.DaysOnEarly : null,
            CompletedDate: resdata
              ? SPServices.displayDate(resdata.CompletedDate)
              : null,
            DoneFormula: resdata?.DoneFormula ? resdata.DoneFormula : "",
            DueDate: resdata ? SPServices.displayDate(resdata.DueDate) : null,
            PriorityLevel: resdata ? resdata.PriorityLevel : "",
            Status: resdata ? resdata.Status : "",
            Created:
              resdata.Author.Title +
              "" +
              SPServices.displayDate(resdata.Created),
          });
        });
        console.log("mainarray", mainarray);

        getDSubTask();
      })
      .catch((err) => {
        setLoader(false);
        SPServices.ErrorHandling(err, "Completedashboard");
      });
    // .catch((err) => {
    //   setLoader(false);

    //   console.log(err);
    // });
  };
  const getDSubTask = () => {
    let Filter = [
      {
        FilterKey: "Assistant/EMail",
        Operator: "eq",
        FilterValue: props.Completeuser.toLowerCase(),
      },
      {
        FilterKey: "Status",
        Operator: "eq",
        FilterValue: "Done",
      },
    ];

    SPServices.SPReadItems({
      Listname: "SubTasks",
      Select:
        "*, Assistant/ID, MainTaskID/ID,MainTaskID/TaskName,Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName,Category/Title",

      Expand: "Assistant,Backup,Author,Client,MainTaskID,Category",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      Topcount: 5000,
      FilterCondition: "and",
    })
      .then((val) => {
        console.log(val, "val");
        subArray = [];

        val.forEach((val: any, index) => {
          val.ClientName == null &&
            subArray.push({
              Id: val.Id,
              subId: val.MainTaskID?.ID,
              Category: val.Category?.Title,
              Client: val.Client?.FirstName,
              //   NotifyDate: val?.NotifyDate
              //     ? SPServices.displayDate(val.NotifyDate)
              //     : "",
              parentTasKName: val.MainTaskID?.TaskName,
              TaskName: val?.TaskName,
              TaskAge: val?.TaskAge ? val.TaskAge : null,
              DaysOnEarly: val ? val.DaysOnEarly : null,
              CompletedDate: val
                ? SPServices.displayDate(val.CompletedDate)
                : null,
              DoneFormula: val?.DoneFormula ? val.DoneFormula : "",
              Creator: {
                Id: val.Author.ID,
                EMail: val.Author.EMail,
                Title: val.Author.Title,
              },
              Backup: {
                Id: val?.Backup?.ID,
                EMail: val?.Backup?.EMail,
                Title: val?.Backup?.Title,
              },
              DueDate: val ? SPServices.displayDate(val.DueDate) : null,
              PriorityLevel: val ? val.PriorityLevel : "",
              Status: val ? val.Status : "",
              Created:
                val.Author.Title + "" + SPServices.displayDate(val.Created),
            });
        });

        Binddata();
        console.log(subArray, "subarray");
      })
      // .catch((err) => {
      //   setLoader(false);
      //   console.log(err);
      // });
      .catch((err) => {
        setLoader(false);
        SPServices.ErrorHandling(err, "Completedashboard");
      });
  };

  const Binddata = () => {
    let globalArray = [];
    let SubArrayId = [];

    for (let i = 0; i < mainarray.length; i++) {
      let subfield = false;

      for (let j = 0; j < subArray.length; j++) {
        if (mainarray[i].Id === subArray[j].subId) {
          globalArray.push(subArray[j]);
          SubArrayId.push(subArray[j].Id);

          subfield = true;
        }

        if (subfield && subArray.length === j + 1) {
          globalArray.push(mainarray[i]);
        }
      }

      if (!subfield) {
        globalArray.push(mainarray[i]);
      }
    }

    if (subArray.length && SubArrayId.length === 0) {
      globalArray.push(...subArray);
    } else if (SubArrayId.length) {
      const output = subArray.filter(
        (item1) =>
          // SubArrayId.some((item2) => item2 !== item1.Id)
          !SubArrayId.includes(item1.Id)
      );

      globalArray.push(...output);
    }
    console.log("globalArray", globalArray);

    const sortedArray = globalArray.sort((a, b) => {
      if (!a.parentTasKName && b.parentTasKName) {
        return -1;
      } else if (a.parentTasKName && !b.parentTasKName) {
        return 1;
      } else if (!a.parentTasKName && !b.parentTasKName && a.subId === b.Id) {
        return -1;
      } else {
        return 0;
      }
    });

    // globalArray.sort((a, b) => {
    //   if (a.Id > b.subId && !a.parentTasKName) {
    //     return 1;
    //   }
    //   if (a.Id < b.subId) {
    //     return -1;
    //   }
    // });
    setUserdata([...sortedArray]);
    setMasterdata([...sortedArray]);
    setLoader(false);
  };

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
    } else {
      bgColor = "#dfffbb";
      color = "#6e6e6e";
    }
    return (
      <div
        // className={styles.pLevelStyle}
        style={{
          backgroundColor: bgColor,
          color: color,
          padding: "6px 0px",
          textAlign: "center",
          borderRadius: "12px",
          width: "96px",
        }}
      >
        {PLevel}
      </div>
    );
  };

  const SearchFilter = (e) => {
    setSearch(e);
    console.log(e);
    console.log(masterdata, "masterdata");
    const Filterdata = masterdata.filter((item) => {
      const searchableFields = [
        "TaskName",
        "parentTasKName",
        "DueDate",
        "PriorityLevel",
        "Status",
      ];
      return searchableFields.some((field) => {
        const fieldValue = item[field];
        return fieldValue?.toLowerCase()?.includes(e?.toLowerCase());
      });
    });
    setUserdata([...Filterdata]);
  };

  let columns = [
    { header: "Task Name", key: "TaskName", width: 15 },
    { header: "Creation Log", key: "Created", width: 25 },

    { header: "Parent Task Name", key: "parentTasKName", width: 25 },
    // { header: "Creator", key: "Creator", width: 25 },
    // { header: "Backup", key: "Backup", width: 25 },

    { header: "Priority Level", key: "PriorityLevel", width: 25 },
    { header: "Status", key: "Status", width: 20 },
    { header: "DueDate", key: "DueDate", width: 15 },

    { header: "Task Age", key: "TaskAge", width: 15 },
    { header: "Completed Date", key: "CompletedDate", width: 25 },
    { header: "Days OnEarly", key: "DaysOnEarly", width: 20 },

    { header: "Done Formula", key: "DoneFormula", width: 20 },
  ];
  const Exportexcel = () => {
    exportToExcel(Userdata, columns, "DoneDashboard");
    // console.log(obj.PriorityLevel, "obj");
  };

  useEffect(() => {
    setLoader(true);
    getcurUser();
  }, []);
  return (
    <div>
      {loader ? (
        <Loader></Loader>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {" "}
            <div>
              <Button
                className={styles.righticon}
                style={tickIconStyle}
                // label={
                //   props.selectedTeamMember.length
                //     ? props.selectedTeamMember[0].TeamName
                //     : ""
                // }
                icon="pi pi-arrow-left"
                iconPos="left"
                onClick={() => {
                  props.HandleBackBtn();
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 15 }}>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  placeholder="Search"
                  value={search}
                  onChange={(e: any) => SearchFilter(e.target.value)}
                />
              </span>

              <Button
                style={{
                  backgroundColor: "#f46906",
                  border: "none",
                  padding: "8px 18px",
                  height: "38px",
                }}
                // className={styles.btnColor}
                label="Export"
                onClick={() => Exportexcel()}
                icon="pi pi-file-excel"
              />
            </div>
          </div>
          <DataTable
            paginator
            rows={10}
            value={Userdata}
            removableSort
            sortMode="multiple"
            tableStyle={{ minWidth: "60rem" }}
          >
            <Column
              field="Category"
              header="Category"
              //   expander
              sortable
            />
            <Column
              field="Client"
              header="Client"
              //   expander
              sortable
            />
            <Column
              field="TaskName"
              header="Task name"
              //   expander
              sortable
            />
            <Column field="parentTasKName" header="Parent task name" sortable />
            <Column field="DueDate" header="Due date" sortable />

            <Column
              field="PriorityLevel"
              header=" Priority level"
              sortable
              body={(obj) => priorityLevelStyle(obj.PriorityLevel)}
            />
            <Column
              field="Status"
              header="Status"
              sortable
              body={(obj) => priorityLevelStyle(obj.Status)}
            />
            <Column field="CompletedDate" header="Completed Date" sortable />

            {/* <Column
                  header="Action"
                  style={{ width: "200px" }}
                  body={(obj) => _action(obj)}
                ></Column>
            */}
          </DataTable>
        </div>
      )}
    </div>
  );
};
export default CompleteDashboard;
