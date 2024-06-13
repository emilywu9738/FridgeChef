import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const randomName = faker.person.firstName();
const randomEmail = faker.internet.email(randomName);
const hashedPassword = await bcrypt.hash(process.env.USER_PASSWORD, 12);
console.log(randomName, randomEmail, hashedPassword);
