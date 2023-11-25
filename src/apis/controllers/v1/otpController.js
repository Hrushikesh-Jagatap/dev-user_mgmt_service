const { UsersService, OtpService, ReferService, FavouriteService, RetailerService } = require('@services/v1');
const { env } = require('@config');
const { ENV, ADMIN } = require('@common/utility/constants');
const {
  Logger: log,
  ErrorHandler: { INTERNAL_SERVER_ERROR },
  // apiServices,
  // AuthManager,
  Logger,
} = require('intelli-utility');
const { default: axios } = require('axios');
const VERIFY_OTP_ERROR = require('../../../common/libs/ErrorHandler/VERIFY_OTP_ERROR');

const { bizBaseUrl, auth, loadBalancer } = require('@config');
const { AppData, IsNewUser } = require('./AppUpdate');

const { sendOtpAsync, verifyOTPAsync } = require('../../services/v1/otpServiceAsync');
const { saveFCMToken } = require('../../services/v1/Notification');
const UserController = require('@controllers/v1/Users.js');
const { overArgs } = require('lodash');
const { createTeacher, getTeacher } = require('../../services/v1/Teacher');
const { createStudent, getStudent } = require('../../services/v1/Student')

//const { FavouriteController } = require('.');

 const Token = async ({ headers, params }) => {
    const { userId } = params;
    let a = userId.toString();
    // let { userId.toString()} = args
    try {
      const config = {
        method: 'get',
        url: `${loadBalancer}/auth/apis/v1/token/${a}`,
        headers,
      };
      const data = await axios(config);
      return data;
    } catch (error) {
      console.log(error);
      throw new ORDER_SERVICE_ERROR(error);
    }
  };

const processToSendOtp = async (params) => {
  log.info({ info: { message: 'Otp Controller :: Inside Provess To Send OTP' } });
  const { phone, headers, medium, } = params;
  try {
    let args = {};
    const { status, user } = await UsersService.userHasAdminAccess({
      phone,
      headers,
      whichAdminRoleType: ADMIN.ROLE.ADMIN,
    });

    const appName = headers.app_name;
    // if (status === false) {
      args = await UsersService.upsertUser({ phone, appName });
    // } else {
    //   log.info({ info: 'User Has Admin Access' });
    //   args = user;
    //   args.userId = args._id;
    // }

    let isNewUser = args.isNewUser;

    let consumer = {
      userId: args.userId,
      proData: {},
    };

    if (headers.app_name === 'studentApp' && args.isNewUser) {
      createStudent({ userId: args.userId });
    }

    if (headers.app_name === 'teacherApp' && args.isNewUser) {
      createTeacher({ userId: args.userId });
    }
    if(headers.app_name === 'admin' && args.isNewUser) {
       createTeacher({ userId: args.userId });
    }

    delete args.isNewUser;

    const otpReceived = await OtpService.processToSendOtp({ args, medium });
    const data = {
      isNewUser: args.isNewUser,
    };

    return data;
    // return {
    //   otpReceived,
    //   data: args.isNewUser
    // };
  } catch (err) {
    console.log('error in controller is', err);
    // log.error(`error in inside controller::processToSendOtp method service: ${err}`);
    if (err.key === 'admin') {
      throw err;
    } else {
      throw new VERIFY_OTP_ERROR(err);
    }
  }
};
// const sendOTPOverCall = async (args) => {
//   const otpReceived = await processToSendOtp('sendOTPOverCall', { ...args, medium: MEDIUM.CALL });
//   return otpReceived;
//   // log.info('inside sendOTPOverCall method');
//   // let args;
//   // try {
//   //   args = await UsersService.upsertUser({ phone });
//   //   return OtpService.sendOTPOverCall({ args });
//   // } catch (err) {
//   //   log.error('error in sendOTPOverCall service: %s', err);
//   //   throw new INTERNAL_SERVER_ERROR(err);
//   // }
// };

// const sendOTPOverSms = async (args) => {
//   const otpReceived = await processToSendOtp('sendOTPOverSms', { ...args, medium: MEDIUM.SMS });
//   return otpReceived;
//   // log.info('inside sendOTPOverSMS method');
//   // let response;
//   // try {
//   //   response = await UsersService.upsertUser({ phone });
//   //   return OtpService.sendOTPOverSms({ args: response });
//   // } catch (err) {
//   //   log.error('error in sendOTPOverSMS service: %s', err);
//   //   throw new INTERNAL_SERVER_ERROR(err);
//   // }
// };

