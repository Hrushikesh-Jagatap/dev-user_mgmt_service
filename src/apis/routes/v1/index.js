const express = require('express');

const router = express.Router();
const { AuthManager } = require('intelli-utility');
const UserRouter = require('./Users');
const OtpRouter = require('./otp');
const HomeRouter = require('./HomeRouter')
const PrivateRouter = require('./PrivateRouter');
const ContactRouter = require('./ContactRouter');

router.use('/users', ContactRouter)

router.use('/users', HomeRouter);

router.use('/users', PrivateRouter);

router.use('/users', OtpRouter);

router.use('/users', AuthManager.requiresScopes(['Users', 'SYSTEM', 'ADMIN']), UserRouter);

module.exports = router;
