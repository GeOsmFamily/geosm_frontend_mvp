import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {


  form: FormGroup = new FormGroup({

    email: new FormControl('', Validators.required),

  });

  constructor() { }

  /*ngOnInit(): void {
  }*/


  onSubmit():void{

  }
}
