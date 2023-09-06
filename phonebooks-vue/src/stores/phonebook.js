import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.VITE_FIREBASE_API_KEY,
    authDomain: "phonebooks-vue.firebaseapp.com",
    projectId: "phonebooks-vue",
    storageBucket: "phonebooks-vue.appspot.com",
    messagingSenderId: "945779097567",
    appId: "1:945779097567:web:46062b647e722cadc70e6a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;