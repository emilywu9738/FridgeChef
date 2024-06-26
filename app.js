import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';

import fridge from './routers/fridge.js';
import user from './routers/user.js';

const app = express();

const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use('/fridge', fridge);
app.use('/user', user);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).send(err.message);
  console.error(err);
});

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

let onlineUsers = [];

const addNewUser = (userId, groupId, socketId) =>
  !onlineUsers.some((u) => u.userId === userId) &&
  onlineUsers.push({ userId, groupId, socketId });

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
};

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('newUser', (userInfo) => {
    addNewUser(userInfo.userId, userInfo.groupId, socket.id);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
  });
});

export const getOnlineUsers = () => onlineUsers;

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
