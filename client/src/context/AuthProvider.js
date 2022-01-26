import React from "react";
import firebase,{auth,db,onAuthStateChanged, userDbRef,oneTapStorageDbRef} from "../lib/Firebase";
import { addDoc, doc, getDoc } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen";
import { DISPLAY_MODE } from "../App";
import { oneTapStorage,idStartIndx, idLen } from "../constants/constants";


const AuthContext=React.createContext();

class AuthProvider extends React.Component{
    constructor(props){
        super(props);
        this.state={
            value:{firebase:firebase,currentUser:null,setCurrentUser:this.checkAndSetCurrentUser,curMode:"",
                    changeDisplayMode:this.changeDisplayMode,checkAndChangeDisplayMode:this.checkAndChangeDisplayMode,
                    oneTapStorageDetails:[]},
            isUserDataLoaded:false,
        }
        this.oneTabStorageToken=window.localStorage.getItem(oneTapStorage) || "";
        console.log(this.oneTabStorageToken);
    }
    changeDisplayMode=(mode)=>{
        this.setState((state)=>{
            return {value:{...state.value,curMode:mode}}
        })
    }
     checkAndSetCurrentUser=async(user)=>{
        if(user){
            const docRef=doc(db,"users",user.uid);
            const docSnap=await getDoc(docRef);
            const data=docSnap.data();
            console.log("updating current user");
            this.setState((state)=>{
                return {value:{...state.value,currentUser:{...data}},isUserDataLoaded:true}
            })
        }
        else{
            //implement else part
            this.setState({isUserDataLoaded:true});
        }
    }
    checkAndChangeDisplayMode=()=>{
        if(this.state.value.currentUser){
            this.changeDisplayMode(DISPLAY_MODE.HOME_MODE)
        }
        else{
            this.changeDisplayMode(DISPLAY_MODE.LOGIN_MODE);
        }
    }
    checkAndLoadOneTapUserDetails= async ()=>{
        if(this.oneTabStorageToken.length!==0){
            const id=this.oneTabStorageToken.substring(idStartIndx,idStartIndx+idLen);
            const docSnap=await getDoc(doc(oneTapStorageDbRef,id));
            if(docSnap.exists()){
                const {details}=docSnap.data();
                this.setState(()=>{
                    return {value:{...this.state.value,oneTapStorageDetails:[...details]},isUserDataLoaded:false};
                })
            }
            else{
                this.setState(()=>{
                    return {value:{...this.state.value,oneTapStorageDetails:[]},isUserDataLoaded:false};
                })
            }
        }
        else{
            this.setState(()=>{
                return {value:{...this.state.value,oneTapStorageDetails:[]},isUserDataLoaded:false};
            })

        }
        onAuthStateChanged(auth, (user) => {
            this.checkAndSetCurrentUser(user)
          })
    }
    componentDidMount(){
        this.checkAndLoadOneTapUserDetails();  
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