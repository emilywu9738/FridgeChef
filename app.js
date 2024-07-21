import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import fridge from './routers/fridge.js';
import user from './routers/user.js';
import { initializeSocket } from './utils/socket.js';

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

const { server } = initializeSocket(app);

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
