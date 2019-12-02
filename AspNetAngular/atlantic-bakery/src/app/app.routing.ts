import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';
import { ABCDashboardComponent } from './views/abc-dashboard/abc-dashboard.component';
import { ProductionOrderComponent } from './views/production-order/production-order.component';
import { ForProductionComponent } from './views/for-production/for-production.component';
import { ArIpComponent } from './views/ar-ip/ar-ip.component';
import { AccountsComponent } from './views/account/account.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'abc-dashboard',
    pathMatch: 'full',
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'abc-dashboard',
        component: ABCDashboardComponent,
        data: {
          title: 'Atlantic Bakery Company Dashboard Monitoring'
        }
      },
      {
        path: 'production-order',
        component: ProductionOrderComponent,
        data: {
          title: 'ITR/IT Monitoring'
        }
      },
      {
        path: 'for-production',
        component: ForProductionComponent,
        data: {
          title: 'Production Monitoring'
        }
      },
      {
        path: 'ar-ip',
        component: ArIpComponent,
        data: {
          title: 'AR/IP Monitoring'
        }
      },
      {
        path: 'account',
        component: AccountsComponent,
        data: {
          title: 'Account'
        }
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
      }
    ]
  },
  { path: '**', component: P404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
