const express = require('express');
const { saveJobListing } = require('../controllers/jobListingController');

const router = express.Router();

// Save a new Job Listing
router.post('/save', saveJobListing);
router.get('/', function (req, res) {
    res.send('Hello from job-listing route');
});

module.exports = router;
