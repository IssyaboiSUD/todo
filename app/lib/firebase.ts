// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3cXWhgISmH56xqAQVGd9v6VsC0QYsfvg",
  authDomain: "focus-50300.firebaseapp.com",
  projectId: "focus-50300",
  storageBucket: "focus-50300.firebasestorage.app",
  messagingSenderId: "903120645575",
  appId: "1:903120645575:web:b40eeb582ad8117cc4bde2",
  measurementId: "G-CXSNBQF6KC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);


export default app;
