import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;
    isSubmitting = false;

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['test@gmail.com', [Validators.required, Validators.email]],
            password: ['123456', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const { email, password } = this.loginForm.value;

        this.authService.login(email, password).subscribe({
            next: (user) => {
                this.isSubmitting = false;
                if (user) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful',
                        text: 'Welcome to CIVIL AVIATION PORTAL',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        this.router.navigate(['/app/dashboard']);
                    });
                } else {
                    Swal.fire('Login Failed', 'Invalid credentials. Please use test@gmail.com / 123456', 'error');
                }
            },
            error: () => {
                this.isSubmitting = false;
            }
        });
    }
}
