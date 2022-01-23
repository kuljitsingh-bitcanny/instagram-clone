import React from "react";
import firebase,{auth,db,onAuthStateChanged} from "../lib/Firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen";


const AuthContext=React.createContext();

class AuthProvider extends React.Component{
    constructor(props){
        super(props);
        this.state={
            value:{firebase:firebase,currentUser:null,setCurrentUser:this.checkAndSetCurrentUser},
            isUserDataLoaded:false,
        }
        console.log(this.state.value);
    }
     checkAndSetCurrentUser=async(user)=>{
        if(user){
            const docRef=doc(db,"users",user.uid);
            const docSnap=await getDoc(docRef);
            this.setState((state)=>{
                return {value:{...state.value,currentUser:{...docSnap.data()}},isUserDataLoaded:true}
            })
        }
        else{
            //implement else part
            this.setState({isUserDataLoaded:true})
        }
    }
    componentDidMount(){
        //this.timer=setTimeout(()=>this.setState({isUserDataLoaded:true}),2000);
        onAuthStateChanged(auth, (user) => {
            console.log(user);
            this.checkAndSetCurrentUser(user)
          })
    }
    componentWillUnmount(){
        
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