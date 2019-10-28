import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { JobOrder, JobOrderDetails, Branches } from '../../core/api.client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-joborder-monitoring',
  templateUrl: './joborder-monitoring.component.html',
  styleUrls: ['./joborder-monitoring.component.scss']
})
export class JoborderMonitoringComponent implements OnInit {

  jobOrder: JobOrder[] = [];
  jobOrderDetails: JobOrderDetails[] = [];
  branches: Branches[] = [];
  poNo = '';

  //pagination
  page = 1;
  pageSize = 50;

  constructor(
    private apiService: Service,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    //this.getJobOrder();
  }

  getJobOrder(branch: string) {
    this.apiService.getJobOrder(branch).subscribe(response => {
      this.jobOrder = response;
    })
  }

  getJobOrderDetails(docnum: number) {
    this.apiService.getJobOrderDetails(docnum).subscribe(response => {
      this.jobOrderDetails= response;
    })
  }

  openModal(content: any, poNo: number) {
    this.getJobOrderDetails(poNo);
    this.modalService.open(content, {backdrop: 'static'});
    this.poNo = poNo.toString();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      console.table(response);
    })
  }

  onChangeBranch(branch: string) {
    this.getIssueForProd(branch);
  }
}
