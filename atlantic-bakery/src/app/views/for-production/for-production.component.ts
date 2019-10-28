import { Component, OnInit } from '@angular/core';
import { ProductionForecast, ProductionForecastDetails, Branches } from '../../core/api.client';
import { Service } from '../../core/api.client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-for-production',
  templateUrl: './for-production.component.html',
  styleUrls: ['./for-production.component.scss']
})
export class ForProductionComponent implements OnInit {

  productionForecast: ProductionForecast[] = [];
  productionForecastDetails: ProductionForecastDetails[] = [];
  branches: Branches[] = [];
  sqNo = '';

  //pagination
  page = 1;
  pageSize = 50;

  constructor(
    private apiService: Service,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getBranches();
    // this.getProdForecast();
  }

  getProdForecast(branch: string) {
    this.apiService.getProductionForecast(branch).subscribe(response => {
      this.productionForecast = response;
    })
  }

  getProdForecastDetails(docnum: number) {
    this.apiService.getProductionForecastDetails(docnum).subscribe(response => {
      this.productionForecastDetails = response;
    })
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
      console.table(response);
    })
  }

  openModal(content: any, sqNo: number) {
    this.getProdForecastDetails(sqNo);
    this.modalService.open(content, {backdrop: 'static'});
    this.sqNo = sqNo.toString();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onChangeBranch(branch: string) {
    this.getProdForecast(branch);
  }
}
