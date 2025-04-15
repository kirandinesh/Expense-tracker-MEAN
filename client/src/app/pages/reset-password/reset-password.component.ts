import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/authService/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  isSubmitting: boolean = false;
  token!: string;
  resetForm = new FormGroup(
    {
      password: new FormControl('Kir@n@123', [
        Validators.required,
        Validators.pattern(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
        ),
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    {
      validators: this.passwordMatchValidator(),
    }
  );

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((val) => {
      this.token = val['token'];
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value.password == control.value.confirmPassword
        ? null
        : { passwordNoMatch: true };
    };
  }

  getControllName(controllerName: string) {
    return this.resetForm.get(controllerName);
  }
  onResetPassword() {
    let formData = {
      token: this.token,
      password: this.resetForm.value.password,
    };

    this.authService.resetPasswordService(formData).subscribe({
      next: (res) => {
        this.resetForm.reset();
        this.router.navigate(['auth']);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
