import express from 'express';
import cors from 'cors';

// import recipeAPI from './routers/recipeAPI.js';
import fridge from './routers/fridge.js';
import user from './routers/user.js';

const app = express();

const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);

// const API_VERSION = '1.0';
// app.use(`/api/${API_VERSION}/recipe`, recipeAPI);
app.use('/fridge', fridge);
app.use('/user', user);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
