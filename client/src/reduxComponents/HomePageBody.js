import { getDocs, limit, orderBy, query ,updateDoc,where,doc, getDoc} from 'firebase/firestore';
import React, { useContext, useEffect, useState} from 'react';
import { useDispatch } from 'react-redux';
import { maxAllowdUserFetch} from '../constants/constants';
import { AuthContext } from '../context/AuthProvider';
import { userDbRef,postsDbRef } from '../lib/Firebase';
import { setHomePageLoader } from '../reduxService/actions/homePageLoaderActions';
import styles from "../styles/homePageBody.module.css";
import findPeopleLogo from "../images/app_logo/find_people.png";
import UserSuggestions from "./UserSuggestions";



const fetchUserSuggestions=async (id,followingList=[],isWhereReq=false)=>{
    const followings=[];
    try{
        let q;
        if(isWhereReq){
            q=query(userDbRef,where("followers","not-in",[[id]]),orderBy("followers","desc"),
                                orderBy("followersCount","desc"),limit(maxAllowdUserFetch));
        } else{
            q=query(userDbRef,orderBy("followersCount","desc"),limit(maxAllowdUserFetch));
        }
        const docSnap=await getDocs(q);
        console.log(docSnap)
        docSnap.forEach((doc)=>{
            const data=doc.data();
            if(data.userId!==id){
                followings.push({id:data.userId,fullname:data.fullname,username:data.username,imgUrl:data.imgUrl,extra:"Suggested for you"});
            }
        })
        followings.push({id:Date.now(),fullname:"Find People To Follow",extra:"Follow people on Instagram to see what they share",
                        imgUrl:findPeopleLogo});
        return {followings,failedMsg:""};
    }
    catch(err){
        console.log(err)
        return {followings,failedMsg:"Failed to load suggestions for you.Try to refersh page. "}
    }
}
const checkFollowingPosts=async (followingList)=>{
    const hasPostArr=await Promise.all(followingList.map(async (id)=>{
        const q=query(doc(postsDbRef,id));
        const docSnap=await getDoc(q);
        return docSnap.exists();
    }))
    const hasPost=hasPostArr.some((status)=>status);
    console.log(hasPost)
    return hasPost;
    
}
const updateFollower=async (userId,followerId)=>{
    const resp=await getDoc(doc(userDbRef,userId));
    const userData=resp.data();
    const updatedFollowerList=[followerId,...userData.followers];
    await updateDoc(doc(userDbRef,userId),{followers:updatedFollowerList,followersCount:updatedFollowerList.length});
    return userId;
    
    
}


export default function HomePageBody() {
    const [highFollwerUser,setHighFollwerUser]=useState([]);
    const [showEmptyDiv,setShowEmptyDiv]=useState(true);
    const {currentUser}=useContext(AuthContext);
    const [fetchFailedMsg,setFetchFailedMsg]=useState("");
    const dispatch=useDispatch();
    

    useEffect(async ()=>{
        setShowEmptyDiv(true);
        dispatch(setHomePageLoader(true));
        if(currentUser.followingCount==0){
            const {followings,failedMsg}=await fetchUserSuggestions(currentUser.userId);
            setHighFollwerUser([...followings]);
            setFetchFailedMsg(failedMsg);
            setShowEmptyDiv(false);
            
        }
        else{
            try{
                const hasPost=await checkFollowingPosts(currentUser.following);
                if(!hasPost){
                    const {followings,failedMsg}=await fetchUserSuggestions(currentUser.userId,currentUser.following,true);
                    setHighFollwerUser([...followings]);
                    setFetchFailedMsg(failedMsg);
                    setShowEmptyDiv(false);
                }
            }
            catch(err){
                console.log("error occured");
            }
            
            

        }
    },[])
    const updateUserSuggestion=(id)=>{
        setHighFollwerUser((userList)=>{
            const newUserList=userList.filter((user)=>user.id !==id);
            return [...newUserList];
        })
    }
    const addUserToFollowingList=async (followingList)=>{
        setShowEmptyDiv(true);
        dispatch(setHomePageLoader(true));
        try{
            const addedFollowing=await Promise.allSettled(followingList.map(async (id)=>await updateFollower(id,currentUser.userId)));
            const updatedFollowingList=addedFollowing.filter((status)=>status.value??false).map((status)=>status.value);
            updatedFollowingList.concat(currentUser.following);
            await updateDoc(doc(userDbRef,currentUser.userId),{"following":updatedFollowingList,"followingCount":updatedFollowingList.length});
            setShowEmptyDiv(false);
            dispatch(setHomePageLoader(false));
        }
        catch(err){
            console.log(err);
            setShowEmptyDiv(false);
            dispatch(setHomePageLoader(false));
        }
        

    }
   
  return (
      <div className={styles.homePageBobyMainWrapper}>
        {showEmptyDiv?"":
            <UserSuggestions userSuggestions={highFollwerUser} updateUserSuggestion={updateUserSuggestion} 
                        addUserToFollowingList={addUserToFollowingList}/>
        }
        {fetchFailedMsg.length>0 && <FetchFailed msg={fetchFailedMsg}/>}
      </div>
  )
}

function FetchFailed({msg}){
    return (
        <div className={styles.fetchFailedCont}>
            <span>{msg}</span>
        </div>
    )
}
