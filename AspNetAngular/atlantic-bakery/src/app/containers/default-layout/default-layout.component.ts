import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../shared/auth.service';
import { Router } from '@angular/router';
import { Service } from '../../core/api.client';
import { interval } from 'rxjs/internal/observable/interval';
import { startWith, flatMap } from 'rxjs/operators';
import { navItems } from '../../_nav';
import { navItemsAdmin } from '../../_nav.admin';


@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnDestroy {
  public navItems = navItems;
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement = document.body;

  // Account
  fullName = '';
  accType = '';

  // Modules
  modules = [];

  constructor(
    //@Inject(DOCUMENT) _document?: any,
    public authService: AuthService,
    private router: Router,
    private apiService: Service
  ) {
    const user = this.authService.getCurrentUser().user;
    console.log(user);

    if (this.authService.getCurrentUser().role == 'Super Admin') {
      this.navItems = navItemsAdmin;
    } else {
      this.modules.push({
        title: true,
        name: 'Monitoring'
      });
      if (user.pm == true) {
        
        if (user.pm == true) {
          this.modules.push({
            name: 'Prod. Monitoring',
            url: '/for-production',
            icon: 'fa fa-paste'
          });
        }
      }
      if (user.itrm == true) {
        if (user.itrm == true) {
          this.modules.push({
            name: 'ITR/IT Monitoring',
            url: '/production-order',
            icon: 'fa fa-copy'
          });
        }
      }
      if (user.arm == true) {
        if (user.arm == true) {
          this.modules.push({
            name: 'AR/IP Monitoring',
            url: '/ar-ip',
            icon: 'fa fa-check-square-o'
          });
        }
      }
      this.navItems = this.modules;
    }

    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = document.body.classList.contains('sidebar-minimized');
    });
    this.element = document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  ngOnInit() {
    this.fullName = this.authService.getCurrentUser().fullName;
    this.accType = this.authService.getCurrentUser().role;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
