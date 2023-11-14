const { createUUID } = require('@root/src/common/libs/UUID/UUIDV4');
const { systemToken, loadBalancer ,teacher} = require('@root/src/config');
const { default: axios } = require('axios');

const getTeacher = async (args) => {
  console.log('user id is', args);
  const userId = args.toString();
  // let { userId.toString()} = args
  try {
    const config = {
      method: 'get',
      url: `${loadBalancer}/tms/apis/v1/user/${userId}`,
      headers: {
        app_name: 'teacherApp',
        app_version_code: '101',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${systemToken}`,
      },
    };
    const result = await axios(config);
    if (result?.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

const createTeacher = async (args) => {
   const userid = args.toString();
  console.log('user id is', args);
  try {
    const config = {
      method: 'post',
      url: `${loadBalancer}/tms/apis/v1/teacher-create`,
      headers: {
        app_name: 'teacherApp',
        app_version_code: '101',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${systemToken}`,
      },
      data: {
        userId: userid,
      },
    };
    const result = await axios(config);
    console.log(result.data);
    if (result?.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createTeacher,
  getTeacher,
};
