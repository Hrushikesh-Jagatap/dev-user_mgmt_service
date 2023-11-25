/* eslint-disable no-underscore-dangle */
const {
  ErrorHandler: { INTERNAL_SERVER_ERROR },
  Logger: log,
} = require('intelli-utility');
const { Users } = require('@root/src/apis/models');
// eslint-disable-next-line no-unused-vars
const db = require('@db');
const { default: mongoose } = require('mongoose');
const { UNAUTHORIZED_ACCESS } = require('@ErrorHandler');
const { APP_NAME } = require('@common/utility/constants');
const { isAdmin } = require('@common/utility/adminUtils');
const { DATA_BASE_ERROR } = require('../../../common/libs/ErrorHandler');

const isCallFromAdminApp = async (authPayload, app_name) => {
  // const { app_name } = headers;
  if (app_name !== APP_NAME.ADMIN) {
    return false;
  }
  const { adminData } = authPayload;
  if (
    !adminData ||
    adminData.status !== ADMIN.STATUS.ACTIVE ||
    (adminData.role !== ADMIN.ROLE.ADMIN && adminData.role !== ADMIN.ROLE.SUPER_ADMIN)
  ) {
    throw new UNAUTHORIZED_ACCESS();
  }
  return true;
};

const getRetailerCount = async () => {
  const totalRetailer = await Users.countDocuments({ isActive: true });
  return totalRetailer;
};

const getUsers = async (userIds, args = {}) => {
  log.info({ info: 'Get users service :: inside get user' });
  try {
    let query = {};
    let { q, page, pageSize } = args;
    pageSize = pageSize == 'undefined' || !pageSize ? 100 : pageSize;
    page = page == 'undefined' || !page ? 1 : page;
    const offSet = (page - 1) * pageSize || 0;
    const limit = pageSize || 10;
    let result = {};
    var totalCount = await Users.countDocuments({ status: 'ACTIVE' });
    if (Array.isArray(userIds) && userIds.length) {
      if (q) {
        query = {
          $and: [
            { status: 'ACTIVE' },
            {
              $or: [
                { 'teacherData.userName': { $regex: new RegExp(q, 'i') } },
                { phone: { $regex: new RegExp(q, 'i') } },
              ],
            },
          ],
        };
      } else {
        query = { _id: { $in: userIds }, status: 'ACTIVE' };
      }
      result = await Users.find(query).skip(offSet).limit(limit);
    } else {
      query = q
        ? {
            status: 'ACTIVE',
            $or: [
              { 'teacherData.userName': { $regex: new RegExp(q, 'i') } },
              { phone: { $regex: new RegExp(q, 'i') } },
            ],
          }
        : {
            status: 'ACTIVE',
          };
      result = await Users.find(query).skip(offSet).limit(limit);
    }
    return { result, totalCount };
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while finding users in DB');
  }
};

const getUserByUserId = async (id) => {
  log.info({ info: 'Get users service :: inside get user by id' });
  try {
    const result = await Users.findById(id).lean();
    return result;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while finding getUserById in DB');
  }
};

const getUserById = async (params) => {
  log.info({ info: 'Get users service :: inside get user by id' });
  try {
    const result = await Users.findOne(params);
    return result;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while finding getUserById in DB');
  }
};

const getUsersById = async (userIds) => {
  log.info({ info: 'Get users service :: inside get user by id' });
  try {
    const result = await Users.find({ _id: { $in: userIds }, status: 'ACTIVE' });
    return result;
  } catch (err) {
    console.log(err);
    throw new DATA_BASE_ERROR('Error while finding getUsersById in DB');
  }
};

const createUser = async (userObj) => {
  log.info({ info: 'user service :: inside create user' });
  try {
    // const { Users } = db.getInstance();
    const user = await Users.create(userObj);
    return user;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while creating user in DB');
  }
};

const deleteUser = async (userId) => {
  log.info({ info: 'user service :: inside delete user' });
  try {
    // const { Users } = db.getInstance();
    const newValues = { status: 'INACTIVE' };
    const result = await Users.updateOne({ _id: userId }, newValues);
    return result;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while deleting the user in DB');
  }
};

// overwrite the existing values
const updateUser = async ({ userId, newValues }) => {
  log.info({ info: 'user service :: inside update user' });
  try {
    // const { Users } = db.getInstance();
    const user = await Users.updateOne({ _id: userId }, newValues);
    return user;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while updating the user in DB');
  }
};

const findOneAndUpdate = async (conditions, update, options) => {
  log.info({ info: 'User Service :: Inside findOneAndUpdate' });
  try {
    // const { Users } = db.getInstance();
    const result = await Users.findOneAndUpdate(conditions, update, options);
        console.log(result);
    return result;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while findOne and update in the DB');
  }
};

const findOne = async (conditions) => {
  log.info({ info: 'user service :: inside find one user' });
  try {
    // const { Users } = db.getInstance();
    const result = await Users.findOne(conditions);
    return result;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while finding the user in the db');
  }
};

const userHasAdminAccess = async ({ phone, headers, whichAdminRoleType }) => {
  log.info({ info: 'Inside user has admin access' });
  const { app_name } = headers;
  if (app_name !== APP_NAME.ADMIN) {
    return { status: false, user: {} };
  }
  // const conditions = { phone };
  // const user = await Users.findOne(conditions);

  // if (!user || !isAdmin(user.adminData.status, user.adminData.role, whichAdminRoleType)) {
  //   throw new UNAUTHORIZED_ACCESS();
  // }
  // return { user, status: true };
  return { status: true, user: {} };
  
  // const conditions = { phone };
  // const user = await Users.findOne(conditions);
  // if (!user || !isAdmin(user.adminData.status, user.adminData.role, whichAdminRoleType)) {
  //   throw new UNAUTHORIZED_ACCESS();
  // }
  // return { user, status: true };
};

const upsertUser = async ({ phone, appName}) => {
  log.info({ info: 'User Service: inside upsert User' });
  try {
    // const { Users } = db.getInstance();
    const conditions = { phone, appName, status: 'ACTIVE' };
    const update = { phone };
    const options = { upsert: true, new: true };
    let isNewUser = false;
    let user;
    const prevUser = await Users.find({ phone: phone, status: 'ACTIVE' });
    if (prevUser.length) {
      user = await Users.findOneAndUpdate(conditions, update, options);
      isNewUser = false;
    } else {
      user = await Users.create(conditions);
      isNewUser = true;
    }

    return Object.freeze({
      phone,
      userId: user._id.toString(),
      isNewUser,
    });
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while upserting the user in DB');
  }
};

// updating the user type on employee delete in user collections
const updateUserType = async ({ userId }) => {
  log.info({ info: 'update user type' });
  try {
    // const { Users } = db.getInstance();
    const user = await Users.updateOne({ userId }, { userType: 'INDIVIDUAL' });
    return user;
  } catch (err) {
    throw new DATA_BASE_ERROR('Error while upserting the error');
  }
};


module.exports = {
  getUsers,
  getUserById,
  getUsersById,
  getRetailerCount,
  userHasAdminAccess,
  createUser,
  deleteUser,
  updateUser,
  findOneAndUpdate,
  findOne,
  upsertUser,
  updateUserType,
  isCallFromAdminApp,
  getUserByUserId,

};
