import React ,{Component,useContext,useEffect,useLayoutEffect,useRef,useState} from "react";
import styles from "../styles/homePageNavbar.module.css";
import DragMove from "../components/DragMove";
import { Button } from "react-bootstrap";
import { HomePageNavbarContext } from "../reduxComponents/HomePageNavbar";
import { maxOneTimePostuploadLimit } from "../constants/constants";
import PostCaptn from "./PostCaptn";
import AddLocation from "./AddLocation";
import { header } from "express/lib/request";

export const ActiveWrapper={
    "USER_POST_MODE":1,
    "USER_CAPTN_MODE":2,
    "USER_ADD_LOC_MODE":3,
}

const UserPostModalContext=React.createContext();

export default class UserPostModal extends Component{
    static contextType=HomePageNavbarContext;
    constructor(props){
        super(props);
        this.state={activeMode:ActiveWrapper.USER_POST_MODE,isUserAddLoc:false,userAddLoc:{heading:"",body:""},
                value:{imgPosPercnt:[],curIndx:0,isImgChanged:false,
                                                    initImgPosPercnt:this.initImgPosPercnt,updateImgPosPercnt:this.updateImgPosPercnt,
                                                    updateCurIndx:this.updateCurIndx,filterImgPosPercnt:this.filterImgPosPercnt,
                                                    setIsImgChanged:this.setIsImgChanged,updateImgSize:this.updateImgSize,
                                                    isImgLoaded:false,setIsImgLoaded:this.setIsImgLoaded}}

        console.log(this.props,this.context);
    }

   chnageActiveMode=(mode)=>{
       this.setState({activeMode:mode});
   }
   updateUserAddLoc=(locData=null)=>{
        if(locData){
            try{
                const {heading,body}=locData;
                if(header.length && body.length) this.setState({userAddLoc:{heading,body},isUserAddLoc:true});
                else this.setState({userAddLoc:{heading:"",body:""},isUserAddLoc:false});
            }catch(err){
               this.setState({userAddLoc:{heading:"",body:""},isUserAddLoc:false});
            }
        }
        else this.setState({userAddLoc:{heading:"",body:""},isUserAddLoc:false});
      
       
   }

    setIsImgChanged=(status)=>{
        this.setState(({value})=>{
            return {value:{...value,isImgChanged:status}};
        })
    }
    filterImgPosPercnt=(id)=>{
        let isLast=this.context.userPosts.length==1;
        if(isLast){
            this.context.resetUserPost();
        }
        else{
            this.setState(({value})=>{
                const updatedImgPosPercnt=value.imgPosPercnt.filter((img)=>img.id!==id);
                return {value:{...value,imgPosPercnt:updatedImgPosPercnt,isImgChanged:true,curIndx:Math.max(0,value.curIndx-1)}}
            });
            this.context.removeUserPost(id);
        }
        console.log(isLast);
    }

    initImgPosPercnt=(id,left,top,maxLeft,maxTop,width,height)=>{
        this.setState(({value})=>{
            return {value:{...value,imgPosPercnt:[...value.imgPosPercnt,{id,left,top,maxLeft,maxTop,width,height}]}};
        });
    }

    updateImgPosPercnt=(id,left,top)=>{
        console.log(id,left,top);
        this.setState(({value})=>{
            const newImgPosPercnt=value.imgPosPercnt.map((pos)=>{
                if(pos.id===id){
                    return {...pos,left,top};
                }
                return pos;
            })
            console.log("updated img pos",newImgPosPercnt);
            return {value:{...value,imgPosPercnt:[...newImgPosPercnt]}};
        })
    }
    updateImgSize=(id,width,height)=>{
        console.log(id,width,height);
        this.setState(({value})=>{
            const newImgPosPercnt=value.imgPosPercnt.map((pos)=>{
                if(pos.id===id){
                    return {...pos,width,height};
                }
                return pos;
            })
            return {value:{...value,imgPosPercnt:[...newImgPosPercnt]}};
        })
    }

    setIsImgLoaded=(status)=>{
        console.log("image load status",status);
        this.setState(({value})=>{
            return{value:{...value,isImgLoaded:status}}
        })
    }

    updateCurIndx=(indx)=>{
        this.setState(({value})=>{
            return {value:{...value,curIndx:indx,isImgChanged:true}};
        })
    }

