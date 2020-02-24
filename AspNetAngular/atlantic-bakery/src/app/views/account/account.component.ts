import { Component, OnInit } from '@angular/core';
import { Service, RegistrationViewModel, Account, AccountViewModel, ResetPasswordViewModel, Branches } from '../../core/api.client';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  ValidatorFn
} from '@angular/forms';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import Swal from 'sweetalert2';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountsComponent implements OnInit {
  series = new Array();
  formreg: FormGroup;
  users: Account[] = [];
  // Pagination
  page = 1;
  pageSize = 15;
  selectedSeries = new Array();
  accountSeries = new Array();
  modalHeader = '';
  modalBtn = '';
  checkLabel = 'Check all';
  user_id = '';
  // User Types
  userTypes: any;

  // Account Features
  accountFeatures = [];
  // SQ = false;
  // SQGenerateCEF = false;
  // SQShowGLUCPDC = false;
  // SQApprove = false;
  // SQRemoveFromList = false;
  // SOM = false;
  // SOMRemoveFromList = false;
  // SOMGenerateReport = false;
  // SOA = false;
  // SOARemoveFromList = false;
  // SOAGenerateReport = false;

  alertPasswordNotMatch = false;

  constructor(
    private apiService: Service,
    private modalService: NgbModal,
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
    this.getAllSeries();
    this.formreg = this.formBuilder.group({
      lastName: [null, [Validators.required]],
      firstName: [null, [Validators.required]],
      middleName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null],
      userType: [null, Validators.required],
      confirmpassword: [null]
    }
      // , {
      //     validator: ConfirmPasswordValidator.MatchPassword
      //   }
    );
    this.formreg.controls.userType.patchValue(this.userTypes[0]);
    this.accountFeatures = this.getFeatures();
  }

  getFeatures() {
    return [
      { label: 'Production Monitoring', column: 'PM', checked: false },
      { label: 'PM Remarks', column: 'PMRemarks', checked: false },
      { label: 'Remove From List', column: 'PMPick', checked: false },
      { label: 'ITR / IT Monitoring', column: 'ITRM', checked: false },
      { label: 'ITRM Remarks', column: 'ITRMRemarks', checked: false },
      { label: 'Remove From List', column: 'ITRMPick', checked: false },
      { label: 'AR / IP Monitoring', column: 'ARM', checked: false},
      { label: 'AR Remarks', column: 'ARMRemarks', checked: false},
      { label: 'Remove From List', column: 'ARMPick', checked: false}
    ];
  }

  getAllSeries() {
    this.showLoadingFetchData();
    this.apiService.getLocationList()
      .subscribe(
        response => {
          this.series = response;
          Swal.close();
        }, error => {
          Swal.close();
        }
      );
  }

  viewUser(user_id: string) {
    this.showLoadingFetchData();
    this.user_id = user_id;
    this.apiService.viewUser(user_id)
      .subscribe(
        response => {
          const userLocations = response.responseData.locations;
          this.selectedSeries = new Array();
          this.accountSeries = new Array();
          this.series.forEach(o => {
            let locSeries = {};
            if (userLocations.find(l => l.location === o.location)) {
              locSeries = {
                value: o.location,
                checked: true
              };
              this.selectedSeries.push(o.location);
            } else {
              locSeries = {
                value: o.location,
                checked: false
              };
            }
            this.accountSeries.push(locSeries);
          });
          this.formreg.patchValue({
            lastName: response.responseData.lastName,
            firstName: response.responseData.firstName,
            middleName: response.responseData.middleName,
            email: response.responseData.userName,
            userType: response.responseData.role
          });
          const feature = response.responseData.features;
          this.accountFeatures = [
            { label: 'SQ', column: 'SQ', checked: feature.sq },
            { label: 'Generate CEF', column: 'SQGenerateCEF', checked: feature.sqGenerateCEF },
            { label: 'Show GL / UC / PDC', column: 'SQShowGLUCPDC', checked: feature.sqShowGLUCPDC },
            { label: 'Approve / Disapprove', column: 'SQApprove', checked: feature.sqApprove },
            { label: 'Remove From List', column: 'SQRemoveFromList', checked: feature.sqRemoveFromList },
            { label: 'Generate Report', column: 'SQGenerateReport', checked: feature.sqGenerateReport },
            { label: 'SO Monitoring', column: 'SOM', checked: feature.som },
            { label: 'Remove From List', column: 'SOMRemoveFromList', checked: feature.somRemoveFromList },
            { label: 'Generate Report', column: 'SOMGenerateReport', checked: feature.somGenerateReport },
            { label: 'SOA Monitoring', column: 'SOA', checked: feature.soa },
            { label: 'Remove From List', column: 'SOARemoveFromList', checked: feature.soaRemoveFromList },
            { label: 'Generate Report', column: 'SOAGenerateReport', checked: feature.soaGenerateReport },
            { label: 'Order Frequency', column: 'ORF', checked: feature.orf },
            { label: 'Log', column: 'ORFLog', checked: feature.orfLog },
            { label: 'Generate Report', column: 'ORFGenerateReport', checked: feature.orfGenerateReport },
            { label: 'Dashboard', column: 'Dashboard', checked: feature.dashboard }
          ];
          Swal.close();
        },
        errorr => {
          Swal.close();
          console.log('HTTP error', errorr);
        }
      );
  }

  searchUser(email: string) {
    // if (email == '') {
    //   this.getAllUsers();
    // } else {
    //   this.apiService.searchUser(email)
    //     .subscribe(
    //       response => {
    //         this.users = response;
    //       }
    //     );
    // }
  }

  getAllUsers() {
    this.apiService.getAllUsers()
      .subscribe(
        response => {
          this.users = response;
        }
      );
  }

  onSubmit() {
    if (this.modalHeader == 'Account Info') {
      this.updateAccount(this.user_id);
    } else {
      this.register();
    }
  }

  register() {
    // if (this.formreg.controls.password.value == this.formreg.controls.confirmpassword.value) {
    //   this.alertPasswordNotMatch = false;
    //   this.showLoadingFetchData();
    //   const registration = new RegistrationViewModel();
    //   registration.userName = this.formreg.controls.email.value;
    //   registration.lastName = this.formreg.controls.lastName.value;
    //   registration.firstName = this.formreg.controls.firstName.value;
    //   registration.middleName = this.formreg.controls.middleName.value;

    //   // Account Features
    //   registration.sq = this.accountFeatures.find(i => i.column == 'SQ').checked;
    //   registration.sqGenerateCEF = this.accountFeatures.find(i => i.column == 'SQGenerateCEF').checked;
    //   registration.sqShowGLUCPDC = this.accountFeatures.find(i => i.column == 'SQShowGLUCPDC').checked;
    //   registration.sqApprove = this.accountFeatures.find(i => i.column == 'SQApprove').checked;
    //   registration.sqRemoveFromList = this.accountFeatures.find(i => i.column == 'SQRemoveFromList').checked;
    //   registration.sqGenerateReport = this.accountFeatures.find(i => i.column == 'SQGenerateReport').checked;
    //   registration.som = this.accountFeatures.find(i => i.column == 'SOM').checked;
    //   registration.somRemoveFromList = this.accountFeatures.find(i => i.column == 'SOMRemoveFromList').checked;
    //   registration.somGenerateReport = this.accountFeatures.find(i => i.column == 'SOMGenerateReport').checked;
    //   registration.soa = this.accountFeatures.find(i => i.column == 'SOA').checked;
    //   registration.soaRemoveFromList = this.accountFeatures.find(i => i.column == 'SOARemoveFromList').checked;
    //   registration.soaGenerateReport = this.accountFeatures.find(i => i.column == 'SOAGenerateReport').checked;
    //   registration.orf = this.accountFeatures.find(i => i.column == 'ORF').checked;
    //   registration.orfLog = this.accountFeatures.find(i => i.column == 'ORFLog').checked;
    //   registration.orfGenerateReport = this.accountFeatures.find(i => i.column == 'ORFGenerateReport').checked;
    //   registration.dashboard = this.accountFeatures.find(i => i.column == 'Dashboard').checked;

    //   registration.password = this.formreg.controls.password.value;
    //   registration.location = this.selectedSeries;
    //   registration.role = this.formreg.controls.userType.value;
    //   this.apiService.register(registration)
    //     .subscribe(
    //       response => {
    //         if (response.result == 'success') {
    //           Swal.close();
    //           Swal(
    //             '',
    //             'Account Added Successfully!',
    //             'success'
    //           );
    //           this.getAllUsers();
    //           this.closeModal();
    //           this.formreg.reset();
    //           this.selectedSeries = new Array();
    //         } else {
    //           Swal.close();
    //           Swal(
    //             '',
    //             'Email Address is already exists!',
    //             'error'
    //           );
    //         }
    //       },
    //       errorr => {
    //         Swal.close();
    //         console.log('HTTP error', errorr);
    //       }
    //     );
    // } else {
    //   this.alertPasswordNotMatch = true;
    // }
  }

  checkSeries(e: any) {
    if (this.selectedSeries.includes(e)) {
      const i = this.selectedSeries.indexOf(e);
      this.selectedSeries.splice(i, 1);
    } else {
      this.selectedSeries.push(e);
    }
  }

  checkAll(e: any) {
    this.accountSeries = new Array();
    if (e.checked) {
      this.checkLabel = 'Uncheck all';
      this.series.forEach(o => {
        const locSeries = {
          value: o.location,
          checked: true
        };
        this.accountSeries.push(locSeries);
      });
    } else {
      this.checkLabel = 'Check all';
      this.series.forEach(o => {
        const locSeries = {
          value: o.location,
          checked: false
        };
        this.accountSeries.push(locSeries);
      });
    }
  }

  deleteAccount(identity: string) {
    // Swal.fire({
    //   title: 'Are you sure?',
    //   text: "You won't be able to revert this!",
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'Yes, delete it!'
    // }).then((result) => {
    //   if (result.value) {
    //     this.apiService.deleteAccount(identity)
    //       .subscribe(
    //         response => {
    //           if (response.result == 'success') {
    //             this.getAllUsers();
    //             Swal.fire(
    //               'Success!',
    //               'Updated!',
    //               'success'
    //             );
    //           } else {
    //             Swal.fire({
    //               type: 'error',
    //               title: 'Oops...',
    //               text: 'Something went wrong!',
    //               footer: ''
    //             });
    //           }
    //         }
    //       );

    //   }
    // });
  }

  updateAccount(user_id: string) {
    // Swal.fire({
    //   title: 'Are you sure?',
    //   text: "You want to update this account",
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'Yes!'
    // }).then((result) => {
    //   if (result.value) {
    //     this.showLoadingFetchData();
    //     const accountViewModel = new AccountViewModel();
    //     let locationDelete = [];
    //     let locationAdd = [];
    //     this.accountSeries.forEach(o => {
    //       if (o.checked == true) {
    //         locationAdd.push(o.value);
    //       } else {
    //         locationDelete.push(o.value);
    //       }
    //     });
    //     accountViewModel.lastName = this.formreg.controls.lastName.value;
    //     accountViewModel.firstName = this.formreg.controls.firstName.value;
    //     accountViewModel.middleName = this.formreg.controls.middleName.value;
    //     // Account Features
    //     accountViewModel.sq = this.accountFeatures.find(i => i.column == 'SQ').checked;
    //     accountViewModel.sqGenerateCEF = this.accountFeatures.find(i => i.column == 'SQGenerateCEF').checked;
    //     accountViewModel.sqShowGLUCPDC = this.accountFeatures.find(i => i.column == 'SQShowGLUCPDC').checked;
    //     accountViewModel.sqApprove = this.accountFeatures.find(i => i.column == 'SQApprove').checked;
    //     accountViewModel.sqRemoveFromList = this.accountFeatures.find(i => i.column == 'SQRemoveFromList').checked;
    //     accountViewModel.sqGenerateReport = this.accountFeatures.find(i => i.column == 'SQGenerateReport').checked;
    //     accountViewModel.som = this.accountFeatures.find(i => i.column == 'SOM').checked;
    //     accountViewModel.somRemoveFromList = this.accountFeatures.find(i => i.column == 'SOMRemoveFromList').checked;
    //     accountViewModel.somGenerateReport = this.accountFeatures.find(i => i.column == 'SOMGenerateReport').checked;
    //     accountViewModel.soa = this.accountFeatures.find(i => i.column == 'SOA').checked;
    //     accountViewModel.soaRemoveFromList = this.accountFeatures.find(i => i.column == 'SOARemoveFromList').checked;
    //     accountViewModel.soaGenerateReport = this.accountFeatures.find(i => i.column == 'SOAGenerateReport').checked;
    //     accountViewModel.orf = this.accountFeatures.find(i => i.column == 'ORF').checked;
    //     accountViewModel.orfLog = this.accountFeatures.find(i => i.column == 'ORFLog').checked;
    //     accountViewModel.orfGenerateReport = this.accountFeatures.find(i => i.column == 'ORFGenerateReport').checked;
    //     accountViewModel.dashboard = this.accountFeatures.find(i => i.column == 'Dashboard').checked;

    //     accountViewModel.role = this.formreg.controls.userType.value;
    //     accountViewModel.locationDelete = locationDelete;
    //     accountViewModel.locationAdd = locationAdd;
    //     this.apiService.putAccount(user_id, accountViewModel)
    //       .subscribe(
    //         response => {
    //           if (response.result == 'update') {
    //             Swal.close();
    //             Swal.fire(
    //               'Success!',
    //               'Updated!',
    //               'success'
    //             );
    //             this.getAllUsers();
    //             this.closeModal();
    //             this.formreg.reset();
    //           }
    //         },
    //         errorr => {
    //           Swal.close();
    //           console.log('HTTP error', errorr);
    //         }
    //       );
    //   }
    // });
  }

  resetPassword(userName: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to reset password?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.value) {
        this.showLoadingFetchData();
        const resetPasswordViewModel = new ResetPasswordViewModel();
        resetPasswordViewModel.userName = userName;
        this.apiService
          .resetPassword(resetPasswordViewModel)
          .subscribe(
            response => {
              if (response.result == 'success') {
                Swal.close();
                Swal.fire(
                  'Success!',
                  'Updated!',
                  'success'
                );
              } else {
                Swal.close();
                Swal.fire(
                  'Failed!',
                  'Failed to reset password..',
                  'error'
                );
              }
            },
            errorr => {
              Swal.close();
              console.log('HTTP error', errorr);
            }
          );
      }
    });
  }

  openModal(content: any, modalHeader: string, user_id?: string) {
    this.alertPasswordNotMatch = false;
    this.modalHeader = modalHeader;
    if (modalHeader == 'Account Info') {
      this.modalBtn = 'Update';
      this.viewUser(user_id);
    } else {
      this.showLoadingFetchData();
      this.accountFeatures = this.getFeatures();
      this.accountSeries = new Array();
      this.series.forEach(o => {
        const locSeries = {
          value: o.location,
          checked: false
        };
        this.accountSeries.push(locSeries);
      });
      this.modalBtn = 'Submit';
      this.formreg.reset();
      Swal.close();
    }
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  showLoadingFetchData() {
    Swal.fire({
      title: 'Loading',
      text: 'Please wait...',
      imageUrl: 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==',
      showConfirmButton: false,
      allowOutsideClick: false
    });
  }

}
