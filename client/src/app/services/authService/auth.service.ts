import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { UserRegister } from '../../config/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  changeMenuState$ = new BehaviorSubject<'closed' | 'open'>('closed');

  constructor(private http: HttpClient, private router: Router) {}

  registerService(formData: UserRegister) {
    return this.http.post<any>(`${environment.authApiUrl}/register`, formData);
  }

  loginService(formData: any) {
    return this.http.post<any>(`${environment.authApiUrl}/login`, formData);
  }
  sendEmailService(formData: string) {
    return this.http.post<any>(`${environment.authApiUrl}/send-email`, {
      email: formData,
    });
  }

  resetPasswordService(formData: any) {
    return this.http.post<any>(
      `${environment.authApiUrl}/password-reset`,
      formData
    );
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('accessToken');
    return !!token;
  }

  logOutService() {
    sessionStorage.removeItem('accessToken');
    this.router.navigate(['auth']);
  }
  checkAuth(): Observable<any> {
    return this.http.get(`${environment.authApiUrl}/check-auth`);
  }
  updateUser(formData: any): Observable<any> {
    return this.http.put(`${environment.authApiUrl}/update-user`, formData);
  }
  fetchUser(): Observable<any> {
    return this.http.get<any>(`${environment.authApiUrl}/get-user`);
  }
  deleteUserService() {
    return this.http.delete(`${environment.authApiUrl}/delete-user`);
  }
}
