import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-base-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './base-login.component.html'
})
export class BaseLoginComponent implements OnInit {
  @Input() title: string = 'Connexion';
  @Input() loading = signal(false);
  @Input() error = signal<string | null>(null);
  @Input() defaultCredentials: LoginRequest = { email: '', motDePasse: '' };
  @Output() onLogin = new EventEmitter<LoginRequest>();

  credentials: LoginRequest = { email: '', motDePasse: '' };

  ngOnInit() {
    this.credentials = { ...this.defaultCredentials };
  }

  submit() {
    if (this.credentials.email && this.credentials.motDePasse) {
      this.onLogin.emit(this.credentials);
    }
  }
}
