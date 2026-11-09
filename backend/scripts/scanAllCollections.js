import 'dotenv/config';
import mongoose from 'mongoose';

const BROKEN = [/\uFFFD/, /\?{1,2}[a-zA-Zàáâãèéêìíòóôõùúý]/, /Ã[¡­]/, /Ä[ÆÐÑ]/];
const isBroken = (v) => typeof v === 'string' && BROKEN.some((re) => re.test(v));

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('DB:', db.databaseName, '| collections:', collections.length);

  for (const c of collections) {
    const docs = await db.collection(c.name).find({}).limit(5000).toArray();
    for (const doc of docs) {
      for (const [k, v] of Object.entries(doc)) {
        if (k === '_v' || k === '_id') continue;
        if (typeof v === 'string') {
          if (isBroken(v)) console.log(`BROKEN ${c.name}.${k}:`, JSON.stringify(v));
        } else if (Array.isArray(v)) {
          v.forEach((item, i) => {
            if (typeof item === 'string' && isBroken(item)) console.log(`BROKEN ${c.name}.${k}[${i}]:`, JSON.stringify(item));
            else if (item && typeof item === 'object') {
              for (const [kk, vv] of Object.entries(item)) {
                if (typeof vv === 'string' && isBroken(vv)) console.log(`BROKEN ${c.name}.${k}[${i}].${kk}:`, JSON.stringify(vv));
              }
            }
          });
        } else if (v && typeof v === 'object') {
          for (const [kk, vv] of Object.entries(v)) {
            if (typeof vv === 'string' && isBroken(vv)) console.log(`BROKEN ${c.name}.${k}.${kk}:`, JSON.stringify(vv));
          }
        }
      }
    }
  }
  console.log('--- xong ---');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
