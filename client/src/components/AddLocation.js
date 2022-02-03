import React, { useRef, useState } from 'react';
import styles from "../styles/homePageNavbar.module.css";
import { Button } from "react-bootstrap";
import AuthSpinner2 from "../components/AuthSpinner2";
import AuthSpinnerMd from './AuthSpinnerMd';
import { ActiveWrapper } from './UserPostModal';

const AddLocation = ({className,chnageActiveMode,updateUserAddLoc}) => {

    const [locName,setLocName]=useState("");
    const locTimer=useRef(null);
    const [userMsg,setUserMsg]=useState("");
    const [showSpinner,setShowSpinner]=useState(false);
    const [searchRes,setSearchRes]=useState([]);


    const handleChange=(e)=>{
        setLocName(e.target.value);
        setShowSpinner(true);
        setUserMsg("");
        setSearchRes([])
    }

    const getNearByLatLong=async(lat,long,name)=>{
        try{
            const cate="commercial.supermarket,catering.restaurant,commercial.books,accommodation.hotel,education.library,national_park,building.entertainment,commercial.shopping_mall,sport.stadium,catering.cafe";
            const filterOptn=`circle:${long},${lat},5000`
            const url=`https://api.geoapify.com/v2/places?categories=${cate}&filter=${filterOptn}&limit=30&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`;
            const resp=await fetch(url);
            const data=await resp.json();
            const searchRes=[{heading:name,body:""}];
            data.features.forEach((feature)=>{
                const prop=feature.properties;
                const data={heading:prop.name,body:`${prop.street},${prop.city},${prop.state},${prop.country}`};
                searchRes.push(data);
            })
            setSearchRes([...searchRes]);
            setShowSpinner(false)
        }
        catch(err){
            console.log(err)
            setUserMsg("No Result")
            setShowSpinner(false);
        }

    }

    const resetSearchRes=()=>{
        setLocName("");
        setSearchRes([]);
        setShowSpinner(false);
        setUserMsg("");
    }
    const getLatByName=async(name) =>{
        try{
            const url=`https://spott.p.rapidapi.com/places/autocomplete?limit=1&skip=0&country=IN&q=${name}&type=CITY`;
            const options={
                method:"GET",
                headers:{
                    "x-rapidapi-host": process.env.REACT_APP_RAPID_HOST,
                    "x-rapidapi-key": process.env.REACT_APP_RAPID_KEY
                }
            }
            const resp=await fetch(url,options);
            const data=await resp.json();
            const {latitude:lat,longitude:long}=data[0].coordinates;
            console.log(data)
            await getNearByLatLong(lat,long,data[0].name);
        }catch(err){
            console.log(err)
            setUserMsg("No Result")
            setShowSpinner(false);
        }
    }
    const searchLocByName=async ()=>{
        if(locName.length<3){
            setUserMsg("Please type at least 3 character to get the result.")
            setShowSpinner(false)
        }
        else{
            await getLatByName(locName);
        }
    }
    const handleKeyUp=(e)=>{
        if(locTimer.current) clearTimeout(locTimer.current);
        locTimer.current=setTimeout(searchLocByName,1000);
    }
    const getUserSelectedLoc=(indx)=>{
        updateUserAddLoc(searchRes[indx]);
        resetSearchRes();
        chnageActiveMode(ActiveWrapper.USER_CAPTN_MODE);
        
    }

  return (
    <div className={`${styles.addLocWrapper} ${className}`}>
        <div className={styles.addLocCont}>
            <div className={styles.addLocHeader}>
                <button type="button" onClick={e=>chnageActiveMode(ActiveWrapper.USER_CAPTN_MODE)}>
                    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                        <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                    L12.71,12z"></path>
                    </svg>
                </button>
                <span className='ms-auto me-auto'>Add Location</span>
            </div>
            <div className={styles.addLocBody}>
                <div className={styles.searchInput}>
                    <input type="text" placeholder='Find a Location' value={locName} onChange={handleChange} onKeyUp={handleKeyUp}/>
                    <button type="button" className={styles.searchBtn} >
                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                            <path d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7s-7,3.13-7,7s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 
                                l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z">
                            </path>
                        </svg>
                    </button>
                    <button type="button" className={locName.length>0?`${styles.resetBtn} ${styles.showResetBtn}`:styles.resetBtn} onClick={resetSearchRes}>
                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                            <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                    L12.71,12z"></path>
                        </svg>
                    </button>
                </div>
                <div className={styles.searchRes}>
                    {searchRes.map((data,inx)=>{
                        return(
                            <div key={inx} onClick={e=>{getUserSelectedLoc(inx)}}>
                                <span>{data.heading}</span>
                                <span className="text-muted">{data.body}</span>
                            </div>
                        )
                    })}
                </div>
                {showSpinner && <AuthSpinnerMd style={{justifyContent:"flex-start",paddingTop:"1.75rem"}}/>}
                {userMsg.length>0 && <div className={styles.userMsgCont}>{userMsg}</div>}
                   
            </div>
        </div>
    </div>
  )
};

export default AddLocation;
