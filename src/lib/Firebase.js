import {initializeApp} from "firebase/app";
import { getAuth,onAuthStateChanged} from "firebase/auth";
import {getFirestore,collection} from "firebase/firestore";
import {getStorage} from "firebase/storage";


const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain:process.env.REACT_APP_AUTH_DOMAIN,
    projectId:process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MESUREMENT_ID
  };

  const app=initializeApp(firebaseConfig);
  const auth=getAuth()
  const db=getFirestore();
  const storage=getStorage();
  const userDbRef=collection(db,'users');

  export default app;
  export {userDbRef,auth,db,onAuthStateChanged};