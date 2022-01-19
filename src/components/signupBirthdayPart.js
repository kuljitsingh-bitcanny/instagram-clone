import React from "react";
import styles from "../styles/signup.module.css";
import signupLogo from "../images/app_logo/signup_logo2.png";
import {Row,Col,Button,Form,Modal} from "react-bootstrap";
import { minYearDiff, months,yearSpan} from "../constants/constants";

class SignupBirthdayPart extends React.Component{
    constructor(props){
        super(props);
        this.state={endDate:0,startYear:0,enableNextBtn:false,showBirthdayInfo:false}
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

    componentDidMount(){
        console.log(new Date())
        this.initDate();
    }

    goBackToNameMode=(e)=>{
        this.props.resetPassword();
        this.props.changeSignupMode(1);
    }

    toggleBirthdayInfo=()=>{
        this.setState((state)=>{
            return {showBirthdayInfo:!state.showBirthdayInfo}
        })
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
                    <Button variant="primary" size="sm" className={styles.nextBtn}  disabled={!this.state.enableNextBtn}>Next</Button>
                    <button type="button" className={styles.backBtn} onClick={this.goBackToNameMode}>Go Back</button>
                </div>
                <MyVerticallyCenteredModal
                    show={this.state.showBirthdayInfo}
                    onHide={this.toggleBirthdayInfo}
                />
            </>
        )
    }

}

function MyVerticallyCenteredModal(props) {
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




export default SignupBirthdayPart;