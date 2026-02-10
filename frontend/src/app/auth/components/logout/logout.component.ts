import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-logout',
    standalone: true,
    template: `<p>Déconnexion en cours...</p>`
})
export class LogoutComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    ngOnInit(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login/acheteur']);
    }
}
