const nodemailer = require('nodemailer');
const { PDFDocument, rgb } = require('pdf-lib');

// Function to send email with the data as a PDF attachment
const sendEmailWithPDF = async (data) => {

    const { name, phoneNumber, subject, language, grade, targetExam, priceLimit, pinCode, address, email, pricePerHour } = data;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const text =
        `Name:          ${name}
    Phone Number:  ${phoneNumber}
    Subject:       ${subject}
    Language:      ${language}
    Grade:         ${grade}
    Target Exam:   ${targetExam}
    Price Limit:   ${priceLimit}
    Pincode:       ${pinCode}
    Address:       ${address}
    Email:         ${email}
    PricePerHour:  ${pricePerHour}`;

    page.drawText(text, { x: 50, y: 500 });

    const pdfBytes = await pdfDoc.save();

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'aryan.amit0824@gmail.com',
            pass: 'fzxw utgl tvvl xbsi'
        }
    });

    let mailOptions = {
        from: 'aryan.amit0824@gmail.com',
        to: email,
        subject: 'Home Tuition Details',
        text: 'Please find the attached PDF with the Home Tuition Details',
        attachments: [
            {
                filename: 'hometuition_details.pdf',
                content: pdfBytes
            }
        ]
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


const sendEmailWithPDFPrivate = async (data) => {
    const { name, phoneNumber, subject, language, grade, targetExam, priceLimit, email, pricePerHour, pinCode, address } = data;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const text = `Name:          ${name}
Phone Number:  ${phoneNumber}
Subject:       ${subject}
Language:      ${language}
Grade:         ${grade}
Target Exam:   ${targetExam}
Price Limit:   ${priceLimit}
Pincode:       ${pinCode}
Address:       ${address}
Email:         ${email}
PricePerHour:  ${pricePerHour}`;

    page.drawText(text, { x: 50, y: 500 });

    const pdfBytes = await pdfDoc.save();

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'aryan.amit0824@gmail.com',
            pass: 'fzxw utgl tvvl xbsi'
        }
    });

    try {
        let info = await transporter.sendMail({
            from: 'aryan.amit0824@gmail.com',
            to: email,
            subject: 'Private Tuition Details',
            text: 'Please find the attached PDF with the Home Tuition Details',
            attachments: [
                {
                    filename: 'privatetuition_details.pdf',
                    content: pdfBytes
                }
            ]
        });
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    sendEmailWithPDF,
    sendEmailWithPDFPrivate
};
