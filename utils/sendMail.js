import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, token) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Verification URL
        const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;

        // Email content
        const mailOptions = {
            from: `"Authentication App" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Please verify your email address",
            text: `Thank you for registering! Please verify your email to complete registration:
            ${verificationUrl}
            This verification link will expire in 10 minutes.
            If you don't want to create an account, please ignore this email.`,
        };

        // Send mail
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent to: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error while sending verification email:", error);
        return false;
    }
};

export default sendVerificationEmail;