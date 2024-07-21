import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import fridge from './routers/fridge.js';
import user from './routers/user.js';
import { initializeSocket } from './utils/socket.js';

const app = express();

const PORT = 8080;

mongoose.connect(process.env.MONGOOSE_CONNECT);

const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // eslint-disable-next-line no-console
  console.log('Database connected');
});

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

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  // eslint-disable-next-line no-param-reassign
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).send(err.message);
  // eslint-disable-next-line no-console
  console.error(err);
});

const { server } = initializeSocket(app);

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
