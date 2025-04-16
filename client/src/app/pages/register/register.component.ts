import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserRegister } from '../../config/auth';
import { AuthService } from '../../services/authService/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  isSubmitting: boolean = false;
  hide = signal(true);

  userRegistrationForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    userName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_]{3,16}$'),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      ),
    ]),
  });

  constructor(
    private authService: AuthService,
    private toasterService: ToastrService
  ) {}
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit() {
    if (this.userRegistrationForm.invalid) {
      this.userRegistrationForm.markAllAsTouched();
      return;
    }

    const rawData = this.userRegistrationForm.value;

    const userData: UserRegister = {
      fullName: rawData.fullName ?? '',
      userName: rawData.userName ?? '',
      email: rawData.email?.toLowerCase() ?? '',
      password: rawData.password ?? '',
    };

    this.isSubmitting = true;
    console.log(userData, 'Formatted User Data');

    this.authService.registerService(userData).subscribe({
      next: (res) => {
        this.userRegistrationForm.reset();
        this.toasterService.success(res.message);
        this.isSubmitting = false;
        console.log(res);
      },
      error: (err) => {
        console.error('Register Error:', err);
        const errorMessage = err?.error?.message || 'Something went wrong';

        if (errorMessage === 'Username is already taken') {
          this.userRegistrationForm
            .get('userName')
            ?.setErrors({ duplicate: true });
        }
        if (errorMessage === 'Email is already registered') {
          this.userRegistrationForm
            .get('email')
            ?.setErrors({ duplicate: true });
        }

        this.toasterService.error(errorMessage);
        this.isSubmitting = false;
      },
    });
  }
}
