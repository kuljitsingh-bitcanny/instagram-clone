import React from "react";
import styles from "../styles/forminput.module.css"

function FormInput(props){
    return (
        <div className={styles.inputWrapper}>
            <div className={`${props.isPwdInput?styles.pwdInputCont:styles.inputCont} 
                                ${props.isValidationReq?props.isInputValid?styles.crctInputCont:styles.incrctInputCont:""}`}>
                <input type={props.showPwd?"text":props.inputType} id={props.inputName} name={props.inputName} value={props.inputValue} 
                    onChange={props.handleChange} onFocus={props.handleFocus} onBlur={props.handleBlur}/>
                <label htmlFor={props.inputName} className={props.inputValue.length?styles.activeLabel:""}>
                    {props.inputHint}
                </label>
                {(props.isPwdInput && props.inputValue.length)?
                    <button type="button" onClick={props.togglePwdVisibility}>
                        {props.showPwd?"Hide":"Show"}
                    </button>:
                ""
                }
                { props.isValidationReq ?
                    <div className={styles.inputStatusCont}>
                        {props.isInputValid?
                            <i className="far fa-check-circle"></i>:
                            <i className="far fa-times-circle"></i>
                        }
                    </div>:
                    ""
                }
                
            </div>
            { props.isValidationReq?
                <div className={styles.errMsgCont}>
                    {!props.isInputValid ?props.invalidMsg:""}
                </div>:
                ""
            }  
        </div>
    )
}

export default FormInput;