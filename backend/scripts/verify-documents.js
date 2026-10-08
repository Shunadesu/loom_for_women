// Verify: in ra title + description của tất cả LessonDocument
import 'dotenv/config';
import mongoose from 'mongoose';
import LessonDocument from '../src/models/LessonDocument.js';

const MONGO_URI = process.env.MONGODB_URI;
await mongoose.connect(MONGO_URI);
const docs = await LessonDocument.find().select('title description').lean();
for (const d of docs) {
  console.log(`- [${d._id}] ${d.title}`);
}
await mongoose.disconnect();
