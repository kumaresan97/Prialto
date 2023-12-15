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
let mainarray = [];
let subArray = [];
const CompleteDashboard = (props) => {
  const UserEmail = props.context.pageContext.user.email;
  const [Userdata, setUserdata] = useState([]);
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
          console.log(err);
          setLoader(false);
        });
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
        FilterValue: "Completed",
      },
    ];

    SPServices.SPReadItems({
      Listname: "Tasks",

      Select:
        "*, Assistant/ID,Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName",

      Expand: "Assistant,Backup,Author,Client",
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
            Id: resdata.Id,
            NotifyDate: resdata?.NotifyDate
              ? SPServices.displayDate(resdata.NotifyDate)
              : "",
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
            DoneFormula: resdata?.DoneFormula ? resdata.DoneFormula : "",
            DueDate: SPServices.displayDate(resdata.DueDate),
            PriorityLevel: resdata.PriorityLevel,
            Status: resdata.Status,
            Created: SPServices.displayDate(resdata.Created),
          });
        });
        console.log("mainarray", mainarray);

        getDSubTask();
      })
      .catch((err) => {
        setLoader(false);

        console.log(err);
      });
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
        FilterValue: "Completed",
      },
    ];

    SPServices.SPReadItems({
      Listname: "SubTasks",
      Select:
        "*, Assistant/ID, MainTaskID/ID,MainTaskID/TaskName,Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName",

      Expand: "Assistant,Backup,Author,Client,MainTaskID",
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
              NotifyDate: val?.NotifyDate
                ? SPServices.displayDate(val.NotifyDate)
                : "",
              parentTasKName: val.MainTaskID?.TaskName,
              TaskName: val?.TaskName,
              TaskAge: val?.TaskAge ? val.TaskAge : null,
              DoneFormula: val?.DoneFormula ? val.DoneFormula : "",
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
              DueDate: SPServices.displayDate(val.DueDate),
              PriorityLevel: val.PriorityLevel,
              Status: val.Status,
              Created: SPServices.displayDate(val.Created),
            });
        });

        Binddata();
        console.log(subArray, "subarray");
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  const Binddata = () => {
    debugger;
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
      const output = subArray.filter((item1) =>
        SubArrayId.some((item2) => item2 !== item1.Id)
      );

      globalArray.push(...output);
    }
    console.log("globalArray", globalArray);

    globalArray.sort((a, b) => {
      if (a.Id > b.subId && !a.parentTasKName) {
        return 1;
      }
      if (a.Id < b.subId) {
        return -1;
      }
    });
    setUserdata([...globalArray]);
    setMasterdata([...globalArray]);
    setLoader(false);
  };

  //   const Binddata = () => {
  //     let globalArray = [];

  //     for (let i = 0; i < mainarray.length; i++) {
  //       let mainTask = mainarray[i];
  //       let subtasks = subArray.filter(
  //         (subTask) => subTask.subId === mainTask.Id
  //       );

  //       if (subtasks.length > 0) {
  //         globalArray.push(mainTask, ...subtasks);
  //       } else if (!mainTask.complete) {
  //         globalArray.push(mainTask);
  //       }
  //     }

  //     setUserdata([...globalArray]);
  //     setMasterdata([...globalArray]);
  //     setLoader(false);
  //   };

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
        return fieldValue.toLowerCase().includes(e.toLowerCase());
      });
    });
    console.log(Filterdata);
    setUserdata([...Filterdata]);
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
              justifyContent: "end",
              marginBottom: "10px",
            }}
          >
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                placeholder="Search"
                value={search}
                onChange={(e: any) => SearchFilter(e.target.value)}
              />
            </span>
          </div>
          <DataTable
            paginator
            rows={10}
            value={Userdata}
            sortMode="multiple"
            tableStyle={{ minWidth: "60rem" }}
          >
            <Column
              field="TaskName"
              header="Task name"
              //   expander
              sortable
            />
            <Column field="parentTasKName" header="parent Taskname" sortable />
            <Column field="DueDate" header="Due date" sortable />

            <Column field="PriorityLevel" header=" Priority level" sortable />
            <Column field="Status" header="Status" sortable />

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
