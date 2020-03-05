import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ARIPMonitoring, ARIPDetails, IPDetails, DepositDetails, ARIPDepDifference, CSDepDifference, ARMRemarks } from '../../core/api.client';
import { AuthService } from '../../shared/auth.service';
import { Branches, CustomerGroup } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ReportService } from '../../shared/report.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ar-ip',
  templateUrl: './ar-ip.component.html',
  styleUrls: ['./ar-ip.component.scss']
})
export class ArIpComponent implements OnInit {

  aripMonitoring: ARIPMonitoring[] = [];

  containerAR: ARIPMonitoring[] = [];
  returnAR: ARIPMonitoring[] = [];

  arDetails: ARIPDetails[] = [];
  arNo = 0;
  total = 0;

  ipDetails: IPDetails[] = [];
  ipNo = 0;
  cashCheckTotal: number = 0;

  depositDetails: DepositDetails[] = [];
  deposId = '';

  difference: ARIPDepDifference[] = [];

  csdepDifference: CSDepDifference[] = [];

  branch = '';
  branchList: Branches[] = [];

  customerGroup: CustomerGroup[] = [];
  groupname = '';

  modalRef: BsModalRef;
  modalRefRemarks: BsModalRef;
  modalOption: ModalOptions = {};

  // Filters
  statusFilter = [
    { value: 'All', name: 'All' },
    { value: 'Fully Paid', name: 'Fully Paid' },
    { value: 'Over', name: 'Over' },
    { value: 'Short', name: 'Short' },
    { value: 'Unpaid', name: 'Unpaid' }
  ];
  status = '';

  // Selected ar for updating
  selectedAR = new Array();
  selected = 0;

  // AR Remarks
  remarks: ARMRemarks[] = [];
  remarksMessage: string;
  remarksLength: number = 0;

  // Form validation
  submitBtn = false;

  // Report
  reportLocation = 'All';
  reportTypeSelection = [
    { value: 'type1', label: 'AR Monitoring Logs'},
    { value: 'type2', label: 'AR Monitoring Unpicked'}
  ];
  reportType = 'type1';
  branchReport = 'All';
  report2filterOptionSelected = 'All';

  // Date picker
  formReport: FormGroup;
  dtp1MaxDate: NgbDateStruct;
  dtp2MinDate: NgbDateStruct;

  // pagination
  page = 1;
  pageSize = 10;

  constructor(
    private apiService: Service,
    private modalService: BsModalService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private calendar: NgbCalendar
  ) { }

  ngOnInit() {
    this.getBranchList();
    this.getBPGroup();
    this.formReport = this.formBuilder.group({
      dtp1: [null, [Validators.required]],
      dtp2: [null, [Validators.required]]
    });
    this.formReport.setValue({
      dtp1: this.calendar.getToday(),
      dtp2: this.calendar.getToday()
    });
  }

  getARIPMonitoring(branch: string) {
    this.showLoading();
    this.branch = branch;
    this.apiService.getARIP(branch).subscribe(response => {
      this.aripMonitoring = response;
      this.containerAR = response;
      this.returnAR = response;
      Swal.close();
    })
  }

