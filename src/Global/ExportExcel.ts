import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as moment from "moment";

const exportToExcel = (data, headers, sheetName) => {
  return new Promise<void>((resolve, reject) => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set headers dynamically
    worksheet.columns = headers.map((header) => ({
      header: header.header,
      key: header.key,
      width: header.width || 15,
    }));

    const Colorchange = async (item, index, CellStatus, cellPrioritylevel) => {
      let x = item.Status || item.data.Status;
      let y = item.PriorityLevel || item.data.PriorityLevel;
      let statusBgColor = "";
      let statusColor = "";
      let priorityBgColor = "";
      let priorityColor = "";
      if (item.Status || item.data.Status) {
        if (item.Status === "Completed" || item.data.Status == "Completed") {
          statusBgColor = "bf4927";
          statusColor = "ffded5";
        } else if (item.Status === "Weekly" || item.data.Status == "Weekly") {
          statusBgColor = "bf4927";
          statusColor = "ffff";
        } else if (item.Status === "Daily" || item.data.Status == "Daily") {
          statusBgColor = "faa1f1";
          statusColor = "ffff";
        } else if (item.Status === "Monthly" || item.data.Status == "Monthly") {
          statusBgColor = "ff70cf";
          statusColor = "ffff";
        } else if (item.Status === "On-hold" || item.data.Status == "On-hold") {
          statusBgColor = "225091";
          statusColor = "ffff";
        }

        worksheet._rows[index + 1]._cells[CellStatus].fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusBgColor },
        };
        worksheet._rows[index + 1]._cells[CellStatus].font = {
          color: { argb: statusColor },
          name: "Arial",

          size: 10,
        };
      }

      if (item.PriorityLevel || item.data.PriorityLevel) {
        if (
          item.PriorityLevel === "High" ||
          item.data.PriorityLevel == "High"
        ) {
          priorityBgColor = "4bbd17";
          priorityColor = "f46906";
        } else if (
          item.PriorityLevel === "Urgent" ||
          item.data.PriorityLevel == "Urgent"
        ) {
          priorityBgColor = "ffded5";
          priorityColor = "bf4927";
        } else if (
          item.PriorityLevel == "Normal" ||
          item.data.PriorityLevel == "Normal"
        ) {
          priorityBgColor = "68a1bd";
          priorityColor = "#4b6164";
        }
        worksheet._rows[index + 1]._cells[cellPrioritylevel].fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: priorityBgColor },
        };
        worksheet._rows[index + 1]._cells[cellPrioritylevel].font = {
          color: { argb: priorityColor },
          name: "Arial",

          size: 10,
        };
      }
    };

    //   worksheet.getRow(index + 1).getCell(CellStatus).fill = {
    //     type: "pattern",
    //     pattern: "solid",
    //     fgColor: { argb: statusBgColor },
    //   };
    //   worksheet.getRow(index + 1).getCell(CellStatus).font = {
    //     color: { argb: statusColor },
    //     name: "Arial",
    //     size: 10,
    //   };

    //   worksheet.getRow(index + 1).getCell(cellPrioritylevel).fill = {
    //     type: "pattern",
    //     pattern: "solid",
    //     fgColor: { argb: priorityBgColor },
    //   };
    //   worksheet.getRow(index + 1).getCell(cellPrioritylevel).font = {
    //     color: { argb: priorityColor },
    //     name: "Arial",
    //     size: 10,
    //   };
    // };

    //  Header color change */
    const headerRows: string[] = [
      "A1",
      "B1",
      "C1",
      "D1",
      "E1",
      "F1",
      "G1",
      "H1",
      "I1",
      "J1",
      "K1",
      "L1",
      "M1",
      "N1",
      "O1",
    ];
    headerRows.map((key: any) => {
      worksheet.getCell(key).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "d6d6d6" },
      };
      worksheet.getCell(key).font = {
        // type: "pattern",
        // pattern: "solid",
        name: "Arial",

        size: 11,
        bold: true,
      };
    });

    if (sheetName == "OrgChart") {
      data.forEach((item, index) => {
        const oddRowFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "fce4d6" },
        };

        const evenRowFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" },
        };
        const rowFill = index % 2 === 0 ? evenRowFill : oddRowFill;

        worksheet.addRow({
          Name: item.Name?.Title,
          Role: item.Role,
          Team: item.Team,
          // Cohort: item.Cohort,
          Manager: item.Manager?.Title,
          // TeamCaptain: item.TeamCaptain?.Title,
          // TeamLeader: item.TeamLeader?.Title,
          DirectReports: item.DirectReports[0]?.Title,
          // BackingUp: item.BackingUp[0]?.Title,
        }).fill = rowFill;
      });
    } else if (sheetName == "Client") {
      data.forEach((item) => {
        worksheet.addRow({
          FirstName: item.FirstName,
          LastName: item?.LastName,
          CompanyName: item.CompanyName,
          Assistant: item.Assistant?.Title,
          // Backup: item.Backup?.Title,
        });
      });
    } else if (sheetName == "DoneDashboard") {
      data.forEach((item, index) => {
        worksheet.addRow({
          TaskName: item?.TaskName,
          ParenTaskName: item?.ParenTaskName,
          // Creator:item?.Creator.Title,
          // Backup: item?.Backup.Title,
          DueDate: item?.DueDate,
          PriorityLevel: item?.PriorityLevel,
          TaskAge: item?.TaskAge,
          NotifyDate: item?.NotifyDate,
          Status: item?.Status,
          CompletedDate: item ? item.CompletedDate : null,
          DaysOnEarly: item?.DaysOnEarly,
          DoneFormula: item?.DoneFormula,
          Created: item?.Created,
        }).font = {
          name: "Arial",
          size: 10,
        };

        const oddRowFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F3F3F3" },
        };

        const evenRowFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" },
        };
        Colorchange(item, index, 4, 3);

        // let statusBgColor = "";
        // let statusColor = "";
        // let priorityBgColor = "";
        // let priorityColor = "";
        // if (item.Status === "Completed") {
        //   statusBgColor = "bf4927";
        //   statusColor = "ffded5";
        // }
        // if (item.PriorityLevel === "High") {
        //   priorityBgColor = "ffd5b8";
        //   priorityColor = "f46906";
        // } else if (item.PriorityLevel === "Urgent") {
        //   priorityBgColor = "ffded5";
        //   priorityColor = "bf4927";
        // } else if (item.PriorityLevel == "Normal") {
        //   priorityBgColor = "#bbfcff";
        //   priorityColor = "#4b6164";
        // }
        // worksheet._rows[index + 1]._cells[3].fill = {
        //   type: "pattern",
        //   pattern: "solid",
        //   fgColor: { argb: priorityBgColor },
        // };
        // worksheet._rows[index + 1]._cells[3].font = {
        //   color: { argb: priorityColor },
        // };
        // worksheet._rows[index + 1]._cells[4].fill = {
        //   type: "pattern",
        //   pattern: "solid",
        //   fgColor: { argb: statusBgColor },
        // };
        // worksheet._rows[index + 1]._cells[4].font = {
        //   color: { argb: statusColor },
        // };
      });
    }
    //  else if (sheetName == "MyTask") {
    //   for (const parent of data) {
    //     worksheet.addRow({
    //       TaskName: parent.data?.TaskName,
    //       Creator: parent.data?.Creator.Title,
    //       Backup: parent.data?.Backup.Title,
    //       PriorityLevel: parent.data?.PriorityLevel,
    //       DueDate: parent.data?.DueDate,
    //       TaskAge: parent.data.TaskAge,
    //       CompletedDate: parent.data.CompletedDate,
    //       DoneFormula: parent.data.DoneFormula,
    //       DaysOnEarly: parent.data.DaysOnEarly,
    //       Status: parent.data?.Status,
    //       Created: parent.data?.Created,
    //     });
    //     //worksheet.addRow();
    //     // Add child data for each parent
    //     if (parent.children.length > 0) {
    //       for (const child of parent.children) {
    //         worksheet.addRow({
    //           TaskName: child.data?.TaskName,
    //           ParenTask: parent.data?.TaskName,
    //           Creator: child.data?.Creator.Title,
    //           Backup: child.data?.Backup.Title,
    //           PriorityLevel: child.data?.PriorityLevel,
    //           DueDate: child.data?.DueDate,
    //           TaskAge: child.data.TaskAge,
    //           CompletedDate: child.data.CompletedDate,
    //           DoneFormula: child.data.DoneFormula,
    //           DaysOnEarly: child.data.DaysOnEarly,
    //           Status: child.data?.Status,
    //           Created: child.data?.Created,
    //         });
    //       }
    //     } else {
    //       //worksheet.addRow({}); // Add an empty row
    //     }

    //     //worksheet.addRow(); // Empty row after each parent's children
    //   }
    // }
    else if (sheetName == "MyTask") {
      // data.forEach(async (item, index) => {
      for (let i = 0; i < data.length; i++) {
        const oddRowFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "fce4d6" },
        };

        const evenRowFill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" },
        };
        const rowFill = i % 2 === 0 ? evenRowFill : oddRowFill;
        const row = worksheet.addRow({
          TaskName: data[i].data?.TaskName,
          Creator: data[i].data?.Creator.Title,
          Backup: data[i].data?.Backup.Title,
          PriorityLevel: data[i].data?.PriorityLevel,
          DueDate: data[i].data?.DueDate,
          TaskAge: data[i].data.TaskAge,
          CompletedDate: data[i].data.CompletedDate,
          DoneFormula: data[i].data.DoneFormula,
          DaysOnEarly: data[i].data.DaysOnEarly,
          Status: data[i].data?.Status,
          Created: data[i].data?.Created,
        });
        row.fill = rowFill;

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = {
            name: "Arial",
            size: 10,
          };
        });

        Colorchange(data[i], i, 10, 9);

        //worksheet.addRow();
        // Add child data for each item
        if (data[i].children.length > 0) {
          // item.children.forEach(async (child, index) => {
          // for (const child of item.children) {
          for (let j = 0; j < data[i].children.length; j++) {
            const oddRowFill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "fce4d6" },
            };

            const evenRowFill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFFF" }, // Set your desired even row color here (Hex color code)
            };
            const rowFill = j % 2 === 0 ? evenRowFill : oddRowFill;
            const childrow = worksheet.addRow({
              TaskName: data[i].children[j].data?.TaskName,
              ParenTask: data[i].data?.TaskName,
              Creator: data[i].children[j].data?.Creator.Title,
              Backup: data[i].children[j].data?.Backup.Title,
              PriorityLevel: data[i].children[j].data?.PriorityLevel,
              DueDate: data[i].children[j].data?.DueDate,
              TaskAge: data[i].children[j].data.TaskAge,
              CompletedDate: data[i].children[j].data.CompletedDate,
              DoneFormula: data[i].children[j].data.DoneFormula,
              DaysOnEarly: data[i].children[j].data.DaysOnEarly,
              Status: data[i].children[j].data?.Status,
              Created: data[i].children[j].data?.Created,
            });
            childrow.fill = rowFill;
            childrow.eachCell({ includeEmpty: true }, (cell) => {
              cell.font = {
                name: "Arial", // Font name
                size: 10, // Font size in points
              };
            });
            Colorchange(data[i].children[j], j, 10, 9);
          }
        } else {
          //worksheet.addRow({}); // Add an empty row
        }
      }

      //worksheet.addRow(); // Empty row after each parent's children
      // });
    } else if (sheetName == "ClientandBackup") {
      for (const parent of data[0].clientData) {
        worksheet.addRow({
          TaskName: parent.data?.TaskName,
          Creator: parent.data?.Creator.Title,
          Backup: parent.data?.Backup.Title,
          PriorityLevel: parent.data?.PriorityLevel,
          DueDate: parent.data?.DueDate,
          ClientName: parent.data?.ClientName,
          Status: parent.data?.Status,
          TaskAge: parent.data?.TaskAge,
          CompletedDate: parent.data?.CompletedDate,
          DoneFormula: parent.data?.DoneFormula,
          DaysOnEarly: parent.data?.DaysOnEarly,
          Created: parent.data?.Created,
          Category: "ClientTasks",
        });

        //worksheet.addRow();
        // Add child data for each parent
        if (parent.children?.length > 0) {
          for (const child of parent.children) {
            worksheet.addRow({
              TaskName: child.data?.TaskName,
              ParenTask: parent.data?.TaskName,
              Creator: child.data?.Creator.Title,
              Backup: child.data?.Backup.Title,
              PriorityLevel: child.data?.PriorityLevel,
              ClientName: parent.data?.ClientName,
              DueDate: child.data?.DueDate,
              Status: child.data?.Status,
              TaskAge: child.data?.TaskAge,
              CompletedDate: child.data?.CompletedDate,
              DoneFormula: child.data?.DoneFormula,
              DaysOnEarly: child.data?.DaysOnEarly,
              Created: child.data?.Created,
              Category: "ClientTasks",
            });
          }
        } else {
          //worksheet.addRow({}); // Add an empty row
        }

        //worksheet.addRow(); // Empty row after each parent's children
      }

      for (const parent of data[0].backupData) {
        worksheet.addRow({
          TaskName: parent.Tasks[0].data?.TaskName,
          Creator: parent.Tasks[0].data?.Creator.Title,
          Backup: parent.Tasks[0].data?.Backup.Title,
          PriorityLevel: parent.Tasks[0].data?.PriorityLevel,
          DueDate: parent.Tasks[0].data?.DueDate,
          ClientName: parent.Tasks[0].data?.ClientName,
          Status: parent.Tasks[0].data?.Status,
          TaskAge: parent.Tasks[0].data?.TaskAge,
          CompletedDate: parent.Tasks[0].data?.CompletedDate,
          DoneFormula: parent.Tasks[0].data?.DoneFormula,
          DaysOnEarly: parent.Tasks[0].data?.DaysOnEarly,
          Created: parent.Tasks[0].data?.Created,
          Category: "BackupTasks",
        });
        //worksheet.addRow();
        // Add child data for each parent
        if (parent.Tasks[0].children?.length > 0) {
          for (const child of parent.Tasks[0].children) {
            worksheet.addRow({
              TaskName: child.data?.TaskName,
              ParenTask: parent.data?.TaskName,
              Creator: child.data?.Creator.Title,
              Backup: child.data?.Backup.Title,
              PriorityLevel: child.data?.PriorityLevel,
              ClientName: parent.data?.ClientName,
              DueDate: child.data?.DueDate,
              Status: child.data?.Status,
              TaskAge: child.data?.TaskAge,
              CompletedDate: child.data?.CompletedDate,
              DoneFormula: child.data?.DoneFormula,
              DaysOnEarly: child.data?.DaysOnEarly,
              Created: child.data?.Created,
              Category: "BackupTasks",
            });
          }
        } else {
          //worksheet.addRow({}); // Add an empty row
        }

        //worksheet.addRow(); // Empty row after each parent's children
      }
    }
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        FileSaver.saveAs(
          new Blob([buffer]),
          `Export-${moment().format("MM_DD_YYYY")}.xlsx`
        );
        resolve();
      })
      .catch((err) => {
        reject(err);
        alert("Something went wrong. Please contact the system admin.");
      });
  });
};

export default exportToExcel;
//   exportToExcel(data, headers, "OrgChart");
