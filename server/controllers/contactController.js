const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const MessageModel = require('../models/messageModel');

// Email transporter configuration (optional SMTP)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send email notification to company support inbox
 */
async function sendNotificationEmail(messageData) {
  if (!transporter) return;

  const mailOptions = {
    from: process.env.MAIL_FROM || 'Oxomsoft Website <no-reply@oxomsoft.in>',
    to: process.env.SUPPORT_EMAIL || 'support@oxomsoft.com',
    replyTo: messageData.email,
    subject: `[New Inquiry] ${messageData.subject} - from ${messageData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 8px;">
        <h2 style="color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-top: 0;">
          New Contact Submission - Oxomsoft Software Solution
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; width: 120px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #f8fafc;">${messageData.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #38bdf8;"><a href="mailto:${messageData.email}" style="color: #38bdf8;">${messageData.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #f8fafc;">${messageData.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;"><strong>Subject:</strong></td>
            <td style="padding: 8px 0; color: #f8fafc;">${messageData.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; background: #1e293b; padding: 16px; border-radius: 6px; border-left: 4px solid #38bdf8;">
          <h4 style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase;">Message:</h4>
          <p style="margin: 0; color: #f8fafc; white-space: pre-wrap; line-height: 1.6;">${messageData.message}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
          Received via oxomsoft.in at ${new Date().toUTCString()}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Notification sent to ${mailOptions.to} for contact #${messageData.name}`);
  } catch (emailErr) {
    console.error('[Email Error] Failed to send notification email:', emailErr.message);
  }
}

const ContactController = {
  /**
   * Handle contact form submission
   */
  async submitContact(req, res) {
    // Validate request
    const errors = validationResult(req);
    const isAjax = req.xhr || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.includes('application/json');

    if (!errors.isEmpty()) {
      if (isAjax) {
        return res.status(422).json({
          success: false,
          errors: errors.array(),
          message: 'Please correct the errors in the form.',
        });
      }
      return res.status(422).render('pages/contact', {
        title: 'Contact Us | Oxomsoft Software Solution',
        metaDescription: 'Get in touch with Oxomsoft for custom software development.',
        canonicalUrl: `${process.env.APP_URL || 'https://oxomsoft.in'}/contact`,
        currentPath: '/contact',
        company: {
          name: 'Oxomsoft Software Solution',
          shortName: 'Oxomsoft',
          domain: 'oxomsoft.in',
          email: process.env.SUPPORT_EMAIL || 'support@oxomsoft.com',
          phone: '+91 98765 43210',
          address: 'Guwahati, Assam, India - 781001',
          year: new Date().getFullYear(),
        },
        errors: errors.array(),
        formData: req.body,
        submitted: false,
      });
    }

    const { name, email, phone, subject, message } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    try {
      // 1. Save to Database
      const result = await MessageModel.create({
        name,
        email,
        phone,
        subject,
        message,
        ip,
        userAgent,
      });

      // 2. Trigger Email Notification (non-blocking)
      sendNotificationEmail({ name, email, phone, subject, message }).catch(err => {
        console.error('[Async Email Error]', err);
      });

      if (isAjax) {
        return res.status(200).json({
          success: true,
          message: 'Thank you for reaching out! We have received your message and our team will get back to you within 24 hours.',
          referenceId: result.id,
        });
      }

      // Standard form submit -> redirect to contact with success flag
      return res.redirect('/contact?submitted=true');
    } catch (err) {
      console.error('[Contact Submit Error]', err);
      if (isAjax) {
        return res.status(500).json({
          success: false,
          message: 'An unexpected error occurred while sending your message. Please try again or email us directly at support@oxomsoft.com.',
        });
      }
      return res.status(500).render('pages/contact', {
        title: 'Contact Us | Oxomsoft Software Solution',
        metaDescription: 'Get in touch with Oxomsoft.',
        canonicalUrl: `${process.env.APP_URL || 'https://oxomsoft.in'}/contact`,
        currentPath: '/contact',
        company: {
          name: 'Oxomsoft Software Solution',
          shortName: 'Oxomsoft',
          domain: 'oxomsoft.in',
          email: process.env.SUPPORT_EMAIL || 'support@oxomsoft.com',
          phone: '+91 98765 43210',
          address: 'Guwahati, Assam, India - 781001',
          year: new Date().getFullYear(),
        },
        errorMessage: 'Something went wrong. Please try again or reach us at support@oxomsoft.com.',
        formData: req.body,
        submitted: false,
      });
    }
  },
};

module.exports = ContactController;
