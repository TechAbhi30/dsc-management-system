const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const getEmployeeData = require("../utils/excelReader");
const sendExpiryEmail = require("./emailService");

const logPath = path.join(__dirname, "../logs/emailLog.json");

async function checkExpiry() {
  console.log("Checking DSC expiry...");
  console.log("Time:", new Date().toLocaleString("en-IN"));
  const employees = getEmployeeData();
  let emailLog = [];
  try {
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, "utf8").trim();
      if (data) {
        emailLog = JSON.parse(data);
      }
    }
  } catch (err) {
    console.log("Creating new email log...");
    emailLog = [];
  }
  for (const emp of employees) {

    if (emp.daysLeft !== 15 && emp.daysLeft !== 10) {
      continue;
    }
    const alreadySent = emailLog.find(
      (e) =>
        e.email.toLowerCase() === emp.email.toLowerCase() &&
        e.expiryDate === emp.expiryDate &&
        e.daysLeft === emp.daysLeft
    );

    if (alreadySent) {
      console.log(`Already notified -> ${emp.email} (${emp.daysLeft} days left)`);
      continue;
    }

    try {
      await sendExpiryEmail(emp);
      console.log(`Email sent -> ${emp.email} (${emp.daysLeft} days left)`);

      emailLog.push({
        email: emp.email,
        expiryDate: emp.expiryDate,
        daysLeft: emp.daysLeft,
        date: new Date().toISOString()
      });

    } catch (err) {
      console.log(`Failed -> ${emp.email}`);
      console.log(err.message);
    }
  }

  fs.writeFileSync(
    logPath,
    JSON.stringify(emailLog, null, 2)
  );
  console.log("DSC check completed.\n");
}
// Run every day at 9:00 AM IST
cron.schedule("0 9 * * *", checkExpiry, {
  timezone: "Asia/Kolkata"
});

console.log("Daily DSC Scheduler Started (09:00 AM IST)");

// TEMPORARY testing
// checkExpiry();