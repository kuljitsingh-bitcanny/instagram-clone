import React from "react";
import styles from "../styles/signup.module.css";
import signupLogo from "../images/app_logo/signup_logo2.png";
import {Row,Col,Button,Form,Modal} from "react-bootstrap";
import { maxReqAllwd, minYearDiff, months,yearSpan} from "../constants/constants";
import { SignupMode } from "./signup";
import lockImg from "../images/app_logo/lock.png";

class SignupBirthdayPart extends React.Component{
    constructor(props){
        super(props);
        this.state={endDate:0,startYear:0,enableNextBtn:false,showBirthdayInfo:false,showUserCantCreateAccModal:false,
                    showReasonModal:false}
    }

    initDate=(mnth=null,year=null,firstTime=false)=>{
        if(mnth && year){
            if(firstTime){
                this.setState({ startYear:year-1,
                                endDate:new Date(year,mnth,0).getDate()})
            }
            else{
                this.setState({endDate:new Date(year,mnth,0).getDate()})
                
            }
        }
        else{
            const curDate=new Date();
            this.props.changeBirthday({year:curDate.getFullYear()-1,month:curDate.getMonth(),day:curDate.getDate()})
            this.initDate(curDate.getMonth()+1,curDate.getFullYear(),true)
        }

    }

    checkAndChangeBirthDay=(e)=>{
        const curBirthday={...this.props.birthday,[e.target.name]:e.target.value};
        const curDateObj=new Date(curBirthday.year,curBirthday.month,curBirthday.day);
        const prevDateObj=new Date();
        const dateDiff=prevDateObj-curDateObj;
        this.props.changeBirthday(curBirthday);
        this.initDate(parseInt(curBirthday.month)+1,curBirthday.year);
        this.setState({enableNextBtn:dateDiff>minYearDiff});
    }
    checkReqCountAndConfirmUser=()=>{
        console.log(this.props.userReqCount)
        if(this.props.userReqCount>=maxReqAllwd){
            this.setState({showUserCantCreateAccModal:true})
        }
        else{
            this.props.changeSignupMode(SignupMode.userConfirmMode);
        }
    }

    componentDidMount(){
        console.log(new Date())
        this.initDate();
    }

    goBackToNameMode=(e)=>{
        this.props.resetPassword();
        this.props.changeSignupMode(SignupMode.infoInputMode);
    }

    toggleBirthdayInfo=()=>{
        this.setState((state)=>{
            return {showBirthdayInfo:!state.showBirthdayInfo}
        })
    }
    toggleUserCantCreateAcModal=(e)=>{
        if(!e){
            console.log("close btn ");
            this.setState({showReasonModal:true});
        }
        else{
            this.setState({showReasonModal:false,showUserCantCreateAccModal:false})
        }
    }
    toggleReasonModal=(e)=>{
        if(e.target.classList.contains(styles.reasonModalLeaveBtn)){
            this.setState({showReasonModal:false,showUserCantCreateAccModal:false})
        }
        else if(e.target.classList.contains(styles.reasonModalBackBtn)){
            this.setState({showReasonModal:false})
        }
    }

