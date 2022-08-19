import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { User } from '../../auth/interfaces/auth';
import { register } from '../../auth/states/auth.actions';
import { AuthState } from '../../auth/states/auth.reducer';
import { selectIsResgisterLoading, selectIsResgisterSuccess, selectUser } from '../../auth/states/auth.selector';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  isRegisterLoading$: Observable<boolean | undefined>;
  user$: Observable<User | undefined>;
  isRegisterSuccess$: Observable<boolean | undefined>;

  private readonly notifier!: NotifierService;
  constructor(private fb: FormBuilder, private store: Store<AuthState>, notifierService: NotifierService, private router: Router) {
    this.notifier = notifierService;
    this.isRegisterLoading$ = this.store.pipe(select(selectIsResgisterLoading));
    this.user$ = this.store.pipe(select(selectUser));
    this.isRegisterSuccess$ = this.store.pipe(select(selectIsResgisterSuccess));
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        lastName: ['', Validators.required],
        titre: [''],
        firstName: ['', Validators.required],
        c_password: ['', Validators.required],
        password: ['', Validators.required],
        phone: ['', Validators.required]
      },
      {
        validator: this.mustMatch('password', 'c_password')
      }
    );
  }

  /**
   *Function tests if the 2 password entries match
   *
   * @param {string} controlName
   * @param {string} matchingControlName
   * @return {*}
   * @memberof RegisterComponent
   */
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {

    this.submitted = true;
    if (this.registerForm.invalid) {
      this.notifier.notify('error', 'Formulaire invalide');
      return;
    } else {
      this.store.dispatch(register({ email: this.f.email.value, last_name: this.f.lastName.value,first_name:this.f.firstName.value, password: this.f.password.value, phone: this.f.phone.value }));

      this.isRegisterSuccess$.subscribe(isRegisterSuccess => {
        if (isRegisterSuccess) {
          this.notifier.notify('success', 'Inscription réussie');
          this.router.navigate(['/']);
        }
      });
    }
  }


}
