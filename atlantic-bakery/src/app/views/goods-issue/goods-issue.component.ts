import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { IssueForProduction, IssueForProdDetails, Branches } from '../../core/api.client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-goods-issue',
  templateUrl: './goods-issue.component.html',
  styleUrls: ['./goods-issue.component.scss']
})
export class GoodsIssueComponent implements OnInit {

  issueForProd: IssueForProduction[] = [];
  issueForProdDetails: IssueForProdDetails[] = [];
  branches: Branches[] = [];
  giNo = '';

  // pagination
  page = 1;
  pageSize = 50;

  constructor(
    private apiService: Service,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getBranches();
    // this.getIssueForProd();
  }

  getIssueForProd(branch: string) {
    this.apiService.getIssueForProd(branch).subscribe(response => {
      this.issueForProd = response;
      console.table(response);
    })
  }

  getIssueForProdDetails(docnum: number) {
    this.apiService.getIssueProdDetails(docnum).subscribe(response => {
      this.issueForProdDetails = response;
    })
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      console.table(response);
    })
  }

  openModal(content: any, giNo: number) {
    this.getIssueForProdDetails(giNo);
    this.modalService.open(content, { backdrop: 'static' });
    this.giNo = giNo.toString();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onChangeBranch(branch: string) {
    this.getIssueForProd(branch);
  }
}