    render(){
        return (
            <>
                <div className={`${styles.signupCont} ${styles.birthdayCont}`}>
                    <img src={signupLogo} style={{marginTop:"1rem"}}/>
                    <h6 style={{margin:"0.75rem 0rem",fontWeight:"600"}}>Add Your Birthday</h6>
                    <span style={{fontSize:"0.8125rem"}}>This won't be a part of your public profile.</span>
                    <button type="button" className={styles.birthdayInfoBtn} onClick={this.toggleBirthdayInfo}>
                            Why do I need to provide my birthday?
                    </button>
                    <Row>
                        <Col className="p-0" >
                            <Form.Select size="sm" value={this.props.birthday.month} style={{width:"120px",paddingRight:"0.5rem"}} name="month" 
                                    onChange={this.checkAndChangeBirthDay}>
                                {months.map((mnth,indx)=><option key={indx} value={indx}>{mnth}</option>)}
                            </Form.Select>
                        </Col>
                        <Col className="ps-2 pe-2">
                            <Form.Select size="sm" value={this.props.birthday.day} style={{width:"58px",paddingRight:"0.5rem"}} name="day"
                                    onChange={this.checkAndChangeBirthDay}>
                                {[...Array(this.state.endDate).keys()].map((num,indx)=><option key={indx} value={num+1}>{num+1}</option>)}
                            </Form.Select>
                        </Col>
                        <Col className="p-0">
                            <Form.Select size="sm" value={this.props.birthday.year} style={{width:"78px",paddingRight:"0.5rem"}} name="year"
                                    onChange={this.checkAndChangeBirthDay}>
                                {[...Array(yearSpan).keys()].map((num,indx)=>{
                                    return <option key={indx} value={this.state.startYear-num}>{this.state.startYear-num}</option>
                                })}
                            </Form.Select>
                        </Col>
                    </Row>
                    <p className="text-muted" style={{fontSize:"0.8125rem",margin:"0.875rem 0rem"}}>
                            You need to enter the date you were born</p>
                    <p className="text-muted" style={{fontSize:"0.75rem",textAlign:"center"}}>
                            Use your own birthday, even if this account is for a business, a pet, or something else</p>
                    <Button variant="primary" size="sm" className={styles.nextBtn}  disabled={!this.state.enableNextBtn}
                        onClick={this.checkReqCountAndConfirmUser}>Next</Button>
                    <button type="button" className={styles.backBtn} onClick={this.goBackToNameMode}>Go Back</button>
                </div>
                <BirthdayInfoModal
                    show={this.state.showBirthdayInfo}
                    onHide={this.toggleBirthdayInfo}
                />
                <CannotCreateUserModal 
                    show={this.state.showUserCantCreateAccModal}
                    onHide={this.toggleUserCantCreateAcModal}
                />
                <ReasonModal
                    show={this.state.showReasonModal}
                    onHide={this.toggleReasonModal}
                />
            </>
        )
    }

}

function BirthdayInfoModal(props) {
    return (
      <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" className="ms-auto">
            Birthdays
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <img src={signupLogo} style={{margin:"0rem auto 0.75rem",display:"block"}}/>
          <h5 className="text-center">Birthdays on Instagram</h5>
          <p style={{fontSize:"0.875rem",textAlign:"center"}}>
            Providing your birthday improves the features and ads you see, and helps us keep the Instagram community safe. 
            You can find your birthday in your Personal Information Account Settings.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <button onClick={props.onHide} className={styles.backBtn}>Learn More</button>
        </Modal.Footer>
      </Modal>
    );
  }

  function CannotCreateUserModal(props) {
    return (
      <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" className="ms-auto" style={{fontSize:"1.125rem",textAlign:"center"}}>
            Problem Creating Your Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <img src={lockImg} style={{margin:"0rem auto 0.75rem",display:"block"}}/>
          <p style={{fontSize:"0.875rem",textAlign:"center",padding:"1rem 2rem 0rem",color:"#666"}}>
            You can't sign up for Instagram based on the information you provided.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
            <Button onClick={props.onHide} variant="primary" className="w-100">OK</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function ReasonModal(props) {
    return (
      <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        centered backdrop="static" size="sm">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter" className="ms-auto">
            <h5 className="text-center fs-6">Leave Without Reviewing?</h5>
            <p className="text-center mb-0 text-muted" style={{fontSize:".75rem"}}>You need to complete your age information to use instagram.</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <button onClick={props.onHide} className={styles.reasonModalBackBtn}>Go Back</button>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
            <button onClick={props.onHide} className={styles.reasonModalLeaveBtn}>Leave</button>
        </Modal.Footer>
      </Modal>
    );
  }

export default SignupBirthdayPart;