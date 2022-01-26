import React ,{useContext,useState,useRef} from 'react';
import styles from "../styles/forgotpwd.module.css";
import logo from "../images/app_logo/logo.png";
import { DISPLAY_MODE } from '../App';
import lockImg from "../images/app_logo/lock.png";
import { Button ,Modal} from 'react-bootstrap';
import FormInput from './FormInput';
import LoaderButton from './LoaderButton';
import {getDocs,query, where,deleteDoc,doc,addDoc} from "firebase/firestore";
import { userDbRef,forgotPwdDbRef,db} from '../lib/Firebase';
import { codeResendSpan,resetPasswordMode,idStartIndx,getEncryptedToken} from '../constants/constants';
import emailjs from '@emailjs/browser';
import { AuthContext } from '../context/AuthProvider';

export default function ForgotPwd() {
  return (
      <>
        <NavrBar />
        <ForgotPwdForm/>
      </>
      
  );
}


function NavrBar(){
    const {checkAndChangeDisplayMode}=useContext(AuthContext);
    return (
        <div className={styles.navbarCont}>
            <div className={styles.navbarInnerCont}>
                <div>
                    <button type="button" onClick={checkAndChangeDisplayMode}>
                        <img src={logo} alt=""/>
                    </button>
                </div>
                <div></div>
            </div>
        </div>
    );
}


function ForgotPwdForm(){
    const {changeDisplayMode}=useContext(AuthContext);
    const [name,setName]=useState("");
    const [formCheckResp,setFormCheckResp]=useState({isFormSubmitted:false,isUserExist:true,showModal:false})
    const [modalContent,setModalContent]=useState({type:"",msgBody1:"",msgBody2:"",msgBody3:""});
    const handleSubmit=async (e)=>{
        e.preventDefault();
        if(!formCheckResp.isFormSubmitted){
            setFormCheckResp(()=>{ return {...formCheckResp,isFormSubmitted:true}});
            const result= await isUserExistByValue(name);
            console.log(name,formCheckResp,result);
            if(result.status){
                if(result.info.search("@")+1){
                    const resp=await checkAndSendResetTokenToEmail(result);
                    if(resp){
                        setModalContent({type:"Email Sent",msgBody1:"we have sent an email to ",
                                    msgBody2:result.info,msgBody3:" with a link to get back into your account."});
                    }
                    else{
                        setModalContent({type:"Email Already Sent",msgBody1:"we have already sent an email to ",
                            msgBody2:result.info,msgBody3:" with a link to get back into your account. Please check your email or try again after some time."});
                    }
                }
                else{
                    const resp=await checkAndSendResetTokenToPhone(result);
                    if(resp){
                        setModalContent({type:"SMS Sent",msgBody1:"we have sent an sms to ",
                                    msgBody2:result.info,msgBody3:" with a link to get back into your account."});
                    }
                    else{
                        setModalContent({type:"SMS Already Sent",msgBody1:"we have already sent an sms to ",
                            msgBody2:result.info,msgBody3:" with a link to get back into your account. Please check your email or try again after some time."});
                    }
                }
                setFormCheckResp(()=>{return{...formCheckResp,showModal:true}});
            }
            else{
                setFormCheckResp(()=>{return{isFormSubmitted:false,isUserExist:false}})
            }
        }
        
    }
    const handleChange=(e)=>{
        setName(e.target.value);
        setFormCheckResp(()=>{return {...formCheckResp,isUserExist:true}});
    }
    const transToLogin=(e)=>{
        changeDisplayMode(DISPLAY_MODE.LOGIN_MODE);
    }
    return(
        <>
            <div className={styles.formMainCont}>
                <div className={styles.formContentCont}>
                    <div className={styles.formContentWrapper}>
                        <img src={lockImg} alt=""/>
                        <h6>Trouble Logging In?</h6>
                        <p className="text-muted pt-1 pb-2 text-center" style={{fontSize:"0.8125rem"}}>Enter your email, phone, or username and we'll send you a link to get back into your account.</p>
                        <form onSubmit={handleSubmit}>
                            <FormInput isInputValid={true} inputName="name" inputType="text"
                                        inputValue={name} handleChange={handleChange}
                                        inputHint="Email, Phone or Username" isValidationReq={false}/>
                            <LoaderButton cssClass="pt-2 pb-2" type="submit" isDisabled={name.length===0}
                                            showSpinner={formCheckResp.isFormSubmitted} btnName="Send Login Link"/>
                        </form>
                        <span className={styles.secondOptn}>OR</span>
                        <Button variant="light" style={{fontSize:"0.875rem",fontWeight:"600"}} 
                                onClick={e=>changeDisplayMode(DISPLAY_MODE.SIGNUP_MODE)}>
                                Create New Account
                        </Button>
                    </div>
                    <div className="d-grid mt-auto w-100">
                        <Button variant="light" size="sm" className={styles.backToLoginBtn} onClick={e=>changeDisplayMode(DISPLAY_MODE.LOGIN_MODE)}>
                            Back To Login
                        </Button>
                    </div>
                    {formCheckResp.isFormSubmitted && <div className={styles.loadder}></div>}
                </div>
                {!formCheckResp.isUserExist && 
                    <div className={styles.invalidUserCont}>
                        User Not Found
                    </div>
                }
            </div>
            <CodeSendModal show={formCheckResp.showModal} onHide={transToLogin} 
                            type={modalContent.type} msgbody1={modalContent.msgBody1} msgbody2={modalContent.msgBody2} 
                            msgbody3={modalContent.msgBody3}/> 
        </>
    );
}

