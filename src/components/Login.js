import React from "react";
import Container from 'react-bootstrap/Container';
import styles from "../styles/login.module.css";
import loginLogo from "../images/app_logo/login-logo.jpg";
import logo from "../images/app_logo/logo.png";
import {Button} from "react-bootstrap";

class Login extends React.Component{

    constructor(props){
        super(props);
        this.state={inputs:{username:"",userpassword:""},showPwd:false,disableSubmitBtn:true};
        this.handleChange=this.handleChange.bind(this);
        this.togglePwdVisibility=this.togglePwdVisibility.bind(this);
    }
    handleChange(e){
        this.setState((state)=>{
            const inputs={...state.inputs,[e.target.name]:e.target.value};
            const disableSubmitBtn=Object.values(inputs).some((value)=>value.length===0);
            return {inputs,disableSubmitBtn,showPwd:inputs.userpassword.length===0?false:state.showPwd};
        })
    }
    togglePwdVisibility(e){
        this.setState((state)=>{
            return {showPwd:!state.showPwd}
        })
    }

    render(){
        return (
            <Container className={styles.loginContainer}>
                <img src={loginLogo} className={styles.loginLogo}/>
               <div className={styles.wrapper}>
                    <div className={styles.loginCont}>
                        <img src={logo} className={styles.logo}/>
                        <div className={styles.loginForm}>
                            <form>
                                <div className={styles.loginNameCont}>
                                    <input type="text" id="loginname" name="username" 
                                        value={this.state.inputs.username} onChange={this.handleChange}/>
                                    <label htmlFor="loginname" className={this.state.inputs.username.length?styles.activeLabel:""}>
                                        Phone number,username or email</label>
                                </div>
                                <div className={styles.loginPassCont}>
                                    <input type={this.state.showPwd?"text":"password"} id="loginpass" name="userpassword" 
                                        value={this.state.inputs.userpassword} onChange={this.handleChange}/>
                                    <label htmlFor="loginpass" className={this.state.inputs.userpassword.length?styles.activeLabel:""}>
                                        Password</label>
                                   {this.state.inputs.userpassword.length?
                                    <button type="button" onClick={this.togglePwdVisibility}>
                                        {this.state.showPwd?"Hide":"Show"}
                                    </button>:""
                                    }
                                </div>
                                <div className="d-grid">
                                    <Button variant="primary" size="sm" disabled={this.state.disableSubmitBtn}>
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
                            <a href="#" className={styles.forgetPassBtn}>Forget password?</a>
                        </div>
                    </div>
                    <div className={styles.signupCont}>
                        <span>Don't have account?</span>
                        <a href="" onClick={this.props.toggleLogin}>Sign Up</a>
                    </div>
               </div>
            </Container>
        )
    }
}

export default Login;