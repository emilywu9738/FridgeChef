import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// import recipeAPI from './routers/recipeAPI.js';
import fridge from './routers/fridge.js';
import user from './routers/user.js';

const app = express();

const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

// const API_VERSION = '1.0';
// app.use(`/api/${API_VERSION}/recipe`, recipeAPI);
app.use('/fridge', fridge);
app.use('/user', user);

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).send(err.message);
  console.error(err);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
