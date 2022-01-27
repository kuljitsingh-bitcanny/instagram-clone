import React,{useContext,useEffect,useReducer} from 'react';
import { AuthContext } from '../context/AuthProvider';
import styles from "../styles/login.module.css";
import {Container,Button,Modal} from 'react-bootstrap';
import loginLogo from "../images/app_logo/login-logo.jpg";
import logo from "../images/app_logo/logo.png";
import { DISPLAY_MODE } from '../App';
import LoaderButton from './LoaderButton';
import { auth, oneTapStorageDbRef, userDbRef } from '../lib/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import CryptoJS from 'crypto-js';
import { updateDoc,doc, getDoc } from 'firebase/firestore';
import AuthSpinner2 from './AuthSpinner2';


const ACTIONS={
    HIDE_MODAL:"hide_modal",
    SHOW_MODAL:"show_modal",
    SHOW_LOADDER:"show_loadder",
    HIDE_LOADDER:"hide_loadder",
    TOGGLE_REMV_BTN:"toggle_remove_btn",
    INIT_LOADDER:"init_loader",
    SHOW_AUTH_LOADER:"show_auth_loader",
    HIDE_AUTH_LOADER:"hide_auth_loader",
}

function reducer(state,action){
    switch(action.type){
        case ACTIONS.SHOW_MODAL:
            return {...state,showModal:true,name:action.payload.name,id:action.payload.id};
        case ACTIONS.HIDE_MODAL:
            return {...state,showModal:false,name:"",id:""};
        case ACTIONS.SHOW_LOADDER:
            return {...state,spinners:{...state.spinners,[action.payload.id]:true},loginLoadder:true};
        case ACTIONS.HIDE_LOADDER:
                return {...state,spinners:{...state.spinners,[action.payload.id]:false},loginLoadder:false};  
        case ACTIONS.TOGGLE_REMV_BTN:
                return{...state,showRemoveBtn:!state.showRemoveBtn};
        case ACTIONS.INIT_LOADDER:
                return{...state,spinners:{...state.spinners,[action.payload.id]:false}};
        case ACTIONS.SHOW_AUTH_LOADER:
                return{...state,authLoader:true,showModal:false};
        case ACTIONS.HIDE_AUTH_LOADER:
            return{...state,authLoader:false};
        default:
            return state;
    }
}

