import React from "react";
import {AuthContext} from "./context/AuthProvider";
import Login from "./components/Login";
import Signup from "./components/signup";
import ForgotPwd from "./components/ForgotPwd";
import UserAuth from "./components/UserAuth";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./components/Home";


export const DISPLAY_MODE={
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
        this.context.changeDisplayMode(DISPLAY_MODE.LOGIN_MODE);
      }
    }
  }
  
  render(){
    switch(this.context.curMode){
      case DISPLAY_MODE.LOGIN_MODE:
        return <Login/>
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
