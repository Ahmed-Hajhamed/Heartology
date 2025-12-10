import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 1. Go to Firebase Console > Project Settings > General
// 2. Scroll down to "Your apps" and copy the "firebaseConfig" object
// 3. Paste it here:
const firebaseConfig = {
  apiKey: "AIzaSyC6Glxc6nA_F_KYmVfy80FphiqjDSF6ekM",
  authDomain: "heartology-9.firebaseapp.com",
  projectId: "heartology-9",
  storageBucket: "heartology-9.firebasestorage.app",
  messagingSenderId: "895616500800",
  appId: "1:895616500800:web:46f29ee1da3dcb720d4ba5",
  measurementId: "G-5ZW39HKDJG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;