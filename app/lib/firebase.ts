// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3cXWhgISmH56xqAQVGd9v6VsC0QYsfvg",
  authDomain: "project-903120645575.firebaseapp.com",
  projectId: "project-903120645575",
  storageBucket: "project-903120645575.appspot.com",
  messagingSenderId: "903120645575",
  appId: "1:903120645575:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
