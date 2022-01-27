import React ,{useContext,useEffect} from 'react';
import styles from "../styles/loggingUser.module.css";
import logo from "../images/app_logo/logo.png";
import { DISPLAY_MODE } from '../App';
import { AuthContext } from '../context/AuthProvider';
import { Button } from 'react-bootstrap';
import CryptoJS from 'crypto-js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/Firebase';
import { invalidToken, resetPasswordMode,changeWebLocation } from '../constants/constants';


export default function LoggingUser({user,setInvalidTokenMsg,setMode}) {
    const {setCurrentUser}=useContext(AuthContext)
    useEffect(async ()=>{
        console.log(user.password,user.userId)
        const pwd=CryptoJS.AES.decrypt(user.password,user.userId).toString(CryptoJS.enc.Utf8);
        try{
            const userCrediential=await signInWithEmailAndPassword(auth,user.email,pwd);
            setCurrentUser(userCrediential.user);
            console.log(userCrediential,auth.currentUser);
            setMode(resetPasswordMode);
        }catch(err){
            console.log(err)
            setMode(invalidToken);
            setInvalidTokenMsg({btnName:(user?user.name:"Log in"),header:"Error",body:"This page could not be loaded. If you have cookies disabled in your browser, or you are browsing in Private Mode, please try enabling cookies or turning off Private Mode, and then retrying your action."})
        }

    },[])
  return (
    <div>
        <div className={styles.navbarParent}>
            <div>
                <div className={styles.navbarIcon} onClick={e=>changeWebLocation("/")}>
                    <span><i className="fab fa-instagram"></i></span>
                    <span></span>
                    <button><img src={logo} alt=""/></button>
                </div>
                <div className={styles.navbarLogin}>
                    <span><i className="far fa-compass"></i></span>
                    <span><i className="far fa-heart"></i></span>
                    <span><i className="far fa-user"></i></span>
                </div>
            </div>
        </div>
        <div className={styles.msgContainer}>
            <h2>We are logging you in now...</h2>
        </div>
    </div>
  );
}
