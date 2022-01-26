import React from "react";
import styles from "../styles/signup.module.css";
import emailConfrmLogo from "../images/app_logo/email_confrm_code.png";
import phoneConfrmLogo from "../images/app_logo/phone_confrm_code.png";
import FormInput  from "./FormInput";
import {userDbRef,auth,db} from "../lib/Firebase";
import {getDocs,query, where,setDoc,doc,} from "firebase/firestore";
import { genNRandmDigit,codeResendSpan} from "../constants/constants";
import emailjs from '@emailjs/browser';
import {createUserWithEmailAndPassword} from "firebase/auth";
import createUser from "../helpers/User";
import { SignupMode } from "./signup";
import CryptoJS from "crypto-js";
import LoaderButton from "./LoaderButton";
import { AuthContext } from "../context/AuthProvider";
import { DISPLAY_MODE } from "../App";

class SignupUserInfoConfrmPart extends React.Component{
    static contextType=AuthContext;
    constructor(props){
        super(props);
        this.state={confirmationCode:"",disableSubmitBtn:true,generatedCode:"",newPhoneNumber:"",isPhoneNumValid:false,
                    verificationMsg:"",showConfirmationCodeForm:true,phoneNumValidationReq:false,phoneNumInvalidMsg:"",
                    isEmailCodeSend:false,isPhoneCodeSend:false,disableCodeResendBtn:true}
        this.timer=null;
        this.isFormSubmitted=false;
    }
    
    toggleShowConfirmationCodeFormWithCapcha=()=>{
        if(!this.props.isUserChooseEmail){
            this.setState(({showConfirmationCodeForm})=> {
                return {showConfirmationCodeForm:!showConfirmationCodeForm,confirmationCode:"",
                        disableSubmitBtn:true,newPhoneNumber:"",phoneNumValidationReq:false,phoneNumInvalidMsg:"",
                        isPhoneNumValid:false,disableCodeResendBtn:false,isPhoneCodeSend:false,
                        verificationMsg:""};
            });
        }
        
    }
    toggleShowConfirmationCodeFormWithoutCapcha=()=>{
        if(!this.props.isUserChooseEmail){
            this.setState(({showConfirmationCodeForm})=> {
                return {showConfirmationCodeForm:!showConfirmationCodeForm,confirmationCode:"",
                        disableSubmitBtn:true,newPhoneNumber:"",phoneNumValidationReq:false,phoneNumInvalidMsg:"",
                        isPhoneNumValid:false,disableCodeResendBtn:false,isPhoneCodeSend:true,verificationMsg:""};
            });
        }
        
    }
    handleSubmit=(e)=>{
        e.preventDefault();
        if(!this.isFormSubmitted){
            this.isFormSubmitted=true;
            this.props.setShowSpinner();
            if(this.state.showConfirmationCodeForm){
                if(this.state.generatedCode != this.state.confirmationCode){
                    this.isFormSubmitted=false;
                    this.props.resetShowSpinner();
                    this.setState({verificationMsg:"That code isn't valid. You can request a new one."});
                }
                else{
                    if(this.props.isUserChooseEmail){
                        this.createNewUserUsingEmail();
                    }
                    else{
                        this.createNewUserUsingPhone();
                    }
                }
            }
            else{
                console.log("validing input")
                this.validateNewPhone(this.changePhoneNumAndShowForm);
            }
        }
        else{
            console.log("form alreqady submitted");
        }
        
    }

    handleChange=(e)=>{
        if(this.state.showConfirmationCodeForm){
            if(e.target.value.length<=6){
                this.setState({confirmationCode:e.target.value,disableSubmitBtn:!(e.target.value.length>0)});
            }
        }
        else{
            this.setState({newPhoneNumber:e.target.value,disableSubmitBtn:e.target.value.length!==13});
        }
    }

    handleBlur=(e)=>{
         if(!this.state.showConfirmationCodeForm){
             this.validateNewPhone();
         }
    }

    handleFocus=(e)=>{
        if(!this.state.showConfirmationCodeForm){
            this.setState({phoneNumValidationReq:false})
        }
    }
    changePhoneNumAndShowForm=()=>{
        this.props.updatePhoneNum(this.state.newPhoneNumber);
        this.toggleShowConfirmationCodeFormWithCapcha();
        this.isFormSubmitted=false;
    }

    goBackToNameMode=(e)=>{
        this.props.resetPassword();
        this.props.changeSignupMode(SignupMode.infoInputMode);
    }

    validateNewPhone(callback=null){
        const compltNum=this.state.newPhoneNumber;
        const numStr=compltNum.replace("+91","");
        const numDigit=parseInt(numStr);
        if(Number.isNaN(numDigit) || compltNum.search("\\+91")===-1 || numStr.length!==10){
            this.setState({
                isPhoneNumValid:false,phoneNumValidationReq:true,
                phoneNumInvalidMsg:"Looks like your phone number may be incorrect. Please try entering your full number including the country code."
            })
            this.props.resetShowSpinner();
            this.isFormSubmitted=false;
        }
        else{
            this.getUsersByPhone(compltNum,callback);
        }
    }
    resetEmailCodeSend=()=>{
        this.setState({isEmailCodeSend:false});
    }
    resetPwdCodeSend=()=>{
        this.setState({isPhoneCodeSend:false});
    }

