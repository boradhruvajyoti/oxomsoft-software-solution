const express = require('express');
const router = express.Router();
const PageController = require('../controllers/pageController');

// Page routes
router.get('/', PageController.getHomePage);
router.get('/about', PageController.getAboutPage);
router.get('/contact', PageController.getContactPage);
router.get('/privacy-policy', PageController.getPrivacyPolicyPage);

module.exports = router;