    render(){
        console.log(this.state.activeMode);
        return(
            <UserPostModalContext.Provider value={this.state.value}>
                <div className={styles.userPostModal}>
                    <button type="button" className={styles.closeBtn} onClick={this.context.resetUserPost}>
                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                            <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                    L12.71,12z"></path>
                        </svg>
                    </button>
                    {/**/}
                        <PostWrapper className={this.state.activeMode===ActiveWrapper.USER_POST_MODE?styles.activeWrapper:""} 
                                        chnageActiveMode={this.chnageActiveMode}/>

                        <PostCaptn className={this.state.activeMode===ActiveWrapper.USER_CAPTN_MODE?styles.activeWrapper:""} 
                                        chnageActiveMode={this.chnageActiveMode} updateUserAddLoc={this.updateUserAddLoc}
                                        isUserAddLoc={this.state.isUserAddLoc} userAddLoc={this.state.userAddLoc}/>

                        <AddLocation className={this.state.activeMode===ActiveWrapper.USER_ADD_LOC_MODE?styles.activeWrapper:""} 
                                    chnageActiveMode={this.chnageActiveMode} updateUserAddLoc={this.updateUserAddLoc}/>
                    {/**/}
                </div>
            </UserPostModalContext.Provider>
        )
    }
}

function PostWrapper({chnageActiveMode,className}){
    const {resetUserPost,isUserPostLimitExceed}=useContext(HomePageNavbarContext);
    const [showMoreImgWrapper,setShowMoreImgWrapper]=useState(false);
    const imgContRef=useRef(null);
    const [isDraggingReq,setIsDraggingReq]=useState(false);
    const {updateImgPosPercnt,curIndx,imgPosPercnt,updateImgSize}=useContext(UserPostModalContext);
    const [isResizeBtnPressed,setIsResizeBtnPressed]=useState(false);
    const isWidthChanged=useRef(false);
    const [showPostUploadLimitExceed,setShowPostUploadLimitExceed]=useState(false);
    
    const setResizeBtnPressed=(status)=>{
        console.log("reseting btn",status)
        setIsResizeBtnPressed(status);
        setShowMoreImgWrapper(false);
    }

    const toggleMoreImgWrapper=()=>{
        setShowMoreImgWrapper((showMoreImgWrapper)=>showMoreImgWrapper=!showMoreImgWrapper);
    }

    const setMoreImgWrapper=(status)=>{
        setShowMoreImgWrapper(status);
    }

    const setDraggingReq=(status)=>{
        setIsDraggingReq(status);
    }

    const makeImgCenter=(residue,width,height,isWidth=true)=>{
        console.log(residue,isWidth,width,height)
        isWidthChanged.current=isWidth;
        const id=imgPosPercnt[curIndx].id;
        if(isWidth){
            updateImgPosPercnt(id,0,(residue/200));
        }
        else{
            updateImgPosPercnt(id,(residue/200),0)
        }
        updateImgSize(id,width,height);
        if(residue>0) setIsDraggingReq(false);
        else setIsDraggingReq(true);
        setResizeBtnPressed(true)
    }
    const changeImgSize=(e)=>{
        let width=imgContRef.current.style.width || "100%";
        let height=imgContRef.current.style.height || "100%";
        height=parseFloat(height);
        width=parseFloat(width);

        if(width !==100 && height===100){
            const residue=((width-100)/width)*100;
            const newHeight=`${(height-residue)}%`;
            imgContRef.current.style.width="100%";
            imgContRef.current.style.height=newHeight;
            makeImgCenter(residue,"100%",newHeight);
        }
        else if(width ===100 && height !==100){
            const residue=((height-100)/height)*100;
            const newWidth=`${(width-residue)}%`;
            imgContRef.current.style.height="100%";
            imgContRef.current.style.width=newWidth;
            makeImgCenter(residue,newWidth,"100%",false);
        }
    }
    useEffect(()=>{
       if(isUserPostLimitExceed){
        const timer=setTimeout(()=>{setShowPostUploadLimitExceed(true)},500)
        return ()=>{clearTimeout(timer)};
       }
    },[isUserPostLimitExceed])
    useEffect(()=>{
        if(showPostUploadLimitExceed){
            const timer=setTimeout(()=>{setShowPostUploadLimitExceed(false)},5000)
            return ()=>{clearTimeout(timer)};
        }
     },[showPostUploadLimitExceed])

    return (
        <div className={`${styles.postWrapper} ${className}`}>
            <div className={styles.postCont}>
                <div className={styles.postHeader}>
                    <button type="button" onClick={resetUserPost}>
                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                            <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                    L12.71,12z"></path>
                        </svg>
                    </button>
                    <span>New Photo Post</span>
                    <Button variant="link" className="text-decoration-none shadow-none" 
                            onClick={e=>chnageActiveMode(ActiveWrapper.USER_CAPTN_MODE)}>
                            Next
                    </Button>
                </div>
                <div className={styles.postBody}>
                    <button className={styles.aspectChangeBtn} onClick={changeImgSize}></button>
                    <button className={styles.showMoreImgBtn} onClick={toggleMoreImgWrapper}>
                        <svg aria-label="Open Media Gallery" className="_8-yf5 " color="#ffffff" fill="#ffffff" height="16" role="img" viewBox="0 0 24 24" width="16">
                            <path d="M19 15V5a4.004 4.004 0 00-4-4H5a4.004 4.004 0 00-4 4v10a4.004 4.004 0 004 4h10a4.004 4.004 0 004-4zM3 15V5a2.002 2.002 0 
                                    012-2h10a2.002 2.002 0 012 2v10a2.002 2.002 0 01-2 2H5a2.002 2.002 0 01-2-2zm18.862-8.773A.501.501 0 0021 6.57v8.431a6 6 0 
                                    01-6 6H6.58a.504.504 0 00-.35.863A3.944 3.944 0 009 23h6a8 8 0 008-8V9a3.95 3.95 0 00-1.138-2.773z" fillRule="evenodd">
                            </path>
                        </svg>
                    </button>
                    <ActiveImageCont imgContRef={imgContRef} setDraggingReq={setDraggingReq} isDraggingReq={isDraggingReq}
                                    setMoreImgWrapper={setMoreImgWrapper} isResizeBtnPressed={isResizeBtnPressed}
                                    setResizeBtnPressed={setResizeBtnPressed}/>
                    <AddMoreImgWrapper showMoreImgWrapper={showMoreImgWrapper} isWidthChanged={isWidthChanged} 
                                        isResizeBtnPressed={isResizeBtnPressed} setMoreImgWrapper={setMoreImgWrapper}/>
                </div>
            </div>
            <div className={showPostUploadLimitExceed?`${styles.maxLimitExceedCont} ${styles.showMaxLimitExceedCont}`:styles.maxLimitExceedCont}>
                You can only choose {maxOneTimePostuploadLimit} or fewer files.
            </div>
        </div>
    )
}
function ActiveImageCont({imgContRef,setDraggingReq,isDraggingReq,setMoreImgWrapper,isResizeBtnPressed,setResizeBtnPressed}){
    const transx=useRef({curTransx:0,prevTransx:0});
    const transy=useRef({curTransy:0,prevTransy:0});
    const [isGrabbing,setIsGrabbing]=useState(false);
    const {updateImgPosPercnt,initImgPosPercnt,imgPosPercnt,curIndx,isImgChanged,
            setIsImgChanged,updateCurIndx,setIsImgLoaded,isImgLoaded}=useContext(UserPostModalContext);
    const {userPosts}=useContext(HomePageNavbarContext);
    const [showNextBtn,setShowNextBtn]=useState(userPosts.length>1);
    const [showPrevBtn,setShowPrevBtn]=useState(false);
    const [imgUrl,setImgUrl]=useState("");
    const parentDetails=useRef({width:0,height:0});
    const timer=useRef(null);

    
    const getCurrentPos=(e)=>{
        let curx,cury;
        if(e.type.includes("mouse")){
            curx=e.pageX;
            cury=e.pageY
        }
        else{
            curx=e.touches[0].clientX
            cury=e.touches[0].clientY;
        }
        return {curx,cury};
    }

    const onDragMove=(e)=>{
        if(isDraggingReq){
            console.log()
            const {curx,cury}=getCurrentPos(e);
            const diffx=curx-transx.current.prevTransx;
            const diffy=cury-transy.current.prevTransy;
            const curTransx=transx.current.curTransx+diffx;
            const curTransy=transy.current.curTransy+diffy;

            transx.current={prevTransx:curx,curTransx};
            transy.current={prevTransy:cury,curTransy};

            const left=curTransx/parentDetails.current.width;
            const top=curTransy/parentDetails.current.height;
            const id=imgPosPercnt[curIndx].id;
            updateImgPosPercnt(id,left,top);
        }
    }

    const onPointerUp=(e)=>{
        e.preventDefault();
        if(isDraggingReq){
            let curTransx=transx.current.curTransx;
            let curTransy=transy.current.curTransy;

            if(curTransx>0) curTransx=0;
            else if(curTransx<imgPosPercnt[curIndx].maxLeft*parentDetails.current.width) 
                    curTransx=imgPosPercnt[curIndx].maxLeft*parentDetails.current.width;

            if(curTransy>0) curTransy=0;
            else if(curTransy<imgPosPercnt[curIndx].maxTop*parentDetails.current.height) 
                            curTransy=imgPosPercnt[curIndx].maxTop*parentDetails.current.height;

            transx.current={curTransx,prevTransx:0};
            transy.current={curTransy,prevTransy:0};
            console.log(curTransx,curTransy,imgPosPercnt[curIndx].maxLeft,parentDetails.current.width)
            const id=imgPosPercnt[curIndx].id;
            updateImgPosPercnt(id,curTransx/parentDetails.current.width,curTransy/parentDetails.current.height);

            setIsGrabbing(false);
        }
    }

    const onPointerDown=(e)=>{
       if(isDraggingReq){
            const {curx,cury}=getCurrentPos(e);
            transx.current={...transx.current,prevTransx:curx};
            transy.current={...transy.current,prevTransy:cury};
            setIsGrabbing(true);
            setMoreImgWrapper(false);
       }
    }
    const nextBtnClickHandler=()=>{
        console.log(imgPosPercnt,"before next click");
        setIsImgLoaded(false);
        if(timer.current) clearTimeout(timer.current);
        timer.current=setTimeout(()=>{
            const nextIndx=Math.min(curIndx+1,userPosts.length-1);
            if(nextIndx<userPosts.length-1)setShowNextBtn(true);
            else setShowNextBtn(false);
            setShowPrevBtn(true);
            updateCurIndx(nextIndx);
        },500)
    }
    const prevBtnClickHandler=()=>{
        console.log(imgPosPercnt,"before pev click");
        setIsImgLoaded(false);
        if(timer.current) clearTimeout(timer.current);
        timer.current=setTimeout(()=>{
            const prevIndx=Math.max(curIndx-1,0);
            if(prevIndx==0)setShowPrevBtn(false);
            else setShowPrevBtn(true);
            setShowNextBtn(true);
            updateCurIndx(prevIndx);
        },500)
        
    }


    useEffect(()=>{
        if(isResizeBtnPressed){
            transx.current={prevTransx:0,curTransx:imgPosPercnt[curIndx].left*parentDetails.current.width};
            transy.current={prevTransy:0,curTransy:imgPosPercnt[curIndx].top*parentDetails.current.height};
            setResizeBtnPressed(false);
        }
    },[isResizeBtnPressed])

    useEffect(()=>{
        const url=URL.createObjectURL(userPosts[curIndx].file);
        const id=userPosts[curIndx].id;
        console.log(id,"init id");
        const img=new Image();
        img.onload=function(){
            const imgWidth=this.width;
            const imgHeight=this.height;
            const aspectRatio=imgWidth/imgHeight;
            const parentWidth=imgContRef.current.parentElement.offsetWidth;
            const parentHeight=imgContRef.current.parentElement.offsetHeight;

            if(parentHeight>imgHeight && parentWidth>imgWidth){
                imgContRef.current.style.width="100%";
                imgContRef.current.style.height="100%";
                setDraggingReq(false);
                initImgPosPercnt(id,0,0,0,"100%","100%");
            }
            else{
                if(aspectRatio>1){
                    const maxLeft=1-aspectRatio;
                    const newWidth=`${(aspectRatio*100)}%`;
                    imgContRef.current.style.width=newWidth;
                    imgContRef.current.style.height="100%";
                    transx.current={...transx.current,curTransx:(0.50*maxLeft*parentWidth)};
                    transy.current={...transy.current,curTransy:0};
                    initImgPosPercnt(id,0.5*maxLeft,0,maxLeft,0,newWidth,"100%");
                }
                else{
                    const maxTop=(1-(1/aspectRatio));
                    const newHeight=`${(100/aspectRatio)}%`;
                    imgContRef.current.style.height=newHeight;
                    imgContRef.current.style.width="100%";
                    transy.current={...transy.current,curTransy:(0.50*maxTop*parentHeight)};
                    transx.current={...transx.current,curTransx:0};
                    initImgPosPercnt(id,0,0.5*maxTop,0,maxTop,"100%",newHeight);
                }
                setDraggingReq(true);
            }
            setImgUrl(url);
            parentDetails.current={width:parentWidth,height:parentHeight};
            setIsImgLoaded(true);
        }
        img.src=url;
    },[])
    

    useEffect(()=>{
        if(isImgChanged){
            const url=URL.createObjectURL(userPosts[curIndx].file);
            const img=new Image();
            img.onload=function(){
                const imgWidth=this.width;
                const imgHeight=this.height;
                const aspectRatio=imgWidth/imgHeight;
                const parentWidth=parentDetails.current.width;
                const parentHeight=parentDetails.current.height;
                if(parentHeight>imgHeight && parentWidth>imgWidth){
                    imgContRef.current.style.width=imgPosPercnt[curIndx].width;
                    imgContRef.current.style.height=imgPosPercnt[curIndx].height;
                    setDraggingReq(false);
                }
                else{
                    if(aspectRatio>1){
                        imgContRef.current.style.width=imgPosPercnt[curIndx].width;
                        imgContRef.current.style.height=imgPosPercnt[curIndx].height;
                        transx.current={...transx.current,curTransx:(0.50*imgPosPercnt[curIndx].maxLeft*parentWidth)};
                        transy.current={...transy.current,curTransy:0};
                    }
                    else{
                        imgContRef.current.style.height=imgPosPercnt[curIndx].height;
                        imgContRef.current.style.width=imgPosPercnt[curIndx].width;
                        transy.current={...transy.current,curTransy:(0.50*imgPosPercnt[curIndx].maxTop*parentHeight)};
                        transx.current={...transx.current,curTransx:0};
                    }
                    setDraggingReq(true);
                }
                setImgUrl(url);
                setIsImgChanged(false);
                setTimeout(()=>{setIsImgLoaded(true);},250)
            }
            img.src=url;
        }
    },[isImgChanged,curIndx]);

    useEffect(()=>{
        if(userPosts.length>1) setShowNextBtn(true);
    },[userPosts.length])

    useEffect(()=>{
        if(curIndx===0) setShowPrevBtn(false);
        else if(curIndx>=userPosts.length-1) setShowNextBtn(false);
        else{
            setShowNextBtn(true);
            setShowPrevBtn(true);
        }
    },[curIndx])

    
    
    return (
        <DragMove showNextBtn={showNextBtn} showPrevBtn={showPrevBtn} isMouseEventReq={true} onDragMove={onDragMove} onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp} nextBtnClickHandler={nextBtnClickHandler} prevBtnClickHandler={prevBtnClickHandler}
                    style={{height:"100%"}} isClassValidationReq={true}>
            <div className={styles.activeImgWrapper}>
                <div className={isGrabbing?`${styles.activeImg} ${styles.grabbing}`:styles.activeImg} ref={imgContRef}
                    style={{background:`url(${imgUrl})`,left:`${imgPosPercnt[curIndx]?.left*100}%`,
                            top:`${imgPosPercnt[curIndx]?.top*100}%`,opacity:isImgLoaded?"1.0":"0.1"}}>
                </div>
                <div className={styles.ruler}>
                    <div className={styles.left1}></div>
                    <div className={styles.left2}></div>
                    <div className={styles.top1}></div>
                    <div className={styles.top2}></div>
                </div>
                {userPosts.length>1 &&
                    <div className={styles.indicatorCont}>
                        {userPosts.map((pos,indx)=>{
                            return <span className={indx===curIndx?`${styles.indicator} ${styles.activeIndicator}`:styles.indicator} key={indx}></span>
                        })}
                    </div>
                }
            </div>
        </DragMove>
    );
}



