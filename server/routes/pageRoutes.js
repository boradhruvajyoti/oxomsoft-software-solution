const express = require('express');
const router = express.Router();
const PageController = require('../controllers/pageController');

// Page routes
router.get('/', PageController.getHomePage);
router.get('/about', PageController.getAboutPage);
router.get('/contact', PageController.getContactPage);
router.get('/privacy-policy', PageController.getPrivacyPolicyPage);
router.get('/privacy-policy/classic-puzzle', PageController.getClassicPuzzlePrivacyPage);
router.get('/privacy/classic-puzzle', PageController.getClassicPuzzlePrivacyPage);
router.get('/classic-puzzle-privacy-policy', PageController.getClassicPuzzlePrivacyPage);

module.exports = router;
