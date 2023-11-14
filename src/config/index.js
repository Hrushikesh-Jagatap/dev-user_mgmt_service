const dotenv = require('dotenv');
const { AccessEnv } = require('../common/utility');
const packageJSON = require('../../package.json');

const PACKAGE_VERSION = packageJSON.version;
dotenv.config({ silent: process.env.NODE_ENV === 'test' });

const ENV = AccessEnv('ENV'); // Configuration.isTest = process['env']['NODE_ENV'] === 'test'
const BUILD_NUMBER = AccessEnv('BUILD_NUMBER');

const HOST = AccessEnv('HOST');
const HOST_PORT = AccessEnv('HOST_PORT');
const HOST_SERVICE_NAME = AccessEnv('HOST_SERVICE_NAME');

const MONGO_URL = AccessEnv('MONGO_URL');

const HS256_TOKEN_SECRET = AccessEnv('HS256_TOKEN_SECRET');
const ACCESS_TOKEN_EXPIRESIN = AccessEnv('ACCESS_TOKEN_EXPIRESIN');
const REFRESH_TOKEN_EXPIRESIN = AccessEnv('REFRESH_TOKEN_EXPIRESIN');

const AWS_BUCKET = AccessEnv('AWS_BUCKET');
const AWS_EXPIRATION = AccessEnv('AWS_EXPIRATION');
const CDN_URL = AccessEnv('CDN_URL');
const MEDIA_S3 = AccessEnv('MEDIA_S3');
const BIZ_BASE_URL = AccessEnv('BIZ_BASE_URL');

const LOAD_BALANCER = AccessEnv('LOAD_BALANCER');

const student = AccessEnv('student');
const teacher = AccessEnv('teacher')
const auth = AccessEnv('auth');
const ms = AccessEnv('ms');
const SYSTEM_TOKEN = AccessEnv('SYSTEM_TOKEN');

const QUEUE_URL = AccessEnv('QUEUE_URL');
const SESSION_NAME = AccessEnv('SESSION_NAME', 'logger_session');

module.exports = {
  packageVersion: PACKAGE_VERSION,
  isTest: ENV === 'test',
  env: ENV, // ['production'].includes(process['env']['NODE_ENV'])
  // apm: 'false', // const apmConfiguration = Configuration.apm;
  node: {
    url: `${HOST}:${HOST_PORT}`,
    pathPrefix: `/${HOST_SERVICE_NAME}/apis`,
    host: HOST,
    port: HOST_PORT,
    serviceName: HOST_SERVICE_NAME,
    buildNumber: BUILD_NUMBER,
    loadBalancer: LOAD_BALANCER,
    auth:auth,
    student:student,
    teacher:teacher,
    ms:ms,
  },

  mongodb: {
    url: MONGO_URL,
  },
  jwt: {
    HS256_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRESIN,
    REFRESH_TOKEN_EXPIRESIN,
  },

  aws: {
    s3: {
      bucket: AWS_BUCKET,
      urlExpirationTime: AWS_EXPIRATION,
    },
    queue_url: QUEUE_URL,
    cdnUrl: CDN_URL,
  },
  systemToken: SYSTEM_TOKEN,
  loadBalancer: LOAD_BALANCER,
  student: student,
  teacher:teacher,
  auth:auth,
  ms:ms,
  sessionName: SESSION_NAME,
  media_s3: MEDIA_S3,
  bizBaseUrl: BIZ_BASE_URL,
};
