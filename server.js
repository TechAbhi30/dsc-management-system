const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");

const PORT = process.env.PORT || 3000;

const getEmployeeData = require("./utils/excelReader");
require("./services/scheduler");

const app = express();
const upload = multer({
  dest: path.join(__dirname, "uploads/"),
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.post("/upload-excel", upload.single("excelFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No Excel file uploaded.");
  }

  const uploadedFile = req.file.path;

  const requiredColumns = [
    "Employee ID",
    "Employee Name",
    "Email",
    "Department",
    "Designation",
    "DSC Valid From",
    "DSC Expiry Date",
  ];

  try {
    // Read Excel
    const workbook = XLSX.readFile(uploadedFile);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error("The Excel file does not contain any sheet.");
    }
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
    });
    if (rows.length === 0) {
      throw new Error("The Excel file is empty.");
    }

    const headers = rows[0];

    const missingColumns = requiredColumns.filter(
      (column) => !headers.includes(column),
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    if (rows.length < 2) {
      throw new Error("The Excel file contains no employee records.");
    }
    const masterFilePath = path.join(__dirname, "data", "employees.xlsx");
    fs.copyFileSync(uploadedFile, masterFilePath);
    fs.unlinkSync(uploadedFile);

    console.log("Master Excel file updated successfully.");

    res.redirect("/");
  } catch (err) {
    console.log("Excel upload failed:", err.message);

    // Delete invalid temporary file
    if (fs.existsSync(uploadedFile)) {
      fs.unlinkSync(uploadedFile);
    }

    res.status(400).render("upload-error", {
      error: err.message,
    });
  }
});


  // Clear all employee data
app.post("/clear-data", (req, res) => {
  const masterFilePath = path.join(__dirname, "data", "employees.xlsx");
  const emailLogPath = path.join(__dirname, "logs", "emailLog.json");

  try {
    const workbook = XLSX.utils.book_new();

    const headers = [
      [
        "Employee ID",
        "Employee Name",
        "Email",
        "Department",
        "Designation",
        "DSC Valid From",
        "DSC Expiry Date",
      ],
    ];

    const sheet = XLSX.utils.aoa_to_sheet(headers);

    XLSX.utils.book_append_sheet(workbook, sheet, "Employees");

    XLSX.writeFile(workbook, masterFilePath);

    if (fs.existsSync(emailLogPath)) {
      fs.writeFileSync(emailLogPath, "[]", "utf8");
    }

    console.log("All employee data cleared successfully.");

    res.redirect("/");
  } catch (err) {
    console.log("Clear data failed:", err.message);
    res.status(500).send("Failed to clear employee data.");
  }
});

app.get("/", (req, res) => {

  const employeeData = getEmployeeData();
  let emailLog = [];

  try {
    emailLog = JSON.parse(fs.readFileSync("./logs/emailLog.json", "utf8"));
  } catch {
    emailLog = [];
  }

  employeeData.forEach((emp) => {
    const logs = emailLog.filter(
      (e) => e.email.toLowerCase() === emp.email.toLowerCase(),
    );

    if (logs.length > 0) {
      const latest = logs[logs.length - 1]; // latest email
      emp.lastEmailSent = new Date(latest.date).toLocaleString("en-IN");
    } else {
      emp.lastEmailSent = "-";
    }
  });

  const total = employeeData.length;
  const expiring = employeeData.filter(
    (emp) => emp.status === "Expiring Soon",
  ).length;
  const active = employeeData.filter((emp) => emp.status === "Active").length;
  const emailsSent = employeeData.filter((emp) => emp.lastEmailSent !== "-").length;

  res.render("dashboard", {
    employees: employeeData,
    total,
    expiring,
    active,
    emailsSent,
  });
});

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