function CodeSendModal(props) {
    return (
      <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        backdrop="static" 
        centered>
        <Modal.Body>
          <h5 className="text-center mt-3">{props.type}</h5>
          <p style={{fontSize:"0.875rem",textAlign:"center"}} className="text-muted">
            <span>{props.msgbody1}</span><span className="fw-bold text-black">{props.msgbody2}</span><span>{props.msgbody3}</span>
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button onClick={props.onHide} variant="link" className="text-decoration-none">OK</Button>
        </Modal.Footer>
      </Modal>
    );
  }

async function isUserExistByValue(value){
    let keyname;
    if(value.search("@")+1) keyname="email";
    else if(value.search("\\+")+1) keyname="phone";
    else keyname="username";
    const q=query(userDbRef,where(keyname,"==",value))
    const querySnap=await getDocs(q);
    console.log(querySnap,keyname)
    if(querySnap.empty){
        return {status:false,info:""};
    }
    else{
        const resp={};
        querySnap.forEach((doc)=>{
            const data=doc.data();
            resp.status=true;
            resp.info=data.phone.length>0?data.phone:data.email;
            resp.id=data.userId;
            resp.name=data.username;
            resp.email=data.email;
            resp.password=data.password;
            resp.imgUrl=data.imgUrl;
            resp.name=data.username;
        })
        return resp;
    }
}
async function checkAndSendResetTokenToEmail(resp){
    const q=query(forgotPwdDbRef,where("userId","==",resp.id));
    const docSnap=await getDocs(q);
    if(docSnap.empty){
        const tokenResp=await sendTokenToEmail(resp);
        return tokenResp;
    }
    else{
        const data=docSnap.docs[0].data();
        const docId=docSnap.docs[0].id;
        const curTime=Date.now();
        const diff=curTime-data.reqTime;
        if(diff>codeResendSpan){
            await deleteDoc(doc(db,"forgotpwd",docId));
            const tokenResp=await sendTokenToEmail(resp);
            return tokenResp;
        }
        else{
           return false;
            
        }
    }


}

async function sendTokenToEmail(resp){
    const userInfo=createUserInfo(resp);
    const docRef=await addDoc(forgotPwdDbRef,userInfo);
    const resetLink=getResetLink(docRef.id);
    const params={username: resp.name,link2:resetLink,link1:`${resetLink}&one_click_login=true`,to_email: resp.info};
    try{
        const resp=await emailjs.send(process.env.REACT_APP_EMAIL_SERVICE_ID,process.env.REACT_APP_EMAIL_TEMPLATE2_ID,params,
                                        process.env.REACT_APP_EMAIL_USER_ID);
        console.log(resp);
        if(resp.status !==200) throw new Error();
        return true;
    }catch(err){
        return false;
    }
    
}

async function checkAndSendResetTokenToPhone(resp){
    const q=query(forgotPwdDbRef,where("userId","==",resp.id));
    const docSnap=await getDocs(q);
    if(docSnap.empty){
        const tokenResp=await sendTokenToPhone(resp);
        return tokenResp;
    }
    else{
        const data=docSnap.docs[0].data();
        const docId=docSnap.docs[0].id;
        const curTime=Date.now();
        const diff=curTime-data.reqTime;
        if(diff>codeResendSpan){
            await deleteDoc(doc(db,"forgotpwd",docId));
            const tokenResp=await sendTokenToPhone(resp);
            return tokenResp;
        }
        else{
           return false;
            
        }
    }


}

async function sendTokenToPhone(resp){
    const userInfo=createUserInfo(resp);
    const docRef=await addDoc(forgotPwdDbRef,userInfo);
    const resetLink=getResetLink(docRef.id,false);
    const phone=resp.info.substring(3);
    const msg=`Tap to get your a/c: ${resetLink}`;
    const url=`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.REACT_APP_MSG_APP_ID}&sender_id=TXTIND&message=${msg}&route=v3&numbers=${phone}`;
    try{
        const resp=await fetch(url);
        const rsult=await resp.json();
        if(!rsult.return) throw new Error();
        return true;
    }catch(err){
        return false;
    }
    
}

function getResetLink(id,isEmail=true){
    const token=getEncryptedToken(id);
    if(isEmail){
        const resetLink=`${window.location.origin}?token=${token}&mode=${resetPasswordMode}`;
        return resetLink;
    }
    else{
        const resetLink=`${window.location.origin}?token=${token}%26mode=${resetPasswordMode}`;
        return resetLink;
    }
    
    
}
function createUserInfo(resp){
    const userInfo={loginCred:resp.info,userId:resp.id,reqTime:Date.now(),email:resp.email,password:resp.password,
                    imgUrl:resp.imgUrl,name:resp.name};
    return userInfo;
}