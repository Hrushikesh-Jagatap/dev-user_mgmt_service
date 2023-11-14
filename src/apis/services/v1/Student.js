const { createUUID } = require('@root/src/common/libs/UUID/UUIDV4');
const { systemToken, loadBalancer,student } = require('@root/src/config');
const { default: axios } = require('axios');

const getStudent = async (args) => {
  console.log('user id is', args);
  const userId = args.toString();
  try {
    const config = {
      method: 'get',
      url: `${student}/sts/apis/v1/user/${userId}`,
      headers: {
        app_name: 'studentApp',
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

const createStudent = async (args) => {
   const userid = args.toString();
  console.log('user id is', args);
  try {
    const config = {
      method: 'post',
      url: `${student}/sts/apis/v1/student-create`,
      headers: {
        app_name: 'studentApp',
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
  createStudent,
  getStudent,
};
