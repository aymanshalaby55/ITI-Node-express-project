const express = require('express');
const schemas = require('../schema/donation');
const donationsController = require('../controllers/donation.controller');
const validate = require('../middleware/validate');

const router = express.Router();


router.post("/", validate(schemas.donationSchema), donationsController.createDonation);

router.post("/webhook", donationsController.webhook)


module.exports = router;