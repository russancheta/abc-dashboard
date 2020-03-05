import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Injectable({ providedIn: 'root' })

export class ARMGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.getCurrentUser().user.arm == true) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate([''], { queryParams: { returnUrl: state.url } });
        return false;
    }
    
}