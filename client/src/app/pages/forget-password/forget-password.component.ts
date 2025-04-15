import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: false,
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  isSubmitting: boolean = false;
  forgetForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  constructor(private authService: AuthService, private router: Router) {}

  getControllName(controllerName: string) {
    return this.forgetForm.get(controllerName);
  }
  onSubmit() {
    this.authService
      .sendEmailService(this.forgetForm.value.email || '')
      .subscribe({
        next: (res) => {
          this.forgetForm.reset();
          this.router.navigate(['auth']);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  onCancel() {
    this.router.navigate(['auth']);
  }
}
