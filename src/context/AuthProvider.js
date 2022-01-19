import React from "react";
import LoadingScreen from "../components/LoadingScreen";
import firebase from "../lib/Firebase";

const AuthContext=React.createContext();

class AuthProvider extends React.Component{
    constructor(props){
        super(props);
        this.state={
            value:{firebase:firebase},
            isUserDataLoaded:false
        }
        console.log(this.state.value);
    }
    
    componentDidMount(){
        this.timer=setTimeout(()=>this.setState({isUserDataLoaded:true}),2000);
    }
    componentWillUnmount(){
        if(this.timer){
            clearTimeout(this.timer);
        }
    }

    render(){
        return (
            <AuthContext.Provider value={this.state.value}>
                {this.state.isUserDataLoaded?
                    this.props.children:
                    <LoadingScreen/>

                }
            </AuthContext.Provider>
        );
    }
}

export default AuthProvider;
export {AuthContext};