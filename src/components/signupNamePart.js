import React from "react";
import logo from "../images/app_logo/logo.png";
import {Button} from "react-bootstrap";
import FormInput  from "./FormInput";
import styles from "../styles/signup.module.css";
import {userDbRef} from "../lib/Firebase";
import {getDocs,query, where} from "firebase/firestore";

class SignupNamePart extends React.Component{
    constructor(props){
        super(props);
        this.state={showPwd:false,disableSubmitBtn:true,hasFinalErr:false,finalErrMsg:""}
    }
    handleSubmit=(e)=>{
        e.preventDefault();
        this.props.setShowSpinner();
        this.getUsersByUsername(this.props.inputs.username,this.finalInputCheckUp);
        
    }
    finalInputCheckUp=()=>{
        if(!this.props.inputStatus.isUsernameValid){
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.username})
        }
        else if(!this.props.inputStatus.isEmailOrPhoneValid){
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.emailOrPhone})
        }
        else if(!this.props.inputStatus.isPasswordValid){
            this.setState({hasFinalErr:true,finalErrMsg:this.props.invalidMsg.password});
        }
        else{
            this.props.changeSignupMode(2);
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
        this.validateInput(e);
    }

    handleFocus=(e)=>{
        this.setState({hasFinalErr:false,finalErrMsg:""});
        this.props.resetValidation(e);
    }
    validateInput(e){
        if(e.target.value.length>0){
            if(e.target.name==="emailOrPhone"){
                if(e.target.value.search("@")+1){
                    this.validateEmail(e);
                }
                else{
                    this.validatePhoneNum(e);
                }
            }
            else if(e.target.name==="password"){
                this.validatePwd(e);
            }
            else if(e.target.name==="fullname"){
                this.props.updateInputStatus(e.target.name,"isFullnameValid",true,"");
            }
            else if(e.target.name==="username"){
                this.getUsersByUsername(e.target.value);
            }
        }
        else{
            this.props.resetValidation(e) 
        }
        
    }
    validateEmail(e){
        const email=this.props.inputs.emailOrPhone;
        if(email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi)){
           this.getUsersByEmail(email,e)
        }
        else{
            this.props.updateInputStatus(e.target.name,"isEmailOrPhoneValid",false,"Please enter a valid email address.");
            
        }
    }


    validatePhoneNum(e){
        const compltNum=e.target.value;
        const numStr=compltNum.replace("+91","");
        const numDigit=parseInt(numStr);
        if(Number.isNaN(numDigit) || compltNum.search("\\+91")===-1 || numStr.length!==10){
            this.props.updateInputStatus(e.target.name,"isEmailOrPhoneValid",false,"Looks like your phone number may be incorrect. Please try entering your full number including the country code.");
            
        }
        else{
            this.getUsersByPhone(compltNum,e);
        }
    }

    validatePwd(e){
        const pwd=e.target.value;
        if(pwd.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/gi)){
            this.props.updateInputStatus(e.target.name,"isPasswordValid",true,"");
        }
        else{
            this.props.updateInputStatus(e.target.name,"isPasswordValid",false,"Passoword must be at least 8 character long which contain at least one digit,one lowercase letter,one uppercase letter and one special letter.");
        }
    }

    async getUsersByEmail(email,e){
        const q=query(userDbRef,where("email","==",email))
        const querySnapshot=await getDocs(q);
        if(querySnapshot.empty){
            this.props.updateInputStatus(e.target.name,"isEmailOrPhoneValid",true,"");
            this.props.updateUserChoice(true);
        }
        else{
            this.props.updateInputStatus(e.target.name,"isEmailOrPhoneValid",false,"This email isn't available.Please try another.");
        }
    }

    async getUsersByPhone(phone,e){
        const q=query(userDbRef,where("phone","==",phone))
        const querySnapshot=await getDocs(q);
        if(querySnapshot.empty){
            this.props.updateInputStatus(e.target.name,"isEmailOrPhoneValid",true,"");
            this.props.updateUserChoice(false);
        }
        else{
            this.props.updateInputStatus(e.target.name,"isEmailOrPhoneValid",false,"This number isn't available.Please try another.");
        }
    }

    async getUsersByUsername(username,callback=null){
        if(username.length>3){
            const q=query(userDbRef,where("username","==",username));
            const querySnapshot = await getDocs(q);
            if(querySnapshot.empty){
                this.props.updateInputStatus("username","isUsernameValid",true,"");
            }
            else{
                this.props.updateInputStatus("username","isUsernameValid",false,"This username isn't available.Please try another.");
            }
        }
        else{
            this.props.updateInputStatus("username","isUsernameValid",false,"This username isn't available.Please try another.");
        }
        if(callback) callback();
    }

    render(){
        return (
            <div className={styles.signupCont}>
                <img src={logo} className={styles.logo}/>
                <div className={styles.facebookLoginOptn}>
                    <span>Sign up to see photos and videos from your friends.</span>
                        <div className="d-grid">
                            <Button variant="primary" size="sm" className={styles.facebookBtn}>
                            <i className="fab fa-facebook-square"></i> Log in with Facebook
                        </Button>
                    </div>
                </div>
                <span className={styles.secondOptn}>OR</span>
                <div className={styles.signupForm}>
                    <form onSubmit={this.handleSubmit}>
                        <FormInput isInputValid={this.props.inputStatus.isEmailOrPhoneValid} inputName="emailOrPhone" 
                                    inputValue={this.props.inputs.emailOrPhone} inputHint="Phone number or email" inputType="text"
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={this.props.isValidationReq.emailOrPhone} 
                                    invalidMsg={this.props.invalidMsg.emailOrPhone} />

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