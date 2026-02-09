import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-base-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './base-login.component.html'
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
