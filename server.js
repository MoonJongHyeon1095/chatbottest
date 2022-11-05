const path = require("path");
const http = require("http");
const express = require("express");

const socketio = require("socket.io");
const redis = require("redis");
const { createClient } = redis;
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const connectRedis = require("connect-redis");
const session = require("express-session");
const RedisStore = connectRedis(session);
const { sessionInfo, redisClient } = require('./utils/redis');
const redisCli = redisClient.v4;

const formatMessage = require("./utils/messages");
require("dotenv").config();
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

(async () => {
    const pubClient = createClient({ url: "redis://127.0.0.1:6379" });
    await pubClient.connect().then(console.info('RedisLocal Connected!'));
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  })();

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(session(sessionInfo));
// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "10조 챗봇";


// Run when client connects
io.on("connection", (socket) => {
 //console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room); //socket.id 가 user의 id가 된다.

    socket.join(user.room);
    
    // 개별 유저에게 보내는 메시지
    socket.emit("message", formatMessage(botName, "채팅방에 들어왔어!"));

    // 그 방에 연결된 모든 유저에게 메시지, 지금 연결한 사람 제외하고
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username}가 채팅방에 들어왔어!`)
      );
      console.log('11111111'),
    // Send users and room info 모든 유저에게
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // 채팅입력
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    console.log('disconnect:',user)
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} 방을 떠났습니다.`)
      );
      console.log('222222222'),
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`${PORT}만큼 사랑해`));
