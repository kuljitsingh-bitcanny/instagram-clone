import React,{Component} from "react"
import { signOut } from "firebase/auth"
import { auth } from "../lib/Firebase"
export default class Home extends Component{

    render(){
        return (
            <>
            <div>Home page</div>
            <button onClick={e=>{signOut(auth)}}>logout</button>
            </>
        )
    }
}