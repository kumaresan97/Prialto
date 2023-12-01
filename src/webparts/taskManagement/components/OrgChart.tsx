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
const OrgChart = () => {
  let products = [
    {
      Id: 1,
      FirstName: "1000",
      LastName: "f230fh0g3",
      Role: "BamboWatch",
      Manager: {
        Id: null,
        EMail: "",
        Title: "Kumaresan",
      },
      Team: "Backup",
      TeamCaptain: {
        Id: null,
        EMail: "",
        Title: "raj",
      },
      TeamLeader: {
        Id: null,
        EMail: "",
        Title: "raj",
      },
      Cohort: "",
      Country: "",
      DirectReports: {
        Id: null,
        EMail: "",
        Title: "raj",
      },
      BackingUp: {
        Id: null,
        EMail: "",
        Title: "raj",
      },
    },
  ];
  return (
    <div>
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
              // setisEdit(false);
              // setisAdd(true);
              // setClientdetail([...clientdetail, x]);
              // _handleData("addParent", { ..._sampleParent });
            }}
          />
        </div>
        <DataTable
          value={products}
          sortMode="multiple"
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column
            field="FirstName"
            header="First Name"
            sortable
            // body={(obj: any) => _addTextField(obj, "FirstName")}
          ></Column>
          <Column
            field="LastName"
            header="last Name"
            sortable
            // body={(obj: any) => _addTextField(obj, "LastName")}
          ></Column>
          <Column
            field="Role"
            header="Company Name"
            sortable
            // body={(obj: any) => _addTextField(obj, "CompanyName")}
          ></Column>
          <Column
            field="Manager"
            header="Manager"
            sortable
            // body={(obj: any) => _addTextField(obj, "Assistant")}
          ></Column>
          <Column
            field="Team"
            header="Team"
            sortable
            // body={(obj: any) => _addTextField(obj, "Backup")}
          ></Column>

          <Column
            field="TeamCaptain"
            header="Team Captain"
            sortable
            // body={(obj: any) => _addTextField(obj, "Backup")}
          ></Column>
          <Column
            field="TeamLeader"
            header="Team Leader"
            sortable
            // body={(obj: any) => _addTextField(obj, "Backup")}
          ></Column>
          <Column
            field="Cohort"
            header="Cohort"
            sortable
            // body={(obj: any) => _addTextField(obj, "Backup")}
          ></Column>
          <Column
            field="Country"
            header="Country"
            sortable
            // body={(obj: any) => _addTextField(obj, "Backup")}
          ></Column>
          <Column
            field="DirectReports"
            header="Direct Reports"
            sortable
            // body={(obj: any) => _addTextField(obj, "Backup")}
          ></Column>
          <Column
            field="BackingUp"
            header="Backing Up"
            sortable
            // body={(obj: any) => _addTextField(obj, "Backup")}
          ></Column>
          <Column
            header="Action"
            // body={(obj) => _action(obj)}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};
export default OrgChart;
