import {getDocs,query,where,doc,setDoc,addDoc,deleteDoc} from "firebase/firestore";
import {mockWhere,mockQuery,mockGetDocs} from "./MockFireStoreMethods";

let customDocs,customQuery,customWhere,customDoc,customSetDoc,customAddDoc,customDeleteDoc;

if(process.env.NODE_ENV === "test"){
    customDocs=mockGetDocs;
    customQuery=mockQuery;
    customWhere=mockWhere;
}
else{
    customDocs=getDocs;
    customQuery=query;
    customWhere=where;
    customDoc=doc;
    customSetDoc=setDoc;
    customAddDoc=addDoc;
    customDeleteDoc=deleteDoc
}

export {customDocs as getDocs,customQuery as query,customWhere as where,customDoc as doc,
            customSetDoc as setDoc,customAddDoc as addDoc,customDeleteDoc as deleteDoc};