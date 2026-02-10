import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register-acheteur',
    standalone: true,
    imports: [FormsModule, CommonModule, RouterLink],
    templateUrl: './register-acheteur.component.html'
})
export class RegisterAcheteurComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    user = {
        nom: '',
        email: '',
        motDePasse: '',
        role: 'acheteur'
    };

    loading = signal(false);
    success = signal(false);
    error = signal<string | null>(null);

    onSubmit() {
        if (this.user.nom && this.user.email && this.user.motDePasse) {
            this.loading.set(true);
            this.error.set(null);
            this.authService.register(this.user).subscribe({
                next: () => {
                    this.loading.set(false);
                    this.success.set(true);
                    setTimeout(() => {
                        this.router.navigate(['/auth/login/acheteur']);
                    }, 2000);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.error.set(err.error?.error || 'Une erreur est survenue lors de l\'inscription');
                }
            });
        }
    }
}
