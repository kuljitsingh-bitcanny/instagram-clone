import React from "react";
import logo from "../images/app_logo/logo.png";
import {Button} from "react-bootstrap";
import FormInput  from "./FormInput";
import styles from "../styles/signup.module.css";
import {userDbRef} from "../lib/Firebase";
import {getDocs,query, where} from "firebase/firestore";
import { SignupMode } from "./signup";
import ThirdpartyLoginbtn from "./ThirdpartyLoginBtn";
import {defaultImgUrl,nameMinLen,nameMaxLen} from "../constants/constants";
import LoaderButton from "./LoaderButton";


class SignupNamePart extends React.Component{
    constructor(props){
        super(props);
        this.state={showPwd:false,disableSubmitBtn:true,hasFinalErr:false,finalErrMsg:"",isFacebookLogin:false};
        this.lastSubmittedInput=undefined;
        this.isFormSubmitted=false;
    }
    handleSubmit=(e)=>{
        e.preventDefault();
        this.props.setShowSpinner();
        if(!this.isFormSubmitted){
            this.isFormSubmitted=true;
            this.props.setUserImgUrl(defaultImgUrl);
            if(this.lastSubmittedInput){
                this.validateInput(this.lastSubmittedInput,this.props.inputs[this.lastSubmittedInput],this.finalInputCheckUp);
            }
            else{
                this.finalInputCheckUp();
            }
        }
        else {
            console.log("form submited");
        }
        
    }
    
