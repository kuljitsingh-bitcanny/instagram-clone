const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
const yearSpan=103;
const minYearDiff=189388800000;// 6 year diff in milli seconds
const codeResendSpan=1800000// 30 min span in milli seconds
const defaultImgUrl="https://firebasestorage.googleapis.com/v0/b/instagram-a9fde.appspot.com/o/profile%2Fdefault.png?alt=media&token=6c0730c1-5d8e-46bd-a82d-6ea5b46c1f3a";
const maxReqAllwd=3;
const nameMinLen=3;
const nameMaxLen=30;
const genNRandmDigit=(n)=>{
    const min=10**(n-1);
    const max=((10**n)-1);
    const num=Math.floor((Math.random()*(max-min+1))+min)
    return num;

}










export {months,yearSpan,minYearDiff,codeResendSpan,defaultImgUrl,maxReqAllwd,genNRandmDigit,nameMinLen,nameMaxLen};