import { Injectable } from '@angular/core';
import { Service, CredentialsViewModel } from '../core/api.client';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private apiService: Service
  ) { }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  getUserType(): string {
    return this.getCurrentUser().role;
  }

  isLoggedIn(): boolean {
    const data = this.getCurrentUser();
    return data && data.auth_token;
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
  }
}