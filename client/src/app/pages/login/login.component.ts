import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  hide = signal(true);
  isSubmitting: boolean = false;
  userLoginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  constructor(
    private authService: AuthService,
    private router: Router,
    private toasterService: ToastrService
  ) {}

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  getControllName(controllerName: string) {
    return this.userLoginForm.get(controllerName);
  }
  onSubmit() {
    if (this.userLoginForm.invalid) {
      this.userLoginForm.markAllAsTouched();
      return;
    }
    const rawData = this.userLoginForm.value;
    const userData = {
      email: rawData.email?.toLowerCase() ?? '',
      password: rawData.password ?? '',
    };

    this.authService.loginService(userData).subscribe({
      next: (res) => {
        res.success
          ? this.toasterService.success(res.message)
          : this.toasterService.error(res.message);

        this.userLoginForm.reset();
        sessionStorage.setItem('accessToken', res.data.accessToken);
        this.authService.isLoggedIn$.next(true);
        this.router.navigate(['home']);
      },
      error: (err) => {
        console.log(err, 'error');
        const errorMessage = err?.error?.message || 'Something went wrong';
        this.toasterService.error(errorMessage);
      },
    });
  }
}
