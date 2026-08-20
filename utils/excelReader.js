const XLSX = require("xlsx");
const path = require("path");

function parseExcelDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000);
  }


  if (typeof value === "string") {
    //dd-mm-yyyy
    if (value.includes("-")) {
      const parts = value.split("-");

      if (parts[0].length === 2) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    return new Date(value);
  }

  return new Date(value);
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function getEmployeeData() {
  const workbook = XLSX.readFile(
    path.join(__dirname, "../data/employees.xlsx"),
    {
      cellDates: true,
    },
  );

  const sheet = workbook.Sheets["Employees"];
  const employees = XLSX.utils.sheet_to_json(sheet);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  return employees.map((emp) => {
    const validFrom = parseExcelDate(emp["DSC Valid From"]);
    const expiry = parseExcelDate(emp["DSC Expiry Date"]);

    expiry.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24),
    );

    let status = "Active";
    if (daysLeft <= 0) {
      status = "Expired";
    } else if (daysLeft <= 60) {
      status = "Expiring Soon";
    }

    return {
      id: emp["Employee ID"],
      name: emp["Employee Name"],
      email: emp["Email"],
      department: emp["Department"],
      designation: emp["Designation"],
      
      validFrom: formatDate(validFrom),
      expiryDate: formatDate(expiry),
      daysLeft: daysLeft <= 0 ? 0 : daysLeft,
      status,
    };
  });
}

module.exports = getEmployeeData;