import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ProductionOrder, ProdOrderDetails, InvTransferDetails, ITRITDifference } from '../../core/api.client';
import { Branches } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-production-order',
  templateUrl: './production-order.component.html',
  styleUrls: ['./production-order.component.scss']
})
export class ProductionOrderComponent implements OnInit {

  productionOrder: ProductionOrder[] = [];
  productionOrderDetails: ProdOrderDetails[] = [];
  invTransferDetails: InvTransferDetails[] = [];
  itritDifference: ITRITDifference[] = [];

  branches: Branches[] = [];
  branch = '';

  itrNo = '';
  itNo = '';

  modalRef: BsModalRef;
  modalRefRemarks: BsModalRef;
  modalOption: ModalOptions = {};

  //paging
  page = 1;
  pageSize = 10;

  //comparison total modal
  itrTotalQuantity: number = 0;
  itTotalQuantity: number = 0;

  pollingData: any;

  constructor(
    private apiService: Service,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.getBranches();
  }

  getProductionOrder(branch: string) {
    this.showLoading();
    this.apiService.getProductionOrder(branch).subscribe(response => {
      this.productionOrder = response;
      Swal.close();
      console.table(response);
    })
  }

  getProdOrderDetails(docnum: number) {
    this.apiService.getProdDetails(docnum).subscribe(response => {
      this.productionOrderDetails = response;
    })
  }

  getITDetails(docnum: number) {
    this.apiService.getITDetails(docnum).subscribe(response => {
      this.invTransferDetails = response;
    })
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      console.table(response);
    })
  }

  openModal(content: any, itrNo: number) {
    this.getProdOrderDetails(itrNo);
    this.modalRef = this.modalService.show(content, {backdrop: 'static', class: 'modal-xl'})
    this.itrNo = itrNo.toString();
  }

  itDetails(content: any, itNo: number) {
    this.getITDetails(itNo);
    this.modalRef = this.modalService.show(content, {backdrop: 'static', class: 'modal-lg'})
    this.itNo = itNo.toString();
  }

  itritComparison(content: any, docNum: number) {
    this.apiService.getDifference(docNum).subscribe(response => {
      this.itritDifference = response;
      this.itrTotalQuantity = response.reduce((r, d) => r + d.itrQuantity, 0);
      this.itTotalQuantity = response.reduce((r, d) => r + d.itQuantity, 0);
    });
    this.modalRef = this.modalService.show(content, {backdrop: 'static', class: 'modal-lg'})
  }

  openModalRemarks(content: any) {
    console.log('Open Modal Remarks');
    this.modalRefRemarks = this.modalService.show(content, { backdrop: 'static' });
  }

  openModalListRemarks(content: any, itrNo: number) {
    this.itrNo = itrNo.toString();
    this.modalRef = this.modalService.show(content, { backdrop: 'static' });
  }

  closeModalRemarks() {
    this.modalRefRemarks.hide();
  }

  closeModal() {
    this.modalRef.hide();
  }

  onChangeBranch(branch: string) {
    this.getProductionOrder(branch);
  }

  showLoading() {
    Swal.fire({
      title: 'Loading',
      text: 'Please wait',
      showConfirmButton: false,
      allowOutsideClick: false
    })
  }

  arraySplit(docNum: string) {
    const splitDocNum = docNum.split(', ');
    return splitDocNum;
  }

  itDocNumSplit(docNum: string) {
    const splitDocNum = docNum.split(', ');
    console.log(splitDocNum);
    return splitDocNum;
  }
}
