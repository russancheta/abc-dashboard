import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ARIPMonitoring, ARIPDetails } from '../../core/api.client';
import { Branches } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ar-ip',
  templateUrl: './ar-ip.component.html',
  styleUrls: ['./ar-ip.component.scss']
})
export class ArIpComponent implements OnInit {

  aripMonitoring: ARIPMonitoring[] = [];

  arNo = '';

  aripDetails: ARIPDetails[] = [];

  branch = '';
  branchList: Branches[] = [];

  modalRef: BsModalRef;
  modalOption: ModalOptions = {};

  // pagination
  page = 1;
  pageSize = 10;

  constructor(
    private apiService: Service,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.getBranchList();
  }

  getARIPMonitoring(branch: string) {
    this.showLoading();
    this.apiService.getARIP(branch).subscribe(response => {
      this.aripMonitoring = response;
      Swal.close();
    })
  }

  getARDetails(docNum: number) {
    this.apiService.getARIPDetails(docNum).subscribe(response => {
      this.aripDetails = response;
    })
  }

  arDetails(content: any, arNo: number) {
    this.getARDetails(arNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg'})
    this.arNo = arNo.toString();
  }

  getBranchList() {
    this.apiService.getBranchList().subscribe(response => {
      this.branchList = response;
      this.getARIPMonitoring(this.branchList[0].name)
    })
  }

  onChangeBranch(branch: string) {
    this.getARIPMonitoring(branch);
  }

  closeModal() {
    this.modalRef.hide();
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
