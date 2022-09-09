import { login, loginFacebook, loginGoogle } from '../states/auth.actions';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AuthState } from '../states/auth.reducer';
import { selectIsLoginLoading, selectIsLoginSuccess, selectUser } from '../states/auth.selector';
import { NotifierService } from 'angular-notifier';
import { User } from '../interfaces/auth';
import { Router } from '@angular/router';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { StorageService } from '../../services/api/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  isLoginLoading$: Observable<boolean | undefined>;
  user$: Observable<User | undefined>;
  isLoginSuccess$: Observable<boolean | undefined>;

  private readonly notifier!: NotifierService;

  constructor(
    private fb: FormBuilder,
    private store: Store<AuthState>,
    notifierService: NotifierService,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private storageService:StorageService
  ) {
    this.notifier = notifierService;
    this.isLoginLoading$ = this.store.pipe(select(selectIsLoginLoading));
    this.user$ = this.store.pipe(select(selectUser));
    this.isLoginSuccess$ = this.store.pipe(select(selectIsLoginSuccess));
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],

      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.notifier.notify('error', 'Formulaire invalide');
      return;
    } else {
      this.store.dispatch(login({ identifiant: this.f.email.value, password: this.f.password.value }));

      this.isLoginSuccess$.subscribe(isLoginSuccess => {
        if (isLoginSuccess) {
          this.notifier.notify('success', 'Connexion réussie');
          this.loginForm.reset()
          this.router.navigate(['/']);
        }
        else{
          this.notifier.notify('error', 'Connexion échouée');
        }
      });
    }
  }

  loginFacebook() {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then(user => {
      this.submitted = true;
      this.store.dispatch(loginFacebook({ token: user.authToken }));
      this.isLoginSuccess$.subscribe(isLoginSuccess => {
        if (isLoginSuccess) {
          this.notifier.notify('success', 'Connexion réussie');
          this.router.navigate(['/']);
        }
      });
    });
  }

  loginGoogle() {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID, {
        scope: 'profile email'
      })
      .then(user => {
        this.submitted = true;
        this.store.dispatch(loginGoogle({ token: user.authToken }));
        this.isLoginSuccess$.subscribe(isLoginSuccess => {
          if (isLoginSuccess) {
            this.notifier.notify('success', 'Connexion réussie');
            this.router.navigate(['/']);
          }
        });
      });
  }
}
