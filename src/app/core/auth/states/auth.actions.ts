import { createAction, props } from '@ngrx/store';
import { User } from '../interfaces/auth';

export const AUTH_LOGIN = '[AUTH] Login';
export const AUTH_LOGIN_FACEBOOK = '[AUTH] Login Facebook';
export const AUTH_LOGIN_GOOGLE = '[AUTH] Login Google';
export const AUTH_LOGIN_SUCCESS = '[AUTH] Login Success';
export const AUTH_LOGIN_FAIL = '[AUTH] Login Fail';

export const AUTH_LOGOUT = '[AUTH] Logout';
export const AUTH_LOGOUT_SUCCESS = '[AUTH] Logout Success';
export const AUTH_LOGOUT_FAIL = '[AUTH] Logout Fail';

export const AUTH_REGISTER = '[AUTH] Register';
export const AUTH_REGISTER_SUCCESS = '[AUTH] Register Success';
export const AUTH_REGISTER_FAIL = '[AUTH] Register Fail';

export const AUTH_FORGOT_PASSWORD = '[AUTH] Forgot Password';
export const AUTH_FORGOT_PASSWORD_SUCCESS = '[AUTH] Forgot Password Success';
export const AUTH_FORGOT_PASSWORD_FAIL = '[AUTH] Forgot Password Fail';

export const AUTH_RESET_PASSWORD = '[AUTH] Reset Password';
export const AUTH_RESET_PASSWORD_SUCCESS = '[AUTH] Reset Password Success';
export const AUTH_RESET_PASSWORD_FAIL = '[AUTH] Reset Password Fail';

export const login = createAction(AUTH_LOGIN, props<{ identifiant: string; password: string }>());
export const loginFacebook = createAction(AUTH_LOGIN_FACEBOOK, props<{ token: string }>());
export const loginGoogle = createAction(AUTH_LOGIN_GOOGLE, props<{ token: string }>());
export const loginSuccess = createAction(AUTH_LOGIN_SUCCESS, props<{ user: User }>());
export const loginFail = createAction(AUTH_LOGIN_FAIL, props<{ message: string }>());

export const logout = createAction(AUTH_LOGOUT);
export const logoutSuccess = createAction(AUTH_LOGOUT_SUCCESS);
export const logoutFail = createAction(AUTH_LOGOUT_FAIL, props<{ message: string }>());

export const register = createAction(AUTH_REGISTER, props<{ last_name: string;first_name:string,titre?:string, email: string; password: string; phone: number }>());
export const registerSuccess = createAction(AUTH_REGISTER_SUCCESS, props<{ user: User }>());
export const registerFail = createAction(AUTH_REGISTER_FAIL, props<{ message: string }>());

export const forgotPassword = createAction(AUTH_FORGOT_PASSWORD, props<{ email: string }>());
export const forgotPasswordSuccess = createAction(AUTH_FORGOT_PASSWORD_SUCCESS);
export const forgotPasswordFail = createAction(AUTH_FORGOT_PASSWORD_FAIL, props<{ message: string }>());

export const resetPassword = createAction(AUTH_RESET_PASSWORD, props<{ email: string; token: string; password: string }>());
export const resetPasswordSuccess = createAction(AUTH_RESET_PASSWORD_SUCCESS);
export const resetPasswordFail = createAction(AUTH_RESET_PASSWORD_FAIL, props<{ message: string }>());
