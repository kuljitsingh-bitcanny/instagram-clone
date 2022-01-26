import React,{Component} from "react";
import { codeResendSpan, idLen, idStartIndx, invalidToken, loggingUser, parseQueryString, resetPasswordMode, tokenLen } from "../constants/constants";
import AuthSpinner2 from "./AuthSpinner2";
import InvalidToken from "./InvalidToken";
import { doc, getDoc } from "firebase/firestore";
import { forgotPwdDbRef } from "../lib/Firebase";
import LoggingUser from "./LoggingUser";
import ResetPassword from "./ResetPassword";


export default class UserAuth extends Component{
    constructor(props){
        super(props);
        this.state={queryPar:{},mode:"",user:{},token:"",
            invalidTokenMsg:{btnName:"Log in",header:"The link is invalid",body:"Please request a new one and try again."}}
    }
    parseToken=async ()=>{
        console.log("parsing token");
        if(this.state.queryPar.mode === resetPasswordMode){
            if(this.state.queryPar.token.length===tokenLen){
                const token=this.state.queryPar.token.substring(idStartIndx,idStartIndx+idLen);
                console.log(token);
                const q=doc(forgotPwdDbRef,token);
                const docSnap=await getDoc(q);
                if(docSnap.exists()){
                    const data=docSnap.data();
                    const curTime=Date.now();
                    const diff=curTime-data.reqTime;
                    console.log(diff)
                    if(diff>codeResendSpan){
                        this.setState({mode:invalidToken});
                    }
                    else{
                        this.setState({mode:loggingUser,user:{...docSnap.data()},token})
                    }
                }
                else{
                    this.setInvalidTokenMsg({btnName:"Log in",header:"The link is invalid",body:"Please request a new one and try again."});
                    this.setState({mode:invalidToken});
                }
            }
            else{
                this.setMode(invalidToken);
            }
        }
       
    }
    setInvalidTokenMsg=({btnName,body,header})=>{
        this.setState({invalidTokenMsg:{btnName,body,header}});
    }
    setMode=(mode)=>{
        this.setState({mode});
    }

    componentDidMount(){
        const queryString=window.location.search.substring(1);
        this.setState({queryPar:{...parseQueryString(queryString)}})
        console.log(parseQueryString(queryString))
        
        
    }
    componentDidUpdate(prevProps,prevState){
        if(Object.keys(this.state.queryPar).length && prevState.queryPar !== this.state.queryPar){
            this.parseToken();
        }
        console.log(this.state,prevState.queryPar)
    }
    render(){
        switch(this.state.mode){
            case resetPasswordMode:
                return <ResetPassword user={this.state.user} setInvalidTokenMsg={this.setInvalidTokenMsg} setMode={this.setMode}
                                        token={this.state.token}/>
            case loggingUser:
                    return <LoggingUser user={this.state.user} setInvalidTokenMsg={this.setInvalidTokenMsg} setMode={this.setMode}/>
            case invalidToken:
                return <InvalidToken btnName={this.state.invalidTokenMsg.btnName} msgHeader={this.state.invalidTokenMsg.header} 
                        msgBody={this.state.invalidTokenMsg.body}/>
            default:
                return <AuthSpinner2/>
        }
    }
}