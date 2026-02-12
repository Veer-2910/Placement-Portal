const nodemailer = require("nodemailer");

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} - Nodemailer send result
 */
async function sendOTP(email, otp) {
  const mailOptions = {
    from: `"UGSF Placement Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification - OTP for Password Setup",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f7fa;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 40px 30px;
            }
            .otp-box {
              background-color: #f8f9fa;
              border: 2px dashed #0d6efd;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #0d6efd;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .info-text {
              color: #6c757d;
              font-size: 14px;
              line-height: 1.6;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
            </div>
            <div class="content">
              <h2 style="color: #212529; margin-top: 0;">Welcome to UGSF Placement Portal!</h2>
              <p class="info-text">
                You're almost there! Use the OTP below to verify your email and set up your account password.
              </p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Your One-Time Password</p>
                <div class="otp-code">${otp}</div>
              </div>

              <div class="warning">
                <strong>⏱️ Valid for 5 minutes</strong><br/>
                This OTP will expire in 5 minutes for security reasons.
              </div>

              <p class="info-text">
                If you didn't request this OTP, please ignore this email or contact your institute administrator.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated email from UGSF Placement Portal. Please do not reply to this email.</p>
              <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} UGSF. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your OTP for email verification is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw error;
  }
}

module.exports = { sendOTP };
