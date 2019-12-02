import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterState } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../shared/auth.service';
import { Service, CredentialsViewModel } from '../../core/api.client';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  showPassBtnLabel = 'Show';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private apiService: Service
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // reset login status
    this.authService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  showPassword(input: any) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const credential = new CredentialsViewModel();
    credential.userName = this.f.username.value;
    credential.password = this.f.password.value;
    this.apiService.login(credential).subscribe(response => {
      if (response.result == 'Success') {
        localStorage.setItem('currentUser', JSON.stringify(response.responseData));
        if (this.authService.getUserType() == 'Super Admin') {
          this.router.navigate(['accounts']);
        }
        // to add routing for other roles
      }
    })

  }
 }
