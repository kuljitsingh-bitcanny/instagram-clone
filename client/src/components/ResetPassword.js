import React ,{useContext,useRef,useState} from 'react';
import styles from "../styles/resetPassword.module.css";
import { DISPLAY_MODE } from '../App';
import { AuthContext } from '../context/AuthProvider';
import logo from "../images/app_logo/logo.png";
import FormInput from './FormInput';
import LoaderButton from './LoaderButton';
import { Button } from 'react-bootstrap';
import { updatePassword } from 'firebase/auth';
import { auth, forgotPwdDbRef, userDbRef } from '../lib/Firebase';
import CryptoJS from 'crypto-js';
import { deleteDoc, doc, setDoc, updateDoc ,getDoc} from 'firebase/firestore';
import { invalidToken,changeWebLocation,getEncryptedToken } from '../constants/constants';
import {createExistingUser} from '../helpers/User';
import { createUserWithEmailAndPassword } from 'firebase/auth';


export default function ResetPassword({user,setMode,setInvalidTokenMsg,token,oneClickLogin}) {
    console.log(oneClickLogin)
    const {changeDisplayMode,checkAndChangeDisplayMode}=useContext(AuthContext);
    const [passwords,setPasswords]=useState({password1:"",password2:""});
    const [invalidPwdMsg,setInvalidPwdMsg]=useState("");
    const [showSpinner,setShowSpinner]=useState(false);
    const isFormSubmitted=useRef(false);
    const handleChange=(e)=>{
        setPasswords(()=>{return {...passwords,[e.target.name]:e.target.value}});
    }
    const handleSubmit=async (e)=>{
        e.preventDefault();
        if(!isFormSubmitted.current){
            isFormSubmitted.current=true;
            setShowSpinner(true);
            if(passwords.password1.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/gi)){
                if(passwords.password1 !==passwords.password2){
                    setInvalidPwdMsg("Please make sure both passwords match.");
                    setShowSpinner(false);
                    isFormSubmitted.current=false;
                }
                else{
                    if(oneClickLogin){
                        handlePasswordResetForOneClickLogin();
                    }
                    else{
                        handlePasswordReset();
                    }
                }
            }
            else{
                setShowSpinner(false);
                isFormSubmitted.current=false;
                setInvalidPwdMsg("Passoword must be at least 8 character long which contain at least one digit,one lowercase letter,one uppercase letter and one special letter.")
            }
        }
    }
    const handlePasswordResetForOneClickLogin=async ()=>{
        const prevPwd=CryptoJS.AES.decrypt(user.password,user.userId).toString(CryptoJS.enc.Utf8);
        if(prevPwd === passwords.password1){
            setInvalidPwdMsg("Create a new password that isn't your current password.");
            setShowSpinner(false);
            isFormSubmitted.current=false;
        }
        else{
            try{
                const curUser=auth.currentUser;
                const resp1=await updatePassword(curUser,passwords.password1);
                const newPwd=CryptoJS.AES.encrypt(passwords.password1,user.userId).toString();
                const docRef=doc(userDbRef,user.userId);
                const resp2=await updateDoc(docRef,{"password":newPwd});
                console.log(resp1,resp2,token);
                await deleteDoc(doc(forgotPwdDbRef,token));
                //changeDisplayMode(DISPLAY_MODE.HOME_MODE);
                window.location="/"; //login in user with new password

            }catch(err){
                console.log(err)
                setMode(invalidToken);
                setInvalidTokenMsg({btnName:"Log in",header:"Error",body:"This page could not be loaded. If you have cookies disabled in your browser, or you are browsing in Private Mode, please try enabling cookies or turning off Private Mode, and then retrying your action."});
            }

        }
    }
    const handlePasswordReset=async ()=>{
        try{
            const resp=await fetch(`${process.env.REACT_APP_DEL_URL}?token=${getEncryptedToken(user.userId)}`);
            const data=await resp.json();
            const userCredential=await createUserWithEmailAndPassword(auth,user.email,passwords.password1);
            const prevUserCred=await getDoc(doc(userDbRef,user.userId));
            const prevUser=prevUserCred.data();
            const newPwd=CryptoJS.AES.encrypt(passwords.password1,userCredential.user.uid).toString();
            const newUser=createExistingUser(userCredential.user.uid,prevUser,newPwd);
            console.log(prevUser,newUser);
            await setDoc(doc(userDbRef,userCredential.user.uid),newUser);
            await deleteDoc(doc(userDbRef,user.userId));
            await deleteDoc(doc(forgotPwdDbRef,token));
            changeWebLocation("/");
           // if(!data.status) throw new Error();
            console.log(data);
        }catch(err){
            console.log(err)
            setMode(invalidToken);
            setInvalidTokenMsg({btnName:"Log in",header:"Error",body:"This page could not be loaded. If you have cookies disabled in your browser, or you are browsing in Private Mode, please try enabling cookies or turning off Private Mode, and then retrying your action."});
        }
        
        //
        // const 
        // const userCredential=await getDoc(doc(userDbRef,user.userId));
        // const data=userCredential.data();
        // 
        // console.log(user,userCredential)
    }
  return (
    <div className={styles.mainParent}>
        <div className={styles.navbarParent}>
            <div>
                <div className={styles.navbarIcon} >
                    <button type="button" onClick={e=>changeWebLocation("/")}><img src={logo} alt=""/></button>
                </div>
                <div className={styles.navbarLogin}>
                    {!oneClickLogin &&
                        <Button variant="link" type="button" onClick={e=>changeWebLocation("/")}className="text-decoration-none fs-5">Log in</Button> 
                    }
                </div>
            </div>
        </div>
        <div className={styles.resetPwdContainer}>
            {oneClickLogin?
                <div className={styles.resetPwdWrapperOneClick}>
                    <img src={user.imgUrl} alt=""/>
                    <h6>{user.name}</h6>
                    {invalidPwdMsg.length>0 && 
                        <p className="mb-1">{invalidPwdMsg}</p>
                    }
                    <form onSubmit={handleSubmit} method="POST">
                        <FormInput isInputValid={true} inputName="password1" inputType="password"
                                    inputValue={passwords.password1} handleChange={handleChange}
                                    inputHint="New Password" isValidationReq={false}/>

                        <FormInput isInputValid={true} inputName="password2" inputType="password"
                                    inputValue={passwords.password2} handleChange={handleChange}
                                    inputHint="Confirm New Password" isValidationReq={false}/>
                        <LoaderButton btnName="Change Password" showSpinner={showSpinner} type="submit"
                                    isDisabled={!(passwords.password1.length && passwords.password2.length)}/>
                    </form>
                    <Button variant="link" className="text-decoration-none mt-2 mb-4" onClick={e=>changeWebLocation("/")}>
                        SKIP
                    </Button>
                </div>:
                <div className={styles.resetPwdWrapper}>
                    <img src={logo} alt=""/>
                    {invalidPwdMsg.length>0 && 
                        <p className="mb-1">{invalidPwdMsg}</p>
                    }
                    <form onSubmit={handleSubmit} method="POST">
                        <FormInput isInputValid={true} inputName="password1" inputType="password"
                                    inputValue={passwords.password1} handleChange={handleChange}
                                    inputHint="New Password" isValidationReq={false}/>

                        <FormInput isInputValid={true} inputName="password2" inputType="password"
                                    inputValue={passwords.password2} handleChange={handleChange}
                                    inputHint="Confirm New Password" isValidationReq={false}/>
                        <LoaderButton btnName="Reset Password" showSpinner={showSpinner} type="submit"
                                    isDisabled={!(passwords.password1.length && passwords.password2.length)}/>
                    </form>
                </div>
            }
            {showSpinner && <div className={styles.invLoader}></div>}
        </div>
    </div>
  );
}
