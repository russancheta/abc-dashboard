import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { PopoverModule } from 'ngx-bootstrap/popover';

// Import Dashboard components
import { ABCDashboardComponent } from './views/abc-dashboard/abc-dashboard.component';
import { ProductionOrderComponent } from './views/production-order/production-order.component';
import { ForProductionComponent } from './views/for-production/for-production.component';
import { GoodsIssueComponent } from './views/goods-issue/goods-issue.component';
import { GoodsReceiptComponent } from './views/goods-receipt/goods-receipt.component';
import { JoborderMonitoringComponent } from './views/joborder-monitoring/joborder-monitoring.component';

// Import API Service
import { Service } from './core/api.client'

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    HttpClientModule,
    NgbModule,
    ModalModule.forRoot(),
    PopoverModule.forRoot()
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    RegisterComponent,
    ABCDashboardComponent,
    ProductionOrderComponent,
    ForProductionComponent,
    GoodsIssueComponent,
    GoodsReceiptComponent,
    JoborderMonitoringComponent
  ],
  providers: [Service, HttpClientModule],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
