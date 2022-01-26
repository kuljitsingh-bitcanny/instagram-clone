import React from "react";
import Container from 'react-bootstrap/Container';
import styles from "../styles/login.module.css";
import loginLogo from "../images/app_logo/login-logo.jpg";
import logo from "../images/app_logo/logo.png";
import {Button} from "react-bootstrap";
import FormInput from "./FormInput";
import {getDocs,query, where} from "firebase/firestore";
import {userDbRef,auth} from "../lib/Firebase";
import {signInWithEmailAndPassword } from "firebase/auth";
import {AuthContext} from "../context/AuthProvider";
import ThirdpartyLoginbtn from "./ThirdpartyLoginBtn";
import CryptoJS from "crypto-js";
import ThirdpartyLoginScreenWrapper from "./ThirdpartyLoginScreenWrapper";
import LoaderButton from "./LoaderButton";
import { DISPLAY_MODE } from "../App";


const searchOutput={str:"str",obj:"obj"};
class Login extends React.Component{
    static contextType=AuthContext;
    constructor(props){
        super(props);
        this.state={inputs:{emailOrPhoneOrUsername:"",password:""},showPwd:false,disableSubmitBtn:true,showSpinner:false,
                    invalidMsg:"",isFacebookLogin:false,newUserInfo:{},showThirdpartyLoginOptn:false};
        this.isFormSubmitted=false;
    }
    handleSubmit=(e)=>{
        e.preventDefault();
        if(!this.isFormSubmitted){
            this.setState({showSpinner:true});
            this.isFormSubmitted=true;
            this.checkInputAndSignin()
        }
        console.log(e);
    }
    handleChange=(e)=>{
        this.setState((state)=>{
            const inputs={...state.inputs,[e.target.name]:e.target.value};
            const disableSubmitBtn=Object.values(inputs).some((value)=>value.length===0);
            return {inputs,disableSubmitBtn,showPwd:inputs.password.length===0?false:state.showPwd};
        })
    }
    handleFocus=()=>{
        this.setState({invalidMsg:""});
    }

    checkInputAndSignin=async ()=>{
        const input=this.state.inputs.emailOrPhoneOrUsername;
        let email,isUsername=false;
        if(input.search("@")+1){
            email=await this.searchUserByKeyName("email",input);
        }
        else if(input.search("\\+")+1){
            email=await this.searchUserByKeyName("phone",input);
        }
        else{
            email=await this.searchUserByKeyName("username",input);
            isUsername=true;
        }
        if(email){
            try{
                const userCredential=await signInWithEmailAndPassword(auth,email,this.state.inputs.password);
                this.setState({invalidMsg:""});
                this.context.setCurrentUser(userCredential.user);
                console.log(userCredential,"user creaiential")
                //move to home page
                this.context.changeDisplayMode(DISPLAY_MODE.HOME_MODE);
            }
            catch(err){
                this.showInvalidCredentialMsg(true);
            }
            
        }
        else{
            this.showInvalidCredentialMsg(isUsername);
        }
    }
    showInvalidCredentialMsg=(name)=>{
        this.isFormSubmitted=false;
        if(name){
            this.setState({invalidMsg:"Sorry,your password was incorrect. Please double-check your password.",
                    showSpinner:false})
        }
        else{
            this.setState({invalidMsg:"The username you entered doesn't belong to an account. Please check your username and try again.",
                        showSpinner:false})
        }
    }
    togglePwdVisibility=(e)=>{
        this.setState((state)=>{
            return {showPwd:!state.showPwd}
        })
    }
    responseCallback=async(resp)=>{
        console.log("calling repsonse ",resp);
        const userEmail=resp.profileObj?resp.profileObj.email:resp.email;
        const output=await this.searchUserByKeyName("email",userEmail,searchOutput.obj);
        this.setState({showSpinner:true});
        if(Object.keys(output).length){
            console.log(output);
            const  pwd = CryptoJS.AES.decrypt(output.password, output.userId).toString(CryptoJS.enc.Utf8);
            try{
                const userCredential=await signInWithEmailAndPassword(auth,userEmail,pwd);
                this.context.setCurrentUser(userCredential.user);
                console.log(userCredential,"user creaiential")
                this.setState({showSpinner:false})
                //move to home page
                this.context.changeDisplayMode(DISPLAY_MODE.HOME_MODE);
            }
            catch(err){
                this.setState({invalidMsg:"Sorry,something went wrong logging your account. Please try again soon."})
            }
        }
        else{
            const newResp={}
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
            this.setState({newUserInfo:{...newResp},showThirdpartyLoginOptn:true,showSpinner:false})
        }
        

    }

