import React ,{useContext} from 'react';
import styles from "../styles/invalidToken.module.css";
import logo from "../images/app_logo/logo.png";
import { Button } from 'react-bootstrap';
import { changeWebLocation } from '../constants/constants';

export default function InvalidToken({btnName,msgHeader,msgBody}) {
  return (
      <div>
        <div className={styles.navbarParent}>
            <div>
                <div className={styles.navbarIcon} onClick={e=>changeWebLocation("/")}>
                    <span><i className="fab fa-instagram"></i></span>
                    <span></span>
                    <button><img src={logo} alt=""/></button>
                </div>
                <div className={styles.navbarLogin}>
                    <Button variant="link" onClick={e=>changeWebLocation("/")} type="button">{btnName}</Button>
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
