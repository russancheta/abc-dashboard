import { Component, OnInit } from '@angular/core';
import { Service, RegistrationViewModel, Account, AccountViewModel, ResetPasswordViewModel } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  branches = new Array();
  formReg: FormGroup;
  users: Account[] = [];

  // pagination
  page = 1;
  pageSize = 15;

  selectedBranch = new Array();
  accountSeries = new Array();
  
  modalHeader = '';
  modalBtn = '';
  
  checkLabel = 'Check all';

  user_id = '';

  // User Types
  userTypes: any;

  // Account Features
  accountFeatures = [];

  constructor(
    private apiService: Service,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public authService: AuthService
  ) { 
    this.userTypes = [
      'Super User',
      'Supervisor Accounting',
      'Supervisor Logistics',
      'Supervisor Sales',
      'Accounting',
      'Logistics',
      'Sales'
    ];
  }

  ngOnInit() {
    this.getAllUsers();
  }

  getFeatures() {
    return [
      { label: 'Production Monitoring', column: 'PM', checked: false },
      { label: 'Production Monitoring Remarks', column: 'PMRemarks', checked: false },
      { label: 'Production Monitoring Pick', column: 'PMPick', checked: false },
      { label: 'ITR/IT Monitoring', column: 'ITRM', checked: false },
      { label: 'ITR/IT Monitoring Remarks', column: 'ITRMRemarks', checked: false },
      { label: 'ITR/IT Monitoring Pick', column: 'ITRMPick', checked: false },
    ];
  }

  getAllBranch() {
    this.showLoading();
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      Swal.close();
    }, error => {
      Swal.close();
    });
  }

  getAllUsers() {
    this.apiService.getAllUsers()
      .subscribe(
        response => {
          this.users = response;
          console.table(response);
        }
      );
  }

  showLoading() {
    Swal.fire({
      title: 'Loading',
      text: 'Please wait',
      showConfirmButton: false,
      allowOutsideClick: false
    })
  }

}
