import express from 'express';
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { requireCustomerAuth } from '../middleware/auth.js';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// Helper function to generate temporary password
function generateTempPassword(email) {
    const emailPrefix = email.split('@')[0].substring(0, 3);
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number
    return `${emailPrefix}${randomNum}`;
}

// POST /forgot-password - Reset password for customer or employee
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: 'Email is required'
        });
    }

    try {
        // Check if email exists in customer table
        const customerCheck = await new Promise((resolve, reject) => {
            db.query('SELECT customer_id, first_name, email FROM customer WHERE email = ?',
                [email], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
        });

        // Check if email exists in employee table
        const employeeCheck = await new Promise((resolve, reject) => {
            db.query('SELECT employee_id, first_name, email FROM employee WHERE email = ?',
                [email], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
        });

        // If email not found in either table
        if (customerCheck.length === 0 && employeeCheck.length === 0) {
            return res.status(404).json({
                message: 'No account found with this email address'
            });
        }

        // Generate temporary password (6 characters)
        const tempPassword = generateTempPassword(email);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        let userName = '';
        let isEmployee = false;

        // Update password in the appropriate table
        if (customerCheck.length > 0) {
            // Update customer password
            await new Promise((resolve, reject) => {
                db.query('UPDATE customer SET password = ? WHERE email = ?',
                    [hashedPassword, email], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
            });
            userName = customerCheck[0].first_name;
            isEmployee = false;
        } else {
            // Update employee password and set password_changed to FALSE
            await new Promise((resolve, reject) => {
                db.query('UPDATE employee SET password = ?, password_changed = FALSE WHERE email = ?',
                    [hashedPassword, email], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
            });
            userName = employeeCheck[0].first_name;
            isEmployee = true;
        }

        // Send email with temporary password
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@velocityvalley.com',
            subject: 'Password Reset - Velocity Valley Theme Park',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #176B87;">Password Reset Request</h2>
                    <p>Hello ${userName},</p>
                    <p>We received a request to reset your password. Here is your temporary password:</p>
                    <div style="background-color: #EEF5FF; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #176B87; text-align: center; letter-spacing: 2px;">${tempPassword}</h3>
                    </div>
                    <p><strong>⚠️ Important Security Notice:</strong></p>
                    <ul>
                        <li>You will be required to change this password upon your next login</li>
                        <li>This temporary password is valid until you change it</li>
                        <li>If you did not request this password reset, please contact support immediately</li>
                    </ul>
                    <p>For your security, we recommend:</p>
                    <ul>
                        <li>Using a strong password (at least 8 characters)</li>
                        <li>Not sharing your password with anyone</li>
                        <li>Using a unique password for this account</li>
                    </ul>
                    <p>Best regards,<br/>Velocity Valley Theme Park Team</p>
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #B4D4FF;">
                    <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
                </div>
            `
        };

        await sgMail.send(msg);

        res.json({
            message: `A temporary password has been sent to ${email}`,
            requirePasswordChange: true,
            isEmployee: isEmployee
        });

    } catch (error) {
        console.error('Forgot password error:', error);

        // Check if it's a SendGrid error
        if (error.code === 'EAUTH' || error.response?.body?.errors) {
            return res.status(500).json({
                message: 'Failed to send email. Please contact support.',
                error: 'Email service error'
            });
        }

        return res.status(500).json({
            message: 'Failed to reset password',
            error: error.message
        });
    }
});

export default router;