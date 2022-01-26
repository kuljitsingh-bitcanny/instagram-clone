import React from "react";
import Container from 'react-bootstrap/Container';
import styles from "../styles/signup.module.css";
import loginLogo from "../images/app_logo/login-logo.jpg";
import AuthSpinner from "./AuthSpinner";
import SignupBirthdayPart from "./signupBirthdayPart";
import SignupNamePart from "./signupNamePart";
import SignupUserInfoConfrmPart from "./signupUserInfoConfrmPart";
import ThirdpartyLoginScreen from "./ThirdpartyLoginScreen";
import { Button } from "react-bootstrap";
import { DISPLAY_MODE } from "../App";
import { AuthContext } from "../context/AuthProvider";

const SignupMode={infoInputMode:1,birthdayInputMode:2,userConfirmMode:3,thirdpartySigninMode:4};

class Signup extends React.Component{
    static contextType=AuthContext;
    constructor(props){
        super(props);
        this.state={inputs:{emailOrPhone:"",fullname:"",username:"",password:""},
                    inputStatus:{isEmailOrPhoneValid:false,isFullnameValid:false,isUsernameValid:false,isPasswordValid:false},
                    isValidationReq:{emailOrPhone:false,fullname:false,username:false,password:false},
                    invalidMsg:{emailOrPhone:"",fullname:"",username:"",password:""},showSpinner:false,
                    birthday:{year:"",day:"",month:""},signupMode:SignupMode.infoInputMode,isUserChooseEmail:false,
                    userReqCount:0,userImgurl:"",isThirdpartyLogin:false};
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
    resetShowSpinner=()=>{
        this.setState({showSpinner:false});
    }
    setThirdpartyLoginInfo=(data)=>{
        this.setState((state)=>{
            return {
                isThirdpartyLogin:true,signupMode:SignupMode.thirdpartySigninMode,
                inputs:{...data.inputs},birthday:{...data.birthday},userImgurl:data.imgUrl,
                isValidationReq:{...state.isValidationReq,fullname:true,emailOrPhone:true},
                inputStatus:{...state.inputStatus,isEmailOrPhoneValid:true,isFullnameValid:true},
                invalidMsg:{...state.invalidMsg,emailOrPhone:"",fullname:""}
            }
        });
    }
    
    changeBirthday=({year,month,day})=>{
        this.setState({birthday:{year,month,day}});
    }
    resetValidation=(name)=>{
        this.setState((state)=>{
            return {isValidationReq:{...state.isValidationReq,[name]:false}}
        })
    }
    updateInput(e){
        this.setState((state)=>{
            const inputs={...state.inputs,[e.target.name]:e.target.value};
            return {inputs,showSpinner:false};
        })
    }
    setUserImgUrl=(url)=>{
        this.setState({userImgurl:url});
    }
    updatePhoneNum=(newPhoneNum)=>{
        this.setState((state)=>{
            const inputs={...state.inputs,emailOrPhone:newPhoneNum};
            return {inputs,showSpinner:false};
        })
    }
    updateInputStatus=(inputName,statusName,statusValue,msg,callback=null)=>{
        this.setState((state)=>{
            return {isValidationReq:{...state.isValidationReq,[inputName]:true},
                    inputStatus:{...state.inputStatus,[statusName]:statusValue},
                    invalidMsg:{...state.invalidMsg,[inputName]:msg},showSpinner:callback?true:false
                    }
        },callback)
    }

    changeSignupMode=(mode)=>{
        this.setState({signupMode:mode,showSpinner:false});
        console.log(this.state)
    }
    resetPassword=()=>{
        this.setState(({inputs,isValidationReq,invalidMsg,inputStatus,userReqCount})=>{
            return {inputs:{...inputs,password:""},inputStatus:{...inputStatus,isPasswordValid:false},
                    isValidationReq:{...isValidationReq,password:false},invalidMsg:{...invalidMsg,password:""},
                    userReqCount:userReqCount+1}
        })
    }

    getUserBirthday=()=>{
        return `${parseInt(this.state.birthday.month)+1}/${this.state.birthday.day}/${this.state.birthday.year}`;
    }
    
    
    render(){
        return (
            <Container className={styles.signupContainer}>
                <img src={loginLogo} className={styles.loginLogo}/>
                <div className={styles.wrapper}>
                    {   this.state.signupMode === SignupMode.infoInputMode?
                        <SignupNamePart inputs={this.state.inputs} inputStatus={this.state.inputStatus} invalidMsg={this.state.invalidMsg}
                                        isValidationReq={this.state.isValidationReq} setShowSpinner={this.setShowSpinner} 
                                        updateInput={this.updateInput} resetShowSpinner={this.resetShowSpinner}
                                        resetValidation={this.resetValidation} updateInputStatus={this.updateInputStatus}
                                        changeSignupMode={this.changeSignupMode} updateUserChoice={this.updateUserChoice}
                                        setUserImgUrl={this.setUserImgUrl} changeBirthday={this.changeBirthday} 
                                        setThirdpartyLoginInfo={this.setThirdpartyLoginInfo} showSpinner={this.state.showSpinner}/>:

                        this.state.signupMode === SignupMode.birthdayInputMode?
                        <SignupBirthdayPart birthday={this.state.birthday} changeBirthday={this.changeBirthday} 
                            changeSignupMode={this.changeSignupMode} resetPassword={this.resetPassword} 
                            userReqCount={this.state.userReqCount} />:

                        this.state.signupMode === SignupMode.userConfirmMode?
                        <SignupUserInfoConfrmPart isUserChooseEmail={this.state.isUserChooseEmail} inputs={this.state.inputs}
                                                changeSignupMode={this.changeSignupMode} resetPassword={this.resetPassword} 
                                                updatePhoneNum={this.updatePhoneNum} resetShowSpinner={this.resetShowSpinner} 
                                                getUserBirthday={this.getUserBirthday} userImgurl={this.state.userImgurl}
                                                setShowSpinner={this.setShowSpinner} showSpinner={this.state.showSpinner}/>:

                        <ThirdpartyLoginScreen inputs={this.state.inputs} birthday={this.state.birthday} inputStatus={this.state.inputStatus}
                                                userImgUrl={this.state.userImgurl} isValidationReq={this.state.isValidationReq}
                                                invalidMsg={this.state.invalidMsg} userReqCount={this.state.userReqCount}
                                                changeBirthday={this.changeBirthday} updateInput={this.updateInput} 
                                                resetValidation={this.resetValidation} updateInputStatus={this.updateInputStatus} 
                                                resetShowSpinner={this.resetShowSpinner} resetPassword={this.resetPassword} 
                                                setShowSpinner={this.setShowSpinner} getUserBirthday={this.getUserBirthday}
                                                showSpinner={this.state.showSpinner}/>
                                            
                        

                    }
                    
                    <div className={styles.loginCont}>
                        <span>Have an account?</span>
                        <Button variant="link" className="text-decoration-none ps-1"
                                onClick={()=>this.context.changeDisplayMode(DISPLAY_MODE.LOGIN_MODE)}>
                                Log In
                        </Button>
                    </div>
                    {this.state.showSpinner?
                        <div className={styles.signupModal}></div>:
                        ""
                    }
                </div>
            </Container>
        )
    }
}

export default Signup;
export {SignupMode};