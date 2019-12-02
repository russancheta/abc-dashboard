import { Component, OnInit } from '@angular/core';
import { ProductionForecast, ProductionForecastDetails, SQGRDifference, ITRNos, PMRemarks } from '../../core/api.client';
import { IssueForProdDetails } from '../../core/api.client';
import { RepCompletionDetails } from '../../core/api.client';
import { ProdOrderDetails } from '../../core/api.client';
import { Branches } from '../../core/api.client';
import { Service } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import { AuthService } from '../../shared/auth.service';
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
  itrs: ProductionForecastDetails[] = [];

  goodsIssueDetails: IssueForProdDetails[] = [];

  goodsReceiptDetails: RepCompletionDetails[] = [];

  sumGoodsReceiptDetails: SQGRDifference[] = [];

  itrNos: ITRNos[] = [];

  branch = '';
  branches: Branches[] = [];

  pollingData: any;

  itrNo = '';
  sqNo: number = 0;
  giNo = '';
  grNo = '';

  modalRef: BsModalRef;
  modalRefRemarks: BsModalRef;
  modalOption: ModalOptions = {};

  // pagination
  page = 1;
  pageSize = 10;

  // Footer Fields Modal
  sqQuantityTotal: number = 0;
  grQuantityTotal: number = 0;

  // Remarks Declaration

  // SQ DETAILS

  // checked sq for updating
  selectedSQ = new Array();
  checkSelected = 0;

  // Form validation
  submitBtn = false;

  // Production Monitoring
  remarks : PMRemarks[] = [];
  remarksMessage: string;

  constructor(
    private apiService: Service,
    private modalService: BsModalService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.getBranches();
    // this.getProdForecast(this.branches[0].name);
  }

  getITRCompareSQ(itrNo: string) {
    this.apiService.getITCompareSQ(itrNo).subscribe(res => { this.itrs = res; });
  }

  getProdForecast(branch: string) {
    this.showLoading();
    this.branch = branch;
    this.apiService.getProductionForecast(branch).subscribe(response => {
      this.productionForecast = response;
      Swal.close();
      console.table(response);
    });
  }

  getProdForecastDetails(docnum: number) {
    this.apiService.getProductionForecastDetails(docnum).subscribe(response => {
      this.productionForecastDetails = response;
    });
  }

  getGoodsIssueDetails(docNum: number) {
    this.apiService.getIssueProdDetails(docNum).subscribe(response => {
      this.goodsIssueDetails = response;
      console.table(response);
    });
  }

  getGoodsReceiptDetails(docNum: number) {
    this.apiService.getRepCompletionDetails(docNum).subscribe(response => {
      this.goodsReceiptDetails = response;
    });
  }

  getInvTransferReqDetails(docNum: number) {
    this.apiService.getProdDetails(docNum).subscribe(response => {
      this.invTransferReqDetails = response;
    });
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      this.getProdForecast(this.branches[0].name);
    });
  }

  getITRNos(docNum: number) {
    this.apiService.getITRNos(docNum).subscribe(response => {
      this.itrNos = response;
      console.log(response);
    });
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

  sqDetails(content: any, sqNo: number, itrNo: string) {
    console.log(itrNo);
    this.itrNo = itrNo;
    this.getProdForecastDetails(sqNo);
    this.getITRCompareSQ(itrNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' });
    this.sqNo = sqNo;
  }

  giDetails(content: any, giNo: number) {
    this.getGoodsIssueDetails(giNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' });
    this.sqNo = giNo;
  }

  grDetails(content: any, grNo: number) {
    this.getGoodsReceiptDetails(grNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' });
    this.grNo = grNo.toString();
  }

  sqGrDifference(content: any, docEntry: number) {
    this.apiService.sqgrDifference(docEntry).subscribe(response => {
      this.sumGoodsReceiptDetails = response;
      this.sqQuantityTotal = response.reduce((r, d) => r + d.sqQuantity, 0);
      this.grQuantityTotal = response.reduce((r, d) => r + d.grQuantity, 0);
      console.table(response);
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' })
  }

  checkedSQ(sqNo: number) {
    //this.pollingData.unsubscribe();
    if (this.selectedSQ.includes(sqNo)) {
      const i = this.selectedSQ.indexOf(sqNo);
      this.selectedSQ.splice(i, 1);
      this.checkSelected = this.selectedSQ.length;
    } else {
      this.selectedSQ.push(sqNo);
      this.checkSelected = this.selectedSQ.length;
    }
    if (this.checkSelected == 0) {
      this.getProdForecast(this.branch);
    }
  }

  closeSQ(sqNos: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, close it!',
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.apiService.updateSQ(sqNos).subscribe(response => {
          if (response.result == 'Success') {
            Swal.fire(
              'Closed',
              '',
              'success'
            );
            this.selectedSQ = new Array();
            this.getProdForecast(this.branch);
            console.log(this.selectedSQ);
            console.log(response.result);
            console.log(response.message);
          }
        });
      }
    });
  }

  onSubmitRemarks() {
    this.submitBtn = true;
    const pmRemarks = new PMRemarks();
    pmRemarks.logDate = new Date();
    pmRemarks.logName = this.authService.getCurrentUser().fullName;
    pmRemarks.remarks = this.remarksMessage;
    pmRemarks.sqNo = this.sqNo;
    this.apiService.insertPMRemarks(pmRemarks).subscribe(response => {
      if (response.result == 'success') {
        this.getRemarks(this.sqNo);
        this.remarksMessage = '';
        this.submitBtn = false;
      }
    }, error => {
      this.submitBtn = false;
      console.log('HTTP error', error);
    })
  }

  getRemarks(sqNo: number) {
    this.apiService.getPMRemarks(sqNo).subscribe(response => {
      this.remarks = response;
    }, error => {
      console.log('HTTP error', error);
    })
  }

  updateRemarks(remarks: string, sqNo: number){
    
  }

  closeModal() {
    this.modalRef.hide();
  }

  closeModalRemarks() {
    this.modalRefRemarks.hide();
  }

  onChangeBranch(branch: string) {
    this.getProdForecast(branch);
  }

  openModalListRemarks(content: any, sqNo: number) {
    this.sqNo = sqNo;
    this.modalRef = this.modalService.show(content, { backdrop: 'static' });
  }

  openModalRemarks(content: any) {
    console.log('Open Modal Remarks');
    this.modalRefRemarks = this.modalService.show(content, { backdrop: 'static' });
  }

  showLoading() {
    Swal.fire({
      title: 'Loading',
      text: 'Please wait',
      showConfirmButton: false,
      allowOutsideClick: false
    });
  }
}
