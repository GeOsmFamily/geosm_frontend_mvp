import { createReducer, on } from '@ngrx/store';
import { User } from '../interfaces/auth';
import {
  forgotPassword,
  forgotPasswordFail,
  forgotPasswordSuccess,
  login,
  loginFacebook,
  loginFail,
  loginGoogle,
  loginSuccess,
  register,
  registerFail,
  registerSuccess,
  resetPassword,
  resetPasswordFail,
  resetPasswordSuccess
} from './auth.actions';

export const authFeatureKey = 'auth';

export interface AuthState {
  user?: User;
  isLoginLoading?: boolean;
  isLoginSuccess?: boolean;
  isLoginFailure?: boolean;
  isRegisterLoading?: boolean;
  isRegisterSuccess?: boolean;
  isRegisterFailure?: boolean;
  isLogoutLoading?: boolean;
  isLogoutSuccess?: boolean;
  isLogoutFailure?: boolean;
  isResetPasswordLoading?: boolean;
  isResetPasswordSuccess?: boolean;
  isResetPasswordFailure?: boolean;
  isForgotPasswordLoading?: boolean;
  isForgotPasswordSuccess?: boolean;
  isForgotPasswordFailure?: boolean;
}

export const initialState: AuthState = {
  user: undefined,
  isLoginLoading: false,
  isLoginSuccess: false,
  isLoginFailure: false,
  isRegisterLoading: false,
  isRegisterSuccess: false,
  isRegisterFailure: false,
  isLogoutLoading: false,
  isLogoutSuccess: false,
  isLogoutFailure: false,
  isResetPasswordLoading: false,
  isResetPasswordSuccess: false,
  isResetPasswordFailure: false,
  isForgotPasswordLoading: false,
  isForgotPasswordSuccess: false,
  isForgotPasswordFailure: false
};

export const authReducer = createReducer(
  initialState,
  on(login, (state, { identifiant, password }) => ({
    ...state,
    isLoginLoading: true,
    isLoginSuccess: false,
    isLoginFailure: false
  })),
  on(loginFacebook, (state, { token }) => ({
    ...state,
    isLoginLoading: true,
    isLoginSuccess: false,
    isLoginFailure: false
  })),
  on(loginGoogle, (state, { token }) => ({
    ...state,
    isLoginLoading: false,
    isLoginSuccess: true,
    isLoginFailure: false
  })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoginLoading: false,
    isLoginSuccess: true,
    isLoginFailure: false
  })),
  on(loginFail, (state, { message }) => ({
    ...state,
    isLoginLoading: false,
    isLoginSuccess: false,
    isLoginFailure: true
  })),

  on(register, (state, { last_name,first_name, email, password, phone,titre }) => ({
    ...state,
    isRegisterLoading: true,
    isRegisterSuccess: false,
    isRegisterFailure: false
  })),
  on(registerSuccess, (state, { user }) => ({
    ...state,
    user,
    isRegisterLoading: false,
    isRegisterSuccess: true,
    isRegisterFailure: false
  })),
  on(registerFail, (state, { message }) => ({
    ...state,
    isRegisterLoading: false,
    isRegisterSuccess: false,
    isRegisterFailure: true
  })),
  on(forgotPassword, (state, { email }) => ({
    ...state,
    isForgotPasswordLoading: true,
    isForgotPasswordSuccess: false,
    isForgotPasswordFailure: false
  })),
  on(forgotPasswordSuccess, state => ({
    ...state,
    isForgotPasswordLoading: false,
    isForgotPasswordSuccess: true,
    isForgotPasswordFailure: false
  })),
  on(forgotPasswordFail, (state, { message }) => ({
    ...state,
    isForgotPasswordLoading: false,
    isForgotPasswordSuccess: false,
    isForgotPasswordFailure: true
  })),
  on(resetPassword, (state, { email, token, password }) => ({
    ...state,
    isResetPasswordLoading: true,
    isResetPasswordSuccess: false,
    isResetPasswordFailure: false
  })),
  on(resetPasswordSuccess, state => ({
    ...state,
    isResetPasswordLoading: false,
    isResetPasswordSuccess: true,
    isResetPasswordFailure: false
  })),
  on(resetPasswordFail, (state, { message }) => ({
    ...state,
    isResetPasswordLoading: false,
    isResetPasswordSuccess: false,
    isResetPasswordFailure: true
  }))
);

export function authreducer(state: AuthState | undefined, action: any): any {
  return authReducer(state, action);
}
