import React from 'react';
import {render, fireEvent,screen,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupUserInfoConfrmPart from '../signupUserInfoConfrmPart';

const resetPassword=jest.fn();
const updatePhoneNum=jest.fn();
const resetShowSpinner=jest.fn();
const setShowSpinner=jest.fn();
const getUserBirthday=jest.fn();
const userImgUrl="";

const MockSignupUserInfoConfrmPart=({isUserChooseEmail,signupMode,input})=>{
    const inputs={emailOrPhone:input??"kuljit@gmail.com",fullname:"kuljit singh",username:"kuljitsingh",password:"#Error585548"};
    const changeSignupMode=signupMode || jest.fn();
    return (
        <SignupUserInfoConfrmPart isUserChooseEmail={isUserChooseEmail??true} inputs={inputs}
                                changeSignupMode={changeSignupMode} resetPassword={resetPassword} 
                                updatePhoneNum={updatePhoneNum} resetShowSpinner={resetShowSpinner} 
                                getUserBirthday={getUserBirthday} userImgurl={userImgUrl}
                                setShowSpinner={setShowSpinner} showSpinner={false}/>
    )
}

describe('SignupConfrmPart', () => {
    test('Confirm/Next btn should be initially disabled', () => {
        render(<MockSignupUserInfoConfrmPart />);
        const btnElement=screen.getByRole("button",{name:/^next$/i});
        expect(btnElement).toBeDisabled();
    });

    test('Confirm/Next btn should be should not be disabled', () => {
        render(<MockSignupUserInfoConfrmPart />);
        const inputElement=screen.getByLabelText(/Confirmation Code/i)
        fireEvent.change(inputElement,{target:{value:"123456"}});
        fireEvent.blur(inputElement);
        const btnElement=screen.getByRole("button",{name:/^next$/i});
        expect(btnElement).not.toBeDisabled();
       
        
    });
    test('Should Show invalid code to user', () => {
        render(<MockSignupUserInfoConfrmPart />);
        const inputElement=screen.getByLabelText(/Confirmation Code/i)
        fireEvent.change(inputElement,{target:{value:"123456"}});
        fireEvent.blur(inputElement);
        const btnElement=screen.getByRole("button",{name:/^next$/i});
        fireEvent.click(btnElement);
        const divElement=screen.getByText(/That code isn't valid. You can request a new one/i);
        expect(divElement).toBeVisible();
        
    });
    test('Should change signup mode shuold called once', () => {
        const signupMode=jest.fn();
        render(<MockSignupUserInfoConfrmPart signupMode={signupMode}/>);
        const btnElement=screen.getByRole("button",{name:/^go back$/i});
        fireEvent.click(btnElement);
        expect(signupMode).toHaveBeenCalledTimes(1);
        expect(resetPassword).toHaveBeenCalledTimes(1);
        
    });
    test('should show user "Please wait a few minutes before you try again', async () => {
        render(<MockSignupUserInfoConfrmPart />);
        const btnElement=screen.getByRole("button",{name:/^Resend code$/i});
        fireEvent.click(btnElement);
        const divElement=await screen.findByText(/Please wait a few minutes before you try again/i);
        expect(divElement).toBeVisible();
        
    });
    test('On Change Number button click should form where user can input their new number', () => {
        render(<MockSignupUserInfoConfrmPart isUserChooseEmail={false} input="+919330144649"/>);
        const btnElement=screen.getByRole("button",{name:/Change Number/i});
        expect(btnElement).toBeVisible();
        fireEvent.click(btnElement);
        const newNumInputElement=screen.getByLabelText(/New phone Number/i);
        expect(newNumInputElement).toBeVisible();
        
 
    });
    test('On Go back button click user can see confirmation code form', () => {
        render(<MockSignupUserInfoConfrmPart isUserChooseEmail={false} input="+919330144649"/>);
        const btnElement=screen.getByRole("button",{name:/Change Number/i});
        expect(btnElement).toBeVisible();
        fireEvent.click(btnElement);
        const goBackBtnElement=screen.getByRole("button",{name:/go back/i});
        fireEvent.click(goBackBtnElement);
        const inputElement=screen.getByLabelText(/######/i)
        expect(inputElement).toBeVisible();
 
    });
    test('should show user that "This number isn\'t available.Please try another"', async () => {
        render(<MockSignupUserInfoConfrmPart isUserChooseEmail={false} input="+919330144649"/>);
        const btnElement=screen.getByRole("button",{name:/Change Number/i});
        expect(btnElement).toBeVisible();
        fireEvent.click(btnElement);
        const newNumInputElement=screen.getByLabelText(/New phone Number/i);
        fireEvent.change(newNumInputElement,{target:{value:"+919330144648"}});
        fireEvent.blur(newNumInputElement);
        const confrmNewNumBtn=screen.getByRole("button",{name:/change/i});
        fireEvent.click(confrmNewNumBtn);
        const newPhoneElement=await screen.findByText(/This number isn't available.Please try another/i)
        expect(newPhoneElement).toBeVisible();
    });
    test('should show confirmation code form to user after new phone has validated', async () => {
        render(<MockSignupUserInfoConfrmPart isUserChooseEmail={false} input="+919330144649"/>);
        const btnElement=screen.getByRole("button",{name:/Change Number/i});
        expect(btnElement).toBeVisible();
        fireEvent.click(btnElement);
        const newNumInputElement=screen.getByLabelText(/New phone Number/i);
        fireEvent.change(newNumInputElement,{target:{value:"+919330144645"}});
        fireEvent.blur(newNumInputElement);
        const confrmNewNumBtn=screen.getByRole("button",{name:/change/i});
        fireEvent.click(confrmNewNumBtn);
        const inputElement=await screen.findByLabelText(/######/i)
        expect(inputElement).toBeVisible();
    });
    test('should show user "Please wait a few minutes before you try again"', async () => {
        render(<MockSignupUserInfoConfrmPart isUserChooseEmail={false} input="+919330144649"/>);
        const btnElement=screen.getByRole("button",{name:/Request New Code/i});
        fireEvent.click(btnElement);
        const divElement=await screen.findByText(/Please wait a few minutes before you try again/i);
        expect(divElement).toBeVisible();
    });

  
});