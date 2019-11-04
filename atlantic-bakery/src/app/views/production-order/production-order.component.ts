import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ProductionOrder, ProdOrderDetails } from '../../core/api.client';
import { Branches } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import Swal from 'sweetalert2';
import { interval } from 'rxjs/internal/observable/interval';
import { startWith, flatMap } from 'rxjs/operators';
import { error } from '@angular/compiler/src/util';

@Component({
  selector: 'app-production-order',
  templateUrl: './production-order.component.html',
  styleUrls: ['./production-order.component.scss']
})
export class ProductionOrderComponent implements OnInit {

  productionOrder: ProductionOrder[] = [];
  productionOrderDetails: ProdOrderDetails[] = [];
  branches: Branches[] = [];
  branch = '';
  itrNo = '';

  modalRef: BsModalRef;
  modalOption: ModalOptions = {};

  //paging
  page = 1;
  pageSize = 50;

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
}
