import React from "react";
import {AuthContext} from "./context/AuthProvider";
import Login from "./components/Login";
import Signup from "./components/signup";
import ForgotPwd from "./components/ForgotPwd";
import UserAuth from "./components/UserAuth";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./components/Home";
import OneTapLogin from "./components/OneTapLogin";


export const DISPLAY_MODE={
  ONE_TAP_LOGIN_MODE:"one_tap_login_mode",
  LOGIN_MODE:"login_mode",
  SIGNUP_MODE:"signup_mode",
  FORGOT_PWD_MODE:"forgot_pwd_mode",
  AUTH_MODE:"auth_mode",
  HOME_MODE:"home_mode",
}
class App extends React.Component{
  static contextType=AuthContext;
  constructor(props){
    super(props);
    this.state={loginCred:{username:"",password:""}}
  }

  setLoginCred=(username,password)=>{
    this.setState({loginCred:{username,password}});
    this.context.changeDisplayMode(DISPLAY_MODE.LOGIN_MODE);
  }
  
  componentDidMount(){
    const queryString=window.location.search.substring(1);
    if(queryString){
      this.context.changeDisplayMode(DISPLAY_MODE.AUTH_MODE);
    }
    else{
      if(this.context.currentUser){
        this.context.changeDisplayMode(DISPLAY_MODE.HOME_MODE);
        
      }
      else{
        if(this.context.oneTapStorageDetails.length){
          this.context.changeDisplayMode(DISPLAY_MODE.ONE_TAP_LOGIN_MODE)
        }
        else{
          this.context.changeDisplayMode(DISPLAY_MODE.LOGIN_MODE);
        }
      }
    }
  }
  
  render(){
    switch(this.context.curMode){
      case DISPLAY_MODE.ONE_TAP_LOGIN_MODE:
        return <OneTapLogin setLoginCred={this.setLoginCred}/>
      case DISPLAY_MODE.LOGIN_MODE:
        return <Login username={this.state.loginCred.username} password={this.state.loginCred.password}/>
      case DISPLAY_MODE.SIGNUP_MODE:
        return <Signup />
      case DISPLAY_MODE.FORGOT_PWD_MODE:
        return <ForgotPwd/>
      case DISPLAY_MODE.AUTH_MODE:
          return <UserAuth/>
      case DISPLAY_MODE.HOME_MODE:
            return <Home/>
      default:
        return <LoadingScreen/>
    }
  
    
  }
}


export default App;
