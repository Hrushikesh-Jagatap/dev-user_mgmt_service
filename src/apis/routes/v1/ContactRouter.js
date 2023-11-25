const express = require('express');
const router = express.Router();
const  ContactRouterController = require('@controllers/v1/ContactRouter');
router.post('/contact-us', async (req, res, next) => {
    // Extract the necessary data from the request body
    try {
        const result = await ContactRouterController.createContactUs(req, res, next);
    } catch (error) {
        next(error);
    }
});
module.exports = router;
