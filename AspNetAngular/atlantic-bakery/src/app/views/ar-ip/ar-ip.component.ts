import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ARIPMonitoring, ARIPDetails, IPDetails } from '../../core/api.client';
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

  arDetails: ARIPDetails[] = [];
  arNo = 0;

  ipDetails: IPDetails[] = [];
  ipNo = 0;

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
      this.arDetails = response;
    })
  }

  arModalDetails(content: any, arNo: number) {
    this.getARDetails(arNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg'})
    this.arNo = arNo
  }

  getIPDetails(docNum: number) {
    this.apiService.getIPDetails(docNum).subscribe(response => {
      this.ipDetails = response;
    })
  }

  ipModalDetails(content: any, ipNo: number) {
    this.getIPDetails(ipNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg'})
    this.ipNo = ipNo;
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
