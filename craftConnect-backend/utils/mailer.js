import nodemailer from "nodemailer";

const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: process.env.SMTP_USER
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
      })
    : null;

export const appUrl = (path) =>
    `${(process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "")}${path}`;

// Never throws: callers respond identically whether or not mail went out, so failures
// can't be used to probe which emails are registered.
export const sendMail = async ({ to, subject, text }) => {
    if (!transporter) {
        if (process.env.NODE_ENV === "production")
            console.error(`Email not sent (SMTP not configured): ${subject}`);
        else console.log(`\n[dev mail] To: ${to}\nSubject: ${subject}\n${text}\n`);
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
        });
    } catch (error) {
        console.error(`Failed to send email "${subject}":`, error.message);
    }
};
