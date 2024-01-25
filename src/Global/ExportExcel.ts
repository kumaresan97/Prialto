import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as moment from "moment";

const exportToExcel = (data, headers, sheetName) => {
  return new Promise<void>((resolve, reject) => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    console.log("data", data);

    // Set headers dynamically
    worksheet.columns = headers.map((header) => ({
      header: header.header,
      key: header.key,
      width: header.width || 15,
    }));

    const Colorchange = (item, index, CellStatus, cellPrioritylevel) => {
      let statusBgColor = "";
      let statusColor = "";
      let priorityBgColor = "";
      let priorityColor = "";

      if (item?.Status || item?.data?.Status || item?.Tasks?.data?.Status) {
        if (
          item?.Status === "Completed" ||
          item?.data?.Status == "Completed" ||
          item?.Tasks?.data.Status == "Completed"
        ) {
          statusBgColor = "c7ffc7";
          statusColor = "1a8100";
        }
        if (
          item?.Status === "Done" ||
          item?.data?.Status == "Done" ||
          item?.Tasks?.data.Status == "Done"
        ) {
          statusBgColor = "dfffbb";
          statusColor = "6e6e6e";
        }
        if (
          item?.Status === "Weekly" ||
          item?.data?.Status == "Weekly" ||
          item?.Tasks?.data.Status == "Weekly"
        ) {
          statusBgColor = "fcbdbd";
          statusColor = "ffff";
        }
        if (
          item?.Status === "Daily" ||
          item?.data?.Status == "Daily" ||
          item?.Tasks?.data.Status == "Daily"
        ) {
          statusBgColor = "ebb7b7";
          statusColor = "f92e2e";
        }
        if (
          item?.Status === "Monthly" ||
          item?.data?.Status == "Monthly" ||
          item?.Tasks?.data.Status == "Monthly"
        ) {
          statusBgColor = "b7e1eb";
          statusColor = "225662";
        }
        if (item?.Status === "On-hold" || item.data?.Status == "On-hold") {
          statusBgColor = "f7f6da";
          statusColor = "4a4a3b";
        }
        if (
          item?.Status === "Every Monday" ||
          item.data?.Status == "Every Monday"
        ) {
          statusBgColor = "ebcdb7";
          statusColor = "b55d1d";
        }
        if (
          item?.Status === "Every Tuesday" ||
          item.data?.Status == "Every Tuesday"
        ) {
          statusBgColor = "e1f7c0";
          statusColor = "4d7216";
        }
        if (
          item?.Status === "Every Wednesday" ||
          item.data?.Status == "Every Wednesday"
        ) {
          statusBgColor = "e6f7c0";
          statusColor = "626262";
        }
        if (
          item?.Status === "Every Thursday" ||
          item.data?.Status == "Every Thursday"
        ) {
          statusBgColor = "f7c0eb";
          statusColor = "680d54";
        }
        if (
          item?.Status === "Every Friday" ||
          item.data?.Status == "Every Friday"
        ) {
          statusBgColor = "ffeaea";
          statusColor = "a55b5b";
        }
        if (
          item?.Status === "Every Saturday" ||
          item.data?.Status == "Every Saturday"
        ) {
          statusBgColor = "f0eaff";
          statusColor = "6539d3";
        }
        if (
          item?.Status === "Every Sunday" ||
          item.data?.Status == "Every Sunday"
        ) {
          statusBgColor = "ffeaf4";
          statusColor = "f30074";
        }
        if (
          item?.Status === "One time" ||
          item?.data?.Status == "One time" ||
          item?.Tasks?.data?.Status == "One time"
        ) {
          statusBgColor = "f7f6da";
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

      if (
        item?.PriorityLevel ||
        item?.data?.PriorityLevel ||
        item.Tasks?.data?.PriorityLevel
      ) {
        if (
          item?.PriorityLevel === "High" ||
          item.data?.PriorityLevel == "High" ||
          item?.Tasks?.data?.PriorityLevel == "High"
        ) {
          priorityBgColor = "ffd5b8";
          priorityColor = "f46906";
        }
        if (
          item?.PriorityLevel === "Urgent" ||
          item.data?.PriorityLevel == "Urgent" ||
          item?.Tasks?.data?.PriorityLevel == "Urgent"
        ) {
          priorityBgColor = "bf4927";
          priorityColor = "ffded5";
        }
        if (
          item?.PriorityLevel == "Normal" ||
          item.data?.PriorityLevel == "Normal" ||
          item?.Tasks?.data?.PriorityLevel == "Normal"
        ) {
          priorityBgColor = "bbfcff";
          priorityColor = "4b6164";
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
      let _curTeams: string = "";

      data.forEach((item, index) => {
        _curTeams = "";

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

        let DirectReports = "";
        if (item.DirectReports.length > 0) {
          item.DirectReports.forEach((val) => {
            DirectReports += val.Title + ";";
          });
        }

        item.Team?.forEach((val: string, i: number) => {
          if (item.Team.length === i + 1) {
            _curTeams += val + ";";
          } else {
            _curTeams += val + "; ";
          }
        });

        const row = worksheet.addRow({
          Name: item.Name?.Title,
          Role: item.Role,
          Team: _curTeams,
          // Cohort: item.Cohort,
          Manager: item.Manager?.Title,
          // TeamCaptain: item.TeamCaptain?.Title,
          // TeamLeader: item.TeamLeader?.Title,
          DirectReports: DirectReports,
          // BackingUp: item.BackingUp[0]?.Title,
        });

        row.fill = rowFill;

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = {
            name: "Arial",
            size: 10,
          };
        });
      });
    } else if (sheetName == "Client") {
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

        let backupUsers = "";
        if (item.Backup.length > 0) {
          item.Backup.forEach((val) => {
            backupUsers += val.Title + ";";
          });
        }
        const row = worksheet.addRow({
          FirstName: item.FirstName,
          LastName: item?.LastName,
          CompanyName: item.CompanyName,
          Assistant: item.Assistant?.Title,
          Backup: backupUsers,
        });
        row.fill = rowFill;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.font = {
            name: "Arial",
            size: 10,
          };

          // if (colNumber === 15) {

          // }
        });
      });
    } else if (sheetName == "DoneDashboard") {
      console.log(data, "datas");
      data.forEach((item, index) => {
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
        const rowFill = index % 2 === 0 ? evenRowFill : oddRowFill;

        const row = worksheet.addRow({
          TaskName: item?.TaskName,
          parentTasKName: item ? item.parentTasKName : "",
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
        });
        row.fill = rowFill;

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = {
            name: "Arial",
            size: 10,
          };
        });

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
        //   priorityBgColor = "bbfcff";
        //   priorityColor = "4b6164";
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
      let _count: number = -1;
      // data.forEach(async (item, index) => {
      for (let i = 0; i < data.length; i++) {
        _count++;

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
        const rowFill = _count % 2 === 0 ? evenRowFill : oddRowFill;
        const row = worksheet.addRow({
          TaskName: data[i].data?.TaskName,
          // Creator: data[i].data?.Creator.Title,
          // Backup: data[i].data?.Backup.Title,
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

        Colorchange(data[i], _count, 4, 3);

        //worksheet.addRow();
        // Add child data for each item
        // if (data[i].children.length) {
        // item.children.forEach(async (child, index) => {
        // for (const child of item.children) {

        for (let j = 0; j < data[i].children.length; j++) {
          _count++;

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

          const rowFill = _count % 2 === 0 ? evenRowFill : oddRowFill;

          const childrow = worksheet.addRow({
            TaskName: data[i].children[j].data?.TaskName,
            ParenTask: data[i].data?.TaskName,
            // Creator: data[i].children[j].data?.Creator.Title,
            // Backup: data[i].children[j].data?.Backup.Title,
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

          Colorchange(data[i].children[j], _count, 4, 3);
          // if (!data[i].children.length) continue outerloop;
        }
        // }
        // else {
        //   //worksheet.addRow({}); // Add an empty row
        // }
      }

      //worksheet.addRow(); // Empty row after each parent's children
      // });
    } else if (sheetName == "ClientandBackup") {
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
      console.log(data, "data");

      let _count: number = -1;

      for (const parent of data[0].clientData) {
        _count++;

        const rowFill = _count % 2 === 0 ? evenRowFill : oddRowFill;
        const row = worksheet.addRow({
          TaskName: parent.data?.TaskName,
          // Creator: parent.data?.Creator.Title,
          // Backup: parent.data?.Backup.Title,
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
        row.fill = rowFill;

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: "thin" }, // Add top border to each cell
            left: { style: "thin" }, // Add left border to each cell
            bottom: { style: "thin" }, // Add bottom border to each cell
            right: { style: "thin" }, // Add right border to each cell
          };
        });
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = {
            name: "Arial",
            size: 10,
          };
        });
        Colorchange(parent, _count, 6, 5);

        //worksheet.addRow();
        // Add child data for each parent
        if (parent.children?.length > 0) {
          for (const child of parent.children) {
            _count++;

            // const oddRowFill = {
            //   type: "pattern",
            //   pattern: "solid",
            //   fgColor: { argb: "fce4d6" },
            // };

            // const evenRowFill = {
            //   type: "pattern",
            //   pattern: "solid",
            //   fgColor: { argb: "FFFFFF" },
            // };
            const rowFill = _count % 2 === 0 ? evenRowFill : oddRowFill;
            const row = worksheet.addRow({
              TaskName: child.data?.TaskName,
              ParenTask: parent.data?.TaskName,
              // Creator: child.data?.Creator.Title,
              // Backup: child.data?.Backup.Title,
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

            row.fill = rowFill;
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.border = {
                top: { style: "thin" }, // Add top border to each cell
                left: { style: "thin" }, // Add left border to each cell
                bottom: { style: "thin" }, // Add bottom border to each cell
                right: { style: "thin" }, // Add right border to each cell
              };
            });
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.font = {
                name: "Arial",
                size: 10,
              };
            });

            Colorchange(child, _count, 6, 5);
          }
        } else {
          //worksheet.addRow({}); // Add an empty row
        }

        //worksheet.addRow(); // Empty row after each parent's children
      }
      if (data[0].backupData.length) {
        for (const parent of data[0].backupData[0]?.Tasks) {
          _count++;

          // const oddRowFill = {
          //   type: "pattern",
          //   pattern: "solid",
          //   fgColor: { argb: "fce4d6" },
          // };

          // const evenRowFill = {
          //   type: "pattern",
          //   pattern: "solid",
          //   fgColor: { argb: "FFFFFF" },
          // };
          const rowFill = _count % 2 === 0 ? evenRowFill : oddRowFill;

          const row = worksheet.addRow({
            TaskName: parent.data?.TaskName,
            // Creator: parent.Tasks[0].data?.Creator.Title,
            // Backup: parent.Tasks[0].data?.Backup.Title,
            PriorityLevel: parent.data?.PriorityLevel,
            DueDate: parent.data?.DueDate,
            ClientName: parent.data?.ClientName,
            Status: parent.data?.Status,
            TaskAge: parent.data?.TaskAge,
            CompletedDate: parent.data?.CompletedDate,
            DoneFormula: parent.data?.DoneFormula,
            DaysOnEarly: parent.data?.DaysOnEarly,
            Created: parent.data?.Created,
            Category: "BackupTasks",

            // TaskName: parent.Tasks[0].data?.TaskName,
            // // Creator: parent.Tasks[0].data?.Creator.Title,
            // // Backup: parent.Tasks[0].data?.Backup.Title,
            // PriorityLevel: parent.Tasks[0].data?.PriorityLevel,
            // DueDate: parent.Tasks[0].data?.DueDate,
            // ClientName: parent.Tasks[0].data?.ClientName,
            // Status: parent.Tasks[0].data?.Status,
            // TaskAge: parent.Tasks[0].data?.TaskAge,
            // CompletedDate: parent.Tasks[0].data?.CompletedDate,
            // DoneFormula: parent.Tasks[0].data?.DoneFormula,
            // DaysOnEarly: parent.Tasks[0].data?.DaysOnEarly,
            // Created: parent.Tasks[0].data?.Created,
            // Category: "BackupTasks",
          });
          row.fill = rowFill;
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.font = {
              name: "Arial",
              size: 10,
            };
          });

          Colorchange(parent, _count, 6, 5);

          //worksheet.addRow();
          // Add child data for each parent
          if (parent.children?.length > 0) {
            // if (parent.Tasks && parent.Tasks?.children?.length > 0) {
            for (const child of parent.children) {
              console.log("child", child);
              _count++;

              // const oddRowFill = {
              //   type: "pattern",
              //   pattern: "solid",
              //   fgColor: { argb: "fce4d6" },
              // };

              // const evenRowFill = {
              //   type: "pattern",
              //   pattern: "solid",
              //   fgColor: { argb: "FFFFFF" },
              // };
              const rowFill = _count % 2 === 0 ? evenRowFill : oddRowFill;
              const row = worksheet.addRow({
                TaskName: child.data?.TaskName,
                ParenTask: parent.data?.TaskName,
                // Creator: child.data?.Creator.Title,
                // Backup: child.data?.Backup.Title,
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
              row.fill = rowFill;
              row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                  top: { style: "thin" }, // Add top border to each cell
                  left: { style: "thin" }, // Add left border to each cell
                  bottom: { style: "thin" }, // Add bottom border to each cell
                  right: { style: "thin" }, // Add right border to each cell
                };
              });
              row.eachCell({ includeEmpty: true }, (cell) => {
                cell.font = {
                  name: "Arial",
                  size: 10,
                };
              });

              Colorchange(child, _count, 6, 5);
            }
          } else {
            //worksheet.addRow({}); // Add an empty row
          }

          //worksheet.addRow(); // Empty row after each parent's children
        }
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
