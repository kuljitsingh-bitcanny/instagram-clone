import React, { useContext ,useState} from 'react';
import { AuthContext } from '../context/AuthProvider';
import { auth } from '../lib/Firebase';
import { signOut } from 'firebase/auth';
import HomePageNavbar from './HomePageNavbar';
import { HomeContext } from './HomeContext';
import styles from "../styles/userLocalAdd.module.css";
import oneTapLogo from "../images/app_logo/one_tap_icon.png";
import LoaderButton from './LoaderButton';
import { Button } from 'react-bootstrap';
import { oneTapStorageDbRef } from '../lib/Firebase';
import { updateDoc,doc,addDoc,setDoc } from 'firebase/firestore';
import { maxUserStorageAllwd,getEncryptedToken,oneTapStorage } from '../constants/constants';


export default function HomePage() {
    const {currentUser}=useContext(AuthContext);
    const {isUserAddedLocally}=useContext(HomeContext);

  return (
      <>
        <HomePageNavbar/>
        {isUserAddedLocally?
          <>
            <h1 className='pt-5'>{currentUser.username}</h1>
            <button onClick={e=>signOut(auth)}>Log out</button>
          </>:
          <ScreenToAddUserLocally/>
        }
      </>
  );
}


function ScreenToAddUserLocally(){
  const {currentUser,oneTapStorageId,oneTapStorageDetails,addOneTapStorageId,updateOneTapStorage}=useContext(AuthContext);
  const {setIsUserAddedLocally}=useContext(HomeContext);
  const [showSpinner,setShowSpinner]=useState(false);

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
      setIsUserAddedLocally();
    }
    catch(err){
      setShowSpinner(false);
      setIsUserAddedLocally();
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
            <Button type="button" variant="link" className="text-decoration-none mt-2 mb-2 shadow-none" onClick={setIsUserAddedLocally}>Not Now</Button>
          </div>

      </div>
      <div className={showSpinner?"inv-loader":"inv-loader hide-loader"} style={{backgroundColor:"#ff000073"}}></div>
    </div>
  )
}