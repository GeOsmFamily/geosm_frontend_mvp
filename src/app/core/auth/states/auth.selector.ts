import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuth from './auth.reducer';

export const selectAuthState = createFeatureSelector<fromAuth.AuthState>(fromAuth.authFeatureKey);

export const selectUser = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.user);

export const selectIsLoginLoading = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isLoginLoading);

export const selectIsLoginSuccess = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isLoginSuccess);

export const selectIsResgisterLoading = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isRegisterLoading);

export const selectIsResgisterSuccess = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isRegisterSuccess);

export const selectIsLogoutLoading = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isLogoutLoading);

export const selectIsResetPasswordLoading = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isResetPasswordLoading);

export const selectIsResetPasswordSuccess = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isResetPasswordSuccess);

export const selectIsForgotPasswordLoading = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isForgotPasswordLoading);

export const selectIsForgotPasswordSuccess = createSelector(selectAuthState, (state: fromAuth.AuthState) => state.isForgotPasswordSuccess);
