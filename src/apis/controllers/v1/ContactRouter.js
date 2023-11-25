const HomeService = require('@services/v1/ContactRouter');
const { HttpResponseHandler } = require('intelli-utility');
// Controller function to create
const createContactUs = async (req, res, next) => {
    try {
        
        const ContactDetails = await HomeService.createContactUs(req.body);
        if (!ContactDetails) {
            return HttpResponseHandler.success(req, res, ContactDetails);
        }
        return HttpResponseHandler.success(req, res, ContactDetails);
    } catch (error) {
        next(error);
    }
};
module.exports = {
    createContactUs,
};
