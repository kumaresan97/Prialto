import * as React from "react";
import { useState, useEffect } from "react";
import { Label } from "@fluentui/react";
import SPServices from "../../../Global/SPServices";
import { sp } from "@pnp/sp/presets/all";
import MyTaskDataCategory from "./MyTaskDataCategory";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import styles from "./MyTasks.module.scss";
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Avatar } from "primereact/avatar";
import Loader from "./Loader";
import { Toast } from "primereact/toast";
import exportToExcel from "../../../Global/ExportExcel";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import * as moment from "moment";
import { Check } from "office-ui-fabric-react";

let MyClients = [];
let MyCategories = [];
let MainTask = [];
let MainArray = [];
let SubTask = [];
let statusChoices = [];

/*For automation */
let automationTasks = [];
let selectedTasks=[];
/* For automation */


export default function MyTaskDBNewCategory(props) {
  const UserEmail = !props.Email
    ? props.context.pageContext.user.email
    : props.Email;
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  
  const [curMyTask, setCurMyTask] = useState<any[]>([]);
  const [masterdata, setMasterdata] = useState<any[]>([]);
  const [clientdata, setClientdata] = useState<any[]>([]);

  const toastTopRight = React.useRef(null);
  const [teamCaptainData, setTeamCaptainData] = useState({
    EMail: "",
    Title: "",
  });
  const [teamTLData, setTeamTLData] = useState({ EMail: "", Title: "" });
  const [curuserId, setCuruserId] = useState({
    Id: null,
    EMail: "",
    Title: "",
  });
  const [configure, setConfigure] = useState({
    backupId: null,
    EMail: "",
    Title: "",
  });
  const [isCatDialog, setIsCatDialog] = useState(false);

  /*For automation */
  const [isAutomate, setIsautomate] = useState(false);
  const [days, setDays] = useState(0);
  /*For automation */


  const errFunction = (err) => {
    console.log(err);
    setLoader(false);
    BindData();
    showMessage(
      "Something went wrong, Please contact system admin",
      toastTopRight,
      "error"
    );
  };

  function getStatus() {
    statusChoices = [];
    SPServices.SPGetChoices({
      Listname: "Tasks",
      FieldName: "Status",
    })
      .then(function (data) {
        console.log(data["Choices"]);
        for (let i = 0; i < data["Choices"].length; i++) {
          statusChoices.push({
            name: data["Choices"][i],
            code: data["Choices"][i],
          });
        }
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  //getcuruser
  const getcurUser = () => {
    if (UserEmail) {
      let user = sp.web.siteUsers
        .getByEmail(UserEmail)
        .get()
        .then((res) => {
          console.log(UserEmail);
          let crntUserDetails = {
            Id: res.Id,
            EMail: res.Email,
            Title: res.Title,
          };

          let crntUserBackup = {
            backupId: null,
            EMail: "",
            Title: "",
          };

          SPServices.SPReadItems({
            Listname: "Configuration",
            Select:
              "*,Name/EMail,Name/Title ,Name/ID ,TeamCaptain/EMail,TeamCaptain/Title,TeamLeader/EMail,TeamLeader/Title ,BackingUp/Title,BackingUp/EMail,BackingUp/ID",
            Expand: "BackingUp ,Name,TeamCaptain,TeamLeader",
            Filter: [
              {
                FilterKey: "Name/ID",
                FilterValue: res.Id.toString(),
                Operator: "eq",
              },
            ],
          })
            .then((res: any) => {
              let x = {
                backupId: null,
                EMail: "",
                Title: "",
              };
              let TCData = {
                EMail: "",
                Title: "",
              };
              let TLData = {
                EMail: "",
                Title: "",
              };
              res.forEach((val) => {
                x.EMail = val.BackingUp ? val.BackingUp[0].EMail : "";
                x.backupId = val.BackingUp ? val.BackingUp[0].ID : "";
                x.Title = val.BackingUp ? val.BackingUp[0].Title : "";
                TCData.EMail = val.TeamCaptain ? val.TeamCaptain.EMail : "N/A";
                TCData.Title = val.TeamCaptain ? val.TeamCaptain.Title : "N/A";

                TLData.EMail = val.TeamLeader ? val.TeamLeader.EMail : "N/A";
                TLData.Title = val.TeamLeader ? val.TeamLeader.Title : "N/A";
              });
              crntUserBackup = x;
              setTeamTLData({ ...TLData });
              setTeamCaptainData({ ...TCData });
              setCuruserId({ ...crntUserDetails });
              setConfigure({ ...x });
            })
            .catch((err) => errFunction(err));
          getCategories(res.Id);
        })
        .catch((err) => errFunction(err));
    } else {
      BindData();
    }
  };

  function getCategories(id) {
    SPServices.SPReadItems({
      Listname: "Categories",
      Select: "*, UserName/ID, UserName/EMail, UserName/Title",

      Expand: "UserName",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "UserName/ID",
          Operator: "eq",
          FilterValue: id,
        },
      ],
    })
      .then(function (data: any) {
        for (let i = 0; i < data.length; i++) {
          MyCategories.push({ ID: data[i].ID, Name: data[i].Title });
        }
        if (data.length > 0) getMyClients(id);
        else BindData();
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  function getMyClients(id) {
    SPServices.SPReadItems({
      Listname: "ClientDetails",
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
      FilterCondition: "and",
    })
      .then((res) => {
        MyClients = [];
        res.forEach((val: any) => {
          MyClients.push({ ID: val.ID, Name: val.FirstName });
        });
        getMainTask(id);
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  //getmaintask
  const getMainTask = (id) => {
    let Filter = [
      {
        FilterKey: "Assistant/ID",
        Operator: "eq",
        FilterValue: id,
      },
    ];
    SPServices.SPReadItems({
      Listname: "Tasks",
      Select:
        "*, Assistant/ID, Assistant/EMail, Assistant/Title, Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title,Client/ID,Client/FirstName,Category/ID",

      Expand: "Assistant,Backup,Author,Client,Category",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: Filter,
      FilterCondition: "and",
    })
      .then((res) => {
        MainTask = [];
        res.forEach((val: any, index) => {
          if (!val.ClientId) {
            console.log(val.Id);
            MainTask.push({
              key: val.Id,
              Id: val.Id,
              Index: index,
              isParent: true,
              isClick: false,
              isAdd: false,
              isEdit: false,

              data: {
                TaskName: val.TaskName,
                ClientName: val.ClientId ? val.Client.FirstName : "",
                ClientID: val.ClientId ? val.Client.ID : "",
                CategoryID: val.CategoryId ? val.Category.ID : "",
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
                ReminderRef:val.ReminderRef,
                ReminderDays:val.ReminderDays,
                PriorityLevel: val.PriorityLevel,
                Status: val.Status,
                TaskAge: val.TaskAge ? val.TaskAge : null,
                CompletedDate: val.CompletedDate
                  ? SPServices.displayDate(val.CompletedDate)
                  : null,
                DoneFormula: val.DoneFormula ? val.DoneFormula : "",
                DaysOnEarly: val.DaysOnEarly ? val.DaysOnEarly : null,
                Created:
                  val.Author?.Title + " " + SPServices.displayDate(val.Created),

                // Created:
                //   SPServices.displayDate(val.Created) + " " + val.Author.Title,
              },
              children: [],
            });
          }
        });

        let arrFilter = [];
        for (let i = 0; i < MainTask.length; i++) {
          arrFilter.push({
            FilterKey: "MainTaskID/ID",
            FilterValue: MainTask[i].Id.toString(),
            Operator: "eq",
          });
        }
        if (arrFilter.length > 0) {
          getsubTask(arrFilter);
        } else {
          MainArray = [...MainTask];
          BindData();
        }
      })
      .catch((err) => {
        errFunction(err);
      });
  };

  //getsubtask
  const getsubTask = (FilterValue) => {
    MainArray = [];
    SPServices.SPReadItems({
      Listname: "SubTasks",
      Select:
        "*,  Backup/ID, Backup/EMail, Backup/Title, Author/ID, Author/EMail, Author/Title, MainTaskID/ID",
      Expand: "MainTaskID, Backup, Author",
      Orderby: "Created",
      Orderbydecorasc: false,
      Filter: FilterValue,
      FilterCondition: "or",
      Topcount: 5000,
    })
      .then((response) => {
        let count = 0;
        for (let i = 0; i < MainTask.length; i++) {
          /* Start Of Subtaks */
          SubTask = [];
          var res = response.filter(function (data: any) {
            return data.MainTaskID.ID == MainTask[i].Id;
          });
          res.forEach((val: any, index) => {
            val.ClientName == null &&
              SubTask.push({
                key: `${MainTask[i].Id}-${index + 1}`,
                Index: index,
                Id: val.Id,
                subId: MainTask[i].Id,
                isClick: false,
                isParent: false,
                isAdd: false,
                isEdit: false,
                data: {
                  TaskName: val.TaskName,
                  ClientName: MainTask[i].data.ClientName,
                  ClientID: MainTask[i].data.ClientID,
                  CategoryID:MainTask[i].data.CategoryID,
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
                  ReminderRef:val.ReminderRef,
                  ReminderDays:val.ReminderDays,
                  PriorityLevel: val.PriorityLevel,
                  Status: val.Status,

                  TaskAge: val.TaskAge ? val.TaskAge : null,
                  CompletedDate: val.CompletedDate
                    ? SPServices.displayDate(val.CompletedDate)
                    : null,
                  DoneFormula: val.DoneFormula ? val.DoneFormula : "",
                  DaysOnEarly: val.DaysOnEarly ? val.DaysOnEarly : null,
                  Created:
                    val.Author.Title +
                    " " +
                    SPServices.displayDate(val.Created),
                },
              });
          });

          MainArray.push({
            ...MainTask[i],
            children: SubTask,
          });
          count++;

          if (count === MainTask.length) {
            BindData();
          }
          /* End Of Subtaks */
        }
      })
      .catch((err) => {
        errFunction(err);
      });
  };

  function BindData() {
    let tempClient = [];
    for (let i = 0; i < MyCategories.length; i++) {
      tempClient.push({
        Title: MyCategories[i].Name,
        ID: MyCategories[i].ID,
        Tasks: [],
      });
      for (let j = 0; j < MainArray.length; j++) {
        if (MainArray[j].data.CategoryID == MyCategories[i].ID)
          tempClient[i].Tasks.push(MainArray[j]);
      }
    }
    setCurMyTask([...MainArray]);
    setMasterdata([...MainArray]);
    setClientdata([...tempClient]);
    setLoader(false);
  }

  const SearchFilter = (e) => {
    setSearch(e);

    // let filteredResults = masterdata.filter((item) => {
    //   if (item.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())) {
    //     return true;
    //   }

    //   const childMatches = item.children.filter((child) =>
    //     child.data.TaskName.toLowerCase().includes(e.trim().toLowerCase())
    //   );

    //   if (childMatches.length > 0) {
    //     return true;
    //   }

    //   return false;
    // });

    // setCurMyTask([...filteredResults]);
  };

  let columns = [
    { header: "Task Name", key: "TaskName", width: 15 },
    { header: "Parent Task Name", key: "ParenTask", width: 15 },
    { header: "Creator", key: "Creator", width: 25 },
    { header: "Backup", key: "Backup", width: 25 },
    { header: "DueDate", key: "DueDate", width: 25 },
    { header: "Task Age", key: "TaskAge", width: 25 },
    { header: "Completed Date", key: "CompletedDate", width: 25 },
    { header: "Done Formula", key: "DoneFormula", width: 25 },
    { header: "Days OnEarly", key: "DaysOnEarly", width: 25 },

    { header: "Priority Level", key: "PriorityLevel", width: 25 },
    { header: "Status", key: "Status", width: 25 },
    { header: "Creation log", key: "Created", width: 25 },
  ];

  const exportData = () => {
    exportToExcel(curMyTask, columns, "MyTask");
  };

  function onSpinner() {
    //setLoader(true);
  }

  function offSpinner() {
    //setLoader(false);
  }

  function addCategory(value) {
    setLoader(true);
    SPServices.SPAddItem({
      Listname: "Categories",
      RequestJSON: {
        Title: value,
        UserNameId: curuserId.Id,
      },
    })
      .then(function (res) {
        MyCategories.push({ ID: res.data.ID, Name: value });
        let tempClient = [...clientdata];
        tempClient.push({
          Title: value,
          ID: res.data.ID,
          Tasks: [],
        });
        setClientdata([...tempClient]);
        setCategoryValue("");
        setIsCatDialog(false);
        setLoader(false);
      })
      .catch(function (error) {
        errFunction(error);
      });
  }

  function validation() {
    let isAllValueFilled = true;
    if (!categoryValue) {
      isAllValueFilled = false;
    }
    return isAllValueFilled;
  }

  const showMessage = (event, ref, severity) => {
    const label = event;

    ref.current.show({
      severity: severity,
      summary: label,
      // detail: label,
      life: 3000,
    });
  };


  /* Start for automate single */

  
  const onselect = (event) => 
  {
    if(event.node.isParent)
    {
      selectedTasks.push({data:event.node,Id:event.node.Id,subId:"",isSelected:true,isParent:true,categoryID:event.node.data.CategoryID});
      
      for(let i=0;i<event.node.children.length;i++)
      {
        selectedTasks.push({data:event.node.children[i],Id:event.node.children[i].Id,subId:event.node.Id,isSelected:true,isParent:false,categoryID:event.node.data.CategoryID});
      }
    }
    else
    {
      selectedTasks.push({data:event.node,Id:event.node.Id,subId:event.node.subId,isSelected:true,isParent:false,categoryID:event.node.data.CategoryID});
    }
  };

  const unselect = (event) => 
  {
    
    if(event.node.isParent)
    {
       
          for(let i=0;i<selectedTasks.length;i++)
          {
              if(selectedTasks[i].Id==event.node.Id)
              {
                selectedTasks[i].isSelected=false;
              }
          }

          for(let i=0;i<selectedTasks.length;i++)
          {
              if(selectedTasks[i].subId==event.node.Id)
              {
                selectedTasks[i].isSelected=false;
              }
          }
        
    }
    else
    {
        for(let i=0;i<selectedTasks.length;i++)
        {
            if(selectedTasks[i].Id==event.node.Id)
            {
              selectedTasks[i].isSelected=false;
            }
        }
    }

    let crntSelectedTasks=selectedTasks.filter((item)=>{
      return item.isSelected==true;
    });
    selectedTasks=[...crntSelectedTasks];
  };

  function checkAutomate()
  { 
    setIsautomate(true);
    setDays(selectedTasks[0].data.data.ReminderDays);
  }

  function prepareAutomationData() {
    automationTasks = [];
    let noOfDays = days;
    let tempClientNew=[...clientdata];

    for(let i=0;i<selectedTasks.length;i++)
    {
      if(selectedTasks[i].isParent)
      {
        automationTasks.push({
          Title: "Reminder",
          TaskIDId: selectedTasks[i].data.Id,
          SubTaskIDId: null,
          Before: days,
          //Status: selectedTasks[i].data.data.Status,
          NotifyDate: moment(selectedTasks[i].data.data.DueDate)
            .subtract(noOfDays, "days")
            .format("YYYY-MM-DD"),
        });
      }
      else
      {
        automationTasks.push({
          Title: "Reminder",
          TaskIDId: null,
          SubTaskIDId: selectedTasks[i].data.Id,
          Before: days,
          //Status: selectedTasks[i].data.data.Status,
          NotifyDate: moment(selectedTasks[i].data.data.DueDate)
            .subtract(noOfDays, "days")
            .format("YYYY-MM-DD"),
        });
      }
    }

    for(let i=0;i<selectedTasks.length;i++)
    {
      let categoryIndex = tempClientNew.findIndex((val) => val.ID == selectedTasks[i].categoryID);
      if(selectedTasks[i].isParent)
      {
        if(categoryIndex>=0)
        {
        let taskIndex=tempClientNew[categoryIndex].Tasks.findIndex((item)=>{
          return item.key==selectedTasks[i].data.Id
        })
        tempClientNew[categoryIndex].Tasks[taskIndex].data.ReminderDays = noOfDays;
        }
      }
      else
      {
        for(let i=0;i<tempClientNew[categoryIndex].Tasks.length;i++)
          {
            for(let j=0;j<tempClientNew[categoryIndex].Tasks[i].children.length;j++)
            {
                if(tempClientNew[categoryIndex].Tasks[i].children[j].Id==selectedTasks[i].data.Id)
                {
                  tempClientNew[categoryIndex].Tasks[i].children[j].data.ReminderDays=noOfDays;
                }
            }
          }
      }
    }

    insertReminderNew([...automationTasks]);
    selectedTasks=[];
    setClientdata([...tempClientNew]); 
  }


  /* for the multiple automation */

  function insertReminderNew(TasksDetails)
  {
    let tasksListData=TasksDetails.filter((data)=>{
      return data.TaskIDId!=null
    });

    let subTasksListData=TasksDetails.filter((data)=>{
      return data.SubTaskIDId!=null
    });

    const batch = sp.web.createBatch();
    
    let list = sp.web.lists.getByTitle('Tasks');
    tasksListData.forEach(item => 
      {
        list.items.getById(item.TaskIDId).inBatch(batch).update({
          ReminderDays:item.Before,
          NotifyDate:item.NotifyDate
        });
      });
    batch.execute().then(() => {
      console.log('All done in Batch 1!');
    }).catch((error)=>{
      console.log('Error in Batch 1!');
      errFunction(error);
    });


    const batch2 = sp.web.createBatch();
    let list2 = sp.web.lists.getByTitle('SubTasks');
    subTasksListData.forEach((item) => 
      {
        list2.items.getById(item.SubTaskIDId).inBatch(batch2).update({
          ReminderDays:item.Before,
          NotifyDate:item.NotifyDate
        });
      });

    batch2.execute().then(() => {
      console.log('All done in Batch 2!');
    }).catch((error)=>{
      console.log('Error in Batch 2!');
      errFunction(error);
    });


    const batch3 = sp.web.createBatch();
    let list3 = sp.web.lists.getByTitle('Reminder');
    TasksDetails.forEach((item:any) =>  
      {
        list3.items.inBatch(batch3).add(item);
      });

      batch3.execute().then(() => {
      console.log('All done in Batch 3!');
      setLoader(false);
        setIsautomate(false);
        setDays(0);
        showMessage(
          "Reminder Added Successfully",
          toastTopRight,
          "success"
        );
    }).catch((error)=>{
      console.log('Error in Batch 3!');
      errFunction(error);
    });
  }
  /* for the multiple automation */

  function insertReminder(TasksDetails) {
    SPServices.SPAddItem({
      Listname: "Reminder",
      RequestJSON: TasksDetails[0],
    })
      .then(function (data) {
        addRemainderInTask(TasksDetails,data.data.ID);
      })
      .catch(function (error) {
        setIsautomate(false);
        errFunction(error);
      });
  }

  function addRemainderInTask(TasksDetails,reminderID)
  {
    let ListID=TasksDetails[0].TaskIDId?TasksDetails[0].TaskIDId:TasksDetails[0].SubTaskIDId;
    let ListName=TasksDetails[0].TaskIDId?"Tasks":"SubTasks";
    let isParent=TasksDetails[0].TaskIDId?true:false;
    let notifyDate=TasksDetails[0].NotifyDate;
    let reminderDays=TasksDetails[0].Before;

    SPServices.SPUpdateItem({
      Listname: ListName,
      ID:ListID,
      RequestJSON: {
        ReminderRef:reminderID,
        ReminderDays:reminderDays,
        NotifyDate:notifyDate
      },
    })
      .then(function (data) {
        updateDataAfterReminderAdded(selectedTasks[0].data.data.CategoryID,ListID,isParent,reminderDays);
        setLoader(false);
        setIsautomate(false);
        setDays(0);
        showMessage(
          "Reminder Added Successfully",
          toastTopRight,
          "success"
        );
      })
      .catch(function (error) {
        setIsautomate(false);
        errFunction(error);
      });
  }

  function updateDataAfterReminderAdded(categryId,TaskID,isParent,newdays)
  {
    let tempClientNew = [...clientdata];
    let categoryIndex = tempClientNew.findIndex((val) => val.ID == categryId);
    if (categoryIndex < 0) {
      console.log("Category not found");
    } else 
    {
      let taskIndex="";
      if(isParent){
        taskIndex=tempClientNew[categoryIndex].Tasks.findIndex((item)=>{
          return item.key==TaskID
        })
        tempClientNew[categoryIndex].Tasks[taskIndex].data.ReminderDays = newdays;
      }
      else
      {
          for(let i=0;i<tempClientNew[categoryIndex].Tasks.length;i++)
          {
            for(let j=0;j<tempClientNew[categoryIndex].Tasks[i].children.length;j++)
            {
                if(tempClientNew[categoryIndex].Tasks[i].children[j].Id==TaskID)
                {
                  tempClientNew[categoryIndex].Tasks[i].children[j].data.ReminderDays=newdays;
                }
            }
          }
      }
    }
    selectedTasks=[];
    setClientdata([...tempClientNew]);
  }

  /*End for automate single */

  function updateCategory(categryValue, categryId) {
    let tempClientNew = [...clientdata];
    let categoryIndex = tempClientNew.findIndex((val) => val.ID == categryId);
    let arrIndex = MyCategories.findIndex((val) => val.ID == categryId);
    if (arrIndex < 0) {
      console.log("Category not found");
    } else {
      tempClientNew[categoryIndex].Title = categryValue;
      MyCategories[arrIndex].Name = categryValue;
    }
    setClientdata([...tempClientNew]);
  }

  function updateDataFromChildComponent(categryId,Tasks)
  {
    let tempClientNew = [...clientdata];
    let categoryIndex = tempClientNew.findIndex((val) => val.ID == categryId);
    if (categoryIndex < 0) {
      console.log("Category not found");
    } else {
      tempClientNew[categoryIndex].Tasks = Tasks;
    }
    setClientdata([...tempClientNew]);
  }

  useEffect(() => {
    setLoader(true);
    MyClients = [];
    MyCategories = [];
    MainTask = [];
    MainArray = [];
    SubTask = [];
    statusChoices = [];
    getStatus();
    getcurUser();
  }, [props.Email]);

  let BeforeData =
    selectedTasks.length > 0
      ? moment(selectedTasks[0].data.data.DueDate).format("MM/DD/YYYY")
      :"";

  let strTaskName= selectedTasks.length > 0
  ? selectedTasks[0].data.data.TaskName
  :"";

  return (
    <>
      <Dialog
        header="Header"
        style={{ width: "420px" }}
        visible={isCatDialog}
        onHide={() => setIsCatDialog(false)}
      >
        <div className={styles.addCatSection}>
          <Label>Add New Category</Label>
          <div>
            <InputText
              style={{ width: "100%" }}
              value={categoryValue}
              onChange={(e: any) => setCategoryValue(e.target.value)}
            />
          </div>
          <div className={styles.catDialogBtnSection}>
            <Button
              className={styles.btnColor}
              onClick={() => {
                if (validation()) addCategory(categoryValue);
                else
                  showMessage(
                    "Please enter valid Category",
                    toastTopRight,
                    "warn"
                  );
              }}
              label="Add"
            />
            <Button
              className={styles.btnColor}
              onClick={() => {
                setCategoryValue("");
                setIsCatDialog(false);
              }}
              label="Cancel"
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Header"
        position="top"
        style={{ width: "420px" }}
        visible={isAutomate}
        onHide={() => setIsautomate(false)}
      >
        <div className={styles.addCatSection}>
          <Label className={styles.Automatelabel}>Automate</Label>

          {/* <div
            style={{
              display: "flex",
              gap: "20px",
              margin: "10px 0px 20px 0px",
            }}
            className={styles.Automatebutton}
          >
            <Button
              className={
                automate.notification
                  ? styles.Activebutton
                  : styles.inActivebutton
              }
              onClick={() => {
                (automate.notification = true),
                  (automate.recurringtask = false);
                setautomate({ ...automate });
              }}
            >
              Notification
            </Button>
            <Button
              className={
                automate.recurringtask
                  ? styles.Activebutton
                  : styles.inActivebutton
              }
              onClick={() => {
                (automate.notification = false),
                  (automate.recurringtask = true);
                setautomate({ ...automate });
              }}
            >
              Recurring Task
            </Button> 
          </div> */}
          {/* {automate.notification && ( */}
          <>
            <div style={{ display: "flex", gap: "10px", margin: "10px 0px" }}>
              <div
                // style={{ display: "flex", gap: "5px" }}
                className={styles.NotifyContainer}
              >
                <Label>Notify</Label>{" "}
                <Label className={styles.ProjectName} title={"ProjectName"}>
                  {strTaskName}
                </Label>
                <InputNumber
                  // style={{ width: "10%" }}
                  value={days}
                  onChange={(e: any) => setDays(e.value)}
                />
              </div>
              <Label className={styles.ProjectName} title={"ProjectName"}>
                  days
                </Label>
              <div style={{ display: "flex", gap: "5px" }}>
                <Label>Before </Label>
                <Label>{BeforeData}</Label>
              </div>
            </div>
          </>
          {/* )} */}
          {/* {automate.recurringtask && (
            <>
              <div style={{ display: "flex", gap: "5px" }}>
                <Label>Create this task when status changed to </Label>
                <InputText
                  style={{ width: "33%" }}
                  value={categoryValue}
                  onChange={(e: any) => setCategoryValue(e.target.value)}
                />
              </div>
            </>
          )} */}

          <div className={styles.catDialogBtnSection}>
            <Button
              className={styles.cancelBtn}
              onClick={() => {
                setCategoryValue("");
                setIsautomate(false);
              }}
              // onClick={() => {
              //   if (validation()) UpdateCategory(categoryValue, categoryId);
              //   else
              //     showMessage(
              //       "Please enter valid Category",
              //       toastTopRight,
              //       "warn"
              //     );
              // }}
              label="Cancel"
            />
            <Button
              className={styles.Submitbtn}
              label="Submit"
              onClick={() => {
                setLoader(true);
                setIsautomate(false);
                prepareAutomationData();
              }}
            />
          </div>
        </div>
      </Dialog>

      {loader ? (
        <Loader />
      ) : (
        <>
          <div className={styles.commonFilterSection}>
            <div>
              <Label className={styles.leftFilterSection}></Label>
              <>
                <div>
                  <Toast ref={toastTopRight} position="top-right" />
                </div>
              </>
            </div>
            <div className={styles.rightFilterSection}>
              <div>
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    placeholder="Search"
                    className="searchFilter"
                    value={search}
                    onChange={(e: any) => SearchFilter(e.target.value)}
                  />
                </span>
              </div>

              <Button
                className={styles.btnColor}
                label="Export"
                onClick={() => exportData()}
                icon="pi pi-file-excel"
              />
              <Button
                className={styles.btnColor}
                label="Automate"
                onClick={() => {
                  if (selectedTasks.length > 0) {
                    
                    checkAutomate();
                  } else {
                    showMessage(
                      "Please select any record to automate",
                      toastTopRight,
                      "warn"
                    );
                  }
                }}
              />
              <Button
                className={styles.btnColor}
                label="Add Category"
                onClick={() => {
                  setIsCatDialog(true);
                }}
              />
            </div>
          </div>
          <>
            {clientdata.length > 0 ? (
              <>
                {clientdata.map((val, i) => {
                  return (
                    <>
                      <MyTaskDataCategory
                        bind={false}
                        clientName={""}
                        clientId={""}
                        categoryName={val.Title}
                        categoryId={val.ID}
                        searchValue={search}
                        onspinner={onSpinner}
                        offspinner={offSpinner}
                        onselect={onselect}
                        unselect={unselect}
                        context={props.context}
                        mainData={val.Tasks}
                        updateCategory={updateCategory}
                        updateDataFromChildComponent={updateDataFromChildComponent}
                        crntUserData={curuserId}
                        crntBackData={configure}
                        choices={statusChoices}
                      />
                    </>
                  );
                })}
              </>
            ) : (
              <>
                <MyTaskDataCategory
                  bind={false}
                  clientName={""}
                  clientId={""}
                  categoryName={""}
                  categoryId={""}
                  searchValue={""}
                  onspinner={onSpinner}
                  offspinner={offSpinner}
                  context={props.context}
                  mainData={curMyTask}
                  crntUserData={curuserId}
                  crntBackData={configure}
                  choices={statusChoices}
                />
              </>
            )}
          </>
        </>
      )}
    </>
  );
}
