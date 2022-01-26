import React ,{Component} from "react";
import ThirdpartyLoginScreen from "./ThirdpartyLoginScreen";


class ThirdpartyLoginScreenWrapper extends Component{
    constructor(props){
        super(props);
        this.state={inputs:{...this.props.userInfo.inputs},birthday:{...this.props.userInfo.birthday},userImgUrl:this.props.userInfo.imgUrl,
                    inputStatus:{isEmailOrPhoneValid:true,isFullnameValid:true,isUsernameValid:false,isPasswordValid:false},
                    isValidationReq:{emailOrPhone:true,fullname:true,username:false,password:false},
                    invalidMsg:{emailOrPhone:"",fullname:"",username:"",password:""},userReqCount:0};
    }
    changeBirthday=({year,month,day})=>{
        this.setState({birthday:{year,month,day}});
    }
    updateInput=(e)=>{
        this.setState((state)=>{
            const inputs={...state.inputs,[e.target.name]:e.target.value};
            return {inputs,showSpinner:false};
        })
    }
    resetValidation=(name)=>{
        this.setState((state)=>{
            return {isValidationReq:{...state.isValidationReq,[name]:false}}
        })
    }
    updateInputStatus=(inputName,statusName,statusValue,msg,callback=null)=>{
        this.setState((state)=>{
            return {isValidationReq:{...state.isValidationReq,[inputName]:true},
                    inputStatus:{...state.inputStatus,[statusName]:statusValue},
                    invalidMsg:{...state.invalidMsg,[inputName]:msg},showSpinner:callback?true:false
                    }
        },callback)
    }
    resetPassword=()=>{
        this.setState(({inputs,isValidationReq,invalidMsg,inputStatus,userReqCount})=>{
            return {inputs:{...inputs,password:""},inputStatus:{...inputStatus,isPasswordValid:false},
                    isValidationReq:{...isValidationReq,password:false},invalidMsg:{...invalidMsg,password:""},
                    userReqCount:userReqCount+1}
        })
    }
    getUserBirthday=()=>{
        return `${parseInt(this.state.birthday.month)+1}/${this.state.birthday.day}/${this.state.birthday.year}`;
    }
    render(){
        return(
            <ThirdpartyLoginScreen inputs={this.state.inputs} birthday={this.state.birthday} inputStatus={this.state.inputStatus}
                                userImgUrl={this.state.userImgUrl} isValidationReq={this.state.isValidationReq}
                                invalidMsg={this.state.invalidMsg} userReqCount={this.state.userReqCount}
                                changeBirthday={this.changeBirthday} updateInput={this.updateInput} 
                                resetValidation={this.resetValidation} updateInputStatus={this.updateInputStatus} 
                                resetShowSpinner={this.props.resetShowSpinner} resetPassword={this.resetPassword} 
                                setShowSpinner={this.props.setShowSpinner} getUserBirthday={this.getUserBirthday}
                                showSpinner={this.props.showSpinner}/>
        )
    }   
}

export default ThirdpartyLoginScreenWrapper;