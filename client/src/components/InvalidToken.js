import React ,{useContext} from 'react';
import styles from "../styles/invalidToken.module.css";
import logo from "../images/app_logo/logo.png";
import { Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthProvider';
import { DISPLAY_MODE } from '../App';

export default function InvalidToken({btnName,msgHeader,msgBody}) {
    const {changeDisplayMode,checkAndChangeDisplayMode}=useContext(AuthContext)
    const handleClick=(e)=>{
        if(btnName.toLowerCase()==="log in"){
            changeDisplayMode(DISPLAY_MODE.LOGIN_MODE)
        }
        else{
            changeDisplayMode(DISPLAY_MODE.HOME_MODE)
        }
    }
  return (
      <div>
        <div className={styles.navbarParent}>
            <div>
                <div className={styles.navbarIcon} onClick={checkAndChangeDisplayMode}>
                    <span><i className="fab fa-instagram"></i></span>
                    <span></span>
                    <button><img src={logo} alt=""/></button>
                </div>
                <div className={styles.navbarLogin}>
                    <Button variant="link" onClick={handleClick} type="button">{btnName}</Button>
                </div>
            </div>
        </div>
        <div className={styles.msgContainer}>
            <h2>{msgHeader}</h2>
            <p>{msgBody}</p>
        </div>
      </div>
  )
}
