import { Component, OnInit } from '@angular/core';
import { ProductionForecast, ProductionForecastDetails, SQGRDifference } from '../../core/api.client';
import { IssueForProdDetails } from '../../core/api.client';
import { RepCompletionDetails } from '../../core/api.client';
import { ProdOrderDetails } from '../../core/api.client';
import { Branches } from '../../core/api.client';
import { Service } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import Swal from 'sweetalert2';
import { interval } from 'rxjs/internal/observable/interval';
import { startWith, flatMap } from 'rxjs/operators';

@Component({
  selector: 'app-for-production',
  templateUrl: './for-production.component.html',
  styleUrls: ['./for-production.component.scss']
})
export class ForProductionComponent implements OnInit {

  invTransferReqDetails: ProdOrderDetails[] = [];

  productionForecast: ProductionForecast[] = [];
  productionForecastDetails: ProductionForecastDetails[] = [];

  goodsIssueDetails: IssueForProdDetails[] = [];

  goodsReceiptDetails: RepCompletionDetails[] = [];

  sumGoodsReceiptDetails: SQGRDifference[] = [];

  branch = '';
  branches: Branches[] = [];

  pollingData: any;

  itrNo = '';
  sqNo = '';
  giNo = '';
  grNo = '';

  modalRef: BsModalRef;
  modalOption: ModalOptions = {};

  //pagination
  page = 1;
  pageSize = 10;

  constructor(
    private apiService: Service,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.getBranches();
    //this.getProdForecast(this.branches[0].name);
  }

  getProdForecast(branch: string) {
    this.showLoading();
    this.branch = branch;
    this.apiService.getProductionForecast(branch).subscribe(response => {
      this.productionForecast = response;
      Swal.close();
      console.table(response);
    })
  }

  getProdForecastDetails(docnum: number) {
    this.apiService.getProductionForecastDetails(docnum).subscribe(response => {
      this.productionForecastDetails = response;
    })
  }

  getGoodsIssueDetails(docNum: number) {
    this.apiService.getIssueProdDetails(docNum).subscribe(response => {
      this.goodsIssueDetails = response;
      console.table(response);
    })
  }

  getGoodsReceiptDetails(docNum: number) {
    this.apiService.getRepCompletionDetails(docNum).subscribe(response => {
      this.goodsReceiptDetails = response;
    })
  }

  getInvTransferReqDetails(docNum: number) {
    this.apiService.getProdDetails(docNum).subscribe(response => {
      this.invTransferReqDetails = response;
    })
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      console.log(response);
    })
  }

  arraySplit(docNum: string) {
    const splitDocNum = docNum.split(', ');
    return splitDocNum;
  }

  itrDocNumSplit(docNum: string) {
    const splitDocNum = docNum.split(', ');
    return splitDocNum;
  }

  itrDetails(content: any, itrNo: number) {
    this.getInvTransferReqDetails(itrNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' })
    this.itrNo = itrNo.toString();
  }

  soDetails(content: any, sqNo: number) {
    this.getProdForecastDetails(sqNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' });
    this.sqNo = sqNo.toString();
  }

  giDetails(content: any, giNo: number) {
    this.getGoodsIssueDetails(giNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' });
    this.sqNo = giNo.toString();
  }

  grDetails(content: any, grNo: number) {
    this.getGoodsReceiptDetails(grNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' });
    this.grNo = grNo.toString();
  }

  sqGrDifference(content: any, docEntry: number) {
    this.apiService.sqgrDifference(docEntry).subscribe(response => {
      this.sumGoodsReceiptDetails = response;
      console.table(response);
    })
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' })
  }

  closeModal() {
    this.modalRef.hide();
  }

  onChangeBranch(branch: string) {
    this.getProdForecast(branch);
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
