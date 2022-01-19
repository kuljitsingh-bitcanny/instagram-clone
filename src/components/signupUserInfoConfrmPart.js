import React from "react";
import styles from "../styles/signup.module.css";
import emailConfrmLogo from "../images/app_logo/email_confrm_code.png";
import phoneConfrmLogo from "../images/app_logo/phone_confrm_code.png";
import FormInput  from "./FormInput";
import {Button} from "react-bootstrap";
import AuthSpinner from "./AuthSpinner";


class SignupUserInfoConfrmPart extends React.Component{
    constructor(props){
        super(props);
        this.state={confirmationCode:"",disableSubmitBtn:true,generatedCode:"123456",isCodeInvalid:true}

    }
    handleBlur=(e)=>{
        
    }
    handleChange=(e)=>{
        if(e.target.value.length<=6){
            this.setState({confirmationCode:e.target.value,disableSubmitBtn:!(e.target.value.length>0)});
        }
        
    }
    handleFocus=(e)=>{

    }

    goBackToNameMode=(e)=>{
        this.props.resetPassword();
        this.props.changeSignupMode(1);
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
                    <h6 className="mb-3" style={{fontWeight:"600"}}>Enter Confirmation Code</h6>
                    <p className="text-center mb-0" style={{fontSize:"0.875rem"}}>Enter the confirmation code we send to {this.props.inputs.emailOrPhone}.
                        <button type="button" className={styles.resendCodeBtn}>Resend code</button>
                    </p>
                    <form className="w-100">
                        <FormInput inputName="confirmationCode" inputValue={this.state.confirmationCode} inputHint="Confirmation Code" 
                                    inputType="text" handleChange={this.handleChange} handleBlur={this.handleBlur} handleFocus={this.handleFocus}
                                    isValidationReq={false} />
                        <div className="d-grid">
                            <Button variant="primary" size="sm" type="submit"
                                disabled={this.state.disableSubmitBtn}>
                                Next
                            </Button>
                        </div>
                        {this.state.isCodeInvalid &&
                            <div className={styles.finalErrMsgCont}>
                                <span className="text-center">That code isn't valid. You can request a new one.</span>
                            </div>
                        }
                    </form>
                    <button type="button" className={`${styles.backBtn} mt-3`} onClick={this.goBackToNameMode}>Go Back</button>
                    
                </div>
                <div className={styles.signupModal}>
                    <AuthSpinner/>
                </div>
            </>
            )
    }
}

export default SignupUserInfoConfrmPart;