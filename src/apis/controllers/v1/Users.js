/* eslint-disable no-param-reassign */
const {
  apiServices,
  ErrorHandler: { INTERNAL_SERVER_ERROR },
  Logger: log,
} = require('intelli-utility');

const {
  ref_ms: { onStatusUpdate },
} = apiServices;

const { UsersService, ConsumerService, RetailerService } = require('@services/v1');
const { UNAUTHORIZED_ACCESS } = require('@ErrorHandler');
const { APP_NAME, ADMIN } = require('@common/utility/constants');
const { userStatus } = require('@constants');
const { UpdateAppData, checkProfileCompletion, AppData } = require('./AppUpdate');
const { error } = require('intelli-utility/src/common/libs/HttpResponseHandler');

const getUsers = async (args) => {
  log.info({ info: 'users Controller :: inside get user' });
  try {
    const { type, userIds, pageSize } = args;
    if (userIds !== null && userIds !== undefined) {
      const userIDs = userIds.split(';');
      return UsersService.getUsers(userIDs, { pageSize });
    }
    if (type === 'retailer') {
      const retailers = await OnBoardingService.retailers();
      const retailerInformations = await UsersService.getUsers(retailers, args);
      return retailerInformations;
    }
    return null;
  } catch (error) {
    if (error.key === 'ums') {
      return error;
    }
    throw new INTERNAL_SERVER_ERROR(error);
  }
};

const getUserById = async (args) => {
  log.info({ info: 'user controller :: inside get user by id' });
  const { userId } = args;
  const params = {};
  if (userId.length === 10) {
    params.phone = userId;
  } else {
    params._id = userId;
  }
  params.status = userStatus.ACTIVE;
  return UsersService.getUserById(params);
};

const getUsersById = async (args) => {
  log.info({ info: 'User controller :: inside get user by id' });
  let { userIds } = args;
  let users = await UsersService.getUsersById(userIds);
  users = users.map((user) => {
    return {
      phone: user.phone,
      _id: user._id,
    };
  });
  return users;
};

const createUser = async (user) => UsersService.createUser(user);

const deleteUser = async ({ userId }) => UsersService.deleteUser(userId);

const updateUser = async (args) => {
  log.info({ info: 'update user controller :: inside upadte user' });
  if ((args.phone && args.alternatePhone == args.phone) || args.alternatePhone == args.user.phone) {
    const myError = new INTERNAL_SERVER_ERROR();
    myError.message = 'Phone number same';
    throw myError;
  }
  const { app_version_code, app_name, userId, user, basicInformation, teacherData, authorization } = args;
  const newValues = { basicInformation, teacherData };
  const userData = await UsersService.getUserByUserId(userId);
  const headers = { app_version_code, app_name, authorization };

  const conditions = { _id: userId, status: userStatus.ACTIVE };
  const updatedAppData = await UpdateAppData(app_name, app_version_code, userData, newValues);
  const options = { new: true };
  const updatedUser = await UsersService.findOneAndUpdate(conditions, updatedAppData, options);
  let proData = { conditions, updatedAppData, options };

  const profileCompletion = checkProfileCompletion(app_name, app_version_code, userData);
  if (profileCompletion) {
    // calling referral managemet : on profile_completion
    onStatusUpdate({
      body: {
        userType: user.userType,
        phone: user.phone,
        stage: 'profile_completion',
        userId: user.userId,
        flyyUserId: user.flyyUserId,
        segmentId: user.segmentId,
      },
      headers,
    });

    const profileCompletionUpdate = await AppData(app_version_code, app_name, updatedUser, {
      isProfileCompleted: true,
    });
    UsersService.findOneAndUpdate(conditions, profileCompletionUpdate, options);

    proData = { conditions, updatedAppData, profileCompletionUpdate, options };
  }
  if (app_name == 'householdApp') {
    ConsumerController.createProfile({ userId, proData });
  }

  if (app_name == 'teacherApp') {
    let shopAndRetailer = await RetailerService.getShopsByRetailerId(userId);
    if (shopAndRetailer && shopAndRetailer.length !== 0) {
      let basicInformation = updatedAppData.basicInformation;
      await RetailerService.updateShopProfile(shopAndRetailer[0].guid, basicInformation);
    }
  }

  return updatedUser;
};

module.exports = {
  getUsers,
  getUserById,
  getUsersById,
  createUser,
  deleteUser,
  updateUser,
};
