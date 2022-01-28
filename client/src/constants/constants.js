

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
    window.location=loc;
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






export {months,yearSpan,minYearDiff,codeResendSpan,defaultImgUrl,maxReqAllwd,nameMinLen,nameMaxLen,idStartIndx,idLen,
        resetPasswordMode,tokenLen,invalidToken,loggingUser,oneTapStorage,searchDelay,blurringDelay,maxUserStorageAllwd,genNRandmDigit,
        getEncryptedToken,changeWebLocation,generateKeywords,parseQueryString};