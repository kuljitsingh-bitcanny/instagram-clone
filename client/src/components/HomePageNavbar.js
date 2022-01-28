import React,{Component} from "react"
import styles from "../styles/homePageNavbar.module.css";
import {Row,Col, Button} from "react-bootstrap";
import logo from "../images/app_logo/logo.png";
import { HomeContext } from "./HomeContext";
import SearchLoadder from "./SearchLoadder";
import { blurringDelay,searchDelay } from "../constants/constants";
import {  query , getDocs, where} from "firebase/firestore";
import {  userDbRef } from "../lib/Firebase";


export default class HomePageNavbar extends Component{
    static contextType=HomeContext;
    constructor(props){
        super(props);
        this.state={searchResults:[],searchInput:"",recentSearch:[],isDataLoading:false,showSearchCont:false,
                    showResetBtn:false,isFirstTime:true,showSearchBtn:true};
        this.searchLoaderTimer=null;
        this.blurTimer=null
    }
    handleFocus=(e)=>{
        this.setState((state)=>{
            return {showSearchCont:true,showResetBtn:state.searchInput.length>0,isFirstTime:true,showSearchBtn:false}
        })
    }
    clearBlurTimer=()=>{
        if(this.state.searchInput.length>0 || this.state.recentSearch.length>0){
            if(this.blurTimer) clearTimeout(this.blurTimer);
            this.setState({showSearchBtn:false});
        }
    }
    resetInput=()=>{
        this.setState({isDataLoading:false,showResetBtn:false,showSearchCont:false,searchResults:[],showSearchBtn:true});
    }
    handleBlur=(e)=>{
        if(this.blurTimer) clearTimeout(this.blurTimer);
        this.blurTimer=setTimeout(this.resetInput,blurringDelay);
        
        
    }
    handleChange=(e)=>{
        this.setState({searchInput:e.target.value,isDataLoading:e.target.value.length>0,
                        showResetBtn:!e.target.value.length>0,searchResults:[],isFirstTime:true});
        if(e.target.value.length===0 && this.searchLoaderTimer){
            clearTimeout(this.searchLoaderTimer);
        }
    }

    handleKeyUp=(e)=>{
        if(e.target.value.length>0){
            if(this.searchLoaderTimer) clearTimeout(this.searchLoaderTimer);
            this.searchLoaderTimer=setTimeout(this.searchUsername,searchDelay);
        }
    }
    
    searchUsername=async ()=>{
        console.log(this.state.searchInput);
        const searchRes=[];
        const q=query(userDbRef,where("keywords","array-contains",this.state.searchInput));
        const docSnap=await getDocs(q); 
        docSnap.forEach((doc)=>{
            const data=doc.data();
            searchRes.push({imgUrl:data.imgUrl,id:data.userId,username:data.username,fullname:data.fullname})
        })
        this.setState({searchResults:[...searchRes],isDataLoading:false,showResetBtn:true,isFirstTime:false});
        
    }
    handleClick=(e)=>{
        if(this.blurTimer) clearTimeout(this.blurTimer);
        this.setState({searchInput:"",isDataLoading:false,showResetBtn:false,showSearchCont:false,searchResults:[],showSearchBtn:true})
    }
    showUserDetailAndToRecentSeacrch=(indx)=>{
        this.clearBlurTimer();
        this.setState(({recentSearch,searchResults})=>{
            return {recentSearch:[searchResults[indx],...recentSearch]};
        });
        this.showUserDetail(indx);
    }
    showUserDetail(indx){
        //show user detail info
        this.clearBlurTimer();
        console.log("indx",indx,this.state.searchResults[indx]);
    }
    removeFromRecentSearch=(id)=>{
        this.setState(({recentSearch})=>{
            return {recentSearch:recentSearch.filter((data)=>data.id!==id)}
        })
    }
    clearRecentSearch=()=>{
        this.setState({recentSearch:[]});
    }

