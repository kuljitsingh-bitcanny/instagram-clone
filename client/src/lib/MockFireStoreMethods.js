
const mockWhere=(fieldName,operator,compareValue)=>{
    return function(arr){
        if(operator === "=="){
            return arr.filter((data)=>data[fieldName] == compareValue);
        }
    }
}

const mockQuery=(dbRef,where=null)=>{
    if(where==null){
        return dbRef.map((singleDb)=>({data:()=>singleDb}))
    }
    else{
        return where(dbRef).map((singleDb)=>({data:()=>singleDb}));
    }
}

const mockGetDocs=(filterRes)=>{
    const result={empty:filterRes.length===0,docs:[...filterRes],size:filterRes.length,forEach:(callback)=>{filterRes.forEach(callback)}}
    return Promise.resolve(result);
}



export {mockWhere,mockQuery,mockGetDocs};