import React from "react";
import {AuthContext} from "./context/AuthProvider";
import Login from "./components/Login";
import Signup from "./components/signup";
class App extends React.Component{
  static contextType=AuthContext;
  constructor(props){
    super(props);
    this.state={isLogin:true}
  }
  toggleLogin=(e)=>{
    e.preventDefault();
    this.setState((state)=>{
      return {isLogin:!state.isLogin}
    })
  }
  componentDidMount(){
    //console.log("current user:",auth.currentUser);
  }
  render(){
    console.log(process.env.REACT_APP_APP_ID,this.context);
    if(this.state.isLogin) return <Login toggleLogin={this.toggleLogin}/>
    else return <Signup toggleLogin={this.toggleLogin}/>;
    
  }
}


export default App;
