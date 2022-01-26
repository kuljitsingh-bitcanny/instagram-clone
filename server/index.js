
const express=require("express");
const cors=require("cors");
const admin=require("firebase-admin");
require("dotenv").config();


admin.initializeApp({credential: admin.credential.cert("./serviceAccountKey.json")});
const app= express();
app.use(cors({
    origin:process.env.ALLOWED_ORIGIN
}))

app.get("/",async (req,res)=>{
    if(req.headers.origin === process.env.ALLOWED_ORIGIN){
        const id=req.query.token.toString().substring(process.env.ID_START_INDX,process.env.ID_END_INDX);
        try{
            await admin.auth().deleteUser(id);
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
