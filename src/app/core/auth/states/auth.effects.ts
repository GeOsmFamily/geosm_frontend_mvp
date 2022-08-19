import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import * as authAction from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions, private authService: AuthService) {}

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(authAction.AUTH_LOGIN),
      exhaustMap(({ identifiant, password }) =>
        this.authService.login(identifiant, password).pipe(
          map(user => authAction.loginSuccess({ user })),
          catchError(error => of(authAction.loginFail({ message: error })))
        )
      )
    );
  });

  register$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(authAction.AUTH_REGISTER),
      exhaustMap(({last_name, first_name,titre, email, password, phone }) =>
        this.authService.register(last_name,first_name, email, password, phone,titre).pipe(
          map(user => authAction.registerSuccess({ user })),
          catchError(error => of(authAction.registerFail({ message: error })))
        )
      )
    );
  });

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(authAction.AUTH_LOGOUT),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => authAction.logoutSuccess()),
          catchError(error => of(authAction.logoutFail({ message: error })))
        )
      )
    );
  });

  resetPassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(authAction.AUTH_RESET_PASSWORD),
      exhaustMap(({ email, token, password }) =>
        this.authService.reset(email, token, password).pipe(
          map(() => authAction.resetPasswordSuccess()),
          catchError(error => of(authAction.resetPasswordFail({ message: error })))
        )
      )
    );
  });

  forgotPassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(authAction.AUTH_FORGOT_PASSWORD),
      exhaustMap(({ email }) =>
        this.authService.forgot(email).pipe(
          map(() => authAction.forgotPasswordSuccess()),
          catchError(error => of(authAction.forgotPasswordFail({ message: error })))
        )
      )
    );
  });

  loginFacebook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(authAction.AUTH_LOGIN_FACEBOOK),
      exhaustMap(({ token }) =>
        this.authService.registerFacebook(token).pipe(
          map(user => authAction.loginSuccess({ user })),
          catchError(error => of(authAction.loginFail({ message: error })))
        )
      )
    );
  });

  loginGoogle$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(authAction.AUTH_LOGIN_GOOGLE),
      exhaustMap(({ token }) =>
        this.authService.registerGoogle(token).pipe(
          map(user => authAction.loginSuccess({ user })),
          catchError(error => of(authAction.loginFail({ message: error })))
        )
      )
    );
  });
}
