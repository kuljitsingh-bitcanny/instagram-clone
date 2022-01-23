import { facebookProvider,auth } from "../lib/Firebase";
import { signInWithPopup,signInWithRedirect} from "firebase/auth";

export default async function facebookSignin(){
    try{
        signInWithRedirect(auth,facebookProvider)
    }catch(err){
        throw new Error(err); 
    }
    
}