  arModalDetails(content: any, arNo: number) {
    this.apiService.getARDetails(arNo).subscribe(response => {
      this.arDetails = response;
      this.total = response.reduce((accumulator, currentvalue) => accumulator + currentvalue.lineTotal, 0);
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' });
    this.arNo = arNo;
  }

  ipModalDetails(content: any, ipNo: number) {
    this.apiService.getIPDetails(ipNo).subscribe(response => {
      this.ipDetails = response;
      this.cashCheckTotal = response.reduce((accumulator, currentValue) => accumulator + currentValue.cashSum + currentValue.checkSum, 0);
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' });
    this.ipNo = ipNo;
  }

  depositModalDetails(content: any, deposID: number) {
    this.apiService.getDepositDetails(deposID).subscribe(response => {
      this.depositDetails = response;
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' });
    this.deposId = deposID.toString();
  }

  aripModalDetails(content: any, docEntry: number) {
    this.apiService.getARIPDepDifference(docEntry).subscribe(response => {
      this.difference = response;
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static' });
  }

  csdepModalDetails(content: any, docNum: number) {
    this.apiService.getCSDepDifference(docNum).subscribe(response => {
      this.csdepDifference = response;
    })
    this.modalRef = this.modalService.show(content, { backdrop: 'static' });
  }

  checkedAR(arNo: number) {
    if (this.selectedAR.includes(arNo)) {
      const i = this.selectedAR.indexOf(arNo);
      this.selectedAR.splice(i, 1);
      this.selected = this.selectedAR.length;
    } else {
      this.selectedAR.push(arNo);
      this.selected = this.selectedAR.length;
    } if (this.selected == 0) {
      this.getARIPMonitoring(this.branch);
    }
  }

  closeAR(arNos: any) {
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
        this.apiService.updateAR(arNos).subscribe(response => {
          if (response.result == 'Success') {
            Swal.fire(
              'Closed',
              '',
              'success'
            );
            this.selectedAR = new Array();
            this.getARIPMonitoring(this.branch);
          }
        });
      }
    });
  }

  onSubmitRemarks() {
    this.submitBtn = true;
    const arRemarks = new ARMRemarks();
    arRemarks.logDate = new Date();
    arRemarks.logName = this.authService.getCurrentUser().fullName;
    arRemarks.remarks = this.remarksMessage;
    arRemarks.arNo = this.arNo;
    this.apiService.insertARMRemarks(arRemarks).subscribe(response => {
      if (response.result == 'success') {
        this.getRemarks(this.arNo);
        this.remarksMessage = '';
        this.submitBtn = false;
        this.closeModalRemarks();
      }
    }, error => {
      this.submitBtn = false;
      console.log('HTTP error', error);
    })
  }

  getRemarks(arNo: number) {
    this.apiService.getARMRemarks(this.arNo).subscribe(response => {
      this.remarks = response;
      this.remarksLength = response.length;
    }, error => {
      console.log('HTTP error', error);
    })
  }

  getBranchList() {
    this.apiService.getBranchList().subscribe(response => {
      this.branchList = response;
      this.getARIPMonitoring(this.branchList[0].name)
    })
  }

  getBPGroup() {
    this.apiService.getCustomerGroup().subscribe(response => {
      this.customerGroup = response;
    })
  }

  onChangeBranch(branch: string) {
    this.getARIPMonitoring(branch);
    this.branch = branch;
  }

  onChangeStatus(selectedStatus: string) {
    this.status = selectedStatus;
    if (selectedStatus == 'All') {
      this.getARIPMonitoring(this.branch);
    } else {
      this.showLoading();
      this.returnAR = this.containerAR;
      this.returnAR = this.returnAR.filter(f => f.aripStatus.includes(selectedStatus));
      Swal.close();
    }
  }

  onChangeBPGroup(selectedGroup: string) {
    this.groupname = selectedGroup;
    if (selectedGroup == 'All') {
      this.getARIPMonitoring(this.branch);
    } else {
      this.showLoading();
      this.returnAR = this.containerAR;
      this.returnAR = this.returnAR.filter(c => c.groupname.includes(selectedGroup));
      console.table(this.returnAR);
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

  openModalListRemarks(content: any, arNo: number) {
    this.arNo = arNo;
    this.getRemarks(arNo);
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
        environment.REPORT_BASE_URL + '/Report/ARMLogs?'
        + 'from=' + eFromDate + '&to=' + eToDate + '&branch=' + eBranch, '_blank'
      );
    } else if (this.reportType == 'type2') {
      const eStatus = this.reportService.setEncryptedData(this.report2filterOptionSelected);
      window.open(
        environment.REPORT_BASE_URL + '/Report/ARMUnpicked?'
        + 'branch=' + eBranch + '&status=' + eStatus, '_blank'
      );
    }
  }

  closeModal() {
    this.getARIPMonitoring(this.branch);
    this.modalRef.hide();
  }

  closeModalRemarks() {
    this.getARIPMonitoring(this.branch);
    this.modalRefRemarks.hide();
  }

  arraySplit(docNum: string) {
    const splitDocNum = docNum.split(', ');
    return splitDocNum;
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
