import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAtWNYeulsmakSxcqoRHor9KrSUuRIlS0A",
    authDomain: "gdg1-b19ae.firebaseapp.com",
    projectId: "gdg1-b19ae",
    storageBucket: "gdg1-b19ae.firebasestorage.app",
    messagingSenderId: "710429865070",
    appId: "1:710429865070:web:7180d4eb67d9f7b074627f"
  };
  

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
