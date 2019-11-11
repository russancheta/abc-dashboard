import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ReportCompletion, RepCompletionDetails, Branches } from '../../core/api.client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-goods-receipt',
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.scss']
})
export class GoodsReceiptComponent implements OnInit {

  reportCompletion: ReportCompletion[] = [];
  repCompletionDetails: RepCompletionDetails[] = [];
  branches: Branches[] = [];
  grNo = '';

  // pagination
  page = 1;
  pageSize = 50;

  constructor(
    private apiService: Service,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getBranches();
    //this.getReportCompletion();
  }

  getReportCompletion(branch: string) {
    this.apiService.getReportCompletion(branch).subscribe(response => {
      this.reportCompletion = response;
    })
  }

  getRepDetails(docnum: number) {
    this.apiService.getRepCompletionDetails(docnum).subscribe(response => {
      this.repCompletionDetails = response;
    })
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      console.table(response);
    })
  }

  openModal(content: any, grNo: number) {
    this.getRepDetails(grNo);
    this.modalService.open(content, {backdrop: 'static'});
    this.grNo = grNo.toString();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onChangeBranch(branch: string) {
    this.getReportCompletion(branch);
  }
}
