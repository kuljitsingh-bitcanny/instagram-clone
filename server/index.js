
const express=require("express");
const cors=require("cors");
const admin=require("firebase-admin");
const CryptoJS = require("crypto-js");
require("dotenv").config();


admin.initializeApp({credential: admin.credential.cert("./serviceAccountKey.json")});
const app= express();
app.use(cors({
    origin:process.env.ALLOWED_ORIGIN
}))

app.use(express.json())

app.post("/",async (req,res)=>{
    if(req.headers.origin === process.env.ALLOWED_ORIGIN){
        const {token,pwd:encPwd}=req.body;
        try{
            const rawPwd=CryptoJS.AES.decrypt(encPwd,process.env.PWD_ENCYP_KEY).toString(CryptoJS.enc.Utf8);
            const uid=token.toString().substring(process.env.ID_START_INDX,process.env.ID_END_INDX);
            await admin.auth().updateUser(uid,{password:rawPwd});
            res.json({status:true});
        }
        catch(err){
            res.json({status:false});
        }
        
    }
    else{
        res.sendStatus(404);
    }
})

app.listen(process.env.PORT,()=>{console.log("server started at: "+process.env.PORT)})
