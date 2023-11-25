const mongoose = require('mongoose');
const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
        default: null
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String,
        default: null
    },
    message: {
        type: String,
        default: null
    }
});
const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
