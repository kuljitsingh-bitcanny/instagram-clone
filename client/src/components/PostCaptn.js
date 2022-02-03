import React, { useContext ,useLayoutEffect,useState} from 'react';
import styles from "../styles/homePageNavbar.module.css";
import { Button } from "react-bootstrap";
import { AuthContext } from '../context/AuthProvider';
import Picker from 'emoji-picker-react';
import { maxCaptnChar } from '../constants/constants';
import { ActiveWrapper } from './UserPostModal';
import { HomePageNavbarContext } from '../reduxComponents/HomePageNavbar';

const SHARE_STATUS={
    SHARING:"sharing",
    SUCCESS:"success",
    FAILED:"failed"
}

export default function PostCaptn({chnageActiveMode,isUserAddLoc,className,updateUserAddLoc,userAddLoc}) {
    const {currentUser}=useContext(AuthContext);
    const {userPosts}=useContext(HomePageNavbarContext);
    const [showEmoji,setShowEmoji]=useState(false);
    const [postCaptn,setPostCaptn]=useState("");
    const [isFileSharing,setIFileSharing]=useState(false);
    const [shareStatus,setShareStatus]=useState(SHARE_STATUS.SHARING);

    const onEmojiClick=(e,emojiObject)=>{
        if(postCaptn.length<=maxCaptnChar){
            setPostCaptn((postCaptn)=>postCaptn+emojiObject.emoji);
        }
    }
    const handleChange=(e)=>{
        if(e.target.value.length<=maxCaptnChar){
            setPostCaptn(e.target.value);
        }
    }
    const checkAndShowAddLoc=()=>{
        if(!isUserAddLoc){
            chnageActiveMode(ActiveWrapper.USER_ADD_LOC_MODE);
        }
    }
    const AddorRemoveLoc=()=>{
        if(!isUserAddLoc){
            chnageActiveMode(ActiveWrapper.USER_ADD_LOC_MODE);
        }
        else{
            updateUserAddLoc();
        }
    }
    const shareUserPost=()=>{
        setIFileSharing(true);
    }
    
  return(
    <div className={`${styles.postCaptnWrapper} ${className}`}>
        <div className={styles.captnCont}>
            <div className={styles.captnHeader}>
                {!isFileSharing?
                    <>
                        <button type="button" onClick={e=>chnageActiveMode(ActiveWrapper.USER_POST_MODE)}>
                            <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M21,11v1H5.64l6.72,6.72l-0.71,0.71L3.72,11.5l7.92-7.92l0.71,0.71L5.64,11H21z"></path>
                            </svg>
                        </button>
                        <span>New Post</span>
                        <Button variant="link" className="text-decoration-none shadow-none" onClick={shareUserPost}>Share</Button>
                    </>:
                    <span className="ms-auto me-auto">Sharing</span>
                }
            </div>
            <div className={styles.captnBody}>
                    {!isFileSharing?
                        <>
                            <div className={styles.postDetails}>
                            <img src={currentUser.imgUrl}/>
                            <span>{currentUser.username}</span>
                            <img src={URL.createObjectURL(userPosts[0].file)}/>
                            </div>
                            <div className={styles.captnDetail}>
                                    <textarea placeholder='Write a caption...' value={postCaptn} onChange={handleChange}></textarea>
                                    <div className={styles.captnOptn}>
                                        <button type="button" onClick={e=>setShowEmoji((emoji)=>!emoji)} className='text-muted'><i className="far fa-grin"></i></button>
                                        <span className='text-muted'>{postCaptn.length}/{maxCaptnChar}</span>
                                    </div>
                            </div>
                            <div className={`${styles.extraCont} custom-emoji-cont`}>
                                    {showEmoji?
                                        <Picker onEmojiClick={onEmojiClick} disableSearchBar={true} preload={true}
                                            pickerStyle={{width:"100%",height:"162px",borderTopLeftRadius:"0px",borderTopRightRadius:"0px"}}/>:
                                        <div type="button" className={styles.addLocationBtn}>
                                            <button type="button" onClick={checkAndShowAddLoc}>
                                                {isUserAddLoc?
                                                    <>
                                                        <span className={styles.heading}>{userAddLoc.heading}</span>
                                                        <span className={styles.body}>{userAddLoc.body}</span>
                                                    </>:
                                                    <span className={styles.noLocMsgCont}>Add a Location</span>
                                                }
                                            </button>
                                            <button type="button" onClick={AddorRemoveLoc}>
                                                {isUserAddLoc?
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#fff">
                                                            <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                                                        L12.71,12z"></path>
                                                        </svg>
                                                    </span>:
                                                    <i className="fas fa-chevron-right text-muted"></i>
                                                }
                                            </button>
                                        </div>
                                    }
                            </div>
                        </>:
                        <div style={{flexGrow:"1",display:"flex"}}>
                             {shareStatus === SHARE_STATUS.SHARING?
                                <div className={styles.sharingLoader}>
                                    <span></span>
                                </div>:
                                shareStatus === SHARE_STATUS.SUCCESS?
                                    <div className={styles.shareSuccess}>
                                        <i className="far fa-check-circle"></i>
                                        <span>Your post have been saved.</span>
                                    </div>:
                                    <div className={styles.shareFailed}>
                                        <i className="far fa-times-circle"></i>
                                        <span>Sorry,Your post have not saved.</span>
                                    </div>
                            }
                        </div>
                    }
            </div>
        </div>
    </div>
  )
}
