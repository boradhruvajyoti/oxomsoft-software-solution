const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const ContactController = require('../controllers/contactController');

const router = express.Router();

// Specific rate limiter for contact form submissions to prevent spam & abuse
const contactRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX, 10) || 10, // Limit each IP to 10 submissions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact requests from this IP. Please try again after 15 minutes or reach us at support@oxomsoft.com.',
  },
});

// Validation rules for contact form submission
const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 25 }).withMessage('Phone number is too long.')
    .matches(/^[0-9+\s\-().]*$/).withMessage('Please provide a valid phone number format.'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject / Service is required.')
    .isLength({ min: 3, max: 150 }).withMessage('Subject must be between 3 and 150 characters.')
    .escape(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 3000 }).withMessage('Message must be between 10 and 3000 characters.')
    .escape(),
];

// Contact form API endpoint
router.post('/contact', contactRateLimiter, contactValidationRules, ContactController.submitContact);

module.exports = router;