function AddMoreImgWrapper({showMoreImgWrapper,isWidthChanged,isResizeBtnPressed,setMoreImgWrapper}){
    
    const [imgUrls,setImgUrls]=useState([]);
    const [left,setLeft]=useState(0);
    const {initImgPosPercnt,imgPosPercnt,curIndx,filterImgPosPercnt,updateCurIndx,setIsImgLoaded}=useContext(UserPostModalContext);
    const {userPosts,addNewPosts,isUserPostLimitExceed,setIsUserPostLimitExceed}=useContext(HomePageNavbarContext);
    const maxImgSize=useRef({width:96,height:96});
    const timer=useRef(null);
    const moreImgWrapperRef=useRef(null);
    const imgWrapperParentRef=useRef(null);
    const [showNextBtn,setShowNextBtn]=useState(userPosts.length>=3);
    const [showPrevBtn,setShowPrevBtn]=useState(false);
    const [imgWrapperWidth,setImgWrapperWidth]=useState(0)


    const removeImg=(id)=>{
        setShowNextBtn(userPosts.length>3);
        setShowPrevBtn(userPosts.length>3);
        filterImgPosPercnt(id);
        setImgUrls((imgUrls)=>{
            return imgUrls.filter((img)=>img.id!=id);
        })
        setLeft(0);
        
    }
    const addNewPost=(e)=>{
        if(e.target.files && e.target.files.length>0 ){
            if(userPosts.length>=maxOneTimePostuploadLimit){
                setIsUserPostLimitExceed(true);
            }
            else{
                const file={...e.target.files};
                const url=URL.createObjectURL(file[0]);
                const id=file[0].lastModified;
                const img=new Image();
                img.onload=function(){
                    const aspectRatio=this.width/this.height;
                    let height,width;
                    if(aspectRatio>1){
                        const maxLeft=1-aspectRatio;
                        height=maxImgSize.current.height;
                        width=maxImgSize.current.width*aspectRatio;
                        const newWidth=`${100*aspectRatio}%`;
                        initImgPosPercnt(id,0.5*maxLeft,0,maxLeft,0,newWidth,"100%");
                    }
                    else{
                        const maxTop=(1-(1/aspectRatio));
                        height=maxImgSize.current.height*(1/aspectRatio);
                        width=maxImgSize.current.width;
                        const newHeight=`${100/aspectRatio}%`;
                        initImgPosPercnt(id,0,0.5*maxTop,0,maxTop,"100%",newHeight);
                    }
                    setImgUrls((imgUrls)=>([...imgUrls,{id,url,height,width}]));
                    addNewPosts(file[0]);
                }
                img.src=url;
            }
            setShowNextBtn(userPosts.length>=2);
            setLeft(0);
            e.target.form.reset();
        }
    }
    const changeActiveImg=(indx)=>{
        console.log(indx);
        if(curIndx !== indx){
            setMoreImgWrapper(false);
            setIsImgLoaded(false);
            if(timer.current) clearTimeout(timer.current);
            timer.current=setTimeout(()=>{updateCurIndx(indx)},250)
        }
        
    }

    const nextBtnClickHandler=(e)=>{
        
        const maxLeft=moreImgWrapperRef.current.parentElement.offsetWidth-moreImgWrapperRef.current.offsetWidth;
        console.log(maxLeft);
        let newLeft=left-maxImgSize.current.width;
        newLeft=newLeft<maxLeft?maxLeft:newLeft;
        setLeft(newLeft);
        if(newLeft<=maxLeft) setShowNextBtn(false);
        setShowPrevBtn(true);
    }
    const prevBtnClickHandler=()=>{
        let newLeft=left+maxImgSize.current.width;
        newLeft=newLeft>0?0:newLeft;
        setLeft(newLeft);
        if(newLeft>=0)setShowPrevBtn(false);
        setShowNextBtn(true);
    }

    useEffect(()=>{
        console.log(userPosts);
        const imgIdArr=[];
        const imgDetailArr=[];

        userPosts.forEach((post,indx)=>{
            const url=URL.createObjectURL(post.file);
            const id=post.id;
            imgIdArr.push(id);
            const img=new Image();
            img.onload=function(){
                const aspectRatio=this.width/this.height;
                let height,width;
                if(aspectRatio>1){
                    const maxLeft=1-aspectRatio;
                    height=maxImgSize.current.height;
                    width=maxImgSize.current.width*aspectRatio;
                    const newWidth=`${aspectRatio*100}%`;
                    if(indx !== curIndx) initImgPosPercnt(id,0.5*maxLeft,0,maxLeft,0,newWidth,"100%");
                }
                else{
                    const maxTop=(1-(1/aspectRatio));
                    height=maxImgSize.current.height*(1/aspectRatio);
                    width=maxImgSize.current.width;
                    const newHeight=`${100/aspectRatio}%`;
                    if(indx !== curIndx) initImgPosPercnt(id,0,0.5*maxTop,0,maxTop,"100%",newHeight);
                }
                imgDetailArr.push({id,url,height,width});
                console.log(imgDetailArr.length,"detail arr length");
                if(indx === userPosts.length-1){
                    imgDetailArr.sort((arr1,arr2)=>{
                        return (imgIdArr.indexOf(arr1)-imgIdArr.indexOf(arr2));
                    })
                    setImgUrls([...imgDetailArr]);
                }
            }
            img.src=url;
        })
       
    },[])

    useEffect(()=>{
        if(isResizeBtnPressed){
            if(isWidthChanged.current){
                setImgUrls((imgUrls)=>{
                    const updatedImgUrl=imgUrls.map((img,indx)=>{
                        if(indx===curIndx){
                            const aspectRatio=img.width/img.height;
                            return {...img,height:maxImgSize.current.height/aspectRatio,width:maxImgSize.current.width}
                        }
                        return img;
                    })
                    return [...updatedImgUrl];
                })
            }
            else{
                setImgUrls((imgUrls)=>{
                    const updatedImgUrl=imgUrls.map((img,indx)=>{
                        if(indx===curIndx){
                            const aspectRatio=img.width/img.height;
                            return {...img,width:maxImgSize.current.width*aspectRatio,height:maxImgSize.current.height}
                        }
                        return img;
                    })
                    return [...updatedImgUrl];
                })
            }
        }
        
    },[isResizeBtnPressed])
    
    useEffect(()=>{
        if(showMoreImgWrapper){
            const offset1=48;
            const offset2=60;
            const maxWidth=imgWrapperParentRef.current.parentElement.offsetWidth-offset1;
            let width=moreImgWrapperRef.current.offsetWidth;
            let newWidth=0;
            if(isUserPostLimitExceed){
                if(width>maxWidth) setShowNextBtn(true);
                newWidth=width>maxWidth?maxWidth:width;
            }
            else{
                if(width>(maxWidth-offset2)) setShowNextBtn(true);
                newWidth=width>(maxWidth-offset2)?(maxWidth-offset2):width;
            }
            setImgWrapperWidth(newWidth);
        }
    },[isUserPostLimitExceed,showMoreImgWrapper,userPosts.length])
    

    return (
        <div className={showMoreImgWrapper?`${styles.moreImgWrapper} ${styles.activeMoreImgWrapper}`:styles.moreImgWrapper} ref={imgWrapperParentRef}>
            <DragMove className={styles.imgDragWrapper} showNextBtn={showNextBtn} showPrevBtn={showPrevBtn} 
                        nextBtnClickHandler={nextBtnClickHandler} prevBtnClickHandler={prevBtnClickHandler}>

                <div className={styles.imgParentCont} style={{width:`${imgWrapperWidth}px`}}>
                    <div ref={moreImgWrapperRef} style={{left:`${left}px`}}>
                        {imgUrls.map((img,indx)=>{
                            return (
                                <div className={indx==curIndx?styles.imgCont:`${styles.imgCont} ${styles.inactiveImgCont}`} key={indx} 
                                                onClick={e=>changeActiveImg(indx)}>

                                    <div style={{background:`url(${img.url})`,width:`${img.width}px`,height:`${img.height}px`,
                                                left:`${imgPosPercnt[indx]?.left*100}%`,top:`${imgPosPercnt[indx]?.top*100}%`}} />
                                    <button type="button" className={styles.imgRemvBtn} onClick={e=>removeImg(img.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="#666">
                                            <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 
                                                    L12.71,12z"></path>
                                        </svg>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </DragMove>
                {!isUserPostLimitExceed && 
                    <form style={{width:"auto"}} >
                        <label htmlFor="post2" className={styles.addMoreImgBtn}>
                            <svg aria-label="Plus icon" className="_8-yf5 " color="#8e8e8e" fill="#fff" height="22" role="img" viewBox="0 0 24 24" width="22">
                                <path d="M21 11.3h-8.2V3c0-.4-.3-.8-.8-.8s-.8.4-.8.8v8.2H3c-.4 0-.8.3-.8.8s.3.8.8.8h8.2V21c0 .4.3.8.8.8s.8-.3.8-.8v-8.2H21c.4 
                                    0 .8-.3.8-.8s-.4-.7-.8-.7z">
                                </path>
                            </svg>
                        </label>
                        <input type="file" id="post2" name="post2" className="d-none" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={addNewPost}/>
                    </form>   
                }
        </div>
    )
}