const verifyOTP = async ({ otp, phone, deviceId, fcmToken, headers, }) => {
  log.info({ info: 'OTP Controller :: Inside Verify Otp' });

  const { app_version_code, app_name, lat, lon } = headers;

  const { status, user } = await UsersService.userHasAdminAccess({
    phone,
    headers,
    whichAdminRoleType: ADMIN.ROLE.ADMIN,
  });
  // const existingUser = status === false ? await UsersService.findOne({ phone: phone, status: 'ACTIVE' }) : user;
 let existingUser;
  if(status==false){
   existingUser = status === false ? await UsersService.findOne({ phone: phone, status: 'ACTIVE' }) : user;
}
else{
     existingUser = status === true ? await UsersService.findOne({ phone: phone, status: 'ACTIVE' }) : user;
}
  if (!existingUser) {
    // log.info('function: verifyOTP. you have not sent otp but trying to verify');
    log.info({ info: 'OTP Controller :: you have not sent OTP but trying to verify' });
  }
  const userId = existingUser._id;
  let isOtpVerified;
  try {
    isOtpVerified = await OtpService.verifyOTP({
      otp,
      phone,
      userId,
      headers,
    });
  } catch (err) {
    throw new VERIFY_OTP_ERROR();
  }

  const isNewUser = IsNewUser(existingUser, app_version_code, app_name);

  log.info({ info: `OTP Controller :: User is New User or Not ${isNewUser}` });
  // updating OTP verification status for particular App: db structure to be updated here?
  const conditions = { phone: phone, status: 'ACTIVE' };
  const update = await AppData(app_version_code, app_name, existingUser, isOtpVerified);
  // console.log(update)
  const options = { new: true };
  await UsersService.findOneAndUpdate(conditions, update, options);

  // need to discuss here: if it is require or not= can pull the data from api also?
  const userDetails = {
    _id: userId,
  };

  //call Fcm token service to save token
 const data = await saveFCMToken(userId, deviceId, fcmToken, app_name);

  if (data === null) {
    throw new Error('Error while saving FCM Token');
  }

 

  try {
    const authServiceResponse = await Token({
      headers,
      params: {
        userId,
      },
    });
    const credentials = authServiceResponse.data;

    if (app_name === 'teacherApp') {
                  let isadmin = false;

      const existingTeacher = await getTeacher(userId);
    console.log(existingTeacher.data.length)
      if (existingTeacher.data.length==0) {
       const data = await createTeacher(userId,isadmin);
        console.log('+++++++++++++++++++++++++++', data);
        if (data === null || data === undefined) {
          return ('Error while Creating Teacher in db');
        }
      } else {
        console.log('Teacher with userId already exists:', existingTeacher);
      }
    }
    
    if(headers.app_name === 'admin'){
      let isadmin = true;
       const existingTeacher = await getTeacher(userId);
      if (existingTeacher.data.length == 0) {
        const data = await createTeacher(userId,isadmin);
        console.log('+++++++++++++++++++++++++++', data);
        if (data === null || data === undefined) {
          return ('Error while Creating Teacher in db');
        }
      } else {
        console.log('Teacher with userId already exists:', existingTeacher);
      }

        const existingStudent = await getStudent(userId);
      if (existingStudent.data.length == 0) {
        createStudent(userId,isadmin);
      } else {
        console.log('Teacher with userId already exists:', existingStudent);
      }
    }

    if (headers.app_name === 'studentApp') {
            let isadmin = false;

      const existingStudent = await getStudent(userId);
       if (existingStudent.data.length==0) {
        createStudent(userId,isadmin);
      } else {
        console.log('Teacher with userId already exists:', existingStudent);
      }
    }

    return Object.freeze({
      isNewUser,
      ...userDetails,
      ...credentials,
    });
  } catch (err) {
    console.log('error is', err);
    throw new VERIFY_OTP_ERROR(err);
  }
};

const checkIfRegistered = async ({ phone, app_version_code, appName }) => {
  const conditions = { phone };
  const user = await UsersService.findOne(conditions);
  const isNumberRegistered =
    !(user === null || typeof user === 'undefined') && !IsNewUser(user, app_version_code, appName);

  // no registered user found for phoneNumber
  // const isNumberRegistered = ;
  return Object.freeze({ isNumberRegistered });
};

module.exports = {
  processToSendOtp,
  verifyOTP,
  checkIfRegistered,
};
