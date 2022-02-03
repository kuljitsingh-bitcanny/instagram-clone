import { getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useContext, useEffect, useState ,useRef, useCallback, useReducer} from 'react';
import { Button ,Modal} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import LoaderButton from '../components/LoaderButton';
import { maxAllowdUserFetch,handleDragMove,handleDragUp,handleLeftScrollBtnClick,handleRightScrollBtnClick } from '../constants/constants';
import { AuthContext } from '../context/AuthProvider';
import { userDbRef } from '../lib/Firebase';
import { setHomePageLoader } from '../reduxService/actions/homePageLoaderActions';
import styles from "../styles/homePageBody.module.css";
import DragMove from '../components/DragMove';
import findPeopleLogo from "../images/app_logo/find_people.png";


const ACTIONS={
    SET_TRANSX:"SET_TRANX" ,
    SHOW_MODAL:"SHOW_MODAL",
    SET_TRANSX_AND_SCROLL_BTN:"SET_TRANSX_AND_SCROLL_BTN",
    SET_BTN_NAME:"SET_BTN_NAME",
    SET_BTN_NAME_AND_VARIANT:"SET_BTN_NAME_AND_VARIANT",
    SET_MODAL_AND_MODAL_INFO:"SET_MODAL_AND_MODAL_INFO",
    SET_SCROLL_BTN:"SET_SCROLL_BTN",
    SET_FOLLOW_BTN_INFO:"SET_FOLLOW_BTN_INFO",
    SET_INV_LOADER:"SET_INV_LOADER",
    ADD_TO_FOLLOWING_LIST:"ADD_TO_FOLLOWING_LIST",
    REMOVE_FROM_FOLLOWING_LIST:"REMOVE_FROM_FOLLOWING_LIST",

}
const reducer=(state,{type,payload})=>{
    switch(type){
        case ACTIONS.SET_TRANSX:
            return {...state,transx:payload};
        case ACTIONS.SET_TRANSX_AND_SCROLL_BTN:
            return {...state,transx:payload.transx,showNextBtn:payload.showNextBtn,showPrevBtn:payload.showPrevBtn};
        case ACTIONS.SET_MODAL_AND_MODAL_INFO:
            return {...state,showModal:payload.showModal,modalUserInfo:payload.modalUserInfo};
        case ACTIONS.SET_BTN_NAME_AND_VARIANT:
            return {...state,btnName:payload.btnName,btnVariant:payload.btnVariant};
        case ACTIONS.SET_SCROLL_BTN:
            return {...state,showPrevBtn:payload.showPrevBtn,showNextBtn:payload.showNextBtn};
        case ACTIONS.SET_FOLLOW_BTN_INFO:
            return {...state,btnName:payload.btnName,btnVariant:payload.btnVariant,btnLoader:payload.btnLoader};
        case ACTIONS.SET_INV_LOADER:
            return {...state,invLoader:payload.invLoader};
        case ACTIONS.ADD_TO_FOLLOWING_LIST:
            return {...state,followingList:[payload,...state.followingList]}
        case ACTIONS.REMOVE_FROM_FOLLOWING_LIST:
                return {...state,followingList:state.followingList.filter((id)=>payload!==id)}
        default:
            return state;

    }
}

