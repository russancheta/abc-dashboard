import { Component, OnInit } from '@angular/core';
import { Service } from '../../core/api.client';
import { ProductionOrder, ProdOrderDetails } from '../../core/api.client';
import { Branches } from '../../core/api.client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { interval } from 'rxjs/internal/observable/interval';
import { startWith, flatMap } from 'rxjs/operators';
import { error } from '@angular/compiler/src/util';

@Component({
  selector: 'app-production-order',
  templateUrl: './production-order.component.html',
  styleUrls: ['./production-order.component.scss']
})
export class ProductionOrderComponent implements OnInit {

  productionOrder: ProductionOrder[] = [];
  productionOrderDetails: ProdOrderDetails[] = [];
  branches: Branches[] = [];
  branch = '';
  itrNo = '';

  //paging
  page = 1;
  pageSize = 50;

  pollingData: any;

  constructor(
    private apiService: Service,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getBranches();
  }

  getProductionOrder(branch: string) {
    this.apiService.getProductionOrder(branch).subscribe(response => {
      this.productionOrder = response;
      console.table(response);
    })
  }

  /*
  getProductionOrder(branch: string) {
    this.showLoadingFetchData
    this.branch = branch;
    this.pollingData = interval(6000)
      .pipe(
        startWith(0),
        flatMap(() => this.apiService.getProductionOrder(branch))
      ).subscribe(
        response => {
          this.productionOrder = response;
          Swal.close();
        },
        error => {
          Swal.close();
          console.log('HTTP error', error);
        }
      );
  } */

  getProdOrderDetails(docnum: number) {
    this.apiService.getProdDetails(docnum).subscribe(response => {
      this.productionOrderDetails = response;
      console.table(response);
    })
  }

  getBranches() {
    this.apiService.getBranchList().subscribe(response => {
      this.branches = response;
    })
  }

  openModal(content: any, itrNo: number) {
    this.getProdOrderDetails(itrNo);
    this.modalService.open(content, { backdrop: 'static' });
    this.itrNo = itrNo.toString();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onChangeBranch(branch: string) {
    this.getProductionOrder(branch);
  }

  /*
  showLoadingFetchData() {
    Swal({
      title: 'Fetching Data',
      text: 'Please wait',
      imageUrl: 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==',
      showConfirmButton: false,
      allowOutsideClick: false
    });
  } */
}
