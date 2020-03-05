import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ConfirmPasswordValidator } from '../account/confirm-password.validator';
import { Service, ChangePassViewModel } from '../../core/api.client';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  formChangePass: FormGroup;
  alertValidationFailed = false;
  alertMessage = '';
  alertValidationSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: Service,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.formChangePass = this.formBuilder.group({
      currentPassword: [null, Validators.required],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmpassword: [null, [Validators.required, Validators.minLength(6)]],
    }, {
        validator: ConfirmPasswordValidator.MatchPassword
      }
    );
  }

  changePassword() {
    const changePassViewModel = new ChangePassViewModel();
    changePassViewModel.id = this.authService.getCurrentUser().id;
    changePassViewModel.oldPassword = this.formChangePass.controls.currentPassword.value;
    changePassViewModel.newPassword = this.formChangePass.controls.password.value;
    this.apiService.changepassword(changePassViewModel)
      .subscribe(
        response => {
          if (response.result === 'success') {
            this.alertValidationFailed = false;
            this.alertMessage = response.message;
            this.alertValidationSuccess = true;
            this.formChangePass.reset();
          } else {
            this.alertMessage = response.message;
            this.alertValidationFailed = true;
          }
        }
      );
  }

}