export default function UserSuggestions({userSuggestions,updateUserSuggestion,addUserToFollowingList}){
   
    const [state,reducerDispatch]=useReducer(reducer,{transx:{curTransx:0,prevTransx:0},showNextBtn:false,showPrevBtn:false,btnName:{},
                                                        btnLoader:{},btnVariant:{},invLoader:false,showModal:false,
                                                        modalUserInfo:{userName:"",userImg:"",userId:""},followingList:[]});

    const suggesitonContRef=useRef(null);
    const childInfo=useRef({count:userSuggestions.length,width:160,paddedWidth:176});
    const dispatch=useDispatch();
    
    const isChildOverflow=()=>{
        const parentWidth=suggesitonContRef.current.offsetWidth;
        const totalChildWidth=(childInfo.current.count*childInfo.current.paddedWidth);
        return [totalChildWidth>parentWidth,parentWidth-totalChildWidth];
    }
    
    const onDragMove=(e)=>{
        const curTransx=handleDragMove(state.transx.curTransx,e.touches[0].clientX,state.transx.prevTransx,isChildOverflow)
        const payload={prevTransx:e.touches[0].clientX,curTransx};
        reducerDispatch({type:ACTIONS.SET_TRANSX,payload});
    }
    const onPointerDown=(e)=>{
        const payload={...state.transx,prevTransx:e.touches[0].clientX}
        reducerDispatch({type:ACTIONS.SET_TRANSX,payload});
    }
    const onPointerUp=(e)=>{
        const {curTransx,showNextBtn,showPrevBtn}=handleDragUp(state.transx.curTransx,childInfo.current.width,
                                                                    childInfo.current.paddedWidth,isChildOverflow);
        const transx={curTransx,prevTransx:0};
        const payload={transx,showNextBtn,showPrevBtn};
        reducerDispatch({type:ACTIONS.SET_TRANSX_AND_SCROLL_BTN,payload});
    }
    const handleResize=(e)=>{
        const [isOverflow]=isChildOverflow();
        const payload={transx:{curTransx:0,prevTransx:0},showNextBtn:isOverflow,showPrevBtn:false};
        reducerDispatch({type:ACTIONS.SET_TRANSX_AND_SCROLL_BTN,payload});
    }
    const nextBtnClickHandler=(e)=>{
        const {curTransx,showNextBtn}=handleRightScrollBtnClick(state.transx.curTransx,childInfo.current.paddedWidth,isChildOverflow);
        const payload={transx:{...state.transx,curTransx},showNextBtn,showPrevBtn:true};
        reducerDispatch({type:ACTIONS.SET_TRANSX_AND_SCROLL_BTN,payload});
    }
    const prevBtnClickHandler=(e)=>{
        const {curTransx,showPrevBtn}=handleLeftScrollBtnClick(state.transx.curTransx,childInfo.current.paddedWidth,isChildOverflow)
        const payload={transx:{...state.transx,curTransx},showNextBtn:true,showPrevBtn};
        reducerDispatch({type:ACTIONS.SET_TRANSX_AND_SCROLL_BTN,payload});
        
    }
    const handleClick=(indx)=>{
        const data=userSuggestions[indx];
        if(data.username){
            if(state.btnName[data.id].toLowerCase()==="following"){
                const payload={showModal:true,modalUserInfo:{userName:data.username,userId:data.id,userImg:data.imgUrl}};
                reducerDispatch({type:ACTIONS.SET_MODAL_AND_MODAL_INFO,payload});
                
            }
            else{
                const btnName={...state.btnName,[data.id]:"Following"}
                const btnVariant={...state.btnVariant,[data.id]:"outline-dark"};
                const payload={btnName,btnVariant};
                reducerDispatch({type:ACTIONS.SET_BTN_NAME_AND_VARIANT,payload});
                reducerDispatch({type:ACTIONS.ADD_TO_FOLLOWING_LIST,payload:data.id});

            }
            
        }
        else{
            console.log("find poeple clickd")
        }
    }
    const removeUserFromSuggestion=(id)=>{
        updateUserSuggestion(id);
        handleResize();
    }
    
    const hideModal=(e)=>{
        console.log(e)
        
        if(e.target.name.toLowerCase()==="unfollow"){
            const btnName={...state.btnName,[state.modalUserInfo.userId]:"Follow"};
            const btnVariant={...state.btnVariant,[state.modalUserInfo.userId]:null};
            const payload={btnName,btnVariant};
            reducerDispatch({type:ACTIONS.SET_BTN_NAME_AND_VARIANT,payload});
            reducerDispatch({type:ACTIONS.REMOVE_FROM_FOLLOWING_LIST,payload:state.modalUserInfo.userId});
        }
        const payload={showModal:false,modalUserInfo:{userName:"",userImg:"",userId:""}};
        reducerDispatch({type:ACTIONS.SET_MODAL_AND_MODAL_INFO,payload});
    }

    useEffect(()=>{
        console.log(suggesitonContRef)
        if(userSuggestions.length>0){
            childInfo.current.count=userSuggestions.length;
            const [isOverflow]=isChildOverflow();
            const btnName={};
            const btnVariant={};
            const btnLoader={};
            userSuggestions.forEach((data)=>{
                btnName[data.id]="Follow";
                btnVariant[data.id]=null;
                btnLoader[data.id]=false;
            })
            reducerDispatch({type:ACTIONS.SET_SCROLL_BTN,payload:{showNextBtn:isOverflow,showPrevBtn:false}})
            reducerDispatch({type:ACTIONS.SET_FOLLOW_BTN_INFO,payload:{btnName,btnVariant,btnLoader}});
            dispatch(setHomePageLoader(false))

        }
    },[userSuggestions.length])

    useEffect(()=>{
        window.addEventListener("resize",handleResize);
        return ()=>{window.removeEventListener("resize",handleResize)};
    },[])

    return (
        <>
            { userSuggestions.length>0 && 
                <div className={styles.suggestionMainWrapper}>
                    <div >
                        <h5 className='text-center'>Welcome to Instagram</h5>
                        <p className='text-center text-muted ps-3 pe-3' style={{fontSize:"0.875rem"}}>When you follow people,you will see the photos and videos they post here.</p>
                        <h6 className='ps-2 pe-2 mb-3'>Suggestion For You</h6>
                    </div>
                    <DragMove onDragMove={onDragMove} onPointerDown={onPointerDown} onPointerUp={onPointerUp} 
                            showNextBtn={state.showNextBtn} showPrevBtn={state.showPrevBtn} nextBtnClickHandler={nextBtnClickHandler} 
                            prevBtnClickHandler={prevBtnClickHandler}>
                        <SuggestionCont userSuggestions={userSuggestions} cssClass={styles.suggestionCont} 
                            style={{transform:`translateX(${state.transx.curTransx}px)`}} divRef={suggesitonContRef} btnName={state.btnName}
                            variant={state.btnVariant} showBtnLoaders={state.btnLoader} handleClick={handleClick} 
                            removeUserFromSuggestion={removeUserFromSuggestion}/>

                    </DragMove>
                    <SuggestionCont userSuggestions={userSuggestions} cssClass={styles.suggestionContMd} btnName={state.btnName}
                                    variant={state.btnVariant} showBtnLoaders={state.btnLoader} handleClick={handleClick}/>
                    {state.followingList.length>0 && <LoaderButton btnName="Get Started" 
                                    clickHandler={e=>addUserToFollowingList(state.followingList)}/>}
                                    
                    <div className={state.nvLoader?"inv-loader":"inv-loader hide-loader"}></div>
                    <UnfollowModal show={state.showModal} userimg={state.modalUserInfo.userImg} username={state.modalUserInfo.userName}
                                onHide={hideModal}/>
                </div>

            }
        </>
    )
}

