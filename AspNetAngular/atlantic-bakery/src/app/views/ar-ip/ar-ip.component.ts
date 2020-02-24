import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ARIPMonitoring, ARIPDetails, IPDetails, DepositDetails, ARIPDepDifference, ARMRemarks } from '../../core/api.client';
import { Branches, CustomerGroup } from '../../core/api.client';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap';
import Swal from 'sweetalert2';

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

  depositDetails: DepositDetails[] = [];
  deposId = '';

  difference: ARIPDepDifference[] = [];

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

  // pagination
  page = 1;
  pageSize = 10;

  constructor(
    private apiService: Service,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.getBranchList();
    this.getBPGroup();
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
    this.apiService.getARIPDetails(arNo).subscribe(response => {
      this.arDetails = response;
      this.total = response.reduce((accumulator, currentvalue) => accumulator + currentvalue.lineTotal, 0);
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' });
    this.arNo = arNo;
  }

  ipModalDetails(content: any, ipNo: number) {
    this.apiService.getIPDetails(ipNo).subscribe(response => {
      this.ipDetails = response;
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

  aripdepModalDetails(content: any, docEntry: number) {
    this.apiService.getARIPDepDifference(docEntry).subscribe(response => {
      this.difference = response;
    });
    this.modalRef = this.modalService.show(content, { backdrop: 'static', class: 'modal-lg' });
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
      console.log(this.branch);
    }
  }

  onSubMitRemarks() {
    this.submitBtn = true;
    const arRemarks = new ARMRemarks();
    arRemarks.logDate = new Date();
    arRemarks.logName = 'test'; //this.authService.getCurrentUser().fullName;
    arRemarks.remarks = this.remarksMessage;
    arRemarks.arNo = this.arNo;
    this.apiService.insertARMRemarks(arRemarks).subscribe(response => {
      if (response.result == 'success') {
        this.getRemarks(this.arNo);
        this.remarksMessage = '';
        this.submitBtn = false;
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
      this.returnAR = this.returnAR.filter(f => f.status.includes(selectedStatus));
      Swal.close();
    }
  }

  onChangeBPGroup(selectedGroup: string) {
    this.groupname = selectedGroup;
    console.log(selectedGroup);
    if (selectedGroup == 'All') {
      this.getARIPMonitoring(this.branch);
    } else {
      this.showLoading();
      this.returnAR = this.containerAR;
      this.returnAR = this.returnAR.filter(c => c.groupname.includes(selectedGroup));
      Swal.close();
    }
  }

  openModalListRemarks(content: any, sqNo: number) {
    this.arNo = this.arNo;
    this.getRemarks(sqNo);
    this.modalRef = this.modalService.show(content, { backdrop: 'static' });
  }

  openModalRemarks(content: any) {
    console.log('Open Modal Remarks');
    this.modalRefRemarks = this.modalService.show(content, { backdrop: 'static' });
  }

  closeModal() {
    this.modalRef.hide();
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
