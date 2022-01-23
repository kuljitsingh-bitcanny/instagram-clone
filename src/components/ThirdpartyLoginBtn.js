import React,{useState} from "react";
import styles from "../styles/signup.module.css";
import FacebookLogin from "react-facebook-login";
import {Button} from "react-bootstrap";
import {GoogleLogin} from "react-google-login";


function ThirdpartyLoginbtn({responseCallback,isFacebookLogin}){
    const [showFacebookLogin,setShowFacebookLogin]=useState(false);
    if(isFacebookLogin){
        return (
            <>
            <Button variant="primary" size="sm" className={styles.facebookBtn} 
                onClick={()=>setShowFacebookLogin(true)}>
                <i className="fab fa-facebook-square"></i> Sign up with Facebook
            </Button>
            {showFacebookLogin && <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                autoLoad={true}
                fields="name,email,picture,birthday"
                scope="public_profile,email,user_birthday"
                callback={responseCallback}
                cssClass={styles.invisibleFacebookBtn}
                />
            }
            </>
        )
    }
    else{
        return (
                <GoogleLogin
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                render={renderProps => (
                    <Button variant="primary" size="sm" onClick={renderProps.onClick} className={styles.googleBtn}>
                        <i className="fab fa-google"></i> Sign up with Google
                    </Button>
                  )}
                onSuccess={responseCallback}
                onFailure={responseCallback}
                cookiePolicy={'single_host_origin'}
                scope="profile email"
            />
        )
    }

}


export default ThirdpartyLoginbtn;