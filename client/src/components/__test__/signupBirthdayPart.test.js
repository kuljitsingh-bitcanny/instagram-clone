import React from 'react';
import {render, fireEvent,screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupBirthdayPart from '../signupBirthdayPart';

const birthday={month:"",year:"",day:""};
const changeBirthday=jest.fn();
const resetPassword=jest.fn();

const MockSignupBirthday=({count,signupModeFunc})=>{
    const userReqCount=count || 0;
    const changeSignupMode=signupModeFunc || jest.fn();
    return <SignupBirthdayPart birthday={birthday} userReqCount={userReqCount} changeBirthday={changeBirthday} 
                                changeSignupMode={changeSignupMode} resetPassword={resetPassword}/>
}

describe('SignupBirthdayPart', () => {
    test('should have 3 select box', () => {
        render(<MockSignupBirthday/>);
        const selectElements=screen.queryAllByRole("listbox");
        expect(selectElements.length).toBe(3);
    });
    test('Next button should be present', () => {
        render(<MockSignupBirthday />);
        const buttonElement=screen.getByRole("button",{name:/next/i});
        expect(buttonElement).toBeInTheDocument()
    });
    test('Next button should be initially disabled', () => {
        render(<MockSignupBirthday/>);
        const buttonElement=screen.getByRole("button",{name:/next/i});
        expect(buttonElement).toBeDisabled();
    });

    test(`Next button should enabled when user age is greated than 6`, () => {
        render(<MockSignupBirthday />);
        const selectElement=screen.queryAllByRole("listbox")[2];
        const buttonElement=screen.getByRole("button",{name:/next/i});
        //expect to button disabled
        fireEvent.change(selectElement,{target:{value:"2017"}});
        expect(buttonElement).toBeDisabled();

        //expect to enabled
        fireEvent.change(selectElement,{target:{value:"2012"}});
        expect(buttonElement).not.toBeDisabled();
    });
    
    test("CannotCreateUserModal will be visible when user click next btn as user requested greater than 3 times", () => {
        render(<MockSignupBirthday count={4} />);
        const selectElement=screen.queryAllByRole("listbox")[2];
        const buttonElement=screen.getByRole("button",{name:/next/i});
        fireEvent.change(selectElement,{target:{value:"2012"}});
        fireEvent.click(buttonElement);
        const divElement=screen.getByText(/Problem Creating Your Account/i);
        expect(divElement).toBeVisible();
    });

    
    test('should show BirthdayInfoModal when user click on  Why do I need to provide my birthday? button', () => {
        render(<MockSignupBirthday />);
        const buttonElement=screen.getByRole("button",{name:/Why do I need to provide my birthday?/i});
        fireEvent.click(buttonElement);
        const headingElement=screen.getByText(/Birthdays on Instagram/i);
        expect(headingElement).toBeVisible();
    });
    test('Next button should enabled and does not call changeSignupMode when clicked as user requested more than 3 times', () => {
        const changeSignupMode=jest.fn();
        render(<MockSignupBirthday count={4} signupModeFunc={changeSignupMode}/>);
        const selectElement=screen.queryAllByRole("listbox")[2];
        const buttonElement=screen.getByRole("button",{name:/next/i});
        fireEvent.change(selectElement,{target:{value:"2012"}});
        fireEvent.click(buttonElement);
        expect(changeSignupMode).toHaveBeenCalledTimes(0);
    });

    test('Call change signup mode when go back button clicked', () => {
        const changeSignupMode=jest.fn();
        render(<MockSignupBirthday signupModeFunc={changeSignupMode}/>);
        const buttonElement=screen.getByRole("button",{name:/Go Back/i});
        fireEvent.click(buttonElement)
        expect(changeSignupMode).toHaveBeenCalledTimes(1);
    });
    test('Next button should enabled and call changeSignupMode 1 time when clicked as user age is greated than 6 and user requested less than 3 times', () => {
        const changeSignupMode=jest.fn();
        render(<MockSignupBirthday signupModeFunc={changeSignupMode}/>);
        const selectElement=screen.queryAllByRole("listbox")[2];
        const buttonElement=screen.getByRole("button",{name:/next/i});
        fireEvent.change(selectElement,{target:{value:"2012"}});
        fireEvent.click(buttonElement);
        expect(buttonElement).not.toBeDisabled();
        expect(changeSignupMode).toHaveBeenCalledTimes(1);
    });
    
});
