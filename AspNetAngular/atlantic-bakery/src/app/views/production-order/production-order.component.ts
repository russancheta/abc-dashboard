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

  containerPO: ProductionOrder[] = [];
  returnPO: ProductionOrder[] = [];
  productionOrderDetails: ProdOrderDetails[] = [];
  invTransferDetails: InvTransferDetails[] = [];
  itritDifference: ITRITDifference[] = [];

  branches: Branches[] = [];
  branch = '';
  whse = 'All';
  fromWhse = 'All';
  toWhse = 'All';

  itrNo = '';
  itNo = '';

  modalRef: BsModalRef;
  modalRefRemarks: BsModalRef;
  modalOption: ModalOptions = {};

  // paging
  page = 1;
  pageSize = 10;

  // comparison total modal
  itrTotalQuantity: number = 0;
  itTotalQuantity: number = 0;

  // for updating of itr
  selectedITR = new Array();
  checkSelected = 0;

  filterOption = [
    { value: 'All', label: 'All' },
    { value: 'Finished Goods', label: 'Finished Goods' },
    { value: 'Raw Materials', label: 'Raw Materials' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Packaging & Other Materials', label: 'Packaging & Other Materials' }
  ];

  filterOptionValue = 'All';

  fromFilter = '';
  fromBranch = '';

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
    this.apiService.getProductionOrder(branch, this.filterOptionValue).subscribe(response => {
      this.containerPO = response;
      this.returnPO = response;
      Swal.close();
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
      this.branch = response[0].name;
      this.getProductionOrder(this.branches[0].name);
    })
  }

  openModal(content: any, itrNo: number) {
    this.getProdOrderDetails(itrNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' })
    this.itrNo = itrNo.toString();
  }

  itDetails(content: any, itNo: number) {
    this.getITDetails(itNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' })
    this.itNo = itNo.toString();
  }

  itritComparison(content: any, docNum: number) {
    this.apiService.getDifference(docNum).subscribe(response => {
      this.itritDifference = response;
      this.itrTotalQuantity = response.reduce((r, d) => r + d.itrQuantity, 0);
      this.itTotalQuantity = response.reduce((r, d) => r + d.itQuantity, 0);
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' })
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
    this.branch = branch;
    console.log(branch);
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

  filterGroup(group: string) {
    this.filterOptionValue = group;
    if (group === 'All') {
      this.getProductionOrder(this.branch);
    } else {
      // this.productionOrder = [];
      this.getProductionOrder(this.branch);
      this.productionOrder = this.productionOrder.filter(o => o.from.includes(group));
      console.log(this.branch);
      console.log(group);
    }
    console.log(group);
  }

  filterFrom(from: string) {
    this.fromWhse = from;
    if (from == 'All') {
      this.getProductionOrder(this.branch);
      console.log('sdjfkdsjfkld');
      console.log(this.branch);
      console.log('dsfdsf');
      console.log(from);
    } else {
      //this.getProductionOrder(this.branch);
      this.showLoading();
      this.returnPO = this.containerPO;
      this.returnPO = this.returnPO.filter(o => o.from.includes(from));
      Swal.close();
    }
  }

  filterTo(to: string) {
    this.toWhse = to;
    if (to == 'All') {
      this.getProductionOrder(this.branch);
    } else {
      this.showLoading();
      this.returnPO = this.containerPO;
      this.returnPO = this.returnPO.filter(o => o.to.includes(to));
      Swal.close();
      console.log(to);
    }
  }

  checkedITR(itrNo: any) {
    if (this.selectedITR.includes(itrNo)) {
      const i = this.selectedITR.indexOf(itrNo);
      this.selectedITR.splice(i, 1);
      this.checkSelected = this.selectedITR.length;
    } else {
      this.selectedITR.push(itrNo);
      this.checkSelected = this.selectedITR.length;
    }
    if (this.checkSelected == 0) {
      this.getProductionOrder(this.branch);
    }
  }

  closeITR(itrNos: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, closei it!',
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.apiService.updateITR(itrNos).subscribe(response => {
          if (response.result == 'Success') {
            Swal.fire(
              'Closed',
              '',
              'success'
            );
            this.selectedITR = new Array();
            this.getProductionOrder(this.branch);
            console.log(this.selectedITR);
            console.log(response.result);
            console.log(response.message);
          }
        });
      }
    });
  }
}
