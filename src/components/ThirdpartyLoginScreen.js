import React,{ Component } from "react";
import logo from "../images/app_logo/logo.png";
import styles from "../styles/signup.module.css";
import FormInput from "../components/FormInput";
import {Button,Modal} from "react-bootstrap";
import {userDbRef,auth,db} from "../lib/Firebase";
import {getDocs,query, where,setDoc,doc} from "firebase/firestore";
import { SignupMode } from "./signup";
import SignupBirthdayPart from "./signupBirthdayPart";
import {createUserWithEmailAndPassword} from "firebase/auth";
import createUser from "../helpers/User";
import {nameMaxLen,nameMinLen} from "../constants/constants";
import CryptoJS from "crypto-js";


class ThirdpartyLoginScreen extends Component{
    constructor(props){
        super(props);
        this.state={showPwd:false,disableSubmitBtn:true,hasFinalErr:false,finalErrMsg:"",showBirthdayPart:false,
                    showUsercreationFailed:false};
        this.lastSubmittedInput=undefined;
        this.isFormSubmitted=false;
    }

    handleSubmit=(e)=>{
        e.preventDefault();
        if(!this.isFormSubmitted){
            this.isFormSubmitted=true;
            this.props.setShowSpinner();
            if(this.lastSubmittedInput){
                this.validateInput(this.lastSubmittedInput,this.props.inputs[this.lastSubmittedInput],this.finalInputCheckUp);
            }
            else{
                this.finalInputCheckUp();
            }
        }
        else{
            console.log("form already submitted");
        }
        
        
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
            if(inputName==="password"){
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
    

    validatePwd(callback=null){
        const pwd=this.props.inputs.password;
        if(pwd.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/gi)){
            if(callback) this.props.updateInputStatus("password","isPasswordValid",true,"",callback);
            else this.props.updateInputStatus("password","isPasswordValid",true,"");
        }
        else{
            this.isFormSubmitted=false;
            this.props.updateInputStatus("password","isPasswordValid",false,"Passoword must be at least 8 character long which contain at least one digit,one lowercase letter,one uppercase letter and one special letter.");
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
            this.props.updateInputStatus("fullname","isFullnameValid",false,`Fullname must be ${nameMinLen} and ${nameMaxLen} character.`);
        }
    }

    togglePwdVisibility=(e)=>{
        this.setState((state)=>{
            return {showPwd:!state.showPwd}
        })
    }
    finalInputCheckUp=()=>{
        console.log("submitting form");
        this.setState({hasFinalErr:false,finalErrMsg:""});
        if(!this.props.inputStatus.isUsernameValid){
            this.props.resetShowSpinner();
            this.isFormSubmitted=false;
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.username})
        }
        else if(!this.props.inputStatus.isPasswordValid){
            this.isFormSubmitted=false;
            this.props.resetShowSpinner();
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.password});
        }
        else if(!this.props.inputStatus.isFullnameValid){
            this.isFormSubmitted=false;
            this.props.resetShowSpinner();
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.fullname})
        }
        else{
            this.checkUserByEmail();
            
        }
    }
    
    hideUsercreationFailedModal=()=>{
        this.setState({showUsercreationFailed:false})
    }

    changeSignupMode=async (mode)=>{
        if(mode === SignupMode.infoInputMode){
            this.props.resetPassword();
            this.isFormSubmitted=false;
            this.setState({showBirthdayPart:false});
        }
        else{
            this.isFormSubmitted=true;
            this.props.setShowSpinner();
            try{
                const userCredential=await createUserWithEmailAndPassword(auth,this.props.inputs.emailOrPhone,this.props.inputs.password);
                const pwd=CryptoJS.AES.encrypt(this.props.inputs.password,userCredential.user.uid).toString()
                const user=createUser(userCredential.user.uid,pwd,this.props.inputs.fullname,this.props.inputs.username,
                                    this.props.inputs.emailOrPhone,"",this.props.userImgUrl,this.props.getUserBirthday(),
                                    "google");
                await setDoc(doc(db, "users", userCredential.user.uid), user);
                //move to home page(implement)
                console.log("user created");
            }catch(err){
                this.props.resetShowSpinner();
                this.isFormSubmitted=false;
                this.setState({showUsercreationFailed:true});
            }
            
        }
    }
    async createUserUsingFacebook(){
        try{
            const userCredential=await createUserWithEmailAndPassword(auth,this.props.inputs.emailOrPhone,this.props.inputs.password);
            const pwd=CryptoJS.AES.encrypt(this.props.inputs.password,userCredential.user.uid).toString()
            const user=createUser(userCredential.user.uid,pwd,this.props.inputs.fullname,this.props.inputs.username,
                                this.props.inputs.emailOrPhone,"",this.props.userImgUrl,this.props.getUserBirthday(),
                                "facebook");
            await setDoc(doc(db, "users", userCredential.user.uid), user);
            //move to home page(implement)
            console.log("user created");
        }catch(err){
            this.isFormSubmitted=false;
            this.props.resetShowSpinner();
            this.setState({showUsercreationFailed:true});
        }
    }
    async checkUserByEmail(){
        const email=this.props.inputs.emailOrPhone;
        const q=query(userDbRef,where("email","==",email))
        const querySnapshot=await getDocs(q);
        if(querySnapshot.empty){
            const birthday=this.props.birthday;
            if(birthday.year && birthday.month && birthday.day){
                this.createUserUsingFacebook();
            }
            else{
                this.props.resetShowSpinner();
                this.isFormSubmitted=false;
                this.setState({showBirthdayPart:true})
            }
        }
        else{
            this.props.resetShowSpinner();
            this.isFormSubmitted=false;
           this.setState({hasFinalErr:true,finalErrMsg:`Another account is using ${email}.`})
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
            this.props.updateInputStatus("username","isUsernameValid",false,`Username must be ${nameMinLen} and ${nameMaxLen} character.`);
        }
        
    }
    render(){
        if(this.state.showBirthdayPart){
            return (
                <>
                    <SignupBirthdayPart birthday={this.props.birthday} changeBirthday={this.props.changeBirthday} 
                                changeSignupMode={this.changeSignupMode} resetPassword={this.props.resetPassword} 
                                userReqCount={this.props.userReqCount}/>
                    <UsercreationFailedModal
                        show={this.state.showUsercreationFailed}
                        onHide={this.hideUsercreationFailedModal}
                    />
                </>
            )
        }
        return(
            <div className={styles.signupCont}>
                <img src={logo} className={styles.logo} alt=""/>
                <img src={this.props.userImgUrl} className={styles.profileImg} alt=""/>
                <div className={styles.signupForm}>
                    <form onSubmit={this.handleSubmit} method="POST">

                        <FormInput isInputValid={this.props.inputStatus.isFullnameValid} inputName="fullname" 
                                    inputValue={this.props.inputs.fullname} inputHint="Fullname" inputType="text"
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.fullname} 
                                    invalidMsg={this.props.invalidMsg.fullname} />

                        <FormInput isInputValid={this.props.inputStatus.isUsernameValid} inputName="username" 
                                    inputValue={this.props.inputs.username} inputHint="Username" inputType="text"
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.username} 
                                    invalidMsg={this.props.invalidMsg.username}/>

                        <FormInput isInputValid={this.props.inputStatus.isPasswordValid} inputName="password" 
                                    inputValue={this.props.inputs.password} inputHint="Password" inputType="password" 
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.password} isPwdInput={true} showPwd={this.state.showPwd}
                                    togglePwdVisibility={this.togglePwdVisibility} invalidMsg={this.props.invalidMsg.password}/>

                        <div className="d-grid">
                            <Button variant="primary" size="sm" type="submit"
                                disabled={this.state.disableSubmitBtn}>
                                Sign up
                            </Button>
                        </div>
                        <div className={styles.finalErrMsgCont}>
                            {this.state.hasFinalErr?
                                <span className="text-center">{this.state.finalErrMsg}</span>
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

function UsercreationFailedModal(props) {
    return (
      <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" className="ms-auto fs-6">
            User creation failed
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <p className="text-center" style={{fontSize:"0.875rem",color:"#666"}}>Sorry,something went wrong creating your account. Please try again soon.</p>
        </Modal.Body>
      </Modal>
    );
  }


export default ThirdpartyLoginScreen;