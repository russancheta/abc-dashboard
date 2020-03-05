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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ReportService } from '../../shared/report.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-for-production',
  templateUrl: './for-production.component.html',
  styleUrls: ['./for-production.component.scss']
})
export class ForProductionComponent implements OnInit {

  invTransferReqDetails: ProdOrderDetails[] = [];

  productionForecast: ProductionForecast[] = [];

  containerPF: ProductionForecast[] = [];
  returnPF: ProductionForecast[] = [];

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
  remarksLength: number = 0;

  // Status filter
  statusFilter = [
    { value: 'All', label: 'All' },
    { value: 'Fully Served', label: 'Fully Served' },
    { value: 'Partially Served', label: 'Partially Served' },
    { value: 'Over', label: 'Over' },
    { value: 'Unserved', label: 'Unserved' }
  ];
  filterAll: string = 'All';

  // Report
  reportLocation = 'All';
  reportTypeSelection = [
    { value: 'type1', label: 'Production Monitoring Logs'},
    { value: 'type2', label: 'Production Monitoring Unpicked'}
  ];
  reportType = 'type1';
  branchReport = 'All';
  report2filterOptionSelected = 'All';

  // Date picker
  formReport: FormGroup;
  dtp1MaxDate: NgbDateStruct;
  dtp2MinDate: NgbDateStruct;

  constructor(
    private apiService: Service,
    private modalService: BsModalService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private calendar: NgbCalendar
  ) { }

  ngOnInit() {
    this.getBranches();
    this.formReport = this.formBuilder.group({
      dtp1: [null, [Validators.required]],
      dtp2: [null, [Validators.required]]
    });
    this.formReport.setValue({
      dtp1: this.calendar.getToday(),
      dtp2: this.calendar.getToday()
    });
  }

  getITRCompareSQ(itrNo: string) {
    this.apiService.getITCompareSQ(itrNo).subscribe(res => { this.itrs = res; });
  }

  getProdForecast(branch: string) {
    this.showLoading();
    this.branch = branch;
    this.apiService.getProductionForecast(branch).subscribe(response => {
      this.productionForecast = response;
      this.returnPF = response;
      this.containerPF = response;
      Swal.close();
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
    this.itrNo = itrNo;
    this.getProdForecastDetails(sqNo);
    this.getITRCompareSQ(itrNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-xl' });
    this.sqNo = sqNo;
  }

  giDetails(content: any, giNo: number) {
    this.getGoodsIssueDetails(giNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' });
    this.sqNo = giNo;
  }

  grDetails(content: any, grNo: number) {
    this.getGoodsReceiptDetails(grNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' });
    this.grNo = grNo.toString();
  }

  sqGrDifference(content: any, docEntry: number) {
    this.apiService.sqgrDifference(docEntry).subscribe(response => {
      this.sumGoodsReceiptDetails = response;
      this.sqQuantityTotal = response.reduce((r, d) => r + d.sqQuantity, 0);
      this.grQuantityTotal = response.reduce((r, d) => r + d.grQuantity, 0);
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
        this.closeModalRemarks();
      }
    }, error => {
      this.submitBtn = false;
      console.log('HTTP error', error);
    })
  }

  getRemarks(sqNo: number) {
    this.apiService.getPMRemarks(sqNo).subscribe(response => {
      this.remarks = response;
      this.remarksLength = response.length;
    }, error => {
      console.log('HTTP error', error);
    })
  }

  closeModal() {
    this.getProdForecast(this.branch);
    this.modalRef.hide();
  }

  closeModalRemarks() {
    this.getProdForecast(this.branch);
    this.modalRefRemarks.hide();
  }

  onChangeBranch(branch: string) {
    this.getProdForecast(branch);
    this.branch = branch;
  }

  onChangeStatus(status: string) {
    this.filterAll = status;
    if (status == 'All') {
      this.getProdForecast(this.branch);
    } else {
      this.showLoading();
      this.returnPF = this.containerPF;
      this.returnPF = this.returnPF.filter(o => o.status.includes(status));
      Swal.close();
    }
  }

  onSelectReportType(type: string) {
    this.reportType = type;
  }

  onChangeBranchReport(branch: string) {
    this.branchReport = branch;
  }

  onChangeReportFilterStatus(status: string) {
    this.report2filterOptionSelected = status;
  }

  onChangeDpt() {
    this.dtp1MaxDate = this.formReport.controls.dtp2.value;
    this.dtp2MinDate = this.formReport.controls.dtp1.value;
  }

  openModalListRemarks(content: any, sqNo: number) {
    this.sqNo = sqNo;
    this.getRemarks(sqNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static' });
  }

  openModalRemarks(content: any) {
    this.modalRefRemarks = this.modalService.show(content, { backdrop: 'static' });
  }

  openReportModal(content: any) {
    this.reportType = 'type1';
    this.modalRef = this.modalService.show(content, { backdrop: 'static' });
  }

  viewReport() {
    const eBranch = this.reportService.setEncryptedData(this.branchReport);
    if (this.reportType == 'type1') {
      const dtp1year = this.formReport.controls.dtp1.value.year;
      const dtp1month = this.formReport.controls.dtp1.value.month;
      const dtp1day = this.formReport.controls.dtp1.value.day;
      const dtp1 = dtp1year + '-' + dtp1month + '-' + dtp1day;

      const dtp2year = this.formReport.controls.dtp2.value.year;
      const dtp2month = this.formReport.controls.dtp2.value.month;
      const dtp2day = this.formReport.controls.dtp2.value.day;
      const dtp2 = dtp2year + '-' + dtp2month + '-' + dtp2day;

      const eFromDate = this.reportService.setEncryptedData(dtp1);
      const eToDate = this.reportService.setEncryptedData(dtp2);

      window.open(
        environment.REPORT_BASE_URL + '/Report/PMLogs?'
        + 'from=' + eFromDate + '&to=' + eToDate + '&branch=' + eBranch, '_blank'
      );
    } else if (this.reportType == 'type2') {
      const eStatus = this.reportService.setEncryptedData(this.report2filterOptionSelected);
      window.open(
        environment.REPORT_BASE_URL + '/Report/PMUnpicked?'
        + 'branch=' + eBranch + '&status=' + eStatus, '_blank'
      );
    }
  }

  // table color if short, over or equal
  tableColor(variance: number) {
    if (variance < 0) {
      return 'table-warning';
    } else if (variance > 0) {
      return 'table-success';
    } else {
      return '';
    }
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
