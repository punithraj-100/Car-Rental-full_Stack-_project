import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn("⚠️ SMTP credentials missing in .env file. Email not sent.");
            console.warn("Please add SMTP_EMAIL and SMTP_PASSWORD to your server/.env file.");
            return; // Exit early to avoid crash
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
        // We don't throw here so the subscription process doesn't fail completely
        // just because email failed.
    }
};

export default sendEmail;