    sendCodeToUserEmail=()=>{
        if(!this.state.isEmailCodeSend){
            const code=genNRandmDigit(6);
            const params={to_email:this.props.inputs.emailOrPhone,code};
            this.setState({generatedCode:code,disableCodeResendBtn:true,isEmailCodeSend:true, verificationMsg:""});
            emailjs.send(process.env.REACT_APP_EMAIL_SERVICE_ID,process.env.REACT_APP_EMAIL_TEMPLATE_ID,params,
                        process.env.REACT_APP_EMAIL_USER_ID)
                    .then((result)=>{
                        console.log(result);
                        this.setState({disableCodeResendBtn:false});
                        if(this.timer) clearTimeout(this.timer);
                        this.timer=setTimeout(this.resetEmailCodeSend,codeResendSpan);
                    })
                    .catch((err)=>{
                        console.log(err);
                        this.setState({isEmailCodeSend:false,disableCodeResendBtn:false,
                                    verificationMsg:"Something went wrong. Please try again."});
                    });
        }
        else{
            this.setState({verificationMsg:"Please wait a few minutes before you try again."});
        }
        
    }
    async createNewUserUsingPhone(){
        try{
            const email=`${this.props.inputs.emailOrPhone}@email.com`;
            const userCredential= await createUserWithEmailAndPassword(auth,email,this.props.inputs.password);
            const pwd=CryptoJS.AES.encrypt(this.props.inputs.password,userCredential.user.uid).toString();
            const user=createUser(userCredential.user.uid,pwd,this.props.inputs.fullname,this.props.inputs.username,email,
                                    this.props.inputs.emailOrPhone,this.props.userImgurl,this.props.getUserBirthday(),
                                    "phone");
            await setDoc(doc(db, "users", userCredential.user.uid), user);
            console.log(userCredential,"user created",user);
            // move to home page (implement)
            this.context.setCurrentUser(userCredential.user);
            this.context.changeDisplayMode(DISPLAY_MODE.HOME_MODE);
        }
        catch(err){
            console.log(err);
            this.isFormSubmitted=false;
            this.props.resetShowSpinner();
            this.setState({verificationMsg:"Sorry,something went wrong creating your account. Please try again soon."})
        }
        
    }
    async createNewUserUsingEmail(){
        try{
            const userCredential= await createUserWithEmailAndPassword(auth,this.props.inputs.emailOrPhone,this.props.inputs.password);
            console.log(userCredential);
            const pwd=CryptoJS.AES.encrypt(this.props.inputs.password,userCredential.user.uid).toString();
            const user=createUser(userCredential.user.uid,pwd,this.props.inputs.fullname,this.props.inputs.username,
                                    this.props.inputs.emailOrPhone,"",this.props.userImgurl,this.props.getUserBirthday(),
                                    "email");
            await setDoc(doc(db, "users", userCredential.user.uid), user);
            console.log("ueser created" );
            // move to home page (implement)
            this.context.setCurrentUser(userCredential.user);
            this.context.changeDisplayMode(DISPLAY_MODE.HOME_MODE);
        }
        catch(err){
            this.isFormSubmitted=false;
            this.props.resetShowSpinner();
            this.setState({verificationMsg:"Sorry,something went wrong creating your account. Please try again soon."})
        }
        
    }

    async getUsersByPhone(phone,callback=null){
        console.log(phone,":",this.props.inputs.emailOrPhone);
        if(phone !== this.props.inputs.emailOrPhone){
            const q=query(userDbRef,where("phone","==",phone))
            const querySnapshot=await getDocs(q);
            if(querySnapshot.empty){
                if(callback) callback();
                else this.setState({isPhoneNumValid:true,phoneNumValidationReq:true,phoneNumInvalidMsg:"",disableSubmitBtn:false});
                console.log(callback);
            }
            else{
                this.setState({isPhoneNumValid:false,phoneNumValidationReq:true,
                                phoneNumInvalidMsg:"This number isn't available.Please try another."});
                this.props.resetShowSpinner();
                this.isFormSubmitted=false;
            }
        }
        else{
            //implement else part
            this.toggleShowConfirmationCodeFormWithoutCapcha();
            this.props.resetShowSpinner();
            this.isFormSubmitted=false;
        }
        
    }

