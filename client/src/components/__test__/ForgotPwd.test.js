import React from 'react';
import {render, fireEvent,screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPwd from '../ForgotPwd';
import userEvent from '@testing-library/user-event';

const AuthContext=React.createContext();
const checkAndChangeDisplayMode=jest.fn();

const MockForgotPwd=()=>{
    return (
        <AuthContext.Provider value={checkAndChangeDisplayMode}>
            <ForgotPwd/>
        </AuthContext.Provider>
    )
}

describe('ForgotPwd', () => {
    // test('Send Login link button should be disabled', () => {
    //     render(<MockForgotPwd />);
    //     const sendLoginLinkBtnElement=screen.getByRole(/Send Login Link/i);
    //     expect(sendLoginLinkBtnElement).toBeDisabled();
        
    // });

    

    
})