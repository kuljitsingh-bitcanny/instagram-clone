import React from 'react';
import {render, fireEvent,screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../Login';
import userEvent from '@testing-library/user-event';



const MockLogin=({username,password})=>{
    return <Login username={username?username:""} password={password?password:""}/>
}

describe('SignupBirthdayPart', () => {
    test('should have username initialize with kuljit and password initialize with $kuljit628', () => {
        render(<MockLogin username="kuljit" password="$kuljit628"/>);
        const userNameInput=screen.getByLabelText(/Phone number, username or email/i);
        const passwordInput=screen.getByLabelText(/Password/i);

        expect(userNameInput.value).toBe("kuljit");

        expect(passwordInput.value).toBe("$kuljit628");

    });

    test('should have username kuljit after change', () => {
        render(<MockLogin />);
        const userNameInput=screen.getByLabelText(/Phone number, username or email/i);
        userEvent.type(userNameInput,"kuljit");
        expect(userNameInput.value).toBe("kuljit");

    })

    test('should have password #kuljit after change', () => {
        render(<MockLogin />);
        const passwordInput=screen.getByLabelText(/password/i);
        userEvent.type(passwordInput,"#kuljit");
        expect(passwordInput.value).toBe("#kuljit");

    })
    test('should show user "Sorry,your password was incorrect. Please double-check your password"', async () => {
        render(<MockLogin />);
        const userNameInput=screen.getByLabelText(/Phone number, username or email/i);
        userEvent.type(userNameInput,"kuljit");
        const passwordInput=screen.getByLabelText(/password/i);
        userEvent.type(passwordInput,"#kuljit");
        const loginBtnElement=screen.getByRole("button",{name:/log in/i});
        userEvent.click(loginBtnElement);
        const errMsgElement=await screen.findByText(/Sorry,your password was incorrect. Please double-check your password/i);
        expect(errMsgElement).toBeVisible();
        

    })

    
})