const { Logger: log } = require("intelli-utility");


const IsNewUser = (user, app_version_code, app_name) => {
  log.info({info: `App Update :: Inside Is New User${app_name}`})
  if (user === null || typeof user === 'undefined') {
    return false;
  }
  if (app_name === 'teacherApp') {
    return !user.teacherData.isOtpVerified;
  }
  if (app_name === 'studentApp') {
    return !user.studentData.isOtpVerified;
  }
  if(app_name === 'admin') {
    return !user.adminData.isOtpVerified;
  }
  return true;
};

const AppData = async (app_version_code, app_name, user, newValues) => {
  log.info({info: 'App Update :: Inside App Data'})
  const isOtpVerified = newValues ? newValues : false;
  if (app_name === 'teacherApp') {
    const prevAppData = user === null || typeof user === 'undefined' ? null : user.teacherData;

    return Object.freeze({
      teacherData: {
        ...prevAppData,
        isOtpVerified,
        lastLogin: new Date(),
      },
    });
  }

  if (app_name === 'studentApp') {
    const prevAppData = user === null || typeof user === 'undefined' ? null : user.studentData;

    return Object.freeze({
      studentData: {
        ...prevAppData,
        isOtpVerified,
        lastLogin: new Date(),
      },
    });
  }

  if (app_name === 'admin') {
    const prevAppData = user === null || typeof user === 'undefined' ? null : user.adminData;
    return Object.freeze({
      adminData: {
        ...prevAppData,
        isOtpVerified,
        lastLogin: new Date(),
      },
    });
  }

};

const UpdateAppData = async (app_name, app_version_code, user, newValues) => {
  if (app_name === 'teacherApp') {
    const newAppData = 'teacherData' in newValues ? newValues.teacherData : user.teacherData;
    Object.assign(user.teacherData, newAppData);
  }
  if (app_name === 'studentApp') {
    const newAppData = 'studentData' in newValues ? newValues.studentData : user.studentData;
    Object.assign(user.studentData, newAppData);
  }

  return Object.freeze(user);
};


module.exports = {
  AppData,
  IsNewUser,
  UpdateAppData,
};