export default function OneTapLogin(props) {
    const [state,dispatch]=useReducer(reducer,{name:"",showModal:false,id:"",spinners:{},showRemoveBtn:false,loginLoadder:false,authLoader:false})
    const {oneTapStorageDetails,changeDisplayMode,setCurrentUser,
                updateOneTapStorage,oneTapStorageId}=useContext(AuthContext);


    const hideModal=(e)=>{
        if(e.target.name === "remove"){
            removeAccount();
        }
        else{
            dispatch({type:ACTIONS.HIDE_MODAL});
        }
    }

    const showModal=(name,id)=>{
        dispatch({type:ACTIONS.SHOW_MODAL,payload:{name,id}})
    }

    const removeAccount=async(id=null)=>{
        try{
            dispatch({type:ACTIONS.SHOW_AUTH_LOADER});
            const userId=id??state.id
            const updateStorageDetails=oneTapStorageDetails.filter((detail)=>detail.id !== userId);
            const resp=await updateDoc(doc(oneTapStorageDbRef,oneTapStorageId),{details:updateStorageDetails});
            console.log(resp);
            updateOneTapStorage(state.id);
            window.location.reload();
        }
        catch(err){
            console.log(err);
            dispatch({type:ACTIONS.HIDE_AUTH_LOADER});
            window.location.reload();
        }
        
    }

    const logInUser=async ({email,password,id})=>{
        console.log(email,password,id)
        dispatch({type:ACTIONS.SHOW_LOADDER,payload:{id}});
        try{
            const docSnap=await getDoc(doc(userDbRef,id));
            console.log(docSnap);
            if(docSnap.exists()){
                const data=docSnap.data();
                const pwd=CryptoJS.AES.decrypt(data.password,data.userId).toString(CryptoJS.enc.Utf8);
                const userCredential=await signInWithEmailAndPassword(auth,data.email,pwd);
                setCurrentUser(userCredential.user);
                window.location.reload();
                console.log(data);
            }
            else throw new Error();
            
        }
        catch(err){
            console.log(err);
            dispatch({type:ACTIONS.HIDE_LOADDER,payload:{id}});
            removeAccount(id);
        }
        
    }

    const toggleRemoveBtn=()=>{
        dispatch({type:ACTIONS.TOGGLE_REMV_BTN})
    }

    const switchToLoginScreen=()=>{
        const pwd=CryptoJS.AES.decrypt(oneTapStorageDetails[0].password,oneTapStorageDetails[0].id).toString(CryptoJS.enc.Utf8);
        props.setLoginCred(oneTapStorageDetails[0].name,pwd);
    }

    useEffect(()=>{
        oneTapStorageDetails.forEach((detail)=>{
            dispatch({type:ACTIONS.INIT_LOADDER,payload:{id:detail.id}})
        })
    },[])

    console.log(oneTapStorageDetails)
    return (
        <Container className={styles.loginContainer}>
            <img src={loginLogo} className={styles.loginLogo}/>
            <div className={styles.wrapper}>
                <div className={styles.loginCont}>
                    <img src={logo} className={styles.logo}/>
                    <div className={styles.loginForm}>
                        {oneTapStorageDetails.length === 1?
                            <div className={styles.singleUserDetails} >
                                <img src={oneTapStorageDetails[0].imgUrl} alt=""/>
                                <LoaderButton btnName={`Continue as ${oneTapStorageDetails[0].name}`} type="button" showSpinner={state.spinners[oneTapStorageDetails[0].id]}
                                    isDisabled={false} clickHandler={logInUser.bind(null,oneTapStorageDetails[0])}/>
                                <Button variant='link' type="button" 
                                    onClick={e=>showModal(oneTapStorageDetails[0].name,oneTapStorageDetails[0].id)}>
                                    Remove account
                                </Button>
                            </div>:
                            <div className={styles.multiUserDetails}>
                                {oneTapStorageDetails.map((detail)=>{
                                    return (
                                        <div className={styles.detailCont} key={detail.id}>
                                            <img src={detail.imgUrl} alt=""/>
                                            <span>{detail.name}</span>
                                            {state.showRemoveBtn?
                                                <button type="button" className={styles.removeAccBtn} onClick={e=>showModal(detail.name,detail.id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
                                                        <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                                                L12.71,12z"></path>
                                                    </svg>
                                                </button>:
                                                <LoaderButton btnName="Log in" isDisabled={false} type="button" showSpinner={state.spinners[detail.id]} 
                                                            clickHandler={logInUser.bind(null,detail)}/>
                                            }
                                        </div>
                                    )
                                })}
                                <div className={styles.manageAccCont}>
                                    <Button variant="link" className="text-decoration-none shadow-none" onClick={toggleRemoveBtn}>
                                        {state.showRemoveBtn?"Done Editing":"Manage Account"}
                                    </Button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div className={styles.signupCont}>
                <div className={styles.accSwitchOptnCont}>
                    {oneTapStorageDetails.length ===1 && <span>Not {oneTapStorageDetails[0].name}?</span>}
                    <div>
                        <Button variant="link" className="text-decoration-none" onClick={switchToLoginScreen}>
                                Switch Accounts
                        </Button>
                        <span>or</span>
                        <Button variant="link" className="text-decoration-none ps-1" onClick={e=>changeDisplayMode(DISPLAY_MODE.SIGNUP_MODE)}>
                                Sign Up
                        </Button>
                    </div>
            </div>
                </div>
                {state.loginLoadder?
                    <div className={styles.loginModal}></div>:
                    ""
                }
            </div>
            {state.authLoader && <AuthSpinner2/>}
            <RemoveAccountModal show={state.showModal} onHide={hideModal}  name={state.name}/>
        </Container>
    )
}
function RemoveAccountModal(props) {
    return (
      <Modal
        {...props} size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter" className="ms-auto">
            <h5 className='text-center'>Remove Account?</h5>
            <p className='text-muted text-center' style={{fontSize:"0.8125rem"}}>You'll need to enter your username and password the next time you log in as {props.name}</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-1 pb-1 text-center">
            <Button variant='link' className="text-decoration-none shadow-none" onClick={props.onHide} name="remove">Remove</Button>
        </Modal.Body>
        <Modal.Footer className="justify-content-center pt-1 pb-1">
          <Button variant="light" onClick={props.onHide} className='text-muted' name="cancel">Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }