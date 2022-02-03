import React, { useContext, useEffect } from "react"
import {Provider} from "react-redux";
import store from "../reduxService/store";


export default function  Home(props) {
    
    return (
        <Provider store={store}>
            {props.children}
        </Provider>
    )
}


// static contextType=AuthContext;
    // constructor(props){
    //     super(props);
    //     this.state={value:{isUserAddedLocally:false,setIsUserAddedLocally:this.setIsUserAddedLocally},isDataLoaded:false};
    // }
    // loadData=()=>{
    //     console.log("setting data");
    //     this.setState({isDataLoaded:true});
    // }
    // setIsUserAddedLocally=()=>{
    //     this.setState((state)=>{
    //         return {value:{...state.value,isUserAddedLocally:true}}
    //     })
    // }
    // componentDidMount(){
    //     console.log(this.context.currentUser,this.context.oneTapStorageDetails);
    //     const isUserLocally=this.context.oneTapStorageDetails.some((detail)=>detail.id===this.context.currentUser.userId);
    //     this.setState((state)=>{
    //         return {value:{...state.value,currentUser:this.context.currentUser,isUserAddedLocally:isUserLocally},isDataLoaded:true};
    //     })
    // }