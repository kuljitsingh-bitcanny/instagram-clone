import React,{Component} from "react"
import { signOut } from "firebase/auth"
import { auth } from "../lib/Firebase"
import { AuthContext } from "../context/AuthProvider"
export default class Home extends Component{
    static contextType=AuthContext;

    render(){
        return (
            <>
            <div>Home page</div>
            <div>{this.context.currentUser.username}</div>
            <button onClick={e=>{signOut(auth)}}>logout</button>
            </>
        )
    }
}