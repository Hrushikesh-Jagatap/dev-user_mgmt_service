const ContactData = require('@models/Contact');
const { sendEmailWithContact } = require('@common/utility/nodemail')
// Create Home Tuition
const createContactUs = async (contactData) => {
  try {
    const conatct = await ContactData.create(contactData);
    const maail = await sendEmailWithContact(contactData);
    return conatct;
  } catch (error) {
    throw new Error('Internal server error');
  }
};
module.exports = {
    createContactUs,
};
