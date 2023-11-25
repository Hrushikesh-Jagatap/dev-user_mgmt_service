const mongoose = require('mongoose');
const { ADMIN } = require('@common/utility/constants');

const UserSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },

    phone: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
    },

    adminData: {
           isOtpVerified: {
        type: Boolean,
        default: false,
      },

      lastLogin: {
        type: Date,
      },
      // status: {
      //   type: String,

      //   default: ADMIN.STATUS.INACTIVE,
      // },
      // role: {
      //   type: String,

      //   default: ADMIN.ROLE.NON_ADMIN,
      // },
    },
    teacherData: {
      isOtpVerified: {
        type: Boolean,
        default: false,
      },

      lastLogin: {
        type: Date,
      },
    },

    studentData: {
      isOtpVerified: {
        type: Boolean,
        default: false,
      },

      lastLogin: {
        type: Date,
      },
    },

    appName: {
      type: String,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
