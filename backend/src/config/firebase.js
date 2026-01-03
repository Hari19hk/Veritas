import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccountPath = '/Users/hk/keys/gdg-service-account.json';
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!storageBucket) {
  throw new Error('FIREBASE_STORAGE_BUCKET not set');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
    ),
    storageBucket
  });
}

export const db = admin.firestore();
export const storage = admin.storage();
