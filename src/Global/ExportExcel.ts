import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as moment from "moment";

const exportToExcel = async (data, headers, sheetName) => {
  return new Promise<void>((resolve, reject) => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set headers dynamically
    worksheet.columns = headers.map((header) => ({
      header: header.header,
      key: header.key,
      width: header.width || 15,
    }));
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
    ];
    headerRows.map((key: any) => {
      worksheet.getCell(key).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4194c5" },
        bold: true,
      };
    });

    if (sheetName == "OrgChart") {
      data.forEach((item) => {
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
        });
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
      data.forEach((item) => {
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
          DoneFormula: item?.DoneFormula,
          // Created: item?.Created,
        });
      });
    } else if (sheetName == "MyTask") {
      for (const parent of data) {
        worksheet.addRow({
          TaskName: parent.data?.TaskName,
          Creator: parent.data?.Creator.Title,
          Backup: parent.data?.Backup.Title,
          PriorityLevel: parent.data?.PriorityLevel,
          DueDate: parent.data?.DueDate,
          Status: parent.data?.Status,
          Created: parent.data?.Created,
        });
        //worksheet.addRow();
        // Add child data for each parent
        if (parent.children.length > 0) {
          for (const child of parent.children) {
            worksheet.addRow({
              TaskName: child.data?.TaskName,
              ParenTask: parent.data?.TaskName,
              Creator: child.data?.Creator.Title,
              Backup: child.data?.Backup.Title,
              PriorityLevel: child.data?.PriorityLevel,
              DueDate: child.data?.DueDate,
              Status: child.data?.Status,
              Created: child.data?.Created,
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