    sendCodeToUserPhone=async()=>{
        console.log("calling func")
        if(!this.state.isPhoneCodeSend){
            try{
                const code=genNRandmDigit(6);
                const phone=this.props.inputs.emailOrPhone.slice(3);
                this.setState({generatedCode:code,verificationMsg:""});
                const url=`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.REACT_APP_MSG_APP_ID}&sender_id=TXTIND&message=Use ${code} to verify your instagram-clone account.&route=v3&numbers=${phone}`;
                const resp=await fetch(url);
                const rsult=await resp.json();
                if(!rsult.return) throw new Error();
                this.setState({disableCodeResendBtn:false,isPhoneCodeSend:true});
                if(this.timer)clearTimeout(this.timer);
                setTimeout(this.resetPwdCodeSend,codeResendSpan);
            }
            catch(err){
                console.log(err)
                this.setState({isPhoneCodeSend:false,disableCodeResendBtn:false,verificationMsg:"Something went wrong. Please try again."});

            }
        
        }
        else{
            this.setState({verificationMsg:"Please wait a few minutes before you try again."});
        }
             
    }

    componentDidMount(){
        if(!this.props.isUserChooseEmail){
            this.sendCodeToUserPhone();
        }
        else{
            this.sendCodeToUserEmail();
        }
        console.log(this.props.getUserBirthday());

    }
    
    render(){
        return (
            <>
                <div className={`${styles.signupCont} ${styles.infoConfrmCont}`}>
                    <div className="mt-3 mb-3">
                        { this.props.isUserChooseEmail?
                            <img src={emailConfrmLogo}/>:
                            <img src={phoneConfrmLogo}/>
                        }
                    </div>
                    <h6 className="mb-3" style={{fontWeight:"600"}}>
                        {this.state.showConfirmationCodeForm?
                            "Enter Confirmation Code":
                            "Change Phone Number"
                        }
                    </h6>
                    {this.state.showConfirmationCodeForm?
                        <>
                            {this.props.isUserChooseEmail?
                                <p className="text-center mb-0" style={{fontSize:"0.875rem"}}>
                                    Enter the confirmation code we send to {this.props.inputs.emailOrPhone}. 
                                    <button type="button" className={styles.resendCodeBtn} disabled={this.state.disableCodeResendBtn}
                                        onClick={this.sendCodeToUserEmail}>
                                        Resend code
                                    </button>
                                </p>:
                                <p className="text-center mb-0" style={{fontSize:"0.875rem"}}>
                                    Enter the 6-digit code we sent to: {this.props.inputs.emailOrPhone}
                                </p>
                            }
                        </>:
                        <p className="text-center mb-0" style={{fontSize:"0.875rem"}}>
                            Current Phone Number: {this.props.inputs.emailOrPhone}
                        </p>
                    }
                    <div>
                        {this.state.showConfirmationCodeForm?
                            <div>
                                <form onSubmit={this.handleSubmit} method="POST">
                                    <FormInput inputName="confirmationCode" inputValue={this.state.confirmationCode} 
                                                inputHint={this.props.isUserChooseEmail?"Confirmation Code":"######"}
                                                inputType="text" handleChange={this.handleChange} handleBlur={this.handleBlur} 
                                                handleFocus={this.handleFocus} isValidationReq={false} />
                                    <LoaderButton isDisabled={this.state.disableSubmitBtn} btnName={this.props.isUserChooseEmail?"Next":"Confirm"} 
                                                type="submit" showSpinner={this.props.showSpinner}/>
                                    {this.state.verificationMsg &&
                                        <div className={styles.finalErrMsgCont}>
                                            <span className="text-center">{this.state.verificationMsg}</span>
                                        </div>
                                        
                                    }
                                    
                                </form>
                                {this.props.isUserChooseEmail?
                                    <button type="button" className={`${styles.backBtn} mt-3 d-block me-auto ms-auto`} 
                                                onClick={this.goBackToNameMode}>Go Back</button>:
                                    <div className={styles.phoneNumBtnCont}>
                                        <button type="button" onClick={this.toggleShowConfirmationCodeFormWithoutCapcha}>Change Number</button>
                                        <span></span>
                                        <button type="button" onClick={this.sendCodeToUserPhone}
                                            disabled={this.state.disableCodeResendBtn}>Request New Code</button>
                                    </div>
                                }
                            </div>:
                            <div>
                                <form  onSubmit={this.handleSubmit} method="POST">
                                    <FormInput inputName="newNumber" inputValue={this.state.newPhoneNumber} 
                                                inputHint="New phone Number" inputType="text" isInputValid={this.state.isPhoneNumValid}
                                                handleChange={this.handleChange} handleBlur={this.handleBlur} 
                                                handleFocus={this.handleFocus} isValidationReq={this.state.phoneNumValidationReq} 
                                                invalidMsg={this.state.phoneNumInvalidMsg}/>
                                    <LoaderButton isDisabled={this.state.disableSubmitBtn} btnName="Change" type="submit"
                                                    showSpinner={this.props.showSpinner}/>
                                </form>
                                <button type="button" className={`${styles.backBtn}  mt-3 d-block me-auto ms-auto`}
                                    onClick={this.toggleShowConfirmationCodeFormWithoutCapcha}>
                                    Go Back
                                </button>
                               
                            </div>
                        }
                    </div>
                </div>
            </>
            )
    }
}

export default SignupUserInfoConfrmPart;