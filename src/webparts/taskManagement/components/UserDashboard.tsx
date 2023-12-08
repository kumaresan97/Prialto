import * as React from "react";
import { useState, useEffect } from "react";
import { Label } from "@fluentui/react";
import SPServices from "../../../Global/SPServices";
import { sp } from "@pnp/sp/presets/all";
import UserClientDB from "./UserClientDB";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import styles from "./MyTasks.module.scss";
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Avatar } from "primereact/avatar";
import Loader from "./Loader";
import UserTasks from "./UserTasks";
import UserBackUpTasksNew from "./UserBackUpTasksNew";
import UserClients from "./UserClient";

export default function UserDashboard(props) 
{
  const UserEmail = !props.Email? props.context.pageContext.user.email
    : props.Email;

  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [bind,setBind]= useState(false);
  const [teamCaptainData, setTeamCaptainData] = useState({ EMail: "",Title: "",});
  const [teamTLData, setTeamTLData] = useState({ EMail: "",Title: ""});
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
  const[user,setUser]=useState("");
  const[backUpUser,setBackUpUser]=useState("");

  const errFunction = (err) => {
    setLoader(false);
    console.log(err);
  };

  //getcuruser
  const getcurUser = () => {
    if(UserEmail){
    let user = sp.web.siteUsers
      .getByEmail(UserEmail)
      .get()
      .then((res) => {
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
            let TCData={
              EMail: "",
              Title: "",
            }
            let TLData={
              EMail: "",
              Title: "",
            }
            res.forEach((val) => 
            {
              x.EMail = val.BackingUp?val.BackingUp[0].EMail:"";
              x.backupId = val.BackingUp?val.BackingUp[0].ID:"";
              x.Title = val.BackingUp?val.BackingUp[0].Title:"";
              TCData.EMail=val.TeamCaptain?val.TeamCaptain.EMail:"N/A";
              TCData.Title=val.TeamCaptain?val.TeamCaptain.Title:"N/A";

              TLData.EMail=val.TeamLeader?val.TeamLeader.EMail:"N/A";
              TLData.Title=val.TeamLeader?val.TeamLeader.Title:"N/A";
            });
            crntUserBackup = x;
            setTeamTLData({...TLData});
            setTeamCaptainData({...TCData});
            setCuruserId({ ...crntUserDetails });
            setConfigure({ ...x });
            //setLoader(false);
          })
          .catch((err) => errFunction(err));
          getBackupUser(res.Id)
      });
    }
    else
    {
        setLoader(false);
    }
      
  };

  function getBackupUser(UserID)
  {
    SPServices.SPReadItems({
        Listname: "Configuration",
        Select:
          "*,Name/EMail,Name/Title ,Name/ID ,TeamCaptain/EMail,TeamCaptain/Title,TeamLeader/EMail,TeamLeader/Title ,BackingUp/Title,BackingUp/EMail,BackingUp/ID",
        Expand: "BackingUp ,Name,TeamCaptain,TeamLeader",
        Filter: [
          {
            FilterKey: "BackingUp/ID",
            FilterValue: UserID.toString(),
            Operator: "eq",
          },
        ],
      }).then(function(data:any)
      {
        let backUpUserEmail="";    
        if(data.length>0)
            {
                backUpUserEmail=data[0].Name?data[0].Name.EMail:"";
                setUser(UserEmail)
                setBackUpUser(backUpUserEmail);
            }
            else
            {
                setUser(UserEmail)
                setBackUpUser(backUpUserEmail);
            }
            setLoader(false);
      }).catch(function(error){
        errFunction(error);
      })
  }

  function SearchFilter(e)
  {
      setSearch(e);
  }

  useEffect(() => {
    setLoader(true);
    getcurUser();
  }, [props.Email]);

  return (
    <>
      {loader?<Loader />:
      (<>
      <div className={styles.commonFilterSection}>
        <div>
          <Label className={styles.leftFilterSection}>
           {curuserId.Title}
          </Label>
        </div>

        {/* <InputText
                  value={search}
                  onChange={(e: any) => SearchFilter(e.target.value)}
                /> */}
        <div className={styles.rightFilterSection}>
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
          <Button className={styles.btnColor} label="Automate" />
          <Button
            className={styles.btnColor}
            label="Export"
            icon="pi pi-file-excel"
          />
        </div>
      </div>
      <div className={styles.TLTCSection}>
        <div className={styles.TLImage}>
        <b>TL :</b>
        <div className={styles.avatarAndNameFlex}>
        <Avatar
        className={styles.avatar}
        image={`/_layouts/15/userphoto.aspx?size=S&username=${teamTLData.EMail}`}
          size="normal"
          shape="circle"
         // label={val.TeamCaptain[0].Title}
      />
      <span>{teamTLData.Title}</span>
      </div>
      </div>
      <div className={styles.TLImage}>
        <b>TC :</b>
        <div className={styles.avatarAndNameFlex}>
        <Avatar
        className={styles.avatar}
        image={`/_layouts/15/userphoto.aspx?size=S&username=${teamCaptainData.EMail}`}
          size="normal"
          shape="circle"
         // label={val.TeamCaptain[0].Title}
      />
      <span>{teamCaptainData.Title}</span>
      </div>
      </div>
      </div>
        <UserTasks searchValue={search} context={props.context} Email={user}/>
        {/* <UserBackUpTasks searchValue={search} context={props.context} Email={backUpUser}/> */}
        <UserBackUpTasksNew searchValue={search} context={props.context} Email={user}/>
      </>)}
    </>
  );
}