    setShowSpinner=()=>{
        this.setState({showSpinner:true});
    }
    resetShowSpinner=()=>{
        this.setState({showSpinner:false});
    }
    async searchUserByKeyName(keyname,keyval,outputType=searchOutput.str){
        const q=query(userDbRef,where(keyname,"==",keyval))
        const querySnapshot=await getDocs(q);
        console.log(querySnapshot);
        if(querySnapshot.empty){
            return outputType===searchOutput.str?"":{};
        }
        else{
            let output;
            querySnapshot.forEach((doc)=>output=outputType===searchOutput.str?doc.data().email:{...doc.data()});
            return output;
        }
    }

    render(){
        return (
            <Container className={styles.loginContainer}>
                <img src={loginLogo} className={styles.loginLogo}/>
                <div className={styles.wrapper}>
                    {this.state.showThirdpartyLoginOptn?
                        <ThirdpartyLoginScreenWrapper userInfo={this.state.newUserInfo} showSpinner={this.state.showSpinner}
                                        setShowSpinner={this.setShowSpinner} resetShowSpinner={this.resetShowSpinner}/>:
                        <div className={styles.loginCont}>
                            <img src={logo} className={styles.logo}/>
                            <div className={styles.loginForm}>
                                <form onSubmit={this.handleSubmit} method="POST">
                                    <FormInput isInputValid={true} inputName="emailOrPhoneOrUsername" inputType="text"
                                                inputValue={this.state.inputs.emailOrPhoneOrUsername} handleChange={this.handleChange}
                                                inputHint="Phone number, username or email" isValidationReq={false}
                                                handleFocus={this.handleFocus}/>

                                    <FormInput isInputValid={true} inputName="password" inputValue={this.state.inputs.password} 
                                                inputHint="Password" inputType="password" isValidationReq={false}
                                                handleChange={this.handleChange} showPwd={this.state.showPwd}   
                                                isPwdInput={true} togglePwdVisibility={this.togglePwdVisibility}
                                                handleFocus={this.handleFocus}/>

                                    <LoaderButton showSpinner={this.state.showSpinner} isDisabled={this.state.disableSubmitBtn} type="submit" btnName="Log in"/>
                                    
                                </form>
                                <span className={styles.secondOptn}>OR</span>
                                <ThirdpartyLoginbtn responseCallback={this.responseCallback} isFacebookLogin={this.state.isFacebookLogin}
                                                    initialMsg={"Continue"}/>
                                { this.state.invalidMsg.length>0 && 
                                    <div className={styles.errMsgCont}>
                                        <span className="text-center">{this.state.invalidMsg}</span>
                                    </div>
                                }
                                <Button variant="link" className={styles.forgetPassBtn} 
                                        onClick={e=>this.context.changeDisplayMode(DISPLAY_MODE.FORGOT_PWD_MODE)}>
                                        Forget password?
                                </Button>
                            </div>
                        </div>
                    }
                    <div className={styles.signupCont}>
                        <span>Don't have account?</span>
                        <Button variant="link" className="text-decoration-none ps-1" 
                                onClick={()=>this.context.changeDisplayMode(DISPLAY_MODE.SIGNUP_MODE)}>
                                Sign Up
                        </Button>
                    </div>
                    {this.state.showSpinner?
                        <div className={styles.loginModal}></div>:
                        ""
                    }
                </div>
            </Container>
        )
    }
}

export default Login;