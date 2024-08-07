import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import fridgeRouters from './routers/fridgeRouters.js';
import userRouters from './routers/userRouters.js';
import recipeRouters from './routers/recipeRouters.js';
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

app.use('/fridge', fridgeRouters);
app.use('/user', userRouters);
app.use('/recipe', recipeRouters);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  // eslint-disable-next-line no-param-reassign
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).json({ error: err.message });
  // eslint-disable-next-line no-console
  console.error(err);
});

const { server } = initializeSocket(app);

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
