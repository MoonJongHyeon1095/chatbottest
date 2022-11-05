// const moment = require('moment');

// function formatMessage(username, text) {
//   return {
//     username,
//     text,
//     time: moment().format('h:mm a')
//   };
// }

// module.exports = formatMessage;
const { redisClient } = require("../utils/redis");
const redisCli = redisClient.v4;

const dayjs = require('dayjs');
require('dayjs/locale/ko')
dayjs.locale('ko')

formatMessage = (username, text) => {
  
  //await redisClient.set(`${username}`, `${text}`, { EX: 3600 });

  return {
    username,
    text,
    time: dayjs().format("A HH:mm")
  };
}

module.exports = formatMessage;
