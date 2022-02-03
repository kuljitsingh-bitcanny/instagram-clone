import React, { useContext ,useState,useEffect, useLayoutEffect} from 'react';
import { AuthContext } from '../context/AuthProvider';
import HomePageNavbar from './HomePageNavbar';
import styles from "../styles/userLocalAdd.module.css";
import oneTapLogo from "../images/app_logo/one_tap_icon.png";
import LoaderButton from '../components/LoaderButton';
import { Button } from 'react-bootstrap';
import { oneTapStorageDbRef } from '../lib/Firebase';
import { updateDoc,doc,addDoc,setDoc } from 'firebase/firestore';
import { maxUserStorageAllwd,getEncryptedToken,oneTapStorage } from '../constants/constants';
import { useSelector,useDispatch} from 'react-redux';
import { setUserAddLocally } from "../reduxService/actions/userLocalAddActions";
import HomePageBody from './HomePageBody';
import HomePageLoader from './HomePageLoader';
import { setHomePageLoader } from '../reduxService/actions/homePageLoaderActions';
import UserPostModal from '../components/UserPostModal';

 export default function HomePage() {
    const {currentUser,oneTapStorageDetails}=useContext(AuthContext);
    const isUserAddedLocally=useSelector((state)=>state.isUserAddedLocally);
    const showHomePageLoader=useSelector(state=>state.homePageLoader);
    const dispatch=useDispatch();

    useLayoutEffect(()=>{
      dispatch(setHomePageLoader(true));
    },[dispatch])
    
    useEffect(()=>{
        const isUserLocally=oneTapStorageDetails.some((detail)=>detail.id===currentUser.userId);
        if(!isUserAddedLocally) dispatch(setHomePageLoader(false));
        dispatch(setUserAddLocally(isUserLocally));
      },[dispatch]);


  return (
      <>
        <HomePageNavbar isUserAddedLocally={isUserAddedLocally} UserPostModal={<UserPostModal/>}/>
        {isUserAddedLocally?
          <HomePageBody/>:
          <ScreenToAddUserLocally/>
        }
        {showHomePageLoader && <HomePageLoader/>}
      </>
  );
}


function ScreenToAddUserLocally(){
  const {currentUser,oneTapStorageId,oneTapStorageDetails,addOneTapStorageId,updateOneTapStorage}=useContext(AuthContext);
  const [showSpinner,setShowSpinner]=useState(false);
  const dispatch=useDispatch();

  const addUserLocally=async ()=>{
    setShowSpinner(true);
    try{
      const userDetails={id:currentUser.userId,imgUrl:currentUser.imgUrl,name:currentUser.username,provider:currentUser.provider};
      const newStorageArr=[userDetails,...oneTapStorageDetails];
      if(newStorageArr.length>maxUserStorageAllwd) newStorageArr.pop();
      if(oneTapStorageId){
        await updateDoc(doc(oneTapStorageDbRef,oneTapStorageId),{"details":newStorageArr});
      }
      else{
        const docRef=await addDoc(oneTapStorageDbRef,{"details":newStorageArr});
        const token=getEncryptedToken(docRef.id);
        window.localStorage.setItem(oneTapStorage,token);
        addOneTapStorageId(docRef.id);
      }
      updateOneTapStorage(currentUser.userId);
      setShowSpinner(false);
      dispatch(setUserAddLocally(true));
      // setIsUserAddedLocally();
    }
    catch(err){
      setShowSpinner(false);
      dispatch(setUserAddLocally(false));
    }
  }


  return(
    <div className={styles.mainWrapper}>
      <div className={styles.parentWarpper}>
          <img src={oneTapLogo} alt=""/>
          <div className={styles.msgCont}>
            <h5 className="mt-3 mb-3 text-center fw-bold">Save Your Login Info?</h5>
            <p className="text-center text-muted">We can save your login info on this browser so you don't need to enter it again.</p>
            <LoaderButton btnName="Save Info" isDisabled={false} type="button" showSpinner={showSpinner} clickHandler={addUserLocally}/>
            <Button type="button" variant="link" className="text-decoration-none mt-2 mb-2 shadow-none" onClick={e=>dispatch(setUserAddLocally(false))}>Not Now</Button>
          </div>

      </div>
      <div className={showSpinner?"inv-loader":"inv-loader hide-loader"} style={{backgroundColor:"#ff000073"}}></div>
    </div>
  )
}

