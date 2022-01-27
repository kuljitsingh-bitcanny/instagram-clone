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
                    oneTapStorageDetails:[],oneTapStorageId:"",updateOneTapStorage:this.updateOneTapStorage},
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
            this.setState({isUserDataLoaded:true,currentUser:null});
        }
    }
    checkAndChangeDisplayMode=()=>{
        if(this.state.value.currentUser){
            this.changeDisplayMode(DISPLAY_MODE.HOME_MODE)
        }
        else{
            if(this.state.value.oneTapStorageDetails.length){
                this.changeDisplayMode(DISPLAY_MODE.ONE_TAP_LOGIN_MODE);
            }
            else{
                this.changeDisplayMode(DISPLAY_MODE.LOGIN_MODE);
            }
        }
    }
    checkAndLoadOneTapUserDetails= async ()=>{
        if(this.oneTabStorageToken.length!==0){
            const id=this.oneTabStorageToken.substring(idStartIndx,idStartIndx+idLen);
            const docSnap=await getDoc(doc(oneTapStorageDbRef,id));
            if(docSnap.exists()){
                const {details}=docSnap.data();
                this.setState(()=>{
                    return {value:{...this.state.value,oneTapStorageDetails:[...details],oneTapStorageId:id},isUserDataLoaded:false};
                })
            }
            else{
                this.setState(()=>{
                    return {value:{...this.state.value,oneTapStorageDetails:[],oneTapStorageId:""},isUserDataLoaded:false};
                })
            }
        }
        else{
            this.setState(()=>{
                return {value:{...this.state.value,oneTapStorageDetails:[],oneTapStorageId:""},isUserDataLoaded:false};
            })

        }
        onAuthStateChanged(auth, (user) => {
            this.checkAndSetCurrentUser(user)
          })
    }
    componentDidMount(){
        this.checkAndLoadOneTapUserDetails();  
    }
    updateOneTapStorage=(id)=>{
        const newStorageArr=this.state.value.oneTapStorageDetails.filter((detail)=>detail.id!==id);
        this.setState((state)=>{
            return {value:{...state.value,oneTapStorage:[...newStorageArr]}};
        })

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