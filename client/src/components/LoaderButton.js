import React from "react";
import {Button} from "react-bootstrap";
import AuthSpinner from "./AuthSpinner";

function LoaderButton({showSpinner,isDisabled,type,clickHandler,btnName,cssClass,variant}){
    return(
        <div className="d-grid w-100">
        <Button variant={variant??"primary"} size="sm" disabled={isDisabled} type={type} className={cssClass?`${cssClass} loader-btn`:"loader-btn"} 
                onClick={clickHandler}>
            {showSpinner ? <AuthSpinner/>:btnName}
        </Button>
    </div>
    )
}
export default LoaderButton;