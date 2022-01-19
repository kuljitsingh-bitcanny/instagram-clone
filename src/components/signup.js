import React from "react";
import Container from 'react-bootstrap/Container';
import styles from "../styles/signup.module.css";
import loginLogo from "../images/app_logo/login-logo.jpg";
import AuthSpinner from "./AuthSpinner";
import SignupBirthdayPart from "./signupBirthdayPart";
import SignupNamePart from "./signupNamePart";
import SignupUserInfoConfrmPart from "./signupUserInfoConfrmPart";

class Signup extends React.Component{

    constructor(props){
        super(props);
        this.state={inputs:{emailOrPhone:"",fullname:"",username:"",password:""},
                    inputStatus:{isEmailOrPhoneValid:false,isFullnameValid:false,isUsernameValid:false,isPasswordValid:false},
                    isValidationReq:{emailOrPhone:false,fullname:false,username:false,password:false},
                    invalidMsg:{emailOrPhone:"",fullname:"",username:"",password:""},showSpinner:false,
                    birthday:{year:"",day:"",month:""},signupMode:3,isUserChooseEmail:false};
                    //signupMode:- 1 shows name part
                    //             2 show birthday part
                    //             3 show email/phone code conformation part
        this.updateInput=this.updateInput.bind(this);
    }

    updateUserChoice=(choice)=>{
        this.setState({isUserChooseEmail:choice})
    }
    setShowSpinner=()=>{
        this.setState({showSpinner:true});
    }
    
    changeBirthday=({year,month,day})=>{
        this.setState({birthday:{year,month,day}});
    }
    resetValidation=(e)=>{
        this.setState((state)=>{
            return {isValidationReq:{...state.isValidationReq,[e.target.name]:false}}
        })
    }
    updateInput(e){
        this.setState((state)=>{
            const inputs={...state.inputs,[e.target.name]:e.target.value};
            return {inputs};
        })
    }
    updateInputStatus=(inputName,statusName,statusValue,msg)=>{
        this.setState((state)=>{
            return {isValidationReq:{...state.isValidationReq,[inputName]:true},
                    inputStatus:{...state.inputStatus,[statusName]:statusValue},
                    invalidMsg:{...state.invalidMsg,[inputName]:msg},showSpinner:false
                    }
        })
    }

    changeSignupMode=(mode)=>{
        this.setState({signupMode:mode});
        console.log(this.state)
    }
    resetPassword=()=>{
        this.setState(({inputs,isValidationReq,invalidMsg,inputStatus})=>{
            return {inputs:{...inputs,password:""},inputStatus:{...inputStatus,isPasswordValid:false},
                    isValidationReq:{...isValidationReq,password:false},invalidMsg:{...invalidMsg,password:""}}
        })
    }

    
    
    render(){
        return (
            <Container className={styles.signupContainer}>
                <img src={loginLogo} className={styles.loginLogo}/>
                <div className={styles.wrapper}>
                    {this.state.signupMode === 1 ?

                        <SignupNamePart inputs={this.state.inputs} inputStatus={this.state.inputStatus} invalidMsg={this.state.invalidMsg}
                        isValidationReq={this.state.isValidationReq} setShowSpinner={this.setShowSpinner} updateInput={this.updateInput} 
                        resetValidation={this.resetValidation} updateInputStatus={this.updateInputStatus}
                        changeSignupMode={this.changeSignupMode} updateUserChoice={this.updateUserChoice}/>:

                        this.state.signupMode === 2?

                        <SignupBirthdayPart birthday={this.state.birthday} changeBirthday={this.changeBirthday} 
                            changeSignupMode={this.changeSignupMode} resetPassword={this.resetPassword}/>:

                        <SignupUserInfoConfrmPart isUserChooseEmail={this.state.isUserChooseEmail} inputs={this.state.inputs}
                            changeSignupMode={this.changeSignupMode} resetPassword={this.resetPassword}/>

                    }
                    

                    

                    <div className={styles.loginCont}>
                        <span>Have an account?</span>
                        <a href="" onClick={this.props.toggleLogin}>Log In</a>
                    </div>
                    {this.state.showSpinner?
                        <div className={styles.signupModal}>
                            <AuthSpinner/>
                        </div>:
                        ""
                    }
                </div>
            </Container>
        )
    }
}

export default Signup;