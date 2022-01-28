import React,{Component} from "react"
import { signOut } from "firebase/auth"
import { auth } from "../lib/Firebase"
import { AuthContext } from "../context/AuthProvider"
import LoadingScreen from "./LoadingScreen";

const HomeContext=React.createContext();

export default class Home extends Component{
    static contextType=AuthContext;
    constructor(props){
        super(props);
        this.state={value:{isUserAddedLocally:false,setIsUserAddedLocally:this.setIsUserAddedLocally},isDataLoaded:false};
    }
    loadData=()=>{
        console.log("setting data");
        this.setState({isDataLoaded:true});
    }
    setIsUserAddedLocally=()=>{
        this.setState((state)=>{
            return {value:{...state.value,isUserAddedLocally:true}}
        })
    }
    componentDidMount(){
        console.log(this.context.currentUser,this.context.oneTapStorageDetails);
        const isUserLocally=this.context.oneTapStorageDetails.some((detail)=>detail.id===this.context.currentUser.userId);
        this.setState((state)=>{
            return {value:{...state.value,currentUser:this.context.currentUser,isUserAddedLocally:isUserLocally},isDataLoaded:true};
        })
    }

    render(){
        return (
            <HomeContext.Provider value={this.state.value}>
                {this.state.isDataLoaded?
                    this.props.children:
                    <LoadingScreen/>
                }  
            </HomeContext.Provider>
        )
    }
}
export {HomeContext};

