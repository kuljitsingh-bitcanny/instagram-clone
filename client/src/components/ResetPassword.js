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
import { signInWithEmailAndPassword} from 'firebase/auth';


export default function ResetPassword({user,setMode,setInvalidTokenMsg,token,oneClickLogin}) {
    const {setCurrentUser}=useContext(AuthContext);
    const [passwords,setPasswords]=useState({password1:"",password2:""});
    const [invalidPwdMsg,setInvalidPwdMsg]=useState("");
    const [showSpinner,setShowSpinner]=useState(false);
    const isFormSubmitted=useRef(false);
    const handleChange=(e)=>{
        setPasswords((passwords)=>{return {...passwords,[e.target.name]:e.target.value}});
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
                await updatePassword(curUser,passwords.password1);
                await updateUserPasswordInDb();
                 //login in user with new password

            }catch(err){
                console.log(err)
                setMode(invalidToken);
                setInvalidTokenMsg({btnName:"Log in",header:"Error",body:"This page could not be loaded. If you have cookies disabled in your browser, or you are browsing in Private Mode, please try enabling cookies or turning off Private Mode, and then retrying your action."});
            }

        }
    }
    const handlePasswordReset=async ()=>{
        try{
            const url=process.env.REACT_APP_DEL_URL;
            const reqData={token:getEncryptedToken(user?.userId),
                            pwd:CryptoJS.AES.encrypt(passwords.password1,process.env.REACT_APP_PWD_ENCYP_KEY).toString()};
            const resp=await fetch(url,{method:"POST",headers: {'Content-Type': 'application/json'},body: JSON.stringify(reqData)});
            const data=await resp.json();
            if(!data.status) throw new Error();
            const userCrediential=await signInWithEmailAndPassword(auth,user.email,passwords.password1);
            setCurrentUser(userCrediential.user);
            await updateUserPasswordInDb();
            console.log(data);
        }catch(err){
            console.log(err)
            setMode(invalidToken);
            setInvalidTokenMsg({btnName:"Log in",header:"Error",body:"This page could not be loaded. If you have cookies disabled in your browser, or you are browsing in Private Mode, please try enabling cookies or turning off Private Mode, and then retrying your action."});
        }
        
    }

    const updateUserPasswordInDb=async ()=>{
        const newPwd=CryptoJS.AES.encrypt(passwords.password1,user.userId).toString();
        const docRef=doc(userDbRef,user.userId);
        await updateDoc(docRef,{"password":newPwd});
        await deleteDoc(doc(forgotPwdDbRef,token));
        changeWebLocation("/");
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
