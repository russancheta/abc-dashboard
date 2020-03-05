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
import { ChangePasswordComponent } from './views/changepassword/changepassword.component';

import { AuthGuard } from './_guards/auth.guard';
import { ModuleGuard } from './_guards/module.guard';
import { AccountsGuard } from './_guards/account.guard';
import { PMGuard } from './_guards/pm.guard';
import { ITRMGuard } from './_guards/itrm.guard';
import { ARMGuard } from './_guards/arm.guard';
import { LoginGuard } from './_guards/login.guard';

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
    canActivate: [LoginGuard],
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
    canActivate: [AuthGuard],
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
        canActivate: [ITRMGuard],
        data: {
          title: 'ITR/IT Monitoring'
        }
      },
      {
        path: 'for-production',
        component: ForProductionComponent,
        canActivate: [PMGuard],
        data: {
          title: 'Production Monitoring'
        }
      },
      {
        path: 'ar-ip',
        component: ArIpComponent,
        canActivate: [ARMGuard],
        data: {
          title: 'AR/IP Monitoring'
        }
      },
      {
        path: 'account',
        component: AccountsComponent,
        canActivate: [AccountsGuard],
        data: {
          title: 'Account'
        }
      },
      {
        path: 'changepassword',
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Change Password'
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