    finalInputCheckUp=()=>{
        this.setState({hasFinalErr:false,finalErrMsg:""});
        this.props.resetShowSpinner();
        this.isFormSubmitted=false;
        if(!this.props.inputStatus.isUsernameValid){
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.username})
        }
        else if(!this.props.inputStatus.isEmailOrPhoneValid){
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.emailOrPhone})
        }
        else if(!this.props.inputStatus.isPasswordValid){
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.password});
        }
        else if(!this.props.inputStatus.isFullnameValid){
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.fullname})
        }
        else{
        
            this.props.changeSignupMode(SignupMode.birthdayInputMode);
        }
    }

    togglePwdVisibility=(e)=>{
        this.setState((state)=>{
            return {showPwd:!state.showPwd}
        })
    }

    handleChange=(e)=>{

        this.setState((state)=>{
            const inputs={...this.props.inputs,[e.target.name]:e.target.value};
            const disableSubmitBtn=Object.values(inputs).some((value)=>value.length===0);
            return {disableSubmitBtn,showPwd:inputs.password.length===0?false:state.showPwd};
        })
        this.props.updateInput(e);
    }

    handleBlur=(e)=>{
        const inputName=e.target.name;
        const inputValue=e.target.value;
        this.lastSubmittedInput=undefined;
        this.validateInput(inputName,inputValue);
        
    }

    handleFocus=(e)=>{
        this.lastSubmittedInput=e.target.name;
        this.setState({hasFinalErr:false,finalErrMsg:""});
        this.props.resetValidation(e.target.name);
    }

    validateInput(inputName,inputValue,callback=null){
        if(inputValue.length>0){
            if(inputName==="emailOrPhone"){
                if(inputValue.search("@")+1){
                    this.validateEmail(callback);
                }
                else{
                    this.validatePhoneNum(callback);
                }
            }
            else if(inputName==="password"){
                this.validatePwd(callback);
            }
            else if(inputName==="fullname"){
                this.validateFullname(callback);
            }
            else if(inputName==="username"){
                this.getUsersByUsername(callback);
            }
        }
        else{
            this.props.resetValidation(inputName);
            this.isFormSubmitted=false;
        }
        
    }
    validateEmail(callback=null){
        const email=this.props.inputs.emailOrPhone;
        if(email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi)){
           this.getUsersByEmail(email,callback);
        }
        else{
            this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",false,"Please enter a valid email address.");
            this.isFormSubmitted=false;
        }
    }


    validatePhoneNum(callback=null){
        const compltNum=this.props.inputs.emailOrPhone;
        const numStr=compltNum.replace("+91","");
        const numDigit=parseInt(numStr);
        if(Number.isNaN(numDigit) || compltNum.search("\\+91")===-1 || numStr.length!==10){
            this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",false,"Looks like your phone number may be incorrect. Please try entering your full number including the country code.");
            this.isFormSubmitted=false;
        }
        else{
            this.getUsersByPhone(compltNum,callback);
        }
    }

    validatePwd(callback=null){
        const pwd=this.props.inputs.password;
        if(pwd.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/gi)){
            if(callback) this.props.updateInputStatus("password","isPasswordValid",true,"",callback);
            else this.props.updateInputStatus("password","isPasswordValid",true,"");
        }
        else{
            this.props.updateInputStatus("password","isPasswordValid",false,"Passoword must be at least 8 character long which contain at least one digit,one lowercase letter,one uppercase letter and one special letter.");
            this.isFormSubmitted=false;
        }
    }

    validateFullname(callback=null){
        const fullname=this.props.inputs.fullname;
        if(fullname.length>nameMinLen && fullname.length<=nameMaxLen){
            if(fullname.match(/[~`!@#$%\^&*)(-+=}\][{|\\:;"'<,>?/]/gi)){
                this.isFormSubmitted=false;
                this.props.updateInputStatus("fullname","isFullnameValid",false,"Fullname can only use letters, numbers, underscores, spaces and periods.");
            }
            else{
                if(callback) this.props.updateInputStatus("fullname","isFullnameValid",true,"",callback);
                else this.props.updateInputStatus("fullname","isFullnameValid",true,"");
            }
        }
        else{
            this.isFormSubmitted=false;
            this.props.updateInputStatus("fullname","isFullnameValid",false,`Fullname must be between ${nameMinLen} and ${nameMaxLen} characters.`);
        }
    }

    responseCallback=(resp)=>{
        
        try{
            console.log(resp);
            const newResp={};
            if(this.state.isFacebookLogin){
                const birthdayArr=resp.birthday.split("/");
                newResp.inputs={emailOrPhone:resp.email,fullname:resp.name,username:"",password:""};
                newResp.birthday={year:birthdayArr[2],month:parseInt(birthdayArr[0])-1,day:birthdayArr[1]};
                newResp.imgUrl=resp.picture.data.url;
            }
            else{
                const profileObj=resp.profileObj;
                newResp.inputs={emailOrPhone:profileObj.email,fullname:profileObj.name,username:"",password:""};
                newResp.birthday={year:"",month:"",day:""};
                newResp.imgUrl=profileObj.imageUrl;
            }
            this.props.setThirdpartyLoginInfo(newResp);
        }
        catch(err){
            this.setState({hasFinalErr:true,finalErrMsg:"Sorry,something went wrong creating your account. Please try again soon."})
        }
        
    }

    async getUsersByEmail(email,callback){
        const q=query(userDbRef,where("email","==",email))
        const querySnapshot=await getDocs(q);
        if(querySnapshot.empty){
            this.props.updateUserChoice(true);
            if(callback) this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",true,"",callback);
            else this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",true,"");
        }
        else{
            this.isFormSubmitted=false;
            this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",false,"This email isn't available.Please try another.");
        }
    }

    async getUsersByPhone(phone,callback){
        const q=query(userDbRef,where("phone","==",phone))
        const querySnapshot=await getDocs(q);
        if(querySnapshot.empty){
            this.props.updateUserChoice(false);
            if(callback) this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",true,"",callback);
            else this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",true,"");
        }
        else{
            this.isFormSubmitted=false;
            this.props.updateInputStatus("emailOrPhone","isEmailOrPhoneValid",false,"This number isn't available.Please try another.");
        }
    }

    async getUsersByUsername(callback){
        const username=this.props.inputs.username;
        if(username.length>nameMinLen && username.length<=nameMaxLen){
            if(username.match(/[~`!@#$%\^&*)(-+=}\][{|\\:;"'<,>?/ ]/gi)){
                this.isFormSubmitted=false;
                this.props.updateInputStatus("username","isUsernameValid",false,"Username can only use letters, numbers, underscores and periods.");
            }
            else{
                const q=query(userDbRef,where("username","==",username));
                const querySnapshot = await getDocs(q);
                if(querySnapshot.empty){
                    if(callback) this.props.updateInputStatus("username","isUsernameValid",true,"",callback);
                    else this.props.updateInputStatus("username","isUsernameValid",true,"");
                }
                else{
                    this.isFormSubmitted=false;
                    this.props.updateInputStatus("username","isUsernameValid",false,"This username isn't available.Please try another.");
                }
            }
            
        }
        else{
            this.isFormSubmitted=false;
            this.props.updateInputStatus("username","isUsernameValid",false,`Username must be between ${nameMinLen} and ${nameMaxLen} characters.`);
        }
        
    }

    
    render(){
        return (
            <div className={styles.signupCont}>
                <img src={logo} className={styles.logo}/>
                <div className={styles.facebookLoginOptn}>
                    <span>Sign up to see photos and videos from your friends.</span>
                        <div className="d-grid">
                        <ThirdpartyLoginbtn responseCallback={this.responseCallback} isFacebookLogin={this.state.isFacebookLogin}
                                        initialMsg={"Sign up"}/>
                            
                    </div>
                </div>
                <span className={styles.secondOptn}>OR</span>
                <div className={styles.signupForm}>
                    <form onSubmit={this.handleSubmit} method="POST">
                        <FormInput isInputValid={this.props.inputStatus.isEmailOrPhoneValid} inputName="emailOrPhone" 
                                    inputValue={this.props.inputs.emailOrPhone} 
                                    inputHint="Phone number or email" inputType="text"
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.emailOrPhone} 
                                    invalidMsg={this.props.invalidMsg.emailOrPhone} />

                        <FormInput isInputValid={this.props.inputStatus.isFullnameValid} inputName="fullname" 
                                    inputValue={this.props.inputs.fullname} 
                                    inputHint="Fullname" inputType="text"
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.fullname} 
                                    invalidMsg={this.props.invalidMsg.fullname} />

                        <FormInput isInputValid={this.props.inputStatus.isUsernameValid} inputName="username" 
                                    inputValue={this.props.inputs.username} 
                                    inputHint="Username" inputType="text"
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.username} 
                                    invalidMsg={this.props.invalidMsg.username}/>

                        <FormInput isInputValid={this.props.inputStatus.isPasswordValid} inputName="password" 
                                    inputValue={this.props.inputs.password} 
                                    inputHint="Password" inputType="password" 
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.password} isPwdInput={true} showPwd={this.state.showPwd}
                                    togglePwdVisibility={this.togglePwdVisibility} invalidMsg={this.props.invalidMsg.password}/>

                        <LoaderButton type="submit" isDisabled={this.state.disableSubmitBtn || this.props.isThirdpartyLogin}
                                        showSpinner={this.props.showSpinner} btnName="Sign up"/>
                       
                        <div className={styles.finalErrMsgCont}>
                            {this.state.hasFinalErr?
                                <span>{this.state.finalErrMsg}</span>
                                :""
                            }
                        </div>
                        <p>By signing up, you agree to our Terms , Data Policy and Cookies Policy .</p>
                        
                    </form>
                </div>
            </div>
        )
    }
}

export default SignupNamePart;