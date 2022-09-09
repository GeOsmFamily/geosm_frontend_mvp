import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {

  form: FormGroup = new FormGroup({
    password: new FormControl('', Validators.required),
    c_password: new FormControl('', Validators.required)
  });


  constructor() { }

  /*ngOnInit(): void {
  }*/

  onSubmit():void{

  }

}
