const {
  RequestHandler,
  ErrorHandler: { INTERNAL_SERVER_ERROR },
} = require('intelli-utility');

const { loadBalancer, systemToken,ms } = require('@config');
const saveFCMToken = async (userId, deviceId, fcmToken, appName) => {
  try {
    const payload = {
      userId,
      deviceId,
      fcmToken,
      appName,
    };
    const url = `${ms}/ms/apis/v1/fcm-token`;
    const { data: result } = await RequestHandler.post({ url, data: payload });

    if (result) {
      return false;
    }
    return result;
  } catch (err) {
    console.log("error inside FCM token");
    return false;
  }
};

module.exports = { saveFCMToken };
