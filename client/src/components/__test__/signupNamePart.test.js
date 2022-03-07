import React from 'react';
import {render, fireEvent,screen,waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import Signup from '../signup';

const MockSignupName=()=>{
    return <Signup/>
    
}

describe('SignupNamePart', () => {
    test('Sign up should be initially disabled', () => {
        render(<MockSignupName />);
        const btnElement=screen.getByRole("button",{name:/^Sign up$/i});
        expect(btnElement).toBeDisabled();
    });

    test('should call updateInput method after input value has changed. ', () => {
        render(<MockSignupName/>);

        //for fullname
        const fullnameInputElement=screen.getByRole("textbox",{name:/fullname/i})
        fireEvent.change(fullnameInputElement,{target:{value:"#gfgdfgdf%"}});
        expect(fullnameInputElement.value).toBe("#gfgdfgdf%");

        //for email or phone
        const emailOrPhoneInputElement=screen.getByRole("textbox",{name:/Phone number or email/i})
        fireEvent.change(emailOrPhoneInputElement,{target:{value:"kuljit999@gmail.com"}});
        expect(emailOrPhoneInputElement.value).toBe("kuljit999@gmail.com");

        //for username
        const userInputElement=screen.getByRole("textbox",{name:/username/i})
        fireEvent.change(userInputElement,{target:{value:"kuljit"}});
        expect(userInputElement.value).toBe("kuljit");

        //for password
        const passwordInputElement=screen.getByLabelText(/password/i)
        fireEvent.change(passwordInputElement,{target:{value:"kuljit$hgfhgf"}});
        expect(passwordInputElement.value).toBe("kuljit$hgfhgf");

    });

    
    test('should show invalid password message to user. ', () => {
        render(<MockSignupName/>);
        const passwordInputElement=screen.getByLabelText(/password/i)
        fireEvent.change(passwordInputElement,{target:{value:"kuljit$hgfhgf"}});
        fireEvent.blur(passwordInputElement);
        const errDivElement=screen.getByText(/Passoword must be at least 8 character long which contain at least one digit,one lowercase letter,one uppercase letter and one special letter/i);
        expect(errDivElement).toBeVisible();
    });

    test('should show invalid username message to user. ', () => {
        render(<MockSignupName/>);
        const usernameInputElement=screen.getByLabelText(/username/i)
        fireEvent.change(usernameInputElement,{target:{value:"kuljit$hgfhgf"}});
        fireEvent.blur(usernameInputElement);
        const errDivElement=screen.getByText(/Username can only use letters, numbers, underscores and periods/i);
        expect(errDivElement).toBeVisible();
    });

    test('should show invalid email message to user. ', () => {
        render(<MockSignupName/>);
        const emailOrPhoneInputElement=screen.getByRole("textbox",{name:/Phone number or email/i})
        fireEvent.change(emailOrPhoneInputElement,{target:{value:"kuljit999@ggdsfd"}});
        fireEvent.blur(emailOrPhoneInputElement);
        const errDivElement=screen.getByText(/Please enter a valid email address/i);
        expect(errDivElement).toBeVisible();
    });
    
    test('should show message to user that "This email isn\'t available.Please try another". ', async () => {
        render(<MockSignupName/>);
        const emailOrPhoneInputElement=screen.getByRole("textbox",{name:/Phone number or email/i})
        fireEvent.change(emailOrPhoneInputElement,{target:{value:"skuljit628@gmail.com"}});
        fireEvent.blur(emailOrPhoneInputElement);
        const errDivElement=await screen.findByText(/This email isn't available.Please try another/i);
        expect(errDivElement).toBeVisible();
    });

    test('should show message to user that "This number isn\'t available.Please try another". ', async () => {
        render(<MockSignupName/>);
        const emailOrPhoneInputElement=screen.getByRole("textbox",{name:/Phone number or email/i})
        fireEvent.change(emailOrPhoneInputElement,{target:{value:"+919330144649"}});
        fireEvent.blur(emailOrPhoneInputElement);
        const errDivElement=await screen.findByText(/This number isn\'t available.Please try another/i);
        expect(errDivElement).toBeVisible();
    });

    test('should show message to user that "Looks like your phone number may be incorrect. Please try entering your full number including the country code". ', async () => {
        render(<MockSignupName/>);
        const emailOrPhoneInputElement=screen.getByRole("textbox",{name:/Phone number or email/i})
        fireEvent.change(emailOrPhoneInputElement,{target:{value:"919330144649"}});
        fireEvent.blur(emailOrPhoneInputElement);
        const errDivElement=await screen.findByText(/Looks like your phone number may be incorrect. Please try entering your full number including the country code/i);
        expect(errDivElement).toBeVisible();
    });

    test('should show message to user that "This username isn\'t available.Please try another". ', async () => {
        render(<MockSignupName/>);
        const usernameInputElement=screen.getByRole("textbox",{name:/username/i})
        fireEvent.change(usernameInputElement,{target:{value:"kuljit"}});
        fireEvent.blur(usernameInputElement);
        const errDivElement=await screen.findByText(/This username isn't available.Please try another/i);
        expect(errDivElement).toBeVisible();
    });

    test('Sign up button should be enabled. ', async () => {
        render(<MockSignupName/>);

        //for fullname
        const fullnameInputElement=screen.getByRole("textbox",{name:/fullname/i})
        fireEvent.change(fullnameInputElement,{target:{value:"kuljitsingh"}});
        fireEvent.blur(fullnameInputElement);

        //for email or phone
        const emailOrPhoneInputElement=screen.getByRole("textbox",{name:/Phone number or email/i})
        fireEvent.change(emailOrPhoneInputElement,{target:{value:"kuljit999@gmail.com"}});
        fireEvent.blur(emailOrPhoneInputElement);

        //for username
        const userInputElement=screen.getByRole("textbox",{name:/username/i})
        fireEvent.change(userInputElement,{target:{value:"kuljitsingh"}});
        fireEvent.blur(userInputElement)
        

        //for password
        const passwordInputElement=screen.getByLabelText(/password/i)
        fireEvent.change(passwordInputElement,{target:{value:"$Kuljit1994"}});
        fireEvent.blur(passwordInputElement);
        

        const signupBtnElement=screen.getByRole("button",{name:/^sign up$/i});
        await  waitFor(()=>expect(signupBtnElement).not.toBeDisabled(),{timeout:5000})
        


    
    });

  
});
