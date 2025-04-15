import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserRegister } from '../../config/auth';
import { AuthService } from '../../services/authService/auth.service';

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

  constructor(private authService: AuthService) {}
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  onSubmit() {
    if (this.userRegistrationForm.invalid) {
      this.userRegistrationForm.markAllAsTouched();
      return;
    }
    const userData: UserRegister = this.userRegistrationForm
      .value as UserRegister;
    this.isSubmitting = true;
    this.authService.registerService(userData).subscribe({
      next: (res) => {
        this.userRegistrationForm.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.log(err);
        this.isSubmitting = false;
      },
    });
  }
}
