require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP ERROR:");
    console.log(error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

async function sendExpiryEmail(employee) {
  const mailOptions = {
    from: `"CWC DSC Monitoring Portal" <${process.env.EMAIL_USER}>`,
    to: employee.email,
    subject: `[CWC] Reminder - Digital Signature Certificate (DSC) Expiry`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#000000;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="padding:20px;">

<p style="font-size:14px;margin:0 0 15px 0;">
Dear <strong>${employee.name}</strong>,
</p>

<p style="font-size:14px;line-height:22px;margin:0 0 15px 0;">
This is an automated reminder from the Central Warehousing Corporation
DSC Monitoring Portal. Our records indicate that your
Digital Signature Certificate (DSC) will expire in
<strong>${employee.daysLeft} days</strong>.
To avoid interruption of official digital signing services,
please initiate the renewal process before the expiry date.
</p>

<p style="font-size:14px;line-height:22px;margin:0 0 15px 0;">
<strong>⚠ Action Required:</strong>
Please complete the renewal process before
<strong>${employee.expiryDate}</strong>.
Failure to renew the DSC may affect access to official digital
signing services.
</p>

<table cellpadding="10" cellspacing="0" width="450" style="border-collapse:collapse;font-size:14px;margin:15px 0;border:1px solid #999;">
<tr style="background:#f2f2f2;">
<td style="border:1px solid #999;width:160px;"><strong>Employee ID</strong></td>
<td style="border:1px solid #999;">${employee.id}</td>
</tr>
<tr>
<td style="border:1px solid #999;width:160px;"><strong>Employee Name</strong></td>
<td style="border:1px solid #999;">${employee.name}</td>
</tr>
<tr style="background:#f2f2f2;">
<td style="border:1px solid #999;width:160px;"><strong>Department</strong></td>
<td style="border:1px solid #999;">${employee.department}</td>
</tr>
<tr>
<td style="border:1px solid #999;width:160px;"><strong>Designation</strong></td>
<td style="border:1px solid #999;">${employee.designation}</td>
</tr>
<tr style="background:#f2f2f2;">
<td style="border:1px solid #999;width:160px;"><strong>Expiry Date</strong></td>
<td style="border:1px solid #999;">${employee.expiryDate}</td>
</tr>
<tr>
<td style="border:1px solid #999;width:160px;"><strong>Days Remaining</strong></td>
<td style="border:1px solid #999;color:#d9534f;font-weight:bold;">${employee.daysLeft} Days</td>
</tr>
</table>

<p style="font-size:14px;line-height:22px;margin:15px 0 5px 0;">
<strong>Please provide the following documents to initiate the DSC renewal process:</strong>
</p>

<ol style="font-size:14px;line-height:24px;margin:0 0 15px 0;padding-left:20px;">
<li>Identity Proof – Aadhar Card / PAN Card</li>
<li>Address Proof</li>
<li>Passport-size Photograph</li>
<li>office id</li>
<li>Email id</li>
<li>Contact number</li>
</ol>

<p style="font-size:14px;line-height:22px;margin:15px 0;">
If you have already initiated the renewal process, please ignore
this email. For any assistance, kindly contact the MIS Division,
Central Warehousing Corporation.
</p>

<p style="font-size:14px;margin:20px 0 0 0;">
Thanks &amp; Regards<br>
DSC Monitoring Portal<br>
<strong>Central Warehousing Corporation</strong><br>
MIS Division
</p>

<p style="font-size:12px;color:#666666;margin-top:25px;">
This is a system-generated email. Please do not reply to this email.<br>
&copy; 2026 Central Warehousing Corporation. All Rights Reserved.
</p>

</td>
</tr>
</table>

</body>
</html>
`,
  };
  return transporter.sendMail(mailOptions);
}
module.exports = sendExpiryEmail;