    renderUserDetail=(data,indx,func1,isResetReq=false,func2=null)=>{
        const outputElement=<div key={data.id}>
                                <div  onClick={func1.bind(this,indx)}  className={styles.searchRes}>
                                    <span className={styles.imgWrapper}>
                                    <img src={data.imgUrl} alt=""/>
                                    </span>
                                    <div className={styles.userInfo}>
                                        <span>{data.fullname}</span>
                                        <span>{data.username}</span>
                                    </div>
                                </div>
                                {isResetReq && 
                                    <div>
                                        <button type="button" onClick={func2.bind(this,data.id)} className={styles.delBtn}>
                                            <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
                                                <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                                        L12.71,12z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                }
                            </div>;
        return outputElement;
    }
    
    render(){
        return (
            <div className={styles.navbarMainCont}>
                <div>
                    <Row style={{height:"42px",alignItems:"center",justifyContent:"center"}}>
                        <Col  style={{maxWidth:"184px",marginTop:"0.5rem"}} >
                            <button type="button" className={styles.logoBtn}>
                                <img src={logo} alt=""/>
                            </button>
                        </Col>
                        <Col className={styles.userSearchContainer}>
                            <input type="text" placeholder="search" name="searchInput" value={this.state.searchInput} onChange={this.handleChange}
                                    onFocus={this.handleFocus} onBlur={this.handleBlur} onKeyUp={this.handleKeyUp} 
                                    className={`${this.state.showSearchBtn?styles.extraPaddedInput:""}`}/>
                            {this.state.showSearchBtn && 
                                <button type="button" className={styles.searchBtn} >
                                    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                                        <path d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7s-7,3.13-7,7s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 
                                            l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z">
                                        </path>
                                    </svg>
                                </button>
                            }
                            <button type="button" className={this.state.showResetBtn?`${styles.resetBtn} ${styles.showResetBtn}`:styles.resetBtn}
                                        onClick={this.handleClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                                    <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                            L12.71,12z"></path>
                                </svg>
                            </button>
                            {this.state.searchInput.length>0 && this.state.isDataLoading && <div className={styles.searchLoaderCont}><SearchLoadder/></div>}
                            {this.state.showSearchCont && 
                                <div className={styles.searchResultCont} onClick={this.clearBlurTimer}>
                                    {this.state.isDataLoading ?
                                        <div className={styles.searchResultLoader}><SearchLoadder/></div>:
                                        this.state.searchResults.length ?
                                        <div className={styles.searchResWrapper}>
                                            {this.state.searchResults.map((data,indx)=>{
                                                return this.renderUserDetail(data,indx,this.showUserDetailAndToRecentSeacrch);
                                            })}
                                        </div>:
                                        <div className="d-flex flex-column h-100 w-100">
                                            { this.state.isFirstTime?
                                                <>
                                                    <div className="d-flex flex-row ps-3 pe-3">
                                                        <h6 className="fw-bold m-0 d-flex align-items-center">Recent</h6>
                                                        {this.state.recentSearch.length>0 && 
                                                            <Button variant="link" className="text-decoration-none ms-auto shadow-none pe-0" onClick={this.clearRecentSearch}>Clear All</Button>
                                                        }
                                                    </div>
                                                    {this.state.recentSearch.length?
                                                        <div className={styles.searchResWrapper}>
                                                            {this.state.recentSearch.map((data,indx)=>{
                                                                return this.renderUserDetail(data,indx,this.showUserDetail,true,this.removeFromRecentSearch);
                                                            })}
                                                        </div>:
                                                        <div className={styles.emptyResultCont}>No recent search.</div>
                                                    }
                                                </>:
                                                <div  className={styles.emptyResultCont}>No result found</div>
                                            }
                    
                                        </div>
                                    }
                                </div>
                            }
                        </Col>
                        <Col className={styles.userOptnsBtnCont} style={{maxWidth:"294px"}}>
                            <div className={styles.userOptnsBtn}>
                                <button><i className="fas fa-home"></i></button>
                                <button><i className="far fa-paper-plane"></i></button>
                                <button><i className="far fa-plus-square"></i></button>
                                <button><i className="far fa-compass"></i></button>
                                <button><i className="far fa-heart"></i></button>
                                <button><img src={this.context.currentUser.imgUrl} alt="" className={styles.userProfileImg}/></button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}



