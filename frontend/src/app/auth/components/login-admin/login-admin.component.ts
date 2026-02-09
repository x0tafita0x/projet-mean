import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BaseLoginComponent } from '../base-login/base-login.component';
import { LoginRequest } from '../../models/auth.models';

@Component({
    selector: 'app-login-admin',
    standalone: true,
    imports: [BaseLoginComponent],
    template: `<app-base-login [title]="'Connexion Admin'" [loading]="loading" [error]="error" (onLogin)="handleLogin($event)"></app-base-login>`
})
export class LoginAdminComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    loading = signal(false);
    error = signal<string | null>(null);

    handleLogin(credentials: LoginRequest) {
        this.loading.set(true);
        this.error.set(null);
        this.authService.loginAdmin(credentials).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/home']);
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err.error?.error || 'Une erreur est survenue');
            }
        });
    }
}
