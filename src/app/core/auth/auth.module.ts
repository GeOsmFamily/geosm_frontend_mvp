import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    ResetPasswordComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    LoginComponent
  ],
  imports: [CommonModule,AuthRoutingModule]
})
export class AuthModule {}
