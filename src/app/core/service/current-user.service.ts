import { Injectable } from '@angular/core';
import { AxiosRequestConfig } from 'axios';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private currentUserKey: string = 'currentUser';
  private tokenKey: string = 'currentUserAccessToken';
  private token: string | null = null;

  constructor(private logger: NGXLogger) {
    this.token = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.currentUserKey);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  private currentUser: any;

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.tokenKey, token);
    this.logger.info('Token from backend: ' + token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey); // Remove user data when token is cleared
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  setCurrentUser(user: any): void {
    this.currentUser = user;
    localStorage.setItem(this.currentUserKey, JSON.stringify(user)); // Store user data in localStorage
    this.logger.info('From current user: ', this.currentUser);
  }

  getConfig(): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};
    if (this.token) {
      config.headers = {
        Authorization: `Bearer ${this.token}`,
      };
    }
    return config;
  }
}