function SuggestionCont({userSuggestions,cssClass,style,divRef,showBtnLoaders,handleClick,btnName,variant,removeUserFromSuggestion}){
    return (
        <div className={cssClass} style={style} ref={divRef}> 
        {userSuggestions.map((data,indx)=>{
            return(
                <div key={data.id} className={styles.singleSuggestion}>
                    {indx !== userSuggestions.length-1 && 
                        <button type="button"  className={styles.remvBtn} onClick={e=>removeUserFromSuggestion(data.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                        L12.71,12z"></path>
                            </svg>
                        </button>
                    }
                    <img src={data.imgUrl} alt=""/>
                    <div className={indx !== userSuggestions.length-1?`${styles.userInfoCont}`:`${styles.userInfoCont} ${styles.findPeopleCont}`}>
                        <span>{data.username}</span>
                        <span>{data.fullname}</span>
                        <span>{data.extra}</span>
                    </div>
                    {indx === userSuggestions.length-1?
                        <LoaderButton btnName="Find People" showSpinner={false} type="button" isDisabled={false} clickHandler={e=>handleClick(indx)}/>:
                        <LoaderButton btnName={btnName[data.id]} showSpinner={showBtnLoaders[data.id]} type="button" isDisabled={false} 
                                        clickHandler={e=>handleClick(indx)} variant={variant[data.id]}/>
                    }
                </div>
            )
        })}
    
    </div>
    )
}

function UnfollowModal(props) {
    return (
      <Modal
        {...props} size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header >
          <Modal.Title id="contained-modal-title-vcenter" className="d-flex flex-column align-items-center ms-auto me-auto">
            <img src={props.userimg} alt="" style={{width:"64px",height:"64px",borderRadius:"50%",margin:"1rem 0rem"}}/>
            <p className="text-muted" style={{fontSize:"0.9325rem"}}>Unfollow {props.username.toLowerCase()}?</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 pb-0 text-center">
            <Button variant="light" className="text-danger" onClick={props.onHide} name="unfollow">Unfollow</Button>
        </Modal.Body>
        <Modal.Footer className="justify-content-center pt-0 pb-0">
          <Button onClick={props.onHide} variant="light" className="text-muted" name="cancel">Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }