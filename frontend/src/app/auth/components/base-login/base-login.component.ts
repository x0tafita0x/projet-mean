import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../models/auth.models';

@Component({
    selector: 'app-base-login',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow-lg border-0" style="max-width: 400px; width: 100%;">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <h3 class="fw-bold text-primary">{{ title }}</h3>
            <p class="text-muted">Veuillez vous connecter</p>
          </div>

          @if (error()) {
            <div class="alert alert-danger mb-3" role="alert">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="credentials.email" name="email" required [disabled]="loading()">
            </div>
            <div class="mb-3">
              <label class="form-label">Mot de passe</label>
              <input type="password" class="form-control" [(ngModel)]="credentials.motDePasse" name="motDePasse" required [disabled]="loading()">
            </div>
            <div class="d-grid mt-4">
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading()">
                @if (loading()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                }
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class BaseLoginComponent {
    @Input() title: string = 'Connexion';
    @Input() loading = signal(false);
    @Input() error = signal<string | null>(null);
    @Output() onLogin = new EventEmitter<LoginRequest>();

    credentials: LoginRequest = { email: '', motDePasse: '' };

    submit() {
        if (this.credentials.email && this.credentials.motDePasse) {
            this.onLogin.emit(this.credentials);
        }
    }
}
