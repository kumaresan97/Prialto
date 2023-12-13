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
let mainarray = [];
let subArray = [];
const CompleteDashboard = (props) => {
  const UserEmail = props.context.pageContext.user.email;
  const [Userdata, setUserdata] = useState([]);
  const [loader, setLoader] = useState(false);
  let data = [
    {
      TaskName: "123",
      DueDate: "08/11/1997",
      PriorityLevel: "High",
      Status: "Completed",
    },
    {
      TaskName: "123",
      DueDate: "08/11/1997",
      PriorityLevel: "High",
      Status: "Completed",
    },
    {
      TaskName: "123",
      DueDate: "08/11/1997",
      PriorityLevel: "High",
      Status: "Completed",
    },
    {
      TaskName: "123",
      DueDate: "08/11/1997",
      PriorityLevel: "High",
      Status: "Completed",
    },
    {
      TaskName: "123",
      DueDate: "08/11/1997",
      PriorityLevel: "High",
      Status: "Completed",
    },
  ];
  let userid = null;
  const [curuser, setCuruser] = useState(null);
  const getcurUser = () => {
    debugger;
    if (UserEmail) {
      let user = sp.web.siteUsers
        .getByEmail(UserEmail)
        .get()
        .then((res) => {
          console.log("res", res.Id);

          let crntUserDetails = {
            Id: res.Id,
            EMail: res.Email,
            Title: res.Title,
          };
          userid = res.Id;

          setCuruser(crntUserDetails);

          getTask(props.Completeuser);
        })
        .catch((err) => console.log(err));
    }
  };
  const getTask = (id) => {
    debugger;
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
            // ClientName: resdata.ClientId ? resdata.Client.FirstName : "",
            // ClientID: resdata.ClientId ? resdata.Client.ID : "",
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

        /* Start Of Subtaks */

        //   var res = val.filter(function (data: any) {
        //     return data.MainTaskID.ID == val[i].Id;
        //   });
        val.forEach((val: any, index) => {
          val.ClientName == null &&
            subArray.push({
              // key: `${mainarray[i].Id}-${index + 1}`,
              // Index: index,
              Id: val.Id,
              subId: val.MainTaskID?.ID,
              parentTasKName: val.MainTaskID?.TaskName,
              TaskName: val.TaskName,
              // ClientID: mainarray[i].data.ClientID,
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

        //   MainArray.push({
        //     ...MainTask[i],
        //     children: SubTask,
        //   });

        //   if (i + 1 === mainarray.length) {
        //     debugger;
        //     console.log(subArray, "subarray");
        //     Binddata();

        // console.log(MainArray, "MainArray");
        // let tempClient=[];
        // for(let i=0;i<MyClients.length;i++)
        // {
        //     tempClient.push({ClientName:MyClients[i].Name,ID:MyClients[i].ID,Tasks:[]});
        //     for(let j=0;j<MainArray.length;j++)
        //     {
        //         if(MainArray[j].data.ClientID==MyClients[i].ID)
        //         tempClient[i].Tasks.push(MainArray[j]);
        //     }
        // }
        // setCurMyTask([...MainArray]);
        // setMasterdata([...MainArray]);
        // setClientdata([...tempClient]);
        // Binddata();
        //   }
        /* End Of Subtaks */

        // val.forEach((resdata: any) => {
        //   subArray.push({
        //     TaskName: resdata.TaskName,
        //     ClientID: resdata.ClientId ? resdata.Client.ID : "",
        //     Creator: {
        //       Id: resdata.Author.ID,
        //       EMail: resdata.Author.EMail,
        //       Title: resdata.Author.Title,
        //     },
        //     Backup: {
        //       Id: resdata.Backup?.ID,
        //       EMail: resdata.Backup?.EMail,
        //       Title: resdata.Backup?.Title,
        //     },
        //     DueDate: SPServices.displayDate(resdata.DueDate),
        //     PriorityLevel: resdata.PriorityLevel,
        //     Status: resdata.Status,
        //     Created: SPServices.displayDate(resdata.Created),
        //   });
        // });
        Binddata();
        console.log(subArray, "subarray");
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  const Binddata = () => {
    let globalArray = [];
    for (let i = 0; i < mainarray.length; i++) {
      let subfield = false;
      for (let j = 0; j < subArray.length; j++) {
        if (mainarray[i].Id === subArray[j].subId) {
          globalArray.push(mainarray[i], subArray[j]);
          subfield = true;
        } else {
          globalArray.push(mainarray[i]);
        }
      }
      if (!subfield) {
        globalArray.push(mainarray[i]);
        subfield = false;
      }
      // subArray.filter((val)=>val.Status=="Completed")
    }
    globalArray.sort((a, b) => {
      if (a.Id > b.Id) {
        return 1;
      }
      if (a.Id < b.Id) {
        return -1;
      }
    });
    setUserdata([...globalArray]);
    setLoader(false);
    console.log(globalArray, "globalarray");
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
        <DataTable
          value={Userdata}
          sortMode="multiple"
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column
            field="TaskName"
            header="Task name"
            //   expander
            sortable
            //   style={TaskCellStyle}
            //   body={(obj: any) => _addTextField(obj, "TaskName")}
          />
          <Column
            field="parentTasKName"
            header="parent TasKName"
            //   expander
            sortable
            //   style={TaskCellStyle}
            //   body={(obj: any) => _addTextField(obj, "TaskName")}
          />
          <Column
            field="DueDate"
            header="Due date"
            sortable
            //   style={cellStyle}
            //   body={(obj: any) => _addTextField(obj, "DueDate")}
          />

          <Column
            field="PriorityLevel"
            header=" Priority level"
            sortable
            //   style={cellStyle}
            //   body={(obj: any) => _addTextField(obj, "PriorityLevel")}
          />
          <Column
            field="Status"
            header="Status"
            sortable
            //   style={cellStyle}
            //   body={(obj: any) => _addTextField(obj, "Status")}
          />

          {/* <Column
                  header="Action"
                  style={{ width: "200px" }}
                  body={(obj) => _action(obj)}
                ></Column>
            */}
        </DataTable>
      )}
    </div>
  );
};
export default CompleteDashboard;
