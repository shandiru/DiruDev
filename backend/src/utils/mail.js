import nodemailer from "nodemailer";

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const port = Number(process.env.EMAIL_PORT || 587);
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function sendContactNotification(c) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return false;
  await getTransporter().sendMail({
    from: `"Portfolio" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    replyTo: c.email,
    subject: `New contact: ${c.subject || c.name}`,
    text: `Name: ${c.name}\nEmail: ${c.email}\nPhone: ${c.phone}\nBudget: ${c.budget}\nCountry: ${c.country}\n\n${c.message}`,
    html: `<h2>New portfolio message</h2>
      <p><b>Name:</b> ${esc(c.name)}<br><b>Email:</b> ${esc(c.email)}<br><b>Phone:</b> ${esc(c.phone)}<br>
      <b>Budget:</b> ${esc(c.budget)}<br><b>Country:</b> ${esc(c.country)}</p>
      <p style="white-space:pre-wrap">${esc(c.message)}</p>`,
  });
  return true;
}
