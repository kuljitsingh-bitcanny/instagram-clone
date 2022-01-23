import React from "react";
import Container from 'react-bootstrap/Container';
import styles from "../styles/login.module.css";
import loginLogo from "../images/app_logo/login-logo.jpg";
import logo from "../images/app_logo/logo.png";
import {Button} from "react-bootstrap";
import FormInput from "./FormInput";
import {doc, getDocs,query, where} from "firebase/firestore";
import AuthSpinner from "./AuthSpinner";
import {userDbRef,auth} from "../lib/Firebase";
import {getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {AuthContext} from "../context/AuthProvider";

class Login extends React.Component{
    static contextType=AuthContext;
    constructor(props){
        super(props);
        this.state={inputs:{emailOrPhoneOrUsername:"",password:""},showPwd:false,disableSubmitBtn:true,showSpinner:false,
                    invalidMsg:""};
        this.isFormSubmitted=false
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
    async searchUserByKeyName(keyname,keyval){
        const q=query(userDbRef,where(keyname,"==",keyval))
        const querySnapshot=await getDocs(q);
        console.log(querySnapshot);
        if(querySnapshot.empty){
            return "";
        }
        else{
            let email;
            querySnapshot.forEach((doc)=>email=doc.data().email);
            return email;
        }
    }

    render(){
        return (
            <Container className={styles.loginContainer}>
                <img src={loginLogo} className={styles.loginLogo}/>
                <div className={styles.wrapper}>
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

                                <div className="d-grid">
                                    <Button variant="primary" size="sm" disabled={this.state.disableSubmitBtn} type="submit">
                                        Log In
                                    </Button>
                                </div>
                                
                            </form>
                            <span className={styles.secondOptn}>OR</span>
                            <div className="d-grid">
                                <Button variant="primary" size="sm" className={styles.facebookBtn}>
                                <i className="fab fa-facebook-square"></i> Log in with Facebook
                                </Button>
                            </div>
                            { this.state.invalidMsg.length>0 && 
                                <div className={styles.errMsgCont}>
                                    <span className="text-center">{this.state.invalidMsg}</span>
                                </div>
                            }
                            <a href="#" className={styles.forgetPassBtn}>Forget password?</a>
                        </div>
                    </div>
                    <div className={styles.signupCont}>
                        <span>Don't have account?</span>
                        <a href="" onClick={this.props.toggleLogin}>Sign Up</a>
                    </div>
                    {this.state.showSpinner?
                        <div className={styles.loginModal}>
                            <AuthSpinner/>
                        </div>:
                        ""
                    }
                </div>
                
            </Container>
        )
    }
}

export default Login;