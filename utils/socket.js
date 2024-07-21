import { Server } from 'socket.io';
import http from 'http';

let onlineUsers = [];
let io = null;

const addNewUser = (userId, groupId, socketId) =>
  !onlineUsers.some((u) => u.userId === userId) &&
  onlineUsers.push({ userId, groupId, socketId });

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
};

export const initializeSocket = (app) => {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('newUser', (userInfo) => {
      addNewUser(userInfo.userId, userInfo.groupId, socket.id);
    });

    socket.on('disconnect', () => {
      removeUser(socket.id);
    });
  });

  return { server, io };
};

export const getOnlineUsers = () => onlineUsers;
export { io };
