

const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
const yearSpan=103;
const minYearDiff=189388800000;// 6 year diff in milli seconds
const codeResendSpan=1800000// 30 min span in milli seconds
const defaultImgUrl="https://firebasestorage.googleapis.com/v0/b/instagram-a9fde.appspot.com/o/profile%2Fdefault.png?alt=media&token=d818cdc7-f57f-4c74-87f3-6827e0791028";
const maxReqAllwd=3;
const nameMinLen=3;
const nameMaxLen=30;
const idStartIndx=10;//max value should be 10
const idLen=20;
const tokenLen=40;
const resetPasswordMode="resetPassword";
const invalidToken="invalidToken";
const loggingUser="loggingUser";
const oneTapStorage="oneTapStorage";
const searchDelay=1000;
const blurringDelay=250;
const maxUserStorageAllwd=4;
const maxAllowdUserFetch=20;
const maxOneTimePostuploadLimit=5;
const maxCaptnChar=500;
const isFacbookLogin=true;
const genNRandmDigit=(n)=>{
    const min=10**(n-1);
    const max=((10**n)-1);
    const num=Math.floor((Math.random()*(max-min+1))+min)
    return num;

}

const parseQueryString=(queryString)=>{
    const queryStrArr=queryString.split("&");
    const queryObj={};
    queryStrArr.forEach((queryStr)=>{
        const [key,value]=queryStr.split("=");
        queryObj[key]=value;
    })
    return queryObj;
}
const changeWebLocation=(loc)=>{
    window.location.replace(loc)
}

const getEncryptedToken=(id)=>{
    const token=Math.random().toString(36).substring(2,2+idStartIndx)+id+Math.random().toString(36).substring(2,2+idStartIndx);
    return token;
}

const generateKeywords=(name)=>{
    const keywords=new Set();
    const n=name.length;
    let chrLen=1;
    for(let i=0;i<n;i++){
        for(let j=0;j<=(n-chrLen);j++){
            keywords.add(name.substring(j,j+chrLen));
        }
        chrLen++;
    }
    return [...keywords];
}

const handleDragMove=(prevTransx,curTransx,initTransx,getOverflowInfo)=>{
    const diff=curTransx-initTransx;
    const [isOverflow,maxDiff]=getOverflowInfo();
    if(isOverflow){
        prevTransx+=diff;
        if(prevTransx>0) prevTransx=0;
        if(prevTransx<maxDiff) prevTransx=maxDiff;
    }
    return prevTransx;

}
const handleDragUp=(curTransx,normalWidth,paddedWidth,getOverflowInfo)=>{
    let showNextBtn=false;
    let showPrevBtn=false;
    const [isOverFlow,diff]=getOverflowInfo();
    if(isOverFlow){
        const nextTrans=Math.round(curTransx/normalWidth)*paddedWidth;
        const maxTrans=diff;
        if(maxTrans>nextTrans){
            showNextBtn=false;
            showPrevBtn=true;
        }
        else if(nextTrans>=0){
            showPrevBtn=false;
            showNextBtn=true;
        }
        else{
            showNextBtn=true;
            showPrevBtn=true;
        }
        curTransx=maxTrans>nextTrans?maxTrans:nextTrans;
    }
    return {curTransx,showNextBtn,showPrevBtn};
}
const handleLeftScrollBtnClick=(curTransx,paddedWidth,getOverflowInfo)=>{
    let showPrevBtn=true;
    const [isOverFlow]=getOverflowInfo();
    if(isOverFlow){
        const nextTrans=(1 * paddedWidth);
        curTransx+=nextTrans;
        if(curTransx>0){
            curTransx=0;
            showPrevBtn=false;
        }
    }
    return {curTransx,showPrevBtn};
}
const handleRightScrollBtnClick=(curTransx,paddedWidth,getOverflowInfo)=>{
    let showNextBtn=true;
    const [isOverFlow,diff]=getOverflowInfo();
    if(isOverFlow){
        const nextTrans=(-1 * paddedWidth);
        const maxTrans=diff;
        curTransx+=nextTrans;
        if(maxTrans>curTransx){
            curTransx=maxTrans;
            showNextBtn=false;
        }
    }
    return {curTransx,showNextBtn};
}




export {months,yearSpan,minYearDiff,codeResendSpan,defaultImgUrl,maxReqAllwd,nameMinLen,nameMaxLen,idStartIndx,idLen,maxOneTimePostuploadLimit,
        resetPasswordMode,tokenLen,invalidToken,loggingUser,oneTapStorage,searchDelay,blurringDelay,maxUserStorageAllwd,maxAllowdUserFetch,
        maxCaptnChar,isFacbookLogin,
        getEncryptedToken,changeWebLocation,generateKeywords,parseQueryString,genNRandmDigit,handleDragMove,handleDragUp,handleRightScrollBtnClick,
        handleLeftScrollBtnClick};