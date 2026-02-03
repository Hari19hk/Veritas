import admin from "firebase-admin";

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!storageBucket) {
  throw new Error("FIREBASE_STORAGE_BUCKET not set");
}

if (!serviceAccountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON not set");
}

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });
}

export const db = admin.firestore();
export const storage = admin.storage();
