// <---------- Using Brevo ------------>
const express = require('express')
const router = express.Router()
const Otp = require('../models/Otp')
const axios = require('axios')

// Helper function to clean email format
const cleanEmail = email => {
  if (!email) return 'innovit.edu@gmail.com'

  // Remove "Name <email@domain.com>" format and return just the email
  const clean = email.replace(/.*<([^>]+)>/, '$1').trim()
  return clean || 'innovit.edu@gmail.com'
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  console.log('Send OTP request received:', req.body)

  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    })
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  try {
    console.log('Generated OTP for', email, ':', otp)

    // Delete existing OTP for this email
    await Otp.deleteMany({ email })

    // Create new OTP
    await Otp.create({ email, otp })

    // Clean the sender email
    const senderEmail = cleanEmail(process.env.FROM_EMAIL)
    console.log('Using sender email:', senderEmail)

    // Check if Brevo API key is available
    if (!process.env.BREVO_API_KEY) {
      console.log('Brevo API key not found, returning OTP in response')
      return res.status(200).json({
        success: true,
        message: 'OTP generated successfully',
        otp: otp,
      })
    }

    // Send email using Brevo API with axios
    const brevoResponse = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'innoVIT',
          email: senderEmail, // Use cleaned email
        },
        to: [
          {
            email: email,
            name: email.split('@')[0],
          },
        ],

        subject: `${otp} is your innoVIT verification code`,
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Google Sans', Arial, sans-serif;
            background: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #202124;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            border-bottom: 1px solid #dadce0;
            padding-bottom: 24px;
        }
        .logo {
            color: #1a73e8;
            font-size: 32px;
            font-weight: 500;
            margin-bottom: 16px;
        }
        .content {
            padding: 0 24px;
        }
        .greeting {
            font-size: 16px;
            line-height: 24px;
            margin-bottom: 24px;
        }
        .otp-container {
            background: #f8f9fa;
            padding: 24px;
            border-radius: 8px;
            text-align: center;
            margin: 32px 0;
            border: 1px solid #dadce0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #2ecc71;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background: #fef7e0;
            border: 1px solid #fdd663;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            font-size: 14px;
            line-height: 20px;
        }
        .warning strong {
            color: #ea8600;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #5f6368;
            font-size: 12px;
            line-height: 18px;
            border-top: 1px solid #dadce0;
            padding-top: 24px;
        }
        .footer a {
            color: #1a73e8;
            text-decoration: none;
        }
        .security-note {
            font-size: 14px;
            color: #5f6368;
            line-height: 20px;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">innoVIT</div>
        </div>

        <div class="content">
            <div class="greeting">
                <strong>Dear innoVIT User,</strong><br><br>
                We received a request to verify your email address <strong>${email}</strong> for your innoVIT account. Your verification code is:
            </div>

            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>

            <div class="warning">
                <strong>If you did not request this code</strong>, it is possible that someone else is trying to access the innoVIT account associated with ${email}. <strong>Do not forward or give this code to anyone.</strong>
            </div>

            <div class="security-note">
                You received this message because this email address was used to sign up for an innoVIT account.
                If you believe this was sent in error, please ignore this email.
            </div>
        </div>

        <div class="footer">
            <p>This email can't receive replies.</p>
            <p>For more information, visit the <a href="https://innovit-0qxd.onrender.com">innoVIT Help Center</a></p>
            <p>© innoVIT • VIT University</p>
        </div>
    </div>
</body>
</html>
`,
        // subject: `${otp} is your innoVIT OTP`,
        // htmlContent: `
        //   <!DOCTYPE html>
        //   <html>
        //   <head>
        //       <style>
        //           body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        //           .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        //           .header { text-align: center; margin-bottom: 30px; }
        //           .logo { color: #4A90E2; font-size: 24px; font-weight: bold; }
        //           .otp-container { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        //           .otp-code { font-size: 32px; font-weight: bold; color: #2ecc71; letter-spacing: 5px; }
        //           .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        //       </style>
        //   </head>
        //   <body>
        //       <div class="container">
        //           <div class="header">
        //               <div class="logo">innoVIT</div>
        //               <h2>Your Verification Code</h2>
        //           </div>
        //           <p>Hello,</p>
        //           <p>Use the OTP below to complete your sign-up process:</p>
        //           <div class="otp-container">
        //               <div class="otp-code">${otp}</div>
        //           </div>
        //           <p>This OTP is valid for 5 minutes. If you didn't request this, please ignore this email.</p>
        //           <div class="footer">
        //               <p>Sent with ❤️ by innoVIT • VIT University</p>
        //           </div>
        //       </div>
        //   </body>
        //   </html>
        // `
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000, // 10 second timeout
      },
    )

    console.log(
      '✅ OTP email sent successfully via Brevo. Message ID:',
      brevoResponse.data.messageId,
    )

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email successfully',
    })
  } catch (err) {
    console.error('❌ Error in send-otp:', err)

    // More specific error handling
    if (err.response && err.response.data) {
      console.error('Brevo API error details:', err.response.data)

      // If Brevo fails, return OTP in response as fallback
      if (err.response.status === 400 || err.response.status === 401) {
        return res.status(200).json({
          success: true,
          message: 'OTP generated successfully',
          otp: otp,
        })
      }
    }

    // Network errors or other issues - return OTP as fallback
    return res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      otp: otp,
    })
  }
})

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      })
    }

    const record = await Otp.findOne({ email: email.trim() })

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'OTP expired or not found',
      })
    }

    if (record.otp !== otp.trim()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
      })
    }

    await Otp.deleteOne({ email: email.trim() })
    console.log('✅ OTP verified successfully for:', email)

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    console.error('❌ OTP verification error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
})

module.exports = router

// <-------- Using Nodemailer -------->
// const express = require("express");
// const router = express.Router();
// const Otp = require("../models/Otp.js");
// const nodemailer = require("nodemailer");

// // Send OTP
// router.post("/send-otp", async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({
//       success: false,
//       message: "Email is required",
//     });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   try {
//     // Delete existing OTP for this email
//     await Otp.deleteMany({ email });

//     // Create new OTP
//     await Otp.create({ email, otp });

//     // Configure nodemailer
//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: `${otp} is your innoVIT OTP`,
//       text: `Your OTP is: ${otp}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px; background: #f9f9f9;">
//           <h2 style="color: #4A90E2;">Welcome to <span style="color: #000;">innoVIT</span> 👋</h2>
//           <p style="font-size: 16px; color: #333;">Use the OTP below to complete your sign-up:</p>
//           <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2ecc71; background: #ecf0f1; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
//             ${otp}
//           </div>
//           <p style="font-size: 14px; color: #999;">This OTP is valid for 5 minutes. If you didn't request this, just ignore this email.</p>
//           <hr style="border: none; border-top: 1px solid #ddd;" />
//           <p style="font-size: 12px; color: #bbb;">Sent with ❤️ by innoVIT • VIT University</p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully",
//     });
//   } catch (err) {
//     console.error("Error sending OTP:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to send OTP",
//     });
//   }
// });

// // Verify OTP
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email?.trim() || !otp?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and OTP are required",
//       });
//     }

//     const record = await Otp.findOne({ email: email.trim() });

//     if (!record) {
//       return res.status(404).json({
//         success: false,
//         message: "OTP expired or not found",
//       });
//     }

//     if (record.otp !== otp.trim()) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     // Delete the OTP after successful verification
//     await Otp.deleteOne({ email: email.trim() });

//     return res.status(200).json({
//       success: true,
//       message: "OTP verified successfully",
//     });
//   } catch (error) {
//     console.error("OTP verification error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// });

// module.exports = router;
